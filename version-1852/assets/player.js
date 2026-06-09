(function () {
  function startPlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var source = video && video.querySelector('source');
    var src = source ? source.getAttribute('src') : '';

    if (!video || !src) {
      return;
    }

    if (!wrapper.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        wrapper.hlsInstance = hls;
      } else {
        video.src = src;
      }
      wrapper.dataset.ready = 'true';
    }

    wrapper.classList.add('is-playing');
    video.controls = true;
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {});
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (wrapper) {
    var button = wrapper.querySelector('[data-play]');
    var video = wrapper.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(wrapper);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayer(wrapper);
        }
      });
    }
  });
}());
