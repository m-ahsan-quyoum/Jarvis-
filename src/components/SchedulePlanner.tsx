import React, { useState } from "react";
import { Calendar, Brain, Clock, Plus, Trash2, CheckSquare, Square, RotateCcw, AlertCircle, RefreshCw, Star } from "lucide-react";
import { ScheduleEvent, ScheduleEventType } from "../types";

interface SchedulePlannerProps {
  schedule: ScheduleEvent[];
  onUpdateSchedule: (newSchedule: ScheduleEvent[]) => void;
  onRewardXP: (xp: number, message: string) => void;
  onTriggerVoiceAnnouncement: (text: string) => void;
  profile: {
    learningStyle: string;
    productivityType: string;
    targetSleepHours: number;
    weakSubjects: string[];
  };
  language?: "en" | "ur";
}

export default function SchedulePlanner({
  schedule,
  onUpdateSchedule,
  onRewardXP,
  onTriggerVoiceAnnouncement,
  profile,
  language = "en"
}: SchedulePlannerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dailyGoalInput, setDailyGoalInput] = useState("");
  const [examInfoInput, setExamInfoInput] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualType, setManualType] = useState<ScheduleEventType>("study");
  const [manualDesc, setManualDesc] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  // Calls full-stack Gemini scheduler proxy
  const generateAISchedule = async () => {
    setIsGenerating(true);
    onTriggerVoiceAnnouncement("Contacting scheduling matrix to re-optimize your study cells. Please standby.");
    
    try {
      const response = await fetch("/api/gemini/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyGoals: dailyGoalInput || "Prepare for active tests, review general syllabus, build study streak",
          examDates: examInfoInput || "Next 3 weeks",
          learningStyle: profile.learningStyle || "Visual / Pomodoro",
          sleepHours: profile.targetSleepHours || 8,
          subjectPreferences: profile.weakSubjects.join(", ") || "Core science and math"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile scheduling query");
      }

      const events: ScheduleEvent[] = await response.json();
      
      // Inject IDs and isCompleted: false flags
      const mappedEvents = events.map((ev, i) => ({
        ...ev,
        id: `ai-sched-${Date.now()}-${i}`,
        isCompleted: false
      }));

      onUpdateSchedule(mappedEvents);
      onRewardXP(40, "AI Scheduling Generation Bonus");
      onTriggerVoiceAnnouncement("Successfully optimized your study Routine! Let's conquer these goals today.");
    } catch (e) {
      console.error(e);
      // Resilient fallback logic
      const fallbackEvents: ScheduleEvent[] = [
        { 
          id: `f1-${Date.now()}`, 
          title: "Intense Syllabus Review", 
          time: "09:00 AM - 10:30 AM", 
          type: "study", 
          description: `Focus core studying on: ${profile.weakSubjects[0] || "primary engineering topics"}.`,
          focusTip: "Limit distractions and study in silence.",
          isCompleted: false
        },
        { 
          id: `f2-${Date.now()}`, 
          title: "Regenerative Hydration Break", 
          time: "10:30 AM - 10:45 AM", 
          type: "break", 
          description: "Drink 2 glasses of water, do light core stretches.",
          focusTip: "Keep screens fully closed.",
          isCompleted: false
        },
        { 
          id: `f3-${Date.now()}`, 
          title: "Exam Revision Drill", 
          time: "10:45 AM - 12:15 PM", 
          type: "exam-prep", 
          description: "Do targeted mock exams and syllabus question banks.",
          focusTip: "Retrieve formulas purely from memory.",
          isCompleted: false
        },
        { 
          id: `f4-${Date.now()}`, 
          title: "Wellness Alignment Reset", 
          time: "12:15 PM - 12:30 PM", 
          type: "wellness", 
          description: "Engage in deep mindful box-breathing to recover mental space.",
          focusTip: "Close eyes, relax facial muscles.",
          isCompleted: false
        }
      ];
      onUpdateSchedule(fallbackEvents);
      onTriggerVoiceAnnouncement("Schedule loaded from your local templates. Keep focused!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Adaptive Timetable Management - reschedule incomplete items
  const handleAdaptMissedTasks = async () => {
    const incompleteTasks = schedule.filter(ev => !ev.isCompleted);
    if (incompleteTasks.length === 0) {
      onTriggerVoiceAnnouncement("Excellent! All slots have been conquered. No rescheduling required.");
      return;
    }

    setIsGenerating(true);
    onTriggerVoiceAnnouncement("Re-budgeting your timeline based on missed study blocks.");

    try {
      const response = await fetch("/api/gemini/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyGoals: `Reschedule these elements to ensure they get completed today: ${incompleteTasks.map(t => t.title).join(", ")}`,
          examDates: examInfoInput || "Upcoming tests",
          learningStyle: profile.learningStyle,
          sleepHours: profile.targetSleepHours,
          subjectPreferences: profile.weakSubjects.join(", ")
        })
      });

      if (!response.ok) throw new Error("Adapt query failed");
      const remappedAndAdapted: ScheduleEvent[] = await response.json();
      
      const updatedEvents = remappedAndAdapted.map((ev, i) => ({
        ...ev,
        id: `adapted-${Date.now()}-${i}`,
        isCompleted: false
      }));

      // Retain the already completed tasks to preserve student streak history!
      const alreadyCompleted = schedule.filter(ev => ev.isCompleted);
      onUpdateSchedule([...alreadyCompleted, ...updatedEvents]);
      onTriggerVoiceAnnouncement("Timetable rescheduled successfully. Keep pushing forward!");
    } catch (e) {
      console.error(e);
      // Resilient local rotation
      const rescheduled = schedule.map(ev => {
        if (!ev.isCompleted) {
          // Push times back forward slightly or label as priority
          return {
            ...ev,
            title: `🔄 PRIORITY: ${ev.title}`,
            focusTip: `Urgency raised! ${ev.focusTip}`
          };
        }
        return ev;
      });
      onUpdateSchedule(rescheduled);
      onTriggerVoiceAnnouncement("Adjusted incomplete task urgencies. Attack them now!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleEvent = (id: string, isCompleted: boolean) => {
    const updated = schedule.map(ev => {
      if (ev.id === id) {
        if (!isCompleted) {
          onRewardXP(20, `Conquered Study Slot: ${ev.title}`);
          onTriggerVoiceAnnouncement(`Boom! You completed: ${ev.title}. Study blocks build master minds.`);
        }
        return { ...ev, isCompleted: !isCompleted };
      }
      return ev;
    });
    onUpdateSchedule(updated);
  };

  const handleDeleteEvent = (id: string) => {
    onUpdateSchedule(schedule.filter(ev => ev.id !== id));
  };

  const handleAddManualEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle || !manualTime) return;

    const newEv: ScheduleEvent = {
      id: `manual-${Date.now()}`,
      title: manualTitle,
      time: manualTime,
      type: manualType,
      description: manualDesc || "Self-directed student target.",
      focusTip: "Active recalling is superior to passive reading.",
      isCompleted: false
    };

    onUpdateSchedule([...schedule, newEv]);
    onRewardXP(10, "Custom Schedule Goal Created");
    
    // Reset values
    setManualTitle("");
    setManualTime("");
    setManualDesc("");
    setShowManualForm(false);
    onTriggerVoiceAnnouncement(`Logged schedule goal: ${manualTitle}.`);
  };

  // Helper colors maps
  const typeColors: Record<ScheduleEventType, { border: string; bg: string; text: string; dot: string }> = {
    study: { border: "border-indigo-800/60", bg: "bg-indigo-950/20", text: "text-indigo-400", dot: "bg-indigo-500" },
    break: { border: "border-emerald-800/60", bg: "bg-emerald-950/20", text: "text-emerald-400", dot: "bg-emerald-500" },
    "exam-prep": { border: "border-rose-800/60", bg: "bg-rose-950/20", text: "text-rose-400", dot: "bg-rose-500" },
    recreation: { border: "border-amber-800/60", bg: "bg-amber-950/15", text: "text-amber-400", dot: "bg-amber-500" },
    wellness: { border: "border-cyan-800/60", bg: "bg-cyan-950/20", text: "text-cyan-400", dot: "bg-cyan-500" }
  };

  return (
    <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1E293B] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-400" />
            <h3 className="font-sans font-bold text-slate-100 text-base">Adaptive Timetable Hub</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">Generates hourly slots customized to weak areas & exams</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            id="smart-reschedule-btn"
            onClick={handleAdaptMissedTasks}
            className="flex items-center gap-1.5 bg-[#161F30] hover:bg-[#1f2b42] active:bg-[#0d1421] text-slate-300 font-sans font-medium text-xs px-3 py-1.5 rounded-lg border border-[#1E293B] transition"
            title="Automatically reschedule all uncompleted tasks for today"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
            <span>Reschedule Missed</span>
          </button>
          
          <button
            type="button"
            id="add-manual-event-btn"
            onClick={() => setShowManualForm(!showManualForm)}
            className="flex items-center gap-1 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 font-sans font-medium text-xs px-3 py-1.5 rounded-lg border border-indigo-800/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* AI Orchestration Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#070a11]/60 p-4 border border-[#1E293B] rounded-2xl mb-4">
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Today's Goals / Key Aim</label>
          <input
            type="text"
            id="daily-goals-input"
            value={dailyGoalInput}
            onChange={(e) => setDailyGoalInput(e.target.value)}
            placeholder="e.g., Review biology chapter 4, mock exam, write article"
            className="w-full bg-[#0B0F17] border border-[#1E293B] focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">Target Exam Dates</label>
          <div className="flex gap-2">
            <input
              type="text"
              id="exam-dates-input"
              value={examInfoInput}
              placeholder="e.g., Biology final on June 12"
              onChange={(e) => setExamInfoInput(e.target.value)}
              className="flex-1 bg-[#0B0F17] border border-[#1E293B] focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 outline-none transition-colors"
            />
            <button
              type="button"
              id="request-ai-routine-btn"
              disabled={isGenerating}
              onClick={generateAISchedule}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:from-slate-800 disabled:to-slate-800 text-white text-xs font-sans font-semibold px-4 py-1.5 rounded-lg shadow-md transition cursor-pointer"
            >
              {isGenerating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Brain className="h-3.5 w-3.5" />
              )}
              <span>{isGenerating ? "Compiling..." : "Generate AI Routine"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Custom Manual Task Form overlay */}
      {showManualForm && (
        <form onSubmit={handleAddManualEvent} className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300">Create Custom Study block</span>
            <button type="button" onClick={() => setShowManualForm(false)} className="text-xs text-slate-500 hover:text-slate-300">Cancel</button>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-mono">TASK TITLE</label>
            <input
              type="text"
              id="manual-task-title"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g., Physics Lab practice"
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-mono">HOURLY TIMESTAMP</label>
            <input
              type="text"
              id="manual-task-time"
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
              placeholder="e.g., 04:00 PM - 05:00 PM"
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-mono">SESSION CATEGORY</label>
            <select
              value={manualType}
              onChange={(e) => setManualType(e.target.value as ScheduleEventType)}
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="study">Study</option>
              <option value="break">Health Break</option>
              <option value="exam-prep">Exam Prep</option>
              <option value="recreation">Recreation</option>
              <option value="wellness">Wellness Support</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1 font-mono">DESCRIPTION</label>
            <input
              type="text"
              id="manual-task-desc"
              value={manualDesc}
              onChange={(e) => setManualDesc(e.target.value)}
              placeholder="What specifically to execute?"
              className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg outline-none focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-2 text-right">
            <button
              type="submit"
              id="confirm-add-task-btn"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold font-sans text-xs px-4 py-2 rounded-lg cursor-pointer"
            >
              Confirm Goal
            </button>
          </div>
        </form>
      )}

      {/* Routine Timeline */}
      <div className="space-y-3">
        {schedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-800 rounded-xl text-center">
            <Brain className="h-10 w-10 text-slate-700 animate-pulse mb-3" />
            <p className="text-xs text-slate-400">Your scheduler state is currently unpopulated.</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
              Click <strong className="text-indigo-400">"Generate AI Routine"</strong> above or key in your daily targets to design a productive day.
            </p>
          </div>
        ) : (
          schedule.map((event) => {
            const colors = typeColors[event.type] || typeColors.study;
            return (
              <div
                key={event.id}
                className={`flex gap-3 border rounded-xl p-3.5 transition-all duration-300 ${
                  event.isCompleted 
                    ? "bg-slate-950/40 border-slate-900 opacity-60 hover:opacity-100" 
                    : `${colors.bg} ${colors.border}`
                }`}
              >
                {/* Complete Trigger button */}
                <button
                  type="button"
                  id={`toggle-slot-btn-${event.id}`}
                  onClick={() => handleToggleEvent(event.id, !!event.isCompleted)}
                  className="flex items-center justify-center self-start p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {event.isCompleted ? (
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-500 hover:text-indigo-400" />
                  )}
                </button>

                {/* Event text meta */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-sans font-bold text-xs sm:text-sm ${event.isCompleted ? "line-through text-slate-500" : "text-slate-100"}`}>
                        {event.title}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        event.isCompleted ? "bg-slate-900 text-slate-600" : `bg-slate-950/50 ${colors.text} border border-slate-800/40`
                      }`}>
                        {event.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{event.time}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-2">{event.description}</p>
                  
                  {/* Focus AI Tip overlay */}
                  {event.focusTip && !event.isCompleted && (
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 flex items-start gap-1.5">
                      <Star className="h-3 w-3 text-amber-500 shrink-0 mt-[2px]" />
                      <p className="text-[10px] text-slate-400 italic">
                        <strong className="text-slate-200">AI tip:</strong> {event.focusTip}
                      </p>
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  id={`delete-slot-${event.id}`}
                  onClick={() => handleDeleteEvent(event.id)}
                  className="self-start text-slate-600 hover:text-red-400 transition-colors p-1 cursor-pointer"
                  title="Remove segment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
