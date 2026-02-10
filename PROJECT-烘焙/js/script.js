/**
 * PROJECT.CD - Official Website Script
 * Version: 6.0 (Ultra-Wide Optimized)
 */

'use strict'; 

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Intersection Observer */
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    const animateElements = document.querySelectorAll('.fade-in-up, .magazine-item, .museum-card, .titanium-card-container, .contact-tactile-wrapper, .vip-benefits, .join-member-btn, .section-header-wrapper, .footer-grid');
    animateElements.forEach(el => observer.observe(el));

    /* 2. 3D Titanium Card */
    const card = document.getElementById('titanium-card');
    const cardContainer = document.querySelector('.titanium-card-container');
    const reflection = document.querySelector('.card-reflection');
    if (card && cardContainer) {
        cardContainer.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = cardContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;
                gsap.to(card, { duration: 0.5, rotateX: rotateX, rotateY: rotateY, transformPerspective: 1000, ease: 'power2.out' });
                if(reflection) {
                    const percentX = (x / rect.width) * 100;
                    const percentY = (y / rect.height) * 100;
                    reflection.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.2), transparent 60%)`;
                    reflection.style.opacity = 1;
                }
            });
        });
        cardContainer.addEventListener('mouseleave', () => {
            gsap.to(card, { duration: 1, rotateX: 0, rotateY: 0, ease: 'elastic.out(1, 0.5)' });
            if(reflection) reflection.style.opacity = 0;
        });
    }

    /* 3. Magnetic Buttons */
    const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-btn-small, .magnetic-icon, .magnetic-text');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const strength = btn.classList.contains('magnetic-btn-small') ? 0.3 : 0.5;
                gsap.to(btn, { duration: 0.3, x: x * strength, y: y * strength, ease: 'power2.out' });
            });
        });
        btn.addEventListener('mouseleave', () => { gsap.to(btn, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' }); });
    });

    /* 4. Core UI Logic */
    const gateOverlay = document.getElementById('entry-layer');
    const gateActionBtn = document.getElementById('gate-action-btn');
    const bgMusic = document.getElementById('bg-music');
    if (gateActionBtn) {
        gateActionBtn.addEventListener('click', () => {
            gateOverlay.classList.add('gate-slide-up');
            if(bgMusic) { bgMusic.volume = 0.5; bgMusic.play().catch(e => console.log("Audio Blocked")); }
        });
    }
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
        if (scrollTop > lastScrollTop && scrollTop > 100) navbar.classList.add('navbar-hidden'); else navbar.classList.remove('navbar-hidden');
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    });
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu'); 
    const mobileNavLinks = document.querySelectorAll('.nav-links-text .nav-link');
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    /* 5. Shopping Cart Logic */
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('go-checkout');
    
    let cartItems = [];
    const productsData = {
        'p1': { id: 'p1', title: '鳳梨酥', price: 550, img: 'images/product1.jpg', desc: '嚴選台灣土鳳梨，經過 48 小時慢火熬煮。' },
        'p2': { id: 'p2', title: '堅果塔', price: 420, img: 'images/product2.jpg', desc: '澳洲夏威夷豆與杏仁果的完美結合。' },
        'p3': { id: 'p3', title: '磅蛋糕', price: 380, img: 'images/product3.jpg', desc: '經典英式食譜，加入新鮮檸檬皮屑提香。' },
        'p4': { id: 'p4', title: '8吋派', price: 980, img: 'images/product4.jpg', desc: '滿滿的新鮮富士蘋果，搭配肉桂粉。' }
    };

    function loadCart() { const savedCart = localStorage.getItem('projectCD_cart'); if (savedCart) { cartItems = JSON.parse(savedCart); renderCart(); } }
    function saveCart() { localStorage.setItem('projectCD_cart', JSON.stringify(cartItems)); }
    function showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle" style="color: #4cd964;"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 3000);
    }
    function renderCart() {
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalCount;
        if (cartItems.length === 0) {
            cartBadge.classList.add('hidden');
            cartItemsContainer.innerHTML = '<p class="empty-msg">// 尚未載入數據</p>';
            cartTotalPrice.textContent = 'NT$ 0';
        } else {
            cartBadge.classList.remove('hidden');
            cartItemsContainer.innerHTML = ''; 
            let total = 0;
            cartItems.forEach((item, index) => {
                total += item.product.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div class="cart-item-info"><span class="cart-item-name">${item.product.title}</span></div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" data-index="${index}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item-price">NT$ ${item.product.price}</div>
                    <button class="remove-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
            cartTotalPrice.textContent = `NT$ ${total}`;
            document.querySelectorAll('.qty-btn.minus').forEach(btn => btn.addEventListener('click', (e) => decreaseQuantity(e.target.dataset.index)));
            document.querySelectorAll('.qty-btn.plus').forEach(btn => btn.addEventListener('click', (e) => increaseQuantity(e.target.dataset.index)));
            document.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', (e) => removeItem(e.target.closest('.remove-btn').dataset.index)));
        }
        saveCart();
    }
    window.addToCart = function(productId) {
        let product = productsData[productId];
        if (!product) return;
        const existingItem = cartItems.find(item => item.product.id === product.id);
        if (existingItem) existingItem.quantity++; else cartItems.push({ product: product, quantity: 1 });
        renderCart(); 
        cartBtn.classList.add('bounce'); setTimeout(() => cartBtn.classList.remove('bounce'), 600);
        showToast(`已將 ${product.title} 加入收藏`);
    };
    function increaseQuantity(index) { cartItems[index].quantity++; renderCart(); }
    function decreaseQuantity(index) { if (cartItems[index].quantity > 1) cartItems[index].quantity--; else cartItems.splice(index, 1); renderCart(); }
    function removeItem(index) { cartItems.splice(index, 1); renderCart(); }
    function toggleCart(show) { if (show) { cartSidebar.classList.add('open'); cartOverlay.classList.add('active'); } else { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('active'); } }
    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { if (cartItems.length === 0) { alert("購物車是空的喔！"); return; } window.open('https://docs.google.com/forms/u/0/', '_blank'); });
    loadCart();

    /* 6. Product Modal */
    const productModal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalAddBtn = document.getElementById('modal-add-btn');
    window.openProductModal = function(id) {
        const data = productsData[id];
        if (data) {
            modalImg.src = data.img; modalTitle.textContent = data.title; modalPrice.textContent = `NT$ ${data.price}`; modalDesc.textContent = data.desc;
            modalAddBtn.onclick = function() { window.addToCart(data.id); window.closeProductModal(); };
            productModal.classList.add('active'); document.body.style.overflow = 'hidden';
        }
    }
    window.closeProductModal = function() { productModal.classList.remove('active'); document.body.style.overflow = ''; }
});