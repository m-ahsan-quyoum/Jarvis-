import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Root route - fixes 404 error
app.get("/", (req, res) => {
  res.json({
    name: "JARVIS Assistant",
    status: "🟢 Running Successfully!",
    message: "Your AI assistant is live",
    endpoints: {
      health: "/api/health",
      chat: "/api/chat (POST request)"
    }
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "JARVIS is alive!"
  });
});

// Chat route for JARVIS
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ reply: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 JARVIS running on port ${port}`);
});
