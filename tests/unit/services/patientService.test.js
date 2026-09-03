require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const rewire = require('rewire');
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { faker } = require('@faker-js/faker');
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const UserService = require("../../../src/services/userService");
const PatientService = rewire("../../../src/services/patientService");
const AddressService = require("../../../src/services/addressService");
const AppError = require("../../../src/utils/appError");

use(chaiAsPromised);

describe("Patient Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createPatient", () => {
            let transactionStub, createPatientStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub().resolves(),
                    rollback: sinon.stub().resolves()
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserStub = sinon.stub(db.Users, "create");
                PatientService.__set__('createUser', createUserStub);
                createPatientStub = sinon.stub();
            });
            it("expect user and patient to be created with transaction and return user data, when valid data", async () => {
                const userData = { email: faker.internet.email(), password: faker.internet.password() };
                const newUser = { id: 1, email: faker.internet.email() };
                createUserStub.resolves({ newUser, createPatient: createPatientStub });
                createPatientStub.resolves({ id: 1, user_id: 1 });

                const result = await PatientService.createPatient(userData);

                expect(createUserStub.calledOnce).to.be.true;
                expect(createPatientStub.calledOnce).to.be.true;
                expect(result.newUser).to.deep.equals(newUser);
                expect(transactionStub.commit.calledOnce).to.be.true;
            });
        });
        describe("getPatientByParam", () => {
            let findAndCountAllStub;

            beforeEach(() => {
                findAndCountAllStub = sinon.stub(db.Appointments, "findAndCountAll");
            });
            it("expect correctly apply 'sort':asc parameter for ascending order", async () => {
                const fakeAppointments = [
                    { id: 1, createdAt: new Date("2023-01-01") },
                    { id: 2, createdAt: new Date("2023-01-02") }
                ];
                findAndCountAllStub.resolves({ rows: fakeAppointments, count: 2 });

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 1,
                    pages: 0,
                    user: {
                        id: 1,
                        role: 'doctor',
                        roleId: 1,
                    }
                });

                expect(findAndCountAllStub.calledOnce).to.be.true;
                expect(result).to.have.property("pages", 2);
            });
            it('expect to return patients filtered by clinicId, when only clinicId is provided', async () => {
                const fakeAppointments = [
                    { id: 1, createdAt: new Date("2023-01-01") },
                    { id: 2, createdAt: new Date("2023-01-02") }
                ];
                findAndCountAllStub.resolves({ rows: fakeAppointments, count: 2 });

                const result = await PatientService.getPatientsByParam({
                    sort: 'asc',
                    limit: 1,
                    pages: 0,
                    user: {
                        id: 1,
                        role: 'clinic',
                    }
                });

                expect(findAndCountAllStub.calledOnce).to.be.true;
                expect(result).to.have.property("pages", 2);
            });
        });
        describe("getPatientById", () => {
            it("expect return the correct patient data, when a valid patientId and user role is a 'doctor'", async () => {
                const userId = 1;
                const fakePatient = {
                    id: 1,
                    user: {
                        id: userId,
                        first_name: 'John',
                        last_name: 'Doe',
                        address: {
                            city: 'Test City',
                            street: 'Test Street'
                        }
                    }
                };
                const findOneStub = sinon.stub(db.Appointments, "findOne").resolves(fakePatient);

                const result = await PatientService.getPatientById(1, { id: 1, role: "doctor", roleId: 2 });

                expect(findOneStub.calledOnce).to.be.true;
                expect(result).to.deep.equal(fakePatient);
            });
        });
    });
    describe("Negative tests", () => {
        describe("createPatient", () => {
            let transactionStub, createUserStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createUserStub = sinon.stub(db.Users, "create");
            });
            it("expect Error('Need to enter the email'), when email don't enter", async () => {
                const userData = { password: "testPassword" };

                await expect(PatientService.createPatient(userData)).to.be.rejectedWith(AppError, "Need to enter the email");

                expect(transactionStub.commit.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("getPatientByParam", () => {
            let findAllStub;

            beforeEach(() => {
                findAllStub = sinon.stub(db.Appointments, "findAll");
            });
            it("expect throw an error 'Either doctorId or clinicId is required', when neither doctorId nor clinicId is provided", async () => {
                const params = { sort: 'asc', limit: 10, pages: 0, user: { id: 1, role: "patient" } };

                await expect(PatientService.getPatientsByParam(params))
                    .to.be.rejectedWith(AppError, "Either doctorId or clinicId is required");
            });
            it("expect throw any unexpected errors that occur during the database query", async () => {
                const error = new Error("Database connection error");
                findAllStub.rejects(error);

                const params = {
                    sort: 'asc',
                    limit: 10,
                    pages: 0,
                    user: { id: 1, role: "clinic" }
                };

                await expect(PatientService.getPatientsByParam(params)).to.be.rejectedWith(Error, "Database connection error");

                expect(findAllStub.calledOnce).to.be.true;
            });
        });
        describe("getPatientById", () => {
            let findOneStub;
            beforeEach(() => {
                findOneStub = sinon.stub(db.Appointments, "findOne").resolves(null);
            });
            it("expect throw an AppError('Patient not found'), with status 404 when patient is not found ", async () => {
                findOneStub.resolves(null);

                await expect(PatientService.getPatientById(1, { id: 1, role: "patient" })).to.be.rejectedWith(AppError, "Patient not found");

                expect(findOneStub.calledOnce).to.be.true;
            });
            it("expect throw an AppError('Database query failed') by the database query ", async () => {
                const error = new Error("Database query failed");
                findOneStub.rejects(error);

                await expect(PatientService.getPatientById(1, { id: 1, role: "patient" })).to.be.rejectedWith(Error, "Database query failed");

                expect(findOneStub.calledOnce).to.be.true;
            });
        });
    });
});