let carrito = [];
let menuDataCache = [];
const API_URL = "http://localhost:3000";

let tipoEntregaSeleccionado = 'Delivery'; 

const urlParams = new URLSearchParams(window.location.search);
const numeroMesa = urlParams.get('mesa');

document.addEventListener('DOMContentLoaded', () => {
    if (numeroMesa) {
        const contenedorMesa = document.getElementById('contenedor-mesa');
        const tagMesa = document.getElementById('mesa-tag-visual');
        tagMesa.innerText = numeroMesa;
        contenedorMesa.classList.remove('hidden');
        contenedorMesa.classList.add('flex');
        
        const selector = document.getElementById('selector-tipo-entrega');
        if(selector) {
            selector.classList.remove('flex');
            selector.classList.add('hidden');
        }
    } else {
        const selector = document.getElementById('selector-tipo-entrega');
        if(selector) {
            selector.classList.remove('hidden');
            selector.classList.add('flex');
        }
    }
    cargarMenu();
});

function setTipoEntrega(tipo) {
    tipoEntregaSeleccionado = tipo;
    const btnDelivery = document.getElementById('btn-delivery');
    const btnRetiro = document.getElementById('btn-retiro');
    
    if (tipo === 'Delivery') {
        btnDelivery.className = "flex-1 flex items-center justify-center gap-1 md:gap-1.5 bg-yellow-400 text-black font-black py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]";
        btnDelivery.innerHTML = '<img src="delivery.png" alt="Delivery" class="h-3.5 md:h-4 w-auto drop-shadow-sm"> DELIVERY';
        
        btnRetiro.className = "flex-1 flex items-center justify-center gap-1 md:gap-1.5 text-gray-400 font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs transition-all hover:text-white";
        btnRetiro.innerHTML = '<img src="buzzcorriendo.png" alt="Retiro" class="h-3.5 md:h-4 w-auto drop-shadow-sm opacity-50"> RETIRO';
    } else {
        btnRetiro.className = "flex-1 flex items-center justify-center gap-1 md:gap-1.5 bg-yellow-400 text-black font-black py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs transition-all shadow-[0_0_15px_rgba(250,204,21,0.2)]";
        btnRetiro.innerHTML = '<img src="buzzcorriendo.png" alt="Retiro" class="h-3.5 md:h-4 w-auto drop-shadow-sm"> RETIRO';
        
        btnDelivery.className = "flex-1 flex items-center justify-center gap-1 md:gap-1.5 text-gray-400 font-bold py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs transition-all hover:text-white";
        btnDelivery.innerHTML = '<img src="delivery.png" alt="Delivery" class="h-3.5 md:h-4 w-auto drop-shadow-sm opacity-50"> DELIVERY';
    }
}

async function cargarMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        menuDataCache = await response.json();
        renderPizzas(menuDataCache);
    } catch (error) {
        console.error("Error conectando con Node.js:", error);
    }
}

function renderPizzas(pizzas) {
    const contenedor = document.getElementById('pizza-container');
    contenedor.innerHTML = ''; 
    
    pizzas.forEach(pizza => {
        const pMediana = parseFloat(pizza.precio).toFixed(2);
        const pGrande = parseFloat(pizza.precio_g).toFixed(2);
        const pFamiliar = parseFloat(pizza.precio_f).toFixed(2);

        const tarjeta = `
            <div class="group bg-[#0d1526] text-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 flex flex-col h-full">
                <div class="relative h-28 md:h-48 overflow-hidden shrink-0">
                    <img src="${pizza.imagen_url || 'https://via.placeholder.com/400x300'}" class="w-full h-full object-cover">
                </div>
                <div class="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
                    <h2 class="text-sm sm:text-base md:text-xl font-black italic uppercase mb-1 text-yellow-400 leading-tight">${pizza.nombre}</h2>
                    <p class="text-gray-400 text-[10px] md:text-xs mb-3 md:mb-4 line-clamp-2 leading-tight">${pizza.descripcion || ''}</p>
                    
                    <div class="flex flex-col gap-1.5 md:grid md:grid-cols-3 md:gap-2 mt-auto">
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pMediana}, 'Mediana')" 
                                class="flex md:flex-col items-center justify-between md:justify-center px-2.5 py-1.5 md:py-3 bg-white/5 hover:bg-yellow-400 hover:text-black rounded-lg md:rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-[9px] sm:text-[10px] md:text-xs font-bold md:mb-1 text-gray-300 group-hover/btn:text-black">Mediana</span>
                            <span class="text-[10px] sm:text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pMediana}</span>
                        </button>
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pGrande}, 'Grande')" 
                                class="flex md:flex-col items-center justify-between md:justify-center px-2.5 py-1.5 md:py-3 bg-white/5 hover:bg-yellow-400 hover:text-black rounded-lg md:rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-[9px] sm:text-[10px] md:text-xs font-bold md:mb-1 text-gray-300 group-hover/btn:text-black">Grande</span>
                            <span class="text-[10px] sm:text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pGrande}</span>
                        </button>
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pFamiliar}, 'Familiar')" 
                                class="flex md:flex-col items-center justify-between md:justify-center px-2.5 py-1.5 md:py-3 bg-white/5 hover:bg-yellow-400 hover:text-black rounded-lg md:rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-[9px] sm:text-[10px] md:text-xs font-bold md:mb-1 text-gray-300 group-hover/btn:text-black">Familiar</span>
                            <span class="text-[10px] sm:text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pFamiliar}</span>
                        </button>
                    </div>
                </div>
            </div>`;
        contenedor.innerHTML += tarjeta;
    });
}

function filtrar(categoria, botonElemento) {
    document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.remove('active', 'bg-yellow-400', 'text-black');
        btn.classList.add('bg-white/5', 'text-gray-300', 'border-white/20');
    });
    botonElemento.classList.remove('bg-white/5', 'text-gray-300', 'border-white/20');
    botonElemento.classList.add('active', 'bg-yellow-400', 'text-black');

    let filtradas = [];
    if (categoria === 'Todos') {
        filtradas = menuDataCache;
    } else if (categoria === 'Recomendados') {
        filtradas = menuDataCache.filter(p => p.es_recomendado === true);
    } else {
        filtradas = menuDataCache.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    renderPizzas(filtradas);
}

async function procesarPedido() {
    if (carrito.length === 0) return mostrarAlerta("El carrito está vacío. ¡Agrega algunas pizzas galácticas!");
    
    const btnConfirmar = document.getElementById('btn-confirmar-pedido');
    const textoOriginal = btnConfirmar.innerHTML; 
    
    btnConfirmar.disabled = true;
    btnConfirmar.classList.add('opacity-50', 'cursor-wait');
    btnConfirmar.innerHTML = 'Enviando a la nave... 🚀 <span class="animate-pulse">...</span>';

    const pedidoData = {
        mesa: numeroMesa ? numeroMesa : tipoEntregaSeleccionado,
        carrito: carrito.map(item => ({ 
            producto_id: item.producto_id, 
            cantidad: item.cantidad, 
            precio_unitario: item.precio,
            talla: item.talla 
        }))
    };

    try {
        const res = await fetch(`${API_URL}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedidoData)
        });

        if (res.ok) {
            const data = await res.json();
            const codigoMision = `ASTRO-${data.pedidoId}`;
            
            document.getElementById('codigo-pedido-modal').innerText = codigoMision;
            
            let ticketHTML = '';
            let totalTicket = 0;
            
            carrito.forEach(item => {
                const sub = item.precio * item.cantidad;
                totalTicket += sub;
                ticketHTML += `<div class="flex justify-between"><span><span class="text-yellow-400 font-bold">${item.cantidad}x</span> ${item.nombre}</span><span>$${sub.toFixed(2)}</span></div>`;
            });
            
            document.getElementById('ticket-items').innerHTML = ticketHTML;
            document.getElementById('ticket-total-final').innerText = `$${totalTicket.toFixed(2)}`;

            const contexto = document.getElementById('modal-mensaje-contexto');
            const botones = document.getElementById('modal-botones-container');
            
            if (numeroMesa) {
                contexto.innerHTML = '¡Tu pedido ya está en cocina! Te lo llevaremos a tu mesa pronto. El pago se realizará con tu mesero.';
                botones.innerHTML = `<button onclick="irAlRadarDesdeModal()" class="w-full bg-yellow-400 text-black px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-sm md:text-lg hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all">Rastrear mi Pedido 📡</button>`;
            } else {
                contexto.innerHTML = 'Orden registrada. Realiza el pago vía WhatsApp para que la cocina inicie tu pedido.';
                
                let msjWA = `🚀 *PIZZA PLANETA - NUEVO PEDIDO* 🚀\n`;
                msjWA += `🛸 *Misión:* ${codigoMision}\n`;
                msjWA += `📍 *Entrega:* ${tipoEntregaSeleccionado}\n\n`;
                msjWA += `🍕 *Detalle de la orden:*\n`;
                carrito.forEach(item => {
                    msjWA += `- ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toFixed(2)}\n`;
                });
                msjWA += `\n💰 *TOTAL A PAGAR: $${totalTicket.toFixed(2)}*\n\n`;
                msjWA += `¡Hola base espacial! Acabo de realizar este pedido en la web y quiero coordinar mi pago. 👽🍕`;
                
                const linkWA = `https://wa.me/584147363029?text=${encodeURIComponent(msjWA)}`;

                botones.innerHTML = `
                    <a href="${linkWA}" target="_blank" class="w-full bg-green-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-black text-sm md:text-lg hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] block no-underline flex items-center justify-center gap-2 transition-all">
                        Pagar en WhatsApp 
                        <svg viewBox="0 0 24 24" class="w-5 h-5 md:w-6 md:h-6" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.964 9.964 0 001.333 4.993L2 22l5.233-1.237a9.994 9.994 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.935 9.935 0 0012.012 2zm5.72 14.156c-.242.684-1.408 1.309-1.95 1.428-.5.107-1.15.228-3.415-.71-2.906-1.205-4.757-4.237-4.898-4.426-.142-.19-1.168-1.554-1.168-2.966 0-1.412.736-2.113.999-2.398.263-.285.57-.356.76-.356.19 0 .38.001.545.009.176.009.412-.066.645.498.243.589.835 2.039.911 2.193.076.154.127.333.032.523-.095.19-.143.309-.285.475-.143.166-.3.356-.428.5-.143.143-.295.3-.133.58.161.279.718 1.188 1.543 1.923 1.066.95 1.956 1.242 2.242 1.385.285.143.45.119.617-.066.166-.185.712-.827.902-1.112.19-.285.38-.238.641-.143.261.095 1.647.778 1.932.92.285.142.475.214.546.333.071.119.071.685-.171 1.369z"/></svg>
                    </a>
                    <button onclick="irAlRadarDesdeModal()" class="w-full text-gray-400 font-bold py-1 md:py-2 hover:text-white transition-colors text-[11px] md:text-sm">Ya pagué, ir al Radar 📡</button>
                `;
            }

            document.getElementById('modal-confirmacion').classList.remove('hidden');
            
            carrito = [];
            actualizarCarritoVisual();
            toggleCart();
        } else {
            mostrarAlerta("Hubo un problema de comunicación con la base de control. Intenta de nuevo.");
        }
    } catch (e) {
        mostrarAlerta("Error de conexión. Revisa tu señal e intenta de nuevo.");
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.classList.remove('opacity-50', 'cursor-wait');
        btnConfirmar.innerHTML = textoOriginal;
    }
}

function agregarAlCarrito(id, nombre, precio, talla) {
    const nombreCompleto = `${nombre} (${talla})`;
    const index = carrito.findIndex(item => item.producto_id === id && item.talla === talla);
    
    if (index !== -1) {
        carrito[index].cantidad += 1; 
    } else {
        carrito.push({ 
            producto_id: id, 
            nombre: nombreCompleto, 
            precio: parseFloat(precio),
            talla: talla,
            cantidad: 1 
        });
    }
    actualizarCarritoVisual();
    if (document.getElementById('cart-sidebar').classList.contains('translate-x-full')) toggleCart();
}

function actualizarCarritoVisual() {
    const contenedorItems = document.getElementById('cart-items');
    const totalElemento = document.getElementById('cart-total');
    const contador = document.getElementById('cart-count');
    
    let sumaTotal = 0;
    let totalPizzas = 0;
    contenedorItems.innerHTML = '';

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        sumaTotal += subtotal;
        totalPizzas += item.cantidad;
        
        contenedorItems.innerHTML += `
            <div class="flex justify-between items-center bg-gray-900/80 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-800 mb-2 md:mb-3">
                <div class="flex-grow pr-2">
                    <p class="font-black text-xs md:text-sm italic text-white leading-tight mb-1">
                        <span class="text-yellow-400 mr-1">${item.cantidad}x</span>${item.nombre}
                    </p>
                    <p class="text-green-400 font-bold text-[10px] md:text-xs">$${subtotal.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-1 bg-black/50 rounded-lg p-1">
                    <button onclick="cambiarCantidad(${index}, -1)" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-800 text-white rounded-md font-bold hover:bg-red-500 transition-colors">-</button>
                    <button onclick="cambiarCantidad(${index}, 1)" class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-800 text-white rounded-md font-bold hover:bg-green-500 transition-colors">+</button>
                </div>
            </div>`;
    });
    contador.innerText = totalPizzas;
    totalElemento.innerText = `$${sumaTotal.toFixed(2)}`;
}

function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1);
    }
    actualizarCarritoVisual();
}

function eliminarDelCarrito(index) { carrito.splice(index, 1); actualizarCarritoVisual(); }
function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('translate-x-full'); }
function cerrarModal() { document.getElementById('modal-confirmacion').classList.add('hidden'); }

function iniciarDespegue() {
    const cohete = document.getElementById('contenedor-cohete');
    cohete.classList.add('animacion-rumble');
    document.getElementById('fuego-motor').classList.add('fuego-activo');
    setTimeout(() => {
        cohete.classList.remove('animacion-rumble');
        cohete.classList.add('animacion-despegue');
        setTimeout(() => {
            document.getElementById('menu-section').scrollIntoView({ behavior: 'smooth' });
        }, 400);
    }, 500);
}

function subirAlInicio() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', () => {
    const btnSubir = document.getElementById('btn-subir');
    if (window.scrollY > 500) {
        btnSubir.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
    } else {
        btnSubir.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
    }
});

function irAlRadarDesdeModal() {
    const codigoGenerado = document.getElementById('codigo-pedido-modal').innerText;
    cerrarModal();
    
    const inputRastreo = document.getElementById('codigo-rastreo');
    inputRastreo.value = codigoGenerado;
    
    const seccionRadar = inputRastreo.closest('section');
    seccionRadar.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
        verificarRastreo();
    }, 800);
}

async function rastrearPedido() {
    let input = document.getElementById('codigo-rastreo').value.trim().toUpperCase();
    
    if (!input) return mostrarAlerta("Ingresa un código para escanear.");

    if (!input.startsWith('ASTRO-')) {
        if (!isNaN(input)) {
            input = `ASTRO-${input}`;
        } else {
            return mostrarAlerta("¡Capitán! Ingresa solo el número o el código completo (Ej. ASTRO-12)");
        }
    }

    const id = input.split('-')[1]; 
    
    const boton = document.querySelector('button[onclick="verificarRastreo()"]');
    if(boton) boton.innerText = "ESCANEANDO... 📡";
    
    try {
        const res = await fetch(`${API_URL}/pedidos/${id}/estado`);
        
        if (!res.ok) throw new Error("No encontrado");
        
        const data = await res.json();
        
        actualizarRadarUI(data.estado);
        
        const btnSoporte = document.getElementById('btn-soporte-radar');
        if (btnSoporte) {
            const msjAyuda = `Hola base espacial 🛸. Estoy rastreando mi misión ASTRO-${id} y necesito contactarme con ustedes.`;
            btnSoporte.href = `https://wa.me/584147363029?text=${encodeURIComponent(msjAyuda)}`;
        }
        
        document.getElementById('panel-telemetria').classList.remove('hidden');
    } catch (e) {
        mostrarAlerta("Coordenadas no encontradas. Verifica tu código de misión.");
        const panel = document.getElementById('panel-telemetria');
        if(panel) panel.classList.add('hidden');
    } finally {
        if(boton) boton.innerText = "ESCANEAR";
    }
}

function actualizarRadarUI(estado) {
    for(let i=1; i<=4; i++) {
        const paso = document.getElementById(`paso-${i}`);
        if(!paso) continue;
        paso.classList.add('opacity-50');
        const icono = paso.querySelector('div');
        icono.classList.remove('bg-yellow-400', 'text-black', 'border-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]');
    }

    const linea = document.getElementById('linea-progreso');
    const lineaMobile = document.getElementById('linea-progreso-mobile');
    let nivel = 1;

    if (estado === 'pendiente') nivel = 1;
    if (estado === 'cocinando') nivel = 2;
    if (estado === 'listo') nivel = 3;
    if (estado === 'finalizado') nivel = 4;

    const porcentajes = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
    
    if(linea) linea.style.width = porcentajes[nivel];
    if(lineaMobile) lineaMobile.style.height = porcentajes[nivel];

    for(let i=1; i<=nivel; i++) {
        const paso = document.getElementById(`paso-${i}`);
        if(!paso) continue;
        paso.classList.remove('opacity-50'); 
        const icono = paso.querySelector('div');
        icono.classList.add('bg-yellow-400', 'text-black', 'border-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]');
    }
}

const API_ESTADO_URL = `${API_URL}/api/estado`;
const alertaCerrado = document.getElementById('alerta-carrito-cerrado');
const btnConfirmar = document.getElementById('btn-confirmar-pedido');

const socket = io(API_URL);

function manejarEstadoTienda(abierto) {
    if (abierto) {
        alertaCerrado.classList.add('hidden');
        btnConfirmar.classList.remove('opacity-50', 'cursor-not-allowed');
        btnConfirmar.disabled = false;
        console.log("🟢 La tienda está abierta, el cliente puede pedir.");
    } else {
        alertaCerrado.classList.remove('hidden');
        btnConfirmar.classList.add('opacity-50', 'cursor-not-allowed');
        btnConfirmar.disabled = true;
        console.log("🔴 La tienda está cerrada, bloqueando checkout.");
    }
}

async function verificarEstadoInicial() {
    try {
        const respuesta = await fetch(API_ESTADO_URL);
        const data = await respuesta.json();
        manejarEstadoTienda(data.abierto);
    } catch (error) {
        console.error("Error al consultar el estado de la tienda:", error);
    }
}

verificarEstadoInicial();

socket.on('cambio_estado_tienda', (data) => {
    manejarEstadoTienda(data.abierto);
});