(function () {
    var video = document.getElementById('movieVideo');
    var button = document.getElementById('playOverlay');
    var config = typeof playerConfig === 'object' && playerConfig ? playerConfig : {};
    var stream = config.src || '';
    var hls = null;
    var ready = false;

    if (!video || !button || !stream) {
        return;
    }

    function attachStream() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            ready = true;
            return;
        }

        video.src = stream;
        ready = true;
    }

    function startPlay() {
        attachStream();
        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                button.classList.remove('is-hidden');
            });
        }
    }

    button.addEventListener('click', startPlay);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlay();
        }
    });

    video.addEventListener('play', function () {
        button.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
        if (!video.ended) {
            button.classList.remove('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        button.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
})();
