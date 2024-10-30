document.addEventListener('DOMContentLoaded', async function() {
    const orderDetails = document.getElementById('order-details');
    const totalPriceElement = document.getElementById('total-price');
    const customerInfoContainer = document.getElementById('customer-info');
    const saveOrderLink = document.getElementById('save-order-link');
    const confirmOrderLink = document.getElementById('confirm-order-link');

    let cart = JSON.parse(localStorage.getItem('carrito')) || [];
    let selectedClient = JSON.parse(localStorage.getItem('clienteSeleccionado')) || {};
    let selectedZone = localStorage.getItem('zonaSeleccionada') || '';
    let orderId = parseInt(localStorage.getItem('lastOrderId')) || 1; // Obtener el último ID desde localStorage

    if (!selectedClient._id || !selectedClient.RazonSocial) {
        alert('Por favor, selecciona primero un cliente.');
        window.location.href = 'zona.html';
        return;
    }

    let vendedorCodigo = selectedClient.CodVend || '';
    let vendedorNombre = selectedClient.NomVend || '';

    displayCustomerInfo(selectedClient, selectedZone, vendedorNombre, vendedorCodigo);

    function displayCustomerInfo(client, zone, vendedorNombre, vendedorCodigo) {
        customerInfoContainer.innerHTML = `
            <p><strong>Cliente:</strong> ${client.RazonSocial} (${client.Cod})</p>
            <p><strong>Zona:</strong> ${zone}</p>
            <p><strong>Dirección:</strong> ${client.Direccion}</p>
            <p><strong>Teléfono:</strong> ${client.Telefono || 'N/A'}</p>
            <p><strong>Email:</strong> ${client.Email || 'N/A'}</p>
            <p><strong>Vendedor:</strong> ${vendedorNombre} (Código: ${vendedorCodigo})</p>
        `;
    }

    async function displayOrder() {
        orderDetails.innerHTML = '';
        let subTotal = 0;

        const table = document.createElement('table');
        table.classList.add('order-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Código</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Unidades Bonificadas</th>
            <th>Descuento (%)</th>
            <th>Precio sin IVA</th>
            <th>Total sin IVA</th>
            <th>Acciones</th>
        `;
        table.appendChild(headerRow);

        if (Array.isArray(cart)) {
            cart.forEach((item, index) => {
                let bonificacionTexto = "N/A";
                let unidadesBonificadas = 0;
                const nuevoPrecio = item.precioUnitario.toFixed(2);

                if (item.descuento && item.descuento.includes('+')) {
                    const [compra, regalo] = item.descuento.split('+').map(Number);
                    unidadesBonificadas = Math.floor(item.unidades / compra) * regalo;
                    bonificacionTexto = `${unidadesBonificadas}`;
                }

                const totalWithoutIVA = nuevoPrecio * item.unidades;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.codigo}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.unidades}</td>
                    <td>${bonificacionTexto}</td>
                    <td>${parseFloat(item.descuento) || 0}%</td>
                    <td>$${nuevoPrecio}</td>
                    <td>$${totalWithoutIVA.toFixed(2)}</td>
                    <td><button class="delete-item-button" data-index="${index}">Eliminar</button></td>
                `;
                table.appendChild(row);

                subTotal += totalWithoutIVA;
            });

            orderDetails.appendChild(table);

            const iva = subTotal * 0.21;
            const total = subTotal + iva;

            document.getElementById('subtotal').textContent = `$${subTotal.toFixed(2)}`;
            document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
            totalPriceElement.textContent = `$${total.toFixed(2)}`;

            document.querySelectorAll('.delete-item-button').forEach(button => {
                button.addEventListener('click', deleteCartItem);
            });
        } else {
            orderDetails.innerHTML = '<p>No hay productos en el carrito.</p>';
        }
    }

    function deleteCartItem(event) {
        const index = event.target.dataset.index;
        cart.splice(index, 1);
        localStorage.setItem('carrito', JSON.stringify(cart));
        displayOrder();
    }

    displayOrder();

    saveOrderLink.addEventListener('click', function() {
        saveOrder('guardado');
    });

    confirmOrderLink.addEventListener('click', function() {
        saveOrder('confirmado');
    });

    async function saveOrder(status) {
        const total = cart.reduce((acc, item) => acc + (item.precioUnitario * item.unidades), 0);
        const pedidoIdCompleto = `${vendedorCodigo}-${orderId.toString().padStart(8, '0')}`;

        const order = {
            id: pedidoIdCompleto,
            customer: {
                name: selectedClient.RazonSocial,
                storeName: selectedClient.Cod,
                address: selectedClient.Direccion,
                phone: selectedClient.Telefono,
                email: selectedClient.Email
            },
            zone: selectedZone,
            date: new Date().toLocaleString(),
            status: status,
            cart: cart,
            total: total,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0
        };

        let orders = JSON.parse(localStorage.getItem('pedidos'));
        if (!Array.isArray(orders)) { 
            orders = []; 
        }

        orders.push(order); 
        localStorage.setItem('pedidos', JSON.stringify(orders));
        localStorage.setItem('lastOrderId', orderId + 1); // Actualizar el ID en localStorage
        orderId++; // Incrementar el ID para el próximo pedido
        localStorage.removeItem('carrito'); 

        await uploadOrdersToServer();
    }

    async function uploadOrdersToServer() {
        const orders = JSON.parse(localStorage.getItem('pedidos')) || [];

        try {
            const response = await fetch('/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: 'pedidos', data: orders })
            });

            if (!response.ok) {
                throw new Error('No se pudo cargar los pedidos en el servidor.');
            }
        } catch (error) {
            console.error('Error al subir los pedidos:', error);
        }
    }
});
