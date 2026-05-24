import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using placeholder mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", async (req, res) => {
  let geminiStatus = "untested";
  let geminiError = null;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    if (apiKey) {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: "Hi",
      });
      geminiStatus = `success: ${response.text?.substring(0, 50)}`;
    } else {
      geminiStatus = "missing_api_key_env_var";
    }
  } catch (err: any) {
    geminiStatus = "failed";
    geminiError = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      raw: err
    };
  }

  res.json({
    status: "ok",
    time: new Date().toISOString(),
    env_key_exists: !!apiKey,
    env_key_length: apiKey ? apiKey.length : 0,
    gemini_status: geminiStatus,
    gemini_error: geminiError
  });
});

// Endpoint: AI Chat and Speech generator prompts
app.post("/api/gemini/chat", async (req, res) => {
  const { message, systemPrompt, conversationHistory, attachment } = req.body;
  
  try {
    const ai = getAiClient();
    
    // Default system instruction focuses on being an empathetic, strict but supportive productivity coach
    const systemInstruction = systemPrompt || 
      "You are a futuristic Virtual Student Assistant and high-discipline Productivity Coach. " +
      "Maintain an ultra-supportive, encouraging, yet absolute discipline-oriented personality. " +
      "Keep responses highly conversational, direct, and concise (under 3 sentences) so they can be spoken aloud and fit easily on a dashboard. " +
      "Guide students to stop procrastinating, schedule break routines, and study focused.";

    const contents = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Append historical messages
      for (const turn of conversationHistory) {
        contents.push({
          role: turn.role === "assistant" ? "model" : "user",
          parts: [{ text: turn.text }]
        });
      }
    }

    // Build parts for the user prompt
    const userParts: any[] = [];
    let finalMessage = message;

    if (attachment) {
      if (attachment.type.startsWith("image/")) {
        // If it's an image, pass it as modal part inlineData
        userParts.push({
          inlineData: {
            mimeType: attachment.type,
            data: attachment.data // base64 payload
          }
        });
        // Introduce image attachment context
        finalMessage = `[User has uploaded a screenshot/image study note named "${attachment.name}" which you see attached. Provide encouraging feedback/answers about it!] ${message}`;
      } else {
        // If it's a file, decode text documents (logs, code, custom tables, text, CSV, markdown, simple PDFs)
        try {
          const decodedText = Buffer.from(attachment.data, "base64").toString("utf-8");
          finalMessage = `[Attached Documents/Classroom Homework file: ${attachment.name}]\n=== TEXT FILE CONTENT ===\n${decodedText}\n========================\n\nUser Question/Goal: ${message}`;
        } catch (err: any) {
          finalMessage = `[Attached File: ${attachment.name} (Binary size: ${attachment.size || 0} bytes)] ${message}`;
        }
      }
    }

    userParts.push({ text: finalMessage });
    contents.push({ role: "user", parts: userParts });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ 
      error: "Could not fetch AI advice", 
      details: error.message,
      text: "I might be experiencing a brief network interrupt, but remember: consistency is key. Keep pushing forward!" 
    });
  }
});

// Endpoint: Smart AI Scheduling Generator
app.post("/api/gemini/schedule", async (req, res) => {
  const { dailyGoals, examDates, learningStyle, sleepHours, subjectPreferences } = req.body;

  try {
    const ai = getAiClient();
    const prompt = `Generate a rigorous, optimized daily student schedule with hourly time stamps. 
Daily Goals: ${dailyGoals || "General study and review"}
Exam Dates: ${examDates || "None upcoming"}
Learning Style: ${learningStyle || "Visual / Pomodoro focus"}
Target Sleep: ${sleepHours || "7-8"} hours
Subject Preferences: ${subjectPreferences || "All core syllabus"}

Return a JSON array of events representing the ideal study routine. Include breaks, review slots, and recreation. Each event must strictly have:
- title: string
- time: string (e.g., "09:00 AM - 10:30 AM")
- type: string (one of: "study", "break", "exam-prep", "recreation", "wellness")
- description: string (short prompt of what to study/do)
- focusTip: string (AI recommendation for focus during this block)
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              time: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              focusTip: { type: Type.STRING }
            },
            required: ["title", "time", "type", "description", "focusTip"]
          }
        }
      }
    });

    const bodyText = response.text || "[]";
    res.json(JSON.parse(bodyText.trim()));
  } catch (error: any) {
    console.error("Gemini Schedule Error:", error);
    res.status(500).json({ 
      error: "Could not generate AI schedule", 
      details: error.message,
      fallback: [
        { title: "Deep Work Core Study", time: "09:00 AM - 10:30 AM", type: "study", description: "Focus on heaviest scientific/mathematical topics. Write summaries.", focusTip: "Keep all browser tabs closed!" },
        { title: "Active Mental Recovery Break", time: "10:30 AM - 10:45 AM", type: "break", description: "Stand up, drink a cold glass of water, and stretch. No phone!", focusTip: "Physical movement boosts circulation." },
        { title: "Syllabus Exercise & Revision", time: "10:45 AM - 12:15 PM", type: "exam-prep", description: "Do mock test templates, active flashcard reviews.", focusTip: "Test yourself instead of just reading." },
        { title: "Mindfulness Reset Session", time: "12:15 PM - 12:30 PM", type: "wellness", description: "Short breath awareness reset. Balance stressors.", focusTip: "Deep breathing controls adrenal release." }
      ]
    });
  }
});

// Endpoint: Behavioral Procrastination Advisor
app.post("/api/gemini/behavior", async (req, res) => {
  const { streakCount, missedTasksCount, scrollingAlertCount, studyMinutes, moodRating } = req.body;

  try {
    const ai = getAiClient();
    const prompt = `Analyze the student's metrics:
Streak Count: ${streakCount || 0} consecutive days
Missed Planned Tasks: ${missedTasksCount || 0} in last 2 days
Distraction Scrolling Incidents: ${scrollingAlertCount || 0} reels/feed blocks hit today
Study Minutes Completed: ${studyMinutes || 0} minutes today
Mood Rating: ${moodRating || "Neutral"}

Provide a discipline report card. Return JSON with format:
{
  "disciplineScore": number (1-100 scale),
  "procrastinationProbability": string ("Low", "Moderate", "Critical"),
  "distractionTriggerAnalysis": string,
  "actionSteps": array of strings (concrete actions to double concentration immediately),
  "motivationalNudge": string (a strict yet moving quote tailored to their current state)
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disciplineScore: { type: Type.INTEGER },
            procrastinationProbability: { type: Type.STRING },
            distractionTriggerAnalysis: { type: Type.STRING },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            motivationalNudge: { type: Type.STRING }
          },
          required: ["disciplineScore", "procrastinationProbability", "distractionTriggerAnalysis", "actionSteps", "motivationalNudge"]
        }
      }
    });

    const bodyText = response.text || "{}";
    res.json(JSON.parse(bodyText.trim()));
  } catch (error: any) {
    console.error("Gemini Behavior Advisor Error:", error);
    res.status(500).json({
      error: "Could not generate behavioral report",
      details: error.message,
      fallback: {
        disciplineScore: 78,
        procrastinationProbability: "Moderate",
        distractionTriggerAnalysis: "Slight surge in reels Scrolling and feed habits. Mood state affects early study hour consistency.",
        actionSteps: [
          "Activate standard Detox Block on study devices.",
          "Write down one single topic card limit and finish it before lunch.",
          "Keep physical phone out of arms reach entirely."
        ],
        motivationalNudge: "The price of discipline is always less than the pain of regret. Choose your pain wisely."
      }
    });
  }
});

// Vite Setup for Dev & Production Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK CORE] Live on host 0.0.0.0, port ${PORT}`);
  });
}

startServer();
