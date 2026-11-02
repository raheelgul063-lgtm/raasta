/* ---------------- Setup ---------------- */
const CFG = window.RAASTA_CONFIG || {};
// Supabase is only loaded when configured, so Demo mode works fully offline
let sb = null;
if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
  // supabase-js is bundled in /vendor (pinned version, no third party CDN at runtime)
  try { sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY); }
  catch (e) { console.error("Supabase could not load", e); }
}
const CONFIGURED = Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
const LIVE = Boolean(sb);
const app = document.getElementById("app");
let session = null;

const OFFICIAL = {
  visaPage: "https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104",
  portal: "https://digital.diplo.de",
  daad: "https://www2.daad.de/deutschland/studienangebote/international-programmes/en/",
  uniassist: "https://www.uni-assist.de/en/",
  hec: "https://www.hec.gov.pk/english/services/students/degreeattestation/Pages/default.aspx"
};

/* ---------------- Content ---------------- */
const ROADMAP = [
  { t: "Shortlist your programs", d: "Use the Raasta university finder to filter English taught programs, then read each official page. Note the deadline, IELTS score and required documents.", tag: "Start 8 to 12 months before intake", link: "#/finder", linkText: "Open the finder" },
  { t: "Book your language test", d: "Most English taught programs ask for IELTS or TOEFL. Check the exact minimum score for every program on your list.", tag: "Results take about 2 weeks" },
  { t: "Get your degree attested by HEC", d: "Your degree and transcripts need Higher Education Commission attestation for the visa. Start early, this takes time.", tag: "Do this before applying", link: OFFICIAL.hec, linkText: "HEC attestation" },
  { t: "Prepare CV, motivation letter and references", d: "A one page Europass or clean CV, a personal motivation letter for each program and usually two reference letters.", tag: "Use the Letter builder" },
  { t: "Apply via uni-assist or the university portal", d: "Many universities use uni-assist, others have their own portal. Each program page says which one.", tag: "Track every application", link: OFFICIAL.uniassist, linkText: "uni-assist" },
  { t: "Receive your admission letter", d: "Once admitted, check if the letter has an enrolment deadline. You may need an enrolment certificate for the visa.", tag: "Keep a PDF copy" },
  { t: "Open a blocked account and get insurance", d: "For 2026 the blocked account amount is €11,904 per year (€992 per month). Confirm the current amount in the portal checklist.", tag: "Needed before the visa" },
  { t: "Apply on the Consular Services Portal", d: "Student visas for Pakistan are applied for online. Fill in the questionnaire, then scan and upload every document it asks for.", tag: "Islamabad or Karachi", link: OFFICIAL.portal, linkText: "Consular Services Portal" },
  { t: "Screening, appointment and interview", d: "A visa officer screens your documents. You either get an appointment or a request for corrected documents. Practise your interview.", tag: "Use Interview practice" },
  { t: "Fly, register and start", d: "Register your address (Anmeldung), activate your blocked account and apply for your residence permit in Germany.", tag: "Welcome to Germany" }
];

const CHECKLIST = [
  { group: "For your university applications", items: [
    { k: "uni_transcripts", t: "Bachelor's degree and transcripts", n: "Clear scans. Some programs want certified copies." },
    { k: "uni_hec", t: "HEC attestation of degree and transcripts", n: "Required for the visa, so do it once and early." },
    { k: "uni_school", t: "Matric / Intermediate or O/A level certificates", n: "Often requested by uni-assist." },
    { k: "uni_language", t: "IELTS / TOEFL or German certificate", n: "Check the minimum score per program." },
    { k: "uni_cv", t: "CV", n: "One to two pages, clean layout." },
    { k: "uni_letter", t: "Motivation letter per program", n: "Personal, specific to each program." },
    { k: "uni_lor", t: "Letters of recommendation", n: "Usually two, from professors or employers." },
    { k: "uni_passport", t: "Passport copy", n: "Data page." }
  ]},
  { group: "For your visa (Consular Services Portal)", items: [
    { k: "visa_portal", t: "Register on the Consular Services Portal", n: "Choose the Pakistan mission for your province." },
    { k: "visa_form", t: "Visa application form with biometric photo", n: "Completed and signed." },
    { k: "visa_passport", t: "Passport copies (first two pages)", n: "Passport valid at least one year plus three months." },
    { k: "visa_cnic", t: "CNIC copy", n: "" },
    { k: "visa_decl", t: "Signed application declarations", n: "Read and sign them yourself." },
    { k: "visa_admission", t: "Admission letter", n: "" },
    { k: "visa_enrol", t: "Enrolment certificate (if required)", n: "Needed if the semester started or your letter sets an enrolment deadline." },
    { k: "visa_cv", t: "CV", n: "" },
    { k: "visa_letter", t: "Motivation letter", n: "Must match what you say in the interview." },
    { k: "visa_language", t: "Proof of language skills", n: "In the language of instruction." },
    { k: "visa_hec", t: "HEC attested degrees and transcripts", n: "" },
    { k: "visa_blocked", t: "Blocked account confirmation", n: "€11,904 for 2026. Confirm the amount in the portal checklist." },
    { k: "visa_insurance", t: "Health / travel insurance", n: "Check the portal checklist for what is accepted." },
    { k: "visa_refusals", t: "Explanation of past visa refusals (if any)", n: "" },
    { k: "visa_fee", t: "Visa fee: €75, paid in PKR", n: "" }
  ]}
];

const VISA_CHIPS = [
  "Which programs fit my Bachelor's? (tell me your degree and CGPA)",
  "What documents do I need for the student visa?",
  "Islamabad or Karachi: where do I apply?",
  "How much money for the blocked account in 2026?",
  "Mujhe HEC attestation kab karwani chahiye?",
  "What happens after I upload documents on the portal?"
];

const FIELD_META = {
  "Computer Science / Data Science / AI": { ic: "💻", name: "Computer Science & AI", d: "Software, data science, AI, cyber security" },
  "Business / Management / Economics": { ic: "📈", name: "Business & Economics", d: "Management, finance, marketing, MBA" },
  "Mechanical / Mechatronics Engineering": { ic: "⚙️", name: "Mechanical & Mechatronics", d: "Automotive, robotics, production, materials" },
  "Electrical / Electronics Engineering": { ic: "🔌", name: "Electrical & Electronics", d: "Power, embedded systems, communications" },
  "Energy / Environment / Civil Engineering": { ic: "🌱", name: "Energy, Environment & Civil", d: "Renewables, water, urban planning, construction" },
  "Life Sciences / Biotech / Health": { ic: "🧬", name: "Life Sciences & Health", d: "Biotech, medicine, public health, agriculture" },
  "Natural Sciences": { ic: "🔭", name: "Natural Sciences", d: "Physics, chemistry, mathematics, earth sciences" },
  "Design / Media / Arts": { ic: "🎨", name: "Design, Media & Arts", d: "Design, architecture, media, culture" },
  "Other": { ic: "📚", name: "Law, Social Sciences & more", d: "Law, politics, education, languages" }
};
const FIELDS = ["Computer Science / Data Science / AI", "Electrical / Electronics Engineering", "Mechanical / Mechatronics Engineering", "Energy / Environment / Civil Engineering", "Business / Management / Economics", "Life Sciences / Biotech / Health", "Natural Sciences", "Design / Media / Arts", "Other"];

/* ---------------- Helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function richText(s) {
  let h = esc(s);
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/(https?:\/\/[^\s<)]+)/g, (u) => {
    const internal = u.match(/#\/program\?id=(\d+)/);
    return internal ? `<a href="#/program?id=${internal[1]}">View program in Raasta →</a>` : `<a href="${u}" target="_blank" rel="noopener">${u}</a>`;
  });
  return h;
}
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "")) ? esc(u) : "#");
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}
const local = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("raasta_" + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("raasta_" + k, JSON.stringify(v)); } catch {} }
};
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00"); const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 86400000);
}

/* ---------------- Data layer ---------------- */
const db = {
  async listApps() {
    if (!LIVE) return local.get("apps", []);
    const { data, error } = await sb.from("applications").select("*").order("deadline", { ascending: true, nullsFirst: false });
    if (error) throw error; return data;
  },
  async addApp(a) {
    if (!LIVE) { const all = local.get("apps", []); all.push({ ...a, id: crypto.randomUUID() }); local.set("apps", all); return; }
    const { error } = await sb.from("applications").insert({ ...a, user_id: session.user.id }); if (error) throw error;
  },
  async updateApp(id, patch) {
    if (!LIVE) { local.set("apps", local.get("apps", []).map((x) => (x.id === id ? { ...x, ...patch } : x))); return; }
    const { error } = await sb.from("applications").update(patch).eq("id", id); if (error) throw error;
  },
  async deleteApp(id) {
    if (!LIVE) { local.set("apps", local.get("apps", []).filter((x) => x.id !== id)); return; }
    const { error } = await sb.from("applications").delete().eq("id", id); if (error) throw error;
  },
  async getChecklist() {
    if (!LIVE) return local.get("checklist", {});
    const { data, error } = await sb.from("checklist_items").select("item_key, done"); if (error) throw error;
    return Object.fromEntries(data.map((r) => [r.item_key, r.done]));
  },
  async programs() {
    // Refresh the catalog if it is older than 10 minutes, so open tabs pick up new programs
    if (db._programs && Date.now() - (db._loadedAt || 0) > 10 * 60 * 1000) { db._programs = null; db._loading = null; }
    if (db._programs) return db._programs;
    if (db._loading) return db._loading;
    db._loading = (async () => {
      let list = (window.RAASTA_PROGRAMS || []).filter((p) => p.active !== false);
      if (LIVE) {
        // only the columns the lists need; the program page loads the full row
        const cols = "id,university,program,degree,title,field,city,state,type,language,duration,tuition,intakes,deadline_winter,deadline_summer,url,program_url,apply_url,apply_via,verified_on,curated";
        const all = [];
        for (let from = 0; from < 20000; from += 1000) {
          const { data, error } = await sb.from("programs").select(cols).eq("active", true).order("id").range(from, from + 999);
          if (error) { all.length = 0; break; }
          all.push(...data);
          if (data.length < 1000) break;
        }
        if (all.length) list = all;
      }
      db._programs = list; db._loadedAt = Date.now(); return list;
    })();
    return db._loading;
  },
  async program(id) {
    if (LIVE) {
      const { data } = await sb.from("programs").select("*").eq("id", id).maybeSingle();
      if (data) return data;
    }
    return (await db.programs()).find((x) => x.id === id) || null;
  },
  async listSaved() {
    if (!LIVE) return local.get("saved", []);
    if (!session) return [];
    const { data, error } = await sb.from("saved_programs").select("program_id"); if (error) throw error;
    return data.map((r) => r.program_id);
  },
  async toggleSaved(id, on) {
    if (!LIVE) { const s = new Set(local.get("saved", [])); on ? s.add(id) : s.delete(id); local.set("saved", [...s]); return; }
    const q = on ? sb.from("saved_programs").upsert({ user_id: session.user.id, program_id: id })
                 : sb.from("saved_programs").delete().eq("program_id", id);
    const { error } = await q; if (error) throw error;
  },
  async getProfile() {
    if (!LIVE) return local.get("profile", null);
    const { data, error } = await sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    if (error) throw error; return data;
  },
  async saveProfile(p) {
    if (!LIVE) { local.set("profile", p); return; }
    const { error } = await sb.from("profiles").upsert({ ...p, id: session.user.id, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
  async sendFeedback(f) {
    if (!LIVE) { const all = local.get("feedback", []); all.unshift({ ...f, created_at: new Date().toISOString() }); local.set("feedback", all); return; }
    const { error } = await sb.from("feedback").insert({ ...f, user_id: session?.user.id ?? null });
    if (error) throw error;
  },
  async setChecklist(key, done) {
    if (!LIVE) { const c = local.get("checklist", {}); c[key] = done; local.set("checklist", c); return; }
    const { error } = await sb.from("checklist_items").upsert({ user_id: session.user.id, item_key: key, done }); if (error) throw error;
  }
};

async function askAI(payload) {
  if (!LIVE) {
    await new Promise((r) => setTimeout(r, 700));
    return demoReply(payload);
  }
  const { data, error } = await sb.functions.invoke("ai", { body: payload });
  if (error) {
    let msg = "Something went wrong. Please try again.";
    try { const body = await error.context.json(); if (body?.error) msg = body.error; } catch {}
    throw new Error(msg);
  }
  return data.reply;
}

function demoReply({ mode }) {
  if (mode === "letter") return "Dear Admissions Committee,\n\n[Demo mode] Once Supabase and the Claude API key are connected, your personal motivation letter will be written here, using only the facts you entered.\n\nSincerely,\n[Your name]";
  if (mode === "interview") return "[Demo mode] Question 1: Why did you choose this program, and why in Germany rather than Pakistan or another country?";
  return "[Demo mode] For the student visa you apply online on the Consular Services Portal: https://digital.diplo.de\n\nConnect Supabase and your Claude API key to get real answers.";
}

/* ---------------- Auth ---------------- */
function renderAuth() {
  const area = $("#authArea");
  if (!LIVE) { area.innerHTML = `<a href="#/profile" class="status planning" style="text-decoration:none">Demo profile</a>`; return; }
  if (session) {
    const name = session.user.user_metadata?.full_name || session.user.email;
    area.innerHTML = `<a href="#/profile" class="avatar" title="${esc(session.user.email)}">${esc((name || "?").trim()[0].toUpperCase())}</a><button class="btn link small" id="logoutBtn">Log out</button>`;
    $("#logoutBtn").onclick = async () => { await sb.auth.signOut(); toast("Logged out"); };
  } else {
    area.innerHTML = `<button class="btn link small" id="signinBtn">Sign in</button><button class="btn small" id="loginBtn">Sign up free</button>`;
    $("#loginBtn").onclick = () => openLogin(null, "signup");
    $("#signinBtn").onclick = () => openLogin(null, "signin");
  }
}

// Which sign-in methods are switched on in Supabase (public endpoint). Google button appears automatically once enabled.
let authSettings = null;
async function getAuthSettings() {
  if (authSettings || !LIVE) return authSettings || {};
  try {
    const r = await fetch(`${CFG.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: CFG.SUPABASE_ANON_KEY } });
    authSettings = await r.json();
  } catch { authSettings = {}; }
  return authSettings;
}

async function openLogin(reason, mode = "signup") {
  const st = await getAuthSettings();
  const isUp = mode === "signup";
  const google = Boolean(st?.external?.google) || Boolean(CFG.GOOGLE_LOGIN);
  const bg = document.createElement("div");
  bg.className = "modal-bg";
  bg.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
      <div class="auth-tabs" role="tablist">
        <button type="button" role="tab" class="${isUp ? "on" : ""}" data-mode="signup" aria-selected="${isUp}">Sign up</button>
        <button type="button" role="tab" class="${!isUp ? "on" : ""}" data-mode="signin" aria-selected="${!isUp}">Sign in</button>
      </div>
      <h2 id="loginTitle">${isUp ? "Create your free account" : "Welcome back"}</h2>
      <p>${esc(reason || (isUp ? "Save your universities, track deadlines and use the AI tools. No password needed." : "We'll email you a 6 digit code."))}</p>
      ${google ? `<button class="btn google" id="googleBtn" type="button"><svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        ${isUp ? "Sign up" : "Continue"} with Google
      </button>
      <div class="or"><span>or use your email</span></div>` : ""}
      <form id="loginForm">
        ${isUp ? `<div class="field"><label for="fullName">Full name</label><input id="fullName" required maxlength="120" placeholder="Ali Raza" autocomplete="name" /></div>` : ""}
        <div class="field"><label for="email">Email</label><input id="email" type="email" required placeholder="you@gmail.com" autocomplete="email" maxlength="200" /></div>
        ${isUp ? `<label class="check" style="font-weight:400;font-size:.85rem;margin-bottom:12px"><input type="checkbox" id="agree" required /> I agree to the <a href="#/privacy" target="_blank">privacy policy</a></label>` : ""}
        <button class="btn" style="width:100%">${isUp ? "Create account" : "Send me a code"}</button>
      </form>
      <button class="btn link" id="closeLogin" style="margin-top:8px;width:100%">Not now</button>
    </div>`;
  document.body.appendChild(bg);
  ($("#fullName", bg) || $("#email", bg)).focus();
  const close = () => bg.remove();
  bg.querySelectorAll("[data-mode]").forEach((t) => t.onclick = () => { if (t.dataset.mode !== mode) { close(); openLogin(reason, t.dataset.mode); } });
  $("#closeLogin", bg).onclick = close;
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  if ($("#googleBtn", bg)) $("#googleBtn", bg).onclick = async () => {
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname } });
    if (error) toast(error.message);
  };
  const friendly = (m) => /rate limit|too many|security purposes/i.test(m) ? "Too many attempts. Please wait a minute and try again." : m;

  const sendCode = async (email, fullName) => sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: isUp, ...(isUp && fullName ? { data: { full_name: fullName } } : {}) } });

  const showCodeStep = (email) => {
    $(".modal", bg).innerHTML = `
      <h2>Enter your code</h2>
      <p>We sent a code to <strong>${esc(email)}</strong>. Check spam if you don't see it in a minute.</p>
      <form id="codeForm">
        <div class="field"><label for="otp">Code from the email</label>
          <input id="otp" class="otp" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6,8}" maxlength="8" required placeholder="000000" /></div>
        <button class="btn" style="width:100%" id="verifyBtn">Verify and sign in</button>
      </form>
      <div class="otp-actions">
        <button class="btn link small" id="resendBtn" disabled>Resend code (60)</button>
        <button class="btn link small" id="changeEmail">Use another email</button>
      </div>`;
    const otp = $("#otp", bg); otp.focus();
    otp.addEventListener("input", () => { otp.value = otp.value.replace(/\D/g, ""); });
    let left = 60; const rb = $("#resendBtn", bg);
    const timer = setInterval(() => { left--; rb.textContent = left > 0 ? `Resend code (${left})` : "Resend code"; if (left <= 0) { rb.disabled = false; clearInterval(timer); } }, 1000);
    rb.onclick = async () => { rb.disabled = true; const { error } = await sendCode(email); toast(error ? friendly(error.message) : "New code sent"); left = 60; const t2 = setInterval(() => { left--; rb.textContent = left > 0 ? `Resend code (${left})` : "Resend code"; if (left <= 0) { rb.disabled = false; clearInterval(t2); } }, 1000); };
    $("#changeEmail", bg).onclick = () => { clearInterval(timer); close(); openLogin(reason); };
    $("#codeForm", bg).onsubmit = async (e) => {
      e.preventDefault();
      const vb = $("#verifyBtn", bg); if (vb.disabled) return;
      vb.disabled = true; vb.textContent = "Checking...";
      const { error } = await sb.auth.verifyOtp({ email, token: otp.value.trim(), type: "email" });
      if (error) { vb.disabled = false; vb.textContent = "Verify and sign in"; otp.select(); toast(/expired|invalid/i.test(error.message) ? "That code is wrong or expired. Check the latest email or resend." : friendly(error.message)); return; }
      clearInterval(timer); close(); toast(isUp ? "Account created. Welcome to Raasta!" : "You're signed in");
    };
  };

  $("#loginForm", bg).onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.submitter; btn.disabled = true; btn.textContent = "Sending...";
    const email = $("#email", bg).value.trim().toLowerCase();
    const fullName = $("#fullName", bg)?.value.trim();
    const { error } = await sendCode(email, fullName);
    if (error) {
      btn.disabled = false; btn.textContent = isUp ? "Create account" : "Send me a code";
      if (!isUp && /signups not allowed|not found|otp_disabled/i.test(error.message)) { toast("No account with this email yet. Please sign up."); close(); openLogin(reason, "signup"); return; }
      toast(friendly(error.message)); return;
    }
    showCodeStep(email);
  };
}

function needsLogin(title, text) {
  if (!LIVE || session) return false;
  app.innerHTML = `
    <div class="page-head"><h1>${esc(title)}</h1></div>
    <div class="card" style="max-width:520px">
      <div class="icon">🔒</div>
      <h3>Sign in to continue</h3>
      <p style="margin-bottom:16px">${esc(text)}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="gateLogin">Sign up free</button><button class="btn ghost" id="gateSignin">I have an account</button></div>
    </div>`;
  $("#gateLogin").onclick = () => openLogin(null, "signup");
  $("#gateSignin").onclick = () => openLogin(null, "signin");
  return true;
}

/* ---------------- Views ---------------- */
function viewHome() {
  app.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-in">
        <span class="eyebrow light">Free for students · Germany now, more of Europe next</span>
        <h1>Find your study program in Germany.<br/><span>Get in with your own AI advisor.</span></h1>
        <p class="lead">Search every international Bachelor's and Master's program in Germany, compare them side by side, then let AI help with your motivation letter, interview and student visa.</p>
        <form class="mega-search" id="megaSearch" role="search">
          <div class="ms-field ms-q"><label for="msQ">What do you want to study?</label><input id="msQ" type="search" placeholder="e.g. Data Science, MBA, Mechatronics" autocomplete="off" /></div>
          <div class="ms-field"><label for="msDeg">Degree</label><select id="msDeg"><option value="Master">Master's</option><option value="Bachelor">Bachelor's</option><option value="">Any degree</option></select></div>
          <div class="ms-field"><label for="msLang">Language</label><select id="msLang"><option value="">Any language</option><option value="en">English</option><option value="de">German</option></select></div>
          <button class="btn gold ms-go" type="submit">Search programs</button>
        </form>
        <div class="hero-stats" id="heroStats"><div><strong>…</strong><span>programs</span></div><div><strong>…</strong><span>universities</span></div><div><strong>…</strong><span>tuition free</span></div><div><strong>24/7</strong><span>AI advisor</span></div></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>Browse by field of study</h2><p>Pick a field to see every matching program.</p></div><a href="#/finder" class="btn ghost small">All programs</a></div>
      <div class="field-grid" id="fieldGrid">${FIELDS.map((f) => `<a class="field-card" href="#/finder?field=${encodeURIComponent(f)}"><span class="fc-ic">${FIELD_META[f].ic}</span><strong>${esc(FIELD_META[f].name)}</strong><em>${esc(FIELD_META[f].d)}</em><span class="fc-n" data-fcount="${esc(f)}"></span></a>`).join("")}</div>
    </section>

    <section class="section ai-moat">
      <div class="ai-moat-copy">
        <span class="eyebrow">Your AI advisor</span>
        <h2>Like a consultant, but free and awake at 2am.</h2>
        <p>Tell it your degree, CGPA and budget. It suggests real programs from our database, checks honestly if you fit, and explains every visa step in English or Urdu.</p>
        <ul class="ticks"><li>Program matches from ${"<span data-total>1,800+</span>"} real listings</li><li>Motivation letters written for one specific program</li><li>Mock interviews by voice, with feedback</li><li>Student visa checklist and blocked account help</li></ul>
      </div>
      <form class="ai-ask card" id="aiAsk">
        <div class="ai-bubble">Salam! Which program are you aiming for, and what did you study before?</div>
        <div class="chips">${["I have a BS Computer Science with 3.1 CGPA. Which Master's fit me?", "Which programs are tuition free and taught in English?", "What documents do I need for the German student visa?"].map((q) => `<button class="chip" type="button" data-q="${esc(q)}">${esc(q)}</button>`).join("")}</div>
        <div class="ai-input"><input id="aiQ" placeholder="Ask anything about studying in Germany" aria-label="Ask the AI advisor" /><button class="btn" type="submit">Ask</button></div>
      </form>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>From search to visa in four steps</h2><p>One place for the whole journey.</p></div></div>
      <div class="steps4">
        <a href="#/finder" class="s4"><span>1</span><strong>Explore</strong><em>Filter by field, language, tuition, deadline and city.</em></a>
        <a href="#/compare" class="s4"><span>2</span><strong>Compare</strong><em>Put up to 3 programs side by side and shortlist them.</em></a>
        <a href="#/letter" class="s4"><span>3</span><strong>Apply</strong><em>AI motivation letter, interview practice and a deadline tracker.</em></a>
        <a href="#/visa" class="s4"><span>4</span><strong>Get your visa</strong><em>Document checklist and step by step answers for Pakistan.</em></a>
      </div>
    </section>

    <section class="section" id="homeUnis"></section>
    <section class="section" id="homeSuggest"></section>

    <section class="section">
      <div class="section-head"><div><h2>Study destinations</h2><p>We start with Germany and add one country at a time, with the same depth.</p></div></div>
      <div class="dest-grid">
        <a class="dest live" href="#/finder"><span class="flag">🇩🇪</span><strong>Germany</strong><em>Low or no tuition at public universities, 18 months post study work visa.</em><span class="dest-tag">Live</span></a>
        <div class="dest"><span class="flag">🇮🇹</span><strong>Italy</strong><em>Affordable tuition and regional scholarships.</em><span class="dest-tag soon">Coming next</span></div>
        <div class="dest"><span class="flag">🇬🇧</span><strong>United Kingdom</strong><em>One year Master's and the Graduate Route.</em><span class="dest-tag soon">Planned</span></div>
        <div class="dest"><span class="flag">🇪🇺</span><strong>Rest of Europe</strong><em>Netherlands, France, Sweden and more.</em><span class="dest-tag soon">Planned</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div><h2>Free tools for your application</h2></div></div>
      <div class="grid cols-3">
        <a class="card" href="#/letter"><div class="icon">✍️</div><h3>Motivation letter</h3><p>A personal first draft for one program, with an honest fit check.</p></a>
        <a class="card" href="#/interview"><div class="icon">🎤</div><h3>Interview practice</h3><p>University and visa mock interviews, by voice or text.</p></a>
        <a class="card" href="#/tracker"><div class="icon">✅</div><h3>Application tracker</h3><p>Deadlines, status and every visa document in one checklist.</p></a>
      </div>
    </section>`;
  $("#megaSearch").onsubmit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams(); const v = $("#msQ").value.trim();
    if (v) q.set("q", v); if ($("#msDeg").value) q.set("degree", $("#msDeg").value); if ($("#msLang").value) q.set("lang", $("#msLang").value);
    location.hash = `#/finder${q.toString() ? "?" + q : ""}`;
  };
  const ask = (q) => { location.hash = `#/visa?q=${encodeURIComponent(q)}`; };
  app.querySelectorAll("#aiAsk [data-q]").forEach((b) => b.onclick = () => ask(b.dataset.q));
  $("#aiAsk").onsubmit = (e) => { e.preventDefault(); const v = $("#aiQ").value.trim(); if (v) ask(v); else $("#aiQ").focus(); };
  homeStats();
  homeSuggestions();
}

async function homeStats() {
  const progs = await db.programs();
  if (!$("#heroStats")) return;
  const unis = uniAggregate(progs);
  const n = (x) => x.toLocaleString("en-US");
  $("#heroStats").innerHTML = `<div><strong>${n(progs.length)}</strong><span>programs</span></div><div><strong>${n(unis.length)}</strong><span>universities</span></div><div><strong>${n(progs.filter((p) => p.tuition === 0).length)}</strong><span>tuition free</span></div><div><strong>24/7</strong><span>AI advisor</span></div>`;
  app.querySelectorAll("[data-total]").forEach((x) => (x.textContent = n(progs.length)));
  const counts = {}; progs.forEach((p) => (counts[p.field] = (counts[p.field] || 0) + 1));
  app.querySelectorAll("[data-fcount]").forEach((x) => (x.textContent = counts[x.dataset.fcount] ? `${n(counts[x.dataset.fcount])} programs` : ""));
  const top = unis.sort((a, b) => b.n - a.n).slice(0, 6);
  if ($("#homeUnis")) $("#homeUnis").innerHTML = `<div class="section-head"><div><h2>Popular universities</h2><p>Most international programs. Public, applied sciences and private.</p></div><a href="#/universities" class="btn ghost small">All ${unis.length} universities</a></div><div class="uni-grid">${top.map(uniCard).join("")}</div>`;
}

async function homeSuggestions() {
  const box = $("#homeSuggest"); if (!box) return;
  const progs = await db.programs();
  const prof = LIVE ? (session ? await db.getProfile().catch(() => null) : null) : local.get("profile", null);
  let list = progs.filter((p) => nextDeadline(p)).sort((a, b) => nextDeadline(a).date - nextDeadline(b).date);
  let title = "Deadlines coming up";
  if (prof?.field) {
    const mine = list.filter((p) => p.field === prof.field && (!prof.degree_level || prof.degree_level.startsWith(p.degree)));
    if (mine.length) { list = mine; title = "Suggested for you"; }
  }
  if (!list.length || !$("#homeSuggest")) return;
  const saved = new Set(await db.listSaved().catch(() => []));
  box.innerHTML = `<div class="section-head"><div><h2>${title}</h2><p>${title === "Suggested for you" ? "Based on your field and degree level." : "Programs with the nearest application deadlines."}</p></div><a href="#/finder" class="btn ghost small">See all programs</a></div>
    <div class="prog-grid">${list.slice(0, 3).map((p) => progCard(p, saved)).join("")}</div>`;
  bindSave(saved); bindCompare();
}

function viewRoadmap() {
  app.innerHTML = `
    <div class="page-head"><h1>Your roadmap to Germany</h1><p>Ten steps for a Master's student applying from Pakistan. Most winter semester deadlines fall in the first half of the year, so start early.</p></div>
    <ol class="steps">
      ${ROADMAP.map((s, i) => `
        <li class="step">
          <div class="step-num">${i + 1}</div>
          <div>
            <h3>${esc(s.t)}</h3>
            <p>${esc(s.d)}${s.link ? ` <a href="${s.link}" ${s.link.startsWith("#") ? "" : 'target="_blank" rel="noopener"'}>${esc(s.linkText)}${s.link.startsWith("#") ? " →" : " ↗"}</a>` : ""}</p>
            <span class="tag">${esc(s.tag)}</span>
          </div>
        </li>`).join("")}
    </ol>
    <div class="section" style="text-align:center">
      <a href="#/tracker" class="btn gold">Start tracking my applications</a>
    </div>`;
}

async function viewTracker() {
  if (needsLogin("Application tracker", "Your applications and checklist are saved to your free account, so you can open them on any phone or laptop.")) return;
  app.innerHTML = `<div class="page-head"><h1>Application tracker</h1><p>Loading...</p></div>`;
  let apps, checks, savedIds, progs;
  try { [apps, checks, savedIds, progs] = await Promise.all([db.listApps(), db.getChecklist(), db.listSaved(), db.programs()]); }
  catch (e) { app.innerHTML = `<div class="empty">Could not load your data: ${esc(e.message)}</div>`; return; }

  const allItems = CHECKLIST.flatMap((g) => g.items);
  const doneCount = allItems.filter((i) => checks[i.k]).length;
  const pct = Math.round((doneCount / allItems.length) * 100);

  app.innerHTML = `
    <div class="page-head">
      <h1>Application tracker</h1>
      <div class="progress-wrap"><div class="progress"><span style="width:${pct}%"></span></div><span class="progress-label">${pct}%</span></div>
      <p>${doneCount} of ${allItems.length} documents ready.</p>
    </div>
    <div class="grid cols-2" style="align-items:start">
      <section>
        <div class="card">
          <h2>My universities</h2>
          <form id="appForm">
            <div class="field"><label for="uni">University</label><input id="uni" required placeholder="e.g. TU Dortmund" /></div>
            <div class="field"><label for="prog">Program</label><input id="prog" required placeholder="e.g. M.Sc. Data Science" /></div>
            <div class="form-row">
              <div class="field"><label for="portal">Apply via</label>
                <select id="portal"><option>uni-assist</option><option>University portal</option><option>Email / other</option></select></div>
              <div class="field"><label for="deadline">Deadline</label><input id="deadline" type="date" /></div>
            </div>
            <button class="btn" style="width:100%">Add university</button>
          </form>
        </div>
        <div class="app-list" style="margin-top:14px">
          ${apps.length ? apps.map(appRow).join("") : `<div class="empty">No universities yet. <a href="#/finder">Find programs</a> or add one above.</div>`}
        </div>
        <div class="card" style="margin-top:14px">
          <h3>My shortlist</h3>
          ${savedIds.length ? `<ul class="shortlist">${progs.filter((p) => savedIds.includes(p.id)).map((p) => { const nd = nextDeadline(p); return `<li><a href="#/program?id=${p.id}"><strong>${esc(p.program)}</strong><span>${esc(p.university)}${nd ? ` · next deadline ${fmtDate(nd.date)}` : ""}</span></a></li>`; }).join("")}</ul>`
            : `<p>No saved programs yet. Tap ☆ Save in the <a href="#/finder">university finder</a>.</p>`}
        </div>
      </section>
      <section class="card">
        <h2>Document checklist</h2>
        ${CHECKLIST.map((g) => `
          <h3 style="margin-top:18px">${esc(g.group)}</h3>
          <ul class="checklist">
            ${g.items.map((i) => `
              <li class="${checks[i.k] ? "done" : ""}">
                <input type="checkbox" id="c_${i.k}" data-key="${i.k}" ${checks[i.k] ? "checked" : ""} />
                <label for="c_${i.k}" style="margin:0;font-weight:400;cursor:pointer">
                  <span class="doc-title">${esc(i.t)}</span>
                  ${i.n ? `<span class="doc-note">${esc(i.n)}</span>` : ""}
                </label>
              </li>`).join("")}
          </ul>`).join("")}
        <p class="notice">Based on the German Missions in Pakistan checklist. The portal questionnaire shows the final list for your case: <a href="${OFFICIAL.portal}" target="_blank" rel="noopener">digital.diplo.de</a></p>
      </section>
    </div>`;

  $("#appForm").onsubmit = async (e) => {
    e.preventDefault();
    const rec = { university: $("#uni").value.trim(), program: $("#prog").value.trim(), portal: $("#portal").value, deadline: $("#deadline").value || null, status: "planning" };
    try { await db.addApp(rec); toast("Added"); viewTracker(); } catch (err) { toast(err.message); }
  };
  app.querySelectorAll("[data-status]").forEach((sel) => sel.onchange = async () => {
    try { await db.updateApp(sel.dataset.status, { status: sel.value }); viewTracker(); } catch (err) { toast(err.message); }
  });
  app.querySelectorAll("[data-del]").forEach((b) => b.onclick = async () => {
    if (!confirmDelete(b)) return;
    try { await db.deleteApp(b.dataset.del); viewTracker(); } catch (err) { toast(err.message); }
  });
  app.querySelectorAll(".checklist input").forEach((cb) => cb.onchange = async () => {
    cb.closest("li").classList.toggle("done", cb.checked);
    const boxes = [...app.querySelectorAll(".checklist input")];
    const done = boxes.filter((b) => b.checked).length, p = Math.round((done / boxes.length) * 100);
    $(".progress > span").style.width = p + "%"; $(".progress-label").textContent = p + "%";
    $(".page-head p").textContent = `${done} of ${boxes.length} documents ready.`;
    try { await db.setChecklist(cb.dataset.key, cb.checked); } catch (err) { toast(err.message); }
  });
}

function confirmDelete(btn) {
  // Two tap delete, avoids browser dialogs
  if (btn.dataset.armed) return true;
  btn.dataset.armed = "1"; btn.textContent = "Tap again";
  setTimeout(() => { delete btn.dataset.armed; btn.textContent = "Remove"; }, 2500);
  return false;
}

function appRow(a) {
  const d = daysUntil(a.deadline);
  const due = a.deadline
    ? (d < 0 ? `Deadline passed` : d <= 14 ? `<span class="due-soon">${d} days left</span>` : `${d} days left`)
    : "No deadline set";
  const statuses = ["planning", "applied", "admitted", "rejected"];
  return `
    <div class="app-item">
      <div>
        <h4>${esc(a.university)} <span class="status ${esc(a.status)}">${esc(a.status)}</span></h4>
        <div class="app-meta"><span>${esc(a.program)}</span><span>${esc(a.portal)}</span><span>${due}</span>${a.url ? `<a href="${safeUrl(a.url)}" target="_blank" rel="noopener">Official page ↗</a>` : ""}</div>
      </div>
      <div class="app-actions">
        <select data-status="${a.id}" aria-label="Status">${statuses.map((s) => `<option value="${s}" ${s === a.status ? "selected" : ""}>${s[0].toUpperCase() + s.slice(1)}</option>`).join("")}</select>
        <button class="btn link small" data-del="${a.id}">Remove</button>
      </div>
    </div>`;
}

/* Chat based views share one component */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function speakText(text, lang) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const clean = text.replace(/\*\*/g, "").replace(/https?:\/\/\S+/g, "");
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = lang; u.rate = 0.98;
  const v = speechSynthesis.getVoices().find((x) => x.lang?.toLowerCase().startsWith(lang.slice(0, 2)));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

function chatView({ title, intro, mode, chips = [], opener, extraTop = "", getContext = () => ({}), voice = false }) {
  if (needsLogin(title, "Sign in free to use the AI. It keeps the service free by limiting daily use per student.")) return;
  const history = []; // {role, content}
  app.innerHTML = `
    <div class="page-head"><h1>${esc(title)}</h1><p>${intro}</p></div>
    ${extraTop}
    <div class="chat">
      <div class="chat-log" id="log"></div>
      ${chips.length ? `<div class="chips">${chips.map((c) => `<button class="chip">${esc(c)}</button>`).join("")}</div>` : ""}
      ${voice ? `<div class="voice-bar">
        <label class="check"><input type="checkbox" id="speakToggle" checked /> 🔊 Read questions aloud</label>
        <select id="voiceLang" aria-label="Voice language"><option value="en-US">English</option><option value="en-GB">English (UK)</option><option value="ur-PK">اردو Urdu</option></select>
        ${SR ? "" : `<span class="hint">Voice answers work in Chrome, Edge and Android. On iPhone use the keyboard mic.</span>`}
      </div>` : ""}
      <form class="chat-form" id="chatForm">
        ${voice && SR ? `<button type="button" class="mic" id="micBtn" aria-label="Answer by voice" title="Answer by voice">🎤</button>` : ""}
        <textarea id="chatInput" rows="1" placeholder="${voice ? "Tap 🎤 and speak your answer, or type..." : "Type in English or Urdu..."}" aria-label="Message"></textarea>
        <button class="btn" id="sendBtn">Send</button>
      </form>
    </div>
    <p class="notice">AI answers can be wrong. Always confirm on the official <a href="${OFFICIAL.visaPage}" target="_blank" rel="noopener">German Missions in Pakistan</a> page before you submit anything.</p>`;

  const log = $("#log");
  const add = (role, text, cls = "") => {
    const div = document.createElement("div");
    div.className = `msg ${role === "user" ? "user" : "ai"} ${cls}`;
    div.innerHTML = richText(text);
    log.appendChild(div); log.scrollTop = log.scrollHeight; return div;
  };
  const send = async (text, { hidden = false } = {}) => {
    if (!text.trim()) return;
    if (!hidden) add("user", text);
    app.querySelector(".chips")?.remove();
    history.push({ role: "user", content: text });
    const typing = add("ai", "Thinking...", "typing");
    $("#sendBtn").disabled = true;
    try {
      const reply = await askAI({ mode, messages: history.slice(-20), context: getContext() });
      typing.remove(); add("ai", reply);
      history.push({ role: "assistant", content: reply });
      if (voice && $("#speakToggle")?.checked) speakText(reply, $("#voiceLang").value);
    } catch (err) {
      typing.remove(); history.pop(); add("ai", err.message);
    } finally { $("#sendBtn").disabled = false; }
  };

  if (opener?.show) add("ai", opener.show);
  if (opener?.auto) send(opener.auto, { hidden: true });

  let rec = null;
  const stopRec = () => { if (rec) { rec.stop(); rec = null; } $("#micBtn")?.classList.remove("on"); };
  if ($("#micBtn")) $("#micBtn").onclick = () => {
    if (rec) { stopRec(); return; }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    rec = new SR(); rec.lang = $("#voiceLang").value; rec.interimResults = true; rec.continuous = true;
    const base = $("#chatInput").value ? $("#chatInput").value + " " : "";
    rec.onresult = (ev) => { let t = ""; for (const r of ev.results) t += r[0].transcript; $("#chatInput").value = base + t; };
    rec.onerror = (ev) => { toast(ev.error === "not-allowed" ? "Please allow microphone access in your browser" : "Voice stopped, tap the mic again"); stopRec(); };
    rec.onend = () => { $("#micBtn")?.classList.remove("on"); rec = null; };
    rec.start(); $("#micBtn").classList.add("on"); toast("Listening... tap the mic again when you finish");
  };
  $("#chatForm").onsubmit = (e) => { e.preventDefault(); stopRec(); const v = $("#chatInput").value; $("#chatInput").value = ""; send(v); };
  $("#chatInput").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm").requestSubmit(); } });
  app.querySelectorAll(".chip").forEach((c) => c.onclick = () => send(c.textContent));
  return { send };
}

function viewVisa() {
  chatView({
    title: "Your AI study advisor",
    intro: "Tell it your degree, CGPA and budget and it suggests matching programs from 2,000+ real listings. It also answers every question about applications and the student visa from Pakistan, based on the official embassy checklist. English, Urdu and Roman Urdu all work.",
    mode: "visa",
    chips: VISA_CHIPS,
    opener: { show: "Assalam o Alaikum! I can find programs that fit your background, explain how to apply, and help with the German student visa: documents, blocked account, the portal and the interview. What did you study, and what do you want to study in Germany?" }
  });
  const q = route.params?.get("q");
  if (q && $("#chatInput")) { $("#chatInput").value = q; $("#chatInput").focus(); }
}

function viewInterview() {
  const extraTop = `
    <div class="card" style="margin-bottom:16px">
      <div class="form-row">
        <div class="field" style="margin:0"><label for="ivType">Interview type</label>
          <select id="ivType"><option value="visa">Visa interview (embassy)</option><option value="university">University admission interview</option></select></div>
        <div class="field" style="margin:0"><label for="ivProg">Your program and university</label><input id="ivProg" placeholder="e.g. M.Sc. Data Science, TU Dortmund" /></div>
      </div>
      <button class="btn gold" id="ivStart" style="margin-top:14px">Start mock interview</button>
    </div>`;
  if (needsLogin("Interview practice", "Sign in free to practise. Daily use is limited per student to keep the service free.")) return;
  app.innerHTML = `<div class="page-head"><h1>Interview practice</h1><p>The AI interviewer asks 8 real questions and gives feedback on every answer. Use voice: it reads the questions aloud and you answer by speaking, just like the real interview.</p></div>${extraTop}`;
  const ivp = Number(route.params?.get("program"));
  if (ivp) db.program(ivp).then((p) => { if (p && $("#ivProg")) { $("#ivProg").value = `${p.title || ""} ${p.program}, ${p.university}`.trim(); $("#ivType").value = "university"; } });
  $("#ivStart").onclick = () => {
    const type = $("#ivType").value, program = $("#ivProg").value.trim();
    chatView({
      title: "Interview practice",
      intro: type === "visa" ? "Mock visa interview. Answer honestly and specifically, like you would at the embassy." : "Mock university admission interview. Show you know the program.",
      mode: "interview",
      voice: true,
      opener: { auto: "Start the interview now with question 1." },
      getContext: () => ({ type, program })
    });
  };
}

async function viewLetter() {
  if (needsLogin("Motivation letter builder", "Sign in free to generate your letter draft.")) return;
  const saved = local.get("letterForm", {});
  const lp = Number(route.params?.get("program"));
  const lprog = lp ? await db.program(lp).catch(() => null) : null;
  if (lprog) { saved.program = `${lprog.title ? lprog.title + " " : ""}${lprog.program}`; saved.university = lprog.university; }
  const f = (id, label, ph, area = false, hint = "") => `
    <div class="field"><label for="${id}">${label} ${hint ? `<span class="hint">${hint}</span>` : ""}</label>
    ${area ? `<textarea id="${id}" placeholder="${esc(ph)}">${esc(saved[id] || "")}</textarea>` : `<input id="${id}" placeholder="${esc(ph)}" value="${esc(saved[id] || "")}" />`}</div>`;
  app.innerHTML = `
    <div class="page-head"><h1>Motivation letter builder</h1><p>Tell us your real story. We turn it into a personal first draft. You then edit it in your own words.</p></div>
    ${lprog ? `<div class="callout" style="background:var(--green-soft);border-color:#C9E2D6;color:var(--green)"><strong>Writing for:</strong> ${esc(lprog.program)}, ${esc(lprog.university)}. Open the <a href="${safeUrl(lprog.program_url || lprog.url)}" target="_blank" rel="noopener">official page</a> and name real modules or labs in "Why this program".</div>` : ""}
    ${!LIVE ? `<div class="callout" style="background:var(--red-soft);border-color:#EBC4BB;color:var(--red)"><strong>Preview mode:</strong> letters are only written on the live site (GitHub Pages, connected to Supabase with the Claude API key). This preview shows a sample.</div>` : ""}
    <div class="callout"><strong>Why we don't give templates:</strong> universities check letters for copied text, and the visa officer compares your letter with your interview answers. A letter built from your own facts is safer and stronger.</div>
    <div class="grid cols-2" style="align-items:start">
      <form class="card" id="letterForm">
        <div class="form-row">${f("name", "Your name", "Ali Raza")}${f("program", "Program", "M.Sc. Data Science")}</div>
        ${f("university", "University", "TU Dortmund")}
        <div class="form-row">${f("degree", "Your Bachelor's", "BS Computer Science, FAST Lahore")}${f("cgpa", "CGPA", "3.4 / 4.0", false, "(optional)")}</div>
        ${f("experience", "Your strongest project, job or research", "Final year project on crop yield prediction using satellite data...", true)}
        ${f("whyProgram", "Why this program? Name specific courses, labs or professors", "The courses on machine learning and big data systems, the lab of...", true)}
        ${f("whyGermany", "Why Germany?", "Strong research in applied AI, practical focus, industry links...", true)}
        ${f("goals", "Your career goal after the degree", "Work on agricultural data systems, later bring this to Pakistan...", true)}
        <button class="btn gold" style="width:100%" id="genBtn">Write my draft</button>
        <p class="notice">Uses 5 of your daily AI credits.</p>
      </form>
      <section>
        <div id="letterOut" class="output" style="min-height:300px;color:var(--muted)">Your draft will appear here.</div>
        <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
          <button class="btn ghost small" id="copyBtn" disabled>Copy text</button>
        </div>
        <p class="notice">Checklist before sending: replace every [bracket], read it aloud, make sure every fact is true, and change at least a few sentences into your own voice.</p>
      </section>
    </div>`;

  const ids = ["name", "program", "university", "degree", "cgpa", "experience", "whyProgram", "whyGermany", "goals"];
  $("#letterForm").oninput = () => local.set("letterForm", Object.fromEntries(ids.map((i) => [i, $("#" + i).value])));
  $("#letterForm").onsubmit = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(ids.map((i) => [i, $("#" + i).value.trim()]));
    if (lprog) form.programFacts = [lprog.summary, `Language: ${lprog.language}`, lprog.duration ? `${lprog.duration} semesters` : "", [lprog.city, lprog.state].filter(Boolean).join(", "), lprog.type, lprog.english_req ? `English: ${lprog.english_req}` : ""].filter(Boolean).join(". ");
    if (!form.program || !form.experience || !form.whyProgram) { toast("Please fill in program, experience and why this program"); return; }
    const out = $("#letterOut"), btn = $("#genBtn");
    btn.disabled = true; btn.textContent = "Writing your draft..."; out.style.color = "var(--muted)"; out.textContent = "Writing, this takes about 20 seconds...";
    try {
      const reply = await askAI({ mode: "letter", messages: [{ role: "user", content: "Write my motivation letter." }], context: form });
      out.style.color = "var(--ink)"; out.textContent = reply; $("#copyBtn").disabled = false;
    } catch (err) { out.textContent = err.message; }
    finally { btn.disabled = false; btn.textContent = "Write a new draft"; }
  };
  $("#copyBtn").onclick = async () => {
    try { await navigator.clipboard.writeText($("#letterOut").textContent); toast("Copied"); } catch { toast("Select the text and copy it manually"); }
  };
}

/* ---------------- Router ---------------- */
const routes = { "": viewHome, roadmap: viewRoadmap, tracker: viewTracker, visa: viewVisa, letter: viewLetter, interview: viewInterview,
  finder: viewFinder, program: viewProgram, universities: viewUniversities, university: viewUniversity, compare: viewCompare,
  welcome: () => viewProfile(true), profile: () => viewProfile(false), privacy: viewPrivacy, admin: viewAdmin };
function route() {
  const key = location.hash.replace(/^#\/?/, "").split("?")[0];
  route.params = new URLSearchParams(location.hash.split("?")[1] || "");
  // Supabase magic link returns tokens in the hash; let the client read them first
  if (key.startsWith("access_token") || key.startsWith("error")) { history.replaceState(null, "", location.pathname + "#/"); return route(); }
  (routes[key] || viewHome)();
  const navKey = key === "program" ? "finder" : key === "university" ? "universities" : key;
  renderCompareBar();
  document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === (navKey || "home")));
  window.scrollTo(0, 0); app.focus({ preventScroll: true });
}

const APP_VERSION = (document.querySelector('script[src*="app.js"]')?.src.match(/v=([\w]+)/) || [])[1] || "";
async function checkVersion() {
  try {
    const html = await fetch(`./index.html?check=${Date.now()}`, { cache: "no-store" }).then((r) => r.text());
    const live = (html.match(/app\.js\?v=([\w]+)/) || [])[1];
    if (live && APP_VERSION && live !== APP_VERSION && !$("#updBar")) {
      const bar = document.createElement("div");
      bar.id = "updBar"; bar.className = "upd-bar";
      bar.innerHTML = `<span>Raasta was updated with new programs and features.</span><button class="btn gold small" type="button">Refresh now</button>`;
      bar.querySelector("button").onclick = () => location.reload();
      document.body.appendChild(bar);
    }
  } catch {}
}

async function init() {
  setInterval(checkVersion, 5 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkVersion(); });
  if (!LIVE) {
    $("#demoBanner").hidden = false;
    // Configured but could not connect: never silently fall back to demo with real users
    if (CONFIGURED) $("#demoBanner").innerHTML = `Could not connect to Raasta. Please refresh the page. If it keeps happening, try again in a few minutes.`;
  }
  if (LIVE) {
    const { data } = await sb.auth.getSession();
    session = data.session;
    sb.auth.onAuthStateChange((_e, s) => {
      const changed = Boolean(s) !== Boolean(session);
      session = s; renderAuth(); if (changed) maybeOnboard().then(route);
    });
  }
  renderAuth();
  window.addEventListener("hashchange", route);
  $("#fbBtn").onclick = openFeedback;
  await maybeOnboard();
  route();
}

async function maybeOnboard() {
  if (!LIVE || !session) return;
  try {
    const p = await db.getProfile();
    const key = location.hash.replace(/^#\/?/, "");
    if (!p && !["welcome", "privacy", "admin"].includes(key)) history.replaceState(null, "", location.pathname + "#/welcome");
  } catch {}
}
init();

/* ---------------- Profile / onboarding ---------------- */
async function viewProfile(isWelcome) {
  if (needsLogin("Your profile", "Sign in to create your free profile.")) return;
  const p = (await db.getProfile().catch(() => null)) || {};
  const metaName = session?.user.user_metadata?.full_name || "";
  const opt = (list, val) => list.map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("");
  const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir", "Living outside Pakistan"];
  const LEVELS = ["Master's", "Bachelor's", "PhD", "Language course / Studienkolleg"];
  const year = new Date().getFullYear();
  const INTAKES = [`Summer ${year + 1}`, `Winter ${year + 1}/${String(year + 2).slice(2)}`, `Summer ${year + 2}`, `Winter ${year + 2}/${String(year + 3).slice(2)}`, "Not sure yet"];
  app.innerHTML = `
    <div class="page-head">
      <h1>${isWelcome ? "Welcome to Raasta 👋" : "Your profile"}</h1>
      <p>${isWelcome ? "Four quick questions so we can guide you better. Takes 30 seconds." : "Update your details any time."}</p>
    </div>
    <form class="card" id="profileForm" style="max-width:620px">
      <div class="form-row">
        <div class="field"><label for="pName">Full name</label><input id="pName" required value="${esc(p.full_name || metaName)}" placeholder="Ali Raza" /></div>
        <div class="field"><label for="pCity">City</label><input id="pCity" value="${esc(p.city || "")}" placeholder="Lahore" /></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="pProv">Province <span class="hint">(decides Islamabad or Karachi)</span></label><select id="pProv"><option value="">Choose</option>${opt(PROVINCES, p.province)}</select></div>
        <div class="field"><label for="pLevel">I want to study</label><select id="pLevel">${opt(LEVELS, p.degree_level || "Master's")}</select></div>
      </div>
      <div class="form-row">
        <div class="field"><label for="pField">Field</label><select id="pField"><option value="">Choose</option>${opt(FIELDS, p.field)}</select></div>
        <div class="field"><label for="pIntake">Target intake</label><select id="pIntake"><option value="">Choose</option>${opt(INTAKES, p.intake)}</select></div>
      </div>
      <button class="btn gold" style="width:100%">${isWelcome ? "Start my roadmap" : "Save"}</button>
      ${session ? `<p class="notice">Signed in as ${esc(session.user.email)}</p>` : ""}
    </form>
    <div id="missionHint" class="callout" style="max-width:620px;margin-top:16px" hidden></div>`;
  const hint = () => {
    const v = $("#pProv").value, box = $("#missionHint");
    const msg = ["Sindh", "Balochistan"].includes(v) ? "Your visa goes to the German Consulate General in <strong>Karachi</strong>."
      : v && v !== "Living outside Pakistan" ? "Your visa goes to the German Embassy in <strong>Islamabad</strong>." : "";
    box.hidden = !msg; box.innerHTML = msg;
  };
  $("#pProv").onchange = hint; hint();
  $("#profileForm").onsubmit = async (e) => {
    e.preventDefault();
    const rec = { full_name: $("#pName").value.trim(), city: $("#pCity").value.trim(), province: $("#pProv").value, degree_level: $("#pLevel").value, field: $("#pField").value, intake: $("#pIntake").value };
    try { await db.saveProfile(rec); toast("Saved"); if (isWelcome) location.hash = "#/roadmap"; } catch (err) { toast(err.message); }
  };
}

/* ---------------- Feedback ---------------- */
function openFeedback() {
  if (LIVE && !session) { openLogin("Sign in free to send feedback. It keeps spam out."); return; }
  const page = location.hash.replace(/^#\/?/, "") || "home";
  const bg = document.createElement("div");
  bg.className = "modal-bg";
  bg.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="fbTitle">
      <h2 id="fbTitle">How is Raasta for you?</h2>
      <p>Your feedback decides what we build next.</p>
      <form id="fbForm">
        <div class="rating" role="radiogroup" aria-label="Rating">
          ${["😞", "😕", "😐", "🙂", "😍"].map((em, i) => `<label><input type="radio" name="rating" value="${i + 1}" ${i === 3 ? "checked" : ""}/><span>${em}</span></label>`).join("")}
        </div>
        <div class="field"><label for="fbMsg">What should we add or fix? <span class="hint">(English or Urdu)</span></label><textarea id="fbMsg" maxlength="2000" placeholder="e.g. Please add Bachelor's programs..."></textarea></div>
        <button class="btn" style="width:100%">Send feedback</button>
      </form>
      <button class="btn link" id="fbClose" style="margin-top:8px;width:100%">Close</button>
    </div>`;
  document.body.appendChild(bg);
  const close = () => bg.remove();
  $("#fbClose", bg).onclick = close;
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  $("#fbForm", bg).onsubmit = async (e) => {
    e.preventDefault();
    const rating = Number($("input[name=rating]:checked", bg)?.value || 0) || null;
    try { await db.sendFeedback({ rating, message: $("#fbMsg", bg).value.trim(), page }); close(); toast("Thank you! Shukriya 🙏"); }
    catch (err) { toast(err.message); }
  };
}

/* ---------------- Privacy ---------------- */
function viewPrivacy() {
  const contact = CFG.CONTACT_EMAIL ? `<a href="mailto:${esc(CFG.CONTACT_EMAIL)}">${esc(CFG.CONTACT_EMAIL)}</a>` : "[contact email]";
  app.innerHTML = `
    <div class="page-head"><h1>Privacy policy</h1><p>Plain language. Last updated ${new Date(2026, 10, 2).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</p></div>
    <div class="card" style="max-width:760px">
      <h3>Who runs Raasta</h3>
      <p>Raasta is a free project run from Berlin, Germany. Contact: ${contact}.</p>
      <h3>What we store</h3>
      <p>Your email and name (from Google or your email login), the profile you fill in (city, province, field, intake), the universities you add to your tracker, which checklist items you ticked, how many AI requests you made per day, and feedback you send.</p>
      <h3>What we do not store</h3>
      <p>We do not save your chat messages, interview answers or motivation letter text. They are sent to the AI to create an answer and then only kept in your browser tab. Do not upload or type passport numbers, CNIC numbers or bank details.</p>
      <h3>Who processes your data</h3>
      <p>Supabase (database and login, EU region), Anthropic (Claude AI, to answer your questions), Google (only if you choose Google login) and GitHub Pages (hosting the website).</p>
      <h3>Why</h3>
      <p>To run the service you asked for, to keep it free by limiting AI use per person, and to improve it from anonymous totals and your feedback. We never sell your data and send no marketing without asking.</p>
      <h3>Your rights</h3>
      <p>You can ask to see, correct or delete all your data at any time by email. Under the GDPR you can also complain to a data protection authority.</p>
      <h3>Not official advice</h3>
      <p>Raasta is not affiliated with DAAD, uni-assist or the German Missions in Pakistan. AI answers can be wrong. Always check the official sources before you submit anything.</p>
    </div>`;
}

/* ---------------- Admin dashboard ---------------- */
async function viewAdmin() {
  if (LIVE && !session) {
    app.innerHTML = `<div class="page-head"><h1>Admin</h1></div><div class="card" style="max-width:480px"><p style="margin-bottom:14px">Sign in with your admin email.</p><button class="btn" id="adminLogin">Sign in</button></div>`;
    $("#adminLogin").onclick = () => openLogin(); return;
  }
  app.innerHTML = `<div class="page-head"><h1>Admin dashboard</h1><p>Loading...</p></div>`;
  let st, health;
  try {
    if (LIVE) {
      const [r, h] = await Promise.all([sb.rpc("admin_stats"), sb.functions.invoke("ai", { body: { mode: "ping" } })]);
      if (r.error) throw r.error; st = r.data; health = h.error ? null : h.data;
    } else { st = demoStats(); health = { ai: false, demo: true }; }
  } catch (err) {
    const notAdmin = /not_admin/.test(err.message || "");
    app.innerHTML = `<div class="page-head"><h1>Admin dashboard</h1></div><div class="card" style="max-width:560px">
      <h3>${notAdmin ? "This account is not an admin" : "Could not load stats"}</h3>
      <p>${notAdmin ? `Add <strong>${esc(session.user.email)}</strong> to the admins table in Supabase (see README, step 2).` : esc(err.message)}</p></div>`;
    return;
  }

  const kpi = (label, val, sub = "") => `<div class="kpi"><span class="kpi-label">${esc(label)}</span><span class="kpi-val">${esc(val ?? 0)}</span>${sub ? `<span class="kpi-sub">${esc(sub)}</span>` : ""}</div>`;
  const bars = (rows, unit = "") => {
    if (!rows?.length) return `<div class="empty">No data yet</div>`;
    const max = Math.max(...rows.map((r) => Number(r.n)), 1);
    return `<div class="bars">${rows.map((r) => `<div class="bar-row"><span class="bar-label" title="${esc(r.label)}">${esc(r.label)}</span><span class="bar-track"><span class="bar-fill" style="width:${(Number(r.n) / max) * 100}%"></span></span><span class="bar-val">${esc(r.n)}${unit}</span></div>`).join("")}</div>`;
  };
  const daily = st.daily || [];
  const dmax = Math.max(...daily.map((d) => Math.max(Number(d.signups), 1)), 1);
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const status = (ok, yes, no) => `<span class="status ${ok ? "admitted" : "rejected"}">${ok ? yes : no}</span>`;

  app.innerHTML = `
    <div class="page-head"><h1>Admin dashboard</h1><p>${LIVE ? "Live data from Supabase." : "Demo mode: numbers come from this browser only."} Updated ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}. <button class="btn link small" id="refresh">Refresh</button></p></div>

    <div class="card" style="margin-bottom:16px">
      <h3>System status</h3>
      <div class="sys">
        <span>Database ${status(LIVE, "Connected", "Not connected")}</span>
        <span>Login ${status(LIVE, "Google + email", "Demo")}</span>
        <span>AI assistant ${status(health?.ai, "Live", health ? "No API key" : "Function not deployed")}</span>
        ${health?.models ? `<span class="hint">Models: ${esc(health.models.fast)} / ${esc(health.models.writer)}, ${esc(health.dailyCredits)} credits per student per day</span>` : ""}
      </div>
    </div>

    <div class="kpis">
      ${kpi("Students", st.students, `+${st.new_7d} this week`)}
      ${kpi("Profiles done", st.profiles, st.students ? `${Math.round((st.profiles / st.students) * 100)}% of students` : "")}
      ${kpi("AI users today", st.active_today, `${st.ai_today} credits today`)}
      ${kpi("AI credits, 7 days", st.ai_7d)}
      ${kpi("Universities tracked", st.applications, `${st.admitted} admitted`)}
      ${kpi("Feedback", st.feedback_count, st.avg_rating ? `Average ${st.avg_rating} / 5` : "")}
    </div>

    <div class="card" style="margin-top:16px">
      <h3>Sign ups, last 14 days</h3>
      <div class="cols" role="img" aria-label="Daily sign ups for the last 14 days">
        ${daily.map((d) => `<div class="col" title="${fmt(d.day)}: ${d.signups} sign ups, ${d.ai} AI credits"><span class="col-val">${Number(d.signups) || ""}</span><span class="col-bar" style="height:${(Number(d.signups) / dmax) * 100}%"></span><span class="col-label">${fmt(d.day).split(" ")[0]}</span></div>`).join("")}
      </div>
    </div>

    <div class="grid cols-3" style="margin-top:16px">
      <div class="card"><h3>Fields</h3>${bars(st.fields)}</div>
      <div class="card"><h3>Provinces</h3>${bars(st.provinces)}</div>
      <div class="card"><h3>Top universities tracked</h3>${bars(st.top_universities)}</div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Most saved programs (finder)</h3>${bars(st.top_saved)}</div>

    <div class="card" style="margin-top:16px">
      <h3>Latest feedback</h3>
      ${st.recent_feedback?.length ? `<div class="table-wrap"><table><thead><tr><th>Rating</th><th>Message</th><th>Page</th><th>From</th><th>Date</th></tr></thead><tbody>
        ${st.recent_feedback.map((f) => `<tr><td>${f.rating ? "★".repeat(f.rating) : ""}</td><td>${esc(f.message || "")}</td><td>${esc(f.page || "")}</td><td>${esc(f.email || "Guest")}</td><td>${fmt(f.created_at)}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="empty">No feedback yet</div>`}
    </div>

    <div class="card" style="margin-top:16px">
      <h3>Newest students</h3>
      ${st.recent_students?.length ? `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>City</th><th>Field</th><th>Intake</th><th>Login</th><th>Joined</th></tr></thead><tbody>
        ${st.recent_students.map((u) => `<tr><td>${esc(u.full_name || "")}</td><td>${esc(u.email || "")}</td><td>${esc(u.city || "")}</td><td>${esc(u.field || "")}</td><td>${esc(u.intake || "")}</td><td>${esc(u.provider)}</td><td>${fmt(u.created_at)}</td></tr>`).join("")}
      </tbody></table></div>` : `<div class="empty">No students yet</div>`}
    </div>`;
  $("#refresh").onclick = viewAdmin;
}

function demoStats() {
  const apps = local.get("apps", []), fb = local.get("feedback", []), prof = local.get("profile", null), checks = local.get("checklist", {});
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const daily = Array.from({ length: 14 }, (_, i) => ({ day: new Date(today - (13 - i) * 86400000).toISOString(), signups: i === 13 ? 1 : 0, ai: 0 }));
  const count = (arr, k) => Object.entries(arr.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {})).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
  const rated = fb.filter((f) => f.rating);
  return {
    students: 1, new_7d: 1, active_today: 0, profiles: prof ? 1 : 0, applications: apps.length,
    admitted: apps.filter((a) => a.status === "admitted").length, docs_ticked: Object.values(checks).filter(Boolean).length,
    ai_today: 0, ai_7d: 0, feedback_count: fb.length,
    avg_rating: rated.length ? (rated.reduce((s, f) => s + f.rating, 0) / rated.length).toFixed(1) : null,
    daily, top_universities: count(apps, "university").slice(0, 8),
    top_saved: (local.get("saved", [])).map((id) => ({ label: (window.RAASTA_PROGRAMS || []).find((p) => p.id === id)?.program || String(id), n: 1 })),
    fields: prof?.field ? [{ label: prof.field, n: 1 }] : [], provinces: prof?.province ? [{ label: prof.province, n: 1 }] : [],
    recent_students: [{ email: "you (demo)", full_name: prof?.full_name, city: prof?.city, field: prof?.field, intake: prof?.intake, provider: "demo", created_at: new Date().toISOString() }],
    recent_feedback: fb.slice(0, 25)
  };
}

/* ---------------- University finder ---------------- */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function nextDeadline(p) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const opts = [];
  for (const [mmdd, intake] of [[p.deadline_winter, "Winter"], [p.deadline_summer, "Summer"]]) {
    if (!mmdd) continue;
    const [m, d] = mmdd.split("-").map(Number);
    let dt = new Date(today.getFullYear(), m - 1, d);
    if (dt < today) dt = new Date(today.getFullYear() + 1, m - 1, d);
    opts.push({ date: dt, intake, days: Math.round((dt - today) / 86400000) });
  }
  return opts.sort((a, b) => a.date - b.date)[0] || null;
}
const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
const mmddText = (mmdd) => { const [m, d] = mmdd.split("-").map(Number); return `${d} ${MONTHS[m - 1]}`; };
function tuitionText(p) {
  if (p.tuition === 0) return "No tuition";
  if (p.tuition == null) return "Check page";
  return `€${Number(p.tuition).toLocaleString("en-US")} / semester`;
}
const mono = (name) => (String(name || "?").replace(/\b(University|of|the|Applied|Sciences|and|for|Hochschule|Technische|Universität|in)\b/gi, " ").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("") || String(name || "?")[0]).toUpperCase();
const langPill = (p) => {
  const l = p.language || "English";
  if (/german/i.test(l) && /english/i.test(l)) return `<span class="pill pill-lang">English and German</span>`;
  if (/german/i.test(l)) return `<span class="pill pill-lang">German taught</span>`;
  return "";
};
const compareList = () => local.get("compare", []);
function progCard(p, saved) {
  const nd = nextDeadline(p);
  const dl = nd ? `<span class="${nd.days <= 30 ? "due-soon" : ""}">${nd.intake}: ${mmddText(`${String(nd.date.getMonth() + 1).padStart(2, "0")}-${String(nd.date.getDate()).padStart(2, "0")}`)} (${nd.days} days)</span>` : `<span>Deadline: see page</span>`;
  const inCmp = compareList().includes(p.id);
  return `
    <article class="prog-card">
      <a href="#/program?id=${p.id}" class="prog-main">
        <div class="prog-head"><span class="mono" aria-hidden="true">${esc(mono(p.university))}</span><div>
          <div class="prog-top"><span class="pill ${p.degree === "Master" ? "pill-green" : "pill-gold"}">${esc(p.title || p.degree)}</span>${p.tuition === 0 ? `<span class="pill pill-free">Tuition free</span>` : ""}${p.type === "Private university" ? `<span class="pill">Private</span>` : ""}${langPill(p)}</div>
        </div></div>
        <h3>${esc(p.program)}</h3>
        <p class="prog-uni">${esc(p.university)}</p>
        <div class="prog-facts">
          <span>📍 ${esc(p.city || "Germany")}</span>
          <span>⏱ ${p.duration ? `${p.duration} semesters` : "Duration: see page"}</span>
          <span>💶 ${esc(tuitionText(p))}</span>
          <span>📅 ${dl}</span>
        </div>
      </a>
      <div class="prog-actions">
        <a href="#/program?id=${p.id}" class="btn small">Details</a>
        ${p.program_url ? `<a href="${safeUrl(p.program_url)}" target="_blank" rel="noopener" class="btn ghost small">University page ↗</a>` : ""}
        <button class="btn ghost small save-btn" data-save="${p.id}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id) ? "★ Saved" : "☆ Save"}</button>
        <button class="btn ghost small cmp-btn" data-compare="${p.id}" aria-pressed="${inCmp}">${inCmp ? "✓ Comparing" : "⇄ Compare"}</button>
      </div>
    </article>`;
}

function bindCompare() {
  app.querySelectorAll("[data-compare]").forEach((b) => b.onclick = (e) => {
    e.preventDefault();
    const id = Number(b.dataset.compare); let list = compareList();
    if (list.includes(id)) list = list.filter((x) => x !== id);
    else { if (list.length >= 3) { toast("You can compare up to 3 programs. Remove one first."); return; } list.push(id); }
    local.set("compare", list);
    app.querySelectorAll(`[data-compare="${id}"]`).forEach((x) => { const on = list.includes(id); x.textContent = on ? "✓ Comparing" : "⇄ Compare"; x.setAttribute("aria-pressed", on); });
    renderCompareBar();
  });
  renderCompareBar();
}
function renderCompareBar() {
  let bar = $("#cmpBar");
  const list = compareList();
  const onPage = (location.hash.replace(/^#\/?/, "").split("?")[0]) === "compare";
  if (!list.length || onPage) { bar?.remove(); return; }
  if (!bar) { bar = document.createElement("div"); bar.id = "cmpBar"; bar.className = "cmp-bar"; document.body.appendChild(bar); }
  bar.innerHTML = `<span><strong>${list.length}</strong> of 3 programs selected</span><button class="btn link small" id="cmpClear" type="button">Clear</button><a class="btn gold small" href="#/compare">Compare now →</a>`;
  $("#cmpClear").onclick = () => { local.set("compare", []); app.querySelectorAll("[data-compare]").forEach((x) => { x.textContent = "⇄ Compare"; x.setAttribute("aria-pressed", "false"); }); renderCompareBar(); };
}

async function viewCompare() {
  const ids = compareList();
  app.innerHTML = `<div class="page-head"><h1>Compare programs</h1><p>Loading...</p></div>`;
  if (!ids.length) { app.innerHTML = `<div class="page-head"><h1>Compare programs</h1><p>Pick up to 3 programs with the ⇄ Compare button in the finder.</p></div><div class="empty"><a href="#/finder" class="btn">Find programs</a></div>`; renderCompareBar(); return; }
  const rows = (await Promise.all(ids.map((id) => db.program(id).catch(() => null)))).filter(Boolean);
  const nd = (p) => { const n = nextDeadline(p); return n ? `${fmtDate(n.date)} (${n.intake})` : "See page"; };
  const R = [
    ["University", (p) => `<a href="#/university?name=${encodeURIComponent(p.university)}">${esc(p.university)}</a>`],
    ["Degree", (p) => esc(p.title || p.degree)], ["City", (p) => esc([p.city, p.state].filter(Boolean).join(", "))],
    ["University type", (p) => esc(p.type || "")], ["Teaching language", (p) => esc(p.language || "English")],
    ["Duration", (p) => (p.duration ? `${p.duration} semesters` : "See page")], ["Tuition (non EU)", (p) => esc(tuitionText(p))],
    ["Semester fee", (p) => esc(p.semester_fee || "See page")], ["Intakes", (p) => esc((p.intakes || []).join(", ") || "See page")],
    ["Next deadline", (p) => nd(p)], ["English requirement", (p) => esc(p.english_req || "See page")],
    ["Apply via", (p) => esc(p.apply_via || "See page")]
  ];
  app.innerHTML = `
    <a href="#/finder" class="back">← Back to programs</a>
    <div class="page-head"><h1>Compare programs</h1><p>Side by side, with deadlines for non EU applicants. Always confirm on the official page.</p></div>
    <div class="card table-wrap cmp-table"><table>
      <thead><tr><th></th>${rows.map((p) => `<th><a href="#/program?id=${p.id}" class="cmp-name">${esc(p.program)}</a><button class="btn link small" data-rm="${p.id}" type="button">Remove</button></th>`).join("")}</tr></thead>
      <tbody>${R.map(([k, f]) => `<tr><td class="cmp-k">${k}</td>${rows.map((p) => `<td>${f(p)}</td>`).join("")}</tr>`).join("")}
      <tr><td class="cmp-k"></td>${rows.map((p) => `<td><div class="cmp-actions">${p.program_url ? `<a class="btn small" href="${safeUrl(p.program_url)}" target="_blank" rel="noopener">University page ↗</a>` : ""}<a class="btn ghost small" href="#/letter?program=${p.id}">Write letter</a></div></td>`).join("")}</tr></tbody>
    </table></div>
    <div class="ai-strip card"><div><h3>Not sure which one fits you?</h3><p>Ask the AI advisor to compare them against your degree, CGPA and budget.</p></div>
      <a class="btn gold" href="#/visa?q=${encodeURIComponent(`Help me choose between: ${rows.map((p) => `${p.program} at ${p.university}`).join("; ")}. My background is: `)}">Ask the AI advisor</a></div>`;
  app.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { local.set("compare", compareList().filter((x) => x !== Number(b.dataset.rm))); viewCompare(); });
}

function uniAggregate(progs) {
  const m = new Map();
  for (const p of progs) {
    const k = p.university; if (!k) continue;
    let u = m.get(k);
    if (!u) { u = { name: k, city: p.city, state: p.state, type: p.type, n: 0, master: 0, bachelor: 0, free: 0, fields: new Map(), hosts: new Map() }; m.set(k, u); }
    u.n++; p.degree === "Master" ? u.master++ : u.bachelor++; if (p.tuition === 0) u.free++;
    u.fields.set(p.field, (u.fields.get(p.field) || 0) + 1);
    try { if (p.program_url) { const h = new URL(p.program_url).origin; u.hosts.set(h, (u.hosts.get(h) || 0) + 1); } } catch {}
  }
  for (const u of m.values()) {
    u.site = [...u.hosts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    u.topField = [...u.fields.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
  return [...m.values()];
}
function uniCard(u) {
  return `<a class="uni-card" href="#/university?name=${encodeURIComponent(u.name)}">
    <span class="mono big" aria-hidden="true">${esc(mono(u.name))}</span>
    <div class="uni-body"><h3>${esc(u.name)}</h3><p>📍 ${esc([u.city, u.state].filter(Boolean).join(", ") || "Germany")}</p>
      <div class="uni-tags"><span class="pill">${esc(u.type || "University")}</span>${u.free ? `<span class="pill pill-free">${u.free} tuition free</span>` : ""}</div></div>
    <div class="uni-count"><strong>${u.n}</strong><span>program${u.n === 1 ? "" : "s"}</span></div>
  </a>`;
}

async function viewUniversities() {
  app.innerHTML = `<div class="page-head"><h1>Universities in Germany</h1><p>Loading...</p></div>`;
  const unis = uniAggregate(await db.programs());
  const f = Object.assign({ q: "", type: "", state: "", sort: "n" }, Object.fromEntries(route.params || []));
  const states = [...new Set(unis.map((u) => u.state).filter(Boolean))].sort();
  const opt = (v, l, c) => `<option value="${esc(v)}" ${v === c ? "selected" : ""}>${esc(l)}</option>`;
  app.innerHTML = `
    <div class="page-hero">
      <span class="eyebrow light">Germany</span>
      <h1>${unis.length} universities with international programs</h1>
      <p>Public universities, universities of applied sciences and private universities. Open a university to see all of its programs.</p>
    </div>
    <div class="uni-tools card">
      <input id="uq" type="search" placeholder="Search a university or city" value="${esc(f.q)}" aria-label="Search universities" />
      <select id="utype" aria-label="Type">${opt("", "All types", f.type)}${opt("University", "Public university", f.type)}${opt("University of Applied Sciences", "University of Applied Sciences", f.type)}${opt("Private university", "Private university", f.type)}</select>
      <select id="ustate" aria-label="State">${opt("", "All states", f.state)}${states.map((x) => opt(x, x, f.state)).join("")}</select>
      <select id="usort" aria-label="Sort">${opt("n", "Most programs", f.sort)}${opt("free", "Most tuition free", f.sort)}${opt("az", "A to Z", f.sort)}</select>
    </div>
    <p class="count" id="ucount"></p>
    <div class="uni-grid" id="ulist"></div>`;
  const render = () => {
    const q = $("#uq").value.trim().toLowerCase(), t = $("#utype").value, st = $("#ustate").value, so = $("#usort").value;
    let list = unis.filter((u) => (!q || `${u.name} ${u.city}`.toLowerCase().includes(q)) && (!t || u.type === t) && (!st || u.state === st));
    list.sort(so === "az" ? (a, b) => a.name.localeCompare(b.name) : so === "free" ? (a, b) => b.free - a.free : (a, b) => b.n - a.n);
    $("#ucount").textContent = `${list.length} universit${list.length === 1 ? "y" : "ies"}`;
    $("#ulist").innerHTML = list.slice(0, 300).map(uniCard).join("") || `<div class="empty">No university matches.</div>`;
  };
  app.querySelectorAll(".uni-tools input, .uni-tools select").forEach((el) => el.addEventListener(el.type === "search" ? "input" : "change", render));
  render();
}

async function viewUniversity() {
  const name = route.params.get("name") || "";
  app.innerHTML = `<div class="empty">Loading university...</div>`;
  const progs = (await db.programs()).filter((p) => p.university === name);
  if (!progs.length) { app.innerHTML = `<div class="empty">University not found. <a href="#/universities">All universities</a></div>`; return; }
  const u = uniAggregate(progs)[0];
  const saved = new Set(await db.listSaved().catch(() => []));
  const fields = [...u.fields.entries()].sort((a, b) => b[1] - a[1]);
  app.innerHTML = `
    <a href="#/universities" class="back">← All universities</a>
    <div class="uni-hero">
      <span class="mono xl" aria-hidden="true">${esc(mono(u.name))}</span>
      <div><h1>${esc(u.name)}</h1><p>📍 ${esc([u.city, u.state].filter(Boolean).join(", "))} · ${esc(u.type || "University")}</p>
        <div class="prog-cta">${u.site ? `<a class="btn gold" href="${safeUrl(u.site)}" target="_blank" rel="noopener">University website ↗</a>` : ""}<a class="btn ghost light" href="#/visa?q=${encodeURIComponent(`Which programs at ${u.name} fit my profile? My Bachelor's is in `)}">Ask the AI about this university</a></div></div>
    </div>
    <div class="stat-row">
      <div><strong>${u.n}</strong><span>Programs</span></div>
      <div><strong>${u.master}</strong><span>Master's</span></div>
      <div><strong>${u.bachelor}</strong><span>Bachelor's</span></div>
      <div><strong>${u.free}</strong><span>Tuition free</span></div>
    </div>
    ${u.type === "Private university" ? `<div class="callout"><strong>Private university:</strong> tuition is usually higher, but admission can be faster and more flexible. Check that the degree is state recognised before you pay any fee.</div>` : ""}
    <section class="section">
      <div class="section-head"><div><h2>Programs</h2><p>${fields.map(([f, n]) => `${esc(FIELD_META[f]?.name || f)} (${n})`).join(" · ")}</p></div>
        <div class="seg small-seg" role="radiogroup" aria-label="Degree">${["", "Master", "Bachelor"].map((d) => `<label><input type="radio" name="udeg" value="${d}" ${d === "" ? "checked" : ""}/><span>${d || "All"}</span></label>`).join("")}</div></div>
      <div class="prog-grid" id="uprogs"></div>
    </section>`;
  const render = () => {
    const d = (app.querySelector("input[name=udeg]:checked") || {}).value || "";
    const list = progs.filter((p) => !d || p.degree === d).sort((a, b) => a.program.localeCompare(b.program));
    $("#uprogs").innerHTML = list.map((p) => progCard(p, saved)).join("") || `<div class="empty">No ${d} programs here.</div>`;
    bindSave(saved); bindCompare();
  };
  app.querySelectorAll("input[name=udeg]").forEach((r) => r.onchange = render);
  render();
}

async function viewFinder() {
  app.innerHTML = `<div class="page-head"><h1>Find your university</h1><p>Loading programs...</p></div>`;
  const [progs, savedList, prof] = await Promise.all([
    db.programs(),
    db.listSaved().catch(() => []),
    (LIVE ? (session ? db.getProfile() : null) : local.get("profile", null)) ?? null
  ].map((x) => Promise.resolve(x).catch(() => null)));
  const saved = new Set(savedList || []);
  const hasParams = [...(route.params || [])].length > 0;
  const f = Object.assign({ q: "", degree: "", field: "", lang: "", tuition: "", duration: "", intake: "", deadline: "", state: "", type: "", sort: "deadline", savedOnly: "" },
    hasParams ? {} : local.get("finderFilters", {}), Object.fromEntries(route.params || []));
  if (!hasParams && !local.get("finderFilters", null) && prof) { if (prof.field && FIELDS.includes(prof.field)) f.field = prof.field; if (prof.degree_level?.startsWith("Bachelor")) f.degree = "Bachelor"; else if (prof.degree_level?.startsWith("Master")) f.degree = "Master"; }
  const states = [...new Set(progs.map((p) => p.state).filter(Boolean))].sort();
  const fields = [...new Set(progs.map((p) => p.field))];
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(label)}</option>`;
  const lastCheck = progs.map((p) => p.verified_on).filter(Boolean).sort().pop();

  app.innerHTML = `
    <div class="page-head">
      <h1>Find your study program</h1>
      <p>Bachelor's and Master's programs at public and private universities in Germany, taught in English or German. Filter, compare, then go to the official page.</p>
    </div>
    <div class="finder">
      <aside class="filters card" id="filters">
        <div class="filters-head"><h3>Filters</h3><button class="btn link small" id="resetF" type="button">Reset</button></div>
        <div class="field"><label for="fq">Search</label><input id="fq" type="search" placeholder="e.g. data science, Munich, MBA" value="${esc(f.q)}" /></div>
        <div class="field"><label>Degree</label>
          <div class="seg" role="radiogroup" aria-label="Degree">${["", "Master", "Bachelor"].map((d) => `<label><input type="radio" name="fdegree" value="${d}" ${f.degree === d ? "checked" : ""}/><span>${d || "All"}</span></label>`).join("")}</div></div>
        <div class="field"><label for="ffield">Field</label><select id="ffield">${opt("", "All fields", f.field)}${FIELDS.filter((x) => fields.includes(x)).map((x) => opt(x, x, f.field)).join("")}</select></div>
        <div class="field"><label for="flang">Teaching language</label><select id="flang">${opt("", "Any language", f.lang)}${opt("en", "English", f.lang)}${opt("de", "German", f.lang)}${opt("both", "English and German", f.lang)}</select></div>
        <div class="field"><label for="ftuition">Tuition (non EU)</label><select id="ftuition">${opt("", "Any", f.tuition)}${opt("free", "Tuition free only", f.tuition)}${opt("1500", "Up to €1,500 / semester", f.tuition)}</select></div>
        <div class="field"><label for="fduration">Duration</label><select id="fduration">${opt("", "Any", f.duration)}${opt("3", "3 semesters or less", f.duration)}${opt("4", "4 semesters", f.duration)}${opt("6", "6 semesters or more", f.duration)}</select></div>
        <div class="field"><label for="fintake">Intake</label><select id="fintake">${opt("", "Any", f.intake)}${opt("Winter", "Winter (starts Oct)", f.intake)}${opt("Summer", "Summer (starts Apr)", f.intake)}</select></div>
        <div class="field"><label for="fdeadline">Next deadline</label><select id="fdeadline">${opt("", "Any", f.deadline)}${opt("30", "Within 1 month", f.deadline)}${opt("90", "Within 3 months", f.deadline)}${opt("180", "Within 6 months", f.deadline)}${opt("known", "Has a listed deadline", f.deadline)}</select></div>
        <div class="field"><label for="fstate">State</label><select id="fstate">${opt("", "All of Germany", f.state)}${states.map((x) => opt(x, x, f.state)).join("")}</select></div>
        <div class="field"><label for="ftype">University type</label><select id="ftype">${opt("", "Any", f.type)}${opt("University", "University", f.type)}${opt("University of Applied Sciences", "University of Applied Sciences", f.type)}${opt("Private university", "Private university", f.type)}</select></div>
        <label class="check"><input type="checkbox" id="fsaved" ${f.savedOnly ? "checked" : ""}/> Only my saved programs</label>
      </aside>
      <section>
        <div class="results-bar">
          <span id="count" class="count"></span>
          <div class="results-tools">
            <button class="btn ghost small" id="toggleF" type="button">Filters</button>
            <label for="fsort" class="sr-only">Sort</label>
            <select id="fsort" class="sort">${opt("deadline", "Soonest deadline", f.sort)}${opt("tuition", "Lowest tuition", f.sort)}${opt("duration", "Shortest", f.sort)}${opt("az", "A to Z", f.sort)}</select>
          </div>
        </div>
        <div id="activeF" class="active-filters"></div>
        <div id="bachelorNote"></div>
        <div id="results" class="prog-list"></div>
        <p class="notice">${progs.length.toLocaleString("en-US")} programs from the DAAD International Programmes database and the official websites of private universities, last checked ${lastCheck ? fmtDate(new Date(lastCheck)) : "recently"}. Deadlines shown are for non EU applicants and can change, always confirm on the official university page. Missing something? Tell us with the Feedback button.</p>
      </section>
    </div>`;

  const read = () => ({
    q: $("#fq").value.trim(), degree: (app.querySelector("input[name=fdegree]:checked") || {}).value || "",
    field: $("#ffield").value, lang: $("#flang").value, tuition: $("#ftuition").value, duration: $("#fduration").value, intake: $("#fintake").value,
    deadline: $("#fdeadline").value, state: $("#fstate").value, type: $("#ftype").value, sort: $("#fsort").value, savedOnly: $("#fsaved").checked ? "1" : ""
  });
  const render = () => {
    const c = read(); local.set("finderFilters", c);
    const q = c.q.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    let list = progs.filter((p) => {
      if (words.length) { const hay = `${p.program} ${p.university} ${p.city} ${p.field} ${p.title || ""}`.toLowerCase(); if (!words.every((w) => hay.includes(w))) return false; }
      if (c.degree && p.degree !== c.degree) return false;
      if (c.field && p.field !== c.field) return false;
      if (c.lang) { const l = p.language || "English", en = /english/i.test(l), de = /german/i.test(l); if ((c.lang === "en" && !en) || (c.lang === "de" && !de) || (c.lang === "both" && !(en && de))) return false; }
      if (c.tuition === "free" && p.tuition !== 0) return false;
      if (c.tuition === "1500" && !(p.tuition != null && p.tuition <= 1500)) return false;
      if (c.duration === "3" && !(p.duration && p.duration <= 3)) return false;
      if (c.duration === "4" && p.duration !== 4) return false;
      if (c.duration === "6" && !(p.duration && p.duration >= 6)) return false;
      if (c.intake && !(p.intakes || []).includes(c.intake)) return false;
      const nd = nextDeadline(p);
      if (c.deadline === "known" && !nd) return false;
      if (["30", "90", "180"].includes(c.deadline) && !(nd && nd.days <= Number(c.deadline))) return false;
      if (c.state && p.state !== c.state) return false;
      if (c.type && p.type !== c.type) return false;
      if (c.savedOnly && !saved.has(p.id)) return false;
      return true;
    });
    const big = 1e9;
    const key = {
      deadline: (p) => nextDeadline(p)?.days ?? big,
      tuition: (p) => p.tuition ?? big,
      duration: (p) => p.duration ?? big,
      az: (p) => p.program.toLowerCase()
    }[c.sort];
    list.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
    // Profile matches first
    if (prof?.field) list.sort((a, b) => (b.field === prof.field) - (a.field === prof.field));
    $("#count").textContent = `${list.length.toLocaleString("en-US")} program${list.length === 1 ? "" : "s"}`;
    // Show every active filter as a removable chip, so remembered filters are never hidden
    const LBL = { q: (v) => `“${v}”`, degree: (v) => v, field: (v) => FIELD_META[v]?.name || v, lang: (v) => ({ en: "English", de: "German", both: "English and German" })[v], tuition: (v) => (v === "free" ? "Tuition free" : "Up to €1,500"), duration: (v) => ({ 3: "3 semesters or less", 4: "4 semesters", 6: "6+ semesters" })[v], intake: (v) => `${v} intake`, deadline: (v) => (v === "known" ? "Has a deadline" : `Deadline within ${Math.round(v / 30)} month${v > 30 ? "s" : ""}`), state: (v) => v, type: (v) => v, savedOnly: () => "Saved only" };
    const act = Object.entries(c).filter(([k, v]) => v && LBL[k]);
    $("#activeF").innerHTML = act.length ? `${act.map(([k, v]) => `<button type="button" class="fchip" data-clear="${k}">${esc(LBL[k](v))} <span aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>`).join("")}${act.length > 1 ? `<button type="button" class="btn link small" data-clear="all">Clear all</button>` : ""}` : "";
    $("#activeF").querySelectorAll("[data-clear]").forEach((b) => b.onclick = () => {
      const k = b.dataset.clear;
      if (k === "all") { $("#resetF").click(); return; }
      if (k === "degree") app.querySelector("input[name=fdegree][value='']").checked = true;
      else if (k === "savedOnly") $("#fsaved").checked = false;
      else { const el = { q: "#fq", field: "#ffield", lang: "#flang", tuition: "#ftuition", duration: "#fduration", intake: "#fintake", deadline: "#fdeadline", state: "#fstate", type: "#ftype" }[k]; if (el) $(el).value = ""; }
      history.replaceState(null, "", "#/finder"); render();
    });
    $("#bachelorNote").innerHTML = c.degree === "Bachelor" ? `<div class="callout"><strong>Bachelor's from Pakistan:</strong> with an Intermediate (HSSC) certificate you usually need a Studienkolleg (foundation year) or one to two years of university study in Pakistan before direct entry. Check your exact case with uni-assist or the university.</div>` : "";
    const PAGE = 30;
    let shown = 0;
    const more = () => {
      const next = list.slice(shown, shown + PAGE);
      $("#moreBtn")?.remove();
      $("#results").insertAdjacentHTML("beforeend", next.map((p) => progCard(p, saved)).join(""));
      shown += next.length;
      if (shown < list.length) {
        $("#results").insertAdjacentHTML("beforeend", `<button class="btn ghost" id="moreBtn" type="button" style="grid-column:1/-1;justify-self:center">Show more (${list.length - shown} left)</button>`);
        $("#moreBtn").onclick = more;
      }
      bindSave(saved); bindCompare();
    };
    $("#results").innerHTML = list.length ? "" : `<div class="empty">No programs match these filters yet. Try removing a filter. Missing your field? Tell us with the Feedback button so we add it.</div>`;
    if (list.length) more();
  };
  app.querySelectorAll("#filters input, #filters select, #fsort").forEach((el) => el.addEventListener(el.type === "search" ? "input" : "change", render));
  $("#resetF").onclick = () => { history.replaceState(null, "", "#/finder"); local.set("finderFilters", {}); route.params = new URLSearchParams(); app.querySelectorAll("#filters select").forEach((s) => (s.value = "")); $("#fq").value = ""; $("#fsaved").checked = false; app.querySelector("input[name=fdegree][value='']").checked = true; render(); };
  $("#toggleF").onclick = () => $("#filters").classList.toggle("open");
  render();
}

function bindSave(saved, rerender) {
  app.querySelectorAll("[data-save]").forEach((b) => b.onclick = async (e) => {
    e.preventDefault();
    if (LIVE && !session) { openLogin("Sign in free to save programs to your shortlist."); return; }
    const id = Number(b.dataset.save), on = !saved.has(id);
    try {
      await db.toggleSaved(id, on);
      on ? saved.add(id) : saved.delete(id);
      app.querySelectorAll(`[data-save="${id}"]`).forEach((x) => { x.textContent = on ? "★ Saved" : "☆ Save"; x.setAttribute("aria-pressed", on); });
      toast(on ? "Saved to your shortlist" : "Removed from shortlist");
      rerender?.();
    } catch (err) { toast(err.message); }
  });
}

async function viewProgram() {
  const id = Number(route.params.get("id"));
  app.innerHTML = `<div class="empty">Loading program...</div>`;
  const [progs, p] = await Promise.all([db.programs(), db.program(id)]);
  if (!p) { app.innerHTML = `<div class="empty">Program not found. <a href="#/finder">Back to the finder</a></div>`; return; }
  const saved = new Set(await db.listSaved().catch(() => []));
  const nd = nextDeadline(p);
  const similar = progs.filter((x) => x.id !== p.id && x.field === p.field && x.degree === p.degree && x.university !== p.university).sort((a, b) => (b.curated === true) - (a.curated === true) || (nextDeadline(a)?.days ?? 1e9) - (nextDeadline(b)?.days ?? 1e9)).slice(0, 3);
  const row = (k, v) => v ? `<div class="fact"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>` : "";
  const needs = [
    p.degree === "Master" ? "Bachelor's degree and transcripts (HEC attested for the visa)" : "School certificates (Matric and Intermediate or O/A levels), plus Studienkolleg or university study if required",
    p.english_req ? `English: ${p.english_req}` : "Proof of English (IELTS or TOEFL, check the minimum score on the official page)",
    p.other_req,
    "CV",
    "Motivation letter written for this program",
    p.degree === "Master" ? "Usually: letters of recommendation" : null,
    "Passport copy",
    p.apply_via && p.apply_via !== "Check program page" ? `Apply via: ${p.apply_via}` : "Check on the official page whether you apply via uni-assist or the university portal"
  ].filter(Boolean);

  app.innerHTML = `
    <a href="#/finder" class="back">← All programs</a>
    <div class="prog-hero card">
      <div class="prog-top"><span class="pill ${p.degree === "Master" ? "pill-green" : "pill-gold"}">${esc(p.title || p.degree)}</span>${p.tuition === 0 ? `<span class="pill pill-free">Tuition free</span>` : ""}<span class="pill">${esc(p.type || "")}</span></div>
      <h1>${esc(p.program)}</h1>
      <p class="prog-uni big"><a href="#/university?name=${encodeURIComponent(p.university)}">${esc(p.university)}</a> · ${esc([p.city, p.state].filter(Boolean).join(", "))}</p>
      ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
      <div class="prog-cta">
        <a class="btn gold" href="${safeUrl(p.program_url || p.url)}" target="_blank" rel="noopener">Open university page ↗</a>
        ${p.apply_url ? `<a class="btn" href="${safeUrl(p.apply_url)}" target="_blank" rel="noopener">Go to application ↗</a>` : ""}
        <button class="btn ghost save-btn" data-save="${p.id}" aria-pressed="${saved.has(p.id)}">${saved.has(p.id) ? "★ Saved" : "☆ Save"}</button>
        <button class="btn ghost" id="trackBtn">+ Add to tracker</button>
        <button class="btn ghost cmp-btn" data-compare="${p.id}" aria-pressed="${compareList().includes(p.id)}">${compareList().includes(p.id) ? "✓ Comparing" : "⇄ Compare"}</button>
      </div>
    </div>

    <div class="grid cols-2" style="margin-top:16px;align-items:start">
      <section class="card">
        <h2>Key facts</h2>
        <div class="facts">
          ${row("Degree", p.title || p.degree)}
          ${row("Field", p.field)}
          ${row("Teaching language", p.language)}
          ${row("English requirement", p.english_req)}
          ${row("Duration", p.duration ? `${p.duration} semesters` : "See official page")}
          ${row("Intake", (p.intakes || []).join(" and "))}
          ${row("Tuition (non EU)", tuitionText(p))}
          ${row("Tuition note", p.tuition_note)}
          ${row("Semester fee", p.semester_fee)}
          ${row("Apply via", p.apply_via)}
        </div>
      </section>
      <section class="card">
        <h2>Deadlines (non EU)</h2>
        ${nd ? `<div class="deadline-big ${nd.days <= 30 ? "soon" : ""}"><span>Next deadline</span><strong>${fmtDate(nd.date)}</strong><em>${nd.intake} intake · ${nd.days} days left</em></div>` : `<div class="callout">No fixed deadline in our data. Check the official page.</div>`}
        <div class="facts">
          ${p.deadline_winter ? row("Winter intake", mmddText(p.deadline_winter)) : ""}
          ${p.deadline_summer ? row("Summer intake", mmddText(p.deadline_summer)) : ""}
        </div>
        ${p.deadline_note ? `<p class="notice">${esc(p.deadline_note)}</p>` : ""}
      </section>
    </div>

    <section class="card" style="margin-top:16px">
      <h2>What you need to apply</h2>
      <ul class="needs">${needs.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
      ${/uni-assist/i.test((p.apply_url || "") + (p.apply_via || "")) ? `<div class="callout" style="margin-top:14px"><strong>What is uni-assist?</strong> Many German universities ask international applicants to send documents to uni-assist first. They check your certificates (fee per application), then forward them to the university. Create one account at <a href="https://my.uni-assist.de/" target="_blank" rel="noopener">my.uni-assist.de</a> and use it for all such programs.</div>` : ""}
      <div class="apply-steps">
        <a class="apply-step" href="${safeUrl(p.program_url || p.url)}" target="_blank" rel="noopener"><span>1</span><div><strong>Read the program page</strong><em>Modules, exact requirements, documents</em></div></a>
        ${p.apply_url ? `<a class="apply-step" href="${safeUrl(p.apply_url)}" target="_blank" rel="noopener"><span>2</span><div><strong>Open the application page</strong><em>${/uni-assist/i.test(p.apply_url) ? "uni-assist portal" : "University application portal"}</em></div></a>` : `<div class="apply-step"><span>2</span><div><strong>Find "Apply" on the program page</strong><em>The university explains its portal there</em></div></div>`}
        <a class="apply-step" href="#/letter?program=${p.id}"><span>3</span><div><strong>Write your motivation letter</strong><em>For this program, in Raasta</em></div></a>
      </div>
      <p class="notice">Checked ${p.verified_on ? fmtDate(new Date(p.verified_on)) : "recently"} from ${p.curated ? "the university and " : ""}the <a href="${safeUrl(p.url)}" target="_blank" rel="noopener">DAAD listing</a>. The university page always has the final word.</p>
    </section>

    <section class="grid cols-3" style="margin-top:16px">
      <a class="card" href="#/letter?program=${p.id}"><div class="icon">✍️</div><h3>Write your motivation letter</h3><p>Start a personal draft for this exact program.</p></a>
      <a class="card" href="#/visa?q=${encodeURIComponent(`I want to apply for ${p.program} at ${p.university}. What should I prepare and in which order?`)}"><div class="icon">💬</div><h3>Ask the AI</h3><p>Get a step by step plan for this program in English or Urdu.</p></a>
      <a class="card" href="#/interview?program=${p.id}"><div class="icon">🎤</div><h3>Practise the interview</h3><p>Mock university or visa interview for this program.</p></a>
    </section>

    ${similar.length ? `<section class="section"><div class="section-head"><div><h2>Similar programs</h2><p>Same field and degree at other universities.</p></div></div><div class="prog-grid">${similar.map((x) => progCard(x, saved)).join("")}</div></section>` : ""}`;

  bindSave(saved); bindCompare();
  $("#trackBtn").onclick = async () => {
    if (LIVE && !session) { openLogin("Sign in free to track your applications."); return; }
    const d = nd ? nd.date : null;
    const deadline = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null;
    const portal = /uni-assist/i.test(p.apply_via || "") ? "uni-assist" : "University portal";
    try {
      await db.addApp({ university: p.university, program: `${p.title ? p.title + " " : ""}${p.program}`, portal, deadline, status: "planning", program_id: p.id, url: p.apply_url || p.program_url || p.url });
      toast("Added to your tracker"); $("#trackBtn").textContent = "✓ In tracker"; $("#trackBtn").disabled = true;
    } catch (err) { toast(err.message); }
  };
}
