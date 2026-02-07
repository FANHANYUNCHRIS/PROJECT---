document.addEventListener('DOMContentLoaded', () => {
    
    const sections = document.querySelectorAll('section');
    // 改抓 .nav-item 因為我們用 div 做了按鈕
    const navLinks = document.querySelectorAll('.nav-item');

    // 視窗捲動監聽
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // 進入區塊 1/3 處視為抵達
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // 從 onclick 屬性中提取 ID (例如 "scrollToSection('about')")
            const clickAttr = link.getAttribute('onclick');
            if (clickAttr && clickAttr.includes(`'${current}'`) && current !== '') {
                link.classList.add('active');
            }
        });
    });
});

// 全域跳轉函式
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}