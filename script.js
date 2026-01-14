// Smooth scroll for anchor links
const navLinksAnchors = document.querySelectorAll('.nav-links a');

navLinksAnchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Only prevent default if it's a valid ID selector
        const href = this.getAttribute('href');
        if (href !== '#' && href.startsWith('#')) {
            e.preventDefault();

            // Manage active class
            navLinksAnchors.forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 70; // Adjust based on navbar height
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Update active link on scroll using Intersection Observer
const navTargets = document.querySelectorAll('section[id], footer[id]');
const observerOptions = {
    threshold: 0.1, // Trigger when 10% is visible
    rootMargin: '-20% 0px -70% 0px' // Focus on the upper-middle of the viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            // Only update if the id matches one of our nav links
            const correspondingLink = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (correspondingLink) {
                navLinksAnchors.forEach(link => link.classList.remove('active'));
                correspondingLink.classList.add('active');
            }
        }
    });
}, observerOptions);

navTargets.forEach(target => observer.observe(target));

// Process Tabs functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Simple mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        if (navLinks.style.display === 'flex') {
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.right = '0';
            navLinks.style.left = '0';
            navLinks.style.background = 'white';
            navLinks.style.padding = '20px';
            navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
        }
    });
}

/**
 * SHOPPING CART LOGIC
 */
const cart = [];
const cartModal = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalPriceSpan = document.getElementById('cart-total-price');
const checkoutSection = document.getElementById('checkout-section');
const checkoutForm = document.getElementById('checkout-form');

// Open/Close Modal
cartBtn.addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartModal.classList.remove('open');
});

// Close modal when clicking outside content
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('open');
    }
});

// Add to Cart
document.body.addEventListener('click', (e) => {
    // Handle "Tambah Keranjang" (Add to Cart)
    if (e.target.closest('.add-to-cart')) {
        const button = e.target.closest('.add-to-cart');
        addToCartFromButton(button, false);
    }

    // Handle "Pesan Sekarang" (Buy Now)
    if (e.target.closest('.buy-now')) {
        const button = e.target.closest('.buy-now');
        addToCartFromButton(button, true);
    }
});

function addToCartFromButton(button, openCartImmediately) {
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        const productCard = button.closest('.product-card');
        const img = productCard.querySelector('img');
        let imageSrc = null;
        let backgroundStyle = null;

        if (img) {
            imageSrc = img.src;
        } else {
            const placeholder = productCard.querySelector('.product-image div');
            if (placeholder) {
                backgroundStyle = placeholder.style.background;
            }
        }

        cart.push({
            id: id,
            name: name,
            price: price,
            image: imageSrc,
            backgroundStyle: backgroundStyle,
            quantity: 1
        });
    }

    renderCart();

    if (openCartImmediately) {
        cartModal.classList.add('open');
    } else {
        showToast(`Berhasil menambahkan "${name}" ke keranjang`);
    }
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span>${message}</span>
        </div>
    `;
    container.appendChild(toast);

    // Remove after animation (3s total)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Render Cart Items
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <p>Keranjang Anda masih kosong.</p>
                <button class="btn-primary" onclick="cartModal.classList.remove('open')">Mulai Belanja</button>
            </div>
        `;
        checkoutSection.style.display = 'none';
    } else {
        checkoutSection.style.display = 'block';
        cart.forEach(item => {
            total += item.price * item.quantity;
            itemCount += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');

            let imageHTML = '';
            if (item.image) {
                imageHTML = `<img src="${item.image}" alt="${item.name}">`;
            } else if (item.backgroundStyle) {
                imageHTML = `<div style="width: 100%; height: 100%; background: ${item.backgroundStyle}; border-radius: 8px;"></div>`;
            } else {
                imageHTML = `<div style="width: 100%; height: 100%; background: #eee; border-radius: 8px;"></div>`;
            }

            // Generate HTML for cart item with image
            itemElement.innerHTML = `
                <div class="cart-item-image">
                    ${imageHTML}
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                    <div class="quantity-control-sm">
                        <button class="qty-btn-sm" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn-sm" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn-icon" onclick="removeFromCart('${item.id}')" title="Hapus Item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    cartCountSpan.textContent = `${itemCount}`; // Badge only shows number
    cartTotalPriceSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// Global functions for inline onclick (simplified for this context)
window.updateQuantity = (id, change) => {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        renderCart();
    }
};

window.removeFromCart = (id) => {
    const index = cart.findIndex(item => item.id === id);
    if (index > -1) {
        cart.splice(index, 1);
        renderCart();
    }
};

// Checkout Form Handler
const shippingRegionSelect = document.getElementById('shipping');
const shippingServiceContainer = document.getElementById('shipping-service-container');
const shippingServiceSelect = document.getElementById('shipping-service');

// Handle Shipping Region Change
shippingRegionSelect.addEventListener('change', () => {
    if (shippingRegionSelect.value === 'interlocal') {
        shippingServiceContainer.style.display = 'block';
    } else {
        shippingServiceContainer.style.display = 'none';
    }
    updateTotalWithShipping(); // Helper to recalculate total
});

shippingServiceSelect.addEventListener('change', () => {
    updateTotalWithShipping();
});

function updateTotalWithShipping() {
    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let shippingCost = 0;

    if (shippingRegionSelect.value === 'interlocal') {
        const service = shippingServiceSelect.value;
        if (service === 'regular') shippingCost = 25000;
        else if (service === 'fast') shippingCost = 50000;
        else if (service === 'cargo') shippingCost = 100000;
    }
    // Local shipping is free or assume included/COD

    cartTotalPriceSpan.textContent = `Rp ${(total + shippingCost).toLocaleString('id-ID')}`;
    return { subtotal: total, shipping: shippingCost, total: total + shippingCost };
}

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const shipping = document.getElementById('shipping').value;
    const payment = document.getElementById('payment').value;

    if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
    }

    const { subtotal, shipping: shippingCost, total } = updateTotalWithShipping();

    // Prepare WhatsApp Message
    let itemsList = cart.map(item => `- ${item.name} (${item.quantity}x) @ Rp ${item.price.toLocaleString('id-ID')}`).join('%0A');

    let methodText = '';
    if (payment === 'transfer') methodText = 'Transfer Bank';
    else if (payment === 'ewallet') methodText = 'E-Wallet';
    else methodText = 'COD (Bayar di Tempat)';

    let shippingText = shipping === 'local' ? 'Dalam Daerah ( Lombok )' : `Luar Daerah (${shippingServiceSelect.options[shippingServiceSelect.selectedIndex].text})`;

    const message = `Halo Tenun Pringgasela, saya ingin memesan:%0A%0A*Data Pemesan:*%0ANama: ${name}%0AHP: ${phone}%0AAlamat: ${address}%0A%0A*Detail Pesanan:*%0A${itemsList}%0A%0A--------------------------------%0ASubtotal: Rp ${subtotal.toLocaleString('id-ID')}%0AOngkos Kirim: Rp ${shippingCost.toLocaleString('id-ID')}%0A*Total: Rp ${total.toLocaleString('id-ID')}*%0A--------------------------------%0A%0APengiriman: ${shippingText}%0AMetode Pembayaran: ${methodText}%0A%0AMohon konfirmasi pesanan ini. Terima kasih!`;

    const whatsappUrl = `https://wa.me/6282359486948?text=${message}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Reset cart
    cart.length = 0;
    renderCart();
    cartModal.classList.remove('open');
    checkoutForm.reset();
    shippingServiceContainer.style.display = 'none';
});
// HERO SLIDER AUTOMATIC
const slides = document.querySelectorAll('.hero-slider .slide');
let currentSlide = 0;
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

const slideInterval = setInterval(nextSlide, 3000);

if (slides.length > 0) {
    slides[0].classList.add('active');
}