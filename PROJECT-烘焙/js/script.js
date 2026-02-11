/**
 * PROJECT.CD - Master Controller
 * Version: 12.1 (Hotfix: Login Freeze Fix)
 */

'use strict'; 

const mockApiDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidMobile = (phone) => /^09\d{8}$/.test(phone); 
const isValidPhone = (phone) => /^[\d\-\(\)\s]{8,20}$/.test(phone); 
const isValidBirthday = (dateStr) => {
    if (!/^\d{2}\/\d{2}$/.test(dateStr)) return false;
    const [mm, dd] = dateStr.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd < 1 || dd > daysInMonth[mm - 1]) return false;
    return true;
};

document.addEventListener('DOMContentLoaded', () => {

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, observerOptions);
    document.querySelectorAll('.fade-in-up, .magazine-item, .museum-card, .titanium-card-container, .contact-tactile-wrapper, .join-member-btn, .section-header-wrapper, .footer-grid').forEach(el => observer.observe(el));

    const card = document.getElementById('titanium-card');
    const cardContainer = document.querySelector('.titanium-card-container');
    const reflection = document.querySelector('.card-reflection');
    if (card && cardContainer) {
        cardContainer.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = cardContainer.getBoundingClientRect();
                const x = e.clientX - rect.left, y = e.clientY - rect.top;
                const centerX = rect.width / 2, centerY = rect.height / 2;
                gsap.to(card, { duration: 0.5, rotateX: ((y - centerY) / centerY) * -10, rotateY: ((x - centerX) / centerX) * 10, transformPerspective: 1000, force3D: true, ease: 'power2.out' });
                if(reflection) {
                    const percentX = (x / rect.width) * 100, percentY = (y / rect.height) * 100;
                    reflection.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.2), transparent 60%)`;
                    reflection.style.opacity = 1;
                }
            });
        });
        cardContainer.addEventListener('mouseleave', () => { 
            gsap.to(card, { duration: 1, rotateX: 0, rotateY: 0, force3D: true, ease: 'elastic.out(1, 0.5)' }); 
            if(reflection) reflection.style.opacity = 0;
        });
    }

    const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-btn-small, .magnetic-icon, .magnetic-text');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
                const strength = btn.classList.contains('magnetic-btn-small') ? 0.3 : 0.5;
                gsap.to(btn, { duration: 0.3, x: x * strength, y: y * strength, ease: 'power2.out' });
            });
        });
        btn.addEventListener('mouseleave', () => { gsap.to(btn, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' }); });
    });

    const gateOverlay = document.getElementById('entry-layer');
    const navbar = document.getElementById('navbar');
    
    const checkScroll = () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
    };

    window.addEventListener('load', () => {
        setTimeout(() => {
            gateOverlay.classList.add('gate-fade-out');
            navbar.classList.remove('navbar-hidden');
            checkScroll(); 
        }, 800);
    });

    const unlockAudio = () => {
        const bgMusic = document.getElementById('bg-music');
        if(bgMusic && bgMusic.paused) { bgMusic.volume = 0.3; bgMusic.play().catch(e => console.log("Audio blocked")); }
        document.body.removeEventListener('click', unlockAudio);
        document.body.removeEventListener('touchstart', unlockAudio);
    };
    document.body.addEventListener('click', unlockAudio, { once: true });
    document.body.addEventListener('touchstart', unlockAudio, { once: true });

    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        checkScroll();
        if (st > lastScrollTop && st > 100) { navbar.classList.add('navbar-hidden'); } else { navbar.classList.remove('navbar-hidden'); }
        lastScrollTop = st <= 0 ? 0 : st; 
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

    function showToast(message, iconClass = "fa-check-circle") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas ${iconClass}" style="color: var(--color-gold-premium);"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 3500);
    }

    /* ✨ MVP 登入系統 */
    const authModal = document.getElementById('auth-modal');
    const dashboardModal = document.getElementById('dashboard-modal');
    const navUserBtn = document.getElementById('nav-user-btn'); 
    const navCrownIcon = document.getElementById('nav-crown-icon'); 
    const vipActionBtn = document.getElementById('vip-action-btn'); 
    const birthdayInput = document.getElementById('auth-birthday-input');
    
    let isLoggedIn = false;
    let currentUser = { name: "", code: "CD-0001", totalSpent: 2620, history: [] };

    currentUser.history = [
        { date: "2026.02.11", name: "鳳梨酥 禮盒", qty: 2, price: "1,100" },
        { date: "2026.02.10", name: "8吋派", qty: 1, price: "980" },
        { date: "2026.01.05", name: "堅果塔", qty: 1, price: "540" }
    ];

    const toggleModal = (modalEl, show) => {
        if (show) {
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            modalEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    navUserBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) toggleModal(dashboardModal, true);
        else toggleModal(authModal, true);
    });

    vipActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isLoggedIn) toggleModal(dashboardModal, true);
        else toggleModal(authModal, true);
    });

    document.getElementById('close-auth')?.addEventListener('click', () => toggleModal(authModal, false));
    document.getElementById('close-dashboard')?.addEventListener('click', () => toggleModal(dashboardModal, false));
    authModal.addEventListener('click', (e) => { if(e.target === authModal) toggleModal(authModal, false); });
    dashboardModal.addEventListener('click', (e) => { if(e.target === dashboardModal) toggleModal(dashboardModal, false); });

    if (birthdayInput) {
        birthdayInput.addEventListener('input', function (e) {
            let val = this.value.replace(/\D/g, ''); 
            if (val.length >= 3) {
                val = val.substring(0, 2) + '/' + val.substring(2, 4);
            }
            this.value = val;
        });
    }

    const authForm = document.getElementById('auth-form');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    
    if (authForm && authSubmitBtn) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('auth-email-input');
            const phoneInput = document.getElementById('auth-phone-input');
            
            if (!isValidMobile(phoneInput.value.trim())) {
                showToast("手機號碼格式錯誤 (請輸入 09 開頭 10 碼數字)", "fa-exclamation-circle");
                phoneInput.focus();
                return;
            }
            if (!isValidEmail(emailInput.value.trim())) {
                showToast("電子信箱格式錯誤", "fa-exclamation-circle");
                emailInput.focus();
                return;
            }
            if (!isValidBirthday(birthdayInput.value.trim())) {
                showToast("誕生之日格式錯誤 (正確範例：02/11)", "fa-exclamation-circle");
                birthdayInput.focus();
                return; 
            }

            const userNameInput = document.getElementById('auth-name-input').value.trim();
            currentUser.name = userNameInput;
            
            const inputs = authForm.querySelectorAll('input');
            inputs.forEach(input => input.disabled = true);
            
            authSubmitBtn.classList.add('is-loading');
            await mockApiDelay(1200);
            
            authSubmitBtn.classList.remove('is-loading');
            authSubmitBtn.classList.add('is-success');
            authSubmitBtn.innerHTML = '<i class="fas fa-check"></i>';
            await mockApiDelay(300);
            
            document.getElementById('auth-glass-panel').style.opacity = '0';
            document.getElementById('auth-success-circle').classList.add('show');
            
            isLoggedIn = true;
            
            navCrownIcon.classList.add('nav-crown-glow');
            
            // ✨ 修復點：使用正確的黑卡元素 ID
            const vipCenterText = document.getElementById('vip-center-text');
            const vipBottomLeft = document.getElementById('vip-bottom-left');
            const vipBottomRight = document.getElementById('vip-bottom-right');
            
            vipCenterText.style.opacity = 0;
            vipBottomLeft.style.opacity = 0;
            vipBottomRight.style.opacity = 0;
            
            setTimeout(() => {
                // 登入後狀態：中央顯示姓名，左下 PROJECT.VIP，右下顯示代碼
                vipCenterText.textContent = currentUser.name;
                vipCenterText.style.letterSpacing = "2px";
                vipBottomLeft.innerHTML = "PROJECT.VIP";
                vipBottomRight.textContent = currentUser.code;
                
                vipCenterText.style.opacity = 1;
                vipBottomLeft.style.opacity = 1;
                vipBottomRight.style.opacity = 1;
            }, 500);
            
            vipActionBtn.querySelector('.btn-text').textContent = "我的專屬維度";
            
            document.getElementById('dash-name').textContent = currentUser.name;
            document.getElementById('dash-total-spent').textContent = `NT$ 2,620`;
            
            const historyContainer = document.getElementById('dashboard-history-list');
            historyContainer.innerHTML = '';
            currentUser.history.forEach(item => {
                historyContainer.innerHTML += `
                    <div class="history-item">
                        <span class="date">${item.date}</span>
                        <span class="product">${item.name}</span>
                        <span class="qty-pill">x ${item.qty}</span>
                        <span class="price text-gold">NT$ ${item.price}</span>
                    </div>
                `;
            });
            
            await mockApiDelay(2000);
            toggleModal(authModal, false); 
            
            setTimeout(() => {
                authForm.reset();
                inputs.forEach(input => input.disabled = false);
                authSubmitBtn.classList.remove('is-success');
                authSubmitBtn.innerHTML = '<span class="btn-text">確認開啟</span>';
                document.getElementById('auth-glass-panel').style.opacity = '1';
                document.getElementById('auth-success-circle').classList.remove('show');
            }, 600);
        });
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        isLoggedIn = false;
        toggleModal(dashboardModal, false);
        
        navCrownIcon.classList.remove('nav-crown-glow');
        
        // ✨ 修復點：使用正確的黑卡元素 ID
        const vipCenterText = document.getElementById('vip-center-text');
        const vipBottomLeft = document.getElementById('vip-bottom-left');
        const vipBottomRight = document.getElementById('vip-bottom-right');
        
        vipCenterText.style.opacity = 0;
        vipBottomLeft.style.opacity = 0;
        vipBottomRight.style.opacity = 0;
        
        setTimeout(() => {
            // 登出後狀態：恢復為初始 Welcome 狀態
            vipCenterText.textContent = "WELCOME";
            vipCenterText.style.letterSpacing = "6px";
            vipBottomLeft.innerHTML = "PROJECT.CD"; 
            vipBottomRight.textContent = "CD - - - -";
            
            vipCenterText.style.opacity = 1;
            vipBottomLeft.style.opacity = 1;
            vipBottomRight.style.opacity = 1;
        }, 500);
        
        vipActionBtn.querySelector('.btn-text').textContent = "加入會員";
        showToast("已登出您的維度", "fa-info-circle");
    });

    const contactForm = document.getElementById('contact-form');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    if (contactForm && contactSubmitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            const emailInput = document.getElementById('contact-email-input');
            const phoneInput = document.getElementById('contact-phone-input');
            
            if (!isValidPhone(phoneInput.value.trim())) {
                showToast("聯絡電話格式錯誤", "fa-exclamation-circle");
                phoneInput.focus();
                return;
            }
            if (!isValidEmail(emailInput.value.trim())) {
                showToast("電子信箱格式錯誤", "fa-exclamation-circle");
                emailInput.focus();
                return;
            }

            const inputs = contactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => input.disabled = true); 
            
            contactSubmitBtn.classList.add('is-loading');
            await mockApiDelay(1500); 
            
            contactSubmitBtn.classList.remove('is-loading');
            contactSubmitBtn.classList.add('is-success');
            contactSubmitBtn.innerHTML = '<i class="fas fa-check"></i> <span style="margin-left:8px; font-weight:400; letter-spacing:2px;">已送達</span>';
            
            showToast("已收到您的訊息。我們將於 24 小時內開啟這場味覺對話。", "fa-envelope-open-text");
            
            await mockApiDelay(3000);
            contactForm.reset();
            inputs.forEach(input => input.disabled = false);
            contactSubmitBtn.classList.remove('is-success');
            contactSubmitBtn.innerHTML = '<span class="btn-text">發送訊息</span> <i class="fas fa-paper-plane btn-icon" style="margin-left: 8px;"></i>';
        });
    }

    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    let cartItems = [];
    const productsData = {
        'p1': { id: 'p1', title: '鳳梨酥', price: 550, img: 'images/product1.jpg', desc: '嚴選台灣土鳳梨，經過 48 小時慢火熬煮。' },
        'p2': { id: 'p2', title: '堅果塔', price: 420, img: 'images/product2.jpg', desc: '澳洲夏威夷豆與杏仁果的完美結合。' },
        'p3': { id: 'p3', title: '磅蛋糕', price: 380, img: 'images/product3.jpg', desc: '經典英式食譜，加入新鮮檸檬皮屑提香。' },
        'p4': { id: 'p4', title: '8吋派', price: 980, img: 'images/product4.jpg', desc: '滿滿的新鮮富士蘋果，搭配肉桂粉。' }
    };
    function loadCart() { const savedCart = localStorage.getItem('projectCD_cart'); if (savedCart) { cartItems = JSON.parse(savedCart); renderCart(); } }
    function saveCart() { localStorage.setItem('projectCD_cart', JSON.stringify(cartItems)); }
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
                itemEl.innerHTML = `<div class="cart-item-info"><span class="cart-item-name">${item.product.title}</span></div><div class="cart-item-controls"><button class="qty-btn minus" data-index="${index}">-</button><span class="cart-item-qty">${item.quantity}</span><button class="qty-btn plus" data-index="${index}">+</button></div><div class="cart-item-price">NT$ ${item.product.price}</div><button class="remove-btn" data-index="${index}"><i class="fas fa-trash"></i></button>`;
                cartItemsContainer.appendChild(itemEl);
            });
            cartTotalPrice.textContent = `NT$ ${total}`;
            document.querySelectorAll('.qty-btn.minus').forEach(btn => btn.addEventListener('click', (e) => { if (cartItems[e.target.dataset.index].quantity > 1) cartItems[e.target.dataset.index].quantity--; else cartItems.splice(e.target.dataset.index, 1); renderCart(); }));
            document.querySelectorAll('.qty-btn.plus').forEach(btn => btn.addEventListener('click', (e) => { cartItems[e.target.dataset.index].quantity++; renderCart(); }));
            document.querySelectorAll('.remove-btn').forEach(btn => btn.addEventListener('click', (e) => { cartItems.splice(e.target.closest('.remove-btn').dataset.index, 1); renderCart(); }));
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
        showToast(`已將 ${product.title} 加入收藏`, "fa-shopping-bag");
    };
    function toggleCart(show) { if (show) { cartSidebar.classList.add('open'); cartOverlay.classList.add('active'); } else { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('active'); } }
    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
    loadCart();

    const productModal = document.getElementById('product-modal');
    window.openProductModal = function(id) {
        const data = productsData[id];
        if (data) {
            document.getElementById('modal-img').src = data.img; document.getElementById('modal-title').textContent = data.title; document.getElementById('modal-price').textContent = `NT$ ${data.price}`; document.getElementById('modal-desc').textContent = data.desc;
            document.getElementById('modal-add-btn').onclick = function() { window.addToCart(data.id); window.closeProductModal(); };
            productModal.classList.add('active'); document.body.style.overflow = 'hidden';
        }
    }
    window.closeProductModal = function() { productModal.classList.remove('active'); document.body.style.overflow = ''; }
});