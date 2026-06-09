(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video[data-stream]');
      var button = shell.querySelector('[data-play-button]');
      var source = video ? video.getAttribute('data-stream') : '';
      var hls = null;

      function attach() {
        if (!video || !source || video.getAttribute('data-ready') === 'true') {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.setAttribute('data-ready', 'true');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.setAttribute('data-ready', 'true');
          return;
        }

        video.src = source;
        video.setAttribute('data-ready', 'true');
      }

      function play() {
        attach();
        if (!video) {
          return;
        }
        shell.classList.add('is-playing');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      attach();

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          play();
        });
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  });
})();
