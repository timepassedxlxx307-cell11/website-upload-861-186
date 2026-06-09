(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenus() {
    var toggle = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);

        if (!input || !input.value.trim()) {
          return;
        }

        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var year = qs('[data-filter-year]', scope);
      var region = qs('[data-filter-region]', scope);
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-no-results]', scope);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' '));
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
          var matchRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
          var matched = matchKeyword && matchYear && matchRegion;

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.player-start', player);
      var source = video && (video.getAttribute('data-src') || video.getAttribute('src'));
      var started = false;
      var hls = null;

      if (!video || !source) {
        return;
      }

      function loadSource() {
        if (started) {
          return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        loadSource();
        player.classList.add('is-playing');
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      player.addEventListener('click', function (event) {
        if (event.target === video || event.target.closest('.player-overlay')) {
          play();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenus();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
