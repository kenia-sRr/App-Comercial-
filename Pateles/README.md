# 🎂 AURA Pâtisserie — Pastelería Contemporánea

Sitio web profesional, moderno y minimalista diseñado específicamente para una pastelería fina o de autor, con un enfoque 100% orientado a la conversión de visitantes en clientes y ventas.

---

## ✨ Características Principales

1. **Estética Minimalista y Editorial**:
   - Paleta de colores cálida y sofisticada (cremas suaves, carbón profundo, lino natural y acentos en oro champaña).
   - Tipografía refinada (`Playfair Display` para titulares y `Plus Jakarta Sans` para lectura fluida y moderna).
   - Microinteracciones, estados hover fluidos y diseño completamente responsivo para móviles, tablets y ordenadores.

2. **Catálogo Interactivo con Filtros**:
   - Clasificación por categorías: *Pasteles de Autor*, *Celebraciones*, *Bodas & Eventos*, *Individuales & Tartas*.
   - Vista rápida con modal detallado (ingredientes, alérgenos, porciones sugeridas y campo para dedicatoria especial).
   - Botón directo de adición al carrito con notificación toast inmediata.

3. **Constructor Interactivo "Diseña tu Pastel" (Cotizador en Tiempo Real)**:
   - Los clientes pueden seleccionar tamaño/porciones, sabor de bizcocho, relleno artesanal, cobertura y extras decorativos (flores orgánicas, hoja de oro 24k, macarons, toppers).
   - **Cálculo dinámico de precio al instante**: Aumenta la confianza del cliente al ver el costo transparente.
   - **Generador de mensaje a WhatsApp**: Envía con 1 solo clic la cotización detallada con todos los elementos seleccionados al WhatsApp del negocio.

4. **Carrito de Compras con Slide-over Drawer**:
   - Control de cantidades, selector de fecha de entrega y notas especiales.
   - Dos opciones de finalización de compra:
     - **Vía WhatsApp (Recomendado)**: Pre-llena un mensaje estructurado con todo el detalle de la orden listo para enviar.
     - **Pedido Local en Línea**: Formulario directo con confirmación instantánea.

5. **Elementos de Confianza y Conversión**:
   - Barra de confianza en el Hero (+1,200 eventos, 4.9★ en reseñas de clientes).
   - Sección de filosofía de marca y respeto por el ingrediente puro.
   - Sección de testimonios reales de clientes.
   - Acordeón de Preguntas Frecuentes (anticipación de pedidos, envíos refrigerados, opciones sin gluten).
   - Botón flotante permanente de WhatsApp con animación discreta.

---

## 🚀 Cómo Ejecutar Localmente

### Opción 1: Con doble clic en Windows (La más rápida)
1. Ve a la carpeta del proyecto en el Explorador de Archivos de Windows.
2. Haz doble clic en el archivo **`iniciar_pasteleria.bat`**.
3. ¡Listo! Se iniciará el servidor local en segundo plano y se abrirá automáticamente la web en tu navegador en `http://localhost:8000`.

### Opción 2: Desde la terminal (PowerShell o CMD)
Ejecuta:
```powershell
python server.py
```
O simplemente:
```powershell
python -m http.server 8000
```
Y abre tu navegador en [http://localhost:8000](http://localhost:8000).

### Opción 3: Abrir directamente el archivo HTML
Si no deseas iniciar ningún servidor, puedes simplemente hacer doble clic en **`index.html`** y abrirlo en Chrome, Edge, Safari o Firefox.

---

## ⚙️ Cómo Personalizar para tu Negocio

Todos los datos están centralizados y son muy fáciles de modificar:

- **Cambiar tu número de WhatsApp**:
  Abre el archivo `js/data.js` y edita la propiedad `telefonoWhatsApp` en `PASTELERIA_CONFIG`:
  ```javascript
  const PASTELERIA_CONFIG = {
      nombre: "AURA Pâtisserie",
      telefonoWhatsApp: "52155XXXXXXXX", // Tu número con código de país (sin espacios ni guiones)
      ...
  };
  ```

- **Modificar o agregar pasteles y precios**:
  En `js/data.js`, edita la lista `PRODUCTOS`. Puedes cambiar nombres, descripciones, precios, porciones y enlaces de imágenes.

- **Modificar opciones de personalización**:
  En `js/data.js`, ajusta `PERSONALIZADOR_CONFIG` para cambiar los bizcochos, rellenos o precios base de tus pasteles.

---

## 📁 Estructura del Proyecto

```
Pateles/
│
├── index.html               # Estructura principal y secciones semánticas
├── server.py                # Servidor local en Python con apertura automática
├── iniciar_pasteleria.bat   # Lanzador directo con doble clic para Windows
├── README.md                # Documentación y guía de personalización
│
├── css/
│   └── styles.css           # Estilos minimalistas, paleta de colores y responsive
│
└── js/
    ├── data.js              # Base de datos de pasteles, precios y configuración
    ├── cart.js              # Controlador del carrito y generador de pedidos WhatsApp
    └── app.js               # Interacciones de catálogo, cotizador y modales
```
