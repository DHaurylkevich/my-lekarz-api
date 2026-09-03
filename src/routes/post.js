const express = require("express");
const router = express.Router();
const PostController = require("../controllers/postController");
const { isAuthenticated, hasRole } = require("../middleware/auth");
const upload = require("../middleware/upload").uploadImages;

/**
 * @swagger
 * /posts/categories/{categoryId}:
 *   post:
 *     summary: Create a new category
 *     tags: [Posts]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: category ID
 *         schema:
 *           type: integer
 *           example: 1
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - photo
 *               - title
 *               - content
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 title:
 *                   type: string
 *                   example: "Health"
 *                 content:
 *                   type: string
 *                   example: "Good good"
 */
router.post("/posts/categories/:categoryId", isAuthenticated, hasRole("admin"), upload.single("image"), PostController.createPost);
/**
 * @swagger
 * /posts/categories/{categoryId}:
 *   get:
 *     summary: Get post by category's id
 *     tags: [Posts]
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         description: category's ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   photo:
 *                     type: string
 *                     example: "https://example.com"
 *                   title:
 *                     type: string
 *                     example: "Health"
 *                   content:
 *                     type: string
 *                     example: "Good good"
 *                   category:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Computers"
 */
router.get("/posts/categories/:categoryId", PostController.getPostsByCategory);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pages:
 *                   type: integer
 *                   example: 10
 *                 posts:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "801"
 *                         photo:
 *                           type: string
 *                           format: uri
 *                           example: "https://loremflickr.com/3493/3098?lock=693477065326085"
 *                         title:
 *                           type: string
 *                           example: "Ipsum."
 *                         content:
 *                           type: string
 *                           example: "Facilis voluptas similique possimus.\nDolorum veritatis nemo iste odio dignissimos quam.\nIste architecto occaecati debitis distinctio.\nRem modi architecto numquam porro officia ipsam exercitationem commodi.\nAliquid perferendis molestias."
 *                         createdAt:
 *                           type: data
 *                           example: "20.01.2034"
 *                         category:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Games"
 */
router.get("/posts", PostController.getAllPosts);
/**
 * @swagger
 * /posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: post's ID
 *         schema:
 *           type: integer
 *           example: 1
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Health"
 *               content:
 *                 type: string
 *                 example: "Good good"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 photo:
 *                   type: string
 *                   example: "https://example.com"
 *                 title:
 *                   type: string
 *                   example: "Health"
 *                 content:
 *                   type: string
 *                   example: "Good good"
 */
router.put("/posts/:postId", isAuthenticated, hasRole("admin"), upload.single("image"), PostController.updatePost);
/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 */
router.delete("/posts/:postId", isAuthenticated, hasRole("admin"), PostController.deletePost);

module.exports = router; 