document.addEventListener('DOMContentLoaded', function () {
    // Limpia el localStorage del pedido anterior al cargar esta pantalla
    localStorage.removeItem('pedidoActual'); // Ajusta 'pedidoActual' según el nombre de tu clave
    
    const zonaContainer = document.getElementById('zonaContainer');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const nombreVendedor = usuario ? usuario.NomVend : null;
    console.log(nombreVendedor);

    fetch('/json/clientes.json')
        .then(response => response.json())
        .then(data => {
            const zonas = new Map();
            data.forEach(cliente => {
                if (cliente.Zona && cliente.NomZon) {
                    if (cliente.NomVend === nombreVendedor) {
                        if (!zonas.has(cliente.Zona)) {
                            zonas.set(cliente.Zona, cliente.NomZon);
                        }
                    }
                }
            });
            zonas.forEach((nomZon, zona) => {
                const button = document.createElement('button');
                button.textContent = `Zona ${zona} - ${nomZon}`;
                button.classList.add('zona-button');
                button.onclick = function () {
                    localStorage.setItem('zonaSeleccionada', zona);
                    window.location.href = 'clientes.html';
                };
                zonaContainer.appendChild(button);
            });
        })
        .catch(error => console.error('Error al cargar las zonas:', error));
});
