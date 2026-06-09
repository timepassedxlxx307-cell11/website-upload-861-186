const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupMenu() {
  const toggle = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function setupHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  const prev = $('[data-hero-prev]', hero);
  const next = $('[data-hero-next]', hero);
  if (slides.length === 0) {
    return;
  }
  let index = 0;
  let timer = null;
  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5200);
  };
  prev?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });
  next?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      show(i);
      restart();
    });
  });
  restart();
}

function setupCategoryFilter() {
  const input = $('.category-filter');
  const grid = $('[data-filter-grid]');
  if (!input || !grid) {
    return;
  }
  const cards = $$('.movie-card', grid);
  input.addEventListener('input', () => {
    const keyword = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const text = (card.getAttribute('data-filter') || '').toLowerCase();
      card.classList.toggle('is-filter-hidden', keyword.length > 0 && !text.includes(keyword));
    });
  });
}

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('q') || '').trim();
}

function createResultCard(item) {
  const article = document.createElement('article');
  article.className = 'movie-card card-grid-item';

  const link = document.createElement('a');
  link.className = 'poster-link';
  link.href = item.url;

  const image = document.createElement('img');
  image.src = item.cover;
  image.alt = item.title;
  image.loading = 'lazy';

  const duration = document.createElement('span');
  duration.className = 'duration';
  duration.textContent = item.duration;

  link.append(image, duration);

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('a');
  title.className = 'card-title';
  title.href = item.url;
  title.textContent = item.title;

  const desc = document.createElement('p');
  desc.textContent = item.description;

  const meta = document.createElement('div');
  meta.className = 'meta-row';
  meta.textContent = `${item.year} · ${item.region} · ${item.type} · ${item.genre}`;

  const tags = document.createElement('div');
  tags.className = 'tag-row';
  (item.tags || []).slice(0, 3).forEach((name) => {
    const span = document.createElement('span');
    span.textContent = name;
    tags.append(span);
  });

  body.append(title, desc, meta, tags);
  article.append(link, body);
  return article;
}

function setupSearch() {
  const form = $('[data-search-form]');
  const input = $('[data-search-input]');
  const results = $('[data-search-results]');
  const meta = $('[data-search-meta]');
  if (!form || !input || !results || !meta || !window.SEARCH_ITEMS) {
    return;
  }
  const render = (query) => {
    const keyword = query.trim().toLowerCase();
    results.textContent = '';
    if (!keyword) {
      meta.textContent = '输入关键词开始搜索';
      return;
    }
    const found = window.SEARCH_ITEMS.filter((item) => item.keywords.toLowerCase().includes(keyword)).slice(0, 120);
    meta.textContent = found.length > 0 ? `“${query}” 的相关影片` : `未找到“${query}”的相关影片`;
    found.forEach((item) => results.append(createResultCard(item)));
  };
  const initial = getQuery();
  if (initial) {
    input.value = initial;
    render(initial);
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = query ? `${window.location.pathname}?q=${encodeURIComponent(query)}` : window.location.pathname;
    window.history.replaceState({}, '', url);
    render(query);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMenu();
  setupHero();
  setupCategoryFilter();
  setupSearch();
});
