require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const ClinicService = require("../../../src/services/clinicService");
const AddressService = require("../../../src/services/addressService");
const TimetableService = require("../../../src/services/timetableService");

use(chaiAsPromised);

describe("Clinic Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("clinicCreate", () => {
            let transactionStub, findAllClinicStub, createAddressStub, createClinicStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findAllClinicStub = sinon.stub(db.Clinics, "findAll").resolves([]);
                createClinicStub = sinon.stub(db.Clinics, "create");
                createAddressStub = sinon.stub();
                hashPasswordStub = sinon.stub().resolves("hashedPassword");
                createJWTStub = sinon.stub().returns("token");
                setPasswordMailStub = sinon.stub().resolves();
                createTimetableStub = sinon.stub(TimetableService, "createTimetable").resolves();
                createClinicStub.resolves({
                    id: 1,
                    role: "CLINIC",
                    createAddress: createAddressStub,
                    update: sinon.stub().resolves(),
                    email: "test@test.com"
                });
            });
            it("expect a clinic to be created, when required data is valid", async () => {
                const clinic = {
                    name: "Test Clinic",
                    email: "test@clinic.com",
                    password: "password123",
                    nip: "1234567890",
                    nr_license: "LICENSE123"
                };
                const address = {
                    city: "Test City",
                    street: "Test St",
                    province: "Test Province",
                    home: 1
                };

                await ClinicService.createClinic(clinic, address);

                expect(findAllClinicStub.calledOnce).to.be.true;
                expect(createClinicStub.calledOnce).to.be.true;
                expect(createAddressStub.calledOnce).to.be.true;
                expect(createTimetableStub.calledOnce).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.called).to.be.false;
            });
        });
        describe("getClinicById", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
            })
            it("expect return clinics by id, when it exists in the database", async () => {
                const clinic = { id: 1, name: "House" };
                findByPkStub.resolves(clinic);

                const result = await ClinicService.getClinicById(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(result).to.deep.equal(clinic);
            });
        });
        describe("getFullClinicById", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Clinics, "findOne");
            });
            it("expect to return full clinic data, when it exists in the database", async () => {
                const clinicId = 1;
                const clinic = { name: "foo", address: { city: "foo" } };
                findOneStub.resolves(clinic);

                const result = await ClinicService.getFullClinicById(clinicId);

                expect(findOneStub.calledOnce).to.be.true;
                expect(result.name).to.deep.equal(clinic.name);
                expect(result.address).to.deep.equal(clinic.address);
            });
        });
        describe("updateClinic", () => {
            let updateClinicsStub, transactionStub, findByPkClinicStub, getAddressesStub, updateAddressStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkClinicStub = sinon.stub(db.Clinics, "findByPk");
                updateClinicsStub = sinon.stub();
                getAddressesStub = sinon.stub();
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });
            it("expect to return the updated clinic, when data is valid", async () => {
                const clinicId = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                findByPkClinicStub.resolves({ update: updateClinicsStub, getAddress: getAddressesStub, reload: sinon.stub() });
                updateClinicsStub.resolves();
                updateAddressStub.resolves();

                await ClinicService.updateClinic(clinicId, newClinic, addressData);

                expect(sequelize.transaction.calledOnce).to.be.true;
                expect(updateClinicsStub.calledOnceWith(newClinic, { transaction: transactionStub })).to.be.true;
                expect(getAddressesStub.calledOnce).to.be.true;
                expect(updateAddressStub.calledOnceWith(sinon.match.any, addressData, transactionStub)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
            });
        });
        describe("deleteClinicById", () => {
            let destroyStub;

            beforeEach(async () => {
                destroyClinicStub = sinon.stub(db.Clinics, "destroy");
            });
            it("expect to destroy clinic, when it exists in the database", async () => {
                destroyClinicStub.resolves(true);

                await ClinicService.deleteClinicById(1);

                expect(destroyClinicStub.calledOnce).to.be.true;
            })
        })
    });
    describe("Negative tests", () => {
        describe("clinicCreate", () => {
            let transactionStub, createClinicStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findAllClinicStub = sinon.stub(db.Clinics, "findAll").resolves([]);
                createClinicStub = sinon.stub(db.Clinics, "create");
            });

            it("expect AppError('Clinic already exist') and rollback transaction, when Clinic creation fails", async () => {
                findAllClinicStub.resolves([{ id: 1 }]);

                const clinic = {
                    name: "Test Clinic",
                    email: "existing@clinic.com"
                };
                const address = {};

                await expect(ClinicService.createClinic(clinic, address))
                    .to.be.rejectedWith("Clinic already exist");

                expect(createClinicStub.called).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("getClinicById", () => {
            let findByPkStub;
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Clinics, "findByPk");
            })
            it("expect to throw an error('Clinic not found'), when clinic doesn't exist in the database", async () => {
                findByPkStub.resolves(false);

                await expect(ClinicService.getClinicById(1)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
            it("expect to throw an error('Clinic error'), when error on database", async () => {
                findByPkStub.rejects(new Error("Clinic error"));

                await expect(ClinicService.getClinicById(1)).to.be.rejectedWith(Error, "Clinic error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
            });
        });
        describe("getFullClinicById", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Clinics, "findOne");
            });
            it("expend expect to throw an error('Clinic error'), when error on database", async () => {
                const clinicId = 1;
                const error = new Error("Clinic error");
                findOneStub.rejects(error);

                await expect(ClinicService.getFullClinicById(clinicId)).to.be.rejectedWith(error);

                expect(findOneStub.calledOnce).to.be.true;
            });
            it("expend expect to throw an error('Clinic not found'), when clinic doesn't exist in the database", async () => {
                const clinicId = 1;
                findOneStub.resolves(false);

                await expect(ClinicService.getFullClinicById(clinicId)).to.be.rejectedWith(Error, "Clinic not found");

                expect(findOneStub.calledOnce).to.be.true;
            });
        });
        describe("getAllClinicsFullData", () => {
            let findAllStub;

            beforeEach(async () => {
                findAllStub = sinon.stub(db.Clinics, "findAll");
            });
            it("should handle database errors correctly", async () => {
                const dbError = new Error("Database connection error");
                findAllStub.rejects(dbError);

                try {
                    await ClinicService.getAllClinicsFullData({});
                    expect.fail("Should have thrown an error");
                } catch (error) {
                    expect(error).to.equal(dbError);
                }
            });
        });
        describe("updateClinic", () => {
            let updateClinicsStub, transactionStub, findByPkClinicStub, getAddressesStub, updateAddressStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findByPkClinicStub = sinon.stub(db.Clinics, "findByPk");
                updateClinicsStub = sinon.stub();
                getAddressesStub = sinon.stub();
                updateAddressStub = sinon.stub(AddressService, "updateAddress");
            });
            it("expend expect to throw an error('Error update'), when error on db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                const error = new Error("Error update");
                findByPkClinicStub.resolves({ update: updateClinicsStub });
                updateClinicsStub.rejects(error);

                await expect(ClinicService.updateClinic(id, newClinic, addressData)).to.be.rejectedWith(Error, "Error update");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.true;
                expect(updateAddressStub.calledOnce).to.be.false;
            });
            it("expend expect to throw an error('Address error'), when error on db", async () => {
                const id = 1;
                const newClinic = { name: "Updated Clinic" };
                const addressData = { city: "foo", street: "foo", home: 2, flat: 1, post_index: "123-1234" };
                const error = new Error("Address error");
                findByPkClinicStub.resolves({ update: updateClinicsStub, getAddress: getAddressesStub });
                updateClinicsStub.resolves();
                updateAddressStub.throws(error);

                await expect(ClinicService.updateClinic(id, newClinic, addressData)).to.be.rejectedWith(Error, "Address error");

                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
                expect(updateClinicsStub.called).to.be.true;
                expect(updateAddressStub.calledOnce).to.be.true;
            });
        });
    });
});