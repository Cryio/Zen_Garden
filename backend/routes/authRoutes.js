const express = require("express");
const User = require("../modules/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Email already in use" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.json({ message: "User created successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
