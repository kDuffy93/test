const mongoose = require("mongoose");

const schemaDefinition = (
  {
    stratifiedArea: {
      type: String,
      required: true,
    },
    municipality: {
      type: String,
      required: true,
    },
    streetNumber: {
      type: String,
      required: true,
    },
    streetName: {
      type: String,
      required: true,
    },
    housingType: {
      type: String,
      required: true,
    },
    unitSize: {
      type: String,
      required: true,
    },
    secondarySuite: {
      type: String,
      required: true,
    },
    monthlyRent: {
      type: String,
      required: true,
    },
    utilitiesIncluded: {
      type: String,
      required: true,
    },
    landlordType: {
      type: String,
      required: true,
    },
    stability: {
      type: String,
      required: true,
    },
  });

let schemaObj = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model("rentalData", schemaObj);
