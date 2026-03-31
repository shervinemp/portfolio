console.log("Portfolio script loaded.");

function initBlogLinkVisibility() {
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
}

function initScrollEffects() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if the link is just '#' (e.g., a placeholder)
            if (this.getAttribute('href') === '#') {
                return; // Do nothing for placeholder links
            }

            // Check if the link is for downloading a file
            if (this.hasAttribute('download')) {
                return; // Do not prevent default for download links
            }

            e.preventDefault(); // Prevent default jump

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Align to the top of the target element
                });
            } else {
                console.warn(`Smooth scroll target not found: ${targetId}`);
            }
        });
    });

    // Back to Top Button Logic & Sidebar Scroll Effect
    const backToTopButton = document.getElementById('back-to-top');
    const mainScrollArea = document.getElementById('main-content');
    const sidebarNav = document.getElementById('sidebar');

    if (backToTopButton && mainScrollArea && sidebarNav) {
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > 10;

            if (window.scrollY > 300) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }

            if (isScrolled) {
                sidebarNav.classList.add('scrolled');
            } else {
                sidebarNav.classList.remove('scrolled');
            }

            // Note: handleScrollHighlighting() is now called via initScrollSpy
        });

        backToTopButton.addEventListener('click', () => {
            mainScrollArea.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.warn("Back to top button, main scroll area, or sidebar element not found.");
    }
}

function initFooterYear() {
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
        console.warn("Footer year span not found.");
    }
}

function initMobileMenu() {
    // Hamburger menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarNav = document.getElementById('sidebar'); // Define sidebarNav once here

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden'); // Toggle sidebar visibility
            // Optional: Adjust main content margin when sidebar is open/closed on mobile
            // if (sidebar.classList.contains('hidden')) {
            //     mainContent.classList.remove('ml-64'); // Example if sidebar pushes content
            // } else {
            //     mainContent.classList.add('ml-64'); // Example if sidebar pushes content
            // }
        });

        // Close sidebar when a link is clicked (optional, good for SPA feel)
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only hide if on mobile view (where toggle is visible)
                if (window.innerWidth < 768) { // Tailwind's 'md' breakpoint is 768px
                    sidebar.classList.add('hidden');
                }
            });
        });

    } else {
        console.warn("Menu toggle button, sidebar, or main content element not found.");
    }
}

function initFadeInAnimations() {
    // Fade-in animation on scroll
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px', // Removed negative margin
        threshold: 0.1 // trigger when 10% of the element is visible (Reverted from 0.25)
    };

    // Removed delay counter logic

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            const target = entry.target;
            if (entry.isIntersecting) {
                // Element is entering the viewport - Fade In
                target.style.transitionDelay = '0ms'; // Ensure no residual delay
                target.classList.remove('opacity-0');
                // Optional: Add translate effect if desired, e.g., target.classList.add('translate-y-0');
                // We don't unobserve anymore to allow fade-out
            } else {
                // Element is leaving the viewport - Fade Out
                target.classList.add('opacity-0');
                target.style.transitionDelay = '0ms'; // Reset delay on fade out
                // Optional: Reset translate effect if used, e.g., target.classList.remove('translate-y-0');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const itemsToFade = document.querySelectorAll('.fade-inner-item');
    itemsToFade.forEach(item => {
        observer.observe(item);
    });
}

function initScrollSpy() {
    // Active link highlighting on scroll
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const visibleSections = new Set();

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('text-white', 'font-semibold');
            link.classList.add('text-gray-300');
        });
    };

    const handleScrollHighlighting = () => {
        let bestScore = Infinity;
        let bestSectionId = null;

        const viewport_height = window.innerHeight;
        const scrollable_height = document.documentElement.scrollHeight - viewport_height;
        const scroll_percent = scrollable_height > 0 ? window.scrollY / scrollable_height : 0;

        // Per the formula: `abs(section_mid_y - (viewport_top_y + scroll_percent * viewport_height))`
        // where viewport_top_y is 0.
        const target_y = scroll_percent * viewport_height;

        visibleSections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const section_mid_y = rect.top + (rect.height / 2);

            const score = Math.abs(section_mid_y - target_y);

            if (score < bestScore) {
                bestScore = score;
                bestSectionId = sectionId;
            }
        });

        removeActiveClasses();
        if (bestSectionId) {
            const correspondingLink = document.querySelector(`nav a[href="#${bestSectionId}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('text-white', 'font-semibold');
                correspondingLink.classList.remove('text-gray-300');
            }
        }
    };

    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleSections.add(entry.target.id);
            } else {
                visibleSections.delete(entry.target.id);
            }
        });
        // Initial run when visibility changes
        handleScrollHighlighting();
    }, {
        // Observe a wide band to ensure sections are always in the `visibleSections` set
        // when they are near the middle of the screen.
        rootMargin: '100% 0px 100% 0px',
        threshold: 0
    });

    sections.forEach(section => {
        visibilityObserver.observe(section);
    });

    // Bind scroll handler
    window.addEventListener('scroll', handleScrollHighlighting);
}

/**
 * Main initialization wrapper.
 */
document.addEventListener('DOMContentLoaded', () => {
    initBlogLinkVisibility();
    initFooterYear();
    initMobileMenu();
    initFadeInAnimations();
    initScrollSpy();
    initScrollEffects();
});
