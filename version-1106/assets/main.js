document.addEventListener("DOMContentLoaded", function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobileMenu = document.querySelector(".mobile-menu");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
            document.body.classList.toggle("nav-open", mobileMenu.classList.contains("is-open"));
        });
    }

    var carousel = document.querySelector("[data-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-arrow.prev");
        var next = carousel.querySelector(".hero-arrow.next");
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    var filterPanel = document.querySelector(".filter-panel");
    if (filterPanel) {
        var keyword = filterPanel.querySelector("[data-filter-keyword]");
        var typeSelect = filterPanel.querySelector("[data-filter-type]");
        var regionSelect = filterPanel.querySelector("[data-filter-region]");
        var yearSelect = filterPanel.querySelector("[data-filter-year]");
        var clearButton = filterPanel.querySelector("[data-clear-filters]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        if (keyword && q) {
            keyword.value = q;
        }

        var match = function (card) {
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();
            var kw = keyword ? keyword.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";

            if (kw && haystack.indexOf(kw) === -1) {
                return false;
            }
            if (type && card.getAttribute("data-type") !== type) {
                return false;
            }
            if (region && card.getAttribute("data-region") !== region) {
                return false;
            }
            if (year && card.getAttribute("data-year") !== year) {
                return false;
            }
            return true;
        };

        var runFilter = function () {
            cards.forEach(function (card) {
                card.classList.toggle("is-hidden-card", !match(card));
            });
        };

        [keyword, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", runFilter);
                control.addEventListener("change", runFilter);
            }
        });

        if (clearButton) {
            clearButton.addEventListener("click", function () {
                if (keyword) {
                    keyword.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                runFilter();
            });
        }

        runFilter();
    }

    var playerBox = document.querySelector("[data-player]");
    if (playerBox) {
        var video = playerBox.querySelector("video");
        var cover = playerBox.querySelector(".player-cover");
        var stream = playerBox.getAttribute("data-stream");
        var ready = false;
        var hls = null;

        var prepare = function () {
            if (!video || !stream || ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            ready = true;
        };

        var start = function () {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            if (video) {
                video.setAttribute("controls", "controls");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }
        };

        if (cover) {
            cover.addEventListener("click", start);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!ready) {
                    start();
                }
            });
        }
    }
});
