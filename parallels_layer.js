// Tosefta parallels: a third kind of apparatus, alongside the variant notes and
// the commentaries.
//
// What makes it a distinct kind rather than another commentary tab is that a
// parallel is an EXTENT, not a point. A commentary note attaches to a word; a
// parallel says "these eighteen words of our text also stand over there", and
// the reader's first question is always how far it runs -- whether the Bavli's
// version covers this whole halakhah or only its opening clause. So the layer
// has two halves, registered separately because they live in different places:
//
//   parallels           a dock panel, in the far margin the commentaries share:
//                       the citations, grouped by work, each opening to show the
//                       parallel's own text with the aligned words marked.
//   parallel-extents    an inline layer that decorates the reading column
//                       itself: a bar per parallel in a gutter down the edge of
//                       the text, spanning exactly the words it covers, and
//                       (optionally) breaks dividing a halakhah into the
//                       subunits its parallels carve it into.
//
// They share one nav button and one focus channel, so clicking a bar raises its
// citation and opening a citation lights up its bar.
//
// Beside-mode (layoutParallelsBeside) redraws that division. It splits the
// halakhah into subparagraphs at the text's own punctuation, gives each one a
// citation list in the NEAR margin -- level with its words, opening into the
// parallel's text in place -- and leaves the far margin holding only what could
// not be placed there. Extents stay geometry throughout: bars, measured, one
// gutter per subparagraph.
//
// Extents come from data/parallels/Parallels_<Tractate>.json, where
// build_tosefta_parallels.py has already aligned each parallel's text against
// our word stream. Anchoring precision is per-entry and is displayed, because
// it varies enormously: 'span' is a measured word extent, 'dh' is the editor's
// own dibbur hamatchil and so a start but not an end, and 'halakhah'/'chapter'
// mean we know only the cited unit. Only 'span' entries get a bar -- drawing a
// halakhah-wide bar for a citation we couldn't actually place would dress a
// guess up as a measurement.

// Ordered as a reader ranks them: the Mishnah our baraita comments on, then the
// two Talmuds that quote it, then Tosefta-internal doublets, then the midrashic
// literature, then Scripture. Colours are deliberately distinguishable at 4px
// wide, which is all a gutter bar gets.
const PARALLEL_GROUPS = [
    { id: 'mishnah', label: 'משנה', color: '#1f6f5c' },
    { id: 'bavli', label: 'תלמוד בבלי', color: '#8c4a1f' },
    { id: 'yerushalmi', label: 'תלמוד ירושלמי', color: '#2a5b8c' },
    { id: 'tosefta', label: 'תוספתא', color: '#6b4c9a' },
    { id: 'midrash', label: 'מידרשי הלכה ואגדה', color: '#a3781f' },
    { id: 'tanakh', label: 'מקרא', color: '#5a6b3a' },
];

const PARALLEL_GROUP_BY_ID = new Map(PARALLEL_GROUPS.map(g => [g.id, g]));

// Hebrew names for the merged union's source slugs. A reader deciding how much
// to trust a citation wants to know who says it -- Lieberman's own apparatus and
// an OCR'd masoret hashas are not equal evidence -- so the sources are named
// rather than merely counted.
const PARALLEL_SOURCE_NAMES = {
    lieberman_tosefta_apparatus: 'מסורת התוספתא (ליברמן)',
    sefaria_links: 'ספריא',
    mishnah_sefaria_links: 'ספריא (משנה)',
    mishnah_connections_workbook: 'רשימת מקבילות למשנה',
    moskovits_yerushalmi_db: 'מקבילות הירושלמי (מוסקוביץ)',
    yefe_einayim_apparatus: 'יפה עינים',
    sifre_bamidbar_kahana_apparatus: 'ספרי במדבר (כהנא)',
    sifrei_devarim_finkelstein_apparatus: 'ספרי דברים (פינקלשטיין)',
    mekhilta_horowitz_apparatus: 'מכילתא (הורוביץ-רבין)',
    bereshit_rabbah_ta_apparatus: 'בראשית רבה (תיאודור-אלבק)',
    vayikra_rabbah_margoliot_apparatus: 'ויקרא רבה (מרגליות)',
    pesikta_drk_apparatus: 'פסיקתא דרב כהנא (מנדלבוים)',
    seder_olam_apparatus: 'סדר עולם (מיליקובסקי)',
    adrn_schechter_apparatus: 'אבות דר\' נתן (שכטר)',
    adrn_recension_alignment: 'אדר"נ -- הקבלת הנוסחאות',
};

// Editions still in copyright, whose citations are not ours to publish. What
// they contribute is a SELECTION of parallels -- the individual "this stands
// parallel to that" is a fact, but the list is the edition's work -- so they are
// stripped out of data/parallels itself by strip_restricted_parallels.js, and
// this is the second line: whatever a rebuild puts back, the viewer drops on
// load. A citation one of them shares with a free source survives on that
// source; one nothing else vouches for goes with it.
const PARALLEL_RESTRICTED_SOURCES = new Set([
    'oz_vehadar_masoret_hashas',
    'oz_vehadar_yerushalmi_masoret',
    'ofek_sifra_masoret',
]);

// Applied at fetch time (getParallelsData), before anything counts, filters or
// draws an entry, so no later code has to know that these slugs ever existed.
// Mutates in place -- the JSON is freshly parsed per tractate load and has no
// other owner.
function sanitizeParallelsData(data) {
    if (!data || !data.chapters) return data;
    Object.keys(data.chapters).forEach(chapter => {
        const kept = data.chapters[chapter].filter(entry => {
            const sources = entry.sources || [];
            const survivors = sources.filter(s => !PARALLEL_RESTRICTED_SOURCES.has(s));
            if (survivors.length === sources.length) return true;
            if (!survivors.length) return false;
            entry.sources = survivors;
            entry.numSources = survivors.length;
            if (entry.apparatusHome) {
                entry.apparatusHome = entry.apparatusHome
                    .filter(s => !PARALLEL_RESTRICTED_SOURCES.has(s));
            }
            if (entry.tier === 'corroborated' && survivors.length === 1) {
                entry.tier = 'single-source';
            }
            return true;
        });
        if (kept.length) data.chapters[chapter] = kept;
        else delete data.chapters[chapter];
    });
    if (data.sourceSchemes) {
        PARALLEL_RESTRICTED_SOURCES.forEach(s => delete data.sourceSchemes[s]);
    }
    return data;
}

const PARALLEL_PRECISION_LABELS = {
    span: 'היקף מזוהה',
    dh: 'ראש הקטע בלבד',
    halakhah: 'הלכה בלבד',
    chapter: 'פרק בלבד',
};


// --- note mode ---------------------------------------------------------------
// Two ways to read the same margin.
//
//   notes  Lieberman's מסורת התוספתא as printed -- the note whole, with its
//          references live inside the sentence. This is what the apparatus
//          actually says, and in the 33 tractates he edited it is the default.
//   list   The derived index: every citation from every source, resolved,
//          merged and regrouped by the work it points at.
//
// The list is more complete and the notes are more faithful, and neither is a
// substitute for the other. What the list cannot show is the note: one printed
// comment citing the Yerushalmi, the Bavli and אבות דר"ן becomes three rows
// under three headings, and the אבות דר"ן reference becomes nothing at all,
// because we can recognise midrashic works without being able to place them.
// In note mode that reference is on screen, marked as unplaceable rather than
// silently dropped -- which is the whole reason the mode exists.
//
// Note mode shows Lieberman and only Lieberman: the other sources have no note
// to appear inside. They are one switch away in list mode.
const PARALLEL_MODES = { notes: 'notes', list: 'list' };

function parallelsApparatusAvailable(apparatusData) {
    return !!(apparatusData && Array.isArray(apparatusData.text)
              && apparatusData.text.length);
}

// A reference span the parser resolved to a Sefaria address is clickable; one it
// merely recognised is marked and inert; an edition citation ("עמ' 14", "הוצ'
// בובר") is not a reference at all and stays as prose. Roughly 79 / 6 / 7 of
// every 100 printed spans, with the remaining 8 unparsed and likewise prose.
// The variants sidebar's "הוסתרו N מתוך M", for the references inside the notes
// on screen. Without it a filter that de-activates half the apparatus does so
// silently -- the note text is unchanged, so nothing else on screen moves.
function apparatusFilterNote(notes, resolve) {
    let total = 0;
    let hidden = 0;
    (notes || []).forEach(note => {
        (note.spans || []).forEach(span => {
            if (span.t !== 'ref' || !span.ref) return;
            const entry = resolve(span.ref);
            if (!entry) return;
            total++;
            if (!parallelsFilter.matches(entry)) hidden++;
        });
    });
    if (!hidden) return '';
    return parallelsFilter.showFiltered
        ? `${hidden} מתוך ${total} הציונים מסוננים, ומוצגים כמחוקים`
        : `${hidden} מתוך ${total} הציונים מסוננים ואינם לחיצים`;
}

function apparatusSpanKind(span) {
    if (span.t !== 'ref') return 'text';
    if (span.status === 'resolved' || span.ref) return 'ref';
    if (span.status === 'midrash') return 'unplaceable';
    return 'text';
}

// A tier the merge assigns from how well the sources agree. Shown as a dot count
// rather than a word: it is a rough confidence, and spelling it out would give
// it more authority than it has.
const PARALLEL_TIER_WEIGHT = { strong: 3, medium: 2, weak: 1, 'single-source': 1 };

// Corroboration as a dot count: how many independent sources say this, capped at
// what the tier distinguishes. A single-source citation and one four editions
// agree on are very different claims, and the difference is worth two pixels.
function parallelStrength(entry) {
    return Math.min(4, Math.max(entry.numSources || 1,
                                PARALLEL_TIER_WEIGHT[entry.tier] || 1));
}

function parallelSourceList(entry) {
    return (entry.sources || [])
        .map(s => PARALLEL_SOURCE_NAMES[s] || s)
        .join(' · ');
}

function parallelColor(entry) {
    return (PARALLEL_GROUP_BY_ID.get(entry.group) || {}).color || '#8a7a63';
}

// Reading rank, for the margin list: the order PARALLEL_GROUPS is written in.
const PARALLEL_GROUP_RANK = new Map(PARALLEL_GROUPS.map((g, i) => [g.id, i]));

// Hebrew names for the individual works. Only the midrash group actually needs
// them -- everywhere else the group IS the work -- but a fallback to the raw
// English string means a work added upstream shows up named after itself rather
// than not at all.
const PARALLEL_WORK_NAMES = {
    'Mishnah': 'משנה',
    'Bavli': 'תלמוד בבלי',
    'Yerushalmi': 'תלמוד ירושלמי',
    'Tosefta': 'תוספתא',
    'Tanakh': 'מקרא',
    'Sifra': 'ספרא',
    'Sifre Bamidbar (Kahana)': 'ספרי במדבר',
    'Sifrei Devarim': 'ספרי דברים',
    'Mekhilta DeRabbi Yishmael': 'מכילתא דר\' ישמעאל',
    'Midrash Rabbah': 'מדרש רבה',
    'Pesikta DeRav Kahana': 'פסיקתא דרב כהנא',
    'Avot DeRabbi Natan': 'אבות דר\' נתן',
    'Seder Olam': 'סדר עולם',
};

function parallelWorkName(work) {
    return PARALLEL_WORK_NAMES[work] || work;
}


// Sources that are an apparatus TO the Tosefta -- printed at a particular
// passage of it, so that each of their citations has a near end and a far end.
// Only Lieberman's מסורת התוספתא is one today; everything else here is either a
// link graph with no printed locus at all (Sefaria) or an apparatus to some
// other work that happens to cite us (מסורת הש"ס, מסורת הספרא), where "which
// end is this" is not a question that arises. The builder records the near end
// as `apparatusHome`; this list is what makes its absence meaningful.
const PARALLEL_HOME_BEARING_SOURCES = new Set(['lieberman_tosefta_apparatus']);

// A citation that reaches this passage only as the far end of a note printed on
// another one -- Lieberman writing "see Tosefta Chullin" in Bava Kamma, which
// arrives here looking exactly like an apparatus note on Chullin. It is a real
// parallel and stays by default; it is simply not this tractate's apparatus, and
// mistaking the two is what makes Lieberman look like he annotated Kodashim.
// An entry that any other source also vouches for is not far-end-only: the
// Sefaria link stands on its own regardless of where Lieberman printed his note.
function parallelIsFarEndOnly(entry) {
    const sources = entry.sources || [];
    if (!sources.length) return false;
    const home = entry.apparatusHome || [];
    return sources.every(s => PARALLEL_HOME_BEARING_SOURCES.has(s) && !home.includes(s));
}


// --- reader-side filtering --------------------------------------------------
// Which parallels are worth seeing is a question about the reader's task, not
// about the data. Someone tracing a halakhah through the two Talmuds does not
// want four hundred Sifra citations in the margin; someone checking what
// Lieberman himself cited does not want an OCR'd masoret hashas voting
// alongside him. So the filter carries the four axes that actually separate one
// citation from another -- which work it points at, who says so, how precisely
// it is placed, and how many independent sources agree.
//
// State is stored by EXCLUSION rather than inclusion, so that a work or a source
// added upstream tomorrow shows by default instead of vanishing because nobody
// had ticked a box that did not exist when the reader last touched this panel.
//
// The filter is global rather than per-tractate: a reader who has switched the
// Bavli off means it, and having it come back on every tractate switch would be
// a bug, not a courtesy.
function createParallelsFilter() {
    const subscribers = new Set();
    const state = {
        groups: new Set(),      // excluded group ids
        works: new Set(),       // excluded work names
        sources: new Set(),     // excluded source slugs
        precisions: new Set(),  // excluded precision levels
        // Axis keys the reader has decided about themselves ("sources:slug").
        // A per-tractate default may set an axis on load, but only until the
        // reader touches it -- after that the default stops second-guessing them.
        touched: new Set(),
        minSources: 1,          // corroboration floor
        soloSource: null,       // show only what this source itself cites
        hideCompare: false,     // drop the ועיין / השווה cross-references
        hideBacklinks: false,   // drop notes printed on some other passage
        // How the margin reads, not what is in it -- so it lives here with the
        // rest of the reader's standing choices, but `matches` never consults it.
        mode: PARALLEL_MODES.notes,
        // The variants sidebar's "הצג חילופים מוסתרים", for note mode: bring the
        // filtered-out references back, marked, instead of leaving them as prose.
        showFiltered: false,
    };
    let version = 0;

    function notify() {
        version++;
        subscribers.forEach(fn => {
            try { fn(); } catch (err) { console.error(err); }
        });
    }

    return {
        get version() { return version; },
        state,
        subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
        changed: notify,

        excluded(axis, key) { return state[axis].has(key); },
        touch(axis, key) { state.touched.add(`${axis}:${key}`); },
        touched(axis, key) { return state.touched.has(`${axis}:${key}`); },
        setExcluded(axis, key, excluded) {
            const set = state[axis];
            state.touched.add(`${axis}:${key}`);
            if (excluded ? set.has(key) : !set.has(key)) return;
            if (excluded) set.add(key); else set.delete(key);
            notify();
        },
        get minSources() { return state.minSources; },
        set minSources(n) {
            if (state.minSources === n) return;
            state.minSources = n;
            notify();
        },
        get soloSource() { return state.soloSource; },
        set soloSource(slug) {
            if (state.soloSource === (slug || null)) return;
            state.soloSource = slug || null;
            notify();
        },
        get hideCompare() { return state.hideCompare; },
        set hideCompare(on) {
            if (state.hideCompare === !!on) return;
            state.hideCompare = !!on;
            notify();
        },
        get hideBacklinks() { return state.hideBacklinks; },
        set hideBacklinks(on) {
            if (state.hideBacklinks === !!on) return;
            state.hideBacklinks = !!on;
            notify();
        },
        get mode() { return state.mode; },
        set mode(next) {
            const value = PARALLEL_MODES[next] || PARALLEL_MODES.list;
            if (state.mode === value) return;
            state.mode = value;
            notify();
        },
        get showFiltered() { return state.showFiltered; },
        set showFiltered(on) {
            if (state.showFiltered === !!on) return;
            state.showFiltered = !!on;
            notify();
        },
        // "הצג הכל" means all of it, including whatever a per-tractate default
        // switched off -- so the defaults are marked decided rather than merely
        // cleared, or the very next render would put them straight back.
        reset() {
            ['groups', 'works', 'sources', 'precisions'].forEach(a => state[a].clear());
            PARALLEL_HOME_BEARING_SOURCES.forEach(s => {
                state.touched.add(`sources:${s}`);
                state.touched.add(`solo:${s}`);
            });
            state.minSources = 1;
            state.soloSource = null;
            state.hideCompare = false;
            state.hideBacklinks = false;
            notify();
        },
        get active() {
            return state.groups.size || state.works.size || state.sources.size
                || state.precisions.size || state.minSources > 1 || state.soloSource
                || state.hideCompare || state.hideBacklinks;
        },

        // Excluding a source means "this alone doesn't convince me", not "erase
        // everything it ever touched": a citation the excluded source shares
        // with Lieberman is still Lieberman's citation, so an entry survives as
        // long as one source still standing vouches for it. Its corroboration
        // count is judged on the survivors for the same reason.
        //
        // soloSource is the opposite question, and so is a separate axis rather
        // than "exclude all the others": it asks to see one apparatus as its
        // editor left it -- Lieberman's מסורת התוספתא and nothing else, with the
        // later editions, the OCR'd masoret hashas and Sefaria's link graph all
        // out of the way. Excluding by name could never express that, because
        // the list of others is open-ended.
        //
        // And it asks for the apparatus ON this passage: `apparatusHome` names
        // the sources whose note is actually printed here, as against the far
        // end of a note printed somewhere else, which arrives carrying the same
        // source name. Solo mode requires home, because a reader asking for
        // Lieberman's apparatus on this halakhah does not mean "a Bava Kamma
        // note that happens to mention this halakhah". hideBacklinks applies the
        // same test without narrowing to one source.
        matches(entry) {
            if (state.groups.has(entry.group)) return false;
            if (state.works.has(entry.work)) return false;
            if (state.precisions.has(entry.precision)) return false;
            if (state.hideCompare && entry.compare) return false;
            if (state.hideBacklinks && parallelIsFarEndOnly(entry)) return false;
            const home = entry.apparatusHome || [];
            const sources = entry.sources || [];
            if (state.soloSource && !home.includes(state.soloSource)) return false;
            const kept = state.sources.size
                ? sources.filter(s => !state.sources.has(s))
                : sources;
            if (sources.length && !kept.length) return false;
            const count = kept.length || entry.numSources || 1;
            return count >= state.minSources;
        },
    };
}

const parallelsFilter = createParallelsFilter();


// --- focus channel ----------------------------------------------------------
// The panel and the gutter bars are separate layers in separate DOM subtrees and
// neither owns the other. What they share is which parallel the reader is
// currently attending to, so that is what gets shared -- one id, broadcast.
// Deliberately not routed through the core's `selection`: that carries an
// address (chapter/halakhah/word), and a parallel is not an address.
function createParallelsFocus() {
    const subscribers = new Set();
    let current = null;
    return {
        get() { return current; },
        set(entryId, meta) {
            if (current === entryId) return;
            current = entryId;
            subscribers.forEach(fn => {
                try { fn(current, meta || {}); } catch (err) { console.error(err); }
            });
        },
        subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
    };
}

const parallelsFocus = createParallelsFocus();


// --- index ------------------------------------------------------------------

function hasParallelsData(ctx) {
    const data = ctx && ctx.parallelsData;
    return !!(data && data.chapters && Object.keys(data.chapters).length);
}

// Lane packing, so overlapping parallels sit side by side instead of on top of
// one another. Greedy first-fit over entries sorted by start: the classic
// interval-graph colouring, which is optimal for the number of lanes and, more
// to the point here, stable -- an entry keeps its lane as the reader scrolls,
// because the assignment depends only on the chapter's entries and their order.
function assignParallelLanes(entries) {
    const laneEnds = [];
    const lanes = new Map();
    entries.forEach(entry => {
        let lane = laneEnds.findIndex(end => end < entry.baseIdx);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(entry.endIdx);
        } else {
            laneEnds[lane] = entry.endIdx;
        }
        lanes.set(entry.id, lane);
    });
    return { lanes, laneCount: laneEnds.length };
}

function createParallelsIndex(parallelsData, textData) {
    const cache = new Map();

    // Cached per chapter AND per filter version: the reader's filter changes
    // which entries exist as far as everything downstream is concerned, and
    // lanes have to be re-packed against the survivors -- switching the Bavli
    // off should narrow the gutter, not leave its lane standing empty.
    function chapter(chapterIndex) {
        const key = `${chapterIndex}:${parallelsFilter.version}`;
        if (!cache.has(key)) {
            // Stale versions are dead weight -- a reader ticking through a dozen
            // works would otherwise accumulate a dozen copies of every chapter.
            if (cache.size > 32) cache.clear();
            const all = (parallelsData.chapters || {})[String(chapterIndex)] || [];
            const raw = all.filter(e => parallelsFilter.matches(e));
            // Entries arrive sorted by position from the builder; re-sorting here
            // keeps the lane assignment correct even if that ever changes.
            const entries = raw.slice().sort((a, b) =>
                a.baseIdx - b.baseIdx || a.endIdx - b.endIdx || a.ref.localeCompare(b.ref));
            const spans = entries.filter(e => e.precision === 'span');
            const { lanes, laneCount } = assignParallelLanes(spans);
            // Note mode needs the filtered-out ones too: a reference the reader
            // has switched off still has to be recognised as a reference, so it
            // can be shown as filtered rather than as unresolvable.
            cache.set(key, { entries, spans, lanes, laneCount, entriesUnfiltered: all });
        }
        return cache.get(key);
    }

    return {
        get tractate() { return parallelsData.tractate; },
        chapter,

        // Everything touching a halakhah, whether it starts there or runs
        // through it. A parallel that begins in the previous halakhah and
        // continues into this one is exactly the thing a reader most wants
        // flagged, so membership is by overlap, not by start.
        forHalakhah(chapterIndex, halakhah) {
            return chapter(chapterIndex).entries.filter(e => {
                const from = e.halakhah == null ? halakhah : e.halakhah;
                const to = e.endHalakhah == null ? from : e.endHalakhah;
                return halakhah >= from && halakhah <= to;
            });
        },

        // Parallels covering one word, for a click in the body text.
        atWord(chapterIndex, baseIdx) {
            return chapter(chapterIndex).spans
                .filter(e => baseIdx >= e.baseIdx && baseIdx <= e.endIdx);
        },

        entry(chapterIndex, entryId) {
            return chapter(chapterIndex).entries.find(e => e.id === entryId) || null;
        },

        // Where a halakhah's parallels divide it. Each distinct span start
        // inside the halakhah opens a subunit; a start at the very beginning
        // isn't a division, and near-coincident starts (a Mishnah and a Bavli
        // parallel to the same clause, aligned a word apart) are collapsed so
        // the text doesn't get chopped into slivers.
        subunitStarts(chapterIndex, halakhah, range) {
            const [from, to] = range;
            const starts = [];
            chapter(chapterIndex).spans.forEach(e => {
                if (e.baseIdx <= from || e.baseIdx >= to) return;
                if (starts.some(s => Math.abs(s - e.baseIdx) < 3)) return;
                starts.push(e.baseIdx);
            });
            return starts.sort((a, b) => a - b);
        },

        texts: parallelsData.texts || {},
        chapterCount: (textData && textData.text) ? textData.text.length : 0,
    };
}


// --- the apparatus, as printed ----------------------------------------------
// Anchoring is not reimplemented here. `createCommentaryIndex` already takes
// exactly this shape -- Sefaria's nested chapter/halakhah/note arrays of
// "<b>dibbur hamatchil.</b> body" -- places each note by matching its dibbur
// hamatchil against our word stream, and thereby corrects the halakhah the
// source JSON filed it under, which drifts because Lieberman's divisions are
// finer than the ones our text is numbered by. That path is covered by
// test/commentary_anchoring.test.mjs, and the anchor rate IS the quality claim,
// so the apparatus goes through it rather than beside it.
//
// What it does not carry is the reference spans, which live in a parallel
// `spans` array in the source file. They are zipped back on by walk index: the
// ids that anchoring mints end `-<chapter>-<sourceHalakhah>-<seq>`, and `seq`
// counts notes across the chapter in the same order this walk does.
function createApparatusIndex(apparatusData, textData) {
    if (!parallelsApparatusAvailable(apparatusData)) return null;
    const anchored = createCommentaryIndex(apparatusData, textData, 'masoret');
    const byChapter = new Map();

    function spansForChapter(chapterIndex) {
        const flat = [];
        ((apparatusData.spans || [])[chapterIndex] || []).forEach(halakhah => {
            (halakhah || []).forEach(noteSpans => flat.push(noteSpans || []));
        });
        return flat;
    }

    return {
        get title() { return apparatusData.heTitle || apparatusData.title || ''; },
        get credit() { return apparatusData.versionTitle || ''; },

        chapter(chapterIndex) {
            if (!byChapter.has(chapterIndex)) {
                const flatSpans = spansForChapter(chapterIndex);
                const notes = anchored.chapter(chapterIndex).map(note => {
                    const seq = Number(String(note.id).split('-').pop());
                    return Object.assign({}, note, {
                        spans: flatSpans[seq] || [],
                    });
                });
                byChapter.set(chapterIndex, notes);
            }
            return byChapter.get(chapterIndex);
        },

        // Notes belonging to one halakhah, in the order they are printed. The
        // halakhah is the anchored one, not the one the source filed the note
        // under -- see anchorCommentaryChapter.
        forHalakhah(chapterIndex, halakhah) {
            return this.chapter(chapterIndex).filter(n => n.halakhah === halakhah);
        },

        // How the apparatus itself wrote a reference we hold as a Sefaria
        // address -- "בבלי ח' ב'" for Berakhot 8b. List mode has a field for
        // this and until now had nothing true to put in it.
        printedFor(chapterIndex) {
            const map = new Map();
            this.chapter(chapterIndex).forEach(note => {
                (note.spans || []).forEach(span => {
                    if (span.t === 'ref' && span.ref && !map.has(span.ref)) {
                        map.set(span.ref, span.s);
                    }
                });
            });
            return map;
        },
    };
}


// --- parallel text rendering ------------------------------------------------

// Same normalization the builder used before it counted words, so targetSpan
// indices land on the words they were computed against. Marks are stripped
// because our own text is unvocalized and Sefaria's Mishnah is not; without
// this, nothing would align in the first place.
function stripHebrewMarks(text) {
    return String(text == null ? '' : text)
        .normalize('NFD').replace(/\p{Mn}/gu, '').normalize('NFC');
}

function escapeParallelHtml(text) {
    return String(text == null ? '' : text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// The parallel's text with the aligned stretch marked. Everything outside the
// aligned stretch is kept and shown dimmed rather than trimmed away: the context
// is how a reader judges whether the alignment found the right passage, and for
// a Bavli daf the surrounding sugya is half the point of looking.
function renderParallelText(text, targetSpan) {
    const words = stripHebrewMarks(text).trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '';
    if (!targetSpan) return escapeParallelHtml(words.join(' '));
    const [start, end] = targetSpan;
    const parts = [];
    let open = null;
    words.forEach((word, i) => {
        const inSpan = i >= start && i <= end;
        if (inSpan !== open) {
            if (open !== null) parts.push('</span>');
            parts.push(inSpan ? '<span class="parallel-aligned">'
                              : '<span class="parallel-context">');
            open = inSpan;
        }
        parts.push((i > 0 ? ' ' : '') + escapeParallelHtml(word));
    });
    parts.push('</span>');
    return parts.join('');
}

function sefariaUrl(ref) {
    return 'https://www.sefaria.org/' + encodeURIComponent(ref.replace(/ /g, '_'));
}


// --- the panel --------------------------------------------------------------
// Written here rather than reusing the core's commentary panel because the
// content is structurally different: a grouped, collapsible list of citations
// with an embedded second text, not a stream of notes. Reusing the note panel
// would have meant a note whose html happens to contain a whole other text.

function createParallelsPanel({ root, labels = {} }) {
    const text = {
        noSelection: 'לחצו על מילה בטקסט כדי להציג את המקבילות',
        noParallels: 'אין מקבילות רשומות לקטע זה',
        noNotes: 'אין הערה במסורת התוספתא לקטע זה',
        missingText: 'הטקסט של המקבילה אינו זמין כאן',
        openOnSefaria: 'פתיחה בספריא',
        ...labels,
    };

    const container = document.createElement('div');
    container.className = 'parallels-panel';

    const heading = document.createElement('div');
    heading.className = 'parallels-heading';
    container.appendChild(heading);

    // What this panel is NOT showing. In beside-mode the placeable parallels have
    // moved to the margin beside the text, and a dock that said nothing about
    // that would read as "these are all of them".
    const note = document.createElement('p');
    note.className = 'parallels-note';
    note.hidden = true;
    container.appendChild(note);

    const list = document.createElement('div');
    list.className = 'parallels-list';
    container.appendChild(list);

    const empty = document.createElement('p');
    empty.className = 'parallels-empty';
    empty.textContent = text.noSelection;
    container.appendChild(empty);

    // Note mode reproduces Lieberman's apparatus, which Sefaria releases CC-BY.
    // Attribution is the licence condition, so the credit is part of the panel
    // rather than something to remember to add.
    const credit = document.createElement('p');
    credit.className = 'parallels-credit';
    credit.hidden = true;
    container.appendChild(credit);

    root.appendChild(container);

    let entries = [];
    let texts = {};
    let expanded = new Set();
    const rowById = new Map();

    // Note mode's parallel state. Chips are registered by entry id alongside the
    // list's rows so one focus channel lights whichever of the two is on screen.
    let notes = [];
    let resolveEntry = () => null;
    let viewMode = PARALLEL_MODES.list;
    let printedFor = null;
    const chipsById = new Map();

    const sourceList = parallelSourceList;

    function buildRow(entry) {
        const row = document.createElement('div');
        row.className = 'parallel-row';
        row.dataset.entryId = entry.id;
        row.dataset.group = entry.group;
        row.dataset.precision = entry.precision;

        const header = document.createElement('button');
        header.type = 'button';
        header.className = 'parallel-row-header';

        const refLabel = document.createElement('span');
        refLabel.className = 'parallel-ref';
        refLabel.textContent = entry.heRef || entry.ref;
        refLabel.dir = 'auto';
        header.appendChild(refLabel);

        // Which words of OURS this one covers. A long halakhah can be parallel to
        // the same Mishnah in three separate clauses, and those are three
        // different claims -- without a locator they are three identical rows.
        if (entry.anchorText) {
            const locator = document.createElement('span');
            locator.className = 'parallel-anchor-text';
            locator.textContent = entry.anchorText;
            refLabel.appendChild(locator);
        }

        const meta = document.createElement('span');
        meta.className = 'parallel-row-meta';
        // Corroboration as dots: how many independent sources say this, capped
        // at what the tier distinguishes. A single-source citation and one four
        // editions agree on are very different claims.
        const dots = document.createElement('span');
        dots.className = 'parallel-strength';
        dots.textContent = '●'.repeat(parallelStrength(entry));
        dots.title = `${entry.numSources || 1} מקורות: ${sourceList(entry)}`;
        meta.appendChild(dots);

        if (entry.precision !== 'span') {
            const flag = document.createElement('span');
            flag.className = 'parallel-precision';
            flag.textContent = PARALLEL_PRECISION_LABELS[entry.precision] || '';
            meta.appendChild(flag);
        }
        header.appendChild(meta);

        row.appendChild(header);

        const body = document.createElement('div');
        body.className = 'parallel-row-body';
        body.hidden = true;
        row.appendChild(body);

        header.addEventListener('click', () => {
            const open = expanded.has(entry.id);
            if (open) {
                expanded.delete(entry.id);
            } else {
                expanded.add(entry.id);
                fillBody(body, entry);
            }
            body.hidden = open;
            row.classList.toggle('open', !open);
            parallelsFocus.set(open ? null : entry.id, { source: 'panel' });
        });

        header.addEventListener('mouseenter', () => {
            parallelsFocus.set(entry.id, { source: 'panel-hover', transient: true });
        });

        return row;
    }

    function fillBody(body, entry) {
        if (body.dataset.filled === '1') return;
        body.dataset.filled = '1';

        if (entry.dh) {
            const dh = document.createElement('div');
            dh.className = 'parallel-dh';
            dh.textContent = entry.dh;
            body.appendChild(dh);
        }

        const record = texts[entry.ref];
        const passage = document.createElement('div');
        passage.className = 'parallel-passage';
        if (record && record.he) {
            passage.innerHTML = renderParallelText(record.he, entry.targetSpan);
        } else {
            passage.classList.add('parallel-passage-missing');
            passage.textContent = text.missingText;
        }
        body.appendChild(passage);

        const footer = document.createElement('div');
        footer.className = 'parallel-row-footer';

        const cited = document.createElement('span');
        cited.className = 'parallel-cited';
        // What the apparatus actually printed, and in whose numbering we read
        // it. On a tractate where Vilna and Lieberman divide the halakhot
        // differently this is the difference between a citation that lands and
        // one that doesn't, so it is shown rather than buried in the data.
        //
        // The printed form comes from the apparatus's own segmented text where
        // we have it. It used to come from `citations[0]`, which is a merged bag
        // with no record of which source contributed what: 61% of the time that
        // was the dibbur hamatchil -- already displayed above -- and the rest of
        // the time a normalized heRef. It was never what the page said.
        const scheme = entry.citedScheme === 'vilna' ? 'וילנא'
                     : entry.citedScheme === 'lieberman' ? 'ליברמן' : '';
        const printed = printedFor && printedFor.get(entry.ref);
        cited.textContent = printed || entry.heRef || entry.ref;
        cited.title = printed
            ? `כלשון מסורת התוספתא${scheme ? `; מספור ${scheme}, ${entry.citedRef}` : ''}`
            : (scheme ? `מספור ${scheme}, ${entry.citedRef}` : '');
        footer.appendChild(cited);

        const link = document.createElement('a');
        link.className = 'parallel-sefaria-link';
        link.href = sefariaUrl(entry.ref);
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = text.openOnSefaria;
        footer.appendChild(link);

        body.appendChild(footer);

        const sources = document.createElement('div');
        sources.className = 'parallel-sources';
        sources.textContent = sourceList(entry);
        body.appendChild(sources);
    }

    // --- note mode ----------------------------------------------------------

    // Everything up to and including the lemma, split into what is bold and what
    // isn't. Taken from the note's own HTML rather than from the parsed `dh`,
    // which has been trimmed for matching (elisions dropped, brackets stripped)
    // and is a search key, not a reading. A few notes open before the bold --
    // `[<b>(את.)</b> …` -- so the leading text is kept rather than assumed away;
    // the split here is the same one the export used to cut the tail.
    function noteLead(html) {
        const source = html || '';
        const end = source.indexOf('</b>');
        if (end < 0) return { before: '', lemma: '' };
        const open = source.indexOf('<b>');
        if (open < 0 || open > end) return { before: '', lemma: '' };
        return {
            before: source.slice(0, open).replace(/<[^>]+>/g, ''),
            lemma: source.slice(open + 3, end).replace(/<[^>]+>/g, ''),
        };
    }

    // One reference inside a note. Four outcomes, and the reader can tell them
    // apart:
    //   live         resolved, and we hold the passage -- opens it below
    //   link         resolved, but no entry of ours -- goes to Sefaria
    //   unplaceable  a work we recognise and cannot address (the midrashim)
    //   filtered     resolved, but the reader has switched its work off
    // A filtered reference reads as plain text, exactly as a hidden variant
    // leaves its word alone; "הצג מוסתרים" brings it back struck through rather
    // than restoring it, so the reader can see what the filter is costing.
    function buildRefSpan(span, block) {
        // An edition citation ("עמ' 14", "הוצ' בובר") and a pointer the parser
        // could not read are both marked `ref` upstream -- the export records
        // everything the parser touched -- but neither is somewhere a reader can
        // be sent. They read as what they are: prose.
        const kind = apparatusSpanKind(span);
        if (kind === 'text') return document.createTextNode(span.s);

        const entry = span.ref ? resolveEntry(span.ref) : null;
        const filtered = entry && !parallelsFilter.matches(entry);

        if (filtered && !parallelsFilter.showFiltered) {
            return document.createTextNode(span.s);
        }
        if (filtered) {
            const out = document.createElement('span');
            out.className = 'apparatus-ref apparatus-ref-filtered';
            out.textContent = span.s;
            out.title = 'מסונן על ידי הסינון הפעיל';
            return out;
        }
        if (kind === 'unplaceable') {
            const out = document.createElement('span');
            out.className = 'apparatus-ref apparatus-ref-unplaceable';
            out.textContent = span.s;
            out.title = span.work
                ? `${span.work} -- מזוהה אך לא ניתן לאתר את מיקומו המדויק`
                : 'מזוהה אך לא ניתן לאתר את מיקומו המדויק';
            return out;
        }
        if (!entry) {
            // Resolved to an address we simply have no aligned passage for.
            // Still a real citation, so it still goes somewhere.
            const out = document.createElement('a');
            out.className = 'apparatus-ref apparatus-ref-link';
            out.textContent = span.s;
            out.href = sefariaUrl(span.ref);
            out.target = '_blank';
            out.rel = 'noopener';
            out.title = `${span.ref} -- פתיחה בספריא`;
            return out;
        }

        const out = document.createElement('button');
        out.type = 'button';
        out.className = 'apparatus-ref apparatus-ref-live';
        out.textContent = span.s;
        out.title = entry.heRef || entry.ref;
        out.addEventListener('click', () => {
            const body = block.querySelector('.apparatus-note-body');
            const open = block.dataset.openId === entry.id;
            body.innerHTML = '';
            body.dataset.filled = '';
            if (open) {
                block.dataset.openId = '';
                body.hidden = true;
            } else {
                block.dataset.openId = entry.id;
                fillBody(body, entry);
                body.hidden = false;
            }
            block.querySelectorAll('.apparatus-ref-live')
                .forEach(el => el.classList.toggle('open', el === out && !open));
            parallelsFocus.set(open ? null : entry.id, { source: 'panel' });
        });
        out.addEventListener('mouseenter', () => {
            parallelsFocus.set(entry.id, { source: 'panel-hover', transient: true });
        });
        chipsById.set(entry.id, out);
        return out;
    }

    function buildNoteBlock(note) {
        const block = document.createElement('div');
        block.className = 'apparatus-note';

        const line = document.createElement('p');
        line.className = 'apparatus-note-line';

        const lead = noteLead(note.html);
        if (lead.before) line.appendChild(document.createTextNode(lead.before));
        if (lead.lemma) {
            const b = document.createElement('b');
            b.className = 'apparatus-note-lemma';
            b.textContent = lead.lemma;
            line.appendChild(b);
        }
        // A note the export could not segment still reads: its text goes in
        // whole, with nothing clickable. Better a dead note than a missing one.
        (note.spans && note.spans.length
            ? note.spans
            : [{ t: 'text', s: (note.html || '').replace(/^[\s\S]*?<\/b>/, '') }]
        ).forEach(span => {
            line.appendChild(span.t === 'ref'
                ? buildRefSpan(span, block)
                : document.createTextNode(span.s));
        });
        block.appendChild(line);

        const body = document.createElement('div');
        body.className = 'apparatus-note-body parallel-row-body';
        body.hidden = true;
        block.appendChild(body);

        return block;
    }

    function renderNotes() {
        list.innerHTML = '';
        rowById.clear();
        chipsById.clear();
        if (!notes.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;
        const section = document.createElement('section');
        section.className = 'apparatus-notes';
        notes.forEach(n => section.appendChild(buildNoteBlock(n)));
        list.appendChild(section);
    }

    function render() {
        if (viewMode === PARALLEL_MODES.notes) { renderNotes(); return; }
        list.innerHTML = '';
        rowById.clear();
        chipsById.clear();
        if (!entries.length) {
            empty.hidden = false;
            return;
        }
        empty.hidden = true;
        PARALLEL_GROUPS.forEach(group => {
            const mine = entries.filter(e => e.group === group.id);
            if (!mine.length) return;
            const section = document.createElement('section');
            section.className = 'parallel-group';
            section.style.setProperty('--parallel-color', group.color);

            const title = document.createElement('h4');
            title.className = 'parallel-group-title';
            title.textContent = `${group.label} (${mine.length})`;
            section.appendChild(title);

            mine.forEach(entry => {
                const row = buildRow(entry);
                rowById.set(entry.id, row);
                // Re-applied on render, not only on the focus event: setEntries
                // rebuilds these rows, and a focus that arrived before the
                // rebuild would otherwise be lost.
                if (parallelsFocus.get() === entry.id) row.classList.add('focused');
                if (expanded.has(entry.id)) {
                    row.classList.add('open');
                    const body = row.querySelector('.parallel-row-body');
                    body.hidden = false;
                    fillBody(body, entry);
                }
                section.appendChild(row);
            });
            list.appendChild(section);
        });
    }

    const unsubscribe = parallelsFocus.subscribe((entryId, meta) => {
        rowById.forEach((row, id) => row.classList.toggle('focused', id === entryId));
        chipsById.forEach((chip, id) => chip.classList.toggle('focused', id === entryId));
        // A click on a bar in the text should bring its citation into view and
        // open it; a hover should only light it up. Otherwise brushing past the
        // gutter would expand rows the reader never asked for.
        if (!entryId || meta.transient) return;
        // In note mode the citation is a word inside a sentence, so the most it
        // can do is scroll itself into view lit up. Opening the passage under a
        // note the reader never clicked would push the apparatus off screen.
        const chip = chipsById.get(entryId);
        if (chip) { chip.scrollIntoView({ block: 'nearest' }); return; }
        const row = rowById.get(entryId);
        if (!row) return;
        if (meta.source !== 'panel' && meta.expand !== false && !expanded.has(entryId)) {
            expanded.add(entryId);
            const body = row.querySelector('.parallel-row-body');
            fillBody(body, entries.find(e => e.id === entryId));
            body.hidden = false;
            row.classList.add('open');
        }
        row.scrollIntoView({ block: 'nearest' });
    });

    return {
        setEntries(nextEntries, headingText, nextTexts, opts = {}) {
            viewMode = PARALLEL_MODES.list;
            entries = nextEntries || [];
            texts = nextTexts || {};
            printedFor = opts.printedFor || null;
            credit.hidden = true;
            heading.textContent = headingText || '';
            heading.hidden = !headingText;
            note.textContent = opts.note || '';
            note.hidden = !opts.note;
            empty.textContent = opts.emptyText || text.noParallels;
            render();
        },

        // The apparatus itself. `resolve` maps a Sefaria ref to one of our
        // entries, which is what turns a printed reference into something that
        // can open its passage; the panel does not know how that lookup works.
        setNotes(nextNotes, headingText, nextTexts, resolve, opts = {}) {
            viewMode = PARALLEL_MODES.notes;
            notes = nextNotes || [];
            texts = nextTexts || {};
            resolveEntry = resolve || (() => null);
            heading.textContent = headingText || '';
            heading.hidden = !headingText;
            note.textContent = opts.note || '';
            note.hidden = !opts.note;
            empty.textContent = opts.emptyText || text.noNotes;
            credit.textContent = opts.credit || '';
            credit.hidden = !opts.credit || !notes.length;
            render();
        },
        clear() {
            entries = [];
            // Notes too, or a tractate switch leaves the previous tractate's
            // apparatus on screen: clear() re-renders, and render() dispatches on
            // a viewMode that is still `notes`.
            notes = [];
            expanded = new Set();
            heading.textContent = '';
            heading.hidden = true;
            note.hidden = true;
            render();
            empty.textContent = text.noSelection;
        },
        destroy() {
            unsubscribe();
            container.remove();
        },
    };
}


// --- dock layer -------------------------------------------------------------

const PARALLELS_NAV_BUTTON = 'parallelsMode';

const PARALLELS_LAYER = {
    id: 'parallels',
    label: 'מקבילות',
    title: 'מקבילות בספרות התנאים והאמוראים',
    kind: 'parallels',
    placement: 'side',
    navButtonId: PARALLELS_NAV_BUTTON,
    available: hasParallelsData,

    mount(container, ctx) {
        let index = null;
        let panel = null;
        let texts = {};
        let apparatus = null;

        let beside = false;

        function setCtx(next) {
            const data = next && next.parallelsData;
            index = (data && next.textData)
                ? createParallelsIndex(data, next.textData) : null;
            texts = index ? index.texts : {};
            apparatus = (next && next.textData)
                ? createApparatusIndex(next.apparatusData, next.textData) : null;
            beside = !!(next && next.parallelsBeside);
        }
        setCtx(ctx);

        // Note mode reads only where the apparatus exists. Everywhere else the
        // margin is the list, whatever the reader last chose -- there is no note
        // to show in Kodashim, and an empty margin would be the only sign of it.
        function inNoteMode() {
            return !!apparatus && parallelsFilter.mode === PARALLEL_MODES.notes;
        }

        // A printed reference names a passage; our entries name a passage and a
        // span of it, so one printed reference can match several. Prefer the one
        // whose extent we actually measured -- that is the one with a bar in the
        // gutter and words to highlight.
        function entryResolver(chapterIndex) {
            const all = index ? index.chapter(chapterIndex).entriesUnfiltered : [];
            return ref => {
                if (!ref) return null;
                const hits = all.filter(e => e.ref === ref
                                             || e.ref.startsWith(ref + ':'));
                if (!hits.length) return null;
                return hits.find(e => e.precision === 'span') || hits[0];
            };
        }

        panel = createParallelsPanel({ root: container });

        // What the panel says before the reader has selected anything. It differs
        // by mode because the instruction differs: in plain mode a word click
        // fills this panel, and in beside-mode it opens a passage in the margin
        // and fills this panel only with what the margin couldn't take.
        function showResting() {
            if (beside) {
                panel.setEntries([], '', texts,
                    { emptyText: 'כאן יופיעו מקבילות שלא אותרו במדויק' });
            } else {
                panel.clear();
            }
        }
        showResting();

        // The filter changes what the list contains without changing what the
        // reader is looking at, so the panel re-answers the selection it already
        // has rather than being reset through setContext -- which would drop the
        // reader back to "click a word" on every ticked box.
        let lastAddr = null;
        const unsubscribeFilter = parallelsFilter.subscribe(() => api.select(lastAddr));

        const api = {
            select(addr) {
                lastAddr = addr;
                if (!index || !addr || addr.chapter == null) {
                    showResting();
                    return;
                }
                // Beside-mode divides the list between the two margins by what
                // can be placed. Every span-anchored parallel now has a home in
                // the near column, level with the words it covers, so repeating
                // it here would be one list rendered twice. What has no home
                // there is what we could NOT place -- a citation known only to
                // the halakhah or the chapter -- and that is exactly what a
                // list, as opposed to a margin, is good for. It is scoped to the
                // chapter rather than to the click, so it stops churning as the
                // reader moves through the text.
                if (beside) {
                    const all = index.chapter(addr.chapter).entries;
                    const rest = all.filter(e => e.precision !== 'span');
                    const placed = all.length - rest.length;
                    panel.setEntries(rest,
                        `פרק ${convert_number(addr.chapter + 1)} — מקבילות שלא אותרו במדויק`,
                        texts, {
                            note: placed
                                ? `${placed} מקבילות שהיקפן זוהה מוצגות בטור שלצד הטקסט`
                                : '',
                            emptyText: 'כל המקבילות בפרק זה ממוקמות בטור שלצד הטקסט',
                        });
                    return;
                }
                if (inNoteMode()) {
                    const heading = addr.halakhah == null
                        ? `פרק ${convert_number(addr.chapter + 1)}`
                        : `פרק ${convert_number(addr.chapter + 1)}, הלכה ${addr.halakhah + 1}`;
                    const chapterNotes = addr.halakhah == null
                        ? apparatus.chapter(addr.chapter)
                        : apparatus.forHalakhah(addr.chapter, addr.halakhah);
                    const resolve = entryResolver(addr.chapter);
                    panel.setNotes(chapterNotes, heading, texts, resolve, {
                        note: apparatusFilterNote(chapterNotes, resolve),
                        credit: apparatus.title
                            ? `${apparatus.title} · ${apparatus.credit} · CC-BY`
                            : '',
                    });
                    return;
                }
                // List mode still borrows one thing from the apparatus: how it
                // wrote the references it shares with us, for the "as printed"
                // line under each citation.
                const printedFor = apparatus ? apparatus.printedFor(addr.chapter) : null;
                if (addr.halakhah == null) {
                    panel.setEntries(index.chapter(addr.chapter).entries,
                                     `פרק ${convert_number(addr.chapter + 1)}`, texts,
                                     { printedFor });
                    return;
                }
                const entries = index.forHalakhah(addr.chapter, addr.halakhah);
                panel.setEntries(
                    entries,
                    `פרק ${convert_number(addr.chapter + 1)}, הלכה ${addr.halakhah + 1}`,
                    texts, { printedFor });
                // A word-precise click means "what is parallel HERE", so the
                // parallel covering that word is raised. A halakhah-scoped
                // selection (a scroll, a TOC jump) deliberately raises nothing.
                // Raising a parallel from a word click is this layer's job only
                // when the click came from somewhere that doesn't already know
                // which parallel it meant -- a plain body word, a footnote. In
                // beside-mode the affordance itself resolved that and has already
                // set the focus, and repeating it here re-fires with different
                // meta, which is what made the dock expand a passage the reader
                // had just opened in the margin.
                if (addr.baseIdx != null && !beside) {
                    const covering = index.atWord(addr.chapter, addr.baseIdx);
                    if (covering.length) {
                        parallelsFocus.set(covering[0].id, { source: 'text' });
                    }
                }
            },
            setContext(next) {
                setCtx(next);
                lastAddr = null;
                showResting();
            },
            destroy() { unsubscribeFilter(); panel.destroy(); },
        };
        return api;
    },
};


// --- inline layer: extent bars and subunit breaks ---------------------------

// Bars are drawn from measured geometry rather than from character offsets,
// because a parallel routinely starts mid-line and runs over several lines: the
// only thing that knows where those lines broke is the browser after layout.
// Measurement therefore happens after the body render, and again on resize.
const PARALLEL_EXTENTS_LAYER = {
    id: 'parallel-extents',
    label: 'סימון היקף המקבילות',
    kind: 'parallels',
    placement: 'inline',
    navButtonId: PARALLELS_NAV_BUTTON,
    available: hasParallelsData,

    decorate(container, ctx) {
        const data = ctx && ctx.parallelsData;
        if (!data || !ctx.textData) return;
        const index = createParallelsIndex(data, ctx.textData);
        // Beside-mode restructures the paragraph before anything is measured: it
        // moves the reading text into per-subunit rows and evicts the variant
        // apparatus, so the geometry the bars are drawn from only settles after
        // it has run.
        if (ctx.parallelsBeside) {
            layoutParallelsBeside(container, index);
        }
        drawParallelExtents(container, index,
                            !!(ctx.parallelSubunits) && !ctx.parallelsBeside,
                            { withBeside: !!ctx.parallelsBeside, texts: index.texts });
    },
};


// --- where a subparagraph may begin -----------------------------------------
// A parallel's aligned start is a fact about the alignment, not about the
// sentence: the builder found where the other text's words begin to match, and
// that lands mid-clause about as often as not -- cutting "ר' שמעון" in half, or
// leaving a bare "ר'" hanging at the end of a subparagraph. So a break is not
// drawn where the parallel starts; it is drawn at the nearest place the text
// itself pauses, and the parallel's own extent is shown by its bar, which is
// measured and needs no help from the layout.
//
// The base text is punctuated -- roughly five hundred full stops and six hundred
// commas to a tractate -- so there is usually something to snap to within a few
// words. A full stop wins over a comma at any distance inside the window, since
// a subparagraph that ends at a sentence end reads as a unit.
const STRONG_PUNCT = /[.:?!׃]['"׳״\])\]]*$/;
const WEAK_PUNCT = /[,;]['"׳״\])\]]*$/;

// How far to look for a pause, and how short a subparagraph may be. Both are in
// words. The window is deliberately small: a break moved eight words from where
// its parallel begins no longer marks that parallel at all.
const SNAP_WINDOW = 6;
const MIN_SUBPARAGRAPH = 5;

function wordEndsSentence(el) {
    return el ? STRONG_PUNCT.test(el.textContent.trim()) : false;
}

function wordEndsClause(el) {
    return el ? WEAK_PUNCT.test(el.textContent.trim()) : false;
}

// The index of the word that should OPEN a subparagraph, given where a parallel
// begins. A candidate index j is a boundary when the word before it closed a
// sentence or a clause; the nearest such j inside the window wins, ties going
// backwards so the parallel's own opening words stay in the subparagraph the
// parallel is listed against. Returns the raw index when the window holds no
// punctuation at all -- an unsnapped break still aligns a passage, which is what
// the row is for.
function snapToPause(idx, byIdx, from, to) {
    for (const test of [wordEndsSentence, wordEndsClause]) {
        for (let d = 0; d <= SNAP_WINDOW; d++) {
            for (const j of (d === 0 ? [idx] : [idx - d, idx + d])) {
                if (j <= from || j > to) continue;
                if (byIdx.has(j) && test(byIdx.get(j - 1))) return j;
            }
        }
    }
    return idx;
}

// Break points for one paragraph: each parallel's start snapped to a pause, then
// thinned so no subparagraph is a sliver. Distinct parallels routinely begin a
// word or two apart -- a Mishnah and the Bavli quoting it -- and after snapping
// they usually coincide exactly, which is the point.
function subparagraphStarts(index, chapterIndex, halakhah, byIdx, range) {
    const [from, to] = range;
    const raw = index.subunitStarts(chapterIndex, halakhah, [from, to + 1]);
    const starts = [];
    raw.forEach(idx => {
        const snapped = snapToPause(idx, byIdx, from, to);
        if (snapped - from < MIN_SUBPARAGRAPH) return;
        if (to - snapped < MIN_SUBPARAGRAPH) return;
        const last = starts[starts.length - 1];
        if (last != null && snapped - last < MIN_SUBPARAGRAPH) return;
        starts.push(snapped);
    });
    return starts;
}


// --- beside layout ----------------------------------------------------------
// The reading mode the parallels apparatus actually wants: the parallel's own
// text opens in the column the variant apparatus normally occupies, level with
// the words it belongs to, and the halakhah is broken into the subunits its
// parallels carve it into so that alignment is possible at all.
//
// The near column is a list that becomes a text. Each subparagraph's parallels
// are named beside it -- so the reader can see at a glance that this clause has a
// Mishnah and a Yerushalmi and the next has only a late midrash, which is a
// finding in itself -- and clicking one opens its passage in place, under its own
// citation, still level with the words it parallels. Nothing moves and nothing
// opens elsewhere; the list is where the reading happens.
//
// Extent is not the list's job. It is marked in a gutter of bars between the text
// and the list, measured off the rendered lines, because an extent is geometry
// and a citation is not. That division is why the breaks below can be moved to
// the nearest pause without lying about anything: the bar still starts exactly
// where the alignment says it starts.
//
// The far margin -- the shared dock, where the commentaries live -- keeps what
// this column cannot hold: the citations we could not place, plus the attestation
// detail for any of them. See PARALLELS_LAYER.select.
//
// The variants keep their place in the document: they move to a collapsed block
// under the halakhah, not out of it. This site exists to show them.
//
// Restructuring the rendered body rather than rendering it differently is
// deliberate. The body renderer in index.html owns a great deal -- footnote
// markers, eclectic swaps, edition-numbering overlays, the Sotah modes -- and a
// second renderer that had to reproduce all of it would be a second thing to
// keep correct. Moving finished nodes keeps every one of those features intact,
// because they travel with the nodes.
function layoutParallelsBeside(container, index) {
    document.body.classList.add('parallels-beside');

    container.querySelectorAll('.paragraph-pair[id]').forEach(paragraph => {
        if (paragraph.querySelector('.parallel-split')) return;
        const match = /^hal-(\d+)-(\d+)$/.exec(paragraph.id);
        if (!match) return;
        const chapterIndex = Number(match[1]);
        const halakhah = Number(match[2]);
        const textColumn = paragraph.querySelector('.text-content');
        if (!textColumn) return;

        const words = [...textColumn.querySelectorAll('.body-word[data-base-idx]')];
        if (!words.length) return;
        const first = Number(words[0].dataset.baseIdx);
        const last = Number(words[words.length - 1].dataset.baseIdx);

        const byIdx = new Map(words.map(el => [Number(el.dataset.baseIdx), el]));
        const entries = index.chapter(chapterIndex).entries.filter(
            e => e.endIdx >= first && e.baseIdx <= last);

        // Break points, snapped to where the text pauses. They must be starts of
        // SUBPARAGRAPHS here, so an entry beginning before this paragraph doesn't
        // open one.
        const starts = subparagraphStarts(index, chapterIndex, halakhah, byIdx,
                                          [first, last]);
        const rows = splitTextIntoRows(textColumn, starts);
        if (!rows.length) return;

        const split = document.createElement('div');
        split.className = 'parallel-split';
        rows.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'parallel-split-row';

            const textCell = document.createElement('div');
            textCell.className = 'parallel-split-text';
            row.nodes.forEach(node => textCell.appendChild(node));
            rowEl.appendChild(textCell);

            // The list, and where its passages open. A parallel is listed against
            // the subparagraph its own start falls in -- once, not once per
            // subparagraph it runs through, which is what the bars are for.
            const rowTo = row.to === Infinity ? last : row.to;
            const listed = entries.filter(e => e.precision === 'span'
                && e.baseIdx >= row.from && e.baseIdx <= rowTo);
            const refs = document.createElement('div');
            refs.className = 'parallel-split-refs';
            refs.dataset.rowFrom = String(row.from);
            refs.dataset.rowTo = String(rowTo);
            sortForMargin(listed).forEach(entry => {
                refs.appendChild(buildCitationItem(entry));
            });
            rowEl.appendChild(refs);

            split.appendChild(rowEl);
        });

        // A halakhah with nothing cited against it keeps the full reading measure.
        // Plenty of them have no placeable parallel at all, and holding a fifth of
        // the width for an empty column down the whole chapter is a real cost in a
        // window already shared with the filters and the dock.
        split.classList.toggle('has-cites', !!split.querySelector('.parallel-cite-item'));
        textColumn.appendChild(split);

        // Covered words carry the ids covering them, so a click in the text
        // resolves to the narrowest parallel there -- the one being pointed at
        // rather than the sugya containing it. They get no permanent decoration:
        // the bars mark the extents, and a dozen underlines would only compete
        // with them. The marks appear when a citation is hovered or opened.
        markParallelSpanWords(textColumn, entries);

        // The apparatus, evicted but not discarded. Kept in the DOM with its
        // .note-span elements untouched so footnote-marker highlighting, the
        // classification filters and the docx export all keep working on it.
        const variants = paragraph.querySelector('.variant-content');
        if (variants && variants.textContent.trim()) {
            const details = document.createElement('details');
            details.className = 'parallel-beside-apparatus';
            const summary = document.createElement('summary');
            summary.textContent = 'חילופי נוסח';
            details.appendChild(summary);
            details.appendChild(variants);
            paragraph.appendChild(details);
        }
    });
}

// Reading order for the margin: the works in the order a reader ranks them --
// the Mishnah our baraita comments on before the Talmudim that quote it -- and
// within a work, the widest extent first, so the sugya containing a clause is
// named above the clause. Position deliberately does not sort: everything in one
// subparagraph's list is already at the same place in the text.
function sortForMargin(entries) {
    return entries.slice().sort((a, b) =>
        (PARALLEL_GROUP_RANK.get(a.group) ?? 99) - (PARALLEL_GROUP_RANK.get(b.group) ?? 99)
        || (b.endIdx - b.baseIdx) - (a.endIdx - a.baseIdx)
        || a.ref.localeCompare(b.ref));
}

// One citation in the margin: the reference, its corroboration, and the room its
// passage will occupy when opened. Closed, it is a line of text; open, it is the
// passage under that line. Both live in the same element so the passage cannot
// drift from the citation it belongs to.
function buildCitationItem(entry) {
    const item = document.createElement('div');
    item.className = 'parallel-cite-item';
    item.dataset.entryId = entry.id;
    item.style.setProperty('--parallel-color', parallelColor(entry));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'parallel-cite';
    button.dataset.entryId = entry.id;
    button.setAttribute('aria-expanded', 'false');

    const ref = document.createElement('span');
    ref.className = 'parallel-cite-ref';
    ref.textContent = entry.heRef || entry.ref;
    ref.dir = 'auto';
    button.appendChild(ref);

    const dots = document.createElement('span');
    dots.className = 'parallel-strength';
    dots.textContent = '●'.repeat(parallelStrength(entry));
    dots.title = `${entry.numSources || 1} מקורות: ${parallelSourceList(entry)}`;
    button.appendChild(dots);

    item.appendChild(button);
    return item;
}

// Cut a text paragraph's child nodes into row groups at the given base indices.
//
// Works on node ranges rather than on text, so a footnote marker <sup>, an
// eclectic-swap <span> or an edition-numbering marker sitting between two words
// travels into the row it was printed in. A marker immediately preceding a break
// word goes with that word, since it annotates it.
function splitTextIntoRows(textColumn, starts) {
    const paragraph = textColumn.querySelector('p.text-content, p') || textColumn;
    const startSet = new Set(starts);
    const nodes = [...paragraph.childNodes];
    if (!nodes.length) return [];

    const rows = [{ nodes: [], from: -Infinity, to: Infinity }];
    let pending = [];   // markers seen since the last word, held for the next one

    nodes.forEach(node => {
        const isWord = node.nodeType === Node.ELEMENT_NODE
                    && node.classList && node.classList.contains('body-word');
        if (!isWord) {
            pending.push(node);
            return;
        }
        const idx = Number(node.dataset.baseIdx);
        if (startSet.has(idx) && rows[rows.length - 1].nodes.length) {
            rows.push({ nodes: [], from: idx, to: Infinity });
        }
        const row = rows[rows.length - 1];
        // Whitespace before a row's first word is the previous row's trailing
        // space; anything else (a marker) belongs with the word it annotates.
        pending.forEach(held => {
            const blank = held.nodeType === Node.TEXT_NODE && !held.textContent.trim();
            if (blank && !row.nodes.length) return;
            row.nodes.push(held);
        });
        pending = [];
        row.nodes.push(node);
        if (row.from === -Infinity) row.from = idx;
        row.to = idx;
    });
    pending.forEach(held => rows[rows.length - 1].nodes.push(held));

    // Row bounds close over the gaps, so an entry anchored on a word that has no
    // span in the DOM (an eclectic omission swap drops one) still lands in a row.
    for (let i = 0; i < rows.length - 1; i++) {
        rows[i].to = rows[i + 1].from - 1;
    }
    rows[rows.length - 1].to = Infinity;
    if (rows[0].from === -Infinity) rows[0].from = -Infinity;
    return rows.filter(row => row.nodes.length);
}

// Record which parallels cover each word. Only span-anchored ones: a citation we
// could place no more precisely than "this halakhah" has no words of its own.
//
// This marks the words for RESOLUTION, not for display -- a click needs to know
// what it landed on. The visible extent is the bar; earlier versions underlined
// every covered word, with the underline thickening where parallels overlapped,
// and on a chapter of Berakhot that is most of the text underlined at three
// different weights, which reads as a texture rather than as information.
function markParallelSpanWords(textColumn, entries) {
    const spans = entries.filter(e => e.precision === 'span');
    if (!spans.length) return;
    const byIdx = new Map();
    textColumn.querySelectorAll('.body-word[data-base-idx]').forEach(el => {
        byIdx.set(Number(el.dataset.baseIdx), el);
    });
    spans.forEach(entry => {
        for (let i = entry.baseIdx; i <= entry.endIdx; i++) {
            const el = byIdx.get(i);
            if (!el) continue;
            const ids = el.dataset.parallelIds ? el.dataset.parallelIds.split(' ') : [];
            if (!ids.includes(entry.id)) ids.push(entry.id);
            el.dataset.parallelIds = ids.join(' ');
            el.classList.add('parallel-span');
        }
    });
}

// The narrowest parallel covering a word: the one the reader is pointing at. A
// click on a word inside both a six-word Mishnah parallel and the whole Bavli
// sugya that quotes it means the Mishnah.
function narrowestAt(wordEl, index, chapterIndex) {
    const ids = (wordEl.dataset.parallelIds || '').split(' ').filter(Boolean);
    let best = null;
    ids.forEach(id => {
        const entry = index.entry(chapterIndex, id);
        if (!entry) return;
        if (!best || (entry.endIdx - entry.baseIdx) < (best.endIdx - best.baseIdx)) {
            best = entry;
        }
    });
    return best;
}

// The parallel passage, opened in the near column next to the words it parallels.
function buildOpenedPassage(entry, texts, onClose) {
    const box = document.createElement('div');
    box.className = 'parallel-open';
    box.dataset.entryId = entry.id;
    box.style.setProperty('--parallel-color', parallelColor(entry));

    const head = document.createElement('div');
    head.className = 'parallel-open-head';

    const ref = document.createElement('a');
    ref.className = 'parallel-open-ref';
    ref.href = sefariaUrl(entry.ref);
    ref.target = '_blank';
    ref.rel = 'noopener';
    ref.textContent = entry.heRef || entry.ref;
    ref.dir = 'auto';
    head.appendChild(ref);

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'parallel-open-close';
    close.textContent = '✕';
    close.title = 'סגירה';
    close.addEventListener('click', (event) => {
        event.stopPropagation();
        onClose(entry.id);
    });
    head.appendChild(close);
    box.appendChild(head);

    const record = texts[entry.ref];
    const body = document.createElement('div');
    body.className = 'parallel-open-text';
    if (record && record.he) {
        body.innerHTML = renderParallelText(record.he, entry.targetSpan);
        if (record.trimmedStart || record.trimmedEnd) {
            const note = document.createElement('div');
            note.className = 'parallel-open-note';
            note.textContent = 'הקטע מוצג בחלקו';
            box.appendChild(note);
        }
    } else {
        body.classList.add('parallel-passage-missing');
        body.textContent = 'הטקסט של המקבילה אינו זמין כאן';
    }
    box.appendChild(body);
    return box;
}

// --- extent bars ------------------------------------------------------------
// Bars are drawn from measured geometry rather than from character offsets,
// because a parallel routinely starts mid-line and runs over several lines: the
// only thing that knows where those lines broke is the browser after layout.
//
// Kept module-level so a resize, or an unrelated re-render, can redraw whatever is
// currently shown without the caller having to hold the state.
let parallelExtentsState = null;

function clearParallelExtents(container) {
    container.querySelectorAll('.parallel-gutter').forEach(el => el.remove());
    container.querySelectorAll('.parallel-subunit-break').forEach(el => el.remove());
    container.querySelectorAll('.body-word.parallel-covered').forEach(el => {
        el.classList.remove('parallel-covered');
        delete el.dataset.parallelSubunit;
    });
    document.body.classList.remove('parallel-extents-on');
    // 'parallels-beside' is deliberately NOT cleared: that layout moved nodes, and
    // undoing it by hand would be a second, divergent renderer. The page rebuilds
    // the body when the mode changes, which is the only honest way back out.
}

function drawParallelExtents(container, index, withSubunits, opts = {}) {
    clearParallelExtents(container);
    document.body.classList.add('parallel-extents-on');
    parallelExtentsState = {
        container, index, withSubunits,
        withBeside: !!opts.withBeside,
        texts: opts.texts || index.texts,
    };

    const paragraphs = [...container.querySelectorAll('.paragraph-pair[id]')];

    // Reserve the gutter's width BEFORE measuring anything. The reservation is a
    // padding change on the reading column, so it relays every line -- measuring
    // first and widening after left every bar positioned against the previous
    // line breaks, off by a line or more further down a paragraph.
    const chapterIndices = new Set();
    paragraphs.forEach(paragraph => {
        const match = /^hal-(\d+)-\d+$/.exec(paragraph.id);
        if (match) chapterIndices.add(Number(match[1]));
    });
    let maxLanes = 1;
    chapterIndices.forEach(ci => {
        maxLanes = Math.max(maxLanes, index.chapter(ci).laneCount);
    });
    container.style.setProperty('--parallel-lanes', String(maxLanes));

    // Anything the reader had open before this redraw goes back. A redraw happens
    // for reasons that have nothing to do with the parallels -- a variant filter
    // change rebuilds the whole body -- and losing the passage being read to one
    // of those would be its own bug.
    if (parallelExtentsState.withBeside && openParallels.size) {
        const wanted = [...openParallels];
        openParallels.clear();
        wanted.forEach(id => chapterIndices.forEach(ci => {
            const entry = index.entry(ci, id);
            if (entry) {
                openParallelPassages(container, index,
                                     parallelExtentsState.texts, entry);
            }
        }));
    }

    // Everything that changes layout happens here, before any measuring: the
    // subunit break marks are inline elements inserted into the running text, so
    // adding one relays its paragraph and shifts every line after it.
    const measurable = [];
    paragraphs.forEach(paragraph => {
        const match = /^hal-(\d+)-(\d+)$/.exec(paragraph.id);
        if (!match) return;
        const chapterIndex = Number(match[1]);
        const halakhah = Number(match[2]);
        const textColumn = paragraph.querySelector('.text-content');
        if (!textColumn) return;

        const words = [...textColumn.querySelectorAll('.body-word[data-base-idx]')];
        if (!words.length) return;
        const byIdx = new Map(words.map(el => [Number(el.dataset.baseIdx), el]));
        const first = Number(words[0].dataset.baseIdx);
        const last = Number(words[words.length - 1].dataset.baseIdx);

        const chapterData = index.chapter(chapterIndex);
        const here = chapterData.spans.filter(e => e.endIdx >= first && e.baseIdx <= last);

        if (withSubunits) {
            markParallelSubunits(index, chapterIndex, halakhah, byIdx, [first, last]);
        }
        if (here.length) {
            measurable.push({ textColumn, byIdx, first, last, here, chapterData });
        }
    });

    // Beside-mode measures per subparagraph instead, because that is the box its
    // bars have to sit beside: a gutter down the whole halakhah would run past the
    // subparagraph rules and past the citation lists it is supposed to point at.
    if (parallelExtentsState.withBeside) {
        drawBesideBars(container, index);
        return;
    }

    // Now measure and draw. The bars are absolutely positioned inside the reading
    // column, which no longer reflows.
    measurable.forEach(({ textColumn, byIdx, first, last, here, chapterData }) => {
        drawBarsIn(textColumn, byIdx, first, last, here,
                   entry => chapterData.lanes.get(entry.id) || 0);
    });
}

// One gutter of bars in one measuring box: a bar per parallel, spanning from the
// top of its first covered line to the bottom of its last.
//
// The box is a paragraph's reading column in plain mode and a single subparagraph
// in beside-mode, and clipping is what makes both work: a parallel running through
// three boxes is three segments, each capped only where the parallel itself
// actually starts or ends, so it reads as one extent interrupted by the layout.
function drawBarsIn(host, byIdx, first, last, entries, laneOf) {
    const gutter = document.createElement('div');
    gutter.className = 'parallel-gutter';
    host.appendChild(gutter);
    const hostRect = host.getBoundingClientRect();

    entries.forEach(entry => {
        const startIdx = Math.max(entry.baseIdx, first);
        const endIdx = Math.min(entry.endIdx, last);
        const startEl = nearestWord(byIdx, startIdx, 1, last);
        const endEl = nearestWord(byIdx, endIdx, -1, first);
        if (!startEl || !endEl) return;
        const top = startEl.getBoundingClientRect().top - hostRect.top;
        const bottom = endEl.getBoundingClientRect().bottom - hostRect.top;

        const bar = document.createElement('button');
        bar.type = 'button';
        bar.className = 'parallel-bar';
        bar.dataset.entryId = entry.id;
        bar.style.setProperty('--parallel-lane', String(laneOf(entry)));
        bar.style.setProperty('--parallel-color', parallelColor(entry));
        bar.style.top = `${Math.max(0, top)}px`;
        bar.style.height = `${Math.max(6, bottom - top)}px`;
        if (entry.baseIdx < first) bar.classList.add('continues-above');
        if (entry.endIdx > last) bar.classList.add('continues-below');
        // Bars are drawn after the reader's open passages have been restored, so
        // the open state is read here rather than pushed by highlightOpenState.
        if (openParallels.has(entry.id)) bar.classList.add('open');
        bar.title = `${entry.heRef || entry.ref}${entry.dh ? ' — ' + entry.dh : ''}`;
        bar.setAttribute('aria-label', bar.title);
        gutter.appendChild(bar);

        for (let i = startIdx; i <= endIdx; i++) {
            const el = byIdx.get(i);
            if (el) el.classList.add('parallel-covered');
        }
    });
}

// The bars for beside-mode: one gutter per subparagraph, between the text and the
// citations listed against it.
//
// Lanes are packed per subparagraph rather than per chapter. Chapter-wide packing
// is what the plain mode wants -- an entry keeps its lane while the reader scrolls
// -- but here it would reserve every subparagraph the widest gutter any one of
// them needed, which on a chapter with eight overlapping parallels is most of an
// inch of nothing. A subparagraph is short enough that stability doesn't arise:
// its bars are drawn once, together.
//
// Two passes, and the reason is subtle: reserving a gutter is a padding change on
// the text cell, so it relays that cell's lines. Measuring first and reserving
// after leaves every bar positioned against the previous line breaks.
function drawBesideBars(container, index) {
    const cells = [];
    container.querySelectorAll('.parallel-split-text').forEach(cell => {
        const paragraph = cell.closest('.paragraph-pair[id]');
        const match = paragraph && /^hal-(\d+)-\d+$/.exec(paragraph.id);
        if (!match) return;
        const words = [...cell.querySelectorAll('.body-word[data-base-idx]')];
        if (!words.length) return;
        const first = Number(words[0].dataset.baseIdx);
        const last = Number(words[words.length - 1].dataset.baseIdx);
        const here = index.chapter(Number(match[1])).spans
            .filter(e => e.endIdx >= first && e.baseIdx <= last);
        // Set to zero rather than removed: the reading column carries a
        // chapter-wide --parallel-lanes for the plain mode's single gutter, and a
        // cell that removed its own would inherit that and reserve room for eight
        // lanes of bars it hasn't got.
        if (!here.length) {
            cell.style.setProperty('--parallel-lanes', '0');
            return;
        }
        const lanes = packLanesWithin(here, first, last);
        cell.style.setProperty('--parallel-lanes', String(lanes.count));
        cells.push({
            cell, first, last, here,
            byIdx: new Map(words.map(el => [Number(el.dataset.baseIdx), el])),
            laneOf: entry => lanes.of.get(entry.id) || 0,
        });
    });

    cells.forEach(({ cell, byIdx, first, last, here, laneOf }) => {
        drawBarsIn(cell, byIdx, first, last, here, laneOf);
    });
}

// Greedy first-fit over the extents CLIPPED to one box, so two parallels that
// overlap elsewhere in the chapter but not here share a lane.
function packLanesWithin(entries, first, last) {
    const clipped = entries.map(e => ({
        id: e.id,
        from: Math.max(e.baseIdx, first),
        to: Math.min(e.endIdx, last),
    })).sort((a, b) => a.from - b.from || b.to - a.to);
    const laneEnds = [];
    const of = new Map();
    clipped.forEach(c => {
        let lane = laneEnds.findIndex(end => end < c.from);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(c.to);
        } else {
            laneEnds[lane] = c.to;
        }
        of.set(c.id, lane);
    });
    return { of, count: Math.max(1, laneEnds.length) };
}

// The nearest word element in a direction, for a span whose exact boundary word
// isn't in the DOM. That happens for real: an eclectic-text omission swap drops
// the lemma word from the body entirely, so its index simply has no span.
function nearestWord(byIdx, from, step, limit) {
    for (let i = from; step > 0 ? i <= limit : i >= limit; i += step) {
        const el = byIdx.get(i);
        if (el) return el;
    }
    return null;
}

// Subunit division: the halakhah divisions are the printed edition's, and the
// parallels imply a different, often finer, articulation of the same text -- one
// clause with a Mishnah parallel, the next with only a Bavli one. Marking those
// boundaries makes that articulation visible without altering the halakhah
// numbering, which stays the citable unit.
//
// A break is a marker inserted before a word, not a split of the paragraph: the
// body HTML carries footnote markers, eclectic swaps and edition-numbering
// overlays through it, and re-parenting that into new containers would be a
// second, competing renderer. (Beside-mode does re-parent, because there the rows
// ARE the layout; see layoutParallelsBeside.)
function markParallelSubunits(index, chapterIndex, halakhah, byIdx, range) {
    const starts = subparagraphStarts(index, chapterIndex, halakhah, byIdx, range);
    if (!starts.length) return;
    let subunit = 0;
    const startSet = new Set(starts);
    [...byIdx.keys()].sort((a, b) => a - b).forEach(idx => {
        const el = byIdx.get(idx);
        if (startSet.has(idx)) {
            subunit += 1;
            const marker = document.createElement('span');
            marker.className = 'parallel-subunit-break';
            marker.setAttribute('aria-hidden', 'true');
            el.parentNode.insertBefore(marker, el);
        }
        el.dataset.parallelSubunit = String(subunit % 2);
    });
}

// Re-measure on resize: the bars are geometry, and a width change relays every
// line. Debounced, and a no-op when the layer isn't drawn.
let parallelResizeTimer = null;
window.addEventListener('resize', () => {
    if (!parallelExtentsState) return;
    clearTimeout(parallelResizeTimer);
    parallelResizeTimer = setTimeout(() => {
        const state = parallelExtentsState;
        if (!state.container.isConnected) { parallelExtentsState = null; return; }
        drawParallelExtents(state.container, state.index, state.withSubunits,
                            { withBeside: state.withBeside, texts: state.texts });
    }, 150);
});

// Which parallels are open, so a re-decorate (a filter change, a resize) can put
// them back rather than losing the reader's place.
const openParallels = new Set();

// Open a parallel's text under its own citation in the margin.
//
// It opens at EVERY occurrence of the same passage in the chapter, not only the
// one clicked. Our halakhot are long, and one Mishnah is often parallel to two or
// three separate clauses of a single chapter; seeing those together is the
// comparison the apparatus exists for, and it is precisely what a list of
// citations cannot show. The other occurrences sit in their own subparagraphs, so
// they come into view as the reader scrolls rather than being pulled out of place.
function openParallelPassages(container, index, texts, entry) {
    const related = index.chapter(entry.chapter).entries.filter(
        e => e.ref === entry.ref && e.precision === 'span');
    const opened = [];
    (related.length ? related : [entry]).forEach(target => {
        const item = citationItemFor(container, target.id);
        if (!item) return;
        openParallels.add(target.id);
        if (item.querySelector('.parallel-open')) return;
        const box = buildOpenedPassage(target, texts,
            () => closeParallelGroup(container, index, target));
        item.appendChild(box);
        item.classList.add('open');
        const button = item.querySelector('.parallel-cite');
        if (button) button.setAttribute('aria-expanded', 'true');
        opened.push(box);
    });
    highlightOpenState(container);
    // Open on the aligned words, not on the top of the daf. The surrounding sugya
    // is kept -- it is how a reader judges whether the alignment found the right
    // passage -- but scrolled past, since what was asked for is the parallel and
    // on a Bavli daf it can sit several screens down inside its own context.
    //
    // After highlightOpenState, not before: that is what widens the column, and
    // an offsetTop measured at the closed width is a different number.
    opened.forEach(box => {
        const scroller = box.querySelector('.parallel-open-text');
        const aligned = box.querySelector('.parallel-aligned');
        if (scroller && aligned) {
            scroller.scrollTop = Math.max(0, aligned.offsetTop - 12);
        }
    });
}

// Closing one occurrence closes the group it was opened with, because they were
// opened by one gesture and are one claim.
function closeParallelGroup(container, index, entry) {
    index.chapter(entry.chapter).entries
        .filter(e => e.ref === entry.ref)
        .forEach(e => {
            openParallels.delete(e.id);
            const item = citationItemFor(container, e.id);
            if (!item) return;
            item.querySelectorAll('.parallel-open').forEach(box => box.remove());
            item.classList.remove('open');
            const button = item.querySelector('.parallel-cite');
            if (button) button.setAttribute('aria-expanded', 'false');
        });
    highlightOpenState(container);
}

// A citation's place in the margin. Every span-anchored parallel in a rendered
// chapter has exactly one, in the subparagraph its start falls in, so there is no
// searching by word range: the item IS the address.
function citationItemFor(container, entryId) {
    return container.querySelector(`.parallel-cite-item[data-entry-id="${entryId}"]`);
}

function highlightOpenState(container) {
    container.querySelectorAll('.body-word.parallel-span').forEach(el => {
        const ids = (el.dataset.parallelIds || '').split(' ').filter(Boolean);
        el.classList.toggle('parallel-open-word', ids.some(id => openParallels.has(id)));
    });
    container.querySelectorAll('.parallel-bar').forEach(bar => {
        bar.classList.toggle('open', openParallels.has(bar.dataset.entryId));
    });
    // A halakhah gives up reading width for a PASSAGE, not for the list: closed,
    // the citations are a narrow strip of short lines, and reserving half the
    // measure for them everywhere cost the whole chapter its readability.
    container.querySelectorAll('.parallel-split').forEach(split => {
        split.classList.toggle('has-open', !!split.querySelector('.parallel-open'));
    });
}

// Clicks and hovers on whatever names a parallel from inside the reading column:
// a citation in the margin, its bar in the gutter, or a covered word in the text.
// All three mean the same parallel, and any of them opens it. Delegated once at
// the container -- a chapter carries hundreds.
const PARALLEL_TARGETS = '.parallel-cite, .parallel-bar, .body-word.parallel-span';

function wireParallelBarInteractions(container, { activate, select } = {}) {
    container.addEventListener('click', (event) => {
        const target = event.target.closest(PARALLEL_TARGETS);
        if (!target || !parallelExtentsState) return;
        const entry = entryForAffordance(target);
        if (!entry) return;
        event.preventDefault();
        const state = parallelExtentsState;

        if (state.withBeside) {
            // The reader asked for the text, not for the list, so the passage
            // opens here and the dock is left as it was.
            if (openParallels.has(entry.id)) {
                closeParallelGroup(container, state.index, entry);
            } else {
                openParallelPassages(container, state.index, state.texts, entry);
                // A parallel is listed against the subparagraph it STARTS in, so a
                // bar clicked where it merely continues -- it began in an earlier
                // halakhah -- opens its passage above the reader's viewport. Going
                // there is the honest answer: that is where the parallel starts.
                const item = citationItemFor(container, entry.id);
                if (item) item.scrollIntoView({ block: 'nearest' });
            }
        } else if (activate) {
            // Plain mode has nowhere beside the text to put a passage, so the
            // dock answers instead.
            activate();
        }
        // The dock's panel learns WHICH passage from the shared selection, so the
        // click has to say where it happened even when it doesn't raise the dock.
        if (select) select(entry.chapter, entry.halakhah, entry.baseIdx);
        // Beside-mode has already put the passage next to the text, so the dock
        // must not also expand it -- that was the duplication this design removes.
        // It still highlights the row, so the list shows where the reader is.
        parallelsFocus.set(entry.id, {
            source: 'text-affordance',
            expand: !state.withBeside,
        });
    });
    container.addEventListener('mouseover', (event) => {
        const target = event.target.closest(PARALLEL_TARGETS);
        if (!target) return;
        const entry = entryForAffordance(target);
        if (entry) {
            parallelsFocus.set(entry.id,
                               { source: 'text-affordance-hover', transient: true });
        }
    });
}

// The entry an affordance stands for. Resolved from the DOM rather than stored on
// the element, so the entry object lives in one place -- the index -- and the
// affordance carries only an id. A bar names one parallel; a word may be covered
// by several, and then the narrowest is the one being pointed at.
function entryForAffordance(element) {
    if (!parallelExtentsState) return null;
    const paragraph = element.closest('.paragraph-pair[id]');
    const match = paragraph && /^hal-(\d+)-\d+$/.exec(paragraph.id);
    if (!match) return null;
    const chapterIndex = Number(match[1]);
    const index = parallelExtentsState.index;
    if (element.dataset.entryId) {
        return index.entry(chapterIndex, element.dataset.entryId);
    }
    return narrowestAt(element, index, chapterIndex);
}

// Focus highlighting in the body: the focused parallel's own words are marked so
// the reader can see the extent in the text, not only as a bar beside it.
// The entry an id names, wherever it is. The focus channel carries only an id, and
// which chapter it belongs to isn't known until it's looked for -- so it is looked
// for across the chapters currently rendered.
function findEntryAnywhere(index, container, entryId) {
    const chapters = new Set();
    container.querySelectorAll('.paragraph-pair[id]').forEach(p => {
        const m = /^hal-(\d+)-\d+$/.exec(p.id);
        if (m) chapters.add(Number(m[1]));
    });
    for (const ci of chapters) {
        const entry = index.entry(ci, entryId);
        if (entry) return entry;
    }
    return null;
}

// Cross-highlighting. Two strengths, because two different things are worth
// seeing: the focused parallel's own extent, which may run across a halakhah
// boundary, and the OTHER places in the chapter where the same passage is
// parallel -- the same Mishnah answering three separate clauses. The second is
// the relationship a citation list flattens away, so it is drawn, faintly.
parallelsFocus.subscribe((entryId) => {
    document.querySelectorAll('.parallel-bar.focused, .parallel-open.focused, .parallel-cite-item.focused')
        .forEach(el => el.classList.remove('focused'));
    document.querySelectorAll('.body-word.parallel-focus, .body-word.parallel-focus-related')
        .forEach(el => el.classList.remove('parallel-focus', 'parallel-focus-related'));
    if (!entryId || !parallelExtentsState) return;

    // The three faces of one parallel, lit together: its citation in the margin,
    // its bar in the gutter, its passage if open. Hovering any of them is how the
    // reader learns which bar goes with which citation.
    document.querySelectorAll(`.parallel-bar[data-entry-id="${entryId}"], .parallel-open[data-entry-id="${entryId}"], .parallel-cite-item[data-entry-id="${entryId}"]`)
        .forEach(el => el.classList.add('focused'));

    const { container, index } = parallelExtentsState;
    const entry = findEntryAnywhere(index, container, entryId);
    if (!entry) return;

    const siblings = index.chapter(entry.chapter).entries.filter(
        e => e.ref === entry.ref && e.id !== entry.id && e.precision === 'span');

    // Only covered words can be highlighted, and this runs on every hover, so the
    // sweep is over those rather than over the chapter's several thousand words.
    // Two classes because the two modes mark coverage for different reasons:
    // beside-mode needs it for click resolution, plain mode as a by-product of
    // drawing the bars.
    container.querySelectorAll('.body-word.parallel-span, .body-word.parallel-covered').forEach(el => {
        const idx = Number(el.dataset.baseIdx);
        if (idx >= entry.baseIdx && idx <= entry.endIdx) {
            el.classList.add('parallel-focus');
        } else if (siblings.some(sib => idx >= sib.baseIdx && idx <= sib.endIdx)) {
            el.classList.add('parallel-focus-related');
        }
    });
});


// --- filter panel -----------------------------------------------------------
// The sidebar's parallels tab. Built from the loaded tractate rather than from a
// fixed list, and every row carries its count, because which works and which
// apparatus sources appear varies enormously between tractates: Zeraim's
// parallels are Yerushalmi and Mishnah almost throughout, Taharot's are Sifra.
// A row for a work with no citations here would be a control that does nothing.
//
// Polarity is checked = shown, the opposite of the variants sidebar (where the
// labels read "hide X"). The labels here are the names of works, and a ticked
// box beside "תלמוד בבלי" can only sensibly mean the Bavli is in.

function parallelsFilterCounts(parallelsData) {
    const groups = new Map();   // groupId -> { count, works: Map }
    const sources = new Map();
    const home = new Map();     // source -> citations printed ON this tractate
    const precisions = new Map();
    let total = 0;
    let compare = 0;
    let farEnd = 0;
    Object.values((parallelsData && parallelsData.chapters) || {}).forEach(entries => {
        entries.forEach(e => {
            total++;
            if (!groups.has(e.group)) groups.set(e.group, { count: 0, works: new Map() });
            const g = groups.get(e.group);
            g.count++;
            g.works.set(e.work, (g.works.get(e.work) || 0) + 1);
            precisions.set(e.precision, (precisions.get(e.precision) || 0) + 1);
            (e.sources || []).forEach(s => sources.set(s, (sources.get(s) || 0) + 1));
            (e.apparatusHome || []).forEach(s => home.set(s, (home.get(s) || 0) + 1));
            if (e.compare) compare++;
            if (parallelIsFarEndOnly(e)) farEnd++;
        });
    });
    return { groups, sources, home, precisions, total, compare, farEnd };
}

function parallelsFilterRow(labelText, count, checked, onToggle, opts = {}) {
    const label = document.createElement('label');
    if (opts.className) label.className = opts.className;
    if (opts.title) label.title = opts.title;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = checked;
    box.onchange = () => onToggle(box.checked);
    label.appendChild(box);
    label.appendChild(document.createTextNode(' ' + labelText));
    if (count != null) {
        const c = document.createElement('span');
        c.className = 'detail-count';
        c.textContent = `(${count})`;
        label.appendChild(c);
    }
    label.dataset.filterRow = '1';
    return { label, box };
}

function parallelsFilterSection(title, opts = {}) {
    const section = document.createElement('section');
    section.className = 'filters-section';
    const details = document.createElement('details');
    if (opts.open) details.open = true;
    const summary = document.createElement('summary');
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'filter-body';
    details.append(summary, body);
    section.appendChild(details);
    return { section, body };
}

// Renders the whole filter side of the parallels tab into `root`. Called on
// every tractate load: the state lives in parallelsFilter and outlives the DOM,
// so a work switched off stays off across the switch even when the new tractate
// happens not to cite it.
let parallelsFilterStatusUnsub = null;

// An apparatus to the Tosefta is only evidence about the tractate its editor
// actually edited. Lieberman's מסורת התוספתא stops after Bava Batra, and the
// citations of his that surface in Kodashim and Taharot are all far ends of
// notes printed in the volumes he did edit -- true parallels, but shown under
// his name they read as an apparatus he never wrote there. So a home-bearing
// source is off by default in any tractate where `apparatusHome` never names it,
// and on everywhere it does. The row stays in the list with its count, and the
// status line plus the reset button say that something is being held back.
//
// Where he DID edit, note mode is what opens instead: the apparatus itself
// rather than a filtered view of the index derived from it. That supersedes the
// solo-Lieberman default this function used to apply -- two switches saying
// nearly the same thing, and solo would have emptied everything note mode does
// not show anyway. Solo remains a manual choice for list mode.
//
// What survives here is the clearing half, which is not about defaults at all
// but about a global slot: solo left on from a tractate he edited would empty
// the margin in Chullin, where nothing is his.
//
// Per tractate but not sticky-per-tractate: this fires only while the reader has
// left that control alone. One click -- in either direction -- and it stops
// overriding them, here and in every tractate after.
function applyParallelsTractateDefaults(counts) {
    let changed = false;
    PARALLEL_HOME_BEARING_SOURCES.forEach(slug => {
        if (!counts.sources.has(slug)) return;
        const edits = (counts.home.get(slug) || 0) > 0;

        if (!parallelsFilter.touched('sources', slug)) {
            const excluded = parallelsFilter.excluded('sources', slug);
            if (edits === excluded) {
                parallelsFilter.state.sources[edits ? 'delete' : 'add'](slug);
                changed = true;
            }
        }

        if (!edits && parallelsFilter.state.soloSource === slug
            && !parallelsFilter.touched('solo', slug)) {
            parallelsFilter.state.soloSource = null;
            changed = true;
        }
    });
    return changed;
}

function renderParallelsFilterUI(root, parallelsData, onChange, opts = {}) {
    // One live status subscriber at a time: this is re-run on every tractate
    // load and on reset, and a subscriber per run would keep the discarded DOM
    // alive along with it.
    if (parallelsFilterStatusUnsub) parallelsFilterStatusUnsub();
    parallelsFilterStatusUnsub = null;
    root.innerHTML = '';
    if (!parallelsData || !parallelsData.chapters) return;
    const counts = parallelsFilterCounts(parallelsData);
    if (!counts.total) return;
    // Before the rows are drawn, so they show the state they describe. Only the
    // version bump is needed here -- this runs during a tractate load, ahead of
    // the render that reads the filter -- so onChange stays out of it.
    if (applyParallelsTractateDefaults(counts)) parallelsFilter.changed();

    const notify = () => { parallelsFilter.changed(); if (onChange) onChange(); };

    // --- how the margin reads -----------------------------------------------
    // Only offered where there is an apparatus to read: outside Lieberman's 33
    // tractates the margin is the list and a switch with one working position
    // would be a puzzle rather than a choice.
    if (opts.hasApparatus) {
        const modes = parallelsFilterSection('תצוגת השוליים', { open: true });
        const pick = (value, label, title) => {
            const wrap = document.createElement('label');
            wrap.className = 'filter-parent';
            wrap.title = title;
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'parallels-mode';
            radio.value = value;
            radio.checked = parallelsFilter.mode === value;
            radio.onchange = () => { if (radio.checked) { parallelsFilter.mode = value; notify(); } };
            wrap.append(radio, document.createTextNode(' ' + label));
            modes.body.appendChild(wrap);
        };
        pick(PARALLEL_MODES.notes, 'הערות מסורת התוספתא',
             'לשון ההערה כפי שנדפסה, והציונים שבתוכה לחיצים -- כולל ציונים שלא ניתן לאתרם, המסומנים ככאלה');
        pick(PARALLEL_MODES.list, 'רשימת ציונים',
             'כל הציונים מכל המקורות, ממוינים לפי החיבור שאליו הם מפנים');

        // Note mode's version of "הצג חילופים מוסתרים": a filtered reference
        // reads as plain text, and this brings it back struck through so the
        // reader can see what the filter is holding back.
        const showFiltered = parallelsFilterRow('הצג ציונים מסוננים', null,
            parallelsFilter.showFiltered,
            checked => { parallelsFilter.showFiltered = checked; notify(); },
            { title: 'ציונים שסוננו יוצגו בלשון ההערה כמחוקים, במקום כטקסט רגיל' });
        showFiltered.label.hidden = parallelsFilter.mode !== PARALLEL_MODES.notes;
        modes.body.appendChild(showFiltered.label);
        modes.body.addEventListener('change', () => {
            showFiltered.label.hidden = parallelsFilter.mode !== PARALLEL_MODES.notes;
        });
        root.appendChild(modes.section);
    } else if (parallelsFilter.mode === PARALLEL_MODES.notes) {
        // Nothing to switch, and nothing on screen would say why the margin is
        // a list. Leave the reader's standing choice alone -- the dock falls
        // back on its own (inNoteMode) and restores it on the way back.
    }

    // --- works, grouped -----------------------------------------------------
    const works = parallelsFilterSection('חיבורים', { open: true });
    PARALLEL_GROUPS.forEach(group => {
        const info = counts.groups.get(group.id);
        if (!info) return;
        const row = parallelsFilterRow(group.label, info.count,
            !parallelsFilter.excluded('groups', group.id),
            checked => {
                parallelsFilter.state.groups[checked ? 'delete' : 'add'](group.id);
                children.classList.toggle('disabled', !checked);
                notify();
            },
            { className: 'filter-parent' });
        // A swatch, so the sidebar row and the gutter bar it governs are
        // recognisably the same thing.
        const swatch = document.createElement('span');
        swatch.className = 'parallel-filter-swatch';
        swatch.style.background = group.color;
        row.label.insertBefore(swatch, row.label.childNodes[1]);
        works.body.appendChild(row.label);

        // Only the midrash group is more than one work; elsewhere the group row
        // already IS the work, and a lone child repeating its parent's name
        // would be noise.
        const children = document.createElement('div');
        children.className = 'filter-children';
        if (info.works.size > 1) {
            [...info.works.entries()]
                .sort((a, b) => b[1] - a[1])
                .forEach(([work, n]) => {
                    const child = parallelsFilterRow(parallelWorkName(work), n,
                        !parallelsFilter.excluded('works', work),
                        checked => {
                            parallelsFilter.state.works[checked ? 'delete' : 'add'](work);
                            notify();
                        });
                    children.appendChild(child.label);
                });
            children.classList.toggle('disabled', parallelsFilter.excluded('groups', group.id));
            works.body.appendChild(children);
        }
    });
    root.appendChild(works.section);

    // --- who says so --------------------------------------------------------
    const sources = parallelsFilterSection('מקור הציון', { open: true });
    const note = document.createElement('div');
    note.className = 'filter-note';
    note.textContent = 'ציון שכל מקורותיו כבויים לא יוצג; ציון שנתמך גם במקור פעיל יישאר.';
    // Read one apparatus as its editor left it. Lieberman's מסורת התוספתא is
    // the one that earns a switch of its own: it is the only source here that
    // is a scholarly apparatus to THIS text rather than a link graph or another
    // edition's masoret, and "what did Lieberman himself cite here" is a
    // question readers ask constantly. It is a mode rather than a shortcut for
    // unticking the others -- see soloSource in createParallelsFilter -- and
    // while it is on the individual source rows have nothing left to say.
    const soloSlug = 'lieberman_tosefta_apparatus';
    let soloRow = null;
    const perSource = document.createElement('div');
    perSource.className = 'filter-children';
    // Offered only where Lieberman actually IS an apparatus, which the data now
    // states rather than implies: `apparatusHome` counts the citations whose note
    // is printed on a passage of THIS tractate, and it is zero for every tractate
    // after Bava Batra, where his edition stops. The few citations of his that do
    // appear there are the far ends of notes printed in the volumes he did edit,
    // and they stay in the per-source list like any other source.
    const soloCount = counts.home.get(soloSlug) || 0;
    const soloCovers = soloCount > 0;
    // Still drawn when the mode is on but this tractate is out of the edition's
    // range -- only reachable now by a reader who set solo themselves, since the
    // default clears it on the way in (applyParallelsTractateDefaults), but they
    // would otherwise meet an empty margin with nothing on screen saying why, and
    // no way back short of the reset.
    if (soloCovers || parallelsFilter.soloSource === soloSlug) {
        soloRow = parallelsFilterRow(
            `רק ${PARALLEL_SOURCE_NAMES[soloSlug]}`, soloCount,
            parallelsFilter.soloSource === soloSlug,
            checked => {
                parallelsFilter.touch('solo', soloSlug);
                parallelsFilter.soloSource = checked ? soloSlug : null;
                perSource.classList.toggle('disabled', checked);
                notify();
            },
            { className: 'filter-parent',
              title: 'רק הציונים שליברמן עצמו מביא במסורת התוספתא, בלי מהדורות מאוחרות, מסורת הש"ס וקישורי ספריא' });
        sources.body.appendChild(soloRow.label);
    }
    perSource.appendChild(note);
    [...counts.sources.entries()]
        .sort((a, b) => b[1] - a[1])
        .forEach(([slug, n]) => {
            // Off by default here, and the row is the only place that can say so.
            const offByDefault = PARALLEL_HOME_BEARING_SOURCES.has(slug)
                && !(counts.home.get(slug) > 0);
            const row = parallelsFilterRow(PARALLEL_SOURCE_NAMES[slug] || slug, n,
                !parallelsFilter.excluded('sources', slug),
                checked => {
                    parallelsFilter.touch('sources', slug);
                    parallelsFilter.state.sources[checked ? 'delete' : 'add'](slug);
                    notify();
                },
                offByDefault ? { title: 'מהדורת ליברמן אינה כוללת מסכת זו; הציונים שלו המגיעים לכאן הם צדן השני של הערות שנדפסו במסכתות שערך, ולכן הם כבויים כברירת מחדל' } : {});
            perSource.appendChild(row.label);
        });
    perSource.classList.toggle('disabled', !!parallelsFilter.soloSource);
    // The per-source list is long -- sixteen editions in Berakhot -- and is the
    // fine adjustment, not the common case. It folds away behind the one switch
    // most readers actually want, which stays visible.
    if (soloRow) {
        const collapse = document.createElement('details');
        collapse.className = 'filter-collapse';
        collapse.open = parallelsFilter.state.sources.size > 0;
        const summary = document.createElement('summary');
        summary.textContent = 'סינון לפי מקור';
        collapse.append(summary, perSource);
        sources.body.appendChild(collapse);
    } else {
        sources.body.appendChild(perSource);
    }
    root.appendChild(sources.section);

    // --- how well placed, how well attested ---------------------------------
    const quality = parallelsFilterSection('דיוק ומהימנות');
    Object.keys(PARALLEL_PRECISION_LABELS).forEach(precision => {
        const n = counts.precisions.get(precision);
        if (!n) return;
        const row = parallelsFilterRow(PARALLEL_PRECISION_LABELS[precision], n,
            !parallelsFilter.excluded('precisions', precision),
            checked => {
                parallelsFilter.state.precisions[checked ? 'delete' : 'add'](precision);
                notify();
            },
            { title: precision === 'span'
                ? 'המקבילות היחידות שמסומן להן היקף בטקסט'
                : 'ציון שהיקפו לא נמדד -- מוצג ברשימה בלבד' });
        quality.body.appendChild(row.label);
    });
    const corroborated = parallelsFilterRow('רק ציונים שיותר ממקור אחד מציין', null,
        parallelsFilter.minSources > 1,
        checked => { parallelsFilter.state.minSources = checked ? 2 : 1; notify(); },
        { title: 'מסנן את הציונים שמופיעים במהדורה אחת בלבד' });
    quality.body.appendChild(corroborated.label);
    root.appendChild(quality.section);

    // --- what kind of note it is --------------------------------------------
    // Two distinctions the editions themselves draw, which the merge used to
    // flatten: a passage an editor calls parallel versus one he only sends you
    // to compare (ועיין / השווה), and a note printed here versus the far end of
    // a note printed on another passage. Both hide rather than show, matching
    // the variants sidebar's polarity, because both are "don't show me X" rather
    // than a choice among works. Each row appears only where it would do
    // something -- most tractates have a handful of each, some have none.
    if (counts.compare || counts.farEnd) {
        const kind = parallelsFilterSection('סוג ההערה');
        if (counts.compare) {
            const row = parallelsFilterRow('הסתר הפניות "ועיין"', counts.compare,
                parallelsFilter.hideCompare,
                checked => { parallelsFilter.hideCompare = checked; notify(); },
                { className: 'filter-parent',
                  title: 'ציונים שכל מקורותיהם ציינו אותם כהשוואה (ועיין, והשווה) ולא כמקבילה' });
            kind.body.appendChild(row.label);
        }
        if (counts.farEnd) {
            const row = parallelsFilterRow('הסתר ציונים מהערה במקום אחר', counts.farEnd,
                parallelsFilter.hideBacklinks,
                checked => { parallelsFilter.hideBacklinks = checked; notify(); },
                { className: 'filter-parent',
                  title: 'ציונים שהגיעו לכאן מן הצד השני של הערה שנדפסה על קטע אחר -- למשל הערה בבבא קמא המפנה לתוספתא חולין' });
            kind.body.appendChild(row.label);
        }
        root.appendChild(kind.section);
    }

    // --- status -------------------------------------------------------------
    const status = document.createElement('div');
    status.className = 'status-bar';
    root.appendChild(status);

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'parallels-filter-reset';
    reset.textContent = 'הצג הכל';
    reset.onclick = () => {
        parallelsFilter.reset();
        renderParallelsFilterUI(root, parallelsData, onChange);
        if (onChange) onChange();
    };
    root.appendChild(reset);

    function updateStatus() {
        const shown = Object.values(parallelsData.chapters)
            .reduce((n, entries) => n + entries.filter(e => parallelsFilter.matches(e)).length, 0);
        status.innerHTML = shown === counts.total
            ? `מוצגות כל <strong>${counts.total}</strong> המקבילות במסכת`
            : `מוצגות <strong>${shown}</strong> מתוך <strong>${counts.total}</strong> מקבילות במסכת`;
        reset.hidden = !parallelsFilter.active;
    }
    updateStatus();
    // The status line answers to the state, not to the click that changed it --
    // the reset button and a future keyboard shortcut go through the same path.
    parallelsFilterStatusUnsub = parallelsFilter.subscribe(updateStatus);
}
