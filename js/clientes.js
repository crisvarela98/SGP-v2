document.addEventListener('DOMContentLoaded', function () {
    const clienteContainer = document.getElementById('clienteContainer');
    const zonaSeleccionada = localStorage.getItem('zonaSeleccionada');
    
    if (!zonaSeleccionada) {
        alert('Por favor, selecciona una zona primero.');
        window.location.href = 'zona.html';
        return;
    }

    fetch('/json/clientes.json')
        .then(response => response.json())
        .then(clientes => {
            const clientesFiltrados = clientes.filter(cliente => cliente.Zona === zonaSeleccionada);
            if (clientesFiltrados.length === 0) {
                clienteContainer.innerHTML = '<p>No hay clientes registrados en esta zona.</p>';
                return;
            }
            
            const zonaTitulo = document.createElement('h2');
            zonaTitulo.textContent = `Clientes en la Zona:  ${clientesFiltrados[0].NomZon}`; 
            clienteContainer.appendChild(zonaTitulo);

            clientesFiltrados.forEach(cliente => {
                const button = document.createElement('button');
                button.textContent = `${cliente.Cod} - ${cliente.RazonSocial} - ${cliente.Direccion}`;
                button.classList.add('cliente-button');
                button.onclick = function () {
                    localStorage.setItem('clienteSeleccionado', JSON.stringify(cliente));
                    window.location.href = 'marcas.html';
                };
                clienteContainer.appendChild(button);
        });
    })
        .catch(error => console.error('Error al cargar los clientes:', error));
})
