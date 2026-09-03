const CategoryService = require("../services/categoryService");

const CategoryController = {
    createCategory: async (req, res, next) => {
        const categoryData = req.body;
        try {
            const category = await CategoryService.createCategory(categoryData);
            res.status(201).json(category);
        } catch (err) {
            next(err);
        }
    },
    getAllCategories: async (req, res, next) => {
        try {
            const category = await CategoryService.getAllCategories();
            res.status(200).json(category)
        } catch (err) {
            next(err);
        }
    },
    updateCategory: async (req, res, next) => {
        const { categoryId } = req.params;
        const categoryData = req.body;

        try {
            const updatedCategory = await CategoryService.updateCategory(categoryId, categoryData);

            res.status(200).json(updatedCategory);
        } catch (err) {
            next(err);
        }
    },
    deleteCategory: async (req, res, next) => {
        const { categoryId } = req.params;

        try {
            await CategoryService.deleteCategory(categoryId);
            res.status(200).json({ message: "Category deleted successfully" });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = CategoryController;