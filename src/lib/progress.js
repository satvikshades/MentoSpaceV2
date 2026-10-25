// Everything to do with streaks, XP, levels and milestones lives here so the
// numbers shown on every screen agree with each other.

export const MOODS = [
  { key: "very_happy", label: "Great", emoji: "😄", score: 90, tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { key: "happy", label: "Good", emoji: "🙂", score: 75, tone: "bg-lime-50 text-lime-700 ring-lime-200" },
  { key: "okay", label: "Okay", emoji: "😐", score: 50, tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  { key: "tired", label: "Tired", emoji: "😴", score: 25, tone: "bg-sky-50 text-sky-700 ring-sky-200" },
  { key: "low", label: "Low", emoji: "😔", score: 30, tone: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  { key: "angry", label: "Frustrated", emoji: "😤", score: 20, tone: "bg-orange-50 text-orange-700 ring-orange-200" },
  { key: "depressed", label: "Struggling", emoji: "😢", score: 10, tone: "bg-violet-50 text-violet-700 ring-violet-200" },
];

export const moodByKey = Object.fromEntries(MOODS.map((m) => [m.key, m]));

// What we say back after a check-in. Written to sound like a person, not a bot.
export const MOOD_REPLIES = {
  very_happy: "Love that. Write down what made today good so you can come back to it.",
  happy: "Nice. Small good days add up faster than you think.",
  okay: "Okay is a fine place to be. One small habit could tip it the right way.",
  tired: "Rest counts as progress. Go easy on yourself tonight.",
  low: "Thanks for being honest. Your mentor can see this and is here if you want to talk.",
  angry: "That's valid. A short walk or a few slow breaths can take the edge off.",
  depressed:
    "We're really glad you checked in. You don't have to carry this alone. Reach out to your mentor, or to someone you trust today.",
};

export const MOOD_XP = 15;

export const PROMPTS = [
  "What's one thing you're looking forward to this week?",
  "What drained your energy today, and what gave some back?",
  "Who made your day a little better recently?",
  "What would you tell a friend who felt the way you do right now?",
  "What's a small win from today that nobody saw?",
  "What's one thing you can let go of before tomorrow?",
  "When did you feel most like yourself this week?",
  "What's something you handled better than you would have a year ago?",
  "What do you need more of right now: rest, people, or quiet?",
  "What's one kind thing you can do for yourself tonight?",
];

// Local calendar day, so a check-in at 1am in India counts for the right day.
export function dayKey(date = new Date()) {
  const d = date instanceof Date ? date : toDate(date);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "number" || typeof value === "string") return new Date(value);
  if (value.seconds) return new Date(value.seconds * 1000);
  return null;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function todayPrompt() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((new Date() - start) / 86400000);
  return PROMPTS[dayOfYear % PROMPTS.length];
}

/** Set of day keys on which the user did anything (mood or habit). */
export function activeDays(moods = [], logs = []) {
  const set = new Set();
  moods.forEach((m) => {
    const k = dayKey(toDate(m.createdAt) || new Date());
    if (k) set.add(k);
  });
  logs.forEach((l) => l.dateKey && set.add(l.dateKey));
  return set;
}

/**
 * Current streak. If today isn't done yet the streak is still alive as long
 * as yesterday was, so people aren't punished first thing in the morning.
 */
export function currentStreak(days) {
  let cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor = addDays(cursor, -1);
  let n = 0;
  while (days.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function bestStreak(days) {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  sorted.forEach((k) => {
    if (prev && dayKey(addDays(new Date(prev + "T00:00:00"), 1)) === k) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = k;
  });
  return best;
}

/** Last 7 days, oldest first, for the little week strip. */
export function weekStrip(days) {
  const out = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = addDays(new Date(), -i);
    out.push({
      key: dayKey(d),
      label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
      done: days.has(dayKey(d)),
      today: i === 0,
    });
  }
  return out;
}

export const LEVELS = [
  { name: "Seed", at: 0 },
  { name: "Sprout", at: 60 },
  { name: "Seedling", at: 160 },
  { name: "Sapling", at: 320 },
  { name: "Young tree", at: 550 },
  { name: "Grove", at: 850 },
  { name: "Forest", at: 1250 },
];

export function levelFor(xp) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.at) idx = i;
  });
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const into = xp - current.at;
  const span = next ? next.at - current.at : 1;
  return {
    number: idx + 1,
    name: current.name,
    nextName: next?.name || null,
    toNext: next ? next.at - xp : 0,
    pct: next ? Math.min(100, Math.round((into / span) * 100)) : 100,
  };
}

export function totalXP(moods = [], habits = []) {
  return moods.length * MOOD_XP + habits.reduce((s, h) => s + (h.xp || 0), 0);
}

export function habitXP(streakAfter) {
  return 20 + Math.min(streakAfter, 15) * 2;
}

export function doneToday(habit) {
  return dayKey(toDate(habit.lastCompleted) || new Date(0)) === dayKey();
}

export function habitStreakAfterCompletion(habit) {
  const last = toDate(habit.lastCompleted);
  if (!last) return 1;
  const yesterday = dayKey(addDays(new Date(), -1));
  return dayKey(last) === yesterday ? (habit.streak || 0) + 1 : 1;
}

/** Habit streaks quietly expire if a day was missed. */
export function liveHabitStreak(habit) {
  const last = toDate(habit.lastCompleted);
  if (!last) return 0;
  const k = dayKey(last);
  if (k === dayKey() || k === dayKey(addDays(new Date(), -1))) return habit.streak || 0;
  return 0;
}

export const MILESTONES = [
  { id: "first", icon: "🌱", title: "First check-in", hint: "Log how you feel once", test: (s) => s.checkins >= 1 },
  { id: "habit1", icon: "🧱", title: "Habit builder", hint: "Add your first habit", test: (s) => s.habits >= 1 },
  { id: "streak3", icon: "🔥", title: "Three in a row", hint: "Show up 3 days running", test: (s) => s.best >= 3 },
  { id: "streak7", icon: "📅", title: "A full week", hint: "Keep a 7-day streak", test: (s) => s.best >= 7 },
  { id: "ten", icon: "💭", title: "Ten check-ins", hint: "Log your mood 10 times", test: (s) => s.checkins >= 10 },
  { id: "mentor", icon: "🤝", title: "Not alone", hint: "Connect with a mentor", test: (s) => s.mentors >= 1 },
  { id: "streak30", icon: "🏔️", title: "Thirty days", hint: "Keep a 30-day streak", test: (s) => s.best >= 30 },
  { id: "grove", icon: "🌳", title: "Grove", hint: "Reach level 6", test: (s) => s.level >= 6 },
];

export function greeting(name) {
  const h = new Date().getHours();
  const first = (name || "").trim().split(" ")[0];
  const part = h < 5 ? "Still up" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return first ? `${part}, ${first}` : part;
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return "";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** "18:30" -> "6:30 PM" in the viewer's locale. */
export function fmtTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
