const url1 = "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/json/Tosefta/Lieberman%20Edition/";
const url2 = "%20(Lieberman)/Hebrew/The%20Tosefta%20according%20to%20to%20codex%20Vienna.%20Third%20Augmented%20Edition%2C%20JTS%202001.json";
const variant_url1 = "https://raw.githubusercontent.com/Sefaria/Sefaria-Export/master/json/Tosefta/Lieberman%20Edition/Commentary/Variants/";
const variants_url2 = "/Hebrew/The%20Tosefta%20according%20to%20to%20codex%20Vienna.%20Third%20Augmented%20Edition%2C%20JTS%202001.json";

const locations = ["Seder%20Zeraim/Tosefta%20Berakhot","Seder%20Zeraim/Tosefta%20Peah",
     "Seder%20Zeraim/Tosefta%20Demai","Seder%20Zeraim/Tosefta%20Terumot",
     "Seder%20Zeraim/Tosefta%20Sheviit","Seder%20Zeraim/Tosefta%20Kilayim",
     "Seder%20Zeraim/Tosefta%20Maasrot","Seder%20Zeraim/Tosefta%20Maaser%20Sheni",
     "Seder%20Zeraim/Tosefta%20Challah","Seder%20Zeraim/Tosefta%20Orlah",
     "Seder%20Zeraim/Tosefta%20Bikkurim",

     "Seder%20Moed/Tosefta%20Shabbat","Seder%20Moed/Tosefta%20Eruvin","Seder%20Moed/Tosefta%20Pesachim",
    "Seder%20Moed/Tosefta%20Shekalim","Seder%20Moed/Tosefta%20Yoma","Seder%20Moed/Tosefta%20Sukkah",
    "Seder%20Moed/Tosefta%20Beitzah","Seder%20Moed/Tosefta%20Rosh%20Hashanah","Seder%20Moed/Tosefta%20Taanit",
     "Seder%20Moed/Tosefta%20Megillah","Seder%20Moed/Tosefta%20Moed%20Katan","Seder%20Moed/Tosefta%20Chagigah",

    "Seder%20Nashim/Tosefta%20Yevamot","Seder%20Nashim/Tosefta%20Ketubot","Seder%20Nashim/Tosefta%20Nedarim",
    "Seder%20Nashim/Tosefta%20Nazir","Seder%20Nashim/Tosefta%20Sotah","Seder%20Nashim/Tosefta%20Gittin",
    "Seder%20Nashim/Tosefta%20Kiddushin",

    "Seder%20Nezikin/Tosefta%20Bava%20Kamma","Seder%20Nezikin/Tosefta%20Bava%20Metzia","Seder%20Nezikin/Tosefta%20Bava%20Batra"];

function getVariantUrl(location){
    const variantsUrl = variant_url1 + location.replace("Tosefta%20", "Variants%20on%20") + variants_url2;
    return variantsUrl;
}
function getToseftaUrl(location){
    return url1 + location + url2;
}
function getToseftaText(location){
    const url = getToseftaUrl(location);
    return fetch(url).then(response => response.json());
}
function getToseftavariants(location){
    const url = getVariantUrl(location);
    return fetch(url).then(response => response.json());
}
function kitzurFilter(s1, s2) {
    let pos = s1.length;
    if (s1.slice(-1) === "'" && s2.slice(-1) === "'") {
        let pos1 = s1.indexOf("'");
        let pos2 = s2.indexOf("'");
        pos = Math.min(pos1, pos2);
    } else if (s1.slice(-1) === "'") {
        pos = s1.indexOf("'");
    } else if (s2.slice(-1) === "'") {
        pos = s2.indexOf("'");
    } else {
        // No kitzur here
        return [s1, s2];
    }
    s1 = s1.slice(0, pos);
    s2 = s2.slice(0, pos);
    return [s1, s2];
}

function prelimHaserCheck(s1, s2) {
    if (isMN(s1, s2)) {
        return false;
    }
    if (isKitzur(s1, s2)) {
        return false;
    }
    let a = s1[0];
    let b = s2[0];
    a += s1.slice(1, -1).split('').filter(l => l !== 'י' && l !== 'ו').join('');
    b += s2.slice(1, -1).split('').filter(l => l !== 'י' && l !== 'ו').join('');
    if (!((s1.slice(-1) === 'ן' && s2.slice(-1) === 'ם') ||
          (s1.slice(-1) === 'ם' && s2.slice(-1) === 'ן'))) {
        a += s1.slice(-1);
        b += s2.slice(-1);
    }
    [a, b] = kitzurFilter(a, b);
    return a === b;
}
function isVavHaChiburDiff(s1, s2) {
    if (s1[0]==="ו" && s1.substring(1) === s2) {
        return true;
    }
    if (s2[0]==="ו" && s2.substring(1) === s1) {
        return true;
    }
    return false;
}
function isKitzur(s1, s2, verbose = false) {
    if ((s1.includes("'")||s2.includes("'"))
        && (s1.includes(" ") || s2.includes(" "))) {
        ss1 = s1.split(" ");
        ss2 = s2.split(" ");
        if (ss1.length !== ss2.length) {
            return false;
        }else{
            for (let i = 0; i < ss1.length; i++) {
                if ((ss1[i] !== ss2[i])&& (!isKitzur(ss1[i], ss2[i], verbose))) {
                    return false;
                }
                return true;
            }
        }
    }
    if(s1.includes('"')){
        s1a= s1.replace(/"/g, "");
        l1= s1.length-1; // Don't want to include " in the length
        ss2= s2.split(" ");
        l2= ss2.length;
        if (l1 !== l2) {
            return false;
        }else{
            for (let i = 0; i < l1; i++) {
                if (s1a[i] !== ss2[i][0]) {
                    return false;
                }
            }
            return true;
        }
    }if(s2.includes('"')){
        s2a= s2.replace(/"/g, "");
        l2= s2.length-1; // Don't want to include " in the length
        ss1= s1.split(" ");
        l1= ss1.length;
        if (l1 !== l2) {
            return false;
        }else{
            for (let i = 0; i < l2; i++) {
                if (s2a[i] !== ss1[i][0]) {
                    return false;
                }
            }
            return true;
        }
    }
    if (s2[s1.length - 1] === "'" && s2[s1.length - 1] === "'") {
        let pos1 = s1.indexOf("'");
        let pos2 = s2.indexOf("'");
        let pos = Math.min(pos1, pos2);
        if (s1.substring(0, pos) === s2.substring(0, pos)) {
            if (verbose) console.log(s1, s2);
            return true;
        }else{
            console.log("-------",s1.substring(0, pos) , s2.substring(0, pos));
        }
    }
    if (s2[s1.length - 1] === "'") {
        let pos = s2.indexOf("'");
        if (s1.substring(0, pos) === s2.substring(0, pos)) {
            if (verbose) console.log(s1, s2);
            return true;
        }
    } else if (s1[s1.length - 1] === "'") {
        let pos = s1.indexOf("'");
        if (s1.substring(0, pos) === s2.substring(0, pos)) {
            if (verbose) console.log(s1, s2);
            return true;
        }
    }
    return false;
}
function isMN(s1, s2) {
   // Check last char of s1
      if ((s1[s1.length - 1] === 'ם' && s2[s2.length - 1] === 'ן')|| (s1[s1.length - 1] === 'ן' && s2[s2.length - 1] === 'ם')) {
          if (s1.substring(0, s1.length - 1) === s2.substring(0, s2.length - 1)) {
              return true;
          }
        }
    return false;
}
function parseNoteType(noteTxt) {
        if (typeof noteTxt !== 'string') {
        console.error('parseNoteType received non-string input:', noteTxt);
        return NSN;
    }
    noteTxt = noteTxt.replace("</big> <big>", " ");
    let sv, body;
    try {
        [sv, body] = noteTxt.split("| ");
    } catch (error) {
        console.error("parse_note_type Failed on ", noteTxt);
        return null;
    }
    if  (!body) {
        return "NSN";
    }
    if (body.startsWith("<big>")) {
        return "SN";
    } else if (body.startsWith("כ\"ה")) {
        return "CH";
    } else {
        return "NSN";
    }
}

function shiftList(lst, index) {
    for (let n = index; n < lst.length - 1; n++) {
        lst[n] = lst[n + 1];
    }
    return lst.slice(0, -1);
}

function mergeVars(vars) {
    for (let n = 0; n < vars.length - 1; n++) {
        try {
            if (vars[n][1] === " " || vars[n][1] === "") {
                // console.log("Merging", vars[n], vars[n+1]);
                vars[n + 1][0] = vars[n][0] + " " + vars[n + 1][0];
                // vars[n][1] = vars[n+1][1];
                // vars = shiftList(vars, n+1);
            }
        } catch (error) {
            console.log(vars, "Failed on", n);
        }
    }
    const filt = vars.filter(v => v[1].trim() !== "");
    return filt;
}
function isMultiWitness(vars) {
    return (vars.length > 1) || vars[0][0].includes(" ");
}
function parseNote3(noteTxt) {
    const type = parseNoteType(noteTxt);
    if (type === "SN") {
        let [sv, note] = noteTxt.split("| ");
        sv= sv.split("<b>")[1].split("</b>")[0].trim();
        let notes = note.split("<big>");
        notes = notes.filter(n => n !== "\n" && n !== "");
        let vars = notes.map(s => s.split("</big>"));
        vars = mergeVars(vars);
        vars = vars.map(v => [v[0], v[1].trim().split('.')[0]]);
        return [sv, vars];
    } else if (type === "CH") {
        let [sv, note] = noteTxt.split("| ");
        sv= sv.split("<b>")[1].split("</b>")[0].trim();
        let affirming = note.split(".")[0].split();
        return false;
    }
    return null;
}
