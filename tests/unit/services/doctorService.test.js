require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const rewire = require('rewire');
const { expect, use } = require("chai");
const db = require("../../../src/models");
const chaiAsPromised = require("chai-as-promised");
const sequelize = require("../../../src/config/db");
const DoctorService = rewire("../../../src/services/doctorService");
const ClinicService = require("../../../src/services/clinicService");
const SpecialtyService = require("../../../src/services/specialtyService");
const UserService = require("../../../src/services/userService");
const AppError = require("../../../src/utils/appError");

use(chaiAsPromised);

describe("Doctor Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive test", () => {
        let transactionStub, getClinicByIdStub, findOneUserStub, createUserStub, createDoctorStub, setServicesStub;
        describe("createDoctor", () => {
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById");
                findOneUserStub = sinon.stub(db.Users, "findOne");
                createUserStub = sinon.stub(db.Users, "create");
                createDoctorStub = sinon.stub();
                createDoctorStub = sinon.stub();
                setServicesStub = sinon.stub();
            });

            it("expect successfully create a doctor, when data valid", async () => {
                const userData = { name: 'John Doe', };
                const specialtyId = 2;
                const servicesIds = [2];
                const clinicId = 1;
                const doctorData = { name: "Doctor Name" };
                const newDoctor = { clinic_id: 1, ...doctorData };
                DoctorService.__set__('setPasswordMail', sinon.stub());
                getClinicByIdStub.resolves();
                findOneUserStub.resolves();
                createUserStub.resolves({ newDoctor, createDoctor: createDoctorStub, update: sinon.stub() });
                createDoctorStub.resolves({ setServices: setServicesStub });

                await DoctorService.createDoctor({ userData, doctorData, specialtyId, servicesIds, clinicId });

                expect(getClinicByIdStub.calledOnceWith(clinicId)).to.be.true;
                expect(findOneUserStub.calledOnce).to.be.true;
                expect(createDoctorStub.calledOnceWith(
                    { clinic_id: clinicId, ...doctorData, specialty_id: specialtyId },
                    { transaction: transactionStub }
                )).to.be.true;
                expect(setServicesStub.calledOnceWith(servicesIds)).to.be.true;
                expect(transactionStub.commit.calledOnce).to.be.true;
                expect(transactionStub.rollback.called).to.be.false;
            });
        });
        describe("getDoctorById", () => {
            let findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Doctors, "findOne");
            })
            it("expect get doctor by id, when it is in db", async () => {
                const mockDoctor = {
                    id: 1,
                    user: {
                        id: 1,
                        first_name: 'John',
                        last_name: 'Doe',
                        address: {
                            city: 'New York'
                        }
                    },
                    specialty: {
                        id: 1,
                        name: 'Cardiology'
                    },
                    clinic: {
                        name: 'City Hospital'
                    }
                };
                findOneStub.resolves(mockDoctor);

                const result = await DoctorService.getDoctorById(1);

                expect(findOneStub.calledOnce).to.be.true;
                expect(result).to.deep.equal(mockDoctor);
            });
        });
        describe("updateDoctorById", () => {
            let getUserStub, updateDoctorStub, updateUserStub, transactionStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findOneDoctorStub = sinon.stub(db.Doctors, "findOne");
                updateStub = sinon.stub();
                getUserStub = sinon.stub();
                getAddressStub = sinon.stub();
                updateUserStub = sinon.stub();
                updateDoctorStub = sinon.stub();
                setServicesStub = sinon.stub();
            })
            it("expect update user data, when is valid data'", async () => {
                const userData = { name: "user data" };
                const addressData = "address data";
                const doctorData = "doctor data";
                const servicesIds = [1];
                findOneDoctorStub.resolves({ getUser: getUserStub, update: updateDoctorStub, setServices: setServicesStub });
                getUserStub.resolves({ update: updateUserStub, getAddress: getAddressStub });
                getAddressStub.resolves({ update: updateStub });

                await DoctorService.updateDoctorById({ doctorId: 1, userData, addressData, doctorData, servicesIds, clinicId: 1 });

                expect(sequelize.transaction.calledOnce).to.be.true;
                expect(getUserStub.calledOnce).to.be.true;
                expect(updateUserStub.calledOnceWith(userData, { transaction: transactionStub })).to.be.true
                expect(updateDoctorStub.calledOnceWith(doctorData, { transaction: transactionStub })).to.be.true;
                expect(setServicesStub.calledOnceWith(servicesIds, { transaction: transactionStub })).to.be.true;
            });
        });
    });
    describe("Negative test", () => {
        describe("createDoctor", () => {
            let transactionStub, getClinicByIdStub, findSpecialtyStub, createUserStub, createDoctorStub, addSpecialtiesStub;

            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                getClinicByIdStub = sinon.stub(ClinicService, "getClinicById").resolves();
                findSpecialtyStub = sinon.stub(SpecialtyService, "getSpecialtyById").resolves();
                createUserStub = sinon.stub(UserService, "createUser");
                createDoctorStub = sinon.stub();
                addSpecialtiesStub = sinon.stub();
            });
            it("Expect error('Clinic not found'), when createDoctor throws error", async () => {
                const error = new Error('Clinic not found');
                getClinicByIdStub.throws(error);

                await expect(DoctorService.createDoctor({ clinicId: 1, userData: "user", doctorData: "doctor", servicesIds: [2], specialtyId: 1 })).to.be.rejectedWith(error);

                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(findSpecialtyStub.calledOnce).to.be.false;
                expect(createUserStub.calledOnce).to.be.false;
                expect(transactionStub.commit.calledOnce).to.be.false;
                expect(transactionStub.rollback.calledOnce).to.be.true;
            });
        });
        describe("getDoctorById", () => {
            let findOneStub;
            beforeEach(async () => {
                findOneStub = sinon.stub(db.Doctors, "findOne");
            })
            it('expect throw AppError when doctor is not found', async () => {
                findOneStub.resolves(null);

                try {
                    await DoctorService.getDoctorById(1);
                    expect.fail('Expected an error to be thrown');
                } catch (error) {
                    expect(error).to.be.instanceOf(AppError);
                    expect(error.message).to.equal('Doctor not found');
                    expect(error.statusCode).to.equal(404);
                }
            });

            it('expect throw an error when database query fails', async () => {
                const dbError = new Error('Database error');
                findOneStub.rejects(dbError);

                try {
                    await DoctorService.getDoctorById(1);
                    expect.fail('Expected an error to be thrown');
                } catch (error) {
                    expect(error).to.equal(dbError);
                }
            });
        });
        describe("updateDoctorById", () => {
            let findOneDoctorStub, transactionStub;
            beforeEach(() => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                findOneDoctorStub = sinon.stub(db.Doctors, "findOne");
            });
            it("expect throw AppError('Doctor not found') and transaction to rollback", async () => {
                findOneDoctorStub.resolves();

                await expect(DoctorService.updateDoctorById({ doctorId: 1, userData: { password: "pass" } })).to.be.rejectedWith("Doctor not found");

                expect(findOneDoctorStub.calledOnce).to.be.true;
            });
        });
    });
});