#!/usr/bin/env node
//
// Removes the in-copyright apparatus from data/parallels/*.json, in place.
//
// What an apparatus like מסורת הש"ס contributes to this data is a SELECTION of
// citations. The individual claim -- "this halakhah stands parallel to Bavli
// Berakhot 2b" -- is a fact and belongs to nobody, but the list of them is the
// edition's work, and three of our sources are current editions still in print:
//
//   מסורת הש"ס            (עוז והדר)   oz_vehadar_masoret_hashas
//   מסורת הש"ס לירושלמי   (עוז והדר)   oz_vehadar_yerushalmi_masoret
//   מסורת הספרא           (אופק)       ofek_sifra_masoret
//
// So they come out of the published data entirely, rather than being kept
// unnamed: keeping the citations while dropping the credit would take the part
// that is actually protected and remove the part that is not.
//
// A citation the removed source shares with a free one survives, credited to
// the free one -- Sefaria's link to Berakhot 2b is Sefaria's regardless of who
// else prints it. A citation nothing else vouches for goes with the source.
//
// Not attributable, and so left alone: `citations` holds the raw reference
// strings the sources printed, merged into one bag by the builder with no record
// of which came from where. On a surviving entry some of those strings may be
// the removed edition's wording of a reference ("תוספתא פ\"ק"). They are bare
// pointers of a few words, and there is no per-source record to strip them by.
//
// Re-runnable, and idempotent: run it over data/parallels after any rebuild.
// The viewer refuses to display these slugs as well (PARALLEL_RESTRICTED_SOURCES
// in parallels_layer.js), so a regeneration that forgets this step degrades to
// citations shown without their source rather than to a licence problem.
// The real place for the rule is upstream, in the jointParallels export and in
// sefaria-tosefta's build_tosefta_parallels.py; this is the backstop.

const fs = require('fs');
const path = require('path');

const RESTRICTED = new Set([
    'oz_vehadar_masoret_hashas',
    'oz_vehadar_yerushalmi_masoret',
    'ofek_sifra_masoret',
]);

const dir = path.join(__dirname, 'data', 'parallels');
const dryRun = process.argv.includes('--dry-run');

let filesChanged = 0;
const totals = { entries: 0, dropped: 0, stripped: 0, texts: 0 };

for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    const full = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(full, 'utf8'));
    let dropped = 0, stripped = 0, entries = 0;

    for (const [chapter, list] of Object.entries(data.chapters || {})) {
        const kept = [];
        for (const entry of list) {
            entries++;
            const sources = entry.sources || [];
            const survivors = sources.filter(s => !RESTRICTED.has(s));
            if (survivors.length === sources.length) { kept.push(entry); continue; }

            // Nothing else vouches for it: the citation was the edition's own.
            if (!survivors.length) { dropped++; continue; }

            stripped++;
            entry.sources = survivors;
            entry.numSources = survivors.length;
            if (entry.apparatusHome) {
                entry.apparatusHome = entry.apparatusHome.filter(s => !RESTRICTED.has(s));
                if (!entry.apparatusHome.length) delete entry.apparatusHome;
            }
            // The one tier that is a claim about agreement rather than about
            // alignment quality, and it stops being true when the agreement was
            // with a source that is no longer here.
            if (entry.tier === 'corroborated' && survivors.length === 1) {
                entry.tier = 'single-source';
            }
            kept.push(entry);
        }
        if (kept.length) data.chapters[chapter] = kept;
        else delete data.chapters[chapter];
    }

    // The parallel's own text is Sefaria's, not the removed edition's, but a
    // passage no surviving citation points at is dead weight in a file the
    // reader downloads.
    let textsPruned = 0;
    if (data.texts) {
        const live = new Set();
        Object.values(data.chapters || {}).forEach(list => list.forEach(e => live.add(e.ref)));
        for (const ref of Object.keys(data.texts)) {
            if (!live.has(ref)) { delete data.texts[ref]; textsPruned++; }
        }
    }

    if (data.sourceSchemes) {
        RESTRICTED.forEach(s => delete data.sourceSchemes[s]);
    }

    totals.entries += entries;
    totals.dropped += dropped;
    totals.stripped += stripped;
    totals.texts += textsPruned;

    if (dropped || stripped || textsPruned) {
        filesChanged++;
        if (!dryRun) fs.writeFileSync(full, JSON.stringify(data));
        console.log(`${file.padEnd(34)} -${dropped} entries, ${stripped} unattributed, -${textsPruned} texts`);
    }
}

console.log(`\n${dryRun ? '[dry run] ' : ''}${filesChanged} files: ` +
            `${totals.dropped} of ${totals.entries} entries removed, ` +
            `${totals.stripped} kept on their remaining sources, ` +
            `${totals.texts} orphaned texts pruned.`);
