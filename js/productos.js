let productosData = [];
let whatsappGlobal = '';
let categoriasData = [];

// Función para optimizar imágenes
function optimizeImage(src, width = 400) {
    // Para Cloudinary - optimizar imágenes
    if (src.includes('cloudinary.com')) {
        // Reemplazar parámetros de optimización existentes
        return src.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
    }
    return src;
}

// Cargar productos desde JSON
async function cargarProductos() {
    try {
        const jsonFile = document.body.getAttribute('data-json');
        const response = await fetch(jsonFile);
        const data = await response.json();
        
        // Extraer datos
        productosData = data.productos || [];
        categoriasData = data.categorias || [];
        whatsappGlobal = data.whatsapp || '593979947191'; // Número por defecto
        
        console.log(`📱 WhatsApp global: ${whatsappGlobal}`);
        console.log(`📦 Productos cargados: ${productosData.length}`);
        
        if (productosData.length > 0) {
            renderizarProductos();
            inicializarCarruseles();
        } else {
            mostrarMensaje('No hay productos disponibles', 'info');
        }
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensaje('Error al cargar los productos', 'error');
    }
}


// Renderizar productos en la grid
function renderizarProductos() {
    const container = document.getElementById('productosContainer');
    
    if (!container) {
        console.error('Contenedor de productos no encontrado');
        return;
    }
    
    // Limpiar contenedor
    container.innerHTML = '';
    
    // Crear HTML para cada producto
    productosData.forEach((producto, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = crearHTMLProducto(producto, index);
        container.appendChild(productCard);
    });
}

// Crear HTML de un producto con carrusel
function crearHTMLProducto(producto, index) {
    const firstAroma = producto.aromas && producto.aromas.length > 0 ? producto.aromas[0] : 'Sin aroma';
    
    return `
        <div class="product-carousel-container" data-product-index="${index}">
            <div class="product-carousel">
                <div class="carousel-track" id="carousel-track-${index}">
                    ${producto.media.map((media, i) => `
                        <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-slide="${i}" data-aroma="${producto.aromas ? producto.aromas[i % producto.aromas.length] : firstAroma}">
                            ${media.type === 'video' ? 
                                `<video muted playsinline preload="metadata">
                                    <source src="${optimizeImage(media.src)}" type="video/mp4">
                                </video>` : 
                                `<img class="lazy" data-src="${optimizeImage(media.src)}" alt="${media.alt}" loading="lazy">`
                            }
                            <div class="aroma-indicator">
                                <span class="aroma-badge">${producto.aromas ? producto.aromas[i % producto.aromas.length] : firstAroma}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="carousel-controls">
                    <button class="carousel-prev" aria-label="Imagen anterior">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-next" aria-label="Siguiente imagen">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="carousel-dots" id="dots-${index}">
                    ${producto.media.map((_, i) => `
                        <button class="dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Ir a imagen ${i + 1}"></button>
                    `).join('')}
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-price">$${producto.precio.toFixed(2)}</div>
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <span class="product-ml">${producto.cantidad}</span>
                
                <a href="https://wa.me/${whatsappGlobal}?text=Hola,%20me%20interesa%20el%20producto:%20${encodeURIComponent(producto.nombre)}%20(Código:%20${producto.codigo})%20que%20vi%20en%20su%20sitio%20web.%20¿Podrían%20darme%20más%20información?" 
                   target="_blank" 
                   class="whatsapp-button"
                   rel="noopener noreferrer">
                    <i class="fab fa-whatsapp"></i>
                    Contactar por WhatsApp
                </a>
            </div>
        </div>
    `;
}

// Inicializar todos los carruseles
function inicializarCarruseles() {
    const carruseles = document.querySelectorAll('.product-carousel-container');
    
    carruseles.forEach(container => {
        const track = container.querySelector('.carousel-track');
        const slides = container.querySelectorAll('.carousel-slide');
        const dots = container.querySelectorAll('.dot');
        const prevBtn = container.querySelector('.carousel-prev');
        const nextBtn = container.querySelector('.carousel-next');
        const productIndex = container.getAttribute('data-product-index');
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        
        // Inicializar lazy loading
        inicializarLazyLoading(container);
        
        // Función para mover carrusel
        function moveToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Actualizar slides activos
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentSlide);
            });
            
            // Actualizar dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
            
            // Reproducir video si es el primero
            const currentVideo = slides[currentSlide].querySelector('video');
            if (currentVideo) {
                currentVideo.currentTime = 0;
                currentVideo.play().catch(e => console.log('Auto-play bloqueado:', e));
            }
            
            // Pausar otros videos
            slides.forEach((slide, i) => {
                if (i !== currentSlide) {
                    const video = slide.querySelector('video');
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        }
        
        // Event listeners
        prevBtn.addEventListener('click', () => moveToSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => moveToSlide(currentSlide + 1));
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                moveToSlide(slideIndex);
            });
        });
        
        // Auto-rotación opcional (cada 5 segundos)
        let autoRotateInterval = setInterval(() => {
            moveToSlide(currentSlide + 1);
        }, 5000);
        
        // Pausar auto-rotación al interactuar
        container.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
        container.addEventListener('mouseleave', () => {
            autoRotateInterval = setInterval(() => {
                moveToSlide(currentSlide + 1);
            }, 5000);
        });
        
        // Iniciar primer video
        const firstVideo = slides[0].querySelector('video');
        if (firstVideo) {
            firstVideo.play().catch(e => console.log('Auto-play bloqueado:', e));
        }
    });
}

// Lazy loading para imágenes
function inicializarLazyLoading(container) {
    const lazyImages = container.querySelectorAll('img.lazy');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores antiguos
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('loaded');
        });
    }
}

// Mostrar mensajes
function mostrarMensaje(texto, tipo = 'info') {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje mensaje-${tipo}`;
    mensaje.textContent = texto;
    mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    if (tipo === 'error') {
        mensaje.style.background = '#f44336';
    } else if (tipo === 'success') {
        mensaje.style.background = '#4CAF50';
    } else {
        mensaje.style.background = '#2196F3';
    }
    
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
        mensaje.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => mensaje.remove(), 300);
    }, 3000);
}

// Cargar productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductos);

// Optimizar para mobile: ajustar altura del carrusel
function ajustarAlturaCarrusel() {
    const carruseles = document.querySelectorAll('.product-carousel');
    const isMobile = window.innerWidth < 768;
    
    carruseles.forEach(carrusel => {
        carrusel.style.height = isMobile ? '220px' : '280px';
    });
}

window.addEventListener('resize', ajustarAlturaCarrusel);
window.addEventListener('load', ajustarAlturaCarrusel);

// Exportar para uso modular
export { cargarProductos, productosData, optimizeImage };