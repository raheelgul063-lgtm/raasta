// Maintainer-only: patch admission fields on imported DAAD programs. Protected by the private import token.
import { createClient } from "jsr:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "content-type": "application/json" } });
const t = (v: unknown, n: number) => (typeof v === "string" && v.trim() ? v.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().slice(0, n) : null);
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  const body = await req.json().catch(() => ({}));
  const { data: sec } = await sb.from("app_secrets").select("value").eq("name", "import_token").single();
  if (!sec || body.token !== sec.value) return json({ error: "forbidden" }, 403);
  let n = 0;
  for (const r of (Array.isArray(body.rows) ? body.rows.slice(0, 200) : [])) {
    const id = Number(r.daad_id); if (!id) continue;
    const { error } = await sb.from("programs").update({ admission_req: t(r.admission_req, 700), entrance_exam: t(r.entrance_exam, 120), nc_status: t(r.nc_status, 60) }).eq("daad_id", id);
    if (!error) n++;
  }
  return json({ updated: n });
});
