(function () {
  function startPlayer(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var src = video ? video.getAttribute("data-play") : "";
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready || !video || !src) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        return;
      }

      video.src = src;
    }

    function play() {
      prepare();
      if (!video) {
        return;
      }

      shell.classList.add("is-playing");
      if (overlay) {
        overlay.hidden = true;
      }

      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
          shell.classList.remove("is-playing");
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    shell.addEventListener("click", function (event) {
      if (event.target === shell || event.target === video) {
        play();
      }
    });

    shell.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        play();
      }
    });

    if (video) {
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });

      video.addEventListener("emptied", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    }
  }

  document.querySelectorAll(".player-shell").forEach(startPlayer);
})();
