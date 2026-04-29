let carrito = [];
let menuDataCache = [];
const API_URL = "http://localhost:3000";

const urlParams = new URLSearchParams(window.location.search);
const numeroMesa = urlParams.get('mesa');

document.addEventListener('DOMContentLoaded', () => {
    if (numeroMesa) {
        const contenedorMesa = document.getElementById('contenedor-mesa');
        const tagMesa = document.getElementById('mesa-tag-visual');
        tagMesa.innerText = numeroMesa;
        contenedorMesa.classList.remove('hidden');
        contenedorMesa.classList.add('flex');
    }
    cargarMenu();
});

async function cargarMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        menuDataCache = await response.json();
        renderPizzas(menuDataCache);
    } catch (error) {
        console.error("Error conectando con Node.js:", error);
    }
}

// 1. REEMPLAZA renderPizzas (Diseño móvil mejorado y precios reales)
function renderPizzas(pizzas) {
    const contenedor = document.getElementById('pizza-container');
    contenedor.innerHTML = ''; 
    
    pizzas.forEach(pizza => {
        // Leemos los 3 precios de la base de datos
        const pMediana = parseFloat(pizza.precio).toFixed(2);
        const pGrande = parseFloat(pizza.precio_g).toFixed(2);
        const pFamiliar = parseFloat(pizza.precio_f).toFixed(2);

        const tarjeta = `
            <div class="group bg-[#0d1526] text-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800 hover:border-yellow-400/50 transition-all duration-300">
                <div class="relative h-48 overflow-hidden">
                    <img src="${pizza.imagen_url || 'https://via.placeholder.com/400x300'}" class="w-full h-full object-cover">
                </div>
                <div class="p-6">
                    <h2 class="text-xl font-black italic uppercase mb-1 text-yellow-400">${pizza.nombre}</h2>
                    <p class="text-gray-400 text-xs mb-4 h-10 overflow-hidden leading-tight">${pizza.descripcion || ''}</p>
                    
                    <div class="grid grid-cols-3 gap-2 mt-auto">
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pMediana}, 'Mediana')" 
                                class="flex flex-col items-center justify-center bg-white/5 hover:bg-yellow-400 hover:text-black py-3 rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-xs font-bold mb-1 text-gray-300 group-hover/btn:text-black">Mediana</span>
                            <span class="text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pMediana}</span>
                        </button>
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pGrande}, 'Grande')" 
                                class="flex flex-col items-center justify-center bg-white/5 hover:bg-yellow-400 hover:text-black py-3 rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-xs font-bold mb-1 text-gray-300 group-hover/btn:text-black">Grande</span>
                            <span class="text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pGrande}</span>
                        </button>
                        <button onclick="agregarAlCarrito(${pizza.id}, '${pizza.nombre}', ${pFamiliar}, 'Familiar')" 
                                class="flex flex-col items-center justify-center bg-white/5 hover:bg-yellow-400 hover:text-black py-3 rounded-xl border border-white/10 hover:border-transparent transition-all active:scale-95 group/btn">
                            <span class="text-xs font-bold mb-1 text-gray-300 group-hover/btn:text-black">Familiar</span>
                            <span class="text-[11px] font-black text-green-400 group-hover/btn:text-black">$${pFamiliar}</span>
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
    if (carrito.length === 0) return alert("El carrito está vacío.");
    if (!numeroMesa) return alert("Por favor, escanea el código QR de tu mesa antes de pedir.");

    const pedidoData = {
        mesa: numeroMesa,
        carrito: carrito.map(item => ({ 
            producto_id: item.producto_id, 
            cantidad: item.cantidad, // <-- Ahora sí manda la cantidad real
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
            document.getElementById('codigo-pedido-modal').innerText = `ASTRO-${data.pedidoId}`;
            document.getElementById('modal-confirmacion').classList.remove('hidden');
            carrito = [];
            actualizarCarritoVisual();
            toggleCart();
        }
    } catch (e) {
        alert("Error al enviar el pedido a la base.");
    }
}
// 2. REEMPLAZA agregarAlCarrito (Lógica para acumular en vez de repetir)
function agregarAlCarrito(id, nombre, precio, talla) {
    const nombreCompleto = `${nombre} (${talla})`;
    // Buscamos si ya existe exactamente esa pizza con ese tamaño
    const index = carrito.findIndex(item => item.producto_id === id && item.talla === talla);
    
    if (index !== -1) {
        carrito[index].cantidad += 1; // Solo aumentamos la cantidad
    } else {
        carrito.push({ 
            producto_id: id, 
            nombre: nombreCompleto, 
            precio: parseFloat(precio),
            talla: talla,
            cantidad: 1 // Propiedad nueva
        });
    }
    actualizarCarritoVisual();
    if (document.getElementById('cart-sidebar').classList.contains('translate-x-full')) toggleCart();
}

// 3. REEMPLAZA actualizarCarritoVisual (Para mostrar las cantidades)
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
            <div class="flex justify-between items-center bg-gray-900/80 p-4 rounded-2xl border border-gray-800 mb-3">
                <div class="flex-grow pr-2">
                    <p class="font-black text-sm italic text-white leading-tight mb-1">
                        <span class="text-yellow-400 mr-1">${item.cantidad}x</span>${item.nombre}
                    </p>
                    <p class="text-green-400 font-bold text-xs">$${subtotal.toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-1 bg-black/50 rounded-lg p-1">
                    <button onclick="cambiarCantidad(${index}, -1)" class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-md font-bold hover:bg-red-500 transition-colors">-</button>
                    <button onclick="cambiarCantidad(${index}, 1)" class="w-8 h-8 flex items-center justify-center bg-gray-800 text-white rounded-md font-bold hover:bg-green-500 transition-colors">+</button>
                </div>
            </div>`;
    });
    contador.innerText = totalPizzas;
    totalElemento.innerText = `$${sumaTotal.toFixed(2)}`;
}

// 4. NUEVA FUNCIÓN: Eliminar función vieja y poner esta
function cambiarCantidad(index, delta) {
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) {
        carrito.splice(index, 1); // Si llega a 0, la borramos del carrito
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
    cerrarModal();
    document.getElementById('codigo-rastreo').scrollIntoView({ behavior: 'smooth' });
}

// --- FUNCIONES DEL RADAR EN TIEMPO REAL ---
async function rastrearPedido() {
    let input = document.getElementById('codigo-rastreo').value.trim().toUpperCase();
    
    if (!input) return alert("Ingresa un código para escanear.");

    if (!input.startsWith('ASTRO-')) {
        if (!isNaN(input)) {
            input = `ASTRO-${input}`;
        } else {
            return alert("¡Capitán! Ingresa solo el número de tu pedido o el código completo (Ej. ASTRO-12)");
        }
    }

    const id = input.split('-')[1]; 
    
    const boton = document.querySelector('button[onclick="rastrearPedido()"]');
    if(boton) boton.innerText = "ESCANEANDO... 📡";
    
    try {
        const res = await fetch(`${API_URL}/pedidos/${id}/estado`);
        
        if (!res.ok) throw new Error("No encontrado");
        
        const data = await res.json();
        
        actualizarRadarUI(data.estado);
        
        document.getElementById('panel-telemetria').classList.remove('hidden');
    } catch (e) {
        alert("Coordenadas no encontradas. Verifica tu código de misión.");
        const panel = document.getElementById('panel-telemetria');
        if(panel) panel.classList.add('hidden');
    } finally {
        if(boton) boton.innerText = "ESCANEAR SECTOR";
    }
}

// ¡ESTA ERA LA FUNCIÓN QUE FALTABA PARA ENCENDER LAS LUCES!
function actualizarRadarUI(estado) {
    // 1. Apagamos todas las luces primero
    for(let i=1; i<=4; i++) {
        const paso = document.getElementById(`paso-${i}`);
        if(!paso) continue;
        paso.classList.add('opacity-50');
        const icono = paso.querySelector('div');
        icono.classList.remove('bg-yellow-400', 'text-black', 'border-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]');
    }

    const linea = document.getElementById('linea-progreso');
    let nivel = 1;

    // 2. Revisamos en qué estado está el pedido en la base de datos
    if (estado === 'pendiente') nivel = 1;
    if (estado === 'cocinando') nivel = 2;
    if (estado === 'listo') nivel = 3;
    if (estado === 'finalizado') nivel = 4;

    // 3. Movemos la barra verde del fondo
    if(linea) {
        const porcentajes = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
        linea.style.width = porcentajes[nivel];
    }

    // 4. Encendemos las luces hasta el nivel actual
    for(let i=1; i<=nivel; i++) {
        const paso = document.getElementById(`paso-${i}`);
        if(!paso) continue;
        paso.classList.remove('opacity-50'); 
        const icono = paso.querySelector('div');
        icono.classList.add('bg-yellow-400', 'text-black', 'border-yellow-400', 'shadow-[0_0_15px_rgba(250,204,21,0.5)]');
    }
}