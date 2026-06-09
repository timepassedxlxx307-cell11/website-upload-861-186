(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".hero").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }
  });

  document.querySelectorAll("[data-search-area]").forEach(function (area) {
    var input = area.querySelector("[data-filter-input]");
    var type = area.querySelector("[data-filter-type]");
    var year = area.querySelector("[data-filter-year]");
    var scope = area.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .media-row"));
    var empty = area.querySelector(".empty-state");

    function textOf(card) {
      return [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.textContent
      ].join(" ").toLowerCase();
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value.trim() : "";
      var yearValue = year ? year.value.trim() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var matchedYear = !yearValue || cardYear === yearValue;
        var matched = matchedKeyword && matchedType && matchedYear;

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  });
})();
