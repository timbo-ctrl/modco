/**
 * Modco Website Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Splash Screen ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        const splashLogo = splashScreen.querySelector('.splash-logo');
        const loaderLine = splashScreen.querySelector('.loader-line');

        // Phase 1: After load animation, dissolve the logo and loader
        setTimeout(() => {
            if (splashLogo) splashLogo.classList.add('logo-exit');
            if (loaderLine) loaderLine.classList.add('logo-exit');

            // Phase 2: After logo dissolves, fade the entire splash screen
            setTimeout(() => {
                splashScreen.classList.add('fade-out');

                // Remove from DOM after fade completes (1.2s in CSS)
                setTimeout(() => {
                    splashScreen.remove();
                }, 1200);
            }, 600);
        }, 1500);
    }

    // --- Navigation Scroll Effect ---
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // --- Intersection Observers for Fade-Ins ---
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(el => fadeObserver.observe(el));




    // --- Scroll Trigger sequence for Products ---
    function setupScrollJack(trackId, leftId, rightId, contentId) {
        const track = document.getElementById(trackId);
        const leftEl = leftId ? document.getElementById(leftId) : null;
        const rightEl = rightId ? document.getElementById(rightId) : null;
        const contentEl = document.getElementById(contentId);
        const centerEl = track ? track.querySelector('.center-large') : null;

        if (!track) return;

        // Clean inline styles if crossing the breakpoint
        window.addEventListener('resize', () => {
            if (leftEl) leftEl.style.cssText = '';
            if (rightEl) rightEl.style.cssText = '';
            if (centerEl) centerEl.style.cssText = '';
            if (contentEl) contentEl.style.cssText = '';
        });

        // Initial state for desktop (assuming >1024px)
        if (window.innerWidth > 1024) {
            if (leftEl) {
                leftEl.style.opacity = 0;
                leftEl.style.flex = '0';
                leftEl.style.maxWidth = '0';
                leftEl.style.overflow = 'hidden';
            }
            if (rightEl) {
                rightEl.style.opacity = 0;
                rightEl.style.flex = '0';
                rightEl.style.maxWidth = '0';
                rightEl.style.overflow = 'hidden';
            }
        }
        if (contentEl) contentEl.style.opacity = 0;

        window.addEventListener('scroll', () => {
            const rect = track.getBoundingClientRect();
            const scrollDistance = -rect.top;
            const totalScroll = rect.height - window.innerHeight;

            let progress = totalScroll > 0 ? scrollDistance / totalScroll : 0;
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;

            const interp = (p, start, end) => {
                if (p <= start) return 0;
                if (p >= end) return 1;
                return (p - start) / (end - start);
            };

            const isMobile = window.innerWidth <= 1024;

            if (isMobile) {
                // Mobile stacked cover sequence
                const leftRevealP = interp(progress, 0.1, 0.4);
                const rightRevealP = interp(progress, 0.4, 0.7);
                const contentP = interp(progress, 0.7, 1.0);

                if (centerEl) {
                    centerEl.style.opacity = 1;
                }

                if (leftEl) {
                    leftEl.style.opacity = leftRevealP > 0 ? 1 : 0;
                    leftEl.style.transform = `translateY(${(1 - leftRevealP) * 100}%)`;
                }

                if (rightEl) {
                    rightEl.style.opacity = rightRevealP > 0 ? 1 : 0;
                    rightEl.style.transform = `translateY(${(1 - rightRevealP) * 100}%)`;
                }

                if (contentEl) {
                    contentEl.style.opacity = contentP;
                    contentEl.style.transform = `translateY(${(1 - contentP) * 30}%)`;
                }
            } else {
                // Desktop side-by-side sequence
                const sideP = interp(progress, 0.1, 0.5);
                const contentP = interp(progress, 0.6, 0.9);

                if (leftEl) {
                    leftEl.style.opacity = sideP;
                    leftEl.style.flex = sideP;
                    leftEl.style.maxWidth = (sideP * 33) + '%';
                    leftEl.style.transform = `translateX(${(1 - sideP) * -50}px)`;
                }
                if (rightEl) {
                    rightEl.style.opacity = sideP;
                    rightEl.style.flex = sideP;
                    rightEl.style.maxWidth = (sideP * 33) + '%';
                    rightEl.style.transform = `translateX(${(1 - sideP) * 50}px)`;
                }
                if (contentEl) {
                    contentEl.style.opacity = contentP;
                    contentEl.style.transform = `translateY(${(1 - contentP) * 30}px)`;
                }
            }
        });
    }

    // Initialize the scroll jack effect on the 3 product sections
    setupScrollJack('genius-track', 'g-left', 'g-right', 'g-content');
    setupScrollJack('switch-track', 's-left', 's-right', 's-content');
    setupScrollJack('quattro-track', 'q-left', 'q-right', 'q-content');

    // --- Contact Form Handling ---
    const form = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Client-side validation is handled by HTML5 attributes
            // Fake submit state
            const btn = form.querySelector('.btn-submit');
            btn.textContent = 'Sending...';
            btn.disabled = true;

            setTimeout(() => {
                form.style.display = 'none';
                successMsg.classList.remove('hidden');
            }, 800);
        });
    }

    // --- Carousel Image Cycler ---
    const carouselContainers = document.querySelectorAll('.carousel-container');

    carouselContainers.forEach(container => {
        const images = container.querySelectorAll('.carousel-img');
        if (images.length > 1) {
            let currentIndex = 0;
            setInterval(() => {
                images[currentIndex].classList.remove('active');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.add('active');
            }, 2500); // Change image every 2.5 seconds
        }
    });

});
