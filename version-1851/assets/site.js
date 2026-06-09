(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navToggle && mobileNav) {
      navToggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(target) {
        if (!slides.length) {
          return;
        }
        index = (target + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function play() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          play();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          play();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          play();
        });
      }

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', play);
      show(0);
      play();
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
      var grid = form.parentElement.querySelector('[data-filter-grid]');
      var queryInput = form.querySelector('[data-filter-query]');
      var yearSelect = form.querySelector('[data-filter-year]');
      var typeSelect = form.querySelector('[data-filter-type]');
      var items = grid ? Array.prototype.slice.call(grid.querySelectorAll('.filter-item')) : [];

      function matchesYear(item, value) {
        var year = item.getAttribute('data-year') || '';
        if (!value || value === '全部年份') {
          return true;
        }
        if (value === '2019以前') {
          var parsed = Number(year);
          return parsed && parsed <= 2019;
        }
        return year === value;
      }

      function matchesType(item, value) {
        if (!value || value === '全部类型') {
          return true;
        }
        return (item.getAttribute('data-type') || '').indexOf(value) !== -1;
      }

      function filter() {
        var query = normalize(queryInput ? queryInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';

        items.forEach(function (item) {
          var haystack = normalize([
            item.getAttribute('data-title'),
            item.getAttribute('data-region'),
            item.getAttribute('data-type'),
            item.getAttribute('data-genre'),
            item.getAttribute('data-tags'),
            item.getAttribute('data-year')
          ].join(' '));
          var visible = (!query || haystack.indexOf(query) !== -1) && matchesYear(item, year) && matchesType(item, type);
          item.classList.toggle('is-hidden', !visible);
        });
      }

      form.addEventListener('input', filter);
      form.addEventListener('change', filter);
    });

    var searchInput = document.getElementById('search-page-input');
    var searchResults = document.getElementById('search-results');
    var searchHint = document.getElementById('search-hint');

    if (searchInput && searchResults && Array.isArray(window.SEARCH_DATA)) {
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q') || '';
      searchInput.value = initialQuery;

      function card(movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
          '  </a>',
          '  <div class="movie-card-body">',
          '    <div class="card-meta"><a href="' + movie.categoryUrl + '">' + escapeHtml(movie.category) + '</a><span>' + escapeHtml(movie.year) + '</span></div>',
          '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function runSearch() {
        var query = normalize(searchInput.value);
        var source = window.SEARCH_DATA;
        var result = !query ? source.slice(0, 48) : source.filter(function (movie) {
          return normalize([
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags.join(' '),
            movie.oneLine
          ].join(' ')).indexOf(query) !== -1;
        }).slice(0, 120);

        if (searchHint) {
          searchHint.textContent = query ? '与“' + searchInput.value + '”相关的内容' : '热门内容推荐';
        }
        searchResults.innerHTML = result.map(card).join('');
      }

      searchInput.addEventListener('input', runSearch);
      runSearch();
    }
  });
})();
