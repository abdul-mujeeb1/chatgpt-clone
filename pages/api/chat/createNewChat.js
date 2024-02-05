import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";

export default async function handler(req, res) {
  try {
    const { user } = await getSession(req, res);
    const { message } = req.body;

    // validate data
    if (!message || typeof message !== "string" || message.length > 200) {
      res.status(422).json({
        message: "message is required and must be less than 200 characters",
      });
      return;
    }

    const newChat = {
      content: message,
      role: "user",
    };

    const client = await clientPromise;
    const db = client.db("Chatty");
    const userChat = await db.collection("chats").insertOne({
      userId: user.sub,
      messages: [newChat],
      title: message,
    });

    res.status(201).json({
      _id: userChat.insertedId,
      messages: [newChat],
      title: message,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occured When creating a new chat!",
    });
    console.log("createNewChat", error.message);
  }
}
