process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Review routers", () => {
    let testPatient, testDoctor, testTag, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        testPatient = await db.Patients.create({ gender: "male", market_inf: false });
        testDoctor = await createTestDoctor();
        const createdTag = await db.Tags.bulkCreate([{ name: faker.lorem.paragraph(), positive: true }, { name: faker.lorem.paragraph(), positive: true }]);
        testTag = [createdTag[0].id, createdTag[1].id]
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
        await db.ReviewTags.destroy({ where: {} });
        await db.Reviews.destroy({ where: {} });
        await db.Tags.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
    });

    const createTestDoctor = async () => {
        return await db.Doctors.create({
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph(),
        });
    };

    describe("Positive tests", () => {
        describe("POST /api/reviews", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
            it("expect to create review and to set a rating for the doctor, when data is valid", async () => {
                const existingReviews = [
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 4, comment: "Good doctor" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 5, comment: "Excellent service" },
                    { patient_id: patientId, doctor_id: testDoctor.id, rating: 3, comment: "Average experience" }
                ];
                await db.Reviews.bulkCreate(existingReviews);
                const newReviewData = { doctorId: testDoctor.id, rating: faker.number.int({ min: 1, max: 5 }), comment: faker.lorem.paragraph(), tagsIds: [testTag.id] };

                const response = await request(app)
                    .post("/api/reviews")
                    .send(newReviewData)
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).to.be.an("object");
                expect(response.body).to.have.property("message", "Review created successfully");
                const reviews = await db.Reviews.findAll({
                    where: { id: testDoctor.id }, raw: true
                });
                expect(reviews[0]).to.have.property("rating", 4);
            });
        });
        describe("GET /api/doctors/:doctorId/reviews", () => {
            let testDoctorId;
            beforeEach(async () => {
                const testClinic = await db.Clinics.create({ name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence() });
                await testClinic.addDoctor(testDoctor);
                const existingReviews = [
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 4, comment: "Good doctor", tag_id: testTag.id },
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 5, comment: "Excellent service", tag_id: testTag.id },
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 3, comment: "Average experience", tag_id: testTag.id }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTag(testTag);
                }
                testDoctorId = testDoctor.id;
            });
            it("expect return reviews for a given clinicId, when they exists", async () => {
                const response = await request(app)
                    .get(`/api/doctors/${testDoctorId}/reviews`)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("reviews").that.is.not.empty;
                expect(response.body.reviews[0]).to.have.property("rating");
                expect(response.body.reviews[0].patient).to.have.property("user");
                expect(response.body.reviews[0]).to.have.property("tags");
            });
        });
        describe("GET /api/clinics/:clinicId/reviews", () => {
            let testClinicId;
            beforeEach(async () => {
                const testClinic = await db.Clinics.create({ name: faker.company.buzzAdjective(), password: faker.internet.password(), nip: 1234567890, nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence() });
                await testDoctor.update({ clinic_id: testClinic.id });
                const existingReviews = [
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 4, comment: "Good doctor" },
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 5, comment: "Excellent service" },
                    { patient_id: testPatient.id, status: 'approved', doctor_id: testDoctor.id, rating: 3, comment: "Average experience" }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTags(testTag);
                }
                testClinicId = testClinic.id;
            });
            it("expect return reviews sorted by rating in descending order for a given clinicId, when the query has sortRating = 'DESC'", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${testClinicId}/reviews`)
                    .query({ sortDate: 'asc', sortRating: 'desc', limit: 10, pages: 0 })
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("reviews").that.is.not.empty;
                expect(response.body.reviews[0]).to.have.property("rating");
                expect(response.body.reviews[0]).to.have.property("doctor");
                expect(response.body.reviews[0].rating).to.be.greaterThan(response.body.reviews[1].rating);
                expect(response.body.reviews[0].doctor).to.have.property("user");
                expect(response.body.reviews[0].patient).to.have.property("user");
                expect(response.body.reviews[0]).to.have.property("tags");
            });
            it("expect return reviews sorted by rating in ascending order for a given clinicId, when the query has not sortRating", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${testClinicId}/reviews`)
                    .query({ sortDate: 'ASC', limit: 10, pages: 0 })
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("reviews").that.is.not.empty;
                expect(response.body.reviews[0]).to.have.property("rating");
                expect(response.body.reviews[0]).to.have.property("doctor");
                expect(response.body.reviews[0].rating).to.be.lessThan(response.body.reviews[1].rating);
                expect(response.body.reviews[0].doctor).to.have.property("user");
                expect(response.body.reviews[0].patient).to.have.property("user");
                expect(response.body.reviews[0]).to.have.property("tags");
            });
        });
        describe("GET /api/admins/reviews", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
            it("expect to create review and to set a rating for the doctor, when data is valid", async () => {
                const existingReviews = [
                    { patient_id: patientId, status: 'pending', doctor_id: testDoctor.id, rating: 4, comment: "Good doctor" },
                    { patient_id: patientId, status: 'pending', doctor_id: testDoctor.id, rating: 5, comment: "Excellent service" },
                    { patient_id: patientId, status: 'pending', doctor_id: testDoctor.id, rating: 3, comment: "Average experience" }
                ];
                const testReviews = await db.Reviews.bulkCreate(existingReviews);
                for (const review of testReviews) {
                    await review.addTag(testTag);
                }

                const response = await request(app)
                    .get("/api/admins/reviews")
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("reviews").that.is.not.empty;
                expect(response.body.reviews[0]).to.have.property("rating");
                expect(response.body.reviews[0]).to.have.property("doctor");
                expect(response.body.reviews[0]).to.have.property("patient");
                expect(response.body.reviews[0]).to.have.property("tags");
            });
        });
        describe("DELETE /api/admins/reviews/:id", () => {
            let sessionCookies, patientId;
            beforeEach(async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "admin",
                };
                const createdUser = await db.Users.create(fakeUser);
                const createdPatient = await testPatient.update({ user_id: createdUser.id });

                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);

                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                patientId = createdPatient.id;
            });
            it("expect delete review by id, when it exists", async () => {
                const testReview = await db.Reviews.create({
                    patient_id: testPatient.id,
                    doctor_id: testDoctor.id,
                    rating: faker.number.int({ min: 1, max: 5 }),
                    comment: faker.lorem.paragraph(),
                    tagsIds: [testTag.id],
                });

                await request(app)
                    .delete(`/api/admins/reviews/${testReview.id}`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                const reviewInDb = await db.Reviews.findByPk(testReview.id);
                expect(reviewInDb).to.be.null;
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/reviews", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .post("/api/reviews")
                    .send({})
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user isn't patient", async () => {
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

                const response = await request(app)
                    .post("/api/reviews")
                    .send({})
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Doctor not found'), when data is valid", async () => {
                const fakeUser = {
                    email: faker.internet.email(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    role: "patient",
                };
                const createdUser = await db.Users.create(fakeUser);
                await testPatient.update({ user_id: createdUser.id });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: fakeUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
                const reviewData = {
                    patientId: testPatient.id,
                    doctorId: testDoctor.id + 1,
                    rating: 2
                };

                const response = await request(app)
                    .post("/api/reviews")
                    .send(reviewData)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
        describe("GET /api/admins/reviews", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .get("/api/admins/reviews")
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
                    .get("/api/admins/reviews")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("DELETE /api/admins/reviews/:id", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .delete("/api/admins/reviews/1")
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
                    .delete("/api/admins/reviews/1")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
    });
});