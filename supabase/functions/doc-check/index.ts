// WizPath AI document checker. Documents are analysed in memory and never stored or logged.
import { createClient } from "jsr:@supabase/supabase-js@2";

const ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://wizzpath.com";
const MODEL = Deno.env.get("MODEL_WRITER") ?? "claude-sonnet-5-5";
const DAILY_CREDITS = Number(Deno.env.get("DAILY_CREDITS") ?? 30);
const COST = 8;
const MAX_FILES = 6, MAX_BYTES = 7 * 1024 * 1024;
const cors = { "Access-Control-Allow-Origin": ORIGIN, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM_BASE = `You are WizPath's document checker for Pakistani students applying to __WHERE__. You review scans of their academic and personal documents for one target program.
You are NOT __OFFICIAL__ and you do NOT certify anything. You flag problems so the student can fix them before applying.

Return ONLY valid JSON (no markdown, no comments) with exactly this shape:
{
 "documents": [{"file": "file name", "type": "e.g. Bachelor transcript, Degree certificate, IELTS report, Passport, CNIC, Intermediate certificate, CV, Other", "ok": true, "issues": ["short issue"]}],
 "extracted": {"name": "", "degree": "", "institution": "", "grade": "", "grade_type": "cgpa|percentage|other|unknown", "grade_max": null, "grade_min_pass": null, "grad_year": "", "english_test": "", "english_score": ""},
 "checklist": [{"item": "required document", "status": "present|missing|unclear", "note": ""}],
 "consistency": [{"issue": "", "severity": "high|medium|low"}],
 "eligibility": {"score": 0, "summary": "", "gaps": [""]},
 "chance": {"level": "low|medium|high|unknown", "reasons": [""]},
 "next_steps": [""]
}

Rules:
- Checklist: compare against what this program needs (from the program facts) plus the usual __SET__
- Consistency: compare the name spelling, date of birth and dates across documents; check that transcript totals and the degree certificate agree; flag unreadable, cropped or low quality scans, missing pages, missing stamps or signatures, expired language tests (older than 2 years).
- grade_min_pass: the minimum passing CGPA or percentage only if printed on the transcript, else null.
- Eligibility score 0 to 100 = how complete and how well the documents match this program's stated requirements. Be honest and specific.
- Chance: a rough estimate only. Use "unknown" if you lack program requirements. Never sound certain.
- Never invent facts that are not visible in the documents. If something cannot be read, say so.
- Never help forge, edit or alter documents. If a document looks manipulated, flag it neutrally as "needs verification".
- No em dashes or en dashes in any text.`;
const SYSTEM = (uk: boolean) => SYSTEM_BASE
  .replace("__WHERE__", uk ? "UK universities" : "German universities")
  .replace("__OFFICIAL__", uk ? "the university or UKVI" : "uni-assist")
  .replace("__SET__", uk ? "UK application set: degree certificate, transcripts, English proof meeting the stated level (usually IELTS Academic), passport, CV, personal statement, references. For Bachelor applicants also Matric and Intermediate or O and A level certificates. HEC attestation is helpful but not always required." : "German application set: degree certificate, transcripts, HEC attestation stamp visible, English proof meeting the stated level, passport, CV, motivation letter. For Bachelor applicants also Matric and Intermediate certificates.");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "Server is not configured yet." }, 500);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in again." }, 401);

  let body: { country?: string; program_id?: number; profile?: string; files?: { name: string; type: string; data: string }[] };
  try { body = await req.json(); } catch { return json({ error: "Upload too large or invalid. Try fewer or smaller files." }, 400); }
  const files = Array.isArray(body.files) ? body.files : [];
  if (!files.length) return json({ error: "Please add at least one document." }, 400);
  if (files.length > MAX_FILES) return json({ error: `Maximum ${MAX_FILES} files per check.` }, 400);
  let total = 0;
  for (const f of files) {
    if (!["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(f.type) || typeof f.data !== "string") return json({ error: "Only PDF, JPG, PNG or WebP files." }, 400);
    total += Math.floor(f.data.length * 0.75);
  }
  if (total > MAX_BYTES) return json({ error: "Files are too large together (max 7 MB). Use clearer but smaller scans." }, 400);

  const uk = body.country === "UK";
  let facts = `No specific program chosen. Check against a typical ${uk ? "UK" : "German"} Master's application.`;
  if (body.program_id) {
    const { data: p } = await supabase.from("programs").select("title,degree,program,university,language,english_req,other_req,deadline_note,apply_via,type").eq("id", body.program_id).maybeSingle();
    if (p) facts = `Target program: ${p.title || p.degree} ${p.program} at ${p.university} (${p.type}). Degree level: ${p.degree}. Teaching language: ${p.language}. English requirement: ${p.english_req || "not stated"}. Other requirements: ${p.other_req || "not stated"}. Application route: ${p.apply_via || "not stated"}.`;
  }

  const { data: allowed, error: rpcErr } = await supabase.rpc("use_ai_credit", { p_cost: COST, p_daily_limit: DAILY_CREDITS });
  if (rpcErr) return json({ error: "Could not check your daily limit." }, 500);
  if (!allowed) return json({ error: "You have used today's free AI limit. It resets tomorrow." }, 429);

  const content: unknown[] = [];
  for (const f of files) {
    content.push({ type: "text", text: `File: ${String(f.name).slice(0, 80)}` });
    content.push(f.type === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data } }
      : { type: "image", source: { type: "base64", media_type: f.type, data: f.data } });
  }
  content.push({ type: "text", text: `${facts}\nStudent profile (self reported): ${String(body.profile || "not given").slice(0, 800)}\nCheck these documents now and return the JSON.` });

  const payload: Record<string, unknown> = { model: MODEL, max_tokens: 6000, thinking: { type: "between_tools" }, system: SYSTEM(uk), messages: [{ role: "user", content }] };
  const call = (b: Record<string, unknown>) => fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify(b) });
  let res = await call(payload);
  if (res.status === 400) { const t = await res.text(); if (/thinking/i.test(t)) { delete payload.thinking; payload.max_tokens = 8000; res = await call(payload); } else { console.error("doc-check 400", t.slice(0, 300)); return json({ error: "The AI could not read these files. Try clearer PDFs or photos." }, 502); } }
  if (!res.ok) { console.error("doc-check error", res.status); return json({ error: "The AI is busy right now. Please try again in a minute." }, 502); }
  const data = await res.json();
  const text = (data.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("").trim();
  const m = text.match(/\{[\s\S]*\}/);
  try { return json({ result: JSON.parse(m ? m[0] : text) }); }
  catch { return json({ error: "The AI answer was incomplete. Please try again with fewer files." }, 502); }
});
