document.addEventListener('DOMContentLoaded', function () {
    const filterStatus = document.getElementById('filter-status');
    const orderList = document.getElementById('order-list');

    // Cargar pedidos inicialmente
    loadOrders();

    // Filtro de estado
    filterStatus.addEventListener('change', () => loadOrders(filterStatus.value));

    async function loadOrders(statusFilter = 'todos') {
        try {
            // Cargar pedidos desde ambos archivos JSON
            const [dataPedidosResponse, jsonPedidosResponse] = await Promise.all([
                fetch('/data/pedidos.json'),
                fetch('/json/pedidos.json')
            ]);

            let dataPedidos = [];
            let jsonPedidos = [];

            // Verificar que la respuesta sea correcta y que pueda convertirse en JSON
            if (dataPedidosResponse.ok) {
                const dataText = await dataPedidosResponse.text();
                if (dataText.trim() !== "") {
                    dataPedidos = JSON.parse(dataText);
                }
            }

            if (jsonPedidosResponse.ok) {
                const jsonText = await jsonPedidosResponse.text();
                if (jsonText.trim() !== "") {
                    jsonPedidos = JSON.parse(jsonText);
                }
            }

            // Combinar los pedidos de ambos archivos
            const allOrders = [...dataPedidos, ...jsonPedidos];

            displayOrders(allOrders, statusFilter);
        } catch (error) {
            console.error('Error al cargar los pedidos:', error);
        }
    }

    function displayOrders(orders, statusFilter) {
        orderList.innerHTML = '';

        const filteredOrders = orders.filter(order => statusFilter === 'todos' || order.status === statusFilter);

        if (filteredOrders.length === 0) {
            orderList.innerHTML = '<p>No hay pedidos para mostrar.</p>';
            return;
        }

        filteredOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <div class="order-info">
                    <p><strong>ID del Pedido:</strong> ${order.id}</p>
                    <p><strong>Cliente:</strong> ${order.customer.name}</p>
                    <p><strong>Fecha:</strong> ${order.date}</p>
                    <p><strong>Estado:</strong> ${order.status}</p>
                </div>
                <div class="order-actions">
                    <button onclick="viewOrderDetails('${order.id}')" class="view-button">Ver Detalles</button>
                    <button onclick="cancelOrder('${order.id}')" ${order.status === 'cancelado' ? 'disabled' : ''} class="cancel-button">Cancelar</button>
                </div>
            `;
            orderList.appendChild(orderElement);
        });
    }

    window.viewOrderDetails = async function(orderId) {
        try {
            // Cargar los pedidos de ambos archivos
            const [dataPedidosResponse, jsonPedidosResponse] = await Promise.all([
                fetch('/data/pedidos.json'),
                fetch('/json/pedidos.json')
            ]);

            let dataPedidos = [];
            let jsonPedidos = [];

            if (dataPedidosResponse.ok) {
                const dataText = await dataPedidosResponse.text();
                if (dataText.trim() !== "") {
                    dataPedidos = JSON.parse(dataText);
                }
            }

            if (jsonPedidosResponse.ok) {
                const jsonText = await jsonPedidosResponse.text();
                if (jsonText.trim() !== "") {
                    jsonPedidos = JSON.parse(jsonText);
                }
            }

            // Buscar el pedido por ID
            const allOrders = [...dataPedidos, ...jsonPedidos];
            const order = allOrders.find(o => o.id === orderId);

            if (order) {
                const modal = document.getElementById('order-modal');
                const modalContent = document.getElementById('modal-order-details');
                modalContent.innerHTML = `
                    <h2>Detalles del Pedido</h2>
                    <p><strong>ID del Pedido:</strong> ${order.id}</p>
                    <p><strong>Cliente:</strong> ${order.customer.RazonSocial || order.customer.name}</p>
                    <p><strong>Fecha:</strong> ${order.date}</p>
                    <p><strong>Estado:</strong> ${order.status}</p>
                    <ul>
                        ${order.cart.map(item => `<li>${item.descripcion} - ${item.unidades} unidades a $${item.precioUnitario.toFixed(2)} cada una.</li>`).join('')}
                    </ul>
                `;
                modal.style.display = 'flex';
                // Guardar los datos del pedido en el dataset para el botón PDF
                modal.dataset.currentOrder = JSON.stringify(order);
            }
        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
        }
    };

    window.cancelOrder = async function(orderId) {
        const confirmation = confirm('¿Estás seguro de que deseas cancelar este pedido?');
        if (confirmation) {
            try {
                // Cargar los pedidos de ambos archivos
                const [dataPedidosResponse, jsonPedidosResponse] = await Promise.all([
                    fetch('/data/pedidos.json'),
                    fetch('/json/pedidos.json')
                ]);

                let dataPedidos = [];
                let jsonPedidos = [];

                if (dataPedidosResponse.ok) {
                    const dataText = await dataPedidosResponse.text();
                    if (dataText.trim() !== "") {
                        dataPedidos = JSON.parse(dataText);
                    }
                }

                if (jsonPedidosResponse.ok) {
                    const jsonText = await jsonPedidosResponse.text();
                    if (jsonText.trim() !== "") {
                        jsonPedidos = JSON.parse(jsonText);
                    }
                }

                // Combinar los pedidos y encontrar el correspondiente al pedidoId
                const allOrders = [...dataPedidos, ...jsonPedidos];
                const orderIndex = allOrders.findIndex(o => o.id === orderId);

                if (orderIndex > -1) {
                    allOrders[orderIndex].status = 'cancelado';

                    // Guardar los pedidos modificados
                    await savePedidos(allOrders.filter(order => order.id.startsWith('data/')));

                    displayOrders(allOrders, filterStatus.value);
                    alert('Pedido cancelado exitosamente');
                }
            } catch (error) {
                console.error('Error al cancelar el pedido:', error);
            }
        }
    };

    async function savePedidos(orders) {
        try {
            // Filtrar pedidos que solo provienen de "/data/pedidos.json" para guardar los cambios ahí
            const filteredOrders = orders.filter(order => order.id.startsWith('data/'));
            // Guardar los pedidos en /data/pedidos.json
            await fetch('/data/pedidos.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filteredOrders)
            });
        } catch (error) {
            console.error('Error al guardar los pedidos:', error);
        }
    }

    document.querySelector('.close-button').addEventListener('click', function () {
        const modal = document.getElementById('order-modal');
        modal.style.display = 'none';
    });

    document.getElementById('download-pdf').addEventListener('click', function() {
        const modal = document.getElementById('order-modal');
        const order = JSON.parse(modal.dataset.currentOrder);
        if (typeof window.downloadOrderPDF === 'function' && order) {
            window.downloadOrderPDF(order);
        } else {
            console.error('La función downloadOrderPDF no está definida en send_order1.js');
            alert('Error: La función para generar el PDF no está disponible.');
        }
    });
});
