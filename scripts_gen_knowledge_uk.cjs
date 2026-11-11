// Builds ai-knowledge-uk.json from guides_uk.js so the AI knows everything the UK side of the site shows.
// Run after any change to guides_uk.js: node scripts_gen_knowledge_uk.cjs
global.window = {};
require("./guides_uk.js");
const G = window.RAASTA_GUIDES_UK, S = G.scholarships, SITE = "https://raheelgul063-lgtm.github.io/raasta/";
const sch = S.list.map((s) => [
  `### ${s.name} (${s.by}) [Raasta page: ${SITE}#/scholarship?id=${s.id}&country=uk]`,
  `Type: ${s.kind === "Full" ? "fully funded" : "partial"}; levels: ${s.levels.join(", ")}; fields: ${s.fields}`,
  `Pays: ${s.amount}. Covers: ${s.covers.join("; ")}${s.notCovered ? `. Not covered: ${s.notCovered}` : ""}`,
  `Who can apply: ${s.who.join("; ")}`,
  `Documents: ${s.docs.join("; ")}`,
  `How to apply: ${s.steps.join(" > ")}`,
  `Deadline: ${s.deadline}`,
  `Official: ${s.info}${s.apply && s.apply !== s.info ? ` | apply: ${s.apply}` : ""}${s.tip ? `\nTip: ${s.tip}` : ""}`
].join("\n")).join("\n\n");
const V = G.visa;
const text = `UK KNOWLEDGE (checked ${G.checked})

STUDENT VISA FROM PAKISTAN, STEP BY STEP
${V.steps.map((s, i) => `${i + 1}. ${s.t}: ${s.d}`).join("\n")}
${V.note.t}: ${V.note.d}
Biometrics centres: ${V.missions.map((m) => `${m.name} (${m.covers})`).join("; ")}
Money: ${V.money.map(([k, v]) => `${k}: ${v}`).join("; ")}
Raasta visa guide: ${SITE}#/visa-guide?country=uk

SCHOLARSHIPS (checked ${S.checked})
${sch}

How to apply for scholarships: ${S.howto.map(([t, d]) => `${t}: ${d}`).join(" ")}
Documents usually needed: ${S.docs.join("; ")}
Already studying in the UK: ${S.current.map(([t, d]) => `${t}: ${d}`).join(" ")}

STUDENT JOBS
Work rules: ${G.jobs.rules}
Shift apps: ${G.jobs.apps.map((j) => j.name).join(", ")}. Agencies: ${G.jobs.agencies.map((j) => j.name).join(", ")}. Portals: ${G.jobs.portals.map((j) => j.name).join(", ")}.
Tips: ${G.jobs.tips.join(" ")}

MOVING TO THE UK
${G.moving.map((m) => `- ${m.t}: ${m.items.join(" ")}`).join("\n")}

CITIES
${G.cities.map((c) => `- ${c.name} (${c.state}): ${c.vibe} Employers: ${c.employers.slice(0, 5).join(", ")}.`).join("\n")}`;
require("fs").writeFileSync("ai-knowledge-uk.json", JSON.stringify({ updated: G.checked, text }));
console.log("uk knowledge chars", text.length);
