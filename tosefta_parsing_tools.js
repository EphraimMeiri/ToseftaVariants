const TOSEFTA_DATA_BASE = "data/tosefta/";
const VARIANTS_DATA_BASE = "data/variants/";
const WITNESSES_DATA_BASE = "data/witnesses/";
const MANUSCRIPT_IMAGES_DATA_BASE = "data/manuscript_images/";
const EDITIONS_DATA_BASE = "data/editions/";
const COMMENTARIES_DATA_BASE = "data/commentaries/";
// Merged parallel-passage links, anchored to our word stream and carrying the
// parallels' own text. Built by sefaria-tosefta's build_tosefta_parallels.py
// from jointParallels' union of the apparatus databases.
const PARALLELS_DATA_BASE = "data/parallels/";
// Commentaries available as apparatus layers, keyed by the file-name prefix in
// data/commentaries/. Lieberman's two cover only Zeraim through Nezikin (33 of
// our 59 tractates); tractates without a file simply get no layer.
const COMMENTARY_SLUGS = ["BriefCommentary", "Kifshuta"];
// Our own OCR of the printed editions, kept out of the public site: this
// directory is gitignored, and a layer whose file is absent is simply
// unavailable, so the public deploy needs no special casing -- it just has two
// fewer tabs. Exported by editionsDigitization/export_commentary_layers.py.
const OCR_COMMENTARIES_DATA_BASE = "data/commentaries-ocr/";
const OCR_COMMENTARY_SLUGS = ["ChasdeiDavid", "TekheletMordechai"];
// Lieberman's מסורת התוספתא. Not a commentary layer -- it gets no tab of its
// own -- but it arrives in the same Sefaria note shape (<b>DH.</b> body, nested
// chapter/halakhah/note) and is anchored through the same tested path. It
// belongs to the parallels margin, which renders it as the apparatus it is,
// with its references live inside the sentence. Built by
// sefaria-tosefta's pipelines/apparatus_parsing/export_masoret_layer.py; covers
// the 33 tractates Lieberman edited and no others.
const APPARATUS_DATA_BASE = "data/apparatus/";
const APPARATUS_SLUG = "MasoretHaTosefta";
// Display names for the alternate numbering schemes in data/editions/Editions_<Tractate>.json.
// "lz" is only ever shown when its edition is Zuckermandel -- see the
// (key === 'lz' && schemeData.edition === 'lieberman') hide-check in
// updateDisplay, which always suppresses it on Lieberman-based tractates --
// so the checkbox never actually means Lieberman in practice.
const EDITION_SCHEME_NAMES = { vilna: "וילנא", lz: "צוקרמנדל" };
// Witnesses with manuscript-image data files (data/manuscript_images/<slug>_<Tractate>.json).
// Vienna is the site's base text; Erfurt is a full secondary witness with its
// own manuscript images. "Geniza" covers only the specific Cairo Genizah
// fragments (Cambridge Or.1080 pieces) that have been imaged/aligned so far
// -- most tractates/chapters simply have no Geniza entry. "London" covers
// only the Chullin/Seder Moed volume of the London ms (BL Add. 27296, imaged
// via NLI's IIIF since the BL's own viewer is down) -- other sedarim of the
// London ms aren't image-backed yet. Other sigla (ד/ש) have no image data yet.
const MANUSCRIPT_WITNESS_SLUGS = ["Erfurt", "Vienna", "Geniza", "London"];

const locations = [
    "Seder%20Zeraim/Tosefta%20Berakhot", "Seder%20Zeraim/Tosefta%20Peah",
    "Seder%20Zeraim/Tosefta%20Demai", "Seder%20Zeraim/Tosefta%20Terumot",
    "Seder%20Zeraim/Tosefta%20Sheviit", "Seder%20Zeraim/Tosefta%20Kilayim",
    "Seder%20Zeraim/Tosefta%20Maasrot", "Seder%20Zeraim/Tosefta%20Maaser%20Sheni",
    "Seder%20Zeraim/Tosefta%20Challah", "Seder%20Zeraim/Tosefta%20Orlah",
    "Seder%20Zeraim/Tosefta%20Bikkurim",

    "Seder%20Moed/Tosefta%20Shabbat", "Seder%20Moed/Tosefta%20Eruvin", "Seder%20Moed/Tosefta%20Pesachim",
    "Seder%20Moed/Tosefta%20Shekalim", "Seder%20Moed/Tosefta%20Yoma", "Seder%20Moed/Tosefta%20Sukkah",
    "Seder%20Moed/Tosefta%20Beitzah", "Seder%20Moed/Tosefta%20Rosh%20Hashanah", "Seder%20Moed/Tosefta%20Taanit",
    "Seder%20Moed/Tosefta%20Megillah", "Seder%20Moed/Tosefta%20Moed%20Katan", "Seder%20Moed/Tosefta%20Chagigah",

    "Seder%20Nashim/Tosefta%20Yevamot", "Seder%20Nashim/Tosefta%20Ketubot", "Seder%20Nashim/Tosefta%20Nedarim",
    "Seder%20Nashim/Tosefta%20Nazir", "Seder%20Nashim/Tosefta%20Sotah", "Seder%20Nashim/Tosefta%20Gittin",
    "Seder%20Nashim/Tosefta%20Kiddushin",

    "Seder%20Nezikin/Tosefta%20Bava%20Kamma", "Seder%20Nezikin/Tosefta%20Bava%20Metzia", "Seder%20Nezikin/Tosefta%20Bava%20Batra",
    "Seder%20Nezikin/Tosefta%20Sanhedrin", "Seder%20Nezikin/Tosefta%20Makkot", "Seder%20Nezikin/Tosefta%20Shevuot",
    "Seder%20Nezikin/Tosefta%20Eduyot", "Seder%20Nezikin/Tosefta%20Avodah%20Zarah", "Seder%20Nezikin/Tosefta%20Horayot",

    "Seder%20Kodashim/Tosefta%20Zevachim", "Seder%20Kodashim/Tosefta%20Menachot", "Seder%20Kodashim/Tosefta%20Chullin",
    "Seder%20Kodashim/Tosefta%20Bekhorot", "Seder%20Kodashim/Tosefta%20Arakhin", "Seder%20Kodashim/Tosefta%20Temurah",
    "Seder%20Kodashim/Tosefta%20Keritot", "Seder%20Kodashim/Tosefta%20Meilah",

    "Seder%20Tahorot/Tosefta%20Kelim", "Seder%20Tahorot/Tosefta%20Oholot", "Seder%20Tahorot/Tosefta%20Negaim",
    "Seder%20Tahorot/Tosefta%20Parah", "Seder%20Tahorot/Tosefta%20Tahorot", "Seder%20Tahorot/Tosefta%20Mikvaot",
    "Seder%20Tahorot/Tosefta%20Niddah", "Seder%20Tahorot/Tosefta%20Makhshirin", "Seder%20Tahorot/Tosefta%20Zavim",
    "Seder%20Tahorot/Tosefta%20Tevul%20Yom", "Seder%20Tahorot/Tosefta%20Yadayim", "Seder%20Tahorot/Tosefta%20Oktzin"
];

function getVariantUrl(location) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", "Variants_");
    return VARIANTS_DATA_BASE + tractateSlug + ".json";
}

function getToseftaUrl(location) {
    const tractateSlug = location.split("/").pop();
    return TOSEFTA_DATA_BASE + tractateSlug + ".json";
}

function getToseftaText(location) {
    return fetch(getToseftaUrl(location)).then(response => response.json());
}

function getWitnessUrl(location) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", "Witnesses_");
    return WITNESSES_DATA_BASE + tractateSlug + ".json";
}

function getWitnessAlignment(location) {
    return fetch(getWitnessUrl(location))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

// The geniza catalogue (data/geniza_catalog.json, built from
// analysis/geniza_catalog.xlsx) -- one file for the whole corpus, not per
// tractate, so it is fetched once and cached rather than per masechet. It maps
// a codex siglum (G14, E5) to the shelfmarks it is catalogued under; the
// witness data records only the siglum, so this is what lets the synopsis name
// which physical fragment attests a passage. Absent/failed fetch just means no
// shelfmarks in tooltips, never a broken synopsis.
const GENIZA_CATALOG_URL = "data/geniza_catalog.json";
let genizaCatalog = null;

function loadGenizaCatalog() {
    if (genizaCatalog) return Promise.resolve(genizaCatalog);
    return fetch(GENIZA_CATALOG_URL)
        .then(response => response.ok ? response.json() : null)
        .then(data => { genizaCatalog = data; return data; })
        .catch(() => null);
}

// Codex sigla of the fragments a base range falls in, in order.
function genizaCodicesInRange(w, start, end) {
    if (!w || !Array.isArray(w.fragments)) return [];
    const out = [];
    w.fragments.forEach(f => {
        if (f.start > end - 1 || f.end < start) return;
        (f.codices || (f.codex ? [f.codex] : [])).forEach(c => {
            if (!out.includes(c)) out.push(c);
        });
    });
    return out;
}

// "G14 — T-S F1(1) p.119, T-S NS 219.35" for the label's title attribute.
function genizaCodexTooltip(sigla) {
    if (!sigla.length) return '';
    const codices = (genizaCatalog && genizaCatalog.codices) || {};
    return sigla.map(sig => {
        const marks = (codices[sig] && codices[sig].shelfmarks) || [];
        return marks.length ? `${sig} — ${marks.join(', ')}` : sig;
    }).join('\n');
}

function getManuscriptImageUrl(location, witnessSlug) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", witnessSlug + "_");
    return MANUSCRIPT_IMAGES_DATA_BASE + tractateSlug + ".json";
}

function getManuscriptImageData(location, witnessSlug) {
    return fetch(getManuscriptImageUrl(location, witnessSlug))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

function getEditionUrl(location) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", "Editions_");
    return EDITIONS_DATA_BASE + tractateSlug + ".json";
}

function getEditionAlignment(location) {
    return fetch(getEditionUrl(location))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

function getParallelsUrl(location) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", "Parallels_");
    return PARALLELS_DATA_BASE + tractateSlug + ".json";
}

// Sanitized on the way in: sanitizeParallelsData (parallels_layer.js) drops the
// in-copyright apparatus, so nothing downstream can display a source we are not
// free to publish even if a rebuild puts one back into the file. The data
// shipped here has already had them stripped -- see strip_restricted_parallels.js
// -- and the guard is deliberately redundant.
function getParallelsData(location) {
    return fetch(getParallelsUrl(location))
        .then(response => response.ok ? response.json() : null)
        .then(data => (data && typeof sanitizeParallelsData === "function")
            ? sanitizeParallelsData(data) : data)
        .catch(() => null);
}

function getApparatusUrl(location) {
    const tractateSlug = location.split("/").pop()
        .replace("Tosefta%20", APPARATUS_SLUG + "_");
    return APPARATUS_DATA_BASE + tractateSlug + ".json";
}

// Lieberman's מסורת התוספתא as printed, for the parallels margin's note mode.
// Absent for the 26 tractates outside his edition, where the margin falls back
// to the citation list -- so a null here is the normal case, not a failure.
function getApparatusData(location) {
    return fetch(getApparatusUrl(location))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

function getCommentaryUrl(location, slug) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", slug + "_");
    return COMMENTARIES_DATA_BASE + tractateSlug + ".json";
}

function getCommentaryData(location, slug) {
    return fetch(getCommentaryUrl(location, slug))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

function getOcrCommentaryUrl(location, slug) {
    const tractateSlug = location.split("/").pop().replace("Tosefta%20", slug + "_");
    return OCR_COMMENTARIES_DATA_BASE + tractateSlug + ".json";
}

function getOcrCommentaryData(location, slug) {
    return fetch(getOcrCommentaryUrl(location, slug))
        .then(response => response.ok ? response.json() : null)
        .catch(() => null);
}

async function getToseftavariants(location) {
    const url = getVariantUrl(location);
    const json = await fetch(url).then(response => response.json());

    for (let i = 0; i < json.text.length; i++) {
        for (let j = 0; j < json.text[i].length; j++) {
            for (let k = 0; k < json.text[i][j].length; k++) {
                if (typeof json.text[i][j][k] === "string" && json.text[i][j][k].includes("...")) {
                    json.text[i][j][k] = json.text[i][j][k].replace(/\.\.\./g, "…");
                }
            }
        }
    }

    if (json.title === "Variants on Bava Batra") {
        json.text[1][10][18] = `"<b>הרי - לרוחבה </b>| כ\\"ה ב<big>א</big> (<big>א</big> הִילוּך...הִילְכו). <big>ד</big> הרי זה קנה הלכו בו שנים. <big>ב</big> ח'."`;
    }

    return json;
}

function normalizeQuotes(s) {
    return String(s || "")
        .replace(/׳/g, "'")
        .replace(/״/g, '"')
        .replace(/׳׳/g, '"');
}

// Cantillation and vowel points carry no textual weight in the apparatus;
// a reading that differs only in pointing is the same reading.
function stripNiqqud(s) {
    return String(s || "").replace(/[\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7]/g, "");
}

function stripMarkup(text) {
    return String(text || "")
        .replace(/<[^>]+>/g, "")
        .replace(/[\[\]]/g, "")
        .trim();
}

function cleanReading(text) {
    let out = String(text || "").trim();
    while (/[.;:]\s*$/.test(out)) {
        out = out.replace(/[.;:]\s*$/, "").trim();
    }
    return out;
}

function mnFilter(s1, s2) {
    const r1 = String(s1 || "").replace(/[םן](?=$| )/g, "ם");
    const r2 = String(s2 || "").replace(/[םן](?=$| )/g, "ם");
    return [r1, r2];
}

function isMN(s1, s2) {
    const a = String(s1 || "");
    const b = String(s2 || "");
    if (!a || !b || a === b) {
        return false;
    }
    const [aNorm, bNorm] = mnFilter(a, b);
    return aNorm === bNorm;
}

function isKitzur(shortForm, longForm, debug = false, flipped = false) {
    let shortNorm = normalizeQuotes(shortForm).replace(/\u200f/g, "").trim();
    let longNorm = normalizeQuotes(longForm).replace(/\u200f/g, "").trim();

    if (!flipped && isKitzur(longNorm, shortNorm, debug, true)) {
        return true;
    }

    if (!shortNorm || !longNorm) {
        return false;
    }

    if (shortNorm === "ח'" || longNorm === "ח'") {
        return false;
    }

    const shortNoQuote = shortNorm.replace(/["'׳ּ`]/g, "");
    const longNoQuote = longNorm.replace(/["'׳ּ`]/g, "");
    if (
        shortNoQuote === longNoQuote &&
        /["'׳ּ`]/.test(shortNorm) &&
        /["'׳ּ`]/.test(longNorm)
    ) {
        return true;
    }

    if (shortNorm.endsWith("'") && longNorm.startsWith(shortNorm.slice(0, -1))) {
        if (longNorm.length > shortNorm.length - 1) {
            return true;
        }
    }

    if ((shortNorm.includes("'") || longNorm.includes("'")) && (shortNorm.includes(" ") || longNorm.includes(" "))) {
        const shortWords = shortNorm.split(/\s+/);
        const longWords = longNorm.split(/\s+/);
        if (shortWords.length === longWords.length) {
            const allMatch = shortWords.every((word, index) => {
                return word === longWords[index] || isKitzur(word, longWords[index], debug, true);
            });
            if (allMatch) {
                return true;
            }
        }
    }

    const abbr = shortNorm.replace(/"/g, "").replace(/'/g, "");
    if (!abbr) {
        return false;
    }

    const words = longNorm.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
        return false;
    }

    const firstLetters = words.map(w => w[0]).join("");
    if (firstLetters === abbr) {
        return true;
    }

    if (words.length === 1) {
        return shortNorm.endsWith("'") && longNorm.startsWith(shortNorm.slice(0, -1));
    }

    let wordIdx = 0;
    let letterIdx = 0;

    for (const char of abbr) {
        if (wordIdx >= words.length) {
            return false;
        }

        if (letterIdx < words[wordIdx].length && char === words[wordIdx][letterIdx]) {
            letterIdx += 1;
        } else if (wordIdx + 1 < words.length && char === words[wordIdx + 1][0]) {
            wordIdx += 1;
            letterIdx = 1;
        } else {
            return false;
        }

        if (letterIdx === words[wordIdx].length) {
            wordIdx += 1;
            letterIdx = 0;
        }
    }

    if (wordIdx < words.length && letterIdx > 0) {
        return true;
    }
    if (wordIdx === words.length && letterIdx === 0) {
        return true;
    }

    return false;
}

function prelimHaserCheck(s1, s2) {
    const a = String(s1 || "");
    const b = String(s2 || "");

    if (!a || !b || a === b) {
        return false;
    }
    if (isMN(a, b) || isKitzur(a, b)) {
        return false;
    }
    if (a[0] !== b[0] || a[a.length - 1] !== b[b.length - 1]) {
        return false;
    }

    const matres = new Set(["י", "ו"]);
    const aInternal = a.length > 2 ? a.slice(1, -1) : "";
    const bInternal = b.length > 2 ? b.slice(1, -1) : "";

    let i = 0;
    let j = 0;
    while (i < aInternal.length && j < bInternal.length) {
        const c1 = aInternal[i];
        const c2 = bInternal[j];

        if (c1 === c2) {
            i += 1;
            j += 1;
        } else if (matres.has(c1) && !matres.has(c2)) {
            i += 1;
        } else if (matres.has(c2) && !matres.has(c1)) {
            j += 1;
        } else {
            return false;
        }
    }

    while (i < aInternal.length) {
        if (!matres.has(aInternal[i])) {
            return false;
        }
        i += 1;
    }

    while (j < bInternal.length) {
        if (!matres.has(bInternal[j])) {
            return false;
        }
        j += 1;
    }

    return true;
}

function normalizeForComparison(s) {
    const text = String(s || "");
    if (!text) {
        return ["", []];
    }

    const matres = new Set(["י", "ו"]);
    const chars = text.split("");
    if (chars[chars.length - 1] === "ן") {
        chars[chars.length - 1] = "ם";
    }

    const materInfo = [];
    const consonants = [chars[0]];

    for (let i = 1; i < chars.length - 1; i++) {
        const c = chars[i];
        if (matres.has(c)) {
            materInfo.push([consonants.length, c]);
        } else {
            consonants.push(c);
        }
    }

    if (chars.length > 1) {
        consonants.push(chars[chars.length - 1]);
    }

    return [consonants.join(""), materInfo];
}

function isMinorOrthographic(s1, s2) {
    const a = String(s1 || "");
    const b = String(s2 || "");

    if (!a || !b || a === b) {
        return [false, null];
    }

    const [aSkeleton, aMatres] = normalizeForComparison(a);
    const [bSkeleton, bMatres] = normalizeForComparison(b);

    if (aSkeleton !== bSkeleton) {
        return [false, null];
    }

    const aMap = new Map(aMatres.map(([pos, mat]) => [pos, mat]));
    const bMap = new Map(bMatres.map(([pos, mat]) => [pos, mat]));

    for (const [pos, mat] of aMap.entries()) {
        if (bMap.has(pos) && bMap.get(pos) !== mat) {
            return [false, null];
        }
    }

    const hasMn = a.length > 0 && b.length > 0 && "םן".includes(a[a.length - 1]) && "םן".includes(b[b.length - 1]) && a[a.length - 1] !== b[b.length - 1];
    const hasHaser = JSON.stringify(aMatres) !== JSON.stringify(bMatres);

    if (hasMn && hasHaser) {
        return [true, "haser/maleh + mem/nun"];
    }
    if (hasMn) {
        return [true, "mem/nun final swap"];
    }
    if (hasHaser) {
        return [true, "haser/maleh spelling"];
    }

    return [false, null];
}

function isVavHaChiburDiff(s1, s2) {
    const a = String(s1 || "");
    const b = String(s2 || "");
    return (a.startsWith("ו") && a.slice(1) === b) || (b.startsWith("ו") && b.slice(1) === a);
}

const PREFIXES = new Set(["ו", "ב", "כ", "ל", "מ", "ש", "ה", "ד"]);
const MINOR_ADDITION_WORDS = new Set(["אם", "לו"]);

// Corpus-mined routine scribal swaps (sefaria-tosefta common/standard_swaps.json,
// built by sota_project/mine_standard_swaps.py: each pair recurs >=10 times in
// >=5 tractate-x-witness contexts, with halakhic-opposite and attribution-swap
// pairs excluded). Keys are bare forms — letters only, finals normalized —
// joined sorted with "|". These are transmission noise statistically, but some
// (הוא/היא, לו/לי) still change local meaning, so they get their own visible
// category rather than folding into minor.
const ROUTINE_SWAP_PAIRS = new Set([
    "אבל|אלא", "או|אמ", "אוכלינ|אכלינ", "אומ|אומרימ", "אומ|אמר", "אומר|אמ",
    "אותה|אותו", "אותה|אותנ", "אותו|אותנ", "אותו|אתו", "אחד|אחר", "אחד|אחת",
    "אחר|אחת", "אי|איזה", "אי|איזהו", "אי|איזו", "אי|אינ", "אילו|אלו",
    "אינ|אינה", "אינ|אינו", "אינ|איננ", "אינ|ואינו", "אינו|איני", "אינו|איננ",
    "אינו|ואינ", "אל|לא", "אלהיכ|אליכ", "אלהימ|אלימ", "אליע|ליעזר", "אליעז|ליעזר",
    "אלע|לעזר", "אלעז|לעזר", "אמ|אמר", "אמר|אמרו", "אסור|אסורינ", "אפי|אפלו",
    "אפי|ואפילו", "אפילו|אפלו", "אפילו|ואפי", "ארבע|ארבעה", "ארבעה|ד", "אריס|עריס",
    "את|אתה", "באר|בור", "בה|בהנ", "בה|בו", "בו|לו", "בי|בר",
    "בישולו|בשולו", "במה|במי", "בנ|בר", "בנו|בני", "בר|ברבי", "בר|ר",
    "בתירה|פתירא", "ג|שלשה", "גב|גבי", "דבר|דברימ", "דינר|דינרינ", "ה|ייי",
    "האלהימ|האלימ", "הוא|היא", "הוא|זהו", "הולכ|הילכ", "היה|היו", "היה|היתה",
    "הימנה|הימנו", "הימנה|ממנה", "הימנו|ממנו", "הימנם|מהם", "הימנן|מהן", "הכיפ|הכפורימ",
    "המ|הנ", "הנ|זה", "ואחד|ואחת", "ואי|ואיזה", "ואי|ואינ", "ואינ|ואינה",
    "ואינ|ואינו", "ואינ|ואיננ", "ואינ|ואמ", "ואינ|ולא", "ואפי|ואפלו", "וארבע|וארבעה",
    "והלא|והרי", "וחיב|וחייב", "ומעשר|ומעשרות", "ונותנ|ונותנינ", "ור|ורבי", "ור|ר",
    "זה|זהו", "זה|זו", "זהו|זו", "חושש|חוששינ", "חטימ|חיטינ", "חיב|חייב",
    "חיבינ|חייבינ", "חרס|חרש", "טריפה|טרפה", "ידו|ידנ", "יהו|יהוא", "יהוד|יהודה",
    "יוצא|יוצאה", "יחזור|יחזיר", "כאחד|כאחת", "כאנ|כנ", "כיצד|צד", "ככ|כנ",
    "כשירה|כשרה", "כתובה|כתובתה", "לא|לאו", "לא|לו", "לאוינ|לוינ", "לאכול|לוכל",
    "לאכל|לוכל", "לה|להנ", "לה|לו", "להחזיר|לחזור", "להמ|להנ", "להשתמש|לישתמש",
    "לו|לי", "לו|עליו", "לכאנ|לכנ", "לשומ|לשמ", "מה|מהו", "מה|מי",
    "מותר|מותרינ", "מזה|מזו", "מטמאינ|מטמינ", "מיכנ|מכאנ", "מיכנ|מכנ", "מכאנ|מכנ",
    "ממלאינ|ממלינ", "ממנה|ממנו", "מסכת|מסכתא", "משו|משמ", "משוח|משיח", "משומ|משמ",
    "נוטל|ניטל", "נותנ|נותנינ", "על|עליה", "על|עליהנ", "על|עליו", "עלה|עלי",
    "עליה|עליהנ", "עליה|עליו", "עליהנ|עליו", "עני|שני", "עשר|עשרה", "ראית|ראיתה",
    "שאי|שאינ", "שאינ|שאינה", "שאינ|שאינו", "שאינ|שאיננ", "שאני|שני", "שדה|שדהו",
    "שהו|שהוא", "שהוא|שהיא", "שיוצא|שיצא", "שישבת|שישבתה", "של|שלחברו", "שלש|שלשה",
    "שני|שתי", "שניהמ|שניהנ", "שנכנסת|שנכנסתה"
]);

// Spellings of the same word under phonetic interchange (ס/צ, ט/ת, כ/ק, א/ע),
// matres flexibility, and final א/ה — mostly Greek/Latin loanwords with no
// fixed Hebrew spelling (האיסטבא/האיצטבא/האצטבה). A pair enters only when its
// spelling cluster has >=3 forms co-attested as variants of each other in the
// apparatus itself — phonetic equivalence alone proved unsafe (סיידין/ציידין,
// מכיר/מכור are different words). Regenerate: node generate_phonetic_pairs.js
// Spelling pairs verified by morphological analysis: both readings carry
// an identical dictionary analysis (entry + binyan/tense) AND the surface
// difference is confined to orthographic shapes (interior matres/א, optional
// particle prefixes, final א/ה). Shape alone over-matches and lemma alone
// includes inflection — only the conjunction is safe. Regenerate:
// node generate_attested_spelling_pairs.js (needs data/morphology_lexicon.json)
// BEGIN GENERATED: ATTESTED_SPELLING_PAIRS
const ATTESTED_SPELLING_PAIRS = new Set([
    "אחאי|אחי", "אחרונימ|האחרנימ", "איברינ|האברינ", "איגוזינ|האגוזינ", "אילו|האלו", "אילו|ואלו",
    "אילונית|האיילונית", "אימה|אמא", "איספלנית|ואספלנית", "אכל|האוכל", "אכל|ואוכל", "אכסנאי|אכסני",
    "אלו|ואילו", "אלכסונ|אלכסינ", "אספלונית|והאספלנית", "אפיקומנ|אפיקימונ", "אפלה|והאפילה", "באישפה|לאשפה",
    "באלפס|בלפס", "באנפוליא|ובאנפיליא", "באנפליא|ובאנפיליא", "בבניינ|כבנינ", "בגומא|גומה", "בגינה|ובגנה",
    "בדמאי|הדמיי", "בהלכות|הילכות", "בהנאה|בהנייה", "בודיי|בוודאי", "בודיי|ובודאי", "בודיי|ודאי",
    "בודיי|וודאי", "בחדש|לחודש", "בחודש|לחדש", "בחטינ|חיטינ", "בחימה|ובחמה", "בחמשי|ובחמישי",
    "בטבלא|כטבלה", "בטומאה|טמא", "בטל|ובטיל", "ביאתות|בייתות", "בידו|ידיו", "ביומו|בימו",
    "בינתיימ|שבנתימ", "ביקשו|ובקשו", "במדה|כמידה", "במדה|מידה", "במחצלת|ובמחצלות", "במנינ|למינינ",
    "במשאוי|במשוי", "במתכוונ|במתכוינ", "בנונית|והבינונית", "בנכסיי|נכסי", "בנקבה|כנקיבה", "בנקיבות|נקבות",
    "בנתימ|מבינתימ", "בסוריה|לסוריא", "בסמיכות|ובסמיכת", "בסקרא|ובסיקרא", "בעיסתו|עסתו", "בעירכיימ|בערכאימ",
    "בעניינ|לעינינ", "בעניינ|לענינ", "בערכאימ|בערכיימ", "בפיקדונ|פקדונ", "בפרוכת|לפרכת", "בציפורי|צפורי",
    "בציפרי|שבצפורי", "בקדש|ובקודש", "בקדש|לקודש", "בקטבליאות|בקטבליות", "בקלפי|ובקליפי", "בקשו|וביקשו",
    "בריות|הביריות", "ברכ|ובירכ", "בשיארה|בשיירה", "בשיעור|כשעור", "בשלנ|ובישלנ", "בתאנימ|תאינימ",
    "בתחילה|כתחלה", "בתחילתו|תחלתו", "בתחלה|כתחילה", "בתחלה|לכתחילה", "בתחלה|מתחילה", "גבאינ|גביינ",
    "גדולי|וגידולי", "גומה|הגומא", "גילח|וגלח", "גיניסר|גנוסר", "גנה|לגינה", "גרשה|שגירשה",
    "דבור|הדיבור", "דוד|דויד", "דחאו|דחיו", "דיאטה|דיוטא", "דיוטאות|דיוטות", "דלוקה|הדליקה",
    "דמאי|ובדמיי", "דמיי|הדמאי", "האגא|הגה", "האגה|הגא", "האוי|הוי", "האונאה|ההונאה",
    "האוריאות|האוריות", "האחרונימ|והאחרנימ", "האחרנימ|והאחרונימ", "האיגנ|ההוגינ", "הבא|הבאה", "הביא|הביאה",
    "הבנוי|הבנויי", "הוא|היה", "הודאי|הוודיי", "הודיי|הוודאי", "הוראה|הורייה", "הוראת|הוריית",
    "הזאה|הזיה", "הזאה|הזייה", "הזימונ|זמונ", "הזיתימ|זתימ", "הזקנימ|זקינימ", "הזתימ|זיתימ",
    "החביות|חבית", "החדש|חודש", "החטימ|חיטימ", "החטינ|חיטינ", "הטבלה|טבלא", "הטהורה|טהרה",
    "הטומא|טומאה", "הטומאה|טומא", "הטומאה|טימאה", "היא|היה", "היגיע|והגיע", "הידימ|ידיימ",
    "היה|שהוא", "היוצא|היוצאה", "היזהר|והזהר", "הילכות|והלכות", "הילל|הלל", "היקדימ|והקדימ",
    "היתירו|והתירו", "הלוא|והלא", "הלווה|שלוה", "המגלה|מגילה", "המורייס|מוריס", "המטה|מיטה",
    "המידה|מדה", "המיתומ|המתימ", "המסבב|מסביב", "המעשרות|מעושרות", "המצוות|מצות", "המקבל|ומקביל",
    "המקוואות|המקוות", "המקמצ|מקמיצ", "המרקד|והמרקיד", "המשואר|המשוייר", "המשרה|משרא", "הנאה|הנייה",
    "הנידות|נדות", "הניזקינ|נזקינ", "הניחו|והיניחו", "הנכריות|הנכרית", "הנכריות|נכרית", "הנעשית|שנעשת",
    "הספיקות|ספקות", "העוברות|עברות", "העירוב|ערוב", "העלייה|עליה", "העניימ|ענימ", "הפיאה|ופאה",
    "הפיאה|פאה", "הפילפלינ|והפלפלינ", "הפינקס|פנקס", "הפנקס|פינקס", "הצבור|ציבור", "הצוננ|צונינ",
    "הציבור|צבור", "הצינור|צנור", "הקדושינ|קידושינ", "הקדש|קודש", "הקודש|קדש", "הקולבונ|הקילבונ",
    "הקטרת|קטורת", "הקישואינ|קשואינ", "הראייה|ראיה", "הראשונה|ראשנה", "הראשונימ|ראשנימ", "הראשנה|ראשונה",
    "הראשנימ|ראשונימ", "הרבוא|ריבוא", "הרואה|ראה", "הרמאינ|הרמיינ", "הרמיות|רמאות", "השביעיות|השביעית",
    "השולחנ|שלחנ", "השולחני|שלחני", "השזורי|שיזורי", "השיני|שני", "השכחה|שיכחה", "השכיח|שכח",
    "השני|שיני", "השניה|שנייה", "השנייה|שניה", "השקמה|שיקמה", "השתחואה|השתחויה", "השתחואות|השתחויות",
    "התאנימ|תאינימ", "התלוינ|תלויינ", "התרנגלינ|תרנגולינ", "התרנגלת|תרנגולת", "ואקח|ויקח", "ואתנ|ויתנ",
    "ובחמשי|וחמישי", "וביניכ|לבינכ", "ובכורימ|והביכורימ", "ובפירותה|ופירותיה", "ובקולחות|ובקילחות", "ובשיליא|ובשליה",
    "ובשתייה|ושתיה", "ודאי|וודיי", "ודיי|וודאי", "ודלועינ|והדילועינ", "ודריאכונות|ודרכונות", "והבצלצול|והבצלציל",
    "וההקדישות|והקדשות", "והזגינ|וזוגינ", "והטבול|והטביל", "והמניקות|ומיניקות", "והציבור|וצבור", "והקבלות|וקבלת",
    "והקטניות|וקיטנית", "והקטנית|וקיטנית", "והקפלוטות|והקפליטות", "והשיני|שני", "והשני|שיני", "והתורמסינ|ותורמוסינ",
    "וזיתימ|זתימ", "וחבירתה|חברתה", "וחטאת|חטאות", "וטמאה|טמיאה", "ויוצא|ויוצאה", "ויוצא|יצא",
    "ויצא|ויצאה", "וכופת|וכיפת", "וכרשנינ|כרשינינ", "וכשהיא|כשהוא", "ולאכול|ולוכל", "ולאכל|ולוכל",
    "ולאכל|לוכל", "ולאכלו|לאוכלו", "ולבה|ליבה", "ולכאנ|לכנ", "ולמכרנ|למוכרנ", "ולקריאת|ולקריית",
    "ולשמיטינ|לשמטינ", "ולשמר|לשמור", "ולשתייה|ושתיה", "ומביא|ומביאה", "ומגלתה|מגילתה", "ומדת|מידת",
    "ומחוסרי|מחסרי", "ומטמא|ומיטמאה", "ומטמאינ|ומטמינ", "ומיכנ|ומכאנ", "ומישכנ|משכנ", "ומניינ|מנינ",
    "ומעטה|מיעטה", "ומפותתו|ומפיתתו", "ומרביע|מרבע", "ומרבע|מרביע", "ומשמ|משומ", "ונוהגת|נוהגות",
    "ונטמאה|וניטמא", "ונימנו|נמנו", "ונישאת|נשאת", "ונמנו|נימנו", "ונקבות|נקיבות", "ועירבו|ערבו",
    "ועירובו|עירוביו", "ועמק|עומק", "וקופות|וקיפות", "וקוראינ|וקורינ", "ורשאינ|ורשיינ", "ורשיי|רשאי",
    "ורשיינ|רשאינ", "ושאיני|שאני", "ושויה|שווה", "ושילמ|שלמ", "ושיערו|שערו", "ושיריימ|שירימ",
    "ושלש|שלוש", "ושמונה|שמנה", "ושנייה|שניה", "ותפילינ|תפלינ", "חיפהו|שחפהו", "חציינ|לחצאינ",
    "טבלה|כטבלא", "יבואו|שיבאו", "ידו|ידיו", "יהא|יהיה", "יוצא|שיצא", "יוצאה|יוציא",
    "יוצאה|שיוצא", "יפדה|שייפדה", "יצאתה|יצתה", "ישבאב|ישבב", "כאילו|כילו", "כאלו|כילו",
    "כבמלא|כמלוא", "כופת|כיפת", "כמלא|מלוא", "כמלוא|מלא", "כמפקח|מפקיח", "כשהוא|כשהיא",
    "כשיהיה|שיהא", "כשתמצא|שתימצא", "כתחילה|לכתחלה", "כתחילה|מתחלה", "כתחלה|לכתחילה", "לאו|ליו",
    "לאכל|מלוכל", "לאמר|לומר", "לאסור|לוסר", "לדוד|לדויד", "לדונ|לדינ", "לחצאינ|לחציינ",
    "ללונ|ללינ", "למלאות|למלות", "למלאת|למלות", "לרפאות|לרפות", "לרפאת|לרפות", "לשביעיות|לשביעית",
    "לתפלת|תפילת", "מביא|מביאה", "מוסב|מיסב", "מטמא|מטמאה", "מטמאינ|מיטמינ", "מיאינו|שמיאנו",
    "מיטמא|מיטמאה", "מיכאנ|מיכנ", "מיכאנ|מכנ", "מלאכול|מלוכל", "מליאה|שמלא", "ממרתיפו|מרתפו",
    "ממשפחותיו|משפחתו", "מסתיר|סתור", "מצאינו|מצינו", "מצאנו|מצינו", "מצילתה|צלתה", "משאוי|משוי",
    "משחשיכה|שחשכה", "מתכוונ|מתכוינ", "מתרפאינ|מתרפינ", "נהוראי|נוהריי", "נואי|נוי", "נזקי|ניזקי",
    "נטמא|שניטמא", "נטמאה|ניטמא", "נטמאת|ניטמית", "נטמעו|שניטמעו", "נטרפה|שניטרפה", "ניטמאת|ניטמית",
    "ניטשטש|שנטשטש", "ניקרית|נקראת", "נמצאתי|נמציתי", "נקנות|נקנית", "נקראינ|נקרינ", "נקראת|נקרית",
    "נשאוי|נשוי", "נשואי|נשוי", "סוסה|סוסיא", "סימאי|סימי", "סריגות|סריגית", "עדאנ|עדיינ",
    "עשאו|עשו", "עשאני|עשני", "עששיות|עששית", "פאייס|פייס", "פוטסות|פיטסות", "פרפראות|פרפריות",
    "קדש|שקידש", "קוראינ|קורינ", "קיימא|קיימה", "קפלוט|קפליט", "קראינ|קריינ", "קראתי|קריתי",
    "ראשונ|ראשינ", "ראתוי|רתוי", "שאטול|שיטול", "שאיני|שני", "שאפאה|שאפה", "שאפרע|שיפרע",
    "שאפתח|שיפתח", "שארצה|שירצה", "שביעיות|שביעית", "שבקודש|שהקדש", "שדוד|שדויד", "שהלווה|שלוה",
    "שוה|ששווה", "שחוזות|שחוזית", "שיארה|שיירא", "שיארה|שיירה", "שיהא|שיהיה", "שיתכוונ|שיתכוינ",
    "שכתחילה|שמתחלה", "שלשלאות|שלשליות", "שמוצא|שמוצאה", "שניטופה|שניטיפה", "שנראות|שנראית", "שקוראינ|שקורינ",
    "שתושיט|שתשוט", "תעניות|תענית"
]);
// END GENERATED: ATTESTED_SPELLING_PAIRS

// Inflectional variants verified by morphological analysis: both readings share a
// dictionary entry (same lexeme) and differ only in a short word-final
// suffix over a shared stem — number, gender, person, possessive
// (חייב/חייבין, כולה/כולו, לעשות/לעשותו). Meaning-bearing, so they get a
// visible category, not an orthography bucket. Regenerate:
// node generate_attested_spelling_pairs.js
// BEGIN GENERATED: INFLECTION_PAIRS
const INFLECTION_PAIRS = new Set([
    "אביהמ|אבינו", "אביו|אבינו", "אברהמ|אברמ", "אוהב|אוהבו", "אוכל|אוכלי", "אוכלות|אוכלינ",
    "אוכלת|אוכלתו", "אומ|אומר", "אומר|אומרה", "אומר|אומרימ", "אומר|אומרנ", "אומר|אומרת",
    "אומרה|אומרו", "אוסרת|אוסרתה", "אוצר|אוצרות", "אותות|אותיו", "אחי|אחיו", "אחיו|אחינ",
    "אחר|אחרי", "אחר|אחרימ", "אחר|אחרת", "אחרות|אחרימ", "אחרי|אחרימ", "אחרי|אחרינו",
    "אחריהמ|אחריכמ", "אחריותו|אחריותנ", "אחרימ|אחרינ", "איבריו|איברינ", "אינ|איני", "אינה|אינו",
    "איננו|אינני", "אכלנו|אכלתי", "אכסני|אכסניא", "אלהי|אלהימ", "אלהי|אלהינו", "אלהיהמ|אלהימ",
    "אלהיכמ|אלהימ", "אמור|אמורה", "אמירתו|אמירתי", "אמנונ|אמניס", "אמר|אמרה", "אמרה|אמרו",
    "אמרו|אמרנ", "אמרכל|אמרכלינ", "אמרנו|אמרתי", "אמרת|אמרתה", "אמרת|אמרתי", "אמרת|אמרתמ",
    "אנטיפטרס|אנטיפרס", "אסור|אסורה", "אסור|אסורות", "אסורה|אסורינ", "אסורות|אסורינ", "אעפ|אעפי",
    "אפאו|אפאנ", "אפטרופוס|אפטרופימ", "אפטרופוס|אפטרופינ", "אפי|אפילו", "אצבע|אצבעה", "אצלו|אצלכ",
    "אצלו|אצלנ", "ארבע|ארבעימ", "אשמ|אשמו", "אשמה|אשמו", "אשמו|אשמי", "אשרי|אשריכ",
    "אשתו|אשתי", "אשתי|אשתכ", "באותה|באותו", "באחריות|באחריותנ", "באחריותו|באחריותנ", "בארבע|בארבעה",
    "בארצ|בארצכ", "באת|באתה", "בבינוני|בבינונית", "בבצל|בבצלימ", "בברכה|בברכות", "בגג|בגגות",
    "בגדולי|בגדולינ", "בדבר|בדברי", "בדבר|בדברימ", "בדברו|בדברי", "בדברי|בדבריו", "בדי|בדינ",
    "בדמו|בדמיה", "בדמיהנ|בדמיו", "בדמיהנ|בדמימ", "בדרומו|בדרומנ", "בהמה|בהמתו", "בהפר|בהפרת",
    "בוא|בואו", "בור|בורות", "בזמנ|בזמנו", "בזמנ|בזמננ", "בזמנו|בזמננ", "בחולו|בחולי",
    "בחנות|בחנותו", "בחצר|בחצרות", "בחרס|בחרש", "ביאה|ביאתה", "ביבמה|ביבמתו", "ביד|בידו",
    "ביד|בידיו", "בידה|בידו", "בידו|בידי", "בידו|בידימ", "בידו|בידכ", "בידו|בידמ",
    "בידו|בידנ", "בידיהנ|בידנ", "בימות|בימי", "בינה|בינו", "בינו|ביננ", "בית|ביתו",
    "ביתו|ביתנ", "בכולו|בכולנ", "בכופר|בכופרינ", "בכור|בכורי", "בכורות|בכורימ", "בכית|בכיתה",
    "בכתובה|בכתובתה", "במוספ|במוספינ", "במחבא|במחוה", "במעשה|במעשי", "במעשר|במעשרות", "במציאת|במציאתה",
    "במקומה|במקומו", "במקומו|במקומי", "במשתאו|במשתה", "בנדרה|בנדרו", "בני|בניה", "בניה|בנימ",
    "בניו|בניי", "בניו|בנימ", "בנעשה|בנעשינ", "בסודר|בסודרינ", "בעבד|בעבדימ", "בעולמ|בעולמו",
    "בעירוב|בעירובינ", "בעירובי|בעירובינ", "בעל|בעלה", "בעל|בעלי", "בעל|בעלימ", "בעלי|בעליכ",
    "בעליו|בעלינ", "בעמ|בעמי", "בערב|בערבי", "בפונדק|בפונדקי", "בפיה|בפיהמ", "בפני|בפניו",
    "בצואר|בצוארי", "בקבר|בקברות", "בקטלזונ|בקטליונ", "בקטנה|בקטנות", "בקי|בקיא", "בקיסרי|בקיסריונ",
    "בקרקע|בקרקעות", "בראו|בראנ", "בראש|בראשה", "בראשה|בראשו", "ברביעי|ברביעית", "ברי|בריא",
    "בריתו|בריתי", "ברכתו|ברכתי", "ברע|ברעה", "ברשות|ברשותו", "ברשותו|ברשותנ", "בשבילו|בשבילי",
    "בשבת|בשבתות", "בשלו|בשלנ", "בשמ|בשמו", "בשמ|בשמימ", "בשני|בשנימ", "בשעתה|בשעתו",
    "בשר|בשרו", "בתאנה|בתאנימ", "בתי|בתימ", "בתרומה|בתרומות", "בתרומה|בתרומתו", "בתרומה|בתרומתנ",
    "בתשובתו|בתשובתנ", "גבוה|גבוהה", "גבי|גביו", "גדוד|גדור", "גדול|גדולה", "גדולה|גדולות",
    "גדיש|גדישו", "גובה|גובינ", "גוי|גוימ", "גורע|גורעת", "גזילו|גזילנ", "גנאה|גנאי",
    "דבר|דברי", "דבר|דבריה", "דבר|דבריו", "דברי|דבריו", "דבריה|דברימ", "דבריו|דברימ",
    "דוחה|דוחינ", "דומות|דומינ", "דחת|דחתה", "דינ|דינו", "דינו|דינמ", "דינר|דינרי",
    "דינרי|דינרינ", "דמיה|דמיו", "דמע|דמעה", "דרכו|דרכנ", "האחרונות|האחרונימ", "האי|האיש",
    "האילנ|האילנות", "האלהי|האלימ", "האמור|האמורינ", "הבא|הבאו", "הבאת|הבאתה", "הבהמה|הבהמות",
    "הביאו|הביאנ", "הביאוהו|הביאתו", "הגדול|הגדולה", "הגוי|הגוימ", "הגורר|הגוררת", "הגזלנ|הגזלנינ",
    "הגיע|הגיעה", "הודה|הודו", "הודע|הודעו", "הוזק|הוזקו", "הולכ|הולכינ", "הוציא|הוציאו",
    "הוציאו|הוציאי", "הורעת|הורעתה", "הותיר|הותירו", "החדש|החדשה", "החזיר|החזירו", "החזירה|החזירו",
    "החטא|החטאת", "החמירה|החמירו", "החרבת|החרבתה", "הטמאות|הטמאימ", "היוצא|היוצאת", "היית|הייתה",
    "הישנ|הישנה", "הכיאור|הכיעור", "הכנסתו|הכנסתנ", "הכתובות|הכתובימ", "הכתובות|הכתובינ", "המאורסה|המאורשה",
    "המופקד|המופקדינ", "המטבע|המטבעות", "המטונפות|המטונפינ", "המיתוהו|המיתתו", "המעשר|המעשרות", "המשיא|המשיאינ",
    "הנאה|הנאות", "הנאתו|הנאתנ", "הניחנו|הניחני", "הנעשה|הנעשינ", "הנעשינ|הנעשת", "הנשבע|הנשבעינ",
    "הנשואה|הנשואות", "הסדינ|הסדינינ", "הספיק|הספיקה", "הספיק|הספיקו", "העבירה|העבירות", "העבירו|העבירנ",
    "העומר|העומרינ", "העזרה|העזרות", "העל|העלה", "העלה|העלהו", "העלה|העלתה", "העמיד|העמידו",
    "הפרוד|הפרור", "הצורי|הצורית", "הצרורות|הצרורינ", "הקדיש|הקדישו", "הקדישה|הקדש", "הקורה|הקורות",
    "הקטנ|הקטנימ", "הקיסומ|הקיסוס", "הראה|הראהו", "הראהו|הראו", "הראהו|הראני", "הראוי|הראויינ",
    "הראשונ|הראשונה", "הראשונ|הראשונימ", "הראשונה|הראשונות", "הראשונות|הראשונימ", "הרמאימ|הרמיינ", "הרע|הרעה",
    "השוא|השואל", "התחיל|התחילו", "התקינ|התקינו", "התקינו|התקיננ", "ואבד|ואבדו", "ואבוא|ואביא",
    "ואביהו|ואביהוא", "ואוכל|ואוכלינ", "ואחד|ואחר", "ואינ|ואיני", "ואינו|ואיני", "ואינו|ואיננ",
    "ואכלו|ואכלומ", "ואמר|ואמרו", "ואמרה|ואמרו", "ואסורות|ואסורינ", "ואעפ|ואעפי", "וארבע|וארבעת",
    "ואשתו|ואשתכ", "ואת|ואתה", "ובאות|ובאינ", "ובאת|ובאתה", "ובי|ובית", "ובנאה|ובנאו",
    "ובקנה|ובקנימ", "ובקש|ובקשו", "וגבוה|וגבוהה", "וגוי|וגוימ", "וגוממ|וגוממו", "ודאו|ודאנ",
    "ודאי|ודאמ", "ודאי|ודאנ", "ודבר|ודברימ", "ודי|ודיו", "ודינו|ודיני", "והאכילה|והאכילוהו",
    "והביא|והביאו", "והביאוהו|והביאומ", "והגיע|והגיעה", "והולידה|והולידו", "והוציאו|והוציאוהו", "והוציאוה|והוציאוהו",
    "והחזירו|והחזירנ", "והיה|והיו", "והיה|והיתה", "והיו|והיינו", "והכניסו|והכניסנ", "והנחתי|והנחתימ",
    "והעמידו|והעמידנ", "והקטירו|והקטירנ", "והקיסומ|והקיסוס", "והתיר|והתירו", "והתירה|והתירו", "והתירו|והתירוה",
    "והתפלל|והתפללו", "וזבחיו|וזבחימ", "וזכה|וזכי", "וזקפו|וזקפנ", "וזרעו|וזרענ", "וחזר|וחזרו",
    "וחייב|וחייבינ", "וחלב|וחלבימ", "וחמש|וחמשה", "וטבח|וטבחו", "וטורפ|וטורפינ", "וטחה|וטחו",
    "ויאכל|ויאכלו", "ויאמר|ויאמרו", "ויוני|ויונימ", "ויכול|ויכולני", "ויצא|ויצאו", "ויצאה|ויצאתה",
    "ויצאה|ויצתה", "ויצאת|ויצאתה", "ויצאת|ויצתה", "וירקו|וירקנ", "וישאל|וישאלו", "וישראל|וישראלימ",
    "וישראלה|וישראלית", "ויתנו|ויתננו", "ויתנמ|ויתננו", "וכולו|וכולנ", "וכיידו|וכיירו", "וכרע|וכרעי",
    "וכשבא|וכשבאו", "וכתבו|וכתוב", "ולויו|ולוימ", "ולוקח|ולוקחת", "ולעופ|ולעופות", "ולעמ|ולעמי",
    "ולפועלי|ולפועליו", "ולפועליו|ולפועלינ", "ולפניהנ|ולפניו", "ולקח|ולקחו", "ולתרומתו|ולתרומתי", "ומבליע|ומבליעו",
    "ומבקש|ומבקשת", "ומגלח|ומגלחינ", "ומדליק|ומדליקינ", "ומהו|ומהוא", "ומוכר|ומוכרנ", "ומחוסר|ומחוסרי",
    "ומחל|ומחללינ", "ומחקה|ומחקו", "ומטלטל|ומטלטלת", "ומטמא|ומטמאות", "ומכר|ומכרו", "ומכרו|ומכרנ",
    "ומניח|ומניחה", "ומניחו|ומניחנ", "ומעילה|ומעילות", "ומעמידו|ומעמידנ", "ומצא|ומצאו", "ומצא|ומצאנ",
    "ומקצתו|ומקצתנ", "ומשייר|ומשיירת", "ומשמיע|ומשמיעה", "ומשמש|ומשתמש", "ומת|ומתה", "ומת|ומתו",
    "ומתה|ומתו", "ונגנב|ונגנבו", "ונדמעה|ונדמעו", "ונוטל|ונוטלינ", "ונותנ|ונותנה", "ונותנ|ונותנו",
    "ונותנ|ונותננ", "ונותנ|ונותנת", "ונותנו|ונותננ", "וניסו|ונישאו", "וניסית|ונישאת", "ונמצא|ונמצאו",
    "ונמצא|ונמצאת", "ונמצאו|ונמצאת", "ונסכה|ונסכיהמ", "ונעלמה|ונעלמו", "ונפל|ונפלו", "ונפלה|ונפלו",
    "ונפסק|ונפסקה", "ונקרא|ונקראו", "ונראה|ונראית", "ונתמלא|ונתמלאת", "ונתנ|ונתנו", "ונתנ|ונתתי",
    "ונתנו|ונתנוהו", "ונתנוהו|ונתנומ", "וסכ|וסכנ", "וספיקנ|וספקו", "ועבד|ועבדו", "ועודהו|ועודנו",
    "ועודיהו|ועודנו", "ועושה|ועושינ", "ועל|ועליהמ", "ועלה|ועלי", "ועליהנ|ועליו", "ועשאה|ועשאו",
    "ועשאו|ועשאנ", "ועשאו|ועשהו", "ועשה|ועשו", "ועשו|ועשוי", "ופוסק|ופוסקינ", "ופותח|ופותחו",
    "ופטורה|ופטורות", "ופסקה|ופסקו", "ופרע|ופרענ", "ופרק|ופרקו", "ופתוחה|ופתוחות", "וצריכ|וצריכינ",
    "וקבעה|וקבעו", "וקורא|וקורינ", "וקערה|וקערות", "ורצה|ורצו", "ושאינ|ושאינה", "ושאינ|ושאינמ",
    "ושאינ|ושאיננ", "ושדה|ושדי", "ושווה|ושויה", "ושוחט|ושוחטינ", "ושמ|ושמו", "ושעיר|ושעירי",
    "ושתה|ושתו", "ושתת|ושתתה", "ותלאה|ותלאו", "ותלו|ותלוי", "ותלש|ותלשו", "ותנ|ותנו",
    "זהו|זהוא", "זוז|זוזימ", "זוזיו|זוזינ", "זורע|זורענ", "זכית|זכיתה", "זכרונכ|זכרונכמ",
    "זכת|זכתה", "זמנ|זמננ", "זקנ|זקנימ", "זרוע|זרועו", "זרע|זרעה", "זרע|זרעו",
    "זרע|זרעימ", "זרעו|זרענ", "חבילה|חבילי", "חביר|חבירו", "חבלתה|חבלתי", "חברה|חברו",
    "חובה|חובתו", "חובתו|חובתנ", "חוזרות|חוזרינ", "חוליו|חולינ", "חולצות|חולצינ", "חולצינ|חולצת",
    "חותמ|חותמי", "חזר|חזרה", "חטאת|חטאתו", "חיי|חייב", "חייב|חייבינ", "חייב|חייבת",
    "חייבות|חייבינ", "חכירו|חכירי", "חלונ|חלונו", "חלונ|חלונות", "חלוקות|חלוקינ", "חליצת|חליצתה",
    "חלק|חלקו", "חלק|חלקכ", "חלקו|חלקנ", "חלקת|חלקתה", "חמור|חמורי", "חמצו|חמצנ",
    "חמש|חמשה", "חסד|חסדימ", "חרש|חרשת", "טבל|טבלו", "טהורות|טהורינ", "טהרות|טהרותיו",
    "טובה|טובות", "טובות|טובימ", "טובלות|טובלינ", "טוחנו|טוחנינ", "טמא|טמאינ", "טמאות|טמאינ",
    "טעונה|טעונות", "טעית|טעיתה", "יאמר|יאמרו", "יאפיל|יאפילו", "יביאוה|יביאוהו", "יביאמ|יביאנו",
    "יבלת|יבלתו", "יבמות|יבמינ", "יבמתו|יבמתי", "יברח|יברחו", "ידי|ידיו", "ידי|ידימ",
    "יודע|יודעינ", "יודע|יודעת", "יוליכמ|יוליכנו", "יוניו|יונינ", "יוסיפ|יוסיפו", "יופכ|יופר",
    "יוצא|יוצאינ", "יוצאה|יוצאינ", "יוצאות|יוצאינ", "יורדי|יורדינ", "יורשיה|יורשימ", "יורשיו|יורשינ",
    "יזוז|יזוזו", "יזרע|יזרענה", "יחצו|יחצונ", "יטבול|יטבילו", "יטלה|יטלנה", "יטלה|יטלנו",
    "יטלו|יטלנו", "יינ|יינו", "יכול|יכולינ", "יכול|יכולני", "ימכור|ימכרנו", "ימכרמ|ימכרנו",
    "יניח|יניחו", "יניחנה|יניחנו", "ינתנ|ינתנו", "יספות|יספית", "יעשה|יעשמ", "יעשה|יעשנה",
    "יעשו|יעשנו", "יעשנה|יעשנו", "יפרוס|יפרוש", "יצא|יצאו", "יצא|יצאת", "יצאו|יצאת",
    "יצאת|יצאתה", "יקבל|יקבלה", "יקרב|יקרבו", "יקרענה|יקרענו", "ירבו|ירבונ", "ירד|ירדו",
    "יריבו|יריכו", "ירקות|ירקינ", "ירש|ירשו", "ישאל|ישאלו", "ישב|ישבו", "ישכור|ישכיר",
    "ישראל|ישראלימ", "ישראלימ|ישראלית", "יתחיל|יתחילו", "יתנהו|יתנו", "יתנו|יתנוהו", "כבוד|כבודו",
    "כהנ|כהנימ", "כהניו|כהנימ", "כובס|כובסינ", "כולה|כולו", "כולה|כולמ", "כולהנ|כולנ",
    "כולו|כולמ", "כולו|כולנ", "כופה|כופהו", "כופה|כופינ", "כופר|כופרו", "כופרי|כופרינ",
    "כותב|כותבה", "כותב|כותבו", "כותבנ|כותבתנ", "כותבת|כותבתנ", "כותי|כותיימ", "כותי|כותימ",
    "כותי|כותית", "כיוונת|כיונתה", "כימות|כימי", "ככר|ככרות", "כליו|כלינ", "כללות|כללימ",
    "כלת|כלתה", "כמסירתו|כמסירתי", "כנגדו|כנגדכ", "כנגדו|כנגדנ", "כנגדכ|כנגדנ", "כנטיעה|כנטיעות",
    "כעובד|כעובדי", "כעסו|כעסנ", "כרגלי|כרגליו", "כרמ|כרמי", "כרשיני|כרשנינ", "כשאינו|כשאיננ",
    "כשהו|כשהוא", "כשהיה|כשהיתה", "כשרות|כשרימ", "כתב|כתבו", "כתובה|כתובתנ", "לאומנ|לאומני",
    "לאותה|לאותו", "לאחד|לאחר", "לאחר|לאחרימ", "לאלהימ|לאלקימ", "לארבע|לארבעה", "לאשתו|לאשתי",
    "לבנה|לבניו", "לבניו|לבנימ", "לבעל|לבעלה", "לבעליו|לבעלימ", "לבער|לבערו", "לגינ|לגינינ",
    "לדעת|לדעתו", "לדרומ|לדרומו", "להאכיל|להאכילה", "להבליע|להבליעו", "להגביה|להגביהה", "להודיע|להודיעכ",
    "להוציאה|להוציאו", "להטבילו|להטבילנ", "להקריב|להקריבו", "להראות|להראותה", "להרכיב|להרכיבו", "לולבי|לולבינ",
    "לוקה|לוקינ", "לזרוע|לזרעה", "לזרע|לזרעו", "לזרע|לזרעימ", "לחבירו|לחבר", "לחוצ|לחוצה",
    "לחטאת|לחטאתו", "לחטאת|לחטאתי", "לחטאתו|לחטאתי", "לחמריו|לחמרינ", "לחנות|לחנותו", "לטלטל|לטלטלנ",
    "לטלטלו|לטלטלנ", "לטמאו|לטמאנ", "ליכ|ליכי", "ליקט|ליקטו", "ליתנו|ליתננ", "לכהנ|לכהנימ",
    "לכיאור|לכיעור", "לכתובה|לכתובתה", "למדנו|למדתה", "למדת|למדתה", "למוכרו|למוכרנ", "למזרח|למזרחה",
    "למי|למימי", "למעל|למעלה", "למעשר|למעשרות", "למקומ|למקומו", "למת|למתימ", "לעבד|לעבדימ",
    "לעומק|לעומקו", "לעלות|לעלותו", "לעלותו|לעלותנ", "לעמ|לעמי", "לעני|לעניימ", "לעצמה|לעצמו",
    "לעשות|לעשותו", "לעשות|לעשותנ", "לפוטרו|לפוטרנ", "לפועליו|לפועלינ", "לפני|לפניו", "לפניה|לפניהמ",
    "לפניו|לפניכ", "לפניו|לפנינו", "לפסח|לפסחו", "לפרוט|לפרוס", "לצפונ|לצפונו", "לקח|לקחו",
    "לקחו|לקחנ", "לקחתיו|לקחתימ", "לקיימו|לקיימנ", "לקרוא|לקרות", "לראש|לראשו", "לראש|לראשי",
    "לרשות|לרשותו", "לרשותו|לרשותי", "לשאינ|לשאינו", "לשאינ|לשאיננ", "לשדה|לשדהו", "לשופר|לשופרות",
    "לשילה|לשילו", "לשלישי|לשלישית", "לשמה|לשמו", "לשפלה|לשפלימ", "לתינוק|לתינוקות", "לתרומות|לתרומתנ",
    "לתרומתו|לתרומתי", "מאחיו|מאחינ", "מבוסמ|מבושמ", "מבוסמת|מבושמ", "מבוסמת|מבושמת", "מבזבז|מבזבזהו",
    "מביא|מביאינ", "מביאו|מביאמ", "מבליע|מבליעו", "מברכ|מברכו", "מברכ|מברכינ", "מברכות|מברכותיו",
    "מגביה|מגביהה", "מגדל|מגדלינ", "מגיע|מגיעינ", "מגלה|מגלי", "מגלה|מגלתה", "מגעה|מגעו",
    "מדביק|מדביקנ", "מדלג|מדלגינ", "מדליק|מדליקינ", "מהו|מהוא", "מהלכ|מהלכינ", "מודה|מודי",
    "מוחה|מוחינ", "מוכה|מוכי", "מוכי|מוכת", "מוכנ|מוכננ", "מולח|מולחינ", "מומ|מומינ",
    "מונח|מונחת", "מוסר|מוסרינ", "מועד|מועדת", "מוציא|מוציאינ", "מותר|מותרת", "מותרו|מותרנ",
    "מותרות|מותרינ", "מזיקו|מזיקינ", "מחובתו|מחובתי", "מחולל|מחוללת", "מחזיר|מחזירו", "מחזיר|מחזירינ",
    "מחילה|מחילות", "מחללו|מחללינ", "מחללו|מחללנ", "מחלקו|מחלקי", "מחציו|מחצייה", "מטביל|מטבילינ",
    "מטייל|מטיילינ", "מטיל|מטילינ", "מטלטל|מטלטלינ", "מטמא|מטמינ", "מיד|מידי", "מידה|מידו",
    "מידו|מידי", "מידו|מידנ", "מיטמא|מיטמי", "מימ|מימיו", "מימ|מימנ", "מימיה|מימיו",
    "מינ|מיני", "מינו|מיננ", "מיתה|מיתתו", "מיתתו|מיתתי", "מכוונ|מכוינ", "מכנגדו|מכנגדנ",
    "מכניס|מכניסו", "מכניסו|מכניסנ", "מכר|מכרו", "מכתו|מכתי", "מלאחריה|מלאחריו", "מלאכה|מלאכות",
    "מלאכה|מלאכתו", "מלבו|מלבנ", "מלביש|מלבישו", "מלוה|מלוי", "מלפני|מלפניכ", "ממזר|ממזרינ",
    "ממלא|ממלינ", "ממנו|ממני", "ממקומ|ממקומנ", "ממקומה|ממקומו", "ממקומו|ממקומנ", "ממרק|ממרקת",
    "ממתינ|ממתינינ", "מנחה|מנחתה", "מניחו|מניחינ", "מסמכ|מסמר", "מסמרות|מסמרינ", "מספק|מספקת",
    "מסר|מסרו", "מעבירי|מעבירינ", "מעות|מעותיו", "מעותי|מעותיו", "מעיו|מעינ", "מעכבו|מעכבת",
    "מעכבת|מעכבתו", "מעל|מעלו", "מעלה|מעלינ", "מעלות|מעלינ", "מעשר|מעשרות", "מעשר|מעשרנ",
    "מפליגו|מפליגנ", "מפקיד|מפקידינ", "מפריש|מפרישינ", "מפרקו|מפרקנ", "מצא|מצאו", "מצאו|מצאנ",
    "מצאנו|מצאני", "מצאנו|מצאתי", "מצאת|מצאתה", "מצד|מצדי", "מצותו|מצותנ", "מקבלי|מקבלינ",
    "מקומו|מקומנ", "מקחו|מקחנ", "מקל|מקלי", "מקלו|מקלי", "מקלט|מקלטו", "מקצת|מקצתה",
    "מקצת|מקצתנ", "מראש|מראשה", "מראשה|מראשו", "מרננות|מרננינ", "משבא|משבאו", "משוכות|משוכינ",
    "משיצא|משיצאו", "משל|משלו", "משלה|משלו", "משלו|משלי", "משלמ|משלמינ", "משלש|משלשת",
    "משמ|משמו", "משמאל|משמאלו", "משמרו|משמרתו", "משפשפ|משפשפו", "משקה|משקינ", "משתכר|משתכרינ",
    "משתמרות|משתמרינ", "מתוקנות|מתוקנינ", "מתוקנינ|מתוקנת", "מתחיל|מתחילינ", "מתחילה|מתחילתו", "מתחילה|מתחלת",
    "מתחילה|מתחלתו", "מתחלל|מתחללת", "מתחלת|מתחלתה", "מתיר|מתירינ", "מתנ|מתנות", "מתנה|מתנות",
    "מתניו|מתנימ", "מתענות|מתענינ", "מתקיימ|מתקיימינ", "נאכל|נאכלינ", "נאמנ|נאמנינ", "נאמנ|נאמנת",
    "נגמר|נגמרה", "נגמרה|נגמרו", "נגנז|נגנזו", "נדר|נדרה", "נדרו|נדרנ", "נהנה|נהנית",
    "נוהגות|נוהגינ", "נוטל|נוטלו", "נוטל|נוטלנ", "נוטלו|נוטלנ", "נוטלת|נוטלתה", "נופח|נופחינ",
    "נותנ|נותנה", "נותנ|נותנו", "נותנ|נותנמ", "נותנ|נותננ", "נותנה|נותנמ", "נותני|נותנינ",
    "נותנינ|נותנת", "נזיר|נזירה", "נזיר|נזירות", "נזיר|נזירימ", "נזירות|נזירותו", "נזירותו|נזירותי",
    "נזקה|נזקו", "נזקק|נזקקינ", "נחושתא|נחושתנ", "נחל|נחלי", "נחלק|נחלקו", "נחלקו|נחלקינ",
    "נחשד|נחשדו", "נטועות|נטועינ", "נטל|נטלה", "נטמא|נטמאת", "נטע|נטעו", "ניטל|ניטלה",
    "ניכר|ניכרת", "נכנס|נכנסה", "נכנסו|נכנסינ", "נכסיו|נכסיי", "נכסיו|נכסימ", "נכסיי|נכסינ",
    "נכרי|נכרית", "נמצא|נמצאת", "נמצאת|נמצאתה", "נסתלקה|נסתלקו", "נעקר|נעקרה", "נעשינ|נעשית",
    "נפדה|נפדינ", "נפל|נפלה", "נפלה|נפלו", "נפש|נפשו", "נפש|נפשות", "נקביו|נקבינ",
    "נקבע|נקבעה", "נקחות|נקחינ", "נקרא|נקראינ", "נראה|נראית", "נראו|נראינ", "נראות|נראינ",
    "נשבית|נשביתי", "נשואה|נשואות", "נשואות|נשואינ", "נשמטה|נשמטו", "נתונ|נתונה", "נתונות|נתונינ",
    "נתיאש|נתיאשו", "נתמלא|נתמלאת", "נתמעט|נתמעטו", "נתנ|נתנו", "נתנו|נתננ", "נתננ|נתנתנ",
    "נתערב|נתערבו", "נתקבל|נתקבלו", "נתת|נתתה", "סופג|סופגת", "סופה|סופו", "סותרה|סותרו",
    "סטימ|סטיס", "סיככ|סיככה", "סימניו|סימנינ", "סכינ|סכינינ", "סלע|סלעי", "ספיקה|ספיקו",
    "ספיקו|ספיקי", "סתומות|סתומינ", "עבד|עבדו", "עבדו|עבדי", "עבדיהמ|עבדימ", "עבדתו|עבדתנ",
    "עבודתו|עבודתנ", "עבירה|עבירות", "עגול|עגולה", "עדיו|עדימ", "עולה|עולות", "עולה|עולי",
    "עולה|עולינ", "עולה|עולתו", "עולות|עולינ", "עושה|עושימ", "עושה|עושינ", "עושות|עושינ",
    "עזרה|עזרות", "עיבר|עיברה", "עינו|עיני", "עיני|עיניו", "עירב|עירבו", "עירב|עיריבו",
    "עירובו|עירובי", "עירובו|עירובנ", "עירוביו|עירובינ", "עלי|עליו", "עליה|עליכ", "עליהמ|עליכמ",
    "עליו|עליכ", "עליו|עלינ", "עלית|עליתה", "עלת|עלתה", "עמה|עמהנ", "עמכ|עמכמ",
    "עני|עניימ", "עניי|עניימ", "עצמ|עצמות", "עצמה|עצמו", "עצמו|עצמי", "עצמו|עצמנ",
    "ערב|ערבי", "עשאו|עשאנ", "עשו|עשוי", "עשויות|עשויינ", "עשית|עשיתה", "עשר|עשרת",
    "עשת|עשתה", "פגי|פגינ", "פועליו|פועלינ", "פורס|פורש", "פורסינ|פורשינ", "פורענות|פורענותנ",
    "פותח|פותחינ", "פטור|פטורה", "פטור|פטורינ", "פטורה|פטורינ", "פירות|פירותיהנ", "פירותיהנ|פירותיו",
    "פלסטיר|פלסתר", "פני|פניו", "פניהמ|פניו", "פסול|פסולה", "פסחו|פסחיהנ", "פסחיהמ|פסחנ",
    "פסלו|פסלנ", "פעמ|פעמימ", "פרדס|פרדסי", "פרוסה|פרוסות", "פרנסה|פרנסתה", "פרנסה|פרנסתו",
    "פרקו|פרקי", "פשעיהמ|פשעימ", "פתח|פתחו", "פתחו|פתחיהנ", "צדיק|צדיקימ", "צורתו|צורתנ",
    "צפורי|צפורינ", "צרות|צרותיהנ", "צריכ|צריכינ", "צריכות|צריכינ", "צריכי|צריכינ", "צרכה|צרכיהנ",
    "קבוע|קבועה", "קבר|קברי", "קדמה|קדמו", "קדש|קדשי", "קולו|קולי", "קור|קורא",
    "קורא|קורינ", "קושרו|קושרנ", "קיימ|קיימימ", "קיני|קינימ", "קלנדא|קלנדס", "קנקניו|קנקנינ",
    "קראה|קראתה", "קראת|קראתה", "קרב|קרבו", "קרבנ|קרבנות", "קרבנה|קרבנות", "קרבנו|קרבנות",
    "קרוי|קרויה", "קרויות|קרוינ", "קרקע|קרקעות", "קשרה|קשרו", "ראוה|ראוהו", "ראיה|ראיי",
    "ראית|ראיתי", "ראית|ראיתמ", "ראיתו|ראיתי", "ראיתי|ראיתיו", "ראיתיו|ראיתימ", "ראש|ראשו",
    "ראש|ראשי", "ראשו|ראשי", "ראשונ|ראשונה", "ראשונ|ראשנה", "ראשונות|ראשונימ", "ראת|ראתה",
    "רגליו|רגליי", "רואה|רואינ", "רוב|רובו", "רובו|רובנ", "רחלות|רחלימ", "רצת|רצתה",
    "רשות|רשותו", "רשותו|רשותנ", "שאחז|שאחזו", "שאילמלא|שאילמלי", "שאינ|שאיני", "שאינ|שאינמ",
    "שאינה|שאינו", "שאינו|שאיננ", "שאכל|שאכלו", "שאלו|שאלוני", "שאמר|שאמרו", "שאמרו|שאמרנו",
    "שאסור|שאסורות", "שאת|שאתה", "שבא|שבאו", "שבא|שבאת", "שבאת|שבאתה", "שבה|שבהנ",
    "שבועה|שבועות", "שבועה|שבועתו", "שבועת|שבועתו", "שבנאו|שבנאוהו", "שבע|שבעה", "שבפני|שבפניו",
    "שבשילה|שבשילו", "שבשלו|שבשלנ", "שגנבת|שגנבתה", "שדומה|שדומינ", "שדרכו|שדרכנ", "שהבאת|שהבאתה",
    "שהביא|שהביאו", "שהביאו|שהביאנ", "שהגיע|שהגיעו", "שהדליק|שהדליקו", "שהודו|שהורו", "שהזיק|שהזיקה",
    "שהזיק|שהזיקו", "שהחזיק|שהחזיקו", "שהי|שהיה", "שהיה|שהיו", "שהיה|שהיתה", "שהיו|שהיתה",
    "שהכניסו|שהכניסתו", "שהמעשר|שהמעשרות", "שהנזיר|שהנזירינ", "שהניחו|שהניחנ", "שהקדישו|שהקדישוהו", "שהרביעי|שהרביעית",
    "שהשיב|שהשיבו", "שהשריש|שהשרישו", "שהת|שהתה", "שודאה|שודאו", "שוחט|שוחטו", "שוחק|שוחקינ",
    "שומר|שומרי", "שורה|שורות", "שורו|שורי", "שזרע|שזרעה", "שזרעו|שזרענ", "שחט|שחטו",
    "שחייב|שחייבינ", "שחל|שחלה", "שחקת|שחקתה", "שטר|שטרו", "שטר|שטרות", "שטרות|שטרי",
    "שטרותיו|שטרותיי", "שיאכל|שיאכלנו", "שיביא|שיביאו", "שיבש|שיבשה", "שיגור|שיגרור", "שיגיע|שיגיעו",
    "שידחה|שידחו", "שיהא|שיהו", "שיהא|שיהי", "שיהא|שיהיו", "שיהו|שיהוא", "שיהוא|שיהיו",
    "שיוציא|שיוציאו", "שייחד|שייחדו", "שיכלה|שיכלו", "שיכניסה|שיכניסנה", "שילדה|שילדו", "שילה|שילו",
    "שינהג|שינהגו", "שיעבור|שיעברו", "שיצא|שיצאת", "שיצא|שיצאתה", "שיצא|שיצתה", "שיצאת|שיצתה",
    "שיקנה|שיקנו", "שיקרא|שיקראו", "שירד|שירדו", "שירצה|שירצו", "שישכור|שישכיר", "שכבש|שכבשו",
    "שכולכמ|שכולמ", "שכנגד|שכנגדו", "שכר|שכרו", "שכרכ|שכרנ", "שכתב|שכתבו", "שכתבה|שכתבו",
    "שלח|שלחו", "שלימות|שלימימ", "שלמיו|שלמימ", "שלש|שלשימ", "שלשה|שלשתנ", "שמאכילהו|שמאכילו",
    "שמברכ|שמברכינ", "שמחזיק|שמחזיקו", "שמחנכו|שמחנכנ", "שמטיל|שמטילינ", "שמירתו|שמירתנ", "שמע|שמעונ",
    "שמעו|שמעונ", "שמשביח|שמשביחו", "שנגמרה|שנגמרו", "שנהג|שנהגו", "שנטוע|שנטעו", "שנטועות|שנטועינ",
    "שנטע|שנטעו", "שני|שנימ", "שניהמ|שנימ", "שניהנ|שנימ", "שניסו|שנישאו", "שניתנ|שניתנו",
    "שנכנס|שנכנסה", "שנעשה|שנעשית", "שנפל|שנפלו", "שנפלה|שנפלו", "שנשתמש|שנשתמשו", "שנתגלה|שנתגלתה",
    "שנתחרש|שנתחרשה", "שנתמלאו|שנתמלאת", "שנתערב|שנתערבו", "שנתערבה|שנתערבו", "שנתפס|שנתפש", "שנתת|שנתתה",
    "שעבר|שעברה", "שעורו|שעורנ", "שעושה|שעושינ", "שער|שערה", "שעשאו|שעשאומ", "שעשאו|שעשאנ",
    "שעשאוה|שעשאומ", "שעשה|שעשו", "שעשה|שעשתה", "שעשית|שעשיתה", "שעשת|שעשתה", "שעתיד|שעתידינ",
    "שפותח|שפותחינ", "שצריכ|שצריכינ", "שקינו|שקיננו", "שקלו|שקלי", "שקנת|שקנתה", "שקצצ|שקצצו",
    "שרובו|שרובנ", "שריפה|שריפתנ", "ששדה|ששדי", "ששהת|ששהתה", "ששוה|ששוו", "ששוה|ששוינ",
    "ששווה|ששוינ", "ששחטו|ששחטנ", "ששימשת|ששימשתה", "ששמע|ששמעה", "ששניהמ|ששניכמ", "שתי|שתימ",
    "שתיקנה|שתיקנו", "שתכפר|שתכפרי", "שתמליכוהו|שתמליכוני", "שתשמור|שתשמרנה", "שתתנ|שתתני", "תאינה|תאינימ",
    "תאמר|תאמרו", "תבואה|תבואות", "תבע|תבעו", "תבשילי|תבשילינ", "תדיר|תדירה", "תוקע|תוקעינ",
    "תורה|תורתו", "תחתיה|תחתיהנ", "תחתיה|תחתיו", "תחתיהנ|תחתיו", "תינסי|תינשא", "תכניסהו|תכניסו",
    "תמרה|תמרימ", "תנאו|תנאי", "תפלה|תפלינ", "תפלתכ|תפלתכמ", "תרומה|תרומות", "תרומתו|תרומתנ",
    "תרמ|תרמה", "תרנגול|תרנגולת", "תשלומיו|תשלומינ", "תשמע|תשמעו", "תשע|תשעה", "תתנו|תתנוהו"
]);
// END GENERATED: INFLECTION_PAIRS

// BEGIN GENERATED: PHONETIC_SPELLING_PAIRS
const PHONETIC_SPELLING_PAIRS = new Set([
    "אבדה|אבידה", "אבדה|איבדה", "אבוקלס|אבקילס", "אבטולס|אבטילס", "אבטילס|אבטלוס", "אבקילוס|אבקילס",
    "אבקילס|אבקלוס", "אגדיס|אגדס", "אגדיס|אוגדס", "אוכלוסינ|אוכלסינ", "אוכלוסינ|אכלוסינ", "אוכלינ|אוכלנ",
    "אוכלינ|אכלינ", "אוכלנ|אכלנ", "אוכלסינ|אכלוסינ", "אוכפ|איכופ", "אומנויות|אומנות", "אומנויות|אומניות",
    "אומנות|אומניות", "אומניות|אימנויות", "אוסיר|אוסר", "אוסר|אסור", "אוסרה|אסורה", "אוסרות|אוסרת",
    "אוסרינ|אוסרנ", "אוסרינ|אסורינ", "אוסרת|אסרות", "אורסיות|עריסיות", "אושפיזינ|אשפיזינ", "אחוריימ|אחורימ",
    "אחורימ|אחריימ", "איילוניות|אילוניות", "איילונית|אילוניות", "איילונית|אילונית", "איכופ|אכופ", "אילוניות|אילונית",
    "אילונתית|אלונתית", "אילימ|אילמ", "אילימ|אלימ", "אילנתית|אלונטית", "אילנתית|אלונתית", "אילנתית|אלנתית",
    "אילעאי|אלעאי", "אילעאי|אלעאיי", "איסור|איסר", "איסור|אסור", "איסורה|אסורה", "איספלנית|אספלינית",
    "איסקופה|אסקופא", "איסרות|אסרות", "איסרינ|אסורינ", "איעביד|אעביד", "איפטרופוס|אפיטרופוס", "אירינ|עורינ",
    "אישלמ|אשלמ", "אכלוסינ|אכלסינ", "אלונתיות|אלנתית", "אלונתית|אלנתית", "אליעזור|אליעזר", "אליעזר|אלעזר",
    "אלנטית|אלנתית", "אנדרגינוס|אנדרוגינוס", "אנדרגינוס|אנדרוגינס", "אנדרגינס|אנדרוגינוס", "אנטוכיא|אנטוכיה", "אנטוכיא|אנטכיא",
    "אנטוכיה|אנטכיא", "אנפוריא|אנפיריא", "אנפיריא|אנפיריה", "אסור|אסיר", "אסורינ|אסרינ", "אספלונית|אספלנית",
    "אספלינית|אספלנית", "אסקופא|אסקופה", "אעבוד|אעביד", "אפוטרופוס|אפטרופוס", "אפוטרופוס|אפיטרופוס", "אפוטרופינ|אפטרופינ",
    "אפוטרופינ|אפיטרופינ", "אפטורפינ|אפיטרופינ", "אפטרופוס|אפטרפוס", "אפטרופוס|אפיטרופוס", "אפטרופינ|אפיטרופינ", "ארוננ|ארנונ",
    "אריסיות|עריסיות", "ארנונ|ארננ", "ארסיות|עריסיות", "אשלימ|אשלמ", "אשפזינ|אשפיזינ", "באוכיפ|באיכופ",
    "באוכפ|באיכופ", "באוסר|באיסר", "באיסטמא|באצטמא", "באיסר|באסור", "באיסר|באסר", "באיסרטיא|באסרטה",
    "באסטמא|באצטמא", "באסרטה|באסרטיה", "בארדסקוס|בערדסקיס", "בהוה|בהווה", "בהווא|בהווה", "בהיתיר|בהיתר",
    "בהיתר|בהתר", "בוולד|בולד", "בויתוס|בייתוס", "בויתוס|ביתוס", "בולד|ביולד", "בוליס|בילס",
    "בולס|בילס", "בולשת|בלשת", "בחצוצרות|בחצוצרת", "בחצוצרות|בחצצרות", "בטבלא|בטבלה", "בטבלה|בטיבלה",
    "בטומאה|בטימאה", "בטומאה|בטמאה", "ביותר|ביתר", "בייתוס|ביתוס", "בייתסינ|ביתסינ", "בילווטינ|בלווטינ",
    "בינימינ|בנימנ", "בינתיימ|בינתימ", "בינתימ|בנתיימ", "בינתימ|בנתימ", "ביריא|בריא", "ביריא|בריה",
    "ביתוסינ|ביתסינ", "ביתיר|ביתר", "בכותנותמ|בכתנותמ", "בכתנותמ|בכתנתמ", "בלווטינ|בלוטינ", "בלשות|בלשת",
    "במיניינ|במינינ", "במיניינ|במניינ", "במינינ|במניינ", "במיניקית|במיניקת", "במיניקית|במניקות", "במיניקית|במניקת",
    "במניינ|במנינ", "בנימינ|בנימנ", "בסופגנינ|בספגנינ", "בסוריא|בסוריה", "בסוריא|בסורייא", "בסיפגנינ|בספגנינ",
    "בסיקרא|בסקרא", "בסיקרא|בסקרה", "בעלה|בעליה", "בעליה|בעלייה", "בערדיסקיס|בערדסקיס", "בערדסקיס|בערדסקס",
    "בפונדיונ|בפונדינ", "בפונדיונ|בפנדיונ", "בצדנ|בצידנ", "בצידונ|בצידנ", "בצידנ|בציידנ", "בצינעא|בצינעה",
    "בצינעא|בצנעה", "בצינעה|בצנעה", "בציפורי|בציפרי", "בציפורי|בצפורי", "בציפרי|בצפורי", "בקולבונ|בקילבונ",
    "בקולבונ|בקלבונ", "בקוסריונ|בקסריונ", "בקטולזונ|בקטלזינ", "בקטלזונ|בקטלזינ", "בקטניות|בקיטנית", "בקטנית|בקיטנית",
    "בקילבונ|בקלבונ", "בקילפי|בקלפי", "בקיסריונ|בקיסרינ", "בקיסריונ|בקסריונ", "בקיסרינ|בקסריונ", "בקליפי|בקלפי",
    "ברחבה|ברחובה", "ברחובה|ברחיבה", "ברחיימ|ברחימ", "ברחימ|בריחימ", "בריא|בריה", "בריא|ברייה",
    "בריה|ברייא", "בריה|ברייה", "בריכות|ברכות", "ברכות|ברכת", "בשוגג|בשוגיג", "בשוגג|בשווגג",
    "בתירא|בתירה", "בתירה|בתרה", "גזירי|גזרי", "גזירי|גיזרי", "גטיכ|גיטיכ", "גיטיכ|גיטכ",
    "גינוסיא|גניסיא", "גיסטרא|גסטרא", "גיסטרא|גסטרה", "גנוסיא|גניסיא", "גרגרות|גרוגרות", "גרוגרות|גרוגרית",
    "גרוגרות|גרוגרת", "דברו|דבריו", "דבריו|דיבורו", "דהויינ|דיהויינ", "דיהויינ|דייהונ", "דיוטאות|דיוטאת",
    "דיוטאות|דיטאות", "דיוטאות|דייטאות", "דיותיקי|דייתיקי", "דיטאות|דייטאות", "דייתיקי|דייתקי", "האיסטבא|האיסטבה",
    "האיסטבה|האיצטבא", "האיסטבה|האצטבא", "האיסטבה|האצטבה", "האיסקופא|האיסקופה", "האיסקופא|האסקופה", "האיסקופה|האסקופה",
    "האיצטרובל|האצטרוביל", "האסטרוביל|האצטרוביל", "האפול|האפיל", "האפיל|האפל", "הגולגולת|הגלגלת", "הגלגולת|הגלגלת",
    "הדולק|הדלוק", "הדולק|הדלק", "הוליכ|הולכ", "הולכ|הילכ", "הולכו|הלכו", "הולכות|הלכות",
    "הותר|היתיר", "הזיק|היזיק", "הזיק|היזק", "הטומאה|הטימאה", "הטומאה|הטמאה", "הטיתי|היטיתי",
    "הטיתי|היטתי", "הטמאה|הטמיאה", "הילכו|הלכו", "הילכות|הלכות", "הילקט|הלקיט", "הימנה|המינה",
    "הימנה|המנה", "הימנו|המינו", "הימנו|המנו", "היתיר|היתר", "היתיר|התיר", "היתר|התיר",
    "הכולייא|הכיליא", "הכולייא|הכלייה", "הכירייא|הכרייא", "הכרייא|הכרייה", "הלקט|הלקיט", "המוגורות|המוגירות",
    "המוגירות|המוגרות", "המוריוס|המוריס", "המורייס|המוריס", "המחלוקות|המחלקות", "המחלוקת|המחלקות", "המטורפת|המטרפת",
    "המטלטל|המיטלטל", "המטרפת|המיטרפת", "המיטלטיל|המיטלטל", "המינו|המנו", "המיניינ|המניינ", "המיניינ|המנינ",
    "המינינ|המניינ", "המינינ|המנינ", "המיסר|המסר", "המיתהו|המיתוהו", "המיתהו|המתהו", "המכמורות|המכמרות",
    "המכמרות|המכמרת", "המניינ|המנינ", "המסור|המסר", "הנזקינ|הניזוקינ", "הנזקינ|הניזקינ", "העינינ|העניינ",
    "העירב|העירוב", "העירוב|הערוב", "העניינ|הענינ", "הפורש|הפריש", "הפרוש|הפריש", "הפריש|הפרש",
    "הצונינ|הצוננ", "הצונינ|הצנונ", "הצוננ|הצנונ", "הקדיש|הקדש", "הקדש|הקודש", "הקופרצינ|הקפרסינ",
    "הקירמית|הקרמית", "הקפריסינ|הקפרסינ", "הקרומית|הקרמית", "השוכח|השכוח", "השוכח|השכח", "השוכח|השכיח",
    "השיליא|השלייא", "השליא|השלייא", "התדמורית|התדמרית", "התדמרית|התודמרית", "התיפלה|התפלה", "התיקרא|התקרה",
    "התפילה|התפלה", "התפלא|התפלה", "התקרא|התקרה", "ואבא|ואבה", "ואבה|ואיבה", "ואוכל|ואכל",
    "ואוכל|ויאכל", "ואוצרינ|ואוצרנ", "ואוצרינ|ועוצרינ", "ואילנתית|ואלנתית", "ואיסור|ואסור", "ואלונטית|ואלנתית",
    "ואנדרגינוס|ואנדרגינס", "ואנדרגינוס|ואנדרוגינוס", "ואנדרגינוס|ואנדרוגינס", "ואנדרגינס|ואנדרוגינוס", "ואנדרוגינוס|ואנדרוגנוס", "ואסור|ואסר",
    "והבוטנה|והבטנא", "והבטנא|והבטנה", "והוטילתו|והטילתו", "והוטילתו|והיטילתו", "והוליכ|והולכ", "והולכ|והלכ",
    "והוקל|והיקל", "והותר|והתיר", "והטילתו|והיטילתו", "והילכ|והלכ", "והיקל|והקל", "והיתיר|והתיר",
    "והלא|והלה", "והלא|והלוא", "והנזוקינ|והניזוקינ", "והניזוקינ|והניזקינ", "והנעמות|והנעמית", "והנעמיות|והנעמית",
    "והפיסקינ|והפסקינ", "והפיסקינ|והפסקנ", "והקטניות|והקטנית", "והקטנית|והקיטנית", "והתורמוסינ|והתורמסינ", "והתורמוסינ|והתרומסינ",
    "והתורמסינ|והתרומסינ", "וולדה|ולדיה", "וולדיה|ולדיה", "וולדנ|ולדנ", "וזורד|וזירד", "וזורד|וזרד",
    "וזורעה|וזורעיה", "וזורעה|וזרעה", "וחוממנ|וחיממנ", "וחיממנ|וחממנ", "וטומאה|וטמאה", "וטמאה|וטמיאה",
    "ויאכל|וייאכל", "ויבאהו|ויביאהו", "ויבאהו|ויביאוהו", "ויביאהו|ויביאוהו", "ויחזור|ויחזיר", "ויחזור|ויחזר",
    "ויעלה|ועולה", "ויקדיש|ויקדש", "ויקדש|וקדש", "וישתה|ושותה", "וישתה|ושתה", "וכחומריהונ|וכחומריהנ",
    "וכחומריהונ|וכחמוריהנ", "וכרשינינ|וכרשנינ", "וכרשיננ|וכרשנינ", "ולדנ|ולידנ", "ומעוטנ|ומעטנ", "ומעטינ|ומעטנ",
    "ונבילה|ונבלה", "ונבלה|וניבלה", "ונותנ|ונתנ", "ונותנינ|ונותננ", "ונותננ|ונתננ", "ונתונ|ונתנ",
    "וסוכא|וסוכה", "וסוכה|וסיכה", "ועברה|ועיבירה", "ועולה|ועלה", "ועיבירה|ועיברה", "ועירב|ועירוב",
    "ועירב|וערב", "ועירוב|וערב", "ופאה|ופיאה", "ופואה|ופיאה", "ופותח|ופותיח", "ופותח|ופתוח",
    "ופרדוסותיהנ|ופרדסותיהנ", "ופרדסותוהנ|ופרדסותיהנ", "וקדש|וקידש", "וקדשו|וקידשו", "וקווי|וקויי", "וקוי|וקויי",
    "וקוצצ|וקיצצ", "וקטניות|וקיטנית", "וקטנית|וקיטנית", "וקידישו|וקידשו", "וקיצצ|וקצצ", "ושותה|ושתה",
    "ושילש|ושלש", "ושלוש|ושלש", "ושתה|ושתיה", "ושתיה|ושתייה", "ותורותי|ותורותיי", "ותורותי|ותורתי",
    "ותורמוסינ|ותורמסינ", "ותורמוסינ|ותרמוסינ", "ותורמסינ|ותרמסינ", "ותרנגולינ|ותרנגלינ", "ותרנגלינ|ותרנוגלינ", "זונונ|זוננ",
    "זונינ|זוננ", "זוננ|זינינ", "זוננ|זנינ", "זייפינ|זפינ", "זיפינ|זפינ", "חבירו|חברו",
    "חבירו|חבריו", "חבירי|חביריי", "חבירי|חברי", "חבירי|חבריי", "חביריו|חבריו", "חזותנ|חזייתנ",
    "חזותנ|חזיתנ", "חנינא|חנינה", "חנינא|חנניא", "חנינא|חנניה", "חנינה|חנניא", "חנינה|חנניה",
    "חנניא|חנניה", "חתולתו|חתלתו", "חתילתו|חתלתו", "טביריא|טבריה", "טבריא|טבריה", "טומאה|טימאה",
    "טומאה|טמאה", "טומאה|טמיאה", "טופח|טופיח", "טופח|טפיח", "טמאה|טמיאה", "טפילה|טפלה",
    "טפילה|תפלה", "טרקוש|תרקוש", "טרקוש|תרקיש", "יבאו|יבואו", "יבאו|יביאו", "יחדו|יחדיו",
    "יחדו|ייחדו", "יטול|יטייל", "יטול|יטיל", "ייתחד|יתיחד", "יכנוס|יכניס", "יכנוס|יכנס",
    "יכניס|יכנס", "יעמד|יעמוד", "יעמד|יעמיד", "יצאותיו|יציאותיו", "יציאותו|יציאותיו", "יציאותיו|יציאתו",
    "יתיחד|יתייחד", "יתכוונ|יתכוינ", "יתכוינ|יתכונ", "כבושינ|כבשינ", "כבושינ|כיבושינ", "כוליא|כליה",
    "כותבתנ|כתבתנ", "כותבתנ|כתובתנ", "כיולדת|כלדת", "כילכול|כלכול", "כילכול|כלכל", "כינוי|כנויי",
    "כינויי|כנויי", "כינויינ|כנויינ", "כינויינ|כנוינ", "כלדת|כלידת", "כליה|כלייה", "כמושינ|כמישינ",
    "כמושינ|כמשינ", "כנוי|כנויי", "כנויינ|כנוינ", "כריסו|כריסיו", "כריסו|כרסו", "כתיפו|כתיפיו",
    "כתיפו|כתפו", "כתיפו|כתפיו", "כתיפיו|כתפיו", "כתיקוננ|כתקננ", "כתיקננ|כתקננ", "לאופות|לאפות",
    "לאיסור|לאסור", "לאיסורנ|לאיסרנ", "לאיסורנ|לאסורנ", "לאירא|לאירה", "לאירה|לעירה", "לאסור|לאסר",
    "לאפות|לאפת", "לבוראות|לביראות", "לבוראות|לביראת", "לבינינ|לבנינ", "לביקורת|לבקורת", "לביקורת|לבקרות",
    "לבניינ|לבנינ", "לבקורת|לבקרות", "להאכיל|להאכל", "להאכיל|להיאכל", "להאכל|להיאכל", "להיכנס|להכנס",
    "להיתירנ|להיתרנ", "להיתרנ|להתירנ", "להכניס|להכנס", "לוקוס|לוקס", "לוקיס|לוקס", "לחבירו|לחביריו",
    "לחבירו|לחברו", "לחרב|לחרוב", "לחרוב|ליחרב", "לטעונ|ליטעונ", "ליבומ|ליבמ", "ליבומ|לייבומ",
    "ליבומ|לייבמ", "ליבמ|לייבמ", "ליטעונ|ליטענ", "ליפסול|לפסול", "ליפסל|לפסול", "ליקבר|לקבר",
    "ליקלע|לקלע", "לליקוט|ללקוט", "לליקוט|ללקט", "ללקוט|ללקט", "למינינ|למנינ", "למנועל|למנעול",
    "למניינ|למנינ", "למנעול|למנעל", "למעוטנ|למעטינ", "למעטינ|למעטנ", "לעבדה|לעבודה", "לעבדה|לעובדה",
    "לעיניינ|לענינ", "לעינינ|לעניינ", "לעינינ|לענינ", "לעניינ|לענינ", "לפרוכת|לפרכות", "לפרוכת|לפרכת",
    "לצילצול|לצלצל", "לצלצול|לצלצל", "לקבור|לקבר", "לקדוש|לקודש", "לקדש|לקודש", "לקליע|לקלע",
    "לרפאותו|לרפואתו", "לרפאתו|לרפואתו", "לשוני|לשיני", "לשיני|לשני", "לשכונתו|לשכנתו", "לשכינתו|לשכנתו",
    "לתרטאות|לתרטיאות", "לתרטאיות|לתרטיאות", "לתרטיאות|לתרטייאות", "מאפטרופיסתו|מאפטרופסותו", "מאפטרופסותו|מאפיטרופוסתו", "מאפטרופסותו|מאפיטרופסותו",
    "מבינתיימ|מבנתימ", "מבינתימ|מבנתימ", "מגביותו|מגבייתו", "מגבייותו|מגבייתו", "מגוררות|מגוררת", "מגוררות|מגררות",
    "מוחזירינ|מחזירינ", "מוחזקינ|מחזיקינ", "מוטות|מטות", "מוכרה|מיכרה", "מוכרה|מכרה", "מוקדש|מקודש",
    "מוקדשת|מקודשת", "מוקצעי|מיקצעי", "מוקצעי|מקצועי", "מורויס|מוריס", "מורייס|מוריס", "מושכות|משוכות",
    "מושכת|משוכות", "מזבלת|מזובלת", "מזובלות|מזובלת", "מזופרינ|מזיפרינ", "מזופרינ|מזפרונ", "מחוללינ|מחללינ",
    "מחוללינ|מחללנ", "מחזיקינ|מחזיקנ", "מחזירינ|מחזירנ", "מחלוקות|מחלוקת", "מחלוקות|מחלקות", "מחללינ|מחללנ",
    "מטות|מיטות", "מטייל|מטיל", "מטיל|מיטיל", "מיכרה|מכרה", "מילימונ|מלימינ", "מינהו|מנוהו",
    "מינוהו|מנוהו", "מינינ|מניינ", "מינינ|מנינ", "מיניקות|מניקות", "מיניקות|מניקת", "מינקת|מניקות",
    "מיצרימ|מצריימ", "מישכינה|משכנה", "מישכנ|משכנ", "מישכנה|משכנה", "מלימונ|מלימינ", "מלקוט|מלקט",
    "מלקט|מלקיט", "מנהו|מנוהו", "מנויינ|מנוינ", "מנוינ|מנינ", "מניינ|מנינ", "מניכסי|מנכסי",
    "מניקות|מניקית", "מנכסי|מנכסיי", "מסיאינ|מסיעינ", "מסייעינ|מסיעינ", "מעושר|מעשר", "מעיניינו|מעניינו",
    "מעיניינו|מענינו", "מעניינו|מענינו", "מעשיר|מעשר", "מצווינ|מצוינ", "מצויינ|מצוינ", "מצריימ|מצרימ",
    "מקדיש|מקדש", "מקדש|מקודש", "מקדשת|מקודשת", "מקווצינ|מקוסינ", "מקווצינ|מקוצינ", "מקיפלוריא|מקפלריא",
    "מקפלוריא|מקפלריא", "מקרב|מקרוב", "מקרב|מקריב", "מרבוע|מרבע", "מרביע|מרבע", "משיטעינו|משיטענו",
    "משיטענו|משייטעינו", "משכונ|משכנ", "מתיבמות|מתיבמת", "מתיבמות|מתייבמות", "מתיבמות|מתייבמת", "מתיבמת|מתייבמת",
    "נדונת|נידונות", "נדונת|נידונית", "נדונת|נידונת", "נהגינ|נוהגינ", "נהוגינ|נוהגינ", "נוטל|נטול",
    "נוטל|ניטל", "נוטלינ|נוטלנ", "נוטלנ|ניטלינ", "נוכריימ|נכריימ", "נותנו|נתנו", "נותנינ|נותננ",
    "נותנינ|נתנינ", "נזונות|ניזונות", "נזונת|ניזונת", "נזירות|נזיריות", "נזירות|נזירייות", "נזירות|נזריות",
    "נחוניא|נחוניה", "נחוניה|נחניה", "נטלה|ניטלה", "נטלינ|ניטלינ", "נידונות|נידונת", "ניזונות|ניזונית",
    "ניזונית|ניזונת", "ניטלא|ניטלה", "ניכסי|נכסי", "נישואי|נשואי", "ניתנה|נתנה", "ניתנו|נתנו",
    "נכסי|נכסיי", "נכריימ|נכרימ", "נעשות|נעשית", "נעשית|נעשת", "נשאוי|נשואי", "נתונה|נתנה",
    "נתכוונ|נתכוינ", "נתכוונ|נתכונ", "נתכוינ|נתכונ", "סוטרא|סטרא", "סוכות|סכות", "סומכוס|סימכוס",
    "סומכוס|סמכוס", "סופרימ|ספרימ", "סטרא|סיטרא", "סיכות|סכות", "סימכוס|סמכוס", "סירטא|סרטה",
    "ספריימ|ספרימ", "סרטה|סריטה", "עבדה|עבודה", "עבדה|עיבדה", "עבדת|עבודת", "עבוד|עביד",
    "עבודות|עבודת", "עביד|עיביד", "עביינ|עוביינ", "עביינ|עובינ", "עבירה|עברה", "עברה|עוברה",
    "עברה|עיברה", "עגיות|עוגות", "עגיות|עוגיות", "עדויות|עדיות", "עדיות|עידויות", "עובדה|עיבדה",
    "עולות|עולת", "עולילות|עוללות", "עוללות|עוללת", "עולת|עליות", "עורינ|עירינ", "עושינ|עשויינ",
    "עיבירה|עיברה", "עינינ|עניינ", "עירב|עירוב", "עירבו|עירובו", "עירבו|עיריבו", "עירבו|ערבו",
    "עירוב|ערוב", "עירובו|עירוביו", "עירובו|עיריבו", "עירובו|ערובו", "עירוביו|ערובו", "עיריבו|ערבו",
    "עישירו|עשירו", "עניינ|ענינ", "עקביא|עקיבא", "עקיבא|עקיבה", "עשויינ|עשוינ", "עשירו|עשרו",
    "פוליפוס|פלפס", "פוסא|פוסה", "פוסה|פוצה", "פותחונ|פותחינ", "פותחינ|פותחנ", "פותחינ|פתחינ",
    "פיליטונ|פלייטינ", "פילייטונ|פליטונ", "פירותו|פירותיו", "פירותיו|פרותיו", "פלטונ|פליטונ", "פליטונ|פלייטינ",
    "פליסטיר|פלסטור", "פליסטיר|פלסטר", "פליפוס|פלפס", "פרוצות|פרצות", "פרוצת|פרצות", "צורכ|צריכ",
    "צורכו|צרכו", "צורכיו|צרכו", "צורכיו|צרכיו", "צימחה|צימיחה", "צימחה|צמחה", "צימיחה|צמחה",
    "צינורא|צינירא", "צינורא|צינירה", "צינורא|צנורא", "צינורה|צינירא", "צינורה|צינירה", "צינורה|צנורא",
    "צינירה|צנורה", "ציפרניימ|צפרנימ", "צירכ|צריכ", "צפורנימ|צפרנימ", "קבלה|קבליה", "קבלה|קיבלה",
    "קדירותיו|קדרותיו", "קדירתיו|קדרותיו", "קולבונ|קילבונ", "קוסמינ|קסמינ", "קורבינ|קריבינ", "קורבנ|קרבנ",
    "קורצינ|קירצינ", "קושרו|קישרו", "קושרו|קשרו", "קטבלא|קטבליא", "קטבלא|קיטבליא", "קטבליא|קיטבליא",
    "קטנות|קטנית", "קטניות|קטנית", "קטניות|קיטניות", "קטניות|קיטנית", "קטנית|קיטנית", "קילבונ|קלבונ",
    "קילקילה|קילקלה", "קילקלה|קלקלה", "קיניינ|קנינ", "קינינ|קנינ", "קיסמינ|קסמינ", "קיסרונ|קיסריונ",
    "קיסריונ|קיסרינ", "קירצינ|קרצינ", "קישואינ|קשאינ", "קישואינ|קשואינ", "קרבינ|קריבינ", "קרבנ|קריבינ",
    "קרויא|קרויה", "קרויה|קרוייה", "ראוה|ראויה", "ראויה|ראוייה", "ראויה|ראיה", "ראיה|ראייה",
    "רביות|ריבית", "רבית|ריביות", "רבית|ריבית", "רוטבות|רטובות", "רחיימ|רחימ", "רחימ|ריחיימ",
    "רחימ|ריחימ", "רטובות|רטיבות", "ריביות|ריבית", "ריבית|ריבת", "שאוכל|שיאכל", "שאילו|שאלו",
    "שאכל|שיאכל", "שאלו|שואלו", "שבולינ|שובלינ", "שבועות|שבועת", "שבועות|שבעות", "שביכירה|שביכרה",
    "שביכירה|שבכרה", "שבלינ|שובלינ", "שבלינ|שיבלינ", "שבסדיקי|שבסדקי", "שבסדיקי|שבסידקי", "שהוזק|שהזיק",
    "שהזיק|שהיזיק", "שהילוה|שהלוה", "שהלוה|שהלווה", "שוכחינ|שכיחינ", "שורינ|שרויינ", "שותפ|שתופ",
    "שזוכה|שזכה", "שזוכה|שיזכה", "שזכה|שיזכה", "שחוזר|שחזר", "שחזור|שחזר", "שטועינ|שטוענ",
    "שטוענ|שטענ", "שטעונ|שטענ", "שטעונ|שיטענ", "שיבא|שיבוא", "שיבא|שיביא", "שיבוא|שיביא",
    "שיורי|שירי", "שיורמו|שירימו", "שיושב|שיושיב", "שיושב|שישב", "שיטעונ|שיטענ", "שייעור|שיעור",
    "שיירומו|שירימו", "שיירי|שירי", "שילישו|שלשו", "שילקוט|שליקט", "שילקטו|שליקטו", "שילשו|שלשו",
    "שיסמוכו|שיסמיכו", "שיסמוכו|שיסמכו", "שיעור|שעור", "שיעמד|שיעמוד", "שיעמוד|שיעמיד", "שיעמוד|שעמד",
    "שיעקור|שעוקר", "שיערבו|שיעריבו", "שיעריבו|שעירבו", "שיקרא|שקורא", "שירוימ|שירימ", "שיריימ|שירימ",
    "שירימ|שרימ", "שיתודע|שתיודע", "שיתופ|שתופ", "שכחינ|שכיחינ", "שכינוי|שכנויי", "שכינויי|שכנויי",
    "שלושה|שלשה", "שלימד|שלימוד", "שלימוד|שלמוד", "שליקט|שלקט", "שליקטו|שלקטו", "שלישה|שלשה",
    "שמוריע|שמריע", "שמיריע|שמריע", "שנהג|שנוהג", "שנהג|שניהג", "שנותנ|שנתונ", "שנותנ|שנתנ",
    "שנותנו|שנתנו", "שנזונתמ|שניזונתמ", "שנזנתמ|שניזנתמ", "שנטייבה|שניטיבה", "שנטמאו|שניטמאו", "שניזונתמ|שניזנתמ",
    "שניטיבה|שניטייבה", "שניטמאו|שניטמעו", "שניצדו|שניצודו", "שניצדו|שנצדו", "שנישבת|שנשבית", "שניתנ|שנתנ",
    "שניתנו|שנתנו", "שנשבית|שנשבת", "שנתונ|שנתנ", "שעביינ|שעבינ", "שעביינ|שעוביינ", "שעביינ|שעובינ",
    "שעוקר|שעקר", "שעיפישו|שעיפשו", "שעיפשו|שעפשו", "שעיקר|שעקר", "שעירבו|שעיריבו", "שעירבו|שערבו",
    "שקדיש|שקידש", "שקדש|שקידש", "שקורא|שקרא", "שרוחב|שרחב", "שרוחב|שרחוב", "שרויינ|שרוינ",
    "שרחב|שרחוב", "שריפא|שריפה", "שריפא|שרפא", "שריפה|שרפה", "שתודע|שתיודע", "שתודע|שתיוודע",
    "שתחלוצ|שתחלצ", "שתחלוצ|שתיחלצ", "שתיודע|שתיוודע", "שתיכנס|שתכניס", "שתיכנס|שתכנס", "שתינוקי|שתיניקי",
    "שתיניקי|שתניקי", "שתיתיבמ|שתתיבמ", "שתיתייבמ|שתתיבמ", "שתכניס|שתכנס", "שתעמד|שתעמוד", "שתעמד|שתעמיד",
    "שתתיבמ|שתתייבמ", "תורמוסינ|תרמוסינ", "תורמסינ|תרמוסינ", "תימכר|תמכר", "תינפל|תנפול", "תיקונ|תקונ",
    "תמכור|תמכר", "תנהו|תניהו", "תנוהו|תניהו", "תנפול|תנפל", "תעבור|תעבר", "תעביר|תעבר",
    "תעבר|תעובר", "תעבר|תעיבר", "תפילה|תפלה", "תפסוק|תפסק", "תפסיק|תפסק", "תקונ|תקינ",
    "תרגומא|תרגומה", "תרגומה|תרגימא", "תרנגולינ|תרנגלינ", "תרנגולינ|תרנוגלינ", "תרנגלינ|תרנוגלינ"
]);
// END GENERATED: PHONETIC_SPELLING_PAIRS

const FINAL_FORM_MAP = { "ם": "מ", "ן": "נ", "ך": "כ", "ף": "פ", "ץ": "צ" };

// Letters only, final forms normalized — the key space of ROUTINE_SWAP_PAIRS.
function bareWord(w) {
    return String(w || "").replace(/[^א-ת]/g, "").replace(/[םןךףץ]/g, c => FINAL_FORM_MAP[c]);
}

function isRoutineSwapPair(a, b) {
    const ba = bareWord(a);
    const bb = bareWord(b);
    return ba && bb && ba !== bb && ROUTINE_SWAP_PAIRS.has([ba, bb].sort().join("|"));
}

// Letter-numerals against their spelled-out Hebrew/Aramaic forms; a marked
// numeral (ג', בד') against any of its number words is notation, not a variant.
const NUMBER_WORDS = {
    "א": ["אחד", "חד", "חדא", "חדה", "ראשון", "קמא", "קדמאה"],
    "ב": ["שנים", "שני", "שתים", "שתיים", "שתי", "שניה", "תרי", "תרין", "תרתי", "תרתין"],
    "ג": ["שלשה", "שלושה", "שלש", "שלישית", "תלת", "תלתא"],
    "ד": ["ארבעה", "ארבע", "רביעית", "ארבעא"],
    "ה": ["חמשה", "חמש", "חמישה", "חמישית"],
    "ו": ["ששה", "שש", "שישה", "שישית", "ששית", "שית"],
    "ז": ["שבעה", "שבע", "שביעית"],
    "ח": ["שמונה", "תמניא", "שמינית"],
    "ט": ["תשעה", "תשע", "תשיעית"],
    "י": ["עשרה", "עשר", "עשירית", "עשירי"]
};

const PREFIX_PARTICLES = new Set(["ה", "ו", "ב", "ל", "כ", "מ", "ש"]);

function isNumeralPair(v1, v2) {
    for (const [short, long] of [[v1, v2], [v2, v1]]) {
        if (!/['"]/.test(normalizeQuotes(short))) {
            continue;
        }
        const bs = bareWord(short);
        const bl = bareWord(long);
        for (const [letter, spelled] of Object.entries(NUMBER_WORDS)) {
            if (!bs.endsWith(letter)) {
                continue;
            }
            const prefix = bs.slice(0, -letter.length);
            if (prefix.length > 2 || ![...prefix].every(c => PREFIX_PARTICLES.has(c))) {
                continue;
            }
            if (spelled.some(w => bl.endsWith(w) && bl.slice(0, -w.length) === prefix)) {
                return true;
            }
        }
    }
    return false;
}

// Same-stem pairs whose difference is lexical, not a swapped particle.
const NOT_PREFIX_PAIRS = new Set(["בריתות|כריתות"]);

// A difference confined to stacked leading particles ('וקופות'/'והקופות',
// 'מהן'/'בהן'): returns a delta string like "+ה", "-וה", "מ>ב", else null.
// Complements the single-letter PREFIXES rules, which only see one-char
// additions and same-length first-letter swaps.
function prefixDelta(v1, v2) {
    const a = bareWord(v1);
    const b = bareWord(v2);
    if (!a || !b || a === b || NOT_PREFIX_PAIRS.has([a, b].sort().join("|"))) {
        return null;
    }
    let stem = 0;
    while (stem < Math.min(a.length, b.length) && a[a.length - 1 - stem] === b[b.length - 1 - stem]) {
        stem += 1;
    }
    if (stem < 2) {
        return null;
    }
    const pa = a.slice(0, a.length - stem);
    const pb = b.slice(0, b.length - stem);
    if (pa.length > 2 || pb.length > 2) {
        return null;
    }
    if (![...pa].every(c => PREFIX_PARTICLES.has(c)) || ![...pb].every(c => PREFIX_PARTICLES.has(c))) {
        return null;
    }
    if (pa && pb) {
        if (pa.length > pb.length && pa.startsWith(pb)) {
            return "-" + pa.slice(pb.length);
        }
        if (pb.length > pa.length && pb.startsWith(pa)) {
            return "+" + pb.slice(pa.length);
        }
        return pa + ">" + pb;
    }
    return pa ? "-" + pa : "+" + pb;
}
const RABBI_NAME_GROUPS = [
    new Set(["אליעזר", "ליעזר", "אלעזר", "לעזר", "אליעז'", "אלעז'"]),
    new Set(["יהודה", "יהוד'", "יהודא", "יהו'", "יודה"]),
    new Set(["יוסה", "יוסי", "יוס'", "יוסא"]),
    new Set(["יוסף", "יוס'"]),
    new Set(["שמעון", "שמע'", "שמעו'"]),
    new Set(["עקיבא", "עקיב'", "עקיבה"]),
    new Set(["מאיר", "מאי'"]),
    new Set(["חנינא", "חנניא", "חנניה", "חנינה", "חנינ'", "חנני'"]),
    new Set(["גמליאל", "גמל'", "גמליא'"]),
    new Set(["הילל", "הלל"]),
    new Set(["שמאי", "שמיי", "שמי"]),
    new Set(["טרפון", "טרפו'"]),
    new Set(["ישמעאל", "ישמע'"]),
    new Set(["נתן", "נתנ'"]),
    new Set(["יהושע", "יהוש'", "יושוע"]),
    new Set(["חייא", "חיא", "חייה"]),
    new Set(["נחמיה", "נחמי'"]),
    new Set(["יונתן", "יונת'"]),
    new Set(["אלעאי", "אלעי"])
];
const DISTINCT_NAME_PAIRS = [
    new Set(["יוסי", "יוסף"]),
    new Set(["יוסה", "יוסף"]),
    new Set(["יוסא", "יוסף"])
];

const MINOR_ORTHO_PAIRS = new Set([
    ["כיזה צד", "כיצד"],
    ["במה", "במי"],
    ["בד\"א", "במי וכו'"],
    ["בי ר'", "ברבי"],
    ["בי ר'", "בר'"]
].map(([v1, v2]) => createPairKey(v1, v2)));

const TRUNCATION_MARKERS = new Set([
    "וגו'", "וגו׳", "וג'", "וג׳", "וגו", "וגומר",
    "ואילך", "וכו'", "וכו׳", "וכו", "וכולי"
]);

const TRUNCATION_PATTERN = /וגו['\u05f3]?\.?$|וג['\u05f3]$|וגומר$|ואילך$|וכו['\u05f3]?\.?$|וכולי$/;

function createPairKey(v1, v2) {
    return [String(v1 || ""), String(v2 || "")].sort().join("\u0000");
}

function isAlefYodSwap(v1, v2) {
    return (
        (v1.endsWith("אי") && v2.endsWith("יי") && v1.slice(0, -2) === v2.slice(0, -2)) ||
        (v1.endsWith("יי") && v2.endsWith("אי") && v1.slice(0, -2) === v2.slice(0, -2))
    );
}

function isTavHehSwap(v1, v2) {
    return v1.length === v2.length && ((v1.endsWith("ת") && v2.endsWith("ה")) || (v1.endsWith("ה") && v2.endsWith("ת"))) && v1.slice(0, -1) === v2.slice(0, -1);
}

function isHehNunFinalSwap(v1, v2) {
    return v1.length === v2.length && ((v1.endsWith("ה") && v2.endsWith("ן")) || (v1.endsWith("ן") && v2.endsWith("ה"))) && v1.slice(0, -1) === v2.slice(0, -1);
}

// Final א/ה over an identical stem (ממחא/ממחה, קיימא/קיימה) is an
// Aramaic-style ending, not a reading. The exception is היא/היה — the same
// letters are a pronoun against a verb — so that word is excluded, with or
// without leading particles (והיא/והיה, כשהיא/כשהיה).
// The divine name written without its ה (אלהים/אלים, אלהיך/אליך) — a closed
// spelling family, prefix-tolerant. Verified by morphological analysis.
function isDivineNameSpelling(v1, v2) {
    const strip = w => bareWord(w).replace(/^[ובלכמש]{0,2}(?=אל)/, "");
    const a = strip(v1);
    const b = strip(v2);
    if (a === b) {
        return false;
    }
    const fold = w => w.replace(/^אלהי/, "אלי");
    return /^אלה?י/.test(a) && /^אלה?י/.test(b) && fold(a) === fold(b);
}

function isAlefHehFinalSwap(v1, v2) {
    if (v1.length !== v2.length || v1.length < 3 || v1.slice(0, -1) !== v2.slice(0, -1)) {
        return false;
    }
    const finals = new Set([v1[v1.length - 1], v2[v2.length - 1]]);
    if (!(finals.size === 2 && finals.has("א") && finals.has("ה"))) {
        return false;
    }
    const core = bareWord(v1).replace(/^[ובלכמשה]{0,2}(?=.{3})/, "");
    return core !== "היא" && core !== "היה";
}

function isWordOrderVariant(v1, v2) {
    const stripPrefixes = word => {
        if (word && "ובכלמ".includes(word[0])) {
            return word.slice(1);
        }
        return word;
    };

    const words1 = v1.split(/\s+/).map(stripPrefixes).filter(Boolean);
    const words2 = v2.split(/\s+/).map(stripPrefixes).filter(Boolean);

    if (words1.length !== words2.length) {
        return false;
    }

    const sorted1 = [...words1].sort();
    const sorted2 = [...words2].sort();

    return JSON.stringify(sorted1) === JSON.stringify(sorted2) && JSON.stringify(words1) !== JSON.stringify(words2);
}

function stripRabbiPrefix(name) {
    let value = normalizeQuotes(String(name || "")).trim();
    value = value.replace(/^רבי\s+/, "");
    value = value.replace(/^רב\s+/, "");
    value = value.replace(/^ר['׳]\s*/, "");
    value = value.replace(/^ר\s+/, "");
    return value.trim();
}

function isNameAbbrev(name, full) {
    const raw = normalizeQuotes(String(name || "")).trim();
    const fullNorm = normalizeQuotes(String(full || "")).trim();
    if (!(raw.endsWith("'") || raw.endsWith("׳"))) {
        return false;
    }
    const stem = raw.replace(/['׳]+$/, "");
    return stem.length >= 2 && fullNorm.startsWith(stem);
}

function areSameRabbiName(name1, name2) {
    const raw1 = stripRabbiPrefix(name1);
    const raw2 = stripRabbiPrefix(name2);
    const norm1 = raw1.replace(/['׳]+$/, "");
    const norm2 = raw2.replace(/['׳]+$/, "");

    if (!norm1 || !norm2) {
        return false;
    }
    if (norm1 === norm2) {
        return true;
    }

    for (const pair of DISTINCT_NAME_PAIRS) {
        const has1 = [...pair].some(n => norm1 === n || norm1.startsWith(n) || n.startsWith(norm1));
        const has2 = [...pair].some(n => norm2 === n || norm2.startsWith(n) || n.startsWith(norm2));
        if (has1 && has2 && norm1 !== norm2) {
            return false;
        }
    }

    for (const group of RABBI_NAME_GROUPS) {
        const in1 = group.has(norm1) || [...group].some(n => isNameAbbrev(raw1, n));
        const in2 = group.has(norm2) || [...group].some(n => isNameAbbrev(raw2, n));
        if (in1 && in2) {
            return true;
        }
    }

    return false;
}

function isNameOrthographyVariant(v1, v2) {
    const words1 = v1.split(/\s+/).filter(Boolean);
    const words2 = v2.split(/\s+/).filter(Boolean);

    if (words1.length === 1 && words2.length === 1) {
        return areSameRabbiName(words1[0], words2[0]);
    }

    const set2 = new Set(words2);
    const set1 = new Set(words1);
    const diff1 = words1.filter(w => !set2.has(w));
    const diff2 = words2.filter(w => !set1.has(w));

    if (diff1.length === 1 && diff2.length === 1) {
        return areSameRabbiName(diff1[0], diff2[0]);
    }

    return false;
}

function hasTruncationMarker(text) {
    const value = String(text || "").trim();
    if (!value) {
        return false;
    }

    for (const marker of TRUNCATION_MARKERS) {
        if (value.endsWith(marker)) {
            return true;
        }
    }

    return TRUNCATION_PATTERN.test(value);
}

function stripTruncationMarker(text) {
    const value = String(text || "").trim();
    const markers = [...TRUNCATION_MARKERS].sort((a, b) => b.length - a.length);

    for (const marker of markers) {
        if (value.endsWith(marker)) {
            return value.slice(0, -marker.length).trim();
        }
    }

    return value;
}

function isCitationScopeVariant(v1, v2) {
    const a = String(v1 || "").trim();
    const b = String(v2 || "").trim();

    if (!a || !b) {
        return [false, ""];
    }

    const aHasMarker = hasTruncationMarker(a);
    const bHasMarker = hasTruncationMarker(b);

    if (aHasMarker !== bHasMarker) {
        const aCore = aHasMarker ? stripTruncationMarker(a) : a;
        const bCore = bHasMarker ? stripTruncationMarker(b) : b;

        const shorter = aCore.length <= bCore.length ? aCore : bCore;
        const longer = aCore.length <= bCore.length ? bCore : aCore;

        const shorterNorm = normalizeQuotes(shorter).replace(/["']/g, "");
        const longerNorm = normalizeQuotes(longer).replace(/["']/g, "");

        if (longerNorm.startsWith(shorterNorm) || longerNorm.includes(shorterNorm)) {
            return [true, "citation_scope: truncation vs expanded"];
        }

        if (shorter.length > 0 && longer.length > shorter.length * 1.5) {
            return [true, "citation_scope: truncation vs expanded (length diff)"];
        }
    }

    if (aHasMarker && bHasMarker) {
        const markers = [...TRUNCATION_MARKERS].sort((x, y) => y.length - x.length);
        const aMarker = markers.find(marker => a.endsWith(marker)) || "";
        const bMarker = markers.find(marker => b.endsWith(marker)) || "";

        if (aMarker && bMarker && aMarker !== bMarker) {
            const aCore = a.slice(0, -aMarker.length).trim();
            const bCore = b.slice(0, -bMarker.length).trim();
            if (aCore === bCore) {
                return [true, `citation_scope: marker variant (${aMarker} vs ${bMarker})`];
            }
        }
    }

    if (TRUNCATION_MARKERS.has(a) || TRUNCATION_MARKERS.has(b)) {
        const markerReading = TRUNCATION_MARKERS.has(a) ? a : b;
        const otherReading = TRUNCATION_MARKERS.has(a) ? b : a;
        if (otherReading.split(/\s+/).length >= 2) {
            return [true, `citation_scope: ${markerReading} vs full text`];
        }
    }

    return [false, ""];
}

function removeInternalMatres(text) {
    if (!text || text.length <= 2) {
        return text;
    }
    return text[0] + text.slice(1, -1).replace(/[יו]/g, "") + text[text.length - 1];
}

function classifyVariantPair(v1, v2) {
    // Pointing and stray edge punctuation are presentation, not reading:
    // without this, יין/יַיִן or a trailing "(" lands in "major". Edge parens
    // are only stripped when the reading has no interior paren — in
    // "(אסור) מותר" the parenthesis is apparatus notation, not stray.
    const normalizeReading = s => {
        let t = normalizeQuotes(stripNiqqud(stripMarkup(s)))
            .replace(/^[\s.,;:]+|[\s.,;:]+$/g, "");
        if (!/[()]/.test(t.slice(1, -1))) {
            t = t.replace(/^[\s().,;:]+|[\s().,;:]+$/g, "");
        }
        return t;
    };
    const a = normalizeReading(v1);
    const b = normalizeReading(v2);

    if (!a && !b) {
        return { category: "skip", confidence: "high", reason: "both empty" };
    }

    // Readings that only differ in pointing or stray punctuation are the
    // same reading; file them with the spelling noise.
    if (a === b) {
        return { category: "minor_orthography", confidence: "high", reason: "niqqud/punctuation only" };
    }

    // פתוח/סתום (and combinations) are paratextual notes — manuscript
    // paragraph/section breaks at this location, not textual variants.
    if (/^(פתוח|סתום)(\s+(פתוח|סתום))*$/.test(b)) {
        return { category: "paragraph_break", confidence: "high", reason: `paragraph_break: ${b}` };
    }

    // A witness lacking only the citation-continuation marker (וגו' etc.)
    // quotes less of the verse — citation scope, not a substantive omission.
    if (isOmissionMarker(b) && TRUNCATION_MARKERS.has(a)) {
        return { category: "citation_scope", confidence: "high", reason: `citation_scope: marker omitted (${a})` };
    }

    // ח' / חסר mark the word as absent in this witness — a substantive
    // omission, not a literal reading.
    if (isOmissionMarker(b)) {
        return { category: "major", confidence: "high", reason: "omission" };
    }

    if (!a || !b) {
        const added = b || a;
        if (TRUNCATION_MARKERS.has(added)) {
            return { category: "citation_scope", confidence: "high", reason: `citation_scope: marker only (${added})` };
        }
        if (PREFIXES.has(added) || MINOR_ADDITION_WORDS.has(added)) {
            return { category: "other_minor", confidence: "medium", reason: `minor addition/omission: ${added}` };
        }
        return { category: "major", confidence: "medium", reason: `addition/omission: ${added}` };
    }

    const [isScope, scopeReason] = isCitationScopeVariant(a, b);
    if (isScope) {
        return { category: "citation_scope", confidence: "high", reason: scopeReason };
    }

    if (MINOR_ORTHO_PAIRS.has(createPairKey(a, b))) {
        return { category: "minor", confidence: "high", reason: "orthography" };
    }

    if (isAlefYodSwap(a, b)) {
        return { category: "minor", confidence: "high", reason: "orthography: אי/יי" };
    }

    if (isTavHehSwap(a, b)) {
        return { category: "minor", confidence: "high", reason: "orthography: ת/ה final" };
    }

    if (isHehNunFinalSwap(a, b)) {
        return { category: "minor", confidence: "high", reason: "orthography: ה/ן final" };
    }

    if (isAlefHehFinalSwap(a, b)) {
        return { category: "minor", confidence: "high", reason: "orthography: א/ה final" };
    }

    if (isKitzur(a, b)) {
        return { category: "minor_orthography", confidence: "high", reason: "abbreviation (kitzur)" };
    }

    const aNoMatres = removeInternalMatres(a);
    const bNoMatres = removeInternalMatres(b);
    // A matres-stripped stem of under 3 letters (אפ' after stripping אפי')
    // matches far too freely — אפי'/אפולו is a real lexical difference.
    const kitzurStemOk = w => !/['"]$/.test(w) || bareWord(w).length >= 3;
    if ((aNoMatres !== a || bNoMatres !== b) && kitzurStemOk(aNoMatres) && kitzurStemOk(bNoMatres) && isKitzur(aNoMatres, bNoMatres)) {
        return { category: "minor_orthography", confidence: "high", reason: "abbreviation + haser/maleh" };
    }

    const [isMinor, minorReason] = isMinorOrthographic(a, b);
    if (isMinor) {
        return { category: "minor_orthography", confidence: "high", reason: minorReason };
    }

    if (isNameOrthographyVariant(a, b)) {
        return { category: "name_orthography", confidence: "high", reason: "rabbi name variant" };
    }

    for (const prefix of PREFIXES) {
        if (a === prefix + b || b === prefix + a) {
            return { category: "other_minor", confidence: "high", reason: `prefix difference: ${prefix}` };
        }
    }

    if (a.length === b.length && a.length >= 2 && !NOT_PREFIX_PAIRS.has([bareWord(a), bareWord(b)].sort().join("|"))) {
        if (PREFIXES.has(a[0]) && PREFIXES.has(b[0]) && a.slice(1) === b.slice(1)) {
            return { category: "other_minor", confidence: "high", reason: `prefix swap: ${a[0]}/${b[0]}` };
        }
    }

    const wordsA = a.split(/\s+/).filter(Boolean);
    const wordsB = b.split(/\s+/).filter(Boolean);

    if (wordsA.length === 1 && wordsB.length === 1) {
        // Routine first: a pair on both lists (נוטל/ניטל) may carry meaning,
        // so it keeps the visible routine label rather than hiding as spelling.
        if (isRoutineSwapPair(a, b)) {
            return { category: "routine", confidence: "high", reason: `routine swap: ${bareWord(a)}/${bareWord(b)}` };
        }
        if (isDivineNameSpelling(a, b)) {
            return { category: "minor_orthography", confidence: "high", reason: "divine name spelling" };
        }
        if (PHONETIC_SPELLING_PAIRS.has([bareWord(a), bareWord(b)].sort().join("|"))) {
            return { category: "minor_orthography", confidence: "high", reason: "phonetic spelling" };
        }
        if (ATTESTED_SPELLING_PAIRS.has([bareWord(a), bareWord(b)].sort().join("|"))) {
            return { category: "minor_orthography", confidence: "high", reason: "attested spelling" };
        }
        if (INFLECTION_PAIRS.has([bareWord(a), bareWord(b)].sort().join("|"))) {
            return { category: "morphology", confidence: "high", reason: "inflection (same lexeme)" };
        }
        if (isNumeralPair(a, b)) {
            return { category: "other_minor", confidence: "high", reason: "numeral notation" };
        }
        const delta = prefixDelta(a, b);
        if (delta) {
            return { category: "other_minor", confidence: "high", reason: `prefix difference: ${delta}` };
        }
    }

    if (wordsA.length === wordsB.length) {
        const sortedA = [...wordsA].sort();
        const sortedB = [...wordsB].sort();
        if (JSON.stringify(sortedA) === JSON.stringify(sortedB) && a !== b) {
            return { category: "other_minor", confidence: "medium", reason: "word order difference" };
        }
    }

    if (isWordOrderVariant(a, b)) {
        return { category: "other_minor", confidence: "medium", reason: "word order difference (with prefixes)" };
    }

    return { category: "major", confidence: "low", reason: "substantive variant - needs review" };
}

function shouldHideVariant(svText, varText, options, isMultiWitnessReading) {
    const classification = classifyVariantPair(svText, varText);
    const hideReasons = [];
    const hiddenCategories = options.hiddenCategories instanceof Set
        ? options.hiddenCategories
        : new Set(options.hiddenCategories || []);
    const hiddenReasonDetails = options.hiddenReasonDetails instanceof Set
        ? options.hiddenReasonDetails
        : new Set(options.hiddenReasonDetails || []);

    if (hiddenCategories.has(classification.category)) {
        hideReasons.push(`category:${classification.category}`);
    }
    if (hiddenReasonDetails.has(classification.reason)) {
        hideReasons.push(`detail:${classification.reason}`);
    }

    if (options.hideSingleWitness && !isMultiWitnessReading) {
        hideReasons.push("single-witness");
    }

    if (options.hideSoleWitnessSigla instanceof Set && options.hideSoleWitnessSigla.size > 0) {
        const witnesses = String(options.readingWitnesses || "").trim().split(/\s+/).filter(Boolean);
        if (witnesses.length === 1 && options.hideSoleWitnessSigla.has(witnesses[0])) {
            hideReasons.push(`sole-witness:${witnesses[0]}`);
        }
    }

    if (options.hideAbbreviations && classification.reason.includes("abbreviation")) {
        hideReasons.push("abbreviation");
    }

    if (options.hideMemNun && classification.reason.includes("mem/nun")) {
        hideReasons.push("mem-nun");
    }

    if (options.hideVav && (classification.reason === "prefix difference: ו" || isVavHaChiburDiff(svText, varText))) {
        hideReasons.push("vav-ha-chibur");
    }

    if (options.hideHaserMaleh && classification.reason.includes("haser/maleh")) {
        hideReasons.push("haser-maleh");
    }

    return {
        hidden: hideReasons.length > 0,
        hideReasons,
        classification
    };
}

function parseNoteType(noteTxt) {
    if (typeof noteTxt !== "string") {
        return "NSN";
    }

    const normalized = noteTxt.replace("</big> <big>", " ");
    const pipeIndex = normalized.indexOf("|");
    if (pipeIndex === -1) {
        return "NSN";
    }

    const body = normalized.slice(pipeIndex + 1).trim();
    if (!body || normalized.includes('והושלם ע"פ') || normalized.includes('מכאן עפ"י') || normalized.endsWith(">.")) {
        return "NSN";
    }

    if (body.startsWith("<big>")) {
        return "SN";
    }

    if (/^(כ"ה|כ״ה|כ''ה|כ׳׳ה)/.test(body)) {
        return "CH";
    }

    return "NSN";
}

function parseSv(svRaw) {
    const raw = String(svRaw || "");
    if (!raw.includes("<b>") || !raw.includes("</b>")) {
        return [raw.trim(), ""];
    }

    const sv = raw.split("<b>")[1].split("</b>")[0].trim();

    const smallMatch = sv.match(/<small>(\d+)<\/small>/);
    const subMatch = sv.match(/<sub>(\d+)<\/sub>/);
    const paamMatch = sv.match(/\(."פ\)/);

    if (smallMatch) {
        const cleanSv = sv.replace(/<small>\d+<\/small>/, "").trim();
        return [cleanSv, smallMatch[0]];
    }

    if (subMatch) {
        const cleanSv = sv.replace(/<sub>\d+<\/sub>/, "").trim();
        return [cleanSv, subMatch[0]];
    }

    if (paamMatch) {
        const cleanSv = sv.slice(0, paamMatch.index).trim();
        return [cleanSv, paamMatch[0]];
    }

    return [sv, ""];
}

function mergeVars(vars) {
    for (let i = 0; i < vars.length - 1; i++) {
        if (!Array.isArray(vars[i]) || vars[i].length < 2) {
            continue;
        }

        const witness = String(vars[i][0] || "").trim();
        const reading = String(vars[i][1] || "").trim();

        if (!reading && witness && Array.isArray(vars[i + 1]) && vars[i + 1].length >= 2) {
            vars[i + 1][0] = `${witness} ${String(vars[i + 1][0] || "").trim()}`.trim();
        }
    }

    return vars.filter(item => {
        if (!Array.isArray(item) || item.length < 2) {
            return false;
        }
        return String(item[1] || "").trim() !== "";
    });
}

function parseVars(note, loc = null) {
    let normalized = String(note || "").replace(/[\[\]]/g, "");
    if (normalized.includes("ב<big>")) {
        normalized = normalized.replace(/ב<big>/g, "<big>");
    }

    const chunks = normalized.split("<big>").filter(chunk => chunk && chunk !== "\n");
    const vars = chunks.map(chunk => chunk.split("</big>"));
    const merged = mergeVars(vars);

    return merged.map(item => {
        const witness = String(item[0] || "").trim();
        const readingRaw = cleanReading(String(item[1] || "").replace(/\.\.\./g, "…"));
        if (!readingRaw && loc) {
            console.warn("Empty parsed reading", { loc, note });
        }
        return [witness, readingRaw];
    });
}

function isMultiWitness(vars) {
    if (!Array.isArray(vars) || vars.length === 0) {
        return false;
    }
    return vars.length > 1 || String(vars[0][0] || "").includes(" ");
}

// --- Word-level diff helpers (used by Sotah marked/notes display) ---

function stripPunctHe(w) {
    return String(w || "").replace(/<[^>]+>/g, "").replace(/[,.;:!?״()\[\]"׳']/g, "").trim();
}

const MARKER_SPLIT_RE = /<i data-commentator="Variants" data-label="[^"]+" data-order="(\d+)"><\/i>/g;

// Per-halakha [start, end) word-index ranges within a chapter's flat token
// sequence, using the same tokenization convention (strip tags, split on
// whitespace) the offline witness-alignment pipeline uses to build
// Witnesses_<Tractate>.json, so indices line up with that data. Also returns,
// per halakha, the base-word-index immediately BEFORE each footnote marker
// (in physical occurrence order), mirroring build_witness_alignments.py's
// tokenize_base_chapter -- lets a clicked footnote marker resolve to the
// base-word position of the lemma it annotates (lemma starts at idx+1).
function computeChapterWordIndex(textPerek) {
    let offset = 0;
    const ranges = [];
    const markerBaseIdx = [];
    textPerek.forEach(halakhaHtml => {
        const parts = halakhaHtml.split(MARKER_SPLIT_RE);
        const markers = [];
        let localCount = 0;
        parts.forEach((part, i) => {
            if (i % 2 === 1) {
                markers.push(offset + localCount - 1);
            } else {
                localCount += tokenizeHe(part).length;
            }
        });
        ranges.push([offset, offset + localCount]);
        markerBaseIdx.push(markers);
        offset += localCount;
    });
    return { ranges, markerBaseIdx };
}

// Wrap each body word inside `container` in a <span data-base-idx="N">,
// skipping text inside <sup> (footnote-marker labels, not body words) so the
// wrapped sequence matches computeChapterWordIndex's counting exactly.
// startIdx is the halakha's chapter-wide base-word offset (range[0]).
function annotateWordsWithBaseIdx(container, startIdx) {
    let idx = startIdx;
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.textContent.trim()) return;
            const frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(part => {
                if (!part) return;
                if (/^\s+$/.test(part)) {
                    frag.appendChild(document.createTextNode(part));
                } else {
                    const span = document.createElement('span');
                    span.className = 'body-word';
                    span.dataset.baseIdx = String(idx++);
                    span.textContent = part;
                    frag.appendChild(span);
                }
            });
            node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SUP') return;
            [...node.childNodes].forEach(walk);
        }
    }
    [...container.childNodes].forEach(walk);
}

// --- Alternate edition (Vilna / Lieberman-Zuckermandel) numbering overlay ---
//
// data/editions/Editions_<Tractate>.json holds, per scheme, a list of
// breakpoints {atChapter, atHalakha, atWord, chapter, halakha} sorted in our
// own text's reading order: "at our (atChapter, atHalakha, atWord), edition
// X begins its chapter/halakha (chapter, halakha)". atChapter/atHalakha are
// 0-based indices into our own text[]; atWord is 0-based and LOCAL to that
// halakha (same word-splitting convention as computeChapterWordIndex), not
// chapter-wide like data-base-idx.

// The breakpoint in effect at or before (atChapter, atHalakha, atWord) --
// e.g. for a chapter header, call with atHalakha=0, atWord=0. Returns null
// only if the position is before the very first breakpoint (shouldn't
// normally happen -- every tractate's first word is breakpoint 0).
function findActiveEditionBreakpoint(breakpoints, atChapter, atHalakha, atWord) {
    let active = null;
    for (const bp of breakpoints) {
        if (bp.atChapter > atChapter) break;
        if (bp.atChapter === atChapter && bp.atHalakha > atHalakha) break;
        if (bp.atChapter === atChapter && bp.atHalakha === atHalakha && bp.atWord > atWord) break;
        active = bp;
    }
    return active;
}

// All breakpoints that fall inside one specific (chapter, halakha) of ours.
function editionBreakpointsInHalakha(breakpoints, atChapter, atHalakha) {
    return breakpoints.filter(bp => bp.atChapter === atChapter && bp.atHalakha === atHalakha);
}

// Label for a chapter header under an alternate scheme: the edition's
// chapter/halakha in effect as of this chapter's very first word. When that
// breakpoint sits exactly at this chapter's start (the common case), show
// just the chapter number; otherwise this chapter opens mid-way through the
// edition's own previous chapter (e.g. Avodah Zarah splits Zuckermandel's
// chapter 3 across our chapters 3 and 4), so say so explicitly.
function editionChapterHeaderLabel(breakpoints, schemeName, perekIndex) {
    const active = findActiveEditionBreakpoint(breakpoints, perekIndex, 0, 0);
    if (!active) return null;
    // active.halakha === 'א' means the edition ALSO starts a fresh chapter
    // exactly here, not merely that our own chapter happens to start here --
    // otherwise this our-chapter opens mid-way through the edition's own
    // previous chapter (e.g. Avodah Zarah splits Zuckermandel's chapter ג
    // across our chapters ד and ה), so say so explicitly.
    if (active.halakha === 'א') {
        return `${schemeName}: פרק ${active.chapter}`;
    }
    return `${schemeName}: המשך פרק ${active.chapter} (מהלכה ${active.halakha})`;
}

// Insert a small inline tag before the word where each breakpoint inside
// this halakha begins, so a break the alternate edition draws in the middle
// of one of our paragraphs is visible right where it falls. `rangeStart` is
// this halakha's chapter-wide word offset (halakhaWordRanges[i][0]) -- the
// DOM only has chapter-wide data-base-idx, so atWord (halakha-local) needs
// that offset added back to find the matching .body-word span.
function insertEditionMarkers(container, breakpointsInHalakha, schemeName, rangeStart) {
    breakpointsInHalakha.forEach(bp => {
        const marker = document.createElement('span');
        marker.className = 'edition-break-marker';
        marker.textContent = `${schemeName} ${bp.chapter}:${bp.halakha}`;
        const globalIdx = rangeStart + bp.atWord;
        const span = container.querySelector(`.body-word[data-base-idx="${globalIdx}"]`);
        if (span) {
            span.before(marker);
        } else {
            // Falls at/after this halakha's last matched word (rare edge
            // case) -- append rather than silently drop it.
            container.appendChild(marker);
        }
    });
}

// Render one strip per active witness siglum, showing that witness's
// continuous text for a halakha's [start, end) base-word range. Gaps
// (witness omits the word / no data) render as a visible placeholder rather
// than being silently skipped.
function buildWitnessStrips(chapterWitness, range, sigla) {
    if (!chapterWitness || !range || !sigla || !sigla.length) return null;
    const [start, end] = range;
    const container = document.createElement('div');
    container.className = 'witness-strips';
    sigla.forEach(siglum => {
        const w = chapterWitness.witnesses && chapterWitness.witnesses[siglum];
        if (!w) return;
        const words = w.words.slice(start, end);
        const additions = w.additions || null;
        // Does this witness have any addition anchored inside [start, end), or
        // at -1 (before the chapter's first base word) when start === 0?
        const hasAnyAddition = !!additions && Object.keys(additions).some(k => {
            const a = Number(k);
            return a === -1 ? start === 0 : (a >= start && a < end);
        });
        if (!words.some(Boolean) && !hasAnyAddition) return; // nothing for this witness in this halakha
        const row = document.createElement('div');
        row.className = 'witness-strip';
        row.dataset.siglum = siglum;
        const parts = [];
        const leadPlus = start === 0 && additions && additions['-1'];
        if (leadPlus) {
            parts.push(`<span class="witness-plus">${leadPlus.join(' ')}</span>`);
        }
        words.forEach((word, i) => {
            const baseIdx = start + i;
            const cls = word ? 'witness-word' : 'witness-gap';
            parts.push(`<span class="${cls}" data-base-idx="${baseIdx}">${word || '⟨ ⟩'}</span>`);
            const add = additions && additions[String(baseIdx)];
            if (add) {
                parts.push(`<span class="witness-plus">${add.join(' ')}</span>`);
            }
        });
        const body = parts.join(' ');
        // Same fragment naming as the footer synopsis (see buildRow): "ג"
        // alone does not say which geniza piece is speaking here.
        const codices = genizaCodicesInRange(w, start, end);
        const tag = codices.length
            ? `<sup class="syn-frag-siglum" title="${genizaCodexTooltip(codices).replace(/"/g, '&quot;')}">${codices.join('+')}</sup>`
            : '';
        row.innerHTML = `<span class="witness-strip-label">${siglum}${tag}</span><span class="witness-strip-body">${body}</span>`;
        container.appendChild(row);
    });
    return container.children.length ? container : null;
}

const SYNOPSIS_WITNESS_ORDER = ["א", "ב", "ד", "ל", "ג", "ש"];

// Which of chapterWitness's witnesses (in SYNOPSIS_WITNESS_ORDER) have any
// data -- aligned words or an addition anchored inside -- within base-word
// range [start, end). Shared by buildSynopsisStrips (per-halakha) and the
// movement-order table (a whole cluster of halakhot).
function activeSiglaInRange(chapterWitness, start, end) {
    return SYNOPSIS_WITNESS_ORDER.filter(s => {
        const w = chapterWitness.witnesses[s];
        if (!w) return false;
        if (w.words.slice(start, end).some(Boolean)) return true;
        // Include witnesses that have no aligned words here but do have
        // plusses anchored inside this range (or before the chapter's first
        // word, when start === 0).
        if (!w.additions) return false;
        return Object.keys(w.additions).some(k => {
            const a = Number(k);
            return a === -1 ? start === 0 : (a >= start && a < end);
        });
    });
}

// General multi-witness synopsis for a single halakha, built directly from
// the already-aligned Witnesses_<Tractate>.json data (no LCS needed — the
// offline pipeline already positioned every witness word against the
// base-text word index). A real <table> — one row per source (base text
// first, then every witness with data here), one column per word position —
// so word N sits at the same horizontal spot in every row (table columns
// naturally size to their widest cell across all rows) and the whole thing
// scrolls horizontally as one word-by-word strip instead of each row
// wrapping independently. Words that diverge from the base are colored;
// every cell carries data-base-idx so the footer can highlight one aligned
// column (the same position across every row).
//
// `ranges` (optional) is the full chapter's per-halakha [start,end) ranges
// (computeChapterWordIndex's return) -- when given, cells whose word a
// witness has displaced elsewhere in the manuscript (see `displacedEntryAt`)
// are ghosted (class `synw-ghost`) with a tooltip naming where it actually
// appears.
function buildSynopsisStrips(chapterWitness, range, halakhaHtml, ranges) {
    if (!chapterWitness || !range) {
        console.log('[synopsis] buildSynopsisStrips: missing chapterWitness or range', { hasChapterWitness: !!chapterWitness, range });
        return null;
    }
    const [start, end] = range;
    const n = end - start;
    if (n <= 0) {
        console.log('[synopsis] buildSynopsisStrips: empty/invalid range', range);
        return null;
    }
    const baseWords = tokenizeHe(halakhaHtml).slice(0, n);

    // Non-empty addition run anchored at chapter-wide base index `a` for
    // witness `w` (or null if none / witness has no additions field).
    function additionRunAt(w, a) {
        const run = w && w.additions && w.additions[String(a)];
        return (run && run.length) ? run : null;
    }

    // True when witness `w` simply does not survive at base position
    // `baseIdx`. A fragmentary witness (the Cambridge geniza pieces, ג) carries
    // `fragments: [{start, end}]` -- the inclusive base ranges it is extant
    // for. Outside those ranges the parchment is gone, which is a different
    // fact from "this witness omits the word", and by far the commoner one:
    // 71% of the ג gap cells the synopsis renders fall outside every fragment.
    // Witnesses with no `fragments` field are complete and never absent.
    function notExtantAt(w, baseIdx) {
        if (!w || !Array.isArray(w.fragments) || !w.fragments.length) return false;
        return !w.fragments.some(f => baseIdx >= f.start && baseIdx <= f.end);
    }

    // The base index whose word this position's reading is folded into, or
    // null. `folds: {covered_base_idx: anchor_base_idx}` records the other
    // multiword-abbreviation shape: the witness wrote one abbreviated word
    // (at `anchor`) where the base has several, so the covered positions are
    // empty for a reason that is neither omission nor missing parchment.
    // The word sits in the anchor cell; the covered cells continue it.
    function foldAnchorFor(w, baseIdx) {
        const anchor = w && w.folds && w.folds[String(baseIdx)];
        return anchor === undefined ? null : Number(anchor);
    }

    // Does a witness word at this position open a fold (i.e. some later
    // position is folded into it)? Used to box the pair as one unit.
    function opensFold(w, baseIdx) {
        if (!w || !w.folds) return false;
        return Object.values(w.folds).some(a => Number(a) === baseIdx);
    }

    const sigla = activeSiglaInRange(chapterWitness, start, end);
    if (!sigla.length) {
        console.log('[synopsis] buildSynopsisStrips: no witness has data in range', { range, availableSigla: Object.keys(chapterWitness.witnesses || {}) });
        return null;
    }

    // Substitutions. The offline pipeline has only two channels -- a word
    // aligned at a base position, or an addition with no base counterpart --
    // so where a witness *replaces* base material it lands in both at once:
    // the base positions go null and the replacement is parked in `additions`.
    // Rendered literally that reads as an omission (⟨ ⟩ over the base words)
    // plus an unrelated plus-box, and the reader cannot see what stands in
    // place of what. Corpus-wide that is 4,118 runs covering 10,122 base
    // words -- the largest remaining source of ⟨ ⟩ after the geniza fragments.
    //
    // So: a run of null positions whose boundary carries an addition is a
    // substitution. Lay the replacement out across the run's own columns and
    // suppress the now-redundant plus box. The word-to-column distribution is
    // a display convenience, not a claim about which word answers which --
    // `synw-subst` underlines the whole run to say "over this span the witness
    // reads this", and any overflow past the last column joins that cell so
    // no transcribed word is dropped.
    //
    // Anchors below `start` are deliberately left alone: they belong to the
    // preceding halakha's table, which already renders them, and consuming
    // them here would show the same words twice.
    function substitutionsFor(w) {
        const byIdx = new Map();   // base index -> word(s) to show there
        const consumed = new Set();  // addition anchors now shown in the grid
        if (!w || !w.additions) return { byIdx, consumed };
        for (let i = start; i < end; i++) {
            if (w.words[i]) continue;
            let j = i;
            while (j + 1 < end && !w.words[j + 1]) j++;
            const anchors = [];
            for (let a = Math.max(i - 1, start); a <= j; a++) {
                if (additionRunAt(w, a)) anchors.push(a);
            }
            // A position the witness's own abbreviation already covers (a
            // fold) is not free to hold a replacement -- it is empty for a
            // reason of its own, and the fold branch renders it. Only the
            // rest of the run can carry the substitution; if the fold takes
            // the whole run, the addition stays a plus rather than vanishing.
            const cols = [];
            for (let k = i; k <= j; k++) {
                if (foldAnchorFor(w, k) === null) cols.push(k);
            }
            if (anchors.length && cols.length) {
                const repl = anchors.flatMap(a => additionRunAt(w, a));
                cols.forEach((idx, k) => {
                    const chunk = k === cols.length - 1 ? repl.slice(k) : repl.slice(k, k + 1);
                    if (chunk.length) byIdx.set(idx, chunk.join(' '));
                });
                anchors.forEach(a => consumed.add(a));
            }
            i = j;
        }
        return { byIdx, consumed };
    }

    const subst = {};
    sigla.forEach(s => { subst[s] = substitutionsFor(chapterWitness.witnesses[s]); });

    // Column plan: an optional leading "plus column" (anchor -1, only at the
    // chapter's start), then for each base position i a base column followed
    // by a plus column if any active witness has an addition anchored there
    // that is a genuine plus rather than a substitution laid into the grid.
    const hasLeadPlus = start === 0 && sigla.some(s => additionRunAt(chapterWitness.witnesses[s], -1));
    const plusAfter = [];
    for (let i = 0; i < n; i++) {
        plusAfter.push(sigla.some(s => additionRunAt(chapterWitness.witnesses[s], start + i)
            && !subst[s].consumed.has(start + i)));
    }

    function buildRow(table, label, siglum, words, isBase) {
        const tr = document.createElement('tr');
        tr.className = 'syn-strip' + (isBase ? ' syn-strip-base' : '');
        tr.dataset.siglum = label; // e.g. "א" (Erfurt) -- lets clicks distinguish which witness's row this is
        const labelCell = document.createElement('td');
        labelCell.className = 'syn-strip-label';
        labelCell.textContent = label;
        tr.appendChild(labelCell);

        const w = siglum ? chapterWitness.witnesses[siglum] : null;

        // A fragmentary witness's siglum alone ("ג") does not say WHICH
        // fragment is speaking, and over a given passage that is the citable
        // fact -- the geniza pieces are separate manuscripts, catalogued
        // individually. Name the codex here and put its shelfmark in the
        // tooltip. (Two sigla when the passage runs from one fragment into the
        // next; see _label_for_span in the alignment engine.)
        const codices = genizaCodicesInRange(w, start, end);
        if (codices.length) {
            const tag = document.createElement('sup');
            tag.className = 'syn-frag-siglum';
            tag.textContent = codices.join('+');
            labelCell.appendChild(tag);
            labelCell.title = genizaCodexTooltip(codices);
        }
        const rowSubst = siglum ? subst[siglum] : null;

        function appendPlusCell(anchor) {
            const cell = document.createElement('td');
            const run = rowSubst && rowSubst.consumed.has(anchor) ? null : additionRunAt(w, anchor);
            if (run) {
                cell.className = 'synw synw-plus';
                cell.textContent = run.join(' ');
                // Addition words have no base index of their own, but they sit
                // right after base word `anchor` in the witness -- carry that
                // index so the click handler (which keys off data-base-idx)
                // treats the plus-box like any other cell: it drives the
                // manuscript viewer to the anchor word's page/region, the
                // nearest image target for a plus. (anchor -1 = a lead
                // addition before the chapter's first word -> base 0.)
                cell.dataset.baseIdx = String(anchor < 0 ? 0 : anchor);
                const entry = displacedEntryAt(w, anchor);
                if (entry) {
                    cell.classList.add('synw-ghost');
                    cell.title = ghostTooltip(entry.anchor, ranges);
                }
            } else {
                cell.className = 'synw synw-plusgap';
            }
            tr.appendChild(cell);
        }

        if (hasLeadPlus) appendPlusCell(-1);

        words.forEach((word, i) => {
            const baseIdx = start + i;
            const cell = document.createElement('td');
            cell.className = 'synw';
            cell.dataset.baseIdx = String(baseIdx);
            const replacement = rowSubst ? rowSubst.byIdx.get(baseIdx) : undefined;
            const foldAnchor = word || isBase ? null : foldAnchorFor(w, baseIdx);
            if (foldAnchor !== null) {
                cell.classList.add('synw-fold-cont');
                if (foldAnchorFor(w, baseIdx + 1) !== foldAnchor) cell.classList.add('synw-fold-last');
                cell.title = `הקיצור ${w.words[foldAnchor] || ''} שבעד זה מכסה גם תיבה זו`.trim();
            } else if (!word && replacement !== undefined) {
                cell.textContent = replacement;
                cell.classList.add('synw-subst');
                if (!rowSubst.byIdx.has(baseIdx - 1)) cell.classList.add('synw-subst-first');
                if (!rowSubst.byIdx.has(baseIdx + 1)) cell.classList.add('synw-subst-last');
                cell.title = 'תמורה — הנוסח שבעד זה תחת מקבילו שבפנים';
            } else if (!word) {
                if (!isBase && notExtantAt(w, baseIdx)) {
                    cell.classList.add('synw-absent');
                    cell.title = 'הקטע אינו קיים כאן — אין עדות, לא חסרון';
                } else {
                    cell.classList.add('synw-gap');
                    cell.textContent = '⟨ ⟩';
                }
            } else {
                cell.textContent = word;
                if (!isBase) {
                    if (opensFold(w, baseIdx)) cell.classList.add('synw-fold');
                    if (wordsMatchHe(baseWords[i], word)) cell.classList.add('synw-match');
                    else cell.classList.add(...synopsisDiffClasses(baseWords[i], word));
                }
            }
            if (!isBase) {
                const entry = displacedEntryAt(w, baseIdx);
                if (entry) {
                    cell.classList.add('synw-ghost');
                    cell.title = ghostTooltip(entry.anchor, ranges);
                }
            }
            tr.appendChild(cell);

            if (plusAfter[i]) appendPlusCell(baseIdx);
        });
        table.appendChild(tr);
    }

    const table = document.createElement('table');
    table.className = 'witness-synopsis';
    buildRow(table, 'בסיס', null, baseWords, true);
    sigla.forEach(sig => buildRow(table, sig, sig, chapterWitness.witnesses[sig].words.slice(start, end), false));

    const scroller = document.createElement('div');
    scroller.className = 'witness-synopsis-scroll';
    scroller.appendChild(table);
    return scroller;
}

// --- Displaced text ("order swap" between witness and base order) --------
// A witness's chapter entry may carry `displaced: [{start, end, anchor}, ...]`
// (sorted, non-overlapping): the witness HAS the base-word range [start,end)
// -- its words are aligned there in .words[], same as any other run -- but
// in the manuscript that text physically sits elsewhere: right after
// base-word index `anchor` (-1 = before the chapter's first word). Typical
// case: two adjacent halakhot swapped, so one witness's later halakha is
// displaced with its anchor at the end of the earlier one.

// Hebrew-numeral halakha label, e.g. halakhaLabel(5) -> "ה״ו" (0-based
// hi=5 is the 6th halakha). Reuses convert_number's gematria table.
function halakhaLabel(hi) {
    return 'ה״' + convert_number(hi + 1);
}

// Which halakha (index into a chapter's per-halakha `ranges`) contains
// base-word index `idx`; -1 for the virtual "before the chapter's first
// word" position (idx < 0).
function halakhaIndexForBaseIdx(ranges, idx) {
    if (idx == null || idx < 0) return -1;
    for (let i = 0; i < ranges.length; i++) {
        if (idx >= ranges[i][0] && idx < ranges[i][1]) return i;
    }
    return ranges.length - 1;
}

// The displaced-range entry (if any) covering base-word index `baseIdx` for
// witness `w`.
function displacedEntryAt(w, baseIdx) {
    if (!w || !Array.isArray(w.displaced)) return null;
    for (const entry of w.displaced) {
        if (baseIdx >= entry.start && baseIdx < entry.end) return entry;
    }
    return null;
}

// Tooltip text for a ghosted (displaced) synopsis cell: names where the
// witness actually places this text. `ranges` is the chapter's full
// per-halakha range list (needed to turn `anchor` into a halakha label);
// without it, only the generic explanation is shown.
function ghostTooltip(anchor, ranges) {
    const base = 'סדר שונה בעד זה — מוצג כאן לפי סדר נוסח הפנים';
    if (!ranges) return base + '.';
    const anchorHi = halakhaIndexForBaseIdx(ranges, anchor);
    const where = anchorHi < 0 ? 'לפני תחילת הפרק' : `אחרי ${halakhaLabel(anchorHi)}`;
    return `${base}. בכתב היד מופיע ${where}.`;
}

// Merge a chapter's displaced entries (across all witnesses) into
// contiguous "movement clusters" of halakha indices. A single displaced
// entry touches every halakha its base-word range overlaps, plus the
// halakha containing its anchor -- for a plain two-halakha swap these are
// never adjacent-only, they bracket a contiguous run (e.g. anchor in
// halakha 4, displaced range inside halakha 6 -> touches {4,6}, and the run
// [4,6] pulls in halakha 5 too, since it sits between them in base order).
// Runs from different witnesses/entries that touch or overlap are merged.
function computeMovementClusters(chapterWitness, ranges) {
    if (!chapterWitness || !chapterWitness.witnesses || !ranges || !ranges.length) return [];
    const intervals = [];
    Object.keys(chapterWitness.witnesses).forEach(sig => {
        const w = chapterWitness.witnesses[sig];
        if (!w || !Array.isArray(w.displaced)) return;
        w.displaced.forEach(entry => {
            const touched = [];
            for (let hi = 0; hi < ranges.length; hi++) {
                const [s, e] = ranges[hi];
                if (entry.start < e && entry.end > s) touched.push(hi);
            }
            const anchorHi = halakhaIndexForBaseIdx(ranges, entry.anchor);
            if (anchorHi >= 0) touched.push(anchorHi);
            if (touched.length) intervals.push([Math.min(...touched), Math.max(...touched)]);
        });
    });
    if (!intervals.length) return [];
    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0].slice()];
    intervals.slice(1).forEach(([lo, hi]) => {
        const last = merged[merged.length - 1];
        if (lo <= last[1] + 1) {
            last[1] = Math.max(last[1], hi);
        } else {
            merged.push([lo, hi]);
        }
    });
    return merged.map(([min, max]) => ({ min, max }));
}

// The movement cluster (if any) that halakha `hi` belongs to.
function movementClusterForHalakha(chapterWitness, ranges, hi) {
    return computeMovementClusters(chapterWitness, ranges).find(c => hi >= c.min && hi <= c.max) || null;
}

// A witness's reading order over a cluster's halakhot: each halakha's sort
// key is the anchor of whichever of the witness's displaced entries
// overlaps it (if any), else its own natural base-word start position --
// so a displaced halakha sorts to right after the halakha it's actually
// written beside in the manuscript.
function witnessOrderForCluster(w, ranges, cluster) {
    const indices = [];
    for (let hi = cluster.min; hi <= cluster.max; hi++) indices.push(hi);
    function keyFor(hi) {
        const [s, e] = ranges[hi];
        if (w && Array.isArray(w.displaced)) {
            const entry = w.displaced.find(en => en.start < e && en.end > s);
            if (entry) return entry.anchor;
        }
        return s;
    }
    return indices.slice().sort((a, b) => keyFor(a) - keyFor(b));
}

// Stable pastel palette for movement-table cells, keyed by halakha index so
// the same halakha keeps the same color in every column.
const MOVEMENT_PALETTE = ['#ffe1e1', '#ffe9c7', '#fff6b8', '#ddf2d3', '#cdecec', '#d7e3fb', '#e8dcf7', '#fbdaee'];

function movementColorFor(hi) {
    return MOVEMENT_PALETTE[((hi % MOVEMENT_PALETTE.length) + MOVEMENT_PALETTE.length) % MOVEMENT_PALETTE.length];
}

// Build the Lieberman-style "order table" for one movement cluster: one
// column per source (base text, then witnesses -- witnesses sharing the
// identical reading order over the cluster are merged into one column)
// showing that source's own reading order of the cluster's halakhot, top to
// bottom. The same halakha keeps the same pastel background in every
// column (so a glance shows where it landed for each witness); a cell is
// bold+red when its row position there differs from its position in the
// base column, i.e. it moved for that source.
function buildMovementTable(chapterWitness, ranges, textPerek, cluster) {
    const clusterHalakhot = [];
    for (let hi = cluster.min; hi <= cluster.max; hi++) clusterHalakhot.push(hi);
    const basePositionOf = new Map(clusterHalakhot.map((hi, i) => [hi, i]));

    const start = ranges[cluster.min][0];
    const end = ranges[cluster.max][1];
    const sigla = activeSiglaInRange(chapterWitness, start, end);
    if (!sigla.length) return null;

    // Group witnesses whose reading order over the cluster is identical.
    const groups = [];
    sigla.forEach(s => {
        const order = witnessOrderForCluster(chapterWitness.witnesses[s], ranges, cluster);
        const key = order.join(',');
        let group = groups.find(g => g.key === key);
        if (!group) {
            group = { key, order, sigla: [] };
            groups.push(group);
        }
        group.sigla.push(s);
    });

    // Nothing actually differs from base order for any witness group --
    // nothing useful to draw.
    const anyMoved = groups.some(g => g.order.some((hi, i) => hi !== clusterHalakhot[i]));
    if (!anyMoved) return null;

    const columns = [{ label: 'בסיס', order: clusterHalakhot }]
        .concat(groups.map(g => ({ label: g.sigla.join(' '), order: g.order })));

    function cellText(hi) {
        const words = tokenizeHe(textPerek[hi]).slice(0, 3).join(' ');
        return `${halakhaLabel(hi)} ${words} וכו׳`;
    }

    const table = document.createElement('table');
    table.className = 'movement-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let row = 0; row < clusterHalakhot.length; row++) {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const hi = col.order[row];
            const td = document.createElement('td');
            td.textContent = cellText(hi);
            td.style.background = movementColorFor(hi);
            if (row !== basePositionOf.get(hi)) td.classList.add('movement-moved');
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const wrap = document.createElement('div');
    wrap.className = 'movement-table-scroll';
    wrap.appendChild(table);
    return wrap;
}

// Entry point for callers: the movement table to render above halakha
// `hi`'s synopsis, or null if it's not part of any movement cluster. In
// whole-chapter view the table is only rendered once per cluster (above the
// FIRST involved halakha) via opts.chapterView; in single-halakha view it's
// shown whenever the displayed halakha is part of a cluster.
function buildMovementTableForHalakha(chapterWitness, ranges, textPerek, hi, opts) {
    const cluster = movementClusterForHalakha(chapterWitness, ranges, hi);
    if (!cluster) return null;
    if (opts && opts.chapterView && hi !== cluster.min) return null;
    return buildMovementTable(chapterWitness, ranges, textPerek, cluster);
}

function tokenizeHe(text) {
    return String(text || "")
        .replace(/<br\s*\/?\s*>/g, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

// True if two Hebrew words should be treated as equivalent for alignment.
// Builds on the existing classifier rules so the matcher catches kitzur,
// haser/maleh, מ/ן final, אי/יי, ת/ה final, ה/ן final, known orthographic
// pairs, and prefix-only differences (ו/ב/ל/ה/מ/ש/כ).
function wordsMatchHe(w1, w2) {
    if (w1 === w2) return true;
    // Normalize markup/quotes but KEEP geresh/apostrophe — isKitzur and the
    // matres-lectionis checks rely on the abbreviation marker. Only strip
    // trailing sentence punctuation.
    //
    // Pointing must go first: sixteen tractates (Kelim, Menachot, Zevachim,
    // Oholot, Chullin...) have a vocalized base text while every witness
    // transcription is unpointed, so without stripNiqqud עַל/על compares as a
    // variant and the synopsis paints essentially every word of every witness
    // row as divergent. Square brackets are editorial too — Lieberman's
    // supplements in the base ([באים]) and scribal restorations in the
    // witnesses (שמ[ר]חיקין) — so they come out wherever they sit; parens
    // only at the edges, where they are stray rather than notation.
    const norm = w => normalizeQuotes(stripNiqqud(String(w || "").replace(/<[^>]+>/g, "")))
        .replace(/[[\]]/g, "")
        .trim()
        .replace(/^[(]+|[)]+$/g, "")
        .replace(/[.,;:!?]+$/, "");
    const a = norm(w1);
    const b = norm(w2);
    if (!a || !b) return false;
    if (a === b) return true;
    if (isKitzur(a, b)) return true;
    if (isMN(a, b)) return true;
    if (isAlefYodSwap(a, b)) return true;
    if (isTavHehSwap(a, b)) return true;
    if (isHehNunFinalSwap(a, b)) return true;
    if (MINOR_ORTHO_PAIRS.has(createPairKey(a, b))) return true;
    // Catches haser/maleh, generic minor orthographic patterns
    const [isMinor] = isMinorOrthographic(a, b);
    if (isMinor) return true;
    // Prefix-only differences (one of ו/ב/ל/ה/מ/ש/כ added/removed)
    for (const pre of PREFIXES) {
        if (a === pre + b || b === pre + a) return true;
    }
    return false;
}

// How loudly a synopsis cell should read. The apparatus layer already grades
// every reading through classifyVariantPair's nine categories; the synopsis
// used to collapse all of them into one "diff" colour, so a habitual אין/אינו
// shouted as loudly as a genuine lexical swap. Three tones over the same
// categories: `minor` (spelling and rabbi-name shapes -- the same word),
// `routine` (habitual swap, prefix, word order, inflection, citation scope --
// the same word differently formed or a scribe's reflex), `major` (a different
// word). Measured over the corpus: 4.6k minor, 9.6k routine, 17.7k major.
const SYNOPSIS_TONE_BY_CATEGORY = {
    minor: 'minor', minor_orthography: 'minor', name_orthography: 'minor',
    routine: 'routine', other_minor: 'routine', morphology: 'routine',
    citation_scope: 'routine',
};

// CSS classes for a witness cell whose word diverges from the base word --
// the generic `synw-diff` plus its tone. Spread into classList.add. Callers
// only reach here once wordsMatchHe has said the two differ.
function synopsisDiffClasses(baseWord, word) {
    const category = classifyVariantPair(baseWord, word).category;
    return ['synw-diff', 'synw-diff-' + (SYNOPSIS_TONE_BY_CATEGORY[category] || 'major')];
}

// LCS-based sequence aligner producing opcodes and a per-A match flag list.
// opcode tags: 'equal' | 'replace' | 'insert' (b has more) | 'delete' (a has more).
// Returns { opcodes, matchesA } where matchesA[i] is true if a[i] is part of an
// equal block (matches the aligned b[j]). Uses wordsMatchHe by default.
function alignSequencesHe(a, b, eqFn) {
    eqFn = eqFn || wordsMatchHe;
    const n = a.length, m = b.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            dp[i][j] = eqFn(a[i - 1], b[j - 1])
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    // Walk back to collect matching pairs
    const pairs = [];
    let i = n, j = m;
    while (i > 0 && j > 0) {
        if (eqFn(a[i - 1], b[j - 1])) {
            pairs.push([i - 1, j - 1]);
            i--; j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
            i--;
        } else {
            j--;
        }
    }
    pairs.reverse();

    const matchesA = new Array(n).fill(false);
    pairs.forEach(([ai]) => { matchesA[ai] = true; });

    // Build opcodes by walking the matches
    const opcodes = [];
    let ai = 0, bi = 0;
    for (const [pa, pb] of pairs) {
        if (pa > ai || pb > bi) {
            const tag = ai === pa ? "insert" : (bi === pb ? "delete" : "replace");
            opcodes.push([tag, ai, pa, bi, pb]);
        }
        opcodes.push(["equal", pa, pa + 1, pb, pb + 1]);
        ai = pa + 1; bi = pb + 1;
    }
    if (ai < n || bi < m) {
        const tag = ai === n ? "insert" : (bi === m ? "delete" : "replace");
        opcodes.push([tag, ai, n, bi, m]);
    }
    // Coalesce consecutive equal opcodes
    const merged = [];
    for (const op of opcodes) {
        const last = merged[merged.length - 1];
        if (last && last[0] === op[0] && last[2] === op[1] && last[4] === op[3]) {
            last[2] = op[2]; last[4] = op[4];
        } else {
            merged.push([...op]);
        }
    }
    return { opcodes: merged, matchesA };
}

// Build aligned synoptic rows from Erfurt/Vienna word alignment. Each row is
// one alignment segment so the two columns stay parallel line-to-line:
//   { tag, v: [vienna words], e: [erfurt words] }
// tag ∈ equal | replace | insert (Vienna-only) | delete (Erfurt-only).
function buildAlignedRows(erfurtWords, viennaWords) {
    const { opcodes } = alignSequencesHe(erfurtWords, viennaWords);
    return opcodes.map(([tag, i1, i2, j1, j2]) => ({
        tag,
        v: viennaWords.slice(j1, j2),
        e: erfurtWords.slice(i1, i2),
    }));
}

// Detect a chapter that uses the כי"ע format (Sotah 3-15): every halakha's
// first apparatus entry is a single block holding the entire Erfurt parallel
// text rather than ordinary `LEMMA | witness reading` notes.
function isKiyChapter(variantsChapter) {
    if (!Array.isArray(variantsChapter) || variantsChapter.length === 0) return false;
    return variantsChapter.every(h => Array.isArray(h) && h.length > 0
        && typeof h[0] === "string" && h[0].startsWith('<b>כי"ע</b>'));
}

function extractErfurtText(firstVariant) {
    if (typeof firstVariant !== "string" || !firstVariant.startsWith('<b>כי"ע</b>')) return null;
    let text = firstVariant.replace(/^<b>כי"ע<\/b>(<br>)?/, "");
    const slik = text.indexOf("<br>סליק");
    if (slik !== -1) text = text.substring(0, slik);
    return text.trim();
}

// --- Sotah כי"ע merged-apparatus builder (ports sotah_footnoted.py) ---

const KIY_SOURCE_ORDER = "פדאג";
const KIY_MARKER_RE = /<i data-commentator="Variants" data-label="[^"]*" data-order="\d+"><\/i>/g;

function canonicalSourcesHe(srcs) {
    const seen = [];
    for (let s of srcs) {
        s = String(s || "").trim();
        if (s && !seen.includes(s)) seen.push(s);
    }
    seen.sort((a, b) => {
        const ia = KIY_SOURCE_ORDER.indexOf(a[0] || "ת");
        const ib = KIY_SOURCE_ORDER.indexOf(b[0] || "ת");
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return seen.join("");
}

function makeAnchorSvHe(vSpan, maxWords = 4) {
    const cleaned = vSpan.map(stripPunctHe);
    if (cleaned.length > maxWords) return `${cleaned[0]}... ${cleaned[cleaned.length - 1]}`;
    return cleaned.join(" ");
}

function isOmitReadingHe(reading) {
    const r = String(reading || "").trim().replace(/\.$/, "");
    return r === "ח'" || r === "ח׳";
}

// A diff is trivial if every word matches via spelling/abbreviation rules.
function isTrivialDiffHe(sv, reading) {
    if (!sv || !reading) return false;
    if (isOmitReadingHe(reading)) return false;
    if (sv.includes("...")) return false;
    const svW = sv.split(/\s+/).filter(Boolean);
    const rdW = reading.split(/\s+/).filter(Boolean);
    if (svW.length !== rdW.length) return false;
    // Pass raw words to wordsMatchHe so it can see abbreviation markers.
    if (svW.every((s, i) => stripPunctHe(s) === stripPunctHe(rdW[i]))) return false; // identical — not a diff
    return svW.every((s, i) => wordsMatchHe(s, rdW[i]));
}

function _wordEqHe(a, b) {
    return stripPunctHe(a) === stripPunctHe(b) || wordsMatchHe(a, b);
}

function findSvRangeHe(svText, viennaWords, segStart, segEnd) {
    if (segEnd <= segStart) return null;
    svText = String(svText || "").trim();
    if (!svText) return null;
    const endBound = viennaWords.length;

    if (svText.includes("...")) {
        const parts = svText.split(/\.{3,}/);
        const firstTok = parts[0].trim() ? parts[0].trim().split(/\s+/)[0] : null;
        const lastArr = parts[parts.length - 1].trim() ? parts[parts.length - 1].trim().split(/\s+/) : null;
        const lastTok = lastArr ? lastArr[lastArr.length - 1] : null;
        if (!firstTok || !lastTok) return null;
        for (let i = segStart; i < endBound; i++) {
            if (_wordEqHe(viennaWords[i], firstTok)) {
                for (let j = i; j < endBound; j++) {
                    if (_wordEqHe(viennaWords[j], lastTok)) return [i, j];
                }
                break;
            }
        }
        return null;
    }

    const svWords = svText.split(/\s+/).filter(Boolean);
    const n = svWords.length;
    const candidates = [segStart];
    for (let s = segStart + 1; s < Math.max(segEnd, endBound) - n + 1; s++) candidates.push(s);
    for (const start of candidates) {
        if (start + n > endBound) continue;
        let ok = true;
        for (let k = 0; k < n; k++) {
            if (!_wordEqHe(viennaWords[start + k], svWords[k])) { ok = false; break; }
        }
        if (ok) return [start, start + n - 1];
    }
    return null;
}

function erfurtDiffsToEntriesHe(viennaWords, erfurtWords, opcodes) {
    const entries = [];
    for (const [tag, i1, i2, j1, j2] of opcodes) {
        const eSpan = erfurtWords.slice(i1, i2);
        const vSpan = viennaWords.slice(j1, j2);
        if (tag === "equal") {
            for (let k = 0; k < (i2 - i1); k++) {
                const ew = erfurtWords[i1 + k], vw = viennaWords[j1 + k];
                if (ew !== vw && !wordsMatchHe(ew, vw)) {
                    const sv = stripPunctHe(vw), rd = stripPunctHe(ew);
                    if (sv !== rd) entries.push({ sv, sv_range: [j1 + k, j1 + k], attach: j1 + k, sources: [["א", rd]] });
                }
            }
        } else if (tag === "replace") {
            const sv = makeAnchorSvHe(vSpan);
            const reading = eSpan.map(stripPunctHe).join(" ");
            if (sv === reading) continue;
            entries.push({ sv, sv_range: [j1, j2 - 1], attach: j1, sources: [["א", reading]] });
        } else if (tag === "insert") {
            // Vienna has words missing in Erfurt
            const sv = makeAnchorSvHe(vSpan);
            entries.push({ sv, sv_range: [j1, j2 - 1], attach: j1, sources: [["א", "ח'"]] });
        } else if (tag === "delete") {
            // Erfurt has extra words not in Vienna
            const extra = eSpan.map(stripPunctHe).join(" ");
            const attach = j1 < viennaWords.length ? j1 : viennaWords.length - 1;
            entries.push({ raw_text: `+א: ${extra}.`, attach });
        }
    }
    return entries;
}

function _mergeEntriesAtPositionHe(entries) {
    const grouped = [];
    const seenKeys = new Map();
    for (const e of entries) {
        if (e.raw !== undefined) { grouped.push(e); continue; }
        const key = `${(e.sv || "").trim()}\0${(e.suffix || "").trim()}`;
        if (seenKeys.has(key)) {
            grouped[seenKeys.get(key)].sources.push(...e.sources);
        } else {
            seenKeys.set(key, grouped.length);
            grouped.push({ sv: e.sv, sv_range: e.sv_range, suffix: e.suffix || "", sources: e.sources.slice() });
        }
    }
    for (const g of grouped) {
        if (g.raw !== undefined) continue;
        const order = [];
        const byReading = new Map();
        for (const [src, reading] of g.sources) {
            const r = String(reading || "").trim();
            if (!byReading.has(r)) { byReading.set(r, []); order.push(r); }
            byReading.get(r).push(src);
        }
        g.merged = order.map(r => [canonicalSourcesHe(byReading.get(r)), r]);
    }
    return grouped;
}

// Build the merged apparatus for one כי"ע halakha.
// Returns { viennaWords, mergedAt } where mergedAt maps a Vienna word index to
// an ordered list of note entries ({sv, suffix, merged:[[srcStr,reading]]} or {raw}).
function buildKiyMergedNotes(bodyText, halakhaVars) {
    const erfurtText = extractErfurtText(halakhaVars && halakhaVars[0]) || "";
    const viennaWords = tokenizeHe(bodyText);
    const erfurtWords = tokenizeHe(erfurtText);
    const { opcodes } = alignSequencesHe(erfurtWords, viennaWords);

    let erfurtEntries = erfurtDiffsToEntriesHe(viennaWords, erfurtWords, opcodes);
    erfurtEntries = erfurtEntries.filter(e =>
        e.raw_text !== undefined || !isTrivialDiffHe(e.sv, e.sources[0][1]));

    // Segment the body by markers to map existing notes to word positions.
    const textParts = bodyText.split(KIY_MARKER_RE);
    const cumWords = [0];
    for (const seg of textParts) {
        const clean = String(seg).replace(/<[^>]+>/g, "").trim();
        const count = clean ? clean.split(/\s+/).filter(Boolean).length : 0;
        cumWords.push(cumWords[cumWords.length - 1] + count);
    }

    const entriesAt = new Map();
    const pushAt = (pos, entry) => {
        if (!entriesAt.has(pos)) entriesAt.set(pos, []);
        entriesAt.get(pos).push(entry);
    };

    const VAR_OFFSET = 1; // skip the כי"ע block
    for (let p = 0; p < textParts.length; p++) {
        const varIdx = p + VAR_OFFSET;
        if (varIdx >= halakhaVars.length || !halakhaVars[varIdx]) continue;
        const note = halakhaVars[varIdx];
        if (typeof note !== "string" || !note.includes("|")) continue;
        const attachWord = (p + 1) < cumWords.length ? cumWords[p + 1] : cumWords[cumWords.length - 1];
        const segStart = attachWord;
        const segEnd = (p + 2) < cumWords.length ? cumWords[p + 2] : cumWords[cumWords.length - 1];

        const parsed = parseNote3(note, null);
        if (typeof parsed === "string") { pushAt(attachWord, { raw: parsed }); continue; }
        if (!Array.isArray(parsed) || parsed.length < 2) continue;
        const sv = parsed[0];
        const vars = parsed[1];
        const svText = String(sv[0] || "").trim();
        const suffix = sv[1] ? String(sv[1]).trim() : "";

        const sources = [];
        for (const entry of vars) {
            if (!Array.isArray(entry) || entry.length !== 2) continue;
            const src = String(entry[0] || "").trim();
            const reading = String(entry[1] || "").trim();
            if (isTrivialDiffHe(svText, reading)) continue;
            sources.push([src, reading]);
        }
        if (!sources.length) continue;
        const svRange = findSvRangeHe(svText, viennaWords, segStart, segEnd);
        pushAt(attachWord, { sv: svText, sv_range: svRange, suffix, sources });
    }

    for (const e of erfurtEntries) {
        if (e.raw_text !== undefined) { pushAt(e.attach, { raw: e.raw_text }); continue; }
        pushAt(e.attach, { sv: e.sv, sv_range: e.sv_range, suffix: "", sources: e.sources });
    }

    const mergedAt = new Map();
    for (const [pos, lst] of entriesAt) mergedAt.set(pos, _mergeEntriesAtPositionHe(lst));
    return { viennaWords, mergedAt };
}

const ECLECTIC_FULL_WITNESSES = new Set(["א", "ד", "ל"]);

// Recognize apparatus shorthand meaning "the word is absent in this witness":
// ח' / ח׳ (with apostrophe or geresh), חסר, or a count modifier like "2 ח'".
// Not a literal textual reading — the lemma simply doesn't appear.
function isOmissionMarker(text) {
    const t = String(text || "").replace(/<[^>]+>/g, "").trim().replace(/[׳']/g, "'");
    if (!t) return false;
    if (t === "חסר") return true;
    if (/^\d*\s*ח'$/.test(t)) return true;
    if (/^ח'\s*\(.*\)$/.test(t)) return true; // e.g. "ח' (אסור)" — still primarily an omission marker
    return false;
}

// Returns the first alternate reading that meets the eclectic-swap rule:
// - affirmingWitnesses is empty (Vienna alone supports the body)
// - the alt's witnesses include ≥2 non-fragmentary sigla (א/ד/ל)
// - ב is not among the alt's witnesses
// - the reading isn't a paragraph_break notation
// - lemma is a single word (no ellipsis, no spaces)
// Returns null if no swap should be performed.
function findEclecticSwap(sv, vars, affirmingWitnesses) {
    if (affirmingWitnesses) return null;
    if (!Array.isArray(vars) || vars.length === 0) return null;
    if (!sv || !sv[0]) return null;

    const lemma = String(sv[0]).trim();
    if (!lemma || lemma.includes("…")) return null;
    if (lemma.split(/\s+/).length !== 1) return null;

    for (const [witStr, varText] of vars) {
        const stripped = String(varText || "").replace(/<[^>]+>/g, "").trim();
        if (!stripped) continue;
        if (/^(פתוח|סתום)(\s+(פתוח|סתום))*$/.test(stripped)) continue;

        const wits = String(witStr || "").trim().split(/\s+/).filter(Boolean);
        if (wits.includes("ב")) continue;
        const fullCount = wits.filter(w => ECLECTIC_FULL_WITNESSES.has(w)).length;
        if (fullCount < 2) continue;

        return { lemma, altText: stripped, altWitnesses: witStr, isOmission: isOmissionMarker(varText) };
    }
    return null;
}

function parseNote3(noteTxt, loc = null) {
    let note = String(noteTxt || "");

    if (note === '<b>לוחות </b>| <big>פ</big>. לחת.') {
        note = '<b>לוחות </b>| <big>פ</big> לחת.';
    }

    const type = parseNoteType(note);
    if (type === "SN") {
        const splitIndex = note.indexOf("|");
        if (splitIndex === -1) {
            return [note];
        }

        const svRaw = note.slice(0, splitIndex).trim();
        const body = note.slice(splitIndex + 1).trim();

        if (!body) {
            return [note];
        }

        const sv = parseSv(svRaw);
        const vars = parseVars(body, loc);
        return [sv, vars];
    }

    if (type === "CH") {
        const splitIndex = note.indexOf("|");
        if (splitIndex === -1) {
            return [note];
        }

        const svRaw = note.slice(0, splitIndex).trim();
        let body = note.slice(splitIndex + 1).trim().replace(/\.\.\./g, "…");

        const firstPeriod = body.indexOf(".");
        if (firstPeriod === -1) {
            return [note];
        }

        const affirmingRaw = body.slice(0, firstPeriod).trim();
        body = body.slice(firstPeriod + 1).trim();

        if (!body) {
            return [note];
        }

        if (!body.includes("<big>")) {
            body = body.replace(/ב<big>/g, "<big>");
        }

        if (!body.includes("<big>")) {
            return [note];
        }

        const sv = parseSv(svRaw);

        const witnessMatches = [...affirmingRaw.matchAll(/<big>(.)<\/big>/g)].map(match => match[1]);
        let affirming;
        if (witnessMatches.length === 0) {
            affirming = affirmingRaw.replace(/^(כ"ה|כ״ה|כ''ה|כ׳׳ה)\s*/, "").trim();
        } else {
            affirming = witnessMatches.join(" ");
        }

        const vars = parseVars(body, loc);
        return [sv, vars, affirming];
    }

    return [note];
}

const gimatriot = {
    "א": 1, "ב": 2, "ג": 3, "ד": 4, "ה": 5,
    "ו": 6, "ז": 7, "ח": 8, "ט": 9, "י": 10,
    "כ": 20, "ל": 30, "מ": 40,
    "נ": 50, "ס": 60, "ע": 70, "פ": 80,
    "צ": 90, "ק": 100, "ר": 200,
    "ש": 300, "ת": 400, "א׳": 1000
};

const by_values = Object.keys(gimatriot).sort((a, b) => gimatriot[b] - gimatriot[a]);

const inverse = Object.fromEntries(
    Object.entries(gimatriot).map(([k, v]) => [v, k])
);

function convert_number(integer) {
    if (integer === 0) {
        return "0";
    }

    if (inverse[integer]) {
        return inverse[integer];
    }

    let output = "";
    let remainder = integer;

    while (remainder > 0) {
        for (const value of by_values) {
            if (remainder === 15) {
                output += "טו";
                return output;
            }
            if (remainder === 16) {
                output += "טז";
                return output;
            }

            if (gimatriot[value] <= remainder) {
                remainder -= gimatriot[value];
                output += value;
                break;
            }
        }
    }

    return output;
}

// --- Commentary anchoring (Tosefta Kifshuta, Brief Commentary) ---------------
//
// Both commentaries are Sefaria JSON shaped text[chapter][halakhah][note], each
// note opening with a dibbur hamatchil in <b>...</b> that quotes the passage
// being commented on. We re-anchor every note to a base-word index by matching
// that quote against our own text, rather than trusting the JSON's halakhah
// index -- because that index is not reliable. Measured over all 33 tractates:
// 646 of the Brief Commentary's 6,246 notes (10.4%) sit in a different halakhah
// than their index claims, with an accumulating forward drift (+1, +2, +3, +5),
// while Kifshuta drifts for only 98 of 14,657. Matching the DH across the whole
// chapter fixes all of them and lifts the word-anchor rate from 92.6% to 99.9%
// (Brief) and 99.5% to 99.7% (Kifshuta).
//
// Notes whose DH doesn't resolve (53 of 20,903 -- mostly a DH quoting a reading
// the commentator is emending away from, e.g. Ketubot 9:6 "שכרה" where the note
// itself says צ"ל: שברה) keep a halakhah-scoped anchor. That's a first-class
// case in the shared address model, not a failure.

// A DH elides the rest of the quoted passage with וכו'; everything after that
// is not text to match, and neither is the printer's closing period, editorial
// brackets, or a paraphrase following a comma.
const DH_ETC_RE = /(?:\s|^)(?:וכו|וכר|וכול)['׳]?\.?\s*$/;

function parseCommentaryDH(noteHtml) {
    const m = /<b>([\s\S]*?)<\/b>/.exec(String(noteHtml || ""));
    if (!m) return null;
    let dh = m[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    dh = dh.replace(/[.:]\s*$/, "").trim();
    dh = dh.replace(/[\[\]()]/g, " ").trim();
    dh = dh.replace(DH_ETC_RE, "").trim();
    dh = dh.split(",")[0].trim();
    dh = dh.replace(DH_ETC_RE, "").trim();
    const words = tokenizeHe(dh);
    return words.length ? words : null;
}

// The chapter's body words as one flat stream, with each position's halakhah
// and chapter-wide base index. Same tokenization as computeChapterWordIndex, so
// the indices are the same currency the witness alignment and manuscript-image
// data speak.
function buildChapterWordStream(textPerek) {
    const words = [];
    const halOf = [];
    textPerek.forEach((halakhaHtml, hi) => {
        tokenizeHe(halakhaHtml.replace(MARKER_SPLIT_RE, " ")).forEach(w => {
            words.push(w);
            halOf.push(hi);
        });
    });
    return { words, halOf };
}

// First position >= `from` where `needle` matches consecutively, by wordsMatchHe
// (so kitzur, haser/maleh and prefix differences don't break a match).
function findWordRunHe(haystack, needle, from) {
    const limit = haystack.length - needle.length;
    for (let i = Math.max(0, from || 0); i <= limit; i++) {
        let ok = true;
        for (let k = 0; k < needle.length; k++) {
            if (!wordsMatchHe(haystack[i + k], needle[k])) { ok = false; break; }
        }
        if (ok) return i;
    }
    return -1;
}

// Anchor one chapter's commentary notes. Notes are in printed order, so a
// forward-only cursor disambiguates a DH whose words recur later in the chapter
// -- which is why the ordered rules carry ~98% of matches on their own. The
// restart rules exist for the handful of notes that genuinely refer backwards.
//
// Returns entries sorted by position, each:
//   { id, chapter, halakhah, baseIdx, endIdx, dh, html, lineRef, sourceHalakhah }
// with baseIdx null when only the halakhah is known.
function anchorCommentaryChapter(commentaryChapter, textPerek, chapterIndex, idPrefix) {
    const { words, halOf } = buildChapterWordStream(textPerek);
    const entries = [];
    let cursor = 0;
    let seq = 0;

    (commentaryChapter || []).forEach((halakhaNotes, sourceHal) => {
        (halakhaNotes || []).forEach(noteHtml => {
            const id = `${idPrefix}-${chapterIndex}-${sourceHal}-${seq++}`;
            const dh = parseCommentaryDH(noteHtml);
            let at = -1;
            let len = 0;
            if (dh) {
                at = findWordRunHe(words, dh, cursor);
                len = dh.length;
                if (at < 0) { at = findWordRunHe(words, dh, 0); }
                if (at < 0 && dh.length > 1) { at = findWordRunHe(words, [dh[0]], cursor); len = 1; }
                if (at < 0 && dh.length > 1) { at = findWordRunHe(words, [dh[0]], 0); len = 1; }
            }
            const resolved = at >= 0;
            if (resolved) cursor = at;
            entries.push({
                id,
                chapter: chapterIndex,
                // Where the note actually belongs, which is where its DH landed
                // -- not necessarily where the source JSON filed it.
                halakhah: resolved ? halOf[at] : sourceHal,
                sourceHalakhah: sourceHal,
                baseIdx: resolved ? at : null,
                endIdx: resolved ? at + len - 1 : null,
                dh: dh ? dh.join(" ") : null,
                html: stripCommentaryLineRef(noteHtml),
                lineRef: commentaryLineRef(noteHtml),
            });
        });
    });

    entries.sort((a, b) => {
        if (a.halakhah !== b.halakhah) return a.halakhah - b.halakhah;
        if (a.baseIdx == null && b.baseIdx == null) return 0;
        if (a.baseIdx == null) return -1;
        if (b.baseIdx == null) return 1;
        return a.baseIdx - b.baseIdx;
    });
    return entries;
}

// Kifshuta notes may open with a printed-LINE reference -- "7." or "10-11." --
// referring to line numbers of the Tosefta text in the JTS edition, NOT to a
// note number. They restart per chapter, are monotonic, appear on only ~2/3 of
// notes (an unnumbered note continues the previous printed line), and their
// maxima exceed the note count. Kept as metadata and shown as a citation, never
// rendered as if it numbered the note.
const COMMENTARY_LINE_REF_RE = /^\s*<small>(\d+(?:[-–]\d+)?)\.<\/small>\s*/;

function commentaryLineRef(noteHtml) {
    const m = COMMENTARY_LINE_REF_RE.exec(String(noteHtml || ""));
    return m ? m[1] : null;
}

function stripCommentaryLineRef(noteHtml) {
    return String(noteHtml || "").replace(COMMENTARY_LINE_REF_RE, "");
}

// Anchor a whole tractate, lazily per chapter: Kifshuta is ~600KB per tractate
// and up to 1,349 notes, and a reader looking at chapter 1 shouldn't pay to
// align chapter 12.
function createCommentaryIndex(commentaryData, textData, idPrefix) {
    const byChapter = new Map();
    return {
        get title() { return commentaryData.heTitle || commentaryData.title || idPrefix; },
        chapter(chapterIndex) {
            if (!byChapter.has(chapterIndex)) {
                const commChapter = (commentaryData.text || [])[chapterIndex];
                const textPerek = (textData.text || [])[chapterIndex];
                byChapter.set(chapterIndex, (commChapter && textPerek)
                    ? anchorCommentaryChapter(commChapter, textPerek, chapterIndex, idPrefix)
                    : []);
            }
            return byChapter.get(chapterIndex);
        },
    };
}

// --- OCR'd commentary anchoring (Chasdei David, Tekhelet Mordechai) ---------
//
// These arrive page-shaped rather than halakhah-shaped: each note carries the
// lemma the chunker cut it at, plus the ref of the PAGE it sits on -- and a
// page's ref names where the page starts, while its commentary runs on into the
// following halakhot (the very assumption behind comment_chunk_lib's
// DEFAULT_FORWARD_WINDOW). So notes are placed by matching their lemma forward
// from the ref'd halakhah, the same "trust the lemma, not the filed location"
// approach the Lieberman commentaries need.
//
// Differences from the Lieberman path, all consequences of this being OCR:
//   - the lemma is a chunker guess, not an authored dibbur hamatchil, and only
//     ~51% (Chasdei David) / ~36% (Tekhelet Mordechai) validated against the
//     text at chunk time. Unvalidated lemmas are still tried here -- this
//     matcher is fuzzier and searches wider than the chunker's local backward
//     match, so it recovers some of them -- but many simply won't place.
//   - the search is bounded below by the page's ref and above by its range end
//     where one is given, because a chunker-guessed lemma is far likelier to be
//     a common word that could match anywhere.
//
// A note whose lemma doesn't place keeps a halakhah-scoped anchor (or
// chapter-scoped, for Seder Taharot pages whose running headers cite no
// halakhah at all). That is a first-class case, not a failure.

// How far past the page's ref a lemma may be sought, in halakhot. Mirrors
// comment_chunk_lib's DEFAULT_FORWARD_WINDOW, which is the assumption the
// chunking was done under: a page's commentary covers its ref'd halakhah and a
// handful after. Bounding this is a correctness matter as much as a speed one --
// a chunker-guessed lemma is often a common word, and an unbounded chapter-wide
// search will cheerfully match one 30 halakhot away.
const OCR_FORWARD_WINDOW = 10;

// Exact-normalized key for the candidate index: Hebrew letters only, final
// letters folded. Words that wordsMatchHe would equate can still key
// differently (haser/maleh, prefixes), which is why the fuzzy scan remains as a
// fallback -- the index just spares us running it at every position.
function ocrIndexKey(word) {
    return String(word || "")
        .replace(/<[^>]+>/g, "")
        .replace(/[^\u05D0-\u05EA]/g, "")
        .replace(/[ךםןףץ]/g, c => ({ 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' })[c]);
}

// Two indexes over the chapter's words: exact normalized keys, and
// matres-lectionis-reduced keys. A lemma is looked up by a handful of derived
// keys rather than scanned for.
//
// The linear fuzzy scan this replaced was correct but unusably slow -- 13.5s to
// place one tractate's 1,442 notes, because a note that will never place costs
// a full window of wordsMatchHe calls, and most OCR lemmas never place. Keyed
// lookup gets the same recall on what wordsMatchHe actually catches here
// (haser/maleh and single-letter prefixes) for a few Map hits per note.
function buildWordPositionIndex(words) {
    const exact = new Map();
    const reduced = new Map();
    const add = (map, key, i) => {
        if (!key) return;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(i);
    };
    words.forEach((word, i) => {
        const key = ocrIndexKey(word);
        add(exact, key, i);
        const red = removeInternalMatres(key);
        if (red !== key) add(reduced, red, i);
    });
    return { exact, reduced };
}

// Candidate positions for a lemma's first word: the word itself, the same word
// with a one-letter prefix added or removed, and its matres-reduced form.
function ocrCandidatePositions(positions, word) {
    const key = ocrIndexKey(word);
    if (!key) return [];
    const keys = new Set([key]);
    PREFIXES.forEach(pre => {
        keys.add(pre + key);
        if (key.length > 2 && key[0] === pre) keys.add(key.slice(1));
    });
    const out = new Set();
    keys.forEach(k => {
        (positions.exact.get(k) || []).forEach(i => out.add(i));
    });
    const red = removeInternalMatres(key);
    (positions.reduced.get(red) || []).forEach(i => out.add(i));
    (positions.exact.get(red) || []).forEach(i => out.add(i));
    return [...out].sort((a, b) => a - b);
}

// Which texts a lemma may be matched against, in priority order.
//
// Both these commentaries are 18th/19th-century and were written against the
// PRINTED Tosefta rather than Codex Vienna, so it's a reasonable guess that
// their lemmas would match our ד (defus) witness better than our
// Lieberman/Vienna base text -- and the witness is stored positionally, one slot
// per base word index, so a match in it IS a baseIdx needing no mapping back.
//
// Measured, though, the guess doesn't pay as a PRIMARY surface. Trying print
// first moved 1,981 of Chasdei David's notes (11% of those placed) to a
// different position, median 61 words away -- and judged against the page's own
// cited halakhah, which is evidence independent of both surfaces, the base-text
// placement was the nearer one twice as often (44.5% vs 21.4%). Our matcher is
// already tolerant of the orthographic differences that separate the two texts,
// so the print witness mostly offers alternative positions for words that were
// matchable anyway, and its nulls and variants let it reach spurious ones.
//
// So: base text first, print witness only as a fallback for what the base text
// cannot place at all. That keeps the ~200 notes only the print witness can
// place and relocates nothing.
function ocrMatchSurfaces(words, printWords) {
    const surfaces = [{ name: 'base', words, positions: buildWordPositionIndex(words) }];
    if (printWords && printWords.length === words.length) {
        surfaces.push({ name: 'print', words: printWords, positions: buildWordPositionIndex(printWords) });
    }
    return surfaces;
}

// The ד witness's words for one chapter, or null when this tractate has no
// witness alignment (or no print witness in it).
function printWitnessWordsForChapter(witnessData, chapterIndex) {
    const chapter = witnessData && witnessData.chapters && witnessData.chapters[chapterIndex];
    const witness = chapter && chapter.witnesses && chapter.witnesses['ד'];
    return (witness && Array.isArray(witness.words)) ? witness.words : null;
}

function anchorOcrCommentaryChapter(notes, textPerek, chapterIndex, idPrefix, printWords) {
    const { words, halOf } = buildChapterWordStream(textPerek);
    const { ranges } = computeChapterWordIndex(textPerek);
    const surfaces = ocrMatchSurfaces(words, printWords);
    const entries = [];
    let cursor = 0;
    let seq = 0;

    (notes || []).forEach(note => {
        const id = `${idPrefix}-${chapterIndex}-${seq++}`;
        const hal = note.hal;
        const floorRange = (hal != null && ranges[hal]) ? ranges[hal] : null;
        const floor = floorRange ? floorRange[0] : 0;
        const endHal = note.halEnd != null ? note.halEnd : hal;
        // Without a ref'd halakhah (a chapter-scoped page ref, as all of Seder
        // Taharot is) the whole chapter is in bounds; there's nothing narrower
        // to go on.
        let ceiling = words.length;
        if (endHal != null) {
            const lastHal = Math.min(endHal + OCR_FORWARD_WINDOW, ranges.length - 1);
            if (ranges[lastHal]) ceiling = ranges[lastHal][1];
        }

        const lemmaWords = note.lemma ? tokenizeHe(note.lemma) : null;
        let at = -1, len = 0, matchedOn = null;
        if (lemmaWords && lemmaWords.length) {
            const from = Math.max(cursor, floor);
            // Fast path: only positions where the lemma's first word occurs
            // exactly-normalized, verifying the rest fuzzily.
            const indexed = (surface, start, needle) => {
                const candidates = ocrCandidatePositions(surface.positions, needle[0]);
                for (const i of candidates) {
                    if (i < start) continue;
                    if (i + needle.length > ceiling) break;
                    let ok = true;
                    for (let k = 1; k < needle.length; k++) {
                        if (!wordsMatchHe(surface.words[i + k], needle[k])) { ok = false; break; }
                    }
                    if (ok) return i;
                }
                return -1;
            };
            // Prefer a full-lemma match at or after the cursor; then anywhere in
            // the window; only then settle for the first word alone. Within each
            // of those, the base text is tried before the print witness -- see
            // ocrMatchSurfaces for why that order and not the reverse.
            const needles = lemmaWords.length > 1
                ? [lemmaWords, lemmaWords, [lemmaWords[0]], [lemmaWords[0]]]
                : [lemmaWords, lemmaWords];
            const starts = lemmaWords.length > 1
                ? [from, floor, from, floor]
                : [from, floor];
            for (let a = 0; a < needles.length && at < 0; a++) {
                for (const surface of surfaces) {
                    const found = indexed(surface, starts[a], needles[a]);
                    if (found >= 0) { at = found; len = needles[a].length; matchedOn = surface.name; break; }
                }
            }
        }

        const resolved = at >= 0;
        if (resolved) cursor = at;
        entries.push({
            id,
            chapter: chapterIndex,
            halakhah: resolved ? halOf[at] : (hal != null ? hal : null),
            sourceHalakhah: hal,
            baseIdx: resolved ? at : null,
            endIdx: resolved ? at + len - 1 : null,
            lemma: note.lemma || null,
            // Whether the chunker had already validated this lemma against the
            // text. Kept because it says how much to trust the note's cut, which
            // is a different question from whether we could place it.
            lemmaValidated: !!note.v,
            // Which text the lemma actually matched -- 'print' means it matched
            // the defus witness where our base text differs, which is worth
            // surfacing to a reader comparing the commentator's Vorlage.
            matchedOn,
            text: note.text,
            // Page index in the volume scan, not the printed page -- see the
            // exporter. Carried for linking back to the scan, not for citation.
            scanPage: note.scanPage,
            volume: note.vol,
        });
    });

    // Order for reading. An unplaced note keeps the position of the last note
    // placed BEFORE it in the printed commentary, so the two interleave in the
    // order Pardo wrote them. Sorting unplaced notes to the front instead (the
    // obvious reading of "no position") buried every anchored note behind the
    // ~39% that don't place, which is precisely backwards.
    let lastPlaced = -1;
    entries.forEach((entry, i) => {
        if (entry.baseIdx != null) lastPlaced = entry.baseIdx;
        entry.readingOrder = i;
        entry.sortIdx = entry.baseIdx != null ? entry.baseIdx : lastPlaced;
    });
    entries.sort((a, b) => {
        const ah = a.halakhah == null ? -1 : a.halakhah;
        const bh = b.halakhah == null ? -1 : b.halakhah;
        if (ah !== bh) return ah - bh;
        if (a.sortIdx !== b.sortIdx) return a.sortIdx - b.sortIdx;
        return a.readingOrder - b.readingOrder;
    });
    return entries;
}

// Lazily anchor one tractate's OCR commentary, a chapter at a time. Chasdei
// David runs to ~1,700 notes in a tractate, and a reader in chapter 1 shouldn't
// pay for chapter 20.
function createOcrCommentaryIndex(commentaryData, textData, idPrefix, witnessData) {
    const byChapter = new Map();
    const notesByChapter = new Map();
    (commentaryData.notes || []).forEach(note => {
        if (!notesByChapter.has(note.ch)) notesByChapter.set(note.ch, []);
        notesByChapter.get(note.ch).push(note);
    });
    return {
        get title() { return commentaryData.heTitle || commentaryData.title || idPrefix; },
        chapter(chapterIndex) {
            if (!byChapter.has(chapterIndex)) {
                const textPerek = (textData.text || [])[chapterIndex];
                const notes = notesByChapter.get(chapterIndex);
                byChapter.set(chapterIndex, (textPerek && notes)
                    ? anchorOcrCommentaryChapter(
                        notes, textPerek, chapterIndex, idPrefix,
                        printWitnessWordsForChapter(witnessData, chapterIndex))
                    : []);
            }
            return byChapter.get(chapterIndex);
        },
    };
}
