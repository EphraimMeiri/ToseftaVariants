// This site's apparatus layers, registered into the shared midrash-viewer-core
// registry (vendor/midrash-viewer-core). Each layer declares what it is, when
// it's relevant, and where it may render; the registry owns the rest.
//
// Everything a layer needs about the loaded tractate arrives as `ctx`:
//
//   { masechet, textData, variantsData, witnessData,
//     manuscriptDataBySlug, editionsData }
//
// Layers are mounted once and live across tractate loads, so they take new
// data through setContext rather than being rebuilt -- that's what lets a
// panel keep its scroll position when an unrelated layer is toggled.
//
// This file is also the seam for the private full edition: it adds its
// commentary layers here and ships its own data directory, without forking the
// viewer itself.

// Edition credit for a commentary panel, from whatever provenance the data file
// carries. The Lieberman pair comes from Sefaria under CC-BY, where attribution
// is a licence condition and not a courtesy, so this is required rather than
// decorative; the OCR'd editions state their own printing and that the
// transcription is ours.

// Vienna is the site's base text (the siglum-less .body-word / synopsis 'בסיס'
// row), so witness-neutral clicks resolve to it. Erfurt is a full secondary
// witness with its own images. London (ל) only has image data for the
// Chullin/Seder Moed volume (BL Add. 27296, via NLI's IIIF). Other sigla (ד/ש)
// have no manuscript-image data yet, so are simply absent from this map.
const SIGLUM_TO_WITNESS_SLUG = { 'א': 'Erfurt', 'ב': 'Vienna', 'ג': 'Geniza', 'ל': 'London' };
const WITNESS_HEB_LABEL = {
    'Erfurt': 'כתב יד ערפורט',
    'Vienna': 'כתב יד וינה',
    'Geniza': 'קטע גניזה',
    'London': 'כתב יד לונדון',
};

function witnessSlugForSynopsisSiglum(siglum) {
    if (siglum === 'בסיס') return 'Vienna';
    return SIGLUM_TO_WITNESS_SLUG[siglum] || null;
}

// Resolves a position into one of four states so the panel can explain *why* a
// word has no link instead of one generic "missing" message:
//   'no-data'    -- this witness has no manuscript-image file for the tractate
//                   at all (e.g. Geniza/London outside their covered scope).
//   'no-chapter' -- the file exists but this chapter has zero aligned entries.
//   'exact'      -- the word itself is aligned; a solid highlight box.
//   'approx'     -- the word itself isn't aligned (an HTR miss), but the
//                   chapter has other aligned words; falls back to the nearest
//                   so the reader at least sees the right region of the page,
//                   marked as approximate.
function resolveManuscriptEntry(manuscriptDataBySlug, witnessSlug, perekIndex, baseIdx) {
    const manuscriptData = manuscriptDataBySlug && manuscriptDataBySlug[witnessSlug];
    if (!manuscriptData) return { status: 'no-data' };
    const chapter = manuscriptData.chapters && manuscriptData.chapters[convert_number(perekIndex + 1)];
    const keys = chapter ? Object.keys(chapter) : [];
    if (!chapter || keys.length === 0) return { status: 'no-chapter' };
    const exact = chapter[String(baseIdx)];
    if (exact) return { status: 'exact', word: exact };
    let nearestKey = null, nearestDist = Infinity;
    for (const k of keys) {
        const dist = Math.abs(Number(k) - baseIdx);
        if (dist < nearestDist) { nearestDist = dist; nearestKey = k; }
    }
    if (nearestKey == null) return { status: 'no-chapter' };
    return { status: 'approx', word: chapter[nearestKey], distance: nearestDist };
}

function anyManuscriptData(ctx) {
    if (!ctx) return false;
    return MANUSCRIPT_WITNESS_SLUGS.some(slug => {
        const md = ctx.manuscriptDataBySlug && ctx.manuscriptDataBySlug[slug];
        return md && md.chapters && Object.keys(md.chapters).length;
    });
}

// --- manuscript-image layer -------------------------------------------------
// The panel itself is midrash-viewer-core's: it owns the image DOM, zoom, pan
// and fullscreen. This layer owns only which witness/word to show, and the
// header label naming it.
const MANUSCRIPT_LAYER = {
    id: 'manuscript',
    label: 'כתב יד',
    kind: 'image',
    placement: 'manuscript',
    available: anyManuscriptData,
    navButtonId: 'manuscriptMode',

    mount(container, ctx) {
        let current = ctx;

        const label = document.createElement('span');
        label.className = 'dock-position-label';

        const panel = MidrashViewerCore.createManuscriptPanel({
            root: container,
            showFolioLabel: false,   // the header label already names page + chapter
            labels: {
                noSelection: 'לחצו על מילה בטקסט, בעד הנוסח או בהערת השוליים כדי להציג את כתב היד',
                noData: (w) => `אין נתוני כתב יד עבור ${w} במסכת זו`,
                noChapter: (w) => `אין עדיין נתוני כתב יד לפרק זה ב${w}`,
                notFound: (w) => `המילה לא זוהתה ב${w} במיקום זה`,
                approxNote: 'המילה המדויקת לא זוהתה בכתב היד -- מוצגת המילה המזוהה הקרובה ביותר',
            },
            // Single-witness mode: which witness to show comes from the click
            // source (a synopsis row, a footnote, a body word), not from a tab
            // strip, so `listWitnesses` is deliberately absent and the witness
            // arrives per select() instead.
            adapter: {
                resolve(witnessSlug, addr) {
                    const witnessLabel = WITNESS_HEB_LABEL[witnessSlug] || witnessSlug;
                    const bySlug = current && current.manuscriptDataBySlug;
                    const data = bySlug && bySlug[witnessSlug];
                    const resolved = resolveManuscriptEntry(bySlug, witnessSlug, addr.chapter, addr.baseIdx);
                    if (resolved.status === 'no-data' || resolved.status === 'no-chapter') {
                        return { status: resolved.status, witnessLabel };
                    }
                    const word = resolved.word;
                    const page = word && data.pages && data.pages[String(word.page)];
                    if (!word || !word.bbox || !page) return { status: 'not-found', witnessLabel };
                    // This site's emitted JSON stores [x0,y0,x1,y1]; the core
                    // speaks [x,y,w,h] only, so convert here.
                    return {
                        status: resolved.status,
                        page,
                        bbox: MidrashViewerCore.bbox.fromXYXY(word.bbox),
                        folio: word.page,
                        witnessLabel,
                    };
                },
            },
        });

        return {
            headerControls: label,

            select(addr, meta) {
                // A click that doesn't name a witness we hold images for (a ד or
                // ש reading) leaves the panel where it was, rather than blanking
                // it: the reader's previous folio is more useful than an empty
                // box, and this is what the hand-wired version did by simply not
                // calling through.
                const witnessSlug = meta && meta.witnessId;
                if (!addr || addr.baseIdx == null || !witnessSlug) return;
                const witnessLabel = WITNESS_HEB_LABEL[witnessSlug] || witnessSlug;
                label.textContent = `${witnessLabel}, פרק ${convert_number(addr.chapter + 1)}`;
                panel.select(addr, { witnessId: witnessSlug });
            },

            setContext(next) {
                current = next;
                label.textContent = '';
                panel.select(null);
            },

            destroy() {
                panel.destroy();
                label.remove();
            },
        };
    },
};

// --- commentary layers ------------------------------------------------------
// One factory for all four commentaries. Every one of them is re-anchored to our
// own text -- the Lieberman pair by their authored dibbur hamatchil, the OCR'd
// pair by the chunker's lemma -- rather than trusting where the source filed the
// note, because in both cases that location is unreliable in a different way
// (see anchorCommentaryChapter / anchorOcrCommentaryChapter).
//
// `buildIndex` and `toPanelEntry` are what differ between an authored edition
// and an OCR'd one; everything else -- panel, reverse sync, context handling --
// is shared.
function commentaryCredit(data) {
    if (!data) return null;
    const parts = [];
    if (data.versionTitle) parts.push(data.versionTitle);
    if (data.source) parts.push(data.source);
    if (data.license) parts.push(data.license);
    if (data.versionSource && /sefaria/i.test(data.versionSource)) parts.push('ספריא');
    else if (data.digitizedBySefaria) parts.push('ספריא');
    return parts.length ? parts.join(' · ') : null;
}

function commentaryLayer({
    id, slug, label, title, navButtonId,
    dataKey = 'commentaryBySlug',
    buildIndex = (data, ctx) => createCommentaryIndex(data, ctx.textData, id),
    toPanelEntry = (entry) => entry,
    labels = {},
}) {
    return {
        id,
        label,
        title,
        navButtonId,
        kind: 'commentary',
        placement: 'side',
        available(ctx) {
            return !!(ctx && ctx[dataKey] && ctx[dataKey][slug]);
        },

        mount(container, ctx) {
            let index = null;
            let textData = null;
            let panel = null;

            function setCtx(next) {
                const data = next && next[dataKey] && next[dataKey][slug];
                textData = next && next.textData;
                index = (data && textData) ? buildIndex(data, next) : null;
                if (panel) panel.setCredit(commentaryCredit(data));
            }
            setCtx(ctx);

            panel = MidrashViewerCore.createCommentaryPanel({
                root: container,
                labels: { noSelection: `לחצו על מילה בטקסט כדי להציג את ${label}`, ...labels },
                adapter: {
                    // Everything anchored to the selected halakhah, so the
                    // reader gets the passage's whole discussion and not just
                    // the one note on the word they happened to hit. Notes with
                    // no halakhah at all are chapter-scoped (Chasdei David's
                    // Seder Taharot pages cite no halakhah) and belong to every
                    // halakhah in the chapter -- dropping them would silently
                    // hide a whole seder's commentary.
                    entriesFor(addr) {
                        if (!index || addr.chapter == null || addr.halakhah == null) return [];
                        return index.chapter(addr.chapter)
                            .filter(entry => entry.halakhah === addr.halakhah
                                          || entry.halakhah == null)
                            .map(toPanelEntry);
                    },
                    headingFor(addr) {
                        if (addr.chapter == null || addr.halakhah == null) return '';
                        return `פרק ${convert_number(addr.chapter + 1)}, הלכה ${addr.halakhah + 1}`;
                    },
                },
            });

            panel.setCredit(commentaryCredit(
                ctx && ctx[dataKey] && ctx[dataKey][slug]));

            return {
                select(addr) { panel.select(addr); },
                setContext(next) { setCtx(next); panel.setContext(); },
                destroy() { panel.destroy(); },
            };
        },
    };
}

// --- OCR'd commentary layers (private) --------------------------------------
// Chasdei David and Tekhelet Mordechai, from our own OCR. Their data lives in
// data/commentaries-private/, which is gitignored: the public variants site must
// not ship them. A layer whose file is absent is simply unavailable, so the
// public deploy needs no special casing -- it just has two fewer tabs.

function escapeHtmlText(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// These notes are plain OCR text plus the lemma the chunker cut them at, so the
// display markup is built here rather than coming from the source (unlike the
// Lieberman editions, whose own markup is rendered as authored). The lemma is
// bolded to read like a dibbur hamatchil, which is what it is standing in for.
// The chunker's comment_text often begins with the lemma it cut at, so bolding
// the lemma separately would print it twice. Compared on Hebrew letters only,
// because the two copies differ in OCR punctuation and line breaks.
function stripLeadingLemma(text, lemma) {
    if (!text || !lemma) return text;
    const letters = (s) => s.replace(/[^\u05D0-\u05EA]/g, '');
    const key = letters(lemma);
    if (!key) return text;
    let seen = '';
    for (let i = 0; i < text.length; i++) {
        seen += letters(text[i]);
        if (seen === key) return text.slice(i + 1).replace(/^[\s.,:;]+/, '');
        if (!key.startsWith(seen)) return text;
    }
    return text;
}

// What an unplaced OCR note means depends on whether the chunker gave it a lemma
// at all:
//   - a lemma we couldn't find in the text -> the commentator was remarking on
//     that phrase; we failed to locate it. Often because the lemma quotes some
//     OTHER text (a Bavli or parallel baraita the author cites), which is
//     inherent to lemma-based anchoring rather than a defect.
//   - no lemma -> a marker-less chunk, which for these editions is the tail of a
//     comment that began on the previous printed page.
//
// The scan page is deliberately NOT shown. `scanPage` is the page index within
// the volume PDF, front matter included -- not the printed page number, which
// for Chasdei David sits in the running header at a different value entirely
// (scan page 20 is printed page לז = 37) and for Tekhelet Mordechai isn't
// recoverable from what we OCR'd at all. Displaying it as "עמ׳ N" invited a
// citation that would simply be wrong.
function ocrPanelEntry(entry) {
    const body = escapeHtmlText(stripLeadingLemma(entry.text, entry.lemma));
    const lemma = entry.lemma ? `<b>${escapeHtmlText(entry.lemma)}</b> ` : '';
    let metaLabel = null;
    if (entry.baseIdx == null) {
        metaLabel = entry.lemma
            ? 'מקום מדויק בקטע לא זוהה'
            : 'המשך מהעמוד הקודם';
    }
    return { ...entry, html: lemma + body, lineRef: null, metaLabel };
}

function ocrCommentaryLayer({ id, slug, label, title }) {
    return commentaryLayer({
        id, slug, label, title,
        navButtonId: COMMENTARY_NAV_BUTTON,
        dataKey: 'ocrCommentaryBySlug',
        // The print (defus) witness is a fallback matching surface for lemmas
        // the base text can't place -- see ocrMatchSurfaces.
        buildIndex: (data, ctx) => createOcrCommentaryIndex(data, ctx.textData, id, ctx.witnessData),
        toPanelEntry: ocrPanelEntry,
    });
}

// All commentaries share one nav button: they live in one dock as tabs, so a
// button apiece would be redundant and wouldn't scale past the four editions
// planned. Order here is the tab order.
const COMMENTARY_NAV_BUTTON = 'commentaryMode';

const COMMENTARY_LAYERS = [
    commentaryLayer({
        id: 'brief', slug: 'BriefCommentary', navButtonId: COMMENTARY_NAV_BUTTON,
        label: 'פירוש קצר', title: 'פירושו הקצר של ליברמן (מהדורת וינה)',
    }),
    commentaryLayer({
        id: 'kifshuta', slug: 'Kifshuta', navButtonId: COMMENTARY_NAV_BUTTON,
        label: 'תוספתא כפשוטה', title: 'פירושו הארוך של ליברמן',
    }),
    ocrCommentaryLayer({
        id: 'chasdei-david', slug: 'ChasdeiDavid',
        label: 'חסדי דוד', title: 'חסדי דוד -- ר\' דוד פארדו (OCR פנימי)',
    }),
    ocrCommentaryLayer({
        id: 'tekhelet-mordechai', slug: 'TekheletMordechai',
        label: 'תכלת מרדכי', title: 'תכלת מרדכי -- ר\' מרדכי פרידמן (OCR פנימי)',
    }),
];

// --- scroll following -------------------------------------------------------
// Keep the commentary abreast of the passage the reader is actually looking at,
// so a long halakhah doesn't have to be clicked to be commented on.
//
// The emitted address is deliberately halakhah-scoped (no baseIdx): scrolling
// isn't a word-level gesture, and a halakhah-scoped selection means "show
// everything here" without any note being singled out. Two useful consequences
// fall out of that rather than needing special cases -- the manuscript panel
// ignores it (it wants a word and a witness, and bails without them), and no
// note gets spuriously highlighted.
//
// Only a CHANGE of halakhah emits. Otherwise scrolling within the halakhah a
// reader just clicked into would immediately coarsen their word-precise
// selection and drop the note they had raised.
const PIN_STORAGE_KEY = 'tosefta.commentary.pinned';
// Where we consider the reader's eye to be, in viewport coordinates. Matches
// the observer's top rootMargin, and the perek/halakhah TOC's convention.
const FOLLOW_LINE_PX = 60;

// How long an explicit selection (a click on a word, a synopsis row, a footnote
// marker) is protected from being overridden by scroll-following.
//
// Those gestures scroll the body themselves -- reverse sync centres the word
// they refer to -- and that programmatic scroll is indistinguishable, to an
// IntersectionObserver, from the reader scrolling. Without this the sequence was:
// click -> body scrolls -> follower reads a new passage -> panel re-renders on a
// different halakhah, discarding the very note that was clicked. The window only
// has to outlast the smooth scroll settling.
const FOLLOW_SETTLE_MS = 1200;

function createScrollFollower({ container, selection, isPinned }) {
    let observer = null;
    let work = null;
    let lastExplicitAt = 0;
    // An explicit selection defers following; a scroll-driven one obviously
    // must not, or the first emission would lock the follower out.
    selection.subscribe((addr, meta) => {
        if (meta && meta.source !== 'scroll') lastExplicitAt = Date.now();
    });
    // Which paragraphs are currently in the band. Maintained across callbacks
    // because an IntersectionObserver reports only the entries whose state
    // CHANGED, not every observed element -- deciding from one callback's
    // entries alone means deciding from a partial view of the page.
    const intersecting = new Set();

    function disconnect() {
        if (observer) { observer.disconnect(); observer = null; }
        intersecting.clear();
    }

    // The passage the reader perceives at the top of the reading area: the
    // first one STARTING at or below the reading line, else the one we're
    // inside (the last to start above it). Measured live rather than from the
    // entries' cached rects, which go stale as scrolling continues.
    function currentParagraph() {
        let below = null, above = null;
        intersecting.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top >= FOLLOW_LINE_PX - 1) {
                if (!below || top < below.top) below = { el, top };
            } else if (!above || top > above.top) {
                above = { el, top };
            }
        });
        return (below || above || {}).el || null;
    }

    return {
        setContext(ctx) {
            disconnect();
            work = ctx && ctx.masechet;
            if (!container || !work) return;

            // Same rootMargin convention as the perek/halakhah TOC observer:
            // treat whatever sits near the top of the viewport as "current".
            observer = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) intersecting.add(e.target);
                    else intersecting.delete(e.target);
                });
                if (isPinned()) return;
                if (Date.now() - lastExplicitAt < FOLLOW_SETTLE_MS) return;
                const el = currentParagraph();
                if (!el) return;
                const m = /^hal-(\d+)-(\d+)$/.exec(el.id);
                if (!m) return;
                const chapter = Number(m[1]), halakhah = Number(m[2]);
                const current = selection.get();
                if (current && current.chapter === chapter && current.halakhah === halakhah) return;
                selection.set(
                    MidrashViewerCore.address.makeAddress(work, chapter, halakhah, null),
                    { source: 'scroll' });
            }, { rootMargin: `-${FOLLOW_LINE_PX}px 0px -70% 0px` });

            container.querySelectorAll('.paragraph-pair[id]').forEach(el => observer.observe(el));
        },
        destroy: disconnect,
    };
}

// --- registry ---------------------------------------------------------------
// Docks are regions, not tab groups. The bottom row holds two of them because
// synopsis-beside-folio is a real combination a reader wants -- comparing a
// witness transcription against the actual page. Collapsing them into one
// tabbed dock would make that impossible. The side dock is where the
// commentaries go, and is the one place tabs are expected to appear.
function createToseftaViewer() {
    const selection = MidrashViewerCore.createSelection();

    // Pin: stop the commentary following the reader's scroll position, for
    // reading a note while scrolling the text elsewhere (comparing a passage
    // against what a commentator says about another). A dock-level control, not
    // a per-layer one -- which tab is open has nothing to do with it.
    let pinned = false;
    try { pinned = localStorage.getItem(PIN_STORAGE_KEY) === '1'; } catch { /* ignore */ }
    const pinButton = document.createElement('button');
    pinButton.type = 'button';
    pinButton.className = 'dock-pin';
    pinButton.textContent = '📌';
    function syncPinButton() {
        pinButton.classList.toggle('active', pinned);
        pinButton.setAttribute('aria-pressed', pinned ? 'true' : 'false');
        pinButton.title = pinned
            ? 'הפירוש מקובע -- לא יעקוב אחר הגלילה'
            : 'קבע את הפירוש (לא יעקוב אחר הגלילה)';
    }
    syncPinButton();
    pinButton.addEventListener('click', () => {
        pinned = !pinned;
        syncPinButton();
        try { localStorage.setItem(PIN_STORAGE_KEY, pinned ? '1' : '0'); } catch { /* ignore */ }
    });

    const docks = {};
    [
        ['manuscript', 'manuscript-dock'],
        ['side', 'side-dock'],
    ].forEach(([name, elementId]) => {
        const root = document.getElementById(elementId);
        if (!root) return;
        docks[name] = MidrashViewerCore.createDock({
            root,
            headerControls: name === 'side' ? pinButton : null,
            onVisibilityChange(visible) {
                document.body.classList.toggle(`${name}-dock-open`, visible);
                if (!visible) {
                    // Closing a dock switches its layers off, so the nav toggle
                    // and the dock can't disagree about what's showing.
                    registry.enabled()
                        .filter(l => l.placement === name)
                        .forEach(l => registry.setEnabled(l.id, false));
                }
            },
        });
    });

    const registry = MidrashViewerCore.createLayerRegistry({
        docks,
        selection,
        storageKey: 'tosefta.layers.v1',
        profiles: {
            // The public variants site and the fuller edition are the same code
            // with different presets; a profile lists what's ON, so a layer
            // absent here is off rather than unavailable.
            'variant-lab': ['manuscript'],
            'reading': ['brief', 'kifshuta', 'chasdei-david', 'tekhelet-mordechai'],
        },
    });

    registry.register(MANUSCRIPT_LAYER);
    COMMENTARY_LAYERS.forEach(layer => registry.register(layer));

    // A nav button may govern SEVERAL layers (every commentary shares one).
    // Group by button so a button is shown when any of its layers has data,
    // reads pressed when any is on, and toggles all of them together.
    function layersFor(navButtonId) {
        return registry.all().filter(l => l.navButtonId === navButtonId);
    }

    function navButtonIds() {
        return [...new Set(registry.all().map(l => l.navButtonId).filter(Boolean))];
    }

    // Keep the header's nav buttons showing what the registry actually thinks.
    // Anything can change a layer's state -- the nav button, a dock's close
    // button, loading a tractate that doesn't have the data, applying a profile
    // -- so the buttons are derived from the registry on every change rather
    // than set by whichever control happened to be clicked. (Before this, the
    // dock's ✕ switched the layer off and left the button reading "pressed".)
    registry.onChange(() => {
        const availableIds = new Set(registry.available().map(l => l.id));
        navButtonIds().forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const group = layersFor(id);
            btn.hidden = !group.some(l => availableIds.has(l.id));
            setNavToggleOn(id, group.some(l => registry.isEnabled(l.id)));
        });
    });

    // Turning a group on enables every layer in it that has data for this
    // tractate; turning it off disables all. So the commentary button opens the
    // dock with one tab per available commentary, and shuts the lot.
    registry.toggleNavGroup = function (navButtonId) {
        const group = layersFor(navButtonId);
        const anyOn = group.some(l => registry.isEnabled(l.id));
        group.forEach(l => registry.setEnabled(l.id, !anyOn));
        return registry;
    };

    registry.scrollFollower = createScrollFollower({
        container: document.getElementById('content-container'),
        selection,
        isPinned: () => pinned,
    });

    return registry;
}
