import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, Flame, User, Radio, Cpu, Smartphone, Calendar, Target, HelpCircle, Terminal } from "lucide-react";

import VoiceAssistant from "./components/VoiceAssistant";
import SchedulePlanner from "./components/SchedulePlanner";
import AddictionControl from "./components/AddictionControl";
import FocusMode from "./components/FocusMode";
import GoalAndTrackers from "./components/GoalAndTrackers";
import AcademicAnalytics from "./components/AcademicAnalytics";
import AccountabilityRoom from "./components/AccountabilityRoom";
import TaskAutomation from "./components/TaskAutomation";

import { StudentProfile, ScheduleEvent, Goal, Habit, Badge, ChatMessage, FocusLog, AddictionLog, WellnessCheckin, DailyChallenge, UnlockableReward } from "./types";
import { translations } from "./translations";

export default function App() {
  const [activeTab, setActiveTab] = useState<"coach" | "schedule" | "addiction" | "focus" | "goals" | "automation">("coach");
  const [persona, setPersona] = useState<"zara" | "tariq" | "cyborg" | "calm" | "friendly" | "male">("zara");
  const [voiceLanguage, setVoiceLanguage] = useState<"en" | "ur" | "hi" | "ar" | "pa">("en");

  const [automationTrigger, setAutomationTrigger] = useState<{
    type: "desktop" | "whatsapp";
    folderName?: string;
    contactName?: string;
    contactPhone?: string;
    messageText?: string;
  } | null>(null);

  const handleVoiceLanguageChange = (l: "en" | "ur" | "hi" | "ar" | "pa") => {
    setVoiceLanguage(l);
    if (l === "ur") {
      setLanguage("ur");
    } else if (l === "en") {
      setLanguage("en");
    }
  };

  // Language translation support
  const [language, setLanguage] = useState<"en" | "ur">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("discipline_lang");
      return (saved === "ur" || saved === "en") ? saved : "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("discipline_lang", language);
  }, [language]);

  // Voice Speech trigger state - pass down to VoiceAssistant triggers
  const [voiceAnnouncement, setVoiceAnnouncement] = useState("");

  // Student Profile global state
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Alex Foster",
    level: 1,
    xp: 0,
    xpRequired: 100,
    totalStreak: 5, // Days study streak
    learningStyle: "Visual",
    productivityType: "Pomodoro Master",
    targetSleepHours: 8.0,
    weakSubjects: ["Calculus II Integration Limits", "Chemical Synthesis reaction dynamics"],
    examCountdowns: [
      { id: "e1", subject: "Calculus finals", date: "2026-06-12", daysLeft: 20 },
      { id: "e2", subject: "Chemistry Laboratory Exam", date: "2026-05-30", daysLeft: 7 }
    ]
  });

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([
    { id: "dc1", title: "Complete at least one standard Study Block", titleUrdu: "کم از کم ایک معیاری مطالعہ کا دورانیہ مکمل کریں", isCompleted: false, xpReward: 40 },
    { id: "dc2", title: "Maintain high consistency standard: No wasted browse feeds", titleUrdu: "اعلی تسلسل برقرار رکھیں: کوئی فضول براؤز فیڈ نہیں ہونی چاہئے", isCompleted: false, xpReward: 50 },
    { id: "dc3", title: "Calibrate and log daily wellness check diagnostics", titleUrdu: "صحت کا روزمرہ جائزہ لیں اور فارم جمع کریں", isCompleted: false, xpReward: 30 }
  ]);

  const [rewards, setRewards] = useState<UnlockableReward[]>([
    {
      id: "rew1",
      title: "Cyberpunk Lofi Synth-Hum Stream",
      titleUrdu: "سائبرپنک لوفائی سنتھ تھرتھراہٹ اسٹریم",
      description: "Unlocks an exquisite background hum with extra cerebral focus retention.",
      descriptionUrdu: "ایک بہترین نوائس تھرتھراہٹ چالو کریں جو توجہ دگنا کرنے میں مدد کرتی ہے۔",
      requiredLevel: 2,
      isUnlocked: false,
      isActivated: false
    },
    {
      id: "rew2",
      title: "Digital Minimalism Survival PDF Guide",
      titleUrdu: "ڈیجیٹل خلاصی کی بقا کا کتابچہ",
      description: "Unlocked direct copy of elite strategies for focus recovery and phone blocking.",
      descriptionUrdu: "توجہ حاصل کرنے اور فون بلاک کرنے کی منفرد خفیہ حکمت عملیوں کی کاپی حاصل کریں۔",
      requiredLevel: 3,
      isUnlocked: false,
      isActivated: false
    },
    {
      id: "rew3",
      title: "Academic Circle Elder Aura Avatar Frame",
      titleUrdu: "ہم جماعتوں کے دائرے کا بزرگ اورا فریم",
      description: "Showcases a shining crimson borders in Accountability study circle list.",
      descriptionUrdu: "ہم جماعتی فہرست میں ایک چمکتا ہوا سرخ اورا والا فریم چالو کریں۔",
      requiredLevel: 4,
      isUnlocked: false,
      isActivated: false
    },
    {
      id: "rew4",
      title: "Direct Gemini-Pro Deep Analysis Cell Priority",
      titleUrdu: "براہ راست جیمنی پرو گہرے تجزیہ کار سیل",
      description: "Priority tokens for the AI Coach deep work reviews.",
      descriptionUrdu: "اے آئی استاد سے ترجیحی بنیادوں پر گہرے تجزیاتی جائزے اور ریویوز حاصل کریں۔",
      requiredLevel: 5,
      isUnlocked: false,
      isActivated: false
    }
  ]);

  // Synchronize rewards locks to level changes
  useEffect(() => {
    setRewards(prev => prev.map(reward => ({
      ...reward,
      isUnlocked: profile.level >= reward.requiredLevel
    })));
  }, [profile.level]);

  // Global Lists States
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([
    {
      id: "ai-initial-1",
      title: "Active Practice Integration Questions",
      time: "09:00 AM - 10:30 AM",
      type: "study",
      description: "Solve 10 textbook calculus questions focusing on trigonometric substitutions.",
      focusTip: "Hide physical phone in another room.",
      isCompleted: false
    },
    {
      id: "ai-initial-2",
      title: "Mindfulness Breathing Reset",
      time: "10:30 AM - 10:45 AM",
      type: "break",
      description: "Drink cold water, look out window, rest optic nerves.",
      focusTip: "Zero screen contact.",
      isCompleted: false
    }
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", title: "Complete 2 complete focus blocks", category: "Academic", type: "daily", isCompleted: false, xpValue: 25 },
    { id: "g2", title: "Maintain high consistency streak through weekend", category: "Habit", type: "milestone", isCompleted: false, xpValue: 75 }
  ]);

  const [habits, setHabits] = useState<Habit[]>([
    { id: "h1", title: "Daily Formula Recall Flashcards", streak: 3, lastCompletedDate: "2026-05-22", frequency: "daily", type: "positive" },
    { id: "h2", title: "Social Feed Infinite Scrolling", streak: 1, lastCompletedDate: "", frequency: "daily", type: "negative" }
  ]);

  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: "init-ch-1", role: "assistant", text: "Welcome Alex. Deep study systems running. I am monitoring active schedules and distraction blocks in real time. Submit your targets, or ask me for tips of focus.", timestamp: "09:00 AM" }
  ]);

  const [wellnessCheck, setWellnessCheck] = useState<WellnessCheckin | null>({
    timestamp: "09:00 AM",
    mood: "Focused",
    energyLevel: 8,
    stressLevel: 3,
    sleepHoursLastNight: 7.5
  });

  const [detoxModeActive, setDetoxModeActive] = useState(false);
  const [timeWastedHours, setTimeWastedHours] = useState(0.0);

  // Focus and Addiction Logs history
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [addictionLogs, setAddictionLogs] = useState<AddictionLog[]>([]);
  const [xpAnnouncements, setXpAnnouncements] = useState<{ id: string; msg: string }[]>([]);

  // Function to reward XP and handle leveling mechanics dynamically
  const rewardXP = (amount: number, reason: string) => {
    setProfile(cur => {
      let nextXp = cur.xp + amount;
      let nextLevel = cur.level;
      let nextRequired = cur.xpRequired;
      let leveledUp = false;

      while (nextXp >= nextRequired) {
        nextXp -= nextRequired;
        nextLevel += 1;
        nextRequired = 100 * nextLevel;
        leveledUp = true;
      }

      if (leveledUp) {
        // Trigger high priority verbal level up voice cue
        setVoiceAnnouncement(`LEVEL UP CONQUEST CONQUERED! Excellent study consistency has propelled you to Level ${nextLevel}! Double down on focus cells.`);
      }

      return {
        ...cur,
        level: nextLevel,
        xp: nextXp,
        xpRequired: nextRequired
      };
    });

    // Toggle short graphical floating XP toast feed
    const toastId = `xp-${Date.now()}`;
    setXpAnnouncements(prev => [...prev, { id: toastId, msg: `+${amount} XP: ${reason}` }]);
    setTimeout(() => {
      setXpAnnouncements(prev => prev.filter(t => t.id !== toastId));
    }, 4500);
  };

  const handleTriggerVoiceSpeech = (text: string) => {
    setVoiceAnnouncement(text);
  };

  const handleClearSpeechTrigger = () => {
    setVoiceAnnouncement("");
  };

  // Contacts backend router /api/gemini/chat to proxy prompts
  const handleSendChatToAI = async (
    text: string, 
    attachment?: { name: string; type: string; previewUrl?: string; size?: number; data?: string }
  ): Promise<string> => {
    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-usr`,
      role: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: attachment
    };
    setChatHistory(prev => [...prev, userMsg]);

    try {
      // Build active contextual history for the conversation
      const lastThreeTurns = chatHistory.slice(-4).map(turn => ({
        role: turn.role,
        text: turn.text
      }));

      // Setup dynamic character system instruction based on chosen persona
      let assistantRoleInstruct = "";
      if (persona === "zara") {
        assistantRoleInstruct = "You are Zara, a highly empathetic, warm, positive, sisterly, and soft academic companion coach. Avoid clinical prefixes. Be compassionate, supportive, and friendly, using a comforting female coaching personality.";
      } else if (persona === "tariq") {
        assistantRoleInstruct = "You are Tariq, an elite, high-discipline, strict military-grade productivity tutor. Be stern, demanding, direct, highly actions-driven, and brief. Push the student to complete their study sessions with absolute efficiency.";
      } else if (persona === "cyborg") {
        assistantRoleInstruct = "You are Cyborg, a futuristic cybernetic oracle with a mechanical mind and direct diagnostics telemetry. Use monotone mechanical telemetry, diagnostics indicators, and structured algorithms.";
      } else if (persona === "calm") {
        assistantRoleInstruct = "You are Calm Pro, a serene, smooth, and balanced executive academic coach. Use a balanced, quiet, low-stress professional voice with full intellectual composure, delivering structural, expert solutions.";
      } else if (persona === "friendly") {
        assistantRoleInstruct = "You are Friendly Assistant, a highly cheerful, positive, empathetic and high-energy study buddy cohort. Encourage with high-spirited supporting backing and pleasant study room energy.";
      } else if (persona === "male") {
        assistantRoleInstruct = "You are Deep Male, a solid, protective, mature, and slightly elder authoritative guide. Talk with deep chest register, slow-paced pacing, reliable direct guidelines, and wise motivation.";
      }

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: lastThreeTurns,
          attachment: attachment,
          systemPrompt: `
            ${assistantRoleInstruct}
            
            Current User Stats: Style: ${profile.learningStyle}, Type: ${profile.productivityType}.
            
            DIRECTIONS FOR MULTI-LINGUAL AUTO-DETECTION:
            - Analyze the user's incoming message: "${text}".
            - You must respond in the same language family the user is speaking/expressing themselves in:
              a) URDU (or Romanized Urdu like 'kya hal hai', 'bhai help kro', 'folder bna do'): Reply strictly in fluent, natural Urdu script/characters (اردو متن میں). Do NOT use roman text.
              b) HINDI (or Romanized Hindi like 'kaise ho'): Reply strictly in Devanagari Hindi script (हिंदी में).
              c) ARABIC: Reply strictly in elegant Arabic script (العربية).
              d) PUNJABI (or Romanized Punjabi like 'ki haal ae'): Reply strictly in Gurmukhi/Shahmukhi script or standard Punjabi.
              e) ENGLISH: Reply back in natural conversational English.
            - Ensure the speaking style feels highly authentic, helpful, and natural (like a human conversation). Never use robotic greetings, standard AI disclaimers, or verbose bulleted lists. Limit to 2-3 short, spoken sentences.

            HANDS-FREE PHYSICAL DESKTOP & WHATSAPP AUTOMATION COMMANDS:
            If the user explicitly asks you to commit an action such as creating a folder/directory on their desktop, or sending a message to a WhatsApp contact:
            1. Acknowledge the confirmation naturally in the spoken response (e.g. "Sure, making that directory right now on your machine." or "Bilkul, aap k dost ko WhatsApp paigham bhaij rha hu.").
            2. At the absolute end of your response, on a new line, append the exact machine action token:
               - To open/create desktop folder:
               [ACTION:CREATE_FOLDER Name="<CalculatedFolderName>"]
               - To queue/dispatch a real WhatsApp buddy message:
               [ACTION:SEND_WHATSAPP To="<ContactName>" Phone="<ContactPhone>" Message="<CalculatedMessageText>"]
            Make sure to calculate these details from their request. If no phone number is specified for WhatsApp, use "+92 312 4567890". Keep folder name short.
          `
        })
      });

      if (!response.ok) {
        throw new Error("Proxy error");
      }

      const data = await response.json();
      const answer = data.text || "Discipline builds giants. Maintain focused concentration.";

      let cleanedAnswer = answer;
      
      // Attempt to extract action trigger directives
      const folderMatch = answer.match(/\[ACTION:CREATE_FOLDER\s+Name="([^"]+)"\]/i);
      const whatsappMatch = answer.match(/\[ACTION:SEND_WHATSAPP\s+To="([^"]+)"\s+Phone="([^"]*)"\s+Message="([^"]+)"\]/i);

      if (folderMatch) {
         const fName = folderMatch[1];
         // Switch tab and queue automation action
         setActiveTab("automation");
         setAutomationTrigger({
           type: "desktop",
           folderName: fName
         });
         // Clean action tag from speech bubble
         cleanedAnswer = answer.replace(/\[ACTION:CREATE_FOLDER\s+Name="[^"]+"\]/gi, "").trim();
      } else if (whatsappMatch) {
         const to = whatsappMatch[1];
         const phone = whatsappMatch[2] || "+92 312 4567890";
         const msg = whatsappMatch[3];
         // Switch tab and queue automation action
         setActiveTab("automation");
         setAutomationTrigger({
           type: "whatsapp",
           contactName: to,
           contactPhone: phone,
           messageText: msg
         });
         // Clean action tag from speech bubble
         cleanedAnswer = answer.replace(/\[ACTION:SEND_WHATSAPP\s+To="[^"]+"\s+Phone="[^"]*"\s+Message="[^"]+"\]/gi, "").trim();
      }

      // Local Regex Triggers as Fallback if AI does not format brackets properly
      if (!folderMatch && !whatsappMatch) {
        const textLower = text.toLowerCase();
        if (textLower.includes("create folder") || textLower.includes("make folder") || textLower.includes("فولڈر بنائیں") || textLower.includes("فولڈر بنادیں")) {
          let folderNameParsed = "Calculus Notes";
          const matchName = text.match(/(?:named|folder|create)\s+["']?([^"'\s]+)["']?/i);
          if (matchName && matchName[1]) folderNameParsed = matchName[1];
          setActiveTab("automation");
          setAutomationTrigger({
            type: "desktop",
            folderName: folderNameParsed
          });
        } else if (textLower.includes("whatsapp") || textLower.includes("واٹس ایپ") || textLower.includes("whatsapp send") || textLower.includes("whatsapp message")) {
          let contactParsed = "Hiroshi study-cohort";
          if (textLower.includes("hiroshi")) contactParsed = "Hiroshi study-cohort";
          else if (textLower.includes("alex")) contactParsed = "Alex Foster";
          
          setActiveTab("automation");
          setAutomationTrigger({
            type: "whatsapp",
            contactName: contactParsed,
            contactPhone: "+92 312 4567890",
            messageText: "Hey buddy! I initialized automated study focus. Let's sync up on accountability circle!"
          });
        }
      }

      // Append assistant text
      const assistantMsg: ChatMessage = {
        id: `chat-${Date.now()}-ast`,
        role: "assistant",
        text: cleanedAnswer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, assistantMsg]);
      return cleanedAnswer;
    } catch (e) {
      console.error(e);
      // Fallback
      let fallbackStr = "Consistency builds characters. No connection limits will stop a disciplined student. Focus!";
      
      const fallbacksEn: Record<string, string[]> = {
        zara: [
          "I'm right here with you! Let's keep our focus and keep learning, step by step.",
          "You've got this! Remember to take a deep breath and keep going. What topic are we tackling next?",
          "Consistency is key, my friend. Let's do our best together!",
          "Even if there is a small tech glitch, we won't let it interrupt our studies. Keep going!"
        ],
        tariq: [
          "No excuses. Your goals don't care about network latency. Get back to work immediately.",
          "Discipline is the bridge between goals and accomplishment. Stop stalling.",
          "Action beats contemplation. Put the phone away and study.",
          "Consistency builds character. Zero excuses. Keep pushing!"
        ],
        cyborg: [
          "TELEMETRY STATUS: OFFLINE. Core directive remains active: maintain focus cycles.",
          "DIAGNOSTICS: Network packet disruption. Re-routing priority to task completion.",
          "CRITICAL ADVICE: Optimize study throughput now.",
          "TELEMETRY WARNING: Maintain disciplined pacing regardless of connection state."
        ],
        calm: [
          "Let's keep a composed mind and move forward systematically. What is your primary objective right now?",
          "Maintain composure. Excellence is a daily habit, not a single act.",
          "Composure under any state is the hallmark of professional studies. Keep focused."
        ],
        friendly: [
          "Hey study buddy! Let's smash this session together. No distractions, okay?",
          "We are in this together! Let's get back to those study notes and crush it!",
          "No worries about the internet, let's keep our minds on the goal and revision!"
        ],
        male: [
          "Stay strong. Hard work is quiet, but results are loud. Keep your head down and build.",
          "Consistency is what makes the master. Focus on the work ahead.",
          "Discipline doesn't depend on connections or latency. Stand tall and continue."
        ]
      };

      const fallbacksUr: Record<string, string[]> = {
        zara: [
          "میں یہیں آپ کے ساتھ ہوں! آئیں مل کر توجہ کے ساتھ پڑھیں، قدم بہ قدم۔",
          "آپ یہ کر سکتے ہیں! بس لمبا سانس لیں اور آگے بڑھیں۔ ابھی ہم کیا پڑھنے والے ہیں؟",
          "ثابت قدمی سب سے اہم ہے میرے دوست۔ آئیں مل کر اپنی بھرپور کوشش کریں!",
          "تکنیکی دنیا کے مسائل ہمیں اپنی پڑھائی سے نہیں روک سکتے۔ محنت جاری رکھیں!"
        ],
        tariq: [
          "کوئی بہانہ نہیں چلے گا۔ پڑھائی اور کامیابی کے لیے توجہ سب سے ضروری ہے۔",
          "ڈسپلن ہی ارادوں کو کامیابی میں بدلتا ہے۔ وقت ضائع کرنا فورا بند کریں۔",
          "کرنے سے ہی بات بنتی ہے، سوچنے سے نہیں۔ فون دور رکھیں اور پڑھیں۔",
          "ثابت قدمی ہی انسان کو بڑا بناتی ہے۔ کوئی بہانہ نہیں، پڑھتے رہیں!"
        ],
        cyborg: [
          "ٹیلی میٹری اسٹیٹس: آف لائن۔ کور ڈائریکٹو فعال ہے: اپنی توجہ برقرار رکھیں۔",
          "ڈائیگنوسٹکس: نیٹ ورک منقطع۔ متبادل ترجیح: پہلے اپنے اسباق مکمل کریں۔",
          "اہم مشورہ: اس وقت اپنی پڑھائی کی رفتار کو تیز اور پختہ کریں۔",
          "ٹیلی میٹری وارننگ: بغیر کسی رکاوٹ کے اپنے پڑھائی کے کام جاری رکھیں۔"
        ],
        calm: [
          "آئیں پرسکون رہیں اور باقاعدگی سے آگے بڑھیں۔ اس وقت آپ کا بنیادی مقصد کیا ہے؟",
          "اپنے اعصاب قابو میں رکھیں۔ عمدہ کارکردگی مسلسل عادت کا نام ہے، محض ایک عمل کا نہیں۔",
          "پرسکون رہنا ہی سمجھداری ہے۔ اپنے مقاصد پر نظر جمائے رکھیں۔"
        ],
        friendly: [
          "ارے میرے پیارے پارٹنر! آئیں مل کر اس پڑھائی کو ختم کریں، بغیر کسی غفلت کے!",
          "ہم مل کر یہ کام کر رہے ہیں! آئیں اپنی کتابیں کھولیں اور اس کورس کو ختم کریں!",
          "انٹرنیٹ کا کوئی مسئلہ نہیں، بس اپنی پڑھائی پر توجہ رکھیں!"
        ],
        male: [
          "مضبوط بنو۔ خاموشی سے محنت کرو اور نتائج کو خود بولنے دو۔ اپنا سر جھکا کر کام جاری رکھو۔",
          "مستقل مزاجی ہی انسان کو استاد بناتی ہے۔ بس اگلی پڑھائی پر دھیان دو۔",
          "ڈسپلن کا نیٹ ورک یا انٹرنیٹ سے کوئی لینا دینا نہیں۔ حوصلہ بلند رکھو اور آگے بڑھو۔"
        ]
      };

      const selectedFallbacks = language === "ur" ? fallbacksUr[persona] || fallbacksUr.zara : fallbacksEn[persona] || fallbacksEn.zara;
      fallbackStr = selectedFallbacks[Math.floor(Math.random() * selectedFallbacks.length)];

      const fallbackMsg: ChatMessage = {
        id: `chat-${Date.now()}-ast`,
        role: "assistant",
        text: fallbackStr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, fallbackMsg]);
      return fallbackStr;
    }
  };

  // Update exam countdown increments day by day
  useEffect(() => {
    const today = new Date();
    setProfile(cur => {
      const updatedExams = cur.examCountdowns.map(ex => {
        const target = new Date(ex.date);
        const diff = Math.max(0, target.getTime() - today.getTime());
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return { ...ex, daysLeft: days };
      });
      return { ...cur, examCountdowns: updatedExams };
    });
  }, []);

  const t = translations[language];

  return (
    <div 
      dir={language === "ur" ? "rtl" : "ltr"} 
      className={`min-h-screen text-slate-150 flex flex-col bg-[#070a11] select-none ${language === "ur" ? "font-urdu" : "font-sans"}`}
    >
      
      {/* GLOWING XP FLOATING FEED BAR */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-1.5 pointer-events-none">
        {xpAnnouncements.map((toast) => (
          <div key={toast.id} className="bg-indigo-950/90 border border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.25)] text-indigo-400 font-mono text-xs font-bold px-3.5 py-2 rounded-xl animate-fade-in flex items-center gap-2">
            <Trophy className="h-4 w-4 animate-bounce" />
            <span>{toast.msg}</span>
          </div>
        ))}
      </div>

      {/* HEADER SECTION */}
      <header className="p-4 bg-[#0B0F17] border-b border-[#1E293B] sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-950/40 relative">
              <Cpu className="h-5 w-5 text-white animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 blur-sm opacity-35 -z-10"></div>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">{t.logoTitle}</h1>
              <p className="text-[10px] font-mono text-slate-400">{t.logoSub}</p>
            </div>
          </div>

          {/* Gamification Level State Header Card */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Language Toggler Button Option */}
            <button
              type="button"
              id="language-switch-btn"
              onClick={() => setLanguage(l => l === "en" ? "ur" : "en")}
              className="flex items-center gap-1 bg-[#161F30] border border-[#1E293B] hover:bg-[#1E293B] text-slate-200 text-xs px-2.5 py-1.5 rounded-xl cursor-pointer transition font-bold"
            >
              🌐 {language === "en" ? "اردو (Urdu)" : "English"}
            </button>

            {/* Study Streak indicator */}
            <div className="flex items-center gap-1.5 bg-[#070a11] border border-[#1E293B] px-3 py-1.5 rounded-xl">
              <Flame className="h-4 w-4 text-orange-500 animate-[bounce_1.5s_infinite]" />
              <div className="text-left font-sans">
                <span className="text-emerald-400 font-bold block text-xs leading-none">{profile.totalStreak} {t.days}</span>
                <span className="text-[8px] text-slate-500 uppercase font-semibold">{t.streakTitle}</span>
              </div>
            </div>

            {/* Level Card */}
            <div className="flex items-center gap-3 bg-[#070a11] border border-[#1E293B] px-3.5 py-1.5 rounded-xl">
              <div className="text-left">
                <div className="flex items-baseline gap-1 font-mono leading-none">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase">{t.lvl}</span>
                  <span className="text-base font-black text-slate-100">{profile.level}</span>
                </div>
                <span className="text-[8px] text-slate-500 uppercase block font-semibold">{t.lvlTitle}</span>
              </div>

              {/* Progress Bar inside */}
              <div className="w-16 sm:w-24">
                <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mb-0.5 leading-none">
                  <span>{profile.xp} {t.xpText}</span>
                  <span>{profile.xpRequired} {t.reqText}</span>
                </div>
                <div className="w-full bg-[#0B0F17] h-2 rounded border border-[#1E293B]/60 overflow-hidden relative">
                  <div 
                    style={{ width: `${(profile.xp / profile.xpRequired) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded transition-all duration-700"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER LAYOUT */}
      <main className="max-w-7xl mx-auto p-4 w-full flex-1 flex flex-col gap-4">
        
        {/* TAB LIST BAR */}
        <div id="dashboard-navbar" className="flex flex-wrap items-center gap-2 border-b border-[#1E293B] pb-2">
          <button
            type="button"
            id="nav-tab-coach"
            onClick={() => setActiveTab("coach")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "coach" 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.tabCoach}</span>
          </button>

          <button
            type="button"
            id="nav-tab-schedule"
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "schedule" 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.tabSchedule}</span>
          </button>

          <button
            type="button"
            id="nav-tab-addiction"
            onClick={() => setActiveTab("addiction")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "addiction" 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.tabAddiction}</span>
          </button>

          <button
            type="button"
            id="nav-tab-focus"
            onClick={() => setActiveTab("focus")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "focus" 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.tabFocus}</span>
          </button>

          <button
            type="button"
            id="nav-tab-goals"
            onClick={() => setActiveTab("goals")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "goals" 
                ? "bg-indigo-950/40 border-indigo-500/50 text-indigo-400 font-bold" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.tabGoals}</span>
          </button>

          <button
            type="button"
            id="nav-tab-automation"
            onClick={() => setActiveTab("automation")}
            className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition duration-300 cursor-pointer ${
              activeTab === "automation" 
                ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]" 
                : "bg-[#0B0F17]/40 border-[#1E293B] text-slate-400 hover:text-cyan-300"
            }`}
          >
            <Terminal className="h-4.5 w-4.5 text-cyan-400" />
            <span>{t.tabAutomation}</span>
          </button>
        </div>

        {/* ACTIVE COGNITIVE SUBVIEWS BENTO GRIDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 items-stretch">
          
          {/* LEFT 2 COLUMNS: SUB-VIEW MODULES */}
          <div className="lg:col-span-2 flex flex-col">
            {activeTab === "coach" && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-1">
                <div className="md:col-span-3 flex flex-col h-[400px] md:h-full">
                  <VoiceAssistant 
                    onSendMessage={handleSendChatToAI} 
                    history={chatHistory} 
                    announceTrigger={voiceAnnouncement}
                    onClearAnnounceTrigger={handleClearSpeechTrigger}
                    language={language}
                    persona={persona}
                    onChangePersona={setPersona}
                    voiceLanguage={voiceLanguage}
                    onChangeVoiceLanguage={handleVoiceLanguageChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <AccountabilityRoom 
                    onRewardXP={rewardXP} 
                    onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech} 
                    language={language}
                  />
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div className="flex-1">
                <SchedulePlanner 
                  schedule={schedule}
                  onUpdateSchedule={setSchedule}
                  onRewardXP={rewardXP}
                  onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
                  profile={profile}
                  language={language}
                />
              </div>
            )}

            {activeTab === "addiction" && (
              <div className="flex-1">
                <AddictionControl 
                  onAddictionLog={(log) => setAddictionLogs(prev => [log, ...prev])}
                  onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
                  onModifyTimeWastageHours={(hours) => setTimeWastedHours(prev => prev + hours)}
                  detoxActive={detoxModeActive}
                  onToggleDetox={setDetoxModeActive}
                  language={language}
                />
              </div>
            )}

            {activeTab === "focus" && (
              <div className="flex-1">
                <FocusMode 
                  onAddFocusLog={(log) => setFocusLogs(prev => [log, ...prev])}
                  onRewardXP={rewardXP}
                  onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
                  language={language}
                />
              </div>
            )}

            {activeTab === "goals" && (
              <div className="flex-1">
                <GoalAndTrackers 
                  goals={goals}
                  onUpdateGoals={setGoals}
                  habits={habits}
                  onUpdateHabits={setHabits}
                  rewardBadges={earnedBadges}
                  onAddBadge={(badge) => setEarnedBadges(prev => [...prev, badge])}
                  activeWellness={wellnessCheck}
                  onUpdateWellness={setWellnessCheck}
                  onRewardXP={rewardXP}
                  onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
                  language={language}
                  dailyChallenges={dailyChallenges}
                  onUpdateDailyChallenges={setDailyChallenges}
                  rewards={rewards}
                  onUpdateRewards={setRewards}
                  currentLevel={profile.level}
                />
              </div>
            )}

            {activeTab === "automation" && (
              <div className="flex-1">
                <TaskAutomation 
                  onRewardXP={rewardXP}
                  onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
                  language={language}
                  externalTrigger={automationTrigger}
                  onClearExternalTrigger={() => setAutomationTrigger(null)}
                />
              </div>
            )}
          </div>

          {/* RIGHT PANELS COLUMN: PERMANENT ACADEMIC COGNITIVE MACHINE LEARNING REPORTS */}
          <div className="flex flex-col">
            <AcademicAnalytics 
              profile={profile}
              onUpdateProfile={setProfile}
              focusLogs={focusLogs}
              addictionLogs={addictionLogs}
              timeWastedHours={timeWastedHours}
              onTriggerVoiceAnnouncement={handleTriggerVoiceSpeech}
              streakCount={profile.totalStreak}
              language={language}
            />
          </div>

        </div>

      </main>

      {/* FOOTER METRIC BRAND */}
      <footer className="p-4 bg-[#0B0F17] border-t border-[#1E293B] text-center text-xs text-slate-500 font-sans">
        <div>
          <span>{language === "ur" ? "ڈسپلن برائے مصنوعی ذہانت — مستقل مزاجی اور گہرے مطالعے کا معاون نظام © 2026" : "Discipline AI System — Empowering consistent student growth and deep study concentration © 2026"}</span>
        </div>
      </footer>
    </div>
  );
}
