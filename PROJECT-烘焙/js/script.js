/**
 * PROJECT.CD - Ultimate Golden Master Controller (Zero-Trust Edition)
 * Version: 52.0 (Fully Restored Animations + Event Delegated + IIFE Encapsulated)
 */

(() => {
    'use strict';

    // ==========================================
    // 🛡️ 1. 核心資安防護模組 (Security Core)
    // ==========================================
    
    /**
     * 防禦 DOM-based XSS 的字串消毒工具
     */
    const sanitizeHTML = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag]));
    };

    // ==========================================
    // 📦 2. 封裝變數與資料庫 (Data Encapsulation)
    // ==========================================

    const mockApiDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
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

    let isLoggedIn = false;
    let selectedDate = null;
    let cartItems = JSON.parse(localStorage.getItem('projectCD_cart')) || [];
    let cardQtys = { 'p1': 1, 'p2': 1, 'p3': 1, 'p4': 1 };
    let currentModalId = null;
    let modalQty = 1;

    // 完全注回的產品數據 (含動態保存法規 storageRules)
    const productsData = {
        'p1': { 
            id: 'p1', title: '鳳梨酥 10入', price: 500, storageRules: '常溫 14 天',
            images: [
                { avif: 'images/p1-modal1.avif', webp: 'images/p1-modal1.webp', jpg: 'images/p1-modal1.jpg' },
                { avif: 'images/p1-modal2.avif', webp: 'images/p1-modal2.webp', jpg: 'images/p1-modal2.jpg' },
                { avif: 'images/p1-modal3.avif', webp: 'images/p1-modal3.webp', jpg: 'images/p1-modal3.jpg' }
            ], 
            desc: '以 48 小時慢火熬煮台灣在地土鳳梨，封存陽光淬鍊的酸甜。外層裹以頂級發酵奶油製成的金黃酥皮，入口即化，成就極致平衡的微奢味覺。', 
            ingredients: [
                { icon: '🧈', text: '法國頂級發酵奶油' }, { icon: '🌾', text: '日本進口細緻麵粉' }, { icon: '🍍', text: '台灣在地土鳳梨' },
                { icon: '🍯', text: '低甜度海藻糖配方' }, { icon: '🧀', text: '頂級帕瑪森起司粉' }, { icon: '🥛', text: '純淨全脂奶粉' }, { icon: '🥚', text: '新鮮洗選蛋' }
            ], 
            nutrition: { cal: ['205 kcal', '410 kcal'], pro: ['2.0 g', '4.0 g'], fat: ['9.0 g', '18.0 g'], sat: ['5.0 g', '10.0 g'], trans: ['0.0 g', '0.0 g'], carb: ['30.0 g', '60.0 g'], sug: ['12.5 g', '25.0 g'], na: ['60 mg', '120 mg'] } 
        },
        'p2': { 
            id: 'p2', title: '磅蛋糕', price: 400, storageRules: '冷藏 7 天',
            images: [
                { avif: 'images/p2-modal1.avif', webp: 'images/p2-modal1.webp', jpg: 'images/p2-modal1.jpg' },
                { avif: 'images/p2-modal2.avif', webp: 'images/p2-modal2.webp', jpg: 'images/p2-modal2.jpg' },
                { avif: 'images/p2-modal3.avif', webp: 'images/p2-modal3.webp', jpg: 'images/p2-modal3.jpg' }
            ], 
            desc: '傳承英式烘焙工藝，揉合新鮮黃檸檬皮屑的澄澈香氣。紮實濕潤的蛋糕體與表層晶瑩的檸檬糖霜交織，於舌尖綻放優雅而深邃的法式風情。', 
            ingredients: [
                { icon: '🧈', text: '法國頂級發酵奶油' }, { icon: '🌾', text: '日本進口細緻麵粉' }, { icon: '🍯', text: '低甜度海藻糖配方' },
                { icon: '🍋', text: '新鮮黃檸檬皮屑' }, { icon: '🥚', text: '新鮮洗選蛋' }, { icon: '🧂', text: '精選細砂糖' }, { icon: '🥄', text: '無鋁泡打粉' }
            ], 
            nutrition: { cal: ['190 kcal', '380 kcal'], pro: ['2.5 g', '5.0 g'], fat: ['11.0 g', '22.0 g'], sat: ['6.5 g', '13.0 g'], trans: ['0.0 g', '0.0 g'], carb: ['21.5 g', '43.0 g'], sug: ['10.0 g', '20.0 g'], na: ['40 mg', '80 mg'] } 
        },
        'p3': { 
            id: 'p3', title: '堅果塔 10入', price: 600, storageRules: '常溫 21 天',
            images: [
                { avif: 'images/p3-modal1.avif', webp: 'images/p3-modal1.webp', jpg: 'images/p3-modal1.jpg' },
                { avif: 'images/p3-modal2.avif', webp: 'images/p3-modal2.webp', jpg: 'images/p3-modal2.jpg' },
                { avif: 'images/p3-modal3.avif', webp: 'images/p3-modal3.webp', jpg: 'images/p3-modal3.jpg' }
            ], 
            desc: '嚴選頂級原味堅果，以完美火候烘焙逼出深層核果香。佐以特調焦糖糖漿輕柔包覆，盛裝於手工捏製的法式脆塔中，口感豐富立體，甜而不膩。', 
            ingredients: [
                { icon: '🌰', text: '特級綜合原味堅果' }, { icon: '🥛', text: '歐洲頂級動物性鮮奶油' }, { icon: '🧈', text: '法國頂級發酵奶油' },
                { icon: '🌰', text: '純手工精磨杏仁粉' }, { icon: '🍯', text: '水麥芽與低甜度海藻糖' }, { icon: '🍒', text: '優選蔓越莓乾' }, { icon: '🌾', text: '日本進口細緻麵粉' }
            ], 
            nutrition: { cal: ['187 kcal', '534 kcal'], pro: ['3.1 g', '8.8 g'], fat: ['14.0 g', '40.0 g'], sat: ['4.2 g', '12.0 g'], trans: ['0.0 g', '0.0 g'], carb: ['13.5 g', '38.5 g'], sug: ['6.5 g', '18.5 g'], na: ['17 mg', '48 mg'] } 
        },
        'p4': { 
            id: 'p4', title: '巧克力派', price: 600, storageRules: '冷藏 5 天 / 冷凍 14 天',
            images: [
                { avif: 'images/p4-modal1.avif', webp: 'images/p4-modal1.webp', jpg: 'images/p4-modal1.jpg' },
                { avif: 'images/p4-modal2.avif', webp: 'images/p4-modal2.webp', jpg: 'images/p4-modal2.jpg' },
                { avif: 'images/p4-modal3.avif', webp: 'images/p4-modal3.webp', jpg: 'images/p4-modal3.jpg' }
            ], 
            desc: '奢華選用歐洲頂級調溫黑巧克力，凝鍊出如絲綢般滑順的極濃內餡。底層法式派皮酥脆散發奶油香，微量海鹽於尾韻巧妙提味，專為成熟味蕾打造。', 
            ingredients: [
                { icon: '🍫', text: '歐洲頂級調溫黑巧克力' }, { icon: '🥛', text: '歐洲頂級動物性鮮奶油' }, { icon: '🧈', text: '法國頂級發酵奶油' },
                { icon: '🌾', text: '台灣優質中筋麵粉' }, { icon: '🍯', text: '低甜度海藻糖配方' }, { icon: '🧂', text: '精選細砂糖' }, { icon: '🧂', text: '微量提味海鹽' }, { icon: '🥚', text: '新鮮洗選蛋' }
            ], 
            nutrition: { cal: ['346 kcal', '461 kcal'], pro: ['4.5 g', '6.0 g'], fat: ['24.0 g', '32.0 g'], sat: ['13.5 g', '18.0 g'], trans: ['0.0 g', '0.0 g'], carb: ['30.2 g', '40.2 g'], sug: ['17.5 g', '23.3 g'], na: ['112 mg', '149 mg'] } 
        }
    };

    const aboutData = {
        'brand-img': { 
            type: 'image', 
            src: { 
                avif: '', 
                webp: '', 
                jpg: 'images/modal-unicorn.jpg' 
            }
        },
        'founder-img': { 
            type: 'image', 
            src: { 
                avif: '', 
                webp: '', 
                jpg: 'images/founder-cover.jpg' 
            }
        },
        'brand-text': { 
            type: 'text', title: 'PROJECT.CD', subtitle: '定義味覺的維度', 
            content: '<p>我們相信，最頂級的法式甜點不應只停留在味覺的饗宴，更該是一場精密計算過的藝術展演。</p><p>在 PROJECT.CD，我們將每一個經典配方徹底解構。從發酵奶油的化口熔點、海藻糖的完美甜度比例，到烘焙溫度的微秒控制，一切皆以極致的數據思維重新定義。</p><p>捨棄繁複無用的裝飾，回歸食材最純粹的靈魂。這是一場關於精準與美學的革命，也是我們對當代甜點的最終解答。</p>' 
        },
        'founder-text': { 
            type: 'text', title: '負責人 : CD', subtitle: '理性與感性的調和者', 
            content: '<p>「在冰冷的數據中，我找到了最炙熱的風味。」</p><p>作為 PROJECT.CD 的靈魂人物，CD 將工程師的精密邏輯與藝術家的敏銳直覺完美揉合。她拒絕妥協於傳統經驗法則，堅持親自編寫每一道甜點的「味覺代碼」。</p><p>對她而言，烤箱就是運算終端，而麵粉與奶油則是建構完美架構的基礎像素。她以近乎偏執的苛求，只為在每一次的品嚐中，精準擊中味蕾最深處的共鳴點。</p>' 
        }
    };

    let userHistory = [
        { date: '2026.02.11', product: '鳳梨酥 禮盒', qty: 2, price: 1000 },
        { date: '2026.01.05', product: '堅果塔', qty: 1, price: 600 },
        { date: '2025.12.24', product: '巧克力派', qty: 1, price: 600 },
        { date: '2025.11.11', product: '磅蛋糕', qty: 2, price: 800 },
        { date: '2025.10.31', product: '鳳梨酥 10入', qty: 1, price: 500 },
        { date: '2025.09.15', product: '堅果塔 10入', qty: 3, price: 1800 },
        { date: '2025.08.08', product: '磅蛋糕', qty: 1, price: 400 },
        { date: '2025.07.01', product: '巧克力派', qty: 2, price: 1200 }
    ];
    let currentHistoryPage = 1;
    const itemsPerPage = 5;

    // ==========================================
    // 🛠️ 3. 核心 UI 功能邏輯 (Core Methods)
    // ==========================================

    const showToast = (message, iconClass = "fa-check-circle") => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas ${sanitizeHTML(iconClass)}"></i> ${sanitizeHTML(message)}`;
        container.appendChild(toast);
        setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 400); }, 3500);
    };

    const renderCart = () => {
        const container = document.getElementById('cart-items-container');
        const badge = document.getElementById('cart-badge');
        const totalEl = document.getElementById('cart-total-price');
        
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalCount;
        badge.classList.toggle('hidden', totalCount === 0);
        
        if (cartItems.length === 0) {
            container.innerHTML = '<p class="empty-msg">// 尚未載入數據</p>';
            totalEl.textContent = 'NT$ 0';
        } else {
            container.innerHTML = '';
            let total = 0;
            cartItems.forEach((item, index) => {
                total += item.product.price * item.quantity;
                container.innerHTML += `
                    <div class="cart-item">
                        <div class="cart-item-info"><span>${sanitizeHTML(item.product.title)}</span></div>
                        <div class="cart-item-controls">
                            <button class="qty-btn minus" data-action="updateCartItem" data-index="${index}" data-val="-1">-</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button class="qty-btn plus" data-action="updateCartItem" data-index="${index}" data-val="1">+</button>
                        </div>
                        <div class="cart-item-price">NT$ ${item.product.price}</div>
                        <button class="remove-btn" data-action="updateCartItem" data-index="${index}" data-val="0"><i class="fas fa-trash"></i></button>
                    </div>`;
            });
            totalEl.textContent = `NT$ ${total.toLocaleString()}`;
        }
        localStorage.setItem('projectCD_cart', JSON.stringify(cartItems));
        checkCheckoutStatus();
    };

    const toggleCart = (show) => {
        document.getElementById('cart-sidebar').classList.toggle('open', show);
        document.getElementById('cart-overlay').classList.toggle('active', show);
    };

    const checkCheckoutStatus = () => {
        const btn = document.getElementById('go-checkout');
        const checkbox = document.getElementById('legal-agree-check');
        if (btn) btn.disabled = !(cartItems.length > 0 && checkbox && checkbox.checked);
    };

    const renderHistory = (page) => {
        currentHistoryPage = page;
        const start = (page - 1) * itemsPerPage;
        const pageItems = userHistory.slice(start, start + itemsPerPage);
        document.getElementById('dashboard-history-list').innerHTML = pageItems.map(item => `
            <div class="history-item">
                <span class="date">${item.date}</span><span class="product">${item.product}</span>
                <span class="qty-pill">x ${item.qty}</span><span class="price text-gold">NT$ ${item.price.toLocaleString()}</span>
            </div>`).join('');
            
        const totalPages = Math.ceil(userHistory.length / itemsPerPage);
        const pageContainer = document.getElementById('history-pagination');
        if(totalPages <= 1) { pageContainer.innerHTML = ''; return; }
        
        let btns = '';
        for (let i = 1; i <= totalPages; i++) {
            btns += `<button class="page-btn ${i === currentHistoryPage ? 'active' : ''}" data-action="renderHistoryPage" data-page="${i}">${i}</button>`;
        }
        pageContainer.innerHTML = btns;
    };

    // --- 日期選擇與結帳 ---
    const openCheckout = () => {
        toggleCart(false);
        let total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        document.getElementById('chk-subtotal').textContent = `NT$ ${total.toLocaleString()}`;
        document.getElementById('chk-total').textContent = `NT$ ${(total + 160).toLocaleString()}`;
        
        const container = document.getElementById('date-scroll-container');
        container.innerHTML = '';
        selectedDate = null;
        document.getElementById('final-pay-btn').disabled = true;
        
        const today = new Date();
        const days = ['日', '一', '二', '三', '四', '五', '六'];
        
        for(let i = 3; i < 17; i++) {
            let target = new Date(today); target.setDate(today.getDate() + i);
            let month = target.getMonth() + 1, date = target.getDate(), dayIdx = target.getDay();
            let isDisabled = (dayIdx === 1);
            
            let card = document.createElement('div');
            card.className = `date-card ${isDisabled ? 'disabled' : ''}`;
            card.innerHTML = `<span class="d-month">${month} 月</span><span class="d-day">${date}</span><span class="d-wk">星期${days[dayIdx]}</span>`;
            
            if(!isDisabled) {
                card.addEventListener('click', function() {
                    document.querySelectorAll('.date-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedDate = `${month}/${date}`;
                    document.getElementById('final-pay-btn').disabled = false;
                });
            }
            container.appendChild(card);
        }
        document.getElementById('checkout-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const simulatePayment = async () => {
        if(!selectedDate) return;
        const submitBtn = document.getElementById('final-pay-btn');
        if (submitBtn.classList.contains('is-loading')) return;
        
        const btnText = submitBtn.querySelector('.btn-text');
        submitBtn.classList.add('is-loading');
        btnText.textContent = "建立綠界訂單中...";
        await mockApiDelay(1500);
        
        submitBtn.classList.replace('is-loading', 'is-success');
        btnText.innerHTML = '<i class="fas fa-check"></i> 準備跳轉';
        showToast('訂單建立成功！即將前往金流頁面...', 'fa-credit-card');
        
        setTimeout(() => {
            document.getElementById('checkout-modal').classList.remove('active');
            document.body.style.overflow = '';
            cartItems = []; renderCart();
            submitBtn.classList.remove('is-success');
            btnText.textContent = "確認付款 (前往金流)";
        }, 2000);
    };

    // --- 產品與資訊彈窗 ---
    const openDataHub = (type) => {
        if(!currentModalId) return;
        const data = productsData[currentModalId];
        const titleEl = document.getElementById('dh-title');
        const bodyEl = document.getElementById('dh-body');

        if (type === 'ingredients') {
            titleEl.innerHTML = '<i class="fas fa-seedling"></i> 嚴選食材';
            let ingHtml = '<div class="dh-ing-list">';
            data.ingredients.forEach(ing => {
                ingHtml += `<div class="dh-ing-item"><span class="dh-ing-icon">${sanitizeHTML(ing.icon)}</span><span class="dh-ing-text">${sanitizeHTML(ing.text)}</span></div>`;
            });
            bodyEl.innerHTML = ingHtml + '</div>';
        } else if (type === 'notice') {
            titleEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> 產地與保存須知';
            bodyEl.innerHTML = `
                <div class="dh-notice-box">
                    <h4><i class="fas fa-box-open"></i> 產地與保存</h4>
                    <p>產地：台灣<br>保存方式：${sanitizeHTML(data.storageRules)}<br><span style="font-size: 12px; color: #86868b;">*請避免陽光直射，冷藏取出後請置於室溫 10 分鐘後食用風味最佳。</span></p>
                </div>
                <div class="dh-alert-box">
                    <h4><i class="fas fa-biohazard"></i> 過敏原警告</h4>
                    <p>本產品含蛋、奶、堅果、麩質，不適合對其過敏體質者食用。</p>
                </div>`;
        } else if (type === 'spec') {
            titleEl.innerHTML = '<i class="fas fa-clipboard-list"></i> 營養數據分析';
            bodyEl.innerHTML = `<div class="nutrition-table-compact borderless light-mode">
                <div class="nut-row header"><span class="col-item">項目</span><span class="col-val">每份</span><span class="col-val">每 100 公克</span></div>
                <div class="nut-row"><span class="col-item">熱量</span><span class="col-val">${data.nutrition.cal[0]}</span><span class="col-val">${data.nutrition.cal[1]}</span></div>
                <div class="nut-row"><span class="col-item">蛋白質</span><span class="col-val">${data.nutrition.pro[0]}</span><span class="col-val">${data.nutrition.pro[1]}</span></div>
                <div class="nut-row"><span class="col-item">脂肪</span><span class="col-val">${data.nutrition.fat[0]}</span><span class="col-val">${data.nutrition.fat[1]}</span></div>
                <div class="nut-row sub-row"><span class="col-item">飽和脂肪</span><span class="col-val">${data.nutrition.sat[0]}</span><span class="col-val">${data.nutrition.sat[1]}</span></div>
                <div class="nut-row sub-row"><span class="col-item">反式脂肪</span><span class="col-val">${data.nutrition.trans[0]}</span><span class="col-val">${data.nutrition.trans[1]}</span></div>
                <div class="nut-row"><span class="col-item">碳水化合物</span><span class="col-val">${data.nutrition.carb[0]}</span><span class="col-val">${data.nutrition.carb[1]}</span></div>
                <div class="nut-row sub-row"><span class="col-item">糖</span><span class="col-val">${data.nutrition.sug[0]}</span><span class="col-val">${data.nutrition.sug[1]}</span></div>
                <div class="nut-row"><span class="col-item">鈉</span><span class="col-val">${data.nutrition.na[0]}</span><span class="col-val">${data.nutrition.na[1]}</span></div>
            </div>`;
        }
        document.getElementById('data-hub-modal').classList.add('active');
    };

    const openProductModal = (id) => {
        const data = productsData[id];
        if(!data) return;
        currentModalId = id; modalQty = 1;
        document.getElementById('modal-qty-display').textContent = 1;
        if(document.getElementById('mobile-modal-qty-display')) document.getElementById('mobile-modal-qty-display').textContent = 1;
        
        document.getElementById('modal-title').textContent = data.title.replace(' 10入', '');
        document.getElementById('modal-price').textContent = `NT$ ${data.price}`;
        document.getElementById('modal-desc').textContent = data.desc;
        document.getElementById('modal-storage-desc').textContent = data.storageRules;
        
        if (window.innerWidth > 768) {
            const ingContainer = document.getElementById('modal-ingredients');
            if (ingContainer) {
                ingContainer.innerHTML = '';
                data.ingredients.forEach((ing) => {
                    const btn = document.createElement('button');
                    btn.className = 'emoji-btn noselect';
                    btn.innerHTML = `${ing.icon}<span class="emoji-tooltip">${ing.text}</span>`;
                    const showText = () => { document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); };
                    const hideText = () => { btn.classList.remove('active'); };
                    btn.onclick = showText; btn.onmouseenter = showText; btn.onmouseleave = hideText;
                    ingContainer.appendChild(btn);
                });
            }
        }

        const track = document.getElementById('gallery-track');
        const indicators = document.getElementById('gallery-indicators');
        track.innerHTML = ''; indicators.innerHTML = '';
        
        data.images.forEach((imgObj, i) => {
            const slideWrap = document.createElement('div');
            slideWrap.className = 'gallery-slide noselect';
            slideWrap.innerHTML = `
                <picture>
                    <source type="image/avif" srcset="${imgObj.avif}">
                    <source type="image/webp" srcset="${imgObj.webp}">
                    <img src="${imgObj.jpg}" alt="${sanitizeHTML(data.title)}" onerror="this.style.opacity='0'">
                </picture>`;
            track.appendChild(slideWrap);
            
            const dot = document.createElement('div');
            dot.className = `gallery-dot ${i===0?'active':''}`;
            dot.onclick = () => track.scrollTo({ left: i * track.offsetWidth, behavior: 'smooth' });
            indicators.appendChild(dot);
        });
        
        track.scrollTo({ left: 0 });
        track.addEventListener('scroll', () => {
            const scrollIndex = Math.round(track.scrollLeft / track.offsetWidth);
            document.querySelectorAll('.gallery-dot').forEach((d, i) => d.classList.toggle('active', i === scrollIndex));
        });

        document.getElementById('product-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    // --- 輪播系統與拖曳 ---
    const updateCarouselArrows = () => {
        const container = document.getElementById('sweets-carousel-container');
        const leftBtn = document.getElementById('carousel-btn-left');
        const rightBtn = document.getElementById('carousel-btn-right');
        if(!container || !leftBtn || !rightBtn) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        leftBtn.classList.toggle('disabled', container.scrollLeft <= 5);
        rightBtn.classList.toggle('disabled', container.scrollLeft >= maxScroll - 5);
    };

    const initDragScroll = (slider) => {
        let isDown = false, startX, scrollLeft;
        slider.addEventListener('mousedown', (e) => { isDown = true; slider.style.cursor = 'grabbing'; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            slider.scrollLeft = scrollLeft - (x - startX) * 2;
        });
    };

    // ==========================================
    // 🌐 4. 全域事件委託引擎 (Global Event Delegator)
    // ==========================================
    document.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        
        if (e.target.classList.contains('site-overlay') || e.target.classList.contains('auth-modal')) {
            document.querySelectorAll('.active, .open, .show').forEach(el => {
                if(el.id !== 'navbar') el.classList.remove('active', 'open', 'show');
            });
            document.body.style.overflow = '';
        }

        if (!actionTarget) return;
        const action = actionTarget.dataset.action;
        if(actionTarget.tagName === 'A' && !actionTarget.href.includes('#home')) e.preventDefault();

        switch (action) {
            case 'acceptCookies':
                localStorage.setItem('projectCD_cookieConsent', 'true');
                document.getElementById('cookie-banner').classList.remove('show');
                break;
            case 'openLegal':
                document.querySelectorAll('.legal-text-block').forEach(el => el.classList.add('hidden'));
                document.getElementById(`content-${actionTarget.dataset.type}`).classList.remove('hidden');
                document.getElementById('legal-modal').classList.add('active');
                document.body.style.overflow = 'hidden';
                break;
            case 'closeLegalModal':
                document.getElementById('legal-modal').classList.remove('active');
                document.body.style.overflow = '';
                break;
            case 'toggleCart':
                toggleCart(actionTarget.dataset.show === 'true');
                break;
            case 'openCheckout':
                openCheckout(); break;
            case 'closeCheckout':
                document.getElementById('checkout-modal').classList.remove('active');
                document.body.style.overflow = ''; break;
            case 'simulatePayment':
                simulatePayment(); break;
            case 'updateCartItem':
                const idx = parseInt(actionTarget.dataset.index);
                const change = parseInt(actionTarget.dataset.val);
                if (change === 0) cartItems.splice(idx, 1);
                else {
                    cartItems[idx].quantity += change;
                    if (cartItems[idx].quantity <= 0) cartItems.splice(idx, 1);
                }
                renderCart(); break;
            case 'handleUserTrigger':
                if (isLoggedIn) {
                    renderHistory(1);
                    document.getElementById('dashboard-modal').classList.add('active');
                } else document.getElementById('auth-modal').classList.add('active');
                document.body.style.overflow = 'hidden'; break;
            case 'toggleAuth':
                document.getElementById('auth-modal').classList.toggle('active', actionTarget.dataset.show === 'true');
                document.body.style.overflow = actionTarget.dataset.show === 'true' ? 'hidden' : ''; break;
            case 'toggleDashboard':
                document.getElementById('dashboard-modal').classList.toggle('active', actionTarget.dataset.show === 'true');
                document.body.style.overflow = actionTarget.dataset.show === 'true' ? 'hidden' : ''; break;
            case 'switchAuthMode':
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === actionTarget.dataset.mode));
                document.querySelectorAll('.register-only').forEach(el => el.classList.toggle('hidden', actionTarget.dataset.mode === 'login'));
                const modeText = document.getElementById('auth-btn-text');
                const subtitle = document.querySelector('.auth-subtitle');
                if (actionTarget.dataset.mode === 'login') { modeText.textContent = '登入維度'; subtitle.textContent = '歡迎回來'; } 
                else { modeText.textContent = '確認開啟'; subtitle.textContent = '開啟您的味覺記憶'; }
                break;
            case 'handleLogout':
                isLoggedIn = false;
                document.getElementById('dashboard-modal').classList.remove('active');
                document.getElementById('nav-crown-icon').classList.remove('nav-crown-glow');
                document.getElementById('vip-center-text').textContent = "WELCOME";
                document.getElementById('vip-bottom-left').textContent = "PROJECT.CD";
                document.getElementById('vip-btn-text').textContent = "申請加入會員";
                showToast("已登出您的維度");
                document.body.style.overflow = ''; break;
            case 'renderHistoryPage':
                renderHistory(parseInt(actionTarget.dataset.page)); break;
            case 'handleCardClick':
                if(e.target.closest('.c-info-console')) return;
                const card = actionTarget;
                if (!card.classList.contains('active-card')) {
                    const container = document.getElementById('sweets-carousel-container');
                    container.scrollTo({ left: card.offsetLeft + (card.offsetWidth/2) - (container.offsetWidth/2), behavior: 'smooth' });
                } else openProductModal(actionTarget.dataset.id);
                break;
            case 'scrollCarousel':
                const cContainer = document.getElementById('sweets-carousel-container');
                const cCard = cContainer.querySelector('.carousel-card');
                const step = cCard ? cCard.offsetWidth * 1.2 : window.innerWidth * 0.3;
                cContainer.scrollTo({ left: cContainer.scrollLeft + (parseInt(actionTarget.dataset.dir) * step), behavior: 'smooth' });
                break;
            case 'updateCardQty':
                e.stopPropagation();
                const pid = actionTarget.dataset.id;
                cardQtys[pid] = Math.max(1, (cardQtys[pid] || 1) + parseInt(actionTarget.dataset.val));
                document.getElementById(`qty-${pid}`).textContent = cardQtys[pid];
                break;
            case 'addCardToCart':
                e.stopPropagation();
                const addId = actionTarget.dataset.id;
                const prod = productsData[addId];
                const exist = cartItems.find(i => i.product.id === addId);
                if(exist) exist.quantity += cardQtys[addId];
                else cartItems.push({product: prod, quantity: cardQtys[addId]});
                cardQtys[addId] = 1; document.getElementById(`qty-${addId}`).textContent = 1;
                renderCart(); showToast(`已將 ${prod.title} 加入收藏`, 'fa-shopping-bag');
                const badge = document.getElementById('cart-badge');
                badge.classList.remove('pop'); void badge.offsetWidth; badge.classList.add('pop');
                break;
            case 'closeProductModal':
                document.getElementById('product-modal').classList.remove('active');
                document.body.style.overflow = ''; break;
            case 'scrollModalGallery':
                const t = document.getElementById('gallery-track');
                if(t) t.scrollBy({ left: parseInt(actionTarget.dataset.dir) * t.offsetWidth, behavior: 'smooth' });
                break;
            case 'openDataHub':
                openDataHub(actionTarget.dataset.type); break;
            case 'closeDataHub':
                document.getElementById('data-hub-modal').classList.remove('active'); break;
            case 'updateModalQty':
                modalQty = Math.max(1, modalQty + parseInt(actionTarget.dataset.val));
                document.getElementById('modal-qty-display').textContent = modalQty;
                if(document.getElementById('mobile-modal-qty-display')) document.getElementById('mobile-modal-qty-display').textContent = modalQty;
                break;
            case 'addModalToCart':
                const mProd = productsData[currentModalId];
                const mExist = cartItems.find(i => i.product.id === currentModalId);
                if(mExist) mExist.quantity += modalQty;
                else cartItems.push({product: mProd, quantity: modalQty});
                renderCart(); showToast(`已將 ${mProd.title} 加入收藏`, 'fa-shopping-bag');
                document.getElementById('product-modal').classList.remove('active');
                document.body.style.overflow = '';
                const mBadge = document.getElementById('cart-badge');
                mBadge.classList.remove('pop'); void mBadge.offsetWidth; mBadge.classList.add('pop');
                break;
            case 'openAboutModal':
                const aboutInfo = aboutData[actionTarget.dataset.key];
                const contentBox = document.getElementById('ed-modal-content');
                if(aboutInfo.type === 'image') {
                    contentBox.className = 'ed-modal-content image-mode';
                    contentBox.innerHTML = `
                        <picture>
                            <source type="image/avif" srcset="${aboutInfo.src.avif || ''}">
                            <source type="image/webp" srcset="${aboutInfo.src.webp || ''}">
                            <img src="${aboutInfo.src.jpg}">
                        </picture>
                        <button class="ed-close-btn img-close" data-action="closeAboutModal"><i class="fas fa-times"></i></button>`;
                } else {
                    contentBox.className = 'ed-modal-content text-mode';
                    contentBox.innerHTML = `<div><h2 class="ed-title">${sanitizeHTML(aboutInfo.title)}</h2><p class="ed-subtitle text-gold">${sanitizeHTML(aboutInfo.subtitle)}</p><div class="text-separator" style="margin: 0 0 30px 0; width: 40px;"></div><div class="ed-body">${aboutInfo.content}</div></div><button class="ed-close-btn text-close" data-action="closeAboutModal"><i class="fas fa-times"></i></button>`;
                }
                document.getElementById('editorial-modal').classList.add('active');
                document.body.style.overflow = 'hidden';
                break;
            case 'closeAboutModal':
                document.getElementById('editorial-modal').classList.remove('active');
                document.body.style.overflow = ''; break;
        }
    });

    document.getElementById('legal-agree-check')?.addEventListener('change', checkCheckoutStatus);

    // ESC 層級關閉
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            if (document.getElementById('editorial-modal').classList.contains('active')) return document.getElementById('editorial-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('data-hub-modal').classList.contains('active')) return document.getElementById('data-hub-modal').classList.remove('active');
            if (document.getElementById('product-modal').classList.contains('active')) return document.getElementById('product-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('legal-modal').classList.contains('active')) return document.getElementById('legal-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('checkout-modal') && document.getElementById('checkout-modal').classList.contains('active')) return document.getElementById('checkout-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('auth-modal').classList.contains('active')) return document.getElementById('auth-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('dashboard-modal').classList.contains('active')) return document.getElementById('dashboard-modal').classList.remove('active'), document.body.style.overflow = '';
            if (document.getElementById('cart-sidebar').classList.contains('open')) return toggleCart(false);
        }
    });

    // ==========================================
    // 🚀 5. 初始化與底層特效綁定 (GSAP & Init)
    // ==========================================
    
    document.addEventListener('DOMContentLoaded', () => {
        renderCart();
        if (!localStorage.getItem('projectCD_cookieConsent')) setTimeout(() => document.getElementById('cookie-banner').classList.add('show'), 2000);
        
        // 進入動畫
        setTimeout(() => { 
            document.getElementById('entry-layer').classList.add('gate-fade-out'); 
            document.getElementById('navbar').classList.remove('navbar-hidden'); 
        }, 800);

        // Intersection Observer (捲動浮現)
        const observer = new IntersectionObserver((entries) => { 
            entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }); 
        }, { threshold: 0.15 }); 
        document.querySelectorAll('.fade-in-up, .brand-quadrant-wrapper').forEach(el => observer.observe(el));

        // 🌟 GSAP: 鈦金卡 3D 特效
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
                    if(reflection) { reflection.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255,255,255,0.2), transparent 60%)`; reflection.style.opacity = 1; } 
                }); 
            }); 
            cardContainer.addEventListener('mouseleave', () => { 
                gsap.to(card, { duration: 1, rotateX: 0, rotateY: 0, ease: 'elastic.out(1, 0.5)' }); 
                if(reflection) reflection.style.opacity = 0; 
            }); 
        }

        // Flux 按鈕光影 & 磁吸圖示
        document.querySelectorAll('.flux-btn').forEach(btn => { 
            btn.addEventListener('mousemove', (e) => { 
                if(btn.disabled) return; 
                const rect = btn.getBoundingClientRect(); 
                const light = btn.querySelector('.flux-light'); 
                if(light) { light.style.setProperty('--x', `${((e.clientX - rect.left) / rect.width) * 100}%`); light.style.setProperty('--y', `${((e.clientY - rect.top) / rect.height) * 100}%`); } 
            }); 
        });
        document.querySelectorAll('.magnetic-icon, .nav-link').forEach(btn => { 
            btn.addEventListener('mousemove', (e) => { 
                requestAnimationFrame(() => { const rect = btn.getBoundingClientRect(); gsap.to(btn, { duration: 0.3, x: (e.clientX - rect.left - rect.width / 2) * 0.4, y: (e.clientY - rect.top - rect.height / 2) * 0.4, ease: 'power2.out' }); }); 
            }); 
            btn.addEventListener('mouseleave', () => gsap.to(btn, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' })); 
        });

        // 導覽列捲動判定
        const navbar = document.getElementById('navbar');
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            let st = window.pageYOffset || document.documentElement.scrollTop;
            if (st > 50) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
            if (st > lastScrollTop && st > 100) navbar.classList.add('navbar-hidden'); else navbar.classList.remove('navbar-hidden');
            lastScrollTop = st <= 0 ? 0 : st;
        });

        // 漢堡選單
        const hamburger = document.getElementById('hamburger-btn'); 
        const mobileMenu = document.getElementById('mobile-menu'); 
        if (hamburger) { 
            hamburger.addEventListener('click', () => { 
                const isActive = hamburger.classList.toggle('active'); 
                mobileMenu.classList.toggle('active'); 
                hamburger.setAttribute('aria-expanded', isActive);
            }); 
            document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('active'); mobileMenu.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false'); })); 
        }

        // 輪播拖曳與中心對齊
        const carouselContainer = document.getElementById('sweets-carousel-container'); 
        if (carouselContainer) { 
            if (window.innerWidth > 768) initDragScroll(carouselContainer); 
            carouselContainer.addEventListener('scroll', () => window.requestAnimationFrame(updateCarouselArrows)); 
            setTimeout(updateCarouselArrows, 100); 
            window.addEventListener('resize', updateCarouselArrows); 
            
            const allCards = carouselContainer.querySelectorAll('.carousel-card');
            const updateCenter = () => {
                const centerPoint = carouselContainer.scrollLeft + (carouselContainer.offsetWidth / 2);
                let minDistance = Infinity, closestCard = null;
                allCards.forEach(card => {
                    card.classList.remove('active-card');
                    const dist = Math.abs(centerPoint - (card.offsetLeft + (card.offsetWidth / 2)));
                    if (dist < minDistance) { minDistance = dist; closestCard = card; }
                });
                if (closestCard) closestCard.classList.add('active-card');
            };
            let isScrolling; 
            carouselContainer.addEventListener('scroll', () => { window.cancelAnimationFrame(isScrolling); isScrolling = window.requestAnimationFrame(updateCenter); });
            setTimeout(updateCenter, 100);
            if (window.innerWidth > 768) initDragScroll(document.getElementById('gallery-track'));
        }

        // 音樂解鎖 & Textarea 自動長高
        const unlockAudio = () => { const bgMusic = document.getElementById('bg-music'); if(bgMusic && bgMusic.paused) { bgMusic.volume = 0.3; bgMusic.play().catch(()=>{}); } document.body.removeEventListener('click', unlockAudio); }; 
        document.body.addEventListener('click', unlockAudio, { once: true });
        const msgInput = document.getElementById('contact-msg-input'); 
        if (msgInput) msgInput.addEventListener('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; });

        // 表單提交
        const authForm = document.getElementById('auth-form');
        if(authForm) {
            authForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const activeMode = document.querySelector('.auth-tab.active').dataset.mode;
                const name = document.getElementById('auth-name-input').value.trim(); 
                const phone = document.getElementById('auth-phone-input').value.trim(); 
                const email = document.getElementById('auth-email-input').value.trim(); 
                const bday = document.getElementById('auth-birthday-input').value.trim(); 
                const privacyChecked = document.getElementById('privacy-policy').checked;

                if(!isValidPhone(phone)) return showToast("手機號碼格式錯誤", "fa-exclamation-circle");
                if(!email || !isValidEmail(email)) return showToast("電子信箱格式錯誤", "fa-exclamation-circle");
                if(activeMode === 'register') {
                    if(!name) return showToast("請輸入如何稱呼您", "fa-exclamation-circle");
                    if(!isValidBirthday(bday)) return showToast("生日格式錯誤", "fa-exclamation-circle");
                    if(!privacyChecked) return showToast("請勾選同意隱私權政策", "fa-exclamation-circle");
                }
                
                const submitBtn = document.getElementById('auth-submit-btn');
                if (submitBtn.classList.contains('is-loading')) return;
                
                const btnText = document.getElementById('auth-btn-text');
                const originalText = btnText.textContent;
                submitBtn.classList.add('is-loading'); btnText.textContent = "驗證中...";
                await mockApiDelay(1200);
                
                isLoggedIn = true;
                submitBtn.classList.replace('is-loading', 'is-success');
                btnText.innerHTML = '<i class="fas fa-check"></i>';
                document.getElementById('auth-glass-panel').style.opacity = '0';
                document.getElementById('auth-success-circle').classList.add('show');
                document.getElementById('nav-crown-icon').classList.add('nav-crown-glow');
                
                const displayName = activeMode === 'register' ? name : "貴賓 (VIP)";
                document.getElementById('dash-name').textContent = displayName;
                document.getElementById('vip-center-text').textContent = displayName;
                document.getElementById('vip-btn-text').textContent = "進入主控台";
                document.getElementById('dash-total-spent').textContent = `NT$ ${userHistory.reduce((sum, item) => sum + item.price, 0).toLocaleString()}`;
                
                setTimeout(() => {
                    document.getElementById('auth-modal').classList.remove('active');
                    document.body.style.overflow = '';
                    showToast(`歡迎回來，${sanitizeHTML(displayName)}`, 'fa-crown');
                    setTimeout(() => {
                        document.getElementById('auth-glass-panel').style.opacity = '1';
                        document.getElementById('auth-success-circle').classList.remove('show');
                        submitBtn.classList.remove('is-success');
                        btnText.textContent = originalText;
                        submitBtn.querySelector('.btn-progress-bar').style.transition = 'none';
                        submitBtn.querySelector('.btn-progress-bar').style.width = '';
                        setTimeout(() => { submitBtn.querySelector('.btn-progress-bar').style.transition = ''; }, 50);
                        authForm.reset();
                        document.querySelector('[data-action="switchAuthMode"][data-mode="register"]').click();
                    }, 500);
                }, 1200);
            });
        }

        const contactForm = document.getElementById('contact-form');
        if(contactForm) {
            contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if(!isValidPhone(document.getElementById('contact-phone-input').value)) return showToast("聯絡電話格式錯誤", "fa-exclamation-circle");
                const submitBtn = document.getElementById('contact-submit-btn');
                if (submitBtn.classList.contains('is-loading')) return;
                
                const btnText = submitBtn.querySelector('.btn-text');
                const originalText = btnText.textContent;
                submitBtn.classList.add('is-loading'); btnText.textContent = "傳輸中...";
                await mockApiDelay(1200);
                
                submitBtn.classList.replace('is-loading', 'is-success');
                btnText.innerHTML = '<i class="fas fa-check"></i> 訊息已送出';
                showToast('已收到您的訊息，我們將盡快聯繫您。', 'fa-envelope-open-text');
                setTimeout(() => {
                    contactForm.reset();
                    if(msgInput) msgInput.style.height = 'auto';
                    submitBtn.classList.remove('is-success'); btnText.textContent = originalText;
                    submitBtn.querySelector('.btn-progress-bar').style.transition = 'none';
                    submitBtn.querySelector('.btn-progress-bar').style.width = '';
                    setTimeout(() => { submitBtn.querySelector('.btn-progress-bar').style.transition = ''; }, 50);
                }, 3000);
            });
        }
    });
})();