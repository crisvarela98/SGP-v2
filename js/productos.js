let carrito = JSON.parse(localStorage.getItem('carrito')) || [];  // Cargar el carrito desde localStorage

if (!Array.isArray(carrito)) {
    carrito = [];  // Si `carrito` no es un array, se inicializa como uno vacío
}

document.addEventListener('DOMContentLoaded', () => {
    const productosContainer = document.getElementById('productosContainer');
    const marcaSeleccionada = localStorage.getItem('marcaSeleccionada');
    const familiaSeleccionada = localStorage.getItem('familiaSeleccionada');

    actualizarArtAgregados(); // Actualizar el contador de artículos al cargar la página

    // Asegúrate de que la marca y la familia estén seleccionadas
    if (!marcaSeleccionada || !familiaSeleccionada) {
        alert('Por favor, selecciona primero una marca y una familia.');
        window.location.href = 'marcas.html'; // Redirige a la selección de marca si no está definida
        return;
    }

    // Cargar los productos desde el JSON y filtrar por marca y familia seleccionada
    fetch('/json/productos.json')
        .then(response => response.json())
        .then(data => {
            // Filtrar los productos por la marca y familia seleccionada
            const productosFiltrados = data.filter(producto => 
                producto.Codigo.slice(0,2) === marcaSeleccionada && producto.Familia1 === familiaSeleccionada
            )
            // Ordenar por Familia2 de menor a mayor
            .sort((a, b) => a.Familia2 - b.Familia2);

            if (productosFiltrados.length > 0) {
                mostrarProductos(productosContainer, productosFiltrados);
            } else {
                mostrarMensajeError(productosContainer, 'No se encontraron productos para la marca y familia seleccionada.');
            }
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
            mostrarMensajeError(productosContainer, 'Hubo un error al cargar los productos.');
        });
});

function mostrarMensajeError(container, mensaje) {
    container.innerHTML = `<p>${mensaje}</p>`;
}

function mostrarProductos(container, productos) {
    container.innerHTML = ''; // Limpiar el contenedor antes de añadir productos

    productos.forEach(producto => { 
        const num = producto.Oferta;
        
        let precio;
        let Oferta;

        if (num.includes('+')) {
            const [compra, regalo] = num.split('+').map(Number);
            Oferta = `Llevas ${compra} y tenés ${regalo} gratis`;
            precio = parseFloat(producto.PrecioLista) || 0;
        } else {
            precio = ((parseFloat(producto.PrecioLista) || 0) * (1 - (parseFloat(num) || 0) / 100)).toFixed(2);
            Oferta = `Tiene un descuento del ${num}%`;
        }

        const productoHTML = `
            <div class="producto-item">
                <img class="imagen" src="/assets/Articulos/${producto.Codigo.substring(0, 2)}/${producto.Codigo}.jpg" alt="${producto.Descripcion}">

                <div class="product-info">
                    <h1>${producto.Descripcion}</h1>
                    <p class="price">Nuevo precio:</p>
                    <p class="price">$${precio}</p>
                </div>
                <label>${Oferta}</label>
                <p>Unibulto: ${producto.UniBulto}</p>

                <div class="unidades">
                    <label for="unidades-${producto.Codigo}">Unidades:</label>
                    <button type="button" onclick="ajustarUnidades('${producto.Codigo}', -1)">-</button>
                    <input type="number" id="unidades-${producto.Codigo}" name="unidades" min="0" value="0">
                    <button type="button" onclick="ajustarUnidades('${producto.Codigo}', 1)">+</button>
                </div>
                
                <button onclick="agregarBulto('${producto.Codigo}', ${producto.UniBulto})">Agregar Bulto (${producto.UniBulto} Unidades)</button>
                <button onclick="agregarAlPedido('${producto.Codigo}', ${precio}, '${num}')">Agregar a Pedido</button>
            </div>
        `;
        container.innerHTML += productoHTML;
    });

    // Agregar el popup a las imgenes
    $(document).ready(function(){
        $(".imagen").click(function(){
            var path = $(this).attr('src');
            const modalHTML = `
                <div id="imageModal" class="modal">
                    <img class="modal-content" src="${path}" alt="Imagen Ampliada">
                </div>
            `;
            $("body").append(modalHTML);
            $("#imageModal").fadeIn();

            $(".modal-content").click(function(){
                $("#imageModal").fadeOut(function(){
                    $(this).remove(); // Elimina el modal cuando se cierra
                });
            });

            // Cerrar modal al hacer clic fuera de la imagen
            $("#imageModal").click(function(event){
                if(event.target.className === "modal"){
                    $("#imageModal").fadeOut(function(){
                        $(this).remove();
                    });
                }
            });
        });
    });
}

function ajustarUnidades(codigo, cantidad) {
    const unidadesInput = document.getElementById(`unidades-${codigo}`);
    const nuevasUnidades = Math.max(0, (parseInt(unidadesInput.value) || 0) + cantidad);
    unidadesInput.value = nuevasUnidades;
}

function agregarBulto(codigo, unibulto) {
    ajustarUnidades(codigo, unibulto);
}

function agregarAlPedido(codigo, precio, oferta) {
    const unidadesInput = document.getElementById(`unidades-${codigo}`);
    let unidades = parseInt(unidadesInput.value) || 0;

    if (unidades <= 0) {
        alert('Por favor, seleccione una cantidad de unidades válida.');
        return;
    }

    let unidadesBonificadas = 0;
    // Verificar si la oferta es del tipo "10+2"
    if (oferta.includes('+')) {
        const [compra, regalo] = oferta.split('+').map(Number);
        unidadesBonificadas = Math.floor(unidades / compra) * regalo;

        //alert(`Has agregado ${unidades} unidades y recibes ${unidadesBonificadas} unidades gratis.`);
    }

    // Verificar si ya existe el producto en el carrito
    let productoExistente = carrito.find(item => item.codigo === codigo && !item.bonificacion);
    if (productoExistente) {
        // Sumar las unidades al producto existente
        productoExistente.unidades += unidades;
        productoExistente.total += precio * unidades;
    } else {
        // Crear un nuevo producto en el carrito
        const productoSeleccionado = {
            codigo,
            descripcion: document.querySelector(`#unidades-${codigo}`).closest('.producto-item').querySelector('h1').textContent,
            unidades,  // Solo unidades pagadas
            precioUnitario: precio,
            total: precio * unidades,
            descuento: oferta,
            bonificacion: false
        };

        carrito.push(productoSeleccionado);
    }

    // Agregar línea para las unidades bonificadas
    if (unidadesBonificadas > 0) {
        let bonificacionExistente = carrito.find(item => item.codigo === codigo && item.bonificacion);
        if (bonificacionExistente) {
            // Sumar las unidades bonificadas al producto existente
            bonificacionExistente.unidades += unidadesBonificadas;
        } else {
            // Crear una nueva línea para la bonificación
            carrito.push({
                codigo,
                descripcion: `${productoExistente ? productoExistente.descripcion : 'Producto'} (Bonificación)`,
                unidades: unidadesBonificadas,
                precioUnitario: 0,  // Precio $0 para las unidades bonificadas
                total: 0,
                bonificacion: true
            });
        }
    }

    // Guardar el carrito en el localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    //alert(`Producto con código ${codigo} agregado al pedido.`);

    actualizarArtAgregados(); // Actualizar el contador de artículos al agregar un producto
}

// Actualizar el contador de artículos en el botón "Ver Pedido"
function actualizarArtAgregados() {
    const artAgregados = document.getElementById('artAgregados');
    artAgregados.textContent = `ART. Agregados: ${carrito.length}`;
}

// Función para redirigir a la página de ver pedido
function manejarAgregarAlCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.location.href = 'order_details.html';
}

// Definir verPedido como alias de manejarAgregarAlCarrito para evitar el error
function verPedido() {
    manejarAgregarAlCarrito();
}
