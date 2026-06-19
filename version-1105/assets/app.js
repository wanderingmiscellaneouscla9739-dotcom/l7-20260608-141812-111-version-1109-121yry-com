(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.getElementById("mobileNav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        var open = mobile.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var panel = document.querySelector("[data-filter-panel]");
    if (panel) {
      var keyword = panel.querySelector("[data-filter-keyword]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".no-results");
      var reset = panel.querySelector("[data-filter-reset]");
      var applyFilter = function () {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var r = region ? region.value : "";
        var t = type ? type.value : "";
        var y = year ? year.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-category") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && haystack.indexOf(q) === -1) ok = false;
          if (r && (card.getAttribute("data-region") || "").indexOf(r) === -1) ok = false;
          if (t && (card.getAttribute("data-type") || "").indexOf(t) === -1) ok = false;
          if (y && (card.getAttribute("data-year") || "") !== y) ok = false;
          card.style.display = ok ? "" : "none";
          if (ok) visible += 1;
        });
        if (empty) empty.style.display = visible ? "none" : "block";
      };
      [keyword, region, type, year].forEach(function (field) {
        if (field) field.addEventListener("input", applyFilter);
      });
      if (reset) {
        reset.addEventListener("click", function () {
          if (keyword) keyword.value = "";
          if (region) region.value = "";
          if (type) type.value = "";
          if (year) year.value = "";
          applyFilter();
        });
      }
      applyFilter();
    }

    var resultBox = document.querySelector("[data-search-results]");
    if (resultBox && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get("q") || "").trim();
      var input = document.querySelector("[data-search-input]");
      if (input) input.value = q;
      var render = function (items) {
        if (!items.length) {
          resultBox.innerHTML = '<div class="no-results" style="display:block">没有找到匹配的影视内容</div>';
          return;
        }
        resultBox.innerHTML = items.slice(0, 160).map(function (movie) {
          return '<article class="movie-card"><a class="movie-poster" href="' + movie.file + '"><img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '" loading="lazy"><span class="score">' + movie.rating + '</span></a><div class="movie-info"><div class="movie-meta"><span>' + movie.region + '</span><span>' + movie.year + '</span></div><h2><a href="' + movie.file + '">' + movie.title + '</a></h2><p>' + movie.oneLine + '</p><div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div></div></article>';
        }).join("");
      };
      var runSearch = function (value) {
        var needle = value.trim().toLowerCase();
        if (!needle) {
          render(window.SEARCH_MOVIES.slice(0, 60));
          return;
        }
        render(window.SEARCH_MOVIES.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase().indexOf(needle) !== -1;
        }));
      };
      if (input) {
        input.addEventListener("input", function () {
          runSearch(input.value);
        });
      }
      runSearch(q);
    }
  });
}());
