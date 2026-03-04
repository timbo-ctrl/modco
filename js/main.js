/**
 * Modco Website Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Splash Screen ---
    const splashScreen = document.getElementById('splash-screen');
    if (splashScreen) {
        const splashLogo = splashScreen.querySelector('.splash-logo');
        const loaderLine = splashScreen.querySelector('.loader-line');

        setTimeout(() => {
            if (splashLogo) splashLogo.classList.add('logo-exit');
            if (loaderLine) loaderLine.classList.add('logo-exit');

            setTimeout(() => {
                splashScreen.classList.add('fade-out');
                setTimeout(() => {
                    splashScreen.remove();
                }, 1000);
            }, 400);
        }, 900);
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

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    fadeElements.forEach(el => fadeObserver.observe(el));


    // --- Scroll Trigger sequence for Products ---
    function setupScrollJack(trackId, leftId, rightId, contentId) {
        const track = document.getElementById(trackId);
        const leftEl = leftId ? document.getElementById(leftId) : null;
        const rightEl = rightId ? document.getElementById(rightId) : null;
        const contentEl = document.getElementById(contentId);
        const centerEl = track ? track.querySelector('.center-large') : null;

        if (!track) return;

        const isMobile = window.innerWidth <= 1024;

        // Desktop: lerp for buttery mouse-wheel smoothness
        // Mobile: direct mapping — touch scrolling is already smooth, lerp fights it
        const LERP = 0.08;
        let currentProgress = 0;

        // Initial state for desktop side images
        if (!isMobile) {
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

        const interp = (p, start, end) => {
            if (p <= start) return 0;
            if (p >= end) return 1;
            return (p - start) / (end - start);
        };

        function getProgress() {
            const rect = track.getBoundingClientRect();
            const scrollDistance = -rect.top;
            const totalScroll = rect.height - window.innerHeight;
            let p = totalScroll > 0 ? scrollDistance / totalScroll : 0;
            return Math.max(0, Math.min(1, p));
        }

        function applyMobile(progress) {
            const leftRevealP = interp(progress, 0.05, 0.30);
            const rightRevealP = interp(progress, 0.35, 0.60);
            const contentP = interp(progress, 0.65, 0.85);

            if (centerEl) centerEl.style.opacity = 1;

            if (leftEl) {
                leftEl.style.opacity = leftRevealP > 0.01 ? 1 : 0;
                leftEl.style.transform = `translateY(calc(-50% + ${(1 - leftRevealP) * 100}%))`;
            }
            if (rightEl) {
                rightEl.style.opacity = rightRevealP > 0.01 ? 1 : 0;
                rightEl.style.transform = `translateY(calc(-50% + ${(1 - rightRevealP) * 100}%))`;
            }
            if (contentEl) {
                contentEl.style.opacity = contentP;
                contentEl.style.transform = `translateY(${(1 - contentP) * 30}%)`;
            }
        }

        function applyDesktop(progress) {
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

        if (isMobile) {
            // Mobile: rAF-throttled scroll mapping for smooth 60fps updates
            let mobileRafId = null;
            window.addEventListener('scroll', () => {
                if (mobileRafId) return; // skip if frame already queued
                mobileRafId = requestAnimationFrame(() => {
                    applyMobile(getProgress());
                    mobileRafId = null;
                });
            }, { passive: true });
        } else {
            // Desktop: lerp animation loop for buttery mouse-wheel smoothness
            function animate() {
                const target = getProgress();
                currentProgress += (target - currentProgress) * LERP;
                applyDesktop(currentProgress);
                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }
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
            }, 2500);
        }
    });

});
