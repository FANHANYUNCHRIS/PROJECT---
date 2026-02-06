/* ==========================================================================
   JavaScript 目錄
   --------------------------------------------------------------------------
   1. DOMContentLoaded - 確保 HTML 載入完成後執行
   2. Scroll Spy       - 偵測捲動位置，自動切換導覽列亮燈狀態
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // [變數定義] 取得頁面上的區塊與導覽連結
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-list a');

    // [事件監聽] 監聽視窗捲動事件
    window.addEventListener('scroll', () => {
        let current = '';
        
        // 1. 判斷目前使用者看的是哪一個 section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            // 當區塊進入視窗上方 1/3 處，視為「進入該區塊」
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        // 2. 更新側邊欄的 Active 狀態
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // 取得 href 屬性 (例如 #about)
            const href = link.getAttribute('href');
            
            // 如果 href 包含目前的 ID，就加上 active 樣式
            if (href && href.includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });
});