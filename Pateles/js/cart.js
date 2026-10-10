// Lógica del Carrito de Compras y Envío de Pedidos para Pastelería AURA

class CartManager {
    constructor() {
        this.items = this.loadCart();
        this.cartDrawer = document.getElementById('cartDrawer');
        this.cartOverlay = document.getElementById('cartOverlay');
        this.cartBadge = document.getElementById('cartCountBadge');
        this.cartItemsList = document.getElementById('cartItemsList');
        this.cartSubtotalElem = document.getElementById('cartSubtotal');
        this.cartEmptyState = document.getElementById('cartEmptyState');
        this.cartFooter = document.getElementById('cartFooter');
        
        this.init();
    }

    init() {
        this.updateBadge();
        this.bindEvents();
    }

    loadCart() {
        try {
            const stored = localStorage.getItem('aura_cart');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error al cargar carrito local:", e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('aura_cart', JSON.stringify(this.items));
        } catch (e) {
            console.error("Error al guardar carrito:", e);
        }
    }

    bindEvents() {
        // Botón abrir carrito
        const openBtn = document.getElementById('openCartBtn');
        if (openBtn) {
            openBtn.addEventListener('click', () => this.openCart());
        }

        // Botón cerrar carrito
        const closeBtn = document.getElementById('closeCartBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCart());
        }

        // Overlay cerrar
        if (this.cartOverlay) {
            this.cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Botón Checkout WhatsApp
        const waCheckoutBtn = document.getElementById('checkoutWhatsAppBtn');
        if (waCheckoutBtn) {
            waCheckoutBtn.addEventListener('click', () => this.checkoutWhatsApp());
        }

        // Botón Checkout Local / Formulario
        const directCheckoutBtn = document.getElementById('checkoutDirectBtn');
        if (directCheckoutBtn) {
            directCheckoutBtn.addEventListener('click', () => this.openCheckoutModal());
        }

        // Tecla escape cierra carrito
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    addItem(product, customNotes = "") {
        const existingIndex = this.items.findIndex(item => item.id === product.id && item.customNotes === customNotes);
        
        if (existingIndex > -1) {
            this.items[existingIndex].quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.nombre || product.name,
                price: product.precio || product.price,
                portions: product.porciones || "",
                image: product.imagen || product.image,
                customNotes: customNotes,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateBadge();
        this.renderCart();
        this.showToast(`¡"${product.nombre || product.name}" añadido al pedido!`);
        this.openCart();
    }

    removeItem(index) {
        if (index >= 0 && index < this.items.length) {
            const removed = this.items.splice(index, 1)[0];
            this.saveCart();
            this.updateBadge();
            this.renderCart();
            this.showToast(`Se retiró "${removed.name}" del carrito`);
        }
    }

    updateQuantity(index, delta) {
        if (this.items[index]) {
            this.items[index].quantity += delta;
            if (this.items[index].quantity <= 0) {
                this.removeItem(index);
                return;
            }
            this.saveCart();
            this.updateBadge();
            this.renderCart();
        }
    }

    updateBadge() {
        const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
        if (this.cartBadge) {
            this.cartBadge.textContent = totalCount;
            this.cartBadge.classList.toggle('hidden', totalCount === 0);
            
            // Animación sutil de pulso
            this.cartBadge.classList.remove('badge-pop');
            void this.cartBadge.offsetWidth;
            this.cartBadge.classList.add('badge-pop');
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    openCart() {
        this.renderCart();
        if (this.cartDrawer) this.cartDrawer.classList.add('active');
        if (this.cartOverlay) this.cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        if (this.cartDrawer) this.cartDrawer.classList.remove('active');
        if (this.cartOverlay) this.cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    renderCart() {
        if (!this.cartItemsList) return;

        if (this.items.length === 0) {
            this.cartItemsList.innerHTML = '';
            if (this.cartEmptyState) this.cartEmptyState.style.display = 'flex';
            if (this.cartFooter) this.cartFooter.style.display = 'none';
            return;
        }

        if (this.cartEmptyState) this.cartEmptyState.style.display = 'none';
        if (this.cartFooter) this.cartFooter.style.display = 'block';

        this.cartItemsList.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    ${item.portions ? `<span class="cart-item-sub">${item.portions}</span>` : ''}
                    ${item.customNotes ? `<p class="cart-item-notes">Nota: "${item.customNotes}"</p>` : ''}
                    <div class="cart-item-price">$${(item.price * item.quantity).toLocaleString()} MXN</div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button type="button" class="qty-btn" onclick="window.cart.updateQuantity(${index}, -1)" aria-label="Disminuir cantidad">−</button>
                            <span class="qty-num">${item.quantity}</span>
                            <button type="button" class="qty-btn" onclick="window.cart.updateQuantity(${index}, 1)" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button type="button" class="remove-item-btn" onclick="window.cart.removeItem(${index})" title="Eliminar producto">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        if (this.cartSubtotalElem) {
            this.cartSubtotalElem.textContent = `$${this.getTotal().toLocaleString()} MXN`;
        }
    }

    checkoutWhatsApp() {
        if (this.items.length === 0) {
            this.showToast("El carrito está vacío. Elige un pastel antes de continuar.");
            return;
        }

        const dateInput = document.getElementById('orderDeliveryDate');
        const deliveryDate = dateInput ? dateInput.value : '';
        const notesInput = document.getElementById('orderGeneralNotes');
        const generalNotes = notesInput ? notesInput.value.trim() : '';

        let mensaje = `*¡HOLA AURA PÂTISSERIE!* ✨\n`;
        mensaje += `Deseo realizar el siguiente pedido a través de su página web:\n\n`;
        mensaje += `----------------------------------------\n`;
        
        this.items.forEach((item, i) => {
            mensaje += `🍰 *${item.quantity}x* ${item.name}\n`;
            if (item.portions) mensaje += `   Porciones: ${item.portions}\n`;
            if (item.customNotes) mensaje += `   Detalles: ${item.customNotes}\n`;
            mensaje += `   Subtotal: $${(item.price * item.quantity).toLocaleString()} MXN\n\n`;
        });

        mensaje += `----------------------------------------\n`;
        mensaje += `💰 *TOTAL ESTIMADO:* $${this.getTotal().toLocaleString()} MXN\n`;
        
        if (deliveryDate) {
            mensaje += `📅 *Fecha requerida:* ${deliveryDate}\n`;
        }
        if (generalNotes) {
            mensaje += `📝 *Instrucciones / Dedicatoria:* ${generalNotes}\n`;
        }

        mensaje += `\n¿Me podrían confirmar disponibilidad para programar la entrega y el método de pago? ¡Muchas gracias!`;

        const waUrl = `https://wa.me/${PASTELERIA_CONFIG.telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(waUrl, '_blank');
    }

    openCheckoutModal() {
        if (this.items.length === 0) {
            this.showToast("Tu carrito está vacío.");
            return;
        }
        const modal = document.getElementById('directOrderModal');
        if (modal) {
            const summaryElem = document.getElementById('modalOrderSummary');
            if (summaryElem) {
                summaryElem.innerHTML = `
                    <div class="summary-box">
                        <div class="summary-line"><span>Artículos (${this.items.reduce((acc, it) => acc + it.quantity, 0)}):</span> <span>$${this.getTotal().toLocaleString()} MXN</span></div>
                        <div class="summary-line"><span>Entrega / Envío:</span> <span>A coordinar</span></div>
                        <div class="summary-total"><span>Total a pagar:</span> <span>$${this.getTotal().toLocaleString()} MXN</span></div>
                    </div>
                `;
            }
            modal.classList.add('active');
        }
    }

    showToast(message) {
        let toast = document.getElementById('toastNotification');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toastNotification';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }
}
