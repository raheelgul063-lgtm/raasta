// Builds supabase/functions/ai/knowledge.ts from guides.js so the AI knows everything the site shows.
global.window = {};
require("./guides.js");
const G = window.RAASTA_GUIDES, S = G.scholarships, SITE = "https://raheelgul063-lgtm.github.io/raasta/";
const sch = S.list.map((s) => [
  `### ${s.name} (${s.by}) [Raasta page: ${SITE}#/scholarship?id=${s.id}]`,
  `Type: ${s.kind === "Full" ? "fully funded" : "partial"}; levels: ${s.levels.join(", ")}; fields: ${s.fields}`,
  `Pays: ${s.amount}. Covers: ${s.covers.join("; ")}${s.notCovered ? `. Not covered: ${s.notCovered}` : ""}`,
  `Who can apply: ${s.who.join("; ")}`,
  `Documents: ${s.docs.join("; ")}`,
  `How to apply: ${s.steps.join(" > ")}`,
  `Deadline: ${s.deadline}. Apply from Pakistan: ${s.fromPk ? "yes" : "usually only once admitted or enrolled in Germany"}. German needed: ${s.german ? "yes" : "not always"}`,
  `Official: ${s.info}${s.apply && s.apply !== s.info ? ` | apply: ${s.apply}` : ""}${s.tip ? `\nTip: ${s.tip}` : ""}`
].join("\n")).join("\n\n");
const unis = Object.entries(S.unis).map(([n, u]) => `- ${n}: ${u.items.join("; ")}. How: ${u.how} Page: ${u.url}`).join("\n");
const cur = S.current.map(([t, d]) => `- ${t}: ${d}`).join("\n");
const jobs = G.jobs ? `Work rules: ${G.jobs.rules}\nShift apps: ${G.jobs.apps.map((j) => j.name).join(", ")}. Agencies: ${G.jobs.agencies.map((j) => j.name).join(", ")}.` : "";
const moving = (G.moving || []).map((m) => `- ${m.t}: ${m.items.join(" ")}`).join("\n");
const cities = (G.cities || []).map((c) => `- ${c.name}: rent ${c.rent}; employers ${c.employers.slice(0, 5).join(", ")}`).join("\n");
const out = `// Generated from guides.js by scripts_gen_knowledge.cjs. Do not edit by hand.
export const KNOWLEDGE = ${JSON.stringify(`SCHOLARSHIPS (checked ${S.checked})

Key rules that decide most eligibility questions:
- Deutschlandstipendium: 300 EUR per month (150 federal, 150 private sponsor), awarded by the university for at least two semesters (one year), renewable. All nationalities, new and current students, Bachelor's and Master's, at participating public and state-recognised universities (including private ones such as HMKW and Macromedia). Funding is only paid within the standard period of study (Regelstudienzeit) of the current degree, so a student in the final semester of the standard period normally cannot receive it, because the next award round starts after their standard period ends. It cannot be combined with another merit scholarship above 30 EUR per month on average; jobs, BAfoeG and need-based help are fine. Selection: grades plus engagement and personal circumstances. Each university runs its own call, usually once a year (HMKW awards every winter semester; applicants and full-time students can apply via studienberatung@hmkw.de).
- DAAD STIBET graduation grants (Studienabschlussbeihilfe / Abschlussstipendium): short grants from a university's International Office for international students in their final phase (often the last 1 to 2 semesters) with good results and financial need. Availability depends on the university, mainly public and state-recognised ones with DAAD STIBET funds. This is the usual option for students who are too late for the Deutschlandstipendium.
- Foundations (Boell, Adenauer, Ebert, Rosa Luxemburg, KAAD) fund for the remaining standard period too, so they also do not help in the very last semester.
- A scholarship award letter that covers the required monthly amount can replace the blocked account for the visa (confirm with the German Mission).

${sch}

Private university scholarships:
${unis}

Already studying in Germany:
${cur}

How to apply in general:
${S.howto.map(([t, d]) => `- ${t}: ${d}`).join("\n")}

Documents usually needed: ${S.docs.join("; ")}

STUDENT JOBS
${jobs}

MOVING TO GERMANY
${moving}

CITIES
${cities}`)};
`;
const text = JSON.parse(out.slice(out.indexOf("=") + 1).trim().replace(/;$/, ""));
require("fs").writeFileSync("ai-knowledge.json", JSON.stringify({ updated: S.checked, text }));
console.log("knowledge chars", out.length);
