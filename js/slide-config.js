// ===========================================
// SLIDE TRANSITION CONFIG
// ===========================================
// Edit this file to add/remove/modify transitions
// No need to touch presentation.js for transition changes

const SlideConfig = {
    // -----------------------------------------
    // TRANSITIONS
    // -----------------------------------------
    // Keys use slide IDs: 'from→to' for one-way, 'a↔b' for bidirectional
    // Values are transition handler names (defined in presentation.js)
    transitions: {
        // Logo animations (slides 1-3)
        'slide-1→slide-2': 'logoShrink',
        'slide-2→slide-3': 'logoExpand',

        // Álvaro futuristic panels (bidirectional)
        'slide-9↔slide-10': 'alvaro',

        // Imperatives to CMAPI to Matthew Parris to Mr. Rogers
        'slide-11→slide-12': 'wipe',
        'slide-12→slide-13': 'crossfade',
        'slide-13→slide-14': 'crossfade',
        'slide-14→slide-15': 'misterRogers',

        // Mr. Rogers to Seuss (crossfade into book cover)
        'slide-15→slide-16': 'wipe',

        // Seuss cover to first page (wipe, then page turn starts)
        'slide-16→slide-17': 'hartzet',

        // Seuss last page to Energy Sphere (crossfade out of book)
        'slide-27→slide-28': 'crossfade',

        // Energy Sphere to Panel
        'slide-28→slide-29': 'wipe',

        // Georgia-Pacific slides (crossfade)
        'slide-31→slide-32': 'crossfade',
        'slide-32→slide-33': 'crossfade',
        'slide-33→slide-34': 'crossfade',
        'slide-34→slide-35': 'crossfade',

        // Hartzet slide-in (bidirectional)
        'slide-35↔slide-36': 'hartzet',
    },

    // -----------------------------------------
    // SLIDE GROUPS
    // -----------------------------------------
    // Groups of slides that share behavior (range-based transitions)
    groups: {
        // Engage slides use vertical box slide transition between each other
        engage: ['slide-36', 'slide-37'],

        // Seuss book pages use page-turn animation (forward only)
        // Note: slide-16 (cover) uses explicit wipe transition, page turn starts at slide-17
        // Pages 8-9 were merged into slide-24
        seuss: [
            'slide-17', 'slide-18', 'slide-19', 'slide-20', 'slide-21',
            'slide-22', 'slide-23', 'slide-24', 'slide-25', 'slide-26',
            'slide-27'
        ],
    },

    // -----------------------------------------
    // GROUP TRANSITIONS
    // -----------------------------------------
    // Define what transition to use within each group
    groupTransitions: {
        engage: 'engageBox',      // Any slide in engage → another in engage
        seuss: 'pageTurn',        // Forward navigation within seuss group
    },

    // -----------------------------------------
    // SLIDE LINKS
    // -----------------------------------------
    // Clicking anywhere on these slides opens the URL in a new tab
    slideLinks: {
        'slide-4': 'https://fred.stlouisfed.org/series/PRS30006163#0',
        'slide-30': 'https://connect.cesmii.org/i3x',
    },
};
