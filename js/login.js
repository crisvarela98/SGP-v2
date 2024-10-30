document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('../json/usuarios.json')  // Usando ruta absoluta
    .then(response => {
        if (!response.ok) {
            throw new Error("Error al cargar usuarios.json");
        }
        return response.json();
    })
    .then(usuarios => {
        const usuarioValido = usuarios.find(usuario => usuario.Usuario === username && usuario.Contraseña.toString() === password);

        if (usuarioValido) {
            alert('Bienvenido ' + usuarioValido.NomVend);
            localStorage.setItem('usuario', JSON.stringify(usuarioValido));  // Mejor guardar el objeto completo si es necesario luego
            window.location.href = 'main_menu.html'; // Redireccionar a la página principal
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    })
    .catch(error => console.error('Error durante el inicio de sesión:', error));
});
