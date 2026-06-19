function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("play-cover");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !streamUrl) {
        return;
    }

    function tryPlay() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function loadAndPlay() {
        if (cover) {
            cover.classList.add("is-hidden");
        }

        if (loaded) {
            tryPlay();
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.load();
            tryPlay();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                tryPlay();
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = streamUrl;
                    video.load();
                }
            });
            return;
        }

        video.src = streamUrl;
        video.load();
        tryPlay();
    }

    if (cover) {
        cover.addEventListener("click", loadAndPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            loadAndPlay();
        }
    });
}
