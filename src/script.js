document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Hamburger menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const sidebarNav = document.getElementById('sidebar');

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden'); // Toggle sidebar visibility

            if (sidebar.classList.contains('hidden')) {
                document.body.classList.remove('overflow-hidden');
            } else {
                document.body.classList.add('overflow-hidden');
            }
        });

        // Close sidebar on window resize if greater than md breakpoint
        window.addEventListener('resize', () => {
             if (window.innerWidth >= 768) {
                 sidebar.classList.add('hidden'); // Reset to hidden (desktop view controls display via CSS)
                 document.body.classList.remove('overflow-hidden');
             }
        });

        // Close sidebar when a link is clicked
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only hide if on mobile view (where toggle is visible)
                if (window.innerWidth < 768) {
                    sidebar.classList.add('hidden');
                }
            });
        });

    }

    // Fade-in animation on scroll
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            const target = entry.target;
            if (entry.isIntersecting) {
                target.classList.remove('opacity-0');
            } else {
                target.classList.add('opacity-0');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const itemsToFade = document.querySelectorAll('.fade-inner-item');

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    itemsToFade.forEach((item, index) => {
        if (!prefersReducedMotion) {
             // Dynamic stagger: small delay based on index to create cascading effect
             item.style.transitionDelay = `${(index % 5) * 50}ms`;
             observer.observe(item);
        } else {
            // If reduced motion, show immediately without fade animation logic
            item.classList.remove('opacity-0');
            item.style.transition = 'none';
        }
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    const activeLinkObserverOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle 50% of the viewport
        threshold: 0
    };

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('text-white', 'font-semibold');
            link.classList.add('text-gray-300');
        });
    };

    const activeLinkObserverCallback = (entries, observer) => {
        // Check if scrolled to the bottom (or very close)
        const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10;

        if (nearBottom) {
            // If near bottom, force highlight #contact
            removeActiveClasses();
            const contactLink = document.querySelector('nav a[href="#contact"]');
            if (contactLink) {
                contactLink.classList.add('text-white', 'font-semibold');
                contactLink.classList.remove('text-gray-300');
            }
        } else {
            // Otherwise, use the standard intersection logic
            let latestIntersectingEntry = null;
            entries.forEach(entry => {
                // Find the entry that is currently intersecting and potentially lowest on the screen
                if (entry.isIntersecting) {
                    if (!latestIntersectingEntry || entry.boundingClientRect.top > latestIntersectingEntry.boundingClientRect.top) {
                        latestIntersectingEntry = entry;
                    }
                }
            });

            if (latestIntersectingEntry) {
                const id = latestIntersectingEntry.target.getAttribute('id');
                const correspondingLink = document.querySelector(`nav a[href="#${id}"]`);

                removeActiveClasses(); // Remove active from all links first

                if (correspondingLink) {
                    correspondingLink.classList.add('text-white', 'font-semibold');
                    correspondingLink.classList.remove('text-gray-300');
                }
            }
        }
    };

    const activeLinkObserver = new IntersectionObserver(activeLinkObserverCallback, activeLinkObserverOptions);

    sections.forEach(section => {
        activeLinkObserver.observe(section);
    });

    // Back to Top Button Logic & Sidebar Scroll Effect
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton && sidebarNav) {
        // Show/Hide button and apply sidebar scroll effect based on scroll position
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > 10;

            // Back to top button visibility
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }

            // Sidebar scroll effect class
            if (isScrolled) {
                sidebarNav.classList.add('scrolled');
            } else {
                sidebarNav.classList.remove('scrolled');
            }
        });

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

});
