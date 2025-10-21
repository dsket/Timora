
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// funciones

/**
 * Agrega un producto al carrito 
 * @param {string} nombre - Nombre del producto.
 * @param {number} precio - Precio unitario del producto.
 */
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
    
   
    alert(`"${nombre}" se ha agregado al carrito.`);
}


function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

/**
 * Elimina un producto del carrito.
 * @param {string} nombre - Nombre del producto a eliminar.
 */
function eliminarProducto(nombre) {
    
    carrito = carrito.filter(producto => producto.nombre !== nombre);
    guardarCarrito();
    
    renderizarCarrito();
}


function vaciarCarrito() {
    carrito = [];
    guardarCarrito();
    renderizarCarrito();
    alert('El carrito ha sido vaciado.');
}




/**
 * Realiza los cálculos de los totales y descuentos.
 * Requisito: El sistema calculará automáticamente (b. i, ii, iii)
 * @returns {object} Un objeto con los totales calculados.
 */
function calcularTotales() {
   
    const PORCENTAJE_DESCUENTO = 0.10; // 10%
    
    
    const totalSinDescuento = carrito.reduce((acumulado, producto) => {
        return acumulado + (producto.precio * producto.cantidad);
    }, 0); 
    
    
    const descuentoAplicado = totalSinDescuento * PORCENTAJE_DESCUENTO;
    const totalFinal = totalSinDescuento - descuentoAplicado;
    
    return {
        totalSinDescuento: totalSinDescuento,
        descuentoAplicado: descuentoAplicado,
        totalFinal: totalFinal
    };
}

/**
 * Actualiza la cantidad de un producto.
 * @param {string} nombre - Nombre del producto.
 * @param {number} nuevaCantidad - La nueva cantidad.
 */
function actualizarCantidad(nombre, nuevaCantidad) {
    const cantidadNumerica = parseInt(nuevaCantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica < 1) {
        alert("La cantidad debe ser un número mayor a cero.");
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

function renderizarCarrito() {
    
    const tablaCuerpo = document.querySelector('#tabla-carrito tbody');
    if (!tablaCuerpo) return; 

    tablaCuerpo.innerHTML = ''; 


    carrito.forEach(producto => {
        const fila = document.createElement('tr');
        const subtotal = producto.precio * producto.cantidad;

        fila.innerHTML = `
            <td>${producto.nombre}</td>
            <td>$${producto.precio.toLocaleString('es-AR')}</td>
            <td>
                <input 
                    type="number" 
                    value="${producto.cantidad}" 
                    min="1" 
                    onchange="actualizarCantidad('${producto.nombre}', this.value)"
                >
            </td>
            <td>$${subtotal.toLocaleString('es-AR')}</td>
            <td>
                <button onclick="eliminarProducto('${producto.nombre}')">Eliminar</button>
            </td>
        `;
        tablaCuerpo.appendChild(fila);
    });

    
    const totales = calcularTotales();

    document.getElementById('total-sin-descuento').textContent = totales.totalSinDescuento.toLocaleString('es-AR');
    document.getElementById('descuento').textContent = totales.descuentoAplicado.toLocaleString('es-AR');
    document.getElementById('total-final').textContent = totales.totalFinal.toLocaleString('es-AR');
}


document.addEventListener('DOMContentLoaded', () => {
    
    if (document.body.classList.contains('carrito')) {
        renderizarCarrito();
        
      
        const botonVaciar = document.getElementById('vaciar-carrito');
        if (botonVaciar) {
            botonVaciar.addEventListener('click', vaciarCarrito);
        }
    }
    
   
}); 
  