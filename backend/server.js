import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ feedback: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
