'use strict'; 

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================= */
    /* ★ 輪播系統 (New) ★ */
    /* ========================================= */
    
    // 1. 首頁滿版輪播 (Hero Slider)
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentHeroIndex = 0;
    
    if (heroSlides.length > 0) {
        setInterval(() => {
            heroSlides[currentHeroIndex].classList.remove('active');
            currentHeroIndex = (currentHeroIndex + 1) % heroSlides.length;
            heroSlides[currentHeroIndex].classList.add('active');
        }, 3000); // 3秒換圖
    }

    // 2. 品牌卡片輪播 (Card Sliders)
    // 通用函數：啟動指定容器內的圖片輪播
    function startCardSlider(containerId, intervalTime) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const slides = container.querySelectorAll('.frame-img');
        if (slides.length <= 1) return;

        let currentIndex = 0;
        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, intervalTime);
    }

    // 啟動左側人物輪播 (3秒)
    startCardSlider('about-slider-left', 3000);
    // 啟動右側品牌輪播 (4秒，錯開節奏)
    startCardSlider('about-slider-right', 4000);


    /* ========================================= */
    /* 原有功能邏輯 (保持不變) */
    /* ========================================= */

    /* 1. 閘門式迎賓邏輯 */
    const gateOverlay = document.getElementById('entry-layer');
    const gateActionBtn = document.getElementById('gate-action-btn');
    const bgMusic = document.getElementById('bg-music');
    
    if (gateActionBtn) {
        gateActionBtn.addEventListener('click', () => {
            gateOverlay.classList.add('open');
            if(bgMusic) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(e => console.log("Audio Autoplay blocked:", e));
            }
        });
    }

    /* 2. 導覽列滾動邏輯 */
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    });

    /* 3. 漢堡選單 */
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

    /* 4. 購物車邏輯 */
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
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.product.title}</span>
                    </div>
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
            
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => decreaseQuantity(e.target.dataset.index));
            });
            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => increaseQuantity(e.target.dataset.index));
            });
            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => removeItem(e.target.closest('.remove-btn').dataset.index));
            });
        }
    }

    window.addToCart = function(productId) {
        let product = productsData[productId];
        if (!product) return;
        const existingItem = cartItems.find(item => item.product.id === product.id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push({ product: product, quantity: 1 });
        }
        renderCart(); 
        toggleCart(true);
    };
    
    function increaseQuantity(index) {
        cartItems[index].quantity++;
        renderCart();
    }
    function decreaseQuantity(index) {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
        } else {
            cartItems.splice(index, 1);
        }
        renderCart();
    }
    function removeItem(index) {
        cartItems.splice(index, 1);
        renderCart();
    }

    renderCart();

    function toggleCart(show) {
        if (show) { 
            cartSidebar.classList.add('open'); 
            cartOverlay.classList.add('active'); 
        } else { 
            cartSidebar.classList.remove('open'); 
            cartOverlay.classList.remove('active'); 
        }
    }

    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                alert("購物車是空的喔！");
                return;
            }
            window.open('https://docs.google.com/forms/u/0/', '_blank');
        });
    }

    /* 5. 產品 Modal */
    const productModal = document.getElementById('product-modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalAddBtn = document.getElementById('modal-add-btn');

    window.openProductModal = function(id) {
        const data = productsData[id];
        if (data) {
            modalImg.src = data.img;
            modalTitle.textContent = data.title;
            modalPrice.textContent = `NT$ ${data.price}`;
            modalDesc.textContent = data.desc;
            modalAddBtn.onclick = function() {
                window.addToCart(data.id);
                window.closeProductModal();
            };
            productModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    window.closeProductModal = function() {
        productModal.classList.remove('active');
        document.body.style.overflow = ''; 
    }
});