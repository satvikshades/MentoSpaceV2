import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { dayKey, toDate } from "../../../lib/progress";
import { Avatar, Spinner } from "../../ui";

const STARTERS = {
  student: ["Hi! Thanks for accepting 🙂", "Can I tell you what's been going on lately?", "When's a good time to talk?"],
  mentor: ["Hey, glad you reached out. How are you doing?", "What would be most helpful to talk about?", "No pressure, reply whenever you're ready."],
};

function dayLabel(d) {
  const k = dayKey(d);
  if (k === dayKey()) return "Today";
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (k === dayKey(y)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}

function ChatRoom() {
  const { chatId } = useParams();
  const { user, role } = useDashboard();
  const [messages, setMessages] = useState(null);
  const [other, setOther] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [denied, setDenied] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    (async () => {
      const chat = await getDoc(doc(db, "chats", chatId)).catch(() => null);
      if (!chat?.exists() || !chat.data().members?.includes(user.uid)) {
        setDenied(true);
        return;
      }
      const otherId = chat.data().members.find((m) => m !== user.uid);
      const u = await getDoc(doc(db, "users", otherId));
      setOther(u.exists() ? { id: otherId, ...u.data() } : { id: otherId, name: chat.data().userNames?.[otherId] || "Someone" });
    })();
  }, [chatId, user.uid]);

  useEffect(() => {
    if (denied) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
    return onSnapshot(
      q,
      (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data({ serverTimestamps: "estimate" }) }))),
      () => setMessages([])
    );
  }, [chatId, denied]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length]);

  const send = async (value = text) => {
    const body = value.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: body,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      setText(body);
      toast.error("Message didn't send. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (denied)
    return (
      <div className="card mx-auto max-w-md p-10 text-center">
        <p className="font-bold">This conversation isn't available.</p>
        <p className="mt-1 text-sm text-muted">It may not have started yet, or you're not part of it.</p>
        <Link to="/dashboard/chats" className="btn-soft mt-5">Back to messages</Link>
      </div>
    );

  let lastDay = null;

  return (
    <div className="card mx-auto flex h-[calc(100dvh-11rem)] max-w-3xl flex-col overflow-hidden lg:h-[calc(100dvh-5rem)]">
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Link to="/dashboard/chats" className="-ml-1 rounded-lg p-2 text-muted hover:bg-bg-light-gray hover:text-ink" aria-label="Back">
          <FiArrowLeft />
        </Link>
        {other ? (
          <>
            <Avatar person={other} size={40} />
            <div className="min-w-0">
              <p className="truncate font-bold">{other.name}</p>
              <p className="text-xs capitalize text-muted">{other.role || ""}</p>
            </div>
          </>
        ) : (
          <div className="h-10" />
        )}
      </header>

      <div className="flex-1 space-y-1 overflow-y-auto bg-bg-light-gray/50 px-4 py-5">
        {!messages ? (
          <div className="grid h-full place-items-center text-primary">
            <Spinner className="h-5 w-5" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {other && <Avatar person={other} size={64} />}
            <p className="mt-3 font-bold">Start the conversation</p>
            <p className="mt-1 max-w-xs text-sm text-muted">Not sure what to say? Tap one of these.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {(STARTERS[role] || STARTERS.student).map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full bg-white px-3.5 py-2 text-sm font-medium ring-1 ring-line transition hover:ring-primary">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === user.uid;
            const at = toDate(m.timestamp) || new Date();
            const day = dayKey(at);
            const showDay = day !== lastDay;
            lastDay = day;
            const next = messages[i + 1];
            const tail = !next || next.senderId !== m.senderId;
            return (
              <div key={m.id}>
                {showDay && (
                  <p className="my-4 text-center text-[11px] font-bold uppercase tracking-wider text-muted">{dayLabel(at)}</p>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"} ${tail ? "mb-2.5" : ""}`}>
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap break-words px-3.5 py-2 text-[15px] leading-relaxed ${
                      mine
                        ? `bg-primary text-white ${tail ? "rounded-2xl rounded-br-md" : "rounded-2xl"}`
                        : `bg-white text-ink ring-1 ring-line ${tail ? "rounded-2xl rounded-bl-md" : "rounded-2xl"}`
                    }`}
                  >
                    {m.text}
                    {tail && (
                      <span className={`ml-2 inline-block translate-y-0.5 text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>
                        {at.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-line bg-white p-3"
      >
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Write a message"
          className="field max-h-32 min-h-[44px] flex-1 resize-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white transition active:scale-95 disabled:bg-bg-medium-gray disabled:text-muted"
          aria-label="Send"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
