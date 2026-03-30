const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sheltersSchema = new Schema({
    hostId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"volunteer"
    },
    hostName: String,
    hostContact:String,
    image:{
        default:"https://unsplash.com/photos/a-multicolored-abstract-image-of-an-umbrella-LOaS_VCq1og",
        type:String,
        set: (v) => v === "" ? "https://unsplash.com/photos/a-multicolored-abstract-image-of-an-umbrella-LOaS_VCq1og":v
    },
    location:{
        address: String,
        country:String,
    },
    capacity: Number,
    availableFrom: String,
    availableUntil: String,
    notes:{
        type:String,
        default:"-"
    },
    createdAt: {type:Date , default: Date.now}
});

const Shelter = mongoose.model('Shelter',sheltersSchema);
module.exports = Shelter;
