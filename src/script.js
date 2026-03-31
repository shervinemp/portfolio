/**
 * Initializes the current year in the footer element.
 */
const initFooterYear = () => {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

/**
 * Initializes the mobile hamburger menu toggle functionality.
 */
const initMobileMenu = () => {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (!menuToggle || !sidebar) return;

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden', !sidebar.classList.contains('hidden'));
    });

    // Close sidebar on window resize if greater than md breakpoint (768px)
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            sidebar.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });

    // Close sidebar when a navigation link is clicked (mobile view only)
    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                sidebar.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });
    });
};

/**
 * Initializes intersection observers for fade-in animations on scroll.
 */
const initFadeInAnimations = () => {
    const itemsToFade = document.querySelectorAll('.fade-inner-item');
    if (!itemsToFade.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        itemsToFade.forEach(item => {
            item.classList.remove('opacity-0');
            item.style.transition = 'none';
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            entry.target.classList.toggle('opacity-0', !entry.isIntersecting);
        });
    }, observerOptions);

    itemsToFade.forEach((item, index) => {
        item.style.transitionDelay = `${(index % 5) * 50}ms`;
        observer.observe(item);
    });
};

/**
 * Initializes scroll spy functionality to highlight active navigation links.
 */
const initScrollSpy = () => {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    const resetActiveLinks = () => {
        navLinks.forEach(link => {
            link.classList.remove('text-white', 'font-semibold');
            link.classList.add('text-gray-300');
        });
    };

    const setActiveLink = (href) => {
        resetActiveLinks();
        const activeLink = document.querySelector(`nav a[href="${href}"]`);
        if (activeLink) {
            activeLink.classList.add('text-white', 'font-semibold');
            activeLink.classList.remove('text-gray-300');
        }
    };

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        const isNearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10;

        if (isNearBottom) {
            setActiveLink('#contact');
            return;
        }

        // Find the topmost intersecting section
        let activeEntry = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!activeEntry || entry.boundingClientRect.top > activeEntry.boundingClientRect.top) {
                    activeEntry = entry;
                }
            }
        });

        if (activeEntry) {
            setActiveLink(`#${activeEntry.target.id}`);
        }
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
};

/**
 * Initializes back-to-top button and sidebar scroll effects.
 */
const initScrollEffects = () => {
    const backToTopButton = document.getElementById('back-to-top');
    const sidebarNav = document.getElementById('sidebar');

    if (!backToTopButton || !sidebarNav) return;

    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 10;
        const showBackToTop = window.scrollY > 300;

        backToTopButton.classList.toggle('hidden', !showBackToTop);
        sidebarNav.classList.toggle('scrolled', isScrolled);
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

/**
 * Main initialization wrapper.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Blog Link Dynamic Visibility
    // ==========================================
    const blogLinkWrapper = document.getElementById('blog-link-wrapper');
    // Check if the global variable exists and if posts were generated
    if (blogLinkWrapper && typeof window.BLOG_META !== 'undefined') {
        if (window.BLOG_META.postCount > 0) {
            blogLinkWrapper.classList.remove('hidden');
        }
    }

    initFooterYear();
    initMobileMenu();
    initFadeInAnimations();
    initScrollSpy();
    initScrollEffects();
});
