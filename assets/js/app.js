(function () {
  const photos = Array.isArray(window.PORTFOLIO_PHOTOS) ? window.PORTFOLIO_PHOTOS : [];
  const categoryLabels = {
    all: 'Todo',
    retratos: 'Retratos',
    maternidad: 'Maternidad',
    bodas: 'Bodas',
    comercial: 'Comercial',
    editorial: 'Editorial',
    'calle-paisaje': 'Calle y paisaje'
  };
  const categoryText = {
    retratos: 'Presencia, expresion y direccion sensible.',
    maternidad: 'Historias de espera, piel, detalle y ternura.',
    bodas: 'Gestos pequenos que sostienen un dia enorme.',
    comercial: 'Producto, gastronomia y marca con apetito visual.',
    editorial: 'Luz, arquitectura y composicion con caracter.',
    'calle-paisaje': 'Ciudad, naturaleza y escenas encontradas.'
  };

  const state = { filter: 'all', query: '', active: 0, visible: photos.slice() };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const nav = $('.site-nav');

  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  function formatCategory(cat) { return categoryLabels[cat] || cat; }

  function categoryCover(cat) {
    return photos.find(p => p.category === cat && p.orientation === 'vertical') || photos.find(p => p.category === cat) || photos[0];
  }

  function renderHeroStrip() {
    const strip = $('#heroStrip');
    if (!strip) return;
    const picks = ['modelo', 'beso-embarazada-esposos', 'marca-producto', 'estructura-carrousel']
      .map(id => photos.find(p => p.id === id)).filter(Boolean);
    strip.innerHTML = picks.map(p => `<img src="${p.thumb}" alt="${p.title}" width="92" height="122" loading="eager" decoding="async">`).join('');
  }

  function renderCategories() {
    const grid = $('#categoryGrid');
    if (!grid) return;
    const cats = ['retratos', 'maternidad', 'bodas', 'comercial', 'editorial', 'calle-paisaje'];
    grid.innerHTML = cats.map(cat => {
      const cover = categoryCover(cat);
      const count = photos.filter(p => p.category === cat).length;
      return `<button class="category-card" data-category="${cat}" aria-label="Ver ${formatCategory(cat)}">
        <img src="${cover.thumb}" alt="${formatCategory(cat)}" loading="lazy" decoding="async">
        <span class="category-info"><h3>${formatCategory(cat)}</h3><p>${count} fotos - ${categoryText[cat]}</p></span>
      </button>`;
    }).join('');
    $$('.category-card', grid).forEach(btn => btn.addEventListener('click', () => {
      state.filter = btn.dataset.category;
      setActiveFilter();
      renderGallery();
      $('#galeria')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }));
  }

  function renderFilters() {
    const filters = $('#filters');
    if (!filters) return;
    const cats = ['all', ...new Set(photos.map(p => p.category))];
    filters.innerHTML = cats.map(cat => `<button class="filter-btn" data-filter="${cat}">${formatCategory(cat)}</button>`).join('');
    $$('.filter-btn', filters).forEach(btn => btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      setActiveFilter();
      renderGallery();
    }));
    setActiveFilter();
  }

  function setActiveFilter() {
    $$('.filter-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === state.filter));
  }

  function getVisible() {
    const query = state.query.trim().toLowerCase();
    return photos.filter(p => {
      const byFilter = state.filter === 'all' || p.category === state.filter;
      const byQuery = !query || [p.title, p.category, p.story].join(' ').toLowerCase().includes(query);
      return byFilter && byQuery;
    });
  }

  function renderGallery(limit) {
    const gallery = $('#gallery');
    const empty = $('#emptyState');
    if (!gallery) return;
    state.visible = getVisible();
    const list = typeof limit === 'number' ? state.visible.slice(0, limit) : state.visible;
    gallery.innerHTML = list.map((p, index) => {
      const ratio = p.width && p.height ? `${p.width} / ${p.height}` : '4 / 5';
      return `<button class="photo-card" data-index="${index}" aria-label="Abrir ${p.title}">
        <span class="photo-frame">
          <img src="${p.thumb}" data-full="${p.src}" alt="${p.title}" width="${p.width}" height="${p.height}" style="aspect-ratio:${ratio}" loading="lazy" decoding="async">
          <span class="photo-caption"><strong>${p.title}</strong><span>${formatCategory(p.category)}</span></span>
        </span>
      </button>`;
    }).join('');
    if (empty) empty.style.display = state.visible.length ? 'none' : 'block';
    $$('.photo-card', gallery).forEach(btn => btn.addEventListener('click', () => openLightbox(Number(btn.dataset.index))));
  }

  function openLightbox(index) {
    state.active = index;
    updateLightbox();
    $('.lightbox')?.classList.add('open');
    document.body.classList.add('locked');
  }

  function closeLightbox() {
    $('.lightbox')?.classList.remove('open');
    document.body.classList.remove('locked');
  }

  function moveLightbox(delta) {
    if (!state.visible.length) return;
    state.active = (state.active + delta + state.visible.length) % state.visible.length;
    updateLightbox();
  }

  function updateLightbox() {
    const p = state.visible[state.active];
    if (!p) return;
    $('#lightboxImage').src = p.src;
    $('#lightboxImage').alt = p.title;
    $('#lightboxTitle').textContent = p.title;
    $('#lightboxMeta').textContent = `${formatCategory(p.category)} - ${state.active + 1} de ${state.visible.length}`;
    $('#lightboxStory').textContent = p.story;
    $('#lightboxOriginal').href = p.original;
  }

  function bindSearch() {
    const search = $('#searchInput');
    if (!search) return;
    search.addEventListener('input', () => {
      state.query = search.value;
      renderGallery();
    });
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        search.focus();
      }
    });
  }

  function bindLightbox() {
    $('#lightboxClose')?.addEventListener('click', closeLightbox);
    $('#lightboxPrev')?.addEventListener('click', () => moveLightbox(-1));
    $('#lightboxNext')?.addEventListener('click', () => moveLightbox(1));
    $('.lightbox')?.addEventListener('click', e => { if (e.target.classList.contains('lightbox')) closeLightbox(); });
    window.addEventListener('keydown', e => {
      if (!$('.lightbox')?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') moveLightbox(1);
      if (e.key === 'ArrowLeft') moveLightbox(-1);
    });
  }

  function bindMenu() {
    $('.menu-toggle')?.addEventListener('click', () => nav?.classList.toggle('menu-open'));
    $$('.nav-links a').forEach(a => a.addEventListener('click', () => nav?.classList.remove('menu-open')));
  }

  function init() {
    if (!photos.length) return;
    renderHeroStrip();
    renderCategories();
    renderFilters();
    bindSearch();
    bindLightbox();
    bindMenu();
    renderGallery(document.body.dataset.galleryLimit ? Number(document.body.dataset.galleryLimit) : undefined);
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
