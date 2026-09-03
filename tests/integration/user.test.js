require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");
const bcrypt = require("bcrypt");

describe("User routes", () => {
    let fakeUserData, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(() => {
        fakeUserData = {
            first_name: faker.person.firstName(),
            email: faker.internet.email(),
            pesel: 12345678901,
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "patient",
        }
    });
    afterEach(async () => {
        await db.Users.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("GET /api/users/account", () => {
            it("expect to return user data, when user is not clinic", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get("/api/users/account")
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("id", testUser.id);
                expect(response.body).to.have.property("first_name");
                expect(response.body).to.have.property("address");
                expect(response.body).to.not.have.property("password");
            });
            it("expect to return clinic data, when user is clinic", async () => {
                const testClinic = await db.Clinics.create({
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .get("/api/users/account")
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("id", testClinic.id);
                expect(response.body).to.have.property("name");
                expect(response.body).to.have.property("timetables");
                expect(response.body).to.have.property("address");
                expect(response.body).to.not.have.property("password");
                await db.Clinics.destroy({ where: {} });
            });
        });
        describe("PUT /api/users", () => {
            it("expect to update user data and return 'User update successfully', when data valid and it exists", async () => {
                const updateData = {
                    userData: {
                        first_name: faker.person.firstName(),
                        last_name: faker.person.firstName(),
                        email: faker.internet.email(),
                        gender: "male",
                        pesel: 12345678900,
                        phone: faker.phone.number(),
                        birthday: faker.date.birthdate(),
                    },
                    addressData: {
                        city: faker.location.city(),
                        province: faker.location.state(),
                        street: faker.location.street(),
                        home: faker.location.buildingNumber(),
                        flat: faker.location.secondaryAddress(),
                        post_index: faker.location.zipCode(),
                    }
                };
                const addressData = {
                    city: faker.location.city(),
                    province: faker.location.state(),
                    street: faker.location.street(),
                    home: faker.location.buildingNumber(),
                    flat: faker.location.secondaryAddress(),
                    post_index: faker.location.zipCode(),
                };
                const testUser = await db.Users.create(fakeUserData);
                await testUser.createAddress(addressData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put(`/api/users`)
                    .send(updateData)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.deep.equals({ message: "User update successfully" });
                const userInDb = await db.Users.findByPk(testUser.id);
                expect(userInDb).to.have.property("first_name", updateData.userData.first_name);
                expect(userInDb).to.have.property("last_name", updateData.userData.last_name);
                expect(userInDb).to.have.property("email", updateData.userData.email);
                expect(userInDb).to.have.property("gender", updateData.userData.gender);
                expect(userInDb).to.have.property("pesel", updateData.userData.pesel.toString());
                expect(userInDb).to.have.property("phone", updateData.userData.phone);
                expect(userInDb.birthday).to.deep.equal(updateData.userData.birthday);
                const addressInDb = await userInDb.getAddress();
                expect(addressInDb).to.have.property("city", updateData.addressData.city);
                expect(addressInDb).to.have.property("province", updateData.addressData.province);
                expect(addressInDb).to.have.property("street", updateData.addressData.street);
                expect(addressInDb).to.have.property("home", updateData.addressData.home);
                expect(addressInDb).to.have.property("flat", updateData.addressData.flat);
                expect(addressInDb).to.have.property("post_index", updateData.addressData.post_index);
                await db.Addresses.destroy({ where: {} });
            });
        });
        describe("PATCH /api/users/password", () => {
            it("expect to update user password and return 'Password changed successfully', when data valid and it exists", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const newPassword = faker.internet.password();

                const response = await request(app)
                    .patch(`/api/users/password`)
                    .send({ oldPassword: "123456789", newPassword })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.deep.equals({ message: "Password changed successfully" });
                const userInDb = await db.Users.findByPk(testUser.id);
                expect(bcrypt.compareSync(newPassword, userInDb.password)).to.be.true;
            });
            it("expect to update clinic password and return 'Password changed successfully', when data valid and it exists", async () => {
                const testClinic = await db.Clinics.create({
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const newPassword = faker.internet.password();

                const response = await request(app)
                    .patch(`/api/users/password`)
                    .send({ oldPassword: "123456789", newPassword })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.deep.equals({ message: "Password changed successfully" });
                const userInDb = await db.Clinics.findByPk(testClinic.id);
                expect(bcrypt.compareSync(newPassword, userInDb.password)).to.be.true;
                await db.Clinics.destroy({ where: {} });
            });
        });
        describe("DELETE /api/user", () => {
            it("expect delete user, when it exists", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete(`/api/users`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "User deleted successfully");
                const userInDb = await db.Users.findByPk(testUser.id);
                expect(userInDb).to.be.null;
            });
            it("expect delete clinic, when it exists", async () => {
                const testClinic = await db.Clinics.create({
                    name: faker.company.buzzAdjective(),
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                    nip: 1234567890,
                    nr_license: faker.vehicle.vin(),
                    email: faker.internet.email(),
                    phone: faker.phone.number({ style: 'international' }),
                });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .delete(`/api/users`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "User deleted successfully");
                const userInDb = await db.Clinics.findByPk(testClinic.id);
                expect(userInDb).to.be.null;
                await db.Clinics.destroy({ where: {} });
            });
        });
    })
    describe("Negative tests", () => {
        describe("GET /api/users/account", () => {
            it("expect AppError('Unauthorized user'), when user is unauthorized", async () => {
                const response = await request(app)
                    .get("/api/users/account")
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
        });
        describe("PATCH /api/users/password", () => {
            it("expect to return message: 'Unauthorized user', when user don't unauthorized", async () => {
                const response = await request(app)
                    .patch(`/api/users/password`)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Old password is required'), when oldPassword is not provided", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .patch(`/api/users/password`)
                    .send()
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Old password is required");
            });
            it("expect AppError('New password is required'), when newPassword is not provided", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .patch(`/api/users/password`)
                    .send({ oldPassword: "123456789" })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "New password is required");
            });
            it("expect AppError('Password Error'), when old password and new password are the same", async () => {
                const testUser = await db.Users.create(fakeUserData);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUser.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const newPassword = "123456789";

                const response = await request(app)
                    .patch(`/api/users/password`)
                    .send({ oldPassword: "12345678", newPassword })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "Password Error");
            });
        });
        describe("DELETE /api/user", () => {
            it("expect to return message: 'Unauthorized user', when user don't unauthorized", async () => {
                const response = await request(app)
                    .delete(`/api/users`)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
        });
    })
});