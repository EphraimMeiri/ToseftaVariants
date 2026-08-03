#!/usr/bin/env node
/**
 * generate_attested_spelling_pairs.js
 *
 * Regenerates ATTESTED_SPELLING_PAIRS in tosefta_parsing_tools.js.
 *
 * A pair qualifies only under the CONJUNCTION of two gates, each unsafe
 * alone (measured Aug 2026 on the full apparatus):
 *
 * 1. Same morphological analysis: both readings attested (>=2 tokens across
 *    ~5M in the reference lexicon) and sharing an identical dictionary
 *    analysis — entry plus binyan/tense bracket. Lemma alone is not enough:
 *    the analysis stops at the stem, so person/number/possessive suffix differences
 *    (לעשות/לעשותו, חייב/חייבין) still count as "same analysis".
 *
 * 2. Orthographic shape: the bare forms become identical after stripping
 *    interior א/ו/י (matres and glides, covering interior א/י swaps),
 *    folding final א to ה, and removing up to two leading particle letters
 *    (ובלכמשה) from either side. Suffix-shaped inflection differences fail
 *    this by construction, because final letters are never stripped.
 *
 * Interior ה is deliberately NOT stripped: its high-precision cases proved
 * to be closed classes handled elsewhere (rabbi names, divine names,
 * definite article), and the remainder is binyan morphology.
 *
 * Usage: node generate_attested_spelling_pairs.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TOOLS_PATH = path.join(__dirname, 'tosefta_parsing_tools.js');
vm.runInThisContext(fs.readFileSync(TOOLS_PATH, 'utf-8'));

const MIN_LENGTH = 3;

// Known conflations to exclude as pairs, extend when spotted. The qal/nifal
// voice pairs (נותן/ניתן, נוטל/ניטל) are deliberate blocklist entries even
// though ambiguous tagging in the reference lexicon sometimes gives them a
// shared analysis — same policy as generate_phonetic_pairs.js.
const BLOCKED_PAIRS = [
    ["נותן", "ניתן"], ["נותנין", "ניתנין"], ["שניתנה", "שנותנה"], ["שניתנו", "שנותנו"],
    ["נותנת", "ניתנת"], ["נוטלין", "ניטלין"], ["נוטלה", "ניטלה"], ["נוטלה", "ניטלא"],
    ["שנוטל", "שניטל"], ["נוטלת", "ניטלת"], ["שנוטלה", "שניטלה"], ["נוטל", "ניטל"],
    ["מכיר", "מכור"], ["קירות", "קורות"], ["תדיר", "תדור"],
    ["העור", "העיר"], ["עורות", "עירות"], ["חבולה", "חבילה"],
    ["טובך", "טיבך"], ["תומן", "תימן"], ["והוא", "והיא"]
];

function shapeKey(bare) {
    let w = bare;
    if (w.endsWith("א")) {
        w = w.slice(0, -1) + "ה";
    }
    if (w.length > 2) {
        w = w[0] + w.slice(1, -1).replace(/[אוי]/g, "") + w[w.length - 1];
    }
    return w;
}

// Equal after shape folding, tolerating particle prefixes: strip up to two
// leading ובלכמשה letters from each side before comparing shape keys, but
// require the unstripped remainders to be non-trivial.
function orthographicShapeEqual(ba, bb) {
    const variants = w => {
        const out = [w];
        for (let n = 1; n <= 2 && n < w.length - 2; n++) {
            const prefix = w.slice(0, n);
            if ([...prefix].every(c => "ובלכמשה".includes(c))) {
                out.push(w.slice(n));
            }
        }
        return out;
    };
    for (const a of variants(ba)) {
        for (const b of variants(bb)) {
            if (a.length >= MIN_LENGTH && b.length >= MIN_LENGTH && shapeKey(a) === shapeKey(b)) {
                return true;
            }
        }
    }
    return false;
}

// Difference confined to a short word-final suffix over a shared stem:
// common prefix of at least 3 letters, both remainders at most 3.
function suffixShapeEqual(ba, bb) {
    let i = 0;
    while (i < Math.min(ba.length, bb.length) && ba[i] === bb[i]) i++;
    return i >= 3 && ba.length - i <= 3 && bb.length - i <= 3;
}

function main() {
    // Classify against the tools as if the generated lists were empty, so
    // rerunning the generator is idempotent and the emitted lists contain
    // only pairs no other rule already explains.
    ATTESTED_SPELLING_PAIRS.clear();
    INFLECTION_PAIRS.clear();

    const lexPath = path.join(__dirname, 'data/morphology_lexicon.json');
    if (!fs.existsSync(lexPath)) {
        console.error('data/morphology_lexicon.json missing - build it externally first');
        process.exit(1);
    }
    const lex = JSON.parse(fs.readFileSync(lexPath, 'utf-8'));
    const blocked = new Set(BLOCKED_PAIRS.map(([a, b]) => [bareWord(a), bareWord(b)].sort().join('|')));

    const attested = x => x && (x.m >= 2 || x.l >= 2);
    const entriesOf = x => (x && x.e || []).map(([entry]) => entry).filter(e => /[א-ת]/.test(e));
    const entryName = e => e.split(' [')[0];
    const sameAnalysis = (ba, bb) => {
        const A = lex[ba], B = lex[bb];
        if (!attested(A) || !attested(B)) return false;
        const ea = new Set(entriesOf(A));
        return entriesOf(B).some(e => ea.has(e));
    };
    const sameEntry = (ba, bb) => {
        const A = lex[ba], B = lex[bb];
        if (!attested(A) || !attested(B)) return false;
        const ea = new Set(entriesOf(A).map(entryName));
        return entriesOf(B).some(e => ea.has(entryName(e)));
    };

    const pairs = new Set();
    const inflection = new Set();
    const dir = path.join(__dirname, 'data/variants');
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
        let json;
        try { json = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')); } catch (e) { continue; }
        const text = json.text || json;
        if (!Array.isArray(text)) continue;
        text.forEach((perek, pi) => {
            if (!Array.isArray(perek)) return;
            perek.forEach((hal, hi) => {
                if (!Array.isArray(hal)) return;
                hal.forEach((item, ii) => {
                    if (typeof item !== 'string' || !item.includes('|')) return;
                    let parsed;
                    try { parsed = parseNote3(item, [f, pi, hi, ii]); } catch (e) { return; }
                    if (!Array.isArray(parsed) || (parsed.length !== 2 && parsed.length !== 3)) return;
                    const sv = parsed[0], vars = parsed[1];
                    if (!Array.isArray(vars)) return;
                    const svWords = stripMarkup(String(sv[0] || '')).split(/\s+/).filter(w => /[א-ת]/.test(w));
                    vars.forEach(([, varText]) => {
                        const vWords = stripMarkup(String(varText || '')).split(/\s+/).filter(w => /[א-ת]/.test(w));
                        if (svWords.length !== 1 || vWords.length !== 1) return;
                        const ba = bareWord(svWords[0]);
                        const bb = bareWord(vWords[0]);
                        if (ba.length < MIN_LENGTH || bb.length < MIN_LENGTH || ba === bb) return;
                        const key = [ba, bb].sort().join('|');
                        if (blocked.has(key) || pairs.has(key) || inflection.has(key)) return;
                        const spelling = orthographicShapeEqual(ba, bb) && sameAnalysis(ba, bb);
                        const inflected = !spelling && suffixShapeEqual(ba, bb) && sameEntry(ba, bb);
                        if (!spelling && !inflected) return;
                        // only pairs no existing rule already explains
                        if (classifyVariantPair(svWords[0], vWords[0]).category !== 'major') return;
                        (spelling ? pairs : inflection).add(key);
                    });
                });
            });
        });
    }

    console.log(`spelling pairs emitted: ${pairs.size}, inflection pairs: ${inflection.size}`);
    if (process.argv.includes('--dry-run')) {
        console.log('spelling:', [...pairs].sort().slice(0, 20).join('  '));
        console.log('inflection:', [...inflection].sort().slice(0, 20).join('  '));
        return;
    }
    let src = fs.readFileSync(TOOLS_PATH, 'utf-8');
    for (const [name, set] of [['ATTESTED_SPELLING_PAIRS', pairs], ['INFLECTION_PAIRS', inflection]]) {
        const sorted = [...set].sort();
        const lines = [];
        for (let i = 0; i < sorted.length; i += 6) {
            lines.push('    ' + sorted.slice(i, i + 6).map(p => JSON.stringify(p)).join(', '));
        }
        const block = `const ${name} = new Set([\n` + lines.join(',\n') + '\n]);';
        const re = new RegExp(`(// BEGIN GENERATED: ${name}\\n)[\\s\\S]*?(\\n// END GENERATED: ${name})`);
        if (!re.test(src)) {
            console.error(`markers for ${name} not found in tosefta_parsing_tools.js`);
            process.exit(1);
        }
        src = src.replace(re, `$1${block}$2`);
    }
    fs.writeFileSync(TOOLS_PATH, src, 'utf-8');
    console.log('tosefta_parsing_tools.js updated.');
}

main();
