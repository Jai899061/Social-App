require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const POST_SERVICE_URL =
  process.env.POST_SERVICE_URL || "http://localhost:3001";
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:3002";
const COMMENT_SERVICE_URL =
  process.env.COMMENT_SERVICE_URL || "http://localhost:3003";

app.use(express.json());

app.get("/aggregatedData/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log("User URL:", `${USER_SERVICE_URL}/users/${userId}`);
  console.log("Post URL:", `${POST_SERVICE_URL}/posts/${userId}`);
  console.log("Comment URL:", `${COMMENT_SERVICE_URL}/comments/${userId}`);

  try {
    const [userRes, postsRes, commentsRes] = await Promise.all([
      axios.get(`${USER_SERVICE_URL}/users/${userId}`),
      axios.get(`${POST_SERVICE_URL}/posts/${userId}`),
      axios.get(`${COMMENT_SERVICE_URL}/comments/${userId}`),
    ]);

    const user = userRes.data.user || {};
    const posts = postsRes.data.posts || [];
    const comments = commentsRes.data.comments || [];

    const postsWithComments = posts.map((post) => ({
      ...post,
      comments: comments.filter((comment) => comment.post_id === post._id),
    }));

    res.json({ user, posts: postsWithComments });
  } catch (err) {
    console.error("❌ Error in aggregator:", err.message);
    res.status(500).json({ error: "Failed to aggregate user data" });
  }
});

app.listen(PORT, () => {
  console.log(`🧩 Aggregator Service running on port ${PORT}`);
});
