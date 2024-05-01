const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 8050;

const { getStoredPosts, storePosts } = require("./data/posts");

const app = express();

app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

app.use((req, res, next) => {
  // Attach CORS headers
  // Required when using a detached backend (that runs on a different domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Define a route handler for the root URL
app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/posts", async (req, res) => {
  const storedPosts = await getStoredPosts();
  // await new Promise((resolve, reject) => setTimeout(() => resolve(), 1500));
  res.json({ posts: storedPosts });
});

app.get("/posts/:id", async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});

app.post("/posts", async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postData = req.body;
  const newPost = {
    ...postData,
    id: Math.random().toString(),
  };
  const updatedPosts = [newPost, ...existingPosts];
  await storePosts(updatedPosts);
  res.status(201).json({ message: "Stored new post.", post: newPost });
});

app.delete("/posts/:id", async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postId = req.params.id;
  const updatedPosts = existingPosts.filter((post) => post.id !== postId);
  await storePosts(updatedPosts);
  res.status(200).json({ message: "Deleted post.", id: postId });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  try {
    const data = JSON.parse(fs.readFileSync("users.json", "utf8"));

    if (!data.users) {
      return res
        .status(500)
        .json({ success: false, message: "No users in data" });
    }

    const user = data.users.find((user) => user.username === username);

    // console.log(`Found user: ${JSON.stringify(user)}`);

    if (user && bcrypt.compareSync(password, user.password)) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// // const bcrypt = require('bcrypt');
// const saltRounds = 10;
// const plainTextPassword = "minic888";

// bcrypt.hash(plainTextPassword, saltRounds, function (err, hash) {
//   // Store hash in your password DB.
//   console.log(hash);
// });

app.listen(PORT, console.log(`Server started at port ${PORT}.`));
