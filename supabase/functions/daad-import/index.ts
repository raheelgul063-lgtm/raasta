// Imports the DAAD International Programmes catalog (all teaching languages) into public.programs.
// Called only by the maintainer's browser with a private token. Curated rows are never overwritten.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = {
  "Access-Control-Allow-Origin": "https://www2.daad.de",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json" } });

const FIELD_RULES: [string, RegExp][] = [
  ["Computer Science / Data Science / AI", /comput|informatic|data|artificial intelligence|\bAI\b|software|machine learning|cyber|information (systems|technology)|digital|web|visual computing/i],
  ["Electrical / Electronics Engineering", /electri|electronic|communication(s)? (engineering|technology)|photonic|optic|embedded|telecommunic|signal|semiconductor|microwave/i],
  ["Mechanical / Mechatronics Engineering", /mechan|mechatron|automotive|aero|space|production|manufactur|automation|robot|material|industrial engineering|vehicle|process engineering|chemical engineering|polymer|textile|maritime|naval|measurement|sensor/i],
  ["Energy / Environment / Civil Engineering", /energy|renewable|environment|civil|water|sustainab|climate|urban|construction|geodesy|geotech|transport|infrastructure|ecolog|forest|resource|mining|structural|hydro|landscape|planning/i],
  ["Business / Management / Economics", /business|management|econom|financ|marketing|\bMBA\b|accounting|logistic|entrepreneur|administration|tourism|supply chain|banking|controlling/i],
  ["Life Sciences / Biotech / Health", /bio|medic|health|pharma|neuro|molecular|life science|nutrition|food|agri|animal|plant|nurs|epidemi|dental|veterinar|horticult|crop|psycholog|sport/i],
  ["Natural Sciences", /physic|chemi|mathemat|astro|geoscien|earth|statistic|geolog|meteorolog|ocean|natural science|quantum/i],
  ["Design / Media / Arts", /design|media|\bart|arts\b|music|film|journalis|photograph|game|fashion|architect|communication|culture|curat|theatre|dance/i],
];
function field(subject: string, name: string) {
  for (const s of [subject || "", name || ""]) for (const [f, re] of FIELD_RULES) if (re.test(s)) return f;
  return "Other";
}

const PRIVATE = /constructor|jacobs|\bSRH\b|IU International|GISMA|Berlin School of Business|EU Business School|Arden|CODE University|Frankfurt School|WHU|ESMT|Hertie|Bucerius|Munich Business School|International School of Management|Steinbeis|HHL|K[uü]hne Logistics|Touro|Macromedia|Fresenius|University of Europe|New European College|Schiller|Lancaster University Leipzig|Hult|ESMOD|Witten\/Herdecke|Hochschule f[uü]r Wirtschaft und Recht|FOM|Accadis|Cologne Business School|Berlin International University|Quadriga|Euro-FH|Kühne|Media Design|Psychologische Hochschule|bbw|Allensbach|Northern Business School|XU Exponential|Digital Business University|Hamburg School of Business|ISM\b|Karlshochschule|Zeppelin|Bard College|Barenboim|Nordakademie|WIN\b/i;
function uniType(academy: string) {
  if (PRIVATE.test(academy)) return "Private university";
  if (/applied sciences|Hochschule|technische hochschule|\bTH\b|\bHS\b|\bHAW\b|University of Technology, Business and Design/i.test(academy) && !/Technische Universit|University of Technology$/i.test(academy)) return "University of Applied Sciences";
  return "University";
}

const CITY_STATE: Record<string, string> = {};
const S: Record<string, string> = {
  "Baden-Württemberg": "Stuttgart Karlsruhe Mannheim Heidelberg Freiburg Tübingen Ulm Konstanz Pforzheim Esslingen Reutlingen Aalen Heilbronn Offenburg Furtwangen Albstadt Sigmaringen Biberach Nürtingen Rottenburg Schwäbisch Gmünd Ludwigsburg Weingarten Ravensburg Kehl Hohenheim Friedrichshafen Lörrach Mosbach Heidenheim Villingen-Schwenningen Göppingen Künzelsau Bad Mergentheim Buchen Tuttlingen Calw",
  "Bavaria": "Munich München Nuremberg Nürnberg Erlangen Würzburg Regensburg Augsburg Bayreuth Bamberg Passau Ingolstadt Landshut Rosenheim Deggendorf Coburg Hof Amberg Weiden Ansbach Kempten Neu-Ulm Aschaffenburg Schweinfurt Eichstätt Freising Weihenstephan Kulmbach Straubing Neubiberg Garching Pfarrkirchen Triesdorf Weißenburg Benediktbeuern Cham Selb Kitzingen Erding Garmisch-Partenkirchen",
  "Berlin": "Berlin",
  "Brandenburg": "Potsdam Cottbus Frankfurt (Oder) Brandenburg an der Havel Eberswalde Wildau Senftenberg Golm",
  "Bremen": "Bremen Bremerhaven",
  "Hamburg": "Hamburg",
  "Hesse": "Frankfurt Frankfurt am Main Darmstadt Kassel Marburg Gießen Giessen Fulda Wiesbaden Friedberg Geisenheim Oestrich-Winkel Rüsselsheim Offenbach Witzenhausen Bad Homburg",
  "Lower Saxony": "Hanover Hannover Göttingen Braunschweig Oldenburg Osnabrück Lüneburg Hildesheim Clausthal-Zellerfeld Wolfenbüttel Wolfsburg Emden Wilhelmshaven Vechta Lingen Hamelin Salzgitter Holzminden Suderburg Buxtehude Elsfleth Leer Göttingen",
  "Mecklenburg-Western Pomerania": "Rostock Greifswald Wismar Stralsund Neubrandenburg Schwerin",
  "North Rhine-Westphalia": "Cologne Köln Bonn Düsseldorf Aachen Münster Bochum Dortmund Duisburg Essen Bielefeld Paderborn Siegen Wuppertal Hagen Gelsenkirchen Krefeld Mönchengladbach Kleve Kamp-Lintfort Rheinbach Sankt Augustin Lemgo Detmold Höxter Iserlohn Soest Meschede Lippstadt Hamm Bocholt Recklinghausen Mülheim an der Ruhr Mülheim Witten Steinfurt Gummersbach Leverkusen Minden Herford Gütersloh Remagen Velbert",
  "Rhineland-Palatinate": "Mainz Kaiserslautern Koblenz Trier Landau Ludwigshafen Bingen Worms Zweibrücken Speyer Vallendar Birkenfeld Pirmasens Idar-Oberstein Remagen",
  "Saarland": "Saarbrücken Homburg",
  "Saxony": "Dresden Leipzig Chemnitz Freiberg Zwickau Mittweida Zittau Görlitz",
  "Saxony-Anhalt": "Halle Halle (Saale) Magdeburg Merseburg Köthen Bernburg Dessau Wernigerode Stendal",
  "Schleswig-Holstein": "Kiel Lübeck Flensburg Heide Wedel Elmshorn",
  "Thuringia": "Jena Erfurt Weimar Ilmenau Nordhausen Schmalkalden",
};
for (const [st, cities] of Object.entries(S)) {
  // multi-word cities first
  for (const c of ["Frankfurt (Oder)", "Brandenburg an der Havel", "Frankfurt am Main", "Halle (Saale)", "Mülheim an der Ruhr", "Sankt Augustin", "Schwäbisch Gmünd", "Bad Mergentheim", "Bad Homburg", "Garmisch-Partenkirchen"]) if (cities.includes(c)) CITY_STATE[c] = st;
  for (const c of cities.split(" ")) if (!CITY_STATE[c]) CITY_STATE[c] = st;
}
CITY_STATE["Frankfurt"] = "Hesse";
function state(city: string) {
  if (!city) return null;
  const first = city.split(",")[0].trim();
  return CITY_STATE[first] || CITY_STATE[first.split(" ")[0]] || null;
}

const MONTHS: Record<string, number> = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
const DATE_RE = /\b(\d{1,2})(?:st|nd|rd|th)?\.?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi;
const pad = (n: number) => String(n).padStart(2, "0");
function deadlines(text: string, intakes: string[]) {
  let t = (text || "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  // Pakistani applicants are non-EU: keep only segments for non-EU / all countries when the text is split by origin
  const segs = t.split(/The following is valid for applicants from:/i).map((x) => x.trim()).filter(Boolean);
  if (segs.length > 1) {
    const keep = segs.filter((x) => /^(non-EU|all countries|international)/i.test(x));
    if (keep.length) t = keep.join(" | ");
  }
  let winter: string | null = null, summer: string | null = null;
  const all: string[] = [];
  let ctx = "";
  let last = 0;
  for (const m of t.matchAll(DATE_RE)) {
    const idx = m.index || 0;
    const before = t.slice(last, idx).toLowerCase();
    if (/summer/.test(before) && (!/winter/.test(before) || before.lastIndexOf("summer") > before.lastIndexOf("winter"))) ctx = "summer";
    else if (/winter/.test(before)) ctx = "winter";
    last = idx + m[0].length;
    const after = t.slice(last, last + 22);
    // start of a range ("16 November - 15 March"): the deadline is the end date
    if (/^\s*(\d{4}\s*)?(-|to|until|and)\s*\d{1,2}\.?\s+[A-Z]/i.test(after)) continue;
    const pre = t.slice(Math.max(0, idx - 14), idx).toLowerCase();
    if (/\bfrom\b|\bopens?\b|\bstarts?\b|\bbeginning\b/.test(pre) && !/\bto\b|\buntil\b|\bby\b|\bdeadline\b/.test(pre)) continue;
    const mm = MONTHS[m[2].toLowerCase()], dd = Number(m[1]);
    if (dd < 1 || dd > 31) continue;
    const v = `${pad(mm)}-${pad(dd)}`;
    all.push(v);
    const which = ctx || (mm >= 1 && mm <= 8 ? "winter" : "summer");
    if (which === "winter" && !winter) winter = v;
    else if (which === "summer" && !summer) summer = v;
  }
  if (!intakes.includes("Winter")) winter = null;
  if (!intakes.includes("Summer")) summer = null;
  return { winter, summer, all };
}

function nonEuFee(text?: string | null): number | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ");
  const m = t.match(/(?:non-EU countries|all countries|international[^:]{0,30})\s*:?\s*([\d.,]+)\s*EUR/i);
  if (!m) return null;
  const n = Number(m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : null;
}
function semFee(text?: string | null): string | null {
  if (!text) return null;
  const m = text.replace(/\s+/g, " ").match(/(approx(?:imately)?\.?\s*)?(?:EUR\s*)?([\d.,]{2,7})\s*(?:EUR|euros?|€)/i) || text.match(/€\s*([\d.,]{2,7})/);
  if (!m) return null;
  const n = m[2] || m[1];
  return `About €${n.replace(/,00$/, "")} per semester`;
}

function clean(s: string | null | undefined, max = 260) {
  if (!s) return null;
  const t = String(s).replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, "") + "…" : t;
}
const okUrl = (u?: string | null) => (u && /^https?:\/\//i.test(u) && !/daad\.de/i.test(u) ? u.slice(0, 500) : null);

function title(name: string, degreeText: string | null, deg: string) {
  const m = (name + " " + (degreeText || "")).match(/\b(M\.?\s?Sc|M\.?\s?A|M\.?\s?Eng|MBA|LL\.?\s?M|M\.?\s?Ed|MFA|MPH|M\.?\s?Mus|B\.?\s?Sc|B\.?\s?A|B\.?\s?Eng|BBA|LL\.?\s?B|Master of [A-Z][a-z]+(?: [a-z]+)? ?[A-Z]?[a-z]*|Bachelor of [A-Z][a-z]+(?: [a-z]+)? ?[A-Z]?[a-z]*)\b\.?/);
  if (m) return m[1].replace(/\s/g, "").replace(/^MSc$/, "M.Sc.").replace(/^MA$/, "M.A.").replace(/^MEng$/, "M.Eng.").replace(/^BSc$/, "B.Sc.").replace(/^BA$/, "B.A.").replace(/^BEng$/, "B.Eng.").replace(/^LLM$/, "LL.M.").replace(/^Masterof/, "Master of ").replace(/^Bachelorof/, "Bachelor of ");
  return deg;
}

function mapCourse(c: any) {
  const deg = c.deg === 1 ? "Bachelor" : "Master";
  const beginning = String(c.beginning || "");
  const intakes = [/winter/i.test(beginning) ? "Winter" : null, /summer/i.test(beginning) ? "Summer" : null].filter(Boolean) as string[];
  const durM = String(c.duration || "").match(/(\d+)/);
  let tuition: number | null = null, tuition_note: string | null = null;
  const tf = String(c.tuition || "");
  if (/no tuition/i.test(tf)) tuition = 0;
  else if (/^[\d.,]+$/.test(tf.trim())) tuition = Math.round(Number(tf.replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".")));
  const fee = nonEuFee(c.d?.tuition);
  if (tuition == null && fee != null) tuition = fee;
  if (tuition == null) tuition_note = clean(c.d?.tuition || tf, 200);
  else if (tuition > 0) tuition_note = "For non-EU students, per semester (DAAD listing)";
  const dl = deadlines(c.d?.periods || c.deadlineList || "", intakes.length ? intakes : ["Winter", "Summer"]);
  const program_url = okUrl(c.course_url) || okUrl((c.reg_links || [])[0]) || null;
  const regs = (c.reg_links || []).map(okUrl).filter(Boolean) as string[];
  const apply_url = regs.find((u) => u !== program_url && /apply|bewerb|application|admission|uni-assist|registration|zulassung|portal|campus|online/i.test(u)) || null;
  const via = clean(c.d?.via, 120);
  const name = clean(c.name, 200) || "Programme";
  return {
    daad_id: Number(c.id),
    university: clean(c.academy, 200) || "Unknown",
    program: name.replace(/\s*\((M\.?Sc|MSc|MA|M\.A\.|M\.Eng\.?|MEng|BA|BSc|B\.Sc\.|B\.A\.|LL\.M\.|MBA)\)\s*$/i, "").trim(),
    degree: deg,
    title: title(name, c.d?.degree || null, deg),
    field: field(c.subject, name),
    city: clean(c.city, 80),
    state: state(c.city),
    type: uniType(String(c.academy || "")),
    language: Array.isArray(c.languages) && c.languages.length ? c.languages.join(" and ") : "English",
    duration: durM ? Number(durM[1]) : null,
    tuition,
    tuition_note,
    semester_fee: semFee(c.d?.semfee),
    intakes,
    deadline_winter: dl.winter,
    deadline_summer: dl.summer,
    deadlines: dl.all.length ? [...new Set(dl.all)] : null,
    deadline_note: clean(c.d?.periods || c.deadlineList, 400),
    english_req: clean(c.d?.english, 180),
    other_req: null,
    apply_via: via && /uni-assist/i.test(via) ? "uni-assist" : "Check program page",
    summary: null,
    url: `https://www2.daad.de/deutschland/studienangebote/international-programmes/en/detail/${Number(c.id)}/`,
    source: "DAAD International Programmes",
    verified_on: new Date().toISOString().slice(0, 10),
    active: true,
    curated: false,
    program_url,
    apply_url,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { data: sec } = await sb.from("app_secrets").select("value").eq("name", "import_token").single();
  if (!sec || typeof body.token !== "string" || body.token !== sec.value) return json({ error: "forbidden" }, 403);

  if (body.action === "finish") {
    // deactivate imported programs that were not seen in this run
    const { data, error } = await sb.from("programs").update({ active: false }).eq("curated", false).lt("verified_on", body.since).select("id");
    if (error) return json({ error: error.message }, 500);
    return json({ deactivated: data?.length || 0 });
  }

  const courses = Array.isArray(body.courses) ? body.courses.slice(0, 200) : [];
  if (!courses.length) return json({ error: "no courses" }, 400);
  const ids = courses.map((c: any) => Number(c.id)).filter(Boolean);
  const { data: cur } = await sb.from("programs").select("daad_id").in("daad_id", ids).eq("curated", true);
  const skip = new Set((cur || []).map((r: any) => r.daad_id));
  const rows = courses.filter((c: any) => !skip.has(Number(c.id))).map(mapCourse);
  if (body.dry) return json({ rows: rows.slice(0, 5) });
  const { error } = await sb.from("programs").upsert(rows, { onConflict: "daad_id" });
  if (error) return json({ error: error.message }, 500);
  // curated rows: just refresh their verified date so they are not treated as stale
  if (skip.size) await sb.from("programs").update({ verified_on: new Date().toISOString().slice(0, 10) }).in("daad_id", [...skip]);
  return json({ upserted: rows.length, skippedCurated: skip.size });
});
