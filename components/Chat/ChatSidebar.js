import { faMessage, faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ChatSidebar() {
  const [chatList, setChatList] = useState([]);

  useEffect(() => {
    async function loadList() {
      const response = await fetch("api/chat/getChatList", {
        methods: "GET",
      });
      const data = await response.json();
      setChatList(data?.chats || []);
    }
    loadList();
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-white">
      <Link href="/chat" className="side-list-item bg-emerald-500 hover:bg-emerald-600">
      <FontAwesomeIcon width={16} icon={faPlus} /> New Chat</Link>
      <div className="flex-1 overflow-auto bg-gray-900">
        {chatList.map((chat) => {
          return (
            <Link className="side-list-item" key={chat._id} href={`${chat._id}`}>
              <FontAwesomeIcon width={16} icon={faMessage} /> {chat.title}
            </Link>
          );
        })}
      </div>
      <Link className="side-list-item" href="/api/auth/logout">
      <FontAwesomeIcon width={16} icon={faRightFromBracket} /> Logout</Link>
    </div>
  );
}
