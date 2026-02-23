// ProveIT Preloader & Service Worker Registration
// Ensures all assets are loaded before presentation starts

(function() {
    'use strict';

    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');
    const percentText = document.getElementById('preloader-percent');
    const statusText = document.getElementById('preloader-status');

    // Track loading progress
    let totalAssets = 0;
    let loadedAssets = 0;

    // Update progress display
    function updateProgress(assetName) {
        loadedAssets++;
        const percent = Math.round((loadedAssets / totalAssets) * 100);

        if (progressBar) progressBar.style.width = percent + '%';
        if (percentText) percentText.textContent = percent + '%';
        if (statusText && assetName) {
            // Show just the filename, not full path
            const shortName = assetName.split('/').pop();
            statusText.textContent = `Loading: ${shortName}`;
        }
    }

    // Preload a single image (load + decode so it's pixel-ready before first paint)
    function preloadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // decode() ensures the image is rasterized before we resolve,
                // preventing staggered painting when hidden slides become visible
                if (img.decode) {
                    img.decode().catch(() => {}).finally(() => {
                        updateProgress(src);
                        resolve();
                    });
                } else {
                    updateProgress(src);
                    resolve();
                }
            };
            img.onerror = () => {
                console.warn('Failed to preload image:', src);
                updateProgress(src);
                resolve(); // Don't reject, continue loading
            };
            img.src = src;
        });
    }

    // Preload a single video
    function preloadVideo(src) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'auto';

            const onReady = () => {
                updateProgress(src);
                resolve();
            };

            video.oncanplaythrough = onReady;
            video.onerror = () => {
                console.warn('Failed to preload video:', src);
                updateProgress(src);
                resolve();
            };

            // Timeout fallback for videos that load slowly
            setTimeout(() => {
                if (video.readyState < 3) {
                    updateProgress(src);
                    resolve();
                }
            }, 10000); // 10 second timeout per video

            video.src = src;
            video.load();
        });
    }

    // Collect all assets from the page
    function collectAssets() {
        const images = new Set();
        const videos = new Set();

        // Get all img elements
        document.querySelectorAll('img').forEach(img => {
            if (img.src && !img.src.startsWith('data:')) {
                images.add(img.src);
            }
        });

        // Get all video source elements
        document.querySelectorAll('video source').forEach(source => {
            if (source.src) {
                videos.add(source.src);
            }
        });

        // Get all video elements with src attribute
        document.querySelectorAll('video[src]').forEach(video => {
            if (video.src) {
                videos.add(video.src);
            }
        });

        // Get background images from inline styles
        document.querySelectorAll('[style*="background"]').forEach(el => {
            const match = el.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match && match[1]) {
                images.add(match[1]);
            }
        });

        return {
            images: Array.from(images),
            videos: Array.from(videos)
        };
    }

    // Hide preloader and show presentation
    function hidePreloader() {
        if (statusText) statusText.textContent = 'Ready!';

        document.body.classList.remove('loading');

        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('hidden');
            }
        }, 300);
    }

    // Main preload function
    async function preloadAllAssets() {
        if (statusText) statusText.textContent = 'Scanning assets...';

        const assets = collectAssets();
        totalAssets = assets.images.length + assets.videos.length;

        if (totalAssets === 0) {
            hidePreloader();
            return;
        }

        if (statusText) statusText.textContent = `Loading ${totalAssets} assets...`;

        // Create promises for all assets
        const imagePromises = assets.images.map(src => preloadImage(src));
        const videoPromises = assets.videos.map(src => preloadVideo(src));

        // Wait for all assets to load
        await Promise.all([...imagePromises, ...videoPromises]);

        // All done
        hidePreloader();
    }

    // Register service worker for offline support
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('[Preloader] Service Worker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[Preloader] New version available');
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn('[Preloader] Service Worker registration failed:', error);
                });
        }
    }

    // Initialize on DOM ready
    function init() {
        document.body.classList.add('loading');

        // Register service worker first
        registerServiceWorker();

        // Start preloading assets
        preloadAllAssets();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
