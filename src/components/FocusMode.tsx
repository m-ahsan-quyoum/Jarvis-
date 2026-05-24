import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Music, Volume2, ShieldAlert, Sparkles, Plus, AlertCircle, Headphones } from "lucide-react";
import { FocusLog } from "../types";

interface FocusModeProps {
  onAddFocusLog: (log: FocusLog) => void;
  onRewardXP: (xp: number, message: string) => void;
  onTriggerVoiceAnnouncement: (text: string) => void;
  language?: "en" | "ur";
}

export default function FocusMode({
  onAddFocusLog,
  onRewardXP,
  onTriggerVoiceAnnouncement,
  language = "en"
}: FocusModeProps) {
  // Timer State
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState<"work" | "break">("work");
  const [focusSubject, setFocusSubject] = useState("Mathematics syllabus");
  
  // Ambient Sound Synth State
  const [isSynthPlaying, setIsSynthPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ oscillator1: OscillatorNode; oscillator2: OscillatorNode; filter: BiquadFilterNode; gain: GainNode } | null>(null);

  // Notifications Suppression State (Simulated)
  const [suppressedAlerts, setSuppressedAlerts] = useState<{ id: string; original: string; coachTranslation: string; timestamp: string }[]>([]);

  // Focus tracking state
  const [clicksCount, setClicksCount] = useState(0);
  const timerRef = useRef<any>(null);

  // Timer Tick Core loop
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  // Trigger simulated suppressed notifications periodically while active
  useEffect(() => {
    let interval: any = null;
    if (isActive && timerMode === "work") {
      const mockAlerts = [
        { original: "WhatsApp: 'Wanna play Apex Legends?'", translation: "Suppressed. They want to downgrade your GPA. Fight back. Study!" },
        { original: "YouTube notification: 'ASMR Slime ASMR 10 Hrs'", translation: "Suppressed. Cheap dopamine alert. Your study cards have higher value." },
        { original: "Snapchat: 'Sarah updated her story'", translation: "Suppressed. Sarah's story doesn't contain equations. Keep studying." },
        { original: "Discord: `@everyone join voice channel`", translation: "Suppressed. Guard your absolute discipline zone." }
      ];

      interval = setInterval(() => {
        const selected = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
        const newAlert = {
          id: `sup-${Date.now()}`,
          original: selected.original,
          coachTranslation: selected.translation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSuppressedAlerts(prev => [newAlert, ...prev].slice(0, 10));
        
        // Minor audio voice chime warning of incoming notification
        onTriggerVoiceAnnouncement("Notification suppressed. Stay inside deep flow.");
      }, 40000); // Trigger every 40s in work focus to maintain state without clutter
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timerMode]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerMode === "work") {
      onRewardXP(100, `Completed study module: ${focusSubject}`);
      onTriggerVoiceAnnouncement(`Incredible work! Focus cell on ${focusSubject} completed successfully. Study block complete.`);

      // Log complete focus stats
      const randomDistract = Math.max(0, Math.floor(Math.random() * 3));
      const focusSc = Math.max(70, Math.min(100, 100 - (randomDistract * 8)));
      onAddFocusLog({
        id: `focus-${Date.now()}`,
        subject: focusSubject,
        durationMinutes: 25,
        timestamp: new Date().toLocaleDateString(),
        focusScore: focusSc,
        distractionsCount: randomDistract
      });

      // Switch to break
      setTimerMode("break");
      setMinutes(5);
      setSeconds(0);
      onTriggerVoiceAnnouncement("Starting 5 minute health rest cycle. Stand up and hydrate!");
    } else {
      // Switch back to work
      setTimerMode("work");
      setMinutes(25);
      setSeconds(0);
      onTriggerVoiceAnnouncement("Comfort rest expired. Activating study focus mode.");
    }
  };

  const startTimer = () => {
    setIsActive(true);
    onTriggerVoiceAnnouncement(`Concentration mode started. Suppressors operating. Target: ${focusSubject}.`);
  };

  const pauseTimer = () => {
    setIsActive(false);
    onTriggerVoiceAnnouncement("Flow suspended. Re-engage promptly.");
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(timerMode === "work" ? 25 : 5);
    setSeconds(0);
    onTriggerVoiceAnnouncement("Timer reset completed.");
  };

  // Web Audio API procedural sound synthesizer (Deep focus space drone)
  const toggleAmbientSynth = () => {
    if (isSynthPlaying) {
      // Stop synth
      if (synthNodesRef.current) {
        try {
          synthNodesRef.current.oscillator1.stop();
          synthNodesRef.current.oscillator2.stop();
        } catch (e) {
          console.error(e);
        }
        synthNodesRef.current = null;
      }
      setIsSynthPlaying(false);
      onTriggerVoiceAnnouncement("Cosmic focus hum disabled.");
    } else {
      // Start synth
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Custom filter to create warm low-frequency rumble
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, ctx.currentTime);
        filter.Q.setValueAtTime(1, ctx.currentTime);

        const osc1 = ctx.createOscillator();
        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(75, ctx.currentTime); // Low deep study pitch

        // Second oscillator with slight detune to create comfortable psychoacoustic beats
        const osc2 = ctx.createOscillator();
        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(75.5, ctx.currentTime); // slightly detuned for binaural focus wave

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime); // keep soft in ears

        // Connections
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        synthNodesRef.current = { oscillator1: osc1, oscillator2: osc2, filter, gain: gainNode };
        setIsSynthPlaying(true);
        onTriggerVoiceAnnouncement("Binaural focus ambient hum engaged. Tuning neural wave levels to alpha state.");
      } catch (e) {
        console.error("Web Audio API Synth failed:", e);
        alert("Audio context requires active window interaction on this browser first, or synth is unsupported.");
      }
    }
  };

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col h-full">
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-cyan-400" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Discipline Focus Mode</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Automated notification blocker and binaural study hum</p>
        </div>

        <button
          type="button"
          id="toggle-binaural-hum-btn"
          onClick={toggleAmbientSynth}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border text-[11px] font-sans font-bold transition-all cursor-pointer ${
            isSynthPlaying 
              ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-400" 
              : "bg-[#070a11] border-[#1E293B] text-slate-500 hover:text-slate-300"
          }`}
        >
          <Headphones className={`h-3.5 w-3.5 ${isSynthPlaying ? "animate-bounce" : ""}`} />
          <span>{isSynthPlaying ? "BINAURAL OFF" : "PLAY BINAURAL HUM"}</span>
        </button>
      </div>

      {/* Target Subject Selector */}
      <div className="flex gap-2 items-center mb-4 bg-[#070a11]/60 p-3 border border-[#1E293B] rounded-xl">
        <span className="text-[10px] font-mono text-indigo-400 shrink-0 uppercase font-bold">Current focus:</span>
        <input 
          type="text"
          id="focus-subject-box"
          value={focusSubject}
          onChange={(e) => setFocusSubject(e.target.value)}
          placeholder="Enter study topic..."
          className="bg-transparent text-slate-200 text-xs outline-none flex-1 border-b border-transparent focus:border-[#1E293B]"
          disabled={isActive}
        />
      </div>

      {/* Pomodoro Timer Visualizer */}
      <div className="flex flex-col items-center justify-center py-6 bg-[#070a11]/40 border border-[#1E293B]/60 rounded-2xl mb-4 relative overflow-hidden">
        {/* Breathing backdrop glow depending on work vs break */}
        <div className={`absolute -right-20 -bottom-20 h-44 w-44 rounded-full blur-[80px] opacity-10 duration-1000 ${
          timerMode === "work" ? "bg-indigo-500" : "bg-emerald-500"
        }`}></div>

        {/* Timer Type flag */}
        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full mb-2 font-bold ${
          timerMode === "work" ? "bg-indigo-950/60 text-indigo-400 border border-indigo-900/60" : "bg-emerald-950/60 text-emerald-400 border border-emerald-900/60"
        }`}>
          {timerMode === "work" ? "Active Deep Work Session" : "Active Mental Recovery"}
        </span>

        {/* Big digits clock */}
        <div className="font-mono text-5xl font-black text-slate-100 tracking-tight my-2">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>

        {/* Play/Pause controls */}
        <div className="flex items-center gap-3 mt-2">
          {isActive ? (
            <button
              type="button"
              id="pause-timer-btn"
              onClick={pauseTimer}
              className="bg-amber-600 hover:bg-amber-500 text-slate-50 p-2.5 rounded-full transition cursor-pointer"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              id="start-timer-btn"
              onClick={startTimer}
              className="bg-indigo-600 hover:bg-indigo-500 text-slate-50 p-2.5 rounded-full transition cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
            </button>
          )}

          <button
            type="button"
            id="reset-timer-btn"
            onClick={resetTimer}
            className="bg-[#161F30] hover:bg-[#1e2b42] text-slate-300 p-2.5 rounded-full border border-[#1E293B] transition cursor-pointer"
          >
            <Square className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Suppressed Notifications Console Log */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold mb-2">Notification Suppressor Feed ({suppressedAlerts.length})</label>
          <div className="overflow-y-auto max-h-[160px] space-y-2 pr-1">
            {suppressedAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-[#1E293B] rounded-2xl bg-[#070a11]/20">
                <ShieldAlert className="h-7 w-7 text-slate-700 mb-1" />
                <p className="text-[11px] text-slate-500">Auto Suppressor is monitoring.</p>
                <p className="text-[9px] text-slate-600 italic mt-0.5">Activate Focus mode to trigger automated workspace shielding.</p>
              </div>
            ) : (
              suppressedAlerts.map((alert) => (
                <div key={alert.id} className="bg-[#070a11]/60 border border-[#1E293B]/50 p-2.5 rounded-xl flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-slate-500 line-through truncate">{alert.original}</span>
                    <span className="text-slate-600 shrink-0">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-cyan-400 font-sans leading-relaxed">
                    <strong className="text-[10px] font-mono text-indigo-400 uppercase mr-1 font-bold">Coach:</strong> {alert.coachTranslation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1E293B] text-center">
          <button
            type="button"
            id="clear-suppressed-btn"
            onClick={() => setSuppressedAlerts([])}
            className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase duration-200 cursor-pointer"
          >
            Clear Suppressed Console
          </button>
        </div>
      </div>
    </div>
  );
}
