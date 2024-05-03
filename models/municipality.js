const mongoose = require("mongoose");

const schemaDefinition = {

    name: {
        type: String,
        required: true,
    },

};

let schemaObj = new mongoose.Schema(schemaDefinition);

module.exports = mongoose.model("municipality", schemaObj);
