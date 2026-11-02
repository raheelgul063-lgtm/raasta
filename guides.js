// Raasta guides: city guides, visa process (Pakistan), moving to Germany. Facts checked 2 November 2026.
window.RAASTA_GUIDES = {
  checked: "2 November 2026",

  // Rents: MLP Studentenwohnreport 2026 (30 m2 sample apartment, warm) where published; otherwise null = check locally.
  cities: [
    { slug: "berlin", match: ["Berlin"], name: "Berlin", state: "Berlin", wiki: "Berlin", rent: "about €725", wg: "about €659",
      industries: ["Tech startups and software", "Government and public sector", "Health and life sciences", "Media and creative industries"],
      employers: ["Siemens", "Deutsche Bahn", "Zalando", "Delivery Hero", "HelloFresh", "N26", "Bayer", "Charité"],
      internships: "Berlin has more English speaking startup jobs than any German city. Look for Werkstudent (working student) roles on LinkedIn, StepStone and Berlin Startup Jobs.",
      vibe: "Capital city, very international, many English speakers. Housing is the hardest part: start searching early." },
    { slug: "munich", match: ["Munich", "München", "Garching", "Freising"], name: "Munich", state: "Bavaria", wiki: "Munich", rent: "about €880", wg: null,
      industries: ["Automotive", "Insurance and finance", "Semiconductors and electronics", "AI and software"],
      employers: ["BMW", "Siemens", "Allianz", "Munich Re", "Infineon", "Google", "Microsoft", "Apple"],
      internships: "Strong demand for engineering and IT students. Big companies run structured internship programs; apply 3 to 6 months ahead.",
      vibe: "Rich, safe and green, close to the Alps. The most expensive student city in Germany." },
    { slug: "hamburg", match: ["Hamburg"], name: "Hamburg", state: "Hamburg", wiki: "Hamburg", rent: "about €700 to €720", wg: null,
      industries: ["Logistics and shipping", "Aviation", "Media and e-commerce", "Renewable energy"],
      employers: ["Airbus", "Hapag-Lloyd", "HHLA (Port of Hamburg)", "Otto Group", "Beiersdorf", "Lufthansa Technik", "Google", "Meta"],
      internships: "Logistics, aviation and e-commerce companies hire many working students, often in English.",
      vibe: "Port city with water everywhere, relaxed and wealthy. Rainy weather, great quality of life." },
    { slug: "frankfurt", match: ["Frankfurt am Main", "Frankfurt"], name: "Frankfurt", state: "Hesse", wiki: "Frankfurt", rent: "about €721", wg: null,
      industries: ["Banking and finance", "Fintech", "Aviation and logistics", "Consulting"],
      employers: ["Deutsche Bank", "Commerzbank", "European Central Bank", "Deutsche Börse", "Fraport", "Lufthansa", "PwC", "KPMG"],
      internships: "Best city for finance, audit and consulting internships. Business and data students do well here.",
      vibe: "Small but global financial hub with Germany's biggest airport. Very international workforce." },
    { slug: "cologne", match: ["Cologne", "Köln"], name: "Cologne", state: "North Rhine-Westphalia", wiki: "Cologne", rent: "about €700 to €720", wg: null,
      industries: ["Media and TV", "Insurance", "Retail", "Automotive"],
      employers: ["Ford Europe", "REWE Group", "RTL", "Lanxess", "AXA", "Deutsche Telekom (in nearby Bonn)"],
      internships: "Media, retail and insurance companies, plus Telekom and many federal offices in nearby Bonn.",
      vibe: "Friendly and open, famous for its cathedral and carnival. Part of the large Rhine-Ruhr region." },
    { slug: "stuttgart", match: ["Stuttgart"], name: "Stuttgart", state: "Baden-Württemberg", wiki: "Stuttgart", rent: null, wg: null,
      industries: ["Automotive", "Mechanical engineering", "Electronics", "Research"],
      employers: ["Mercedes-Benz", "Porsche", "Bosch", "Trumpf", "Daimler Truck", "Fraunhofer institutes"],
      internships: "The heart of German engineering. Mechanical, electrical and automotive students find many internships and thesis projects.",
      vibe: "Wealthy and industrial, in a green valley. Note: Baden-Württemberg charges non EU students €1,500 tuition per semester." },
    { slug: "aachen", match: ["Aachen"], name: "Aachen", state: "North Rhine-Westphalia", wiki: "Aachen", rent: null, wg: null,
      industries: ["Engineering research", "Automotive research", "Production technology"],
      employers: ["RWTH Aachen spin-offs", "FEV", "Ford Research Center", "Ericsson", "Fraunhofer institutes"],
      internships: "Many paid research assistant (HiWi) jobs at RWTH and Fraunhofer institutes, very useful for engineering students.",
      vibe: "Student town on the Belgian and Dutch borders, home of RWTH, one of Germany's top technical universities." },
    { slug: "darmstadt", match: ["Darmstadt"], name: "Darmstadt", state: "Hesse", wiki: "Darmstadt", rent: "about €599", wg: "about €492",
      industries: ["Cyber security", "Chemicals and pharma", "Space operations", "Software"],
      employers: ["Merck", "ESA ESOC", "EUMETSAT", "Deutsche Telekom", "Software AG", "Fraunhofer SIT"],
      internships: "Strong for IT security, software and chemistry. Frankfurt's finance jobs are 20 minutes away by train.",
      vibe: "Compact science city next to Frankfurt, home of TU Darmstadt." },
    { slug: "dresden", match: ["Dresden"], name: "Dresden", state: "Saxony", wiki: "Dresden", rent: null, wg: null,
      industries: ["Semiconductors (Silicon Saxony)", "Microelectronics", "Research"],
      employers: ["Infineon", "GlobalFoundries", "Bosch", "ESMC (TSMC joint venture)", "Volkswagen", "Fraunhofer and Max Planck institutes"],
      internships: "Europe's largest microelectronics cluster. Electrical engineering and materials students are in high demand.",
      vibe: "Beautiful baroque city on the Elbe, affordable and safe. German is more useful here than in Berlin." },
    { slug: "leipzig", match: ["Leipzig"], name: "Leipzig", state: "Saxony", wiki: "Leipzig", rent: null, wg: null,
      industries: ["Logistics", "Automotive", "Energy", "Creative scene"],
      employers: ["BMW", "Porsche", "DHL Hub Leipzig", "Amazon", "Siemens Energy"],
      internships: "Logistics and automotive plants plus a growing startup scene. Lower rents than western cities.",
      vibe: "Young, creative and much cheaper than Berlin. Often called the new Berlin." },
    { slug: "karlsruhe", match: ["Karlsruhe"], name: "Karlsruhe", state: "Baden-Württemberg", wiki: "Karlsruhe", rent: null, wg: null,
      industries: ["Software and IT", "Energy", "Research"],
      employers: ["SAP (Walldorf, nearby)", "EnBW", "dm-drogerie markt", "Bosch", "KIT spin-offs"],
      internships: "Excellent for computer science: SAP and many IT firms nearby, plus KIT research jobs.",
      vibe: "Sunny, bike friendly tech city with KIT. Baden-Württemberg tuition for non EU students applies." },
    { slug: "hannover", match: ["Hannover", "Hanover"], name: "Hannover", state: "Lower Saxony", wiki: "Hanover", rent: null, wg: null,
      industries: ["Automotive suppliers", "Insurance", "Trade fairs", "Engineering"],
      employers: ["Volkswagen Commercial Vehicles", "Continental", "Hannover Re", "TUI", "Deutsche Messe"],
      internships: "Engineering and insurance internships; the world's biggest trade fairs take place here every year.",
      vibe: "Green, practical and affordable, with good train links across Germany." }
  ],

  visa: {
    apsNote: "No APS certificate is needed for Pakistan. APS is required for students from India, China, Vietnam and Mongolia. Some agents still say otherwise; check the German Missions page if in doubt.",
    steps: [
      { t: "Get your admission letter", d: "You need a letter of admission (Zulassungsbescheid) from a German university, or a conditional admission or Studienkolleg place." },
      { t: "Prepare and attest your documents", d: "Degrees and transcripts must be attested by HEC (Higher Education Commission of Pakistan). Also have your passport (valid at least one year plus three months), CNIC, CV and language certificate ready." },
      { t: "Open a blocked account", d: "Deposit €11,904 for the first year (€992 per month is released after you arrive). Providers include Expatrio, Fintiba and Coracle. A scholarship letter or a formal sponsor declaration (Verpflichtungserklärung) can replace it." },
      { t: "Arrange health insurance", d: "For entry you need travel or incoming health insurance until you enrol. After enrolment you join German statutory student insurance (about €141 to €146 per month in 2026)." },
      { t: "Apply on the Consular Services Portal", d: "Students from Pakistan apply online at digital.diplo.de. Answer the questionnaire, then upload every document the portal lists. Missing documents stop your application." },
      { t: "Book and attend the appointment", d: "After the document check you get an appointment. Punjab, Khyber Pakhtunkhwa, Islamabad, Gilgit-Baltistan and AJK go to the Embassy in Islamabad; Sindh and Balochistan go to the Consulate General in Karachi." },
      { t: "Prepare for the interview", d: "Expect questions on your program, why Germany, how you finance your studies and your plans after graduation. Practise with the Raasta interview tool." },
      { t: "Pay the fee and wait", d: "The national visa fee is €75, paid in PKR. Processing times change with demand; apply as soon as you have your admission letter." },
      { t: "Travel and get your residence permit", d: "Your visa is usually valid for a few months. In Germany, register your address and apply for a residence permit at the foreigners office (Ausländerbehörde) before the visa expires." }
    ],
    missions: [
      { name: "German Embassy Islamabad", covers: "Punjab, Khyber Pakhtunkhwa, Islamabad, Gilgit-Baltistan, Azad Kashmir", url: "https://pakistan.diplo.de" },
      { name: "German Consulate General Karachi", covers: "Sindh, Balochistan", url: "https://pakistan.diplo.de" }
    ],
    money: [
      ["National (student) visa fee", "€75, paid in PKR"],
      ["Blocked account (2026)", "€11,904 per year, €992 per month"],
      ["Statutory student health insurance", "About €141 to €146 per month (2026, after enrolment)"],
      ["Blocked account provider fees", "Set up fee and monthly fee vary by provider; compare before opening"]
    ]
  },

  jobs: {
    rules: "Non EU students may work 140 full days or 280 half days per year. During the semester, Werkstudent jobs are limited to 20 hours a week. Mini jobs pay up to €603 per month without taxes or social security. The minimum wage in 2026 is €13.90 per hour.",
    apps: [
      { name: "Zenjob", url: "https://www.zenjob.com/de/", d: "App for flexible shifts in retail, logistics, events and offices. Choose shifts yourself, paid weekly." },
      { name: "Jobvalley", url: "https://www.jobvalley.com/", d: "Student job platform (formerly Studitemps): shifts, part time jobs and Werkstudent roles across Germany." },
      { name: "StudentJob", url: "https://www.studentjob.de/", d: "Large board for student jobs, mini jobs and internships." },
      { name: "Coople", url: "https://www.coople.com/de/", d: "App for short assignments in hospitality, logistics and retail." },
      { name: "Instaff", url: "https://www.instaff.jobs/", d: "Event, promotion and hospitality shifts, popular with students." }
    ],
    agencies: [
      { name: "TimePartner", url: "https://www.timepartner.com/", d: "Staffing agency with many offices, including Berlin. Office, logistics, industry and IT roles." },
      { name: "ManpowerGroup", url: "https://www.manpower.de/", d: "One of the largest staffing agencies: industry, logistics, office and IT." },
      { name: "Randstad", url: "https://www.randstad.de/", d: "Global staffing agency with offices in every big German city, including student and part time jobs." },
      { name: "Adecco", url: "https://www.adecco.de/", d: "Temporary and permanent jobs in office, industry and logistics." },
      { name: "Hays", url: "https://www.hays.de/", d: "Specialist recruiter for IT, engineering, finance and life sciences. Good for graduates." },
      { name: "Persona service", url: "https://www.persona.de/", d: "Staffing agency for industry, logistics and office jobs." }
    ],
    portals: [
      { name: "LinkedIn", url: "https://www.linkedin.com/jobs/", d: "Best for English speaking jobs, startups and graduate roles. Set your location to the city." },
      { name: "StepStone", url: "https://www.stepstone.de/", d: "Germany's biggest job board for professional and Werkstudent roles." },
      { name: "Indeed", url: "https://de.indeed.com/", d: "All types of jobs; search Werkstudent plus your field." },
      { name: "XING", url: "https://www.xing.com/jobs", d: "German professional network, strong with German speaking employers." },
      { name: "Bundesagentur für Arbeit Jobbörse", url: "https://www.arbeitsagentur.de/jobsuche/", d: "Official federal job portal with every kind of job, including internships." },
      { name: "Your university career service", url: null, d: "Job boards, CV checks and career fairs, free for students. Often the best source for internships." }
    ],
    tips: [
      "Make a German style CV (Lebenslauf): one or two pages, photo optional, clear dates.",
      "Learn some German: even A2 or B1 opens many more student jobs.",
      "Never pay a fee to get a job. Real agencies are paid by employers, not by you.",
      "Your employer needs your tax ID, health insurance and a German bank account."
    ]
  },

  moving: [
    { id: "register", ic: "🏠", t: "Registration (Anmeldung) and tax ID", items: [
      "Register your address at the local Bürgeramt within 14 days of moving in. Bring your passport and the landlord confirmation (Wohnungsgeberbestätigung).",
      "You get a registration certificate (Meldebescheinigung). Banks, the foreigners office and your blocked account payout need it.",
      "Your tax ID (Steuer-ID) arrives by post a few weeks after your first registration. Keep it: every employer needs it.",
      "Book Bürgeramt appointments online as early as possible; in big cities slots are scarce." ] },
    { id: "insurance", ic: "🩺", t: "Health and other insurance", items: [
      "Statutory student health insurance costs about €141 to €146 per month in 2026, almost the same at every public insurer. Popular with international students: TK, AOK, Barmer, DAK, hkk.",
      "Your university needs an insurance confirmation before it enrols you, so sign up right after admission.",
      "Private insurance only makes sense in special cases; if you opt out of statutory insurance you usually cannot switch back while studying.",
      "Personal liability insurance (Haftpflichtversicherung) is cheap and strongly recommended: it covers damage you cause to others or to your apartment." ] },
    { id: "housing", ic: "🔑", t: "Housing and avoiding scams", items: [
      "Apply for a Studierendenwerk dorm as soon as you are admitted; they are the cheapest option and have waiting lists.",
      "Shared flats (WG): WG-Gesucht.de is the main site. Apartments: ImmoScout24, Kleinanzeigen.",
      "Scam warning signs: the landlord is abroad and sends keys by post, asks for money before a viewing, wants Western Union or crypto, or the price is far below the market.",
      "Never pay a deposit before you have a signed contract. The deposit (Kaution) is legally capped at three months of cold rent.",
      "Rent for a 30 m² student flat (MLP report 2026): about €880 in Munich, €725 in Berlin, €700 to €720 in Frankfurt, Cologne, Hamburg and Heidelberg. Eastern cities such as Chemnitz and Magdeburg are far cheaper." ] },
    { id: "money", ic: "💳", t: "Money and bank accounts", items: [
      "Your blocked account pays €992 per month into a normal German current account (Girokonto), so open one in your first week.",
      "Online banks (N26, DKB) open quickly with just a passport. Traditional banks (Sparkasse, Commerzbank, Deutsche Bank) have branches and free student accounts but may need your registration certificate.",
      "Many shops and restaurants still prefer cash or the German debit card (Girocard). Carry some cash.",
      "Working: non EU students may work 140 full days or 280 half days per year. Student jobs (Werkstudent) up to 20 hours a week during the semester." ] },
    { id: "jobs", ic: "💼", t: "Student jobs, apps and agencies", items: [
      "Work rules: 140 full days or 280 half days per year; Werkstudent jobs up to 20 hours a week during the semester; mini jobs up to €603 per month.",
      "Shift apps: Zenjob, Jobvalley, Coople, Instaff. Choose your own shifts and get paid quickly.",
      "Staffing agencies: TimePartner, ManpowerGroup, Randstad, Adecco, Hays and Persona service place students in logistics, office, industry and IT jobs.",
      "Job portals: LinkedIn, StepStone, Indeed, XING and the official Arbeitsagentur Jobbörse. See the full list with links on the Jobs page.",
      "Never pay to get a job. Real agencies are paid by employers." ] },
    { id: "connect", ic: "📶", t: "Mobile and internet", items: [
      "Prepaid SIM cards (no contract) from Aldi Talk, Lidl Connect, Congstar or fraenk are cheap and flexible. You must verify your identity with your passport.",
      "The big networks are Telekom, Vodafone and O2. Discount brands use the same networks at lower prices.",
      "Home internet contracts often run 24 months. In a WG, internet is usually shared and included in the rent; check before signing." ] },
    { id: "transport", ic: "🚆", t: "Transport", items: [
      "Most universities include the Deutschlandsemesterticket in the semester fee: unlimited local and regional transport across Germany. It costs 60% of the Deutschlandticket (€63 per month in 2026).",
      "Without a semester ticket, the Deutschlandticket costs €63 per month and covers all local buses, trams, U-Bahn, S-Bahn and regional trains in Germany.",
      "Long distance ICE and IC trains are not included. Book early on DB Navigator for cheap saver fares.",
      "Cycling is common: use bike lanes and lights at night, or you can be fined." ] },
    { id: "daily", ic: "🛒", t: "Daily life: shops and apps", items: [
      "Cheapest supermarkets: Aldi, Lidl, Penny, Netto. Larger choice: Rewe, Edeka, Kaufland. Drugstores: dm and Rossmann.",
      "Halal meat and South Asian spices: Turkish and Arab grocery stores in every city; Asian stores for rice, lentils and spices.",
      "Shops are closed on Sundays and public holidays, except some at main train stations.",
      "Essential apps: DB Navigator, your city transport app, WG-Gesucht, Kleinanzeigen, Doctolib (doctor appointments), PayPal, Too Good To Go, Google Maps." ] },
    { id: "culture", ic: "🤝", t: "Culture and norms", items: [
      "Be on time. Arriving even 5 minutes late to a meeting, class or appointment is seen as impolite.",
      "Recycling is taken seriously: yellow bin for packaging, blue for paper, brown for organic, black for the rest. Return bottles with Pfand for your deposit back.",
      "Quiet hours (Ruhezeit) are usually 22:00 to 06:00 and all day on Sundays. No loud music or drilling.",
      "Do not cross at a red pedestrian light, even if the street is empty, especially when children are around.",
      "Germans are direct: a clear no is not rude. Use Sie (formal you) with professors and officials until they offer du." ] },
    { id: "leisure", ic: "🏞️", t: "Leisure", items: [
      "With the semester ticket, weekend trips by regional train cost nothing extra: lakes, castles, old towns and other cities.",
      "Join university sports (Hochschulsport): cheap classes from cricket to climbing. Many cities have Pakistani student associations.",
      "Christmas markets in December, beer gardens and lakes in summer, and cheap flights across Europe from major airports.",
      "Many museums have free or cheap student entry; always carry your student ID." ] }
  ]
};
