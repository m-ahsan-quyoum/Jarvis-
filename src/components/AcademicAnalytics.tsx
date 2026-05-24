import React, { useState, useEffect } from "react";
import { BarChart2, BookOpen, AlertTriangle, Cpu, TrendingUp, Sparkles, Sliders, Calendar, ChevronRight, Zap } from "lucide-react";
import { StudentProfile, FocusLog, AddictionLog } from "../types";

interface AcademicAnalyticsProps {
  profile: StudentProfile;
  onUpdateProfile: (p: StudentProfile) => void;
  focusLogs: FocusLog[];
  addictionLogs: AddictionLog[];
  timeWastedHours: number;
  onTriggerVoiceAnnouncement: (text: string) => void;
  streakCount: number;
  language?: "en" | "ur";
}

interface AIBehaviorReport {
  disciplineScore: number;
  procrastinationProbability: string;
  distractionTriggerAnalysis: string;
  actionSteps: string[];
  motivationalNudge: string;
}

export default function AcademicAnalytics({
  profile,
  onUpdateProfile,
  focusLogs,
  addictionLogs,
  timeWastedHours,
  onTriggerVoiceAnnouncement,
  streakCount,
  language = "en"
}: AcademicAnalyticsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ai-behavior" | "charts" | "profile">("ai-behavior");
  
  // AI Behavior Report state
  const [aiReport, setAiReport] = useState<AIBehaviorReport | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Profile forms
  const [nameInput, setNameInput] = useState(profile.name || "Struggling Student");
  const [styleInput, setStyleInput] = useState(profile.learningStyle);
  const [typeInput, setTypeInput] = useState(profile.productivityType);
  const [hoursInput, setHoursInput] = useState(profile.targetSleepHours);
  const [weakSubjectInput, setWeakSubjectInput] = useState("");
  const [examSubjectInput, setExamSubjectInput] = useState("");
  const [examDateInput, setExamDateInput] = useState("");

  // Calculate study stats
  const totalStudyMinutes = focusLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const averageFocusScore = focusLogs.length > 0 
    ? Math.round(focusLogs.reduce((acc, log) => acc + log.focusScore, 0) / focusLogs.length)
    : 100;

  // Contact Express AI Behavioral Analyzer
  const fetchBehavioralReport = async () => {
    setLoadingAI(true);
    onTriggerVoiceAnnouncement("Interpreting focus intervals and scrolling logs. Syncing report card.");
    try {
      const response = await fetch("/api/gemini/behavior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streakCount: streakCount,
          missedTasksCount: Math.max(1, 4 - focusLogs.length), // calculated mock missed
          scrollingAlertCount: addictionLogs.length,
          studyMinutes: totalStudyMinutes,
          moodRating: "Analytical focus"
        })
      });

      if (!response.ok) throw new Error("Behavior query failed");
      const data: AIBehaviorReport = await response.json();
      setAiReport(data);
      onTriggerVoiceAnnouncement(`Behavior report retrieved. Your current discipline score is ${data.disciplineScore} points. Stay disciplined.`);
    } catch (e) {
      console.error(e);
      // Fallback
      setAiReport({
        disciplineScore: Math.max(50, Math.min(100, 80 + (streakCount * 2) - (addictionLogs.length * 5))),
        procrastinationProbability: addictionLogs.length > 2 ? "Moderate" : "Low",
        distractionTriggerAnalysis: "Reels distraction triggers are checked. Focus sessions build stable concentration loops.",
        actionSteps: [
          "Activate extreme Detox blocker to seal browser channels.",
          "Limit single sitting learning sessions to 25 mins pomodoro blocks.",
          "Recite formulas from memory before drafting study worksheets."
        ],
        motivationalNudge: "The bridge between goals and accomplishment is academic self-discipline."
      });
      onTriggerVoiceAnnouncement("Behavior card parsed from offline templates.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchBehavioralReport();
  }, [focusLogs.length, addictionLogs.length, streakCount]);

  const handleUpdateProfileMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: nameInput,
      learningStyle: styleInput as any,
      productivityType: typeInput as any,
      targetSleepHours: hoursInput
    });
    onTriggerVoiceAnnouncement(`Profile updated. Cognitive adjustments configured for ${styleInput} learning styles.`);
  };

  const handleAddWeakSubject = () => {
    if (weakSubjectInput.trim() && !profile.weakSubjects.includes(weakSubjectInput.trim())) {
      onUpdateProfile({
        ...profile,
        weakSubjects: [...profile.weakSubjects, weakSubjectInput.trim()]
      });
      setWeakSubjectInput("");
      onTriggerVoiceAnnouncement(`Added weak target subject. Routine weight raised.`);
    }
  };

  const handleRemoveWeakSubject = (subj: string) => {
    onUpdateProfile({
      ...profile,
      weakSubjects: profile.weakSubjects.filter(s => s !== subj)
    });
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubjectInput || !examDateInput) return;

    const examDate = new Date(examDateInput);
    const today = new Date();
    const diffTime = Math.max(0, examDate.getTime() - today.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newExam = {
      id: `exam-${Date.now()}`,
      subject: examSubjectInput,
      date: examDateInput,
      daysLeft
    };

    onUpdateProfile({
      ...profile,
      examCountdowns: [...profile.examCountdowns, newExam]
    });

    setExamSubjectInput("");
    setExamDateInput("");
    onTriggerVoiceAnnouncement(`Exam countdown registered for ${examSubjectInput}. Smart revision timelines updated.`);
  };

  const handleRemoveExam = (id: string) => {
    onUpdateProfile({
      ...profile,
      examCountdowns: profile.examCountdowns.filter(ex => ex.id !== id)
    });
  };

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col h-full">
      {/* Title block */}
      <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <h3 className="font-sans font-bold text-slate-100 text-sm">Behavior & Analytics Command</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Machine learning metrics and custom procrastination cure</p>
        </div>

        {/* Inner subtabs */}
        <div className="flex gap-1.5 bg-[#070a11]/45 p-1.5 border border-[#1E293B] rounded-xl text-[10px] font-sans font-medium">
          <button
            type="button"
            id="subtab-ai-behv"
            onClick={() => setActiveSubTab("ai-behavior")}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${activeSubTab === "ai-behavior" ? "bg-[#1E293B] text-indigo-400 font-bold" : "text-slate-400"}`}
          >
            AI Strategy
          </button>
          <button
            type="button"
            id="subtab-charts"
            onClick={() => setActiveSubTab("charts")}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${activeSubTab === "charts" ? "bg-[#1E293B] text-indigo-400 font-bold" : "text-slate-400"}`}
          >
            Visual Charts
          </button>
          <button
            type="button"
            id="subtab-profile"
            onClick={() => setActiveSubTab("profile")}
            className={`px-3 py-1 rounded-lg transition duration-200 cursor-pointer ${activeSubTab === "profile" ? "bg-[#1E293B] text-indigo-400 font-bold" : "text-slate-400"}`}
          >
            Profile & Quiz
          </button>
        </div>
      </div>

      {/* VIEW 1: AI COGNITIVE REPORT */}
      {activeSubTab === "ai-behavior" && (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wide">Behavioral analysis index</span>
              <button
                type="button"
                id="re-analyze-behv-btn"
                disabled={loadingAI}
                onClick={fetchBehavioralReport}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Recalculate Stats</span>
              </button>
            </div>

            {loadingAI ? (
              <div className="py-20 text-center text-slate-500 text-xs animate-pulse">
                <Cpu className="h-7 w-7 text-slate-700 mx-auto mb-2 animate-spin" />
                <span>AI is compiling cognitive telemetry...</span>
              </div>
            ) : aiReport ? (
              <div className="space-y-3">
                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-500 font-mono block">DISCIPLINE RATIO</span>
                      <span className="text-xl font-mono font-black text-slate-200">{aiReport.disciplineScore}%</span>
                    </div>
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono ${
                      aiReport.disciplineScore >= 80 ? "border-emerald-800 text-emerald-400 bg-emerald-950/25" : "border-rose-800 text-rose-400 bg-rose-950/25"
                    }`}>
                      {aiReport.disciplineScore >= 80 ? "A" : aiReport.disciplineScore >= 65 ? "B" : "C"}
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl">
                    <span className="text-[8px] text-slate-500 font-mono block uppercase">Procrastination Risk</span>
                    <span className={`text-sm font-sans font-bold block mt-1 uppercase tracking-wide ${
                      aiReport.procrastinationProbability === "Low" ? "text-emerald-400" : aiReport.procrastinationProbability === "Moderate" ? "text-amber-400 animate-pulse" : "text-rose-500 animate-pulse font-black"
                    }`}>
                      {aiReport.procrastinationProbability} STATE
                    </span>
                  </div>
                </div>

                {/* Distraction analysis narrative context */}
                <div className="p-3 bg-indigo-950/20 border border-indigo-950 rounded-xl">
                  <label className="text-[8px] font-mono text-indigo-400 uppercase tracking-widest block font-bold mb-1">DOPAMINE DYNAMICS REPORT</label>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{aiReport.distractionTriggerAnalysis}</p>
                </div>

                {/* Remedies list */}
                <div>
                  <label className="text-[9px] font-mono text-slate-500 uppercase block font-bold mb-2">PROPRIETARY REMEDIAL RECIPES (ANTI-PROCRASTINATION)</label>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {aiReport.actionSteps.map((step, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-slate-300 leading-normal bg-slate-950/40 p-2 border border-slate-800/40 rounded-lg">
                        <span className="h-4.5 w-4.5 rounded bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-[10px] text-indigo-400 shrink-0 font-bold font-mono">
                          {i+1}
                        </span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Motivational banner nudge */}
          {aiReport && (
            <div className="border-t border-slate-800 p-3 bg-slate-950/40 rounded-xl mt-4 flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-[2px] animate-pulse" />
              <p className="text-[11px] text-slate-400 italic">
                “{aiReport.motivationalNudge}”
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: VISUAL CHARTS (SVG BASED HIGH CONTRAST CHARTS) */}
      {activeSubTab === "charts" && (
        <div className="flex-grow space-y-5">
          {/* Heatmap concentration tracker grid */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block mb-2">Student consistency Heatmap (last 4 weeks)</span>
            {/* Heatmap Grid simulator */}
            <div className="flex justify-between gap-1">
              {Array.from({ length: 28 }).map((_, i) => {
                const dayValue = (i * 3 + streakCount * 5) % 100;
                const cellBg = dayValue > 70 
                  ? "bg-indigo-500 border-indigo-400" 
                  : dayValue > 40 
                  ? "bg-indigo-700/60 border-indigo-600/30" 
                  : dayValue > 15 
                  ? "bg-indigo-950/80 border-indigo-900/30" 
                  : "bg-slate-950 border-slate-900";
                return (
                  <div 
                    key={i} 
                    className={`h-5 w-5 sm:h-6 sm:w-6 border rounded-sm ${cellBg} transition duration-500`}
                    title={`Day -${i}: Focus activity: ${Math.round(dayValue)}%`}
                  ></div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-600">
              <span>Less study hour consistency</span>
              <span>Extreme Concentration consistency</span>
            </div>
          </div>

          {/* Screen Time Wasted vs Focus study minutes Side-by-Side bar charts */}
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3">Weekly Dopamine checkin (Minutes wasted vs study)</span>
            
            <div className="flex items-end justify-around h-32 pt-4 relative">
              <div className="absolute right-0 top-0 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 bg-indigo-500 rounded"></span>
                  <span className="text-slate-400 text-[9px]">Study Minutes</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="h-2.5 w-2.5 bg-rose-500 rounded"></span>
                  <span className="text-slate-400 text-[9px]">Wasted Minutes</span>
                </div>
              </div>

              {/* Data points (Mon - Sun) */}
              {[
                { day: "Mon", study: 90, waste: 20 },
                { day: "Tue", study: 120, waste: 45 },
                { day: "Wed", study: 45, waste: 80 },
                { day: "Thu", study: 180, waste: 15 },
                { day: "Fri", study: 110, waste: 30 },
                { day: "Sat", study: streakCount > 2 ? 150 : 60, waste: Math.round(timeWastedHours * 60) },
                { day: "Today", study: totalStudyMinutes, waste: Math.round(timeWastedHours * 60) }
              ].map((item, idx) => {
                // scale max minutes (200px equivalent)
                const studyPct = Math.min(100, (item.study / 200) * 100);
                const wastePct = Math.min(100, (item.waste / 200) * 100);

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="flex gap-1.5 h-full items-end justify-center w-8">
                      {/* Study Bar */}
                      <div 
                        style={{ height: `${Math.max(4, studyPct)}%` }}
                        className="bg-indigo-500 rounded-t w-2 px-1 transition-all duration-700"
                        title={`Study: ${item.study}m`}
                      ></div>
                      {/* Waste Bar */}
                      <div 
                        style={{ height: `${Math.max(4, wastePct)}%` }}
                        className="bg-rose-500 rounded-t w-2 px-1 transition-all duration-700"
                        title={`Wasted: ${item.waste}m`}
                      ></div>
                    </div>
                    <span className="font-mono text-[9px] text-slate-500">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PROFILE SETUP & EXAMS */}
      {activeSubTab === "profile" && (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Edit settings */}
          <form onSubmit={handleUpdateProfileMeta} className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl space-y-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Student Cognitive Config</span>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[9px] text-slate-400 font-mono mb-1">COGNITIVE DISPLAY NAME</label>
                <input
                  type="text"
                  id="display-profile-name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-mono mb-1">LEARNING METHOD</label>
                <select
                  value={styleInput}
                  onChange={(e) => setStyleInput(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded cursor-pointer"
                >
                  <option value="Visual">Visual Study (Image/Mind)</option>
                  <option value="Auditory">Auditory focus (Talk/Listen)</option>
                  <option value="Kinesthetic">Kinesthetic study (Write/Do)</option>
                  <option value="Read/Write">Read/Write syllabus (Text)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-mono mb-1">PRODUCTIVITY TYPE</label>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded cursor-pointer"
                >
                  <option value="Early Bird">Early Bird (Morning)</option>
                  <option value="Night Owl">Night Owl (Quiet hour)</option>
                  <option value="Pomodoro Master">Pomodoro Master (Slots)</option>
                  <option value="Deep Work Enthusiast">Deep study (Blocks)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 font-mono mb-1">TARGET SLEEP HOURS</label>
                <input
                  type="number"
                  min="4"
                  max="10"
                  step="0.5"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-0.5 px-2 rounded"
                />
              </div>
            </div>

            <button type="submit" id="apply-profile-btn" className="w-full bg-indigo-650 hover:bg-indigo-600 text-indigo-100 font-sans font-bold text-xs py-1.5 rounded transition">
              Apply Configurations
            </button>
          </form>

          {/* Weak subjects lists */}
          <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">Weak topics weight booster</span>
            <div className="flex gap-2">
              <input
                type="text"
                id="weak-subj-textbox"
                value={weakSubjectInput}
                onChange={(e) => setWeakSubjectInput(e.target.value)}
                placeholder="e.g., Organic chemistry structural forms"
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded p-1.5 flex-1"
              />
              <button 
                type="button" 
                id="add-weak-subj-btn"
                onClick={handleAddWeakSubject} 
                className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1 text-xs rounded"
              >
                Raise weight
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {profile.weakSubjects.map((sb) => (
                <span key={sb} className="bg-slate-900 border border-slate-800 pl-2.5 pr-1 py-0.5 rounded text-[10px] text-indigo-400 flex items-center gap-1 font-medium select-none">
                  {sb}
                  <button type="button" onClick={() => handleRemoveWeakSubject(sb)} className="text-slate-600 hover:text-red-400 font-bold p-0.5">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Exam calendar lists */}
          <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold mb-2">Academic Countdown Chronology</span>
            <form onSubmit={handleAddExam} className="grid grid-cols-2 gap-2 mb-3">
              <input 
                type="text"
                id="exam-subject-box"
                value={examSubjectInput}
                onChange={(e) => setExamSubjectInput(e.target.value)}
                placeholder="Subject name"
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded"
                required
              />
              <input 
                type="date"
                id="exam-date-box"
                value={examDateInput}
                onChange={(e) => setExamDateInput(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 p-1.5 rounded cursor-pointer"
                required
              />
              <button type="submit" id="add-exam-countdown-btn" className="col-span-2 bg-slate-800 border border-slate-705 p-1 text-xs text-slate-300 rounded font-sans font-medium hover:bg-slate-700">
                Register Target Exam
              </button>
            </form>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
              {profile.examCountdowns.length === 0 ? (
                <p className="text-[11px] text-slate-600 text-center py-2">No exam milestones targets logged.</p>
              ) : (
                profile.examCountdowns.map((ex) => (
                  <div key={ex.id} className="bg-slate-900/60 p-2 border border-slate-800 rounded flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-300">{ex.subject}</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Milestone target: {ex.date}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-rose-950/40 text-rose-400 px-2.5 py-1 rounded">
                        {ex.daysLeft} Day{ex.daysLeft !== 1 ? "s" : ""} left
                      </span>
                      <button type="button" onClick={() => handleRemoveExam(ex.id)} className="text-slate-600 hover:text-red-400">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
