const db = require("../models");
const AppError = require("../utils/appError");
const cloudinary = require("../middleware/upload");
const { getPaginationParams, getTotalPages } = require("../utils/pagination");

const PostService = {
    createPost: async (categoryId, postData, photo) => {
        try {
            const category = await db.Categories.findByPk(categoryId);
            if (!category) {
                throw new AppError("Category not found", 404);
            }

            const post = await db.Posts.create({ ...postData, photo, category_id: categoryId });
            return { id: post.id, photo: post.photo, title: post.title, content: post.content };
        } catch (err) {
            if (photo) await cloudinary.deleteFromCloud(photo);
            throw err;
        }
    },
    getAllPosts: async (limit, page) => {
        const { parsedLimit, offset } = getPaginationParams(limit, page);

        const { rows, count } = await db.Posts.findAndCountAll({
            limit: parsedLimit,
            offset: offset,
            attributes: { exclude: ["updatedAt", "category_id"] },
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    attributes: ["name"],
                }
            ],
            order: [["createdAt", "DESC"]],
        });

        if (!rows.length) {
            return { pages: 0, posts: [] };
        }

        const totalPages = getTotalPages(count, parsedLimit, page);

        const groupedPosts = rows.reduce((accumulator, post) => {
            const categoryName = post.category.name;
            if (!accumulator[categoryName]) {
                accumulator[categoryName] = [];
            }
            accumulator[categoryName].push(post);
            return accumulator;
        }, {});

        return { pages: totalPages, posts: groupedPosts };
    },
    getPostsByCategory: async (categoryId) => {
        return await db.Posts.findAll({
            attributes: ["id", "photo", "title", "content", "createdAt"],
            include: [
                {
                    model: db.Categories,
                    as: "category",
                    attributes: ["name"],
                    where: { id: categoryId },
                }
            ],
        });
    },
    updatePost: async (postId, postData, photo) => {
        try {
            let post = await db.Posts.findByPk(postId);
            if (!post) {
                throw new AppError("Post not found", 404);
            }

            if (photo) {
                if (post.photo !== null) await cloudinary.deleteFromCloud(post.photo);
                postData.photo = photo;
            }

            post = await post.update({ ...postData });
            return { id: post.id, photo: post.photo, title: post.title, content: post.content }
        } catch (err) {
            if (photo) await cloudinary.deleteFromCloud(photo);
            throw err;
        }
    },
    deletePost: async (postId) => {
        const post = await db.Posts.findByPk(postId);
        if (!post) {
            throw new AppError("Post not found", 404);
        }

        if (post.photo !== null) {
            await cloudinary.deleteFromCloud(post.photo);
        }

        await post.destroy();
    }
}

module.exports = PostService;