require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const ClinicService = require("../../../src/services/clinicService");
const ClinicController = require("../../../src/controllers/clinicController");

use(chaiAsPromised);

describe("Clinic Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        describe("createClinic() =>:", () => {
            it("expect to create a clinic, when data is valid", async () => {
                const req = { body: { clinicData: "clinic", addressData: "address" } };
                const createClinicServiceStub = sinon.stub(ClinicService, "createClinic").resolves({ id: 1, ...req.body });

                await ClinicController.createClinic(req, res, next);

                expect(createClinicServiceStub.calledOnceWith("clinic", "address")).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({ message: "The link for password configuration has been sent to mail" })).to.be.true;
            });
        });
        describe("createClinic", () => {
            it("expect to created new clinic, when data is valid", async () => {
                const req = { body: { clinicData: "clinic", addressData: "address" } };
                const clinicData = "FOO";
                const createClinicServiceStub = sinon.stub(ClinicService, "createClinic").resolves(clinicData);

                await ClinicController.createClinic(req, res, next);

                expect(createClinicServiceStub.calledOnceWith("clinic", "address")).to.be.true;
                expect(next.calledOnce).to.be.false;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith({ message: "The link for password configuration has been sent to mail" })).to.be.true;
            });
        });
        describe("updateClinicById", () => {
            it("expect to update a clinic associated with the clinic, when data is valid", async () => {
                const req = { user: { id: 1 }, body: { clinicData: "clinic", addressData: "address" } };
                const updateClinicServiceStub = sinon.stub(ClinicService, "updateClinic").resolves({ id: 1, clinicData: "clinicNew", addressData: "addressNew" });

                await ClinicController.updateClinicById(req, res, next);

                expect(updateClinicServiceStub.calledOnceWith(req.user.id, req.body.clinicData, req.body.addressData)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Clinic updated successfully" })).to.be.true;
            });
        });
        describe("getFullClinic", () => {
            it("expect to return a clinic with address, when it exists in the database", async () => {
                const req = { params: { clinicId: 1 } };
                const getFullClinicServiceStub = sinon.stub(ClinicService, "getFullClinicById").resolves({ id: 1, clinicData: "clinicNew", addressData: "addressNew" });

                await ClinicController.getFullClinic(req, res, next);

                expect(getFullClinicServiceStub.calledOnceWith(1)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ id: 1, clinicData: "clinicNew", addressData: "addressNew" })).to.be.true;
            });
        });
        describe("getAllClinicByParams", () => {
            it("expect clinic data, when it is exist", async () => {
                const req = { query: { name: "Test Clinic", province: "Test Province", specialty: "Test Specialty", city: "Test City", limit: 10, page: 10 } };
                const clinicData = "FOO";
                const getAllClinicsFullDataStub = sinon.stub(ClinicService, "getAllClinicsFullData").resolves(clinicData);

                await ClinicController.getAllClinicByParams(req, res, next);

                expect(getAllClinicsFullDataStub.calledOnceWith(req.query)).to.be.true;
                expect(next.calledOnce).to.be.false;
                expect(res.status.calledWith(200)).to.be.true;
                expect(res.json.calledWith(clinicData)).to.be.true;
            });
        })
    });
    describe("Negative test", () => {
        describe("createClinic", () => {
            it("expect error, when service throws error", async () => {
                const req = { body: { clinicData: "clinic", addressData: "address" } };
                const createClinicServiceStub = sinon.stub(ClinicService, "createClinic").rejects(new Error("CreateError"));

                await ClinicController.createClinic(req, res, next);

                expect(createClinicServiceStub.calledOnceWith("clinic", "address")).to.be.true;
                expect(next.calledOnceWith(new Error('CreateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("updateClinicById", () => {
            it("expect error, when service throws error", async () => {
                const req = { user: { id: 1 }, body: { clinicData: "clinic", addressData: "address" } };
                const updateDoctorServiceStub = sinon.stub(ClinicService, "updateClinic").rejects(new Error("CreateError"));

                await ClinicController.updateClinicById(req, res, next);

                expect(updateDoctorServiceStub.calledOnceWith(req.user.id, req.body.clinicData, req.body.addressData)).to.be.true;
                expect(next.calledOnceWith(new Error('UpdateError')));
                expect(res.status.calledOnce).to.be.false;
                expect(res.json.calledOnce).to.be.false;
            });
        });
        describe("getFullClinic", () => {
            it("expect error, when service throws error", async () => {
                const req = { params: { clinicId: 1 } };
                const getFullClinicServiceStub = sinon.stub(ClinicService, "getFullClinicById").rejects(new Error("GetError"));

                await ClinicController.getFullClinic(req, res, next);

                expect(getFullClinicServiceStub.calledOnceWith(req.params.clinicId)).to.be.true;
                expect(next.calledOnceWith(new Error('GetError')));
                expect(res.status.calledOnceWith(200)).to.be.false;
                expect(res.json.calledOnceWith({ id: 1 })).to.be.false;
            });
        });
        describe("getAllClinicByParams", () => {
            it("expect error, when service throws error", async () => {
                const req = { query: { name: "Test Clinic", province: "Test Province", specialty: "Test Specialty", city: "Test City", limit: 10, page: 10 } };
                const error = new Error("Database error");
                const getAllClinicsFullDataStub = sinon.stub(ClinicService, "getAllClinicsFullData").rejects(error);

                await ClinicController.getAllClinicByParams(req, res, next);

                expect(getAllClinicsFullDataStub.calledOnceWith(req.query)).to.be.true;
                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        })
    });
});