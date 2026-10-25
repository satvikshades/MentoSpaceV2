import { useState } from "react";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { useDashboard, useProgress } from "../../../lib/useProgress";
import { addHabit, HABIT_CATEGORIES, HABIT_IDEAS, removeHabit } from "../../../lib/actions";
import { doneToday } from "../../../lib/progress";
import { EmptyState, Modal, PageHeader, PageSkeleton, Ring, Spinner } from "../../ui";
import HabitRow from "./HabitRow";
import { LevelCard, StreakCard } from "./Today";

function NewHabit({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(HABIT_CATEGORIES[0].key);
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Give your habit a name.");
    setSaving(true);
    try {
      await onCreate({ title, category, desc });
      setTitle("");
      setDesc("");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New habit">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="h-title">What will you do?</label>
          <input
            id="h-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field"
            placeholder="e.g. 10 minutes of reading"
            maxLength={60}
          />
          <p className="mt-1.5 text-xs text-muted">Smaller is better. You can always grow it later.</p>
        </div>
        <div>
          <span className="label">Category</span>
          <div className="grid grid-cols-2 gap-2">
            {HABIT_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ring-1 transition ${
                  category === c.key ? "bg-primary-50 text-primary ring-primary" : "ring-line hover:bg-bg-light-gray"
                }`}
              >
                <span>{c.icon}</span>
                <span className="truncate">{c.key}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="h-desc">Why it matters to you <span className="font-normal text-muted">(optional)</span></label>
          <input id="h-desc" value={desc} onChange={(e) => setDesc(e.target.value)} className="field" maxLength={90} />
        </div>
        <button disabled={saving} className="btn-primary w-full">
          {saving && <Spinner />} Add habit
        </button>
      </form>
    </Modal>
  );
}

function Habits() {
  const { user } = useDashboard();
  const p = useProgress(user.uid);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  if (p.loading) return <PageSkeleton />;

  const done = p.habits.filter(doneToday).length;
  const total = p.habits.length;

  const create = async (data) => {
    try {
      const h = await addHabit(user.uid, data);
      p.setHabits((prev) => [...prev, h]);
      toast.success("Habit added");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't add that habit.");
      throw err;
    }
  };

  const doDelete = async () => {
    const h = confirm;
    setConfirm(null);
    const before = p.habits;
    p.setHabits((prev) => prev.filter((x) => x.id !== h.id));
    try {
      await removeHabit(h.id);
      toast.success("Habit removed");
    } catch {
      p.setHabits(before);
      toast.error("Couldn't remove it.");
    }
  };

  const unused = HABIT_IDEAS.filter((i) => !p.habits.some((h) => h.title.toLowerCase() === i.title.toLowerCase()));

  return (
    <div>
      <PageHeader
        eyebrow="Habits"
        title="Small things, every day"
        subtitle="Each tick earns XP. Do the same habit on back-to-back days and it earns more."
        action={
          <button onClick={() => setOpen(true)} className="btn-primary">
            <FiPlus /> New habit
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-5 lg:col-span-2">
          {total > 0 && (
            <div className="card flex items-center gap-5 p-5">
              <Ring value={(done / total) * 100} size={72} stroke={7}>
                <span className="text-sm font-extrabold">{Math.round((done / total) * 100)}%</span>
              </Ring>
              <div>
                <p className="text-lg font-bold">
                  {done === total ? "Everything's done for today" : `${done} of ${total} done today`}
                </p>
                <p className="text-sm text-muted">
                  {done === total ? "Enjoy the rest of your day." : "Tap the circle when you finish one."}
                </p>
              </div>
            </div>
          )}

          {total === 0 ? (
            <EmptyState
              icon="✨"
              title="No habits yet"
              body="Start with one thing that takes under ten minutes. Pick an idea below or write your own."
              action={
                <button onClick={() => setOpen(true)} className="btn-primary">
                  <FiPlus /> Add your first habit
                </button>
              }
            />
          ) : (
            <div className="space-y-2">
              {p.habits.map((h) => (
                <HabitRow
                  key={h.id}
                  uid={user.uid}
                  habit={h}
                  onDelete={setConfirm}
                  onUpdated={(nh, log) => {
                    p.setHabits((prev) => prev.map((x) => (x.id === nh.id ? nh : x)));
                    if (log) p.setLogs((prev) => [...prev, log]);
                  }}
                />
              ))}
            </div>
          )}

          {unused.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-muted">Ideas that work for a lot of people</p>
              <div className="flex flex-wrap gap-2">
                {unused.map((idea) => (
                  <button
                    key={idea.title}
                    onClick={() => create(idea)}
                    className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold ring-1 ring-line transition hover:text-primary hover:ring-primary"
                  >
                    <FiPlus className="h-3.5 w-3.5" /> {idea.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <StreakCard streak={p.streak} best={p.best} week={p.week} />
          <LevelCard xp={p.xp} level={p.level} />
          <div className="card p-5 text-sm leading-relaxed text-ink/80">
            <p className="font-bold text-ink">How XP works</p>
            <ul className="mt-2 space-y-1.5">
              <li>Daily check-in: <b>+15</b></li>
              <li>Habit done: <b>+22</b>, plus 2 for every day of its streak (up to +50)</li>
              <li>Missed a day? Your XP and level stay. Only the streak resets.</li>
            </ul>
          </div>
        </aside>
      </div>

      <NewHabit open={open} onClose={() => setOpen(false)} onCreate={create} />

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Remove this habit?">
        <p className="text-sm text-muted">
          “{confirm?.title}” and its streak will be removed. XP you've already earned from it goes with it.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setConfirm(null)} className="btn-ghost">Keep it</button>
          <button onClick={doDelete} className="btn bg-red-600 text-white hover:bg-red-700">Remove</button>
        </div>
      </Modal>
    </div>
  );
}

export default Habits;
