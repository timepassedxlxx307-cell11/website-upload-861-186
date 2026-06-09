(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function initCatalogFilters() {
        var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-tools]"));
        toolbars.forEach(function (toolbar) {
            var input = toolbar.querySelector(".catalog-filter");
            var container = toolbar.parentElement;
            var count = toolbar.querySelector("[data-filter-count]");
            if (!input || !container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + " 部影片";
                }
            }
            input.addEventListener("input", applyFilter);
        });
    }

    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function uniqueSorted(values) {
        var seen = Object.create(null);
        values.forEach(function (value) {
            if (value !== undefined && value !== null && String(value).trim()) {
                seen[String(value).trim()] = true;
            }
        });
        return Object.keys(seen).sort(function (a, b) {
            return a.localeCompare(b, "zh-CN");
        });
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }
        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function renderSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<a href="./search.html?q=' + encodeURIComponent(tag) + '" class="tag-chip">' + escapeHtml(tag) + '</a>';
        }).join("");
        return [
            '<article class="movie-card" data-card>',
            '    <a class="poster-link" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
            '        <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '        <span class="poster-score">' + escapeHtml(String(movie.score)) + '</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.one_line || "") + '</p>',
            '        <div class="movie-meta">',
            '            <span>' + escapeHtml(String(movie.year_text || movie.year || "")) + '</span>',
            '            <span>' + escapeHtml(movie.region || "") + '</span>',
            '            <span>' + escapeHtml(movie.genre || "") + '</span>',
            '        </div>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join("\n");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.MOVIES) {
            return;
        }
        var input = document.getElementById("searchInput");
        var button = document.getElementById("searchButton");
        var typeFilter = document.getElementById("typeFilter");
        var regionFilter = document.getElementById("regionFilter");
        var yearFilter = document.getElementById("yearFilter");
        var results = document.getElementById("searchResults");
        var count = document.getElementById("searchCount");
        var movies = window.MOVIES || [];

        fillSelect(typeFilter, uniqueSorted(movies.map(function (movie) { return movie.type; })).slice(0, 80));
        fillSelect(regionFilter, uniqueSorted(movies.map(function (movie) { return movie.region; })).slice(0, 80));
        fillSelect(yearFilter, uniqueSorted(movies.map(function (movie) { return movie.year_text || movie.year; })).reverse());

        input.value = getQueryParam("q");

        function applySearch() {
            var query = input.value.trim().toLowerCase();
            var typeValue = typeFilter.value;
            var regionValue = regionFilter.value;
            var yearValue = yearFilter.value;
            var matches = movies.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.one_line,
                    movie.region,
                    movie.type,
                    movie.year_text,
                    movie.genre,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return (!query || haystack.indexOf(query) !== -1) &&
                    (!typeValue || movie.type === typeValue) &&
                    (!regionValue || movie.region === regionValue) &&
                    (!yearValue || String(movie.year_text || movie.year) === String(yearValue));
            });
            var limited = matches.slice(0, 120);
            results.innerHTML = limited.map(renderSearchCard).join("\n");
            count.textContent = "找到 " + matches.length + " 部影片" + (matches.length > limited.length ? "，当前显示前 " + limited.length + " 部" : "");
        }

        [input, typeFilter, regionFilter, yearFilter].forEach(function (element) {
            element.addEventListener("input", applySearch);
            element.addEventListener("change", applySearch);
        });
        button.addEventListener("click", applySearch);
        applySearch();
    }

    function initScrollPlayer() {
        var link = document.querySelector("[data-scroll-player]");
        if (!link) {
            return;
        }
        link.addEventListener("click", function (event) {
            event.preventDefault();
            var player = document.querySelector("[data-player]");
            if (player) {
                player.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }

    ready(function () {
        initNavigation();
        initHeroSlider();
        initCatalogFilters();
        initSearchPage();
        initScrollPlayer();
    });
})();
