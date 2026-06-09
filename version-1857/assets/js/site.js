(function () {
    var menuButton = document.querySelector('.mobile-toggle');
    var mobilePanel = document.getElementById('mobilePanel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var open = mobilePanel.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var forms = document.querySelectorAll('.search-form');
    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var query = input.value.trim();
            if (!query) {
                event.preventDefault();
                input.focus();
            }
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 6200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var slide = parseInt(dot.getAttribute('data-slide'), 10);
                showSlide(slide || 0);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var filterInput = document.querySelector('[data-list-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (filterInput && filterList) {
        var items = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter-item]'));
        filterInput.addEventListener('input', function () {
            var query = filterInput.value.trim().toLowerCase();
            items.forEach(function (item) {
                var haystack = (item.getAttribute('data-title') || '').toLowerCase();
                item.classList.toggle('is-filter-hidden', query && haystack.indexOf(query) === -1);
            });
        });
    }
})();
