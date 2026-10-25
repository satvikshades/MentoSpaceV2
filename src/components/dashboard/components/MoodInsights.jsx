import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { useDashboard, useMoods } from "../../../lib/useProgress";
import { addDays, dayKey, MOODS, moodByKey } from "../../../lib/progress";
import { EmptyState, PageHeader, PageSkeleton } from "../../ui";
import MoodTracker from "./MoodTracker";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Filler);

/** Charts, 5-week grid, breakdown and timeline for a list of moods. */
export function MoodReport({ moods }) {
  const last30 = useMemo(() => moods.filter((m) => m.createdAt > addDays(new Date(), -30)), [moods]);
  const avg = last30.length ? Math.round(last30.reduce((s, m) => s + m.score, 0) / last30.length) : null;

  const byDay = useMemo(() => {
    const map = {};
    moods.forEach((m) => (map[dayKey(m.createdAt)] = m));
    return map;
  }, [moods]);

  const grid = useMemo(() => {
    const out = [];
    for (let i = 34; i >= 0; i -= 1) {
      const d = addDays(new Date(), -i);
      out.push({ key: dayKey(d), date: d, mood: byDay[dayKey(d)] });
    }
    return out;
  }, [byDay]);

  const counts = useMemo(() => {
    const c = {};
    last30.forEach((m) => (c[m.mood] = (c[m.mood] || 0) + 1));
    return MOODS.map((m) => ({ ...m, n: c[m.key] || 0 })).filter((m) => m.n > 0).sort((a, b) => b.n - a.n);
  }, [last30]);

  const chartMoods = moods.slice(-30);
  const data = {
    labels: chartMoods.map((m) => m.createdAt.toLocaleDateString(undefined, { day: "numeric", month: "short" })),
    datasets: [
      {
        data: chartMoods.map((m) => m.score),
        borderColor: "#4a54ff",
        borderWidth: 2.5,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#4a54ff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
        fill: true,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          if (!chart.chartArea) return "rgba(74,84,255,0.08)";
          const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
          g.addColorStop(0, "rgba(74,84,255,0.22)");
          g.addColorStop(1, "rgba(139,60,255,0)");
          return g;
        },
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1d1f2b",
        padding: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const m = moodByKey[chartMoods[ctx.dataIndex]?.mood];
            return m ? `${m.emoji}  ${m.label}` : ctx.formattedValue;
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: "#eef0f4" },
        border: { display: false },
        ticks: {
          stepSize: 25,
          color: "#6b6f80",
          font: { family: "Plus Jakarta Sans", size: 11 },
          callback: (v) => ({ 0: "", 25: "Low", 50: "Okay", 75: "Good", 100: "" }[v] ?? ""),
        },
      },
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#6b6f80", font: { family: "Plus Jakarta Sans", size: 11 }, maxRotation: 0, autoSkipPadding: 16 },
      },
    },
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold">Trend</h2>
              <p className="text-sm text-muted">Your last {chartMoods.length} check-ins</p>
            </div>
            {avg !== null && (
              <div className="text-right">
                <p className="text-xs font-semibold text-muted">30-day average</p>
                <p className="text-lg font-extrabold">
                  {avg >= 70 ? "Good" : avg >= 45 ? "Okay" : "Low"}
                </p>
              </div>
            )}
          </div>
          <div className="h-56">
            <Line data={data} options={options} />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold">Last 5 weeks</h2>
          <div className="mt-4 grid grid-cols-7 gap-1.5">
            {grid.map((g) => {
              const m = g.mood ? moodByKey[g.mood.mood] : null;
              return (
                <div
                  key={g.key}
                  title={`${g.date.toLocaleDateString()}${m ? ` · ${m.label}` : ""}`}
                  className={`grid aspect-square place-items-center rounded-lg text-base ${
                    m ? "bg-primary-50" : "bg-bg-light-gray"
                  } ${g.key === dayKey() ? "ring-2 ring-primary/50" : ""}`}
                >
                  {m ? m.emoji : ""}
                </div>
              );
            })}
          </div>
          {counts.length > 0 && (
            <div className="mt-5 space-y-2">
              {counts.slice(0, 4).map((c) => (
                <div key={c.key} className="flex items-center gap-2 text-sm">
                  <span className="w-6">{c.emoji}</span>
                  <span className="w-20 font-semibold">{c.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-light-gray">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(c.n / last30.length) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-muted">{c.n}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="text-lg font-bold">Entries</h2>
        <ol className="mt-4 space-y-5">
          {[...moods].reverse().slice(0, 40).map((m) => {
            const info = moodByKey[m.mood] || MOODS[2];
            return (
              <li key={m.id} className="flex gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-bg-light-gray text-2xl">{info.emoji}</div>
                <div className="min-w-0 flex-1 border-b border-line pb-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-bold">{info.label}</p>
                    <p className="text-xs text-muted">
                      {m.createdAt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                      {m.createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                  {m.note && <p className="mt-1.5 font-serif text-[15px] italic leading-relaxed text-ink/80">{m.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

/** The student's own mood journal. */
export default function MoodInsights() {
  const { user } = useDashboard();
  const [moods, setMoods] = useMoods(user.uid);

  if (!moods) return <PageSkeleton />;
  const today = [...moods].reverse().find((m) => dayKey(m.createdAt) === dayKey());

  return (
    <div>
      <PageHeader
        eyebrow="Mood journal"
        title="How you've been"
        subtitle="Patterns are easier to see over a few weeks than a few days. Keep checking in."
      />
      {!today && (
        <section className="card mb-5 p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold">Check in for today</h2>
          <MoodTracker uid={user.uid} onLogged={(e) => setMoods((prev) => [...prev, e])} />
        </section>
      )}
      {moods.length === 0 ? (
        <EmptyState icon="📈" title="Nothing here yet" body="After a few check-ins you'll see your trend, a calendar, and your notes here." />
      ) : (
        <MoodReport moods={moods} />
      )}
    </div>
  );
}
