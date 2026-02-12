/**
 * PROJECT.CD - Ultimate Golden Master Controller
 * Version: 22.0 (The Grand Final)
 */

'use strict'; 

// --- Global Helpers ---
window.mockApiDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone) => phone.length >= 8; 
const isValidBirthday = (dateStr) => {
    if (!/^\d{2}\/\d{2}$/.test(dateStr)) return false;
    const [mm, dd] = dateStr.split('/').map(Number);
    if (mm < 1 || mm > 12) return false;
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (dd < 1 || dd > daysInMonth[mm - 1]) return false;
    return true;
};

// --- Global Data & State ---
window.cartItems = [];
window.productsData = {
    'p1': { id: 'p1', title: '鳳梨酥', price: 550, images: ['images/product1.jpg'], desc: '嚴選台灣土鳳梨，經過 48 小時慢火熬煮。', ingredients: ['🇹🇼 台灣土鳳梨', '🇫🇷 依思尼奶油'], nutrition: { cal: '220 kcal', pro: '3.5 g', fat: '10.5 g', sug: '15.2 g', na: '45 mg' } },
    'p2': { id: 'p2', title: '堅果塔', price: 420, images: ['images/product2.jpg'], desc: '澳洲夏威夷豆與杏仁果的完美結合。', ingredients: ['🇦🇺 夏威夷豆', '🇨🇦 有機楓糖'], nutrition: { cal: '180 kcal', pro: '4.2 g', fat: '12.8 g', sug: '8.5 g', na: '30 mg' } },
    'p3': { id: 'p3', title: '磅蛋糕', price: 380, images: ['images/product3.jpg'], desc: '經典英式食譜，加入新鮮檸檬皮屑提香。', ingredients: ['🍋 屏東九如檸檬', '🇬🇧 伯爵茶粉'], nutrition: { cal: '250 kcal', pro: '3.0 g', fat: '14.5 g', sug: '18.0 g', na: '60 mg' } },
    'p4': { id: 'p4', title: '8吋派', price: 980, images: ['images/product4.jpg'], desc: '滿滿的新鮮富士蘋果，搭配肉桂粉與黑糖。', ingredients: ['🍎 富士蘋果', '🇱🇰 錫蘭肉桂'], nutrition: { cal: '310 kcal', pro: '4.8 g', fat: '16.2 g', sug: '22.5 g', na: '95 mg' } }
};

// --- Global Functions ---

window.showToast = function(message, iconClass = "fa-check-circle") {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas ${iconClass}" style="color: var(--color-gold-premium);"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 3500);
}

window.toggleCart = function(show) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if(show) { sidebar.classList.add('open'); overlay.classList.add('active'); }
    else { sidebar.classList.remove('open'); overlay.classList.remove('active'); }
}

window.renderCart = function() {
    const container = document.getElementById('cart-items-container');
    const badge = document.getElementById('cart-badge');
    const totalEl = document.getElementById('cart-total-price');
    
    const totalCount = window.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
    badge.classList.toggle('hidden', totalCount === 0);
    
    if (window.cartItems.length === 0) {
        container.innerHTML = '<p class="empty-msg">// 尚未載入數據</p>';
        totalEl.textContent = 'NT$ 0';
    } else {
        container.innerHTML = '';
        let total = 0;
        window.cartItems.forEach((item, index) => {
            total += item.product.price * item.quantity;
            container.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info"><span>${item.product.title}</span></div>
                    <div class="cart-item-controls">
                        <button class="qty-btn minus" onclick="updateCart(${index}, -1)">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn plus" onclick="updateCart(${index}, 1)">+</button>
                    </div>
                    <div class="cart-item-price">NT$ ${item.product.price}</div>
                    <button class="remove-btn" onclick="updateCart(${index}, 0)"><i class="fas fa-trash"></i></button>
                </div>`;
        });
        totalEl.textContent = `NT$ ${total}`;
    }
    localStorage.setItem('projectCD_cart', JSON.stringify(window.cartItems));
}

window.updateCart = function(index, change) {
    if (change === 0) window.cartItems.splice(index, 1);
    else {
        window.cartItems[index].quantity += change;
        if (window.cartItems[index].quantity <= 0) window.cartItems.splice(index, 1);
    }
    window.renderCart();
}

window.addToCart = function(id) {
    const product = window.productsData[id];
    if(!product) return;
    const exist = window.cartItems.find(i => i.product.id === id);
    if(exist) exist.quantity++; else window.cartItems.push({product, quantity: 1});
    window.renderCart();
    window.showToast(`已將 ${product.title} 加入收藏`, 'fa-shopping-bag');
}

window.openProductModal = function(id) {
    const data = window.productsData[id];
    if(!data) return;

    document.getElementById('modal-title').textContent = data.title;
    document.getElementById('modal-price').textContent = `NT$ ${data.price}`;
    document.getElementById('modal-desc').textContent = data.desc;
    document.getElementById('mobile-sticky-price').textContent = `NT$ ${data.price}`;
    
    const ingContainer = document.getElementById('modal-ingredients');
    ingContainer.innerHTML = '';
    data.ingredients.forEach(ing => {
        const pill = document.createElement('div');
        pill.className = 'ing-pill'; pill.textContent = ing;
        ingContainer.appendChild(pill);
    });

    if(data.nutrition) {
        document.getElementById('nut-cal').textContent = data.nutrition.cal;
    }

    const track = document.getElementById('gallery-track');
    const indicators = document.getElementById('gallery-indicators');
    track.innerHTML = ''; indicators.innerHTML = '';
    const imgs = data.images.length ? data.images : [data.img];
    imgs.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src; img.className = 'gallery-slide'; img.onerror = function(){this.src='images/product1.jpg'};
        track.appendChild(img);
        const dot = document.createElement('div');
        dot.className = `gallery-dot ${i===0?'active':''}`;
        dot.onclick = () => {
            track.style.transform = `translateX(-${i*100}%)`;
            document.querySelectorAll('.gallery-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        };
        indicators.appendChild(dot);
    });
    track.style.transform = `translateX(0)`;

    const deskBtn = document.getElementById('modal-add-btn-desktop');
    const mobileBtn = document.getElementById('modal-add-btn-mobile');
    const addHandler = () => { window.addToCart(id); window.closeProductModal(); };
    
    deskBtn.onclick = addHandler;
    mobileBtn.onclick = addHandler;
    
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeProductModal = function() { 
    document.getElementById('product-modal').classList.remove('active'); 
    document.body.style.overflow = ''; 
}

window.toggleLegalInfo = function(el) {
    el.classList.toggle('active');
    const content = el.nextElementSibling;
    if (content.style.maxHeight) { content.style.maxHeight = null; content.classList.remove('open'); } 
    else { content.classList.add('open'); content.style.maxHeight = content.scrollHeight + "px"; }
}

window.openLegal = function(type) {
    const legalModal = document.getElementById('legal-modal');
    document.getElementById('content-terms').classList.add('hidden');
    document.getElementById('content-privacy').classList.add('hidden');
    if(type === 'terms') document.getElementById('content-terms').classList.remove('hidden');
    if(type === 'privacy') document.getElementById('content-privacy').classList.remove('hidden');
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.closeLegalModal = function() {
    document.getElementById('legal-modal').classList.remove('active');
    document.body.style.overflow = '';
}

window.toggleAuth = function(show) {
    const modal = document.getElementById('auth-modal');
    if(show) modal.classList.add('active');
    else modal.classList.remove('active');
}

window.toggleDashboard = function(show) {
    const modal = document.getElementById('dashboard-modal');
    if(show) modal.classList.add('active');
    else modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {

    /* 1. Global Animations */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in-up, .offset-item').forEach(el => observer.observe(el));

    /* 2. Titanium Card 3D */
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
                    reflection.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.2), transparent 60%)`;
                    reflection.style.opacity = 1;
                }
            });
        });
        cardContainer.addEventListener('mouseleave', () => { 
            gsap.to(card, { duration: 1, rotateX: 0, rotateY: 0, ease: 'elastic.out(1, 0.5)' }); 
            if(reflection) reflection.style.opacity = 0;
        });
    }

    /* 3. Flux & Magnetic Buttons */
    document.querySelectorAll('.flux-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if(btn.disabled) return;
            const rect = btn.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            const light = btn.querySelector('.flux-light');
            if(light) { light.style.setProperty('--x', `${x}%`); light.style.setProperty('--y', `${y}%`); }
        });
    });

    document.querySelectorAll('.magnetic-icon, .nav-link').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                const rect = btn.getBoundingClientRect();
                const strength = 0.4;
                gsap.to(btn, { duration: 0.3, x: (e.clientX - rect.left - rect.width / 2) * strength, y: (e.clientY - rect.top - rect.height / 2) * strength, ease: 'power2.out' });
            });
        });
        btn.addEventListener('mouseleave', () => { gsap.to(btn, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' }); });
    });

    /* 4. Navbar & Intro */
    setTimeout(() => { document.getElementById('entry-layer').classList.add('gate-fade-out'); document.getElementById('navbar').classList.remove('navbar-hidden'); }, 800);
    
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
        if (st > lastScrollTop && st > 100) navbar.classList.add('navbar-hidden'); else navbar.classList.remove('navbar-hidden');
        lastScrollTop = st <= 0 ? 0 : st;
    });

    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger) {
        hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); mobileMenu.classList.toggle('active'); });
        document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('active'); mobileMenu.classList.remove('active'); }));
    }

    const unlockAudio = () => {
        const bgMusic = document.getElementById('bg-music');
        if(bgMusic && bgMusic.paused) { bgMusic.volume = 0.3; bgMusic.play().catch(() => {}); }
        document.body.removeEventListener('click', unlockAudio);
    };
    document.body.addEventListener('click', unlockAudio, { once: true });

    /* 5. Sweets Carousel (Reset Logic) */
    const track = document.getElementById('sweets-track');
    const carouselContainer = document.querySelector('.carousel-container');
    if (track && carouselContainer) {
        const allCards = track.querySelectorAll('.carousel-card');
        const updateCenter = () => {
            const containerWidth = carouselContainer.offsetWidth;
            const scrollX = carouselContainer.scrollLeft;
            const centerPoint = scrollX + (containerWidth / 2);
            let minDistance = Infinity;
            let closestCard = null;
            allCards.forEach(card => {
                card.classList.remove('active-card');
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                const dist = Math.abs(centerPoint - cardCenter);
                if (dist < minDistance) { minDistance = dist; closestCard = card; }
            });
            if (closestCard) closestCard.classList.add('active-card');
            
            const lastCard = allCards[allCards.length - 1];
            const lastCardCenter = lastCard.offsetLeft + (lastCard.offsetWidth / 2);
            if (centerPoint > lastCardCenter + 150) {
                gsap.to(carouselContainer, { scrollLeft: 0, duration: 1.5, ease: "power3.inOut" });
            }
        };
        let isScrolling;
        carouselContainer.addEventListener('scroll', () => {
            window.cancelAnimationFrame(isScrolling);
            isScrolling = window.requestAnimationFrame(updateCenter);
        });
        setTimeout(updateCenter, 100);
    }

    /* 6. Contact Form */
    const msgInput = document.getElementById('contact-msg-input');
    if (msgInput) {
        msgInput.addEventListener('input', function() {
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px'; 
        });
    }

    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('contact-phone-input').value;
            if(!isValidPhone(phone)) return window.showToast("聯絡電話格式錯誤", "fa-exclamation-circle");
            
            const submitBtn = document.getElementById('contact-submit-btn');
            if (submitBtn.classList.contains('is-loading')) return;
            
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            submitBtn.classList.add('is-loading');
            btnText.textContent = "傳輸中...";
            await mockApiDelay(1200); 
            
            submitBtn.classList.remove('is-loading');
            submitBtn.classList.add('is-success');
            btnText.innerHTML = '<i class="fas fa-check"></i> 訊息已送出';
            window.showToast('已收到您的訊息，我們將盡快聯繫您。', 'fa-envelope-open-text');
            
            setTimeout(() => {
                contactForm.reset();
                if(msgInput) msgInput.style.height = 'auto'; 
                submitBtn.classList.remove('is-success');
                btnText.textContent = originalText;
                submitBtn.querySelector('.btn-progress-bar').style.transition = 'none';
                submitBtn.querySelector('.btn-progress-bar').style.width = '0';
                setTimeout(() => { submitBtn.querySelector('.btn-progress-bar').style.transition = ''; }, 50);
            }, 3000);
        });
    }

    /* 7. Cart Init */
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.addEventListener('click', (e) => { e.preventDefault(); window.toggleCart(true); });
    
    const legalCheck = document.getElementById('legal-agree-check');
    const checkoutBtn = document.getElementById('go-checkout');
    if (legalCheck && checkoutBtn) {
        legalCheck.addEventListener('change', function() {
            checkoutBtn.disabled = !this.checked;
            checkoutBtn.querySelector('.btn-text').textContent = this.checked ? "前往結帳" : "請先同意條款";
        });
        checkoutBtn.addEventListener('click', () => { window.showToast("系統將轉導至第三方支付...", "fa-credit-card"); });
    }
    
    const savedCart = localStorage.getItem('projectCD_cart');
    if (savedCart) { window.cartItems = JSON.parse(savedCart); window.renderCart(); }

    /* 8. Auth Logic */
    let isLoggedIn = false;
    document.querySelectorAll('.nav-user-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if(isLoggedIn) window.toggleDashboard(true); else window.toggleAuth(true);
        });
    });

    const authForm = document.getElementById('auth-form');
    if(authForm) {
        const bdayInput = document.getElementById('auth-birthday-input');
        if(bdayInput) {
            bdayInput.addEventListener('input', function() {
                let val = this.value.replace(/\D/g, ''); 
                if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                this.value = val;
            });
        }

        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('auth-phone-input').value;
            const bday = document.getElementById('auth-birthday-input').value;
            if(!isValidMobile(phone)) return window.showToast("手機號碼格式錯誤", "fa-exclamation-circle");
            if(!isValidBirthday(bday)) return window.showToast("生日格式錯誤", "fa-exclamation-circle");

            const submitBtn = document.getElementById('auth-submit-btn');
            if (submitBtn.classList.contains('is-loading')) return;

            const name = document.getElementById('auth-name-input').value;
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;
            
            submitBtn.classList.add('is-loading');
            btnText.textContent = "驗證中...";
            await mockApiDelay(1200);
            
            isLoggedIn = true;
            submitBtn.classList.remove('is-loading');
            submitBtn.classList.add('is-success');
            btnText.innerHTML = '<i class="fas fa-check"></i>';
            
            document.getElementById('auth-glass-panel').style.opacity = '0';
            document.getElementById('auth-success-circle').classList.add('show');
            const navCrown = document.getElementById('nav-crown-icon');
            if(navCrown) navCrown.classList.add('nav-crown-glow');
            document.getElementById('dash-name').textContent = name;
            
            const vipCenter = document.getElementById('vip-center-text');
            const vipLeft = document.getElementById('vip-bottom-left');
            const vipRight = document.getElementById('vip-bottom-right');
            const vipBtn = document.getElementById('vip-btn-text');
            if(vipCenter) { vipCenter.textContent = name; vipCenter.style.letterSpacing = "2px"; }
            if(vipLeft) vipLeft.textContent = "PROJECT.VIP";
            if(vipRight) vipRight.textContent = "CD-0001";
            if(vipBtn) vipBtn.textContent = "歡迎回到 您的維度";
            
            const histContainer = document.getElementById('dashboard-history-list');
            histContainer.innerHTML = `
                <div class="history-item"><span class="date">2026.02.11</span><span class="product">鳳梨酥 禮盒</span><span class="qty-pill">x 2</span><span class="price text-gold">NT$ 1,100</span></div>
                <div class="history-item"><span class="date">2026.01.05</span><span class="product">堅果塔</span><span class="qty-pill">x 1</span><span class="price text-gold">NT$ 420</span></div>
            `;
            document.getElementById('dash-total-spent').textContent = 'NT$ 1,520';

            setTimeout(() => {
                window.toggleAuth(false);
                setTimeout(() => {
                    document.getElementById('auth-glass-panel').style.opacity = '1';
                    document.getElementById('auth-success-circle').classList.remove('show');
                    submitBtn.classList.remove('is-success');
                    btnText.textContent = originalText;
                    submitBtn.querySelector('.btn-progress-bar').style.transition = 'none';
                    submitBtn.querySelector('.btn-progress-bar').style.width = '0';
                    setTimeout(() => { submitBtn.querySelector('.btn-progress-bar').style.transition = ''; }, 50);
                    authForm.reset();
                }, 500);
            }, 1500);
        });
    }

    document.getElementById('logout-btn')?.addEventListener('click', () => {
        isLoggedIn = false;
        window.toggleDashboard(false);
        const navCrown = document.getElementById('nav-crown-icon');
        if(navCrown) navCrown.classList.remove('nav-crown-glow');
        document.getElementById('vip-center-text').textContent = "WELCOME";
        document.getElementById('vip-bottom-left').textContent = "PROJECT.CD";
        document.getElementById('vip-bottom-right').textContent = "CD - - - -";
        document.getElementById('vip-btn-text').textContent = "申請加入會員";
        window.showToast("已登出您的維度");
    });
});