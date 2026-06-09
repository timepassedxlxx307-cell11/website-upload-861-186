(function () {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var sortButtons = Array.prototype.slice.call(document.querySelectorAll('[data-sort]'));
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var sort = params.get('sort') || 'popular';

    if (!results || typeof movieCatalog === 'undefined') {
        return;
    }

    if (input) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster" href="./' + movie.url + '">',
            '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
            '<span class="play-circle">▶</span>',
            '<span class="duration">' + movie.duration + '</span>',
            '</a>',
            '<div class="card-body">',
            '<h3><a href="./' + movie.url + '">' + movie.title + '</a></h3>',
            '<p>' + movie.oneLine + '</p>',
            '<div class="meta-row">',
            '<span>' + movie.year + '</span>',
            '<span>' + movie.region + '</span>',
            '<span>' + movie.rating + '分</span>',
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function applySort(items) {
        var sorted = items.slice();
        if (sort === 'rating') {
            sorted.sort(function (a, b) {
                return b.rating - a.rating;
            });
        } else if (sort === 'latest') {
            sorted.sort(function (a, b) {
                return String(b.year).localeCompare(String(a.year)) || b.id - a.id;
            });
        } else {
            sorted.sort(function (a, b) {
                return b.views - a.views;
            });
        }
        return sorted;
    }

    function render() {
        var q = normalize(query);
        var items = movieCatalog.filter(function (movie) {
            if (!q) {
                return true;
            }
            var text = normalize(movie.title + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags + ' ' + movie.year + ' ' + movie.type);
            return text.indexOf(q) !== -1;
        });
        items = applySort(items).slice(0, 240);
        sortButtons.forEach(function (button) {
            button.classList.toggle('active', button.getAttribute('data-sort') === sort);
        });
        if (!items.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配影片，换个关键词试试。</div>';
            return;
        }
        results.innerHTML = items.map(card).join('');
    }

    sortButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            sort = button.getAttribute('data-sort') || 'popular';
            params.set('sort', sort);
            if (query) {
                params.set('q', query);
            }
            history.replaceState(null, '', './search.html?' + params.toString());
            render();
        });
    });

    render();
})();
