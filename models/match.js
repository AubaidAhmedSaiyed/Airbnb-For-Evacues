const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const matchSchema = Schema({
    shelterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', required: true },
  evacueeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evacuee' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  matchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  status: { 
    type: String, 
    enum: ["Pending", "Confirmed", "Cancelled"], 
    default: "Pending" 
  },
  arrivalDate: { type: Date },
  departureDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const match = mongoose.model('Match',matchSchema);
module.exports = match;
