(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    filterPanels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-panel");
      var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
      var input = panel.querySelector("[data-search-input]");
      var region = panel.querySelector("[data-region-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var year = panel.querySelector("[data-year-filter]");
      var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

      function clean(value) {
        return String(value || "").trim().toLowerCase();
      }

      function apply() {
        if (!scope) {
          return;
        }

        var keyword = clean(input ? input.value : "");
        var regionValue = clean(region ? region.value : "");
        var typeValue = clean(type ? type.value : "");
        var yearValue = clean(year ? year.value : "");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var visible = 0;

        cards.forEach(function (card) {
          var text = clean([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-keywords")
          ].join(" "));
          var cardRegion = clean(card.getAttribute("data-region"));
          var cardType = clean(card.getAttribute("data-type"));
          var cardYear = clean(card.getAttribute("data-year"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }

          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [input, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  });
})();
