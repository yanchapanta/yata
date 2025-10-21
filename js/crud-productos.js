// =============================================
// SISTEMA CRUD COMPLETO PARA PRODUCTOS YATA
// =============================================

// Variables globales
let productosData = [];
let categoriasData = [];
let productoAEliminar = null;
let ordenActual = { campo: 'codigo', direccion: 'asc' };

// ==================== FUNCIONES PRINCIPALES ====================

// 1. CARGAR DATOS DESDE JSON
async function cargarProductos() {
    try {
        const jsonFile = document.body.getAttribute('data-json');
        const response = await fetch(jsonFile);
        const data = await response.json();
        
        productosData = data.productos || [];
        categoriasData = data.categorias || [];
        
        console.log('✅ Datos cargados:', productosData.length, 'productos');
        inicializarAplicacion();
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        mostrarMensaje('Error al cargar los datos del catálogo', 'error');
    }
}

// 2. INICIALIZAR APLICACIÓN
function inicializarAplicacion() {
    actualizarEstadisticas();
    cargarCategoriasEnSelect();
    cargarTablaProductos();
    configurarEventos();
    configurarOrdenamiento();
}

// 3. ACTUALIZAR ESTADÍSTICAS
function actualizarEstadisticas() {
    const total = productosData.length;
    const activos = productosData.filter(p => p.estado === 'activo').length;
    const valorInventario = productosData.reduce((sum, p) => sum + p.precio, 0);
    
    document.getElementById('total-productos').textContent = total;
    document.getElementById('productos-activos').textContent = activos;
    document.getElementById('valor-inventario').textContent = `$${valorInventario.toFixed(2)}`;
}

// ==================== OPERACIONES CRUD ====================

// CREATE - Crear nuevo producto
function crearProducto(producto) {
    // Generar ID único y fecha
    producto.id = generarIdUnico();
    producto.fechaCreacion = new Date().toISOString().split('T')[0];
    producto.fechaActualizacion = producto.fechaCreacion;
    
    // Agregar a los datos
    productosData.push(producto);
    
    // Guardar y actualizar
    guardarEnLocalStorage();
    actualizarEstadisticas();
    cargarTablaProductos();
    
    mostrarMensaje('✅ Producto creado exitosamente');
    console.log('Nuevo producto creado:', producto);
}

// READ - Cargar tabla de productos
function cargarTablaProductos() {
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    if (!cuerpoTabla) return;
    
    // Ordenar productos
    const productosOrdenados = ordenarProductos([...productosData]);
    
    cuerpoTabla.innerHTML = '';
    
    if (productosOrdenados.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="7" class="sin-productos">
                    📝 No hay productos registrados. 
                    <button onclick="mostrarFormularioCrear()" class="btn-enlace">Crear el primero</button>
                </td>
            </tr>
        `;
        return;
    }
    
    productosOrdenados.forEach(producto => {
        const fila = crearFilaProducto(producto);
        cuerpoTabla.appendChild(fila);
    });
}

// UPDATE - Editar producto existente
function editarProducto(id, nuevosDatos) {
    const index = productosData.findIndex(p => p.id === id);
    
    if (index !== -1) {
        // Mantener datos que no se editan
        nuevosDatos.id = id;
        nuevosDatos.fechaCreacion = productosData[index].fechaCreacion;
        nuevosDatos.fechaActualizacion = new Date().toISOString().split('T')[0];
        
        // Actualizar producto
        productosData[index] = { ...productosData[index], ...nuevosDatos };
        
        // Guardar y actualizar
        guardarEnLocalStorage();
        actualizarEstadisticas();
        cargarTablaProductos();
        
        mostrarMensaje('✅ Producto actualizado exitosamente');
        console.log('Producto actualizado:', productosData[index]);
    }
}

// DELETE - Eliminar producto
function eliminarProducto(id) {
    const producto = productosData.find(p => p.id === id);
    if (!producto) return;
    
    productoAEliminar = id;
    
    // Mostrar modal de confirmación
    document.getElementById('mensaje-confirmacion').textContent = 
        `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}" (${producto.codigo})?`;
    document.getElementById('modal-confirmar').style.display = 'block';
}

// CONFIRMAR ELIMINACIÓN
function confirmarEliminacion() {
    if (productoAEliminar) {
        const index = productosData.findIndex(p => p.id === productoAEliminar);
        
        if (index !== -1) {
            const productoEliminado = productosData.splice(index, 1)[0];
            
            guardarEnLocalStorage();
            actualizarEstadisticas();
            cargarTablaProductos();
            
            mostrarMensaje('✅ Producto eliminado exitosamente');
            console.log('Producto eliminado:', productoEliminado);
        }
        
        cerrarModal();
        productoAEliminar = null;
    }
}

// ==================== FORMULARIOS ====================

// MOSTRAR FORMULARIO CREAR
function mostrarFormularioCrear() {
    document.getElementById('formulario-producto').style.display = 'block';
    document.getElementById('titulo-formulario').textContent = 'Crear Nuevo Producto';
    document.getElementById('form-producto').reset();
    document.getElementById('producto-id').value = '';
    document.getElementById('estado').value = 'activo';
    
    cargarCategoriasEnSelect();
    
    // Scroll al formulario
    document.getElementById('formulario-producto').scrollIntoView({ behavior: 'smooth' });
}

// MOSTRAR FORMULARIO EDITAR
function mostrarFormularioEditar(producto) {
    document.getElementById('formulario-producto').style.display = 'block';
    document.getElementById('titulo-formulario').textContent = 'Editar Producto';
    
    // Llenar formulario con datos del producto
    document.getElementById('producto-id').value = producto.id;
    document.getElementById('codigo').value = producto.codigo;
    document.getElementById('nombre').value = producto.nombre;
    document.getElementById('descripcionCorta').value = producto.descripcionCorta;
    document.getElementById('descripcionDetallada').value = producto.descripcionDetallada || '';
    document.getElementById('presentacion').value = producto.presentacion || '';
    document.getElementById('unidad').value = producto.unidad || 'unidad';
    document.getElementById('precio').value = producto.precio;
    document.getElementById('iva').value = producto.iva || 12;
    document.getElementById('imagen').value = producto.imagen || '';
    document.getElementById('notas').value = producto.notas || '';
    document.getElementById('estado').value = producto.estado || 'activo';
    
    cargarCategoriasEnSelect(producto.categoria);
    
    // Scroll al formulario
    document.getElementById('formulario-producto').scrollIntoView({ behavior: 'smooth' });
}

// OCULTAR FORMULARIO
function ocultarFormulario() {
    document.getElementById('formulario-producto').style.display = 'none';
}

// GUARDAR PRODUCTO (CREATE o UPDATE)
function guardarProducto(event) {
    event.preventDefault();
    
    const id = document.getElementById('producto-id').value;
    const esEdicion = id !== '';
    
    // Validaciones básicas
    if (!validarFormulario()) {
        return;
    }
    
    const producto = {
        codigo: document.getElementById('codigo').value.trim(),
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value,
        descripcionCorta: document.getElementById('descripcionCorta').value.trim(),
        descripcionDetallada: document.getElementById('descripcionDetallada').value.trim(),
        presentacion: document.getElementById('presentacion').value.trim(),
        unidad: document.getElementById('unidad').value.trim(),
        precio: parseFloat(document.getElementById('precio').value),
        iva: parseFloat(document.getElementById('iva').value) || 12,
        imagen: document.getElementById('imagen').value.trim(),
        notas: document.getElementById('notas').value.trim(),
        estado: document.getElementById('estado').value
    };
    
    if (esEdicion) {
        editarProducto(id, producto);
    } else {
        crearProducto(producto);
    }
    
    ocultarFormulario();
}

// ==================== FUNCIONES AUXILIARES ====================

// VALIDAR FORMULARIO
function validarFormulario() {
    const codigo = document.getElementById('codigo').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const categoria = document.getElementById('categoria').value;
    const precio = document.getElementById('precio').value;
    
    if (!codigo) {
        mostrarMensaje('El código es obligatorio', 'error');
        return false;
    }
    
    if (!nombre) {
        mostrarMensaje('El nombre es obligatorio', 'error');
        return false;
    }
    
    if (!categoria) {
        mostrarMensaje('La categoría es obligatoria', 'error');
        return false;
    }
    
    if (!precio || parseFloat(precio) <= 0) {
        mostrarMensaje('El precio debe ser mayor a 0', 'error');
        return false;
    }
    
    // Verificar si el código ya existe (solo en creación)
    if (!document.getElementById('producto-id').value) {
        const codigoExiste = productosData.some(p => p.codigo === codigo);
        if (codigoExiste) {
            mostrarMensaje('El código ya existe', 'error');
            return false;
        }
    }
    
    return true;
}

// CARGAR CATEGORÍAS EN SELECT
function cargarCategoriasEnSelect(categoriaSeleccionada = '') {
    const select = document.getElementById('categoria');
    select.innerHTML = '<option value="">Seleccionar categoría</option>';
    
    categoriasData.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        if (categoria === categoriaSeleccionada) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// CREAR FILA DE PRODUCTO PARA LA TABLA
function crearFilaProducto(producto) {
    const fila = document.createElement('tr');
    const precioConIVA = calcularPrecioConIVA(producto.precio, producto.iva);
    
    fila.innerHTML = `
        <td>
            <img src="${producto.imagen || 'img/placeholder.jpg'}" 
                 alt="${producto.nombre}" 
                 class="img-tabla"
                 onerror="this.src='img/placeholder.jpg'">
        </td>
        <td><strong>${producto.codigo}</strong></td>
        <td>
            <div class="info-producto">
                <div class="nombre-producto">${producto.nombre}</div>
                <div class="descripcion-corta">${producto.descripcionCorta}</div>
            </div>
        </td>
        <td>${producto.categoria}</td>
        <td>$${precioConIVA.toFixed(2)}</td>
        <td>
            <span class="estado ${producto.estado}">
                ${producto.estado}
            </span>
        </td>
        <td>
            <div class="acciones-producto">
                <button class="btn-accion btn-editar" 
                        onclick="mostrarFormularioEditar(${JSON.stringify(producto).replace(/"/g, '&quot;')})"
                        title="Editar producto">
                    ✏️ Editar
                </button>
                <button class="btn-accion btn-eliminar" 
                        onclick="eliminarProducto('${producto.id}')"
                        title="Eliminar producto">
                    🗑️ Eliminar
                </button>
                <button class="btn-accion btn-ver" 
                        onclick="verDetallesProducto('${producto.id}')"
                        title="Ver detalles">
                    👁️ Ver
                </button>
            </div>
        </td>
    `;
    
    return fila;
}

// CALCULAR PRECIO CON IVA
function calcularPrecioConIVA(precio, iva) {
    return precio * (1 + (iva / 100));
}

// GENERAR ID ÚNICO
function generarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==================== CONFIGURACIÓN DE EVENTOS ====================

function configurarEventos() {
    // Búsqueda rápida
    const busquedaRapida = document.getElementById('busqueda-rapida');
    if (busquedaRapida) {
        busquedaRapida.addEventListener('input', function(e) {
            const termino = e.target.value.toLowerCase().trim();
            filtrarProductos(termino);
        });
    }
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModal();
            ocultarFormulario();
        }
    });
}

function configurarOrdenamiento() {
    const headers = document.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const campo = this.getAttribute('data-sort');
            
            if (ordenActual.campo === campo) {
                ordenActual.direccion = ordenActual.direccion === 'asc' ? 'desc' : 'asc';
            } else {
                ordenActual.campo = campo;
                ordenActual.direccion = 'asc';
            }
            
            // Actualizar indicadores visuales
            headers.forEach(h => h.innerHTML = h.innerHTML.replace('🔽', '').replace('🔼', ''));
            this.innerHTML += ordenActual.direccion === 'asc' ? ' 🔽' : ' 🔼';
            
            cargarTablaProductos();
        });
    });
}

function ordenarProductos(productos) {
    return productos.sort((a, b) => {
        let valorA = a[ordenActual.campo];
        let valorB = b[ordenActual.campo];
        
        // Convertir a minúsculas para ordenamiento de texto
        if (typeof valorA === 'string') {
            valorA = valorA.toLowerCase();
            valorB = valorB.toLowerCase();
        }
        
        if (valorA < valorB) return ordenActual.direccion === 'asc' ? -1 : 1;
        if (valorA > valorB) return ordenActual.direccion === 'asc' ? 1 : -1;
        return 0;
    });
}

function filtrarProductos(termino) {
    if (termino.length === 0) {
        cargarTablaProductos();
        return;
    }
    
    const productosFiltrados = productosData.filter(producto =>
        producto.codigo.toLowerCase().includes(termino) ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.categoria.toLowerCase().includes(termino) ||
        producto.descripcionCorta.toLowerCase().includes(termino)
    );
    
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    cuerpoTabla.innerHTML = '';
    
    productosFiltrados.forEach(producto => {
        const fila = crearFilaProducto(producto);
        cuerpoTabla.appendChild(fila);
    });
}

// ==================== EXPORTACIÓN ====================

function exportarProductos() {
    const headers = ['Código', 'Nombre', 'Categoría', 'Descripción Corta', 'Precio', 'IVA', 'Estado', 'Fecha Creación'];
    const csvData = productosData.map(producto => [
        producto.codigo,
        producto.nombre,
        producto.categoria,
        producto.descripcionCorta,
        producto.precio,
        producto.iva,
        producto.estado,
        producto.fechaCreacion
    ]);
    
    let csvContent = headers.join(',') + '\n';
    csvData.forEach(fila => {
        csvContent += fila.map(dato => `"${dato}"`).join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `productos_yata_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarMensaje('📊 CSV exportado exitosamente');
}

// ==================== UTILIDADES ====================

function cerrarModal() {
    document.getElementById('modal-confirmar').style.display = 'none';
    productoAEliminar = null;
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje-flotante ${tipo}`;
    mensajeElement.textContent = mensaje;
    mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'error' ? '#f44336' : '#4CAF50'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(mensajeElement);
    
    setTimeout(() => {
        mensajeElement.remove();
    }, 4000);
}

function guardarEnLocalStorage() {
    localStorage.setItem('productosYATA', JSON.stringify({
        productos: productosData,
        categorias: categoriasData
    }));
}

function cargarDesdeLocalStorage() {
    const datosGuardados = localStorage.getItem('productosYATA');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        productosData = datos.productos || [];
        categoriasData = datos.categorias || [];
        return true;
    }
    return false;
}

function verDetallesProducto(id) {
    const producto = productosData.find(p => p.id === id);
    if (producto) {
        const detalles = `
Código: ${producto.codigo}
Nombre: ${producto.nombre}
Categoría: ${producto.categoria}
Precio: $${producto.precio}
IVA: ${producto.iva}%
Estado: ${producto.estado}
Descripción: ${producto.descripcionCorta}
        `;
        alert(detalles);
    }
}

// ==================== INICIALIZACIÓN ====================

// Intentar cargar desde localStorage primero, luego desde JSON
document.addEventListener('DOMContentLoaded', function() {
    if (!cargarDesdeLocalStorage()) {
        cargarProductos();
    } else {
        console.log('📂 Datos cargados desde localStorage');
        inicializarAplicacion();
    }
});