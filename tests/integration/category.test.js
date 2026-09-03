process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Category routes", () => {
    let fakeCategory, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeCategory = {
            name: faker.lorem.sentence(),
        };
    });
    afterEach(async () => {
        await db.Categories.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        let sessionCookies;
        beforeEach(async () => {
            const fakeUser = {
                email: faker.internet.email(),
                password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                role: "admin",
            };
            await db.Users.create(fakeUser);

            const res = await request(app)
                .post('/login')
                .send({
                    loginParam: fakeUser.email,
                    password: "123456789"
                })
                .expect(200);

            expect(res.body).to.have.property("user");
            sessionCookies = res.headers['set-cookie'];
        });
        describe("POST /api/categories", () => {
            it("expect to create category, when data is valid", async () => {
                const response = await request(app)
                    .post("/api/categories/")
                    .send(fakeCategory)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body).to.include({ name: fakeCategory.name });
            });
        });
        describe("GET /api/categories", () => {
            it("expect categories, when they exists", async () => {
                const testCategory = await db.Categories.create(fakeCategory);

                const response = await request(app)
                    .get(`/api/categories/`)
                    .expect(200);

                expect(response.body).to.be.an("array");
                expect(response.body[0]).to.have.property("id", testCategory.id);
                expect(response.body[0]).to.include({ name: testCategory.name });
            });
        });
        describe("PUT /api/categories/:categoryId", () => {
            it("expect to update category, when data valid and it exists", async () => {
                const testCategory = await db.Categories.create(fakeCategory);

                const response = await request(app)
                    .put(`/api/categories/${testCategory.id}`)
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("name", "TEST");
            });
        });
        describe("DELETE /api/categories/:categoryId", () => {
            it("expect delete category by id, when it exists", async () => {
                const testCategory = await db.Categories.create(fakeCategory);

                const response = await request(app)
                    .delete(`/api/categories/${testCategory.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Category deleted successfully")
                const categoryInDb = await db.Categories.findByPk(testCategory.id);
                expect(categoryInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/categories", () => {
            it("expect to AppError('name is required'), when 'name' is not provided", async () => {
                const response = await request(app)
                    .post("/api/categories/")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "name is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/categories/")
                    .send(fakeCategory)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user is not unauthorized", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .post("/api/categories/")
                    .send(fakeCategory)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("PUT /api/categories/:categoryId", () => {
            it("expect to AppError('name is required'), when 'name' is not provided", async () => {
                const response = await request(app)
                    .put("/api/categories/1")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "name is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .put("/api/categories/1")
                    .send({ name: "TEST" })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user is not unauthorized", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put("/api/categories/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Category not found'), when category doesn't exist", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put("/api/categories/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Category not found");
            });
        });
        describe("DELETE /api/categories/:categoryId", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/categories/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user is not unauthorized", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete("/api/categories/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Category not found'), when category doesn't exist", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                await db.Users.create(fakeUser);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete("/api/categories/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Category not found");
            });
        });

    });
});