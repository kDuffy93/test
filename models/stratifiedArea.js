const mongoose = require("mongoose");

const schemaDefinition = {

    name: {
        type: String,
        required: true,
    },
    municipalities: {
        type: Array
    },

};

let schemaObj = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model("stratifiedArea", schemaObj);
