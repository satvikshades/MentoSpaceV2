// Consent notices and consent items for MentoSpace.
//
// Drafted against: Digital Personal Data Protection Act 2023 (ss. 5, 6, 9, 11-14)
// and DPDP Rules 2025 (Rules 3 and 10); IT (SPDI) Rules 2011 (Rules 3-5, still in
// force until DPDP's main provisions apply); Mental Healthcare Act 2017 (s. 23);
// POCSO Act 2012 (ss. 19, 21); RCI Act 1992; UGC (Prevention of Sexual Harassment)
// Regulations 2015. This is a working draft, not legal advice: have it reviewed by
// a lawyer before launch.
//
// >>> FILL IN EVERY [BRACKETED] VALUE IN `ORG` BEFORE GOING LIVE. <<<
// When you change any notice text, bump CONSENT_VERSION. Everyone who accepted
// an older version will be asked to accept again on their next login.

export const CONSENT_VERSION = "2026-10-25";

export const ORG = {
  legalName: "[Organisation legal name]",
  address: "[Registered address, City, State, PIN]",
  grievanceOfficer: "[Grievance Officer name]",
  grievanceEmail: "[grievance@yourdomain.in]",
  grievancePhone: "[+91 phone number]",
  safetyEmail: "[safety@yourdomain.in]",
  responseDays: 30,
  deletionDays: 30,
};

export const MIN_AGE = 13;
export const ADULT_AGE = 18;

export function ageFrom(dob) {
  if (!dob) return null;
  const b = new Date(dob + "T00:00:00");
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age;
}

export const HELPLINES = [
  { name: "Tele-MANAS (mental health, 24×7, free)", number: "14416" },
  { name: "Emergency (police, ambulance)", number: "112" },
  { name: "CHILDLINE (anyone under 18)", number: "1098" },
  { name: "NCW Women Helpline (24×7)", number: "14490" },
  { name: "National Women Helpline", number: "181" },
  { name: "Cyber Crime Helpline", number: "1930" },
];

/* ------------------------------------------------------------------ */
/* Notices. Each section: { id, title, body: string[] }               */
/* ------------------------------------------------------------------ */

const who = () => ({
  id: "who",
  title: "Who we are",
  body: [
    `MentoSpace is run by ${ORG.legalName}, ${ORG.address} ("we"). We decide why and how your personal data is used, which makes us the Data Fiduciary under the Digital Personal Data Protection Act, 2023.`,
    "MentoSpace connects students with mentors trained in psychology so they can talk about things like stress, depression, identity, growing up, and experiences of harassment, and build small daily habits.",
  ],
});

const notEmergency = {
  id: "emergency",
  title: "What MentoSpace is not",
  body: [
    "MentoSpace is not an emergency service, a hospital, or a replacement for a psychiatrist or doctor. Mentors do not diagnose illnesses or prescribe medicine. Each mentor's profile shows their qualification, and only mentors with a Rehabilitation Council of India (RCI) registration may call themselves clinical psychologists.",
    "If you or someone else is in immediate danger, call 112. For mental health support at any hour, call Tele-MANAS on 14416. Anyone under 18 can call CHILDLINE on 1098.",
  ],
};

const studentData = {
  id: "data",
  title: "What we collect",
  body: [
    "Account details: your name or nickname, email address, date of birth, and whether you are a student or mentor.",
    "Wellbeing information you choose to share: mood check-ins and notes, habits you track, messages with your mentor, and sessions you join. This is sensitive personal data about your mental health, and you can keep it as short as you like.",
    "If you are under 18: your parent or guardian's name, relationship to you, phone number and email.",
    "Basic technical data needed to keep your account secure, such as login times, handled by our hosting provider.",
    "We do not ask for your Aadhaar, caste, religion or sexual orientation, and you never have to share anything you're not comfortable with.",
  ],
};

const studentPurpose = {
  id: "purpose",
  title: "Why we use it",
  body: [
    "To create and run your account, show your check-ins, streaks and progress, and connect you with a mentor.",
    "To let the mentor you connect with support you. Your mentor can read your messages. They can see your mood check-ins only if you allow it below, and you can change that any time in Settings.",
    "To keep people safe, investigate complaints of abuse or harassment on MentoSpace, and meet our legal duties.",
    "We never sell your data, show you ads, or use your data to build an advertising profile.",
  ],
};

const sharing = {
  id: "sharing",
  title: "Who else can see it",
  body: [
    "Our hosting and login provider (Google Firebase) stores data for us under contract. Its servers may be outside India.",
    "A small number of authorised MentoSpace staff, only when needed to handle a complaint, a safety concern, or a request you make.",
    "Police, courts or other authorities, only when the law requires it (see the next section).",
  ],
};

const confidentiality = {
  id: "confidentiality",
  title: "Confidentiality, and when it has limits",
  body: [
    "What you share with your mentor stays private. Mentors agree to keep it confidential, in line with section 23 of the Mental Healthcare Act, 2017.",
    "There are a few situations where the law requires us or your mentor to share information, and we'll share only what is needed:",
    "• If a child (anyone under 18) is being, or may be, sexually abused, the Protection of Children from Sexual Offences (POCSO) Act, 2012 (section 19) requires us to report it to the police or Special Juvenile Police Unit. Not reporting is itself an offence under section 21.",
    "• If your life or someone else's life is at serious risk, we may contact emergency services or a person who can help keep you safe.",
    "• If a court or other legal authority orders us to share information.",
    "If you are 18 or older and tell us about sexual harassment, we will not report it without your agreement unless someone's life is at risk. Your mentor can explain your options, such as your college's Internal Complaints Committee (required under the UGC Regulations, 2015), the NCW helpline (14490), or the police.",
  ],
};

const studentRights = {
  id: "rights",
  title: "Your rights and choices",
  body: [
    "You can withdraw your consent at any time, as easily as you gave it, from Settings. You can also turn off mentor access to your mood check-ins without deleting anything. Withdrawing doesn't affect what was done before, and if you withdraw the main consent we will have to close your account.",
    "Under sections 11 to 14 of the DPDP Act you can ask for a summary of your data, ask us to correct or erase it, raise a grievance, and nominate someone to act for you if you die or can't act yourself.",
    `We keep your data while your account is open. When you delete your account, we erase it within ${ORG.deletionDays} days, except anything the law requires us to keep (for example, records connected to a POCSO report).`,
  ],
};

const grievance = {
  id: "grievance",
  title: "Questions and complaints",
  body: [
    `Grievance Officer: ${ORG.grievanceOfficer}, ${ORG.grievanceEmail}, ${ORG.grievancePhone}. We reply within ${ORG.responseDays} days.`,
    "If you're not satisfied with our reply, you can complain to the Data Protection Board of India.",
    "You can ask for this notice in English or any language listed in the Eighth Schedule of the Constitution by writing to the Grievance Officer.",
  ],
};

export const STUDENT_NOTICE = [who(), notEmergency, studentData, studentPurpose, sharing, confidentiality, studentRights, grievance];

export const GUARDIAN_NOTICE = [
  {
    id: "guardian",
    title: "For the parent or guardian",
    body: [
      "Your child wants to use MentoSpace to talk to a psychology mentor and track their wellbeing. Because they are under 18, the DPDP Act, 2023 (section 9) requires your consent before we process their data.",
      "Mentors keep conversations confidential so your child can speak freely. As their parent or guardian you can exercise their data rights on their behalf, such as asking for a summary of their data or for it to be deleted, by writing to our Grievance Officer.",
      "We will contact you if your child's safety requires it. Where the POCSO Act applies, we must also report to the police.",
      "We do not show ads to children, track them across other apps or websites, or build profiles to target them.",
      "We will contact you on the details below to confirm your consent. Until we do, your child's account will be marked as awaiting guardian confirmation.",
    ],
  },
];

export const MENTOR_NOTICE = [
  who(),
  {
    id: "m-data",
    title: "What we collect from mentors",
    body: [
      "Your name, email, date of birth, qualification, years of experience, areas you help with, bio and photo, and your RCI registration number if you have one.",
      "Documents or details we ask for to check your qualifications and background.",
      "Your messages, sessions and notes on MentoSpace, which we may review if a complaint or safety concern is raised.",
    ],
  },
  {
    id: "m-review",
    title: "Verification before you go live",
    body: [
      "Your account is created straight away, but students can't see you until we have checked your details. We may contact you for documents or a short call.",
      "We may refuse or remove a mentor at any time to protect students.",
    ],
  },
  {
    id: "m-duties",
    title: "What you agree to as a mentor",
    body: [
      "Keep everything students share confidential (Mental Healthcare Act, 2017, section 23). Never screenshot, copy, forward or discuss it outside MentoSpace, except as below.",
      "Report to the police or Special Juvenile Police Unit, and tell our safety team, whenever you learn or suspect that a child is being sexually abused (POCSO Act, 2012, section 19). Failing to report can lead to imprisonment of up to six months (section 21).",
      "If a student's life or someone else's is at serious risk, alert our safety team and emergency services straight away.",
      "Only call yourself a clinical psychologist if you hold a current RCI registration. Don't diagnose or prescribe unless you are licensed to.",
      "Keep contact on MentoSpace. No personal phone numbers, social media, meetings in person, gifts, money, or romantic or sexual contact of any kind with students. Breaking this ends your account and may be reported to the police.",
      "Treat every student with respect regardless of gender, sexuality, caste, religion, disability or background.",
    ],
  },
  { ...studentRights, title: "Your rights", body: [studentRights.body[0].replace("You can also turn off mentor access to your mood check-ins without deleting anything. ", ""), studentRights.body[1], studentRights.body[2]] },
  grievance,
];

/* ------------------------------------------------------------------ */
/* Consent items (checkboxes). Required ones gate account creation.   */
/* ------------------------------------------------------------------ */

export const STUDENT_ITEMS = [
  {
    id: "processing",
    required: true,
    label:
      "I agree that MentoSpace can collect and use my account details and the wellbeing information I share, including information about my mental health, for the purposes in this notice.",
  },
  {
    id: "limits",
    required: true,
    label:
      "I understand that my conversations are confidential, except where the law requires sharing: if a child may be sexually abused (POCSO), if a life is at risk, or if a court orders it.",
  },
  {
    id: "notEmergency",
    required: true,
    label: "I understand MentoSpace is not an emergency or medical service, and that I should call 112 or 14416 in a crisis.",
  },
  {
    id: "conduct",
    required: true,
    label: "I will treat mentors and others with respect and won't share anyone else's private information.",
  },
  {
    id: "shareMoods",
    required: false,
    label: "Optional: let the mentor I connect with see my mood check-ins and notes. You can change this later in Settings.",
  },
];

export const GUARDIAN_ITEMS = [
  {
    id: "guardian",
    required: true,
    label:
      "I am this student's parent or lawful guardian, I am 18 or older, and I consent to MentoSpace processing their personal data as described above.",
  },
];

export const MENTOR_ITEMS = [
  {
    id: "processing",
    required: true,
    label: "I agree that MentoSpace can collect and use my details, including for checking my qualifications and background.",
  },
  {
    id: "truthful",
    required: true,
    label: "The qualification and registration details I've given are true, and I'll tell MentoSpace if they change.",
  },
  {
    id: "confidentiality",
    required: true,
    label: "I will keep everything students share confidential and use it only to support them on MentoSpace.",
  },
  {
    id: "pocso",
    required: true,
    label: "I understand my duty under POCSO to report suspected sexual abuse of a child, and I will also alert MentoSpace's safety team.",
  },
  {
    id: "boundaries",
    required: true,
    label:
      "I will keep all contact on MentoSpace and will never have romantic, sexual, or financial contact with any student. I accept that breaking this rule ends my account.",
  },
  {
    id: "review",
    required: true,
    label: "I understand MentoSpace may review my messages if a complaint or safety concern is raised.",
  },
];

export const QUALIFICATIONS = [
  { key: "clinical", label: "Clinical psychologist (RCI registered)", needsRci: true },
  { key: "msc", label: "MA / MSc in Psychology" },
  { key: "counselling", label: "Diploma or certificate in counselling" },
  { key: "student", label: "Psychology student under supervision" },
  { key: "peer", label: "Trained peer mentor" },
];

export const qualificationLabel = (k) => QUALIFICATIONS.find((q) => q.key === k)?.label || "";
