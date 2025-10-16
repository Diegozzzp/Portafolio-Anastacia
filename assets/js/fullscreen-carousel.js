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
    // Usar object-cover para llenar toda la pantalla sin dejar barras negras
    img.className = 'absolute inset-0 w-full h-full object-cover transition-opacity duration-1200 ease-in-out';
    img.style.opacity = isActive ? '1' : '0';
    // Escalar un poco más para cubrir completamente en pantallas ultra-anchas o ultra-altas
    img.style.transform = 'scale(1.2)';
    img.style.transformOrigin = 'center center';
    img.style.willChange = 'opacity, transform';
    img.loading = 'eager';
    img.decoding = 'async';
    img.style.imageRendering = 'high-quality';
    img.style.imageRendering = '-webkit-optimize-contrast';
    img.style.objectPosition = 'center';
    return img;
  }

  // Crear controles de navegación simples y elegantes
  function createControls(container, totalImages) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6';

    // Botón anterior discreto y elegante
    const prevBtn = document.createElement('button');
    prevBtn.className = 'w-12 h-12 rounded-full bg-black/10 backdrop-blur-md border border-white/20 text-white opacity-70 hover:opacity-100 hover:bg-black/20 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/30';
    prevBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
      </svg>
    `;
    prevBtn.setAttribute('aria-label', 'Imagen anterior');

    // Botón siguiente discreto y elegante
    const nextBtn = document.createElement('button');
    nextBtn.className = 'w-12 h-12 rounded-full bg-black/10 backdrop-blur-md border border-white/20 text-white opacity-70 hover:opacity-100 hover:bg-black/20 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/30';
    nextBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    `;
    nextBtn.setAttribute('aria-label', 'Imagen siguiente');

    controlsContainer.appendChild(prevBtn);
    controlsContainer.appendChild(nextBtn);

    return { controlsContainer, prevBtn, nextBtn };
  }

  // Inicializar carrusel
  function initCarousel(container) {
    const images = getImages();
    if (images.length === 0) return;
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoPlayTimer = null;
    
    // Precargar imágenes (primeras de inmediato y luego todas para evitar vacíos en transiciones rápidas)
    preloadImages(images.slice(0, PRELOAD_COUNT));
    preloadImages(images);
    
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
    const { controlsContainer, prevBtn, nextBtn } = createControls(container, images.length);
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
      
      // Sin indicadores ni contador - solo navegación simple
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
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });
    
    // Auto-play deshabilitado - solo navegación manual
    // Las imágenes cambian solo con los botones o teclado
    
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
