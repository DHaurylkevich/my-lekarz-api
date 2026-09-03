const PostService = require("../services/postService");

const PostController = {
    createPost: async (req, res, next) => {
        const { categoryId } = req.params;
        const image = req.file ? req.file.path : null;
        const postData = req.body;

        try {
            const post = await PostService.createPost(categoryId, postData, image);
            res.status(201).json(post);
        } catch (err) {
            next(err);
        }
    },
    getAllPosts: async (req, res, next) => {
        const { limit, page } = req.query;

        try {
            const post = await PostService.getAllPosts(limit, page);
            res.status(200).json(post)
        } catch (err) {
            next(err);
        }
    },
    getPostsByCategory: async (req, res, next) => {
        const { categoryId } = req.params;

        try {
            const posts = await PostService.getPostsByCategory(categoryId);
            res.status(200).json(posts)
        } catch (err) {
            next(err);
        }
    },
    updatePost: async (req, res, next) => {
        const { postId } = req.params;
        const image = req.file ? req.file.path : null;
        const postData = req.body;

        try {
            const updatedPost = await PostService.updatePost(postId, postData, image);
            res.status(200).json(updatedPost);
        } catch (err) {
            next(err);
        }
    },
    deletePost: async (req, res, next) => {
        const { postId } = req.params;

        try {
            await PostService.deletePost(postId);
            res.status(200).json({ message: "Post deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = PostController;