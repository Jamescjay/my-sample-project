const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// Add Comment
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      comment,
      post: post._id,
      user: req.user.id,
    });

    await newComment.save();
    res.status(201).json({ message: "Comment added successfully", newComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
