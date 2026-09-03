require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const rewire = require('rewire');
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const AppointmentService = rewire('../../../src/services/appointmentService');

use(chaiAsPromised);

describe("Appointment Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createAppointment", () => {
            it("expect create a new appointment, when valid data is provided", async () => {
                const appointmentData = {
                    doctorId: 1,
                    serviceId: 1,
                    patientId: 1,
                    date: '2024-01-01',
                    timeSlot: '10:00',
                    firstVisit: true,
                    visitType: 'prywatna',
                    description: 'Test appointment'
                };
                const schedule = { id: 1 };
                const doctorService = {
                    id: 1,
                    service: {
                        clinic_id: 1
                    }
                };
                const checkScheduleStub = sinon.stub().resolves(schedule);
                const checkDoctorServiceStub = sinon.stub().resolves(doctorService);
                AppointmentService.__set__('checkScheduleAndSlot', checkScheduleStub);
                AppointmentService.__set__('checkDoctorService', checkDoctorServiceStub);
                const createAppointmentStub = sinon.stub(db.Appointments, 'create').resolves({
                    id: 1,
                    ...appointmentData,
                    clinic_id: 1,
                    schedule_id: 1,
                    doctor_service_id: 1,
                    status: 'active'
                });

                const result = await AppointmentService.createAppointment(appointmentData);

                expect(checkScheduleStub.calledOnceWith(
                    appointmentData.doctorId,
                    appointmentData.date,
                    appointmentData.timeSlot
                )).to.be.true;

                expect(checkDoctorServiceStub.calledOnceWith(
                    appointmentData.doctorId,
                    appointmentData.serviceId
                )).to.be.true;

                expect(createAppointmentStub.calledOnce).to.be.true;
                expect(result).to.have.property('id');
                expect(result.status).to.equal('active');
            });
        });
        describe("deleteAppointment() =>:", () => {
            let destroyStub, findOneStub;

            beforeEach(async () => {
                findOneStub = sinon.stub(db.Appointments, "findOne");
                destroyStub = sinon.stub();
            });
            it("expect delete appointment, when valid data", async () => {
                findOneStub.resolves({ destroy: destroyStub });
                destroyStub.resolves();

                await AppointmentService.deleteAppointment(1, 2);

                expect(findOneStub.calledOnceWith({ where: { id: 1, patient_id: 2 } })).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        describe("createAppointment() =>:", () => {
            let appointmentCreateStub, checkDoctorServiceStub, checkScheduleAndSlotStub;
            beforeEach(() => {
                checkScheduleAndSlotStub = sinon.stub();
                checkDoctorServiceStub = sinon.stub();
                AppointmentService.__set__('checkScheduleAndSlot', checkScheduleAndSlotStub);
                AppointmentService.__set__('checkDoctorService', checkDoctorServiceStub);
                appointmentCreateStub = sinon.stub(db.Appointments, "create");
            });
            it("expect throw an AppError('The doctor's schedule for the specified date was not found'), when the doctor doesn't have this schedule", async () => {
                checkScheduleAndSlotStub.rejects(new Error("The doctor's schedule for the specified date was not found"))
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1 };

                await expect(AppointmentService.createAppointment(appointment)).to.be.rejectedWith(Error, "The doctor's schedule for the specified date was not found");

                expect(appointmentCreateStub.called).to.be.false;
            });
            it("expect throw an AppError('The Doctor doesn't have this service'), when doctor doesn't have this service", async () => {
                checkScheduleAndSlotStub.resolves({ id: 1 });
                checkDoctorServiceStub.rejects(new Error("The Doctor doesn't have this service "))
                const appointment = { doctor_id: 1, user_id: 1, clinic_id: 1, schedule_id: 1, time: "08:00" };

                await expect(AppointmentService.createAppointment(appointment)).to.be.rejectedWith(Error, "The Doctor doesn't have this service");

                expect(checkDoctorServiceStub.called).to.be.true;
                expect(appointmentCreateStub.called).to.be.false;
            });
        });
        describe("deleteSpecialty() =>:", () => {
            let destroyStub, findOneStub;
            beforeEach(async () => {
                findOneStub = sinon.stub(db.Appointments, "findOne");
                destroyStub = sinon.stub();
            });
            it("expect throw error('Appointments not found'), when it isn't", async () => {
                findOneStub.resolves(false);

                await expect(AppointmentService.deleteAppointment(1, 2)).to.be.rejectedWith(Error, "Appointment not found");

                expect(findOneStub.calledOnceWith({ where: { id: 1, patient_id: 2 } })).to.be.true;
            });
            it("expect throw error('Appointments error'), when error db", async () => {
                findOneStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Appointments error"));

                await expect(AppointmentService.deleteAppointment(1, 2)).to.be.rejectedWith(Error, "Appointments error");

                expect(findOneStub.calledOnceWith({ where: { id: 1, patient_id: 2 } })).to.be.true;
            });
        });
    });
});