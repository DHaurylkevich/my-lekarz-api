require("dotenv").config();
process.env.NODE_ENV = 'test';

const { expect } = require("chai");
const request = require("supertest");
const { faker } = require('@faker-js/faker');
const app = require("../../index");
const db = require("../../src/models");

describe("Appointment routes", () => {
    let testUserDoctor, testUserPatient, testPatient, testDoctor, testClinic, testService, testSpecialty, testDoctorService, testSchedule, server;

    before(async () => {
        server = app.listen(0);
        await db.sequelize.sync({ force: true });
    });
    after(async () => {
        if (server) {
            await server.close();
        }
    });

    beforeEach(async () => {
        testUserPatient = await createTestUser();
        testUserDoctor = await createTestUser("doctor");
        testPatient = await db.Patients.create({ user_id: testUserPatient.id, gender: "male", market_inf: false });
        testClinic = await createTestClinic();
        testSpecialty = await db.Specialties.create({ name: "Cardiology" });
        testService = await db.Services.create({ name: "cut", price: 10, specialty_id: testSpecialty.id, clinic_id: testClinic.id });
        testDoctor = await createTestDoctor(testClinic.id, testSpecialty.id, testUserDoctor.id);
        testSchedule = await db.Schedules.create({
            doctor_id: testDoctor.id,
            clinic_id: testClinic.id,
            date: '2024-11-10',
            start_time: '09:00',
            end_time: '12:00',
            interval: 30,
        });
        testDoctorService = await db.DoctorService.create({ doctor_id: testDoctor.id, service_id: testService.id });
    });
    afterEach(async () => {
        await db.Appointments.destroy({ where: {} });
        await db.DoctorService.destroy({ where: {} });
        await db.Doctors.destroy({ where: {} });
        await db.Patients.destroy({ where: {} });
        await db.Users.destroy({ where: {} });
        await db.Clinics.destroy({ where: {} });
        await db.Services.destroy({ where: {} });
        await db.Specialties.destroy({ where: {} });
        await db.Schedules.destroy({ where: {} });
    });
    const createTestUser = async (role = 'patient') => {
        return await db.Users.create({
            email: faker.internet.email(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            role: role,
        });
    };

    const createTestClinic = async () => {
        return await db.Clinics.create({
            name: faker.company.buzzAdjective(),
            password: "$2b$10$mKW8hzfNFClcabpB8AzTRun9uGdEuEpjMMSwdSgNjFaLykWFtIAda",
            nip: 1234567890,
            nr_license: faker.vehicle.vin(),
            email: faker.internet.email(),
            phone: faker.phone.number({ style: 'international' }),
            description: faker.lorem.sentence()

        });
    };

    const createTestDoctor = async (clinicId, specialtyId, userId) => {
        return await db.Doctors.create({
            user_id: userId,
            rating: faker.number.float({ min: 1, max: 5 }),
            hired_at: faker.date.past(),
            description: faker.lorem.paragraph(),
            clinic_id: clinicId,
            specialty_id: specialtyId,
        });
    };
    describe("Positive tests", () => {
        describe("GET /api/clinics/appointments/", () => {
            it("expect appointments by doctorId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie']

                const response = await request(app)
                    .get(`/api/clinics/appointments`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body.appointments[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body.appointments[0]).to.have.property("doctor");
                expect(response.body.appointments[0]).to.have.property("patient");
                expect(response.body.appointments[0]).to.have.property("specialty");
            });
        });
        describe("GET /api/doctor/appointments/", () => {
            let sessionCookies;
            beforeEach(async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUserDoctor.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie']
            });
            it("expect appointments without filters by doctorId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/doctors/appointments`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body.appointments[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
            });
            it("expect empty array, when set a different status filter ", async () => {
                await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/doctors/appointments?status=completed`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
            });
            it("expect to get empty array by doctorId, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/doctors/appointments")
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("appointments").that.is.empty;
            });
        });
        describe("GET /api/patients/appointments/", () => {
            let sessionCookies;
            beforeEach(async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUserPatient.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie']
            });
            it("expect appointments with data filter by patientId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/patients/appointments?startDate=${testSchedule.date}&endData=${testSchedule.date}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body.appointments[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body.appointments[0]).to.have.property("doctor");
            });
            it("expect appointments without filters by patientId, when they exist", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .get(`/api/patients/appointments`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body.appointments[0]).to.have.property("start_time", testAppointment.time_slot.slice(0, -3));
                expect(response.body.appointments[0]).to.have.property("doctor");
            });
            it("expect empty array by patientId, when they don't exist", async () => {
                const response = await request(app)
                    .get("/api/patients/appointments")
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("pages");
                expect(response.body).to.have.property("appointments").that.is.empty;
            });
        });
        describe("DELETE /api/patients/appointments/", () => {
            let sessionCookies;
            beforeEach(async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUserPatient.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie']
            });
            it("expect to delete appointments, when it exist and user is a patient", async () => {
                const testAppointment = await db.Appointments.create({
                    clinic_id: testClinic.id,
                    schedule_id: testSchedule.id,
                    patient_id: testPatient.id,
                    doctor_service_id: testDoctorService.id,
                    time_slot: "09:30:00",
                    description: "Help me, pls",
                    first_visit: true,
                    visit_type: "NFZ",
                    status: "active"
                });

                const response = await request(app)
                    .delete(`/api/patients/appointments/${testAppointment.id}`)
                    .set("Cookie", sessionCookies)
                    .expect(200);

                expect(response.body).to.have.property("message", "Appointment deleted successfully");
            });
        });
    });
    describe("Negative tests", () => {
        describe("POST /api/appointments", () => {
            let sessionCookies;
            beforeEach(async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];
            });
            it("expect AppError('Unauthorized user')", async () => {
                const response = await request(app)
                    .post("/api/appointments")
                    .send({})
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user role isn't 'patient'", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testClinic.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                sessionCookies = res.headers['set-cookie'];

                const response = await request(app)
                    .post("/api/appointments")
                    .send()
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
        });
        describe("DELETE /api/patients/appointments/", () => {
            it("expect AppError('Unauthorized user'), when user don't authenticated", async () => {
                const response = await request(app)
                    .delete(`/api/patients/appointments/1`)
                    .expect(401);

                expect(response.body).to.have.property("message", "Unauthorized user");
            });
            it("expect AppError('Access denied'), when user isn't a patient", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUserDoctor.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie']

                const response = await request(app)
                    .delete(`/api/patients/appointments/1`)
                    .set("Cookie", sessionCookies)
                    .expect(403);

                expect(response.body).to.have.property("message", "Access denied");
            });
            it("expect AppError('Appointment not found'), when appointment with this id and patient_id don't exist", async () => {
                const res = await request(app)
                    .post('/login')
                    .send({
                        loginParam: testUserPatient.email,
                        password: "123456789"
                    })
                    .expect(200);
                expect(res.body).to.have.property("user");
                const sessionCookies = res.headers['set-cookie']

                const response = await request(app)
                    .delete(`/api/patients/appointments/1`)
                    .set("Cookie", sessionCookies)
                    .expect(404);

                expect(response.body).to.have.property("message", "Appointment not found");
            });
        });
    });
});