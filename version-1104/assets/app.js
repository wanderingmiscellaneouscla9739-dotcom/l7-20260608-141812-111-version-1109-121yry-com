(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var open = toggle.getAttribute("aria-expanded") === "true";
                toggle.setAttribute("aria-expanded", String(!open));
                panel.hidden = open;
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function startTimer() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    show(Number(dot.getAttribute("data-slide")) || 0);
                    startTimer();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    startTimer();
                });
            }

            startTimer();
        }

        var queryInput = document.querySelector(".catalog-search");
        var filters = Array.prototype.slice.call(document.querySelectorAll(".catalog-filter"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");

        if (queryInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query) {
                queryInput.value = query;
            }

            filters.forEach(function (select) {
                var key = select.getAttribute("data-filter");
                var value = params.get(key);
                if (value) {
                    select.value = value;
                }
            });

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function applyFilters() {
                var text = normalize(queryInput.value);
                var activeFilters = {};
                filters.forEach(function (select) {
                    var key = select.getAttribute("data-filter");
                    activeFilters[key] = normalize(select.value);
                });
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.textContent
                    ].join(" "));
                    var matchedText = !text || haystack.indexOf(text) !== -1;
                    var matchedFilters = Object.keys(activeFilters).every(function (key) {
                        var value = activeFilters[key];
                        return !value || normalize(card.getAttribute("data-" + key)).indexOf(value) !== -1;
                    });
                    var matched = matchedText && matchedFilters;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            queryInput.addEventListener("input", applyFilters);
            filters.forEach(function (select) {
                select.addEventListener("change", applyFilters);
            });
            applyFilters();
        }
    });
}());
