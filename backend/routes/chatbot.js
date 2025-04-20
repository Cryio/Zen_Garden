const express = require("express");
const axios = require("axios");
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const knowledgeBase = {
  meditation: [
    "Meditation helps reduce stress and improve focus. Try starting with just 5 minutes a day!",
    "Deep breathing exercises can help calm your mind. Inhale for 4 counts, hold for 4, exhale for 4.",
    "Mindfulness meditation involves focusing on the present moment without judgment."
  ],
  habits: [
    "Start small and build up gradually for lasting habits!",
    "Consistency is more important than perfection. Keep going!",
    "Track your progress to stay motivated!"
  ]
};

function findRelevantContext(query) {
  const lowerQuery = query.toLowerCase();
  let relevantContexts = [];

  Object.entries(knowledgeBase).forEach(([category, facts]) => {
    if (lowerQuery.includes(category)) {
      relevantContexts = relevantContexts.concat(facts);
    }
  });

  return relevantContexts;
}

router.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const relevantContext = findRelevantContext(userMessage);

    const systemMessage = {
      role: "system",
      content: `You are a cheerful and positive AI assistant focused on meditation and habit tracking. 
      Always respond in a friendly, encouraging tone. Keep responses concise and practical.
      ${relevantContext.length > 0 ? "Here's some relevant information: " + relevantContext.join(" ") : ""}`
    };

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          systemMessage,
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
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

    res.json({ 
      message: reply, 
      model,
      context: relevantContext.length > 0 ? "Used relevant knowledge base" : "General response"
    });
  } catch (error) {
    console.error("Groq API error:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to get chatbot response",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
