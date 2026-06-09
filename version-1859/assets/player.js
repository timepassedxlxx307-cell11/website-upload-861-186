import { H as Hls } from './hls.js';

export function setupPlayer(options) {
  const video = document.querySelector(options.videoSelector);
  const overlay = document.querySelector(options.overlaySelector);
  const source = options.source;
  if (!video || !overlay || !source) {
    return;
  }
  let loaded = false;
  let hls = null;
  let pending = false;

  const playVideo = () => {
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  };

  const attach = () => {
    if (loaded) {
      return;
    }
    loaded = true;
    video.controls = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', () => {
        if (pending) {
          playVideo();
        }
      }, { once: true });
      return;
    }
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (pending) {
          playVideo();
        }
      });
      return;
    }
    video.src = source;
  };

  const start = () => {
    pending = true;
    overlay.classList.add('is-hidden');
    attach();
    window.setTimeout(playVideo, 120);
  };

  overlay.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (!loaded || video.paused) {
      start();
    }
  });
  video.addEventListener('play', () => overlay.classList.add('is-hidden'));
  video.addEventListener('error', () => {
    overlay.classList.remove('is-hidden');
  });
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
