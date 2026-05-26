const TOSEFTA_DATA_BASE = "data/tosefta/";
const VARIANTS_DATA_BASE = "data/variants/";

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

    "Seder%20Nezikin/Tosefta%20Bava%20Kamma", "Seder%20Nezikin/Tosefta%20Bava%20Metzia", "Seder%20Nezikin/Tosefta%20Bava%20Batra"
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
const RABBI_NAME_GROUPS = [
    new Set(["אליעזר", "ליעזר", "אלעזר", "לעזר", "אליעז'", "אלעז'"]),
    new Set(["יהודה", "יהוד'", "יהודא", "יהו'"]),
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
    new Set(["יהושע", "יהוש'"]),
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
    const a = normalizeQuotes(stripMarkup(v1)).trim();
    const b = normalizeQuotes(stripMarkup(v2)).trim();

    if (!a && !b) {
        return { category: "skip", confidence: "high", reason: "both empty" };
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

    if (isKitzur(a, b)) {
        return { category: "minor_orthography", confidence: "high", reason: "abbreviation (kitzur)" };
    }

    const aNoMatres = removeInternalMatres(a);
    const bNoMatres = removeInternalMatres(b);
    if ((aNoMatres !== a || bNoMatres !== b) && isKitzur(aNoMatres, bNoMatres)) {
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

    if (a.length === b.length && a.length >= 2) {
        if (PREFIXES.has(a[0]) && PREFIXES.has(b[0]) && a.slice(1) === b.slice(1)) {
            return { category: "other_minor", confidence: "high", reason: `prefix swap: ${a[0]}/${b[0]}` };
        }
    }

    if (Math.abs(a.length - b.length) <= 1 && Math.max(a.length, b.length) <= 8) {
        const longer = a.length >= b.length ? a : b;
        const shorter = a.length >= b.length ? b : a;

        let diffCount = 0;
        let j = 0;

        for (let i = 0; i < longer.length; i++) {
            if (j < shorter.length && longer[i] === shorter[j]) {
                j += 1;
            } else {
                diffCount += 1;
            }
        }

        diffCount += shorter.length - j;

        if (diffCount === 1) {
            return { category: "other_minor", confidence: "medium", reason: "single letter difference" };
        }
    }

    const wordsA = a.split(/\s+/).filter(Boolean);
    const wordsB = b.split(/\s+/).filter(Boolean);
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
