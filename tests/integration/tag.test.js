require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Tag routes", () => {
    let fakeTag, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeTag = { name: faker.lorem.paragraph(), positive: false };
    });
    afterEach(async () => {
        await db.Tags.destroy({ where: {} });
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
        describe("POST /api/tags", () => {
            it("expect to create tag, when data is valid", async () => {
                const response = await request(app)
                    .post("/api/tags")
                    .send(fakeTag)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body.name).to.equal(fakeTag.name);
                expect(response.body.positive).to.equal(fakeTag.positive);
            });
        });
        describe("GET /api/tags/", () => {
            it("expect tags, when they exists", async () => {
                const testTag = await db.Tags.create(fakeTag);

                const response = await request(app)
                    .get("/api/tags")
                    .set("Cookie", sessionCookies)
                    .expect(200);
                expect(response.body).to.be.an("array").that.is.not.empty;
                expect(response.body[0]).to.include({ positive: testTag.positive });
                expect(response.body[0]).to.include({ name: testTag.name });
            });
        });
        describe("PUT /api/tags/:id", () => {
            it("expect to update tag, when data valid and it exists", async () => {
                const testTag = await db.Tags.create(fakeTag);

                await request(app)
                    .put(`/api/tags/${testTag.id}`)
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                const tagInDB = await db.Tags.findByPk(testTag.id);
                expect(tagInDB).to.include({ positive: testTag.positive });
                expect(tagInDB).to.include({ name: "TEST" });
            });
        });
        describe("DELETE /api/tags/:id", () => {
            it("expect delete tag by id, when it exists", async () => {
                const testTag = await db.Tags.create(fakeTag);

                await request(app)
                    .delete(`/api/tags/${testTag.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                const tagInDb = await db.Tags.findByPk(testTag.id);
                expect(tagInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/tags", () => {
            it("expect to AppError('name is required'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/tags")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "name is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/tags")
                    .send(fakeTag)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user has not admin role", async () => {
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
                    .post("/api/tags")
                    .send(fakeTag)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("PUT /api/tags/:id", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .put("/api/tags/1")
                    .send({ name: "TEST" })
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user has not admin role", async () => {
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
                    .put("/api/tags/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Tag not found'), when tag doesn't exist", async () => {
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
                    .put("/api/tags/1")
                    .send({ name: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Tag not found");
            });
        });
        describe("DELETE /api/tags/:id", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/tags/1")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect to AppError('Access denied'), when user has not admin role", async () => {
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
                    .delete("/api/tags/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Tag not found'), when tag doesn't exist", async () => {
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
                    .delete("/api/tags/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Tag not found");
            });
        });
    });
});