// Cargar carrito desde el almacenamiento local
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];


// Colores 
const ESTILO_TIMORA = {
    confirmButtonColor: '#8d9e3e', 
    background: '#F3F5C4',         
    color: '#333333',              
    iconColor: '#8d9e3e'           
};

// 1. FUNCIONES

function agregarAlCarrito(nombre, precio) {
    const productoExistente = carrito.find(producto => producto.nombre === nombre);

    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    guardarCarrito();

    // ALERTA PERSONALIZADA
    Swal.fire({
        ...ESTILO_TIMORA,
        title: '¡Excelente elección!',
        text: `Has agregado "${nombre}" al carrito.`,
        icon: 'success',
        confirmButtonText: 'Seguir comprando',
        showCancelButton: true,
        cancelButtonText: 'Ir al Carrito',
        cancelButtonColor: '#555'
    }).then((result) => {
        // "Ir al Carrito"
        if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = 'carrito.html';
        }
    });
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function eliminarProducto(nombre) {
    // ALERTA DE CONFIRMACIÓN
    carrito = carrito.filter(producto => producto.nombre !== nombre);
    guardarCarrito();
    renderizarCarrito();
    
    // Notificación en la esquina 
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#f9f9eb',
        color: '#333'
    });
    
    Toast.fire({
        icon: 'warning',
        iconColor: 'orange',
        title: `Eliminaste "${nombre}"`
    });
}

function vaciarCarrito() {
    // PREGUNTA ANTES DE VACIAR
    Swal.fire({
        ...ESTILO_TIMORA,
        title: '¿Estás seguro?',
        text: "Se eliminarán todos los productos de tu carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            guardarCarrito();
            renderizarCarrito();
            
            Swal.fire({
                ...ESTILO_TIMORA,
                title: '¡Carrito vacío!',
                text: 'Has eliminado todos los productos.',
                icon: 'success'
            });
        }
    });
}

function actualizarCantidad(nombre, nuevaCantidad) {
    const cantidadNumerica = parseInt(nuevaCantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica < 1) {
        // ALERTA DE ERROR
        Swal.fire({
            ...ESTILO_TIMORA,
            title: 'Ups...',
            text: "La cantidad mínima debe ser 1 unidad.",
            icon: 'error'
        });
        renderizarCarrito(); 
        return;
    }

    const producto = carrito.find(p => p.nombre === nombre);
    if (producto) {
        producto.cantidad = cantidadNumerica;
        guardarCarrito();
        renderizarCarrito();
    }
}

// 2PROMOCIONES

function esRelojMujer(nombre) {
    const nombreLower = nombre.toLowerCase();
    return nombreLower.includes('mujer') || nombreLower.includes('dama') || nombreLower.includes('femenino');
}

function calcularTotales() {
    let totalSinDescuento = 0;
    
    carrito.forEach(prod => {
        totalSinDescuento += prod.precio * prod.cantidad;
    });

    // A. Promo Mujeres (20% OFF)
    let descuentoMujeres = 0;
    carrito.forEach(prod => {
        if (esRelojMujer(prod.nombre)) {
            descuentoMujeres += (prod.precio * prod.cantidad) * 0.20;
        }
    });

    // B. Promo 2da Unidad (50% OFF)
    let preciosUnitarios = [];
    carrito.forEach(prod => {
        for (let i = 0; i < prod.cantidad; i++) {
            preciosUnitarios.push(prod.precio);
        }
    });

    preciosUnitarios.sort((a, b) => b - a);

    let descuentoSegundaUnidad = 0;
    for (let i = 0; i < preciosUnitarios.length; i++) {
        if (i % 2 !== 0) { 
            descuentoSegundaUnidad += preciosUnitarios[i] * 0.50;
        }
    }

    const descuentoAplicado = Math.max(descuentoMujeres, descuentoSegundaUnidad);
    const totalFinal = totalSinDescuento - descuentoAplicado;
    const esEnvioGratis = totalFinal > 120000;

    return {
        totalSinDescuento,
        descuentoAplicado,
        totalFinal,
        esEnvioGratis
    };
}

// 3 RENDERIZADO

function renderizarCarrito() {
    const tablaCuerpo = document.querySelector('#tabla-carrito tbody');
    if (!tablaCuerpo) return; 

    tablaCuerpo.innerHTML = ''; 

    carrito.forEach(producto => {
        const fila = document.createElement('tr');
        const subtotal = producto.precio * producto.cantidad;
        
        const textoExtra = esRelojMujer(producto.nombre) ? ' <span style="color:#d63384; font-size:0.8rem;">(Promo Mujer)</span>' : '';

        fila.innerHTML = `
            <td>${producto.nombre}${textoExtra}</td>
            <td>$${producto.precio.toLocaleString('es-AR')}</td>
            <td>
                <input 
                    type="number" 
                    value="${producto.cantidad}" 
                    min="1" 
                    onchange="actualizarCantidad('${producto.nombre}', this.value)"
                    style="width: 50px; text-align: center;"
                >
            </td>
            <td>$${subtotal.toLocaleString('es-AR')}</td>
            <td>
                <button onclick="eliminarProducto('${producto.nombre}')" style="color: red; cursor: pointer; border:none; background:none; font-weight:bold;">X</button>
            </td>
        `;
        tablaCuerpo.appendChild(fila);
    });

    const totales = calcularTotales();

    const elSubtotal = document.getElementById('total-sin-descuento');
    const elDescuento = document.getElementById('descuento');
    const elTotal = document.getElementById('total-final');
    const elEnvio = document.getElementById('mensaje-envio');

    if(elSubtotal) elSubtotal.textContent = totales.totalSinDescuento.toLocaleString('es-AR');
    if(elDescuento) elDescuento.textContent = totales.descuentoAplicado.toLocaleString('es-AR');
    if(elTotal) elTotal.textContent = totales.totalFinal.toLocaleString('es-AR');
    
    if(elEnvio) {
        if(totales.esEnvioGratis) {
            elEnvio.textContent = "¡GRATIS!";
            elEnvio.style.color = "green";
            elEnvio.style.fontWeight = "bold";
        } else {
            elEnvio.textContent = "$5.000 (Falta poco para envío gratis)";
            elEnvio.style.color = "black";
            elEnvio.style.fontWeight = "normal";
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
    
    const botonVaciar = document.getElementById('vaciar-carrito');
    if (botonVaciar) {
        botonVaciar.addEventListener('click', vaciarCarrito);
    }
});