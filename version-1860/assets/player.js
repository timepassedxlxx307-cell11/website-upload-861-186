import { H as Hls } from "./hls-vendor.js";

function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".play-overlay");
        var source = player.getAttribute("data-src");
        var loaded = false;
        var hls = null;

        function attachSource() {
            if (loaded || !video || !source) {
                return;
            }
            loaded = true;

            if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                var fallback = document.createElement("source");
                fallback.src = source;
                fallback.type = "application/x-mpegURL";
                video.appendChild(fallback);
            }
        }

        function playVideo() {
            attachSource();
            player.classList.add("is-playing");
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            if (!video.seeking && video.currentTime === 0) {
                player.classList.remove("is-playing");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPlayers);
} else {
    initPlayers();
}
