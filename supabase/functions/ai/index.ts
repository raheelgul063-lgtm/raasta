// Raasta AI Edge Function: visa assistant, motivation letter, interview practice.
// The Claude API key lives only here, as a Supabase secret (ANTHROPIC_API_KEY).
import { createClient } from "jsr:@supabase/supabase-js@2";

const DAILY_CREDITS = Number(Deno.env.get("DAILY_CREDITS") ?? 30);
const MODEL_FAST = Deno.env.get("MODEL_FAST") ?? "claude-haiku-5-5";
const MODEL_WRITER = Deno.env.get("MODEL_WRITER") ?? "claude-sonnet-5-5";
// Set ALLOWED_ORIGIN to your GitHub Pages address, e.g. https://yourname.github.io
const ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://raheelgul063-lgtm.github.io";

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const STYLE = `Formatting rules: plain text, short paragraphs, simple numbered lists when useful, **bold** sparingly. Never use em dashes or en dashes; use commas, colons, periods or parentheses instead. Reply in the language the student writes in (English, Urdu or Roman Urdu).`;

const VISA_FACTS = `Facts last checked: 2 November 2026. Official sources:
- German Missions in Pakistan, student visa page: https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104
- Consular Services Portal (Auslandsportal): https://digital.diplo.de

Process:
1. Student visa applications for Pakistan are submitted online on the Consular Services Portal ("Auslandsportal - Studium"). Appointment registration also runs through the portal.
2. The student fills an interactive questionnaire; the portal then shows the exact required documents. Scan and upload all of them (readable A4 copies).
3. A visa officer screens the documents. Two possible results: a notification for an appointment, or a request for further or corrected documents. Missing documents keep the registration halted, so upload everything immediately.
4. Jurisdiction: German Embassy Islamabad covers Punjab, Khyber Pakhtunkhwa, Gilgit-Baltistan, AJK and Islamabad. German Consulate General Karachi covers Sindh and Balochistan.

Documents typically required for a student visa (Section 16b Residence Act), final list is in the portal:
application form with recent biometric photo; copies of the first two passport pages (passport valid at least one year plus three months); CNIC copy; signed application declarations; appointment confirmation; written explanation of any past visa refusals; CV; letter of admission; enrolment certificate if the semester has already started or the admission letter sets an enrolment deadline; proof of language skills in the language of instruction; proof of financial means; degrees and transcripts attested by HEC (Higher Education Commission of Pakistan); health/travel insurance as the portal specifies.

Money:
- Visa fee: 75 EUR, paid in PKR.
- Proof of funds: usually a blocked account (Sperrkonto) with providers such as Fintiba or Expatrio. For 2026 the commonly required amount is 11,904 EUR per year (992 EUR per month). Older embassy PDFs show lower amounts; always tell students to confirm the current figure in the portal checklist. Alternatives can include a scholarship award or a formal declaration of commitment (Verpflichtungserklaerung) from a sponsor in Germany issued by a German foreigners authority.
- Public universities generally charge no tuition, only a semester contribution (usually a few hundred EUR). Baden-Wuerttemberg charges non EU students tuition (1,500 EUR per semester). Private universities charge tuition.

Universities:
- Program search: DAAD International Programmes database https://www2.daad.de/deutschland/studienangebote/international-programmes/en/
- Many universities use uni-assist (https://www.uni-assist.de/en/), others their own portal. Each program page says which.
- Pakistani applicants do not need an APS certificate (that applies to China, India and Vietnam).`;

const SITE = Deno.env.get("SITE_URL") ?? "https://raheelgul063-lgtm.github.io/raasta/";

// Scholarship, jobs, moving and city facts: generated from the website's guides (ai-knowledge.json), cached for 30 minutes
let KNOW = { text: "", at: 0 };
async function knowledge(): Promise<string> {
  if (KNOW.text && Date.now() - KNOW.at < 30 * 60 * 1000) return KNOW.text;
  try {
    const r = await fetch(`${SITE}ai-knowledge.json?t=${Date.now()}`);
    if (r.ok) { const j = await r.json(); if (typeof j.text === "string" && j.text.length > 1000) KNOW = { text: j.text.slice(0, 60000), at: Date.now() }; }
  } catch (e) { console.warn("knowledge fetch failed", String(e)); }
  return KNOW.text;
}

function systemFor(mode: string, ctx: Record<string, string>, catalog = ""): string {
  if (mode === "visa") {
    return `You are Raasta's assistant, helping Pakistani students who want to study in Germany or already study there: choosing programs, applications (uni-assist, documents, deadlines), scholarships, the student visa and student life. You are friendly, clear and practical, like a senior student who already went through the process.

${VISA_FACTS}

(Scholarships, student jobs, moving and city facts are in the knowledge block above. Use them.)

Raasta has about 2,000 international Bachelor's and Master's programs in Germany (public, applied sciences and private universities; English or German taught). Below are the ones that best match this conversation, found by a keyword search. Format: [id] degree | program | university (type) | city | field | teaching language | tuition per semester for non EU | next deadlines (non EU)
${catalog || "(no keyword matches for this message)"}

${ctx.profile ? `Student profile (saved by the student in Raasta; use it, do not ask again for what is already here, and say so if something important is missing): ${ctx.profile}` : "The student has not filled in a profile. Ask for their degree, CGPA and budget when it matters."}

Program recommendations:
- When a student asks which universities or programs to choose, FIRST recommend matching programs from the Raasta list above (2 to 5, best fit first). For each, give program, university, city, tuition, deadline and the link ${SITE}#/program?id=ID (use the id in brackets). Explain in one line why it fits their background.
- Be honest about fit: only recommend programs whose field matches the student's Bachelor's. If the matches above do not fit, ask one short question about their field or send them to the Raasta finder with a search link like ${SITE}#/finder?q=KEYWORD (URL encode the keyword). Point to the DAAD database only as a last option. Never invent programs or ids that are not in the list.
- German taught programs usually need German at C1 (DSH 2 or TestDaF 4x4). Mention this whenever you suggest one.
- Remind them to check the requirements on the university page linked on each Raasta program page.

How to answer (most important):
- Answer the student's actual question first, in the first 1 to 2 sentences, with a clear verdict: "Yes", "Likely", "Unlikely", "No" or "It depends on X". Then give the reasons, using everything the student told you (semester, university, degree, grades, years in Germany) and the knowledge below.
- Never answer with only "check the official website" or "ask the university". That is useless to the student. Work it out for them. A link or contact is the final next step, after you have given a real answer.
- If one fact decides the answer and you do not have it, give the answer for each case ("If your standard period ends this semester: unlikely. If you still have 2 or more semesters: yes, apply in the next call.") and ask that one question at the end.
- Use web_search only when you need a current or specific fact you do not have, for example a university's current scholarship call, an exact deadline or a recent rule change. Prefer official sources (university, DAAD, government, the scholarship provider). Never search for facts that are already in your knowledge. Say briefly what you found and from where.
- Recommend Raasta pages when they help, with the full link (scholarship pages, the program finder, guides).
- Never invent document names, fees, deadlines or rules. Never promise a visa or scholarship outcome. If sources disagree, say so.
- Do not help with forged or borrowed bank statements, fake documents or misleading the embassy. Explain briefly that it leads to refusal and possible bans.
- Keep answers focused: under 250 words unless the student asks for detail. End with one concrete next step.
- Only answer questions about studying in Germany, scholarships, the visa and student life in Germany. Politely decline other topics.
${STYLE}`;
  }
  if (mode === "letter") {
    return `You write university motivation letters (Statement of Purpose) for Pakistani students applying to German Bachelor's and Master's programs.

Rules:
- Use ONLY the facts the student provides. Never invent grades, awards, courses, professors, companies or numbers. If something important is missing, insert a short placeholder in square brackets such as [name a specific course from the module handbook].
- 550 to 700 words, one page. Structure: a specific opening (not a cliche), academic background, the strongest project or experience in detail, why this exact program (specific), why Germany, career goals, short closing.
- Banned phrases: "since childhood", "I have always been passionate", "esteemed university", "plethora", "in today's fast paced world", "I am writing to express". Plain, confident, specific English that a 24 year old would actually write.
- Fit check first: if the student's background clearly does not match the program's usual admission requirements (for example a film or arts degree for an engineering or science Master's), start your reply with a short honest note (2 to 3 sentences) explaining the likely admission problem and suggesting they check the requirements or consider better matching programs, then write the best honest letter you can, framing transferable skills without inventing qualifications.
- If "why this program" only talks about the student and nothing about the program, use [brackets] asking them to name real modules or labs.
- Start with "Dear Admissions Committee," and end with "Sincerely," and the student's name.
- After the letter, add one line: "Before sending: replace every [bracket] and rewrite at least a few sentences in your own words."
${STYLE}

Student facts:
Name: ${ctx.name || "[Your name]"}
Program: ${ctx.program}
University: ${ctx.university || "[University]"}
Bachelor's: ${ctx.degree || "[not given]"}
CGPA: ${ctx.cgpa || "[not given, do not mention grades]"}
Strongest project / experience: ${ctx.experience}
Why this program: ${ctx.whyProgram}
Why Germany: ${ctx.whyGermany || "[not given]"}
Career goal: ${ctx.goals || "[not given]"}
${ctx.programFacts ? `Program facts from our database (you may use these): ${ctx.programFacts}` : ""}`;
  }
  // interview
  const isVisa = ctx.type !== "university";
  return `You run a mock ${isVisa ? "German student visa interview at the German Embassy in Islamabad or Consulate in Karachi" : "German university Master's admission interview"} for a Pakistani student.
Program: ${ctx.program || "not given, ask for it in question 1"}

How it works:
- Ask exactly ONE question at a time, labeled "Question N:". Total 8 questions.
- ${isVisa
    ? "Typical topics: why this program and university, why Germany, how studies are financed, blocked account, accommodation plans, knowledge of the program content, gap years, career plans and ties to Pakistan, German language level, what happens after graduation."
    : "Typical topics: motivation, academic background, a project in depth, knowledge of the curriculum, a technical or subject question at Bachelor's level, teamwork, career goals."}
- After each answer: give brief feedback in this format:
  Good: (one line)
  Improve: (one line)
  Stronger answer: (2 to 3 sentences using ONLY facts the student gave; never invent facts)
  Then ask the next question.
- After question 8 is answered, give a final summary: score out of 10, top 3 strengths, top 3 things to practise.
- Be realistic, polite and a bit strict, like a real officer. Never coach the student to say anything untrue.
${STYLE}`;
}

const COST: Record<string, number> = { visa: 1, interview: 1, letter: 5 };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  // Health check for the admin dashboard (no login, no credits)
  const peek = await req.clone().json().catch(() => ({}));
  if (peek?.mode === "ping") return json({ ok: true, ai: Boolean(apiKey), models: { fast: MODEL_FAST, writer: MODEL_WRITER }, dailyCredits: DAILY_CREDITS });

  if (!apiKey) return json({ error: "Server is not configured yet." }, 500);

  // Identify the student from their login token
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Please sign in again." }, 401);

  let body: { mode?: string; messages?: { role: string; content: string }[]; context?: Record<string, string> };
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  const mode = body.mode ?? "";
  if (!(mode in COST)) return json({ error: "Unknown mode" }, 400);

  // Validate and trim conversation
  const raw = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  const messages = raw
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Empty message" }, 400);

  const ctx: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.context ?? {})) if (typeof v === "string") ctx[k] = v.slice(0, 1500);
  if (mode === "letter" && (!ctx.program || !ctx.experience || !ctx.whyProgram)) {
    return json({ error: "Please fill in program, experience and why this program." }, 400);
  }

  // Program catalog for recommendations: only the programs most relevant to this conversation
  let catalog = "";
  if (mode === "visa") {
    const recent = messages.filter((m) => m.role === "user").slice(-3).map((m) => m.content).join(" ") + " " + (ctx.profile || "").replace(/(wants|field|current degree|budget|intake|province|English|German|CGPA|graduated):/g, " ");
    const { data: progs } = await supabase.rpc("match_programs", { q: recent.slice(0, 1500), lim: 40 });
    const fee = (t: number | null) => (t === 0 ? "no tuition" : t == null ? "check page" : `${t} EUR`);
    catalog = (progs ?? []).map((p: any) => `[${p.id}] ${p.title || p.degree} | ${p.program} | ${p.university} (${p.type || "University"}) | ${p.city || ""} | ${p.field} | ${p.language || "English"} | ${fee(p.tuition)} | ${[p.deadline_winter && `winter ${p.deadline_winter}`, p.deadline_summer && `summer ${p.deadline_summer}`].filter(Boolean).join(", ") || "see page"}`).join("\n");
  }

  // Daily limit
  const { data: allowed, error: rpcErr } = await supabase.rpc("use_ai_credit", { p_cost: COST[mode], p_daily_limit: DAILY_CREDITS });
  if (rpcErr) return json({ error: "Could not check your daily limit." }, 500);
  if (!allowed) return json({ error: "You have used today's free AI limit. It resets tomorrow. Your tracker still works." }, 429);

  const payload: Record<string, unknown> = {
    model: mode === "letter" ? MODEL_WRITER : MODEL_FAST,
    // Thinking is on by default on the 5.5 models and counts toward max_tokens, which cut answers short.
    // Haiku: turn it off. Sonnet 5.5: "between_tools" is its lowest setting (no up-front thinking without tools).
    thinking: { type: mode === "letter" ? "between_tools" : "disabled" },
    max_tokens: mode === "letter" ? 4000 : 2000,
    system: mode === "visa"
      ? [{ type: "text", text: `RAASTA KNOWLEDGE (checked facts shown on the Raasta website)\n\n${(await knowledge()) || "(not available right now)"}`, cache_control: { type: "ephemeral" } }, { type: "text", text: systemFor(mode, ctx, catalog) }]
      : systemFor(mode, ctx, catalog),
    messages,
  };
  if (mode === "visa") {
    payload.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }];
    payload.max_tokens = 3000;
  }
  const callClaude = (body: Record<string, unknown>) => fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let res = await callClaude(payload);
  if (res.status === 400) {
    const t = await res.text();
    if (/thinking/i.test(t)) { console.warn("thinking setting rejected, retrying without it", t.slice(0, 200)); delete payload.thinking; payload.max_tokens = 6000; res = await callClaude(payload); }
    else if (payload.tools) { console.warn("tools rejected, retrying without web search", t.slice(0, 200)); delete payload.tools; res = await callClaude(payload); }
    else res = new Response(t, { status: 400 });
  }

  if (!res.ok) {
    console.error("Claude API error", res.status, await res.text());
    return json({ error: "The AI is busy right now. Please try again in a minute." }, 502);
  }
  let data = await res.json();
  let content = data.content ?? [];
  // Web search can pause a long turn; continue it (at most twice)
  for (let i = 0; i < 2 && data.stop_reason === "pause_turn"; i++) {
    payload.messages = [...messages, { role: "assistant", content }];
    const r2 = await callClaude(payload);
    if (!r2.ok) break;
    data = await r2.json();
    content = [...content, ...(data.content ?? [])];
  }
  const reply = content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("").trim();
  if (data.stop_reason === "max_tokens") console.warn("AI reply hit max_tokens", mode, reply.length);
  if (!reply) return json({ error: "The AI could not finish this answer. Please ask again, a bit shorter." }, 502);
  return json({ reply: reply.replace(/[\u2013\u2014]/g, ", ") });
});
