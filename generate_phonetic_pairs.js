#!/usr/bin/env node
/**
 * generate_phonetic_pairs.js
 *
 * Regenerates PHONETIC_SPELLING_PAIRS in tosefta_parsing_tools.js from
 * data/variants/.
 *
 * Two words are phonetic-spelling equivalents when they share a skeleton
 * under: final א/ה fold, non-final phonetic consonant folds (צ→ס, ת→ט,
 * ק→כ, ע→א), and interior matres (י/ו) stripping. That equivalence alone
 * over-matches badly (מכיר/מכור, סיידין/ציידין, נותנין/ניתנין are different
 * words), so a pair is emitted only when its spelling cluster — connected
 * component over skeleton-equal pairs that actually occur as variants of
 * each other in the apparatus — has at least MIN_CLUSTER co-attested forms.
 * A word with three-plus attested spellings has no fixed spelling; that is
 * the signature of a loanword or fluid orthography, not of two lexemes.
 *
 * BLOCKED_PAIRS lists known distinct-lexeme and binyan-voice pairs; they are
 * removed as *edges*, so they neither classify as phonetic nor certify a
 * cluster. Extend it when a conflation is spotted.
 *
 * Usage: node generate_phonetic_pairs.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TOOLS_PATH = path.join(__dirname, 'tosefta_parsing_tools.js');
vm.runInThisContext(fs.readFileSync(TOOLS_PATH, 'utf-8'));

const MIN_CLUSTER = 3;
const MIN_LENGTH = 4;

const CONS_FOLDS = { "צ": "ס", "ת": "ט", "ק": "כ", "ע": "א" };

// The same letters spell a pronoun against a verb: never phonetic.
const HAYA_FAMILY = new Set(["היא", "היה", "הוא", "יהא", "יהיה", "יהו", "יהוא"]);

// Distinct lexemes / voice distinctions that phonetic folding conflates.
const BLOCKED_PAIRS = [
    ["מאות", "מעות"], ["שטבלו", "שתבלו"], ["שטבלו", "שתיבלו"],
    ["קירות", "קורות"], ["אליה", "עליה"], ["אליו", "עליו"],
    ["כשיעור", "כשאר"], ["כשעור", "כשאר"], ["חייב", "חיוב"],
    ["כלים", "כלום"], ["אילים", "אולם"], ["שניקר", "שניכר"],
    ["מכיר", "מכור"], ["תדיר", "תדור"], ["המומין", "הממון"],
    ["שיודע", "שידע"], ["שיודע", "שידוע"], ["עורות", "עירות"],
    ["זכיתי", "זכותי"], ["נטועה", "נטיעה"], ["מרבותי", "מרביתי"],
    ["הוזק", "היזיק"], ["חבילי", "חבולי"], ["חבולה", "חבילה"],
    ["נותן", "ניתן"], ["נותנין", "ניתנין"], ["שניתנה", "שנותנה"], ["שניתנו", "שנותנו"],
    ["נוטלין", "ניטלין"], ["נוטלה", "ניטלה"], ["נוטלה", "ניטלא"],
    ["שנוטל", "שניטל"], ["נוטלת", "ניטלת"], ["שנוטלה", "שניטלה"]
];

function phoneticSkeleton(bare) {
    let w = bare;
    if (w.endsWith("א")) {
        w = w.slice(0, -1) + "ה";
    }
    w = [...w].map((c, i) => (i < w.length - 1 && CONS_FOLDS[c]) || c).join("");
    if (w.length > 2) {
        w = w[0] + w.slice(1, -1).replace(/[יו]/g, "") + w[w.length - 1];
    }
    return w;
}

function coreWord(bare) {
    const m = bare.match(/^[ובלכמשה]{1,2}(?=.{3})/);
    return m ? bare.slice(m[0].length) : bare;
}

function pairKeyOf(ba, bb) {
    return [ba, bb].sort().join("|");
}

function main() {
    const blocked = new Set(BLOCKED_PAIRS.map(([a, b]) => pairKeyOf(bareWord(a), bareWord(b))));

    // Union-find over bare spellings linked by skeleton-equal variant pairs.
    const parentMap = new Map();
    const find = x => {
        if (!parentMap.has(x)) parentMap.set(x, x);
        while (parentMap.get(x) !== x) {
            parentMap.set(x, parentMap.get(parentMap.get(x)));
            x = parentMap.get(x);
        }
        return x;
    };
    const union = (a, b) => { parentMap.set(find(a), find(b)); };

    const edgeKeys = new Set();
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
                        if (phoneticSkeleton(ba) !== phoneticSkeleton(bb)) return;
                        if (HAYA_FAMILY.has(coreWord(ba)) || HAYA_FAMILY.has(coreWord(bb))) return;
                        const key = pairKeyOf(ba, bb);
                        if (blocked.has(key)) return;
                        union(ba, bb);
                        edgeKeys.add(key);
                    });
                });
            });
        });
    }

    const memberCounts = new Map();
    for (const key of edgeKeys) {
        for (const w of key.split('|')) {
            const root = find(w);
            if (!memberCounts.has(root)) memberCounts.set(root, new Set());
            memberCounts.get(root).add(w);
        }
    }
    const pairs = [...edgeKeys]
        .filter(key => memberCounts.get(find(key.split('|')[0])).size >= MIN_CLUSTER)
        .sort();

    console.log(`clusters >= ${MIN_CLUSTER}: ${[...memberCounts.values()].filter(m => m.size >= MIN_CLUSTER).length}`);
    console.log(`pairs emitted: ${pairs.length}`);

    if (process.argv.includes('--dry-run')) {
        console.log(pairs.slice(0, 20).join('\n'));
        return;
    }

    const lines = [];
    for (let i = 0; i < pairs.length; i += 6) {
        lines.push('    ' + pairs.slice(i, i + 6).map(p => JSON.stringify(p)).join(', '));
    }
    const block = 'const PHONETIC_SPELLING_PAIRS = new Set([\n' + lines.join(',\n') + '\n]);';
    const src = fs.readFileSync(TOOLS_PATH, 'utf-8');
    const re = /(\/\/ BEGIN GENERATED: PHONETIC_SPELLING_PAIRS\n)[\s\S]*?(\n\/\/ END GENERATED: PHONETIC_SPELLING_PAIRS)/;
    if (!re.test(src)) {
        console.error('markers not found in tosefta_parsing_tools.js');
        process.exit(1);
    }
    fs.writeFileSync(TOOLS_PATH, src.replace(re, `$1${block}$2`), 'utf-8');
    console.log('tosefta_parsing_tools.js updated.');
}

main();
