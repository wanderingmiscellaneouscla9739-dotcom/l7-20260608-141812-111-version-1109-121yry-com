(function () {
  const hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
  let hlsScriptPromise = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    const inputs = document.querySelectorAll('[data-filter-input]');
    inputs.forEach(function (input) {
      const list = document.querySelector('[data-filter-list]');
      if (!list) {
        return;
      }
      const items = Array.from(list.querySelectorAll('[data-filter-item]'));
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';
      if (input.hasAttribute('data-query-sync') && query) {
        input.value = query;
      }
      function apply() {
        const words = normalize(input.value).split(/\s+/).filter(Boolean);
        items.forEach(function (item) {
          const haystack = normalize([
            item.dataset.title,
            item.dataset.tags,
            item.dataset.year,
            item.dataset.region,
            item.textContent
          ].join(' '));
          const match = words.length === 0 || words.some(function (word) {
            return haystack.indexOf(word) !== -1;
          });
          item.classList.toggle('is-hidden', !match);
        });
      }
      input.addEventListener('input', apply);
      apply();
    });
  }

  function initCarousel() {
    const carousels = document.querySelectorAll('[data-carousel]');
    carousels.forEach(function (carousel) {
      const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
      const prev = carousel.querySelector('[data-carousel-prev]');
      const next = carousel.querySelector('[data-carousel-next]');
      if (!slides.length) {
        return;
      }
      let index = 0;
      let timer = null;
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
      function schedule() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          schedule();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          schedule();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.dataset.carouselDot || 0));
          schedule();
        });
      });
      schedule();
    });
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsScriptPromise) {
      hlsScriptPromise = new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = hlsScriptUrl;
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsScriptPromise;
  }

  function attachSource(video, src) {
    if (!src || video.dataset.hlsReady === 'true') {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.hlsReady = 'true';
      return Promise.resolve();
    }
    return loadHlsScript().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        video.dataset.hlsReady = 'true';
      } else {
        video.src = src;
        video.dataset.hlsReady = 'true';
      }
    }).catch(function () {
      video.src = src;
      video.dataset.hlsReady = 'true';
    });
  }

  function playVideo(video) {
    return attachSource(video, video.dataset.stream).then(function () {
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    });
  }

  function initPlayers() {
    const players = document.querySelectorAll('[data-player]');
    players.forEach(function (box) {
      const video = box.querySelector('video');
      const button = box.querySelector('.play-overlay');
      if (!video) {
        return;
      }
      attachSource(video, video.dataset.stream);
      function update() {
        box.classList.toggle('is-playing', !video.paused && !video.ended);
      }
      if (button) {
        button.addEventListener('click', function () {
          playVideo(video);
        });
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
      ['play', 'pause', 'ended', 'error'].forEach(function (eventName) {
        video.addEventListener(eventName, update);
      });
      update();
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initCarousel();
    initPlayers();
  });
})();
