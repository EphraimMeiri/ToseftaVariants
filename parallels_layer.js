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
//   parallels           a dock panel, in the side dock beside the commentaries:
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
    oz_vehadar_masoret_hashas: 'מסורת הש"ס (עוז והדר)',
    oz_vehadar_yerushalmi_masoret: 'מסורת הש"ס לירושלמי (עוז והדר)',
    yefe_einayim_apparatus: 'יפה עינים',
    ofek_sifra_masoret: 'מסורת הספרא (אופק)',
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

const PARALLEL_PRECISION_LABELS = {
    span: 'היקף מזוהה',
    dh: 'ראש הקטע בלבד',
    halakhah: 'הלכה בלבד',
    chapter: 'פרק בלבד',
};

// A tier the merge assigns from how well the sources agree. Shown as a dot count
// rather than a word: it is a rough confidence, and spelling it out would give
// it more authority than it has.
const PARALLEL_TIER_WEIGHT = { strong: 3, medium: 2, weak: 1, 'single-source': 1 };


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

    function chapter(chapterIndex) {
        if (!cache.has(chapterIndex)) {
            const raw = (parallelsData.chapters || {})[String(chapterIndex)] || [];
            // Entries arrive sorted by position from the builder; re-sorting here
            // keeps the lane assignment correct even if that ever changes.
            const entries = raw.slice().sort((a, b) =>
                a.baseIdx - b.baseIdx || a.endIdx - b.endIdx || a.ref.localeCompare(b.ref));
            const spans = entries.filter(e => e.precision === 'span');
            const { lanes, laneCount } = assignParallelLanes(spans);
            cache.set(chapterIndex, { entries, spans, lanes, laneCount });
        }
        return cache.get(chapterIndex);
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
        missingText: 'הטקסט של המקבילה אינו זמין כאן',
        openOnSefaria: 'פתיחה בספריא',
        ...labels,
    };

    const container = document.createElement('div');
    container.className = 'parallels-panel';

    const heading = document.createElement('div');
    heading.className = 'parallels-heading';
    container.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'parallels-list';
    container.appendChild(list);

    const empty = document.createElement('p');
    empty.className = 'parallels-empty';
    empty.textContent = text.noSelection;
    container.appendChild(empty);

    root.appendChild(container);

    let entries = [];
    let texts = {};
    let expanded = new Set();
    const rowById = new Map();

    function sourceList(entry) {
        return (entry.sources || [])
            .map(s => PARALLEL_SOURCE_NAMES[s] || s)
            .join(' · ');
    }

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
        const strength = Math.min(4, Math.max(
            entry.numSources || 1, PARALLEL_TIER_WEIGHT[entry.tier] || 1));
        const dots = document.createElement('span');
        dots.className = 'parallel-strength';
        dots.textContent = '●'.repeat(strength);
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
        const scheme = entry.citedScheme === 'vilna' ? 'וילנא'
                     : entry.citedScheme === 'lieberman' ? 'ליברמן' : '';
        cited.textContent = (entry.citations && entry.citations.length)
            ? entry.citations[0]
            : `${entry.ref}`;
        if (scheme) cited.title = `מספור ${scheme}, ${entry.citedRef}`;
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

    function render() {
        list.innerHTML = '';
        rowById.clear();
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
        // A click on a bar in the text should bring its citation into view and
        // open it; a hover should only light it up. Otherwise brushing past the
        // gutter would expand rows the reader never asked for.
        if (!entryId || meta.transient) return;
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
        setEntries(nextEntries, headingText, nextTexts) {
            entries = nextEntries || [];
            texts = nextTexts || {};
            heading.textContent = headingText || '';
            heading.hidden = !headingText;
            render();
        },
        clear() {
            entries = [];
            expanded = new Set();
            heading.textContent = '';
            heading.hidden = true;
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

        let beside = false;

        function setCtx(next) {
            const data = next && next.parallelsData;
            index = (data && next.textData)
                ? createParallelsIndex(data, next.textData) : null;
            texts = index ? index.texts : {};
            beside = !!(next && next.parallelsBeside);
        }
        setCtx(ctx);

        panel = createParallelsPanel({ root: container });

        return {
            select(addr) {
                if (!index || !addr || addr.chapter == null) {
                    panel.clear();
                    return;
                }
                if (addr.halakhah == null) {
                    panel.setEntries(index.chapter(addr.chapter).entries,
                                     `פרק ${convert_number(addr.chapter + 1)}`, texts);
                    return;
                }
                const entries = index.forHalakhah(addr.chapter, addr.halakhah);
                panel.setEntries(
                    entries,
                    `פרק ${convert_number(addr.chapter + 1)}, הלכה ${addr.halakhah + 1}`,
                    texts);
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
                panel.clear();
            },
            destroy() { panel.destroy(); },
        };
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


// --- beside layout ----------------------------------------------------------
// The reading mode the parallels apparatus actually wants: the parallel's own
// text opens in the column the variant apparatus normally occupies, level with
// the words it belongs to, and the halakhah is broken into the subunits its
// parallels carve it into so that alignment is possible at all.
//
// What marks a parallel is THE TEXT ITSELF -- the covered words are the clickable
// affordance. An earlier version put a citation chip in this column and the same
// citation again as a card in the dock, which was one list rendered twice; the
// chip said nothing the reader couldn't get by clicking the words it pointed at.
// So the near column is reserved for the one thing it is uniquely good for:
// holding the parallel passage beside the passage it parallels. Everything else
// about a citation -- who attests it, how precisely it is anchored, its other
// occurrences -- stays in the dock, which is where a list belongs.
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

        const entries = index.chapter(chapterIndex).entries.filter(
            e => e.endIdx >= first && e.baseIdx <= last);

        // Break points are the subunit starts, but here they must be starts of
        // ROWS, so an entry beginning before this paragraph doesn't open one.
        const starts = index.subunitStarts(chapterIndex, halakhah, [first, last + 1]);
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

            // Where an opened passage goes. Empty until the reader clicks, and
            // addressed by the row's word range so any entry starting in this row
            // can find its slot -- including one opened from a different halakhah.
            const slot = document.createElement('div');
            slot.className = 'parallel-split-refs';
            slot.dataset.rowFrom = String(row.from);
            slot.dataset.rowTo = String(row.to === Infinity ? last : row.to);
            rowEl.appendChild(slot);

            split.appendChild(rowEl);
        });

        textColumn.appendChild(split);

        // The words themselves are the affordance. A word can be covered by
        // several parallels at once, so each carries every id covering it and the
        // click resolves to the most specific -- the narrowest extent, which is
        // the one the reader is pointing at rather than the sugya containing it.
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

// Mark every word covered by a span-anchored parallel, and record which parallels
// cover it. Only span-anchored ones: a citation we could place no more precisely
// than "this halakhah" has no words of its own to mark, and underlining the whole
// halakhah for it would assert a precision we don't have.
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
            // Depth, not identity: with a dozen overlapping parallels, colouring
            // by work would turn the reading text into a heat map. One mark that
            // gets slightly stronger where parallels pile up says the useful part
            // -- "more is claimed here" -- and stays readable.
            el.dataset.parallelDepth = String(Math.min(3, ids.length));
        }
        const startEl = byIdx.get(entry.baseIdx);
        if (startEl) startEl.classList.add('parallel-span-start');
        const endEl = byIdx.get(entry.endIdx);
        if (endEl) endEl.classList.add('parallel-span-end');
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
    box.style.setProperty('--parallel-color',
        (PARALLEL_GROUP_BY_ID.get(entry.group) || {}).color || '#8a7a63');

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
            markParallelSubunits(index, chapterIndex, halakhah, byIdx, [first, last + 1]);
        }
        if (here.length) {
            measurable.push({ textColumn, byIdx, first, last, here, chapterData });
        }
    });

    // Beside-mode marks the extents in the text itself and opens the passage next
    // to them, so bars there would be a second answer to a question already
    // answered. They are the plain mode's only way to show an extent.
    if (parallelExtentsState.withBeside) return;

    // Now measure and draw. The bars are absolutely positioned inside the reading
    // column, which no longer reflows.
    measurable.forEach(({ textColumn, byIdx, first, last, here, chapterData }) => {
        const gutter = document.createElement('div');
        gutter.className = 'parallel-gutter';
        textColumn.appendChild(gutter);
        const columnRect = textColumn.getBoundingClientRect();

        here.forEach(entry => {
            // Clip to this paragraph: a parallel spanning three halakhot is three
            // bar segments, one per paragraph, each capped only where the parallel
            // itself actually starts or ends. A single bar couldn't be drawn --
            // the paragraphs are separate boxes with the apparatus column between.
            const startIdx = Math.max(entry.baseIdx, first);
            const endIdx = Math.min(entry.endIdx, last);
            const startEl = nearestWord(byIdx, startIdx, 1, last);
            const endEl = nearestWord(byIdx, endIdx, -1, first);
            if (!startEl || !endEl) return;
            const top = startEl.getBoundingClientRect().top - columnRect.top;
            const bottom = endEl.getBoundingClientRect().bottom - columnRect.top;

            const bar = document.createElement('button');
            bar.type = 'button';
            bar.className = 'parallel-bar';
            bar.dataset.entryId = entry.id;
            bar.style.setProperty('--parallel-lane',
                String(chapterData.lanes.get(entry.id) || 0));
            bar.style.setProperty('--parallel-color',
                (PARALLEL_GROUP_BY_ID.get(entry.group) || {}).color || '#8a7a63');
            bar.style.top = `${Math.max(0, top)}px`;
            bar.style.height = `${Math.max(6, bottom - top)}px`;
            if (entry.baseIdx < first) bar.classList.add('continues-above');
            if (entry.endIdx > last) bar.classList.add('continues-below');
            bar.title = `${entry.heRef || entry.ref}${entry.dh ? ' — ' + entry.dh : ''}`;
            bar.setAttribute('aria-label', bar.title);
            gutter.appendChild(bar);

            for (let i = startIdx; i <= endIdx; i++) {
                const el = byIdx.get(i);
                if (el) el.classList.add('parallel-covered');
            }
        });
    });
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
    const starts = index.subunitStarts(chapterIndex, halakhah, range);
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

// Open a parallel's text in the near column, level with the words it covers.
//
// It opens beside EVERY occurrence of the same passage in the chapter, not only
// the one clicked. Our halakhot are long, and one Mishnah is often parallel to
// two or three separate clauses of a single chapter; seeing those together is the
// comparison the apparatus exists for, and it is precisely what a list of
// citations cannot show. The other occurrences sit in their own halakhot, so they
// come into view as the reader scrolls rather than being pulled out of place.
function openParallelPassages(container, index, texts, entry) {
    const related = index.chapter(entry.chapter).entries.filter(
        e => e.ref === entry.ref && e.precision === 'span');
    (related.length ? related : [entry]).forEach(target => {
        const slot = slotFor(container, target);
        if (!slot) return;
        openParallels.add(target.id);
        if (slot.querySelector(`.parallel-open[data-entry-id="${target.id}"]`)) return;
        slot.appendChild(buildOpenedPassage(target, texts,
            () => closeParallelGroup(container, index, target)));
    });
    highlightOpenState(container);
}

// Closing one occurrence closes the group it was opened with, because they were
// opened by one gesture and are one claim.
function closeParallelGroup(container, index, entry) {
    index.chapter(entry.chapter).entries
        .filter(e => e.ref === entry.ref)
        .forEach(e => {
            openParallels.delete(e.id);
            container.querySelectorAll(`.parallel-open[data-entry-id="${e.id}"]`)
                .forEach(box => box.remove());
        });
    highlightOpenState(container);
}

// The row slot whose word range contains where this parallel starts.
function slotFor(container, entry) {
    const paragraph = container.querySelector(`#hal-${entry.chapter}-${entry.halakhah}`);
    if (!paragraph) return null;
    const slots = [...paragraph.querySelectorAll('.parallel-split-refs')];
    for (const slot of slots) {
        if (entry.baseIdx >= Number(slot.dataset.rowFrom)
            && entry.baseIdx <= Number(slot.dataset.rowTo)) return slot;
    }
    return slots[0] || null;
}

function highlightOpenState(container) {
    container.querySelectorAll('.body-word.parallel-span').forEach(el => {
        const ids = (el.dataset.parallelIds || '').split(' ').filter(Boolean);
        el.classList.toggle('parallel-open-word', ids.some(id => openParallels.has(id)));
    });
    // A halakhah only gives up reading width where the reader has actually opened
    // something. Reserving the column everywhere cost the whole chapter its
    // measure -- four or five words to a line -- to hold columns that were empty.
    container.querySelectorAll('.parallel-split').forEach(split => {
        split.classList.toggle('has-open', !!split.querySelector('.parallel-open'));
    });
}

// Clicks and hovers on whatever names a parallel from inside the reading column:
// a covered word in beside-mode, a gutter bar in the plain mode. Delegated once at
// the container -- a chapter carries hundreds of both.
const PARALLEL_TARGETS = '.parallel-bar, .body-word.parallel-span';

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
            if (openParallels.has(entry.id)) closeParallelGroup(container, state.index, entry);
            else openParallelPassages(container, state.index, state.texts, entry);
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
    document.querySelectorAll('.parallel-bar.focused, .parallel-open.focused')
        .forEach(el => el.classList.remove('focused'));
    document.querySelectorAll('.body-word.parallel-focus, .body-word.parallel-focus-related')
        .forEach(el => el.classList.remove('parallel-focus', 'parallel-focus-related'));
    if (!entryId || !parallelExtentsState) return;

    document.querySelectorAll(`.parallel-bar[data-entry-id="${entryId}"], .parallel-open[data-entry-id="${entryId}"]`)
        .forEach(el => el.classList.add('focused'));

    const { container, index } = parallelExtentsState;
    const entry = findEntryAnywhere(index, container, entryId);
    if (!entry) return;

    const siblings = index.chapter(entry.chapter).entries.filter(
        e => e.ref === entry.ref && e.id !== entry.id && e.precision === 'span');

    container.querySelectorAll('.body-word[data-base-idx]').forEach(el => {
        const idx = Number(el.dataset.baseIdx);
        if (idx >= entry.baseIdx && idx <= entry.endIdx) {
            el.classList.add('parallel-focus');
        } else if (siblings.some(sib => idx >= sib.baseIdx && idx <= sib.endIdx)) {
            el.classList.add('parallel-focus-related');
        }
    });
});
