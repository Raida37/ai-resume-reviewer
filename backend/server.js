// ------------------------------
// server.js - AI Resume Reviewer Backend
// Fully corrected for Gemini 2.0 Flash API
// ------------------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS so frontend can access backend
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// ------------------------------
// POST /analyze
// Accepts resumeText and optional jobText
// Calls Gemini 2.0 Flash API for AI feedback
// ------------------------------
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobText } = req.body;

    if (!resumeText || resumeText.trim() === "") {
      return res.status(400).json({ error: "Resume text is required" });
    }

    // Build prompt for AI
    const promptText = `
You are a professional AI career coach.

Analyze the resume below and return:

1. Overall Resume Score (1–10)
2. Key Strengths (bullet points)
3. Weaknesses / Missing Areas
4. Actionable Improvement Suggestions
5. Rewritten Professional Summary (3–4 lines)

Resume:
${resumeText}

${jobText ? `Job Description:\n${jobText}` : ""}
`;

    // Call Gemini 2.0 Flash API
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY
        }
      }
    );

    // Extract AI response text safely
    const aiText = response.data?.results?.[0]?.content?.[0]?.text || "No response from Gemini";

    // Send feedback to frontend
    res.json({ feedback: aiText });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

// ------------------------------
// Start server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
