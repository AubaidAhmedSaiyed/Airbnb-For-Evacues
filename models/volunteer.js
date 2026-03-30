const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const volunteerSchema = Schema({
  name: { type: String},
  contact: { type: String},
  email:{type:String},
  region: { type: String },
  role: { type: String},
  shelters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shelter"   // relation: one volunteer can own many shelters
    }
  ],
  active: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now }
});

const volunteer = mongoose.model('Volunteer',volunteerSchema);
module.exports = volunteer;