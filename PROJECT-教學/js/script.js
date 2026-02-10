document.addEventListener('DOMContentLoaded', () => {
    
    // 1. GSAP Entry Animation
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                gsap.to(entry.target, { duration: 0.8, y: 0, opacity: 1, ease: "power2.out", overwrite: true });
                animateOnScroll.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => {
        gsap.set(el, { y: 50, opacity: 0 });
        animateOnScroll.observe(el);
    });

    // 2. ScrollSpy (Active State)
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            const clickAttr = item.getAttribute('onclick');
            if (clickAttr && clickAttr.includes(`'${currentSectionId}'`) && currentSectionId !== '') {
                item.classList.add('active');
            }
        });
    });

    // 3. Magnetic Button Effect (Desktop Only)
    if (window.matchMedia("(min-width: 1025px)").matches) {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                // 按鈕本體移動
                gsap.to(btn, { duration: 0.3, x: x * 0.2, y: y * 0.2, ease: 'power2.out' });
                // 內部 Icon 移動 (視差)
                const icon = btn.querySelector('i');
                if(icon) gsap.to(icon, { duration: 0.3, x: x * 0.1, y: y * 0.1, ease: 'power2.out' });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' });
                const icon = btn.querySelector('i');
                if(icon) gsap.to(icon, { duration: 0.8, x: 0, y: 0, ease: 'elastic.out(1, 0.3)' });
            });
        });
    }

    // 4. Parallax Hero Background
    const heroBg = document.querySelector('.hero-bg-wrapper');
    if (heroBg) {
        window.addEventListener('scroll', () => {
            if (window.scrollY < window.innerHeight) {
                heroBg.style.transform = `translateY(${window.scrollY * 0.5}px)`;
            }
        });
    }
});

function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const offset = element.offsetTop;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }
}