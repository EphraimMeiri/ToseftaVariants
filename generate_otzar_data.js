#!/usr/bin/env node
/**
 * generate_otzar_data.js
 *
 * Pre-generates otzar_data.json by fetching all masekhtot variant data
 * from Sefaria, classifying each variant pair, and aggregating into rows.
 *
 * Usage: node generate_otzar_data.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load tosefta_parsing_tools.js into the current context
// so all its functions (classifyVariantPair, parseNote3, createPairKey, etc.) are available
const toolsPath = path.join(__dirname, 'tosefta_parsing_tools.js');
const toolsCode = fs.readFileSync(toolsPath, 'utf-8');

// Replace browser-only `fetch` references in the tools file — we only need the pure functions,
// not getToseftaText/getToseftavariants (we'll implement our own fetch below)
vm.runInThisContext(toolsCode);

// --- Load helpers (reads self-hosted JSONs from data/variants/) ---

async function fetchVariantsData(location) {
    const filePath = path.join(__dirname, getVariantUrl(location));
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Same ellipsis normalization as getToseftavariants
    for (let i = 0; i < json.text.length; i++) {
        for (let j = 0; j < json.text[i].length; j++) {
            for (let k = 0; k < json.text[i][j].length; k++) {
                if (typeof json.text[i][j][k] === "string" && json.text[i][j][k].includes("...")) {
                    json.text[i][j][k] = json.text[i][j][k].replace(/\.\.\./g, "\u2026");
                }
            }
        }
    }

    return json;
}

function getMasechetName(location) {
    return location.split('/')[1].replace('Tosefta%20', '').replace(/%20/g, ' ');
}

const MASECHET_HEBREW = {
    "Berakhot": "ברכות", "Peah": "פאה", "Demai": "דמאי", "Terumot": "תרומות",
    "Sheviit": "שביעית", "Kilayim": "כלאים", "Maasrot": "מעשרות",
    "Maaser Sheni": "מעשר שני", "Challah": "חלה", "Orlah": "ערלה",
    "Bikkurim": "ביכורים", "Shabbat": "שבת", "Eruvin": "עירובין",
    "Pesachim": "פסחים", "Shekalim": "שקלים", "Yoma": "יומא",
    "Sukkah": "סוכה", "Beitzah": "ביצה", "Rosh Hashanah": "ראש השנה",
    "Taanit": "תענית", "Megillah": "מגילה", "Moed Katan": "מועד קטן",
    "Chagigah": "חגיגה", "Yevamot": "יבמות", "Ketubot": "כתובות",
    "Nedarim": "נדרים", "Nazir": "נזיר", "Sotah": "סוטה",
    "Gittin": "גיטין", "Kiddushin": "קידושין", "Bava Kamma": "בבא קמא",
    "Bava Metzia": "בבא מציעא", "Bava Batra": "בבא בתרא"
};

function hebrewMasechet(engName) {
    return MASECHET_HEBREW[engName] || engName;
}

function getWitnessSigla(witnessesText) {
    return String(witnessesText || "")
        .split(/\s+/)
        .map(w => w.trim())
        .filter(Boolean)
        .map(w => w.replace(/[^\u0590-\u05FF]/g, ""))
        .filter(Boolean);
}

// --- Main aggregation ---
// Global map: merge identical pairs across all masekhtot
const globalRowsMap = new Map();

async function processLocation(location) {
    const masechetName = getMasechetName(location);
    const hebName = hebrewMasechet(masechetName);
    console.log(`  Loading ${masechetName}...`);

    const variantsData = await fetchVariantsData(location);
    const masechet = (variantsData.title || "").replace("Variants on ", "");
    let pairCount = 0;

    variantsData.text.forEach((variantPerek, perekIndex) => {
        if (!Array.isArray(variantPerek)) return;
        variantPerek.forEach((variantHalakha, halachaIndex) => {
            if (!Array.isArray(variantHalakha)) return;

            variantHalakha.forEach((variantItem, itemIndex) => {
                if (typeof variantItem !== "string" || !variantItem.includes("|")) return;

                const loc = [masechet, perekIndex, halachaIndex, itemIndex];
                const parsedNote = parseNote3(variantItem, loc);
                if (!Array.isArray(parsedNote) || (parsedNote.length !== 2 && parsedNote.length !== 3)) return;

                const sv = parsedNote[0];
                const vars = parsedNote[1];
                if (!Array.isArray(vars)) return;

                vars.forEach(([witnesses, varText]) => {
                    const classification = classifyVariantPair(sv[0], varText);
                    const key = createPairKey(sv[0], varText);

                    if (!globalRowsMap.has(key)) {
                        const sortedPair = [String(sv[0] || ""), String(varText || "")].sort();
                        globalRowsMap.set(key, {
                            left: sortedPair[0],
                            right: sortedPair[1],
                            count: 0,
                            category: classification.category,
                            reasons: {},
                            witnesses: {},
                            masekhtot: {}  // { hebName: { loc, refs: [[p,h],...], count } }
                        });
                    }

                    const row = globalRowsMap.get(key);
                    row.count += 1;
                    row.reasons[classification.reason] = (row.reasons[classification.reason] || 0) + 1;

                    getWitnessSigla(witnesses).forEach(siglum => {
                        row.witnesses[siglum] = (row.witnesses[siglum] || 0) + 1;
                    });

                    // Per-masechet data
                    if (!row.masekhtot[hebName]) {
                        row.masekhtot[hebName] = { loc: location, refs: [], count: 0 };
                    }
                    const mData = row.masekhtot[hebName];
                    mData.count += 1;
                    if (!mData.refs.some(r => r[0] === perekIndex && r[1] === halachaIndex)) {
                        mData.refs.push([perekIndex, halachaIndex]);
                    }

                    pairCount++;
                });
            });
        });
    });

    console.log(`    -> ${pairCount} variant instances`);
}

async function main() {
    console.log("Generating otzar_data.js...\n");

    for (const location of locations) {
        try {
            await processLocation(location);
        } catch (err) {
            console.error(`  ERROR loading ${getMasechetName(location)}: ${err.message}`);
        }
    }

    const allRows = [...globalRowsMap.values()];

    stampAttestation(allRows);

    // Sort by count descending
    allRows.sort((a, b) => b.count - a.count || a.left.localeCompare(b.left, 'he'));

    const output = {
        generated: new Date().toISOString(),
        totalRows: allRows.length,
        rows: allRows
    };

    const outPath = path.join(__dirname, 'otzar_data.js');
    fs.writeFileSync(outPath, 'const OTZAR_DATA = ' + JSON.stringify(output) + ';\n', 'utf-8');
    console.log(`\nDone. ${allRows.length} unique pairs written to ${outPath}`);
}

// Stamp single-word rows with corpus attestation from
// data/morphology_lexicon.json (built externally, not committed: attestation
// counts and morphological analyses for apparatus words from a wide tagged
// reference corpus plus the local base+witness texts). Verdicts:
//   same_analysis - both readings attested under an identical morphological analysis
//                   (entry + binyan/tense): almost certainly the same word
//   same_entry    - same dictionary entry, different analysis: same lexeme,
//                   possibly a different inflection (מהן/ממנו)
//   diff          - both attested under different entries: a real lexical swap
//   unknown       - attested but no lemma tagging survived filtering
//   hapax / hapax_both - a reading unattested anywhere (fewer than 2 tokens in
//                   ~5M combined): suspect spelling or corruption
function stampAttestation(rows) {
    const lexPath = path.join(__dirname, 'data/morphology_lexicon.json');
    if (!fs.existsSync(lexPath)) {
        console.log('data/morphology_lexicon.json missing - attestation not stamped');
        return;
    }
    const lex = JSON.parse(fs.readFileSync(lexPath, 'utf-8'));
    const singleBare = s => {
        const words = stripMarkup(String(s || '')).split(/\s+/).filter(w => /[א-ת]/.test(w));
        return words.length === 1 ? bareWord(words[0]) : null;
    };
    const entryName = e => e.split(' [')[0];
    let stamped = 0;
    rows.forEach(row => {
        // Omission and citation-continuation markers are notation, not words —
        // attesting them against the lexicon is meaningless.
        if (isOmissionMarker(row.left) || isOmissionMarker(row.right)
            || TRUNCATION_MARKERS.has(normalizeQuotes(row.left).trim())
            || TRUNCATION_MARKERS.has(normalizeQuotes(row.right).trim())) return;
        const bl = singleBare(row.left);
        const br = singleBare(row.right);
        if (!bl || !br || bl === br) return;
        const clean = x => ({ ...x, e: (x.e || []).filter(([entry]) => /[א-ת]/.test(entry)) });
        const L = clean(lex[bl] || { m: 0, l: 0, e: [] });
        const R = clean(lex[br] || { m: 0, l: 0, e: [] });
        const attested = x => x.m >= 2 || x.l >= 2;
        let v;
        if (!attested(L) || !attested(R)) {
            v = (!attested(L) && !attested(R)) ? 'hapax_both' : 'hapax';
        } else if (!L.e.length || !R.e.length) {
            v = 'unknown';
        } else {
            const lAnal = new Set(L.e.map(x => x[0]));
            const lEntries = new Set(L.e.map(x => entryName(x[0])));
            if (R.e.some(x => lAnal.has(x[0]))) v = 'same_analysis';
            else if (R.e.some(x => lEntries.has(entryName(x[0])))) v = 'same_entry';
            else v = 'diff';
        }
        // counts + verdict only: the analysis strings themselves are the
        // reference corpus's content and must not be redistributed
        row.att = { v, lm: L.m, ll: L.l, rm: R.m, rl: R.l };
        stamped++;
    });
    console.log(`attestation stamped on ${stamped} rows`);
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
