(function() {
  const HERO_SELECTOR = '[data-hero-carousel]';
  const INTERVAL_MS = 5000;
  const TRANSITION_MS = 900;

  function pickImages() {
    if (Array.isArray(window.PORTFOLIO_IMAGE_SRCS) && window.PORTFOLIO_IMAGE_SRCS.length > 0) {
      return window.PORTFOLIO_IMAGE_SRCS;
    }
    // Fallback por si el script de galería no cargó aún
    return [
      'fotos/foto-retrato.jpg',
      'fotos/estructura-carrousel.jpg',
      'fotos/espuma-playa.jpg',
      'fotos/casados-mirandose.jpg',
      'fotos/kid-retrato.jpg'
    ];
  }

  function preload(src) {
    const img = new Image();
    img.src = src;
  }

  function startCarousel(root) {
    const images = pickImages();
    if (images.length === 0) return;

    // Dedup y barajar ligeramente
    const unique = Array.from(new Set(images));
    const shuffled = unique.sort(() => Math.random() - 0.5);

    // Crear dos capas para crossfade
    const layerA = document.createElement('div');
    const layerB = document.createElement('div');
    [layerA, layerB].forEach(layer => {
      layer.className = 'absolute inset-0 bg-center bg-cover opacity-0 transition-opacity';
      root.appendChild(layer);
    });

    let idx = 0;
    let showA = true;

    function setBg(el, src) {
      el.style.backgroundImage = `url(${src})`;
    }

    function cycle() {
      const nextSrc = shuffled[idx % shuffled.length];
      preload(shuffled[(idx + 1) % shuffled.length]);

      if (showA) {
        setBg(layerA, nextSrc);
        layerA.style.transitionDuration = TRANSITION_MS + 'ms';
        layerB.style.transitionDuration = TRANSITION_MS + 'ms';
        layerA.style.opacity = '1';
        layerB.style.opacity = '0';
      } else {
        setBg(layerB, nextSrc);
        layerA.style.transitionDuration = TRANSITION_MS + 'ms';
        layerB.style.transitionDuration = TRANSITION_MS + 'ms';
        layerA.style.opacity = '0';
        layerB.style.opacity = '1';
      }
      showA = !showA;
      idx++;
    }

    // Inicializar con dos imágenes para evitar parpadeos
    setBg(layerA, shuffled[0]);
    layerA.style.opacity = '1';
    preload(shuffled[1] || shuffled[0]);

    let timer = setInterval(cycle, INTERVAL_MS);

    // Pausar cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        timer = setInterval(cycle, INTERVAL_MS);
      }
    });
  }

  function init() {
    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) return;
    startCarousel(hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


