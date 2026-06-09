(function () {
  var items = window.SEARCH_INDEX || [];
  var results = document.getElementById('search-results');
  var input = document.getElementById('search-page-input');
  var categoryFilter = document.getElementById('category-filter');
  var typeFilter = document.getElementById('type-filter');
  var yearFilter = document.getElementById('year-filter');
  var form = document.getElementById('search-page-form');

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="movie-poster" href="' + escapeHtml(item.url) + '">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '海报" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<a class="movie-card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
      '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>' +
      '<p class="movie-desc">' + escapeHtml(item.desc) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function render() {
    if (!results) {
      return;
    }

    var query = normalize(input ? input.value : '');
    var category = normalize(categoryFilter ? categoryFilter.value : '');
    var type = normalize(typeFilter ? typeFilter.value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');

    var filtered = items.filter(function (item) {
      var text = normalize(item.text);
      var queryMatch = query === '' || text.indexOf(query) !== -1;
      var categoryMatch = category === '' || normalize(item.category) === category;
      var typeMatch = type === '' || normalize(item.type) === type;
      var yearMatch = year === '' || normalize(item.year).indexOf(year) !== -1;
      return queryMatch && categoryMatch && typeMatch && yearMatch;
    }).slice(0, 120);

    if (!filtered.length) {
      results.innerHTML = '<div class="empty-result">没有找到匹配影片，请调整关键词或筛选条件。</div>';
      return;
    }

    results.innerHTML = filtered.map(card).join('');
  }

  var initialQuery = params().get('q') || '';
  if (input) {
    input.value = initialQuery;
    input.addEventListener('input', render);
  }
  [categoryFilter, typeFilter, yearFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', render);
      control.addEventListener('change', render);
    }
  });
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
      if (history.replaceState) {
        var query = input && input.value.trim() ? '?q=' + encodeURIComponent(input.value.trim()) : 'search.html';
        history.replaceState(null, '', query);
      }
    });
  }
  render();
}());
