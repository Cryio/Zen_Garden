const express = require("express");
const axios = require("axios");
const router = express.Router();

const GROQ_API_KEY = "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";

router.post("/chat", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: req.body.message,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    const model = response.data.model;

    res.json({ message: reply, model });
  } catch (error) {
    console.error("Groq API error:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get chatbot response",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
