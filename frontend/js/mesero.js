import { API_URL } from './config.js';

// Estado global
let mesaActual = null;
let carritoMesa = [];
let menuProductos = [];

// Arreglo dinámico de mesas (Aquí puedes agregar más después)
let listaMesas = [
    { id: 1, nombre: 'Mesa 1', estado: 'libre', tiempo: '' },
    { id: 2, nombre: 'Mesa 2', estado: 'ocupada', tiempo: '45m' },
    { id: 3, nombre: 'Mesa 3', estado: 'esperando', tiempo: '' },
    { id: 4, nombre: 'Mesa 4', estado: 'libre', tiempo: '' },
    { id: 5, nombre: 'Mesa 5', estado: 'libre', tiempo: '' },
    { id: 6, nombre: 'Mesa 6', estado: 'ocupada', tiempo: '12m' },
    { id: 7, nombre: 'Mesa 7', estado: 'libre', tiempo: '' },
    { id: 8, nombre: 'Mesa 8', estado: 'libre', tiempo: '' },
    { id: 9, nombre: 'Mesa 9', estado: 'libre', tiempo: '' },
    { id: 10, nombre: 'Mesa 10', estado: 'libre', tiempo: '' }
];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Panel de Mesero conectado a:', API_URL);
    
    renderizarMesas();
    await verificarEstadoTienda();
    await cargarMenu();
    
    // Exponer funciones para que funcionen con el HTML
    window.abrirMesa = abrirMesa;
    window.cerrarTomaPedido = cerrarTomaPedido;
    window.abrirModalTallas = abrirModalTallas;
    window.cerrarModalTallas = cerrarModalTallas;
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.enviarACocina = enviarACocina;
});

// 1. Verificamos si la tienda está abierta
async function verificarEstadoTienda() {
    try {
        const respuesta = await fetch(`${API_URL}/api/estado`);
        const data = await respuesta.json();
        if (!data.abierto) alert("⚠️ El sistema de cocina está CERRADO.");
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
    }
}

// 2. Pintamos el mapa de mesas
function renderizarMesas() {
    const contenedor = document.getElementById('contenedor-mesas');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    listaMesas.forEach(mesa => {
        const card = document.createElement('div');
        let barraColor = 'bg-green-500';
        let bordeColor = 'border-gray-200';
        let contenidoHtml = '';

        if (mesa.estado === 'libre') {
            barraColor = 'bg-green-500'; bordeColor = 'border-gray-200';
            contenidoHtml = `<i class="fas fa-utensils text-3xl text-gray-300 mb-3"></i><h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3><p class="text-sm text-green-600 mt-1 font-medium">Disponible</p>`;
        } else if (mesa.estado === 'ocupada') {
            barraColor = 'bg-red-500'; bordeColor = 'border-red-200';
            contenidoHtml = `<div class="flex gap-1 mb-3 text-red-400"><i class="fas fa-user"></i><i class="fas fa-user"></i></div><h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3><p class="text-sm text-red-600 mt-1 font-medium">Consumiendo</p>${mesa.tiempo ? `<div class="absolute top-3 right-3 text-xs font-bold text-gray-400">${mesa.tiempo}</div>` : ''}`;
        } else if (mesa.estado === 'esperando') {
            barraColor = 'bg-yellow-400'; bordeColor = 'border-yellow-300';
            contenidoHtml = `<div class="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div><div class="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full"></div><i class="fas fa-bell-concierge text-3xl text-yellow-500 mb-3"></i><h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3><p class="text-sm text-yellow-600 mt-1 font-medium">Por Atender</p>`;
        }

        card.className = `mesa-card bg-white rounded-xl border ${bordeColor} overflow-hidden shadow-sm cursor-pointer relative`;
        card.onclick = () => abrirMesa(mesa.id, mesa.nombre, mesa.estado);
        card.innerHTML = `<div class="h-2 w-full ${barraColor}"></div><div class="p-5 flex flex-col items-center justify-center">${contenidoHtml}</div>`;
        contenedor.appendChild(card);
    });
}

// 3. Cargamos los productos de la BD
async function cargarMenu() {
    try {
        const respuesta = await fetch(`${API_URL}/menu`);
        if (respuesta.ok) {
            menuProductos = await respuesta.json();
        }
        renderizarProductos();
    } catch (error) {
        console.error("Error cargando menú:", error);
    }
}

// 4. Pintamos el Menú
function renderizarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    menuProductos.forEach(producto => {
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform";
        
        // ¡Al tocar, abrimos el modal de tallas!
        div.onclick = () => abrirModalTallas(producto); 
        
        const precioBase = Number(producto.precio) || 0;
        
        div.innerHTML = `
            <span class="text-4xl mb-2">${producto.emoji || '🍕'}</span>
            <h4 class="text-sm font-bold text-gray-800 text-center">${producto.nombre}</h4>
            <p class="text-indigo-600 font-bold mt-1 text-xs">Desde $${precioBase.toFixed(2)}</p>
        `;
        contenedor.appendChild(div);
    });
}

// 5. Control del Modal de Mesas
function abrirMesa(id, nombre, estado) {
    mesaActual = { id, nombre, estado };
    carritoMesa = [];
    document.getElementById('titulo-mesa-modal').innerText = nombre;
    actualizarResumenComanda();

    const modal = document.getElementById('modal-pedido');
    const panel = document.getElementById('panel-pedido');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
    }, 10);
}

function cerrarTomaPedido() {
    const modal = document.getElementById('modal-pedido');
    const panel = document.getElementById('panel-pedido');
    modal.classList.add('opacity-0');
    panel.classList.add('translate-x-full');
    setTimeout(() => {
        modal.classList.add('hidden');
        mesaActual = null;
    }, 300);
}

// 6. Modal de Tallas (El nuevo diseño bonito)
function abrirModalTallas(producto) {
    document.getElementById('modal-tallas-nombre').innerText = producto.nombre;
    document.getElementById('modal-tallas-emoji').innerText = producto.emoji || '🍕';

    const opcionesContenedor = document.getElementById('modal-tallas-opciones');
    opcionesContenedor.innerHTML = '';

    const tallas = [
        { nombre: 'Mediana', precio: Number(producto.precio) || 0 },
        { nombre: 'Grande', precio: Number(producto.precio_g) || 0 },
        { nombre: 'Familiar', precio: Number(producto.precio_f) || 0 }
    ];

    tallas.forEach(talla => {
        if (talla.precio > 0) {
            const btn = document.createElement('button');
            btn.className = "w-full flex justify-between items-center p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md transition-all active:scale-95 bg-white group";
            btn.onclick = () => agregarAlCarritoConTalla(producto, talla.nombre, talla.precio);
            btn.innerHTML = `
                <span class="font-bold text-gray-700 text-lg group-hover:text-indigo-700 transition-colors">${talla.nombre}</span>
                <span class="font-black text-indigo-600 text-xl">$${talla.precio.toFixed(2)}</span>
            `;
            opcionesContenedor.appendChild(btn);
        }
    });

    const modal = document.getElementById('modal-tallas');
    const panel = document.getElementById('panel-tallas');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('scale-95');
    }, 10);
}

function cerrarModalTallas() {
    const modal = document.getElementById('modal-tallas');
    const panel = document.getElementById('panel-tallas');
    modal.classList.add('opacity-0');
    panel.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }, 300);
}

// 7. Lógica del Carrito y Envío
function agregarAlCarritoConTalla(producto, tallaSeleccionada, precioReal) {
    const itemExistente = carritoMesa.find(item => item.producto_id === producto.id && item.talla === tallaSeleccionada);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carritoMesa.push({
            producto_id: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            talla: tallaSeleccionada,
            precio_aplicado: precioReal
        });
    }
    cerrarModalTallas();
    actualizarResumenComanda();
}

function eliminarDelCarrito(index) {
    carritoMesa.splice(index, 1);
    actualizarResumenComanda();
}

function actualizarResumenComanda() {
    const lista = document.getElementById('lista-comanda');
    const totalEl = document.getElementById('total-comanda');
    
    if (carritoMesa.length === 0) {
        lista.innerHTML = `<div class="text-center text-gray-400 mt-10 text-sm"><i class="fas fa-shopping-basket text-4xl mb-3 text-gray-200"></i><p>Toca los productos para agregarlos</p></div>`;
        totalEl.innerText = "$0.00";
        return;
    }

    lista.innerHTML = '';
    let total = 0;

    carritoMesa.forEach((prod, index) => {
        const subtotal = prod.precio_aplicado * prod.cantidad;
        total += subtotal;
        
        const item = document.createElement('div');
        item.className = "flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm";
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-2xl">🍕</span>
                <div class="flex flex-col">
                    <span class="font-bold text-sm text-gray-800">${prod.nombre} <span class="text-indigo-600 ml-1 font-black">(x${prod.cantidad})</span></span>
                    <span class="text-[11px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-md mt-1 w-max">Talla: ${prod.talla}</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="font-black text-gray-800 text-lg">$${subtotal.toFixed(2)}</span>
                <button onclick="eliminarDelCarrito(${index})" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });

    totalEl.innerText = `$${total.toFixed(2)}`;
}

async function enviarACocina() {
    if (carritoMesa.length === 0) {
        alert("⚠️ Agrega productos antes de enviar a cocina.");
        return;
    }

    const btnEnviar = document.getElementById('btn-enviar-cocina');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btnEnviar.disabled = true;

    try {
        const carritoLimpiado = carritoMesa.map(item => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
            talla: item.talla
        }));

        const payload = {
            mesa: mesaActual.nombre,
            carrito: carritoLimpiado
        };

        const respuesta = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (respuesta.ok) {
            alert(`✅ ¡Pedido enviado a cocina exitosamente!`);
            cerrarTomaPedido();
            
            const mesaIndex = listaMesas.findIndex(m => m.id === mesaActual.id);
            if (mesaIndex !== -1) {
                listaMesas[mesaIndex].estado = 'esperando';
                renderizarMesas(); 
            }
        } else {
            const dataError = await respuesta.json();
            throw new Error(dataError.error || "Error al crear pedido en PostgreSQL");
        }
    } catch (error) {
        console.error("Error al enviar pedido:", error);
        alert(`❌ Fallo el envío: ${error.message}`);
    } finally {
        btnEnviar.innerHTML = textoOriginal;
        btnEnviar.disabled = false;
    }
}