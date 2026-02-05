import { productosData } from './productos.js';

class CarruselProducto {
    constructor(container) {
        this.container = container;
        this.track = container.querySelector('.carousel-track');
        this.slides = container.querySelectorAll('.carousel-slide');
        this.dots = container.querySelectorAll('.dot');
        this.prevBtn = container.querySelector('.carousel-prev');
        this.nextBtn = container.querySelector('.carousel-next');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoRotateInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startAutoRotate();
        this.playCurrentVideo();
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });
        
        // Pausar auto-rotación al interactuar
        this.container.addEventListener('mouseenter', () => this.stopAutoRotate());
        this.container.addEventListener('mouseleave', () => this.startAutoRotate());
        
        // Touch events para mobile
        let startX = 0;
        let endX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            this.stopAutoRotate();
        });
        
        this.container.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            
            this.startAutoRotate();
        });
    }
    
    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    goToSlide(index) {
        // Ajustar índice si se sale de los límites
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        this.currentIndex = index;
        
        // Mover track
        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        
        // Actualizar clases activas
        this.updateActiveStates();
        
        // Controlar video
        this.playCurrentVideo();
    }
    
    updateActiveStates() {
        // Actualizar slides
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.currentIndex);
        });
        
        // Actualizar dots
        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
    
    playCurrentVideo() {
        // Pausar todos los videos primero
        this.slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
        
        // Reproducir video actual si existe
        const currentSlide = this.slides[this.currentIndex];
        const currentVideo = currentSlide.querySelector('video');
        
        if (currentVideo) {
            currentVideo.currentTime = 0;
            
            // Intentar reproducir automáticamente
            const playPromise = currentVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Auto-play bloqueado, mostrar controles
                    currentVideo.controls = true;
                    console.log('Auto-play bloqueado:', error);
                });
            }
        }
    }
    
    startAutoRotate() {
        this.stopAutoRotate();
        this.autoRotateInterval = setInterval(() => {
            this.nextSlide();
        }, 5000); // Cambiar cada 5 segundos
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }
}

// Inicializar todos los carruseles cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const carruseles = document.querySelectorAll('.product-carousel-container');
    
    carruseles.forEach(container => {
        new CarruselProducto(container);
    });
});

// Exportar clase para uso modular
export { CarruselProducto };