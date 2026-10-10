// Aplicación Principal y Funcionalidades Interactivas para Pastelería AURA

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Carrito Global
    window.cart = new CartManager();

    // Inicializar Módulos
    initNavbar();
    renderCatalog();
    initCatalogFilters();
    initProductDetailModal();
    initCakeCustomizer();
    renderTestimonials();
    initFaqAccordion();
    initDirectOrderForm();
    initFloatingWhatsApp();
    setupSmoothScroll();
});

/* ==========================================================================
   1. NAVBAR & NAVEGACIÓN
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            mobileMenuBtn.classList.toggle('open');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                mobileMenuBtn.classList.remove('open');
            });
        });
    }
}

/* ==========================================================================
   2. CATÁLOGO DE PRODUCTOS
   ========================================================================== */
function renderCatalog(filterCategory = 'all') {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filtered = filterCategory === 'all' 
        ? PRODUCTOS 
        : PRODUCTOS.filter(p => p.categoria === filterCategory);

    grid.innerHTML = filtered.map(producto => `
        <article class="product-card" data-id="${producto.id}">
            <div class="product-image-container">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" class="product-img" onerror="this.onerror=null; if('${producto.imagenFallback}') this.src='${producto.imagenFallback}';">
                ${producto.badge ? `<span class="product-badge">${producto.badge}</span>` : ''}
                <button class="quick-view-btn" onclick="openProductModal('${producto.id}')" title="Ver detalles rápidos">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    Vista rápida
                </button>
            </div>
            <div class="product-content">
                <div class="product-meta">
                    <span class="product-category">${producto.categoriaNombre}</span>
                    <span class="product-portions">${producto.porciones}</span>
                </div>
                <h3 class="product-title" onclick="openProductModal('${producto.id}')">${producto.nombre}</h3>
                <p class="product-desc">${producto.descripcionCorta}</p>
                <div class="product-footer">
                    <div class="product-price">
                        <span class="currency">$</span>${producto.precio.toLocaleString()} <span class="currency-code">MXN</span>
                    </div>
                    <button class="btn-add-cart" onclick="quickAddToCart('${producto.id}')" aria-label="Añadir al carrito">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        <span>Añadir</span>
                    </button>
                </div>
            </div>
        </article>
    `).join('');
}

function initCatalogFilters() {
    const filterBtns = document.querySelectorAll('.filter-pill');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            renderCatalog(category);
        });
    });
}

function quickAddToCart(productId) {
    const producto = PRODUCTOS.find(p => p.id === productId);
    if (producto) {
        window.cart.addItem(producto);
    }
}

/* ==========================================================================
   3. MODAL DE DETALLES DEL PRODUCTO
   ========================================================================== */
function initProductDetailModal() {
    const modal = document.getElementById('productDetailModal');
    const closeBtn = document.getElementById('closeProductModal');
    const overlay = document.getElementById('productModalOverlay');

    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);
    if (overlay) overlay.addEventListener('click', closeProductModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
}

function openProductModal(productId) {
    const producto = PRODUCTOS.find(p => p.id === productId);
    if (!producto) return;

    const modal = document.getElementById('productDetailModal');
    const modalBody = document.getElementById('productModalBody');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-product-grid">
            <div class="modal-product-media">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="modal-product-img" onerror="this.onerror=null; if('${producto.imagenFallback}') this.src='${producto.imagenFallback}';">
                ${producto.badge ? `<span class="modal-product-badge">${producto.badge}</span>` : ''}
            </div>
            <div class="modal-product-details">
                <div class="modal-header-tag">
                    <span>${producto.categoriaNombre}</span> • <span>${producto.porciones}</span>
                </div>
                <h2 class="modal-product-title">${producto.nombre}</h2>
                <div class="modal-product-price">$${producto.precio.toLocaleString()} MXN</div>
                
                <p class="modal-product-description">${producto.descripcionLarga}</p>
                
                <div class="modal-ingredients-section">
                    <h4>Ingredientes Principales:</h4>
                    <div class="tags-list">
                        ${producto.ingredientes.map(ing => `<span class="tag">${ing}</span>`).join('')}
                    </div>
                </div>

                <div class="modal-allergens-section">
                    <h4>Alérgenos:</h4>
                    <div class="tags-list">
                        ${producto.alergenos.map(al => `<span class="tag tag-allergen">${al}</span>`).join('')}
                    </div>
                </div>

                <div class="modal-custom-note">
                    <label for="modalDedication">Dedicatoria o requerimiento especial (opcional):</label>
                    <input type="text" id="modalDedication" placeholder="Ej: 'Feliz Cumpleaños María', velita incluida, etc.">
                </div>

                <div class="modal-action-row">
                    <button class="btn btn-primary btn-block" id="modalAddCartBtn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        Añadir al Carrito ($${producto.precio.toLocaleString()} MXN)
                    </button>
                </div>
            </div>
        </div>
    `;

    const addBtn = document.getElementById('modalAddCartBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const noteInput = document.getElementById('modalDedication');
            const note = noteInput ? noteInput.value.trim() : "";
            window.cart.addItem(producto, note);
            closeProductModal();
        });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/* ==========================================================================
   4. CONSTRUCTOR PERSONALIZADO ("DISEÑA TU PASTEL")
   ========================================================================== */
let customCakeState = {
    tamano: PERSONALIZADOR_CONFIG.tamanos[1], // Medio por defecto
    bizcocho: PERSONALIZADOR_CONFIG.bizcochos[0],
    relleno: PERSONALIZADOR_CONFIG.rellenos[0],
    cobertura: PERSONALIZADOR_CONFIG.coberturas[1],
    extras: [],
    dedicatoria: ""
};

function initCakeCustomizer() {
    renderCustomizerOptions();
    bindCustomizerEvents();
    updateCustomizerSummary();
}

function renderCustomizerOptions() {
    // 1. Tamaños
    const sizesContainer = document.getElementById('customSizesContainer');
    if (sizesContainer) {
        sizesContainer.innerHTML = PERSONALIZADOR_CONFIG.tamanos.map(tam => `
            <div class="custom-card-option ${tam.id === customCakeState.tamano.id ? 'selected' : ''}" data-type="tamano" data-id="${tam.id}">
                ${tam.recomendado ? `<span class="option-pill">Más popular</span>` : ''}
                <div class="option-title">${tam.nombre}</div>
                <div class="option-sub">${tam.porciones}</div>
                <div class="option-price">Desde $${tam.precioBase.toLocaleString()} MXN</div>
            </div>
        `).join('');
    }

    // 2. Bizcocho
    const spongeContainer = document.getElementById('customSpongeContainer');
    if (spongeContainer) {
        spongeContainer.innerHTML = PERSONALIZADOR_CONFIG.bizcochos.map(b => `
            <div class="custom-card-option ${b.id === customCakeState.bizcocho.id ? 'selected' : ''}" data-type="bizcocho" data-id="${b.id}">
                <div class="option-title">${b.nombre}</div>
                <div class="option-sub">${b.descripcion}</div>
                <div class="option-tag">${b.extra > 0 ? `+$${b.extra} MXN` : 'Incluido'}</div>
            </div>
        `).join('');
    }

    // 3. Relleno
    const fillingContainer = document.getElementById('customFillingContainer');
    if (fillingContainer) {
        fillingContainer.innerHTML = PERSONALIZADOR_CONFIG.rellenos.map(r => `
            <div class="custom-card-option ${r.id === customCakeState.relleno.id ? 'selected' : ''}" data-type="relleno" data-id="${r.id}">
                <div class="option-title">${r.nombre}</div>
                <div class="option-tag">${r.extra > 0 ? `+$${r.extra} MXN` : 'Incluido'}</div>
            </div>
        `).join('');
    }

    // 4. Cobertura
    const coatingContainer = document.getElementById('customCoatingContainer');
    if (coatingContainer) {
        coatingContainer.innerHTML = PERSONALIZADOR_CONFIG.coberturas.map(c => `
            <div class="custom-card-option ${c.id === customCakeState.cobertura.id ? 'selected' : ''}" data-type="cobertura" data-id="${c.id}">
                <div class="option-title">${c.nombre}</div>
                <div class="option-sub">${c.descripcion}</div>
                <div class="option-tag">${c.extra > 0 ? `+$${c.extra} MXN` : 'Incluido'}</div>
            </div>
        `).join('');
    }

    // 5. Extras
    const extrasContainer = document.getElementById('customExtrasContainer');
    if (extrasContainer) {
        extrasContainer.innerHTML = PERSONALIZADOR_CONFIG.extras.map(ex => `
            <label class="custom-checkbox-card">
                <input type="checkbox" name="cake_extra" value="${ex.id}">
                <div class="checkbox-indicator"></div>
                <div class="checkbox-text">
                    <span class="extra-name">${ex.nombre}</span>
                    <span class="extra-price">+$${ex.precio} MXN</span>
                </div>
            </label>
        `).join('');
    }
}

function bindCustomizerEvents() {
    // Selección por clic en tarjetas
    document.addEventListener('click', (e) => {
        const optionCard = e.target.closest('.custom-card-option');
        if (!optionCard) return;

        const type = optionCard.getAttribute('data-type');
        const id = optionCard.getAttribute('data-id');

        if (type === 'tamano') {
            customCakeState.tamano = PERSONALIZADOR_CONFIG.tamanos.find(t => t.id === id);
            document.querySelectorAll('#customSizesContainer .custom-card-option').forEach(c => c.classList.remove('selected'));
            optionCard.classList.add('selected');
        } else if (type === 'bizcocho') {
            customCakeState.bizcocho = PERSONALIZADOR_CONFIG.bizcochos.find(b => b.id === id);
            document.querySelectorAll('#customSpongeContainer .custom-card-option').forEach(c => c.classList.remove('selected'));
            optionCard.classList.add('selected');
        } else if (type === 'relleno') {
            customCakeState.relleno = PERSONALIZADOR_CONFIG.rellenos.find(r => r.id === id);
            document.querySelectorAll('#customFillingContainer .custom-card-option').forEach(c => c.classList.remove('selected'));
            optionCard.classList.add('selected');
        } else if (type === 'cobertura') {
            customCakeState.cobertura = PERSONALIZADOR_CONFIG.coberturas.find(c => c.id === id);
            document.querySelectorAll('#customCoatingContainer .custom-card-option').forEach(c => c.classList.remove('selected'));
            optionCard.classList.add('selected');
        }

        updateCustomizerSummary();
    });

    // Checkboxes extras
    const extraInputs = document.querySelectorAll('input[name="cake_extra"]');
    extraInputs.forEach(input => {
        input.addEventListener('change', () => {
            const selectedIds = Array.from(document.querySelectorAll('input[name="cake_extra"]:checked')).map(cb => cb.value);
            customCakeState.extras = PERSONALIZADOR_CONFIG.extras.filter(ex => selectedIds.includes(ex.id));
            updateCustomizerSummary();
        });
    });

    // Input dedicatoria
    const textDedication = document.getElementById('customCakeDedication');
    if (textDedication) {
        textDedication.addEventListener('input', (e) => {
            customCakeState.dedicatoria = e.target.value;
        });
    }

    // Botón: Añadir diseño al carrito
    const addCustomToCartBtn = document.getElementById('addCustomCakeToCartBtn');
    if (addCustomToCartBtn) {
        addCustomToCartBtn.addEventListener('click', () => {
            const totalPrice = calculateCustomCakePrice();
            const customProduct = {
                id: `custom-cake-${Date.now()}`,
                nombre: `Pastel Personalizado (${customCakeState.tamano.nombre})`,
                precio: totalPrice,
                porciones: customCakeState.tamano.porciones,
                imagen: "assets/images/pastel-03.jpg"
            };

            const detailsSummary = [
                `Bizcocho: ${customCakeState.bizcocho.nombre}`,
                `Relleno: ${customCakeState.relleno.nombre}`,
                `Cobertura: ${customCakeState.cobertura.nombre}`,
                customCakeState.extras.length > 0 ? `Extras: ${customCakeState.extras.map(e => e.nombre).join(', ')}` : null,
                customCakeState.dedicatoria ? `Dedicatoria: "${customCakeState.dedicatoria}"` : null
            ].filter(Boolean).join(' | ');

            window.cart.addItem(customProduct, detailsSummary);
        });
    }

    // Botón: Cotizar diseño directo por WhatsApp
    const quoteCustomWaBtn = document.getElementById('quoteCustomCakeWaBtn');
    if (quoteCustomWaBtn) {
        quoteCustomWaBtn.addEventListener('click', () => {
            const totalPrice = calculateCustomCakePrice();
            let msg = `*¡HOLA AURA PÂTISSERIE!* 🎂✨\n`;
            msg += `He diseñado un pastel personalizado en su página web y deseo cotizarlo:\n\n`;
            msg += `*TAMAÑO:* ${customCakeState.tamano.nombre} (${customCakeState.tamano.porciones})\n`;
            msg += `*BIZCOCHO:* ${customCakeState.bizcocho.nombre}\n`;
            msg += `*RELLENO:* ${customCakeState.relleno.nombre}\n`;
            msg += `*COBERTURA:* ${customCakeState.cobertura.nombre}\n`;
            
            if (customCakeState.extras.length > 0) {
                msg += `*EXTRAS SELECCIONADOS:*\n`;
                customCakeState.extras.forEach(e => {
                    msg += `  • ${e.nombre} (+$${e.precio})\n`;
                });
            }

            if (customCakeState.dedicatoria) {
                msg += `*DEDICATORIA/TEXTO:* "${customCakeState.dedicatoria}"\n`;
            }

            msg += `\n*PRECIO ESTIMADO CALCULADO:* $${totalPrice.toLocaleString()} MXN\n`;
            msg += `\n¿Tienen disponibilidad para agendar esta fecha? ¡Quedo pendiente!`;

            const url = `https://wa.me/${PASTELERIA_CONFIG.telefonoWhatsApp}?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        });
    }
}

function calculateCustomCakePrice() {
    let total = customCakeState.tamano.precioBase;
    total += customCakeState.bizcocho.extra || 0;
    total += customCakeState.relleno.extra || 0;
    total += customCakeState.cobertura.extra || 0;
    
    if (customCakeState.extras && customCakeState.extras.length > 0) {
        customCakeState.extras.forEach(ex => {
            total += ex.precio || 0;
        });
    }
    return total;
}

function updateCustomizerSummary() {
    const total = calculateCustomCakePrice();
    const priceDisplay = document.getElementById('customCakeLivePrice');
    if (priceDisplay) {
        priceDisplay.textContent = `$${total.toLocaleString()} MXN`;
    }

    const previewList = document.getElementById('customCakeSummaryList');
    if (previewList) {
        previewList.innerHTML = `
            <li><strong>Tamaño:</strong> ${customCakeState.tamano.nombre} (${customCakeState.tamano.porciones})</li>
            <li><strong>Bizcocho:</strong> ${customCakeState.bizcocho.nombre}</li>
            <li><strong>Relleno:</strong> ${customCakeState.relleno.nombre}</li>
            <li><strong>Cobertura:</strong> ${customCakeState.cobertura.nombre}</li>
            ${customCakeState.extras.length > 0 
                ? `<li><strong>Extras:</strong> ${customCakeState.extras.map(e => e.nombre).join(', ')}</li>` 
                : '<li><strong>Extras:</strong> Ninguno seleccionado</li>'}
        `;
    }
}

/* ==========================================================================
   5. TESTIMONIOS Y FAQS
   ========================================================================== */
function renderTestimonials() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;

    container.innerHTML = TESTIMONIOS.map(t => `
        <div class="testimonial-card">
            <div class="stars-row">
                ${'★'.repeat(t.estrellas)}
            </div>
            <p class="testimonial-quote">"${t.comentario}"</p>
            <div class="testimonial-author">
                <span class="author-name">${t.nombre}</span>
                <span class="author-event">${t.tipo} • ${t.fecha}</span>
            </div>
        </div>
    `).join('');
}

function initFaqAccordion() {
    const faqContainer = document.getElementById('faqContainer');
    if (!faqContainer) return;

    faqContainer.innerHTML = FAQS.map((faq, idx) => `
        <div class="faq-item ${idx === 0 ? 'open' : ''}">
            <button class="faq-question" type="button" aria-expanded="${idx === 0}">
                <span>${faq.pregunta}</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
                <p>${faq.respuesta}</p>
            </div>
        </div>
    `).join('');

    faqContainer.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');
            
            // Cerrar otros para efecto acordeón limpio
            faqContainer.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('open');
                i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            if (!isOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* ==========================================================================
   6. FORMULARIO DE PEDIDO DIRECTO (CHECKOUT MODAL)
   ========================================================================== */
function initDirectOrderForm() {
    const form = document.getElementById('directOrderForm');
    const modal = document.getElementById('directOrderModal');
    const closeBtn = document.getElementById('closeDirectOrderModal');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('orderCustomerName').value.trim();
            const phone = document.getElementById('orderCustomerPhone').value.trim();
            const address = document.getElementById('orderCustomerAddress').value.trim();
            const deliveryType = document.querySelector('input[name="deliveryType"]:checked')?.value || 'domicilio';

            if (!name || !phone) {
                alert("Por favor completa tu nombre y teléfono para continuar.");
                return;
            }

            // Simular confirmación inmediata exitosa
            form.innerHTML = `
                <div class="order-success-state">
                    <div class="success-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h3>¡Pedido Registrado con Éxito!</h3>
                    <p>Muchas gracias <strong>${name}</strong>. Hemos recibido tu solicitud de pedido.</p>
                    <p class="sub">Te contactaremos de inmediato al <strong>${phone}</strong> para enviarte el enlace de pago y coordinar la entrega.</p>
                    <button type="button" class="btn btn-primary" onclick="closeOrderModalAndClear()">Aceptar</button>
                </div>
            `;
        });
    }
}

function closeOrderModalAndClear() {
    const modal = document.getElementById('directOrderModal');
    if (modal) modal.classList.remove('active');
    window.cart.items = [];
    window.cart.saveCart();
    window.cart.updateBadge();
    window.cart.renderCart();
    window.cart.closeCart();
}

/* ==========================================================================
   7. BOTÓN FLOTANTE WHATSAPP Y SMOOTH SCROLL
   ========================================================================== */
function initFloatingWhatsApp() {
    const floatBtn = document.getElementById('floatingWhatsAppBtn');
    if (floatBtn) {
        floatBtn.addEventListener('click', () => {
            const msg = encodeURIComponent("¡Hola AURA Pâtisserie! Me gustaría pedir informes y cotizar un pastel.");
            window.open(`https://wa.me/${PASTELERIA_CONFIG.telefonoWhatsApp}?text=${msg}`, '_blank');
        });
    }
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
