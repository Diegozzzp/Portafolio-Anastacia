/*
  gallery.js
  - Lee imágenes desde la carpeta `fotos/` existente en el repo.
  - Genera la galería, filtros por categoría (derivada del nombre de archivo), búsqueda por texto.
  - Implementa lightbox con navegación, descarga, y lazy-loading.

  Cómo nombrar archivos para categorías y metadatos:
  - Ejemplo: retrato_maria-barcelona-2024_01.jpg
    * Categoría: retrato
    * Título: "maria barcelona 2024 01" (con guiones/bajos como espacios)
    * Meta (fecha/ubicación) se infiere de la parte intermedia si existe (barcelona-2024)
*/

(function() {
  const IMAGE_FOLDER = 'fotos/';
  // Si decides mover a assets/photos/, cambia arriba.

  // Lista base: si no quieres mantener una lista manual, podríamos generar de forma estática.
  // Aquí incluimos ejemplos tomando nombres reales del repo y algunos supuestos.
  const imageFiles = [
    // Muestras explícitas del repo
    'foto-retrato.jpg',
    'fotoretrato-camaraencara.jpg',
    'retrato.jpg',
    'kid-retrato.jpg',
    'manos-agarranado-zapatos-bebe.jpg',
    'manos-casados-anillos.jpg',
    'casados-mirandose.jpg',
    'beso-embarazada-esposos.jpg',
    'embarazada-esposo-mirada.jpg',
    'estructura-carrousel.jpg',
    'espuma-playa.jpg',
    'playa.jpg',
    'monta;a-playa.jpg',
    'foto-retrato.jpg',
    'marca-producto.jpg',
    'hamburguesa-preparando.jpg',
    'pizza-cortando.jpg',
  ];

  // Exponer listas globales para reutilizar en otras secciones (e.g., hero)
  try {
    window.PORTFOLIO_IMAGE_FILES = imageFiles.slice();
    window.PORTFOLIO_IMAGE_SRCS = imageFiles.map(f => IMAGE_FOLDER + f);
  } catch (e) {
    // no-op en entornos sin window
  }

  // Descripciones detalladas para cada foto con propósito y técnica
  const photoDescriptions = {
    'foto-retrato.jpg': {
      purpose: 'Retrato profesional que busca capturar la esencia natural de la persona',
      technique: 'Luz natural suave desde una ventana, composición de regla de tercios, enfoque en los ojos',
      story: 'Esta sesión se realizó durante la hora dorada para aprovechar la luz cálida y crear una atmósfera íntima'
    },
    'fotoretrato-camaraencara.jpg': {
      purpose: 'Mostrar la conexión entre fotógrafa y sujeto durante una sesión',
      technique: 'Primer plano con profundidad de campo reducida, luz natural difusa',
      story: 'Capturé este momento espontáneo donde la confianza se construye entre fotógrafa y cliente'
    },
    'retrato.jpg': {
      purpose: 'Retrato clásico con enfoque en la expresión auténtica',
      technique: 'Iluminación de estudio con softbox, fondo neutro para destacar al sujeto',
      story: 'Una sesión donde trabajamos juntos para encontrar la expresión más natural y genuina'
    },
    'kid-retrato.jpg': {
      purpose: 'Capturar la inocencia y espontaneidad de la infancia',
      technique: 'Luz natural, velocidad de obturación alta para congelar el movimiento',
      story: 'Los niños son los mejores modelos porque no posan, simplemente son ellos mismos'
    },
    'manos-agarranado-zapatos-bebe.jpg': {
      purpose: 'Documentar los pequeños detalles que hacen únicos los momentos familiares',
      technique: 'Macro con apertura amplia, enfoque selectivo en las manos',
      story: 'Esta imagen captura la ternura de los primeros pasos y la curiosidad infantil'
    },
    'manos-casados-anillos.jpg': {
      purpose: 'Símbolo del compromiso y la unión en una boda',
      technique: 'Primer plano con luz natural, composición centrada para destacar los anillos',
      story: 'El momento más íntimo de la ceremonia, donde dos vidas se unen para siempre'
    },
    'casados-mirandose.jpg': {
      purpose: 'Capturar el amor y la conexión entre los recién casados',
      technique: 'Luz natural cálida, composición de regla de tercios, momento decisivo',
      story: 'Este beso fue completamente espontáneo, capturé la emoción pura del momento'
    },
    'beso-embarazada-esposos.jpg': {
      purpose: 'Documentar el amor en una nueva etapa de la vida familiar',
      technique: 'Luz natural suave, enfoque en la expresión de amor y expectación',
      story: 'La ternura de esperar un bebé se refleja en cada gesto y mirada entre los padres'
    },
    'embarazada-esposo-mirada.jpg': {
      purpose: 'Mostrar la complicidad y apoyo durante el embarazo',
      technique: 'Composición diagonal, luz natural que resalta las formas suaves',
      story: 'Una mirada llena de amor y protección que habla más que mil palabras'
    },
    'estructura-carrousel.jpg': {
      purpose: 'Explorar la geometría y los juegos de luz en arquitectura',
      technique: 'Composición geométrica, contraste entre luces y sombras',
      story: 'Me fascina cómo la luz transforma las estructuras en esculturas de sombras'
    },
    'espuma-playa.jpg': {
      purpose: 'Capturar el movimiento y la textura del mar',
      technique: 'Velocidad de obturación lenta para crear movimiento fluido, composición minimalista',
      story: 'La espuma del mar crea patrones únicos que nunca se repiten, cada ola es diferente'
    },
    'playa.jpg': {
      purpose: 'Documentar la serenidad y vastedad del paisaje costero',
      technique: 'Horizonte en tercio inferior, luz natural de atardecer',
      story: 'Los atardeceres en la playa ofrecen los colores más hermosos para fotografiar'
    },
    'monta;a-playa.jpg': {
      purpose: 'Contrastar la inmensidad de la montaña con el mar',
      technique: 'Composición de paisaje amplio, luz natural de mediodía',
      story: 'La combinación de montaña y mar crea paisajes únicos llenos de texturas'
    },
    'marca-producto.jpg': {
      purpose: 'Fotografía comercial para destacar productos de manera atractiva',
      technique: 'Iluminación de estudio controlada, composición limpia y minimalista',
      story: 'La fotografía de producto requiere atención al detalle para mostrar cada textura y forma'
    },
    'hamburguesa-preparando.jpg': {
      purpose: 'Capturar el proceso creativo de la cocina',
      technique: 'Primer plano con profundidad de campo reducida, luz natural',
      story: 'La cocina es un laboratorio de texturas, colores y aromas perfectos para fotografiar'
    },
    'pizza-cortando.jpg': {
      purpose: 'Documentar la textura y el momento de servir comida',
      technique: 'Enfoque selectivo, composición dinámica con líneas diagonales',
      story: 'El momento de cortar la pizza es perfecto para capturar texturas y movimiento'
    }
  };

  // Intentamos derivar categoría por palabras clave en el nombre
  function deriveCategory(filename) {
    const name = filename.toLowerCase();
    if (name.includes('boda') || name.includes('casado') || name.includes('anillo')) return 'bodas';
    if (name.includes('retrato')) return 'retrato';
    if (name.includes('embaraz')) return 'familia';
    if (name.includes('playa') || name.includes('calle')) return 'calle';
    if (name.includes('producto') || name.includes('hamburguesa') || name.includes('pizza') || name.includes('marca')) return 'producto';
    return 'varios';
  }

  function filenameToTitle(filename) {
    const base = filename.replace(/\.[^.]+$/, '');
    const human = base.replace(/[-_]+/g, ' ')
      .replace(/\b(\w)/g, (m, c) => c.toUpperCase());
    return human;
  }

  function filenameToMeta(filename) {
    // Busca un patrón simple de ciudad/fecha si está presente en el nombre (heurística ligera)
    const base = filename.replace(/\.[^.]+$/, '');
    const parts = base.split('-');
    const maybeYear = parts.find(p => /^(19|20)\d{2}$/.test(p));
    const city = parts.find(p => /barcelona|madrid|sevilla|valencia|bilbao|playa/.test(p));
    const cityStr = city ? city.replace(/\d+/g, '') : '';
    const yearStr = maybeYear || '';
    return [cityStr, yearStr].filter(Boolean).join(' · ');
  }

  const images = imageFiles.map((file, index) => {
    const description = photoDescriptions[file] || {
      purpose: 'Capturar momentos únicos con autenticidad',
      technique: 'Luz natural y composición cuidadosa',
      story: 'Cada imagen cuenta una historia especial'
    };
    
    return {
      id: index,
      file,
      src: IMAGE_FOLDER + file,
      title: filenameToTitle(file),
      category: deriveCategory(file),
      meta: filenameToMeta(file),
      description: description
    };
  });

  // DOM refs
  const grid = document.getElementById('galleryGrid');
  const searchInput = document.getElementById('searchInput');
  const filterContainer = document.querySelector('[role="tablist"]');

  // Lightbox refs
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImage');
  const lbTitle = document.getElementById('lbTitle');
  const lbMeta = document.getElementById('lbMeta');
  const lbPurpose = document.getElementById('lbPurpose');
  const lbTechnique = document.getElementById('lbTechnique');
  const lbStory = document.getElementById('lbStory');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbDownload = document.getElementById('lbDownload');

  let activeIndex = 0;
  let currentFilter = 'all';
  let currentQuery = '';

  function getFiltered() {
    return images.filter(img => {
      const passFilter = currentFilter === 'all' || img.category === currentFilter;
      const passQuery = currentQuery === '' || img.title.toLowerCase().includes(currentQuery) || img.file.toLowerCase().includes(currentQuery);
      return passFilter && passQuery;
    });
  }

  function createCard(img) {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'group block rounded-lg overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-soft hover:shadow transition';
    a.setAttribute('data-id', String(img.id));
    a.setAttribute('data-category', img.category);
    a.setAttribute('aria-label', `Ver ${img.title}`);

    // Imagen con lazy + decoding async y fade-in
    const picture = document.createElement('picture');
    // Nota: si generas variantes webp, actualiza srcset aquí.
    // picture.innerHTML = `<source type="image/webp" srcset="${IMAGE_FOLDER}${imgBase}-480.webp 480w, ..." sizes="...">`;

    const image = document.createElement('img');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.src = img.src;
    image.alt = img.title;
    image.className = 'w-full h-52 object-cover transition duration-300 ease-out group-hover:scale-[1.02]';
    picture.appendChild(image);

    const info = document.createElement('div');
    info.className = 'p-3 flex items-center justify-between';
    const title = document.createElement('h3');
    title.className = 'text-sm font-medium';
    title.textContent = img.title;
    const category = document.createElement('span');
    category.className = 'text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300';
    category.textContent = img.category;
    info.append(title, category);

    a.append(picture, info);
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(img.id);
    });

    return a;
  }

  function renderGrid() {
    const list = getFiltered();
    grid.innerHTML = '';
    list.forEach(img => grid.appendChild(createCard(img)));
  }

  function renderFilters() {
    const cats = Array.from(new Set(images.map(i => i.category)));
    // Reset, mantén el botón "Todas" existente
    const existingAll = filterContainer.querySelector('[data-filter="all"]');
    filterContainer.innerHTML = '';
    filterContainer.appendChild(existingAll);
    existingAll.classList.add('active');

    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn px-3 py-1.5 rounded-full text-sm border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-400';
      btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      btn.setAttribute('data-filter', cat);
      btn.addEventListener('click', () => {
        currentFilter = cat;
        setActiveFilter(cat);
        renderGrid();
      });
      filterContainer.appendChild(btn);
    });

    existingAll.addEventListener('click', () => {
      currentFilter = 'all';
      setActiveFilter('all');
      renderGrid();
    });
  }

  function setActiveFilter(filter) {
    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
      if (btn.getAttribute('data-filter') === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // Lightbox
  function openLightbox(id) {
    const idx = images.findIndex(i => i.id === id);
    if (idx === -1) return;
    activeIndex = idx;
    updateLightbox();
    lb.classList.remove('hidden');
    const overlay = lb.firstElementChild;
    overlay.classList.remove('opacity-0');
    overlay.classList.add('opacity-100');
    document.addEventListener('keydown', onKey);
  }

  function closeLightbox() {
    const overlay = lb.firstElementChild;
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0');
    setTimeout(() => lb.classList.add('hidden'), 150);
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }

  function updateLightbox() {
    const img = images[activeIndex];
    if (!img) return;
    
    // Actualizar imagen
    lbImg.style.opacity = '0';
    lbImg.onload = () => lbImg.style.opacity = '1';
    lbImg.src = img.src;
    lbImg.alt = img.title;
    
    // Actualizar información básica
    lbTitle.textContent = img.title;
    lbMeta.textContent = img.meta || img.category;
    
    // Actualizar descripciones detalladas
    lbPurpose.textContent = img.description.purpose;
    lbTechnique.textContent = img.description.technique;
    lbStory.textContent = img.description.story;
    
    // Actualizar contador
    const filteredImages = getFiltered();
    const currentPosition = filteredImages.findIndex(i => i.id === img.id) + 1;
    lbCounter.textContent = `${currentPosition} de ${filteredImages.length}`;
    
    // Actualizar enlace de descarga
    lbDownload.href = img.src;
    lbDownload.download = img.file;
  }

  function next() {
    const filteredImages = getFiltered();
    const currentIdx = filteredImages.findIndex(i => i.id === images[activeIndex].id);
    const nextIdx = (currentIdx + 1) % filteredImages.length;
    activeIndex = filteredImages[nextIdx].id;
    updateLightbox();
  }

  function prev() {
    const filteredImages = getFiltered();
    const currentIdx = filteredImages.findIndex(i => i.id === images[activeIndex].id);
    const prevIdx = (currentIdx - 1 + filteredImages.length) % filteredImages.length;
    activeIndex = filteredImages[prevIdx].id;
    updateLightbox();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);

  lb.addEventListener('click', (e) => {
    // Cerrar si clic fuera del contenedor
    if (e.target === lb || e.target === lb.firstElementChild) closeLightbox();
  });

  // Búsqueda
  searchInput.addEventListener('input', () => {
    currentQuery = searchInput.value.toLowerCase();
    renderGrid();
  });

  // Acceso rápido a búsqueda con Ctrl/Cmd+K
  window.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Inicializar
  renderFilters();
  renderGrid();
})();


