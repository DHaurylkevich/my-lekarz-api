require("dotenv").config();
process.env.NODE_ENV = 'test';

const sinon = require("sinon");
const { expect, use } = require("chai");
const chaiAsPromised = require("chai-as-promised");
const db = require("../../../src/models");
const sequelize = require("../../../src/config/db");
const AddressService = require("../../../src/services/addressService");

use(chaiAsPromised);

describe("Address Service", () => {
    afterEach(() => {
        sinon.restore();
    });
    describe("Positive tests", () => {
        describe("addressCreate:", () => {
            let createAddressStub, transactionStub;
            beforeEach(async () => {
                transactionStub = {
                    commit: sinon.stub(),
                    rollback: sinon.stub(),
                };
                sinon.stub(sequelize, "transaction").resolves(transactionStub);
                createAddressStub = sinon.stub(db.Addresses, "create");
            });
            it("expect address to be created with transaction and return", async () => {
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createAddressStub.resolves({ ...newAddress, id: 1 });

                const result = await AddressService.createAddress(newAddress, transactionStub);

                expect(createAddressStub.calledOnceWith(newAddress, { transaction: transactionStub })).to.be.true;
                expect(result).to.deep.equals({ ...newAddress, id: 1 });
            });
        });
        describe("updateAddress => Update:", () => {
            let updateAddressStub
            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateAddressStub = sinon.stub(db.Addresses, "update")
            });
            it("expend address to be updated, when valid data and transaction are ", async () => {
                const id = 1;
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                updateAddressStub.resolves({ ...newAddress, home: 2 });

                const result = await AddressService.updateAddress({ update: updateAddressStub }, newAddress, transactionStub);

                expect(updateAddressStub.calledOnceWith(newAddress, { transaction: transactionStub })).to.be.true;
                expect(result).to.deep.include({ ...newAddress, home: 2 });
            })
        });
    });
    describe("Negative tests", () => {
        describe("addressCreate:", () => {
            let createAddressStub;

            beforeEach(async () => {
                createAddressStub = sinon.stub(db.Addresses, "create");
            });

            it("expect to throw an error('Create address failed') when address creation fails", async () => {
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                createAddressStub.rejects(new Error("Create address failed"));

                await expect(AddressService.createAddress(newAddress)).to.be.rejectedWith(Error, "Create address failed");

                expect(createAddressStub.calledOnceWith(newAddress)).to.be.true;
            });
        });
        describe("updateAddress", () => {
            let updateAddressStub, transactionStub;

            beforeEach(async () => {
                transactionStub = sinon.stub(sequelize, "transaction").resolves();
                updateAddressStub = sinon.stub(db.Addresses, "update")
            });

            it("expend error('Address error'), when error with db", async () => {
                const newAddress = { city: "foo", street: "foo", home: 1, flat: 1, post_index: "123-1234" };
                updateAddressStub.rejects(new Error("Address error"));

                await expect(AddressService.updateAddress({ update: updateAddressStub }, newAddress, transactionStub)).to.be.rejectedWith(Error, "Address error");

                expect(updateAddressStub.calledOnceWith(newAddress, { transaction: transactionStub })).to.be.true;
            })
        });
    });
});