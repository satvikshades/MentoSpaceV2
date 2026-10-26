import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { NoticeSections, Helplines } from "../components/ConsentForm";
import { CONSENT_VERSION, GUARDIAN_NOTICE, MENTOR_NOTICE, ORG, STUDENT_NOTICE } from "../lib/legal";

const TABS = [
  { key: "student", label: "Students", sections: STUDENT_NOTICE },
  { key: "guardian", label: "Parents & guardians", sections: GUARDIAN_NOTICE },
  { key: "mentor", label: "Mentors", sections: MENTOR_NOTICE },
];

function Privacy() {
  const [tab, setTab] = useState("student");
  const current = TABS.find((t) => t.key === tab);
  const version = new Date(CONSENT_VERSION + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-bg-light-gray">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <Link to="/" className="wordmark text-xl">
            MentoSpace<span className="text-secondary">.</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
            <FiArrowLeft /> Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="eyebrow">Privacy and consent</p>
        <h1 className="mt-2 text-[32px] font-extrabold leading-tight">How we handle what you share</h1>
        <p className="mt-2 text-sm text-muted">
          Version of {version}. Published by {ORG.legalName}.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === t.key ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <NoticeSections key={tab} sections={current.sections} openFirst />
        </div>

        <div className="mt-8">
          <Helplines />
        </div>

        <p className="mt-8 text-xs leading-relaxed text-muted">
          This notice is written to meet the Digital Personal Data Protection Act, 2023 and Rules, 2025, the Information Technology
          (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, the Mental Healthcare
          Act, 2017 and the Protection of Children from Sexual Offences Act, 2012.
        </p>
      </main>
    </div>
  );
}

export default Privacy;
