// Navegación activa
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.style.color = '#4299e1';
                link.style.fontWeight = 'bold';
            }
        });