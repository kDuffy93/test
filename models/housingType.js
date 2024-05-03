const mongoose = require("mongoose");


const schemaDefinition = {
    name: {
        type: String,
        required: true,
    },
    unitSizes: {
        type: Array
    },
};

let schemaObj = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model("housingType", schemaObj);
