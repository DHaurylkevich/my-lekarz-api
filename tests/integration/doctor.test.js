process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Doctor routes", () => {
    let fakeDoctor, fakeClinic, fakeUser, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        await server.close();
    });

    beforeEach(async () => {
        fakeDoctor = {
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph()
        };
        fakeClinic = {
            name: faker.company.buzzAdjective(), password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda", nip: 1234567890, nr_license: faker.vehicle.vin(), email: faker.internet.email(), phone: faker.phone.number({ style: 'international' }), description: faker.lorem.sentence()
        };
        fakeUser = {
            email: faker.internet.email(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: "patient",
        };
    });
    afterEach(async () => {
        await db.Clinics.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Addresses.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
    });

    describe("Positive tests", () => {
        describe("POST /clinics/doctors", () => {
            let fakeAddress;
            beforeEach(async () => {
                fakeAddress = { city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() };
            });
            it("expect to create doctor with specialty, when clinicData and addressData is valid", async () => {
                const clinic = await db.Clinics.create(fakeClinic);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: clinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                const specialtyId = specialtiesInDb.id;
                const servicesInDb = await db.Services.bulkCreate([{ name: "Cut hand", price: 10.10, }, { name: "Say less you", price: 10.10, }]);
                const servicesIds = servicesInDb.map(serviceId => serviceId.id);

                const response = await request(app)
                    .post(`/api/clinics/doctors/`)
                    .send({ userData: fakeUser, addressData: fakeAddress, doctorData: fakeDoctor, specialtyId, servicesIds })
                    .set('Cookie', sessionCookies)
                    .expect(201);

                expect(response.body).to.have.property("message", "The link for password configuration has been sent to mail");
                const doctorInDb = await db.Doctors.findOne({ email: fakeUser.email }, {
                    include: [
                        {
                            model: db.Specialties, as: 'specialty'
                        },
                        {
                            model: db.DoctorService, as: 'services'
                        },
                        {
                            model: db.Users, as: 'user',
                            include: [
                                {
                                    model: db.Addresses, as: "address"
                                }
                            ]
                        }
                    ]
                });
                expect(doctorInDb).to.exist;
                expect(doctorInDb.specialty_id).to.equals(specialtyId);
            });
        });
        describe("GET /api/doctors/:doctorId/short", () => {
            it("expect to return a doctor by id when it exists", async () => {
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                fakeDoctor.specialty_id = specialtiesInDb.id
                const createdDoctor = await db.Doctors.create(fakeDoctor);

                const response = await request(app)
                    .get(`/api/doctors/${createdDoctor.id}/short`)
                    .expect(200);

                expect(response.body).to.have.property("id", createdDoctor.id);
                expect(response.body.firstName).to.equal(createdDoctor.firstName);
                expect(response.body.lastName).to.equal(createdDoctor.lastName);
                expect(response.body.description).to.equal(createdDoctor.description);
                expect(response.body).to.have.property("specialty");
            });
        });
        describe("GET /api/doctors/:doctorId", () => {
            it("expect to return a doctor by id when it exists", async () => {
                const specialtiesInDb = await db.Specialties.create({ name: "Cardiology" });
                fakeDoctor.specialty_id = specialtiesInDb.id
                const createdDoctor = await db.Doctors.create(fakeDoctor);

                const response = await request(app)
                    .get(`/api/doctors/${createdDoctor.id}`)
                    .expect(200);

                expect(response.body).to.have.property("id", createdDoctor.id);
                expect(response.body.description).to.equal(createdDoctor.description);
                expect(response.body).to.have.property("user");
                expect(response.body).to.have.property("specialty");
            });
        });
        describe("GET /api/admins/doctors", () => {
            let fakeMaleUser, fakeFemaleUser;
            beforeEach(async () => {
                fakeMaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "male",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeMaleUser);
                await createdUser.createDoctor();
                fakeFemaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "female",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeFemaleUser);
                await createdUser.createDoctor();
            });
            it("expect to return doctors from admin, when it exists", async () => {
                fakeUser.role = "admin";
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
                    .get(`/api/admins/doctors`)
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(2);
            });
            it("expect to return patients for admin with 'male' filter, when they exist", async () => {
                fakeUser.role = "admin";
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
                    .get(`/api/admins/doctors`)
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "male"
                    })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(1);
                expect(response.body.doctors[0].user).to.have.property("first_name", fakeMaleUser.first_name);
            });
            it("expect to return patients for admin with 'female' filter, when they exist", async () => {
                fakeUser.role = "admin";
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
                    .get(`/api/admins/doctors`)
                    .set('Cookie', sessionCookies)
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "female"
                    })
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(1);
                expect(response.body.doctors[0].user).to.have.property("first_name", fakeFemaleUser.first_name);
            });
        });
        describe("PUT /api/clinics/doctors/:doctorId", () => {
            let createClinic, specialties, createdDoctor, service;
            beforeEach(async () => {
                createClinic = await db.Clinics.create(fakeClinic);
                specialties = await db.Specialties.bulkCreate([{ name: "Cardiology" }, { name: "Paper" }]);
                const createdUser = await db.Users.create(fakeUser);
                const createdAddress = await db.Addresses.create({ city: faker.location.city(), province: faker.location.state(), street: faker.location.street(), home: faker.location.buildingNumber(), flat: faker.location.buildingNumber(), post_index: faker.location.zipCode() });
                await createdUser.setAddress(createdAddress);
                fakeDoctor.clinic_id = createClinic.id;
                fakeDoctor.specialty_id = specialties[0].id;
                createdDoctor = await createdUser.createDoctor(fakeDoctor);
                service = await db.Services.bulkCreate([{ specialty_id: specialties[0].id, name: "Cut hand", price: 10.10 }, { specialty_id: specialties[1].id, name: "Cut", price: 10.10 }]);
                await createdDoctor.setServices([service[1].id]);
            })
            it("expect to update doctor, when data valid and it exists", async () => {
                fakeUser.first_name = "test";
                fakeDoctor.specialty_id = specialties[1].id;
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: createClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .put(`/api/clinics/doctors/${createdDoctor.id}`)
                    .send({ userData: fakeUser, doctorData: fakeDoctor, servicesIds: [service[0].id, service[1].id] })
                    .set('Cookie', sessionCookies)
                    .expect(200);

                expect(response.body.name).to.equal(fakeUser.name);
                const doctorInDb = await db.Doctors.findByPk(createdDoctor.id, {
                    include: [
                        {
                            model: db.Specialties, as: "specialty"
                        },
                        {
                            model: db.Services, as: "services"
                        },
                        {
                            model: db.Users, as: "user",
                            include: [
                                {
                                    model: db.Addresses, as: "address"
                                },
                            ]
                        }
                    ]
                });
                expect(doctorInDb.user.first_name).to.equal(fakeUser.first_name);
                expect(doctorInDb.specialty.name).to.equal(specialties[1].name);
                expect(doctorInDb.services[1].name).to.equal("Cut");
                expect(doctorInDb.services[0].name).to.equal("Cut hand");
            });
        });
        describe("GET /clinics/:clinicId/doctors", () => {
            let createdClinic, fakeMaleUser, fakeFemaleUser, specialties;
            beforeEach(async () => {
                specialties = await db.Specialties.bulkCreate([{ name: "Cardiology" }, { name: "Paper" }]);
                createdClinic = await db.Clinics.create(fakeClinic);
                fakeMaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "male",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeMaleUser);
                await createdUser.createDoctor({ clinic_id: createdClinic.id, specialty_id: specialties[0].id });
                fakeFemaleUser = {
                    first_name: faker.person.firstName(),
                    gender: "female",
                    password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
                };
                createdUser = await db.Users.create(fakeFemaleUser);
                await createdUser.createDoctor({ clinic_id: createdClinic.id, specialty_id: specialties[0].id });
            });
            it("should return a doctors by clinicId, when it exists", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${createdClinic.id}/doctors`)
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                    })
                    .expect(200);
                console.log(response.body);
                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(2);
            });
            it("expect to return patients for admin with 'male' filter, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${createdClinic.id}/doctors`)
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "male"
                    })
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(1);
                expect(response.body.doctors[0].user).to.have.property("first_name", fakeMaleUser.first_name);
            });
            it("expect to return patients for admin with 'female' filter, when they exist", async () => {
                const response = await request(app)
                    .get(`/api/clinics/${createdClinic.id}/doctors`)
                    .query({
                        sort: 'asc',
                        limit: 10,
                        pages: 0,
                        gender: "female"
                    })
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("doctors").to.be.an("array").is.length(1);
                expect(response.body.doctors[0].user).to.have.property("first_name", fakeFemaleUser.first_name);
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /clinics/:clinicId/doctors", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .post(`/api/clinics/doctors`)
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not a doctor or clinic", async () => {
                fakeUser.role = "admin";
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
                    .post(`/api/clinics/doctors/`)
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
            it("expect AppError('User already exist'), when user exists", async () => {
                const clinic = await db.Clinics.create(fakeClinic);
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: clinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie'];
                const createdUser = await db.Users.create(fakeUser);
                await createdUser.createDoctor(fakeDoctor);

                const response = await request(app)
                    .post(`/api/clinics/doctors`)
                    .send({ userData: fakeUser })
                    .set('Cookie', sessionCookies)
                    .expect(400);

                expect(response.body).to.have.property("message", "User already exist");
            });
        });
        describe("GET /api/doctors/:doctorId/short", () => {
            it("expect AppError('Doctor not found'), when it doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/1/short")
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
        describe("GET /api/doctors/:doctorId", () => {
            it("expect AppError('Doctor not found'), when it doesn't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/1")
                    .expect(404);

                expect(response.body).to.have.property("message", "Doctor not found");
            });
        });
        describe("GET /api/admins/doctors", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .get("/api/admins/doctors")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not admin", async () => {
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
                    .get("/api/admins/doctors")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
        describe("PUT /api/clinics/doctors/:doctorId", () => {
            it("expect return 401 'Unauthorized user' when authentication is missing", async () => {
                const response = await request(app)
                    .put("/api/clinics/doctors/1")
                    .expect(401);

                expect(response.body).to.have.property('message', 'Unauthorized user');
            });
            it("expect return 403 'Access denied', when user is not a doctor or clinic", async () => {
                fakeUser.role = "admin";
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
                    .put("/api/clinics/doctors/1")
                    .set('Cookie', sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property('message', 'Access denied');
            });
        });
    });
});