import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// /analyze endpoint
app.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

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

    // Call Gemini API via REST using axios
    const response = await axios.post(
      "https://generative.googleapis.com/v1beta2/models/text-bison-001:generate",
      {
        prompt,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Return AI feedback
    res.json({ feedback: response.data });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
