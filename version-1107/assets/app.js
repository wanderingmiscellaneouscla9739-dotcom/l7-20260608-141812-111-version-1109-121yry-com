(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    if (!input) {
      return;
    }
    var clear = document.querySelector("[data-search-clear]");
    var empty = document.querySelector("[data-empty-message]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function filter() {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
        var visible = keyword === "" || haystack.indexOf(keyword) !== -1;
        card.classList.toggle("is-hidden", !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    input.addEventListener("input", filter);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        filter();
        input.focus();
      });
    }
  }

  window.initMoviePlayer = function (stream) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    if (!video || !overlay || !stream) {
      return;
    }
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function play() {
      prepare();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
  });
})();
