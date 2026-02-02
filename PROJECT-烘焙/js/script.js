'use strict'; 

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================= */
    /* 1. 閘門式迎賓邏輯 (Gate Reveal) */
    /* ========================================= */
    const gateOverlay = document.getElementById('entry-layer');
    const enterBtn = document.getElementById('btn-enter');
    const bgMusic = document.getElementById('bg-music');
    
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // 加上 open 類別觸發 CSS 開門動畫
            gateOverlay.classList.add('open');
            
            // 嘗試播放背景音樂
            if(bgMusic) {
                bgMusic.volume = 0.5;
                bgMusic.play().catch(e => console.log("Audio Autoplay blocked:", e));
            }
        });
    }

    /* ========================================= */
    /* 2. 導覽列滾動邏輯 (Scroll & Hide) */
    /* ========================================= */
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 變色邏輯：滾動超過 50px 變深色背景
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // 隱藏邏輯：往下滾隱藏，往上滾顯示
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.classList.add('navbar-hidden');
        } else {
            navbar.classList.remove('navbar-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
    });

    /* ========================================= */
    /* 3. 漢堡選單 (Mobile Menu) */
    /* ========================================= */
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu'); 
    const mobileNavLinks = document.querySelectorAll('.nav-links-text .nav-link');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
        
        // 點擊選項後自動收起選單
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    /* ========================================= */
    /* 4. 購物車邏輯 (Cart System) */
    /* ========================================= */
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    // 修改：抓取新的關閉按鈕 ID
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBadge = document.getElementById('cart-badge');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('go-checkout');
    
    let cartItems = [];
    
    // 產品資料庫
    const productsData = {
        'p1': { 
            id: 'p1', 
            title: '鳳梨酥', 
            price: 550, 
            img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop', 
            desc: '嚴選台灣土鳳梨，經過 48 小時慢火熬煮，保留果肉纖維的酸甜口感。酥皮採用法國發酵奶油，入口即化，奶香濃郁。' 
        },
        'p2': { 
            id: 'p2', 
            title: '堅果塔', 
            price: 420, 
            img: 'https://images.unsplash.com/photo-1543573852-1a71a6ce19bc?q=80&w=800&auto=format&fit=crop', 
            desc: '澳洲夏威夷豆與杏仁果的完美結合。淋上職人手炒焦糖醬，甜而不膩。塔皮酥脆，堅果飽滿，層次豐富的口感。' 
        },
        'p3': { 
            id: 'p3', 
            title: '磅蛋糕', 
            price: 380, 
            img: 'https://images.unsplash.com/photo-1605697626998-356e4c70d4d8?q=80&w=800&auto=format&fit=crop', 
            desc: '經典英式食譜，加入新鮮檸檬皮屑提香。口感紮實濕潤，上層淋上酸甜檸檬糖霜，彷彿回到童年記憶中的溫暖午後。' 
        },
        'p4': { 
            id: 'p4', 
            title: '8吋派', 
            price: 980, 
            img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=800&auto=format&fit=crop', 
            desc: '滿滿的新鮮富士蘋果，搭配肉桂粉與香草莢細火慢燉。派皮層層堆疊，酥脆可口。每一口都吃得到果肉的鮮甜。' 
        }
    };

    // 渲染購物車畫面
    function renderCart() {
        // 計算總數量
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalCount;
        
        if (cartItems.length === 0) {
            cartBadge.classList.add('hidden'); // 隱藏角標
            cartItemsContainer.innerHTML = '<p class="empty-msg">// 尚未載入數據</p>';
            cartTotalPrice.textContent = 'NT$ 0';
        } else {
            cartBadge.classList.remove('hidden'); // 顯示角標
            cartItemsContainer.innerHTML = ''; 
            let total = 0;
            
            cartItems.forEach((item, index) => {
                total += item.product.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                
                // ★★★ 修改：核心渲染邏輯，改為單行 Flex 佈局結構 ★★★
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
            
            // 綁定按鈕事件 (減少、增加、刪除)
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

    // 加入購物車 (全域函式)
    window.addToCart = function(productId) {
        let product = productsData[productId];
        
        // 容錯：如果傳進來的是中文標題，嘗試反查 ID
        if (!product) {
            Object.values(productsData).forEach(p => {
                if (p.title === productId) product = p;
            });
        }

        if (product) {
            // 檢查購物車內是否已有此商品
            const existingItem = cartItems.find(item => item.product.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cartItems.push({ product: product, quantity: 1 });
            }
            renderCart(); 
            toggleCart(true); // 加入後自動打開購物車
        }
    };
    
    // 增加數量
    function increaseQuantity(index) {
        cartItems[index].quantity++;
        renderCart();
    }
    
    // 減少數量
    function decreaseQuantity(index) {
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
        } else {
            // 數量為 1 時再減，直接移除
            cartItems.splice(index, 1);
        }
        renderCart();
    }
    
    // 移除商品
    function removeItem(index) {
        cartItems.splice(index, 1);
        renderCart();
    }

    // 初始化渲染
    renderCart();

    // 開關購物車側欄
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
    
    // 結帳按鈕連結
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                alert("購物車是空的喔！");
                return;
            }
            // ★ 請記得將此網址換成您的 Google 表單連結 ★
            window.open('https://docs.google.com/forms/u/0/', '_blank');
        });
    }

    /* ========================================= */
    /* 5. 產品詳細視窗 (Modal) */
    /* ========================================= */
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
            
            // 設定按鈕點擊事件
            modalAddBtn.onclick = function() {
                window.addToCart(data.id); // 使用 ID 加入
                window.closeProductModal();
            };
            
            productModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        }
    }

    window.closeProductModal = function() {
        productModal.classList.remove('active');
        document.body.style.overflow = ''; 
    }
    
    /* ========================================= */
    /* 6. 人物 Lightbox & Scroll Spy */
    /* ========================================= */
    
    // 人物影片開關
    window.toggleChar = function(shouldShow) {
        const charOverlay = document.getElementById('char-overlay');
        const charVideo = charOverlay.querySelector('video');
        if (shouldShow) { 
            charOverlay.classList.add('active'); 
            if(charVideo) { charVideo.currentTime = 0; charVideo.play(); }
        } else { 
            charOverlay.classList.remove('active'); 
            if(charVideo) charVideo.pause(); 
        }
    }
    
    // 全身照 Lightbox 開關
    const fullbodyOverlay = document.getElementById('fullbody-overlay');
    window.openFullBodyLightbox = function() {
        fullbodyOverlay.classList.add('active');
    }
    window.closeFullBodyLightbox = function() {
        fullbodyOverlay.classList.remove('active');
    }
    
    // 滾動偵測與 Zoom Out 特效
    const sections = document.querySelectorAll('section, div#about');
    const allNavLinks = document.querySelectorAll('.nav-link'); 
    const charSection = document.getElementById('char-section');
    const scaleContainer = document.querySelector('.scale-container');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // 提早 250px 觸發
            if (pageYOffset >= (sectionTop - 250)) {
                if (section.getAttribute('id') === 'char-section') {
                    current = 'about';
                } else {
                    current = section.getAttribute('id');
                }
            }
        });

        // 點亮對應導覽列
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
        
        // 人物圖片 Zoom Out 特效
        if (charSection && scaleContainer) {
            const rect = charSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
                let progress = 1 - (rect.top / windowHeight);
                progress = Math.max(0, Math.min(1, progress));
                const scaleValue = 1.2 - (progress * 0.2); 
                scaleContainer.style.transform = `scale(${scaleValue})`;
            }
        }
    });

});