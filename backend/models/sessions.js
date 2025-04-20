const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: "Habit", required: false },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes or seconds
});

module.exports = mongoose.model("Session", SessionSchema);


