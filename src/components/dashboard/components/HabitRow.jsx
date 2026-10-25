import { useState } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import { categoryIcon, completeHabit } from "../../../lib/actions";
import { doneToday, liveHabitStreak } from "../../../lib/progress";
import { Burst } from "../../ui";

/**
 * One habit with a big tap target. Completing it is optimistic: the tick
 * lands immediately and we roll back if Firestore says no.
 */
export default function HabitRow({ uid, habit, onUpdated, onDelete, compact = false }) {
  const [busy, setBusy] = useState(false);
  const [fire, setFire] = useState(0);
  const [gain, setGain] = useState(null);
  const done = doneToday(habit);
  const streak = liveHabitStreak(habit);

  const toggle = async () => {
    if (done || busy) return;
    setBusy(true);
    setFire(Date.now());
    try {
      const res = await completeHabit(uid, habit);
      if (res.already) return;
      setGain(res.gained);
      onUpdated?.(res.habit, res.log);
      setTimeout(() => setGain(null), 1400);
      if (res.habit.streak > 1 && [3, 7, 14, 21, 30, 50, 100].includes(res.habit.streak)) {
        toast.success(`${res.habit.streak}-day streak on “${habit.title}”`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save that. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-3.5 rounded-2xl border bg-white transition ${
        compact ? "px-3.5 py-3" : "px-4 py-3.5"
      } ${done ? "border-transparent bg-white/70" : "border-line hover:border-primary/30"}`}
    >
      <button
        onClick={toggle}
        disabled={busy}
        aria-label={done ? `${habit.title} done today` : `Mark ${habit.title} done`}
        className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition ${
          done
            ? "border-transparent bg-gradient-to-br from-primary to-secondary text-white"
            : "border-line text-transparent hover:border-primary hover:text-primary/40"
        }`}
      >
        <Burst fire={fire} />
        <FiCheck className={`h-[18px] w-[18px] ${done ? "animate-pop" : ""}`} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold transition ${done ? "text-muted line-through decoration-2 decoration-primary/30" : ""}`}>
          {habit.title}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-muted">
          <span className="mr-1">{categoryIcon(habit.category)}</span>
          {habit.category}
          {!compact && habit.desc ? ` · ${habit.desc}` : ""}
        </p>
      </div>

      {gain && (
        <span className="pointer-events-none absolute right-16 top-2 text-sm font-extrabold text-primary animate-rise">
          +{gain} XP
        </span>
      )}

      {streak > 0 && (
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
            done ? "bg-orange-50 text-orange-600" : "bg-bg-light-gray text-muted"
          }`}
          title={`${streak}-day streak`}
        >
          <span className={done ? "inline-block animate-flame" : ""}>🔥</span>
          {streak}
        </span>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(habit)}
          className="rounded-lg p-2 text-muted opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:group-hover:opacity-100"
          aria-label={`Delete ${habit.title}`}
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
