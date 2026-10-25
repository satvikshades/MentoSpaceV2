import { useState } from "react";
import toast from "react-hot-toast";
import { logMood } from "../../../lib/actions";
import { MOODS, moodByKey, MOOD_XP, todayPrompt } from "../../../lib/progress";
import { Burst, Spinner } from "../../ui";

/** Shown when someone picks "Struggling". Kept calm and practical. */
export function SupportNote() {
  return (
    <div className="rounded-2xl bg-violet-50 p-4 text-sm leading-relaxed text-violet-900 ring-1 ring-violet-200">
      <p className="font-bold">If things feel heavy right now</p>
      <p className="mt-1">
        Message your mentor, or talk to someone you trust today. In India you can call Tele-MANAS
        free, any time, on <a className="font-bold underline" href="tel:14416">14416</a>. Elsewhere,
        your local emergency number can connect you to help.
      </p>
    </div>
  );
}

/**
 * The daily check-in. One tap to pick a mood, optional note, done.
 * `today` is today's existing mood entry if there is one.
 */
export default function MoodTracker({ uid, today, onLogged, streak = 0 }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [fire, setFire] = useState(0);
  const prompt = todayPrompt();

  const submit = async () => {
    if (!selected || saving) return;
    setSaving(true);
    try {
      const entry = await logMood(uid, selected, note);
      setFire(Date.now());
      onLogged?.(entry);
      toast.success(`Checked in · +${MOOD_XP} XP`);
      setNote("");
      setSelected(null);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save that. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (today) {
    const m = moodByKey[today.mood] || MOODS[2];
    return (
      <div className="relative">
        <Burst fire={fire} />
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-bg-light-gray text-3xl animate-pop">
            {m.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-muted">Today you're feeling</p>
            <p className="text-xl font-bold">{m.label}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{today.insight?.summary}</p>
            {today.note && (
              <p className="mt-3 border-l-2 border-primary/30 pl-3 font-serif text-[15px] italic text-ink/70">
                {today.note}
              </p>
            )}
          </div>
        </div>
        {today.mood === "depressed" && (
          <div className="mt-4">
            <SupportNote />
          </div>
        )}
        <p className="mt-5 rounded-xl bg-bg-light-gray px-4 py-3 text-sm text-ink/70">
          {streak > 1
            ? `That's ${streak} days in a row. See you tomorrow to make it ${streak + 1}.`
            : "Come back tomorrow and start a streak."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Burst fire={fire} />
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {MOODS.map((m, i) => {
          const active = selected === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setSelected(m.key)}
              style={{ animationDelay: `${i * 35}ms` }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 ring-1 transition animate-rise ${
                active ? `${m.tone} scale-[1.04] ring-2` : "bg-white ring-line hover:-translate-y-0.5 hover:ring-primary/30"
              }`}
              aria-pressed={active}
            >
              <span className={`text-[28px] leading-none transition ${active ? "scale-110" : ""}`}>{m.emoji}</span>
              <span className="text-[12px] font-semibold">{m.label}</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 space-y-3 animate-rise">
          {selected === "depressed" && <SupportNote />}
          <label className="block">
            <span className="mb-1.5 block font-serif text-[15px] italic text-ink/70">{prompt}</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="field resize-none"
              placeholder="Optional. Your mentor can read what you write here."
            />
          </label>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-muted hover:text-ink">
              Cancel
            </button>
            <button onClick={submit} disabled={saving} className="btn-primary">
              {saving ? <Spinner /> : null}
              Check in <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-xs">+{MOOD_XP} XP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
