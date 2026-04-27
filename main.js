/* =============================================
   M2E PROJECT — Animations & Interactions (v4)
   Loader, scroll progress, magnetic buttons, counters,
   custom cursor, parallax, portfolio expand, floating CTAs
   ============================================= */

(function () {
    'use strict';

    // ─── HELPERS ─────────────────────────────────
    function lerp(a, b, t) { return a + (b - a) * t; }

    function rafThrottle(fn) {
        var queued = false;
        return function () {
            var args = arguments;
            var ctx = this;
            if (!queued) {
                queued = true;
                requestAnimationFrame(function () {
                    fn.apply(ctx, args);
                    queued = false;
                });
            }
        };
    }

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── PAGE LOADER ─────────────────────────────
    var pageLoader = document.querySelector('.page-loader');
    function hideLoader() {
        if (!pageLoader) return;
        setTimeout(function () {
            pageLoader.classList.add('is-hidden');
            setTimeout(function () { pageLoader.style.display = 'none'; }, 800);
        }, 1200);
    }

    // ─── SCROLL PROGRESS BAR ─────────────────────
    var progressBar = document.querySelector('.scroll-progress__bar');
    function updateProgress() {
        if (!progressBar) return;
        var scroll = window.scrollY;
        var height = document.documentElement.scrollHeight - window.innerHeight;
        var pct = height > 0 ? (scroll / height) * 100 : 0;
        progressBar.style.width = pct + '%';
    }

    // ─── NAVIGATION ──────────────────────────────
    var nav = document.getElementById('nav');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    function updateNav() {
        var scrollY = window.scrollY;
        if (nav) nav.classList.toggle('is-scrolled', scrollY > 60);
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('is-active');
            navLinks.classList.toggle('is-open');
            document.body.style.overflow = navLinks.classList.contains('is-open') ? 'hidden' : '';
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navToggle.classList.remove('is-active');
                navLinks.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    }

    // Active link tracking based on section in viewport
    var sectionIds = ['intro', 'expertise', 'realisations', 'formules', 'contact'];
    var activeLinkObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id;
                    document.querySelectorAll('.nav__links a').forEach(function (a) {
                        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sectionIds.forEach(function (id) {
        var s = document.getElementById(id);
        if (s) activeLinkObserver.observe(s);
    });

    // ─── INTERSECTION OBSERVER — SCROLL REVEALS ──
    var revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
    });

    // Pricing categories animated underline
    document.querySelectorAll('.pricing__category').forEach(function (cat) {
        revealObserver.observe(cat);
    });

    // ─── PARALLAX ────────────────────────────────
    var parallaxElements = [];

    function initParallax() {
        if (prefersReducedMotion) return;

        var heroCurve = document.querySelector('.hero__curve');
        if (heroCurve) parallaxElements.push({ el: heroCurve, speed: 0.25, currentY: 0, targetY: 0 });

        var heroContent = document.querySelector('.hero__content');
        if (heroContent) parallaxElements.push({ el: heroContent, speed: -0.12, currentY: 0, targetY: 0, opacity: true });

        var accentShape = document.querySelector('.intro__accent-shape');
        if (accentShape) parallaxElements.push({ el: accentShape, speed: 0.18, currentY: 0, targetY: 0 });

        var introMain = document.querySelector('.intro__image--main');
        if (introMain) parallaxElements.push({ el: introMain, speed: -0.06, currentY: 0, targetY: 0 });
    }

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
                var progress = Math.max(0, Math.min(1, scrollY / (windowHeight * 0.7)));
                var opacity = 1 - progress;
                item.el.style.transform = transform;
                item.el.style.opacity = opacity.toFixed(3);
            } else {
                item.el.style.transform = transform;
            }
        });

        requestAnimationFrame(updateParallax);
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
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // ─── MAGNETIC BUTTONS ────────────────────────
    function initMagneticButtons() {
        if (prefersReducedMotion) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;

        document.querySelectorAll('.btn, .nav__cta').forEach(function (btn) {
            var strength = 0.22;
            btn.addEventListener('mousemove', function (e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * strength).toFixed(2) + 'px, ' + (y * strength).toFixed(2) + 'px)';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                setTimeout(function () { btn.style.transition = ''; }, 600);
            });
            btn.addEventListener('mouseenter', function () {
                btn.style.transition = 'transform 0.15s ease-out';
            });
        });
    }

    // ─── EXPERTISE CARDS — STAGGER ON HOVER ──────
    document.querySelectorAll('.expertise__card').forEach(function (card) {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-6px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ─── PRICING CARDS — TILT EFFECT + MOUSE TRACK ──
    document.querySelectorAll('.pricing__card').forEach(function (card) {
        if (prefersReducedMotion) return;
        card.addEventListener('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;

            this.style.setProperty('--mouse-x', (x * 100) + '%');
            this.style.setProperty('--mouse-y', (y * 100) + '%');

            var tiltX = (0.5 - y) * 5;
            var tiltY = (x - 0.5) * 5;
            this.style.transform =
                'translateY(-10px) perspective(1200px) rotateX(' + tiltX.toFixed(2) +
                'deg) rotateY(' + tiltY.toFixed(2) + 'deg)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // ─── HERO TEXT — CHARACTER REVEAL ────────────
    function animateHeroText() {
        var heroTitle = document.querySelector('.hero__title');
        if (!heroTitle) return;

        heroTitle.querySelectorAll('span').forEach(function (span, i) {
            span.style.opacity = '0';
            span.style.transform = 'translateY(80px)';
            span.style.transition = 'none';

            setTimeout(function () {
                span.style.transition =
                    'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)';
                span.style.opacity = '1';
                span.style.transform = 'translateY(0)';
            }, 350 + i * 180);
        });
    }

    // ─── SECTION SCALE TRANSITIONS ───────────────
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
            { threshold: 0.05, rootMargin: '0px 0px -10% 0px' }
        );

        sections.forEach(function (section) {
            section.style.opacity = '0';
            section.style.transform = 'scale(0.985)';
            section.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
            sectionObserver.observe(section);
        });
    }

    // ─── COUNTER ANIMATION ───────────────────────
    function animateCounter(el, target, duration) {
        var startTime = null;
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }

    function initCounters() {
        var counters = document.querySelectorAll('[data-counter]');
        if (!counters.length) return;

        var counterObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var target = parseInt(el.getAttribute('data-counter'), 10);
                        animateCounter(el, target, 1800);
                        counterObserver.unobserve(el);
                    }
                });
            },
            { threshold: 0.5 }
        );

        counters.forEach(function (c) { counterObserver.observe(c); });
    }

    // ─── CONTACT FORM ────────────────────────────
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = this.querySelector('button[type="submit"]');
            var originalText = btn.textContent;
            var formData = new FormData(contactForm);

            btn.textContent = 'Envoi en cours...';
            btn.disabled = true;

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(function (response) {
                if (response.ok) {
                    btn.textContent = '✓ Envoyé !';
                    btn.style.background = '#2D8B5A';
                    contactForm.reset();
                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                } else {
                    btn.textContent = 'Erreur, réessayez';
                    btn.style.background = '#C0392B';
                    setTimeout(function () {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                }
            }).catch(function () {
                btn.textContent = 'Erreur, réessayez';
                btn.style.background = '#C0392B';
                setTimeout(function () {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 3000);
            });
        });
    }

    // ─── FORM INPUT ANIMATIONS ───────────────────
    document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(function (input) {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('is-focused');
        });
        input.addEventListener('blur', function () {
            this.parentElement.classList.remove('is-focused');
            if (this.value) this.parentElement.classList.add('has-value');
            else this.parentElement.classList.remove('has-value');
        });
    });

    // ─── CURSOR (glow + dot) ─────────────────────
    function initCursor() {
        if (prefersReducedMotion) return;
        if (!window.matchMedia('(pointer: fine)').matches) return;

        var glow = document.createElement('div');
        glow.classList.add('cursor-glow');
        document.body.appendChild(glow);

        var dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        var glowX = 0, glowY = 0, currentX = 0, currentY = 0;
        var dotX = 0, dotY = 0, dotCurrentX = 0, dotCurrentY = 0;

        document.addEventListener('mousemove', function (e) {
            glowX = e.clientX;
            glowY = e.clientY;
            dotX = e.clientX;
            dotY = e.clientY;
        });

        // Hoverable elements — enlarge cursor
        var hoverables = document.querySelectorAll(
            'a, button, .btn, .pricing__card, .portfolio__card, .expertise__card, .intro__image-stack, .floating-btn, input, textarea, select'
        );
        hoverables.forEach(function (h) {
            h.addEventListener('mouseenter', function () {
                glow.classList.add('is-hover');
                dot.classList.add('is-hover');
            });
            h.addEventListener('mouseleave', function () {
                glow.classList.remove('is-hover');
                dot.classList.remove('is-hover');
            });
        });

        function animateCursor() {
            currentX = lerp(currentX, glowX, 0.08);
            currentY = lerp(currentY, glowY, 0.08);
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';

            dotCurrentX = lerp(dotCurrentX, dotX, 0.25);
            dotCurrentY = lerp(dotCurrentY, dotY, 0.25);
            dot.style.left = dotCurrentX + 'px';
            dot.style.top = dotCurrentY + 'px';

            requestAnimationFrame(animateCursor);
        }
        animateCursor();
    }

    // ─── IMAGE FADE-IN ON LOAD ───────────────────
    function initImageReveal() {
        var images = document.querySelectorAll(
            '.intro__image img, .portfolio__card-img img, .portfolio__dossier-img img'
        );
        var imgObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.style.opacity = '1';
                    img.style.transform = '';
                    img.style.filter = 'blur(0)';
                    imgObserver.unobserve(img);
                }
            });
        }, { threshold: 0.1 });

        images.forEach(function (img) {
            // Don't override transform on portfolio__card-img (used for hover scale)
            var isCardImg = img.closest('.portfolio__card-img');
            img.style.opacity = '0';
            if (!isCardImg) img.style.transform = 'scale(1.04)';
            img.style.filter = 'blur(8px)';
            img.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), filter 1s cubic-bezier(0.16, 1, 0.3, 1)' +
                                   (isCardImg ? '' : ', transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)');
            imgObserver.observe(img);
        });
    }

    // ─── FLOATING BUTTONS (show after scroll) ────
    function initFloatingButtons() {
        var buttons = document.getElementById('floatingButtons');
        if (!buttons) return;

        function toggle() {
            if (window.scrollY > 400) {
                buttons.classList.add('is-visible');
            } else {
                buttons.classList.remove('is-visible');
            }
        }
        window.addEventListener('scroll', toggle, { passive: true });
        toggle();
    }

    // ─── PORTFOLIO — EXPANSION INLINE ────────────
    function initPortfolioExpand() {
        var cards = document.querySelectorAll('.portfolio__card');
        if (!cards.length) return;

        function collapseAll(except) {
            cards.forEach(function (c) {
                if (c !== except) c.classList.remove('is-expanded');
            });
        }

        cards.forEach(function (card) {
            var trigger = card.querySelector('.portfolio__card-trigger');
            var cover = card.querySelector('.portfolio__card-img img');
            if (!trigger || !cover) return;
            var initialCover = cover.getAttribute('data-cover');
            var thumbs = card.querySelectorAll('.portfolio__thumb');
            var strip = card.querySelector('.portfolio__expand-strip');

            trigger.addEventListener('click', function () {
                var isOpen = card.classList.contains('is-expanded');
                if (isOpen) {
                    card.classList.remove('is-expanded');
                    cover.src = initialCover;
                    thumbs.forEach(function (t, i) { t.classList.toggle('is-active', i === 0); });
                } else {
                    collapseAll(card);
                    card.classList.add('is-expanded');
                }
            });

            thumbs.forEach(function (thumb) {
                thumb.addEventListener('click', function (e) {
                    e.stopPropagation();
                    var src = thumb.getAttribute('data-src');
                    cover.src = src;
                    thumbs.forEach(function (t) { t.classList.remove('is-active'); });
                    thumb.classList.add('is-active');
                });
            });

            // Vertical wheel → horizontal scroll on the strip
            if (strip) {
                strip.addEventListener('wheel', function (e) {
                    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                        e.preventDefault();
                        strip.scrollLeft += e.deltaY;
                    }
                }, { passive: false });
            }
        });

        // Click outside any card → collapse all
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.portfolio__card')) {
                collapseAll(null);
            }
        });
    }

    // ─── SCROLL HANDLER (consolidated) ──────────
    var onScroll = rafThrottle(function () {
        updateNav();
        updateProgress();
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    // ─── INIT ────────────────────────────────────
    function init() {
        animateHeroText();
        initParallax();
        initSectionTransitions();
        initCursor();
        initMagneticButtons();
        initCounters();
        initImageReveal();
        initFloatingButtons();
        initPortfolioExpand();
        if (parallaxElements.length) updateParallax();
        updateProgress();
        updateNav();
        hideLoader();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
