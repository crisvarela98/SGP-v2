document.addEventListener('DOMContentLoaded', function() {
    displayClients();

    const newClientModal = document.getElementById('new-client-modal');
    const newClientButton = document.querySelector('.new-client-button');
    const closeModalButton = document.querySelector('.close-button');

    newClientButton.addEventListener('click', function() {
        newClientModal.style.display = "block";
    });

    closeModalButton.addEventListener('click', function() {
        newClientModal.style.display = "none";
    });

    document.getElementById('new-client-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const clientData = {
            name: document.getElementById('client-name').value,
            storeName: document.getElementById('store-name').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            locality: document.getElementById('locality').value,
            zone: document.getElementById('zone').value
        };

        fetch('/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'clientes', data: clientData })
        })
        .then(response => response.json())
        .then(() => {
            displayClients();
            alert("Cliente agregado con éxito");
            document.getElementById('new-client-form').reset();
            newClientModal.style.display = "none";
        })
        .catch(error => console.error('Error al guardar cliente:', error));
    });

    function displayClients(filterText = '') {
        const nombreVendedor = JSON.parse(localStorage.getItem('usuario')).NomVend; // Obtener el nombre del vendedor

        fetch('/json/clientes.json')
            .then(response => response.json())
            .then(clients => {
                const clientList = document.getElementById('client-list');
                clientList.innerHTML = '';
                
                // Filtrar clientes por el vendedor
                const filteredClients = clients.filter(client => client.NomVend === nombreVendedor);

                filteredClients.forEach(client => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="client-item">
                            <h3>${client.RazonSocial} - ${client.CUIT}</h3>
                            <h4>${client.Direccion}, Zona: ${client.NomZon}, Vendedor: ${client.NomVend}</h4>
                            <div class="client-actions">
                                <button class="history-button">Ver Historial</button>
                            </div>
                        </div>
                    `;

                    listItem.querySelector('.history-button').onclick = () => showOrderHistory(client._id);
                    clientList.appendChild(listItem);
                });

                if (filteredClients.length === 0) {
                    clientList.innerHTML = '<p>No hay clientes registrados para este vendedor.</p>';
                }
            })
            .catch(error => console.error('Error al cargar los clientes:', error));
    }

    function showOrderHistory(clientId) {
        const historyModal = document.getElementById('history-modal');
        historyModal.style.display = "block";

        fetch('/json/pedidos.json')
            .then(response => response.json())
            .then(orders => {
                const orderHistoryList = document.getElementById('order-history-list');
                orderHistoryList.innerHTML = '';
                const filteredOrders = orders.filter(order => order.customer._id === clientId);
                filteredOrders.forEach(order => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Pedido Nro:</strong> ${order.id}<br>
                        <strong>Fecha:</strong> ${order.date}<br>
                        <strong>Monto Total:</strong> $${order.total.toFixed(2)}<br>
                        <strong>Estado:</strong> ${order.status}
                    `;
                    orderHistoryList.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error al obtener el historial de pedidos:', error));
    }

    document.querySelector('.close-history-button').addEventListener('click', function() {
        const historyModal = document.getElementById('history-modal');
        historyModal.style.display = "none";
    });

    document.getElementById('search-input').addEventListener('input', function() {
        displayClients(this.value);
    });
});
