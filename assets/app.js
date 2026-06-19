(function () {
  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function bindMenus() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function refreshFilter(scope) {
    var input = scope.querySelector('[data-card-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var count = scope.querySelector('[data-result-count]');
    var query = normalize(input ? input.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var type = normalize(typeSelect ? typeSelect.value : '');
    var root = scope.parentElement || document;
    var cards = toArray(root.querySelectorAll('[data-movie-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-keywords'),
        card.textContent
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardType = normalize(card.getAttribute('data-type'));
      var matched = (!query || haystack.indexOf(query) !== -1) && (!year || cardYear === year) && (!type || cardType.indexOf(type) !== -1);
      card.classList.toggle('is-hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });
    if (count) {
      count.textContent = '显示 ' + visible + ' 部';
    }
  }

  function bindFilters() {
    toArray(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      toArray(scope.querySelectorAll('input, select')).forEach(function (control) {
        control.addEventListener('input', function () {
          refreshFilter(scope);
        });
        control.addEventListener('change', function () {
          refreshFilter(scope);
        });
      });
      refreshFilter(scope);
    });
  }

  function initHero() {
    var slides = toArray(document.querySelectorAll('[data-hero-slide]'));
    var dots = toArray(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initMoviePlayer(options) {
    if (!options) {
      return;
    }
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var mediaUrl = options.mediaUrl;
    if (!video || !button || !mediaUrl) {
      return;
    }
    var prepared = false;
    var hls = null;
    function loadMedia() {
      if (prepared) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }
      prepared = true;
    }
    function start() {
      loadMedia();
      button.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!prepared) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  function applyQueryFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (!query) {
      return;
    }
    var input = document.querySelector('[data-card-search]');
    if (input) {
      input.value = query;
      var scope = input.closest('[data-filter-scope]');
      if (scope) {
        refreshFilter(scope);
      }
    }
  }

  window.MovieSite = {
    initMoviePlayer: initMoviePlayer,
    initHero: initHero,
    applyQueryFromUrl: applyQueryFromUrl
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMenus();
    bindFilters();
    initHero();
  });
}());
