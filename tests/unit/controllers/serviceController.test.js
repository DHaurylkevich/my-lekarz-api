require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const ServiceController = require("../../../src/controllers/serviceController");
const ServiceService = require("../../../src/services/serviceService");
const AppError = require("../../../src/utils/appError");

use(chaiAsPromised);

describe("Service Controller", () => {
    let res, next;
    beforeEach(() => {
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });
    afterEach(() => {
        sinon.restore();
    });

    describe("Positive tests", () => {
        describe("createService", () => {
            let createServiceStub;

            beforeEach(() => {
                createServiceStub = sinon.stub(ServiceService, "createService");
            });
            it("expect create a new service with valid input data", async () => {
                const req = {
                    user: { id: 1 },
                    body: { name: "Test Service", price: 100, specialtyId: 2 }
                };

                const mockService = { id: 1, name: "Test Service", price: 100, specialtyId: 2, clinicId: 3 };
                createServiceStub.resolves(mockService);

                await ServiceController.createService(req, res, next);

                expect(createServiceStub.calledOnceWith({ clinicId: 1, name: "Test Service", price: 100, specialtyId: 2 })).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith(mockService)).to.be.true;
                expect(next.called).to.be.false;
            });
            describe("getServiceById", () => {
                let getServiceByIdStub;

                beforeEach(() => {
                    getServiceByIdStub = sinon.stub(ServiceService, "getServiceById");
                });
                it("expect retrieve a service by its ID", async () => {
                    const req = { params: { serviceId: 1 } };
                    const mockService = { id: 1, name: "Test Service", price: 100 };
                    getServiceByIdStub.resolves(mockService);

                    await ServiceController.getServiceById(req, res, next);

                    expect(getServiceByIdStub.calledOnceWith(1)).to.be.true;
                    expect(res.status.calledOnceWith(200)).to.be.true;
                    expect(res.json.calledOnceWith(mockService)).to.be.true;
                    expect(next.called).to.be.false;
                });
            });
            describe("getServicesByDoctor", () => {
                let getAllServicesByDoctorIdStub;

                beforeEach(() => {
                    getAllServicesByDoctorIdStub = sinon.stub(ServiceService, "getAllServicesByDoctorId");
                });
                it("expect retrieve a service by its ID", async () => {
                    const req = { params: { doctorId: 1 } };
                    const mockService = { id: 1, name: "Test Service", price: 100 };
                    getAllServicesByDoctorIdStub.resolves(mockService);

                    await ServiceController.getServicesByDoctor(req, res, next);

                    expect(getAllServicesByDoctorIdStub.calledOnceWith(1)).to.be.true;
                    expect(res.status.calledOnceWith(200)).to.be.true;
                    expect(res.json.calledOnceWith(mockService)).to.be.true;
                    expect(next.called).to.be.false;
                });
            });
            describe("getServicesByClinic", () => {
                let getAllServicesByClinicIdStub;

                beforeEach(() => {
                    getAllServicesByClinicIdStub = sinon.stub(ServiceService, "getAllServicesByClinicId");
                });
                it("expect retrieve a service by its ID", async () => {
                    const req = { params: { clinicId: 1 } };
                    const mockService = { id: 1, name: "Test Service", price: 100 };
                    getAllServicesByClinicIdStub.resolves(mockService);

                    await ServiceController.getServicesByClinic(req, res, next);

                    expect(getAllServicesByClinicIdStub.calledOnceWith(1)).to.be.true;
                    expect(res.status.calledOnceWith(200)).to.be.true;
                    expect(res.json.calledOnceWith(mockService)).to.be.true;
                    expect(next.called).to.be.false;
                });
            });
            describe("updateService", () => {
                let updateServiceStub;

                beforeEach(() => {
                    updateServiceStub = sinon.stub(ServiceService, "updateService")
                });
                it("expect update a service with provided data and return the updated service", async () => {
                    const req = {
                        user: { id: 1 },
                        params: { serviceId: 1 },
                        body: { name: "Updated Service", price: 150 }
                    };
                    const updatedService = { id: 1, name: "Updated Service", price: 150 };
                    updateServiceStub.resolves(updatedService);

                    await ServiceController.updateService(req, res, next);

                    expect(updateServiceStub.calledOnceWith(1, 1, { name: "Updated Service", price: 150 })).to.be.true;
                    expect(res.status.calledOnceWith(200)).to.be.true;
                    expect(res.json.calledOnceWith({ message: "Service updated successfully" })).to.be.true;
                    expect(next.called).to.be.false;
                });
            });
            describe("deleteService", () => {
                let deleteServiceStub;

                beforeEach(() => {
                    deleteServiceStub = sinon.stub(ServiceService, "deleteService")
                });
                it("should delete a service by its ID and return a success message", async () => {
                    const req = { user: { id: 1 }, params: { serviceId: 1 } };
                    deleteServiceStub.resolves();

                    await ServiceController.deleteService(req, res, next);

                    expect(deleteServiceStub.calledOnceWith(1, 1)).to.be.true;
                    expect(res.status.calledOnceWith(200)).to.be.true;
                    expect(res.json.calledOnceWith({ message: "Service deleted successfully" })).to.be.true;
                    expect(next.called).to.be.false;
                });
            });
        });
    });
    describe("Negative tests", () => {
        describe("createService", () => {
            let createServiceStub;

            beforeEach(() => {
                createServiceStub = sinon.stub(ServiceService, "createService");
            });
            it("expect handle errors during service creation and pass them to the error handler", async () => {
                const req = {
                    user: { id: 1 },
                    body: { name: "Test Service", price: 100, specialtyId: 2 }
                };
                const error = new AppError("Service creation failed");
                createServiceStub.rejects(error);

                await ServiceController.createService(req, res, next);

                expect(createServiceStub.calledOnceWith({ clinicId: 1, name: "Test Service", price: 100, specialtyId: 2 })).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
                expect(next.calledOnceWith(error)).to.be.true;
            });
        });
        describe("getServiceById", () => {
            let getServiceByIdStub;

            beforeEach(() => {
                getServiceByIdStub = sinon.stub(ServiceService, "getServiceById");
            });
            it("expect handle errors when service is not found and pass to the error handler", async () => {
                const req = { params: { serviceId: 999 } };
                const error = new AppError("Service not found", 404);
                getServiceByIdStub.rejects(error);

                await ServiceController.getServiceById(req, res, next);

                expect(getServiceByIdStub.calledOnceWith(999)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
                expect(next.calledOnceWith(error)).to.be.true;
            });
        });
        describe("updateService", () => {
            let updateServiceStub;

            beforeEach(() => {
                updateServiceStub = sinon.stub(ServiceService, "updateService");
            });
            it("expect handle errors when trying to update a non-existing service", async () => {
                const req = {
                    user: { id: 1 },
                    params: { serviceId: 999 },
                    body: { name: "Non-existing Service" }
                };
                const error = new AppError("Service not found", 404);
                updateServiceStub.rejects(error);

                await ServiceController.updateService(req, res, next);

                expect(updateServiceStub.calledOnceWith(1, 999, { name: "Non-existing Service" })).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
                expect(next.calledOnceWith(error)).to.be.true;
            });
            it("expect handle errors when invalid data is provided for updating a service", async () => {
                const req = {
                    user: { id: 1 },
                    params: { serviceId: 1 },
                    body: { name: "" }
                };
                const error = new AppError("Invalid data provided", 400);
                updateServiceStub.rejects(error);

                await ServiceController.updateService(req, res, next);

                expect(updateServiceStub.calledOnceWith(1, 1, { name: "" })).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
                expect(next.calledOnceWith(error)).to.be.true;
            });
        });
        describe("deleteService", () => {
            let deleteServiceStub;

            beforeEach(() => {
                deleteServiceStub = sinon.stub(ServiceService, "deleteService");
            });
            it("expect handle errors when trying to delete a non-existing service", async () => {
                const req = { user: { id: 1 }, params: { serviceId: 999 } };
                const error = new AppError("Service not found", 404);
                deleteServiceStub.rejects(error);

                await ServiceController.deleteService(req, res, next);

                expect(deleteServiceStub.calledOnceWith(1, 999)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
                expect(next.calledOnceWith(error)).to.be.true;
            });
        });
    });
});
