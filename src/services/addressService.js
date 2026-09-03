const db = require("../models");
const AppError = require("../utils/appError");

const AddressService = {
    createAddress: async (addressData, t) => {
        return await db.Addresses.create(addressData, { transaction: t });
    },
    updateAddress: async (address, addressData, t) => {
        if (!address) {
            throw new AppError("Address not found");
        }

        return await address.update(addressData, { transaction: t })
    }
}

module.exports = AddressService;