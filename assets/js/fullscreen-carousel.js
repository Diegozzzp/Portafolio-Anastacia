/*
  fullscreen-carousel.js
  - Carrusel de pantalla completa que preserva la calidad original de las imágenes
  - Navegación manual y automática
  - Transiciones suaves con crossfade
  - Responsive y optimizado para fotografía
*/

(function() {
  const CAROUSEL_SELECTOR = '[data-fullscreen-carousel]';
  const INTERVAL_MS = 6000;
  const TRANSITION_MS = 1200;
  const PRELOAD_COUNT = 3;

  // Obtener imágenes desde la lista global o fallback
  function getImages() {
    if (Array.isArray(window.PORTFOLIO_IMAGE_SRCS) && window.PORTFOLIO_IMAGE_SRCS.length > 0) {
      return window.PORTFOLIO_IMAGE_SRCS;
    }
    // Fallback con imágenes del repositorio
    return [
      'fotos/foto-retrato.jpg',
      'fotos/estructura-carrousel.jpg',
      'fotos/espuma-playa.jpg',
      'fotos/casados-mirandose.jpg',
      'fotos/kid-retrato.jpg',
      'fotos/playa.jpg',
      'fotos/monta;a-playa.jpg',
      'fotos/hamburguesa-preparando.jpg',
      'fotos/pizza-cortando.jpg',
      'fotos/marca-producto.jpg'
    ];
  }

  // Precargar imágenes para transiciones suaves
  function preloadImages(urls) {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  // Crear elemento de imagen optimizado que preserve calidad y llene la pantalla
  function createImageElement(src, isActive = false) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = 'Fotografía profesional';
    img.className = 'absolute inset-0 w-full h-full object-cover transition-opacity duration-1200 ease-in-out';
    img.style.opacity = isActive ? '1' : '0';
    img.loading = 'eager';
    img.decoding = 'async';
    img.style.imageRendering = 'high-quality';
    img.style.imageRendering = '-webkit-optimize-contrast';
    img.style.objectPosition = 'center';
    return img;
  }

  // Crear controles de navegación elegantes y amigables
  function createControls(container, totalImages) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-6';
    
    // Botón anterior más grande y bonito
    const prevBtn = document.createElement('button');
    prevBtn.className = 'w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:scale-110 transition-all duration-300 flex items-center justify-center group shadow-lg';
    prevBtn.innerHTML = `
      <svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    `;
    prevBtn.setAttribute('aria-label', 'Imagen anterior');
    
    // Indicadores de posición más bonitos
    const indicators = document.createElement('div');
    indicators.className = 'flex gap-3';
    for (let i = 0; i < totalImages; i++) {
      const indicator = document.createElement('button');
      indicator.className = `w-4 h-4 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white scale-125 shadow-lg' : 'bg-white/50 hover:bg-white/70 hover:scale-110'}`;
      indicator.setAttribute('data-index', i);
      indicator.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
      indicators.appendChild(indicator);
    }
    
    // Botón siguiente más grande y bonito
    const nextBtn = document.createElement('button');
    nextBtn.className = 'w-16 h-16 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:scale-110 transition-all duration-300 flex items-center justify-center group shadow-lg';
    nextBtn.innerHTML = `
      <svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    `;
    nextBtn.setAttribute('aria-label', 'Imagen siguiente');
    
    // Contador de imágenes más elegante
    const counter = document.createElement('div');
    counter.className = 'text-white/90 text-sm font-medium px-5 py-3 bg-white/15 backdrop-blur-md border border-white/30 rounded-full shadow-lg';
    counter.textContent = `1 / ${totalImages}`;
    
    // Botón de pausa/reproducción más bonito
    const playPauseBtn = document.createElement('button');
    playPauseBtn.className = 'w-14 h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white hover:bg-white/25 hover:scale-110 transition-all duration-300 flex items-center justify-center group shadow-lg';
    playPauseBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6l4-3-4-3z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;
    playPauseBtn.setAttribute('aria-label', 'Pausar/Reproducir');
    
    controlsContainer.appendChild(prevBtn);
    controlsContainer.appendChild(indicators);
    controlsContainer.appendChild(nextBtn);
    controlsContainer.appendChild(counter);
    controlsContainer.appendChild(playPauseBtn);
    
    return { controlsContainer, prevBtn, nextBtn, indicators, counter, playPauseBtn };
  }

  // Inicializar carrusel
  function initCarousel(container) {
    const images = getImages();
    if (images.length === 0) return;
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoPlayTimer = null;
    
    // Precargar imágenes
    preloadImages(images.slice(0, PRELOAD_COUNT));
    
    // Crear contenedor de imágenes con fondo negro para mejor contraste
    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'absolute inset-0 overflow-hidden bg-black';
    
    // Crear imágenes
    const imageElements = images.map((src, index) => {
      const img = createImageElement(src, index === 0);
      imagesContainer.appendChild(img);
      return img;
    });
    
    container.appendChild(imagesContainer);
    
    // Crear controles
    const { controlsContainer, prevBtn, nextBtn, indicators, counter, playPauseBtn } = createControls(container, images.length);
    container.appendChild(controlsContainer);
    
    // Función para cambiar imagen
    function changeImage(newIndex, direction = 'next') {
      if (isTransitioning || newIndex === currentIndex) return;
      
      isTransitioning = true;
      const currentImg = imageElements[currentIndex];
      const nextImg = imageElements[newIndex];
      
      // Precargar siguiente imagen si es necesario
      if (newIndex + 1 < images.length) {
        preloadImages([images[newIndex + 1]]);
      }
      
      // Transición suave
      nextImg.style.opacity = '1';
      currentImg.style.opacity = '0';
      
      // Actualizar indicadores
      indicators.children[currentIndex].className = 'w-4 h-4 rounded-full transition-all duration-300 bg-white/50 hover:bg-white/70 hover:scale-110';
      indicators.children[newIndex].className = 'w-4 h-4 rounded-full transition-all duration-300 bg-white scale-125 shadow-lg';
      
      // Actualizar contador
      counter.textContent = `${newIndex + 1} / ${images.length}`;
      
      currentIndex = newIndex;
      
      // Resetear timer de transición
      setTimeout(() => {
        isTransitioning = false;
      }, TRANSITION_MS);
    }
    
    // Función para siguiente imagen
    function nextImage() {
      const nextIndex = (currentIndex + 1) % images.length;
      changeImage(nextIndex, 'next');
    }
    
    // Función para imagen anterior
    function prevImage() {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      changeImage(prevIndex, 'prev');
    }
    
    // Event listeners
    nextBtn.addEventListener('click', nextImage);
    prevBtn.addEventListener('click', prevImage);
    
    // Botón de pausa/reproducción
    playPauseBtn.addEventListener('click', () => {
      if (autoPlayTimer) {
        stopAutoPlay();
        playPauseBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"></path>
          </svg>
        `;
      } else {
        startAutoPlay();
        playPauseBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6l4-3-4-3z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        `;
      }
    });
    
    // Indicadores clickeables
    indicators.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      if (!isNaN(index)) {
        changeImage(index);
      }
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === ' ') {
        e.preventDefault();
        toggleAutoPlay();
      }
    });
    
    // Auto-play
    function startAutoPlay() {
      autoPlayTimer = setInterval(nextImage, INTERVAL_MS);
    }
    
    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }
    
    function toggleAutoPlay() {
      if (autoPlayTimer) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    }
    
    // Pausar en hover
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);
    
    // Pausar cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });
    
    // Iniciar auto-play
    startAutoPlay();
    
    // Precargar más imágenes progresivamente
    setTimeout(() => {
      preloadImages(images.slice(PRELOAD_COUNT, PRELOAD_COUNT * 2));
    }, 2000);
  }

  // Inicializar cuando el DOM esté listo
  function init() {
    const carousel = document.querySelector(CAROUSEL_SELECTOR);
    if (!carousel) return;
    
    initCarousel(carousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
