(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openMobileMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-main-nav]');
    var search = $('.nav-search');
    if (!button || !nav || !search) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      search.classList.toggle('is-open');
      button.textContent = nav.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var bars = $all('[data-filter-bar]');
    bars.forEach(function (bar) {
      var section = bar.closest('section') || document;
      var cards = $all('[data-card]', section);
      var buttons = $all('[data-filter-button]', bar);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var filter = button.getAttribute('data-filter-button') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          cards.forEach(function (card) {
            var text = [
              card.getAttribute('data-title'),
              card.getAttribute('data-region'),
              card.getAttribute('data-type'),
              card.getAttribute('data-year'),
              card.getAttribute('data-genre')
            ].join(' ');
            card.style.display = filter === 'all' || text.indexOf(filter) !== -1 ? '' : 'none';
          });
        });
      });
      if (buttons[0]) {
        buttons[0].classList.add('is-active');
      }
    });
  }

  function setupImageFallback() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function createCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return [
      '<a class="movie-card" href="details/movie-' + escapeHTML(movie.id) + '.html">',
      '<div class="poster-wrap">',
      '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
      '<span class="poster-type">' + escapeHTML(movie.type) + '</span>',
      '</div>',
      '<div class="movie-info">',
      '<h3>' + escapeHTML(movie.title) + '</h3>',
      '<p class="meta">' + escapeHTML(movie.region) + ' · ' + escapeHTML(movie.year) + ' · ' + escapeHTML(movie.genre) + '</p>',
      '<p class="line">' + escapeHTML(movie.oneLine) + '</p>',
      '<div class="tag-list">' + tags + '</div>',
      '</div>',
      '</a>'
    ].join('');
  }

  function setupSearch() {
    var form = $('[data-search-form]');
    var input = $('[data-search-input]');
    var select = $('[data-search-category]');
    var results = $('[data-search-results]');
    var title = $('[data-search-title]');
    var summary = $('[data-search-summary]');
    var data = window.SEARCH_MOVIES || [];
    if (!form || !input || !results || !data.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var queryFromUrl = params.get('q') || '';
    if (queryFromUrl) {
      input.value = queryFromUrl;
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var category = select ? select.value : 'all';
      var list = data.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
        var categoryMatched = category === 'all' || movie.category === category;
        return categoryMatched && (!query || text.indexOf(query) !== -1);
      }).slice(0, 80);
      if (title) {
        title.textContent = query ? '搜索结果' : '热门推荐';
      }
      if (summary) {
        summary.textContent = query ? '已按关键词筛选出相关影片。' : '可通过上方搜索框筛选影片。';
      }
      results.innerHTML = list.length ? list.map(createCard).join('') : '<div class="empty-state">没有找到相关影片</div>';
      setupImageFallback();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener('input', render);
    if (select) {
      select.addEventListener('change', render);
    }
    if (queryFromUrl) {
      render();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupImageFallback();
  });
})();
