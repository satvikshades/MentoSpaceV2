import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { FiArrowRight, FiCalendar, FiPlus, FiAlertCircle, FiMessageCircle } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard, useProgress } from "../../../lib/useProgress";
import { addHabit, HABIT_IDEAS } from "../../../lib/actions";
import { dayKey, doneToday, fmtTime, greeting, moodByKey, toDate, timeAgo } from "../../../lib/progress";
import { Avatar, EmptyState, PageSkeleton, Ring } from "../../ui";
import MoodTracker from "./MoodTracker";
import HabitRow from "./HabitRow";

function todayLabel() {
  return new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

export function StreakCard({ streak, best, week }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Streak</p>
        <p className="text-xs text-muted">Best {best}</p>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-4xl ${streak > 0 ? "inline-block animate-flame" : "grayscale opacity-40"}`}>🔥</span>
        <span className="text-4xl font-extrabold tracking-tight">{streak}</span>
        <span className="text-sm font-semibold text-muted">{streak === 1 ? "day" : "days"}</span>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {week.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1.5">
            <div
              className={`h-8 w-full rounded-lg transition ${
                d.done
                  ? "bg-gradient-to-br from-primary to-secondary"
                  : d.today
                  ? "border-2 border-dashed border-primary/40 bg-white"
                  : "bg-bg-light-gray"
              }`}
              title={d.key}
            />
            <span className={`text-[11px] font-semibold ${d.today ? "text-primary" : "text-muted"}`}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LevelCard({ xp, level }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">Level {level.number}</p>
        <p className="text-xs font-semibold text-muted">{xp} XP</p>
      </div>
      <p className="mt-1 text-2xl font-extrabold">{level.name}</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-bg-light-gray">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-700"
          style={{ width: `${level.pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        {level.nextName ? (
          <>
            <b className="text-ink">{level.toNext} XP</b> to {level.nextName}
          </>
        ) : (
          "Top level reached. Keep going for yourself."
        )}
      </p>
    </div>
  );
}

function StudentToday({ user, profile }) {
  const p = useProgress(user.uid);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [adding, setAdding] = useState(null);

  const todayMood = useMemo(
    () => [...p.moods].reverse().find((m) => (m.dateKey || dayKey(toDate(m.createdAt))) === dayKey()),
    [p.moods]
  );

  useEffect(() => {
    if (!p.mentorIds.length) return;
    (async () => {
      const ids = p.mentorIds.slice(0, 10);
      const people = await Promise.all(
        ids.map(async (id) => {
          const s = await getDoc(doc(db, "users", id));
          return s.exists() ? { id, ...s.data() } : null;
        })
      );
      setMentors(people.filter(Boolean));
      try {
        const snap = await getDocs(query(collection(db, "sessions"), where("mentorId", "in", ids)));
        const now = dayKey();
        setSessions(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((s) => s.date >= now)
            .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
            .slice(0, 3)
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, [p.mentorIds]);

  if (p.loading) return <PageSkeleton />;

  const doneCount = p.habits.filter(doneToday).length;
  const total = p.habits.length;
  const nextMilestone = p.milestones.find((m) => !m.earned);

  const quickAdd = async (idea) => {
    setAdding(idea.title);
    try {
      const h = await addHabit(user.uid, idea);
      p.setHabits((prev) => [...prev, h]);
      toast.success("Added. Tick it off when it's done.");
    } catch {
      toast.error("Couldn't add that habit.");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-rise">
        <p className="text-sm font-semibold text-muted">{todayLabel()}</p>
        <h1 className="mt-1 text-[30px] font-extrabold leading-tight sm:text-[36px]">{greeting(profile.name)}.</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* check-in */}
        <section className="card p-5 sm:p-6 lg:col-span-2 animate-rise" style={{ animationDelay: "60ms" }}>
          {!todayMood && profile.prefs?.reminders !== false && new Date().getHours() >= 18 && (
            <p className="mb-4 rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary">
              Evening reminder: you haven't checked in yet today.
            </p>
          )}
          {!todayMood && (
            <div className="mb-5 flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:gap-4">
              <div>
                <h2 className="text-xl font-bold">How are you, honestly?</h2>
                <p className="mt-1 text-sm text-muted">Takes five seconds. It keeps your streak going.</p>
              </div>
              {p.streak > 0 && (
                <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                  Keep your {p.streak}-day streak
                </span>
              )}
            </div>
          )}
          <MoodTracker
            uid={user.uid}
            today={todayMood}
            streak={todayMood ? p.streak : p.streak + 1}
            onLogged={(entry) => p.setMoods((prev) => [...prev, entry])}
          />
        </section>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 animate-rise" style={{ animationDelay: "120ms" }}>
          <StreakCard streak={p.streak} best={p.best} week={p.week} />
          <LevelCard xp={p.xp} level={p.level} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* habits */}
        <section className="card p-5 sm:p-6 lg:col-span-2 animate-rise" style={{ animationDelay: "180ms" }}>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {total > 0 && (
                <Ring value={(doneCount / total) * 100} size={52} stroke={6}>
                  <span className="text-xs font-extrabold">
                    {doneCount}/{total}
                  </span>
                </Ring>
              )}
              <div>
                <h2 className="text-xl font-bold">Today's habits</h2>
                <p className="text-sm text-muted">
                  {total === 0
                    ? "Pick one small thing to start with."
                    : doneCount === total
                    ? "All done. That's a good day's work."
                    : `${total - doneCount} left for today`}
                </p>
              </div>
            </div>
            <Link to="/dashboard/habits" className="btn-ghost hidden px-3 py-2 text-sm sm:inline-flex">
              Manage
            </Link>
          </div>

          {total === 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {HABIT_IDEAS.map((idea) => (
                <button
                  key={idea.title}
                  disabled={!!adding}
                  onClick={() => quickAdd(idea)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-left text-sm font-semibold transition hover:border-primary hover:bg-primary-50/50"
                >
                  {idea.title}
                  <FiPlus className="h-4 w-4 shrink-0 text-primary" />
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...p.habits]
                .sort((a, b) => Number(doneToday(a)) - Number(doneToday(b)))
                .map((h) => (
                  <HabitRow
                    key={h.id}
                    uid={user.uid}
                    habit={h}
                    compact
                    onUpdated={(nh, log) => {
                      p.setHabits((prev) => prev.map((x) => (x.id === nh.id ? nh : x)));
                      if (log) p.setLogs((prev) => [...prev, log]);
                    }}
                  />
                ))}
            </div>
          )}
        </section>

        {/* mentor + sessions */}
        <div className="space-y-5 animate-rise" style={{ animationDelay: "240ms" }}>
          {mentors.length === 0 ? (
            <section className="rounded-2xl bg-bg-dark p-6 text-white">
              <p className="font-serif text-[22px] italic leading-snug">
                Some things are easier to talk through with someone who's been there.
              </p>
              <Link to="/dashboard/find-mentor" className="btn mt-5 bg-white text-ink hover:bg-white/90">
                Find a mentor <FiArrowRight />
              </Link>
            </section>
          ) : (
            <section className="card p-5">
              <p className="text-sm font-semibold text-muted">Your mentor{mentors.length > 1 ? "s" : ""}</p>
              <div className="mt-3 space-y-3">
                {mentors.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar person={m} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{m.name}</p>
                      <Link to={`/mentor/${m.id}`} className="text-xs font-semibold text-primary">
                        View profile
                      </Link>
                    </div>
                    <Link
                      to={`/dashboard/chat/${user.uid}_${m.id}`}
                      className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary transition hover:bg-primary hover:text-white"
                      aria-label={`Message ${m.name}`}
                    >
                      <FiMessageCircle />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">Coming up</p>
              <Link to="/dashboard/sessions" className="text-xs font-semibold text-primary">
                All sessions
              </Link>
            </div>
            {sessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No sessions scheduled yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-center leading-none text-primary">
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(s.date + "T00:00").toLocaleDateString(undefined, { month: "short" })}
                      </span>
                      <span className="text-base font-extrabold">{s.date.slice(8)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{s.title}</p>
                      <p className="text-xs text-muted">
                        {fmtTime(s.time)} · {s.mentorName}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {nextMilestone && (
            <Link to="/dashboard/profile" className="card flex items-center gap-3 p-4 transition hover:border-primary/30">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-lg">{nextMilestone.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-muted">Next badge</p>
                <p className="truncate text-sm font-bold">
                  {nextMilestone.title} <span className="font-medium text-muted">· {nextMilestone.hint}</span>
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function MentorToday({ user, profile, pending }) {
  const [students, setStudents] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const reqSnap = await getDocs(query(collection(db, "requests"), where("mentorId", "==", user.uid)));
        const ids = [
          ...new Set(reqSnap.docs.map((d) => d.data()).filter((r) => r.status === "accepted").map((r) => r.studentId)),
        ];
        const rows = await Promise.all(
          ids.map(async (id) => {
            const [u, m] = await Promise.all([
              getDoc(doc(db, "users", id)),
              getDocs(query(collection(db, "moods"), where("studentId", "==", id))),
            ]);
            const moods = m.docs.map((d) => d.data()).sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
            const recent = moods.filter((x) => (Date.now() - (toDate(x.createdAt)?.getTime() || 0)) < 3 * 86400000);
            return {
              id,
              ...(u.exists() ? u.data() : { name: "Student" }),
              last: moods[0] || null,
              flag: recent.some((x) => x.score <= 30),
            };
          })
        );
        rows.sort((a, b) => Number(b.flag) - Number(a.flag));
        setStudents(rows);

        const s = await getDocs(query(collection(db, "sessions"), where("mentorId", "==", user.uid)));
        const now = dayKey();
        setSessions(
          s.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((x) => x.date >= now)
            .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
            .slice(0, 4)
        );
      } catch (err) {
        console.error(err);
        setStudents([]);
      }
    })();
  }, [user.uid]);

  if (!students) return <PageSkeleton />;
  const flagged = students.filter((s) => s.flag);

  return (
    <div className="space-y-6">
      <div className="animate-rise">
        <p className="text-sm font-semibold text-muted">{todayLabel()}</p>
        <h1 className="mt-1 text-[30px] font-extrabold leading-tight sm:text-[36px]">{greeting(profile.name)}.</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 animate-rise" style={{ animationDelay: "60ms" }}>
        <Link to="/dashboard/my-students" className="card p-5 transition hover:border-primary/30">
          <p className="text-sm font-semibold text-muted">New requests</p>
          <p className="mt-1 text-4xl font-extrabold">{pending}</p>
          <p className="mt-2 text-xs font-semibold text-primary">{pending ? "Review now →" : "You're all caught up"}</p>
        </Link>
        <div className="card p-5">
          <p className="text-sm font-semibold text-muted">Students</p>
          <p className="mt-1 text-4xl font-extrabold">{students.length}</p>
          <p className="mt-2 text-xs text-muted">{flagged.length ? `${flagged.length} may need a check-in` : "Everyone seems steady"}</p>
        </div>
        <Link to="/dashboard/sessions" className="card p-5 transition hover:border-primary/30">
          <p className="text-sm font-semibold text-muted">Upcoming sessions</p>
          <p className="mt-1 text-4xl font-extrabold">{sessions.length}</p>
          <p className="mt-2 text-xs font-semibold text-primary">Schedule one →</p>
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2 animate-rise" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xl font-bold">How your students are doing</h2>
          <p className="mt-1 text-sm text-muted">Anyone who logged a low mood in the last three days shows first.</p>
          {students.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon="🌱"
                title="No students yet"
                body="When a student sends you a request it'll show up here. Make sure your bio says who you can help."
                action={<Link to="/dashboard/profile" className="btn-soft">Update your bio</Link>}
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {students.map((s) => {
                const m = s.last ? moodByKey[s.last.mood] : null;
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <Avatar person={s} size={42} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate font-bold">
                        {s.name}
                        {s.flag && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                            <FiAlertCircle /> Check in
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {m ? `${m.emoji} ${m.label} · ${timeAgo(s.last.createdAt)}` : "Hasn't checked in yet"}
                      </p>
                    </div>
                    <Link to={`/dashboard/insights/${s.id}`} className="btn-ghost hidden px-3 py-2 text-sm sm:inline-flex">
                      Mood history
                    </Link>
                    <Link
                      to={`/dashboard/chat/${s.id}_${user.uid}`}
                      className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 text-primary transition hover:bg-primary hover:text-white"
                      aria-label={`Message ${s.name}`}
                    >
                      <FiMessageCircle />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5 animate-rise" style={{ animationDelay: "180ms" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">Your next sessions</p>
            <FiCalendar className="text-muted" />
          </div>
          {sessions.length === 0 ? (
            <div className="mt-4">
              <p className="text-sm text-muted">Nothing on the calendar.</p>
              <Link to="/dashboard/sessions" className="btn-soft mt-4 w-full">
                <FiPlus /> New session
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {sessions.map((s) => (
                <li key={s.id} className="rounded-xl bg-bg-light-gray p-3">
                  <p className="text-sm font-bold">{s.title}</p>
                  <p className="text-xs text-muted">
                    {new Date(s.date + "T00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} · {fmtTime(s.time)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function Today() {
  const { user, profile, role, pending } = useDashboard();
  if (role === "mentor") return <MentorToday user={user} profile={profile} pending={pending} />;
  return <StudentToday user={user} profile={profile} />;
}
