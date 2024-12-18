const express = require("express");
const Post = require("../models/Post");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /users/post:
 *   post:
 *     summary: Create a new post
 *     description: Allows a user to create a new post.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []  # Enforces Bearer authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               content:
 *                 type: string
 *                 description: The content of the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *       500:
 *         description: Server error
 */
router.post("/post", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      user: req.user.id,
    });

    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/post/{postId}:
 *   put:
 *     summary: Edit a post
 *     description: Allows a user to edit a post they created.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []  # Enforces Bearer authentication
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put("/post/:postId", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.updatedAt = Date.now();

    await post.save();
    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /users/post/{postId}:
 *   delete:
 *     summary: Delete a post
 *     description: Allows a user to delete a post they created.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []  # Enforces Bearer authentication
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         description: The ID of the post to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete("/post/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await post.deleteOne(); 
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
