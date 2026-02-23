// ProveIT Presentation JavaScript
// =================================

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const navDots = document.querySelectorAll('.nav-dot');
    let currentSlide = 0;
    let isAnimating = false;
    const animationDuration = 700; // matches CSS transition

    // Initialize
    function init() {
        // Check URL hash for starting slide (1-indexed in URL, 0-indexed internally)
        let startSlide = 0;
        const hash = window.location.hash;
        if (hash) {
            const slideNum = parseInt(hash.substring(1), 10);
            if (!isNaN(slideNum) && slideNum >= 1 && slideNum <= slides.length) {
                startSlide = slideNum - 1;
            }
        }

        // Function to show the starting slide
        function showStartSlide() {
            // Directly set the slide without animation for initial load
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev', 'next');
                if (i === startSlide) {
                    slide.classList.add('active');
                } else if (i < startSlide) {
                    slide.classList.add('prev');
                } else {
                    slide.classList.add('next');
                }
            });
            navDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === startSlide);
            });
            currentSlide = startSlide;
            history.replaceState(null, '', `#${startSlide + 1}`);

            // Trigger benefit items animation if starting on slide 9
            if (getSlideId(startSlide) === 'slide-9') {
                document.querySelectorAll('.slide-benefits .benefit-item').forEach(item => item.classList.add('visible'));
            }

            // Auto-play Simpsons video if starting on slide 10
            if (getSlideId(startSlide) === 'slide-10' && simpsonsVideo) {
                simpsonsVideo.pause();
                simpsonsVideo.currentTime = 0;
                simpsonsVideo.muted = true;
                const playWhenReady = () => {
                    setTimeout(() => {
                        if (isCurrentSlide('slide-10') && !simpsonsPlaying) {
                            simpsonsVideo.currentTime = 0;
                            simpsonsVideo.play();
                            simpsonsPlaying = true;
                        }
                    }, 1000);
                };
                if (simpsonsVideo.readyState >= 3) {
                    playWhenReady();
                } else {
                    simpsonsVideo.addEventListener('canplay', playWhenReady, { once: true });
                }
            }
        }

        // Wait for first slide background video to load
        const firstSlide = document.getElementById('slide-1');
        const firstVideo = firstSlide ? firstSlide.querySelector('.video-bg') : null;

        // Hide content until video is ready
        const firstContent = firstSlide ? firstSlide.querySelector('.slide-content') : null;
        if (firstContent) {
            firstContent.style.opacity = '0';
        }

        if (firstVideo) {
            // Check if video is already loaded
            if (firstVideo.readyState >= 3) {
                showStartSlide();
                if (firstContent) {
                    firstContent.style.transition = 'opacity 0.5s ease-in';
                    firstContent.style.opacity = '1';
                }
            } else {
                // Wait for video to be ready
                firstVideo.addEventListener('canplay', function onCanPlay() {
                    firstVideo.removeEventListener('canplay', onCanPlay);
                    showStartSlide();
                    if (firstContent) {
                        firstContent.style.transition = 'opacity 0.5s ease-in';
                        firstContent.style.opacity = '1';
                    }
                });
            }
        } else {
            showStartSlide();
        }

        setupEventListeners();
    }

    // Mister Rogers theme audio for slide 13
    const misterRogersAudio = new Audio('assets/video/misterRogersThemeAudio.mp3');
    misterRogersAudio.loop = false;

    // i3X transition overlay
    const i3xTransition = document.getElementById('i3x-transition');
    const transitionDuration = 2000; // matches CSS animation
    const slideChangeAt = 1300;

    // i3X circle animation keyframes — used by Web Animations API
    // Using JS-driven animation instead of CSS @keyframes for reliable
    // first-run performance, especially in Firefox.
    const i3xKeyframes = [
        { transform: 'translate(calc(-50vw - 40px), calc(50vh + 40px))', width: '80px', height: '80px', opacity: 1, offset: 0 },
        { transform: 'translate(-50%, -50%)', width: '80px', height: '80px', opacity: 1, offset: 0.35 },
        { transform: 'translate(-50%, -50%)', width: '100px', height: '100px', opacity: 1, offset: 0.45 },
        { transform: 'translate(-50%, -50%)', width: '200vmax', height: '200vmax', opacity: 1, offset: 0.65 },
        { transform: 'translate(-50%, -50%)', width: '300vmax', height: '300vmax', opacity: 0, offset: 0.85 },
        { transform: 'translate(-50%, -50%)', width: '300vmax', height: '300vmax', opacity: 0, offset: 1 },
    ];
    const i3xTiming = { duration: 2000, easing: 'ease-in-out', fill: 'forwards' };

    // Config loaded from js/slide-config.js
    const transitionConfig = SlideConfig.transitions;
    const slideGroups = SlideConfig.groups;

    // ===========================================
    // SLIDE ID HELPERS - Use these instead of hardcoded indices
    // ===========================================
    // Get slide ID for current slide
    function getCurrentSlideId() {
        return slides[currentSlide]?.id || null;
    }

    // Get slide ID for a given index
    function getSlideId(index) {
        return slides[index]?.id || null;
    }

    // Check if current slide matches an ID
    function isCurrentSlide(slideId) {
        return getCurrentSlideId() === slideId;
    }

    // Check if target index matches an ID
    function isTargetSlide(index, slideId) {
        return getSlideId(index) === slideId;
    }

    // Get slide element by ID (safe wrapper)
    function getSlide(slideId) {
        return document.getElementById(slideId);
    }

    // Transition handlers map
    const transitionHandlers = {
        logoShrink: (index) => playLogoShrinkTransition(index),
        logoExpand: (index) => playLogoExpandTransition(index),
        alvaro: (index) => playAlvaroTransition(index),
        cube: (index) => playCubeTransition(index),
        misterRogers: (index) => {
            misterRogersAudio.currentTime = 0;
            misterRogersAudio.play();
            playMisterRogersTransition(index);
        },
        wipe: (index) => playWipeTransition(index),
        crossfade: (index) => playBackgroundCrossfade(index),
        dissolve: (index) => playDissolveTransition(index),
        hartzet: (index) => playHartzetTransition(index),
        engageBox: (index) => playEngageBoxTransition(index),
        pageTurn: (index) => playPageTurnTransition(index),
    };

    // Look up transition for a slide pair
    function getTransition(fromId, toId) {
        // Check exact match first
        const exactKey = `${fromId}→${toId}`;
        console.log(`[getTransition] Checking exact key: "${exactKey}", found: ${transitionConfig[exactKey] || 'none'}`);
        if (transitionConfig[exactKey]) {
            console.log(`[getTransition] Using exact match: ${transitionConfig[exactKey]}`);
            return transitionConfig[exactKey];
        }

        // Check bidirectional matches
        const bidiKey1 = `${fromId}↔${toId}`;
        const bidiKey2 = `${toId}↔${fromId}`;
        if (transitionConfig[bidiKey1]) return transitionConfig[bidiKey1];
        if (transitionConfig[bidiKey2]) return transitionConfig[bidiKey2];

        // Check group-based transitions
        const fromInEngage = slideGroups.engage.includes(fromId);
        const toInEngage = slideGroups.engage.includes(toId);
        if (fromInEngage && toInEngage) {
            return 'engageBox';
        }

        // Seuss page turn (forward only)
        const fromSeussIdx = slideGroups.seuss.indexOf(fromId);
        const toSeussIdx = slideGroups.seuss.indexOf(toId);
        if (fromSeussIdx !== -1 && toSeussIdx === fromSeussIdx + 1) {
            console.log(`[getTransition] Using Seuss group pageTurn (fromIdx=${fromSeussIdx}, toIdx=${toSeussIdx})`);
            return 'pageTurn';
        }

        return null; // No custom transition, use default
    }

    // Show specific slide
    function showSlide(index) {
        console.log(`[showSlide] Called with index ${index}, currentSlide=${currentSlide}, isAnimating=${isAnimating}`);
        if (isAnimating) {
            console.log('[showSlide] BLOCKED - isAnimating is true');
            return;
        }
        if (index < 0 || index >= slides.length) return;
        if (index === currentSlide) return;

        isAnimating = true;
        console.log('[showSlide] Set isAnimating = true');

        const fromId = slides[currentSlide].id;
        const toId = slides[index].id;
        const transition = getTransition(fromId, toId);
        console.log(`[showSlide] Transition from ${fromId} to ${toId}: ${transition || 'default'}`);

        if (transition && transitionHandlers[transition]) {
            console.log(`[showSlide] Calling ${transition} handler`);
            transitionHandlers[transition](index);
        } else {
            console.log('[showSlide] Using default performSlideChange');
            performSlideChange(index);
        }
    }

    // Engage content box slide transition
    function playEngageBoxTransition(index) {
        const goingForward = index > currentSlide;
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];
        const outgoingBox = outgoingSlide.querySelector('.engage-content-box');
        const incomingBox = incomingSlide.querySelector('.engage-content-box');

        if (!outgoingBox || !incomingBox) {
            performSlideChange(index);
            return;
        }

        // Set up incoming box starting position
        incomingBox.style.transition = 'none';
        incomingBox.style.transform = goingForward ? 'translate3d(0, 120%, 0)' : 'translate3d(0, -120%, 0)';

        // Show incoming slide immediately (no opacity transition)
        incomingSlide.style.opacity = '1';
        incomingSlide.style.visibility = 'visible';

        // Force reflow
        incomingBox.offsetHeight;

        // Animate outgoing box out
        outgoingBox.style.transition = 'transform 0.45s cubic-bezier(0, 0, 0.20, 1)';
        outgoingBox.style.transform = goingForward ? 'translate3d(0, -120%, 0)' : 'translate3d(0, 120%, 0)';

        // Animate incoming box in
        incomingBox.style.transition = 'transform 0.45s cubic-bezier(0, 0, 0.20, 1)';
        incomingBox.style.transform = 'translate3d(0, 0, 0)';

        setTimeout(() => {
            // Complete the slide change
            performSlideChange(index);

            // Reset transforms
            outgoingBox.style.transition = 'none';
            outgoingBox.style.transform = '';
            incomingBox.style.transform = '';

            // Clean up inline styles
            setTimeout(() => {
                outgoingBox.style.transition = '';
                incomingBox.style.transition = '';
                outgoingSlide.style.opacity = '';
                outgoingSlide.style.visibility = '';
                incomingSlide.style.opacity = '';
                incomingSlide.style.visibility = '';
            }, 50);
        }, 470);
    }

    // Alberto Hartzet one-page navigation slide-in transition
    function playHartzetTransition(index) {
        const goingForward = index > currentSlide;
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];
        const easing = 'cubic-bezier(0.54, 0.35, 0.29, 0.99)';
        const contentEasing = 'cubic-bezier(.25, 1, .5, 1.25)';

        // Position incoming slide off-screen
        incomingSlide.style.transition = 'none';
        incomingSlide.style.zIndex = '10';
        incomingSlide.style.transform = goingForward ? 'translateX(100%)' : 'translateX(-100%)';
        incomingSlide.style.opacity = '1';
        incomingSlide.style.visibility = 'visible';
        incomingSlide.classList.add('active');

        // Darken outgoing slide background
        outgoingSlide.style.transition = `background-color 0.8s ${easing}`;

        // Hide content on incoming slide for bouncy entrance
        const incomingContent = incomingSlide.querySelector('.slide-content');
        if (incomingContent) {
            incomingContent.style.transition = 'none';
            incomingContent.style.opacity = '0';
            incomingContent.style.transform = goingForward ? 'translateX(50px)' : 'translateX(-50px)';
        }

        // Force reflow
        incomingSlide.offsetHeight;

        // Slide incoming in
        incomingSlide.style.transition = `transform 0.8s ${easing}`;
        incomingSlide.style.transform = 'translateX(0)';

        // Animate content in with delay and bounce
        if (incomingContent) {
            setTimeout(() => {
                incomingContent.style.transition = `opacity 0.5s ${contentEasing}, transform 0.5s ${contentEasing}`;
                incomingContent.style.opacity = '1';
                incomingContent.style.transform = 'translateX(0)';
            }, 400);
        }

        setTimeout(() => {
            performSlideChange(index);

            // Clean up all inline styles
            incomingSlide.style.transition = '';
            incomingSlide.style.zIndex = '';
            incomingSlide.style.transform = '';
            incomingSlide.style.opacity = '';
            incomingSlide.style.visibility = '';
            outgoingSlide.style.transition = '';
            outgoingSlide.style.backgroundColor = '';
            if (incomingContent) {
                incomingContent.style.transition = '';
                incomingContent.style.opacity = '';
                incomingContent.style.transform = '';
            }
        }, 1000);
    }

    // Álvaro futuristic enclosing panels transition
    function playAlvaroTransition(index) {
        const container = document.querySelector('.slides-container');

        // Create overlay with two diagonal panels
        const overlay = document.createElement('div');
        overlay.className = 'alvaro-transition-overlay';
        overlay.innerHTML = '<div class="alvaro-panel alvaro-panel-top"></div>' +
                           '<div class="alvaro-panel alvaro-panel-bottom"></div>';
        container.appendChild(overlay);

        // Force reflow
        overlay.offsetHeight;

        // Phase 1: Panels close inward (enclose the screen)
        overlay.classList.add('closing');

        // Phase 2: At full coverage, swap slides
        setTimeout(() => {
            performSlideChange(index);
        }, 600);

        // Phase 3: Panels open outward to reveal new slide
        setTimeout(() => {
            overlay.classList.remove('closing');
            overlay.classList.add('opening');
        }, 750);

        // Phase 4: Clean up
        setTimeout(() => {
            overlay.remove();
        }, 1500);
    }

    // Play i3X transition animation (generic - works with any slide pair)
    function playI3XTransition(index, callback, customSlideChangeAt) {
        const changeAt = customSlideChangeAt || slideChangeAt;
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];

        if (i3xTransition) {
            // Disable default transitions
            if (outgoingSlide) outgoingSlide.style.transition = 'none';
            if (incomingSlide) incomingSlide.style.transition = 'none';

            i3xTransition.classList.add('active');

            // Transition slide at specified time
            setTimeout(() => {
                if (callback) callback();
            }, changeAt);

            // Clean up overlay after full animation
            setTimeout(() => {
                i3xTransition.classList.remove('active');
                // Reset the animation
                const logo = i3xTransition.querySelector('.transition-logo');
                if (logo) {
                    logo.style.animation = 'none';
                    logo.offsetHeight; // Trigger reflow
                    logo.style.animation = '';
                }
                // Re-enable transitions
                if (outgoingSlide) outgoingSlide.style.transition = '';
                if (incomingSlide) incomingSlide.style.transition = '';
            }, transitionDuration);
        } else {
            if (callback) callback();
        }
    }

    // Play Mr. Rogers transition — uses Web Animations API for reliable cross-browser timing
    function playMisterRogersTransition(index) {
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];
        const logo = i3xTransition ? i3xTransition.querySelector('.transition-logo') : null;

        if (!i3xTransition || !logo) {
            performSlideChange(index);
            return;
        }

        // Disable CSS transitions on slides so class changes are instant
        outgoingSlide.style.transition = 'none';
        incomingSlide.style.transition = 'none';

        // Prepare incoming slide: visible but hidden behind outgoing
        incomingSlide.style.opacity = '0';
        incomingSlide.style.visibility = 'visible';
        incomingSlide.style.zIndex = '1';
        outgoingSlide.style.zIndex = '2';

        // Show the overlay immediately — no CSS class transition delay
        i3xTransition.style.opacity = '1';
        i3xTransition.style.visibility = 'visible';

        // Start circle animation via Web Animations API (not CSS keyframes)
        // This starts rendering immediately — no Firefox CSS startup lag
        const anim = logo.animate(i3xKeyframes, i3xTiming);

        // Start crossfade at 1.3s (circle fully covers screen at 65% = 1.3s)
        setTimeout(() => {
            outgoingSlide.style.transition = 'opacity 0.6s ease-out';
            incomingSlide.style.transition = 'opacity 0.6s ease-in';
            outgoingSlide.style.opacity = '0';
            incomingSlide.style.opacity = '1';
        }, 1300);

        // Clean up when animation finishes — guaranteed by the API
        anim.onfinish = () => {
            setTimeout(() => {
                // Clean up all inline styles
                outgoingSlide.style.transition = '';
                outgoingSlide.style.opacity = '';
                outgoingSlide.style.zIndex = '';
                incomingSlide.style.transition = '';
                incomingSlide.style.opacity = '';
                incomingSlide.style.visibility = '';
                incomingSlide.style.zIndex = '';

                // Reset overlay
                i3xTransition.style.opacity = '';
                i3xTransition.style.visibility = '';

                performSlideChange(index);
            }, 200);
        };
    }

    // Play circle wipe transition (generic - works with any slide pair)
    const circleWipeOverlay = document.getElementById('circle-wipe-transition');
    const circleWipeDuration = 1800;

    function playCircleWipeTransition(index) {
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];
        const wipeMask = document.getElementById('wipe-mask');
        const slidesContainer = document.querySelector('.slides-container');

        if (circleWipeOverlay && outgoingSlide && incomingSlide && slidesContainer) {
            // Disable default transitions
            outgoingSlide.style.transition = 'none';
            incomingSlide.style.transition = 'none';

            // Get the actual slides container dimensions (respects 16:9 aspect ratio)
            const containerRect = slidesContainer.getBoundingClientRect();

            // Position the overlay to match the slides container (16:9 aspect ratio)
            circleWipeOverlay.style.top = containerRect.top + 'px';
            circleWipeOverlay.style.left = containerRect.left + 'px';
            circleWipeOverlay.style.width = containerRect.width + 'px';
            circleWipeOverlay.style.height = containerRect.height + 'px';

            // Clone incoming slide content into the wipe mask
            wipeMask.innerHTML = '';
            const incomingClone = incomingSlide.cloneNode(true);
            incomingClone.style.position = 'absolute';
            incomingClone.style.top = '0';
            incomingClone.style.left = '0';
            // Use fixed dimensions so content doesn't shift as mask expands
            incomingClone.style.width = containerRect.width + 'px';
            incomingClone.style.height = containerRect.height + 'px';
            incomingClone.style.opacity = '1';
            incomingClone.style.visibility = 'visible';
            incomingClone.classList.add('active');
            // Disable all animations on the clone so content doesn't move during transition
            incomingClone.style.animation = 'none';
            const allAnimatedElements = incomingClone.querySelectorAll('*');
            allAnimatedElements.forEach(el => {
                el.style.animation = 'none';
            });
            wipeMask.appendChild(incomingClone);

            // Activate the overlay
            circleWipeOverlay.classList.add('active');

            // Change slide at the end
            setTimeout(() => {
                performSlideChange(index);

                // Clean up
                circleWipeOverlay.classList.remove('active');
                wipeMask.innerHTML = '';

                // Reset overlay position to defaults
                circleWipeOverlay.style.top = '';
                circleWipeOverlay.style.left = '';
                circleWipeOverlay.style.width = '';
                circleWipeOverlay.style.height = '';

                // Reset animations
                const wipeCircle = circleWipeOverlay.querySelector('.wipe-circle');
                if (wipeCircle) {
                    wipeCircle.style.animation = 'none';
                    wipeCircle.offsetHeight;
                    wipeCircle.style.animation = '';
                }
                const shimmerLine = circleWipeOverlay.querySelector('.wipe-shimmer-line');
                if (shimmerLine) {
                    shimmerLine.style.animation = 'none';
                    shimmerLine.offsetHeight;
                    shimmerLine.style.animation = '';
                }
                wipeMask.style.animation = 'none';
                wipeMask.offsetHeight;
                wipeMask.style.animation = '';

                // Re-enable transitions
                outgoingSlide.style.transition = '';
                incomingSlide.style.transition = '';
            }, circleWipeDuration);
        } else {
            performSlideChange(index);
        }
    }

    // Play dissolve transition (generic - uses current slide and target index)
    function playDissolveTransition(index) {
        const slideFrom = slides[currentSlide];
        const slideTo = slides[index];

        // Show slideTo behind slideFrom
        slideTo.style.transition = 'none';
        slideTo.style.opacity = '1';
        slideTo.style.visibility = 'visible';
        slideTo.style.zIndex = '5';

        // Fade out slideFrom to reveal slideTo
        slideFrom.style.zIndex = '10';
        slideFrom.style.transition = 'opacity 1.2s ease-in-out';
        slideFrom.style.opacity = '0';

        // Clean up after dissolve
        setTimeout(() => {
            slideTo.style.transition = 'none';
            performSlideChange(index);
            slideTo.offsetHeight;
            slideFrom.style.transition = '';
            slideFrom.style.opacity = '';
            slideFrom.style.zIndex = '';
            slideTo.style.opacity = '';
            slideTo.style.visibility = '';
            slideTo.style.zIndex = '';
            slideTo.style.transition = '';
        }, 1300);
    }

    // Play cube rotation transition (generic - works with any slide pair)
    function playCubeTransition(index) {
        const slideFrom = slides[currentSlide];
        const slideTo = slides[index];
        const container = document.querySelector('.slides-container');
        const containerRect = container.getBoundingClientRect();
        const halfWidth = containerRect.width / 2;

        // Create a cube wrapper that will rotate
        const cubeWrapper = document.createElement('div');
        cubeWrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transform: translateZ(-${halfWidth}px);
            z-index: 20;
        `;

        // Set perspective on container
        container.style.perspective = halfWidth + 'px';
        container.style.overflow = 'hidden';

        // Clone both slides as cube faces
        const frontFace = slideFrom.cloneNode(true);
        frontFace.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 1; visibility: visible;
            backface-visibility: hidden;
            transform: translateZ(${halfWidth}px);
        `;
        frontFace.classList.remove('active', 'prev', 'next');

        const rightFace = slideTo.cloneNode(true);
        rightFace.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            opacity: 1; visibility: visible;
            backface-visibility: hidden;
            transform: rotateY(90deg) translateZ(${halfWidth}px);
        `;
        rightFace.classList.remove('active', 'prev', 'next');

        cubeWrapper.appendChild(frontFace);
        cubeWrapper.appendChild(rightFace);

        // Hide originals
        slideFrom.style.opacity = '0';

        container.appendChild(cubeWrapper);

        // Force reflow so browser registers initial transform
        cubeWrapper.offsetHeight;

        // Step 1: Animate shrink
        cubeWrapper.style.transition = 'transform 0.5s ease-in-out';
        cubeWrapper.style.transform = `translateZ(-${halfWidth}px) scale(0.75)`;

        // Step 2: Rotate after shrink completes
        setTimeout(() => {
            cubeWrapper.style.transition = 'transform 1.2s ease-in-out';
            cubeWrapper.style.transform = `translateZ(-${halfWidth}px) scale(0.75) rotateY(-90deg)`;
        }, 550);

        // Step 3: Scale back up after rotation
        setTimeout(() => {
            cubeWrapper.style.transition = 'transform 0.5s ease-in-out';
            cubeWrapper.style.transform = `translateZ(-${halfWidth}px) scale(1) rotateY(-90deg)`;
        }, 1800);

        // Clean up after animation
        setTimeout(() => {
            // Disable slide transition so it appears instantly
            slideTo.style.transition = 'none';
            performSlideChange(index);
            // Force reflow so active state is applied immediately
            slideTo.offsetHeight;
            slideFrom.style.opacity = '';
            cubeWrapper.remove();
            container.style.perspective = '';
            container.style.overflow = '';
            // Restore transition after a frame
            requestAnimationFrame(() => {
                slideTo.style.transition = '';
            });
        }, 2400);
    }

    // Play logo shrink transition (generic - looks for .cesmii-hero-logo and .cesmii-logo-small)
    function playLogoShrinkTransition(index) {
        const slideFrom = slides[currentSlide];
        const slideTo = slides[index];
        const heroLogo = slideFrom.querySelector('.cesmii-hero-logo img');
        const targetLogo = slideTo.querySelector('.cesmii-logo-small');
        const overlay = slideFrom.querySelector('.darker-overlay');
        const slideFromBackground = slideFrom.querySelector('.slide-background');

        // Hide "scroll or press arrow key" message immediately
        const scrollIndicator = slideFrom.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.style.display = 'none';
        }

        if (heroLogo && targetLogo) {
            // Get hero logo position
            const heroRect = heroLogo.getBoundingClientRect();

            // Temporarily show target slide to get target position
            slideTo.style.visibility = 'visible';
            slideTo.style.opacity = '0';
            const targetRect = targetLogo.getBoundingClientRect();
            slideTo.style.visibility = '';
            slideTo.style.opacity = '';

            // Create a clone of the logo for animation
            const animatedLogo = heroLogo.cloneNode(true);
            animatedLogo.style.position = 'fixed';
            animatedLogo.style.top = heroRect.top + 'px';
            animatedLogo.style.left = heroRect.left + 'px';
            animatedLogo.style.width = heroRect.width + 'px';
            animatedLogo.style.height = heroRect.height + 'px';
            animatedLogo.style.zIndex = '1000';
            animatedLogo.style.transition = 'all 1.2s ease-in-out';
            animatedLogo.style.pointerEvents = 'none';
            document.body.appendChild(animatedLogo);

            // Hide original logo
            heroLogo.style.opacity = '0';

            // Keep source slide visible during transition
            slideFrom.classList.add('logo-shrinking');

            // Fade out the overlay
            if (overlay) {
                overlay.style.transition = 'opacity 0.6s ease-out';
                overlay.style.opacity = '0';
            }

            // Get target slide background for crossfade
            const slideToBackground = slideTo.querySelector('.slide-background');

            // Hide target background before making it visible to prevent flash
            if (slideToBackground) {
                slideToBackground.style.opacity = '0';
            }
            slideTo.classList.add('logo-transition-in');
            slideTo.style.opacity = '1';
            slideTo.style.visibility = 'visible';

            // After overlay fades, start background crossfade and logo animation
            setTimeout(() => {
                // Crossfade backgrounds
                if (slideFromBackground) {
                    slideFromBackground.style.transition = 'opacity 1s ease-out';
                    slideFromBackground.style.opacity = '0';
                }
                if (slideToBackground) {
                    slideToBackground.style.transition = 'opacity 1s ease-in';
                    slideToBackground.style.opacity = '1';
                }

                // Animate the cloned logo to target position
                animatedLogo.style.top = targetRect.top + 'px';
                animatedLogo.style.left = targetRect.left + 'px';
                animatedLogo.style.width = targetRect.width + 'px';
                animatedLogo.style.height = targetRect.height + 'px';
            }, 600);

            // Fade in target slide content at 70% of logo animation
            setTimeout(() => {
                slideTo.classList.add('content-fade-in');
            }, 1440);

            // Complete transition
            setTimeout(() => {
                // Remove animated logo
                animatedLogo.remove();

                // Reset original logo
                heroLogo.style.opacity = '';

                // Reset overlay and backgrounds
                if (overlay) {
                    overlay.style.transition = '';
                    overlay.style.opacity = '';
                }
                if (slideFromBackground) {
                    slideFromBackground.style.transition = '';
                    slideFromBackground.style.opacity = '';
                }
                const slideToBackground = slideTo.querySelector('.slide-background');
                if (slideToBackground) {
                    slideToBackground.style.transition = '';
                    slideToBackground.style.opacity = '';
                }

                performSlideChange(index);
                slideFrom.classList.remove('logo-shrinking');
                slideTo.classList.remove('logo-transition-in', 'content-fade-in');
                slideTo.style.opacity = '';
                slideTo.style.visibility = '';
            }, 1900);
        } else {
            performSlideChange(index);
        }
    }

    // Play logo expand transition (generic - looks for .cesmii-logo-small and .cesmii-hero-logo)
    function playLogoExpandTransition(index) {
        const slideFrom = slides[currentSlide];
        const slideTo = slides[index];
        const smallLogo = slideFrom.querySelector('.cesmii-logo-small');
        const targetLogo = slideTo.querySelector('.cesmii-hero-logo img');

        if (smallLogo && targetLogo) {
            // Get small logo position
            const smallRect = smallLogo.getBoundingClientRect();
            const slideFromContent = slideFrom.querySelector('.slide-content');
            const slideToOverlay = slideTo.querySelector('.darker-overlay');
            const slideFromBackground = slideFrom.querySelector('.slide-background');
            const slideToBackground = slideTo.querySelector('.slide-background');

            // Temporarily show target slide to get target position
            slideTo.style.visibility = 'visible';
            slideTo.style.opacity = '0';
            const targetRect = targetLogo.getBoundingClientRect();
            slideTo.style.visibility = '';
            slideTo.style.opacity = '';

            // Create a clone of the small logo for animation
            const animatedLogo = smallLogo.cloneNode(true);
            animatedLogo.style.position = 'fixed';
            animatedLogo.style.top = smallRect.top + 'px';
            animatedLogo.style.left = smallRect.left + 'px';
            animatedLogo.style.width = smallRect.width + 'px';
            animatedLogo.style.height = smallRect.height + 'px';
            animatedLogo.style.zIndex = '1000';
            animatedLogo.style.transition = 'all 1.2s ease-in-out';
            animatedLogo.style.pointerEvents = 'none';
            document.body.appendChild(animatedLogo);

            // Hide original logo
            smallLogo.style.opacity = '0';

            // Keep source slide visible during transition
            slideFrom.classList.add('logo-expanding');

            // Hide target overlay initially
            if (slideToOverlay) {
                slideToOverlay.style.opacity = '0';
            }

            // Show target slide immediately but with background hidden for crossfade
            slideTo.style.opacity = '1';
            slideTo.style.visibility = 'visible';
            slideTo.classList.add('logo-transition-in');
            if (slideToBackground) {
                slideToBackground.style.opacity = '0';
            }

            // Set up source content fade transition
            if (slideFromContent) {
                slideFromContent.style.transition = 'opacity 0.8s ease-out';
                slideFromContent.offsetHeight; // Force reflow
            }

            // Start fading out source content AND expanding logo at the same time
            if (slideFromContent) {
                slideFromContent.style.opacity = '0';
            }

            // Crossfade backgrounds
            if (slideFromBackground) {
                slideFromBackground.style.transition = 'opacity 1s ease-out';
                slideFromBackground.style.opacity = '0';
            }
            if (slideToBackground) {
                slideToBackground.style.transition = 'opacity 1s ease-in';
                slideToBackground.style.opacity = '1';
            }

            // Animate the cloned logo to target position (expand) immediately
            animatedLogo.style.top = targetRect.top + 'px';
            animatedLogo.style.left = targetRect.left + 'px';
            animatedLogo.style.width = targetRect.width + 'px';
            animatedLogo.style.height = targetRect.height + 'px';

            // After logo animation completes, fade in content
            setTimeout(() => {
                // Fade in the overlay on target slide
                if (slideToOverlay) {
                    slideToOverlay.style.transition = 'opacity 2s ease-in';
                    slideToOverlay.style.opacity = '';
                }

                // Fade in target slide content
                slideTo.classList.add('content-fade-in');
            }, 1200);

            // Complete transition
            setTimeout(() => {
                // Remove animated logo
                animatedLogo.remove();

                // Reset original logo
                smallLogo.style.opacity = '';

                // Reset source content
                if (slideFromContent) {
                    slideFromContent.style.transition = '';
                    slideFromContent.style.opacity = '';
                }

                // Reset target overlay
                if (slideToOverlay) {
                    slideToOverlay.style.transition = '';
                }

                // Reset backgrounds
                if (slideFromBackground) {
                    slideFromBackground.style.transition = '';
                    slideFromBackground.style.opacity = '';
                }
                if (slideToBackground) {
                    slideToBackground.style.transition = '';
                    slideToBackground.style.opacity = '';
                }

                performSlideChange(index);
                slideFrom.classList.remove('logo-expanding');
                slideTo.classList.remove('logo-transition-in', 'content-fade-in');
                slideTo.style.opacity = '';
                slideTo.style.visibility = '';

            }, 1900);
        } else {
            performSlideChange(index);
        }
    }

    // Play crossfade transition
    function playBackgroundCrossfade(index) {
        const currentSlideEl = slides[currentSlide];
        const nextSlideEl = slides[index];

        // Show next slide fully opaque BEHIND the current slide
        nextSlideEl.style.transition = 'none';
        nextSlideEl.style.opacity = '1';
        nextSlideEl.style.visibility = 'visible';
        nextSlideEl.style.transform = 'scale(1)';
        nextSlideEl.style.zIndex = '1';
        currentSlideEl.style.zIndex = '2';

        // Force reflow
        nextSlideEl.offsetHeight;

        // Fade out current slide — use a class so !important beats .slide-seuss { transition: none !important }
        currentSlideEl.classList.add('crossfade-transition');
        currentSlideEl.offsetHeight; // Force reflow to register the transition before opacity change
        currentSlideEl.style.opacity = '0';

        // Complete transition after crossfade
        setTimeout(() => {
            // Reset styles
            currentSlideEl.classList.remove('crossfade-transition');
            currentSlideEl.style.opacity = '';
            currentSlideEl.style.zIndex = '';
            nextSlideEl.style.transition = '';
            nextSlideEl.style.opacity = '';
            nextSlideEl.style.visibility = '';
            nextSlideEl.style.transform = '';
            nextSlideEl.style.zIndex = '';

            performSlideChange(index);
        }, 1000);
    }

    // Play flip transition between slides
    function playFlipTransition(index, flipOutDeg, flipInDeg) {
        const prevSlide = slides[currentSlide];
        const nextSlide = slides[index];

        // Start previous slide flip out animation
        prevSlide.style.transition = 'transform 0.8s ease-in-out';
        prevSlide.classList.remove('active');
        prevSlide.classList.add('prev');
        prevSlide.style.opacity = '1';
        prevSlide.style.visibility = 'visible';
        prevSlide.style.transform = `perspective(1500px) rotateY(${flipOutDeg}deg)`;

        // After flip out completes, start next slide flip in
        setTimeout(() => {
            // First, set up next slide at rotated position WITHOUT transition
            nextSlide.style.transition = 'none';
            nextSlide.style.transform = `perspective(1500px) rotateY(${flipInDeg}deg)`;
            nextSlide.style.opacity = '1';
            nextSlide.style.visibility = 'visible';
            nextSlide.classList.remove('next');
            nextSlide.classList.add('active');

            // Force reflow to apply the rotated state
            nextSlide.offsetHeight;

            // Now add transition and animate to final position
            nextSlide.style.transition = 'transform 0.8s ease-in-out';
            nextSlide.style.transform = 'perspective(1500px) rotateY(0deg)';

            currentSlide = index;

            // Update nav dots
            navDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }, 800);

        // Clean up after all animations complete
        setTimeout(() => {
            prevSlide.style.opacity = '';
            prevSlide.style.visibility = '';
            prevSlide.style.transform = '';
            prevSlide.style.transition = '';
            nextSlide.style.opacity = '';
            nextSlide.style.visibility = '';
            nextSlide.style.transform = '';
            nextSlide.style.transition = '';
            isAnimating = false;
        }, 1700);
    }

    // Play wipe transition with shimmer effect (generic - left to right)
    function playSlide15WipeTransition(index) {
        const slideFrom = slides[currentSlide];
        const slideTo = slides[index];
        const slidesContainer = document.querySelector('.slides-container');
        const containerRect = slidesContainer.getBoundingClientRect();

        // Ensure slideFrom is on top with clip-path ready before revealing slideTo
        slideFrom.style.zIndex = '10';
        slideFrom.style.clipPath = 'inset(0 0 0 0)';

        // Make slide 24 visible behind
        slideTo.style.transition = 'none';
        slideTo.style.opacity = '1';
        slideTo.style.visibility = 'visible';
        slideTo.style.zIndex = '5';

        // Set wipe transition on slideFrom
        slideFrom.style.transition = 'clip-path 1.2s ease-in-out';

        // Create shimmering vertical line
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: fixed;
            top: ${containerRect.top}px;
            left: ${containerRect.left}px;
            width: 6px;
            height: ${containerRect.height}px;
            background: linear-gradient(to bottom,
                transparent 0%,
                rgba(255, 255, 255, 0.2) 15%,
                rgba(255, 255, 255, 0.6) 35%,
                white 50%,
                rgba(255, 255, 255, 0.6) 65%,
                rgba(255, 255, 255, 0.2) 85%,
                transparent 100%);
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.8),
                        0 0 25px rgba(255, 255, 255, 0.4),
                        0 0 50px rgba(0, 174, 239, 0.3);
            z-index: 15;
            pointer-events: none;
            transition: left 1.2s ease-in-out;
        `;
        document.body.appendChild(shimmer);

        // Wipe slide away left to right (reveal next slide underneath)
        requestAnimationFrame(() => {
            slideFrom.style.clipPath = 'inset(0 0 0 100%)';
            shimmer.style.left = (containerRect.left + containerRect.width) + 'px';
        });

        setTimeout(() => {
            // Clean up inline styles
            slideFrom.style.transition = '';
            slideFrom.style.clipPath = '';
            slideFrom.style.zIndex = '';
            slideTo.style.transition = '';
            slideTo.style.opacity = '';
            slideTo.style.visibility = '';
            slideTo.style.zIndex = '';
            shimmer.remove();

            // Use performSlideChange to properly set all slide states
            performSlideChange(index);
        }, 1300);
    }

    // Generic wipe transition
    function playWipeTransition(index) {
        const outgoingSlide = slides[currentSlide];
        const incomingSlide = slides[index];

        // Step 1: Wipe out current slide
        outgoingSlide.classList.add('wiping');

        // Step 2: Wipe in new slide
        setTimeout(() => {
            outgoingSlide.classList.add('fading');
            incomingSlide.classList.add('wiping-in');
            incomingSlide.style.opacity = '1';
            incomingSlide.style.visibility = 'visible';
            incomingSlide.style.transform = 'scale(1)'; // Override .next scale
        }, 500);

        // Step 3: Complete transition
        setTimeout(() => {
            performSlideChange(index);
            outgoingSlide.classList.remove('wiping', 'fading');
            incomingSlide.classList.remove('wiping-in');
            incomingSlide.style.opacity = '';
            incomingSlide.style.visibility = '';
            incomingSlide.style.transform = '';
        }, 1000);
    }

    // Perform the actual slide change
    function performSlideChange(index) {
        const targetId = getSlideId(index);

        // Reset timeline cards when leaving timeline slide
        if (isCurrentSlide('slide-8') && targetId !== 'slide-8') {
            resetTimelineCards();
        }

        // Reset benefit items when leaving benefits slide
        if (isCurrentSlide('slide-9') && targetId !== 'slide-9') {
            resetBenefitItems();
        }

        // Reset imperative rows when leaving imperatives slide
        if (isCurrentSlide('slide-12') && targetId !== 'slide-12') {
            resetImperativeRows();
        }

        // Reset engage persona animations when leaving slide-36
        if (isCurrentSlide('slide-36') && targetId !== 'slide-36') {
            document.querySelectorAll('.engage-persona').forEach(el => {
                el.style.animation = 'none';
                el.style.opacity = '0';
                el.style.transform = 'translateY(40px)';
            });
        }

        // Play/reset energy sphere video
        if (targetId === 'slide-28') {
            const esVideo = document.querySelector('.energy-sphere-video');
            if (esVideo) { esVideo.currentTime = 0; esVideo.play(); }
        } else if (isCurrentSlide('slide-28')) {
            const esVideo = document.querySelector('.energy-sphere-video');
            if (esVideo) { esVideo.pause(); esVideo.currentTime = 0; }
        }

        // Auto-play Simpsons video 1 second after arriving at slide 10
        if (targetId === 'slide-10' && simpsonsVideo) {
            setTimeout(() => {
                if (isCurrentSlide('slide-10') && !simpsonsPlaying) {
                    simpsonsVideo.currentTime = 0;
                    simpsonsVideo.muted = true;
                    simpsonsVideo.play();
                    simpsonsPlaying = true;
                }
            }, 1000);
        }

        // Reset Simpsons video when leaving Simpsons slide
        if (isCurrentSlide('slide-10') && targetId !== 'slide-10') {
            if (simpsonsVideo) {
                simpsonsVideo.pause();
                simpsonsVideo.currentTime = 0;
            }
            simpsonsPlaying = false;
        }

        // Update slides
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');
            if (i === index) {
                slide.classList.add('active');
            } else if (i < index) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });

        // Update navigation dots
        navDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentSlide = index;

        // Update URL hash for deep linking (slide number is 1-indexed for users)
        history.replaceState(null, '', `#${index + 1}`);


        // Re-enable engage persona animations when entering slide-36
        if (targetId === 'slide-36') {
            document.querySelectorAll('.engage-persona').forEach(el => {
                el.style.animation = '';
                el.style.opacity = '';
                el.style.transform = '';
            });
        }

        // Auto-trigger benefit items on benefits slide
        if (targetId === 'slide-9') {
            benefitItems.forEach(item => item.classList.add('visible'));
        }

        // Fade out Mister Rogers theme when leaving Mister Rogers slide
        if (targetId !== 'slide-15' && !misterRogersAudio.paused) {
            // Fade out over 2 seconds
            const fadeOutDuration = 2000;
            const fadeSteps = 40;
            const fadeInterval = fadeOutDuration / fadeSteps;
            const volumeStep = misterRogersAudio.volume / fadeSteps;

            const fadeOut = setInterval(() => {
                if (misterRogersAudio.volume > volumeStep) {
                    misterRogersAudio.volume -= volumeStep;
                } else {
                    misterRogersAudio.volume = 0;
                    misterRogersAudio.pause();
                    misterRogersAudio.currentTime = 0;
                    misterRogersAudio.volume = 1; // Reset for next play
                    clearInterval(fadeOut);
                }
            }, fadeInterval);
        }

        // Play/pause Wonderware video
        const wonderwareVideo = document.querySelector('.wonderware-video video');
        if (wonderwareVideo) {
            if (targetId === 'slide-6') {
                wonderwareVideo.currentTime = 0;
                wonderwareVideo.play();
            } else {
                wonderwareVideo.pause();
                wonderwareVideo.currentTime = 0;
            }
        }

        // Hide scroll indicator after first navigation
        if (index > 0) {
            const scrollIndicator = document.querySelector('.scroll-indicator');
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '0';
            }
        }

        setTimeout(() => {
            isAnimating = false;
            console.log(`[performSlideChange] Reset isAnimating = false after ${animationDuration}ms`);
        }, animationDuration);
    }

    // Track revealed timeline cards on slide 7 (index 7)
    let timelineCardIndex = 0;
    const timelineCards = document.querySelectorAll('.slide-proveit-timeline .timeline-card');

    function resetTimelineCards() {
        timelineCardIndex = 0;
        timelineCards.forEach(card => card.classList.remove('visible'));
    }


    // Track revealed benefit items on slide 8 (index 8)
    let benefitItemIndex = 0;
    const benefitItems = document.querySelectorAll('.slide-benefits .benefit-item');

    function resetBenefitItems() {
        benefitItemIndex = 0;
        benefitItems.forEach(item => {
            item.classList.remove('visible');
            item.querySelector('.benefit-icon').style.animation = '';
            item.querySelector('.benefit-text').style.animation = '';
        });
    }

    // Track revealed rows on slide 7 (reveal in reverse order: row 3, row 2, row 1)
    let imperativeRowIndex = 0;
    let imperativeAnimating = false;
    const imperativeRows = document.querySelectorAll('.slide-imperatives-v2 .imperative-row');
    const rowOrder = [2, 1, 0]; // Reverse order: row 3 first, row 1 last

    // Animate circle to center of screen at 300%, shrink back, then trigger wipes
    function revealImperativeRow(rowIdx) {
        const row = imperativeRows[rowOrder[rowIdx]];
        const circle = row.querySelector('.imperative-circle');
        const container = document.querySelector('.slides-container');
        const containerRect = container.getBoundingClientRect();
        const circleRect = circle.getBoundingClientRect();

        // Calculate offset from circle's position to center of screen
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        const circleCenterX = circleRect.left + circleRect.width / 2;
        const circleCenterY = circleRect.top + circleRect.height / 2;
        const offsetX = centerX - circleCenterX;
        const offsetY = centerY - circleCenterY;

        imperativeAnimating = true;

        // Start small at the center of the screen
        circle.style.transition = 'none';
        circle.style.clipPath = 'circle(75% at 50% 50%)';
        circle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(0.1)`;
        circle.style.zIndex = '100';
        circle.offsetHeight;

        // Phase 1: Expand to 300% at center
        circle.style.transition = 'transform 0.8s ease-out';
        circle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(3)`;

        circle.addEventListener('transitionend', function() {
            // Phase 2: Shrink back to position
            circle.style.transition = 'transform 0.8s ease-in-out';
            circle.style.transform = 'translate(0, 0) scale(1)';

            circle.addEventListener('transitionend', function() {
                circle.style.transition = '';
                circle.style.transform = '';
                circle.style.zIndex = '';
                // Circle stays visible via .visible class, trigger wipes
                row.classList.add('visible');
                imperativeAnimating = false;
            }, { once: true });
        }, { once: true });
    }

    // Reset circle inline styles for a row
    function resetCircleStyles(row) {
        const circle = row.querySelector('.imperative-circle');
        if (circle) {
            circle.style.transition = '';
            circle.style.clipPath = '';
            circle.style.transform = '';
            circle.style.zIndex = '';
        }
    }

    // Track Simpsons video state
    let simpsonsPlaying = false;
    const simpsonsVideo = document.querySelector('.simpsons-clip');

    // Navigate to next slide
    function nextSlide() {
        // Special handling for timeline slide - reveal cards on click
        if (isCurrentSlide('slide-8') && timelineCardIndex < timelineCards.length) {
            timelineCards[timelineCardIndex].classList.add('visible');
            timelineCardIndex++;
            return;
        }

        // Special handling for imperatives slide - reveal rows on click
        if (isCurrentSlide('slide-12') && imperativeRowIndex < rowOrder.length) {
            if (imperativeAnimating) return;
            revealImperativeRow(imperativeRowIndex);
            imperativeRowIndex++;
            return;
        }

        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        }
    }

    // Navigate to previous slide
    function prevSlide() {
        // Special handling for timeline slide - hide cards on back
        if (isCurrentSlide('slide-8') && timelineCardIndex > 0) {
            timelineCardIndex--;
            timelineCards[timelineCardIndex].classList.remove('visible');
            return;
        }

        // Special handling for imperatives slide - hide rows on back
        if (isCurrentSlide('slide-12') && imperativeRowIndex > 0) {
            if (imperativeAnimating) return;
            imperativeRowIndex--;
            const row = imperativeRows[rowOrder[imperativeRowIndex]];
            row.classList.remove('visible');
            resetCircleStyles(row);
            return;
        }

        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        }
    }

    // Reset imperative rows when leaving slide 12
    function resetImperativeRows() {
        imperativeRowIndex = 0;
        imperativeAnimating = false;
        imperativeRows.forEach(row => {
            row.classList.remove('visible');
            resetCircleStyles(row);
        });
    }

    // Page turn functionality for Seuss slides (excluding first page - the book cover)
    // Helper: check if current slide is in a group by index
    function isInSlideGroup(slideIndex, groupName) {
        const slideId = slides[slideIndex]?.id;
        return slideGroups[groupName]?.includes(slideId) || false;
    }

    // Helper: get last slide ID in a group
    function getLastInGroup(groupName) {
        const group = slideGroups[groupName];
        return group ? group[group.length - 1] : null;
    }

    function playPageTurnTransition(index) {
        console.log(`[pageTurn] Starting page turn to index ${index}`);
        const currentSlideEl = slides[currentSlide];
        const nextSlideEl = slides[index];
        const currentImage = currentSlideEl.querySelector('.seuss-book-image');
        const nextImage = nextSlideEl.querySelector('.seuss-book-image');

        if (!currentImage || !nextImage) {
            console.log('[pageTurn] Missing image, falling back to performSlideChange');
            performSlideChange(index);
            return;
        }

        // Get current image position and size
        const currentRect = currentImage.getBoundingClientRect();
        const halfWidth = currentRect.width / 2;

        // Create container for page turn effect
        const container = document.createElement('div');
        container.className = 'page-turn-container';
        document.body.appendChild(container);

        // Left half of current image (stays static)
        const leftHalf = document.createElement('div');
        leftHalf.style.position = 'fixed';
        leftHalf.style.top = currentRect.top + 'px';
        leftHalf.style.left = currentRect.left + 'px';
        leftHalf.style.width = halfWidth + 'px';
        leftHalf.style.height = currentRect.height + 'px';
        leftHalf.style.overflow = 'hidden';
        leftHalf.style.zIndex = '997';
        const leftImage = currentImage.cloneNode(true);
        leftImage.style.width = currentRect.width + 'px';
        leftImage.style.height = currentRect.height + 'px';
        leftImage.style.maxWidth = 'none';
        leftImage.style.maxHeight = 'none';
        leftImage.style.position = 'absolute';
        leftImage.style.left = '0';
        leftImage.style.top = '0';
        leftHalf.appendChild(leftImage);
        container.appendChild(leftHalf);

        // Clone the next image (right half visible behind turning page)
        const nextRightHalf = document.createElement('div');
        nextRightHalf.style.position = 'fixed';
        nextRightHalf.style.top = currentRect.top + 'px';
        nextRightHalf.style.left = (currentRect.left + halfWidth) + 'px';
        nextRightHalf.style.width = halfWidth + 'px';
        nextRightHalf.style.height = currentRect.height + 'px';
        nextRightHalf.style.overflow = 'hidden';
        nextRightHalf.style.zIndex = '998';
        const nextImageClone = nextImage.cloneNode(true);
        nextImageClone.style.width = currentRect.width + 'px';
        nextImageClone.style.height = currentRect.height + 'px';
        nextImageClone.style.maxWidth = 'none';
        nextImageClone.style.maxHeight = 'none';
        nextImageClone.style.position = 'absolute';
        nextImageClone.style.left = -halfWidth + 'px';
        nextImageClone.style.top = '0';
        nextRightHalf.appendChild(nextImageClone);
        container.appendChild(nextRightHalf);

        // Add shadow under the turning page (only on right side)
        const underShadow = document.createElement('div');
        underShadow.className = 'page-under-shadow';
        underShadow.style.position = 'fixed';
        underShadow.style.top = currentRect.top + 'px';
        underShadow.style.left = (currentRect.left + halfWidth) + 'px';
        underShadow.style.width = halfWidth + 'px';
        underShadow.style.height = currentRect.height + 'px';
        underShadow.style.zIndex = '999';
        container.appendChild(underShadow);

        // Create the turning page wrapper (right half only)
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page-turn-page';
        pageWrapper.style.top = currentRect.top + 'px';
        pageWrapper.style.left = (currentRect.left + halfWidth) + 'px';
        pageWrapper.style.width = halfWidth + 'px';
        pageWrapper.style.height = currentRect.height + 'px';
        pageWrapper.style.zIndex = '1000';
        container.appendChild(pageWrapper);

        // Front of page (right half of current image)
        const pageFront = document.createElement('div');
        pageFront.className = 'page-front';
        pageFront.style.overflow = 'hidden';
        const currentImageClone = currentImage.cloneNode(true);
        currentImageClone.style.width = currentRect.width + 'px';
        currentImageClone.style.height = currentRect.height + 'px';
        currentImageClone.style.maxWidth = 'none';
        currentImageClone.style.maxHeight = 'none';
        currentImageClone.style.position = 'absolute';
        currentImageClone.style.left = -halfWidth + 'px';
        currentImageClone.style.top = '0';
        pageFront.appendChild(currentImageClone);
        pageWrapper.appendChild(pageFront);

        // Back of page (shows left half of next image)
        const pageBack = document.createElement('div');
        pageBack.className = 'page-back';
        pageBack.style.overflow = 'hidden';
        pageBack.style.background = 'none';
        const nextImageBack = nextImage.cloneNode(true);
        nextImageBack.style.width = currentRect.width + 'px';
        nextImageBack.style.height = currentRect.height + 'px';
        nextImageBack.style.maxWidth = 'none';
        nextImageBack.style.maxHeight = 'none';
        nextImageBack.style.position = 'absolute';
        nextImageBack.style.left = '0';
        nextImageBack.style.top = '0';
        pageBack.appendChild(nextImageBack);
        pageWrapper.appendChild(pageBack);

        // Shadow on turning page
        const pageShadow = document.createElement('div');
        pageShadow.className = 'page-shadow';
        pageFront.appendChild(pageShadow);

        // Fold effect
        const pageFold = document.createElement('div');
        pageFold.className = 'page-fold';
        pageFront.appendChild(pageFold);

        // Curl highlight on edge
        const pageCurlHighlight = document.createElement('div');
        pageCurlHighlight.className = 'page-curl-highlight';
        pageFront.appendChild(pageCurlHighlight);

        // Hide the original current image during animation
        currentImage.style.opacity = '0';

        // Start the animation
        setTimeout(() => {
            pageWrapper.classList.add('turning');
            underShadow.classList.add('visible');

            // Animate with easing for realistic book feel
            pageWrapper.style.transition = 'transform 1.2s cubic-bezier(0.645, 0.045, 0.355, 1)';
            pageWrapper.style.transform = 'rotateY(-180deg)';
        }, 50);

        setTimeout(() => {
            // Disable transitions and force final visual state BEFORE class changes
            currentSlideEl.style.transition = 'none';
            nextSlideEl.style.transition = 'none';

            // Set final visual states directly to prevent any flash
            nextSlideEl.style.opacity = '1';
            nextSlideEl.style.visibility = 'visible';
            nextSlideEl.style.transform = 'scale(1)';
            currentSlideEl.style.opacity = '0';
            currentSlideEl.style.transform = 'scale(0.95)';

            // Force reflow to apply styles before class changes
            nextSlideEl.offsetHeight;

            // Perform slide change while clones are still visible
            performSlideChange(index);

            // Reset original image
            currentImage.style.opacity = '';

            // Remove container after a brief moment
            setTimeout(() => {
                container.remove();

                // Re-enable transitions and clear inline styles
                currentSlideEl.style.transition = '';
                nextSlideEl.style.transition = '';
                currentSlideEl.style.opacity = '';
                currentSlideEl.style.visibility = '';
                currentSlideEl.style.transform = '';
                nextSlideEl.style.opacity = '';
                nextSlideEl.style.visibility = '';
                nextSlideEl.style.transform = '';
            }, 50);
        }, 1300);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Set tooltip labels for nav dots (1-based slide numbers)
        navDots.forEach((dot, i) => dot.setAttribute('data-label', `Slide ${i + 1}`));

        // Slide number navigation buffer
        let slideNumberBuffer = '';
        let slideNumberTimeout = null;

        function resetSlideNumberBuffer() {
            slideNumberBuffer = '';
            if (slideNumberTimeout) {
                clearTimeout(slideNumberTimeout);
                slideNumberTimeout = null;
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            console.log(`[keydown] Key pressed: ${e.key}, currentSlide=${currentSlide}, isAnimating=${isAnimating}`);

            // Handle number keys for slide navigation
            if (e.key >= '0' && e.key <= '9') {
                e.preventDefault();
                slideNumberBuffer += e.key;
                // Reset timeout
                if (slideNumberTimeout) clearTimeout(slideNumberTimeout);
                slideNumberTimeout = setTimeout(resetSlideNumberBuffer, 3000);
                return;
            }

            // Handle Enter to navigate to buffered slide number
            if (e.key === 'Enter' && slideNumberBuffer !== '') {
                e.preventDefault();
                const slideNum = parseInt(slideNumberBuffer, 10);
                if (slideNum >= 1 && slideNum <= slides.length) {
                    showSlide(slideNum - 1); // Convert to 0-indexed
                }
                resetSlideNumberBuffer();
                return;
            }

            switch(e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    console.log('[keydown] Calling nextSlide()');
                    nextSlide();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    showSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    showSlide(slides.length - 1);
                    break;
            }
        });

        // Navigation dot clicks
        navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });

        // Click to advance (optional - click on slide area)
        const slideLinks = SlideConfig.slideLinks || {};

        slides.forEach((slide, index) => {
            slide.addEventListener('click', (e) => {
                // Don't navigate if clicking on interactive elements
                if (e.target.closest('a, button, .nav-dot')) return;

                // Check if this slide has a link to open (only on foreground content, not background)
                const currentId = slides[currentSlide]?.id;
                const isBackgroundClick = e.target.closest('.slide-background, .video-bg, .darker-overlay');
                if (slideLinks[currentId] && !isBackgroundClick) {
                    window.open(slideLinks[currentId], '_blank');
                    // Quietly advance to next slide
                    if (currentSlide < slides.length - 1) {
                        showSlide(currentSlide + 1);
                    }
                    return;
                }

                // Page turn animation on Seuss slides (except last Seuss page which uses circle wipe)
                const isSeuss = isInSlideGroup(currentSlide, 'seuss');
                const isLastSeuss = currentId === getLastInGroup('seuss');
                if (isSeuss && currentSlide < slides.length - 1 && !isLastSeuss) {
                    if (isAnimating) return;
                    isAnimating = true;
                    const nextIndex = currentSlide + 1;
                    playPageTurnTransition(nextIndex);
                    return;
                }

                // Click on left third = previous, right two-thirds = next
                const rect = slide.getBoundingClientRect();
                const clickX = e.clientX - rect.left;

                if (clickX < rect.width / 3) {
                    prevSlide();
                } else {
                    nextSlide();
                }
            });
        });

    }

    // Scale slide 6 to maintain 1920x1080 aspect ratio
    function scaleSlide4() {
        const slide4Content = document.querySelector('.slide-5 .slide-content');
        if (!slide4Content) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const designWidth = 1920;
        const designHeight = 1080;

        // Calculate scale to fit within viewport while maintaining aspect ratio
        const scaleX = viewportWidth / designWidth;
        const scaleY = viewportHeight / designHeight;
        const scale = Math.min(scaleX, scaleY);

        slide4Content.style.transform = `scale(${scale})`;
    }

    // Initial scale and resize listener
    function scaleSponsorsSlide() {
        const layout = document.querySelector('.sponsors-layout');
        if (!layout) return;
        const container = layout.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const scaleX = containerWidth / 1920;
        const scaleY = containerHeight / 1080;
        const scale = Math.min(scaleX, scaleY);
        layout.style.transform = `scale(${scale})`;
    }

    scaleSlide4();
    scaleSponsorsSlide();
    window.addEventListener('resize', () => {
        scaleSlide4();
        scaleSponsorsSlide();
    });

    // Start the presentation
    init();

    // Preload images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            const preload = new Image();
            preload.src = src;
        }
    });

    console.log('ProveIT Presentation initialized');
});
