// Obtener elemento por ID acortado
function obtenerElemento(id) {
  return document.getElementById(id);
}

// Cambiar de sección de forma dinámica (SPA)
function mostrarSeccion(idSeccion) {
  let secciones = document.querySelectorAll(".view");

  // Ocultar todas las secciones
  for (let i = 0; i < secciones.length; i++) {
    secciones[i].classList.remove("view--active");
  }

  // Mostrar sección seleccionada
  let seccion = obtenerElemento(idSeccion);
  if (seccion !== null) {
    seccion.classList.add("view--active");
  }

  // Actualizar estados visuales de la barra de navegación
  actualizarNavbar(idSeccion);

  // Guardar en el historial del navegador para mejor UX
  history.pushState({ seccion: idSeccion }, "", `?seccion=${idSeccion}`);

  // Auto-scroll al inicio suavemente
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  // Cerrar menú móvil si estuviera abierto
  cerrarMenu();
}

// Resaltar el botón activo en el menú
function actualizarNavbar(idSeccion) {
  let enlaces = document.querySelectorAll(".nav-link");

  for (let i = 0; i < enlaces.length; i++) {
    enlaces[i].classList.remove("active");

    if (enlaces[i].dataset.section === idSeccion) {
      enlaces[i].classList.add("active");
    }
  }
}

// Abrir/Cerrar menú en dispositivos móviles
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

// Detectar parámetros en URL al cargar (Mantiene la sección activa en recargas)
window.addEventListener("DOMContentLoaded", function () {
  const parametros = new URLSearchParams(window.location.search);
  const seccion = parametros.get("seccion");
  if (seccion === "galeria" || seccion === "pistas") {
    mostrarSeccion(seccion);
  } else {
    mostrarSeccion("home");
  }

  // ======================================================
  // LOGICA PARA QUE NO SE MEZCLEN LAS PISTAS DE AUDIO
  // ======================================================
  const audios = document.querySelectorAll("audio");

  audios.forEach(audioActual => {
    // Escuchamos cuando esta pista en específico empiece a sonar
    audioActual.addEventListener("play", function () {
      // Recorremos todas las pistas de la página
      audios.forEach(otroAudio => {
        // Si es una pista diferente a la que se acaba de activar, la pausamos
        if (otroAudio !== audioActual) {
          otroAudio.pause();
        }
      });
    });
  });
});

// Función opcional para ejecutar descargas de Drive de forma limpia si usas enlaces dinámicos
function descargarDesdeDrive(idArchivo) {
  const urlDescarga = `https://drive.google.com/uc?export=download&id=${idArchivo}`;
  window.open(urlDescarga, '_blank');
}

