import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Chats() {
  const [chatList, setChatList] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    async function loadChats() {
      const q = query(
        collection(db, "chats"),
        where("members", "array-contains", user.uid)
      );

      const snap = await getDocs(q);

      const chats = [];

      for (const chatDoc of snap.docs) {
        const data = chatDoc.data();

        // Find the other user's ID
        const otherUserId = data.members.find((m) => m !== user.uid);

        // Fetch other user's info
        const userSnap = await getDoc(doc(db, "users", otherUserId));
        const otherUser = userSnap.exists() ? userSnap.data() : {};

        chats.push({
          chatId: chatDoc.id,
          otherUserName: otherUser.name || "Unknown User",
          otherUserPic:
            otherUser.profilePic ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              otherUser.name || "User"
            )}`,
        });
      }

      setChatList(chats);
    }

    loadChats();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Chats</h1>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        {chatList.length === 0 ? (
          <p className="text-gray-500">No chats yet.</p>
        ) : (
          chatList.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => navigate(`/dashboard/chat/${chat.chatId}`)}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={chat.otherUserPic}
                className="w-12 h-12 rounded-full"
                alt="User"
              />

              <div>
                <h2 className="font-semibold text-lg">{chat.otherUserName}</h2>
                <p className="text-sm text-gray-500">Tap to continue chat</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Chats;