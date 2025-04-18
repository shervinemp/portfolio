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
});
