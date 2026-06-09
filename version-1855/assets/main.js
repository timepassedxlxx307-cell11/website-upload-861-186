(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.genre || '',
          card.dataset.category || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || card.dataset.year === selectedYear;
        var shouldShow = matchKeyword && matchYear;
        card.classList.toggle('hidden-card', !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });
      var empty = list.querySelector('[data-empty-state]');
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.dataset.emptyState = 'true';
        empty.textContent = '没有匹配的影片';
        list.appendChild(empty);
      }
      empty.style.display = visible ? 'none' : 'block';
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
  });

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var sort = (params.get('sort') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var title = document.querySelector('[data-search-title]');
    var subtitle = document.querySelector('[data-search-subtitle]');

    if (input) {
      input.value = query;
    }

    function cardTemplate(item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + item.link + '" data-movie-card>' +
        '<span class="poster-wrap">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span>' +
        '<span class="play-badge">▶</span>' +
        '<span class="duration-badge">120分钟</span>' +
        '<span class="rating-badge">' + escapeHtml(item.rating) + '</span>' +
        '</span>' +
        '<span class="card-info">' +
        '<strong>' + escapeHtml(item.title) + '</strong>' +
        '<em>' + escapeHtml(item.desc) + '</em>' +
        '<span class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span>' +
        '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var pool = window.SEARCH_INDEX.slice();
    if (sort === 'latest') {
      pool.sort(function (a, b) {
        return Number(b.year) - Number(a.year);
      });
      if (title) {
        title.textContent = '最新更新';
      }
      if (subtitle) {
        subtitle.textContent = '按年份排序的近期内容';
      }
    }

    if (query) {
      var lower = query.toLowerCase();
      pool = pool.filter(function (item) {
        return [item.title, item.desc, item.region, item.genre, item.type, item.year, item.bucket].concat(item.tags).join(' ').toLowerCase().indexOf(lower) !== -1;
      });
      if (title) {
        title.textContent = '搜索结果';
      }
      if (subtitle) {
        subtitle.textContent = pool.length ? '已找到相关影片' : '没有匹配的影片';
      }
    }

    if (query || sort) {
      searchResults.innerHTML = pool.slice(0, 120).map(cardTemplate).join('') || '<div class="empty-state">没有匹配的影片</div>';
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-overlay');
    var src = shell.getAttribute('data-hls');
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (prepared || !video || !src) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      prepare();
      var playPromise = video.play();
      shell.classList.add('playing');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        shell.classList.remove('playing');
      });
      video.addEventListener('ended', function () {
        shell.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
