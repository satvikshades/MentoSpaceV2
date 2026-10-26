import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { FiChevronRight } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { timeAgo, toDate } from "../../../lib/progress";
import { Avatar, EmptyState, PageHeader, Skeleton } from "../../ui";

function Chats() {
  const { user, role } = useDashboard();
  const [chats, setChats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "chats"), where("members", "array-contains", user.uid)));
        const rows = await Promise.all(
          snap.docs.map(async (c) => {
            const data = c.data();
            const otherId = data.members.find((m) => m !== user.uid);
            const [u, last] = await Promise.all([
              getDoc(doc(db, "users", otherId)),
              getDocs(query(collection(db, "chats", c.id, "messages"), orderBy("timestamp", "desc"), limit(1))),
            ]);
            const msg = last.docs[0]?.data();
            return {
              id: c.id,
              other: u.exists() ? { id: otherId, ...u.data() } : { id: otherId, name: data.userNames?.[otherId] || "Someone" },
              last: msg || null,
              at: toDate(msg?.timestamp) || toDate(data.createdAt) || new Date(0),
            };
          })
        );
        rows.sort((a, b) => b.at - a.at);
        setChats(rows);
      } catch (err) {
        console.error(err);
        setChats([]);
      }
    })();
  }, [user.uid]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Messages" title="Conversations" />
      {!chats ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[76px]" />
          ))}
        </div>
      ) : chats.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No conversations yet"
          body={
            role === "mentor"
              ? "Accept a student's request and a conversation opens here."
              : "Once a mentor accepts your request, you can message them here."
          }
          action={
            role === "mentor" ? (
              <Link to="/dashboard/my-students" className="btn-primary">See requests</Link>
            ) : (
              <Link to="/dashboard/find-mentor" className="btn-primary">Find a mentor</Link>
            )
          }
        />
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {chats.map((c) => {
            const mine = c.last?.senderId === user.uid;
            return (
              <Link key={c.id} to={`/dashboard/chat/${c.id}`} className="flex items-center gap-4 px-4 py-4 transition hover:bg-bg-light-gray sm:px-5">
                <Avatar person={c.other} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-bold">{c.other.name}</p>
                    {c.last && <span className="shrink-0 text-xs text-muted">{timeAgo(c.last.timestamp)}</span>}
                  </div>
                  <p className="truncate text-sm text-muted">
                    {c.last ? `${mine ? "You: " : ""}${c.last.text}` : "Say hello 👋"}
                  </p>
                </div>
                <FiChevronRight className="shrink-0 text-muted" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Chats;
