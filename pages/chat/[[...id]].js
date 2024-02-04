import { getSession } from "@auth0/nextjs-auth0";
import ChatSidebar from "components/Chat/ChatSidebar";
import Message from "components/Chat/Message";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb";
import Head from "next/head";
import { useRouter } from "next/router";
import { streamReader } from "openai-edge-stream";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export default function ChatPage({ chatId, title, messages }) {
  const [messageText, setMessageText] = useState("");
  const [incomingResponse, setIncomingResponse] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [newChatId, setNewChatId] = useState();
  const router = useRouter();

  useEffect(() => {
    if (!generatingResponse && newChatId) {
      setNewChatId(null);
      router.push(`/chat/${newChatId}`);
    }
  }, [newChatId, router, generatingResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneratingResponse(true);
    setNewChatMessages((prev) => {
      const newChatMessages = [
        ...prev,
        {
          _id: uuid(),
          role: "user",
          content: messageText,
        },
      ];
      return newChatMessages;
    });
    setMessageText("");
    const response = await fetch("/api/chat/sendMessage", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: messageText }),
    });
    const data = response.body;

    if (!data) {
      console.log("ERROR!");
      return;
    }
    await streamReader(data.getReader(), (messageChunk) => {
      console.log(messageChunk);
      if (messageChunk.event === "newChatId") {
        setNewChatId(messageChunk.content);
      } else {
        setIncomingResponse(
          (prevMessage) => `${prevMessage} ${messageChunk.content}`
        );
      }
    });
    setGeneratingResponse(false);
  };

  const allMessages = [...messages, ...newChatMessages];

  return (
    <>
      <Head>
        <title>Chat</title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]">
        <ChatSidebar chatId={chatId} />
        <div className="flex flex-col overflow-hidden bg-gray-700">
          <div className="flex-1 overflow-y-scroll text-white">
            {allMessages.map((message) => {
              return (
                <Message
                  key={message._id}
                  role={message.role}
                  content={message.content}
                />
              );
            })}
            {!!incomingResponse && (
              <Message role="assistant" content={incomingResponse} />
            )}
          </div>
          <div className="bg-gray-800 p-9">
            <form onSubmit={handleSubmit}>
              <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea
                  placeholder={generatingResponse ? "" : "Send a message..."}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="focus-outline-emerald-500 w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border focus:border-emerald-500 focus:bg-gray-600 focus:outline"
                />
                <button className="btn" type="submit">
                  Send
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps = async (ctx) => {
  const { user } = await getSession(ctx.req, ctx.res);
  const propChatId = await ctx.params?.id?.[0] || null;
  const client = await clientPromise;
  const db = client.db("Chatty");
  let objectId;

  try {
    objectId = new ObjectId(propChatId);
  } catch (e) {
    // res.status(422).json({
    //   message: "Invalid chat ID",
    // });
    return;
  }

  const chat = await db.collection("chats").findOne({
    userId: user.sub,
    _id: objectId,
  });

  let chatMessages = [];

  if (chat) {
    chatMessages = chat.messages.map((message) => ({
      ...message,
      _id: uuid(),
    }));
  }

  return {
    props: {
      chatId: propChatId,
      title: chat?.title || null,
      messages: chatMessages,
    },
  };
};
