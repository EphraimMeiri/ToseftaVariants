function parseNoteType(noteTxt) {
    if (typeof noteTxt !== 'string') {
        console.error('parseNoteType received non-string input:', noteTxt);
        return NSN;
    }
    noteTxt = noteTxt.replace("</big> <big>", " ");

    let sv, body;
    try {
        [sv, body] = noteTxt.split("| ");
        sv= sv.trim();
        body = body.trim();
    } catch (error) {
        console.error("parse_note_type Failed on ", noteTxt);
        return null;
    }
    if (!body) {
        return "NSN";
    } else if (body.startsWith("<big>")) {
        return "SN";
    } else if (body.startsWith("כ\"ה")) {
        return "CH";
    } else {
        console.log("BODY", body)
        console.log("BODY 0-4", body.substring(0, 4));
        console.log("BODY 0-4", JSON.stringify(body.substring(0, 4)));
        return "NSN";
    }
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
    // console.log(vars)
    const filt = vars.filter((v, index) => {
        // console.log(`Filtering element ${index}:`, JSON.stringify(v));
        if (!Array.isArray(v)) {
            console.error(`Element at index ${index} is not an array: .`, v,loc);
            return false;
        }
        if (v.length < 2) {
            console.error(`Element at index ${index} has less than 2 items:`, v,loc,vars);
            return false;
        }
        if (v[1] === undefined) {
            console.error(`Element at index ${index} has undefined second item:`, v,loc,vars);
            return false;
        }
        const result = v[1].trim() !== "";
        // console.log(`Element ${index} result:`, result);
        return result;
    });
    return filt;
}

function parseSv(sv) {
    sv= sv.split("<b>")[1].split("</b>")[0].trim();
    paamMatch = sv.match(/\(."פ\)/);
    numMatch = sv.match(/\<sub\>\d\<\/sub\>/);
                          // <small></small>
    if (paamMatch && numMatch) {
        console.log("BOTH PAAM AND NUM")
        sv1 = sv.slice(0, -17); // skip the space
        sv2= sv.slice(-19);
        sv= [sv1, sv2];
        console.log("ATTEMPT",sv);
    }
    if (paamMatch) {
        sv1 = sv.slice(0, -6); // skip the space
        sv2= sv.slice(-5);
        sv= [sv1, sv2];
    }else if (numMatch) {
        sv1 = sv.slice(0, -9); // skip the space
        sv2= sv.slice(-8);
        sv= [sv1, sv2];
    }else{
        sv= [sv,""];
    }
    return sv;
}
function parseVars(note,loc){
    if (note.includes(`ב<big>`)){
        console.log("Note with ב< format",loc,note);
        note = note.replace(`ב<big>`, `<big>`);
    }
    let notes = note.split("<big>");
    notes = notes.filter(n => n !== "\n" && n !== "");
    let vars = notes.map(s => s.split("</big>"));
    vars = mergeVars(vars);
    vars = vars.map(v => {
        if (v.length < 2 || v[1] === undefined) {
            console.error("ParseVar Error",[loc,note,vars]);
        }
        if(v[1].includes("...")){
            console.log("VAR with ...",loc,note);
            v[1]= v[1].replace("...","…");
        }
        return [v[0], v[1].trim().split('.')[0]];
    });

    return vars;
}
function parseNote3(noteTxt,loc) {
    const type = parseNoteType(noteTxt);
    if (type === "SN") {
        let [sv, note] = noteTxt.split("| ");
        sv= parseSv(sv,noteTxt);
        if(note.includes("(")){
            console.log("SN note with parens", loc,noteTxt);
        }
        vars = parseVars(note);
        // console.log(["SN",sv, vars,noteTxt])
        return [sv, vars];
    } else if (type === "CH") {
        let [sv, note] = noteTxt.split("| ");
        sv= sv.trim();
        note= note.trim();
        sv= parseSv(sv);
        if(note.includes("...")){
            console.log("CH note with ...",loc,note);
            note= note.replace("...","–");
        }
        split_index=note.indexOf(".");
        affirming = note.substr(0,note.indexOf(".")).trim();
        note = note.substr(note.indexOf(".")+1).trim();
        if(note === ""){
            console.log("CH NSN", noteTxt)
            return noteTxt;
        }else if(!note[0]==="<"){
            if (note.includes(`ב<big>`)){
                console.log("CH Note with ב< format",loc,note);
                note = note.replace(`ב<big>`, `<big>`);
            }else{
                console.log("CH NSN", noteTxt)
                return noteTxt;
            }
        }
        // console.log(affirming, note);
        witnessPattern = /\<big\>(.)\<\/big\>/g
        let matches = affirming.match(witnessPattern);
        if(matches === null){
            console.log("CH note with no matches", noteTxt);
            affirming = affirming.split('כ"ה')[1].trim()
        }else{
            if(affirming.includes("(")){
                console.log("CH note with parens", loc,noteTxt);
            }
            affirmed = matches.map(m => m.replace(/<big>(.)<\/big>/, '$1')).join(' ');
        }
        if(!note.includes("<big>")){
            console.log("CH NSN", noteTxt)
            return noteTxt;
        }
        // console.log("CH parsing",[sv,affirming,note,loc])
        vars= parseVars(note,loc) ;
        // console.log(["CH",sv, vars,noteTxt])
        return [sv, vars,affirmed];
    }else if (type === "NSN") {
        console.log("NSN", noteTxt)
        return [noteTxt];
    }
    return null;
}

    function loadJSON(filename) {
      const rawdata = fs.readFileSync(filename);
      return JSON.parse(rawdata);
    }

    function getLocation(loc){
        name = loc[0];
        data = getToseftavariants(name);
        return data.text[loc[1]][loc[2]][loc[3]];
    }

// load file ToseftaVariants/Variants_Berakhot.json
const fs = require('fs');

const data = loadJSON("ToseftaVariants/Variants_Berakhot.json");
// const data = require();
// js = await fetch("ToseftaVariants/Variants_Berakhot.json").then(r => r.json()).then(j => j);
// noteTxt = data.text[0][3][17];
// console.log(noteTxt)
// // let tst= `<b>[דברי] </b>| כ\\"ה <big>ד</big>. <big>א</big> כדברי.`
// console.log(parseNote3(noteTxt))
// noteTxt2= data.text[0][3][16];
// console.log(noteTxt2)
// console.log(parseNote3(noteTxt2))

// Terumot,5,11,9
console.log(noteTxt= data.text[0][3][17]);
console.log(parseNote3(noteTxt,[0,3,17]))