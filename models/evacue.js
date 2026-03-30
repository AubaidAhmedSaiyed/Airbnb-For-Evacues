const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evacueSchema = Schema({
    name:String,
    age:String,
    gender:String,
    contact:String,
    email:String,
    password:String,
    urgentNeed:{type:Boolean,default:false},
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    createdAt: { type: Date, default: Date.now }
});

const evacue = mongoose.model('Evacue',evacueSchema);
module.exports = evacue;