import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { FiCalendar, FiClock, FiPlus, FiTrash2 } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { dayKey, fmtTime } from "../../../lib/progress";
import { EmptyState, Modal, PageHeader, PageSkeleton, Spinner } from "../../ui";

const CATEGORIES = ["One-on-one", "Group", "Workshop", "Check-in"];

function SessionCard({ s, onDelete, past }) {
  const d = new Date(s.date + "T00:00");
  return (
    <div className={`card flex gap-4 p-4 ${past ? "opacity-60" : ""}`}>
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-50 text-center leading-none text-primary">
        <div>
          <p className="text-[11px] font-bold uppercase">{d.toLocaleDateString(undefined, { month: "short" })}</p>
          <p className="mt-1 text-2xl font-extrabold">{d.getDate()}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">{s.category}</p>
        <p className="truncate text-[17px] font-bold">{s.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <FiCalendar /> {d.toLocaleDateString(undefined, { weekday: "short" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <FiClock /> {fmtTime(s.time)}
          </span>
          {!onDelete && <span>with {s.mentorName}</span>}
        </p>
      </div>
      {onDelete && (
        <button onClick={() => onDelete(s)} className="self-start rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete session">
          <FiTrash2 />
        </button>
      )}
    </div>
  );
}

function Sessions() {
  const { user, profile, role } = useDashboard();
  const isMentor = role === "mentor";
  const [sessions, setSessions] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ title: "", category: CATEGORIES[0], date: dayKey(), time: "18:00" });

  useEffect(() => {
    if (isMentor) {
      const q = query(collection(db, "sessions"), where("mentorId", "==", user.uid));
      return onSnapshot(q, (snap) => setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    }
    // students see sessions from mentors they're connected to
    (async () => {
      try {
        const r = await getDocs(query(collection(db, "requests"), where("studentId", "==", user.uid)));
        const ids = [...new Set(r.docs.map((d) => d.data()).filter((x) => x.status === "accepted").map((x) => x.mentorId))].slice(0, 10);
        if (!ids.length) return setSessions([]);
        const s = await getDocs(query(collection(db, "sessions"), where("mentorId", "in", ids)));
        setSessions(s.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setSessions([]);
      }
    })();
  }, [user.uid, isMentor]);

  if (!sessions) return <PageSkeleton />;

  const today = dayKey();
  const sorted = [...sessions].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const upcoming = sorted.filter((s) => s.date >= today);
  const past = sorted.filter((s) => s.date < today).reverse().slice(0, 6);

  const create = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Give the session a title.");
    if (form.date < today) return toast.error("Pick a date from today onwards.");
    setSaving(true);
    try {
      await addDoc(collection(db, "sessions"), {
        ...form,
        title: form.title.trim(),
        mentorId: user.uid,
        mentorName: profile.name || user.displayName || "Mentor",
        createdAt: Date.now(),
      });
      toast.success("Session scheduled");
      setForm({ title: "", category: CATEGORIES[0], date: today, time: "18:00" });
      setOpen(false);
    } catch {
      toast.error("Couldn't create the session.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const s = confirm;
    setConfirm(null);
    try {
      await deleteDoc(doc(db, "sessions", s.id));
      toast("Session deleted");
    } catch {
      toast.error("Couldn't delete.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Sessions"
        title={isMentor ? "Your calendar" : "Sessions from your mentors"}
        subtitle={isMentor ? "Your students see these on their Today page." : undefined}
        action={
          isMentor && (
            <button onClick={() => setOpen(true)} className="btn-primary">
              <FiPlus /> New session
            </button>
          )
        }
      />

      {upcoming.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nothing coming up"
          body={isMentor ? "Schedule a session and your students will see it straight away." : "When your mentor schedules a session, it'll appear here."}
          action={isMentor && <button onClick={() => setOpen(true)} className="btn-primary"><FiPlus /> New session</button>}
        />
      ) : (
        <div className="space-y-3">
          {upcoming.map((s) => (
            <SessionCard key={s.id} s={s} onDelete={isMentor ? setConfirm : null} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-bold uppercase tracking-wider text-muted">Earlier</h2>
          <div className="space-y-3">
            {past.map((s) => (
              <SessionCard key={s.id} s={s} past onDelete={isMentor ? setConfirm : null} />
            ))}
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New session">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label" htmlFor="s-title">Title</label>
            <input id="s-title" autoFocus className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Handling exam stress" />
          </div>
          <div>
            <span className="label">Type</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm({ ...form, category: c })}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
                    form.category === c ? "bg-primary-50 text-primary ring-primary" : "ring-line hover:bg-bg-light-gray"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="s-date">Date</label>
              <input id="s-date" type="date" min={today} className="field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-time">Time</label>
              <input id="s-time" type="time" className="field" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <button disabled={saving} className="btn-primary w-full">
            {saving && <Spinner />} Schedule
          </button>
        </form>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete this session?">
        <p className="text-sm text-muted">“{confirm?.title}” will be removed for your students too.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Keep</button>
          <button onClick={remove} className="btn bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

export default Sessions;
