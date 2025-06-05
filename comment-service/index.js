const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const amqp = require("amqplib");

const app = express();
const PORT = process.env.PORT || 3003;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/commentdb";
const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const Comment = mongoose.model("Comment", {
  post_id: String,
  text: String,
  userId: String,
});

app.use(bodyParser.json());

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err.message);
    });
    connection.on("close", () => {
      console.error("RabbitMQ connection closed. Reconnecting...");
      return setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();
    await channel.assertQueue("comments", { durable: true });

    console.log("🔌 RabbitMQ connected and comments queue asserted");
  } catch (error) {
    console.error("Failed to connect RabbitMQ:", error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

connectRabbitMQ();

app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.get("/comments/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const comments = await Comment.find({ userId });
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user comments" });
  }
});

app.post("/comments", async (req, res) => {
  try {
    const { post_id, text, userId } = req.body;
    const newComment = new Comment({ post_id, text, userId });
    await newComment.save();

    if (channel) {
      channel.sendToQueue("comments", Buffer.from(JSON.stringify(newComment)), {
        persistent: true,
      });
    } else {
      console.warn(
        "RabbitMQ channel is not available, skipping message publish"
      );
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

app.listen(PORT, () => {
  console.log(`Comment Service running on port ${PORT}`);
});
