const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generateQuiz", async (req, res) => {
  try {
    const { Topic, countof } = req.body;

    if (!Topic || !countof) {
      return res.status(400).json({ error: "Topic and number of questions are required" });
    }

    const prompt = `
    Generate ${countof} multiple-choice questions about "${Topic}".
    Format strictly as JSON like this:
    [
      {
        "question": "Question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A"
      }
    ]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text();
    text = text.replace(/```json|```/g, "");

    let aiQuestions = JSON.parse(text);

    // Map AI output to Mongoose schema
    const formattedQuestions = aiQuestions.map(q => {
      const correctIndex = q.options.findIndex(opt => opt === q.correctAnswer);
      return {
        questiontext: q.question,
        options: q.options,
        correctOptionIndex: correctIndex
      };
    });

    const quiz = new Quiz({
      Topic,
      countof: formattedQuestions.length,
      question: formattedQuestions,
      source: "Ai"
    });

    await quiz.save();

    res.status(200).json({ message: "Quiz generated successfully", quiz });
    console.log("Generated Quiz:", JSON.stringify(quiz, null, 2));
  } catch (error) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz", details: error.message });
  }
});

module.exports = router;
