process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Notion routes", () => {
    let fakeNotion, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeNotion = {
            content: faker.lorem.sentence(),
        };
    });
    afterEach(async () => {
        await db.Notions.destroy({ where: {} });
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
        describe("POST /api/notions", () => {
            it("expect to create notion, when data is valid", async () => {
                const response = await request(app)
                    .post("/api/notions/")
                    .send(fakeNotion)
                    .set("Cookie", sessionCookies)
                    .expect(201);

                expect(response.body).that.is.a("object");
                expect(response.body).to.include({ content: fakeNotion.content });
            });
        });
        describe("GET /api/notions", () => {
            it("expect notion, when they exists", async () => {
                const testNotion = await db.Notions.create(fakeNotion);

                const response = await request(app)
                    .get(`/api/notions`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.be.an("array");
                expect(response.body[0]).to.have.property("id", testNotion.id);
                expect(response.body[0]).to.include({ content: testNotion.content });
            });
        });
        describe("PUT /api/notions/:notionId", () => {
            it("expect to update notion, when data valid and it exists", async () => {
                const testNotion = await db.Notions.create(fakeNotion);

                const response = await request(app)
                    .put(`/api/notions/${testNotion.id}`)
                    .send({ content: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("content", "TEST");
            });
        });
        describe("DELETE /api/notions/:notionId", () => {
            it("expect delete notions by id, when it exists", async () => {
                const testNotion = await db.Notions.create(fakeNotion);

                const response = await request(app)
                    .delete(`/api/notions/${testNotion.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Notion deleted successfully")
                const NotionInDb = await db.Notions.findByPk(testNotion.id);
                expect(NotionInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/notions", () => {
            it("expect to AppError('content is required'), when 'content' is not provided", async () => {
                const response = await request(app)
                    .post("/api/notions/")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "content is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .post("/api/notions/")
                    .send(fakeNotion)
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
                    .post("/api/notions/")
                    .send(fakeNotion)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("PUT /api/notions/:notionId", () => {
            it("expect to AppError('content is required'), when 'content' is not provided", async () => {
                const response = await request(app)
                    .put("/api/notions/1")
                    .send()
                    .expect(400);

                expect(response.body).to.have.property("message", "content is required");
            });
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .put("/api/notions/1")
                    .send({ content: "TEST" })
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
                    .put("/api/notions/1")
                    .send({ content: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Notion not found'), when notion doesn't exist", async () => {
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
                    .put("/api/notions/1")
                    .send({ content: "TEST" })
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Notion not found");
            });
        });
        describe("DELETE /api/notions/:medicationId", () => {
            it("expect to AppError('Unauthorized user'), when user is not unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/notions/1")
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
                    .delete("/api/notions/1")
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect to AppError('Notion not found'), when notion doesn't exist", async () => {
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
                    .delete("/api/notions/1")
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Notion not found");
            });
        });
    });
});