// Variable global para mantener el filtro de categoría activo
let categoriaActual = 'todos';

function obtenerElemento(id) {
  return document.getElementById(id);
}

// Navegación fluida entre pestañas
function mostrarSeccion(idSeccion) {
  let secciones = document.querySelectorAll(".view");

  for (let i = 0; i < secciones.length; i++) {
    secciones[i].classList.remove("view--active");
  }

  let seccion = obtenerElemento(idSeccion);
  if (seccion !== null) {
    seccion.classList.add("view--active");
  }

  actualizarNavbar(idSeccion);

  // Guardar el estado en el historial del navegador
  history.pushState({ seccion: idSeccion }, "", `?seccion=${idSeccion}`);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  cerrarMenu();
}

function actualizarNavbar(idSeccion) {
  let enlaces = document.querySelectorAll(".nav-link");

  for (let i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove("active");

    if (enlaces[i].dataset.section === idSeccion) {
      enlaces[i].classList.add("active");
    }
  }
}

// Menú colapsable para dispositivos móviles
function alternarMenu() {
  let menu = obtenerElemento("mainNav");
  if (menu !== null) {
    menu.classList.toggle("open");
  }
}

function cerrarMenu() {
  let menu = obtenerElemento("mainNav");
  if (menu !== null) {
    menu.classList.remove("open");
  }
}

/* ======================================================
  SISTEMA DE BÚSQUEDA Y FILTRADO AVANZADO
====================================================== */

function filtrarCategoria(categoria, botonActivo) {
  categoriaActual = categoria;
  
  // Cambiar estado visual de los tags
  let botones = document.querySelectorAll(".filter-tags .tag");
  botones.forEach(btn => btn.classList.remove("active"));
  botonActivo.classList.add("active");

  // Ejecutar el filtro combinado
  ejecutarFiltroCombinado();
}

function filtrarAudios() {
  // Se llama en cada pulsación de tecla dentro del buscador
  ejecutarFiltroCombinado();
}

function ejecutarFiltroCombinado() {
  let textoBusqueda = obtenerElemento("audioSearch").value.toLowerCase();
  let tarjetasAudio = document.querySelectorAll(".audio-card");

  tarjetasAudio.forEach(tarjeta => {
    let nombreAudio = tarjeta.querySelector("h3").innerText.toLowerCase();
    let categoriaTarjeta = tarjeta.dataset.category;

    // Verificar coincidencia de texto
    let coincideTexto = nombreAudio.includes(textoBusqueda);
    
    // Verificar coincidencia de categoría
    let coincideCategoria = (categoriaActual === "todos" || categoriaTarjeta === categoriaActual);

    // Mostrar u ocultar tarjeta según las dos condiciones
    if (coincideTexto && coincideCategoria) {
      tarjeta.style.display = "flex";
    } else {
      tarjeta.style.display = "none";
    }
  });
}

// Controlar recargas de página con parámetros URL de sección
window.addEventListener("DOMContentLoaded", function () {
  const parametros = new URLSearchParams(window.location.search);
  const seccion = parametros.get("seccion");
  if (seccion === "audios" || seccion === "galeria") {
    mostrarSeccion(seccion);
  }
});

// Función para inicializar las imágenes locales (.jpg) de las portadas de los audios
function inicializarPortadasAudios() {
  let tarjetasAudio = document.querySelectorAll(".audio-card");
  
  tarjetasAudio.forEach(tarjeta => {
    let contenedorIcono = tarjeta.querySelector(".audio-icon");
    let rutaImagenLocal = tarjeta.dataset.img;

    if (contenedorIcono && rutaImagenLocal) {
      // Creamos el elemento img dinámicamente
      let img = document.createElement("img");
      img.src = rutaImagenLocal;
      img.alt = tarjeta.querySelector("h3").innerText;
      
      // Control de respaldo: Si la imagen .jpg local no existe en tu carpeta, muestra un icono musical fino
      img.onerror = function() {
        contenedorIcono.innerHTML = "<i class='bx bx-music' style='font-size: 26px; color: var(--accent);'></i>";
      };

      // Limpiamos contenido previo e insertamos la imagen local
      contenedorIcono.innerHTML = "";
      contenedorIcono.appendChild(img);
    }
  });
}

// Aseguramos que corra al cargar la página
window.addEventListener("DOMContentLoaded", function () {
  inicializarPortadasAudios();
  
  // Tu lógica de control de parámetros URL existente
  const parametros = new URLSearchParams(window.location.search);
  const seccion = parametros.get("seccion");
  if (seccion === "audios" || seccion === "galeria") {
    mostrarSeccion(seccion);
  }
});