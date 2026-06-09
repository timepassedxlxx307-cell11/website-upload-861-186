(function () {
  function setupPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    var source = box.getAttribute('data-source');
    var ready = false;
    var hls = null;

    function bindSource() {
      if (ready || !video || !source) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      bindSource();
      hideButton();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    bindSource();

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    video.addEventListener('play', hideButton);
    video.addEventListener('pause', function () {
      if (button && !video.ended) {
        button.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });

    box.addEventListener('click', function (event) {
      if (event.target === video && video.paused) {
        startPlayback();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
