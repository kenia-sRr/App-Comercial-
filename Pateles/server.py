"""Servidor local AURA con cuentas, pedidos y checkout seguro opcional."""

import hashlib
import hmac
import http.server
import json
import os
import re
import secrets
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import webbrowser
from datetime import datetime, timezone

PORT = int(os.environ.get("AURA_PORT", "8000"))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(DIRECTORY, "aura.sqlite3")
SESSION_SECONDS = 7 * 24 * 60 * 60
PASSWORD_ITERATIONS = 310_000

# Precios autoritativos del servidor: nunca se aceptan importes del navegador.
PRODUCT_PRICES = {
    "pastel-01": (680, "Velvet Cacao & Flor de Sal"),
    "pastel-02": (640, "Vainilla Bourbon & Frambuesa Silvestre"),
    "pastel-03": (590, "Nube de Limón Meyer & Amapola"),
    "pastel-04": (1250, "Pistacho de Bronte & Rosa"),
    "pastel-05": (580, "Zanahoria Rústica & Nuez Pecana"),
    "pastel-06": (490, "Tarta Tatin Contemporánea"),
    "pastel-07": (390, "Caja de Macarons Minimalistas (12 pzs)"),
    "pastel-08": (620, "Tarta Pavlova Frutos Rojos (Gluten Free)"),
}


def connect_db():
    db = sqlite3.connect(DATABASE, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    return db


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def hash_password(password, salt=None):
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password, encoded):
    try:
        scheme, iterations, salt_hex, expected = encoded.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iterations)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def initialize_database():
    with connect_db() as db:
        db.executescript("""
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('customer', 'admin')), created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS addresses (
                id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                label TEXT NOT NULL, street TEXT NOT NULL, neighborhood TEXT NOT NULL, city TEXT NOT NULL,
                postal_code TEXT NOT NULL, instructions TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
                items_json TEXT NOT NULL, total INTEGER NOT NULL, address_json TEXT NOT NULL,
                delivery_date TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'awaiting_payment', stripe_session_id TEXT, created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
            CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);
        """)
        db.execute("DELETE FROM sessions WHERE expires_at < ?", (int(time.time()),))

    # No hay credenciales admin predeterminadas: se crean solo con variables de entorno propias.
    email = os.environ.get("AURA_ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("AURA_ADMIN_PASSWORD", "")
    if email and password:
        if len(password) < 12:
            raise RuntimeError("AURA_ADMIN_PASSWORD debe tener al menos 12 caracteres.")
        with connect_db() as db:
            db.execute(
                "INSERT INTO users(email,name,password_hash,role,created_at) VALUES(?,?,?,?,?) "
                "ON CONFLICT(email) DO UPDATE SET name=excluded.name,password_hash=excluded.password_hash,role='admin'",
                (email, "Administración AURA", hash_password(password), "admin", utc_now()),
            )


def public_user(row):
    return {"id": row["id"], "email": row["email"], "name": row["name"], "phone": row["phone"], "role": row["role"]}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def log_message(self, format, *args):
        try:
            sys.stdout.write(f"[AURA] {self.address_string()} - {format % args}\n")
        except Exception:
            pass

    def _json(self, status, payload, extra_headers=None):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for name, value in extra_headers:
                self.send_header(name, value)
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 64_000:
                raise ValueError("La solicitud es demasiado grande.")
            return json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError):
            raise ValueError("El contenido enviado no es válido.")

    def _cookie_token(self):
        for part in self.headers.get("Cookie", "").split(";"):
            key, sep, value = part.strip().partition("=")
            if sep and key == "aura_session":
                return value
        return ""

    def _session(self):
        token = self._cookie_token()
        if not token:
            return None
        with connect_db() as db:
            return db.execute(
                "SELECT s.csrf_token,s.expires_at,u.* FROM sessions s JOIN users u ON u.id=s.user_id "
                "WHERE s.token_hash=? AND s.expires_at>?",
                (hashlib.sha256(token.encode()).hexdigest(), int(time.time())),
            ).fetchone()

    def _require_user(self, role=None, csrf=False):
        session = self._session()
        if not session:
            self._json(401, {"error": "Inicia sesión para continuar."})
            return None
        if role and session["role"] != role:
            self._json(403, {"error": "No tienes permisos para esta acción."})
            return None
        if csrf and not hmac.compare_digest(session["csrf_token"], self.headers.get("X-CSRF-Token", "")):
            self._json(403, {"error": "La sesión expiró. Recarga la página e inténtalo de nuevo."})
            return None
        return session

    def _new_session(self, user_id):
        token = secrets.token_urlsafe(32)
        csrf_token = secrets.token_urlsafe(24)
        with connect_db() as db:
            db.execute("INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES(?,?,?,?)",
                       (hashlib.sha256(token.encode()).hexdigest(), user_id, csrf_token, int(time.time()) + SESSION_SECONDS))
        cookie = f"aura_session={token}; Path=/; HttpOnly; SameSite=Strict; Max-Age={SESSION_SECONDS}"
        return csrf_token, cookie

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/me":
            session = self._session()
            return self._json(200, {"user": public_user(session) if session else None,
                                    "csrfToken": session["csrf_token"] if session else None})
        if path == "/api/addresses":
            session = self._require_user("customer")
            if session:
                with connect_db() as db:
                    rows = db.execute("SELECT * FROM addresses WHERE user_id=? ORDER BY id DESC", (session["id"],)).fetchall()
                return self._json(200, {"addresses": [dict(row) for row in rows]})
            return
        if path == "/api/orders":
            session = self._require_user("customer")
            if session:
                with connect_db() as db:
                    rows = db.execute("SELECT id,items_json,total,address_json,delivery_date,notes,status,created_at FROM orders WHERE user_id=? ORDER BY id DESC", (session["id"],)).fetchall()
                orders = [{**dict(row), "items": json.loads(row["items_json"]), "address": json.loads(row["address_json"])} for row in rows]
                return self._json(200, {"orders": orders})
            return
        if path == "/api/admin/summary":
            session = self._require_user("admin")
            if session:
                with connect_db() as db:
                    orders = db.execute("SELECT o.*,u.name customer_name,u.email customer_email,u.phone customer_phone FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.id DESC LIMIT 200").fetchall()
                    customers = db.execute("SELECT id,name,email,phone,created_at FROM users WHERE role='customer' ORDER BY id DESC").fetchall()
                return self._json(200, {"orders": [{**dict(row), "items": json.loads(row["items_json"]), "address": json.loads(row["address_json"])} for row in orders],
                                        "customers": [dict(row) for row in customers]})
            return
        return super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        try:
            data = self._body()
        except ValueError as exc:
            return self._json(400, {"error": str(exc)})

        if path in ("/api/register", "/api/login"):
            email = str(data.get("email", "")).strip().lower()
            password = str(data.get("password", ""))
            if path == "/api/register":
                name = str(data.get("name", "")).strip()
                phone = str(data.get("phone", "")).strip()
                if not name or len(name) > 100 or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
                    return self._json(400, {"error": "Escribe un nombre y un correo válido."})
                if len(password) < 10 or len(password) > 200:
                    return self._json(400, {"error": "La contraseña debe tener al menos 10 caracteres."})
                try:
                    with connect_db() as db:
                        cursor = db.execute("INSERT INTO users(email,name,phone,password_hash,role,created_at) VALUES(?,?,?,?,?,?)",
                                            (email, name, phone[:30], hash_password(password), "customer", utc_now()))
                        user_id = cursor.lastrowid
                except sqlite3.IntegrityError:
                    return self._json(409, {"error": "Ya existe una cuenta con ese correo."})
            else:
                with connect_db() as db:
                    user = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
                if not user or not verify_password(password, user["password_hash"]):
                    return self._json(401, {"error": "Correo o contraseña incorrectos."})
                user_id = user["id"]
            csrf_token, cookie = self._new_session(user_id)
            with connect_db() as db:
                user = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
            return self._json(200, {"user": public_user(user), "csrfToken": csrf_token}, [("Set-Cookie", cookie)])

        if path == "/api/logout":
            session = self._require_user(csrf=True)
            if not session:
                return
            token = self._cookie_token()
            with connect_db() as db:
                db.execute("DELETE FROM sessions WHERE token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),))
            return self._json(200, {"ok": True}, [("Set-Cookie", "aura_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0")])

        if path == "/api/addresses":
            session = self._require_user("customer", csrf=True)
            if not session:
                return
            fields = {key: str(data.get(key, "")).strip() for key in ("label", "street", "neighborhood", "city", "postal_code", "instructions")}
            if any(not fields[key] for key in ("label", "street", "neighborhood", "city", "postal_code")):
                return self._json(400, {"error": "Completa nombre, calle, colonia, ciudad y código postal."})
            with connect_db() as db:
                cursor = db.execute("INSERT INTO addresses(user_id,label,street,neighborhood,city,postal_code,instructions,created_at) VALUES(?,?,?,?,?,?,?,?)",
                                    (session["id"], fields["label"][:50], fields["street"][:150], fields["neighborhood"][:100], fields["city"][:100], fields["postal_code"][:12], fields["instructions"][:250], utc_now()))
            return self._json(201, {"id": cursor.lastrowid})

        if path == "/api/orders":
            session = self._require_user("customer", csrf=True)
            if not session:
                return
            lines = data.get("items")
            if not isinstance(lines, list) or not lines or len(lines) > 30:
                return self._json(400, {"error": "El carrito está vacío o no es válido."})
            items, total = [], 0
            for line in lines:
                product_id = str(line.get("id", ""))
                if product_id not in PRODUCT_PRICES:
                    return self._json(400, {"error": "Los pasteles personalizados deben solicitarse por WhatsApp; el precio se confirma con el taller.", "code": "custom_item_requires_quote"})
                try:
                    quantity = int(line.get("quantity", 0))
                except (ValueError, TypeError):
                    quantity = 0
                if quantity < 1 or quantity > 20:
                    return self._json(400, {"error": "La cantidad de un producto no es válida."})
                price, name = PRODUCT_PRICES[product_id]
                items.append({"id": product_id, "name": name, "price": price, "quantity": quantity, "customNotes": str(line.get("customNotes", ""))[:250]})
                total += price * quantity
            if total > 2_000_000:
                return self._json(400, {"error": "El importe supera el límite permitido."})
            try:
                address_id = int(data.get("address_id", 0))
            except (TypeError, ValueError):
                address_id = 0
            with connect_db() as db:
                address = db.execute("SELECT * FROM addresses WHERE id=? AND user_id=?", (address_id, session["id"])).fetchone()
                if not address:
                    return self._json(400, {"error": "Guarda y selecciona una dirección de entrega antes de continuar."})
                cursor = db.execute("INSERT INTO orders(user_id,items_json,total,address_json,delivery_date,notes,status,created_at) VALUES(?,?,?,?,?,?,?,?)",
                                    (session["id"], json.dumps(items, ensure_ascii=False), total, json.dumps(dict(address), ensure_ascii=False), str(data.get("delivery_date", ""))[:10], str(data.get("notes", ""))[:500], "awaiting_payment", utc_now()))
                order_id = cursor.lastrowid
            stripe_key = os.environ.get("STRIPE_SECRET_KEY", "")
            if not stripe_key:
                return self._json(201, {"order_id": order_id, "payment": "not_configured", "message": "Pedido guardado. El cobro en línea aún no está configurado; contacta a la pastelería para pagar."})
            try:
                checkout = self._create_stripe_checkout(stripe_key, order_id, items)
                with connect_db() as db:
                    db.execute("UPDATE orders SET stripe_session_id=? WHERE id=?", (checkout["id"], order_id))
                return self._json(201, {"order_id": order_id, "payment": "redirect", "checkout_url": checkout["url"]})
            except (urllib.error.URLError, KeyError, ValueError) as exc:
                print(f"No se pudo iniciar el checkout del pedido {order_id}: {exc}")
                return self._json(502, {"order_id": order_id, "error": "El pedido se guardó, pero no fue posible iniciar el pago. Contacta a la pastelería."})

        if path == "/api/stripe/webhook":
            return self._stripe_webhook(data)
        return self._json(404, {"error": "Ruta no encontrada."})

    def _create_stripe_checkout(self, secret, order_id, items):
        fields = {
            "mode": "payment", "success_url": f"http://localhost:{PORT}/?pago=exito",
            "cancel_url": f"http://localhost:{PORT}/?pago=cancelado", "client_reference_id": str(order_id),
            "metadata[order_id]": str(order_id),
        }
        for index, item in enumerate(items):
            fields.update({
                f"line_items[{index}][price_data][currency]": "mxn",
                f"line_items[{index}][price_data][unit_amount]": str(item["price"] * 100),
                f"line_items[{index}][price_data][product_data][name]": item["name"],
                f"line_items[{index}][quantity]": str(item["quantity"]),
            })
        request = urllib.request.Request("https://api.stripe.com/v1/checkout/sessions",
                                         data=urllib.parse.urlencode(fields).encode(),
                                         headers={"Authorization": f"Bearer {secret}", "Content-Type": "application/x-www-form-urlencoded"})
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))

    def _stripe_webhook(self, data):
        secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
        signature = self.headers.get("Stripe-Signature", "")
        if not secret or not signature:
            return self._json(400, {"error": "Webhook no configurado."})
        try:
            timestamp = next(part.split("=", 1)[1] for part in signature.split(",") if part.startswith("t="))
            supplied = next(part.split("=", 1)[1] for part in signature.split(",") if part.startswith("v1="))
            length = int(self.headers.get("Content-Length", "0"))
            raw = getattr(self, "_raw_request_body", None)
            if raw is None:
                # HMAC debe verificar los bytes exactos; do_POST conserva el cuerpo original.
                return self._json(400, {"error": "No se pudo verificar el cuerpo del webhook."})
            expected = hmac.new(secret.encode(), f"{timestamp}.".encode() + raw, hashlib.sha256).hexdigest()
            if abs(int(time.time()) - int(timestamp)) > 300 or not hmac.compare_digest(expected, supplied):
                return self._json(400, {"error": "Firma de webhook inválida."})
            if data.get("type") in ("checkout.session.completed", "checkout.session.async_payment_succeeded"):
                obj = data.get("data", {}).get("object", {})
                order_id = int(obj.get("metadata", {}).get("order_id", "0"))
                if obj.get("payment_status") == "paid" and order_id:
                    with connect_db() as db:
                        db.execute("UPDATE orders SET status='paid' WHERE id=? AND stripe_session_id=?", (order_id, obj.get("id")))
            return self._json(200, {"received": True})
        except (ValueError, StopIteration, TypeError):
            return self._json(400, {"error": "Evento de webhook no válido."})

    def do_PATCH(self):
        match = re.fullmatch(r"/api/admin/orders/(\d+)", urllib.parse.urlparse(self.path).path)
        if not match:
            return self._json(404, {"error": "Ruta no encontrada."})
        session = self._require_user("admin", csrf=True)
        if not session:
            return
        try:
            status = self._body().get("status")
        except ValueError as exc:
            return self._json(400, {"error": str(exc)})
        if status not in ("awaiting_payment", "paid", "preparing", "ready", "delivered", "cancelled"):
            return self._json(400, {"error": "Estado de pedido no válido."})
        with connect_db() as db:
            result = db.execute("UPDATE orders SET status=? WHERE id=?", (status, int(match.group(1))))
        if not result.rowcount:
            return self._json(404, {"error": "No se encontró ese pedido."})
        return self._json(200, {"ok": True})


def run():
    initialize_database()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://localhost:{PORT}"
    print("AURA lista en", url)
    if not (os.environ.get("AURA_ADMIN_EMAIL") and os.environ.get("AURA_ADMIN_PASSWORD")):
        print("Aviso: configura AURA_ADMIN_EMAIL y AURA_ADMIN_PASSWORD para habilitar administración.")
    print("Presiona Ctrl+C para detener el servidor.")
    try:
        webbrowser.open(url)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor cerrado.")
    finally:
        server.server_close()


if __name__ == "__main__":
    run()
