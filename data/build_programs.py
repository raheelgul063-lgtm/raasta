# Source of truth for the starter program database. Facts copied from DAAD MyGUIDE listings (checked 2 Nov 2026).
import json, datetime
MG = "https://www.myguide.de/en/"
IPM = MG + "international-programmes-master/detail/"
IPB = MG + "international-programmes-bachelor/detail/"
DP = MG + "degree-programmes/detail/"
CS, EE, ME, EN, BU, LS, NS = ("Computer Science / Data Science / AI", "Electrical / Electronics Engineering",
  "Mechanical / Mechatronics Engineering", "Energy / Environment / Civil Engineering",
  "Business / Management / Economics", "Life Sciences / Biotech / Health", "Natural Sciences")
U, UAS, PRIV = "University", "University of Applied Sciences", "Private university"
P = []
def add(**k):
    k.setdefault("tuition_note", None); k.setdefault("semester_fee", None); k.setdefault("english_req", None)
    k.setdefault("other_req", None); k.setdefault("apply_via", "Check program page"); k.setdefault("deadline_note", None)
    k.setdefault("deadline_winter", None); k.setdefault("deadline_summer", None); k.setdefault("duration", None)
    k.setdefault("language", "English"); k.setdefault("summary", None)
    P.append(k)

add(university="University of Hildesheim", program="Data Analytics", degree="Master", title="M.Sc.", field=CS, city="Hildesheim", state="Lower Saxony", type=U,
    duration=4, tuition=0, intakes=["Winter","Summer"], deadline_winter="06-30", deadline_summer="12-15",
    summary="Interdisciplinary program combining applied computer science and mathematics with application modules.",
    url=IPM+"university-of-hildesheim-data-analytics-msc-5561/?ip-id=5561")
add(university="Bingen University of Applied Sciences", program="Computer Science", degree="Master", title="M.Sc.", field=CS, city="Bingen am Rhein", state="Rhineland-Palatinate", type=UAS,
    duration=3, tuition=0, semester_fee="about 230 EUR", intakes=["Winter"], deadline_winter="06-01",
    deadline_note="Application period opens in early May and closes in early June (listings show 1 June and 15 June). Check the university website.",
    summary="Modules include information systems architecture, systems analysis, artificial intelligence and advanced databases.",
    url=IPM+"bingen-university-of-applied-sciences-master-of-science-in-computer-science-8324/?ip-id=8324")
add(university="Saarland University", program="Computer Science", degree="Master", title="M.Sc.", field=CS, city="Saarbrücken", state="Saarland", type=U,
    duration=4, tuition=0, intakes=["Winter","Summer"], deadline_winter="05-15", deadline_summer="11-15",
    deadline_note="Early deadlines: apply by 15 November for winter (decision by mid February) or by 15 May for summer.",
    english_req="C1, e.g. IELTS Academic 7.0, TOEFL iBT 95 or PTE Academic 76",
    summary="All courses and seminars taught in English at one of Germany's strongest computer science campuses.",
    url=IPM+"saarland-university-computer-science-msc-3624/?ip-id=3624")
add(university="Saarland University", program="Data Science and Artificial Intelligence", degree="Master", title="M.Sc.", field=CS, city="Saarbrücken", state="Saarland", type=U,
    duration=4, tuition=None, intakes=["Winter","Summer"], deadline_summer="01-15",
    deadline_note="Non EU deadline for summer semester: 15 January. Winter deadlines differ per program, see uni-saarland.de.",
    summary="Focus on artificial intelligence, machine learning and database systems.",
    url=DP+"saarland-university-data-science-and-artificial-intelligence-w63909/?hec-id=w63909")
add(university="University of Rostock", program="Computer Science International", degree="Master", title="M.Sc.", field=CS, city="Rostock", state="Mecklenburg-Western Pomerania", type=U,
    duration=4, tuition=0, intakes=["Winter","Summer"], deadline_winter="05-31", deadline_summer="11-30",
    deadline_note="Non EU application periods: 1 April to 31 May (winter) and 1 October to 30 November (summer).",
    url=DP+"university-of-rostock-computer-science-international-w65237/?hec-id=w65237")
add(university="Hof University of Applied Sciences", program="Applied Research in Computer Science", degree="Master", title="M.Sc.", field=CS, city="Hof", state="Bavaria", type=UAS,
    duration=3, tuition=0, semester_fee="about 150 EUR", intakes=["Winter","Summer"], deadline_winter="05-31", deadline_summer="11-30",
    deadline_note="Portal open 15 April to 31 May (winter) and 5 to 30 November (summer).",
    english_req="IELTS 6.5 or TOEFL 90", other_req="Basic German, minimum A1 certificate",
    url=IPM+"hof-university-of-applied-sciences-applied-research-in-computer-science-msc-6236/?ip-id=6236")
add(university="Leibniz University Hannover", program="Computer Science", degree="Master", title="M.Sc.", field=CS, city="Hannover", state="Lower Saxony", type=U,
    duration=4, tuition=None, intakes=["Winter","Summer"], deadline_winter="05-31", deadline_summer="11-30", apply_via="uni-assist (VPD required)",
    deadline_note="Non EU: 15 April to 31 May (winter), 15 October to 30 November (summer). Only possible with a VPD from uni-assist.",
    url=DP+"university-of-hannover-computer-science-w70166/?hec-id=w70166")
add(university="TU Ilmenau", program="Data Science", degree="Master", title="M.Sc.", field=CS, city="Ilmenau", state="Thuringia", type=U,
    duration=4, tuition=0, semester_fee="about 270 EUR", language="English (some German)", intakes=["Winter","Summer"], deadline_winter="05-15", deadline_summer="11-15",
    deadline_note="Non EU: 16 February to 15 May (winter), 16 July to 15 November (summer).",
    url=DP+"technische-universitaet-ilmenau-data-science-w72756/?hec-id=w72756")
add(university="University of Koblenz", program="Web and Data Science", degree="Master", title="M.Sc.", field=CS, city="Koblenz", state="Rhineland-Palatinate", type=U,
    duration=4, tuition=0, semester_fee="about 290 EUR", intakes=["Winter"], deadline_winter="06-15",
    deadline_note="Non EU applicants: 15 June. Places are limited, apply early.", other_req="No German needed",
    summary="Interdisciplinary: computer science and data science with links to social sciences, economics, law and linguistics.",
    url=IPM+"university-of-koblenz-web-and-data-science-msc-4384/?ip-id=4384")
add(university="Albstadt-Sigmaringen University", program="Industrial Artificial Intelligence", degree="Master", title="Master", field=CS, city="Albstadt / Sigmaringen", state="Baden-Württemberg", type=UAS,
    tuition=1500, tuition_note="Baden-Württemberg charges non EU students 1,500 EUR per semester", intakes=["Winter","Summer"], deadline_winter="07-15", deadline_summer="01-15",
    other_req="Documents must first be approved by Studienkolleg Konstanz",
    summary="Python for AI, machine and deep learning, generative AI, big data and industry software projects.",
    url=DP+"albstadt-sigmaringen-university-university-of-engineering-and-economics-industrial-artificial-intelligence-w73251/?hec-id=w73251")
add(university="Technische Hochschule Mittelhessen", program="Control, Computer and Communications Engineering", degree="Master", title="M.Sc.", field=EE, city="Friedberg (Hessen)", state="Hesse", type=UAS,
    duration=3, tuition=0, intakes=["Winter","Summer"], apply_via="uni-assist",
    other_req="Bachelor's in electrical engineering, communications, computer engineering or similar",
    url=IPM+"technische-hochschule-mittelhessen-university-of-applied-sciences-control-computer-and-communications-engineering-ccce-3815/?ip-id=3815")
add(university="TU Ilmenau", program="Micro- and Nanotechnologies", degree="Master", title="M.Sc.", field=EE, city="Ilmenau", state="Thuringia", type=U,
    duration=4, tuition=0, semester_fee="about 320 EUR", intakes=["Winter"], deadline_winter="05-15",
    deadline_note="TU Ilmenau non EU deadline for winter is 15 May. Confirm on campus.tu-ilmenau.de/apply.", other_req="German course compulsory if you have no German",
    url=IPM+"technische-universitaet-ilmenau-master-of-science-in-micro-and-nanotechnologies-4823/?ip-id=4823")
add(university="TU Ilmenau", program="Biomedical Engineering by Research", degree="Master", title="M.Sc.", field=LS, city="Ilmenau", state="Thuringia", type=U,
    duration=4, tuition=0, semester_fee="about 320 EUR", intakes=["Winter","Summer"], deadline_winter="05-15", deadline_summer="11-15",
    deadline_note="TU Ilmenau non EU deadlines: 15 May (winter), 15 November (summer). Confirm on campus.tu-ilmenau.de/apply.",
    summary="Taught 100% in English, in cooperation with Universiti Teknologi Malaysia.",
    url=IPM+"technische-universitaet-ilmenau-master-of-science-in-biomedical-engineering-by-research-10457/?ip-id=10457")
add(university="Hochschule Nordhausen", program="Mechatronics", degree="Master", title="M.Eng.", field=ME, city="Nordhausen", state="Thuringia", type=UAS,
    duration=3, tuition=0, intakes=["Winter","Summer"],
    other_req="Bachelor's with 210 ECTS in a suitable field. With fewer credits an extra semester may be offered.",
    summary="Mechatronic systems, autonomous vehicles, Industry 4.0 and robotics.",
    url=DP+"hochschule-nordhausen-mechatronics-w59944/?hec-id=w59944")
add(university="Hochschule Schmalkalden", program="Mechatronics and Robotics", degree="Master", title="M.Eng.", field=ME, city="Schmalkalden", state="Thuringia", type=UAS,
    duration=3, tuition=None, language="English (some German)", intakes=["Winter"],
    english_req="TOEFL iBT 79 or English as medium of instruction in your Bachelor's",
    other_req="7 semester Bachelor's in mechanical, mechatronics or electrical engineering, grade 2.5 or better (German scale)",
    url="https://myguide.de/en/degree-programmes/mechatronics-and-robotics/?hec-id=w64013")
add(university="Rhine-Waal University of Applied Sciences", program="Mechanical Engineering", degree="Master", title="M.Sc.", field=ME, city="Kleve", state="North Rhine-Westphalia", type=UAS,
    duration=3, tuition=0, intakes=["Winter","Summer"], url=DP+"rhine-waal-university-of-applied-sciences-mechanical-engineering-w44152/?hec-id=w44152")
add(university="Rhine-Waal University of Applied Sciences", program="Biological Resources", degree="Master", title="M.Sc.", field=LS, city="Kleve", state="North Rhine-Westphalia", type=UAS,
    duration=3, tuition=0, semester_fee="about 300 EUR", intakes=["Winter","Summer"], deadline_winter="07-15", deadline_summer="01-15",
    url=IPM+"rhine-waal-university-of-applied-sciences-biological-resources-msc-4619/?ip-id=4619")
add(university="HAW Hamburg", program="Pharmaceutical Biotechnology", degree="Master", title="M.Sc.", field=LS, city="Hamburg", state="Hamburg", type=UAS,
    duration=3, tuition=0, intakes=["Winter","Summer"], deadline_winter="07-15", deadline_summer="01-15", apply_via="uni-assist check first, then HAW portal",
    deadline_note="Application periods: 1 June to 15 July (October start), 1 December to 15 January (April start).",
    other_req="German A2 certificate required (lab communication is in German)",
    url=IPM+"hamburg-university-of-applied-sciences-msc-pharmaceutical-biotechnology-4027/?ip-id=4027")
add(university="BTU Cottbus-Senftenberg", program="Biotechnology", degree="Master", title="M.Sc.", field=LS, city="Senftenberg", state="Brandenburg", type=U,
    duration=3, tuition=0, semester_fee="about 374 EUR", intakes=["Winter","Summer"], deadline_note="See b-tu.de/en/biotechnology-ms/admission for current dates.",
    summary="Small groups, all lectures and labs in English, five month thesis project.",
    url=IPM+"brandenburg-university-of-technology-cottbus-senftenberg-biotechnology-3888/?ip-id=3888")
add(university="Hochschule Flensburg", program="Applied Biotechnology and Food Science", degree="Master", title="Master", field=LS, city="Flensburg", state="Schleswig-Holstein", type=UAS,
    tuition=0, intakes=["Summer"], deadline_summer="01-01", apply_via="uni-assist", tuition_note="One time enrolment fee of 80 EUR",
    url=DP+"hochschule-flensburg-applied-biotechnology-and-food-science-w26414/?hec-id=w26414")
add(university="HAW Hamburg", program="Renewable Energy Systems", degree="Master", title="M.Eng.", field=EN, city="Hamburg", state="Hamburg", type=UAS,
    duration=3, tuition=0, language="English (some German)", intakes=["Winter"],
    other_req="Bachelor's in environmental, process or related engineering",
    url=DP+"hamburg-university-of-applied-sciences-renewable-energy-systems-environmental-and-process-engineering-w26684/?hec-id=w26684")
add(university="Technical University of Munich", program="Sustainable Energy and Processes", degree="Master", title="M.Sc.", field=EN, city="Straubing", state="Bavaria", type=U,
    duration=4, tuition=4000, tuition_note="Non EU students pay 4,000 EUR per semester at TUM", intakes=["Winter","Summer"], deadline_winter="05-31", deadline_summer="11-30",
    deadline_note="1 February to 31 May (winter), 1 October to 30 November (summer).",
    english_req="C1, e.g. IELTS Academic 6.5 or TOEFL iBT 88",
    url=IPM+"technical-university-of-munich-sustainable-energy-and-processes-10379/?ip-id=10379")
add(university="Europa-Universität Flensburg", program="Sustainable Energy, Transition (SET)", degree="Master", title="M.Eng.", field=EN, city="Flensburg", state="Schleswig-Holstein", type=U,
    duration=3, tuition=0, language="English (about 80%)", intakes=["Winter","Summer"], deadline_winter="01-15", deadline_summer="07-15",
    deadline_note="As listed: 1 December to 15 January for winter, 15 May to 15 July for summer.",
    english_req="B2, e.g. IELTS Academic 6.0",
    url=IPM+"europa-universitaet-flensburg-sustainable-energy-specialisation-transition-set-11019/?ip-id=11019")
add(university="TH Köln", program="Natural Resources Management and Development", degree="Master", title="M.Sc.", field=EN, city="Köln", state="North Rhine-Westphalia", type=UAS,
    duration=4, tuition=0, intakes=["Winter"], deadline_note="Different deadlines for self financing students and DAAD EPOS scholarship applicants.",
    english_req="B2, e.g. IELTS Academic 6.0 or TOEFL iBT 79",
    summary="Land use, food security, urban management and resources; includes field research abroad. DAAD development related course.",
    url=IPM+"technische-hochschule-koeln-university-of-applied-sciences-natural-resources-management-and-development-master-of-science-4189/?ip-id=4189")
add(university="University of Mannheim", program="Economics", degree="Master", title="M.Sc.", field=BU, city="Mannheim", state="Baden-Württemberg", type=U,
    duration=4, tuition=1500, tuition_note="Non EU students pay 1,500 EUR per semester", intakes=["Winter"], deadline_winter="05-15",
    deadline_note="Application period 1 April to 15 May.", other_req="No German required",
    url=IPM+"university-of-mannheim-master-of-science-in-economics-4193/?ip-id=4193")
add(university="Nürtingen-Geislingen University", program="International Management", degree="Master", title="Master", field=BU, city="Nürtingen", state="Baden-Württemberg", type=UAS,
    tuition=1500, tuition_note="1,500 EUR per semester for international students", intakes=["Winter","Summer"], deadline_winter="06-15", deadline_summer="12-01",
    url=DP+"business-economics-and-environment-university-nuertingen-geislingen-international-management-w6254/?hec-id=w6254")
add(university="WHU Otto Beisheim School of Management", program="Master's in Management", degree="Master", title="M.Sc.", field=BU, city="Vallendar", state="Rhineland-Palatinate", type=PRIV,
    duration=4, tuition=9900, tuition_note="39,600 EUR in total (2025 intake), includes semester abroad", intakes=["Winter"], deadline_winter="04-30",
    deadline_note="Applicants who need a visa: 30 April.", other_req="Bachelor's in business or economics, at most two years of work experience",
    url=IPM+"whu-otto-beisheim-school-of-management-masters-in-management-msc-9758/?ip-id=9758")
add(university="International School of Management (ISM)", program="International Management", degree="Master", title="Master", field=BU, city="Dortmund (also Berlin, Frankfurt, Munich, Hamburg, Cologne, Stuttgart)", state="North Rhine-Westphalia", type=PRIV,
    duration=4, tuition=6480, tuition_note="Plus one time enrolment fee of 1,500 EUR for non EU students", intakes=["Winter"], deadline_winter="07-15",
    deadline_note="Applicants who need a visa: 15 July.",
    url=IPM+"international-school-of-management-ism-master-in-international-management-5260/?ip-id=5260")
add(university="University of Wuppertal", program="Sustainable Chemistry", degree="Bachelor", title="B.Sc.", field=NS, city="Wuppertal", state="North Rhine-Westphalia", type=U,
    duration=6, tuition=0, semester_fee="337 EUR incl. Deutschlandticket", intakes=["Winter"], deadline_winter="07-15",
    deadline_note="International applicants: 15 May to 15 July.", english_req="B2, e.g. IELTS 5.5",
    url=IPB+"university-of-wuppertal-sustainable-chemistry-9873/?ip-id=9873")
add(university="Weihenstephan-Triesdorf University of Applied Sciences", program="Applied Informatics", degree="Bachelor", title="B.Sc.", field=CS, city="Freising", state="Bavaria", type=UAS,
    duration=7, tuition=0, semester_fee="about 85 EUR", intakes=["Winter"], deadline_winter="06-07",
    deadline_note="Early May to 7 June for the October start.",
    url=IPB+"weihenstephan-triesdorf-university-of-applied-sciences-applied-informatics-9990/?ip-id=9990")
add(university="TH Deggendorf", program="International Management", degree="Bachelor", title="B.A.", field=BU, city="Deggendorf", state="Bavaria", type=UAS,
    duration=7, tuition=0, semester_fee="82 EUR", intakes=["Winter"], deadline_winter="07-15",
    deadline_note="15 April to 15 July.", english_req="B2", other_req="Aptitude test",
    url=DP+"technische-hochschule-deggendorf-international-management-g12195/?hec-id=g12195")
add(university="Rhine-Waal University of Applied Sciences", program="Environment and Energy", degree="Bachelor", title="B.Sc.", field=EN, city="Kamp-Lintfort", state="North Rhine-Westphalia", type=UAS,
    duration=7, tuition=0, semester_fee="about 300 EUR", intakes=["Winter"], deadline_winter="07-15", english_req="B2",
    url=IPB+"rhine-waal-university-of-applied-sciences-environment-and-energy-bsc-4223/?ip-id=4223")
add(university="Rhine-Waal University of Applied Sciences", program="Electrical and Electronics Engineering", degree="Bachelor", title="B.Sc.", field=EE, city="Kleve", state="North Rhine-Westphalia", type=UAS,
    duration=7, tuition=0, intakes=["Winter"], url="https://www.myguide.de/en/degree-programmes/electrical-and-electronics-engineering/?hec-id=g1062460")
add(university="Rhine-Waal University of Applied Sciences", program="Mechanical Engineering", degree="Bachelor", title="B.Sc.", field=ME, city="Kleve", state="North Rhine-Westphalia", type=UAS,
    duration=7, tuition=0, intakes=["Winter"], url="https://www.myguide.de/en/degree-programmes/mechanical-engineering/?hec-id=g850134")
add(university="Rhine-Waal University of Applied Sciences", program="Infotronic Systems Engineering", degree="Bachelor", title="B.Sc.", field=EE, city="Kamp-Lintfort", state="North Rhine-Westphalia", type=UAS,
    duration=7, tuition=0, intakes=["Winter"], url=DP+"rhine-waal-university-of-applied-sciences-infotronic-systems-engineering-g1322744/?hec-id=g1322744")
add(university="Rhine-Waal University of Applied Sciences", program="Bioengineering", degree="Bachelor", title="B.Sc.", field=LS, city="Kleve", state="North Rhine-Westphalia", type=UAS,
    duration=7, tuition=0, intakes=["Winter"], url=DP+"rhine-waal-university-of-applied-sciences-bioengineering-g1322743/?hec-id=g1322743")

for i, p in enumerate(P, 1):
    p["id"] = i; p["verified_on"] = "2026-11-02"; p["source"] = "DAAD MyGUIDE"
print(len(P), "programs")
open("/home/claude/raasta/programs.js", "w", encoding="utf-8").write(
  "// Starter program database. Source: DAAD MyGUIDE (myguide.de), checked 2 November 2026.\n// Used in Demo mode and as fallback; live data comes from the Supabase 'programs' table.\nwindow.RAASTA_PROGRAMS = " + json.dumps(P, ensure_ascii=False, indent=1) + ";\n")

def q(v):
    if v is None: return "null"
    if isinstance(v, list): return "array[" + ",".join(q(x) for x in v) + "]::text[]"
    if isinstance(v, (int, float)): return str(v)
    return "'" + str(v).replace("'", "''") + "'"
cols = ["id","university","program","degree","title","field","city","state","type","language","duration","tuition","tuition_note","semester_fee","intakes","deadline_winter","deadline_summer","deadline_note","english_req","other_req","apply_via","summary","url","source","verified_on"]
rows = ",\n".join("(" + ",".join(q(p[c]) for c in cols) + ")" for p in P)
sql = f"insert into public.programs ({','.join(cols)}) values\n{rows}\non conflict (id) do nothing;\nselect setval(pg_get_serial_sequence('public.programs','id'), (select max(id) from public.programs));\n"
open("/home/claude/raasta/supabase/seed_programs.sql", "w", encoding="utf-8").write(sql)
