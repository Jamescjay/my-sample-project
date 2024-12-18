const express = require("express");
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /users/comment/{postId}:
 *   post:
 *     summary: Add a new comment to a post
 *     description: Allows a user to add a comment to a specific post.
 *     tags:
 *       - Comment
 *     security:
 *       - bearerAuth: []  # Enforces Bearer authentication
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to comment on
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: The content of the comment
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.post("/comment/:postId", authMiddleware, async (req, res) => {
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
