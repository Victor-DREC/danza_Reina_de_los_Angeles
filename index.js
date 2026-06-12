/* ======================================================
   DANZA — index.js
====================================================== */

/* ======================================================
   NAVEGACIÓN
====================================================== */

function obtenerElemento(id) {
  return document.getElementById(id);
}

/**
 * Muestra la sección indicada y oculta las demás.
 * Actualiza la navbar y el historial del navegador.
 */
function mostrarSeccion(idSeccion) {
  // Ocultar todas las vistas
  document.querySelectorAll(".view").forEach(s => s.classList.remove("view--active"));

  // Activar la sección pedida
  const sec = obtenerElemento(idSeccion);
  if (sec) sec.classList.add("view--active");

  // Resaltar enlace activo en la navbar
  actualizarNavbar(idSeccion);

  // Actualizar URL sin recargar la página
  history.pushState({ seccion: idSeccion }, "", `?seccion=${idSeccion}`);

  // Scroll al tope suavemente
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Cerrar menú móvil si estuviera abierto
  cerrarMenu();
}

function actualizarNavbar(idSeccion) {
  document.querySelectorAll(".nav-link").forEach(el => {
    el.classList.remove("active");
    if (el.dataset.section === idSeccion) el.classList.add("active");
  });
}

function alternarMenu() {
  const nav = obtenerElemento("mainNav");
  if (nav) nav.classList.toggle("open");
}

function cerrarMenu() {
  const nav = obtenerElemento("mainNav");
  if (nav) nav.classList.remove("open");
}

/* ======================================================
   LIGHTBOX — GALERÍA
====================================================== */

/**
 * Abre el lightbox con la imagen a tamaño completo.
 * Lee data-src (versión grande) del article y data-nombre para el pie.
 */
function abrirLightbox(card) {
  const imgEl    = card.querySelector(".photo-card__thumb img");
  const fullSrc  = card.dataset.src || imgEl.src;
  const dlUrl    = card.dataset.download || fullSrc;
  const nombre   = card.dataset.nombre || "";

  obtenerElemento("lightboxImg").src        = fullSrc;
  obtenerElemento("lightboxLabel").textContent = nombre;

  const dlLink = obtenerElemento("lightboxDownload");
  dlLink.href     = dlUrl;
  dlLink.download = (nombre || "foto-danza").replace(/\s+/g, "-").toLowerCase() + ".jpg";

  obtenerElemento("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

function cerrarLightbox() {
  obtenerElemento("lightbox").classList.remove("open");
  document.body.style.overflow = "";
  // Limpiamos el src para liberar memoria
  setTimeout(() => { obtenerElemento("lightboxImg").src = ""; }, 300);
}

// Cerrar con Escape
document.addEventListener("keydown", e => {
  if (e.key === "Escape") cerrarLightbox();
});

/* ======================================================
   REPRODUCTOR DE AUDIO — PISTAS
====================================================== */

/**
 * Expande/colapsa el reproductor de audio dentro de una media-card.
 * Solo una pista puede estar expandida a la vez.
 */
function toggleAudio(card) {
  const playerWrap = card.querySelector(".audio-player-wrap");
  const audio      = playerWrap ? playerWrap.querySelector("audio") : null;
  const btn        = card.querySelector(".btn-play-card");
  const icon       = btn.querySelector("i");

  const estaAbierto = playerWrap && playerWrap.style.display !== "none";

  // Cerrar todos los demás reproductores de audio abiertos
  document.querySelectorAll(".media-card--audio").forEach(otherCard => {
    if (otherCard === card) return;
    const ow = otherCard.querySelector(".audio-player-wrap");
    const oa = ow ? ow.querySelector("audio") : null;
    const ob = otherCard.querySelector(".btn-play-card");
    if (ow) ow.style.display = "none";
    if (oa) { oa.pause(); oa.currentTime = 0; }
    if (ob) {
      ob.classList.remove("playing");
      ob.innerHTML = "<i class='bx bx-play'></i> Reproducir";
    }
  });

  if (estaAbierto) {
    // Colapsar
    playerWrap.style.display = "none";
    if (audio) { audio.pause(); audio.currentTime = 0; }
    btn.classList.remove("playing");
    btn.innerHTML = "<i class='bx bx-play'></i> Reproducir";
  } else {
    // Expandir y reproducir
    if (playerWrap) playerWrap.style.display = "block";
    if (audio) {
      // Cargar src desde el data-src del card si el elemento audio aún no lo tiene
      const audioSrc = card.dataset.src;
      const sourceEl = audio.querySelector("source");
      if (audioSrc && sourceEl && !sourceEl.src) {
        sourceEl.src = audioSrc;
        audio.load();
      }
      audio.play().catch(() => {
        // El navegador puede bloquear autoplay; el usuario puede darle play manualmente
      });
    }
    btn.classList.add("playing");
    btn.innerHTML = "<i class='bx bx-pause'></i> Pausar";

    // Cuando el audio termina, resetear el botón
    if (audio) {
      audio.onended = () => {
        btn.classList.remove("playing");
        btn.innerHTML = "<i class='bx bx-play'></i> Reproducir";
      };
    }
  }
}

/* ======================================================
   REPRODUCTOR DE VIDEO — VIDEOS
====================================================== */

// Contador de videos para asignar índices a los reproductores
let videoIndex = 0;

/**
 * Asigna índices a todas las media-card--video al cargar la página.
 * Cada card obtiene data-video-index y su iframe correspondiente id="iframe-N".
 */
function inicializarVideos() {
  document.querySelectorAll(".media-card--video").forEach((card, i) => {
    card.dataset.videoIndex = i;
  });
}

/**
 * Muestra el reproductor de video incrustado justo debajo de la card.
 * Solo un video puede estar abierto a la vez.
 */
function reproducirVideo(card) {
  const idx    = parseInt(card.dataset.videoIndex, 10);
  const embed  = card.dataset.embed;
  const player = obtenerElemento(`player-${idx}`);
  const iframe = obtenerElemento(`iframe-${idx}`);
  const btn    = card.querySelector(".btn-play-card");

  if (!player || !iframe) return;

  const estaAbierto = player.style.display !== "none";

  // Cerrar todos los videos abiertos
  document.querySelectorAll(".video-player-wrap").forEach((pw, pi) => {
    if (pi === idx) return;
    pw.style.display = "none";
    const ifrEl = obtenerElemento(`iframe-${pi}`);
    if (ifrEl) ifrEl.src = ""; // detener reproducción
    // Resetear botón de la card correspondiente
    const otherCard = document.querySelector(`[data-video-index="${pi}"]`);
    if (otherCard) {
      const ob = otherCard.querySelector(".btn-play-card");
      if (ob) {
        ob.classList.remove("playing");
        ob.innerHTML = "<i class='bx bx-play'></i> Reproducir";
      }
    }
  });

  if (estaAbierto) {
    // Cerrar este reproductor
    player.style.display = "none";
    iframe.src = "";
    btn.classList.remove("playing");
    btn.innerHTML = "<i class='bx bx-play'></i> Reproducir";
  } else {
    // Abrir y cargar el video
    player.style.display = "block";
    // Para YouTube: agregar autoplay=1
    // Para Google Drive: la URL preview ya reproduce sola
    const autoplayUrl = embed.includes("youtube.com") || embed.includes("youtu.be")
      ? embed + (embed.includes("?") ? "&" : "?") + "autoplay=1"
      : embed;
    iframe.src = autoplayUrl;
    btn.classList.add("playing");
    btn.innerHTML = "<i class='bx bx-stop'></i> Cerrar video";

    // Scroll suave al reproductor
    setTimeout(() => {
      player.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  }
}

/**
 * Cierra el reproductor de video con el índice dado.
 * Llamado desde el botón ✕ dentro del reproductor.
 */
function cerrarVideo(idx) {
  const player = obtenerElemento(`player-${idx}`);
  const iframe = obtenerElemento(`iframe-${idx}`);
  if (player) player.style.display = "none";
  if (iframe) iframe.src = "";

  // Resetear el botón de la card correspondiente
  const card = document.querySelector(`[data-video-index="${idx}"]`);
  if (card) {
    const btn = card.querySelector(".btn-play-card");
    if (btn) {
      btn.classList.remove("playing");
      btn.innerHTML = "<i class='bx bx-play'></i> Reproducir";
    }
  }
}

/* ======================================================
   INICIALIZACIÓN
====================================================== */

window.addEventListener("DOMContentLoaded", () => {
  // Inicializar índices de video
  inicializarVideos();

  // Inicializar fallbacks de miniaturas de audio
  inicializarThumbsAudio();

  // Leer la sección desde la URL al cargar la página
  const params  = new URLSearchParams(window.location.search);
  const seccion = params.get("seccion");
  const secciones = ["inicio", "galeria", "videos", "pistas"];
  if (secciones.includes(seccion)) {
    mostrarSeccion(seccion);
  }
});

/**
 * Para las pistas de audio, si la media-card tiene data-thumb,
 * lo asigna a la imagen. Si no hay imagen, muestra el fallback con ícono.
 */
function inicializarThumbsAudio() {
  document.querySelectorAll(".media-card--audio").forEach(card => {
    const thumb  = card.dataset.thumb;
    const imgEl  = card.querySelector(".media-card__thumb");
    const fallEl = card.querySelector(".media-card__thumb-fallback");

    if (thumb && imgEl) {
      imgEl.src = thumb;
      imgEl.style.display = "block";
      if (fallEl) fallEl.style.display = "none";
    } else {
      // Sin miniatura → mostrar ícono dorado
      if (imgEl)  imgEl.style.display  = "none";
      if (fallEl) fallEl.style.display = "grid";
    }
  });
}

/* ======================================================
   NAVEGACIÓN CON BOTÓN ATRÁS DEL NAVEGADOR
====================================================== */
window.addEventListener("popstate", e => {
  if (e.state && e.state.seccion) {
    mostrarSeccion(e.state.seccion);
  }
});