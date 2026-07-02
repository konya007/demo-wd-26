/**
 * ============================================================
 *  main.js — Aurora Studio SPA
 *  Hash router + dark/light toggle + count-up animation
 *  Đọc từ window.DATA_WEB_DESIGN, lắng nghe 'webdesign2026:datachange'
 * ============================================================
 */

(function () {
    'use strict';

    // --- Icon Mapping ---
    const ICON_MAP = {
        'layout-template': 'layout-template', 'code-2': 'code-2',
        'palette': 'palette', 'smartphone': 'smartphone',
        'rocket': 'rocket', 'eye': 'eye', 'target': 'target',
        'shield-check': 'shield-check', 'mail': 'mail',
        'phone': 'phone', 'map-pin': 'map-pin', 'clock': 'clock',
        'facebook': 'facebook', 'instagram': 'instagram',
        'linkedin': 'linkedin', 'github': 'github',
    };

    const SOCIAL_ICONS = {
        facebook: 'facebook', instagram: 'instagram',
        linkedin: 'linkedin', github: 'github',
        twitter: 'twitter', youtube: 'youtube',
    };

    // ============================================================
    //  HELPERS
    // ============================================================
    function $(sel, parent) { return (parent || document).querySelector(sel); }
    function $$(sel, parent) { return (parent || document).querySelectorAll(sel); }
    function getData() { return window.DATA_WEB_DESIGN || null; }
    function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

    function refreshIcons() {
        if (window.lucide) lucide.createIcons();
    }

    // ============================================================
    //  THEME TOGGLE (Dark / Light)
    // ============================================================
    function initTheme() {
        const saved = localStorage.getItem('wd-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = saved === 'dark' || (!saved && prefersDark);
        document.documentElement.classList.toggle('dark', isDark);

        const btn = $('#themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const dark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('wd-theme', dark ? 'dark' : 'light');
                refreshIcons();
            });
        }
    }

    // ============================================================
    //  COUNT-UP ANIMATION
    // ============================================================
    function animateCountUp(el, target, duration) {
        duration = duration || 1500;
        // Parse target: "120+" → 120, suffix "+"
        const match = String(target).match(/^([\d.]+)(.*)$/);
        if (!match) { el.textContent = target; return; }
        const num = parseFloat(match[1]);
        const suffix = match[2];
        const start = performance.now();

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(num * eased);
            el.textContent = current + suffix;
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(step);
    }

    function observeCountUps(root) {
        const counters = root.querySelectorAll('.count-up');
        if (!counters.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = el.getAttribute('data-target') || el.textContent.trim();
                    animateCountUp(el, target, 1500);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(el => observer.observe(el));
    }

    // ============================================================
    //  SCROLL REVEAL (Intersection Observer)
    // ============================================================
    function revealOnScroll(root) {
        const reveals = (root || document).querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(el => observer.observe(el));
    }

    // ============================================================
    //  SEO
    // ============================================================
    function updateSEO(data) {
        if (!data || !data.seo) return;
        const seo = data.seo;
        document.title = seo.title || document.title;
        const metaDesc = $('meta[name="description"]');
        if (metaDesc && seo.description) metaDesc.setAttribute('content', seo.description);
        const favicon = $('link[rel="icon"]');
        if (favicon && seo.favicon) favicon.setAttribute('href', seo.favicon);
    }

    // ============================================================
    //  NAVBAR / FOOTER DATA
    // ============================================================
    function updateBranding(data) {
        if (!data || !data.organization) return;
        const org = data.organization;
        const navLogo = $('#navLogo');
        const navBrand = $('#navBrand');
        const footerLogo = $('#footerLogo');
        const footerBrand = $('#footerBrand');
        const footerTagline = $('#footerTagline');
        const footerCopyright = $('#footerCopyright');

        if (navLogo && org.logoLight) navLogo.src = org.logoLight;
        if (navBrand && org.shortName) navBrand.textContent = org.shortName;
        if (footerLogo && org.logoDark) footerLogo.src = org.logoDark;
        if (footerBrand && org.shortName) footerBrand.textContent = org.shortName;
        if (footerTagline && org.tagline) footerTagline.textContent = org.tagline;
        if (footerCopyright && org) {
            const year = org.foundedYear || new Date().getFullYear();
            footerCopyright.textContent = '\u00A9 ' + year + ' ' + (org.name || 'Aurora Studio') + '. All rights reserved.';
        }

        // Inject dynamic theme colors from data.theme
        injectThemeColors(data);
    }

    // ============================================================
    //  DYNAMIC THEME COLOR INJECTION
    //  Override all Tailwind blue-* classes with data.theme.colors.primary
    // ============================================================
    function injectThemeColors(data) {
        const id = 'theme-dynamic';
        let style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }

        const primary = (data && data.theme && data.theme.colors && data.theme.colors.primary) || '#2563EB';
        const light = (data && data.theme && data.theme.colors && data.theme.colors['primary-light']) || primary;
        const dark = (data && data.theme && data.theme.colors && data.theme.colors['primary-dark']) || primary;

        // Convert hex to RGB for opacity variants
        const hexToRgb = (h) => {
            const r = parseInt(h.slice(1, 3), 16);
            const g = parseInt(h.slice(3, 5), 16);
            const b = parseInt(h.slice(5, 7), 16);
            return `${r},${g},${b}`;
        };
        const rgb = hexToRgb(primary);

        style.textContent = `
            :root {
                --color-primary: ${primary};
                --color-primary-light: ${light};
                --color-primary-dark: ${dark};
                --color-primary-rgb: ${rgb};
            }

            /* --- Backgrounds --- */
            .bg-blue-600\\/90,
            .bg-blue-600 { background-color: var(--color-primary) !important; }
            .bg-blue-700,
            .hover\\:bg-blue-700:hover { background-color: var(--color-primary-dark) !important; }
            .bg-blue-500 { background-color: var(--color-primary-light) !important; }

            /* --- Text --- */
            .text-blue-600,
            .hover\\:text-blue-600:hover,
            .group:hover .group-hover\\:text-blue-600,
            .group-hover\\:text-blue-600 { color: var(--color-primary) !important; }

            .dark .dark\\:text-blue-400,
            .dark .dark\\:group-hover\\:text-blue-400 { color: var(--color-primary-light) !important; }

            /* --- Borders --- */
            .border-blue-600,
            .hover\\:border-blue-600:hover,
            .focus\\:border-blue-600:focus { border-color: var(--color-primary) !important; }
            .hover\\:border-blue-300:hover { border-color: rgba(var(--color-primary-rgb), 0.4) !important; }
            .dark .dark\\:hover\\:border-blue-600:hover { border-color: var(--color-primary) !important; }
            .dark .dark\\:border-blue-600 { border-color: var(--color-primary) !important; }

            /* --- Blue-50 (light bg) --- */
            .bg-blue-50 { background-color: rgba(var(--color-primary-rgb), 0.08) !important; }
            .hover\\:bg-blue-50:hover { background-color: rgba(var(--color-primary-rgb), 0.12) !important; }

            /* --- Blue-100 (slightly stronger bg) --- */
            .bg-blue-100 { background-color: rgba(var(--color-primary-rgb), 0.15) !important; }
            .dark .dark\\:bg-blue-100 { background-color: rgba(var(--color-primary-rgb), 0.15) !important; }

            /* --- Blue-900/30 (dark mode bg) --- */
            .dark .dark\\:bg-blue-900\\/30 { background-color: rgba(var(--color-primary-rgb), 0.2) !important; }

            /* --- Ring / Focus --- */
            .focus\\:ring-blue-100:focus,
            .focus\\:ring-2.focus\\:ring-blue-100:focus { box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2) !important; }
            .dark .dark\\:focus\\:ring-blue-900:focus { box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.3) !important; }

            /* --- Shadows --- */
            .shadow-blue-600\\/25 { box-shadow: 0 10px 15px -3px rgba(var(--color-primary-rgb), 0.25) !important; }
            .hover\\:shadow-blue-600\\/30:hover { box-shadow: 0 20px 25px -5px rgba(var(--color-primary-rgb), 0.3) !important; }
            .hover\\:shadow-xl.hover\\:shadow-blue-600\\/30:hover { box-shadow: 0 20px 25px -5px rgba(var(--color-primary-rgb), 0.3) !important; }

            /* --- Blue-400 --- */
            .text-blue-400 { color: var(--color-primary-light) !important; }
            .dark .dark\\:text-blue-400 { color: var(--color-primary-light) !important; }

            /* --- Blue-700 text --- */
            .text-blue-700 { color: var(--color-primary-dark) !important; }
            .dark .dark\\:text-blue-700 { color: var(--color-primary-dark) !important; }

            /* --- Blue-50 dark variant --- */
            .dark .dark\\:bg-blue-900\\/20 { background-color: rgba(var(--color-primary-rgb), 0.15) !important; }
        `;
    }
    function setupNavbar() {
        const navbar = $('#navbar');
        if (!navbar) return;
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
        // Initial state
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }

    // ============================================================
    //  MOBILE MENU
    // ============================================================
    function setupMobileMenu() {
        const btn = $('#mobileMenuBtn');
        const menu = $('#mobileMenu');
        if (!btn || !menu) return;

        btn.addEventListener('click', () => menu.classList.toggle('hidden'));

        menu.addEventListener('click', (e) => {
            if (e.target.closest('a')) menu.classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.add('hidden');
            }
        });
    }

    // ============================================================
    //  ACTIVE NAV LINK
    // ============================================================
    function setActiveNav(route) {
        $$('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === route ||
                (route.startsWith('#/projects/') && link.getAttribute('href') === '#/projects')) {
                link.classList.add('active');
            }
        });
    }

    // ============================================================
    //  PAGE RENDERERS
    // ============================================================

    // --- LANDING PAGE ---
    function renderLanding(data) {
        const d = data;
        const org = d.organization || {};
        const hero = d.hero || {};
        const services = d.services || [];
        const projects = d.projects || [];
        const partners = d.partners || [];
        const contact = d.contact || {};

        // Featured projects (max 3)
        const featured = projects.filter(p => p.featured).slice(0, 3);

        return `
        <!-- HERO -->
        <section class="relative min-h-screen flex items-center overflow-hidden">
            <div class="absolute inset-0 hero-bg transition-all duration-700"
                 style="background-image: url('${hero.backgroundImage || 'https://picsum.photos/seed/wd2026-hero/1600/900'}');">
                <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/60 to-gray-900/40"></div>
            </div>
            <div class="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
                <div class="max-w-3xl">
                    <span class="inline-block px-4 py-1.5 bg-blue-600/90 text-white text-sm font-medium rounded-full mb-6 animate-in" style="animation-delay:0.1s">${escapeHtml(hero.eyebrow || 'Welcome')}</span>
                    <h1 class="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-in" style="animation-delay:0.3s">${escapeHtml(hero.title || 'We turn ideas into memorable digital experiences')}</h1>
                    <p class="text-lg sm:text-xl text-gray-200 leading-relaxed mb-10 animate-in max-w-2xl" style="animation-delay:0.5s">${escapeHtml(hero.subtitle || '')}</p>
                    <div class="flex flex-wrap gap-4 animate-in" style="animation-delay:0.7s">
                        <a href="#/projects" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5">${hero.ctaPrimary ? escapeHtml(hero.ctaPrimary.text) : 'Xem dự án'}</a>
                        <a href="#/contact" class="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:-translate-y-0.5">${hero.ctaSecondary ? escapeHtml(hero.ctaSecondary.text) : 'Liên hệ'}</a>
                    </div>
                    ${hero.stats && hero.stats.length ? `
                    <div class="flex flex-wrap gap-8 lg:gap-12 mt-16 animate-in" style="animation-delay:0.9s">
                        ${hero.stats.map(s => `
                        <div class="text-white">
                            <div class="count-up text-3xl lg:text-4xl font-display font-bold" data-target="${escapeHtml(String(s.value))}">${escapeHtml(String(s.value))}</div>
                            <div class="text-sm text-gray-300 mt-1">${escapeHtml(s.label)}</div>
                        </div>`).join('')}
                    </div>` : ''}
                </div>
            </div>
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                <i data-lucide="chevron-down" class="w-6 h-6 text-white/60"></i>
            </div>
        </section>

        <!-- SERVICES — casual horizontal scroll -->
        ${services.length ? `
        <section class="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-end justify-between mb-12">
                    <div>
                        <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Dịch vụ</span>
                        <h2 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3">Những gì chúng tôi làm tốt nhất</h2>
                    </div>
                    <div class="hidden sm:flex items-center gap-2">
                        <button onclick="this.closest('section').querySelector('.scroll-x').scrollBy({left:-340,behavior:'smooth'})" class="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm transition-all group" aria-label="Scroll left">
                            <i data-lucide="chevron-left" class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
                        </button>
                        <button onclick="this.closest('section').querySelector('.scroll-x').scrollBy({left:340,behavior:'smooth'})" class="p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm transition-all group" aria-label="Scroll right">
                            <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"></i>
                        </button>
                    </div>
                </div>
                <div class="scroll-x flex gap-5 overflow-x-auto pb-8 -mx-4 px-4">
                    ${services.map((svc, i) => `
                    <div class="service-card group shrink-0 w-[300px] sm:w-[340px] bg-white dark:bg-gray-800 rounded-3xl p-7 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl reveal cursor-default" style="transition-delay:${i * 0.08}s">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                             style="background: linear-gradient(135deg, ${['#EEF2FF','#FEF3C7','#FCE7F3','#D1FAE5','#E0E7FF','#FEE2E2'][i%6]}, ${['#C7D2FE','#FDE68A','#F9A8D4','#A7F3D0','#C7D2FE','#FECACA'][i%6]})">
                            <i data-lucide="${ICON_MAP[svc.icon] || 'zap'}" class="w-7 h-7" style="color: ${['#4F46E5','#D97706','#DB2777','#059669','#4F46E5','#DC2626'][i%6]}"></i>
                        </div>
                        <h3 class="font-display text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(svc.title)}</h3>
                        <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">${escapeHtml(svc.description)}</p>
                        <div class="mt-5 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Tìm hiểu thêm</span>
                            <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </div>
                    </div>`).join('')}
                </div>
                <!-- Mobile scroll hint -->
                <div class="mt-6 flex justify-center sm:hidden">
                    <span class="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        Vuốt để xem thêm
                        <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    </span>
                </div>
            </div>
        </section>` : ''}

        <!-- FEATURED PROJECTS (horizontal scroll, max 3) -->
        ${featured.length ? `
        <section class="py-20 lg:py-28 bg-white dark:bg-gray-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-end justify-between mb-12">
                    <div>
                        <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Dự án</span>
                        <h2 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3">Dự án tiêu biểu</h2>
                    </div>
                    <a href="#/projects" class="hidden sm:inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all">
                        Xem tất cả <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                </div>
                <div class="scroll-x flex gap-6 overflow-x-auto pb-4">
                    ${featured.map(p => `
                    <div class="project-card group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm shrink-0 w-[320px] sm:w-[380px] reveal">
                        <a href="#/projects/${p.id}" class="block">
                            <div class="relative overflow-hidden aspect-[4/3]">
                                <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" class="project-thumb w-full h-full object-cover" loading="lazy">
                                <div class="absolute top-3 right-3">
                                    <span class="px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded-lg">${escapeHtml(p.category)}</span>
                                </div>
                                ${p.featured ? '<div class="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">Nổi bật</div>' : ''}
                            </div>
                            <div class="p-5">
                                <span class="text-xs text-gray-400 dark:text-gray-500">${escapeHtml(p.client)} &middot; ${p.year}</span>
                                <h3 class="font-display font-bold text-gray-900 dark:text-white mt-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(p.title)}</h3>
                                <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">${escapeHtml(p.description)}</p>
                            </div>
                        </a>
                    </div>`).join('')}
                </div>
                <div class="mt-8 text-center sm:hidden">
                    <a href="#/projects" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all">
                        Xem tất cả dự án <i data-lucide="arrow-right" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </section>` : ''}

        <!-- PARTNERS -->
        ${partners.length ? `
        <section class="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p class="text-center text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-10">Khách hàng & Đối tác</p>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
                    ${partners.map(p => `
                    <div class="partner-logo reveal">
                        <img src="${p.logo}" alt="${escapeHtml(p.name)}" class="h-10 w-auto" loading="lazy">
                    </div>`).join('')}
                </div>
            </div>
        </section>` : ''}

        <!-- CONTACT -->
        ${contact ? `
        <section class="py-20 lg:py-28 bg-white dark:bg-gray-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    <div>
                        <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Liên hệ</span>
                        <h2 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-6">Hãy cùng làm việc</h2>
                        <p class="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">Bạn có dự án trong đầu? Hãy liên hệ với chúng tôi để biến ý tưởng thành hiện thực.</p>
                        <div class="space-y-6">
                            ${contact.address ? `
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <i data-lucide="map-pin" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
                                </div>
                                <div><p class="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Địa chỉ</p><p class="text-gray-900 dark:text-white font-medium">${escapeHtml(contact.address)}</p></div>
                            </div>` : ''}
                            ${contact.email ? `
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <i data-lucide="mail" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
                                </div>
                                <div><p class="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Email</p><p class="text-gray-900 dark:text-white font-medium"><a href="mailto:${escapeHtml(contact.email)}" class="text-blue-600 dark:text-blue-400 hover:underline">${escapeHtml(contact.email)}</a></p></div>
                            </div>` : ''}
                            ${contact.phone ? `
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <i data-lucide="phone" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
                                </div>
                                <div><p class="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Điện thoại</p><p class="text-gray-900 dark:text-white font-medium"><a href="tel:${escapeHtml(contact.phone)}" class="text-blue-600 dark:text-blue-400 hover:underline">${escapeHtml(contact.phone)}</a></p></div>
                            </div>` : ''}
                            ${contact.workingHours ? `
                            <div class="flex items-start gap-4">
                                <div class="w-11 h-11 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                                    <i data-lucide="clock" class="w-5 h-5 text-blue-600 dark:text-blue-400"></i>
                                </div>
                                <div><p class="text-sm text-gray-500 dark:text-gray-400 mb-0.5">Giờ làm việc</p><p class="text-gray-900 dark:text-white font-medium">${escapeHtml(contact.workingHours)}</p></div>
                            </div>` : ''}
                        </div>
                        ${contact.socials ? `
                        <div class="flex gap-4 mt-10">
                            ${Object.entries(contact.socials).filter(([,url]) => url).map(([platform, url]) => `
                            <a href="${url}" target="_blank" rel="noopener" class="w-11 h-11 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1" aria-label="${platform}">
                                <i data-lucide="${SOCIAL_ICONS[platform] || 'globe'}" class="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"></i>
                            </a>`).join('')}
                        </div>` : ''}
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 lg:p-10">
                        <h3 class="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">Gửi tin nhắn</h3>
                        <form id="contactForm" class="space-y-5">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Họ và tên</label>
                                <input type="text" placeholder="Nguyễn Văn A" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                                <input type="email" placeholder="email@example.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tin nhắn</label>
                                <textarea rows="4" placeholder="Mô tả dự án của bạn..." class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all resize-none"></textarea>
                            </div>
                            <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30">Gửi tin nhắn</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>` : ''}`;
    }

    // --- PROJECTS PAGE (all projects, search, filter, sort) ---
    function renderProjectsPage(data) {
        const projects = data.projects || [];
        const categories = [...new Set(projects.map(p => p.category))];

        return `
        <section class="pt-24 lg:pt-32 pb-20 lg:pb-28 bg-white dark:bg-gray-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-12">
                    <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Dự án</span>
                    <h1 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-4">Tất cả dự án</h1>
                    <p class="text-gray-600 dark:text-gray-400 text-lg">Khám phá những sản phẩm chúng tôi đã thực hiện.</p>
                </div>
                <!-- Search & Filter -->
                <div class="flex flex-col sm:flex-row gap-4 mb-8" id="projectFilters">
                    <div class="relative flex-1">
                        <i data-lucide="search" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i>
                        <input type="text" id="projectSearch" placeholder="Tìm kiếm dự án..." class="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
                    </div>
                    <select id="projectCategory" class="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
                        <option value="">Tất cả danh mục</option>
                        ${categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
                    </select>
                    <select id="projectSort" class="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all">
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                        <option value="name">Tên A-Z</option>
                    </select>
                </div>
                <!-- Projects Grid -->
                <div id="projectsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    ${renderProjectCards(projects)}
                </div>
                <div id="noResults" class="hidden text-center py-16">
                    <i data-lucide="folder-open" class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400 text-lg">Không tìm thấy dự án phù hợp.</p>
                </div>
            </div>
        </section>`;
    }

    function renderProjectCards(projects) {
        return projects.map((p, i) => `
        <div class="project-card group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm reveal" style="transition-delay:${i * 0.05}s" data-category="${escapeHtml(p.category)}" data-year="${p.year}" data-name="${escapeHtml(p.title.toLowerCase())}">
            <a href="#/projects/${p.id}" class="block">
                <div class="relative overflow-hidden aspect-[4/3]">
                    <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" class="project-thumb w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-3 right-3">
                        <span class="px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded-lg">${escapeHtml(p.category)}</span>
                    </div>
                    ${p.featured ? '<div class="absolute top-3 left-3 px-2.5 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg">Nổi bật</div>' : ''}
                </div>
                <div class="p-5">
                    <span class="text-xs text-gray-400 dark:text-gray-500">${escapeHtml(p.client)} &middot; ${p.year}</span>
                    <h3 class="font-display font-bold text-gray-900 dark:text-white mt-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(p.title)}</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">${escapeHtml(p.description)}</p>
                    <div class="flex flex-wrap gap-1.5 mt-3">
                        ${(p.tags || []).slice(0, 3).map(t => `<span class="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">#${escapeHtml(t)}</span>`).join('')}
                    </div>
                </div>
            </a>
        </div>`).join('');
    }

    function setupProjectFilters(data) {
        const search = $('#projectSearch');
        const category = $('#projectCategory');
        const sort = $('#projectSort');
        const grid = $('#projectsGrid');
        const noResults = $('#noResults');
        if (!search || !grid) return;

        let projects = [...(data.projects || [])];

        function applyFilters() {
            let filtered = [...projects];
            const q = search.value.toLowerCase().trim();
            const cat = category ? category.value : '';
            const s = sort ? sort.value : 'newest';

            if (q) {
                filtered = filtered.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
                    p.client.toLowerCase().includes(q)
                );
            }
            if (cat) {
                filtered = filtered.filter(p => p.category === cat);
            }
            if (s === 'newest') filtered.sort((a, b) => b.year - a.year);
            else if (s === 'oldest') filtered.sort((a, b) => a.year - b.year);
            else if (s === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));

            grid.innerHTML = filtered.length ? renderProjectCards(filtered) : '';
            if (noResults) noResults.classList.toggle('hidden', filtered.length > 0);

            revealOnScroll();
            refreshIcons();
        }

        search.addEventListener('input', applyFilters);
        if (category) category.addEventListener('change', applyFilters);
        if (sort) sort.addEventListener('change', applyFilters);
    }

    // --- PROJECT DETAIL PAGE ---
    function renderProjectDetail(data, projectId) {
        const projects = data.projects || [];
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            return `
            <section class="pt-24 lg:pt-32 pb-20 min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <div class="text-center">
                    <i data-lucide="file-question" class="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy dự án</h2>
                    <a href="#/projects" class="text-blue-600 dark:text-blue-400 hover:underline">← Quay lại danh sách dự án</a>
                </div>
            </section>`;
        }

        // Related: same category, exclude current, max 3
        const related = projects.filter(p => p.category === project.category && p.id !== project.id).slice(0, 3);

        return `
        <section class="pt-24 lg:pt-32 pb-20 bg-white dark:bg-gray-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Breadcrumb -->
                <a href="#/projects" class="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Quay lại danh sách
                </a>

                <div class="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    <!-- Image -->
                    <div class="rounded-2xl overflow-hidden">
                        <img src="${project.thumbnail}" alt="${escapeHtml(project.title)}" class="w-full h-auto object-cover rounded-2xl">
                    </div>
                    <!-- Info -->
                    <div>
                        <div class="flex items-center gap-3 mb-4">
                            <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">${escapeHtml(project.category)}</span>
                            ${project.featured ? '<span class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full">Nổi bật</span>' : ''}
                        </div>
                        <h1 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">${escapeHtml(project.title)}</h1>
                        <p class="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">${escapeHtml(project.description)}</p>

                        <div class="grid grid-cols-2 gap-4 mb-8">
                            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Khách hàng</p>
                                <p class="font-semibold text-gray-900 dark:text-white">${escapeHtml(project.client)}</p>
                            </div>
                            <div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Năm</p>
                                <p class="font-semibold text-gray-900 dark:text-white">${project.year}</p>
                            </div>
                        </div>

                        ${project.tags && project.tags.length ? `
                        <div class="mb-8">
                            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Thẻ</p>
                            <div class="flex flex-wrap gap-2">
                                ${project.tags.map(t => `<span class="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-lg">#${escapeHtml(t)}</span>`).join('')}
                            </div>
                        </div>` : ''}

                        ${project.link ? `
                        <a href="${project.link}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/25">
                            Xem dự án thật <i data-lucide="external-link" class="w-4 h-4"></i>
                        </a>` : ''}
                    </div>
                </div>

                ${related.length ? `
                <!-- Related Projects -->
                <div class="mt-20">
                    <h2 class="font-display text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-8">Dự án liên quan</h2>
                    <div class="scroll-x flex gap-6 overflow-x-auto pb-4">
                        ${related.map(p => `
                        <div class="project-card group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm shrink-0 w-[300px] sm:w-[350px] reveal">
                            <a href="#/projects/${p.id}" class="block">
                                <div class="relative overflow-hidden aspect-[4/3]">
                                    <img src="${p.thumbnail}" alt="${escapeHtml(p.title)}" class="project-thumb w-full h-full object-cover" loading="lazy">
                                </div>
                                <div class="p-4">
                                    <span class="text-xs text-gray-400 dark:text-gray-500">${escapeHtml(p.category)} &middot; ${p.year}</span>
                                    <h3 class="font-display font-bold text-gray-900 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(p.title)}</h3>
                                </div>
                            </a>
                        </div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </section>`;
    }

    // --- ABOUT PAGE ---
    function renderAboutPage(data) {
        const mission = data.mission || {};
        const org = data.organization || {};
        const services = data.services || [];

        return `
        <section class="pt-24 lg:pt-32 pb-20 lg:pb-28 bg-white dark:bg-gray-950">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <!-- Mission -->
                ${mission.title ? `
                <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
                    <div>
                        <span class="text-blue-600 dark:text-blue-400 font-semibold text-sm tracking-widest uppercase">Sứ mệnh</span>
                        <h1 class="font-display text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-3 mb-6">${escapeHtml(mission.title)}</h1>
                        <p class="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">${escapeHtml(mission.description || '')}</p>
                        ${mission.vision ? `
                        <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 dark:border-blue-400 rounded-r-xl p-5">
                            <div class="flex items-start gap-3">
                                <i data-lucide="eye" class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"></i>
                                <p class="text-gray-700 dark:text-gray-300 italic">${escapeHtml(mission.vision)}</p>
                            </div>
                        </div>` : ''}
                    </div>
                    ${mission.values && mission.values.length ? `
                    <div class="space-y-6">
                        ${mission.values.map((v, i) => `
                        <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 reveal" style="transition-delay:${i * 0.15}s">
                            <div class="flex items-start gap-4">
                                <div class="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                    <span class="text-white font-bold text-sm">${String(i + 1).padStart(2, '0')}</span>
                                </div>
                                <div>
                                    <h4 class="font-display font-bold text-gray-900 dark:text-white mb-2">${escapeHtml(v.title)}</h4>
                                    <p class="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">${escapeHtml(v.description)}</p>
                                </div>
                            </div>
                        </div>`).join('')}
                    </div>` : ''}
                </div>` : ''}

                <!-- Organization Info -->
                <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 lg:p-12 mb-20 reveal">
                    <h2 class="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Về ${escapeHtml(org.shortName || org.name || 'chúng tôi')}</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        ${org.foundedYear ? `
                        <div>
                            <div class="count-up text-3xl lg:text-4xl font-display font-bold text-blue-600 dark:text-blue-400" data-target="${org.foundedYear}">${org.foundedYear}</div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Năm thành lập</p>
                        </div>` : ''}
                        <div>
                            <div class="count-up text-3xl lg:text-4xl font-display font-bold text-blue-600 dark:text-blue-400" data-target="${(data.projects || []).length}">${(data.projects || []).length}</div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Dự án</p>
                        </div>
                        ${data.hero && data.hero.stats ? data.hero.stats.slice(0, 2).map(s => `
                        <div>
                            <div class="count-up text-3xl lg:text-4xl font-display font-bold text-blue-600 dark:text-blue-400" data-target="${escapeHtml(String(s.value))}">${escapeHtml(String(s.value))}</div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">${escapeHtml(s.label)}</p>
                        </div>`).join('') : ''}
                    </div>
                </div>

                <!-- Services (abbreviated) — casual horizontal -->
                ${services.length ? `
                <div class="reveal">
                    <h2 class="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Dịch vụ của chúng tôi</h2>
                    <div class="scroll-x flex gap-5 overflow-x-auto pb-4 -mx-4 px-4">
                        ${services.map((svc, i) => `
                        <div class="service-card group shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg cursor-default">
                            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                 style="background: linear-gradient(135deg, ${['#EEF2FF','#FEF3C7','#FCE7F3','#D1FAE5','#E0E7FF','#FEE2E2'][i%6]}, ${['#C7D2FE','#FDE68A','#F9A8D4','#A7F3D0','#C7D2FE','#FECACA'][i%6]})">
                                <i data-lucide="${ICON_MAP[svc.icon] || 'zap'}" class="w-6 h-6" style="color: ${['#4F46E5','#D97706','#DB2777','#059669','#4F46E5','#DC2626'][i%6]}"></i>
                            </div>
                            <h4 class="font-display font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${escapeHtml(svc.title)}</h4>
                            <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-3">${escapeHtml(svc.description)}</p>
                        </div>`).join('')}
                    </div>
                </div>` : ''}
            </div>
        </section>`;
    }

    // --- ACHIEVEMENTS PAGE ---
    function renderAchievementsPage(data) {
        const achievements = data.achievements || [];

        return `
        <section class="pt-24 lg:pt-32 pb-20 lg:pb-28 bg-gray-900 dark:bg-gray-950 min-h-screen">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center max-w-2xl mx-auto mb-16">
                    <span class="text-blue-400 font-semibold text-sm tracking-widest uppercase">Thành tựu</span>
                    <h1 class="font-display text-3xl lg:text-4xl font-bold text-white mt-3 mb-4">Những cột mốc đáng nhớ</h1>
                    <p class="text-gray-400 text-lg">Hành trình phát triển và những dấu ấn của chúng tôi.</p>
                </div>
                ${achievements.length ? `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    ${achievements.map((a, i) => `
                    <div class="achievement-card bg-gray-800 dark:bg-gray-800 rounded-2xl p-6 border border-gray-700/50 text-center reveal" style="transition-delay:${i * 0.1}s">
                        <div class="count-up text-3xl lg:text-4xl font-display font-bold text-blue-400 mb-3" data-target="${escapeHtml(String(a.value))}">${escapeHtml(String(a.value))}</div>
                        <h4 class="font-display font-bold text-white mb-2">${escapeHtml(a.title)}</h4>
                        <p class="text-gray-400 text-sm">${escapeHtml(a.description)}</p>
                    </div>`).join('')}
                </div>` : `
                <div class="text-center py-16">
                    <i data-lucide="trophy" class="w-16 h-16 text-gray-600 mx-auto mb-4"></i>
                    <p class="text-gray-400 text-lg">Chưa có thành tích nào được ghi nhận.</p>
                </div>`}
            </div>
        </section>`;
    }

    // ============================================================
    //  ROUTER
    // ============================================================
    function router() {
        const app = $('#app');
        if (!app) return;

        const hash = location.hash || '#/';
        const data = getData();

        // Parse route
        let html = '';
        const projectDetailMatch = hash.match(/^#\/projects\/(.+)$/);

        if (hash === '#/' || hash === '#') {
            html = renderLanding(data || {});
            setActiveNav('#/');
        } else if (hash === '#/projects') {
            html = renderProjectsPage(data || {});
            setActiveNav('#/projects');
        } else if (projectDetailMatch) {
            html = renderProjectDetail(data || {}, projectDetailMatch[1]);
            setActiveNav('#/projects/' + projectDetailMatch[1]);
        } else if (hash === '#/about') {
            html = renderAboutPage(data || {});
            setActiveNav('#/about');
        } else if (hash === '#/achievements') {
            html = renderAchievementsPage(data || {});
            setActiveNav('#/achievements');
        } else if (hash === '#/contact') {
            html = renderLanding(data || {});
            // Scroll to contact
            setTimeout(() => {
                const contactSection = app.querySelector('section:last-of-type');
                if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            html = renderLanding(data || {});
            setActiveNav('#/');
        }

        app.innerHTML = html;
        app.classList.add('page-enter');
        setTimeout(() => app.classList.remove('page-enter'), 350);

        refreshIcons();
        revealOnScroll();
        observeCountUps(app);

        // Setup contact form if present
        setupContactForm();

        // Setup project filters if on projects page
        if (hash === '#/projects' && data) {
            setTimeout(() => setupProjectFilters(data), 100);
        }
    }

    // ============================================================
    //  CONTACT FORM HANDLER
    // ============================================================
    function setupContactForm() {
        const form = $('#contactForm');
        if (!form || form.dataset.bound) return;
        form.dataset.bound = '1';

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Đã gửi! ✓';
            btn.classList.add('!bg-green-600', '!hover:bg-green-700');
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('!bg-green-600', '!hover:bg-green-700');
                btn.disabled = false;
                form.reset();
            }, 2500);
        });
    }

    // ============================================================
    //  INIT
    // ============================================================
    function init() {
        initTheme();
        setupNavbar();
        setupMobileMenu();

        // Initial render
        if (getData()) {
            updateSEO(getData());
            updateBranding(getData());
            router();
        }

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            if (getData()) router();
        });

        // Listen for data changes from wd2026.js
        document.addEventListener('webdesign2026:datachange', function (e) {
            if (e.detail) {
                updateSEO(e.detail);
                updateBranding(e.detail);
                router();
            }
        });

        // Poll for initial data
        let attempts = 0;
        const poll = setInterval(() => {
            attempts++;
            if (getData() || attempts >= 30) {
                clearInterval(poll);
                if (getData()) {
                    updateSEO(getData());
                    updateBranding(getData());
                    router();
                }
            }
        }, 100);
    }

    // --- Boot ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
