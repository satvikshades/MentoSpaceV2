import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../firebase";
import { useParams } from "react-router-dom";

export default function MentorInsights() {
  const { studentId } = useParams();

  const [moods, setMoods] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(
        query(
          collection(db, "moods"),
          where("studentId", "==", studentId),
          orderBy("createdAt", "desc")
        )
      );

      setMoods(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }

    load();
  }, [studentId]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Student Mood Insights</h2>

      {moods.length === 0 ? (
        <p>No mood data available.</p>
      ) : (
        moods.map((mood) => (
          <div key={mood.id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <h3 className="text-xl capitalize">{mood.mood.replace("_", " ")}</h3>
              <p className="text-sm text-gray-500">
                {mood.createdAt?.toDate().toLocaleString()}
              </p>
            </div>

            {mood.note && <p className="mt-1">Note: {mood.note}</p>}

            {mood.insight && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-bold">Insight</h4>
                <p>{mood.insight.summary}</p>

                <div className="mt-2 space-y-1">
                  {mood.insight.remedies.map((r, index) => (
                    <div key={index} className="text-sm p-2 bg-white border rounded">
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}