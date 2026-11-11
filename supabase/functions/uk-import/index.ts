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
  if (/comput|software|data|artificial intelligence|\bai\b|cyber|machine learning|informatics|information (technology|systems)|\bit\b|robotic|games? (dev|prog|tech)|cloud|network|web dev|blockchain|human.computer/.test(s)) return "Computer Science / Data Science / AI";
  if (/electr|telecom|embedded|communications engineering|power systems|microelectron|photonic/.test(s)) return "Electrical / Electronics Engineering";
  if (/mechanic|mechatronic|automotive|aerospace|aeronaut|manufactur|materials|motorsport|engineering management|industrial eng|product engineering|marine eng|naval/.test(s)) return "Mechanical / Mechatronics Engineering";
  if (/civil|energy|environment|sustainab|renewable|climate|construction|structural|water|urban|planning|quantity survey|building|real estate|petroleum|geotech|transport|surveying|oil and gas/.test(s)) return "Energy / Environment / Civil Engineering";
  if (/business|management|financ|account|marketing|econom|\bmba\b|banking|logistic|supply chain|entrepreneur|human resource|\bhr\b|commerce|tourism|hospitality|project|investment|fintech|event|leadership|international trade|actuar|insurance|analytics/.test(s)) return "Business / Management / Economics";
  if (/bio|medic|health|pharm|nurs|neuro|genetic|clinical|nutrition|psycholog|dent|physio|sport|midwif|paramedic|veterin|public health|food|agri|zoolog|anatom|radiograph|optom|cancer|immun|epidemi|social care|occupational therapy|speech|audiolog/.test(s)) return "Life Sciences / Biotech / Health";
  if (/physics|chemi|mathemat|statistic|geolog|earth|astro|geograph|ocean|natural science|forensic|meteorolog/.test(s)) return "Natural Sciences";
  if (/design|media|\barts?\b|film|music|architect|fashion|animation|photograph|journalis|creative|games? (art|design)|illustration|theatre|drama|dance|performance|interior|textile|broadcast|publishing|advertising|visual|curat/.test(s)) return "Design / Media / Arts";
  return "Other";
}

type Uni = { name: string; city: string; region: string; type: string; site: string };

function parse(html: string, url: string, degree: string, uni: Uni) {
  const h1m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i), tm = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const titleTag = tm ? strip(tm[1]) : "";
  let h1 = h1m ? strip(h1m[1]) : "";
  if (!h1 || h1.length < 3) h1 = titleTag.split(/\s[|\-–·:]\s/)[0] || "";
  h1 = h1.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!h1 || /page not found|404|not found|access denied|just a moment|error/i.test(h1)) return { skip: "no title" };
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
    await sb.from("uk_unis").upsert({ name: uni.name, city: uni.city, region: uni.region, type: uni.type, site });
    const pgRe = b.pg ? new RegExp(b.pg, "i") : null, ugRe = b.ug ? new RegExp(b.ug, "i") : null, ex = b.exclude ? new RegExp(b.exclude, "i") : null;
    let urls: string[] = Array.isArray(b.urls) ? b.urls : [];
    if (!urls.length) urls = (await sitemapUrls(site, b.sitemaps)).urls;
    // optional HTML list pages: collect links from them
    for (const lp of (b.listPages || []) as string[]) {
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
      try { const p = parse(r.text, j.url, j.degree, U.get(j.uni)!); return p.row ? { id: j.id, status: "done", note: null, row: p.row } : { id: j.id, status: "skipped", note: p.skip }; }
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
