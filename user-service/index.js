// user-service.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const User = mongoose.model("User", { name: String, email: String });

app.use(bodyParser.json());

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json({ users });
});

app.get("/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  res.json({ user });
});

app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const newUser = new User({ name, email });
  await newUser.save();
  res.status(201).json(newUser);
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
