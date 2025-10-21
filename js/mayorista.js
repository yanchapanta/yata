// =============================================
// CATÁLOGO PARA MAYORISTAS - SOLO VISUALIZACIÓN
// =============================================

// Configuración para mayoristas
const configMayorista = {
    descuentoBase: 0.20,    // 20% descuento base
    descuento50: 0.25,      // 25% para 50+ unidades
    descuento100: 0.30,     // 30% para 100+ unidades
    volumenMinimo: 10       // Mínimo para precio mayorista
};

// Variables globales
let productosData = [];
let categoriasData = [];
let productosFiltrados = [];
let filtroCategoriaActual = 'todos';
let terminoBusqueda = '';

// ==================== INICIALIZACIÓN ====================

// Cargar productos
async function cargarProductosMayoristas() {
    try {
        const jsonFile = document.body.getAttribute('data-json');
        const response = await fetch(jsonFile);
        const data = await response.json();
        
        // Solo productos activos
        productosData = (data.productos || []).filter(producto => producto.estado === 'activo');
        categoriasData = data.categorias || [];
        
        console.log('✅ Catálogo mayorista cargado:', productosData.length, 'productos');
        inicializarMayorista();
        
    } catch (error) {
        console.error('❌ Error cargando catálogo:', error);
        mostrarErrorMayorista();
    }
}

// Inicializar interfaz mayorista
function inicializarMayorista() {
    actualizarContadores();
    cargarCategoriasFiltros();
    cargarProductosGrid();
    configurarEventosMayorista();
}

// ==================== INTERFAZ ====================

// Actualizar contadores
function actualizarContadores() {
    const total = productosData.length;
    const mostrando = productosFiltrados.length > 0 ? productosFiltrados.length : productosData.length;
    
    document.getElementById('contador-total').textContent = total;
    document.getElementById('contador-actual').textContent = mostrando;
    document.getElementById('total-productos-footer').textContent = total;
    document.getElementById('categorias-total').textContent = categoriasData.length;
}

// Cargar categorías en filtros
function cargarCategoriasFiltros() {
    const contenedor = document.querySelector('.filtros-categorias');
    if (!contenedor) return;
    
    // Limpiar y mantener solo "Todos"
    contenedor.innerHTML = '<button class="btn-filtro active" data-categoria="todos">Todos los Productos</button>';
    
    categoriasData.forEach(categoria => {
        const boton = document.createElement('button');
        boton.className = 'btn-filtro';
        boton.textContent = categoria;
        boton.setAttribute('data-categoria', categoria.toLowerCase());
        contenedor.appendChild(boton);
    });
}

// Cargar productos en el grid
function cargarProductosGrid() {
    const contenedor = document.getElementById('idCardProducts');
    const sinProductos = document.getElementById('sin-productos');
    
    if (!contenedor) return;
    
    // Determinar qué productos mostrar
    const productosAMostrar = productosFiltrados.length > 0 ? productosFiltrados : productosData;
    
    if (productosAMostrar.length === 0) {
        contenedor.innerHTML = '';
        sinProductos.style.display = 'block';
        return;
    }
    
    sinProductos.style.display = 'none';
    contenedor.innerHTML = '';
    
    productosAMostrar.forEach(producto => {
        const card = crearCardProductoMayorista(producto);
        contenedor.appendChild(card);
    });
    
    actualizarContadores();
}

// Crear card de producto para mayoristas
function crearCardProductoMayorista(producto) {
    const card = document.createElement('div');
    card.className = 'card card-mayorista';
    card.setAttribute('data-categoria', producto.categoria.toLowerCase());
    
    const precios = calcularPreciosMayorista(producto);
    
  card.innerHTML = `
    <div class="card-content-completo">
        <!-- SECCIÓN IZQUIERDA: Imagen + Información -->
        <div class="card-seccion-izquierda">
            <!-- Contenedor de Imagen -->
            <div class="card-contenedor-imagen">
                <div class="card-img">
                    <img src="${producto.imagen || 'img/placeholder.jpg'}" 
                         alt="${producto.nombre}" 
                         loading="lazy"
                         onerror="this.src='img/placeholder.jpg'">
                    <div class="badge-mayorista">💼 Mayorista</div>
                    ${producto.notas ? `<div class="badge-nota">${producto.notas}</div>` : ''}
                </div>
            </div>
            
            <!-- Contenedor de Información -->
            <div class="card-contenedor-info">
                <div class="card-header">
                    <span class="card-codigo">${producto.codigo}</span>
                    <span class="card-categoria">${producto.categoria}</span>
                </div>
                
                <h3 class="card-nombre">${producto.nombre}</h3>
                <p class="card-descripcion">${producto.descripcionCorta}</p>
                
                <div class="card-presentacion">
                    <small>📦 ${producto.presentacion || 'Unidad'}</small>
                </div>
            </div>
        </div>
        
        <!-- SECCIÓN DERECHA: Precios + Acciones -->
        <div class="card-seccion-derecha">
            <!-- Contenedor de Precios -->
            <div class="card-contenedor-precios">
                <!-- Precio Minorista -->
                <div class="precio-minorista-grupo">
                    <div class="precio-titulo">Precio Minorista</div>
                    <div class="precio-valor">$${precios.minoristaConIVA.toFixed(2)}</div>
                    <div class="precio-etiqueta">Público General</div>
                </div>
                
                <!-- Precios Mayoristas -->
                <div class="precios-mayoristas-grupo">
                    <div class="precio-titulo-mayorista">Precios Mayoristas</div>
                    
                    <div class="precio-nivel">
                        <div class="nivel-info">
                            <span class="nivel-cantidad">10+ unidades</span>
                            <span class="nivel-descuento">-${precios.descuento10}%</span>
                        </div>
                        <div class="precio-valor-mayorista">$${precios.mayorista10ConIVA.toFixed(2)}</div>
                    </div>
                    
                    <div class="precio-nivel destacado">
                        <div class="nivel-info">
                            <span class="nivel-cantidad">50+ unidades</span>
                            <span class="nivel-descuento">-${precios.descuento50}%</span>
                        </div>
                        <div class="precio-valor-mayorista">$${precios.mayorista50ConIVA.toFixed(2)}</div>
                    </div>
                    
                    <div class="precio-nivel">
                        <div class="nivel-info">
                            <span class="nivel-cantidad">100+ unidades</span>
                            <span class="nivel-descuento">-${precios.descuento100}%</span>
                        </div>
                        <div class="precio-valor-mayorista">$${precios.mayorista100ConIVA.toFixed(2)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Contenedor de Acciones -->
            <div class="card-contenedor-acciones">
                <button class="btn-mayorista btn-detalles" onclick="verDetallesProducto('${producto.id}')">
                    👁️ Ver Detalles
                </button>
                <a href="${generarEnlaceWhatsApp(producto)}" 
                   target="_blank" 
                   class="btn-mayorista btn-whatsapp-card">
                    💬 Cotizar
                </a>
            </div>
        </div>
    </div>
`;
    
    return card;
}

// ==================== CÁLCULOS DE PRECIOS ====================

function calcularPreciosMayorista(producto) {
    const precioBase = producto.precio;
    const iva = producto.iva || 12;
    
    // Precio minorista
    const minoristaConIVA = precioBase * (1 + (iva / 100));
    
    // Precios mayoristas con diferentes descuentos
    const mayorista10 = precioBase * (1 - configMayorista.descuentoBase);
    const mayorista50 = precioBase * (1 - configMayorista.descuento50);
    const mayorista100 = precioBase * (1 - configMayorista.descuento100);
    
    const mayorista10ConIVA = mayorista10 * (1 + (iva / 100));
    const mayorista50ConIVA = mayorista50 * (1 + (iva / 100));
    const mayorista100ConIVA = mayorista100 * (1 + (iva / 100));
    
    return {
        minoristaConIVA,
        mayorista10ConIVA,
        mayorista50ConIVA,
        mayorista100ConIVA,
        descuento10: configMayorista.descuentoBase * 100,
        descuento50: configMayorista.descuento50 * 100,
        descuento100: configMayorista.descuento100 * 100
    };
}

// ==================== FILTROS Y BÚSQUEDA ====================

function configurarEventosMayorista() {
    // Filtros por categoría
    document.querySelectorAll('.btn-filtro').forEach(boton => {
        boton.addEventListener('click', function() {
            document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            filtroCategoriaActual = this.getAttribute('data-categoria');
            aplicarFiltros();
        });
    });
    
    // Búsqueda
    const buscador = document.getElementById('search-mayorista');
    if (buscador) {
        buscador.addEventListener('input', function(e) {
            terminoBusqueda = e.target.value.toLowerCase().trim();
            aplicarFiltros();
        });
    }
    
    // Ordenamiento
    const ordenamiento = document.getElementById('order-mayorista');
    if (ordenamiento) {
        ordenamiento.addEventListener('change', function() {
            ordenarProductos(this.value);
        });
    }
}

function aplicarFiltros() {
    let filtrados = [...productosData];
    
    // Filtrar por categoría
    if (filtroCategoriaActual !== 'todos') {
        filtrados = filtrados.filter(producto => 
            producto.categoria.toLowerCase() === filtroCategoriaActual
        );
    }
    
    // Filtrar por búsqueda
    if (terminoBusqueda) {
        filtrados = filtrados.filter(producto =>
            producto.codigo.toLowerCase().includes(terminoBusqueda) ||
            producto.nombre.toLowerCase().includes(terminoBusqueda) ||
            producto.descripcionCorta.toLowerCase().includes(terminoBusqueda) ||
            producto.categoria.toLowerCase().includes(terminoBusqueda)
        );
    }
    
    productosFiltrados = filtrados;
    cargarProductosGrid();
}

function ordenarProductos(criterio) {
    let productosAOrdenar = productosFiltrados.length > 0 ? productosFiltrados : productosData;
    
    switch(criterio) {
        case 'precio':
            productosAOrdenar.sort((a, b) => a.precio - b.precio);
            break;
        case 'nombre':
            productosAOrdenar.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'categoria':
            productosAOrdenar.sort((a, b) => a.categoria.localeCompare(b.categoria));
            break;
        case 'popularidad':
            // Ordenar por código como proxy de popularidad
            productosAOrdenar.sort((a, b) => a.codigo.localeCompare(b.codigo));
            break;
    }
    
    cargarProductosGrid();
}

// ==================== FUNCIONALIDADES EXTRAS ====================

function limpiarFiltros() {
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.btn-filtro[data-categoria="todos"]').classList.add('active');
    document.getElementById('search-mayorista').value = '';
    
    filtroCategoriaActual = 'todos';
    terminoBusqueda = '';
    productosFiltrados = [];
    
    cargarProductosGrid();
}

function generarEnlaceWhatsApp(producto) {
    const precios = calcularPreciosMayorista(producto);
    const mensaje = `Hola, soy mayorista y me interesa:

📦 *${producto.nombre}*
📋 Código: ${producto.codigo}
💼 Categoría: ${producto.categoria}

Precios mayoristas:
• 10+ unidades: $${precios.mayorista10ConIVA.toFixed(2)} c/u
• 50+ unidades: $${precios.mayorista50ConIVA.toFixed(2)} c/u  
• 100+ unidades: $${precios.mayorista100ConIVA.toFixed(2)} c/u

Me gustaría solicitar una cotización.`;

    return `https://wa.me/593TU_NUMERO?text=${encodeURIComponent(mensaje)}`;
}

function verDetallesProducto(productoId) {
    const producto = productosData.find(p => p.id === productoId);
    if (!producto) return;
    
    const precios = calcularPreciosMayorista(producto);
    const modal = document.getElementById('modal-producto');
    const contenido = document.getElementById('contenido-modal-producto');
    
    contenido.innerHTML = `
        <div class="modal-producto-header">
            <img src="${producto.imagen || 'img/placeholder.jpg'}" 
                 alt="${producto.nombre}"
                 onerror="this.src='img/placeholder.jpg'">
            <div class="modal-producto-info">
                <span class="producto-codigo">${producto.codigo}</span>
                <h2>${producto.nombre}</h2>
                <span class="producto-categoria">${producto.categoria}</span>
            </div>
        </div>
        
        <div class="modal-producto-descripcion">
            <h3>Descripción</h3>
            <p>${producto.descripcionDetallada || producto.descripcionCorta}</p>
        </div>
        
        <div class="modal-producto-precios">
            <h3>Precios Mayoristas</h3>
            <div class="tabla-precios">
                <div class="fila-precio">
                    <span>Minorista:</span>
                    <span class="precio-tachado">$${precios.minoristaConIVA.toFixed(2)}</span>
                </div>
                <div class="fila-precio destacada">
                    <span>10+ unidades:</span>
                    <span class="precio-destacado">$${precios.mayorista10ConIVA.toFixed(2)}</span>
                    <span class="descuento">-${precios.descuento10}%</span>
                </div>
                <div class="fila-precio">
                    <span>50+ unidades:</span>
                    <span>$${precios.mayorista50ConIVA.toFixed(2)}</span>
                    <span class="descuento">-${precios.descuento50}%</span>
                </div>
                <div class="fila-precio">
                    <span>100+ unidades:</span>
                    <span>$${precios.mayorista100ConIVA.toFixed(2)}</span>
                    <span class="descuento">-${precios.descuento100}%</span>
                </div>
            </div>
        </div>
        
        <div class="modal-producto-especificaciones">
            <h3>Especificaciones</h3>
            <div class="especificaciones-grid">
                <div class="especificacion">
                    <strong>Presentación:</strong>
                    <span>${producto.presentacion || 'No especificado'}</span>
                </div>
                <div class="especificacion">
                    <strong>Unidad:</strong>
                    <span>${producto.unidad || 'unidad'}</span>
                </div>
                <div class="especificacion">
                    <strong>IVA:</strong>
                    <span>${producto.iva || 12}%</span>
                </div>
            </div>
        </div>
        
        <div class="modal-producto-actions">
            <a href="${generarEnlaceWhatsApp(producto)}" 
               target="_blank" 
               class="btn-mayorista btn-whatsapp-modal">
                💬 Solicitar Cotización por WhatsApp
            </a>
        </div>
    `;
    
    modal.style.display = 'block';
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').style.display = 'none';
}

function mostrarErrorMayorista() {
    const contenedor = document.getElementById('idCardProducts');
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="error-mayorista">
                <h3>⚠️ Error al cargar el catálogo</h3>
                <p>No se pudieron cargar los productos. Por favor, intenta recargar la página.</p>
                <button class="btn-mayorista" onclick="cargarProductosMayoristas()">🔄 Recargar</button>
            </div>
        `;
    }
}

// Cerrar modal al hacer click fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('modal-producto');
    if (e.target === modal) {
        cerrarModalProducto();
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductosMayoristas);