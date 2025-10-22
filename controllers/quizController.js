const Quiz = require("../models/Quiz");
const axios = require("axios");
require("dotenv").config();

const generateQuiz = async(req,res)=>
{
    try {
        const {Topic,countof} = req.body;
        if(!Topic)
        {
            return res.status(400).json({error:"Topic not found"});
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
     const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      {
         contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY, 
        },
      }
    );

    const modelText =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!modelText) {
      return res.status(500).json({ error: "No response from Gemini API." });
    }

    let quizData;
    try {
      quizData = JSON.parse(modelText);
    } catch (err) {
      return res.status(500).json({ error: "Gemini response was not valid JSON." });
    }

    if (!quizData.question || !Array.isArray(quizData.question)) {
      return res.status(400).json({ error: "Invalid quiz format returned by Gemini." });
    }

   const cleanedquestion = quizData.question
      .filter(
        (q) =>
          q.questionText &&
          Array.isArray(q.options) &&
          q.options.length >= 4 &&
          typeof q.correctOptionIndex === "number"
      )
      .map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.slice(0, 4).map((opt) => opt.trim()), 
        correctOptionIndex:
          q.correctOptionIndex >= 0 && q.correctOptionIndex < 4
            ? q.correctOptionIndex
            : 0,
      }));

    if (cleanedquestion.length === 0) {
      return res.status(400).json({ error: "No valid question generated." });
    }

    const quiz = new Quiz({
      Topic,
      countof,
      question: cleanedquestion,
    });

    await quiz.save();

    res.status(201).json({
      message: "Quiz generated successfully.",
      quiz,
    });
    console.log("Generated Quiz:", JSON.stringify(quiz, null, 2));
  } catch (error) {
    console.error("Error generating quiz:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { generateQuiz };