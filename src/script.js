document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio script loaded.");

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

    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
        console.warn("Footer year span not found.");
    }

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

    const itemsToFade = document.querySelectorAll('.fade-inner-item'); // Target inner items
    itemsToFade.forEach(item => {
        observer.observe(item);
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('main section[id]'); // Get all sections in main with an ID
    const navLinks = document.querySelectorAll('nav a[href^="#"]'); // Get all nav links pointing to an ID

    const activeLinkObserverOptions = {
        root: null, // viewport
        rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle 50% of the viewport
        threshold: 0 // Trigger as soon as any part enters/leaves the rootMargin area
    };

    const removeActiveClasses = () => {
        navLinks.forEach(link => {
            link.classList.remove('text-white', 'font-semibold');
            link.classList.add('text-gray-300');
        });
    };

    const activeLinkObserverCallback = (entries, observer) => {
        // Check if scrolled to the bottom (or very close)
        const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10; // 10px tolerance

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
            // If nothing is intersecting according to the observer (e.g., between sections),
            // the active class remains removed from the previous step.
        }
    };

    const activeLinkObserver = new IntersectionObserver(activeLinkObserverCallback, activeLinkObserverOptions);

    sections.forEach(section => {
        activeLinkObserver.observe(section);
    });

    // Back to Top Button Logic & Sidebar Scroll Effect
    const backToTopButton = document.getElementById('back-to-top');
    const mainScrollArea = document.getElementById('main-content'); // Use the main content area for scroll events
    // sidebarNav is already defined above

    if (backToTopButton && mainScrollArea && sidebarNav) { // Use the existing sidebarNav variable
        // Show/Hide button and apply sidebar scroll effect based on scroll position
        // --- Attach listener to window instead of mainScrollArea ---
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > 10; // Use window.scrollY

            // Back to top button visibility
            if (window.scrollY > 300) { // Use window.scrollY
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
            // --- Scroll the main content area, not the window ---
            mainScrollArea.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.warn("Back to top button, main scroll area, or sidebar element not found."); // Updated warning
    }

    // Removed Sidebar Scroll Indicator Logic

});
