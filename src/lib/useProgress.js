import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useOutletContext } from "react-router-dom";
import { db } from "../firebase";
import {
  activeDays,
  bestStreak,
  currentStreak,
  levelFor,
  MILESTONES,
  toDate,
  totalXP,
  weekStrip,
} from "./progress";

/** Shared dashboard state provided by DashboardLayout (user, profile, role). */
export function useDashboard() {
  return useOutletContext() || {};
}

async function byStudent(col, uid) {
  // Single-field queries only, so no composite Firestore indexes are needed.
  const snap = await getDocs(query(collection(db, col), where("studentId", "==", uid)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Loads a student's moods, habits, habit logs and mentor connections,
 * and derives streaks / XP / level / milestones from them.
 */
export function useProgress(uid) {
  const [moods, setMoods] = useState([]);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [mentorIds, setMentorIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const [m, h, l, r] = await Promise.all([
        byStudent("moods", uid),
        byStudent("habits", uid),
        byStudent("habit_logs", uid),
        byStudent("requests", uid),
      ]);
      m.sort((a, b) => (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0));
      h.sort((a, b) => (toDate(a.createdAt)?.getTime() || 0) - (toDate(b.createdAt)?.getTime() || 0));
      setMoods(m);
      setHabits(h);
      setLogs(l);
      setMentorIds(r.filter((x) => x.status === "accepted").map((x) => x.mentorId));
    } catch (err) {
      console.error("Could not load progress", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const days = activeDays(moods, logs);
    const xp = totalXP(moods, habits);
    const level = levelFor(xp);
    const best = bestStreak(days);
    const summary = {
      checkins: moods.length,
      habits: habits.length,
      best,
      mentors: mentorIds.length,
      level: level.number,
    };
    return {
      days,
      streak: currentStreak(days),
      best,
      week: weekStrip(days),
      xp,
      level,
      milestones: MILESTONES.map((m) => ({ ...m, earned: m.test(summary) })),
    };
  }, [moods, habits, logs, mentorIds]);

  return { moods, setMoods, habits, setHabits, logs, setLogs, mentorIds, loading, reload: load, ...stats };
}

/** All mood entries for one student, oldest first. */
export function useMoods(studentId) {
  const [moods, setMoods] = useState(null);
  useEffect(() => {
    if (!studentId) return;
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "moods"), where("studentId", "==", studentId)));
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...d.data(), createdAt: toDate(d.data().createdAt) || new Date() }))
          .sort((a, b) => a.createdAt - b.createdAt);
        setMoods(rows);
      } catch (err) {
        console.error("Mood load failed", err);
        setMoods([]);
      }
    })();
  }, [studentId]);
  return [moods, setMoods];
}
