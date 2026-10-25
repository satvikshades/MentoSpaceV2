import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { dayKey, doneToday, habitStreakAfterCompletion, habitXP, moodByKey, MOOD_REPLIES } from "./progress";

export async function logMood(uid, moodKey, note = "") {
  const mood = moodByKey[moodKey];
  const data = {
    studentId: uid,
    mood: mood.key,
    score: mood.score,
    note: note.trim(),
    dateKey: dayKey(),
    insight: { summary: MOOD_REPLIES[mood.key], remedies: [] },
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "moods"), data);
  return { id: ref.id, ...data, createdAt: new Date() };
}

export async function addHabit(uid, { title, category, desc }) {
  const data = {
    studentId: uid,
    title: title.trim(),
    desc: (desc || "").trim(),
    category,
    type: "custom",
    streak: 0,
    xp: 0,
    level: 0,
    lastCompleted: null,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "habits"), data);
  return { id: ref.id, ...data, createdAt: new Date() };
}

/** Marks a habit done for today. Returns the updated habit and XP gained. */
export async function completeHabit(uid, habit) {
  if (doneToday(habit)) return { habit, gained: 0, already: true };
  const streak = habitStreakAfterCompletion(habit);
  const gained = habitXP(streak);
  const xp = (habit.xp || 0) + gained;
  await updateDoc(doc(db, "habits", habit.id), {
    streak,
    xp,
    level: Math.floor(xp / 100),
    lastCompleted: serverTimestamp(),
  });
  const log = {
    studentId: uid,
    habitId: habit.id,
    dateKey: dayKey(),
    earnedXP: gained,
    streakAfter: streak,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "habit_logs"), log);
  return {
    habit: { ...habit, streak, xp, level: Math.floor(xp / 100), lastCompleted: new Date() },
    log: { id: ref.id, ...log },
    gained,
  };
}

export async function removeHabit(habitId) {
  await deleteDoc(doc(db, "habits", habitId));
}

export const HABIT_CATEGORIES = [
  { key: "Study & Focus", icon: "📚" },
  { key: "Sleep & Rest", icon: "🌙" },
  { key: "Fitness & Movement", icon: "🏃" },
  { key: "Mindfulness & Meditation", icon: "🧘" },
  { key: "Gratitude & Journaling", icon: "✍️" },
  { key: "Social Connection", icon: "🤝" },
];

export const HABIT_IDEAS = [
  { title: "10 minutes of reading", category: "Study & Focus" },
  { title: "Phone away by 11pm", category: "Sleep & Rest" },
  { title: "20 minute walk", category: "Fitness & Movement" },
  { title: "5 slow breaths before bed", category: "Mindfulness & Meditation" },
  { title: "Write 3 good things", category: "Gratitude & Journaling" },
  { title: "Message one friend", category: "Social Connection" },
];

export const categoryIcon = (c) => HABIT_CATEGORIES.find((x) => x.key === c)?.icon || "•";

export async function sendMentorRequest(studentId, mentorId) {
  const ref = await addDoc(collection(db, "requests"), {
    studentId,
    mentorId,
    status: "pending",
    createdAt: new Date(),
  });
  return ref.id;
}
