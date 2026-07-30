import { API_URL } from './config.js';

// Estado global
let mesaActual = null;
let carritoMesa = [];
let menuProductos = [];
// --- NUEVAS VARIABLES PARA MITADES ---
let modoMitadYMitad = false;
let mitadesSeleccionadas = []; // Guardará: { producto, talla, precio }

// --- EVENTO DEL INTERRUPTOR ---
document.getElementById('toggle-mitades').addEventListener('change', function(e) {
    modoMitadYMitad = e.target.checked;
    const textoEstado = document.getElementById('texto-estado-mitades');
    
    if (modoMitadYMitad) {
        textoEstado.innerText = "Toca la 1ra mitad...";
        textoEstado.classList.replace('text-indigo-600', 'text-orange-600');
    } else {
        textoEstado.innerText = "Apagado";
        textoEstado.classList.replace('text-orange-600', 'text-indigo-600');
        mitadesSeleccionadas = []; // Limpiamos por si el mesero se arrepiente
    }
});

// NUEVO: Conexión WebSocket
const socket = io(API_URL);

socket.on('connect', () => {
    console.log('🟢 Conectado al radar en tiempo real (Socket.io)');
});

// NUEVO: Escuchar cambios de mesa que hacen otros meseros
socket.on('sincronizar_mesa', (data) => {
    // Buscamos la mesa en nuestro arreglo local
    const mesaIndex = listaMesas.findIndex(m => m.id === data.id);
    if (mesaIndex !== -1) {
        listaMesas[mesaIndex].estado = data.estado; // Ej: cambia a 'esperando' o 'libre'
        renderizarMesas(); // Pintamos de nuevo la cuadrícula para ver el cambio de color
    }
});

// Arreglo dinámico de mesas (Ahora viene de la Base de Datos)
let listaMesas = [];
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Iniciando Panel de Mesero conectado a:', API_URL);
    
    await cargarMesas(); 
    await sincronizarMesasConComandasActivas(); // <-- ¡NUEVO! Comprueba si hay pedidos reales
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

// NUEVA FUNCIÓN: Sincroniza y limpia automáticamente los estados falsos al recargar la página
// NUEVA FUNCIÓN: Sincroniza el estado real de las mesas al recargar la página
async function sincronizarMesasConComandasActivas() {
    try {
        // 1. Obtenemos las comandas activas reales del panel de administración
        const loginRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: "cinelandia2026" })
        });
        if (!loginRes.ok) return;
        const { token } = await loginRes.json();

        const respuesta = await fetch(`${API_URL}/admin/pedidos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!respuesta.ok) return;
        
        let comandas = await respuesta.json();
        if (!Array.isArray(comandas) && Array.isArray(comandas.pedidos)) comandas = comandas.pedidos;

        // 2. Filtramos únicamente las comandas que siguen en curso en la cocina (excluyendo finalizados/pagados)
        const activas = comandas.filter(c => {
            const est = String(c.estado || '').toLowerCase();
            return est !== 'pagado' && est !== 'finalizado' && est !== 'entregado' && est !== 'cancelado';
        });

        // Creamos una lista limpia con los nombres de las mesas que SÍ tienen pedidos reales activos
        const mesasConPedidosActivos = activas.map(c => String(c.mesa).trim());

        // 3. CORRECCIÓN AUTOMÁTICA AL CARGAR/RECARGAR:
        // Si la BD del mesero cree que la mesa está ocupada/esperando, pero no hay un pedido activo real, la pasamos a 'libre'.
        listaMesas.forEach(mesa => {
            const nombreMesa = String(mesa.nombre).trim();
            const tienePedidoReal = mesasConPedidosActivos.includes(nombreMesa);

            if (!tienePedidoReal) {
                mesa.estado = 'libre'; // Forzamos a verde si no hay pedido activo en curso
            } else {
                // Si sí tiene un pedido real, mantenemos o ajustamos su estado según la comanda
                const comandaReal = activas.find(c => String(c.mesa).trim() === nombreMesa);
                if (comandaReal) {
                    const estComanda = String(comandaReal.estado || '').toLowerCase();
                    if (estComanda === 'cocinando') mesa.estado = 'cocinando';
                    else if (estComanda === 'listo' || estComanda === 'preparado') mesa.estado = 'listo';
                    else mesa.estado = 'esperando';
                }
            }
        });

    } catch (e) {
        console.error("No se pudo sincronizar el estado inicial de las mesas:", e);
    }
}

// NUEVA FUNCIÓN: Consulta las mesas en PostgreSQL
async function cargarMesas() {
    try {
        const respuesta = await fetch(`${API_URL}/mesas`);
        if (respuesta.ok) {
            listaMesas = await respuesta.json();
        } else {
            console.error("Error en respuesta de mesas");
        }
    } catch (error) {
        console.error("Error al cargar mesas desde la BD:", error);
    }
}

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
// 2. Pintamos el mapa de mesas y actualizamos contadores
// 2. Pintamos el mapa de mesas y actualizamos los estados y colores correctamente
function renderizarMesas() {
    const contenedor = document.getElementById('contenedor-mesas');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    // Contadores en cero
    let totalLibres = 0;
    let totalOcupadas = 0;
    let totalEspera = 0;

    listaMesas.forEach(mesa => {
        const card = document.createElement('div');
        let barraColor = 'bg-green-500';
        let bordeColor = 'border-gray-200';
        let contenidoHtml = '';

        const estado = String(mesa.estado || '').toLowerCase();

        if (estado === 'libre') {
            totalLibres++; // Solo suma si el estado real es 'libre'
            barraColor = 'bg-green-500'; 
            bordeColor = 'border-gray-200';
            contenidoHtml = `
                <i class="fas fa-utensils text-3xl text-gray-300 mb-3"></i>
                <h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3>
                <p class="text-sm text-green-600 mt-1 font-medium">Disponible</p>`;
        } 
        else if (estado === 'cocinando') {
            totalEspera++;
            barraColor = 'bg-orange-500'; 
            bordeColor = 'border-orange-300';
            contenidoHtml = `
                <div class="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <i class="fas fa-bell-concierge text-3xl text-orange-500 mb-3"></i>
                <h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3>
                <p class="text-sm text-orange-600 mt-1 font-black">Cocinando 👨‍🍳</p>`;
        } 
        else if (estado === 'listo' || estado === 'preparado') {
            totalOcupadas++; // CAMBIO: Ahora cuenta como mesa ocupada/con atención pendiente de entrega
            barraColor = 'bg-blue-600'; 
            bordeColor = 'border-blue-400';
            contenidoHtml = `
                <div class="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                <i class="fas fa-bell text-3xl text-blue-600 mb-3"></i>
                <h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3>
                <p class="text-sm text-blue-700 mt-1 font-black">¡LISTO PARA SERVIR! 🔔</p>`;
        }
        else {
            totalEspera++;
            barraColor = 'bg-yellow-400'; 
            bordeColor = 'border-yellow-300';
            contenidoHtml = `
                <div class="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                <i class="fas fa-bell-concierge text-3xl text-yellow-500 mb-3"></i>
                <h3 class="text-xl font-bold text-gray-800">${mesa.nombre}</h3>
                <p class="text-sm text-yellow-600 mt-1 font-medium">Por Atender</p>`;
        }

        card.className = `mesa-card bg-white rounded-xl border ${bordeColor} overflow-hidden shadow-sm cursor-pointer relative`;
        card.onclick = () => abrirMesa(mesa.id, mesa.nombre, mesa.estado);
        card.innerHTML = `<div class="h-2 w-full ${barraColor}"></div><div class="p-5 flex flex-col items-center justify-center">${contenidoHtml}</div>`;
        contenedor.appendChild(card);
    });

    // --- FILTRO DE SEGURIDAD PARA EL MÁXIMO DE MESAS ---
    // Si por registros duplicados en la BD la suma excede tus 10 mesas reales, 
    // forzamos el límite matemático para que nunca muestre de más.
    const totalMesasReales = 10;
    if (totalLibres > totalMesasReales) {
        totalLibres = totalMesasReales - (totalOcupadas + totalEspera);
        if (totalLibres < 0) totalLibres = 0;
    }

    // Actualizamos los números en la pantalla del mesero
// Actualizamos los números en la pantalla del mesero usando los contadores reales
    const badgeLibres = document.getElementById('badge-libres');
    const badgeOcupadas = document.getElementById('badge-ocupadas');
    const badgeEspera = document.getElementById('badge-espera');

    if (badgeLibres) badgeLibres.innerText = `Libres: ${totalLibres}`;
    if (badgeOcupadas) badgeOcupadas.innerText = `Ocupadas: ${totalOcupadas}`;
    if (badgeEspera) badgeEspera.innerText = `En Proceso: ${totalEspera}`;
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

// 5. Control del Modal de Mesas (ACTUALIZADO)
function abrirMesa(id, nombre, estado) {
    mesaActual = { id, nombre, estado };
    carritoMesa = []; // Siempre inicia vacío para tomar SOLO los productos nuevos
    
    document.getElementById('titulo-mesa-modal').innerText = nombre;
    
    const btnEnviar = document.getElementById('btn-enviar-cocina');
    const subtitulo = document.getElementById('subtitulo-mesa-modal');
    
    // VERIFICAMOS EL ESTADO DE LA MESA
    if (estado === 'libre') {
        subtitulo.innerText = "Nueva Comanda";
        btnEnviar.innerHTML = '<i class="fas fa-fire-burner"></i> Enviar a Cocina';
        btnEnviar.onclick = enviarACocina;
    } else {
        // La mesa está 'esperando' u 'ocupada'
        subtitulo.innerText = "Añadiendo productos al ticket actual";
        btnEnviar.innerHTML = '<i class="fas fa-plus"></i> Añadir a la Orden';
        btnEnviar.onclick = agregarAPedidoExistente; 
    }

    actualizarResumenComanda();

    const modal = document.getElementById('modal-pedido');
    const panel = document.getElementById('panel-pedido');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
    }, 10);
}
// NUEVA FUNCIÓN: Envía los productos extra a la base de datos
// NUEVA FUNCIÓN: Envía los productos extra a la base de datos con Autocorrección
window.agregarAPedidoExistente = async () => {
    if (carritoMesa.length === 0) {
        alert("⚠️ Agrega productos antes de añadir a la orden.");
        return;
    }
    
    const btnEnviar = document.getElementById('btn-enviar-cocina');
    const textoOriginal = btnEnviar.innerHTML;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Añadiendo...';
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

        const respuesta = await fetch(`${API_URL}/pedidos/agregar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (respuesta.ok) {
            alert(`✅ ¡Productos extra añadidos a la ${mesaActual.nombre} con éxito!`);
            cerrarTomaPedido();

            const mesaIndex = listaMesas.findIndex(m => m.id === mesaActual.id);
            if (mesaIndex !== -1) {
                listaMesas[mesaIndex].estado = 'esperando';
                renderizarMesas(); 
                
                socket.emit('actualizar_estado_mesa', { 
                    id: mesaActual.id, 
                    estado: 'esperando' 
                });
            }
        } else {
            const dataError = await respuesta.json();
            // Convertimos la respuesta a texto en minúsculas para atrapar cualquier variación del error
            const textoError = JSON.stringify(dataError).toLowerCase();
            
            // --- SISTEMA DE AUTOCORRECCIÓN INTELIGENTE ---
            if (respuesta.status === 400 && (textoError.includes("pedido activo") || textoError.includes("curso"))) {
                
                alert("⚠️ El administrador ya finalizó el pedido anterior de esta mesa.\n\nLiberando la mesa automáticamente... Presiona ENVIAR nuevamente para procesar estos productos como una NUEVA COMANDA.");
                
                // 1. Corregimos el error de la Base de Datos desde el Frontend (Ponemos la mesa Libre)
                const mesaIndex = listaMesas.findIndex(m => m.id === mesaActual.id);
                if (mesaIndex !== -1) {
                    listaMesas[mesaIndex].estado = 'libre';
                    renderizarMesas();
                }
                mesaActual.estado = 'libre';
                
                // 2. Le avisamos a las demás tablets que la mesa ya está libre
                socket.emit('actualizar_estado_mesa', { 
                    id: mesaActual.id, 
                    estado: 'libre' 
                });
                
                // 3. Cambiamos el modal al modo "Nueva Comanda" para evitar el choque con la BD
                document.getElementById('subtitulo-mesa-modal').innerText = "Nueva Comanda";
                btnEnviar.innerHTML = '<i class="fas fa-fire-burner"></i> Enviar a Cocina (Nueva Orden)';
                btnEnviar.onclick = enviarACocina;
                btnEnviar.disabled = false;
                
                return; // Detenemos la función aquí para no mostrar el error rojo
            }
            // ---------------------------------

            throw new Error(dataError.error || dataError.message || "Error al añadir productos en la base de datos");
        }
    } catch (error) {
        console.error("Error al añadir al pedido:", error);
        alert(`❌ Fallo la actualización: ${error.message}`);
    } finally {
        // Solo devolvemos el botón a su estado original si NO se activó la autocorrección
        if (btnEnviar.onclick !== enviarACocina) {
            btnEnviar.innerHTML = textoOriginal;
            btnEnviar.disabled = false;
        }
    }
};
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
    // Si estamos en modo mitad y ya escogimos la primera, NO abrimos el modal
    if (modoMitadYMitad && mitadesSeleccionadas.length === 1) {
        const primeraMitad = mitadesSeleccionadas[0];
        const tallaPrevia = primeraMitad.talla;
        
        // Buscamos el precio de esta 2da pizza según la talla elegida en la 1ra
        let precioSegundaMitad = 0;
        if (tallaPrevia === 'Mediana') precioSegundaMitad = Number(producto.precio) || 0;
        else if (tallaPrevia === 'Grande') precioSegundaMitad = Number(producto.precio_g) || 0;
        else if (tallaPrevia === 'Familiar') precioSegundaMitad = Number(producto.precio_f) || 0;

        // Procesamos la pizza combinada de inmediato
        procesarMitadYMitad(producto, tallaPrevia, precioSegundaMitad);
        return; 
    }

    // FLUJO NORMAL (o Primera Mitad): Abrir el modal
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
    // Si estamos en modo mitad y es la PRIMERA pizza que se elige
    if (modoMitadYMitad && mitadesSeleccionadas.length === 0) {
        mitadesSeleccionadas.push({ producto: producto, talla: tallaSeleccionada, precio: precioReal });
        
        // Actualizamos UI para pedir la segunda
        document.getElementById('texto-estado-mitades').innerText = `1/2 ${producto.nombre} (${tallaSeleccionada}). Toca la 2da...`;
        cerrarModalTallas();
        return;
    }

    // Lógica Normal
    const itemExistente = carritoMesa.find(item => item.producto_id === producto.id && item.talla === tallaSeleccionada && !item.es_mitad);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carritoMesa.push({
            producto_id: producto.id,
            nombre: producto.nombre,
            cantidad: 1,
            talla: tallaSeleccionada,
            precio_aplicado: precioReal,
            es_mitad: false
        });
    }
    cerrarModalTallas();
    actualizarResumenComanda();
}

// FUNCIÓN NUEVA: Combina las mitades y cobra la más cara
function procesarMitadYMitad(segundoProducto, talla, precioSegundaMitad) {
    const primeraMitad = mitadesSeleccionadas[0];
    
    // Regla de oro: Cobrar el precio mayor
    const precioFinal = Math.max(primeraMitad.precio, precioSegundaMitad);
    const nombreCombinado = `1/2 ${primeraMitad.producto.nombre} y 1/2 ${segundoProducto.nombre}`;
    
    carritoMesa.push({
        producto_id: `mixta-${primeraMitad.producto.id}-${segundoProducto.id}`, // ID único compuesto
        nombre: nombreCombinado,
        cantidad: 1,
        talla: talla,
        precio_aplicado: precioFinal,
        es_mitad: true,
        ids_mitades: [primeraMitad.producto.id, segundoProducto.id] // Útil para descontar inventario en el backend
    });

    actualizarResumenComanda();
    
    // Apagar el switch y reiniciar variables
    const toggle = document.getElementById('toggle-mitades');
    toggle.checked = false;
    toggle.dispatchEvent(new Event('change')); // Fuerza a que corra el evento para limpiar los textos
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
            talla: item.talla,
            precio_unitario: item.precio_aplicado, // Te sugiero enviarlo siempre
            es_mitad: item.es_mitad || false,
            ids_mitades: item.ids_mitades || []
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
                // NUEVO: Avisarle al backend que cambiamos el estado de esta mesa
                // para que le avise a las demás tablets
                socket.emit('actualizar_estado_mesa', { 
                    id: mesaActual.id, 
                    estado: 'esperando' 
                }); 
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
// Exponer las nuevas funciones globalmente para que el HTML pueda llamarlas
window.abrirModalComandas = abrirModalComandas;
window.cerrarModalComandas = cerrarModalComandas;

// Función para abrir y animar el modal
async function abrirModalComandas() {
    const modal = document.getElementById('modal-ver-comandas');
    const panel = document.getElementById('panel-ver-comandas');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (window.innerWidth < 768) {
            panel.classList.remove('translate-y-full'); // Animación móvil
        } else {
            panel.classList.remove('scale-95'); // Animación PC/Tablet
        }
    }, 10);

    await cargarYRenderizarComandas();
}

// Función para cerrar y animar el modal
function cerrarModalComandas() {
    const modal = document.getElementById('modal-ver-comandas');
    const panel = document.getElementById('panel-ver-comandas');
    
    modal.classList.add('opacity-0');
    if (window.innerWidth < 768) {
        panel.classList.add('translate-y-full');
    } else {
        panel.classList.add('scale-95');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Función para obtener los pedidos del backend y pintarlos
async function cargarYRenderizarComandas() {
    const contenedor = document.getElementById('contenedor-lista-comandas');
    
    // Estado de carga
    contenedor.innerHTML = `
        <div class="text-center text-gray-400 mt-10">
            <i class="fas fa-spinner fa-spin text-4xl mb-3 text-indigo-500"></i>
            <p class="font-medium text-gray-500">Consultando comandas...</p>
        </div>`;

    try {
        // 1. Obtener la llave de seguridad (Token) silenciosamente
        const loginRes = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: "cinelandia2026" }) // La misma clave del admin
        });
        
        if (!loginRes.ok) throw new Error("Fallo de seguridad al conectar");
        const { token } = await loginRes.json();

        // 2. Pedir las comandas usando la ruta correcta y entregando la llave
        // ¡Ojo aquí! Usamos /admin/pedidos, sin el /api
        const respuesta = await fetch(`${API_URL}/admin/pedidos`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }); 

        if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);
        
        let comandas = await respuesta.json();

        // Si la respuesta viene envuelta en un objeto
        if (!Array.isArray(comandas) && Array.isArray(comandas.pedidos)) {
            comandas = comandas.pedidos;
        } else if (!Array.isArray(comandas) && Array.isArray(comandas.data)) {
            comandas = comandas.data;
        }

        if (!Array.isArray(comandas)) {
            throw new Error("El formato de respuesta del servidor no es válido.");
        }

        // 3. Filtramos solo las que estén en proceso/activas
        const comandasActivas = comandas.filter(c => {
            const estadoLower = String(c.estado || '').toLowerCase();
            return estadoLower !== 'pagado' && estadoLower !== 'finalizado' && estadoLower !== 'entregado' && estadoLower !== 'cancelado';
        });

        if (comandasActivas.length === 0) {
            contenedor.innerHTML = `
                <div class="text-center text-gray-500 mt-16 flex flex-col items-center">
                    <div class="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-clipboard-check text-3xl text-gray-400"></i>
                    </div>
                    <p class="font-bold text-lg text-gray-700">Sin comandas activas</p>
                    <p class="text-sm">No hay pedidos pendientes en este momento.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = ''; // Limpiar el contenedor

        // 4. Renderizar estilo Admin
        comandasActivas.forEach(comanda => {
            const card = document.createElement('div');
            card.className = "bg-white border border-gray-200 rounded-xl shadow-sm mb-5 overflow-hidden transition-all hover:shadow-md";
            
            // Determinar color de la insignia (Badge)
            const estadoLower = String(comanda.estado || '').toLowerCase();
            let badgeHTML = '';
            
            if (estadoLower === 'esperando' || estadoLower === 'pendiente' || estadoLower === 'cocinando') {
                badgeHTML = `<span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"><i class="fas fa-fire mr-1"></i>En Cocina</span>`;
            } else if (estadoLower === 'preparado' || estadoLower === 'listo') {
                badgeHTML = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider"><i class="fas fa-check-circle mr-1"></i>Listo</span>`;
            } else {
                badgeHTML = `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">${comanda.estado || 'Activo'}</span>`;
            }

            // Mapear los ítems del pedido
            const listaItems = comanda.items || comanda.carrito || comanda.productos || [];
            let itemsHTML = '';
            
            if (Array.isArray(listaItems) && listaItems.length > 0) {
                listaItems.forEach(item => {
                    const cantidad = item.cantidad || 1;
                    const nombre = item.nombre || item.producto_nombre || 'Producto';
                    const talla = item.talla || '';
                    const precioUnitario = Number(item.precio_unitario || item.precio || 0);

                    itemsHTML += `
                        <div class="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                            <div class="flex items-center gap-3">
                                <span class="bg-indigo-50 text-indigo-700 font-black rounded-lg w-8 h-8 flex items-center justify-center text-sm">x${cantidad}</span>
                                <div class="flex flex-col">
                                    <span class="font-bold text-gray-800 text-sm">${nombre}</span>
                                    ${talla ? `<span class="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded w-max mt-0.5">${talla}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                itemsHTML = `<p class="text-sm text-gray-400 italic py-2">Sin detalles de productos</p>`;
            }

            const nombreMesa = comanda.mesa || comanda.mesa_nombre || `Mesa #${comanda.mesa_id || comanda.id}`;

            card.innerHTML = `
                <div class="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 class="font-black text-lg text-gray-800 flex items-center gap-2">
                        <i class="fas fa-chair text-indigo-500"></i> ${nombreMesa}
                    </h3>
                    ${badgeHTML}
                </div>
                <div class="p-5">
                    <div class="space-y-1">
                        ${itemsHTML}
                    </div>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar comandas:", error);
        contenedor.innerHTML = `
            <div class="text-center text-red-500 mt-10">
                <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                <p class="font-bold">Error al consultar comandas</p>
                <p class="text-sm text-gray-500 mt-1">${error.message}</p>
            </div>`;
    }
}

