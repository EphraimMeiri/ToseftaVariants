# Variant classification

How `classifyVariantPair` (tosefta_parsing_tools.js) decides what kind of
difference a witness reading is, and how the data-driven parts are maintained.
The classifier runs live in the viewer (index.html) and at build time for the
otzar (generate_otzar_data.js), so all of its knowledge must be embedded in
tosefta_parsing_tools.js — the generated constants below are snapshots of
corpus evidence, each with a regeneration path.

Related pipeline: the witness-alignment classifier in the sefaria-tosefta repo
(`common/variant_classifier.py`) is this classifier's sibling. Several rules
here were ported from it after comparing both against corpus frequency stats;
where the two deliberately diverge it is noted below.

## Categories

| category | Hebrew | default | meaning |
|---|---|---|---|
| `major` | שוני מהותי | visible | substantive variant, needs a reader |
| `routine` | חילופים שגרתיים | visible | corpus-mined habitual swap (see below) |
| `other_minor` | שינויים בינוניים | visible | prefixes, word order, numerals |
| `citation_scope` | היקף ציטוט | visible | how much of a verse is quoted |
| `name_orthography` | כתיב שמות | visible | rabbi-name spelling |
| `minor` | חילופי אותיות | hidden | known letter swaps (ת/ה, ה/ן, א/ה final…) |
| `minor_orthography` | כתיב חלופי | hidden | matres, abbreviations, phonetic spelling |
| `paragraph_break` | ציוני פתוח/סתום | — | paratextual, not a variant |

"Hidden" means the default filter state in the viewer; everything is
toggleable, and hidden variants can be revealed marked.

## Rule order (summary)

1. Normalization: markup, niqqud/cantillation, and stray edge punctuation are
   stripped (edge parens only when no interior paren remains — in
   `(אסור) מותר` the paren is apparatus notation). Pairs identical after
   normalization → "niqqud/punctuation only".
2. Paratext: standalone פתוח/סתום readings are paragraph breaks, not variants.
3. Omission markers: ח' / חסר mean the word is absent in the witness → major
   omission — except when the base reading is itself a citation-continuation
   marker (וגו' etc.), which is `citation_scope`.
4. Citation scope, fixed orthography pairs, letter swaps (אי/יי, ת/ה final,
   ה/ן final, א/ה final), abbreviations (kitzur), haser/maleh, rabbi names.
5. Single-word pairs: routine swaps, then phonetic-spelling clusters, then
   numerals (ה'/חמשה), then multi-particle prefix deltas.
6. Word-order differences.
7. Everything else → major.

## Corpus-derived rules

### Routine swaps (`ROUTINE_SWAP_PAIRS`, 165 pairs)

Word pairs that recur ≥10 times across ≥5 tractate×witness contexts in the
witness alignments — mined by `sota_project/mine_standard_swaps.py` in the
sefaria-tosefta repo into `common/standard_swaps.json`, hand-copied here.
"Routine" means *statistically transmission noise*, not meaning-free: the list
includes הוא/היא, לו/לי, אחד/אחר. That is why the category is **visible by
default** — it labels, it does not hide. To refresh after re-mining, copy the
"pairs" list from standard_swaps.json into the constant (bare forms: letters
only, finals normalized, sorted, joined with `|`).

### Phonetic-spelling clusters (`PHONETIC_SPELLING_PAIRS`, generated)

Loanwords and other spelling-fluid words (האיסטבא/האיצטבא/האצטבה,
סימכוס/סומכוס, אלונטית/אילנתית) vary simultaneously in sibilants, matres, and
final א/ה, so no single-letter rule catches them. The test has two parts:

1. **Skeleton equivalence** — equal after: final א/ה fold, phonetic consonant
   folds at non-final positions (צ→ס, ת→ט, ק→כ, ע→א), interior matres
   stripped. The final letter is never folded (otherwise ונתגלה ≡ ונתגלע via
   ע→א→ה chaining).
2. **Cluster certification** — the pair's spelling cluster (connected
   component over skeleton-equal pairs that actually occur as variants *of
   each other* in the apparatus) must contain **≥3 co-attested forms**.
   Three-plus attested spellings is the signature of a word with no fixed
   spelling; two lexemes that merely sound alike never build such a cluster.

Regenerate with `node generate_phonetic_pairs.js` — it rebuilds the constant
in place from data/variants/ (markers: `BEGIN/END GENERATED:
PHONETIC_SPELLING_PAIRS`). Its `BLOCKED_PAIRS` list removes known
distinct-lexeme and binyan-voice pairs (קירות/קורות, מכיר/מכור,
נותנין/ניתנין, ניטלין/נוטלין) as *edges*, so they neither classify as
phonetic nor certify a cluster. When a conflation is spotted in the wild, add
it there and rerun. Pairs on both the routine and phonetic lists (נוטל/ניטל)
classify as routine — the visible label wins over the hidden one.

## Measured design decisions (do not re-litigate without data)

These were tested against the full apparatus (~36,800 unique pairs, ~65,600
occurrences) in Aug 2026:

- **Blanket letter-fold rules are unsafe.** Every frequency-attested pattern
  (ס/ש, ס/צ, א/ע, ה/ח, ד/ר, same-slot ו/י) mixes spelling habit with real
  lexical difference at high rates: השוטות/הסוטות, סיידין/ציידין,
  קירות/קורות, בתו/בנו, אל/על. The sefaria-tosefta miner reaches the same
  conclusion — it emits letter *patterns* only as diagnostics and feeds only
  exact word *pairs* to its classifier.
- **Spelling census by skeleton is anti-evidence.** Counting distinct
  spellings per skeleton across the corpus fakes fluidity through skeleton
  collisions (קירות's "cluster" contained כוורת; אוצרין's contained אוסרין).
  Only co-attestation as variants of each other counts.
- **Stacked minor operations were rejected**: matres + final ת/ה captures
  singular/plural (בברכה/בברכות, שורה/שורות); matres + final א/ה lets
  שהיה/שהוא through. The one allowed stack remains haser/maleh + final ם/ן.
- **Final א/ה alone is safe** (Aramaic-style ending, ממחא/ממחה) — except the
  היא/היה family (pronoun vs verb), excluded with or without leading
  particles.
- **The abbreviation + haser/maleh path needs a ≥3-letter stem** after matres
  stripping — below that it matched אפי'/אפולו, a real lexical difference.
- A word pair with only **two** attested spellings under phonetic folding
  (קרסטלין/קרצטלין) stays major on purpose; it graduates automatically when a
  third spelling enters the data.

## Sigla and data notes

- פ is the Masoretic verse text, not a witness; ג and ש are fragmentary
  (see sefaria-tosefta SIGLA_CONVENTIONS.md).
- Standalone פתוח/סתום readings record manuscript paragraphing.
- ח'/חסר = the word is absent in this witness (omission), not a literal
  reading; the eclectic-text swap renders it as strikethrough.
