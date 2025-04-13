const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true }, 
  password: { type: String, required: true }//hashed from the front end
});


module.exports = mongoose.model("User", UserSchema);
