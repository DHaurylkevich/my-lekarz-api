const db = require("../models");
const AppError = require("../utils/appError");

const CategoryService = {
    createCategory: async (categoryData) => {
        const category = await db.Categories.create(categoryData);
        return { id: category.id, name: category.name };
    },
    getAllCategories: async () => {
        return await db.Categories.findAll({ attributes: { exclude: ["createdAt", "updatedAt"] } });
    },
    updateCategory: async (categoryId, data) => {
        let category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        category = await category.update(data);

        return { name: category.name };
    },
    deleteCategory: async (categoryId) => {
        const category = await db.Categories.findByPk(categoryId);
        if (!category) {
            throw new AppError("Category not found", 404);
        }

        await category.destroy();
    }
}

module.exports = CategoryService;