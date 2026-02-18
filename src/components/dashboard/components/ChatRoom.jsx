import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

function ChatRoom() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);
  const user = auth.currentUser;

  // Load messages in real time
  useEffect(() => {
    const msgRef = collection(db, "chats", chatId, "messages");
    const q = query(msgRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => d.data());
      setMessages(msgs);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: user.uid,
      timestamp: serverTimestamp(),
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white p-4 shadow rounded-lg">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 max-w-xs rounded-lg ${
              msg.senderId === user.uid
                ? "bg-primary text-white ml-auto"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-2 border-t">
        <input
          className="flex-grow border p-2 rounded-lg"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-primary text-white px-4 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoom;