// Raasta UK guides: visa (Pakistan), cities, jobs, moving to the UK, scholarships. Facts checked 9 November 2026.
// Same shape as guides.js (window.RAASTA_GUIDES), so the same pages can show either country.
window.RAASTA_GUIDES_UK = {
  checked: "9 November 2026",

  // Rent varies a lot by area and changes every term, so we link to live listings instead of quoting a figure.
  cities: [
    { slug: "london", match: ["London"], name: "London", state: "London", wiki: "London", rent: null, wg: null,
      industries: ["Finance and banking", "Tech and startups", "Law and consulting", "Media, design and the creative industries", "Health and life sciences"],
      employers: ["HSBC", "Barclays", "Deloitte", "PwC", "Google", "Amazon", "NHS trusts", "BBC"],
      internships: "The biggest job market in the UK, with many part-time roles in retail, hospitality and campus jobs. Graduate schemes open in autumn, so apply early in your course.",
      vibe: "Huge, very international and the most expensive UK city. Students in London must show a higher living cost amount for the visa (£1,570 a month from 30 November 2026)." },
    { slug: "manchester", match: ["Manchester", "Salford"], name: "Manchester", state: "North West England", wiki: "Manchester", rent: null, wg: null,
      industries: ["Digital and tech", "Media (MediaCityUK)", "Finance and professional services", "Engineering and manufacturing"],
      employers: ["BBC", "ITV", "Auto Trader", "Kellogg's", "Co-op", "Bruntwood", "NHS trusts"],
      internships: "A big student city with plenty of part-time work and a growing tech scene. MediaCityUK in Salford is the main media hub outside London.",
      vibe: "Lively, multicultural and much cheaper than London. Large Pakistani community and halal food everywhere, especially on the Curry Mile in Rusholme." },
    { slug: "birmingham", match: ["Birmingham"], name: "Birmingham", state: "West Midlands", wiki: "Birmingham", rent: null, wg: null,
      industries: ["Finance and professional services", "Automotive and engineering", "Retail and logistics", "Health"],
      employers: ["HSBC UK", "Jaguar Land Rover", "Deutsche Bank", "PwC", "Mondelez", "NHS trusts"],
      internships: "The UK's second city for professional services, with many graduate jobs. Part-time work in retail and hospitality is easy to find.",
      vibe: "Young, diverse and affordable, with one of the largest Pakistani communities in the UK." },
    { slug: "leeds", match: ["Leeds"], name: "Leeds", state: "Yorkshire", wiki: "Leeds", rent: null, wg: null,
      industries: ["Finance and legal services", "Digital and tech", "Health", "Retail"],
      employers: ["Lloyds Banking Group", "Asda", "Sky", "NHS England", "KPMG"],
      internships: "Strong finance and legal sector and a large student population, so part-time jobs are plentiful.",
      vibe: "Friendly student city with lower costs than the south." },
    { slug: "glasgow", match: ["Glasgow"], name: "Glasgow", state: "Scotland", wiki: "Glasgow", rent: null, wg: null,
      industries: ["Engineering and energy", "Financial services", "Creative industries", "Tech"],
      employers: ["Barclays", "JP Morgan", "BAE Systems", "SSE", "Scottish Power"],
      internships: "Scotland's largest city with a strong engineering and financial services base.",
      vibe: "Warm, affordable and lively. Note: Scottish Bachelor's degrees usually take 4 years." },
    { slug: "edinburgh", match: ["Edinburgh"], name: "Edinburgh", state: "Scotland", wiki: "Edinburgh", rent: null, wg: null,
      industries: ["Financial services", "Tech and data", "Tourism and festivals", "Government"],
      employers: ["NatWest Group", "Lloyds", "abrdn", "Skyscanner", "Scottish Government"],
      internships: "Strong finance and data jobs, plus many seasonal jobs during the festival in August.",
      vibe: "Beautiful capital of Scotland, popular and quite expensive for housing." },
    { slug: "sheffield", match: ["Sheffield"], name: "Sheffield", state: "Yorkshire", wiki: "Sheffield", rent: null, wg: null,
      industries: ["Advanced manufacturing and engineering", "Health", "Digital"],
      employers: ["Boeing (AMRC)", "McLaren", "Sheffield Teaching Hospitals", "HSBC"],
      internships: "Known for advanced manufacturing and engineering research.",
      vibe: "Green, safe and one of the more affordable big student cities." },
    { slug: "nottingham", match: ["Nottingham"], name: "Nottingham", state: "East Midlands", wiki: "Nottingham", rent: null, wg: null,
      industries: ["Health and pharma", "Retail", "Finance", "Engineering"],
      employers: ["Boots", "Experian", "Capital One", "Rolls-Royce (Derby)"],
      internships: "Two big universities and a solid job market in health, retail and finance.",
      vibe: "Compact, affordable and very student focused." },
    { slug: "leicester", match: ["Leicester"], name: "Leicester", state: "East Midlands", wiki: "Leicester", rent: null, wg: null,
      industries: ["Manufacturing", "Logistics", "Health", "Retail"],
      employers: ["Next", "Walkers", "University Hospitals of Leicester", "Amazon"],
      internships: "Many logistics and retail roles nearby.",
      vibe: "One of the most diverse cities in the UK, affordable, with a large South Asian community." },
    { slug: "coventry", match: ["Coventry"], name: "Coventry", state: "West Midlands", wiki: "Coventry", rent: null, wg: null,
      industries: ["Automotive and engineering", "Logistics", "Gaming", "Education"],
      employers: ["Jaguar Land Rover", "Rolls-Royce", "E.ON", "Amazon"],
      internships: "Close to the UK car industry and Birmingham.",
      vibe: "Compact student city, popular with Pakistani students, cheaper than most." },
    { slug: "liverpool", match: ["Liverpool"], name: "Liverpool", state: "North West England", wiki: "Liverpool", rent: null, wg: null,
      industries: ["Port and logistics", "Health and life sciences", "Digital and creative", "Tourism"],
      employers: ["Unilever", "Peel Ports", "Liverpool University Hospitals", "Matrix"],
      internships: "Growing digital and life sciences sectors.",
      vibe: "Friendly, affordable and full of history and music." },
    { slug: "newcastle", match: ["Newcastle"], name: "Newcastle", state: "North East England", wiki: "Newcastle upon Tyne", rent: null, wg: null,
      industries: ["Tech and software", "Energy", "Health", "Professional services"],
      employers: ["Sage", "Accenture", "Siemens Energy", "NHS trusts"],
      internships: "A strong software scene (Sage is based here) and energy jobs.",
      vibe: "Very affordable, friendly and lively." },
    { slug: "bradford", match: ["Bradford", "Huddersfield"], name: "Bradford", state: "Yorkshire", wiki: "Bradford", rent: null, wg: null,
      industries: ["Manufacturing", "Retail", "Health", "Finance"],
      employers: ["Morrisons", "Yorkshire Water", "Bradford Teaching Hospitals"],
      internships: "Close to Leeds for bigger employers.",
      vibe: "One of the largest British Pakistani communities and among the cheapest places to live." },
    { slug: "cardiff", match: ["Cardiff"], name: "Cardiff", state: "Wales", wiki: "Cardiff", rent: null, wg: null,
      industries: ["Public sector", "Media", "Financial services", "Compound semiconductors"],
      employers: ["BBC Wales", "Admiral", "Welsh Government", "IQE"],
      internships: "Capital of Wales with public sector and media jobs.",
      vibe: "Compact capital city, green and affordable." }
  ],

  visa: {
    note: { t: "Family", d: "Since January 2024 only students on PhD or other research degrees can bring a partner or children. Taught Master's and Bachelor's students cannot." },
    steps: [
      { t: "Get an offer from a licensed university", d: "Apply on the university website (Master's) or through UCAS (Bachelor's). Only universities with a Student sponsor licence can issue a CAS, and almost all universities do." },
      { t: "Meet your conditions and pay the deposit", d: "Send your final documents and English test result. Most universities ask Pakistani students for a tuition deposit before they issue the CAS. Ask about the refund policy if the visa is refused." },
      { t: "Pass the university's credibility check", d: "Many universities hold a short interview with Pakistani applicants before the CAS, to check you know the course and can afford it. Prepare like a visa interview." },
      { t: "Show your money for 28 days", d: "You need your unpaid first year tuition plus living costs for up to 9 months, held for 28 days in a row. The bank statement must be no more than 31 days old when you apply." },
      { t: "Receive your CAS", d: "The Confirmation of Acceptance for Studies is a reference number with your course, fees and dates. Check every detail: a mistake can lead to refusal. You must apply within 6 months of getting it." },
      { t: "Do the TB test", d: "Pakistani applicants need a TB test certificate from a UK Home Office approved clinic (IOM in Islamabad, Lahore, Karachi and Mirpur). It is valid for 6 months." },
      { t: "Apply online and pay", d: "Apply on GOV.UK up to 6 months before your course starts. Pay the £558 visa fee and the Immigration Health Surcharge (£776 per year of your visa)." },
      { t: "Biometrics at VFS Global", d: "Give fingerprints and a photo at a UK Visa Application Centre in Islamabad, Lahore, Karachi or Mirpur. UKVI can also invite you to a credibility interview." },
      { t: "Decision and eVisa", d: "Most decisions come within about 3 weeks. Since 2025 the UK uses eVisas: your permission is digital and linked to your passport through your UKVI account." },
      { t: "Travel and start", d: "For a course longer than 6 months you can arrive up to one month before it starts (one week for shorter courses). Your eVisa shows the exact date. Then enrol, register with a GP and open a bank account." }
    ],
    missions: [
      { name: "VFS Islamabad", covers: "Islamabad, Rawalpindi, KPK, northern Punjab, Gilgit-Baltistan" },
      { name: "VFS Lahore", covers: "Lahore and most of Punjab" },
      { name: "VFS Karachi", covers: "Sindh and Balochistan" },
      { name: "VFS Mirpur", covers: "Azad Jammu and Kashmir" }
    ],
    money: [
      ["Visa fee", "£558"],
      ["Immigration Health Surcharge", "£776 per year of the visa, paid upfront"],
      ["Living costs, London (from 30 Nov 2026)", "£1,570 per month, up to 9 months (£14,130)"],
      ["Living costs, outside London (from 30 Nov 2026)", "£1,203 per month, up to 9 months (£10,827)"],
      ["Before 30 Nov 2026", "£1,529 London, £1,171 elsewhere"],
      ["How long the money must be held", "28 days in a row, statement max 31 days old"],
      ["TB test", "At an approved clinic, valid 6 months"],
      ["Work during term", "Up to 20 hours per week (degree level)"],
      ["Graduate Route after your degree", "18 months for applications from 1 January 2027 (PhD: 3 years)"]
    ]
  },

  jobs: {
    rules: "On a degree course you can work up to 20 hours per week during term time and full time in official university holidays. You cannot be self-employed or freelance, work as a professional sportsperson or entertainer, or take a permanent full-time job. From April 2026 the minimum wage is £12.71 per hour from age 21 and £10.85 for ages 18 to 20. Apply for a National Insurance number once you arrive.",
    apps: [
      { name: "Indeed Flex", url: "https://indeedflex.co.uk", d: "Pick shifts in warehouses, hospitality and events, paid weekly." },
      { name: "Coople", url: "https://www.coople.com/uk", d: "Flexible shifts in hospitality, retail and logistics." },
      { name: "StudentJob UK", url: "https://www.studentjob.co.uk", d: "Part-time jobs posted for students." },
      { name: "Your university job shop", url: null, d: "Campus jobs such as ambassador, library or event roles fit around your timetable and respect the 20 hour rule." }
    ],
    agencies: [
      { name: "Adecco UK", url: "https://www.adecco.co.uk", d: "Temporary office, industrial and retail work." },
      { name: "Randstad UK", url: "https://www.randstad.co.uk", d: "Temporary and part-time roles across sectors." },
      { name: "Manpower UK", url: "https://www.manpower.co.uk", d: "Warehouse, logistics and office jobs." },
      { name: "Hays", url: "https://www.hays.co.uk", d: "Professional temp roles and graduate jobs." },
      { name: "Pertemps", url: "https://www.pertemps.co.uk", d: "Industrial, driving and office work." }
    ],
    portals: [
      { name: "LinkedIn", url: "https://www.linkedin.com/jobs", d: "Internships and graduate jobs. Keep your profile in English and up to date." },
      { name: "Indeed UK", url: "https://uk.indeed.com", d: "The largest UK job search." },
      { name: "Reed", url: "https://www.reed.co.uk", d: "Big UK job board with part-time filters." },
      { name: "Prospects", url: "https://www.prospects.ac.uk", d: "Graduate jobs and career advice for UK students." },
      { name: "Gradcracker", url: "https://www.gradcracker.com", d: "Engineering and STEM placements and graduate jobs." },
      { name: "Bright Network", url: "https://www.brightnetwork.co.uk", d: "Internships and graduate schemes with big employers." }
    ],
    tips: [
      "Use a UK style CV: 2 pages, no photo, no date of birth.",
      "Graduate schemes open in September and October for the next year. Apply in your first term.",
      "Track your hours: working more than 20 hours in a term week can cancel your visa.",
      "Your eVisa share code proves your right to work. Employers ask for it.",
      "Use your university careers service: CV checks and mock interviews are free."
    ]
  },

  moving: [
    { id: "before", ic: "🧳", t: "Before you fly", items: [
      "Create your UKVI account and check your eVisa shows the right name, dates and conditions.",
      "Book accommodation before you travel: university halls are easiest for the first year.",
      "Pack your passport, CAS, offer letter, TB certificate and proof of funds in your hand luggage.",
      "Bring some cash in pounds for the first days and a card that works abroad.",
      "Buy warm clothes or plan to buy them on arrival: UK winters are cold, wet and dark early."
    ]},
    { id: "arrival", ic: "🛬", t: "First week", items: [
      "Enrol at your university: they check your passport and eVisa.",
      "Get your student ID card.",
      "Register with a GP (family doctor) near you. Your IHS payment covers NHS treatment.",
      "Apply for a National Insurance number if you plan to work.",
      "Get a UK SIM: giffgaff, Lebara, Lyca and VOXI have cheap student friendly plans."
    ]},
    { id: "bank", ic: "🏦", t: "Bank account", items: [
      "App banks like Monzo, Starling and Revolut are usually the fastest to open with a passport and UK address.",
      "HSBC, Barclays, Santander and Lloyds have student accounts. Ask your university for a bank letter.",
      "Keep your Pakistani account for family transfers; Wise and Remitly are cheap for sending money."
    ]},
    { id: "home", ic: "🏠", t: "Housing", items: [
      "University halls first, then a shared house from the second year.",
      "Search on SpareRoom, Rightmove, Zoopla and your university's housing office.",
      "Never pay a deposit before seeing the room or a video viewing. Deposits must be protected in a government scheme.",
      "Full-time students are exempt from Council Tax. Ask your university for a Council Tax exemption certificate.",
      "Check if bills (energy, internet, water) are included in the rent."
    ]},
    { id: "transport", ic: "🚆", t: "Transport", items: [
      "16-25 Railcard (also for full-time students over 25) saves one third on train fares.",
      "In London, the 18+ Student Oyster card gives 30% off travel cards.",
      "Many cities have cheap student bus passes; ask your students' union.",
      "Book trains early on Trainline or the train company app for the lowest prices."
    ]},
    { id: "life", ic: "🕌", t: "Daily life and culture", items: [
      "Halal food, mosques and Pakistani groceries are easy to find in most cities.",
      "Your university's Islamic Society and Pakistani Society are a great first community.",
      "A TV licence is needed if you watch live TV or BBC iPlayer, even on a laptop.",
      "Queueing and saying please and thank you matter. People are polite but reserved at first.",
      "Emergency number: 999. Non-emergency police: 101. NHS advice: 111."
    ]}
  ],

  scholarships: {
    checked: "9 November 2026",
    list: [
      { id: "chevening", name: "Chevening Scholarships", by: "UK Government (FCDO)", kind: "Full", levels: ["Master"],
        fields: "Any subject, one-year taught Master's at any UK university",
        amount: "Full tuition, monthly stipend and flights", covers: ["Full tuition fees", "Monthly living allowance", "Return economy flight", "Arrival and departure allowances", "Visa application cost"],
        notCovered: "Family members",
        who: ["Pakistani citizen who will return to Pakistan for at least 2 years after the scholarship", "At least 2 years (2,800 hours) of work experience", "A Bachelor's degree that gives entry to a UK Master's", "Apply to 3 different eligible UK courses and hold an unconditional offer by July of the scholarship year"],
        docs: ["Online application with 4 essays (leadership, networking, study in the UK, career plan)", "Two references", "Degree certificate and transcripts", "Passport or CNIC", "Unconditional university offer (by July)"],
        steps: ["Choose 3 one-year Master's courses in the UK", "Apply on the Chevening website (opens in August)", "Apply to the universities separately", "Shortlisted candidates are interviewed at the British High Commission (March to April)", "Get an unconditional offer by the July deadline"],
        deadline: "The 2027/28 round closed on 6 October 2026. The 2028/29 round is expected to open in August 2027 and close in early October 2027.", next: "2027-10-06", approx: true,
        fromPk: true, german: false,
        info: "https://www.chevening.org/pakistan", apply: "https://www.chevening.org/scholarship/pakistan/",
        tip: "Start your 4 essays in July, before the form opens. The leadership essay matters most: use one real story with a measurable result. New for 2027/28: two extra Chevening-ABL scholarships for Pakistanis come from the same applicant pool." },
      { id: "commonwealth-masters", name: "Commonwealth Master's Scholarships", by: "Commonwealth Scholarship Commission, nominated by HEC", kind: "Full", levels: ["Master"],
        fields: "Full-time taught Master's linked to one of the CSC's six development themes (for example health, climate, governance, technology)",
        amount: "Full tuition, monthly stipend and flights", covers: ["Full tuition fees", "Monthly stipend (higher in London)", "Return flight", "Arrival allowance", "Thesis grant where relevant"],
        who: ["Pakistani or AJK national and permanent resident (dual nationals are not eligible)", "Cannot afford to study in the UK without the scholarship", "First degree of at least upper second class equivalent", "Meets HEC's requirements, including the HAT test score"],
        docs: ["Application on the CSC system and on the HEC portal", "Degree and transcripts", "References", "Development impact statement", "HAT test result"],
        steps: ["Apply on both the CSC system and the HEC scholarships portal by the deadline", "HEC shortlists and nominates candidates to the CSC (around December)", "The CSC selects the final scholars (results around July)", "Apply to your UK universities in parallel"],
        deadline: "The 2027/28 round closed on 20 October 2026. The next round usually opens in September and closes in October.", next: "2027-10-20", approx: true,
        fromPk: true, german: false,
        info: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/", apply: "https://www.hec.gov.pk/english/scholarshipsgrants/lao/cwgs/Pages/default.aspx",
        tip: "Write the development impact part about one real problem in Pakistan and how your Master's helps you fix it. HEC nominates only a small number, so the HAT score matters." },
      { id: "commonwealth-phd", name: "Commonwealth PhD Scholarships", by: "Commonwealth Scholarship Commission, nominated by HEC", kind: "Full", levels: ["PhD"],
        fields: "Full-time PhD linked to the CSC's development themes",
        amount: "Full tuition, stipend and flights for up to 3.5 years", covers: ["Full tuition fees", "Monthly stipend", "Flights", "Fieldwork and thesis grants", "Family allowance in some cases"],
        who: ["Pakistani or AJK national and permanent resident", "A Master's degree (or a strong Bachelor's)", "A research proposal and a UK supervisor are strongly recommended", "Meets HEC's requirements"],
        docs: ["CSC and HEC applications", "Research proposal", "Degree and transcripts", "References"],
        steps: ["Contact possible UK supervisors early", "Apply on the CSC system and HEC portal", "HEC nominates, the CSC selects"],
        deadline: "Same cycle as the Master's scholarships: the 2027/28 round closed on 20 October 2026.", next: "2027-10-20", approx: true,
        fromPk: true, german: false,
        info: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-phd-scholarships-low-and-middle-income-countries/", apply: "https://www.hec.gov.pk/english/scholarshipsgrants/lao/cwgs/Pages/default.aspx",
        tip: "PhD students can bring their family to the UK, unlike taught Master's students." },
      { id: "great", name: "GREAT Scholarships (Pakistan)", by: "British Council and UK universities", kind: "Partial", levels: ["Master"],
        fields: "One-year taught Master's in selected subjects at about 60 participating universities",
        amount: "£10,000 towards tuition", covers: ["£10,000 off the first year tuition fee"],
        notCovered: "Living costs, flights and the rest of the tuition",
        who: ["Pakistani citizen living in Pakistan", "Holding an offer for an eligible one-year Master's at a participating university", "Meets the English requirement of the university", "Each university sets its own criteria and subject list"],
        docs: ["University scholarship application or statement", "Offer letter", "Degree and transcripts", "English test result"],
        steps: ["Check the British Council's Pakistan list of participating universities", "Apply for the Master's first", "Apply for the GREAT Scholarship on the university's page by its deadline (often spring)"],
        deadline: "Each university sets its own deadline, usually between March and June for September study.", next: null,
        fromPk: true, german: false,
        info: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/pakistan", apply: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships/pakistan",
        tip: "Fewer people apply than for Chevening. Apply to 2 or 3 universities on the list to improve your chances." },
      { id: "aga-khan", name: "Aga Khan Foundation International Scholarship", by: "Aga Khan Foundation", kind: "Partial", levels: ["Master", "PhD"],
        fields: "Postgraduate study abroad in any field, with preference for Master's",
        amount: "50% grant and 50% loan", covers: ["Tuition fees", "Living expenses"],
        notCovered: "Half of the award is a loan, repaid over 5 years after your studies",
        who: ["Pakistani national with no other way to fund your studies", "Excellent academic record", "Admission or an application to a reputable university"],
        docs: ["Application form from the Aga Khan Foundation office in Pakistan", "Transcripts", "References", "Proof of financial need", "Admission letter"],
        steps: ["Get the form from AKF Pakistan when the cycle opens (January)", "Submit by the deadline (usually 31 March)", "Interview with the local committee", "Final selection in late June or early July"],
        deadline: "The 2027/28 cycle opens in January 2027. The usual deadline is 31 March.", next: "2027-03-31", approx: true,
        fromPk: true, german: false,
        info: "https://the.akdn/en/how-we-work/our-agencies/aga-khan-foundation/international-scholarship-programme", apply: "https://the.akdn/en/how-we-work/our-agencies/aga-khan-foundation/international-scholarship-programme",
        tip: "You need a guarantor for the loan part. Treat it as a low-cost loan, not a free scholarship." },
      { id: "uni-intl", name: "University international scholarships and discounts", by: "UK universities", kind: "Partial", levels: ["Bachelor", "Master"],
        fields: "Most subjects. Many universities give automatic awards to international students",
        amount: "Often £2,000 to £6,000 off tuition", covers: ["A discount on the first year (sometimes every year)", "Early payment discounts at some universities"],
        who: ["International fee paying student with an offer", "Some awards need a minimum grade, some are automatic", "Some are only for students from South Asia or Pakistan"],
        docs: ["Usually nothing extra for automatic awards", "Merit awards may need a short statement"],
        steps: ["Open the scholarships page of each university on your list", "Check if the award is automatic or needs an application", "Note the deadline: many are first come, first served"],
        deadline: "Varies by university. Many close before the deposit deadline.", next: null,
        fromPk: true, german: false,
        info: "https://study-uk.britishcouncil.org/scholarships-funding", apply: "https://study-uk.britishcouncil.org/scholarships-funding",
        tip: "Ask every university: \"Do you have a scholarship or early payment discount for Pakistani students?\" Many do, and it saves real money." }
    ],
    unis: {},
    current: [
      ["University hardship funds", "Most universities have emergency funds for international students who face unexpected financial problems."],
      ["Departmental prizes and bursaries", "Ask your department about awards for top students."],
      ["Paid work on campus", "Student ambassador and research assistant jobs fit around your studies."]
    ],
    howto: [
      ["Start a year ahead", "Big scholarships like Chevening and Commonwealth close about a year before your course starts."],
      ["Shortlist courses first", "Most scholarships need you to name your UK courses or hold an offer."],
      ["Prepare your story", "Leadership, impact on Pakistan and a clear career plan matter more than grades alone."],
      ["Collect references early", "Ask professors or managers at least a month before the deadline."],
      ["Apply to several", "Apply for a big scholarship and university awards at the same time."]
    ],
    docs: ["Degree and transcripts (HEC attestation helps for Pakistani documents)", "CV (UK style, 2 pages)", "Personal statement or scholarship essays", "Two references", "English test result (IELTS or similar)", "Passport", "Offer letter where required"]
  }
};
