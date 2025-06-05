require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const app = express();

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

let channel;
let connection;

const Post = mongoose.model("Post", {
  title: String,
  content: String,
  userId: String,
  commentCount: {
    type: Number,
    default: 0,
  },
});

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });
    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      return setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();
    await channel.assertQueue("comments", { durable: true });

    channel.consume(
      "comments",
      async (msg) => {
        if (msg !== null) {
          try {
            const newComment = JSON.parse(msg.content.toString());

            const Post = mongoose.model("Post", {
              title: String,
              content: String,
              userId: String,
              commentCount: {
                type: Number,
                default: 0,
              },
            });
            await Post.updateOne(
              { _id: newComment.post_id },
              { $inc: { commentCount: 1 } }
            );
            channel.ack(msg);
          } catch (error) {
            console.error("Error processing comment message:", error);
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );

    console.log("🔌 RabbitMQ connected and consuming comments queue");
  } catch (err) {
    console.error("RabbitMQ connection error:", err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

connectRabbitMQ();

app.use(bodyParser.json());

app.get("/posts", async (req, res) => {
  const posts = await Post.find();
  res.json({ posts });
});

app.get("/posts/:userId", async (req, res) => {
  const userId = req.params.userId;
  const posts = await Post.find({ userId });
  res.json({ posts });
});

app.post("/posts", async (req, res) => {
  const { title, content, userId } = req.body;
  const newPost = new Post({ title, content, commentCount: 0, userId });
  await newPost.save();
  res.status(201).json(newPost);
});

app.listen(PORT, () => {
  console.log(`Post Service running on http://localhost:${PORT}`);
});
