class MobileMenu {
    constructor() {
        this.hamburgerBtn = document.getElementById('hamburgerBtn');
        this.mobileMenu = document.getElementById('mobileMenu');
        this.closeBtn  = document.getElementById('closeMenu');
        this.body = document.body;
        
        this.init();
    }
    
    init() {
        // Abrir menú
        this.hamburgerBtn.addEventListener('click', () => this.openMenu());
        
        // Cerrar menú
        this.closeBtn.addEventListener('click', () => this.closeMenu());
        
        // Cerrar al hacer clic en overlay
        this.mobileMenu.addEventListener('click', (e) => {
            if (e.target.classList.contains('mobile-menu__overlay')) {
                this.closeMenu();
            }
        });
        
        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenu.classList.contains('active')) {
                this.closeMenu();
            }
        });
        
        // Cerrar al hacer clic en enlace
        document.querySelectorAll('.mobile-menu__link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Prevenir problemas de scroll en iOS
        this.preventBodyScroll();
    }
    
    openMenu() {
        this.mobileMenu.classList.add('active');
        this.body.classList.add('menu-open');
        
        // Animar ícono hamburguesa
        const icon = this.hamburgerBtn.querySelector('.hamburger-icon');
        icon.style.transform = 'translateX(280px)';
        
        // Enfocar primer enlace para accesibilidad
        setTimeout(() => {
            document.querySelector('.mobile-menu__link').focus();
        }, 300);
    }
    
    closeMenu() {
        this.mobileMenu.classList.remove('active');
        this.body.classList.remove('menu-open');
        
        // Resetear posición del ícono
        const icon = this.hamburgerBtn.querySelector('.hamburger-icon');
        icon.style.transform = 'translateX(0)';
        
        // Enfocar botón hamburguesa para accesibilidad
        this.hamburgerBtn.focus();
    }
    
    preventBodyScroll() {
        // Prevenir scroll en iOS cuando el menú está abierto
        this.mobileMenu.addEventListener('touchmove', (e) => {
            if (!e.target.classList.contains('mobile-menu__sidebar')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    // Método para cerrar menú si se redimensiona a desktop
    handleResize() {
        if (window.innerWidth >= 768 && this.mobileMenu.classList.contains('active')) {
            this.closeMenu();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = new MobileMenu();
    
    // Cerrar menú si se redimensiona a desktop
    window.addEventListener('resize', () => mobileMenu.handleResize());
});