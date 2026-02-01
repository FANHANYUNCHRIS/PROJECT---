'use strict'; 

document.addEventListener('DOMContentLoaded', () => {

    /* ========================================= */
    /* ★★★ 1. 雙選擇入場邏輯 (單一音樂版) ★★★ */
    /* ========================================= */
    const entryLayer = document.getElementById('entry-layer');
    const bgMusic = document.getElementById('bg-music');
    
    // 靜音按鈕
    const btnSilent = document.getElementById('btn-silent');
    if (btnSilent) {
        btnSilent.addEventListener('click', () => {
            entryLayer.classList.add('fade-out');
        });
    }

    // 沉浸體驗按鈕
    const btnImmersive = document.getElementById('btn-immersive');
    if (btnImmersive) {
        btnImmersive.addEventListener('click', () => {
            if(bgMusic) {
                // 嘗試播放背景音樂
                bgMusic.play().catch(e => console.log("Audio Autoplay blocked:", e));
                bgMusic.volume = 0.5;
            }
            entryLayer.classList.add('fade-out');
        });
    }

    /* 2. 漢堡選單 */
    const hamburger = document.getElementById('hamburger-btn');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navList.classList.toggle('active');
        });
    }

    /* 3. 側滑購物車 */
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');

    function toggleCart(show) {
        if (show) { cartSidebar.classList.add('open'); cartOverlay.classList.add('active'); } 
        else { cartSidebar.classList.remove('open'); cartOverlay.classList.remove('active'); }
    }

    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            toggleCart(true);
        });
    }
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    /* 4. 人物 Lightbox */
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

    /* 5. 導覽列特效 & 人物 Zoom Out */
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section, div#about');
    const navLinks = document.querySelectorAll('.nav-link');
    const charSection = document.getElementById('char-section');
    const scaleContainer = document.querySelector('.scale-container');

    window.addEventListener('scroll', () => {
        // A. 導覽列變色
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // B. Scroll Spy (點亮選單)
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

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        // C. 人物 Zoom Out
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