import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";

const PRESET_INSIGHTS = {
  very_happy: { summary: "You're in a very positive space today!", remedies: [] },
  happy: { summary: "Good vibes today!", remedies: [] },
  okay: { summary: "A balanced day.", remedies: [] },
  low: { summary: "You're feeling low.", remedies: [] },
  depressed: { summary: "You're going through a tough time.", remedies: [] },
  angry: { summary: "You're feeling frustrated.", remedies: [] },
  tired: { summary: "You're feeling exhausted.", remedies: [] },
};

const MOOD_OPTIONS = [
  { key: "very_happy", label: "Very Happy", emoji: "😄", score: 90 },
  { key: "happy", label: "Happy", emoji: "🙂", score: 75 },
  { key: "okay", label: "Okay", emoji: "😐", score: 50 },
  { key: "low", label: "Low", emoji: "😔", score: 30 },
  { key: "depressed", label: "Depressed", emoji: "😢", score: 10 },
  { key: "angry", label: "Angry", emoji: "😡", score: 20 },
  { key: "tired", label: "Tired", emoji: "😴", score: 25 },
];

export default function MoodTracker({ onClose }) {
  const user = auth.currentUser;

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // -------------------------------------------------------
  // ⛔ Check if the student already submitted today
  // -------------------------------------------------------
  useEffect(() => {
    async function checkToday() {
      if (!user) return;

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, "moods"),
        where("studentId", "==", user.uid),
        where("createdAt", ">=", start),
        where("createdAt", "<=", end)
      );

      const snap = await getDocs(q);
      if (!snap.empty) setAlreadySubmitted(true);
    }

    checkToday();
  }, [user]);

  // -------------------------------------------------------
  // SUBMIT Mood (Only once per day)
  // -------------------------------------------------------
  const submitMood = async () => {
    if (!user) return toast.error("Please login first");
    if (!selected) return toast.error("Select a mood");

    if (alreadySubmitted)
      return toast.error("You already submitted your mood today.");

    const moodInfo = PRESET_INSIGHTS[selected.key];

    try {
      await addDoc(collection(db, "moods"), {
        studentId: user.uid,
        mood: selected.key,
        score: selected.score,
        note: note.trim(),
        insight: moodInfo,
        createdAt: serverTimestamp(),
      });

      toast.success("Mood saved!");
      onClose(); // close modal
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4 relative">
        
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center">How are you feeling today?</h2>

        {alreadySubmitted && (
          <p className="p-3 bg-yellow-100 text-yellow-700 rounded text-center">
            You already submitted your mood today.
          </p>
        )}

        {/* Mood Options */}
        <div className="grid grid-cols-3 gap-3">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.key}
              disabled={alreadySubmitted}
              onClick={() => setSelected(m)}
              className={`p-3 rounded-lg border text-center ${
                selected?.key === m.key ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
            >
              <div className="text-2xl">{m.emoji}</div>
              <div className="text-sm">{m.label}</div>
            </button>
          ))}
        </div>

        {/* Optional Note */}
        <textarea
          disabled={alreadySubmitted}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write something if you want..."
          rows={3}
        />

        {/* Submit */}
        <button
          disabled={alreadySubmitted}
          onClick={submitMood}
          className="w-full bg-primary text-white py-2 rounded-lg disabled:bg-gray-400"
        >
          Save Mood
        </button>
      </div>
    </div>
  );
}