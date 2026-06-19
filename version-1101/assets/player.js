(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player-video]"));

    players.forEach(function (video) {
      var source = video.querySelector("source");
      var sourceUrl = source ? source.getAttribute("src") : "";
      var button = document.querySelector('[data-play-button][aria-controls="' + video.id + '"]');
      var attached = false;
      var hls = null;

      function attachSource() {
        if (attached || !sourceUrl) {
          return;
        }

        var nativeHls = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");

        if (nativeHls) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }

        attached = true;
      }

      function startPlayback() {
        attachSource();

        if (button) {
          button.classList.add("is-hidden");
          button.setAttribute("aria-hidden", "true");
        }

        video.setAttribute("controls", "controls");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.setAttribute("controls", "controls");
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
