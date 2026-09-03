require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const UserController = require("../../../src/controllers/userController");
const UserService = require("../../../src/services/userService");
const ClinicService = require("../../../src/services/clinicService");

use(chaiAsPromised);

describe("Users Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("getUserAccount", () => {
            it("expect get user data, when it exists and role 'clinic'", async () => {
                const req = { user: { id: 1, role: "clinic" } };
                const user = { id: 3, name: "clinic" }
                const getClinicByIdStub = sinon.stub(ClinicService, "getClinicById").resolves(user);

                await UserController.getUserAccount(req, res, next);

                expect(getClinicByIdStub.calledOnceWith(1)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(user)).to.be.true;
            });
            it("expect get user data, when it exists", async () => {
                const req = { user: { id: 1, role: "doctor" } };
                const user = { id: 3, name: "doctor" }
                const getUserByIdStub = sinon.stub(UserService, "getUserById").resolves(user);

                await UserController.getUserAccount(req, res, next);

                expect(getUserByIdStub.calledOnceWith(1, "doctor")).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(user)).to.be.true;
            });
        });
        describe("updateUser", () => {
            it("expect to update user data and return success message", async () => {
                const req = {
                    body: {
                        userData: { name: "John Doe", email: "john@example.com" },
                        addressData: { city: "New York", street: "5th Avenue" },
                    },
                    user: { id: 1 },
                };
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.stub(),
                };
                const next = sinon.stub();
                const updateUserStub = sinon.stub(UserService, "updateUser").resolves();

                await UserController.updateUser(req, res, next);

                expect(updateUserStub.calledOnceWith(
                    req.user.id,
                    req.body.userData,
                    req.body.addressData
                )).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "User update successfully" })).to.be.true;
            });
        });
        describe("updateUserPassword", () => {
            it("expect changed password and return message, when valid data is provide", async () => {
                const req = {
                    body: { oldPassword: "oldPass", newPassword: "newPass" },
                    user: { id: 1 }
                };
                const updatePasswordStub = sinon.stub(UserService, "updatePassword").resolves();

                await UserController.updateUserPassword(req, res, next);

                expect(updatePasswordStub.calledOnceWith(req.user, "oldPass", "newPass")).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Password changed successfully" })).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("deleteUser", () => {
            it("expect delete user from dataBase, when user is exist and role is 'clinic'", async () => {
                const req = { user: { id: 3, role: 'clinic' } };
                const deleteUser = sinon.stub(ClinicService, "deleteClinicById").resolves({ message: "User deleted successfully" });

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.user.id)).to.be.true;
            });
            it("expect delete user from dataBase, when user is exist", async () => {
                const req = { user: { id: 3, role: 'doctor' } };
                const deleteUser = sinon.stub(UserService, "deleteUserById").resolves({ message: "User deleted successfully" });

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.user.id)).to.be.true;
            });
        });
    });
    describe("Negative tests", () => {
        describe("getUserAccount", () => {
            it("expect error('User not found'), when it don't exist and role is 'clinic", async () => {
                const req = { user: { idd: 3, role: "clinic" } };
                const getRoleUserByIdStub = sinon.stub(ClinicService, "getClinicById").rejects(new Error("User not found"));

                await UserController.getUserAccount(req, res, next);

                expect(getRoleUserByIdStub.calledOnceWith(req.user.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("User not found")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("expect error('User not found'), when it don't exist", async () => {
                const req = { user: { idd: 3, role: "doctor" } };
                const getRoleUserByIdStub = sinon.stub(UserService, "getUserById").rejects(new Error("User not found"));

                await UserController.getUserAccount(req, res, next);

                expect(getRoleUserByIdStub.calledOnceWith(req.user.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("User not found")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
        describe("updateUser", () => {
            it("expect to throw next with error when update fails", async () => {
                const req = {
                    body: {
                        userData: { name: "John Doe", email: "john@example.com" },
                        addressData: { city: "New York", street: "5th Avenue" },
                    },
                    user: { id: 1 },
                };
                const res = {
                    status: sinon.stub().returnsThis(),
                    json: sinon.stub(),
                };
                const next = sinon.stub();
                const testError = new Error("Update failed");
                const userUpdateStub = sinon.stub(UserService, "updateUser").rejects(testError);

                await UserController.updateUser(req, res, next);

                expect(userUpdateStub.calledOnceWithExactly(
                    req.user.id,
                    req.body.userData,
                    req.body.addressData
                )).to.be.true;
                expect(next.calledOnceWith(testError)).to.be.true;
            });
        });
        describe("updateUserPassword", () => {
            it("expect throw Valid data error when missing required fields", async () => {
                const testCases = [
                    { body: { oldPassword: "oldPass" }, user: { id: 1 } },
                    { body: { newPassword: "newPass" }, user: { id: 1 } },
                    { body: { oldPassword: "oldPass", newPassword: "newPass" }, user: null },
                ];

                for (const req of testCases) {
                    await UserController.updateUserPassword(req, res, next);

                    expect(next.calledOnce).to.be.true;
                    const error = next.getCall(0).args[0];
                    expect(error.message).to.equal("Valid data error");
                    expect(error.statusCode).to.equal(400);

                    next.resetHistory();
                }
            });
        });
        describe("deleteUser", () => {
            it("expect message: 'Delete error', when delete user service from dataBase and role is 'clinic'", async () => {
                const req = { user: { id: 3, role: "clinic" } };
                const deleteUser = sinon.stub(ClinicService, "deleteClinicById").rejects(new Error("Delete error"));

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.user.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Delete error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
            it("expect message: 'Delete error', when delete user service from dataBase", async () => {
                const req = { user: { id: 3, role: "doctor" } };
                const deleteUser = sinon.stub(UserService, "deleteUserById").rejects(new Error("Delete error"));

                await UserController.deleteUser(req, res, next);

                expect(deleteUser.calledOnceWith(req.user.id)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Delete error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
    });
});