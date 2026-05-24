import React, { useState, useEffect } from "react";
import { Users, Shield, Zap, Sparkles, UserCheck, Play, Radio, Timer } from "lucide-react";
import { StudyPartner } from "../types";

interface AccountabilityRoomProps {
  onRewardXP: (xp: number, message: string) => void;
  onTriggerVoiceAnnouncement: (text: string) => void;
  language?: "en" | "ur";
}

export default function AccountabilityRoom({
  onRewardXP,
  onTriggerVoiceAnnouncement,
  language = "en"
}: AccountabilityRoomProps) {
  const [partnerList, setPartnerList] = useState<StudyPartner[]>([
    { id: "p1", name: "Hiroshi _study", avatarSeed: "H", isFocusing: true, statusText: "Studying: Advanced Calculus", todayMinutes: 145 },
    { id: "p2", name: "amanda_codes", avatarSeed: "A", isFocusing: true, statusText: "Studying: Bio formulas", todayMinutes: 180 },
    { id: "p3", name: "brian_focus", avatarSeed: "B", isFocusing: false, statusText: "Resting: Hydration cycle", todayMinutes: 90 },
    { id: "p4", name: "devon_reads", avatarSeed: "D", isFocusing: true, statusText: "Studying: World History", todayMinutes: 215 }
  ]);

  const [jointChallengeActive, setJointChallengeActive] = useState(false);
  const [sessionSecs, setSessionSecs] = useState(20); // 20 virtual seconds challenge
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (jointChallengeActive) {
      interval = setInterval(() => {
        setSessionSecs(prev => {
          const next = prev - 1;
          return next < 0 ? 0 : next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jointChallengeActive]);

  useEffect(() => {
    if (!jointChallengeActive) return;

    if (sessionSecs === 0) {
      handleChallengeComplete();
      return;
    }

    // Randomly simulate a partner update
    if (sessionSecs === 12) {
      onTriggerVoiceAnnouncement("Accountability Partner amanda_codes completed 45-minute focus card! Team streak multi-piles.");
      setPartnerList(curr => curr.map(p => p.id === "p2" ? { ...p, todayMinutes: p.todayMinutes + 45 } : p));
    } else if (sessionSecs === 6) {
      onTriggerVoiceAnnouncement("Alert: brian_focus has re-entered study mode. All accountability partners online.");
      setPartnerList(curr => curr.map(p => p.id === "p3" ? { ...p, isFocusing: true, statusText: "Studying: Compiling databases" } : p));
    }
  }, [sessionSecs, jointChallengeActive]);

  const handleChallengeComplete = () => {
    setJointChallengeActive(false);
    setIsDone(true);
    onRewardXP(120, "Joint Study Challenge Conquest Champion");
    onTriggerVoiceAnnouncement("CONGRATULATIONS! You and your study circle have completed the deep concentration countdown. Shared bonus XP successfully claimed!");
  };

  const startJointChallenge = () => {
    setJointChallengeActive(true);
    setSessionSecs(20);
    setIsDone(false);
    onTriggerVoiceAnnouncement("Joint accountability challenge started. Keep your screen locked in; compliance is monitored by global circles!");
  };

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Accountability Cohorts</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Study with peer networks and execute mutual focus missions</p>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/35 px-2 py-0.5 rounded border border-emerald-900/40">
          ● 4 ACTIVE
        </span>
      </div>

      {/* Joint Challenge Banner */}
      {jointChallengeActive ? (
        <div className="bg-gradient-to-tr from-indigo-950/70 to-cyan-950/70 p-4 border border-cyan-800/40 rounded-2xl mb-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-mono text-cyan-400 animate-pulse">
            <Radio className="h-3.5 w-3.5" />
            <span>METRIC SYNC ACTIVE</span>
          </div>

          <label className="text-[9px] text-cyan-300 font-mono tracking-widest uppercase font-bold block mb-1">COOPERATIVE STUDY DUEL</label>
          <span className="text-xs text-slate-100 font-sans block leading-snug mb-3">
            Circle Task: Maintain concentration with peers. Distraction locks are synchronized dynamically.
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-lg font-black text-cyan-300">
              <Timer className="h-4.5 w-4.5 text-cyan-400 animate-spin" />
              <span>{sessionSecs}s Left</span>
            </div>
            <div className="text-[10px] text-slate-400 italic">
              Studying with: {partnerList.filter(p => p.isFocusing).map(p => p.name).join(", ")}
            </div>
          </div>
        </div>
      ) : isDone ? (
        <div className="bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-2xl mb-4 text-center">
          <Sparkles className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-emerald-400 block">Cooperative Victory!</span>
          <p className="text-[10px] text-slate-400 mt-1">Conquered accountability challenge. Mutual +120 XP injected!</p>
          <button 
            type="button" 
            onClick={() => setIsDone(false)} 
            className="text-[9px] text-slate-500 hover:text-slate-300 font-mono uppercase mt-2 block mx-auto underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div className="bg-[#070a11]/60 p-4 border border-[#1E293B] rounded-2xl mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">Circle Study challenge</span>
            <p className="text-[11px] text-slate-400 font-sans mt-1">Engage peers in deep work countdowns for double level XP boosts.</p>
          </div>
          <button
            type="button"
            id="start-joint-challenge-btn"
            onClick={startJointChallenge}
            className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-slate-50 font-sans font-bold text-xs py-2 px-3.5 rounded-xl transition shrink-0 cursor-pointer"
          >
            Launch circle Duel (2X XP)
          </button>
        </div>
      )}

      {/* Partners state list */}
      <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-1">
        <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-1">Cohort Members Status</label>
        {partnerList.map((partner) => (
          <div key={partner.id} className="bg-[#070a11]/40 p-2.5 border border-[#1E293B]/60 rounded-xl flex items-center justify-between gap-2 hover:bg-[#070a11] transition">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Profile letter symbol inside retro neon border */}
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${
                partner.isFocusing ? "border-indigo-500 text-indigo-400 bg-indigo-950/20" : "border-[#1E293B] text-slate-500 bg-[#070a11]"
              }`}>
                {partner.avatarSeed}
              </div>

              <div className="min-w-0">
                <span className="font-sans font-semibold text-xs text-slate-200 block truncate">{partner.name}</span>
                <span className={`text-[10.5px] italic truncate block ${partner.isFocusing ? "text-indigo-400" : "text-slate-500"}`}>
                  {partner.statusText}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-400 block">{partner.todayMinutes}m focused</span>
              <span className={`text-[8.5px] font-mono font-bold uppercase ${partner.isFocusing ? "text-emerald-400" : "text-slate-600"}`}>
                {partner.isFocusing ? "ACTIVE FOCUS" : "REST CYCLING"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
