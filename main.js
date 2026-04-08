/* =============================================
   M2E PROJECT — Apple-inspired interactions
   Parallax, scroll-triggered reveals, sticky text,
   smooth physics-based animations
   ============================================= */

(function () {
    'use strict';

    // ─── NAVIGATION ──────────────────────────────
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll detection for nav background
    let lastScroll = 0;
    let ticking = false;

    function updateNav() {
        const scrollY = window.scrollY;
        nav.classList.toggle('is-scrolled', scrollY > 60);
        lastScroll = scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(updateNav);
            ticking = true;
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('is-active');
        navLinks.classList.toggle('is-open');
        document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navToggle.classList.remove('is-active');
            navLinks.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    });

    // ─── INTERSECTION OBSERVER — SCROLL REVEALS ──
    // Apple-style: elements fade up + scale subtly as they enter viewport
    const revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Once revealed, stop observing for performance
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px',
        }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    // ─── PARALLAX — APPLE STYLE ──────────────────
    // Subtle depth layers that move at different speeds on scroll
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    const parallaxElements = [];

    function initParallax() {
        // Hero curve moves slower than scroll
        var heroCurve = document.querySelector('.hero__curve');
        if (heroCurve) {
            parallaxElements.push({
                el: heroCurve,
                speed: 0.3,
                currentY: 0,
                targetY: 0,
            });
        }

        // Hero content fades & moves up on scroll
        var heroContent = document.querySelector('.hero__content');
        if (heroContent) {
            parallaxElements.push({
                el: heroContent,
                speed: -0.15,
                currentY: 0,
                targetY: 0,
                opacity: true,
            });
        }

        // Intro accent shape
        var accentShape = document.querySelector('.intro__accent-shape');
        if (accentShape) {
            parallaxElements.push({
                el: accentShape,
                speed: 0.2,
                currentY: 0,
                targetY: 0,
            });
        }

        // Process background circle
        var processBg = document.querySelector('.process::before');
        if (processBg) {
            parallaxElements.push({
                el: processBg,
                speed: 0.15,
                currentY: 0,
                targetY: 0,
            });
        }
    }

    // Smooth parallax with lerp (Apple-like buttery smoothness)
    var parallaxRAF;

    function updateParallax() {
        var scrollY = window.scrollY;
        var windowHeight = window.innerHeight;

        parallaxElements.forEach(function (item) {
            var rect = item.el.getBoundingClientRect();
            var elementCenter = rect.top + rect.height / 2;
            var distFromCenter = elementCenter - windowHeight / 2;

            item.targetY = distFromCenter * item.speed;
            item.currentY = lerp(item.currentY, item.targetY, 0.08);

            var transform = 'translateY(' + item.currentY.toFixed(2) + 'px)';

            if (item.opacity) {
                // Fade out hero content as user scrolls
                var progress = Math.max(0, Math.min(1, scrollY / (windowHeight * 0.6)));
                var opacity = 1 - progress;
                item.el.style.transform = transform;
                item.el.style.opacity = opacity.toFixed(3);
            } else {
                item.el.style.transform = transform;
            }
        });

        parallaxRAF = requestAnimationFrame(updateParallax);
    }

    // ─── SMOOTH SCROLL ANCHORS ───────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;

            var target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                var headerOffset = 80;
                var elementPosition = target.getBoundingClientRect().top;
                var offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
            }
        });
    });

    // ─── EXPERTISE CARDS — STAGGER ON HOVER ──────
    document.querySelectorAll('.expertise__card').forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ─── PORTFOLIO ITEMS — MAGNETIC HOVER ────────
    // Apple-like: cursor creates a subtle "magnetic" pull effect
    document.querySelectorAll('.portfolio__item').forEach(function (item) {
        item.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;

            var moveX = (x - centerX) / centerX * 4;
            var moveY = (y - centerY) / centerY * 4;

            this.style.transform = 'scale(1.02) translate(' + moveX + 'px, ' + moveY + 'px)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        });

        item.addEventListener('mouseenter', function () {
            this.style.transition = 'transform 0.15s ease-out';
        });
    });

    // ─── PRICING CARDS — TILT EFFECT ─────────────
    document.querySelectorAll('.pricing__card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;

            var tiltX = (0.5 - y) * 6;
            var tiltY = (x - 0.5) * 6;

            this.style.transform =
                'translateY(-8px) perspective(1000px) rotateX(' +
                tiltX.toFixed(2) +
                'deg) rotateY(' +
                tiltY.toFixed(2) +
                'deg)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ─── HERO TEXT — CHARACTER REVEAL (Apple keynote style) ──
    function animateHeroText() {
        var heroTitle = document.querySelector('.hero__title');
        if (!heroTitle) return;

        heroTitle.querySelectorAll('span').forEach(function (span, i) {
            span.style.opacity = '0';
            span.style.transform = 'translateY(60px)';
            span.style.transition = 'none';

            setTimeout(function () {
                span.style.transition =
                    'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, 300 + i * 200);
        });
    }

    // ─── SCROLL PROGRESS — SECTIONS ──────────────
    // Apple.com style: sections get subtle scale/opacity transitions
    function initSectionTransitions() {
        var sections = document.querySelectorAll('section');

        var sectionObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -10% 0px',
            }
        );

        sections.forEach(function (section) {
            section.style.opacity = '0';
            section.style.transform = 'scale(0.98)';
            section.style.transition = 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)';
            sectionObserver.observe(section);
        });
    }

    // ─── COUNTER ANIMATION (for numbers if needed) ──
    function animateCounter(el, target, duration) {
        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out quart
            var eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // ─── CONTACT FORM — Simple validation feedback ──
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            // If you want to use Formspree, keep the default submit.
            // For now, show a simple confirmation without a backend.
            e.preventDefault();

            var btn = this.querySelector('button[type="submit"]');
            var originalText = btn.textContent;

            btn.textContent = 'Envoyé !';
            btn.style.background = '#2D8B5A';
            btn.disabled = true;

            setTimeout(function () {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ─── FORM INPUT ANIMATIONS ───────────────────
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(function (input) {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('is-focused');
        });
        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('is-focused');
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
    });

    // ─── CURSOR GLOW (subtle, Apple-inspired) ────
    function initCursorGlow() {
        // Only on desktop
        if (window.matchMedia('(pointer: fine)').matches) {
            var glow = document.createElement('div');
            glow.classList.add('cursor-glow');
            document.body.appendChild(glow);

            var glowX = 0,
                glowY = 0,
                currentX = 0,
                currentY = 0;

            document.addEventListener('mousemove', function (e) {
                glowX = e.clientX;
                glowY = e.clientY;
            });

            function animateGlow() {
                currentX = lerp(currentX, glowX, 0.08);
                currentY = lerp(currentY, glowY, 0.08);
                glow.style.left = currentX + 'px';
                glow.style.top = currentY + 'px';
                requestAnimationFrame(animateGlow);
            }

            animateGlow();
        }
    }

    // ─── INIT ────────────────────────────────────
    function init() {
        animateHeroText();
        initParallax();
        initSectionTransitions();
        initCursorGlow();
        updateParallax();
    }

    // Wait for fonts + images
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
