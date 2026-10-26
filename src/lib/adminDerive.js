import { useMemo } from "react";
import { ageFrom } from "./legal";
import { addDays, dayKey, toDate } from "./progress";

const ts = (v) => toDate(v)?.getTime() || 0;

/** Everything the admin console shows, computed once from the raw collections. */
export function useDerived(data) {
  return useMemo(() => {
    const empty = { people: [], students: [], mentors: [], byId: {}, pendingMentors: 0, safetyCount: 0, lastLoaded: "" };
    if (!data) return empty;
    const users = (data.users || []).map((u) => ({ ...u, age: ageFrom(u.dob) }));
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const live = users.filter((u) => u.status !== "removed");
    const students = live.filter((u) => u.role !== "mentor");
    const mentors = live.filter((u) => u.role === "mentor");
    const moods = data.moods || [];
    const logs = data.habit_logs || [];
    const requests = data.requests || [];

    const now = Date.now();
    const weekAgo = now - 7 * 86400000;
    const lastActive = {};
    moods.forEach((m) => (lastActive[m.studentId] = Math.max(lastActive[m.studentId] || 0, ts(m.createdAt))));
    logs.forEach((l) => (lastActive[l.studentId] = Math.max(lastActive[l.studentId] || 0, ts(l.createdAt) || ts(l.dateKey + "T12:00:00"))));

    const lowMoods = moods
      .filter((m) => m.score <= 30 && now - ts(m.createdAt) < 3 * 86400000)
      .sort((a, b) => ts(b.createdAt) - ts(a.createdAt))
      .map((m) => ({ ...m, student: byId[m.studentId] }))
      .filter((m) => m.student && m.student.status !== "removed");
    const guardianPending = students.filter((s) => s.ageGroup === "minor" && s.guardianStatus !== "verified");
    const pendingMentors = mentors.filter((m) => m.mentorStatus === "pending");

    const signups = [];
    for (let i = 29; i >= 0; i -= 1) {
      const k = dayKey(addDays(new Date(), -i));
      signups.push({ key: k, n: users.filter((u) => u.createdAt && dayKey(toDate(u.createdAt)) === k).length });
    }

    const moodMix = {};
    moods.filter((m) => now - ts(m.createdAt) < 30 * 86400000).forEach((m) => (moodMix[m.mood] = (moodMix[m.mood] || 0) + 1));

    return {
      users,
      byId,
      people: live,
      removed: users.filter((u) => u.status === "removed"),
      students,
      mentors,
      verifiedMentors: mentors.filter((m) => m.mentorStatus === "verified" || m.mentorStatus === undefined),
      pendingMentorList: pendingMentors,
      pendingMentors: pendingMentors.length,
      guardianPending,
      lowMoods,
      safetyCount: new Set(lowMoods.map((m) => m.studentId)).size + guardianPending.length,
      lastActive,
      activeWeek: students.filter((s) => (lastActive[s.id] || 0) > weekAgo).length,
      checkinsToday: moods.filter((m) => dayKey(toDate(m.createdAt) || new Date(0)) === dayKey()).length,
      pendingRequests: requests.filter((r) => r.status === "pending").length,
      signups,
      moodMix,
      suspended: live.filter((u) => u.status === "suspended").length,
      salesAlerts:
        (data.sales_reps || []).filter((r) => r.status === "pending").length +
        (data.sales_leads || []).filter((l) => l.stage === 3 && !l.contractVerified && !l.lost).length,
      lastLoaded: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    };
  }, [data]);
}
