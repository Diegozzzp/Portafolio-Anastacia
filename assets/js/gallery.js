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
    return {
      id: index,
      file,
      src: IMAGE_FOLDER + file,
      title: filenameToTitle(file),
      category: deriveCategory(file),
      meta: filenameToMeta(file)
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
    lbImg.style.opacity = '0';
    lbImg.onload = () => lbImg.style.opacity = '1';
    lbImg.src = img.src;
    lbImg.alt = img.title;
    lbTitle.textContent = img.title;
    lbMeta.textContent = img.meta || img.category;
    lbDownload.href = img.src;
  }

  function next() {
    activeIndex = (activeIndex + 1) % images.length;
    updateLightbox();
  }

  function prev() {
    activeIndex = (activeIndex - 1 + images.length) % images.length;
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


