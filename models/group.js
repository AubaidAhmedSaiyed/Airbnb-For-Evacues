const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = Schema({
    groupName:String,
    age:String,
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evacue' }],
    status: { type: String,default:"Looking for Shelter"}
});

const group = mongoose.model('Group',groupSchema);
module.exports = group;