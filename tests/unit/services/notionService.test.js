require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const NotionService = require("../../../src/services/notionService");

use(chaiAsPromised);

describe("Notion Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("notionCreate", () => {
            it("expect notion to be created and return, when data is valid", async () => {
                const testNotion = { content: "FOO" };
                const createStub = sinon.stub(db.Notions, "create").resolves({ ...testNotion, id: 1 });;

                const result = await NotionService.createNotion(testNotion);

                expect(createStub.calledOnceWith(testNotion)).to.be.true;
                expect(result).to.deep.equals({ ...testNotion, id: 1 });
            });
        });
        describe("getAllNotions", () => {
            it("expect all notions from db, when when they exist", async () => {
                const testNotion = { content: "FOO" };
                const findAllStub = sinon.stub(db.Notions, "findAll").resolves([{ ...testNotion, id: 1 }]);;

                const result = await NotionService.getAllNotions();

                expect(findAllStub.calledOnceWith()).to.be.true;
                expect(result).that.is.a("array");
                expect(result[0]).to.deep.equals({ ...testNotion, id: 1 });
            });
        });
        describe("updateNotion", () => {
            it("expend notion to be updated, when it exists and valid data", async () => {
                let testNotion = { id: 1, content: "FOO" };
                const updateStub = sinon.stub(db.Notions, "update");
                const findByPkStub = sinon.stub(db.Notions, "findByPk").resolves({ testNotion, update: updateStub });
                let updateNotion = { id: 1, content: "FOO" };
                updateStub.resolves(updateNotion);
                const result = await NotionService.updateNotion(1, testNotion);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith(testNotion)).to.be.true;
                expect(result).to.deep.include({ content: updateNotion.content });
            });
        });
        describe("deleteNotion", () => {
            it("expend to delete notion, when it exists", async () => {
                const destroyStub = sinon.stub(db.Notions, "destroy").resolves();
                const findByPkStub = sinon.stub(db.Notions, "findByPk").resolves({ destroy: destroyStub });

                await NotionService.deleteNotion(1);

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        })
    });
    describe("Negative tests", () => {
        describe("notionCreate() => Create:", () => {
            it("expend error('Create Error'), when error with db", async () => {
                let testNotion = { id: 1, content: "FOO" };
                const createStub = sinon.stub(db.Notions, "create").rejects(new Error("Create Error"))

                await expect(NotionService.createNotion(testNotion)).to.be.rejectedWith(Error, "Create Error");

                expect(createStub.calledOnceWith(testNotion)).to.be.true;
            });
        });
        describe("getAllNotions", () => {
            it("expend error('Find Error'), when error with db", async () => {
                const findAllStub = sinon.stub(db.Notions, "findAll").rejects(new Error("Find Error"));

                await expect(NotionService.getAllNotions()).to.be.rejectedWith(Error, "Find Error");

                expect(findAllStub.calledOnce).to.be.true;
            });
        });
        describe("updateNotion", () => {
            let findByPkStub, updateStub;

            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Notions, "findByPk");
                updateStub = sinon.stub(db.Notions, "update");
            });

            it("expend error('Notion not found'), when notion doesn't exist", async () => {
                let testNotion = { id: 1, content: "FOO" };
                findByPkStub.resolves(null);

                await expect(NotionService.updateNotion(1, testNotion)).to.be.rejectedWith(Error, "Notion not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnce).to.be.false;
            });
            it("expend error('Update Error'), when error with db", async () => {
                let testNotion = { id: 1, content: "FOO" };
                findByPkStub.resolves({ testNotion, update: updateStub });
                updateStub.rejects(new Error("Update Error"));

                await expect(NotionService.updateNotion(1, testNotion)).to.be.rejectedWith(Error, "Update Error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(updateStub.calledOnceWith(testNotion)).to.be.true;
            });
        });
        describe("deleteNotion", () => {
            let findByPkStub, destroyStub
            beforeEach(async () => {
                findByPkStub = sinon.stub(db.Notions, "findByPk");
                destroyStub = sinon.stub(db.Notions, "destroy");
            })
            it("expend error('Notion not found'), when error with db", async () => {
                findByPkStub.resolves(null);

                await expect(NotionService.deleteNotion(1)).to.be.rejectedWith(Error, "Notion not found");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.false;
            });
            it("expend error('Find Error'), when error with db", async () => {
                findByPkStub.resolves({ destroy: destroyStub });
                destroyStub.rejects(new Error("Destroy Error"));

                await expect(NotionService.deleteNotion(1)).to.be.rejectedWith(Error, "Destroy Error");

                expect(findByPkStub.calledOnceWith(1)).to.be.true;
                expect(destroyStub.calledOnce).to.be.true;
            });
        });
    });
});