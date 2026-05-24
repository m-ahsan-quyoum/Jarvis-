import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, Play, Square, User, Bot, AlertTriangle, Paperclip, Image, X, FileText } from "lucide-react";
import { ChatMessage } from "../types";
import { translations } from "../translations";

// Self-Echo checking helper to prevent the microphone from transcribing the robot's speakers output
function isSelfEcho(transcript: string, lastSpoken: string): boolean {
  if (!lastSpoken) return false;
  const tNorm = transcript.toLowerCase().replace(/[^a-z0-9\s\u0600-\u06FF\u0900-\u097F\u0A00-\u0A7F]/g, "").trim();
  const sNorm = lastSpoken.toLowerCase().replace(/[^a-z0-9\s\u0600-\u06FF\u0900-\u097F\u0A00-\u0A7F]/g, "").trim();
  if (!tNorm || !sNorm) return false;
  
  if (tNorm === sNorm || sNorm.includes(tNorm) || tNorm.includes(sNorm)) {
    return true;
  }
  
  const tWords = tNorm.split(/\s+/);
  const sWords = sNorm.split(/\s+/);
  let matchCount = 0;
  for (const word of tWords) {
    if (word.length > 2 && sWords.includes(word)) {
      matchCount++;
    }
  }
  if (tWords.length > 0 && (matchCount / tWords.length) > 0.6) {
    return true;
  }
  return false;
}

const getLangLocale = (lang: "en" | "ur" | "hi" | "ar" | "pa") => {
  switch (lang) {
    case "ur": return "ur-PK";
    case "hi": return "hi-IN";
    case "ar": return "ar-SA";
    case "pa": return "pa-IN";
    default: return "en-US";
  }
};

interface VoiceAssistantProps {
  onSendMessage: (text: string, attachment?: { name: string; type: string; previewUrl?: string; size?: number; data?: string }) => Promise<string>;
  history: ChatMessage[];
  announceTrigger?: string;
  onClearAnnounceTrigger?: () => void;
  language?: "en" | "ur";
  persona?: "zara" | "tariq" | "cyborg" | "calm" | "friendly" | "male";
  onChangePersona?: (p: "zara" | "tariq" | "cyborg" | "calm" | "friendly" | "male") => void;
  voiceLanguage?: "en" | "ur" | "hi" | "ar" | "pa";
  onChangeVoiceLanguage?: (l: "en" | "ur" | "hi" | "ar" | "pa") => void;
}

export default function VoiceAssistant({
  onSendMessage,
  history,
  announceTrigger,
  onClearAnnounceTrigger,
  language = "en",
  persona = "zara",
  onChangePersona,
  voiceLanguage = "en",
  onChangeVoiceLanguage
}: VoiceAssistantProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [recognitionError, setRecognitionError] = useState("");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  
  // File and Attachment State Handler
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    size: number;
    data: string;
    previewUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      setSelectedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64Data,
        previewUrl: file.type.startsWith("image/") ? result : undefined
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };
  
  // Continuous voice dialogue mode configurations
  const [continuousConversation, setContinuousConversation] = useState(false);
  const continuousRef = useRef(false);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isThinkingRef = useRef(false);
  const autoRestartTimerRef = useRef<any>(null);
  const lastSpokenTextRef = useRef(""); // Keeps track of system outputs
  
  const t = translations[language];
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Synthesis and Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;

      // Setup Web Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = getLangLocale(voiceLanguage);

        rec.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
          setRecognitionError("");
          if (autoRestartTimerRef.current) {
            clearTimeout(autoRestartTimerRef.current);
          }
        };

        rec.onend = () => {
          setIsListening(false);
          isListeningRef.current = false;
          
          // Re-enable listening automatically if under continuous conversation mode & not speaking/thinking
          if (continuousRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
            if (autoRestartTimerRef.current) {
              clearTimeout(autoRestartTimerRef.current);
            }
            autoRestartTimerRef.current = setTimeout(() => {
              if (continuousRef.current && !isListeningRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (err) {
                  // Fail gracefully on overlap
                }
              }
            }, 1000);
          }
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          if (e.error !== "no-speech") {
            setRecognitionError(`Voice Error: ${e.error}`);
          }
          setIsListening(false);
          isListeningRef.current = false;
          
          // If silent or idle error and continuous conversation is on, restart listening loop
          if (continuousRef.current) {
            if (autoRestartTimerRef.current) {
              clearTimeout(autoRestartTimerRef.current);
            }
            autoRestartTimerRef.current = setTimeout(() => {
              if (continuousRef.current && !isListeningRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (err) {}
              }
            }, 1000);
          }
        };

        rec.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript.trim()) {
            // Guard against system echo
            if (isSelfEcho(transcript, lastSpokenTextRef.current)) {
              console.log("Ignored transcript matching system output:", transcript);
              return;
            }
            setInputText(transcript);
            await handleTriggerChat(transcript);
          }
        };

        recognitionRef.current = rec;
      } else {
        setRecognitionError("Speech Recognition is not supported by your browser. Use typing mode!");
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (autoRestartTimerRef.current) {
        clearTimeout(autoRestartTimerRef.current);
      }
    };
  }, []);

  // Synchronously adjust recognition language when locale transitions
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLangLocale(voiceLanguage);
    }
  }, [voiceLanguage]);

  // Handle programmatically triggered announcements from parent dashboard (notifications, breaks, social media alerts)
  useEffect(() => {
    if (announceTrigger && announceTrigger.trim()) {
      speakAloud(announceTrigger);
      if (onClearAnnounceTrigger) {
        onClearAnnounceTrigger();
      }
    }
  }, [announceTrigger]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Read message aloud
  const speakAloud = (text: string) => {
    if (!ttsEnabled || !synthRef.current) return;

    // Cancel current speaking
    synthRef.current.cancel();

    const isUrdu = /[\u0600-\u06FF]/.test(text);

    // Clean text of markdown/emoji symbols for smooth speech
    const cleanText = text
      .replace(/[*_#`~\-]/g, " ")
      .replace(/https?:\/\/\S+/g, "link")
      .substring(0, 350); // limit spoken context length

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Tune properties depending on selected Voice Persona
    if (persona === "zara") {
      utterance.pitch = 1.25;
      utterance.rate = voiceSpeed * 1.05;
    } else if (persona === "tariq") {
      utterance.pitch = 0.82;
      utterance.rate = voiceSpeed * 0.95;
    } else if (persona === "cyborg") {
      utterance.pitch = 0.55;
      utterance.rate = voiceSpeed * 1.15;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = voiceSpeed;
    }
    
    // Find an energetic coaching voice if possible
    const voices = synthRef.current.getVoices();
    let coachVoice;
    
    if (isUrdu) {
      coachVoice = voices.find(v => v.lang.startsWith("ur-") || v.lang.startsWith("hi-"));
    } else {
      coachVoice = voices.find(v => 
        v.lang.startsWith("en-") && 
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Male") || v.name.includes("Female"))
      );
    }
    if (coachVoice) {
      utterance.voice = coachVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      
      // Auto resume listening under continuous speech loop
      if (continuousRef.current) {
        setTimeout(() => {
          if (continuousRef.current && !isListeningRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {}
          }
        }, 500);
      }
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Speaking Error:", e);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      
      // Auto-resume listening even if voice output catches an error code
      if (continuousRef.current) {
        setTimeout(() => {
          if (continuousRef.current && !isListeningRef.current && !isThinkingRef.current && !isSpeakingRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {}
          }
        }, 500);
      }
    };

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not loaded or supported in this browser.");
      return;
    }

    if (isListening) {
      if (continuousConversation) {
        setContinuousConversation(false);
        continuousRef.current = false;
      }
      recognitionRef.current.stop();
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleContinuousConversation = () => {
    const nextState = !continuousConversation;
    setContinuousConversation(nextState);
    continuousRef.current = nextState;

    if (nextState) {
      setTtsEnabled(true);
      stopSpeaking();
      if (!isListeningRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      if (autoRestartTimerRef.current) {
        clearTimeout(autoRestartTimerRef.current);
      }
      if (isListeningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  const handleTriggerChat = async (text: string) => {
    if (!text.trim() && !selectedFile) return;
    setIsThinking(true);
    isThinkingRef.current = true;
    setInputText("");

    if (isListeningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const currentAttachment = selectedFile ? {
      name: selectedFile.name,
      type: selectedFile.type,
      size: selectedFile.size,
      data: selectedFile.data,
      previewUrl: selectedFile.previewUrl
    } : undefined;

    // Clear file selection
    setSelectedFile(null);

    // If text was empty but an attachment is present, send standard prompt about the file name
    const textToSend = text.trim() || `${language === "ur" ? "اس فائل پر ایک نظر ڈالیں:" : "Please take a look at this file:"} ${currentAttachment?.name}`;

    const responseText = await onSendMessage(textToSend, currentAttachment);
    setIsThinking(false);
    isThinkingRef.current = false;

    // Speak response out loud after short delay
    setTimeout(() => {
      speakAloud(responseText);
    }, 150);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || selectedFile) {
      handleTriggerChat(inputText);
    }
  };

  return (
    <div id="voice-assistant-section" className="flex flex-col h-full bg-[#0B0F17] border border-[#1E293B] rounded-3xl overflow-hidden shadow-xl shadow-slate-950/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#070a11] border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isListening ? "bg-red-400" : isSpeaking ? "bg-cyan-400" : "bg-emerald-400"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isListening ? "bg-red-500" : isSpeaking ? "bg-cyan-500" : "bg-emerald-500"}`}></span>
            </span>
          </div>
          <h2 className={`font-sans font-bold text-slate-200 text-sm tracking-wide uppercase ${language === "ur" ? "font-urdu" : ""}`}>{t.aiMentorTitle}</h2>
          {isThinking && <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Continuous Speech Talk Mode Toggle */}
          <button 
            type="button"
            id="continuous-voice-btn"
            onClick={toggleContinuousConversation}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-semibold rounded-lg border transition-all ${
              continuousConversation 
                ? "bg-emerald-950/45 border-emerald-500/70 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-pulse" 
                : "bg-[#090d14] border-[#1E293B] text-slate-400 hover:text-slate-300 hover:border-slate-700"
            }`}
            title={t.continuousVoiceDesc}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${continuousConversation ? "bg-emerald-400" : "bg-slate-500"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${continuousConversation ? "bg-emerald-400" : "bg-slate-600"}`}></span>
            </span>
            <span className={language === "ur" ? "font-urdu text-[10px]" : ""}>
              {continuousConversation ? t.continuousVoiceActive : t.continuousVoiceTitle}
            </span>
          </button>

          {/* TTS Speed Speedometer */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 border border-[#1E293B] rounded-lg px-2 py-1 bg-[#090d14]">
            <span className="font-mono">{t.voiceSpeedLabel}:</span>
            <select 
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="bg-transparent text-slate-200 outline-none cursor-pointer"
            >
              <option value="0.8">0.8x</option>
              <option value="1.0">1.0x</option>
              <option value="1.2">1.2x</option>
              <option value="1.5">1.5x</option>
            </select>
          </div>

          <button 
            type="button" 
            id="tts-toggle-btn"
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled) stopSpeaking();
            }}
            className={`p-2 rounded-lg border transition-colors ${ttsEnabled ? "bg-cyan-950/40 border-cyan-800/40 text-cyan-400" : "bg-[#070a11] border-[#1E293B] text-slate-500 hover:text-slate-300"}`}
            title={ttsEnabled ? t.muteVoice : t.unmuteVoice}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Futuristic Holographic Graphic Area */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-[#070a11] to-[#0B0F17] border-b border-[#1E293B] relative">
        <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest pointer-events-none">
          {t.holographicTitle}
        </div>

        {/* Outer Pulsing Aura Ring */}
        <div className={`relative h-28 w-28 rounded-full border flex items-center justify-center transition-all duration-500  ${
          isListening 
            ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] bg-red-950/10" 
            : isSpeaking 
            ? "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.35)] bg-cyan-950/15"
            : isThinking
            ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] bg-[#070a11] animate-pulse"
            : persona === "zara"
            ? "border-rose-500/30 bg-[#070a11]/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
            : persona === "tariq"
            ? "border-sky-500/30 bg-[#070a11]/50 shadow-[0_0_15px_rgba(14,165,233,0.15)]"
            : "border-emerald-500/35 bg-[#070a11]/50 shadow-[0_0_15px_rgba(16,185,129,0.20)]"
        }`}>
          {/* Audio Visualizer Waves (Pulsing circles inside) */}
          <div className={`absolute inset-1 rounded-full border border-dashed transition-all duration-700 ${
            isListening ? "border-red-400 animate-spin" : isSpeaking ? "border-cyan-300/60 animate-[spin_10s_linear_infinite]" : "border-[#1E293B]"
          }`}></div>

          {/* Core Orb */}
          <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? "bg-gradient-to-tr from-red-600 to-orange-400 animate-pulse" 
              : isSpeaking 
              ? "bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]" 
              : isThinking
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce"
              : "bg-[#161F30]"
          }`}>
            <button 
              type="button"
              id="center-mic-btn"
              onClick={toggleListening}
              className="text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 hover:scale-105 transition-transform p-3"
            >
              {isListening ? (
                <MicOff className="h-7 w-7 animate-pulse text-white" />
              ) : (
                <Mic className={`h-7 w-7 ${isSpeaking ? "text-cyan-100 animate-bounce" : "text-slate-200"}`} />
              )}
            </button>
          </div>

          {/* Voice Wave Visualizer lines */}
          {isSpeaking && (
            <div className="absolute -bottom-2 flex gap-[3px] items-center justify-center h-4 w-24">
              <span className="h-3 w-[2px] bg-cyan-400 animate-[pulse_0.4s_infinite]"></span>
              <span className="h-4 w-[2px] bg-cyan-300 animate-[pulse_0.6s_infinite_0.1s]"></span>
              <span className="h-2 w-[2px] bg-cyan-500 animate-[pulse_0.5s_infinite_0.2s]"></span>
              <span className="h-4 w-[2px] bg-cyan-300 animate-[pulse_0.7s_infinite_0.15s]"></span>
              <span className="h-3 w-[2px] bg-cyan-400 animate-[pulse_0.3s_infinite_0.05s]"></span>
            </div>
          )}
        </div>

        {/* Status Text overlay */}
        <div className="mt-4 text-center">
          <p className="font-sans font-medium text-xs text-slate-300">
            {isListening 
              ? (language === "ur" ? "آپ کی آواز کا انتظار ہے..." : "Listening for command...") 
              : isSpeaking 
              ? (language === "ur" ? "رہنمائی فراہم کی جا رہی ہے..." : "Speaking Advice...") 
              : isThinking 
              ? (language === "ur" ? "حکمتِ عملی تیار ہو رہی ہے..." : "Formulating strategy...") 
              : (language === "ur" ? "اے آئی اسسٹنٹ اسٹینڈ بائی" : "AI Assistant Standby")}
          </p>
          <p className="font-mono text-[10px] text-slate-500 mt-1">
            {isListening 
              ? (language === "ur" ? "برائے مہربانی بولیں..." : "Speak now") 
              : (language === "ur" ? "مائیک دبائیں یا 'کوشش کریں'" : "Say 'Hey Coach' or click MIC to begin")}
          </p>
        </div>

        {recognitionError && (
          <div className="mt-2 text-[10px] text-amber-400 flex items-center justify-center gap-1 bg-amber-950/20 px-2 py-1 rounded">
            <AlertTriangle className="h-3 w-3 inline" />
            <span>{recognitionError}</span>
          </div>
        )}

        {/* Conversational Language Selector */}
        <div className="mt-3 flex flex-col items-center gap-1.5 w-full max-w-xs border-t border-[#1E293B]/45 pt-3 shadow-inner">
          <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest text-center">
            {language === "ur" ? "گفتگو کی زبان تبدیل کریں" : "CONVERSATIONAL VOICE LANGUAGE"}
          </span>
          <div className="grid grid-cols-5 gap-1 w-full bg-black/45 border border-[#1E293B] rounded-xl p-1 select-none">
            {[
              { code: "en", label: "EN", flag: "🇬🇧" },
              { code: "ur", label: "UR", flag: "🇵🇰" },
              { code: "hi", label: "HI", flag: "🇮🇳" },
              { code: "ar", label: "AR", flag: "🇸🇦" },
              { code: "pa", label: "PA", flag: "🇵🇰" },
            ].map(langOption => (
              <button
                key={langOption.code}
                type="button"
                onClick={() => onChangeVoiceLanguage && onChangeVoiceLanguage(langOption.code as any)}
                className={`py-1 rounded-md text-[9px] font-bold font-mono transition cursor-pointer text-center ${
                  voiceLanguage === langOption.code
                    ? "bg-cyan-950/60 border border-cyan-500/50 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.15)]"
                    : "text-slate-400 hover:text-slate-350"
                }`}
                title={langOption.label}
              >
                <span className="text-[10px] block">{langOption.flag}</span>
                <span className="text-[8px] leading-none block mt-0.5">{langOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Persona Selector Bar */}
        <div className="mt-4 flex flex-col items-center gap-1.5 w-full max-w-xs border-t border-[#1E293B]/45 pt-3">
          <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest text-center">
            {language === "ur" ? "مشیر کی آواز اور کردار منتخب کریں" : "Select Voice Persona / Character"}
          </span>
          <div className="grid grid-cols-3 gap-1.5 w-full bg-black/45 border border-[#1E293B] rounded-xl p-1">
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("zara")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "zara"
                  ? "bg-rose-950/40 border border-rose-500/50 text-rose-400 font-extrabold shadow-[0_0_8px_rgba(244,63,94,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "زارا (باہمی)" : "Zara (Warm)"}
            </button>
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("tariq")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "tariq"
                  ? "bg-cyan-950/40 border border-cyan-500/50 text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "طارق (سخت)" : "Tariq (Strict)"}
            </button>
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("cyborg")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "cyborg"
                  ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 font-extrabold shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "سائبرگ (مشین)" : "Cyborg"}
            </button>
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("calm")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "calm"
                  ? "bg-sky-950/40 border border-sky-500/50 text-sky-400 font-extrabold shadow-[0_0_8px_rgba(14,165,233,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "پیشہ ور" : "Calm Pro"}
            </button>
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("friendly")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "friendly"
                  ? "bg-amber-950/45 border border-amber-500/50 text-amber-400 font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "دوستانہ" : "Friendly"}
            </button>
            <button
              type="button"
              onClick={() => onChangePersona && onChangePersona("male")}
              className={`py-1 rounded-md text-[9px] font-bold font-sans transition cursor-pointer text-center ${
                persona === "male"
                  ? "bg-indigo-950/45 border border-indigo-500/50 text-indigo-400 font-extrabold shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {language === "ur" ? "مردانہ" : "Deep Male"}
            </button>
          </div>
        </div>
      </div>

      {/* Transcription Dialogue Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070a11]/65 max-h-[220px] md:max-h-none flex flex-col justify-end">
        <div className="overflow-y-auto pr-1 space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Sparkles className="h-8 w-8 mb-2 stroke-[1.5] text-slate-600 animate-pulse" />
              <p className="text-xs">{language === "ur" ? "گفتگو کی کوئی ہسٹری نہیں ہے" : "No conversation history."}</p>
              <p className="text-[10px] italic mt-1 text-slate-600">
                {language === "ur" ? "“ایک بہترین تعلیمی شیڈول چاہیے؟ مجھ سے پوچھیں۔”" : "“Need an adaptive study routine? Just ask me.”"}
              </p>
            </div>
          ) : (
            history.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                dir={language === "ur" ? "rtl" : "ltr"}
              >
                {msg.role !== "user" && (
                  <div className="h-6 w-6 rounded-full bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center text-[10px] text-cyan-400 shrink-0">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[#1E293B] border border-[#2E3C50] text-[#E2E8F0] rounded-tr-none"
                    : "bg-[#161F30]/80 border border-[#1E293B] text-slate-200 rounded-tl-none"
                } ${language === "ur" ? "font-urdu text-right" : "font-sans"}`}>
                  
                  {msg.attachment && (
                    <div className="mb-2 p-1.5 bg-black/45 rounded-xl border border-slate-700/50 overflow-hidden text-left" dir="ltr">
                      {msg.attachment.type.startsWith("image/") ? (
                        <div className="rounded overflow-hidden max-h-40 bg-black/25 flex justify-center items-center">
                          <img 
                            src={msg.attachment.previewUrl || `data:${msg.attachment.type};base64,${msg.attachment.data}`} 
                            alt={msg.attachment.name}
                            referrerPolicy="no-referrer"
                            className="max-h-36 max-w-full rounded object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300">
                          <FileText className="h-4.5 w-4.5 text-cyan-400 shrink-0 animate-pulse" />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[10px] truncate text-slate-100">{msg.attachment.name}</p>
                            <p className="text-[8px] text-slate-400">
                              {msg.attachment.size ? `${(msg.attachment.size / 1024).toFixed(1)} KB` : "Document"} • {msg.attachment.type.split("/")[1]?.toUpperCase() || "FILE"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <p>{msg.text}</p>
                  
                  {msg.role !== "user" && (
                    <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-700/30 text-[9px] text-slate-400" dir="ltr">
                      <span>{msg.timestamp}</span>
                      <button 
                        type="button"
                        id={`speak-msg-${msg.id}`}
                        onClick={() => speakAloud(msg.text)} 
                        className="text-cyan-400 hover:text-cyan-300 font-medium"
                      >
                        {t.replayVoice}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Control Input Drawer */}
      <div className="bg-[#070a11] border-t border-[#1E293B]">
        {/* Selected File Preview Drawer */}
        {selectedFile && (
          <div className="p-2 px-4 bg-[#0F172A] border-b border-[#1E293B] flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              {selectedFile.previewUrl ? (
                <div className="h-8 w-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shrink-0">
                  <img src={selectedFile.previewUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-indigo-950/70 border border-indigo-800/40 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-indigo-400" />
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="text-[10px] font-bold text-slate-200 truncate">{selectedFile.name}</p>
                <p className="text-[8px] text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={removeSelectedFile}
              className="h-6 w-6 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-450 cursor-pointer transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-3 flex gap-2 items-center">
          {/* Hidden File Picker Inputs */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            accept="image/*, .txt, .pdf, .json, .csv, .md, .js, .ts, .py, .java, .cpp"
          />

          {/* Picture / File attachment button */}
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach study note screenshot, PDF, or text log"
            className="p-2 text-slate-400 hover:text-cyan-400 bg-[#0B0F17] hover:bg-[#161F30] border border-[#1E293B] rounded-xl transition duration-300 cursor-pointer shrink-0"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>

          <input 
            type="text"
            id="assistant-textbox"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.placeholderAiHint}
            className="flex-1 bg-[#0B0F17] border border-[#1E293B] focus:border-cyan-500 text-xs text-slate-200 placeholder-slate-500 rounded-xl px-3 py-2 outline-none transition-colors"
            disabled={isThinking}
          />
          <button 
            type="submit"
            id="send-chat-btn"
            disabled={isThinking || (!inputText.trim() && !selectedFile)}
            className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-slate-800 text-white p-2 rounded-xl transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
