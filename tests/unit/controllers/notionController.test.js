require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const NotionController = require("../../../src/controllers/notionController");
const NotionService = require("../../../src/services/notionService");

use(chaiAsPromised);

describe("Notion Controller", () => {
    let next, res;
    beforeEach(async () => {
        next = sinon.stub();
        res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("createNotion", () => {
            it("expect to create notion, when valid data is provide", async () => {
                const testNotion = { id: 1, content: "FOO" };
                const req = { body: { notionData: testNotion.content } };
                const createNotionServiceStub = sinon.stub(NotionService, "createNotion").resolves(testNotion);

                await NotionController.createNotion(req, res, next);

                expect(createNotionServiceStub.calledOnceWith(req.body)).to.be.true;
                expect(res.status.calledOnceWith(201)).to.be.true;
                expect(res.json.calledOnceWith(testNotion)).to.be.true;
                expect(next.called).to.be.false;
            });
        });
        describe("getAllNotions", () => {
            it("expect get notions, when they exists", async () => {
                const req = {};
                const testNotion = { id: 1, content: "FOO" };
                const getAllNotionServiceStub = sinon.stub(NotionService, "getAllNotions").resolves(testNotion);

                await NotionController.getAllNotions(req, res, next);

                expect(getAllNotionServiceStub.calledOnce).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(testNotion)).to.be.true;
            })
        });
        describe("updateNotion", () => {
            it("expect to update notion, when it exists and valid data is provide", async () => {
                const testNotion = { id: 1, content: "FOO" };
                const req = { body: { notionData: { context: "UPDATED" } }, params: { notionId: "1" } };
                const updateNotionServiceStub = sinon.stub(NotionService, "updateNotion").resolves(testNotion);

                await NotionController.updateNotion(req, res, next);

                expect(updateNotionServiceStub.calledOnceWith(req.params.notionId, req.body)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith(testNotion)).to.be.true;
            });
        });
        describe("deleteNotion", () => {
            it("expect delete notion from dataBase", async () => {
                const req = { params: { notionId: 3 } };
                const deleteNotionStub = sinon.stub(NotionService, "deleteNotion").resolves({ message: "Successful delete" });

                await NotionController.deleteNotion(req, res, next);

                expect(deleteNotionStub.calledOnceWith(req.params.notionId)).to.be.true;
                expect(res.status.calledOnceWith(200)).to.be.true;
                expect(res.json.calledOnceWith({ message: "Notion deleted successfully" })).to.be.true;
            })
        })
    });
    describe("Negative tests", () => {
        describe("createNotion", () => {
            it("expect next('Create Error'), when the user not found", async () => {
                const error = new Error("Create Error");
                const req = { body: "FOO" };
                const createUserServiceStub = sinon.stub(NotionService, "createNotion").rejects(error);

                await NotionController.createNotion(req, res, next);

                expect(createUserServiceStub.calledOnce).to.be.true;
                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
        describe("updateNotion", () => {
            it("expect error('Update found'), when it don't exist", async () => {
                const error = new Error("Update Error");
                const req = { body: "FOO", params: { notionId: 1 } };
                const createUserServiceStub = sinon.stub(NotionService, "updateNotion").rejects(error);

                await NotionController.updateNotion(req, res, next);

                expect(createUserServiceStub.calledOnce).to.be.true;
                expect(next.calledOnceWith(error)).to.be.true;
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            });
        });
        describe("deleteUser", () => {
            it("expect message: 'Delete error', when delete user service from dataBase", async () => {
                const req = { params: { notionId: 3 } };
                const deleteNotionStub = sinon.stub(NotionService, "deleteNotion").rejects(new Error("Delete error"));

                await NotionController.deleteNotion(req, res, next);

                expect(deleteNotionStub.calledOnceWith(req.params.notionId)).to.be.true;
                expect(next.called).to.be.true;
                expect(next.calledOnceWith(new Error("Delete error")));
                expect(res.status.called).to.be.false;
                expect(res.json.called).to.be.false;
            })
        });
    });
});