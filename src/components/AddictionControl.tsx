import React, { useState, useEffect, useRef } from "react";
import { AlertCircle, Shield, ShieldAlert, Play, Square, Timer, RefreshCw, Smartphone, TrendingDown, EyeOff, Radio } from "lucide-react";
import { AddictionLog } from "../types";

interface AddictionControlProps {
  onAddictionLog: (log: AddictionLog) => void;
  onTriggerVoiceAnnouncement: (text: string) => void;
  onModifyTimeWastageHours: (hours: number) => void;
  detoxActive: boolean;
  onToggleDetox: (active: boolean) => void;
  language?: "en" | "ur";
}

export default function AddictionControl({
  onAddictionLog,
  onTriggerVoiceAnnouncement,
  onModifyTimeWastageHours,
  detoxActive,
  onToggleDetox,
  language = "en"
}: AddictionControlProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "reports">("workspace");
  const [browsingApp, setBrowsingApp] = useState<string | null>(null);
  const [scrollingTime, setScrollingTime] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [socialLogs, setSocialLogs] = useState<AddictionLog[]>([]);

  // Refs to hold timer
  const scrollIntervalRef = useRef<any>(null);
  const timeLimitRef = useRef<number>(6); // Alert after 6 virtual seconds on reels!

  // Social distraction simulation timers
  useEffect(() => {
    if (isScrolling && browsingApp) {
      scrollIntervalRef.current = setInterval(() => {
        setScrollingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isScrolling, browsingApp]);

  // Handle side-effects of scrolling when limit is reached
  useEffect(() => {
    if (browsingApp && scrollingTime === timeLimitRef.current) {
      onTriggerVoiceAnnouncement(
        `WARNING! Excessive scrolling detected on ${browsingApp}. Reels addiction protocol active. Return to study mode now.`
      );
      
      const log: AddictionLog = {
        id: `addict-${Date.now()}`,
        appName: browsingApp,
        timeMinutes: Math.round(scrollingTime / 3), // scale simulated min
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wasInterrupted: true
      };
      
      onAddictionLog(log);
      setSocialLogs(prevLogs => [log, ...prevLogs]);
      onModifyTimeWastageHours(0.25); // increase wasted stats
    }
  }, [scrollingTime, browsingApp, onTriggerVoiceAnnouncement, onAddictionLog, onModifyTimeWastageHours]);

  const handleLaunchApp = (app: string) => {
    if (detoxActive) {
      onTriggerVoiceAnnouncement("Access Denied. Digital Detox mode is active. Distraction cell blocked.");
      alert("DETOX SHIELD: Focus blocks are actively running. Social feeds are disabled!");
      return;
    }

    setBrowsingApp(app);
    setScrollingTime(0);
    setIsScrolling(true);
    onTriggerVoiceAnnouncement(`Opening ${app} simulator. Keep scrolling low to protect your dopamine receptors.`);
  };

  const handleQuitBrowsing = () => {
    if (browsingApp) {
      const isExtreme = scrollingTime >= timeLimitRef.current;
      onTriggerVoiceAnnouncement(
        isExtreme 
          ? "Workspace restored. Hydrate and re-enter deep study state."
          : `Distraction avoided successfully. Good discipline on ${browsingApp}!`
      );
      
      if (scrollingTime > 0 && scrollingTime < timeLimitRef.current) {
        // Log minor scroll
        const log: AddictionLog = {
          id: `addict-${Date.now()}`,
          appName: browsingApp,
          timeMinutes: Math.max(1, Math.round(scrollingTime / 3)),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          wasInterrupted: false
        };
        onAddictionLog(log);
        setSocialLogs(prevLogs => [log, ...prevLogs]);
        onModifyTimeWastageHours(0.1);
      }
    }
    setBrowsingApp(null);
    setIsScrolling(false);
    setScrollingTime(0);
  };

  const triggerDetoxToggle = () => {
    const nextState = !detoxActive;
    onToggleDetox(nextState);
    if (nextState) {
      handleQuitBrowsing();
      onTriggerVoiceAnnouncement("Digital Detox Shield ENGAGED. Core social hosts are suppressed. Distraction-free baseline active.");
    } else {
      onTriggerVoiceAnnouncement("Digital Detox Shield DISENGAGED. Distraction hosts unlocked. Maintain discipline.");
    }
  };

  const getSimulatedFeed = () => {
    switch (browsingApp) {
      case "Instagram Reels":
        return [
          { creator: "@aesthetic_study_girl", content: "✨ Study hacks they don't teach you! #aesthetic #productivity 💡" },
          { creator: "@dance_sensations", content: "Doing the new viral trend dance! 🕺 #trending #viral #fyp" },
          { creator: "@gaming_fails", content: "Wasted the ultimate clutch in major final! 🎮 #gaming #fail #epic" }
        ];
      case "TikTok":
        return [
          { creator: "@reels_addict_99", content: "POV: You should be studying but you are watching me scroll 💀 #reels #lol" },
          { creator: "@funny_animals", content: "Golden retriever refuses to let owner leave bed 🐕 #funny #dogs" },
          { creator: "@fitness_routine", content: "3 quick workouts to build instant shoulders 🏋️ #motivation #gym #fit" }
        ];
      case "YouTube Shorts":
        return [
          { creator: "@tech_insights", content: "This secret phone feature will change your life 📱 #secret #android" },
          { creator: "@cooking_hacks", content: "Slightly toast your garlic bread first for absolute perfection 🥖 #food" },
          { creator: "@nature_facts", content: "Why octopuses are actually alien beings 🐙 #ocean #aliens" }
        ];
      default:
        return [];
    }
  };

  const feedItems = getSimulatedFeed();
  const currentFeedItem = feedItems[Math.floor(scrollingTime / 2) % feedItems.length] || feedItems[0];

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col h-full">
      {/* Header and Detox Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#1E293B] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-rose-500 animate-pulse" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Addiction Control Sandbox</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Simulate distraction feeds and measure dopamine hijacking</p>
        </div>

        {/* Digital Detox Toggle Switch */}
        <button
          type="button"
          id="detox-shield-btn"
          onClick={triggerDetoxToggle}
          className={`flex items-center gap-2 py-1.5 px-3.5 rounded-xl border text-xs font-sans font-semibold tracking-wide transition-all cursor-pointer ${
            detoxActive 
              ? "bg-rose-950/40 border-rose-500/70 text-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
              : "bg-[#070a11] border-[#1E293B] text-slate-400 hover:text-slate-200"
          }`}
        >
          {detoxActive ? (
            <>
              <ShieldAlert className="h-4 w-4 animate-bounce text-rose-400" />
              <span>DETOX SHIELD ACTIVE</span>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 text-slate-500" />
              <span>ENGAGE DETOX MODE</span>
            </>
          )}
        </button>
      </div>

      {/* Mode selectors */}
      <div className="flex gap-2 mb-3 bg-[#070a11]/60 p-1.5 border border-[#1E293B] rounded-xl self-start">
        <button
          type="button"
          id="tab-select-workspace"
          onClick={() => setActiveTab("workspace")}
          className={`px-3 py-1 rounded-lg text-xs transition font-sans font-medium cursor-pointer ${activeTab === "workspace" ? "bg-[#1E293B] text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
        >
          Browser Sandbox
        </button>
        <button
          type="button"
          id="tab-select-reports"
          onClick={() => setActiveTab("reports")}
          className={`px-3 py-1 rounded-lg text-xs transition font-sans font-medium cursor-pointer ${activeTab === "reports" ? "bg-[#1E293B] text-slate-100" : "text-slate-400 hover:text-slate-200"}`}
        >
          Distraction Logs ({socialLogs.length})
        </button>
      </div>

      {activeTab === "workspace" ? (
        <div className="flex-1 flex flex-col justify-between">
          {!browsingApp ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#1E293B] rounded-2xl bg-[#070a11]/30">
              <Radio className="h-9 w-9 text-slate-700 animate-pulse mb-2" />
              <span className="font-sans font-bold text-xs text-slate-300">Dopamine Depletion Simulator</span>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mb-3">
                Launch a social media feed simulation to observe how seconds transform into minutes of wasted mental energy.
              </p>

              {/* Distraction Launcher Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  id="launch-instagram-reels-btn"
                  onClick={() => handleLaunchApp("Instagram Reels")}
                  disabled={detoxActive}
                  className="bg-purple-950/60 hover:bg-purple-900/60 disabled:bg-slate-950 disabled:text-slate-700 text-purple-400 border border-purple-800/30 text-[11px] font-sans font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Launch Reels
                </button>
                <button
                  type="button"
                  id="launch-tiktok-btn"
                  onClick={() => handleLaunchApp("TikTok")}
                  disabled={detoxActive}
                  className="bg-cyan-950/60 hover:bg-cyan-950 disabled:bg-slate-950 disabled:text-slate-700 text-cyan-400 border border-cyan-800/30 text-[11px] font-sans font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Launch TikTok
                </button>
                <button
                  type="button"
                  id="launch-shorts-btn"
                  onClick={() => handleLaunchApp("YouTube Shorts")}
                  disabled={detoxActive}
                  className="bg-red-950/50 hover:bg-red-900/50 disabled:bg-slate-950 disabled:text-slate-700 text-red-400 border border-red-800/30 text-[11px] font-sans font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Launch Shorts
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 border border-[#1E293B] bg-[#070a11] rounded-2xl overflow-hidden flex flex-col relative">
              {/* Browser Header Bar */}
              <div className="bg-[#0B0F17] px-3 py-1.5 border-b border-[#1E293B] flex justify-between items-center text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="ml-1 shrink-0 text-slate-500">https://simulated-{browsingApp.toLowerCase().replace(/ /g, "")}.com</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5 text-rose-500" />
                  <span className="font-bold text-rose-400">{scrollingTime}s browsed</span>
                </div>
              </div>

              {/* Scrolling feed container */}
              <div className="flex-grow p-4 bg-[#070a11] flex flex-col justify-center items-center relative overflow-hidden h-[180px]">
                {scrollingTime >= timeLimitRef.current ? (
                  /* Red Intervention Overlay */
                  <div className="absolute inset-0 bg-red-950/90 flex flex-col justify-center items-center text-center p-5 z-20 animate-pulse border border-red-600/50">
                    <ShieldAlert className="h-11 w-11 text-red-500 mb-2 animate-bounce" />
                    <span className="font-sans font-black text-rose-400 text-xs tracking-wider uppercase mb-1">PROTRACTED ADDICTION INTERRUPT</span>
                    <p className="text-[11px] text-slate-200 leading-relaxed max-w-sm">
                      “You are caught in dopamine capture circles on <strong className="text-white font-mono">{browsingApp}</strong>. Close this tab and restart focused flow.”
                    </p>
                    <button
                      type="button"
                      id="sim-block-quit-btn"
                      onClick={handleQuitBrowsing}
                      className="mt-3 bg-white text-slate-950 font-sans font-bold text-xs py-1.5 px-4 rounded-lg shadow-md hover:bg-slate-200 active:scale-95 transition"
                    >
                      Suppressed: Return To Study
                    </button>
                  </div>
                ) : (
                  /* Feed Preview item */
                  <div className="text-center p-3 border border-[#1E293B] bg-[#0B0F17] rounded-xl max-w-xs md:max-w-md animate-fade-in w-full">
                    <div className="flex items-center gap-2 mb-2 text-left">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500"></div>
                      <span className="font-mono text-[10px] font-semibold text-slate-300">{currentFeedItem?.creator}</span>
                    </div>

                    <div className="h-20 bg-[#070a11] border border-[#1E293B]/60 rounded flex items-center justify-center mb-2 px-3 text-[11px] italic text-slate-300">
                      [ Simulated Video Stream looping... ]
                    </div>

                    <p className="text-[11px] text-slate-400 text-left line-clamp-2">{currentFeedItem?.content}</p>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#1E293B] text-[9px] text-slate-500 tracking-wider">
                      <span>⚡ Scrolling feed continues...</span>
                      <span>{6 - scrollingTime}s until Lockout Intervention</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Browser Nav */}
              <div className="bg-[#0B0F17] p-2.5 border-t border-[#1E293B] text-right">
                <button
                  type="button"
                  id="browsing-dismiss-btn"
                  onClick={handleQuitBrowsing}
                  className="text-[11px] font-sans font-bold bg-[#070a11] hover:bg-[#161F30] border border-[#1E293B] text-slate-300 px-3 py-1 rounded transition cursor-pointer"
                >
                  Exit Sandbox Browser
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Reports tab */
        <div className="flex-grow flex flex-col justify-between">
          <div className="overflow-y-auto max-h-[180px] space-y-2 pr-1">
            {socialLogs.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <p>No distraction intervention events recorded.</p>
                <p className="text-[10px] text-slate-600 mt-1">Excellent job keeping your active study sheets clean!</p>
              </div>
            ) : (
              socialLogs.map((log) => (
                <div key={log.id} className="bg-[#070a11]/40 border border-[#1E293B]/60 p-2.5 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                    <div>
                      <span className="font-sans font-bold text-xs text-slate-300">{log.appName}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{log.timestamp} • Wasted approximately {log.timeMinutes} virtual minutes</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                    log.wasInterrupted 
                      ? "bg-rose-950/70 border border-rose-800/30 text-rose-400" 
                      : "bg-amber-950/20 text-amber-500"
                  }`}>
                    {log.wasInterrupted ? "Interrupted" : "Dismissed"}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B] text-center">
            <button
              type="button"
              id="clear-logs-btn"
              onClick={() => setSocialLogs([])}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 uppercase duration-200 cursor-pointer"
            >
              Purge Distraction History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
