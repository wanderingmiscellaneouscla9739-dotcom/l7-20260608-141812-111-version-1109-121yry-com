(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', nav.classList.contains('is-open'));
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function getSearchText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.getAttribute('data-type')
    ].join(' ').toLowerCase();
  }

  function setupLocalSearch() {
    var forms = selectAll('[data-local-search-form]');
    var cards = selectAll('[data-search-card]');
    if (!forms.length || !cards.length) {
      return;
    }
    var input = forms[0].querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var activeFilter = 'all';

    function apply() {
      var value = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = getSearchText(card);
        var matchText = !value || text.indexOf(value) !== -1;
        var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(matchText && matchFilter));
      });
    }

    if (input) {
      input.value = initial;
      input.addEventListener('input', apply);
    }

    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    });

    selectAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        selectAll('[data-filter]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    });

    apply();
  }

  function setupSearchForms() {
    selectAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var url = 'library.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function setupPlayer() {
    var video = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var card = document.querySelector('[data-player-card]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var ready = false;
    var hlsInstance = null;

    function attach() {
      if (ready || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (card) {
            card.classList.add('is-playing');
          }
        }).catch(function () {
          if (card) {
            card.classList.remove('is-playing');
          }
        });
      } else if (card) {
        card.classList.add('is-playing');
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (card) {
        card.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (card && video.currentTime === 0) {
        card.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupLocalSearch();
    setupPlayer();
  });
}());
