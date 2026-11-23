/**
 * Animations and Interactions Script
 * Handles scroll reveal animations and other interactive elements.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation using IntersectionObserver
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible to run animation only once
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, observerOptions);

    window.observeAnimatedElements = (root = document) => {
        const animatedElements = root.querySelectorAll('.animate-on-scroll, .resource-card, .nav-card, .info-card, .section-title');
        animatedElements.forEach((el) => {
            if (!el.classList.contains('visible')) {
                el.classList.add('fade-up-element');
                observer.observe(el);
            }
        });
    };

    window.observeAnimatedElements();

    // Parallax effect for header (subtle)
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // background position move? or opacity?
        // Let's just do a subtle shadow opacity increase
        if (scrolled > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
});
