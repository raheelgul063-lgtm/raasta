// Upserts programs researched from official university websites (mostly private universities not listed by DAAD).
// Maintainer-only: protected by the private import token in public.app_secrets.
import { createClient } from "jsr:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json" } });

const FIELDS = ["Computer Science / Data Science / AI", "Electrical / Electronics Engineering", "Mechanical / Mechatronics Engineering", "Energy / Environment / Civil Engineering", "Business / Management / Economics", "Life Sciences / Biotech / Health", "Natural Sciences", "Design / Media / Arts", "Other"];
const STATES: Record<string, string> = { Berlin: "Berlin", Hamburg: "Hamburg", Munich: "Bavaria", Cologne: "North Rhine-Westphalia", Frankfurt: "Hesse", Potsdam: "Brandenburg", Iserlohn: "North Rhine-Westphalia", Düsseldorf: "North Rhine-Westphalia", Dortmund: "North Rhine-Westphalia", Stuttgart: "Baden-Württemberg", Hanover: "Lower Saxony", Bremen: "Bremen", Leipzig: "Saxony", Heidelberg: "Baden-Württemberg", Freiburg: "Baden-Württemberg", Erfurt: "Thuringia", Mannheim: "Baden-Württemberg", Bad Honnef: "North Rhine-Westphalia", Essen: "North Rhine-Westphalia", Nuremberg: "Bavaria", Dresden: "Saxony" } as Record<string, string>;
const txt = (v: unknown, max = 300) => (typeof v === "string" && v.trim() ? v.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().slice(0, max) : null);
const url = (v: unknown) => (typeof v === "string" && /^https:\/\//.test(v) ? v.slice(0, 500) : null);
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
  const { data: sec } = await sb.from("app_secrets").select("value").eq("name", "import_token").single();
  if (!sec || body.token !== sec.value) return json({ error: "forbidden" }, 403);
  const today = new Date().toISOString().slice(0, 10);
  const rows = (Array.isArray(body.rows) ? body.rows.slice(0, 300) : []).map((r: any) => {
    const city = txt(r.city, 80);
    return {
      ext_id: txt(r.ext_id, 120),
      university: txt(r.university, 200),
      program: txt(r.program, 200),
      degree: r.degree === "Bachelor" ? "Bachelor" : "Master",
      title: txt(r.title, 40),
      field: FIELDS.includes(r.field) ? r.field : "Other",
      city,
      state: txt(r.state, 60) || (city ? STATES[city.split(",")[0].trim()] || null : null),
      type: "Private university",
      language: txt(r.language, 60) || "English",
      duration: int(r.duration),
      tuition: int(r.tuition),
      tuition_note: txt(r.tuition_note, 200),
      semester_fee: null,
      intakes: Array.isArray(r.intakes) ? r.intakes.filter((x: string) => x === "Winter" || x === "Summer") : [],
      deadline_winter: /^\d{2}-\d{2}$/.test(r.deadline_winter || "") ? r.deadline_winter : null,
      deadline_summer: /^\d{2}-\d{2}$/.test(r.deadline_summer || "") ? r.deadline_summer : null,
      deadline_note: txt(r.deadline_note, 300) || "Private universities often admit on a rolling basis. Check the university page for the latest application date.",
      english_req: txt(r.english_req, 200),
      other_req: txt(r.other_req, 300),
      apply_via: "University application portal",
      summary: txt(r.summary, 400),
      url: url(r.program_url),
      program_url: url(r.program_url),
      apply_url: url(r.apply_url),
      source: "University website",
      verified_on: today,
      active: true,
      curated: true,
    };
  }).filter((r: any) => r.ext_id && r.university && r.program && r.url);
  if (!rows.length) return json({ error: "no valid rows" }, 400);
  if (body.dry) return json({ rows: rows.slice(0, 3), n: rows.length });
  const { error } = await sb.from("programs").upsert(rows, { onConflict: "ext_id" });
  if (error) return json({ error: error.message }, 500);
  return json({ upserted: rows.length });
});
