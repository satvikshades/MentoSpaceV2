import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import { useParams, useNavigate } from "react-router-dom";

import {
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function MoodInsights() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(
          query(
            collection(db, "moods"),
            where("studentId", "==", studentId),
            orderBy("createdAt", "asc")
          )
        );

        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate() || new Date(),
        }));

        setMoods(data);
      } catch (err) {
        console.error("Insights error:", err);
      }
    }

    load();
  }, [studentId]);

  const moodEmoji = {
    very_happy: "😄",
    happy: "🙂",
    okay: "😐",
    low: "😔",
    depressed: "😢",
    angry: "😡",
    tired: "😴",
  };

  const chartData =
    moods.length > 0
      ? {
          labels: moods.map((m) => m.createdAt.toLocaleDateString()),
          datasets: [
            {
              label: "Mood Score",
              data: moods.map((m) => m.score),
              borderColor: "#6366f1",
              backgroundColor: "#c7d2fe",
              pointBackgroundColor: "#4f46e5",
              tension: 0.4,
            },
          ],
        }
      : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 space-y-6 overflow-y-auto max-h-[90vh] relative">

        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center">Mood Insights</h2>

        {/* Chart */}
        {chartData ? (
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Mood Trend</h3>
            <Line data={chartData} />
          </div>
        ) : (
          <p className="text-center text-gray-500">No mood data available.</p>
        )}

        {/* Mood History */}
        <div className="space-y-4">
          {moods.map((mood) => (
            <div key={mood.id} className="bg-gray-50 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h3 className="text-lg flex items-center gap-2">
                  {moodEmoji[mood.mood]}{" "}
                  {mood.mood.replace("_", " ")}
                </h3>
                <p className="text-sm text-gray-500">
                  {mood.createdAt.toLocaleString()}
                </p>
              </div>

              {mood.note && (
                <p className="mt-2 text-gray-700">
                  📝 <b>Note:</b> {mood.note}
                </p>
              )}

              <div className="mt-3 p-3 bg-white border rounded">
                <h4 className="font-bold mb-2">Insight</h4>
                <p>{mood.insight.summary}</p>

                <div className="mt-2 space-y-1">
                  {mood.insight.remedies.map((r, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-gray-50 border rounded"
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}