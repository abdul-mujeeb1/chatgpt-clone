import { OpenAIEdgeStream, streamReader } from "openai-edge-stream";

export const config = {
    runtime: "edge",
}

export default async function handler(req) {
    try {
        const {message} = await req.json();
        
        const initialChatMessage = {
          role: "system",
          content: "Your name is Chatty. An incredible intelligent AI. You were created by Abdul Mujeeb. Your response must be formatted as markdown."
        };

        const stream = await OpenAIEdgeStream(
          "https://api.openai.com/v1/chat/completions",
          {
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            method: "POST",
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [initialChatMessage, { content: message, role: "user" }],
              stream: true,
            }),
          });

        // const stream = await fetch('https://api.openai.com/v1/chat/completions', {
        //     headers: {
        //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        //       'content-type': 'application/json',
        //     },
        //     method: "POST",
        //     body: JSON.stringify({
        //       stream: true,
        //       model: 'gpt-3.5-turbo',
        //       messages: [{ content: message, role: "user" }]
        //     })
        //   });
          return new Response(stream);
    } catch(error) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>ERROR -> SENDING MESSAGE', error.message);
    }
}