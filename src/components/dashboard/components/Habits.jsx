// src/components/dashboard/components/Habits.jsx
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const CATEGORY_OPTIONS = [
  "Study & Focus",
  "Sleep & Rest",
  "Fitness & Movement",
  "Mindfulness & Meditation",
  "Gratitude & Journaling",
  "Social Connection",
];

function Habits() {
  const user = auth.currentUser;
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  // form state for new habit
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0] || "");
  const [desc, setDesc] = useState("");

  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState(null);

  // ---------------------------------------
  // Load habits for logged in student
  // ---------------------------------------
  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const q = query(
          collection(db, "habits"),
          where("studentId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setHabits(data);
      } catch (err) {
        console.error("Error loading habits:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // ---------------------------------------
  // Derived stats (XP, Level)
  // ---------------------------------------
  const totalXP = useMemo(
    () => habits.reduce((sum, h) => sum + (h.xp || 0), 0),
    [habits]
  );

  const level = Math.floor(totalXP / 100);
  const nextLevelXP = (level + 1) * 100;
  const currentLevelXP = level * 100;
  const progressToNext =
    totalXP >= nextLevelXP
      ? 100
      : Math.round(((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP || 1)) * 100);

  // ---------------------------------------
  // Add a new custom habit
  // ---------------------------------------
  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!title.trim()) {
      alert("Please enter a habit title.");
      return;
    }

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "habits"), {
        studentId: user.uid,
        title: title.trim(),
        desc: desc.trim(),
        category,
        type: "custom",
        streak: 0,
        xp: 0,
        level: 0,
        lastCompleted: null,
        createdAt: serverTimestamp(),
      });

      // update local state
      setHabits((prev) => [
        ...prev,
        {
          id: docRef.id,
          studentId: user.uid,
          title: title.trim(),
          desc: desc.trim(),
          category,
          type: "custom",
          streak: 0,
          xp: 0,
          level: 0,
          lastCompleted: null,
        },
      ]);

      setTitle("");
      setDesc("");
      setCategory(CATEGORY_OPTIONS[0] || "");
    } catch (err) {
      console.error("Error adding habit:", err);
      alert("Failed to add habit");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Complete habit for today
  // (1× per day per habit)
  // ---------------------------------------
  const handleCompleteToday = async (habit) => {
    if (!user) return;
    setCompletingId(habit.id);

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10); // YYYY-MM-DD

    try {
      // prevent double completion (habit_logs)
      const logsRef = collection(db, "habit_logs");
      const logSnap = await getDocs(
        query(
          logsRef,
          where("studentId", "==", user.uid),
          where("habitId", "==", habit.id),
          where("dateKey", "==", todayKey)
        )
      );

      if (!logSnap.empty) {
        alert("You already completed this habit today! 🎉");
        return;
      }

      // Streak logic based on lastCompleted in local state
      let oldDate = null;
      if (habit.lastCompleted && habit.lastCompleted.toDate) {
        oldDate = habit.lastCompleted.toDate();
      }

      let newStreak = 1;
      if (oldDate) {
        const diffMs = today.setHours(0, 0, 0, 0) - oldDate.setHours(0, 0, 0, 0);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (diffDays === 0) {
          // already completed today (super safety)
          alert("You already completed this habit today! 🎉");
          return;
        } else if (diffDays === 1) {
          newStreak = (habit.streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      // XP gain formula
      const gainedXP = 20 + newStreak * 2;
      const newXP = (habit.xp || 0) + gainedXP;
      const newLevel = Math.floor(newXP / 100);

      const habitRef = doc(db, "habits", habit.id);

      // update habit
      await updateDoc(habitRef, {
        streak: newStreak,
        xp: newXP,
        level: newLevel,
        lastCompleted: serverTimestamp(),
      });

      // add log
      await addDoc(collection(db, "habit_logs"), {
        studentId: user.uid,
        habitId: habit.id,
        dateKey: todayKey,
        createdAt: serverTimestamp(),
        earnedXP: gainedXP,
        streakAfter: newStreak,
      });

      // update local state
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habit.id
            ? {
                ...h,
                streak: newStreak,
                xp: newXP,
                level: newLevel,
                lastCompleted: {
                  toDate: () => new Date(), // simple fake timestamp for UI
                },
              }
            : h
        )
      );

      alert(`Nice! +${gainedXP} XP earned 🟣`);
    } catch (err) {
      console.error("Error completing habit:", err);
      alert("Failed to complete habit.");
    } finally {
      setCompletingId(null);
    }
  };

  if (!user) {
    return <div className="p-6">Please log in to view your habits.</div>;
  }

  if (loading) {
    return <div className="p-6">Loading your habits...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Gamified Summary */}
      <div className="bg-white rounded-xl shadow p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">Your Growth</p>
          <h2 className="text-2xl font-bold text-gray-800">
            Level {level} Student 🌱
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Total XP: <span className="font-semibold">{totalXP}</span>
          </p>
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-xs text-gray-500 mb-1">
            Progress to Level {level + 1}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {totalXP - currentLevelXP}/{nextLevelXP - currentLevelXP} XP
          </p>
        </div>
      </div>

      {/* Add Habit Form */}
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Add a positive habit
        </h3>
        <form
          onSubmit={handleAddHabit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-600 mb-1">
              Habit name
            </label>
            <input
              type="text"
              placeholder="Eg: 10 min meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm text-gray-600 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              Short description (optional)
            </label>
            <textarea
              rows={2}
              placeholder="Why is this habit important to you?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add Habit"}
            </button>
          </div>
        </form>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">
          Your daily quests
        </h3>

        {habits.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No habits yet. Start by adding one above 👆
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={() => handleCompleteToday(habit)}
                completing={completingId === habit.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HabitCard({ habit, onComplete, completing }) {
  const lastDate =
    habit.lastCompleted && habit.lastCompleted.toDate
      ? habit.lastCompleted.toDate()
      : null;

  const streak = habit.streak || 0;
  const level = habit.level || 0;

  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col justify-between h-full">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary/70 font-semibold">
              {habit.category || "Habit"}
            </p>
            <h4 className="text-base font-semibold text-gray-800">
              {habit.title}
            </h4>
          </div>

          {streak > 0 && (
            <div className="flex flex-col items-end text-xs">
              <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                🔥 {streak} day{streak > 1 ? "s" : ""} streak
              </span>
            </div>
          )}
        </div>

        {habit.desc && (
          <p className="text-xs text-gray-600 mt-1">{habit.desc}</p>
        )}

        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>Level {level}</span>
          <span>XP: {habit.xp || 0}</span>
        </div>

        <div className="mt-1 text-[11px] text-gray-400">
          {lastDate ? `Last completed: ${lastDate.toLocaleDateString()}` : "Not completed yet"}
        </div>
      </div>

      <button
        onClick={onComplete}
        disabled={completing}
        className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
      >
        {completing ? "Completing..." : "Complete for today ✅"}
      </button>
    </div>
  );
}

export default Habits;