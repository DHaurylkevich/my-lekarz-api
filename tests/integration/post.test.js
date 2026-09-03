process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Post routes", () => {
    let fakePost, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakePost = {
            photo: "PHOTO",
            title: faker.lorem.sentence(),
            content: faker.lorem.sentence(),
        };
        fakeCategory = {
            name: faker.lorem.sentence(),
        };
    });
    afterEach(async () => {
        await db.Categories.destroy({ where: {} });
        await db.Posts.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/posts", () => {
            it("expect posts, when they exists", async () => {
                const testCategory = await db.Categories.create(fakeCategory);
                const testPost = await db.Posts.create({ ...fakePost, category_id: testCategory.id });

                const response = await request(app)
                    .get(`/api/posts/`)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("posts");
                expect(response.body.posts).to.have.property(testCategory.name);
                expect(response.body.posts[testCategory.name]).to.be.an("array");
                expect(response.body.posts[testCategory.name][0]).to.have.property("id", testPost.id);
                expect(response.body.posts[testCategory.name][0]).to.include({ title: testPost.title });
            });
        });
        describe("GET /api/posts/category/:categoryId", () => {
            it("expect posts, when they exists", async () => {
                const testCategory = await db.Categories.create(fakeCategory);
                const testPost = await db.Posts.create(fakePost);
                await testPost.setCategory(testCategory.id);

                const response = await request(app)
                    .get(`/api/posts/categories/${testCategory.id}`)
                    .expect(200);

                expect(response.body[0]).to.have.property("id", testPost.id);
                expect(response.body[0].category).to.have.property("name", testCategory.name);
            });
        });
        describe("PUT /api/posts/:postId", () => {
            let testPost, sessionCookies;

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
                testPost = await db.Posts.create(fakePost);
            });
            it("expect to update post, when data valid and it exists", async () => {
                const response = await request(app)
                    .put(`/api/posts/${testPost.id}`)
                    .send({ title: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.include({ title: "TEST" });
            });
        });
        describe("DELETE /api/posts/:postId", () => {
            let testPost, sessionCookies;

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
                testPost = await db.Posts.create(fakePost);
            });
            it("expect delete post by id, when it exists", async () => {
                const response = await request(app)
                    .delete(`/api/posts/${testPost.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Post deleted successfully");
                const postInDb = await db.Posts.findByPk(testPost.id);
                expect(postInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/posts/categories/:categoryId", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .post("/api/posts/categories/1")
                    .send(fakePost)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), user isn't admin", async () => {
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
                    .post("/api/posts/categories/1")
                    .send(fakePost)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Category not found'), category doesn't exist", async () => {
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
                    .post("/api/posts/categories/1")
                    .send(fakePost)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Category not found");
            });
        });
        describe("PUT /api/posts/:postId", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .put("/api/posts/1")
                    .send({ title: "TEST" })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), user isn't admin", async () => {
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
                    .put("/api/posts/1")
                    .send({ title: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Post not found'), post doesn't exist ", async () => {
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
                    .put("/api/posts/1")
                    .send({ title: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Post not found");
            });
        });
        describe("DELETE /api/posts/:postId", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/posts/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), user isn't admin", async () => {
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
                    .delete("/api/posts/1s")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Post not found'), user isn't admin", async () => {
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
                    .delete("/api/posts/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Post not found");
            });
        });
    });
});