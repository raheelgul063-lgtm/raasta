// Collects UK course facts (name, award, fee, intake, link) from each university's own public website.
// Maintainer-only: protected by the private import token in public.app_secrets. Facts only, always linked back to the source page.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SELF = `${Deno.env.get("SUPABASE_URL")}/functions/v1/uk-import`;
const UA = "Mozilla/5.0 (compatible; RaastaBot/1.0; +https://raheelgul063-lgtm.github.io/raasta/)";
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });

async function get(url: string, ms = 15000): Promise<{ status: number; text: string }> {
  const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xml,*/*" }, signal: ac.signal, redirect: "follow" });
    let text = "";
    if (/\.gz($|\?)/.test(url) && r.body && !/gzip/.test(r.headers.get("content-encoding") || "")) {
      try { text = await new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).text(); } catch { text = ""; }
    } else text = await r.text();
    return { status: r.status, text: text.slice(0, 6_000_000) };
  } catch (e) { return { status: 0, text: String(e).slice(0, 100) }; }
  finally { clearTimeout(t); }
}

async function sitemapUrls(site: string, given?: string[], keep?: RegExp): Promise<{ urls: string[]; files: string[] }> {
  let queue = given?.length ? [...given] : [];
  if (!queue.length) {
    const rb = await get(`${site}/robots.txt`, 8000);
    if (rb.status === 200) queue = [...rb.text.matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);
    if (!queue.length) queue = [`${site}/sitemap.xml`, `${site}/sitemap_index.xml`];
  }
  const seen = new Set<string>(), urls = new Set<string>(), files: string[] = [];
  while (queue.length && seen.size < 80 && urls.size < 300000) {
    const u = queue.shift()!; if (seen.has(u)) continue; seen.add(u);
    const r = await get(u, 20000);
    files.push(`${r.status} ${u}`);
    if (r.status !== 200) continue;
    const locs = [...r.text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/g)].map((m) => m[1].replace(/&amp;/g, "&"));
    if (/<sitemapindex/i.test(r.text)) queue.push(...locs);
    else for (const l of locs) if (!keep || keep.test(l)) urls.add(l);
  }
  return { urls: [...urls], files };
}

const ent = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&pound;/g, "£").replace(/&#163;/g, "£").replace(/&#0?39;|&rsquo;|&apos;/g, "'").replace(/&ndash;|&mdash;|&#821[12];/g, "-").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&[a-z]+;|&#\d+;/g, " ");
const strip = (h: string) => ent(h.replace(/<(script|style|noscript|svg|nav|footer|header)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const PG_AWARD = /\b(MSc|MA|MBA|LLM|MRes|MPH|MFA|MArch|MEd|MMus|MPA|MLitt|MDes|MSW|MClinDent|MChD|MTh|MFin|GDL|MPlan|MLA)\b/;
const UG_AWARD = /\b(BSc|BA|BEng|LLB|BBA|MEng|MSci|MBChB|MBBS|BMus|BArch|BDS|BN|BMBS|MPharm|BVSc|MChem|MPhys|MMath|MComp|BEd|BFA|BDes|BMedSci|MBiol|MOptom|BNurs|BMid)\b/;
const SKIP = /\b(PhD|DPhil|MPhil|PGCE|PGDE|PgCert|PGCert|PgDip|PGDip|Postgraduate (Certificate|Diploma)|Graduate (Certificate|Diploma)|DBA|EdD|DProf|Doctorate|apprenticeship|short course|CPD|distance learning|online|foundation degree|FdA|FdSc|HNC|HND|CertHE|DipHE|top-up|pre-sessional|research degree)\b/i;

function fieldOf(n: string): string {
  const s = n.toLowerCase();
  if (/informatik|wirtschaftsinformatik|medieninformatik|datenwissenschaft|k[üu]nstliche intelligenz|comput|software|data|artificial intelligence|\bai\b|cyber|machine learning|informatics|information (technology|systems)|\bit\b|robotic|games? (dev|prog|tech)|cloud|network|web dev|blockchain|human.computer/.test(s)) return "Computer Science / Data Science / AI";
  if (/elektrotechnik|nachrichtentechnik|energietechnik|mikroelektronik|electr|telecom|embedded|communications engineering|power systems|microelectron|photonic/.test(s)) return "Electrical / Electronics Engineering";
  if (/maschinenbau|mechatronik|fahrzeugtechnik|luft[- ]?und[- ]?raumfahrt|produktionstechnik|werkstoff|verfahrenstechnik|mechanic|mechatronic|automotive|aerospace|aeronaut|manufactur|materials|motorsport|engineering management|industrial eng|product engineering|marine eng|naval/.test(s)) return "Mechanical / Mechatronics Engineering";
  if (/bauingenieur|umwelt|nachhaltig|architektur und stadt|stadtplanung|raumplanung|geod[äa]sie|wasserwirtschaft|civil|energy|environment|sustainab|renewable|climate|construction|structural|water|urban|planning|quantity survey|building|real estate|petroleum|geotech|transport|surveying|oil and gas/.test(s)) return "Energy / Environment / Civil Engineering";
  if (/betriebswirtschaft|volkswirtschaft|wirtschaftswissenschaft|betriebswirt|\bbwl\b|\bvwl\b|管理|handel|logistik|marketing|rechnungswesen|business|management|financ|account|marketing|econom|\bmba\b|banking|logistic|supply chain|entrepreneur|human resource|\bhr\b|commerce|tourism|hospitality|project|investment|fintech|event|leadership|international trade|actuar|insurance|analytics/.test(s)) return "Business / Management / Economics";
  if (/biologie|medizin|pharmaz|psychologie|gesundheit|ern[äa]hrung|pflege|zahnmedizin|biotechnolog|lebensmittel|bio|medic|health|pharm|nurs|neuro|genetic|clinical|nutrition|psycholog|dent|physio|sport|midwif|paramedic|veterin|public health|food|agri|zoolog|anatom|radiograph|optom|cancer|immun|epidemi|social care|occupational therapy|speech|audiolog/.test(s)) return "Life Sciences / Biotech / Health";
  if (/physik|chemie|mathematik|statistik|geowissenschaft|geographie|geologie|physics|chemi|mathemat|statistic|geolog|earth|astro|geograph|ocean|natural science|forensic|meteorolog/.test(s)) return "Natural Sciences";
  if (/design|medien|kunst|musik|architektur|film|gestaltung|kommunikationsdesign|journalis|theater|mode|media|\barts?\b|music|architect|fashion|animation|photograph|journalis|creative|games? (art|design)|illustration|theatre|drama|dance|performance|interior|textile|broadcast|publishing|advertising|visual|curat/.test(s)) return "Design / Media / Arts";
  return "Other";
}

const TITLE_SEP = /\s*[|•·–—]\s*|\s[-:]\s/;
const NOT_A_COURSE = /^(?:studieng(?:a|ä)nge?|studium|studieren|studienangebot|home|startseite|aufbau|kontakt|contact|overview|courses|programmes?|index|men(?:u|ü)|navigation|suche|search|degree programs?|teaching)$/i;
// Many pages put the university's own name, or a section label, in the first heading and
// the course name in a later heading or in the page title. Some (KIT) have no h1 at all.
function courseName(html: string, titleTag: string, uniName: string): string {
  const uniWords = uniName.toLowerCase().replace(/[^a-zäöüß ]/g, " ").split(/\s+/).filter((w) => w.length > 3);
  const isUni = (t: string) => { const low = t.toLowerCase(); return uniWords.length > 0 && uniWords.every((w) => low.includes(w)); };
  const ok = (t: string) => t.length > 3 && t.length < 160 && !isUni(t) && !NOT_A_COURSE.test(t);
  const clean = (t: string) => t.replace(/\s+/g, " ").trim();
  for (const m of html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)) { const t = clean(strip(m[1])); if (ok(t)) return t; }
  let best = "";
  for (const seg of titleTag.split(TITLE_SEP)) { const t = clean(seg); if (ok(t) && t.length > best.length) best = t; }
  return best;
}

type Uni = { name: string; city: string; region: string; type: string; site: string; country?: string };

function parse(html: string, url: string, degree: string, uni: Uni) {
  const h1m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i), tm = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleTag = tm ? strip(tm[1]) : "";
  let h1 = h1m ? strip(h1m[1]) : "";
  if (!h1 || h1.length < 3) h1 = titleTag.split(TITLE_SEP)[0] || "";
  h1 = h1.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!h1 || /page not found|404|not found|access denied|just a moment|error/i.test(h1)) return { skip: "no title" };
  { const better = courseName(html, titleTag, uni.name); if (better) h1 = better.slice(0, 160); }
  const slug = decodeURIComponent(url.split("?")[0].replace(/\/$/, "").split("/").slice(-2).join(" ")).replace(/[-_]/g, " ");
  const hay = `${h1} ${titleTag} ${slug}`;
  if (SKIP.test(`${h1} ${titleTag}`)) return { skip: "not a full degree" };
  const pg = degree === "Master";
  const text = strip(html).slice(0, 400000);
  let aw = (pg ? hay.match(PG_AWARD) : hay.match(UG_AWARD)) || hay.match(new RegExp((pg ? PG_AWARD : UG_AWARD).source, "i"));
  // some sites put the award next to the heading instead of inside it
  if (!aw && !/\b(study|courses?|postgraduate|undergraduate|degrees|subjects?|search|apply|fees|scholarships?)\b/i.test(h1)) aw = text.slice(0, 2500).match(pg ? PG_AWARD : UG_AWARD);
  if (!aw) return { skip: "no award" };
  const canon = (pg ? PG_AWARD : UG_AWARD).source.slice(3, -3).split("|").find((a) => a.toLowerCase() === aw[1].toLowerCase()) || aw[1];
  let program = h1.replace(new RegExp(`\\b(${PG_AWARD.source.slice(3, -3)}|${UG_AWARD.source.slice(3, -3)})\\b`, "g"), "").replace(/\(\s*Hons\s*\)|\bHons\b|\(\s*\)|\bwith Honours\b/gi, "").replace(/\s*[\/|]\s*(?=[\/|,]|$)/g, "").replace(/\s+/g, " ").replace(/^[\s,:\-\/|]+|[\s,:\-\/|]+$/g, "").trim();
  if (program.length < 3) program = h1;

  // International fee: a £ amount in a plausible range, close to "international" and "fee", not a scholarship or deposit
  let tuition: number | null = null;
  for (const m of text.matchAll(/£\s?(\d{1,2}),?(\d{3})(?!\d)/g)) {
    const v = Number(m[1] + m[2]); if (v < 10500 || v > 60000) continue;
    const before = text.slice(Math.max(0, m.index! - 260), m.index!), near = text.slice(Math.max(0, m.index! - 30), m.index! + 30);
    if (!/international|overseas|non[- ]uk|non[- ]eu/i.test(before)) continue;
    if (!/fee|tuition/i.test(text.slice(Math.max(0, m.index! - 500), m.index! + 60))) continue;
    if (/scholarship|bursar|discount|deposit|saving|worth|award of|up to|salary|earn|loan|prize|part[- ]time/i.test(near)) continue;
    // the nearest region label before the amount must be the international one
    const lastIntl = Math.max(before.search(/international(?![\s\S]*international)/i), before.search(/overseas(?![\s\S]*overseas)/i));
    const lastHome = Math.max(before.search(/\bhome\b(?![\s\S]*\bhome\b)/i), before.search(/\bUK\b(?![\s\S]*\bUK\b)/), before.search(/\bRoI\b(?![\s\S]*\bRoI\b)/));
    if (lastHome > lastIntl) continue;
    tuition = v; break;
  }
  const jan = /\b(January|Jan)\s+20(2[6-9])\b/i.test(text) || /(start(s|ing)?( date)?s?|intakes?|entry( point)?s?)\s*:?[^.]{0,100}\bJanuary\b/i.test(text);
  const im = text.match(/IELTS[^.£]{0,140}?\b([5-8](?:\.[05])?)\b/);
  const ielts = im && Number(im[1]) >= 5 && Number(im[1]) <= 8 ? Number(im[1]) : null;
  let months: number | null = null;
  const dm = text.match(/\b(\d{1,2}|one|two|three|four|five)\s*(years?|months?)\s*\(?\s*full[- ]?time/i) || text.match(/full[- ]?time\s*:?\s*\(?(\d{1,2}|one|two|three|four|five)\s*(years?|months?)/i) || text.match(/duration\s*:?\s*(\d{1,2}|one|two|three|four|five)\s*(years?|months?)/i);
  if (dm) { const n = ({ one: 1, two: 2, three: 3, four: 4, five: 5 } as Record<string, number>)[dm[1].toLowerCase()] ?? Number(dm[1]); months = /year/i.test(dm[2]) ? n * 12 : n; }
  if (!months || months < 9 || months > 72 || (pg && months > 36)) months = pg ? 12 : (/scotland/i.test(uni.region) ? 48 : 36);

  return {
    row: {
      ext_id: "uk:" + url.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/$/, "").slice(0, 110),
      country: "UK", currency: "GBP", fee_period: "year",
      university: uni.name, program: program.slice(0, 200), degree, title: canon,
      field: fieldOf(program), city: uni.city, state: uni.region, type: uni.type, language: "English",
      duration: null, duration_months: months, tuition,
      tuition_note: tuition ? "International fee per year, read automatically from the course page. Fees change every year, so confirm it there." : "See the course page for the current international fee.",
      semester_fee: null, intakes: jan ? ["September", "January"] : ["September"],
      deadline_winter: null, deadline_summer: null,
      deadline_note: pg ? "Most UK Master's admit on a rolling basis. Apply early; courses close when full." : "Apply through UCAS. Main deadline for 2027 entry: 13 January 2027.",
      english_req: ielts ? `IELTS ${ielts.toFixed(1)} mentioned on the course page (confirm the exact requirement there)` : null,
      other_req: null, apply_via: pg ? "University website" : "UCAS", summary: null,
      url, program_url: url, apply_url: null, source: "University website",
      verified_on: new Date().toISOString().slice(0, 10), active: true, curated: false,
    },
  };
}


// ---------------- German course pages ----------------
const DE_SKIP = /\b(Promotion|Promovieren|Doktor|Weiterbildung|weiterbildend|Zertifikat(skurs)?|Zertifikatsstudium|Kontaktstudium|Gasth[öo]rer|Seminar|Vorlesung|Modulhandbuch|Pr[üu]fungsordnung|Studienordnung|berufsbegleitend(es)? Zertifikat|Fernstudium|Brückenkurs|Vorkurs|Sprachkurs|Propädeutikum|Studienkolleg)\b/i;
const DE_AWARD = /\b(M\.\s?Sc\.|M\.\s?A\.|M\.\s?Eng\.|M\.\s?Ed\.|LL\.\s?M\.|MBA|B\.\s?Sc\.|B\.\s?A\.|B\.\s?Eng\.|LL\.\s?B\.|Master of (?:Science|Arts|Engineering|Education|Laws|Business Administration)|Bachelor of (?:Science|Arts|Engineering|Laws)|Staatsexamen|Magister)\b/i;
const DE_MONTHS: Record<string, string> = { januar: "01", februar: "02", "märz": "03", maerz: "03", april: "04", mai: "05", juni: "06", juli: "07", august: "08", september: "09", oktober: "10", november: "11", dezember: "12" };
// Baden-Wuerttemberg charges non-EU students tuition; every other public state does not
const BW = /Baden/i;

function awardDE(text: string, pg: boolean): string {
  const m = text.match(DE_AWARD);
  if (m) {
    const a = m[1].replace(/\s+/g, "");
    if (/^Masterof/i.test(a)) return { science: "M.Sc.", arts: "M.A.", engineering: "M.Eng.", education: "M.Ed.", laws: "LL.M.", businessadministration: "MBA" }[a.slice(8).toLowerCase()] || "Master";
    if (/^Bachelorof/i.test(a)) return { science: "B.Sc.", arts: "B.A.", engineering: "B.Eng.", laws: "LL.B." }[a.slice(10).toLowerCase()] || "Bachelor";
    if (/^(Staatsexamen|Magister)$/i.test(a)) return a;
    return a.replace(/\./g, ". ").replace(/\s+$/, "").replace(/\.\s/g, ".") .replace(/^(M|B)(Sc|A|Eng|Ed)\.?$/i, (_, x, y) => `${x.toUpperCase()}.${y}.`);
  }
  return pg ? "Master" : "Bachelor";
}

function parseDE(html: string, url: string, degree: string, uni: Uni) {
  const h1m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i), tm = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleTag = tm ? strip(tm[1]) : "";
  let h1 = h1m ? strip(h1m[1]) : "";
  if (!h1 || h1.length < 3) h1 = titleTag.split(TITLE_SEP)[0] || "";
  h1 = h1.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!h1 || /seite nicht gefunden|nicht gefunden|page not found|404|fehler|zugriff verweigert/i.test(h1)) return { skip: "no title" };
  // Many pages put the university's own name in the first heading and the course
  // name in a later heading or in the page title. Take the first non-university one.
  { const better = courseName(html, titleTag, uni.name); if (better) h1 = better.slice(0, 160); }
  if (DE_SKIP.test(`${h1} ${titleTag}`)) return { skip: "not a degree program" };
  const pg = degree === "Master";
  const text = strip(html).slice(0, 400000);
  // a landing or overview page, not one course
  if (/^(studium|studienangebot|studieng[äa]nge|bachelor|master|studienf[äa]cher|[üu]bersicht|alle studieng[äa]nge)$/i.test(h1)) return { skip: "overview page" };

  const title = awardDE(`${h1} ${titleTag} ${text.slice(0, 4000)}`, pg);
  // course name: drop the award and the words Bachelor/Master from the heading
  let program = h1
    .replace(DE_AWARD, "")
    .replace(/\b(Bachelor|Master)(studiengang|programm)?\b/gi, "")
    .replace(/\((?:\s*(?:1|Ein)-?Fach\s*)?\)/gi, "")
    .replace(/\s*[\/|,\-]\s*$/,"")
    .replace(/\s+/g, " ").replace(/^[\s,:\-\/|()]+|[\s,:\-\/|()]+$/g, "").trim();
  if (program.length < 3) program = h1;

  // Teaching language. Only an explicit statement counts. These pages mention English
  // for entry requirements and in module names, and reading that as the teaching language
  // tells a student with no German the opposite of the truth. No statement means unknown.
  const lm = text.match(/(?:Unterrichtssprache|Lehrsprache|Sprache des Studiengangs|Studiensprache|Sprache im Studiengang)n?\s*:?\s*([^.;|]{0,60})/i)
    || text.match(/\b(?:Language of instruction|Teaching language|Course language|Language)\s*:\s*([^.;|]{0,60})/i)
    || text.match(/\bSprachen?\s*:?\s*((?:Deutsch|Englisch|English|German)\b[^.;|]{0,60})/i);
  let ls = (lm?.[1] || "").toLowerCase();
  // "Englischkenntnisse erforderlich" is an admission requirement, not the teaching language.
  ls = ls.split(/kenntnis|nachweis|voraussetzung|erforderlich|niveau|requirement|proficien/i)[0];
  const hasEn = /\benglisch\b|\benglish\b/.test(ls), hasDe = /\bdeutsch\b|\bgerman\b/.test(ls);
  const language = hasEn && hasDe ? "German and English" : hasEn ? "English" : hasDe ? "German"
    : /\benglish[- ]taught\b|\btaught (?:entirely |wholly )?in english\b|\bconducted in english\b/i.test(text) ? "English"
    : null;

  // Tuition. Several states now charge non EU students, so trust the page before the default.
  const priv = /private|privat/i.test(uni.type);
  let tuition: number | null = null;
  const intlFee = text.match(/Studiengeb(?:ü|ue|u)hren[^.]{0,160}?(?:internationale|Drittstaat|Nicht[- ]?EU)[^.]{0,120}?(\d{1,2}[.,]?\d{3})\s*(?:Euro|€|EUR)\s*(?:je|pro|\/)\s*(Semester|Jahr)/i)
    || text.match(/(?:internationale Studierende|Drittstaaten|Nicht[- ]?EU)[^.]{0,160}?Studiengeb(?:ü|ue|u)hren[^.]{0,80}?(\d{1,2}[.,]?\d{3})\s*(?:Euro|€|EUR)\s*(?:je|pro|\/)\s*(Semester|Jahr)/i);
  if (intlFee) {
    const v = Number(intlFee[1].replace(/[.,]/g, ""));
    if (v >= 300 && v <= 30000) tuition = /jahr/i.test(intlFee[2]) ? Math.round(v / 2) : v;
  }
  if (tuition === null && priv) {
    const fm = text.match(/(\d{3,5})\s*(?:€|EUR|Euro)\s*(?:pro|je|\/)\s*(?:Monat|Semester)/i);
    if (fm) tuition = Number(fm[1]);
  }
  if (tuition === null && !priv) {
    const free = /keine Studiengeb(?:ü|ue|u)hren|studiengeb(?:ü|ue|u)hrenfrei|do not pay any tuition|no tuition fees/i.test(text);
    tuition = free ? 0 : BW.test(uni.region) ? 1500 : 0;
  }
  // Semester contribution
  const sm = text.match(/Semesterbeitrag[^.]{0,90}?(\d{2,3}(?:[.,]\d{2})?)\s*(?:€|EUR|Euro)/i) || text.match(/(\d{2,3}(?:[.,]\d{2})?)\s*(?:€|EUR|Euro)[^.]{0,40}Semesterbeitrag/i);
  const semester_fee = sm ? `about ${sm[1].replace(",", ".")} EUR per semester` : null;

  // Standard period of study
  let duration: number | null = null;
  const dm = text.match(/(?:Regelstudienzeit|Dauer|Duration)\s*:?\s*(\d{1,2})\s*(?:Semester|semesters)/i)
    || text.match(/(\d{1,2})\s*Semester\s*\((?:Vollzeit|full)/i)
    || text.match(/(\d{1,2})\s*(?:Semester|semesters)\b/i);
  if (dm) duration = Number(dm[1]);
  if (!duration || duration < 2 || duration > 14) duration = pg ? 4 : 6;

  // Intakes
  const both = /winter (?:and|&|und) summer|Winter[- ]? und Sommersemester/i.test(text);
  const winter = both || /Wintersemester|winter semester|zum Winter\b/i.test(text);
  const summer = both || /Sommersemester|summer semester|zum Sommer\b/i.test(text);
  const intakes = [winter || !summer ? "Winter" : null, summer ? "Summer" : null].filter(Boolean) as string[];

  // Application deadlines written as "15. Juli"
  const dl = (re: RegExp) => {
    const m = text.match(re);
    if (!m) return null;
    const d = String(Number(m[1])).padStart(2, "0"), mo = DE_MONTHS[m[2].toLowerCase()];
    return mo ? `${mo}-${d}` : null;
  };
  const deadline_winter = dl(/Winter\w*[^.]{0,120}?(\d{1,2})\.\s*(Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/i);
  const deadline_summer = dl(/Sommer\w*[^.]{0,120}?(\d{1,2})\.\s*(Januar|Februar|März|Maerz|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/i);

  // German level or English test mentioned on the page
  const gm = text.match(/\b(DSH[- ]?[123]|DSH|TestDaF|C1|B2|Goethe[- ]?Zertifikat)\b/i);
  const em = text.match(/\bIELTS[^.€]{0,60}?\b([5-8](?:[.,][05])?)\b/i) || text.match(/\bTOEFL[^.€]{0,60}?\b(\d{2,3})\b/i);
  const reqs = [gm ? `German: ${gm[1]} mentioned on the course page` : null, em ? `${/ielts/i.test(em[0]) ? "IELTS" : "TOEFL"} ${em[1]} mentioned on the course page` : null].filter(Boolean).join("; ") || null;

  // NC (restricted admission)
  const ncFree = /zulassungsfrei|keine Zulassungsbeschr|ohne NC\b/i.test(text);
  const ncRestricted = /zulassungsbeschr[äa]nkt|[öo]rtlicher NC|bundesweiter NC/i.test(text);
  const nc_status = ncFree && !ncRestricted ? "NC-frei" : ncRestricted && !ncFree ? "Zulassungsbeschränkt" : null;

  return {
    row: {
      ext_id: "de:" + url.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/$/, "").slice(0, 110),
      country: "DE", currency: "EUR", fee_period: "semester",
      university: uni.name, program: program.slice(0, 200), degree, title,
      field: fieldOf(`${program} ${h1}`), city: uni.city, state: uni.region, type: uni.type, language,
      duration, duration_months: duration * 6, tuition,
      tuition_note: tuition === 0 ? "Public university: no tuition fee, only the semester contribution." : tuition === 1500 ? "Baden-Wuerttemberg charges non EU students 1,500 EUR per semester." : "See the course page for the current fee.",
      semester_fee, intakes,
      deadline_winter, deadline_summer,
      deadline_note: "Deadlines read automatically from the course page. Always confirm on the university page or uni-assist.",
      english_req: reqs, other_req: null,
      apply_via: /uni-assist/i.test(text) ? "uni-assist" : "University portal",
      summary: null, nc_status,
      url, program_url: url, apply_url: null, source: "University website",
      verified_on: new Date().toISOString().slice(0, 10), active: true, curated: false,
    },
  };
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []; let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b: any; try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { data: sec } = await sb.from("app_secrets").select("value").eq("name", "import_token").single();
  if (!sec || b.token !== sec.value) return json({ error: "forbidden" }, 403);

  if (b.action === "probe") {
    const site = String(b.site).replace(/\/$/, "");
    const focus = b.focus ? new RegExp(b.focus, "i") : null;
    const { urls, files } = await sitemapUrls(site, b.sitemaps, focus || undefined);
    const depth = Number(b.depth) || 2;
    const g = new Map<string, { n: number; ex: string }>();
    for (const u of urls) {
      let p = ""; try { p = new URL(u).pathname; } catch { continue; }
      const key = p.split("/").filter(Boolean).slice(0, depth).join("/");
      const e = g.get(key) || { n: 0, ex: u }; e.n++; g.set(key, e);
    }
    const groups = [...g.entries()].sort((a, c) => c[1].n - a[1].n).slice(0, Number(b.top) || 30).map(([k, v]) => `${v.n} /${k} e.g. ${v.ex.replace(site, "")}`);
    return json({ total: urls.length, files: files.slice(0, 12), groups });
  }

  if (b.action === "enqueue") {
    const uni = b.uni as Uni; const site = uni.site.replace(/\/$/, "");
    const ctry = (uni.country || (/\.de$/i.test(new URL(site).hostname) ? "DE" : "UK")).toUpperCase();
    await sb.from("uk_unis").upsert({ name: uni.name, city: uni.city, region: uni.region, type: uni.type, site, country: ctry });
    const pgRe = b.pg ? new RegExp(b.pg, "i") : null, ugRe = b.ug ? new RegExp(b.ug, "i") : null, ex = b.exclude ? new RegExp(b.exclude, "i") : null;
    const lists = (b.listPages || []) as string[];
    let urls: string[] = Array.isArray(b.urls) ? b.urls : [];
    // List pages are an explicit, authoritative source: never mix the sitemap in,
    // or every course on the site matches the pattern and the degree label is lost.
    if (!urls.length && !lists.length) urls = (await sitemapUrls(site, b.sitemaps)).urls;
    // optional HTML list pages: collect links from them
    for (const lp of lists) {
      const r = await get(lp, 20000);
      if (r.status === 200) for (const m of r.text.matchAll(/href\s*=\s*["']([^"'#]+)["']/g)) { try { urls.push(new URL(ent(m[1]), lp).href); } catch { /* ignore */ } }
    }
    const cap = Number(b.cap) || 350;
    const pick = (re: RegExp | null) => (re ? [...new Set(urls.filter((u) => re.test(u) && !(ex && ex.test(u))).map((u) => u.split("#")[0]))].slice(0, cap) : []);
    const pgU = pick(pgRe), ugU = pick(ugRe).filter((u) => !pgU.includes(u));
    const rows = [...pgU.map((url) => ({ uni: uni.name, url, degree: "Master" })), ...ugU.map((url) => ({ uni: uni.name, url, degree: "Bachelor" }))];
    if (b.dry) return json({ found: urls.length, pg: pgU.length, ug: ugU.length, pgSample: pgU.slice(0, 4), ugSample: ugU.slice(0, 4) });
    for (let i = 0; i < rows.length; i += 500) { const { error } = await sb.from("uk_queue").upsert(rows.slice(i, i + 500), { onConflict: "url", ignoreDuplicates: true }); if (error) return json({ error: error.message }, 500); }
    return json({ found: urls.length, pg: pgU.length, ug: ugU.length });
  }

  if (b.action === "work") {
    const { data: flag } = await sb.from("app_settings").select("value").eq("key", "uk_import_run").maybeSingle();
    if (flag?.value !== "on") return json({ stopped: true });
    const { data: jobs, error } = await sb.rpc("uk_claim", { n: Math.min(Number(b.n) || 10, 20) });
    if (error) return json({ error: error.message }, 500);
    if (!jobs?.length) return json({ done: true });
    const { data: unis } = await sb.from("uk_unis").select("*").in("name", [...new Set(jobs.map((j: any) => j.uni))]);
    const U = new Map((unis || []).map((u: any) => [u.name, u as Uni]));
    const res = await pool(jobs, 5, async (j: any) => {
      const r = await get(j.url, 14000);
      if (r.status !== 200) return { id: j.id, status: "error", note: `http ${r.status}` };
      try { const u = U.get(j.uni)!; const de = u.country ? u.country.toUpperCase() === "DE" : /\.de$/i.test(new URL(j.url).hostname); const p = de ? parseDE(r.text, j.url, j.degree, u) : parse(r.text, j.url, j.degree, u); return p.row ? { id: j.id, status: "done", note: null, row: p.row } : { id: j.id, status: "skipped", note: p.skip }; }
      catch (e) { return { id: j.id, status: "error", note: String(e).slice(0, 80) }; }
    });
    const rows = res.filter((r: any) => r.row).map((r: any) => r.row);
    if (rows.length) { const { error: e2 } = await sb.from("programs").upsert(rows, { onConflict: "ext_id" }); if (e2) return json({ error: e2.message }, 500); }
    await Promise.all(res.map((r: any) => sb.from("uk_queue").update({ status: r.status, note: r.note, updated_at: new Date().toISOString() }).eq("id", r.id)));
    // keep going without the maintainer: start the next batch
    // @ts-ignore EdgeRuntime exists on Supabase
    EdgeRuntime.waitUntil(fetch(SELF, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: b.token, action: "work", n: b.n }) }).then((r) => r.text()).catch(() => {}));
    return json({ processed: res.length, saved: rows.length });
  }
  return json({ error: "unknown action" }, 400);
});
