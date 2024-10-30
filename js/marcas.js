document.addEventListener("DOMContentLoaded", function () {
    const marcaContainer = document.getElementById("marcaContainer");
  
    // Cargar las marcas desde el archivo JSON
    fetch("/json/productos.json")
      .then((response) => response.json())
      .then((data) => {
        // Extraer marcas únicas
        const marcas = [
          ...new Set(data.map((producto) => producto.Codigo.slice(0, 2))),
        ];
  
        // Crear un botón para cada marca
        marcas.forEach((marca) => {
          const button = document.createElement("button");
          button.classList.add("marca-button");
          button.textContent = marca;
  
          const PC = marca.substring(0, 2).toUpperCase();
          let imagePath = `../assets/Articulos/${PC}/Folder.jpg`;
  
          fetch(imagePath, { method: "HEAD" })
            .then((response) => {
              if (response.ok) {
                button.style.backgroundImage = `url('${imagePath}')`;
                button.style.backgroundSize = "contain";
                button.style.backgroundRepeat = "no-repeat";
                button.style.backgroundPosition = "center";
                button.style.width = "400px";
                button.style.height = "400px";
                button.style.border = "none";
                button.style.textIndent = "-9999px";
              } else {
                button.textContent = marca;
              }
            })
            .catch((error) => {
              console.error("Error al verificar la imagen:", error);
              button.textContent = marca;
            });
  
          button.onclick = function () {
            localStorage.setItem("marcaSeleccionada", marca);
            window.location.href = "familias.html";
          };
  
          marcaContainer.appendChild(button);
        });
      })
      .catch((error) => console.error("Error al cargar las marcas:", error));
  });
  