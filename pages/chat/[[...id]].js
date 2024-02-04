import ChatSidebar from "components/Chat/ChatSidebar";
import Message from "components/Chat/Message";
import Head from "next/head";
import { streamReader } from "openai-edge-stream";
import { useState } from "react";
import {v4 as uuid} from "uuid";

export default function ChatPage() {
  const [messageText, setMessageText] = useState("");
  const [incomingResponse, setIncomingResponse] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([])
  const [generatingResponse, setGeneratingResponse] = useState(false)

    const handleSubmit = async (e) => {
      e.preventDefault();
      setGeneratingResponse(true);
      setNewChatMessages(prev => {
        const newChatMessages = [...prev, {
           _id: uuid(),
           role: "user",
           content: messageText,
        }];
        return newChatMessages;
      })
      setMessageText("");
      const response = await fetch('/api/chat/sendMessage', {
        method: "POST",
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({message: messageText})
      });
      const data = response.body;

      if(!data) {
        console.log('ERROR!')
        return;
      }
      await streamReader(data.getReader(), (messageChunk) => {
        setIncomingResponse(prevMessage => `${prevMessage} ${messageChunk.content}`);
      })
      setGeneratingResponse(false);
    }

    return (
        <>
          <Head>
            <title>Chat</title>
          </Head>
          <div className="h-screen grid grid-cols-[260px_1fr]">
            <ChatSidebar />
          <div className="bg-gray-700 flex flex-col overflow-hidden">
            <div className="flex-1 text-white overflow-y-scroll">
              {newChatMessages.map(message => {
                return (
                  <Message key={message._id} role={message.role} content={message.content} />
                );
              })}
              {!!incomingResponse && <Message role="assistant" content={incomingResponse} />}
              </div>
            <div className="p-9 bg-gray-800">
              <form onSubmit={handleSubmit}>
                <fieldset className="flex gap-2" disabled={generatingResponse}>
                <textarea 
                 placeholder={ generatingResponse ? "" : "Send a message..."}
                 onChange={(e) => setMessageText(e.target.value)}
                 className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border focus:border-emerald-500 focus:bg-gray-600 focus:outline focus-outline-emerald-500" />
                <button className="btn" type="submit">Send</button>
                </fieldset>
              </form>
            </div>
          </div>
          </div>
        </>
      );
}