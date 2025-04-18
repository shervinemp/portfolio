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
        rootMargin: '0px',
        threshold: 0.1 // trigger when 10% of the element is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('opacity-0');
                // Optional: Add a slight delay or other effects if needed
                // entry.target.classList.add('translate-y-0'); // If using translate for animation start
                observer.unobserve(entry.target); // Stop observing once faded in
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sectionsToFade = document.querySelectorAll('.fade-in-section');
    sectionsToFade.forEach(section => {
        observer.observe(section);
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
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                const correspondingLink = document.querySelector(`nav a[href="#${id}"]`);

                removeActiveClasses(); // Remove active from all links first

                if (correspondingLink) {
                    correspondingLink.classList.add('text-white', 'font-semibold');
                    correspondingLink.classList.remove('text-gray-300');
                }
            }
        });
    };

    const activeLinkObserver = new IntersectionObserver(activeLinkObserverCallback, activeLinkObserverOptions);

    sections.forEach(section => {
        activeLinkObserver.observe(section);
    });

    // Back to Top Button Logic
    const backToTopButton = document.getElementById('back-to-top');
    const mainScrollArea = document.getElementById('main-content'); // Use the main content area for scroll events

    if (backToTopButton && mainScrollArea) {
        // Show/Hide button based on scroll position within the main content area
        mainScrollArea.addEventListener('scroll', () => {
            if (mainScrollArea.scrollTop > 300) { // Show button after scrolling 300px
                backToTopButton.classList.remove('hidden');
            } else {
                backToTopButton.classList.add('hidden');
            }
        });

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', () => {
            mainScrollArea.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    } else {
        console.warn("Back to top button or main scroll area not found.");
    }

});
