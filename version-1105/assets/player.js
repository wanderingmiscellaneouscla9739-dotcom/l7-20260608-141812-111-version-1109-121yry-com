(function () {
  window.prepareMoviePlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var cover = document.getElementById(config.coverId);
    var playButton = document.getElementById(config.playButtonId);
    var cta = document.getElementById(config.ctaId);
    var loaded = false;
    var hls = null;

    function attemptPlay() {
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    function start() {
      if (!video) return;
      if (cover) cover.classList.add("is-hidden");
      if (loaded) {
        attemptPlay();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.url;
        video.addEventListener("loadedmetadata", attemptPlay, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, attemptPlay);
      } else {
        video.src = config.url;
        video.addEventListener("loadedmetadata", attemptPlay, { once: true });
        video.load();
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }
    if (cta) {
      cta.addEventListener("click", function (event) {
        event.preventDefault();
        video.scrollIntoView({ behavior: "smooth", block: "center" });
        start();
      });
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded) start();
      });
    }
    window.addEventListener("pagehide", function () {
      if (hls) hls.destroy();
    });
  };
}());
