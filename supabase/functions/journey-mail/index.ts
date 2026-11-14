// Hamrah's reminders.
//
// Two jobs:
//   1. A student ticks a step off  -> tell them what is next.
//   2. A daily digest              -> nudge whatever is overdue.
//
// Every notification is written to journey_events whether or not the email goes out, so the
// student sees it in the app and so a reminder is never sent twice. Until a mail provider key
// is set the function still records everything and simply reports that nothing was sent.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? "WizPath <hamrah@raasta.app>";
const CRON_SECRET = Deno.env.get("JOURNEY_CRON_SECRET") ?? "";
const SITE = Deno.env.get("SITE_URL") ?? "https://wizzpath.com/";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", ...cors } });
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization, content-type, apikey, x-client-info" };
const esc = (s: string) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

type Step = { step_key: string; title: string; detail: string | null; stage: string; ord: number; status: string; optional: boolean; due_on: string | null };

function shell(heading: string, lines: string[], cta: string) {
  return `<!doctype html><html><body style="margin:0;background:#F7F5F0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1C1C1C">
<div style="max-width:560px;margin:0 auto;padding:28px 20px">
  <div style="font-weight:800;color:#0E4D3A;font-size:1.1rem;margin-bottom:18px">WizPath <span style="color:#8A8A8A;font-weight:600">&middot; Hamrah</span></div>
  <div style="background:#fff;border:1px solid #E6E2D8;border-radius:14px;padding:22px">
    <h1 style="margin:0 0 12px;font-size:1.25rem;line-height:1.35">${esc(heading)}</h1>
    ${lines.map((l) => `<p style="margin:0 0 12px;line-height:1.6;color:#4A4A4A">${l}</p>`).join("")}
    <a href="${SITE}${cta}" style="display:inline-block;margin-top:8px;background:#F2B544;color:#3E2A02;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:10px">Open my journey</a>
  </div>
  <p style="color:#8A8A8A;font-size:.8rem;line-height:1.6;margin-top:18px">
    Hamrah guides you, but you submit your own applications and make your own payments. WizPath will never ask for a password, a card number or a one time code.<br>
    To stop these emails, open your journey and turn off reminders.
  </p>
</div></body></html>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_KEY) return { ok: false, error: "no mail provider configured" };
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${RESEND_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to, subject, html }),
    });
    if (!r.ok) return { ok: false, error: `${r.status} ${(await r.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 200) };
  }
}

async function emailFor(userId: string): Promise<string | null> {
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

// One notification: record it, then try to send it.
async function notify(j: any, kind: string, stepKey: string | null, title: string, bodyLines: string[]) {
  const { data: ev } = await admin.from("journey_events")
    .insert({ journey_id: j.id, kind, step_key: stepKey, title, body: bodyLines.join("\n") })
    .select().single();

  if (!j.email_opt_in) return { recorded: true, sent: false, reason: "reminders off" };
  const to = await emailFor(j.user_id);
  if (!to) return { recorded: true, sent: false, reason: "no address" };

  const res = await sendMail(to, title, shell(title, bodyLines, `#/journey?id=${j.id}`));
  if (ev) {
    await admin.from("journey_events")
      .update(res.ok ? { email_sent_at: new Date().toISOString() } : { email_error: res.error })
      .eq("id", ev.id);
  }
  if (res.ok) await admin.from("journeys").update({ last_mail_at: new Date().toISOString() }).eq("id", j.id);
  return { recorded: true, sent: res.ok, reason: res.error };
}

const openSteps = (steps: Step[]) => steps.filter((s) => s.status !== "done" && s.status !== "skipped");
const nextOf = (steps: Step[]) => openSteps(steps).find((s) => !s.optional) ?? openSteps(steps)[0] ?? null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  let b: any;
  try { b = await req.json(); } catch { return json({ error: "bad json" }, 400); }

  /* ---- Daily digest: overdue steps. Called by the scheduler, not by a browser. ---- */
  if (b.action === "digest") {
    if (!CRON_SECRET || b.secret !== CRON_SECRET) return json({ error: "forbidden" }, 403);
    const today = new Date().toISOString().slice(0, 10);
    const { data: journeys } = await admin.from("journeys").select("*").eq("status", "active").eq("email_opt_in", true);
    let sent = 0, checked = 0;
    for (const j of journeys ?? []) {
      checked++;
      const { data: steps } = await admin.from("journey_steps").select("*").eq("journey_id", j.id).order("ord");
      const late = (steps ?? []).filter((s: Step) => s.status !== "done" && s.status !== "skipped" && s.due_on && s.due_on < today);
      if (!late.length) continue;
      // Do not nag: one overdue notice per journey per three days.
      const since = new Date(Date.now() - 3 * 864e5).toISOString();
      const { data: recent } = await admin.from("journey_events")
        .select("id").eq("journey_id", j.id).eq("kind", "overdue").gte("created_at", since).limit(1);
      if (recent?.length) continue;

      const r = await notify(j, "overdue", late[0].step_key,
        late.length === 1 ? `Overdue: ${late[0].title}` : `${late.length} steps are overdue`,
        [
          `You set a target date that has passed for your application to <strong>${esc(j.university)}</strong>.`,
          late.slice(0, 5).map((s: Step) => `&bull; ${esc(s.title)} (target ${esc(s.due_on!)})`).join("<br>"),
          "If the date has slipped, open your journey and move it. A date you can believe is worth more than one you ignore.",
        ]);
      if (r.sent) sent++;
    }
    return json({ ok: true, checked, sent, mailer: Boolean(RESEND_KEY) });
  }

  /* ---- Student-triggered: a step was finished, or a journey started ---- */
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "sign in first" }, 401);
  const asUser = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
  const { data: me } = await asUser.auth.getUser();
  if (!me?.user) return json({ error: "sign in first" }, 401);

  const jid = Number(b.journey_id);
  if (!jid) return json({ error: "journey_id required" }, 400);
  // Read through the student's own token, so row level security proves the journey is theirs.
  const { data: j } = await asUser.from("journeys").select("*").eq("id", jid).maybeSingle();
  if (!j) return json({ error: "not found" }, 404);

  const { data: steps } = await admin.from("journey_steps").select("*").eq("journey_id", j.id).order("ord");
  const all = (steps ?? []) as Step[];
  const required = all.filter((s) => !s.optional);
  const done = required.filter((s) => s.status === "done").length;
  const next = nextOf(all);
  const where = `${esc(j.program || "your application")} at <strong>${esc(j.university)}</strong>`;

  if (b.kind === "journey_start") {
    const r = await notify(j, "journey_start", null, `Your journey to ${j.university} has started`, [
      `Hamrah is with you for ${where}.`,
      `There are ${required.length} steps ahead. ${next ? `First one: <strong>${esc(next.title)}</strong>.` : ""}`,
      "Tick each step off as you finish it and I will tell you what comes next. Set a target date on anything with a deadline and I will remind you before it passes.",
      "One thing worth repeating: I prepare your answers, but you submit your own forms and make your own payments. Nobody from WizPath will ever ask for a password, a card number or a one time code.",
    ]);
    return json({ ok: true, ...r });
  }

  // A step was completed.
  const doneStep = all.find((s) => s.step_key === b.step_key);
  if (!doneStep) return json({ error: "step not found" }, 404);

  if (!next) {
    const r = await notify(j, "journey_done", doneStep.step_key, `That was the last step for ${j.university}`, [
      `You have finished every step for ${where}.`,
      "Go well. If anything changes, your journey stays here.",
    ]);
    return json({ ok: true, ...r });
  }

  const sameStage = all.filter((s) => s.stage === doneStep.stage);
  const stageDone = sameStage.every((s) => s.status === "done" || s.status === "skipped" || s.optional);

  const r = await notify(j, stageDone ? "stage_done" : "step_done", doneStep.step_key,
    stageDone ? `Stage complete: ${doneStep.title} was the last one` : `Done: ${doneStep.title}`,
    [
      `${done} of ${required.length} steps finished for ${where}.`,
      `Next: <strong>${esc(next.title)}</strong>${next.detail ? `<br><span style="color:#6A6A6A">${esc(next.detail)}</span>` : ""}`,
      next.due_on ? `Your target date for it is ${esc(next.due_on)}.` : "Open your journey to set a target date for it, and I will remind you.",
    ]);
  return json({ ok: true, ...r, done, total: required.length, next: next.title });
});
