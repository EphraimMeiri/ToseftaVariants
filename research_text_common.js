// Shared rendering logic for the hidden research pages' classified-text
// views (research_variance.html, research_aggadah.html).
//
// Sites come from data/research_sites/<Eng>.json (see
// export_research_pages_data.py in the sefaria-tosefta repo): per pair, per
// "chapter:halakha", ordered rows [var_idx, class, lemma, reading_1,
// reading_2, affected_words]. var_idx equals the 1-based data-order marker
// number in the base text; var_idx >= 1000 marks synthetic Sotah-Erfurt sites
// with no marker, anchored here by ordered lemma search.

const RESEARCH_CLASSES = ["substantive", "minor", "citation_scope",
                          "citation_context", "orthographic", "linguistic"];
const RESEARCH_CLASS_HEBREW = {
    substantive: 'מהותי', minor: 'קל', citation_scope: 'היקף ציטוט',
    citation_context: 'בתוך ציטוט', orthographic: 'כתיב', linguistic: 'לשון',
};

function researchEscapeHtml(text) {
    return String(text ?? "")
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const RESEARCH_MARKER_RE = /<i data-commentator="Variants" data-label="[^"]*" data-order="(\d+)"><\/i>/g;

function researchStripPunct(w) {
    return String(w || '').replace(/<[^>]+>/g, '').replace(/[,.;:!?״()\[\]"׳'‏]+/g, '').trim();
}

function researchHeNum(n) {
    return (typeof convert_number === 'function') ? convert_number(n) : String(n);
}

// Tokenize a halakha's html, remembering marker positions (order -> token idx)
function researchTokenizeHalakha(html) {
    const parts = String(html || '').split(RESEARCH_MARKER_RE);
    const tokens = [];
    const markerPos = new Map();
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 1) {
            markerPos.set(parseInt(parts[i], 10), tokens.length);
        } else {
            parts[i].replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ')
                .split(/\s+/).filter(Boolean).forEach(w => tokens.push(w));
        }
    }
    return { tokens, markerPos };
}

// Match lemma (possibly "X … Y") against tokens starting at `start`.
// Returns matched token count, or 0.
function researchMatchLemmaAt(tokens, start, lemma) {
    const parts = String(lemma).split(/\s*(?:\.\.\.|…)\s*/).filter(Boolean)
        .map(p => p.split(/\s+/).map(researchStripPunct).filter(Boolean));
    if (!parts.length || !parts[0].length) return 0;
    const first = parts[0];
    for (let k = 0; k < first.length; k++) {
        if (start + k >= tokens.length || researchStripPunct(tokens[start + k]) !== first[k]) return 0;
    }
    let len = first.length;
    if (parts.length > 1 && parts[1].length) {
        const second = parts[parts.length - 1];
        const limit = Math.min(tokens.length - second.length, start + len + 60);
        for (let p = start + len; p <= limit; p++) {
            let ok = true;
            for (let k = 0; k < second.length; k++) {
                if (researchStripPunct(tokens[p + k]) !== second[k]) { ok = false; break; }
            }
            if (ok) { len = (p + second.length) - start; break; }
        }
    }
    return len;
}

// Search lemma anywhere from `from` (for synthetic, unanchored sites)
function researchSearchLemma(tokens, from, lemma) {
    for (let p = from; p < tokens.length; p++) {
        const len = researchMatchLemmaAt(tokens, p, lemma);
        if (len > 0) return { start: p, len };
    }
    return null;
}

function researchSiteTooltip(pair, r1, r2) {
    const [s1, s2] = pair.split('-');
    const show = r => (r && r.trim()) ? r : 'ח׳';
    return `${s1}: ${show(r1)}  |  ${s2}: ${show(r2)}`;
}

// Render one halakha's html with its classified sites highlighted inline.
// `visible` is a Set of class names to color. Returns {html, leftovers}.
function researchRenderHalakha(html, sites, pair, visible) {
    const { tokens, markerPos } = researchTokenizeHalakha(html);
    const tokenSite = new Array(tokens.length).fill(null);
    const badgeAt = new Map();   // token idx -> [site,...]
    const leftovers = [];
    let synthCursor = 0;

    for (const site of sites) {
        const [vi, cls, lemma] = site;
        let start = null, len = 0;
        if (vi < 1000 && markerPos.has(vi)) {
            start = markerPos.get(vi);
            len = researchMatchLemmaAt(tokens, start, lemma);
            if (!len) {
                if (!badgeAt.has(start)) badgeAt.set(start, []);
                badgeAt.get(start).push(site);
                continue;
            }
        } else {
            const found = researchSearchLemma(tokens, synthCursor, lemma);
            if (found) {
                start = found.start; len = found.len;
                synthCursor = found.start + found.len;
            } else {
                leftovers.push(site);
                continue;
            }
        }
        for (let k = start; k < start + len && k < tokens.length; k++) {
            if (!tokenSite[k]) tokenSite[k] = site;
        }
    }

    const out = [];
    let i = 0;
    const pushBadges = idx => {
        if (!badgeAt.has(idx)) return;
        for (const site of badgeAt.get(idx)) {
            if (visible.has(site[1])) {
                out.push(`<sup class="vb vh-${site[1]}" title="${researchEscapeHtml(site[2] + ' — ' + researchSiteTooltip(pair, site[3], site[4]))}">●</sup>`);
            }
        }
    };
    while (i < tokens.length) {
        pushBadges(i);
        const site = tokenSite[i];
        if (site && visible.has(site[1])) {
            let j = i;
            while (j < tokens.length && tokenSite[j] === site) j++;
            const words = tokens.slice(i, j).map(researchEscapeHtml).join(' ');
            out.push(`<span class="vh vh-${site[1]}" title="${researchEscapeHtml(researchSiteTooltip(pair, site[3], site[4]))}">${words}</span>`);
            i = j;
        } else {
            out.push(researchEscapeHtml(tokens[i]));
            i++;
        }
    }
    pushBadges(tokens.length);
    return { html: out.join(' '), leftovers };
}

// Leftover list line under a halakha block (empty-lemma sites shown as "+ text")
function researchLeftoverHtml(leftovers, pair, visible) {
    const items = leftovers.filter(s => visible.has(s[1]));
    if (!items.length) return '';
    return `<div class="leftover">חילופים ללא עיגון בטקסט: ` +
        items.map(s => {
            const label = (s[2] && s[2].trim()) ? s[2]
                : '+ ' + ((s[3] && s[3].trim()) || (s[4] && s[4].trim()) || '—');
            return `<span class="vh vh-${s[1]}" title="${researchEscapeHtml(researchSiteTooltip(pair, s[3], s[4]))}">${researchEscapeHtml(label)}</span>`;
        }).join(' · ') + `</div>`;
}
