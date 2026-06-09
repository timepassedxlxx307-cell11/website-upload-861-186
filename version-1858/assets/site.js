(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function() {
      siteNav.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', siteNav.classList.contains('is-open'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(grid, query, category, year) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var q = normalize(query);
    var c = normalize(category);
    var y = normalize(year);
    cards.forEach(function(card) {
      var title = normalize(card.getAttribute('data-title'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var text = normalize(card.textContent);
      var okQuery = !q || title.indexOf(q) > -1 || text.indexOf(q) > -1 || cardYear.indexOf(q) > -1 || cardRegion.indexOf(q) > -1;
      var okCategory = !c || cardCategory === c;
      var okYear = !y || cardYear === y;
      card.classList.toggle('is-hidden-card', !(okQuery && okCategory && okYear));
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]')).forEach(function(grid) {
    var section = grid.closest('.content-section') || document;
    var search = section.querySelector('[data-local-search]');
    var category = section.querySelector('[data-category-filter]');
    var year = section.querySelector('[data-year-filter]');
    function run() {
      filterCards(grid, search && search.value, category && category.value, year && year.value);
    }
    if (search) {
      search.addEventListener('input', run);
    }
    if (category) {
      category.addEventListener('change', run);
    }
    if (year) {
      year.addEventListener('change', run);
    }
  });

  var globalInput = document.querySelector('[data-global-search]');
  var globalGrid = document.querySelector('[data-search-grid]');
  var activeCategory = '';
  if (globalInput && globalGrid) {
    globalInput.addEventListener('input', function() {
      filterCards(globalGrid, globalInput.value, activeCategory, '');
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-cat]')).forEach(function(button) {
    button.addEventListener('click', function() {
      Array.prototype.slice.call(document.querySelectorAll('[data-search-cat]')).forEach(function(item) {
        item.classList.remove('is-active');
      });
      button.classList.add('is-active');
      activeCategory = button.getAttribute('data-search-cat') || '';
      if (globalGrid) {
        filterCards(globalGrid, globalInput && globalInput.value, activeCategory, '');
      }
    });
  });
})();
