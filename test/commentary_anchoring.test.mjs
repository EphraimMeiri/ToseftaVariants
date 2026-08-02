// Regression test for commentary DH anchoring, over the real data in
// data/commentaries/. The anchor rate IS the quality claim for the commentary
// layers, so it's asserted rather than eyeballed: a change to tokenizeHe,
// wordsMatchHe, parseCommentaryDH, or the base text can silently degrade it,
// and the failure mode is notes quietly attaching to the wrong word.
//
//   npm test
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// tosefta_parsing_tools.js is a plain browser script; `document` is only touched
// inside DOM-building functions, none of which we call.
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'tosefta_parsing_tools.js'), 'utf8'), ctx);
const { createCommentaryIndex, parseCommentaryDH, commentaryLineRef } = ctx;
// Top-level `const` doesn't become a context property under vm (unlike function
// declarations), so read it as an expression.
const COMMENTARY_SLUGS = vm.runInContext('COMMENTARY_SLUGS', ctx);

// --- DH parsing edge cases --------------------------------------------------
const dh = (html) => (parseCommentaryDH(html) || []).join(' ');
assert.equal(dh('<b>אדן. </b>כתיב רגיל'), 'אדן', 'plain DH, trailing period dropped');
assert.equal(dh("<b>זכאין וכו'.</b> body"), 'זכאין', "וכו' elision dropped");
assert.equal(dh('<b>סימן לדבר וכו\'.</b> x'), 'סימן לדבר', 'multi-word DH kept');
assert.equal(dh('<b>בביתך, פרט לעסוקים</b> x'), 'בביתך', 'paraphrase after comma dropped');
assert.equal(dh('<b>]מחמת הלוקח[ וכו\'.</b> x'), 'מחמת הלוקח', 'editorial brackets stripped');
assert.equal(parseCommentaryDH('no bold here'), null, 'no DH -> null');

// Kifshuta's leading <small>N.</small> is a PRINTED LINE reference, not a note
// number, and may be a range. It must be recognised (so it is not rendered as a
// note number) and stripped from the body.
assert.equal(commentaryLineRef('<small>7.</small> <b>x</b>'), '7');
assert.equal(commentaryLineRef('<small>10-11.</small> <b>x</b>'), '10-11', 'line ranges too');
assert.equal(commentaryLineRef('<b>x</b>'), null);

// --- anchor rates over the whole corpus -------------------------------------
// Floors sit just under the measured rates, so real regressions trip them but
// incidental drift from a base-text correction doesn't.
const FLOORS = {
    BriefCommentary: { notes: 6246, minWordAnchored: 0.995 },   // measured 99.9%
    Kifshuta: { notes: 14657, minWordAnchored: 0.993 },         // measured 99.7%
};

const commDir = path.join(ROOT, 'data/commentaries');
for (const slug of COMMENTARY_SLUGS) {
    const floor = FLOORS[slug];
    if (!floor) continue;
    let total = 0, word = 0, reHomed = 0, files = 0;
    for (const f of fs.readdirSync(commDir).filter(n => n.startsWith(slug + '_') && n.endsWith('.json'))) {
        const name = f.slice(slug.length + 1, -'.json'.length);
        const basePath = path.join(ROOT, 'data/tosefta', `Tosefta ${name}.json`);
        assert.ok(fs.existsSync(basePath), `${slug}: no base text for ${name}`);
        const comm = JSON.parse(fs.readFileSync(path.join(commDir, f), 'utf8'));
        const text = JSON.parse(fs.readFileSync(basePath, 'utf8'));
        const index = createCommentaryIndex(comm, text, slug);
        files++;
        (comm.text || []).forEach((_, ci) => {
            for (const e of index.chapter(ci)) {
                total++;
                if (e.baseIdx != null) word++;
                if (e.halakhah !== e.sourceHalakhah) reHomed++;
                // Anchors must land inside the halakhah they were assigned to.
                assert.ok(e.halakhah != null && e.halakhah >= 0, `${slug} ${name}: bad halakhah`);
            }
        });
    }
    const rate = word / total;
    console.log(`${slug}: ${files} tractates, ${total} notes, ` +
                `${(100 * rate).toFixed(1)}% word-anchored, ` +
                `${(100 * reHomed / total).toFixed(1)}% re-homed`);
    assert.equal(total, floor.notes, `${slug}: note count changed`);
    assert.ok(rate >= floor.minWordAnchored,
              `${slug}: word-anchor rate ${(100 * rate).toFixed(2)}% fell below ${100 * floor.minWordAnchored}%`);
}

// The Brief Commentary's halakhah indices drift (an accumulating forward skew),
// which is the whole reason notes are re-anchored by DH across the chapter
// rather than trusted where filed. If this ever drops to ~0, either the source
// data was fixed upstream or the re-homing quietly stopped working -- both worth
// a look before the floor is lowered.
{
    const comm = JSON.parse(fs.readFileSync(path.join(commDir, 'BriefCommentary_Bava Kamma.json'), 'utf8'));
    const text = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/tosefta/Tosefta Bava Kamma.json'), 'utf8'));
    const index = createCommentaryIndex(comm, text, 'BriefCommentary');
    let reHomed = 0, total = 0;
    (comm.text || []).forEach((_, ci) => {
        for (const e of index.chapter(ci)) { total++; if (e.halakhah !== e.sourceHalakhah) reHomed++; }
    });
    assert.ok(reHomed > 0.1 * total,
              `expected substantial re-homing in Bava Kamma, got ${reHomed}/${total}`);
    console.log(`Bava Kamma re-homing sanity: ${reHomed}/${total} notes moved off their filed halakhah`);
}

// --- Masoret HaTosefta: anchoring, and the reference spans ------------------
// The apparatus rides the commentary anchoring path (same note shape, same
// edition), so the rate above covers it. What is new and worth its own guard is
// `spans`: the export segments each note's tail so the viewer can make the
// printed references clickable in place, and a mis-segmentation would show up
// not as a crash but as quietly corrupted apparatus text. Two invariants:
//
//   1. the spans of a note concatenate back to that note's tail, exactly;
//   2. the walk order the viewer relies on to pair spans with anchored notes
//      (the trailing `seq` of the anchor id) stays in step with the nesting.
//
// The clickable share is asserted too, because it IS the claim note mode makes.
{
    const appDir = path.join(ROOT, 'data/apparatus');
    const files = fs.existsSync(appDir)
        ? fs.readdirSync(appDir).filter(n => n.startsWith('MasoretHaTosefta_') && n.endsWith('.json'))
        : [];
    assert.equal(files.length, 33,
                 'expected the 33 tractates of Lieberman\'s edition');

    let notes = 0, refSpans = 0, resolvable = 0, anchored = 0;
    for (const f of files) {
        const name = f.slice('MasoretHaTosefta_'.length, -'.json'.length);
        const app = JSON.parse(fs.readFileSync(path.join(appDir, f), 'utf8'));
        const text = JSON.parse(fs.readFileSync(
            path.join(ROOT, 'data/tosefta', `Tosefta ${name}.json`), 'utf8'));

        // 1. round-trip, and a flat walk in the order the viewer assumes
        const flat = [];
        (app.text || []).forEach((chapter, ci) => {
            (chapter || []).forEach((halakhah, hi) => {
                (halakhah || []).forEach((note, ni) => {
                    const spans = ((app.spans || [])[ci] || [])[hi] || [];
                    const mine = spans[ni] || [];
                    flat.push({ ci, note, spans: mine });
                    if (typeof note !== 'string' || !note.includes('</b>')) return;
                    notes++;
                    const tail = note.replace(/^[\s\S]*?<\/b>/, '');
                    assert.equal(mine.map(s => s.s).join(''), tail,
                                 `${name} ${ci + 1}:${hi + 1}#${ni}: spans do not rebuild the note`);
                    for (const s of mine) {
                        if (s.t !== 'ref') continue;
                        refSpans++;
                        if (s.ref) resolvable++;
                    }
                });
            });
        });

        // 2. the anchor id's trailing seq indexes that flat walk, per chapter
        const index = createCommentaryIndex(app, text, 'masoret');
        (app.text || []).forEach((_, ci) => {
            const inChapter = flat.filter(x => x.ci === ci);
            for (const e of index.chapter(ci)) {
                const seq = Number(String(e.id).split('-').pop());
                assert.ok(seq >= 0 && seq < inChapter.length,
                          `${name} ch${ci}: anchor seq ${seq} outside the chapter's ${inChapter.length} notes`);
                if (e.baseIdx != null) anchored++;
            }
        });
    }
    const clickable = resolvable / refSpans;
    console.log(`MasoretHaTosefta: ${files.length} tractates, ${notes} notes, ` +
                `${refSpans} reference spans, ${(100 * clickable).toFixed(0)}% resolved, ` +
                `${anchored} notes word-anchored`);
    assert.equal(notes, 7427, 'apparatus note count changed');
    assert.ok(clickable >= 0.75,
              `resolved share ${(100 * clickable).toFixed(1)}% fell below 75%`);
}

console.log('all commentary anchoring checks passed');
