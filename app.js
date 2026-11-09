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
// Specific subjects inside the broad fields, matched on the program name
const SUBJECTS = [
  ["Graphic and Communication Design", /graphic|communication design|visual communication|illustration|typograph|grafik/i],
  ["Digital Marketing, Branding and Social Media", /marketing|social media|influencer|brand|advertising|public relations/i],
  ["3D Animation, Games and VFX", /animation|\b3d\b|game|vfx|visual effects|motion design/i],
  ["Film, Video and Photography", /film|cinema|video|photograph|documentary|television/i],
  ["UX, UI and Interaction Design", /\bux\b|user experience|interaction design|interface design|human.computer/i],
  ["Fashion and Textile", /fashion|textile/i],
  ["Architecture and Interior Design", /architect|interior|urban design/i],
  ["Product and Industrial Design", /product design|industrial design/i],
  ["Media, Journalism and Communication", /journalis|\bmedia\b|communication(?! design)/i],
  ["Fine Arts, Music and Performing Arts", /fine art|\barts?\b|music|theatre|dance|performing/i],
  ["Data Science and AI", /data|artificial intelligence|machine learning|\bai\b/i],
  ["Computer Science and Software", /computer science|informati|software|computing|devops|web development/i],
  ["Cyber Security", /cyber|security/i],
  ["Business Administration and Management", /business|management|\bmba\b|entrepreneur/i],
  ["Finance, Accounting and Economics", /financ|accounting|banking|econom/i],
  ["Logistics and Supply Chain", /logistic|supply chain/i],
  ["Mechanical, Automotive and Aerospace", /mechanic|automotive|mechatron|aero|vehicle/i],
  ["Electrical and Electronics", /electri|electronic|embedded|semiconductor/i],
  ["Civil, Energy and Environment", /civil|energy|renewable|environment|water|sustainab|climate/i],
  ["Health and Public Health", /health|medic|nurs|pharma/i],
  ["Psychology", /psycholog/i],
  ["Biology and Biotech", /\bbio|molecular|life science/i],
  ["Physics, Chemistry and Mathematics", /physic|chemi|mathemat/i],
  ["Law, Politics and Social Sciences", /\blaw\b|\bllm\b|legal|politic|international relations|governance|public policy|social science|sociolog/i]
];
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
        const cols = "id,university,program,degree,title,field,city,state,type,language,nc_status,duration,tuition,intakes,deadline_winter,deadline_summer,url,program_url,apply_url,apply_via,verified_on,curated";
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
    area.innerHTML = `<a href="#/profile" class="avatar" title="Your profile (${esc(session.user.email)})">${window.__avatar ? `<img src="${esc(window.__avatar)}" alt="" />` : esc(initials(name))}</a><button class="btn link small" id="logoutBtn">Log out</button>`;
    if (window.__avatar === undefined) { window.__avatar = null; db.getProfile().then((pr) => { if (pr?.avatar_url) { window.__avatar = pr.avatar_url; renderAuth(); } }).catch(() => {}); }
    $("#logoutBtn").onclick = async () => { await sb.auth.signOut(); window.__avatar = undefined; toast("Logged out"); };
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
        ${!isUp ? `<div class="field"><label for="pwIn">Password <span class="hint">(only if you set one, otherwise leave empty)</span></label><input id="pwIn" type="password" autocomplete="current-password" maxlength="72" /></div>` : ""}
        ${isUp ? `<label class="check" style="font-weight:400;font-size:.85rem;margin-bottom:12px"><input type="checkbox" id="agree" required /> I agree to the <a href="#/privacy" target="_blank">privacy policy</a></label>` : ""}
        <button class="btn" style="width:100%" id="loginSubmit">${isUp ? "Create account" : "Send me a code"}</button>
      </form>
      <button class="btn link" id="closeLogin" style="margin-top:8px;width:100%">Not now</button>
    </div>`;
  document.body.appendChild(bg);
  ($("#fullName", bg) || $("#email", bg)).focus();
  if ($("#pwIn", bg)) $("#pwIn", bg).addEventListener("input", (e) => { $("#loginSubmit", bg).textContent = e.target.value ? "Sign in" : "Send me a code"; });
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
    const pw = $("#pwIn", bg)?.value;
    if (!isUp && pw) {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) { btn.disabled = false; btn.textContent = "Sign in"; toast(/invalid/i.test(error.message) ? "Email or password is wrong. Leave the password empty to get a code instead." : friendly(error.message)); return; }
      close(); toast("You're signed in"); return;
    }
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
      <div class="subj-chips">${["Graphic and Communication Design", "Digital Marketing, Branding and Social Media", "3D Animation, Games and VFX", "UX, UI and Interaction Design", "Data Science and AI", "Business Administration and Management"].map((n) => `<a class="chip" href="#/finder?subject=${encodeURIComponent(n)}">${esc(n)}</a>`).join("")}</div>
      <div class="field-grid" id="fieldGrid">${FIELDS.map((f) => `<a class="field-card" href="#/finder?field=${encodeURIComponent(f)}"><span class="fc-ic">${FIELD_META[f].ic}</span><strong>${esc(FIELD_META[f].name)}</strong><em>${esc(FIELD_META[f].d)}</em><span class="fc-n" data-fcount="${esc(f)}"></span></a>`).join("")}</div>
    </section>

    <section class="section"><a class="sch-home card" href="#/scholarships"><span class="fc-ic">🎓</span><div><strong>Scholarships for Pakistani students</strong><em>DAAD, Erasmus Mundus, foundations and university discounts, with criteria, documents and deadlines.</em></div><span class="btn gold small">See scholarships</span></a></section>

    <section class="section ai-moat">
      <div class="ai-moat-copy">
        <span class="eyebrow">Your AI advisor</span>
        <h2>Like a consultant, but free and awake at 2am.</h2>
        <p>Tell it your degree, CGPA and budget. It suggests real programs from our database, checks honestly if you fit, and explains every visa step in English or Urdu.</p>
        <ul class="ticks"><li>Program matches from ${"<span data-total>1,800+</span>"} real listings</li><li>Motivation letters written for one specific program</li><li>Mock interviews by voice, with feedback</li><li>Student visa checklist and blocked account help</li></ul>
      </div>
      <form class="ai-ask card" id="aiAsk">
        <div class="ai-bubble">Hello! Which program are you aiming for, and what did you study before?</div>
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
        <a class="card" href="#/doccheck"><div class="icon">📄</div><h3>AI document checker</h3><p>Completeness, consistency and fit for a program, plus your German grade.</p></a>
        <a class="card" href="#/visa-guide"><div class="icon">🛂</div><h3>Visa guide for Pakistan</h3><p>Step by step, with 2026 fees and the blocked account. Dated.</p></a>
        <a class="card" href="#/moving"><div class="icon">🧳</div><h3>Moving to Germany</h3><p>Registration, insurance, housing, banks, transport and culture.</p></a>
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

function profileSummary(p) {
  if (!p) return "";
  const parts = [p.degree_level && `wants: ${p.degree_level}`, p.field && `field: ${p.field}`, p.bachelor_degree && `current degree: ${p.bachelor_degree}`, p.bachelor_university && `from ${p.bachelor_university}`, p.cgpa && `CGPA: ${p.cgpa}`, p.grad_year && `graduated: ${p.grad_year}`, p.english_test && `English: ${p.english_test}${p.english_score ? " " + p.english_score : ""}`, p.german_level && `German: ${p.german_level}`, p.budget && `budget: ${p.budget}`, p.intake && `intake: ${p.intake}`, p.province && `province: ${p.province}`];
  return parts.filter(Boolean).join("; ");
}
function viewVisa() {
  let prof = "";
  if (LIVE && session) db.getProfile().then((p) => { prof = profileSummary(p); }).catch(() => {});
  chatView({
    getContext: () => ({ profile: prof }),
    title: "Your AI study advisor",
    intro: "Tell it your degree, CGPA and budget and it suggests matching programs from 2,000+ real listings. It also answers every question about applications and the student visa from Pakistan, based on the official embassy checklist. English, Urdu and Roman Urdu all work.",
    mode: "visa",
    chips: VISA_CHIPS,
    opener: { show: "Hello! I can find programs that fit your background, explain how to apply, and help with the German student visa: documents, blocked account, the portal and the interview. What did you study, and what do you want to study in Germany?" }
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
  cities: viewCities, city: viewCity, "visa-guide": viewVisaGuide, moving: viewMoving, grades: viewGrades, jobs: viewJobs, support: viewSupport, help: viewSupport, tools: () => viewHub("tools"), guides: () => viewHub("guides"), scholarships: viewScholarships, scholarship: viewScholarship, doccheck: () => viewDocCheck(),
  welcome: () => viewProfile(true), profile: () => viewProfile(false), privacy: viewPrivacy, impressum: viewImpressum, imprint: viewImpressum, admin: viewAdmin };
function route() {
  const key = location.hash.replace(/^#\/?/, "").split("?")[0];
  route.params = new URLSearchParams(location.hash.split("?")[1] || "");
  // Supabase magic link returns tokens in the hash; let the client read them first
  if (key.startsWith("access_token") || key.startsWith("error")) { history.replaceState(null, "", location.pathname + "#/"); return route(); }
  (routes[key] || viewHome)();
  const navKey = { scholarship: "scholarships", program: "finder", university: "universities", city: "cities", "visa-guide": "guides", moving: "guides", jobs: "guides", letter: "tools", interview: "tools", doccheck: "tools", grades: "tools", compare: "tools" }[key] || key;
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
    if (!p && !["welcome", "privacy", "impressum", "imprint", "support", "help", "admin"].includes(key)) history.replaceState(null, "", location.pathname + "#/welcome");
  } catch {}
}
init();

/* ---------------- Profile / onboarding ---------------- */
const COUNTRY_CODES = [["+92", "Pakistan"], ["+49", "Germany"], ["+971", "UAE"], ["+966", "Saudi Arabia"], ["+44", "UK"], ["+1", "USA / Canada"], ["+974", "Qatar"], ["+968", "Oman"], ["+973", "Bahrain"], ["+965", "Kuwait"], ["+60", "Malaysia"], ["+90", "Turkey"]];
const initials = (n) => String(n || "?").trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
function avatarHTML(url, name, cls = "") {
  return url ? `<img class="av-img ${cls}" src="${esc(url)}" alt="" referrerpolicy="no-referrer" />` : `<span class="av-ini ${cls}">${esc(initials(name))}</span>`;
}
// Resize and centre crop to 320x320 JPEG. Re-encoding also strips EXIF data such as GPS location.
async function prepareAvatar(file) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/i.test(file.type)) throw new Error("Please choose a JPG, PNG or WebP photo.");
  if (file.size > 12 * 1024 * 1024) throw new Error("That photo is too large (max 12 MB).");
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Could not read that image.")); i.src = URL.createObjectURL(file); });
  const S = 320, c = document.createElement("canvas"); c.width = c.height = S;
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  c.getContext("2d").drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, S, S);
  URL.revokeObjectURL(img.src);
  return await new Promise((res) => c.toBlob(res, "image/jpeg", 0.86));
}

async function viewProfile(isWelcome) {
  if (needsLogin("Your profile", "Sign in to create your free profile.")) return;
  const p = (await db.getProfile().catch(() => null)) || {};
  const metaName = session?.user.user_metadata?.full_name || "";
  const opt = (list, val) => list.map((o) => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("");
  const PROVINCES = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad", "Gilgit-Baltistan", "Azad Kashmir", "Living outside Pakistan"];
  const LEVELS = ["Master's", "Bachelor's", "PhD", "Language course / Studienkolleg"];
  const year = new Date().getFullYear();
  const INTAKES = [`Summer ${year + 1}`, `Winter ${year + 1}/${String(year + 2).slice(2)}`, `Summer ${year + 2}`, `Winter ${year + 2}/${String(year + 3).slice(2)}`, "Not sure yet"];
  const TESTS = ["Not taken yet", "IELTS Academic", "TOEFL iBT", "PTE Academic", "Duolingo English Test", "Cambridge (C1 / C2)", "English medium of instruction letter"];
  const GERMAN = ["None", "A1", "A2", "B1", "B2", "C1", "C2"];
  const BUDGETS = ["Only tuition free public universities", "Up to €3,000 per year", "€3,000 to €8,000 per year", "€8,000 to €15,000 per year", "More than €15,000 per year"];
  const name = p.full_name || metaName;
  const phone = p.phone || "";
  const cc = COUNTRY_CODES.map((c) => c[0]).sort((x, y) => y.length - x.length).find((c) => phone.startsWith(c)) || "+92";
  const local = phone ? phone.slice(cc.length) : "";
  const hasPassword = Boolean(session?.user?.user_metadata?.has_password);
  const filled = ["full_name", "phone", "city", "province", "field", "intake", "bachelor_degree", "cgpa", "english_test", "avatar_url"].filter((k) => p[k]).length;
  const pct = Math.round((filled / 10) * 100);

  app.innerHTML = `
    <div class="page-head">
      <h1>${isWelcome ? "Welcome to Raasta 👋" : "Your profile"}</h1>
      <p>${isWelcome ? "A few details so the AI advisor can suggest programs that really fit you." : "Your details stay private. Only you can see them."}</p>
    </div>
    <div class="profile-wrap">
      <section class="card prof-head">
        <div class="av-wrap">${avatarHTML(p.avatar_url, name, "xl")}</div>
        <div class="prof-id">
          <h2>${esc(name || "Your name")}</h2>
          <p>${esc(session?.user.email || "")}</p>
          <div class="av-actions">
            <label class="btn ghost small" for="avFile">${p.avatar_url ? "Change photo" : "Upload photo"}</label>
            <input type="file" id="avFile" accept="image/jpeg,image/png,image/webp" hidden />
            ${p.avatar_url ? `<button class="btn link small" id="avRemove" type="button">Remove</button>` : ""}
          </div>
        </div>
        <div class="prof-progress"><span>Profile ${pct}% complete</span><div class="progress"><span style="width:${pct}%"></span></div></div>
      </section>

      <form id="profileForm" class="prof-form">
        <section class="card">
          <h3>Personal details</h3>
          <div class="form-row">
            <div class="field"><label for="pName">Full name <span class="hint">(as in your passport)</span></label><input id="pName" required maxlength="120" value="${esc(name)}" placeholder="Ali Raza" autocomplete="name" /></div>
            <div class="field"><label for="pPhone">Phone number</label>
              <div class="phone-row"><select id="pCC" aria-label="Country code">${COUNTRY_CODES.map(([c, n]) => `<option value="${c}" ${c === cc ? "selected" : ""}>${c} ${esc(n)}</option>`).join("")}</select>
              <input id="pPhone" inputmode="tel" autocomplete="tel-national" maxlength="15" value="${esc(local)}" placeholder="3001234567" /></div></div>
          </div>
          <label class="check small-check"><input type="checkbox" id="pWa" ${p.whatsapp_ok ? "checked" : ""}/> Send me deadline reminders on WhatsApp (optional, you can turn this off any time)</label>
          <div class="form-row">
            <div class="field"><label for="pCity">City</label><input id="pCity" maxlength="80" value="${esc(p.city || "")}" placeholder="Lahore" /></div>
            <div class="field"><label for="pProv">Province <span class="hint">(decides Islamabad or Karachi)</span></label><select id="pProv"><option value="">Choose</option>${opt(PROVINCES, p.province)}</select></div>
          </div>
          <div id="missionHint" class="callout" hidden></div>
        </section>

        <section class="card">
          <h3>Study plans</h3>
          <div class="form-row">
            <div class="field"><label for="pLevel">I want to study</label><select id="pLevel">${opt(LEVELS, p.degree_level || "Master's")}</select></div>
            <div class="field"><label for="pField">Field</label><select id="pField"><option value="">Choose</option>${opt(FIELDS, p.field)}</select></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="pIntake">Target intake</label><select id="pIntake"><option value="">Choose</option>${opt(INTAKES, p.intake)}</select></div>
            <div class="field"><label for="pBudget">Tuition budget</label><select id="pBudget"><option value="">Choose</option>${opt(BUDGETS, p.budget)}</select></div>
          </div>
        </section>

        <section class="card">
          <h3>Academic background</h3>
          <p class="notice" style="margin-top:-6px">The AI advisor uses this to suggest programs you can actually get into.</p>
          <div class="form-row">
            <div class="field"><label for="pDeg">Current or last degree</label><input id="pDeg" maxlength="120" value="${esc(p.bachelor_degree || "")}" placeholder="BS Computer Science" /></div>
            <div class="field"><label for="pUni">University</label><input id="pUni" maxlength="160" value="${esc(p.bachelor_university || "")}" placeholder="FAST NUCES Karachi" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="pCgpa">CGPA or percentage</label><input id="pCgpa" maxlength="20" value="${esc(p.cgpa || "")}" placeholder="3.2 / 4.0" /></div>
            <div class="field"><label for="pYear">Graduation year</label><input id="pYear" type="number" min="1980" max="2035" value="${esc(p.grad_year || "")}" placeholder="${year}" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="pTest">English proof</label><select id="pTest"><option value="">Choose</option>${opt(TESTS, p.english_test)}</select></div>
            <div class="field"><label for="pScore">Score <span class="hint">(if taken)</span></label><input id="pScore" maxlength="20" value="${esc(p.english_score || "")}" placeholder="IELTS 6.5" /></div>
          </div>
          <div class="form-row">
            <div class="field"><label for="pGer">German level</label><select id="pGer"><option value="">Choose</option>${opt(GERMAN, p.german_level)}</select></div>
            <div></div>
          </div>
        </section>

        <button class="btn gold save-sticky" id="saveBtn">${isWelcome ? "Save and see my roadmap" : "Save changes"}</button>
      </form>

      ${isWelcome ? "" : `
      <section class="card">
        <h3>Sign in and security</h3>
        <div class="fact"><span>Email</span><strong>${esc(session?.user.email || "")}</strong></div>
        <div class="fact"><span>Sign in method</span><strong>${(session?.user.app_metadata?.providers || ["email"]).includes("google") ? "Google or email code" : "Email code"}${hasPassword ? " or password" : ""}</strong></div>
        <form id="pwForm" class="pw-form">
          <p class="notice">${hasPassword ? "Change your password." : "Optional: set a password so you can sign in without waiting for an email code."}</p>
          <div class="form-row">
            <div class="field"><label for="pw1">New password</label><input id="pw1" type="password" minlength="8" maxlength="72" autocomplete="new-password" required /></div>
            <div class="field"><label for="pw2">Repeat password</label><input id="pw2" type="password" minlength="8" maxlength="72" autocomplete="new-password" required /></div>
          </div>
          <div class="pw-meter"><span id="pwBar"></span></div><p class="notice" id="pwHint">At least 8 characters. Mix letters, numbers and symbols.</p>
          <div id="pwNonce" hidden class="field"><label for="pwCode">Security code from your email</label><input id="pwCode" class="otp" inputmode="numeric" maxlength="8" placeholder="000000" /></div>
          <button class="btn" id="pwBtn">${hasPassword ? "Change password" : "Set password"}</button>
        </form>
        <button class="btn ghost small" id="signOutAll" type="button" style="margin-top:12px">Sign out on all devices</button>
      </section>

      <section class="card">
        <h3>Your data</h3>
        <p class="notice">Raasta never sells your data. You can download it or delete your account at any time.</p>
        <div class="prog-cta">
          <button class="btn ghost small" id="exportBtn" type="button">Download my data</button>
          <button class="btn ghost small danger" id="deleteBtn" type="button">Delete my account</button>
        </div>
      </section>`}
    </div>`;

  const hint = () => {
    const v = $("#pProv").value, box = $("#missionHint");
    const msg = ["Sindh", "Balochistan"].includes(v) ? "Your visa goes to the German Consulate General in <strong>Karachi</strong>."
      : v && v !== "Living outside Pakistan" ? "Your visa goes to the German Embassy in <strong>Islamabad</strong>." : "";
    box.hidden = !msg; box.innerHTML = msg;
  };
  $("#pProv").onchange = hint; hint();
  $("#pPhone").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/[^\d]/g, "").replace(/^0+/, ""); });

  // Photo upload
  $("#avFile").onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (!LIVE) { toast("Photos work once Raasta is connected."); return; }
    try {
      toast("Uploading photo...");
      const blob = await prepareAvatar(file);
      const path = `${session.user.id}/avatar-${Date.now()}.jpg`;
      const { error } = await sb.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: false });
      if (error) throw error;
      const url = sb.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const old = p.avatar_url;
      await db.saveProfile({ avatar_url: url });
      if (old) { const oldPath = old.split("/avatars/")[1]; if (oldPath) await sb.storage.from("avatars").remove([oldPath]); }
      window.__avatar = url; renderAuth(); toast("Photo updated"); viewProfile(false);
    } catch (err) { toast(err.message || "Upload failed"); }
  };
  if ($("#avRemove")) $("#avRemove").onclick = async () => {
    const oldPath = p.avatar_url?.split("/avatars/")[1];
    try { await db.saveProfile({ avatar_url: null }); if (oldPath) await sb.storage.from("avatars").remove([oldPath]); window.__avatar = null; renderAuth(); toast("Photo removed"); viewProfile(false); }
    catch (err) { toast(err.message); }
  };

  $("#profileForm").onsubmit = async (e) => {
    e.preventDefault();
    const num = $("#pPhone").value.trim();
    if (num && !/^\d{7,13}$/.test(num)) { toast("Please check your phone number (digits only, without the leading 0)."); return; }
    const y = $("#pYear").value ? Number($("#pYear").value) : null;
    const rec = {
      full_name: $("#pName").value.trim(), phone: num ? $("#pCC").value + num : null, whatsapp_ok: Boolean(num) && $("#pWa").checked,
      city: $("#pCity").value.trim(), province: $("#pProv").value, degree_level: $("#pLevel").value, field: $("#pField").value,
      intake: $("#pIntake").value, budget: $("#pBudget").value || null, bachelor_degree: $("#pDeg").value.trim() || null,
      bachelor_university: $("#pUni").value.trim() || null, cgpa: $("#pCgpa").value.trim() || null, grad_year: y,
      english_test: $("#pTest").value || null, english_score: $("#pScore").value.trim() || null, german_level: $("#pGer").value || null
    };
    const btn = $("#saveBtn"); btn.disabled = true; btn.textContent = "Saving...";
    try {
      await db.saveProfile(rec);
      if (LIVE && rec.full_name && rec.full_name !== metaName) await sb.auth.updateUser({ data: { full_name: rec.full_name } });
      db._profile = null; toast("Saved"); if (isWelcome) location.hash = "#/roadmap"; else viewProfile(false);
    } catch (err) { toast(/phone_chk/.test(err.message) ? "Please check your phone number." : err.message); btn.disabled = false; btn.textContent = "Save changes"; }
  };

  if (isWelcome) return;

  // Password
  const score = (v) => [v.length >= 8, v.length >= 12, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), /[^\w\s]/.test(v)].filter(Boolean).length;
  $("#pw1").addEventListener("input", () => { const sc = score($("#pw1").value); $("#pwBar").style.width = `${sc * 20}%`; $("#pwBar").className = sc >= 4 ? "ok" : sc >= 3 ? "mid" : ""; });
  $("#pwForm").onsubmit = async (e) => {
    e.preventDefault();
    const a = $("#pw1").value, b2 = $("#pw2").value;
    if (a !== b2) { toast("The two passwords do not match."); return; }
    if (score(a) < 3) { toast("Please choose a stronger password (mix letters, numbers and symbols)."); return; }
    if (!LIVE) { toast("Passwords work once Raasta is connected."); return; }
    const btn = $("#pwBtn"); btn.disabled = true;
    const nonce = $("#pwCode").value.trim();
    const { error } = await sb.auth.updateUser({ password: a, ...(nonce ? { nonce } : {}), data: { has_password: true } });
    btn.disabled = false;
    if (error) {
      if (/reauthenticat|nonce/i.test(error.message)) {
        await sb.auth.reauthenticate(); $("#pwNonce").hidden = false; $("#pwCode").focus();
        toast("For your security we emailed you a code. Enter it and press the button again."); return;
      }
      toast(/same|different from the old/i.test(error.message) ? "Choose a different password from your current one." : /weak|pwned|leaked/i.test(error.message) ? "This password is too weak or was found in a data leak. Choose another." : error.message);
      return;
    }
    $("#pwForm").reset(); $("#pwNonce").hidden = true; $("#pwBar").style.width = "0";
    toast("Password saved. You can now sign in with email and password too.");
  };
  $("#signOutAll").onclick = async () => { if (!confirm("Sign out on all devices, including this one?")) return; await sb.auth.signOut({ scope: "global" }); toast("Signed out everywhere"); location.hash = "#/"; };

  // Data export and deletion
  $("#exportBtn").onclick = async () => {
    try {
      const [prof, apps, checks, saved] = await Promise.all([db.getProfile(), db.listApps(), db.getChecklist(), db.listSaved()]);
      const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), email: session?.user.email, profile: prof, applications: apps, checklist: checks, saved_program_ids: saved }, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "raasta-my-data.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (err) { toast(err.message); }
  };
  $("#deleteBtn").onclick = async () => {
    const typed = prompt("This permanently deletes your profile, tracker, saved programs and photo. Type DELETE to confirm.");
    if (typed !== "DELETE") { if (typed !== null) toast("Not deleted. You need to type DELETE."); return; }
    try {
      const { data: files } = await sb.storage.from("avatars").list(session.user.id);
      if (files?.length) await sb.storage.from("avatars").remove(files.map((f) => `${session.user.id}/${f.name}`));
      const { error } = await sb.rpc("delete_my_account"); if (error) throw error;
      await sb.auth.signOut(); toast("Your account and data were deleted."); location.hash = "#/";
    } catch (err) { toast(err.message); }
  };
}

/* ---------------- Guides: cities, visa, moving, grades ---------------- */
const G = () => window.RAASTA_GUIDES || { cities: [], visa: { steps: [], missions: [], money: [] }, moving: [] };
const wikiCache = {};
async function cityLive(c) {
  if (wikiCache[c.slug]) return wikiCache[c.slug];
  const out = {};
  try {
    const s = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(c.wiki)}`).then((r) => r.json());
    out.img = s.originalimage?.source || s.thumbnail?.source; out.thumb = s.thumbnail?.source; out.extract = s.extract; out.page = s.content_urls?.desktop?.page; out.q = s.wikibase_item;
    if (out.q) {
      const w = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${out.q}&property=P1082&format=json&origin=*`).then((r) => r.json());
      const cl = (w.claims?.P1082 || []).map((x) => ({ n: Number(x.mainsnak?.datavalue?.value?.amount), t: x.qualifiers?.P585?.[0]?.datavalue?.value?.time || "", pref: x.rank === "preferred" })).filter((x) => x.n);
      cl.sort((a, b) => (b.pref - a.pref) || b.t.localeCompare(a.t));
      if (cl[0]) { out.pop = cl[0].n; out.popYear = cl[0].t.slice(1, 5); }
    }
  } catch {}
  return (wikiCache[c.slug] = out);
}
function guideHero(eyebrow, title, text) {
  return `<div class="page-hero"><span class="eyebrow light">${esc(eyebrow)}</span><h1>${esc(title)}</h1><p>${text}</p></div>`;
}

// City names appear in English and German ("Munich", "München", "Garching b. München"); Frankfurt (Oder) is a different city
function inCity(p, c) {
  const city = (p.city || "").toLowerCase();
  if (c.slug === "frankfurt" && city.includes("oder")) return false;
  return (c.match || [c.name]).some((m) => city.includes(m.toLowerCase()));
}
async function viewCities() {
  const progs = await db.programs();
  const count = (c) => progs.filter((p) => inCity(p, c)).length;
  app.innerHTML = `${guideHero("City guides", "Where will you live?", "Jobs, internships, rent and daily life in Germany's main student cities. Population and photos come live from Wikipedia.")}
    <div class="city-grid">${G().cities.map((c) => `<a class="city-card" href="#/city?c=${c.slug}"><div class="city-img" data-cimg="${c.slug}"></div><div class="city-body"><h3>${esc(c.name)}</h3><p>${esc(c.state)}</p><div class="uni-tags"><span class="pill">${count(c)} programs</span>${c.rent ? `<span class="pill pill-gold">Flat ${esc(c.rent)}</span>` : ""}</div></div></a>`).join("")}</div>
    <p class="notice">Rent figures: MLP Studentenwohnreport 2026 (30 m² student flat, warm rent). Cities without a figure were not covered by the report.</p>`;
  for (const c of G().cities) cityLive(c).then((d) => { const el = app.querySelector(`[data-cimg="${c.slug}"]`); if (el && d.thumb) el.style.backgroundImage = `url("${d.thumb}")`; });
}

async function viewCity() {
  const c = G().cities.find((x) => x.slug === route.params.get("c"));
  if (!c) { app.innerHTML = `<div class="empty">City not found. <a href="#/cities">All cities</a></div>`; return; }
  const progs = (await db.programs()).filter((p) => inCity(p, c));
  const unis = uniAggregate(progs).sort((a, b) => b.n - a.n);
  app.innerHTML = `<a href="#/cities" class="back">← All cities</a>
    <div class="city-hero" id="cityHero"><div class="city-hero-in"><span class="eyebrow light">${esc(c.state)}</span><h1>${esc(c.name)}</h1><p>${esc(c.vibe)}</p></div></div>
    <div class="stat-row"><div><strong id="cPop">…</strong><span id="cPopL">Population</span></div><div><strong>${progs.length}</strong><span>International programs</span></div><div><strong>${unis.length}</strong><span>Universities</span></div><div><strong>${esc(c.rent || "n/a")}</strong><span>Student flat per month</span></div></div>
    <div class="grid cols-2" style="align-items:start">
      <section class="card"><h3>Job market and industries</h3><ul class="needs">${c.industries.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        <h3 style="margin-top:16px">Major employers nearby</h3><div class="uni-tags">${c.employers.map((x) => `<span class="pill">${esc(x)}</span>`).join("")}</div></section>
      <section class="card"><h3>Internships and student jobs</h3><p>${esc(c.internships)}</p>
        <p class="notice">Non EU students may work 140 full days or 280 half days per year. Search "Werkstudent ${esc(c.name)}" on LinkedIn, StepStone and Indeed.</p>
        <h3 style="margin-top:16px">Cost of living</h3>
        <div class="facts">${c.rent ? `<div class="fact"><span>Student flat (30 m², warm)</span><strong>${esc(c.rent)}</strong></div>` : `<div class="fact"><span>Rent</span><strong>Check WG-Gesucht for current prices</strong></div>`}${c.wg ? `<div class="fact"><span>Room in a shared flat</span><strong>${esc(c.wg)}</strong></div>` : ""}
        <div class="fact"><span>Health insurance</span><strong>about €141 to €146</strong></div><div class="fact"><span>Transport</span><strong>Semester ticket or €63 Deutschlandticket</strong></div><div class="fact"><span>Official living cost minimum</span><strong>€992 per month</strong></div></div>
        <p class="notice">Rent: MLP Studentenwohnreport 2026. Insurance: 2026 student rates.</p></section>
    </div>
    <section class="section"><div class="section-head"><div><h2>Find a job in ${esc(c.name)}</h2><p>Apps and agencies that work in ${esc(c.name)}. Search with the city name.</p></div><a class="btn ghost small" href="#/jobs">All job platforms</a></div>
      ${jobCards([...(G().jobs?.apps || []).slice(0, 3), ...(G().jobs?.agencies || []).slice(0, 3)])}</section>
    <section class="section"><div class="section-head"><div><h2>Universities in ${esc(c.name)}</h2></div><a class="btn ghost small" href="#/finder?state=${encodeURIComponent(c.state)}">All programs in ${esc(c.state)}</a></div><div class="uni-grid">${unis.slice(0, 9).map(uniCard).join("") || `<div class="empty">No programs listed yet.</div>`}</div></section>
    <p class="notice" id="cSrc"></p>`;
  const d = await cityLive(c);
  if (d.img && $("#cityHero")) $("#cityHero").style.backgroundImage = `linear-gradient(180deg, rgba(11,46,36,.35), rgba(11,46,36,.85)), url("${d.img}")`;
  if ($("#cPop")) { $("#cPop").textContent = d.pop ? d.pop.toLocaleString("en-US") : "n/a"; if (d.popYear) $("#cPopL").textContent = `Population (${d.popYear})`; }
  if ($("#cSrc") && d.page) $("#cSrc").innerHTML = `Photo and population: <a href="${safeUrl(d.page)}" target="_blank" rel="noopener">Wikipedia</a> and Wikidata (photo license on Wikimedia Commons).`;
}

function viewVisaGuide() {
  const v = G().visa;
  app.innerHTML = `${guideHero("Student visa from Pakistan", "German student visa, step by step", `Last updated <strong>${esc(G().checked)}</strong>. Amounts and rules change, so always confirm on the official <a href="https://pakistan.diplo.de/pk-en/service/2-study-visa-seite-1676104" target="_blank" rel="noopener">German Missions in Pakistan</a> page.`)}
    <div class="callout"><strong>APS certificate:</strong> ${esc(v.apsNote)}</div>
    <ol class="steps">${v.steps.map((s, i) => `<li class="step"><span class="step-num">${i + 1}</span><div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div></li>`).join("")}</ol>
    <div class="grid cols-2" style="margin-top:16px;align-items:start">
      <section class="card"><h3>Where to apply</h3>${v.missions.map((m) => `<div class="fact"><span>${esc(m.name)}</span><strong>${esc(m.covers)}</strong></div>`).join("")}<p class="notice">Apply online at the <a href="https://digital.diplo.de" target="_blank" rel="noopener">Consular Services Portal</a>.</p></section>
      <section class="card"><h3>Fees and money</h3>${v.money.map(([k, x]) => `<div class="fact"><span>${esc(k)}</span><strong>${esc(x)}</strong></div>`).join("")}<p class="notice">Processing times change with demand. Apply as soon as you have your admission letter.</p></section>
    </div>
    <div class="ai-strip card"><div><h3>Have a question about your case?</h3><p>The AI advisor knows the full checklist and answers in English or Urdu.</p></div><a class="btn gold" href="#/visa">Ask the AI advisor</a></div>`;
}

function viewMoving() {
  const M = G().moving;
  app.innerHTML = `${guideHero("After your admission", "Moving to Germany", `Everything for your first weeks, from registration to recycling. Last updated ${esc(G().checked)}.`)}
    <nav class="toc">${M.map((m) => `<a href="#/moving?s=${m.id}" data-s="${m.id}">${m.ic} ${esc(m.t)}</a>`).join("")}</nav>
    ${M.map((m) => `<section class="card guide-sec" id="g-${m.id}"><h2>${m.ic} ${esc(m.t)}</h2><ul class="needs">${m.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}`;
  const s = route.params.get("s"); if (s) setTimeout(() => document.getElementById("g-" + s)?.scrollIntoView({ behavior: "smooth" }), 50);
}

// Modified Bavarian formula, used by uni-assist and German universities: German = 1 + 3 x (Nmax - Nd) / (Nmax - Nmin)
function bavarian(nd, nmax, nmin) {
  if (![nd, nmax, nmin].every(Number.isFinite) || nmax <= nmin) return null;
  const g = 1 + 3 * (nmax - nd) / (nmax - nmin);
  return Math.round(Math.min(Math.max(g, 1), 5) * 10) / 10;
}
const gradeWord = (g) => g <= 1.5 ? "Very good (sehr gut)" : g <= 2.5 ? "Good (gut)" : g <= 3.5 ? "Satisfactory (befriedigend)" : g <= 4.0 ? "Sufficient (ausreichend)" : "Below passing";

function viewGrades() {
  app.innerHTML = `${guideHero("Free tool", "Convert your Pakistani grades to the German scale", "Uses the modified Bavarian formula that uni-assist and German universities use. In Germany 1.0 is the best grade and 4.0 is the lowest pass.")}
    <div class="grid cols-2" style="align-items:start">
      <form class="card" id="gForm">
        <div class="field"><label>Your grading system</label><div class="seg"><label><input type="radio" name="gs" value="cgpa" checked/><span>CGPA (out of 4)</span></label><label><input type="radio" name="gs" value="pct"/><span>Percentage</span></label></div></div>
        <div class="form-row"><div class="field"><label for="gNd">Your grade</label><input id="gNd" inputmode="decimal" placeholder="3.20" required /></div>
        <div class="field"><label for="gMax">Best possible</label><input id="gMax" inputmode="decimal" value="4.0" /></div></div>
        <div class="field"><label for="gMin">Minimum passing grade <span class="hint">(printed on your transcript)</span></label><input id="gMin" inputmode="decimal" value="2.0" /></div>
        <button class="btn" style="width:100%">Convert</button>
      </form>
      <section class="card" id="gOut"><h3>Your German grade</h3><p class="notice">Enter your grade to see the result.</p></section>
    </div>
    <section class="card" style="margin-top:16px"><h3>Good to know</h3><ul class="needs">
      <li>Most Pakistani universities have a minimum passing CGPA of 2.0 out of 4.0 for a degree, but some use 1.0 or a different scale. Use the value on your own transcript.</li>
      <li>For percentages, the minimum pass is often 33%, 40% or 50% depending on the board or university.</li>
      <li>Many competitive Master's programs ask for a German grade of 2.5 or better.</li>
      <li>This is an estimate. Only uni-assist or the university can make an official conversion.</li></ul></section>`;
  const sync = () => { const pct = app.querySelector("input[name=gs]:checked").value === "pct"; $("#gMax").value = pct ? "100" : "4.0"; $("#gMin").value = pct ? "40" : "2.0"; $("#gNd").placeholder = pct ? "72" : "3.20"; };
  app.querySelectorAll("input[name=gs]").forEach((r) => r.onchange = sync);
  $("#gForm").onsubmit = (e) => {
    e.preventDefault();
    const nd = parseFloat($("#gNd").value), mx = parseFloat($("#gMax").value), mn = parseFloat($("#gMin").value);
    const g = bavarian(nd, mx, mn);
    $("#gOut").innerHTML = g == null ? `<h3>Your German grade</h3><p>Please check the numbers.</p>` : `<h3>Your German grade</h3><div class="grade-big">${g.toFixed(1)}</div><p><strong>${gradeWord(g)}</strong></p><p class="notice">Formula: 1 + 3 × (${mx} − ${nd}) / (${mx} − ${mn})</p>${g <= 2.5 ? `<div class="callout">Strong grade: competitive programs are realistic.</div>` : g <= 3.0 ? `<div class="callout">Solid. Many programs accept this; very competitive ones may ask for 2.5.</div>` : `<div class="callout">Look for programs without a strict grade cutoff, and strengthen your application with work experience and a good motivation letter.</div>`}<a class="btn gold" href="#/doccheck">Check your documents with AI</a>`;
  };
}

function jobCards(list) {
  return `<div class="job-grid">${list.map((j) => `${j.url ? `<a class="job-card" href="${safeUrl(j.url)}" target="_blank" rel="noopener">` : `<div class="job-card">`}<strong>${esc(j.name)}${j.url ? " ↗" : ""}</strong><span>${esc(j.d)}</span>${j.url ? "</a>" : "</div>"}`).join("")}</div>`;
}
function viewJobs() {
  const J = G().jobs || { apps: [], agencies: [], portals: [], tips: [] };
  app.innerHTML = `${guideHero("Jobs for students", "Find a student job in Germany", "Shift apps, staffing agencies and job portals that hire international students, with the 2026 work rules.")}
    <div class="callout"><strong>Work rules 2026:</strong> ${esc(J.rules || "")}</div>
    <section class="section"><div class="section-head"><div><h2>Shift apps</h2><p>Flexible shifts you choose yourself, often paid weekly. Great for your first months.</p></div></div>${jobCards(J.apps)}</section>
    <section class="section"><div class="section-head"><div><h2>Staffing agencies</h2><p>They place you with companies in logistics, office, industry and IT. Registration is free.</p></div></div>${jobCards(J.agencies)}</section>
    <section class="section"><div class="section-head"><div><h2>Job portals</h2><p>For Werkstudent jobs, internships and graduate roles.</p></div></div>${jobCards(J.portals)}</section>
    <section class="card" style="margin-top:16px"><h3>Tips</h3><ul class="needs">${(J.tips || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`;
}

function viewHub(kind) {
  const items = kind === "tools" ? [
    ["#/visa", "✦", "AI advisor", "Program matches and visa answers in English or Urdu."],
    ["#/doccheck", "📄", "AI document checker", "Upload your documents and get a completeness and eligibility check."],
    ["#/grades", "🧮", "Grade converter", "Your CGPA or percentage on the German scale."],
    ["#/letter", "✍️", "Motivation letter", "A personal first draft for one program."],
    ["#/interview", "🎤", "Interview practice", "University and visa mock interviews by voice."],
    ["#/compare", "⇄", "Compare programs", "Up to 3 programs side by side."]]
    : [["#/visa-guide", "🛂", "Student visa from Pakistan", "Step by step, with fees and the blocked account. Dated."],
    ["#/moving", "🧳", "Moving to Germany", "Registration, insurance, housing, banks, transport and culture."],
    ["#/cities", "🏙️", "City guides", "Jobs, internships and rent in 12 student cities."],
    ["#/scholarships", "🎓", "Scholarships", "DAAD, Erasmus Mundus, foundations and university scholarships, with deadlines."],
    ["#/jobs", "💼", "Student jobs", "Zenjob, Jobvalley, TimePartner, Randstad and more, with 2026 work rules."],
    ["#/roadmap", "🧭", "10 step roadmap", "From choosing a program to your first day."]];
  app.innerHTML = `${guideHero(kind === "tools" ? "AI tools" : "Guides", kind === "tools" ? "Free AI tools for your application" : "Guides for every step", kind === "tools" ? "Built for students from Pakistan. Free, with a daily AI limit." : "Checked facts, with dates, so you know what is current.")}
    <div class="grid cols-3">${items.map(([h, ic, t, d]) => `<a class="card" href="${h}"><div class="icon">${ic}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></a>`).join("")}</div>`;
}

/* ---------------- Scholarships ---------------- */
const SCH = () => G().scholarships || { list: [], unis: {}, current: [], howto: [], docs: [] };
const todayISO = () => new Date().toISOString().slice(0, 10);
function daysLeft(iso) { if (!iso) return null; return Math.ceil((new Date(iso + "T23:59:59") - new Date()) / 864e5); }
function schDeadlineTag(s) {
  const d = daysLeft(s.next);
  if (d == null) return `<span class="pill">Deadline varies</span>`;
  if (d < 0) return `<span class="pill">Next round soon</span>`;
  const when = new Date(s.next + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return `<span class="pill ${d <= 45 ? "pill-nc" : "pill-gold"}">${s.approx ? "About " : ""}${esc(when)} · ${d === 0 ? "today" : d + " days left"}</span>`;
}
function schCard(s) {
  return `<a class="sch-card" href="#/scholarship?id=${s.id}">
    <div class="sch-top"><span class="pill ${s.kind === "Full" ? "pill-green" : "pill-lang"}">${s.kind === "Full" ? "Fully funded" : "Partial"}</span>${s.levels.map((l) => `<span class="pill">${esc(l)}</span>`).join("")}${s.german ? `<span class="pill">German needed</span>` : ""}</div>
    <strong>${esc(s.name)}</strong><em>${esc(s.by)}</em>
    <div class="sch-amt">${esc(s.amount)}</div>
    <p>${esc(s.fields)}</p>
    <div class="sch-foot">${schDeadlineTag(s)}<span class="sch-from">${s.fromPk ? "Apply from Pakistan" : "Apply once admitted in Germany"}</span></div>
  </a>`;
}
function viewScholarships() {
  const S = SCH();
  const p = route.params;
  const f = { level: p.get("level") || "", kind: p.get("kind") || "", q: p.get("q") || "" };
  const upcoming = S.list.filter((s) => daysLeft(s.next) != null && daysLeft(s.next) >= 0).sort((a, b) => a.next.localeCompare(b.next)).slice(0, 3);
  app.innerHTML = `${guideHero("Scholarships", "Scholarships to study in Germany", `Fully funded and partial scholarships that students from Pakistan can really get, with criteria, documents and deadlines. Checked <strong>${esc(S.checked)}</strong>. Always confirm on the official page before you apply.`)}
    ${upcoming.length ? `<section class="sch-soon"><h2>Next deadlines</h2><div class="sch-soon-row">${upcoming.map((s) => `<a href="#/scholarship?id=${s.id}"><strong>${esc(s.name)}</strong>${schDeadlineTag(s)}</a>`).join("")}</div></section>` : ""}
    <form class="card sch-filters" id="schF">
      <div class="field"><label for="sq">Search</label><input id="sq" type="search" placeholder="e.g. design, PhD, public policy" value="${esc(f.q)}" /></div>
      <div class="field"><label for="slv">Level</label><select id="slv">${["", "Bachelor", "Master", "PhD"].map((v) => `<option value="${v}" ${v === f.level ? "selected" : ""}>${v || "Any level"}</option>`).join("")}</select></div>
      <div class="field"><label for="skd">Funding</label><select id="skd">${[["", "Any"], ["Full", "Fully funded"], ["Partial", "Partial"]].map(([v, t]) => `<option value="${v}" ${v === f.kind ? "selected" : ""}>${t}</option>`).join("")}</select></div>
    </form>
    <div class="sch-grid" id="schList"></div>

    <section class="section"><div class="section-head"><div><h2>How to apply, step by step</h2><p>The same plan works for almost every scholarship.</p></div></div>
      <ol class="steps">${S.howto.map(([t, d], i) => `<li class="step"><span class="step-num">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join("")}</ol></section>

    <div class="grid cols-2" style="align-items:start">
      <section class="card"><h3>Documents you usually need</h3><ul class="needs">${S.docs.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><a class="btn gold small" href="#/doccheck">Check my documents with AI</a></section>
      <section class="card"><h3>Already studying in Germany?</h3>${S.current.map(([t, d]) => `<div class="sch-cur"><strong>${esc(t)}</strong><p>${esc(d)}</p></div>`).join("")}</section>
    </div>

    <section class="section"><div class="section-head"><div><h2>Private university scholarships</h2><p>Tuition discounts change every intake, so each link opens the university's own scholarship page.</p></div></div>
      <div class="job-grid">${Object.entries(S.unis).map(([n, u]) => `<a class="job-card" href="#/university?name=${encodeURIComponent(n)}"><strong>${esc(n)}</strong><span>${esc(u.items[0])}${u.items.length > 1 ? ` and ${u.items.length - 1} more` : ""}</span></a>`).join("")}</div></section>

    <div class="ai-strip card"><div><h3>Not sure which scholarship fits you?</h3><p>Tell the AI your degree, CGPA, work experience and field. It will suggest scholarships and a plan.</p></div><a class="btn gold" href="#/visa?q=${encodeURIComponent("Which scholarships for Germany fit me? My degree is ..., CGPA ..., work experience ...")}">Ask the AI advisor</a></div>
    <p class="notice">Not affiliated with DAAD or any foundation. Amounts are 2026 rates. Deadlines marked "About" are approximate because the provider only says "generally".</p>`;
  const render = () => {
    const q = $("#sq").value.trim().toLowerCase(), lv = $("#slv").value, kd = $("#skd").value;
    const words = q.split(/\s+/).filter(Boolean);
    const list = S.list.filter((s) => (!lv || s.levels.includes(lv)) && (!kd || s.kind === kd) && words.every((w) => (s.name + " " + s.by + " " + s.fields + " " + s.levels.join(" ")).toLowerCase().includes(w)))
      .sort((a, b) => (daysLeft(a.next) ?? 9999) - (daysLeft(b.next) ?? 9999));
    $("#schList").innerHTML = list.map(schCard).join("") || `<div class="empty">No scholarship matches. Try another level or word.</div>`;
  };
  $("#schF").oninput = render; $("#schF").onsubmit = (e) => e.preventDefault();
  render();
}
function viewScholarship() {
  const s = SCH().list.find((x) => x.id === route.params.get("id"));
  if (!s) { app.innerHTML = `<div class="empty">Scholarship not found. <a href="#/scholarships">All scholarships</a></div>`; return; }
  const li = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");
  app.innerHTML = `${guideHero(s.by, s.name, `${esc(s.fields)}<br/>Checked ${esc(SCH().checked)}.`)}
    <a href="#/scholarships" class="back">← All scholarships</a>
    <div class="stat-row">
      <div><strong>${s.kind === "Full" ? "Full" : "Partial"}</strong><span>Funding</span></div>
      <div><strong>${esc(s.levels.join(", "))}</strong><span>Level</span></div>
      <div><strong>${s.fromPk ? "Yes" : "After admission"}</strong><span>Apply from Pakistan</span></div>
      <div><strong>${s.german ? "Yes" : "Not always"}</strong><span>German needed</span></div>
    </div>
    <div class="callout"><strong>Deadline:</strong> ${esc(s.deadline)} ${schDeadlineTag(s)}</div>
    ${s.tip ? `<div class="callout" style="margin-top:10px"><strong>Our tip:</strong> ${esc(s.tip)}</div>` : ""}
    <div class="grid cols-2" style="margin-top:16px;align-items:start">
      <section class="card"><h2>What you get</h2><p class="sch-amt">${esc(s.amount)}</p><ul class="needs">${li(s.covers)}</ul>${s.notCovered ? `<p class="notice">Not covered: ${esc(s.notCovered)}</p>` : ""}</section>
      <section class="card"><h2>Who can apply</h2><ul class="needs">${li(s.who)}</ul></section>
      <section class="card"><h2>Documents</h2><ul class="needs">${li(s.docs)}</ul><a class="btn gold small" href="#/doccheck">Check my documents with AI</a></section>
      <section class="card"><h2>How to apply</h2><ol class="sch-steps">${li(s.steps)}</ol></section>
    </div>
    <div class="prog-cta" style="margin-top:16px">
      <a class="btn gold" href="${safeUrl(s.apply || s.info)}" target="_blank" rel="noopener">Go to the application ↗</a>
      <a class="btn ghost" href="${safeUrl(s.info)}" target="_blank" rel="noopener">Official information ↗</a>
      <a class="btn ghost" href="#/visa?q=${encodeURIComponent(`Do I qualify for the ${s.name}? My degree is ..., CGPA ..., work experience ...`)}">Ask the AI if I qualify</a>
      <a class="btn ghost" href="#/letter">Draft my motivation letter</a>
    </div>
    <p class="notice">Raasta is not the scholarship provider. The official page always has the final word.</p>`;
}
// Scholarship block for a university page
function uniScholarshipBlock(u) {
  const S = SCH(); const own = S.unis[u.name];
  const general = S.list.filter((s) => ["daad-art", "daad-epos", "daad-hsp", "deutschland", "boell"].includes(s.id) && (u.type !== "Private university" || s.id === "deutschland"));
  return `<section class="card" style="margin-top:16px"><h2>Scholarships at ${esc(u.name)}</h2>
    ${own ? `<ul class="needs">${own.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p class="notice"><strong>How to apply:</strong> ${esc(own.how)}</p>
      <div class="prog-cta"><a class="btn gold small" href="${safeUrl(own.url)}" target="_blank" rel="noopener">Scholarship page and application ↗</a><a class="btn ghost small" href="#/scholarships">All scholarships</a></div>`
    : `<p>${u.type === "Private university" ? "This university may offer tuition discounts. Ask admissions before you pay a deposit." : "Most public universities in Germany take part in the Deutschlandstipendium (€300 per month) and give DAAD graduation scholarships through the International Office. Search the university website for \"Stipendien\" or \"Deutschlandstipendium\"."}</p>
      <div class="sch-mini">${general.map((s) => `<a href="#/scholarship?id=${s.id}"><strong>${esc(s.name)}</strong><span>${esc(s.amount)}</span></a>`).join("")}</div>
      <div class="prog-cta">${u.site ? `<a class="btn ghost small" href="${safeUrl(u.site)}" target="_blank" rel="noopener">University website ↗</a>` : ""}<a class="btn gold small" href="#/scholarships">All scholarships</a></div>`}
  </section>`;
}
// Scholarship suggestions for a program page
function programScholarshipBlock(p) {
  const S = SCH(); const own = S.unis[p.university];
  const txt = ((p.program || "") + " " + (p.title || "") + " " + (p.field || "")).toLowerCase();
  const art = /design|art|film|animation|illustration|visual|media|photograph|fashion/.test(txt);
  const pol = /policy|governance|public admin|development|peace|international relations/.test(txt);
  const ids = [art && p.degree === "Master" ? "daad-art" : null, pol && p.degree === "Master" ? "daad-hsp" : null, p.degree === "Master" ? "daad-epos" : null, p.degree === "Master" ? "erasmus" : null, "deutschland"].filter(Boolean);
  const list = ids.map((id) => S.list.find((s) => s.id === id)).filter(Boolean).slice(0, 4);
  return `<section class="card" style="margin-top:16px"><h2>Scholarships for this program</h2>
    ${own ? `<div class="callout"><strong>${esc(p.university)}:</strong> ${esc(own.items.join("; "))}. <a href="${safeUrl(own.url)}" target="_blank" rel="noopener">Scholarship page ↗</a></div>` : ""}
    <div class="sch-mini">${list.map((s) => `<a href="#/scholarship?id=${s.id}"><strong>${esc(s.name)}</strong><span>${esc(s.amount)} · ${esc(s.deadline.split(".")[0])}</span></a>`).join("")}</div>
    <p class="notice">EPOS only funds courses on DAAD's EPOS list. Check each scholarship's rules for this exact program.</p>
    <div class="prog-cta"><a class="btn ghost small" href="#/scholarships">All scholarships</a></div></section>`;
}

/* ---------------- AI document checker ---------------- */
const toB64 = (blob) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(blob); });
async function shrinkImage(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error(`Could not read ${file.name}`)); i.src = URL.createObjectURL(file); });
  const k = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
  return await new Promise((res) => c.toBlob(res, "image/jpeg", 0.82));
}
async function viewDocCheck() {
  const progs = await db.programs();
  let chosen = progs.find((x) => x.id === Number(route.params.get("program"))) || null;
  const files = [];
  app.innerHTML = `${guideHero("AI tool", "AI document checker", "Upload your transcripts, degree, language certificate and ID. The AI checks completeness, consistency and fit for one program, and converts your grade to the German scale.")}
    <div class="callout"><strong>Important:</strong> this is a free pre-check, not an official evaluation. It does not replace uni-assist or the university, and it cannot certify documents. Your files are sent securely to the AI, analysed once and <strong>never stored</strong>.</div>
    <section class="card dc-guide">
      <h3>What can I upload, and what does the AI do with it?</h3>
      <div class="dc-docs">
        ${[["🎓", "Degree certificate", "Bachelor's degree (for a Master's) or Matric and Intermediate certificates (for a Bachelor's).", "Checks your name, degree title and graduation date, and whether the degree fits the program."],
          ["📑", "Transcripts (marks sheets)", "All semesters, with the grading scale printed on the back.", "Reads your CGPA or percentage, converts it to the German grade and spots missing semesters."],
          ["🏛️", "HEC attestation", "The HEC stamp on your degree and transcripts.", "Checks that the stamp is visible on each page. German embassies require HEC attested documents."],
          ["🗣️", "Language certificate", "IELTS, TOEFL, PTE, Duolingo, or an English medium letter. German: Goethe, TestDaF, DSH.", "Compares your score with the program's requirement and checks it is not older than 2 years."],
          ["🛂", "Passport (ID page)", "Only the page with your photo and name.", "Checks that your name is spelled the same on every document. Black out the passport number if you like."],
          ["📄", "CV and motivation letter", "Your current versions as PDF.", "Checks they exist and match the dates in your other documents. For writing help use the Motivation letter tool."]]
          .map(([ic, t, what, ai]) => `<div class="dc-doc"><div class="dc-ic">${ic}</div><div><strong>${t}</strong><p>${what}</p><em>AI: ${ai}</em></div></div>`).join("")}
      </div>
      <div class="dc-out-list"><strong>You get back:</strong> a checklist of present and missing documents, problems to fix before applying (name mismatches, missing stamps, unreadable scans, expired tests), your grade on the German scale, an eligibility score for the program you chose, a rough chance estimate and clear next steps.</div>
    </section>
    <div class="grid cols-2" style="align-items:start">
      <section class="card">
        <h3>1. Target program</h3>
        <div class="field" style="position:relative"><input id="dcSearch" placeholder="Search a program or university" autocomplete="off" value="${chosen ? esc(`${chosen.program}, ${chosen.university}`) : ""}" /><div id="dcHits" class="dc-hits"></div></div>
        <p class="notice">Optional, but the eligibility score and chance estimate need a program.</p>
        <h3 style="margin-top:14px">2. Your documents</h3>
        <label class="dropzone" for="dcFiles" id="dcDrop"><strong>Choose files</strong> or drop them here<br/><span class="hint">PDF, JPG or PNG. Up to 6 files, 7 MB in total.</span></label>
        <input type="file" id="dcFiles" multiple accept="application/pdf,image/jpeg,image/png,image/webp" hidden />
        <ul class="dc-list" id="dcList"></ul>
        <button class="btn gold" id="dcRun" style="width:100%;margin-top:12px" disabled>Check my documents</button>
        <p class="notice">Uses 8 of your 30 daily AI credits.</p>
      </section>
      <section class="card" id="dcOut"><h3>Results</h3><p class="notice">Your report appears here: a checklist, consistency flags, your German grade, an eligibility score and next steps.</p></section>
    </div>`;
  const listEl = $("#dcList"), runBtn = $("#dcRun");
  const total = () => files.reduce((a, f) => a + f.size, 0);
  const renderList = () => {
    listEl.innerHTML = files.map((f, i) => `<li><span>${f.type === "application/pdf" ? "📄" : "🖼️"} ${esc(f.name)}</span><em>${(f.size / 1024 / 1024).toFixed(1)} MB</em><button class="btn link small" data-rm="${i}" type="button">Remove</button></li>`).join("");
    listEl.querySelectorAll("[data-rm]").forEach((b) => b.onclick = () => { files.splice(Number(b.dataset.rm), 1); renderList(); });
    runBtn.disabled = !files.length;
  };
  const add = async (list) => {
    for (const f of list) {
      if (files.length >= 6) { toast("Maximum 6 files."); break; }
      try {
        let blob = f, type = f.type;
        if (f.type.startsWith("image/")) { blob = await shrinkImage(f); type = "image/jpeg"; }
        else if (f.type !== "application/pdf") { toast(`${f.name}: only PDF or images.`); continue; }
        if (total() + blob.size > 7 * 1024 * 1024) { toast(`${f.name} is too large. Keep the total under 7 MB.`); continue; }
        files.push({ name: f.name, type, size: blob.size, blob });
      } catch (e) { toast(e.message); }
    }
    renderList();
  };
  $("#dcFiles").onchange = (e) => add([...e.target.files]);
  const dz = $("#dcDrop");
  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("over"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("over"));
  dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("over"); add([...e.dataTransfer.files]); });
  $("#dcSearch").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().split(/\s+/).filter(Boolean); chosen = null;
    const hits = q.length ? progs.filter((p) => q.every((w) => `${p.program} ${p.university} ${p.city}`.toLowerCase().includes(w))).slice(0, 8) : [];
    $("#dcHits").innerHTML = hits.map((p) => `<button type="button" data-pid="${p.id}"><strong>${esc(p.program)}</strong><span>${esc(p.university)} · ${esc(p.degree)}</span></button>`).join("");
    $("#dcHits").querySelectorAll("[data-pid]").forEach((b) => b.onclick = () => { chosen = progs.find((x) => x.id === Number(b.dataset.pid)); $("#dcSearch").value = `${chosen.program}, ${chosen.university}`; $("#dcHits").innerHTML = ""; });
  });

  runBtn.onclick = async () => {
    if (!LIVE) { toast("The document checker works once Raasta is connected."); return; }
    if (!session) { openLogin("Sign in free to check your documents. They are analysed and then discarded, never stored."); return; }
    runBtn.disabled = true; runBtn.textContent = "Checking... this takes about 30 to 60 seconds";
    $("#dcOut").innerHTML = `<h3>Results</h3><p class="notice">Reading your documents...</p>`;
    try {
      const prof = profileSummary(await db.getProfile().catch(() => null));
      const payload = { program_id: chosen?.id || null, profile: prof, files: await Promise.all(files.map(async (f) => ({ name: f.name, type: f.type, data: await toB64(f.blob) }))) };
      const { data, error } = await sb.functions.invoke("doc-check", { body: payload });
      if (error) { let m = "Something went wrong. Please try again."; try { const b = await error.context.json(); if (b?.error) m = b.error; } catch {} throw new Error(m); }
      renderDocResult(data.result, chosen);
    } catch (e) { $("#dcOut").innerHTML = `<h3>Results</h3><div class="callout">${esc(e.message)}</div>`; }
    finally { runBtn.disabled = !files.length; runBtn.textContent = "Check my documents"; }
  };
}
function renderDocResult(r, prog) {
  const st = { present: "✅", missing: "❌", unclear: "⚠️" };
  const ex = r.extracted || {};
  const num = parseFloat(String(ex.grade || "").replace(",", "."));
  let conv = "";
  if (Number.isFinite(num)) {
    const pct = ex.grade_type === "percentage" || num > 10;
    const mx = Number(ex.grade_max) || (pct ? 100 : 4), mn = Number(ex.grade_min_pass) || (pct ? 40 : 2);
    const g = bavarian(num, mx, mn);
    if (g != null) conv = `<div class="dc-grade"><div><span>Your grade</span><strong>${esc(ex.grade)}</strong></div><div><span>German grade (estimate)</span><strong>${g.toFixed(1)}</strong></div><em>${gradeWord(g)}. Modified Bavarian formula with best ${mx}, minimum pass ${mn}${ex.grade_min_pass ? " (from your transcript)" : " (assumed, check your transcript)"}.</em></div>`;
  }
  const score = Math.max(0, Math.min(100, Number(r.eligibility?.score) || 0));
  const lvl = (r.chance?.level || "unknown").toLowerCase();
  $("#dcOut").innerHTML = `<h3>Results${prog ? ` for ${esc(prog.program)}` : ""}</h3>
    <div class="dc-score"><div class="ring" style="--v:${score}"><strong>${score}</strong><span>/100</span></div><div><strong>Eligibility and completeness</strong><p>${esc(r.eligibility?.summary || "")}</p></div></div>
    ${conv}
    <div class="dc-chance ${lvl}"><strong>Estimated chance: ${esc(lvl === "unknown" ? "not enough information" : lvl)}</strong><ul>${(r.chance?.reasons || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul><em>Rough AI estimate only. Admission decisions are made by the university and depend on competition each semester.</em></div>
    <h4>Checklist</h4><ul class="dc-check">${(r.checklist || []).map((c) => `<li>${st[c.status] || "•"} <strong>${esc(c.item)}</strong>${c.note ? ` <span>${esc(c.note)}</span>` : ""}</li>`).join("")}</ul>
    ${(r.consistency || []).length ? `<h4>Flags to fix</h4><ul class="dc-flags">${r.consistency.map((c) => `<li class="${esc(c.severity)}">${esc(c.issue)}</li>`).join("")}</ul>` : ""}
    <h4>Documents found</h4><ul class="dc-check">${(r.documents || []).map((d) => `<li>${d.ok ? "✅" : "⚠️"} <strong>${esc(d.type)}</strong> <span>${esc(d.file)}${(d.issues || []).length ? ": " + esc(d.issues.join("; ")) : ""}</span></li>`).join("")}</ul>
    ${(r.eligibility?.gaps || []).filter(Boolean).length ? `<h4>Gaps</h4><ul class="needs">${r.eligibility.gaps.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    ${(r.next_steps || []).length ? `<h4>Next steps</h4><ol class="needs">${r.next_steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
    <p class="notice">Not an official evaluation. uni-assist or the university makes the final decision. Your files were not stored.</p>`;
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
    try { await db.sendFeedback({ rating, message: $("#fbMsg", bg).value.trim(), page }); close(); toast("Thank you for your feedback!"); }
    catch (err) { toast(err.message); }
  };
}

/* ---------------- Privacy ---------------- */
function viewPrivacy() {
  const mail = CFG.CONTACT_EMAIL || "raheelgul063@gmail.com";
  app.innerHTML = `
    <div class="page-head"><h1>Privacy policy</h1><p>Plain language. Last updated 3 November 2026.</p></div>
    <div class="card" style="max-width:760px">
      <h3>Who is responsible</h3>
      <p><strong>Raheel Gul</strong>, Berlin, Germany (full address in the <a href="#/impressum">Impressum</a>)<br/>Email: <a href="mailto:${esc(mail)}">${esc(mail)}</a><br/>For questions or help you can also use the <a href="#/support">support page</a>.</p>
      <h3>What we store</h3>
      <p>Your email and name (from Google or your email login); the profile you fill in (phone number, city, province, study plans, academic background, profile photo); the universities in your tracker, your saved programs and ticked checklist items; how many AI requests you made per day; feedback and support messages you send.</p>
      <h3>What we do not store</h3>
      <p>We do not save your AI chat messages, interview answers or motivation letter text. Documents you upload to the AI document checker are analysed once and then discarded; they are never saved on our servers. Do not type passport numbers, CNIC numbers or bank details into chats.</p>
      <h3>Who processes your data</h3>
      <p>Supabase (database, login and photo storage), Anthropic (Claude AI, to answer your questions and check documents), Google (only if you choose Google login), GitHub Pages (website hosting) and Wikipedia (city photos and population, loaded in your browser).</p>
      <h3>Why</h3>
      <p>To run the service you asked for, to keep it free by limiting AI use per person, and to improve it from anonymous totals and your feedback. We never sell your data and send no marketing. WhatsApp reminders are only sent if you turn them on in your profile.</p>
      <h3>Your rights</h3>
      <p>You can download all your data or delete your account at any time in your profile. You can also ask us by email to see, correct or delete your data. Under the GDPR you can complain to a data protection authority, for example the Berlin Commissioner for Data Protection and Freedom of Information.</p>
      <h3>Not official advice</h3>
      <p>Raasta is not affiliated with DAAD, uni-assist, any university or the German Missions in Pakistan. AI answers and estimates can be wrong. Always check the official sources before you submit anything.</p>
    </div>`;
}

function viewImpressum() {
  const mail = CFG.CONTACT_EMAIL || "raheelgul063@gmail.com";
  const addr = (CFG.IMPRESSUM_ADDRESS || []).filter(Boolean);
  const addrHtml = addr.length ? addr.map(esc).join("<br/>") : "Berlin, Germany";
  app.innerHTML = `
    <div class="page-head"><h1>Impressum</h1><p>Legal notice under § 5 DDG and § 18 MStV.</p></div>
    <div class="card" style="max-width:760px">
      <h3>Provider</h3>
      <p><strong>Raheel Gul</strong><br/>${addrHtml}</p>
      <h3>Contact</h3>
      <p>Email: <a href="mailto:${esc(mail)}">${esc(mail)}</a><br/>For help with the platform please use the <a href="#/support">support page</a>.</p>
      <h3>VAT ID</h3>
      <p>Umsatzsteuer-Identifikationsnummer under § 27 a UStG: <strong>DE458327029</strong></p>
      <h3>Responsible for content under § 18 (2) MStV</h3>
      <p>Raheel Gul, address as above.</p>
      <h3>Consumer dispute resolution</h3>
      <p>We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.</p>
      <h3>Liability for content and links</h3>
      <p>We prepare the program, visa and city information carefully but cannot guarantee that it is complete, correct or up to date. Universities, DAAD, uni-assist and the German Missions always have the final word. We are not responsible for the content of external websites we link to; if we learn that a linked page breaks the law, we remove the link.</p>
      <p style="margin-top:14px"><a href="#/privacy">Privacy policy</a></p>
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
    </div>
    <div class="card" style="margin-top:16px" id="supportBox"><h3>Support requests</h3><p class="notice">Loading...</p></div>`;
  $("#refresh").onclick = viewAdmin;
  if (LIVE) {
    const { data: reqs, error } = await sb.from("support_requests").select("*").order("created_at", { ascending: false }).limit(50);
    const box = $("#supportBox"); if (!box) return;
    const open = (reqs || []).filter((r) => r.status === "open").length;
    box.innerHTML = `<h3>Support requests <span class="pill ${open ? "pill-gold" : ""}">${open} open</span></h3>` + (error ? `<div class="callout">${esc(error.message)}</div>` : reqs.length ? `<div class="table-wrap"><table><thead><tr><th>When</th><th>From</th><th>Topic</th><th>Message</th><th>Status</th></tr></thead><tbody>${reqs.map((r) => `<tr><td>${fmt(r.created_at)}</td><td>${esc(r.name)}<br/><a href="mailto:${esc(r.email)}?subject=${encodeURIComponent("Raasta support: " + r.topic)}">${esc(r.email)}</a></td><td>${esc(r.topic)}</td><td style="max-width:420px;white-space:pre-wrap">${esc(r.message)}</td><td><select data-sid="${r.id}">${["open", "answered", "closed"].map((x) => `<option ${x === r.status ? "selected" : ""}>${x}</option>`).join("")}</select></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No support requests yet</div>`);
    box.querySelectorAll("[data-sid]").forEach((sel) => sel.onchange = async () => { const { error: e } = await sb.from("support_requests").update({ status: sel.value }).eq("id", sel.dataset.sid); toast(e ? e.message : "Status saved"); });
  }
}

const SUPPORT_TOPICS = ["Account and sign in", "Programs and data", "AI tools", "Visa and documents", "Privacy and data deletion", "Bug or error", "Other"];
const FAQ = [
  ["Is Raasta really free?", "Yes. Searching programs, the guides, the tracker and the AI tools are free. AI tools have a daily limit so the service stays free for everyone."],
  ["I did not get my sign in code.", "Check your spam folder and wait one minute. Then use Resend code. If you set a password in your profile you can also sign in with it."],
  ["A program or deadline looks wrong.", "Always trust the official university page first. Then tell us with the form below and include the program name, so we can fix it."],
  ["Do I need an APS certificate from Pakistan?", "No. APS is for India, China, Vietnam and Mongolia. Read the step by step visa guide for the full process."],
  ["Are my documents stored by the document checker?", "No. They are analysed once and then discarded. You can also download or delete all your data in your profile."],
  ["How do I delete my account?", "Open your profile and use Delete my account at the bottom. Everything is removed, including your photo."]
];
function viewSupport() {
  const mail = CFG.CONTACT_EMAIL || "raheelgul063@gmail.com";
  const name = session?.user.user_metadata?.full_name || "", email = session?.user.email || "";
  app.innerHTML = `${guideHero("Help and support", "How can we help?", "Read the quick answers below or send us a message. We usually reply within 2 working days.")}
    <div class="grid cols-2" style="align-items:start">
      <section class="card"><h3>Quick answers</h3>${FAQ.map(([q, a]) => `<details class="faq"><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
        <p class="notice" style="margin-top:12px">Prefer email? Write to <a href="mailto:${esc(mail)}">${esc(mail)}</a>.</p></section>
      <form class="card" id="supForm">
        <h3>Send us a message</h3>
        <div class="form-row"><div class="field"><label for="sName">Your name</label><input id="sName" required maxlength="120" value="${esc(name)}" autocomplete="name" /></div>
        <div class="field"><label for="sEmail">Email for our reply</label><input id="sEmail" type="email" required maxlength="200" value="${esc(email)}" autocomplete="email" /></div></div>
        <div class="field"><label for="sTopic">Topic</label><select id="sTopic">${SUPPORT_TOPICS.map((t) => `<option>${esc(t)}</option>`).join("")}</select></div>
        <div class="field"><label for="sMsg">Message</label><textarea id="sMsg" required minlength="10" maxlength="4000" placeholder="Tell us what happened, on which page, and what you expected."></textarea></div>
        <p class="notice">Do not include passport, CNIC or bank numbers.</p>
        <button class="btn gold" style="width:100%" id="supBtn">Send message</button>
      </form>
    </div>`;
  $("#supForm").onsubmit = async (e) => {
    e.preventDefault();
    const rec = { name: $("#sName").value.trim(), email: $("#sEmail").value.trim(), topic: $("#sTopic").value, message: $("#sMsg").value.trim(), page: document.referrer ? null : "support", user_id: session?.user.id || null };
    if (rec.message.length < 10) { toast("Please write a few more words."); return; }
    const btn = $("#supBtn"); btn.disabled = true; btn.textContent = "Sending...";
    try {
      if (!LIVE) { const all = local.get("support", []); all.unshift(rec); local.set("support", all); }
      else { const { error } = await sb.from("support_requests").insert(rec); if (error) throw error; }
      $("#supForm").innerHTML = `<h3>Message sent ✓</h3><p>Thank you, ${esc(rec.name)}. We will reply to <strong>${esc(rec.email)}</strong>, usually within 2 working days.</p><a class="btn ghost" href="#/">Back to home</a>`;
    } catch (err) { btn.disabled = false; btn.textContent = "Send message"; toast(/Too many|busy/.test(err.message) ? err.message : "Could not send. Please email us instead."); }
  };
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
const ncPill = (p) => /^Open/.test(p.nc_status || "") ? `<span class="pill pill-free">NC-frei</span>` : /^Restricted/.test(p.nc_status || "") ? `<span class="pill pill-nc">NC / selection</span>` : "";
const compareList = () => local.get("compare", []);
function langLevel(p) {
  const t = `${p.english_req || ""}`;
  const lv = (t.match(/\b(A1|A2|B1|B2|C1|C2)\b/) || [])[1];
  const ielts = (t.match(/IELTS[^0-9]{0,20}(\d(?:[.,]\d)?)/i) || [])[1];
  if (/german/i.test(p.language || "") && !/english/i.test(p.language || "")) return "German, usually C1 (DSH 2 or TestDaF 4x4)";
  return [lv && `English ${lv}`, ielts && `IELTS ${ielts}`].filter(Boolean).join(", ") || "See the university page";
}
function appRoute(p) {
  if (/uni-assist/i.test(`${p.apply_url || ""} ${p.apply_via || ""}`)) return "uni-assist";
  if (p.apply_url) return "Direct to the university";
  return "Check the university page";
}
function progCard(p, saved) {
  const nd = nextDeadline(p);
  const dl = nd ? `<span class="${nd.days <= 30 ? "due-soon" : ""}">${nd.intake}: ${mmddText(`${String(nd.date.getMonth() + 1).padStart(2, "0")}-${String(nd.date.getDate()).padStart(2, "0")}`)} (${nd.days} days)</span>` : `<span>Deadline: see page</span>`;
  const inCmp = compareList().includes(p.id);
  return `
    <article class="prog-card">
      <a href="#/program?id=${p.id}" class="prog-main">
        <div class="prog-head"><span class="mono" aria-hidden="true">${esc(mono(p.university))}</span><div>
          <div class="prog-top"><span class="pill ${p.degree === "Master" ? "pill-green" : "pill-gold"}">${esc(p.title || p.degree)}</span>${p.tuition === 0 ? `<span class="pill pill-free">Tuition free</span>` : ""}${p.type === "Private university" ? `<span class="pill">Private</span>` : ""}${langPill(p)}${ncPill(p)}</div>
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

// Numbered pager: 1 2 3 ... 18 with previous and next
function pager(page, pages) {
  if (pages <= 1) return "";
  const nums = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => nums.add(n));
  if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((n) => nums.add(n));
  const list = [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  let out = `<button type="button" class="pg" data-page="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="Previous page">‹</button>`;
  list.forEach((n, i) => { if (i && n - list[i - 1] > 1) out += `<span class="pg-gap">…</span>`; out += `<button type="button" class="pg ${n === page ? "on" : ""}" data-page="${n}" ${n === page ? 'aria-current="page"' : ""}>${n}</button>`; });
  return out + `<button type="button" class="pg" data-page="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="Next page">›</button>`;
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
    <div class="uni-grid" id="ulist"></div>
    <nav class="pager" id="upager" aria-label="Pages"></nav>`;
  const render = () => {
    const q = $("#uq").value.trim().toLowerCase(), t = $("#utype").value, st = $("#ustate").value, so = $("#usort").value;
    let list = unis.filter((u) => (!q || `${u.name} ${u.city}`.toLowerCase().includes(q)) && (!t || u.type === t) && (!st || u.state === st));
    list.sort(so === "az" ? (a, b) => a.name.localeCompare(b.name) : so === "free" ? (a, b) => b.free - a.free : (a, b) => b.n - a.n);
    const PER = 12, pages = Math.max(1, Math.ceil(list.length / PER));
    page = Math.min(Math.max(1, page), pages);
    $("#ucount").textContent = `${list.length} universit${list.length === 1 ? "y" : "ies"}${pages > 1 ? ` · page ${page} of ${pages}` : ""}`;
    $("#ulist").innerHTML = list.slice((page - 1) * PER, page * PER).map(uniCard).join("") || `<div class="empty">No university matches.</div>`;
    $("#upager").innerHTML = pager(page, pages);
    $("#upager").querySelectorAll("[data-page]").forEach((b) => b.onclick = () => { page = Number(b.dataset.page); render(); $("#ucount").scrollIntoView({ behavior: "smooth", block: "start" }); });
  };
  let page = Number(route.params.get("page")) || 1;
  app.querySelectorAll(".uni-tools input, .uni-tools select").forEach((el) => el.addEventListener(el.type === "search" ? "input" : "change", () => { page = 1; render(); }));
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
    ${u.type === "Private university" ? "" : `<div class="callout uni-coverage"><strong>Showing ${u.n} international program${u.n === 1 ? "" : "s"}.</strong> ${esc(u.name)} offers more degrees, including German-taught programs, that are not in our list yet. ${u.site ? `<a href="${safeUrl(u.site)}" target="_blank" rel="noopener">See all programs on the university website ↗</a>` : ""} German-taught programs usually need German at C1 (B1 to B2 for Studienkolleg routes).</div>`}
    <section class="card uni-city" id="uniCity"></section>
    ${uniScholarshipBlock(u)}
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
  renderUniCity(u);
}

// City summary inside a university page: uses the full city guide when we have one, otherwise live Wikipedia data
async function renderUniCity(u) {
  const box = $("#uniCity"); if (!box) return;
  const cityName = String(u.city || "").split(",")[0].replace(/\s*\(.*$/, "").trim();
  if (!cityName) { box.remove(); return; }
  const guide = G().cities.find((c) => inCity({ city: u.city }, c));
  const c = guide || { slug: "x-" + cityName.toLowerCase(), wiki: cityName, name: cityName };
  const J = G().jobs || { apps: [], agencies: [] };
  box.innerHTML = `<div class="uc-img" id="ucImg"></div>
    <div class="uc-body">
      <span class="eyebrow">Life in ${esc(guide ? guide.name : cityName)}</span>
      <h3>${esc(guide ? guide.name : cityName)}${u.state ? `, ${esc(u.state)}` : ""}</h3>
      <p id="ucText">${esc(guide ? guide.vibe : "")}</p>
      <div class="uc-facts">
        <div><span>Population</span><strong id="ucPop">…</strong></div>
        <div><span>Student flat</span><strong>${esc(guide?.rent || "Check WG-Gesucht")}</strong></div>
        <div><span>Health insurance</span><strong>about €141 to €146</strong></div>
        <div><span>Transport</span><strong>Semester ticket</strong></div>
      </div>
      ${guide ? `<p class="uc-emp"><strong>Main employers:</strong> ${guide.employers.slice(0, 6).map(esc).join(", ")}</p>` : ""}
      <p class="uc-emp"><strong>Student jobs:</strong> ${[...J.apps.slice(0, 2), ...J.agencies.slice(0, 3)].map((j) => `<a href="${safeUrl(j.url)}" target="_blank" rel="noopener">${esc(j.name)}</a>`).join(", ")}, and <a href="#/jobs">more job platforms</a>.</p>
      <div class="prog-cta">${guide ? `<a class="btn small" href="#/city?c=${guide.slug}">Full ${esc(guide.name)} guide</a>` : ""}<a class="btn ghost small" href="#/moving">Moving to Germany</a></div>
    </div>`;
  const d = await cityLive(c);
  if (!$("#uniCity")) return;
  if (d.thumb || d.img) $("#ucImg").style.backgroundImage = `url("${d.thumb || d.img}")`; else $("#ucImg").remove();
  $("#ucPop").textContent = d.pop ? d.pop.toLocaleString("en-US") + (d.popYear ? ` (${d.popYear})` : "") : "n/a";
  if (!guide && d.extract) $("#ucText").textContent = d.extract.length > 260 ? d.extract.slice(0, 257).replace(/\s+\S*$/, "") + "…" : d.extract;
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
  const f = Object.assign({ q: "", degree: "", field: "", subject: "", lang: "", nc: "", tuition: "", duration: "", intake: "", deadline: "", state: "", type: "", sort: "deadline", savedOnly: "" },
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
        <div class="field"><label for="fsubj">Subject</label><select id="fsubj">${opt("", "All subjects", f.subject)}${SUBJECTS.map(([n, re]) => [n, progs.filter((p) => re.test(p.program)).length]).filter(([, c]) => c).map(([n, c]) => opt(n, `${n} (${c})`, f.subject)).join("")}</select></div>
        <div class="field"><label for="flang">Teaching language</label><select id="flang">${opt("", "Any language", f.lang)}${opt("en", "English", f.lang)}${opt("de", "German", f.lang)}${opt("both", "English and German", f.lang)}</select></div>
        <div class="field"><label for="fnc">Admission (NC)</label><select id="fnc">${opt("", "Any", f.nc)}${opt("open", "NC-frei (open admission)", f.nc)}${opt("restricted", "NC or selection", f.nc)}</select></div>
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
    field: $("#ffield").value, subject: $("#fsubj").value, lang: $("#flang").value, nc: $("#fnc").value, tuition: $("#ftuition").value, duration: $("#fduration").value, intake: $("#fintake").value,
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
      if (c.subject) { const sj = SUBJECTS.find((x) => x[0] === c.subject); if (sj && !sj[1].test(p.program)) return false; }
      if (c.nc === "open" && !/^Open/.test(p.nc_status || "")) return false;
      if (c.nc === "restricted" && !/^Restricted/.test(p.nc_status || "")) return false;
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
    const LBL = { q: (v) => `“${v}”`, degree: (v) => v, field: (v) => FIELD_META[v]?.name || v, lang: (v) => ({ en: "English", de: "German", both: "English and German" })[v], nc: (v) => (v === "open" ? "NC-frei" : "NC or selection"), subject: (v) => v, tuition: (v) => (v === "free" ? "Tuition free" : "Up to €1,500"), duration: (v) => ({ 3: "3 semesters or less", 4: "4 semesters", 6: "6+ semesters" })[v], intake: (v) => `${v} intake`, deadline: (v) => (v === "known" ? "Has a deadline" : `Deadline within ${Math.round(v / 30)} month${v > 30 ? "s" : ""}`), state: (v) => v, type: (v) => v, savedOnly: () => "Saved only" };
    const act = Object.entries(c).filter(([k, v]) => v && LBL[k]);
    $("#activeF").innerHTML = act.length ? `${act.map(([k, v]) => `<button type="button" class="fchip" data-clear="${k}">${esc(LBL[k](v))} <span aria-hidden="true">×</span><span class="sr-only">Remove filter</span></button>`).join("")}${act.length > 1 ? `<button type="button" class="btn link small" data-clear="all">Clear all</button>` : ""}` : "";
    $("#activeF").querySelectorAll("[data-clear]").forEach((b) => b.onclick = () => {
      const k = b.dataset.clear;
      if (k === "all") { $("#resetF").click(); return; }
      if (k === "degree") app.querySelector("input[name=fdegree][value='']").checked = true;
      else if (k === "savedOnly") $("#fsaved").checked = false;
      else { const el = { q: "#fq", field: "#ffield", subject: "#fsubj", lang: "#flang", nc: "#fnc", tuition: "#ftuition", duration: "#fduration", intake: "#fintake", deadline: "#fdeadline", state: "#fstate", type: "#ftype" }[k]; if (el) $(el).value = ""; }
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
      <h2>Admission</h2>
      <div class="adm-grid">
        <div class="adm"><span>NC status</span><strong>${esc(p.nc_status || "Not stated")}</strong>${p.nc_value ? `<em>Last NC ${esc(p.nc_value)}${p.nc_semester ? ` (${esc(p.nc_semester)})` : ""}${p.nc_source ? `, <a href="${safeUrl(p.nc_source)}" target="_blank" rel="noopener">source</a>` : ""}</em>` : `<em>${p.nc_status ? "From the program listing." : "Most international programs select by documents, not a fixed grade cutoff. Check the university page."}</em>`}</div>
        <div class="adm"><span>Language level</span><strong>${esc(langLevel(p))}</strong><em>${esc(p.language || "English")} taught</em></div>
        <div class="adm"><span>Entrance exam</span><strong>${esc(p.entrance_exam || "None mentioned")}</strong><em>${p.entrance_exam ? "Mentioned in the admission requirements." : "Always confirm on the university page."}</em></div>
        <div class="adm"><span>Studienkolleg needed?</span><strong>${p.degree === "Bachelor" ? "Usually yes, with Intermediate (HSSC)" : "No"}</strong><em>${p.degree === "Bachelor" ? "With a Pakistani HSSC you normally need a Studienkolleg, or 1 to 2 years of university study in Pakistan first. Check the DAAD admission database for your case." : "A recognised Bachelor's degree gives direct access."}</em></div>
        <div class="adm"><span>Application route</span><strong>${esc(appRoute(p))}</strong><em>${appRoute(p) === "uni-assist" ? "Send documents to uni-assist first; they forward them to the university." : "Apply on the university's own portal."}</em></div>
        <div class="adm"><span>Intakes</span><strong>${esc((p.intakes || []).join(" and ") || "See page")}</strong><em>${p.deadline_winter ? `Winter deadline ${mmddText(p.deadline_winter)}. ` : ""}${p.deadline_summer ? `Summer deadline ${mmddText(p.deadline_summer)}.` : ""}</em></div>
      </div>
      ${p.admission_req ? `<div class="adm-req"><strong>Academic requirements</strong><p>${esc(p.admission_req)}</p><span class="notice">From the program's DAAD listing.</span></div>` : ""}
      <div class="prog-cta"><a class="btn gold small" href="#/doccheck?program=${p.id}">Check my documents for this program</a><a class="btn ghost small" href="#/grades">Convert my grade</a></div>
    </section>

    ${programScholarshipBlock(p)}

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
