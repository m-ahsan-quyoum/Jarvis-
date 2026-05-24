import React, { useState } from "react";
import { Check, Flame, Trophy, Award, Heart, ShieldAlert, Plus, Trash2, Shield, Battery, HeartCrack, Sparkles, Volume2, Lock, Unlock, Eye, HelpCircle } from "lucide-react";
import { Goal, Habit, Badge, WellnessCheckin, DailyChallenge, UnlockableReward } from "../types";
import { translations } from "../translations";

interface GoalAndTrackersProps {
  goals: Goal[];
  onUpdateGoals: (newGoals: Goal[]) => void;
  habits: Habit[];
  onUpdateHabits: (newHabits: Habit[]) => void;
  rewardBadges: Badge[];
  onAddBadge: (badge: Badge) => void;
  activeWellness: WellnessCheckin | null;
  onUpdateWellness: (wellness: WellnessCheckin) => void;
  onRewardXP: (xp: number, message: string) => void;
  onTriggerVoiceAnnouncement: (text: string) => void;
  language?: "en" | "ur";
  dailyChallenges: DailyChallenge[];
  onUpdateDailyChallenges: (challenges: DailyChallenge[]) => void;
  rewards: UnlockableReward[];
  onUpdateRewards: (rewards: UnlockableReward[]) => void;
  currentLevel: number;
}

export default function GoalAndTrackers({
  goals,
  onUpdateGoals,
  habits,
  onUpdateHabits,
  rewardBadges,
  onAddBadge,
  activeWellness,
  onUpdateWellness,
  onRewardXP,
  onTriggerVoiceAnnouncement,
  language = "en",
  dailyChallenges,
  onUpdateDailyChallenges,
  rewards,
  onUpdateRewards,
  currentLevel
}: GoalAndTrackersProps) {
  // Goal Creator Form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<"daily" | "milestone" | "longTerm">("daily");
  const [goalCategory, setGoalCategory] = useState<"Academic" | "Habit" | "Exam-Prep" | "Mindfulness">("Academic");

  // Habits Form State
  const [habitTitle, setHabitTitle] = useState("");
  const [habitType, setHabitType] = useState<"positive" | "negative">("positive");

  // Wellness Form state
  const [moodState, setMoodState] = useState<"Focused" | "Anxious" | "Fatigued" | "Stressed" | "Motivated" | "Relaxed">("Focused");
  const [energy, setEnergy] = useState(8);
  const [stress, setStress] = useState(3);
  const [sleep, setSleep] = useState(7.5);

  const t = translations[language];

  const handleToggleChallenge = (id: string) => {
    if (!dailyChallenges) return;
    const updated = dailyChallenges.map(challenge => {
      if (challenge.id === id) {
        const nextCompleted = !challenge.isCompleted;
        if (nextCompleted) {
          onRewardXP(challenge.xpReward, `Completed challenge: ${language === "ur" ? challenge.titleUrdu : challenge.title}`);
          onTriggerVoiceAnnouncement(
            language === "ur" 
              ? `شاندار! آپ نے روزانہ کا چیلنج مکمل کر لیا ہے: ${challenge.titleUrdu}۔ مبارک ہو!`
              : `Awesome! You completed the daily challenge: ${challenge.title}. +${challenge.xpReward} XP awarded!`
          );
        }
        return { ...challenge, isCompleted: nextCompleted };
      }
      return challenge;
    });
    onUpdateDailyChallenges(updated);
  };

  const handleToggleActivateReward = (id: string) => {
    if (!rewards) return;
    const updated = rewards.map(reward => {
      if (reward.id === id) {
        const nextActivated = !reward.isActivated;
        if (nextActivated) {
          onTriggerVoiceAnnouncement(
            language === "ur"
              ? `انعامی فائدہ فعال ہو گیا: ${reward.titleUrdu}۔ اب آپ کی کارکردگی اور توجہ بڑھ جائے گی۔`
              : `Productivity reward activated: ${reward.title}. Enhance your focus capacity!`
          );
        }
        return { ...reward, isActivated: nextActivated };
      }
      return reward;
    });
    onUpdateRewards(updated);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: goalTitle,
      category: goalCategory,
      type: goalType,
      isCompleted: false,
      xpValue: goalType === "daily" ? 25 : goalType === "milestone" ? 75 : 150
    };

    onUpdateGoals([...goals, newGoal]);
    setGoalTitle("");
    onRewardXP(15, `Created Goal Target: ${newGoal.title}`);
    onTriggerVoiceAnnouncement(`Target locked: ${newGoal.title}. Complete it to claim ${newGoal.xpValue} XP!`);
  };

  const handleToggleGoal = (id: string, isCompleted: boolean) => {
    const updated = goals.map(g => {
      if (g.id === id) {
        if (!isCompleted) {
          onRewardXP(g.xpValue, `XP Claimed for target: ${g.title}`);
          onTriggerVoiceAnnouncement(`Incredible work! Goal attained: ${g.title}. XP Reward loaded!`);
          
          // Check if unlocking total goals triggers standard badge
          const countCompleted = goals.filter(item => item.isCompleted).length + 1;
          if (countCompleted === 1) {
            triggerBadgeUnlock("pioneer_badge", "Pioneer Badge", "Unlocked your very first academic goal card!", "Award");
          } else if (countCompleted === 5) {
            triggerBadgeUnlock("milestone_conqueror", "Goal Master", "Conquered 5 active student milestones!", "Trophy");
          }
        }
        return { ...g, isCompleted: !isCompleted };
      }
      return g;
    });
    onUpdateGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    onUpdateGoals(goals.filter(g => g.id !== id));
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: habitTitle,
      streak: 0,
      frequency: "daily",
      type: habitType
    };

    onUpdateHabits([...habits, newHabit]);
    setHabitTitle("");
    onTriggerVoiceAnnouncement(`Habit tracker initialized: ${newHabit.title}. Stay consistent to build streaks.`);
  };

  const handleIncrementStreak = (id: string, currentStreak: number) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = habits.map(h => {
      if (h.id === id) {
        if (h.lastCompletedDate === today) {
          alert("Already reported for today!");
          return h;
        }

        const nextStreak = currentStreak + 1;
        onRewardXP(15, `Streak increased for habit: ${h.title}`);
        onTriggerVoiceAnnouncement(`Streak streak elevated to ${nextStreak} for ${h.title}!`);

        if (nextStreak === 3) {
          triggerBadgeUnlock("streak_beast", "Three-Streak Elite", "Maintained 3 consecutive habit increments!", "Flame");
        }

        return {
          ...h,
          streak: nextStreak,
          lastCompletedDate: today
        };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
  };

  const triggerBadgeUnlock = (id: string, title: string, desc: string, iconName: string) => {
    const exists = rewardBadges.some(b => b.id === id);
    if (!exists) {
      const b: Badge = {
        id,
        title,
        description: desc,
        iconName,
        unlockedAt: new Date().toLocaleDateString()
      };
      onAddBadge(b);
      onRewardXP(100, `Badge Unlocked: ${title}`);
      onTriggerVoiceAnnouncement(`ACHIEVEMENT EARNED: Unlocked ${title}! ${desc}`);
    }
  };

  const handleSubmitWellness = (e: React.FormEvent) => {
    e.preventDefault();
    const wellness: WellnessCheckin = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: moodState,
      energyLevel: energy,
      stressLevel: stress,
      sleepHoursLastNight: sleep
    };

    onUpdateWellness(wellness);
    onRewardXP(20, "Daily Wellness Alignment Logged");

    // Perform behavioral check out loud
    if (energy < 4 && stress > 6) {
      onTriggerVoiceAnnouncement(
        "BURN-OUT WARNING: Energy reserves critical, stress indices extreme. I recommend immediate relaxation reset. Postpone non-urgent tasks."
      );
    } else if (sleep < 6) {
      onTriggerVoiceAnnouncement(
        "SLEEP DEFICIT: Low physical sleep detected. This impairs hippocampus retention. Sleep early tonight."
      );
    } else {
      onTriggerVoiceAnnouncement(
        "Wellness baseline analyzed. Cognitive equilibrium within normal bounds. Proceed with study planner."
      );
    }
  };

  // Burnout indicators
  const getBurnoutRisk = () => {
    if (!activeWellness) return { label: "Unknown", color: "text-slate-500", bg: "bg-slate-950" };
    const score = (activeWellness.stressLevel * 1.5) - (activeWellness.energyLevel * 0.8) + (8 - activeWellness.sleepHoursLastNight);
    
    if (score > 10) return { label: "CRITICAL BURN-OUT WARNING", color: "text-rose-400 font-bold", bg: "bg-rose-950/45 animate-pulse" };
    if (score > 5) return { label: "Moderate Workload Strain", color: "text-amber-400", bg: "bg-amber-950/20" };
    return { label: "Balanced Equilibrium", color: "text-emerald-400 font-semibold", bg: "bg-emerald-950/25" };
  };

  const risk = getBurnoutRisk();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-full">
      
      {/* COLUMN 1: GOALS & ATOMIC HABBITS CREATOR */}
      <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="font-sans font-bold text-slate-100 text-sm">{t.goalsTitle}</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{language === "ur" ? "اہداف اور عادات" : "Gamified Actions"}</span>
          </div>

          {/* Quick Creator */}
          <form onSubmit={handleAddGoal} className="bg-[#070a11]/60 p-3 border border-[#1E293B] rounded-2xl mb-4 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">{t.goalTargetPlannerTitle}</span>
            <div className="flex gap-2">
              <input
                type="text"
                id="create-goal-textbox"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder={t.goalPlaceholder}
                className="bg-[#0B0F17] border border-[#1E293B] focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1.5 outline-none flex-1"
                required
              />
              <button
                type="submit"
                id="sumbit-new-goal-btn"
                className="bg-indigo-650 hover:bg-indigo-600 text-slate-50 text-[11px] font-sans font-bold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
              >
                {t.claimButton}
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 font-mono block mb-1">{t.horizonTitle}</label>
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] text-[10px] text-slate-300 p-1.5 rounded-md outline-none cursor-pointer"
                >
                  <option value="daily">{language === "ur" ? "روزمَرہ ہدف" : "Daily Goal"}</option>
                  <option value="milestone">{language === "ur" ? "سنگِ میل سنگل" : "Milestone Target"}</option>
                  <option value="longTerm">{language === "ur" ? "طویل مدتی نظریہ" : "Long-Term Vision"}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-slate-500 font-mono block mb-1">{t.disciplineTitle}</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full bg-[#0B0F17] border border-[#1E293B] text-[10px] text-slate-300 p-1.5 rounded-md outline-none cursor-pointer"
                >
                  <option value="Academic">{language === "ur" ? "تعلیمی" : "Academic"}</option>
                  <option value="Habit">{language === "ur" ? "تسلسل عادت" : "Consistency Habit"}</option>
                  <option value="Exam-Prep">{language === "ur" ? "امتحان کی تیاری" : "Exam Prep"}</option>
                  <option value="Mindfulness">{language === "ur" ? "ذہنی سکون" : "Mindfulness"}</option>
                </select>
              </div>
            </div>
          </form>

          {/* Goals Checklist */}
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {goals.length === 0 ? (
              <p className="text-[11px] text-slate-500 text-center py-4">{t.goalsEmpty}</p>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="bg-slate-950/40 border border-slate-800/40 p-2 rounded-lg flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      id={`g-${g.id}-check-btn`}
                      onClick={() => handleToggleGoal(g.id, g.isCompleted)}
                      className={`h-4.5 w-4.5 border rounded flex items-center justify-center cursor-pointer ${
                        g.isCompleted ? "bg-emerald-500 border-transparent text-slate-950" : "border-slate-800 hover:border-slate-600 text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3.5]" />
                    </button>
                    <div className="min-w-0">
                      <p className={`text-xs ${g.isCompleted ? "line-through text-slate-500" : "text-slate-300"} font-sans font-medium truncate`}>
                        {g.title}
                      </p>
                      <span className="text-[9px] font-mono text-slate-500 font-bold">
                        {language === "ur" && g.category === "Academic" ? "تعلیمی" : g.category} • {g.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-500">+{g.xpValue} XP</span>
                    <button type="button" onClick={() => handleDeleteGoal(g.id)} className="text-slate-600 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-[#1E293B]/60 my-3"></div>

          {/* Quick atomic habits */}
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2">{t.streakTitleLabel}</span>
          <form onSubmit={handleAddHabit} className="flex gap-2 mb-3">
            <input
              type="text"
              id="create-habit-textbox"
              value={habitTitle}
              onChange={(e) => setHabitTitle(e.target.value)}
              placeholder={t.habitTrackerPlaceholder}
              className="bg-[#0B0F17] border border-[#1E293B] focus:border-indigo-500 text-xs text-slate-200 placeholder-slate-600 rounded-lg px-3 py-1 outline-none flex-1"
              required
            />
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value as any)}
              className="bg-[#0B0F17] border border-[#1E293B] text-[10px] text-slate-300 p-1.5 rounded-lg cursor-pointer max-w-[90px]"
            >
              <option value="positive">{language === "ur" ? "ثابت کریں (+)" : "Build (+)"}</option>
              <option value="negative">{language === "ur" ? "روکیں (-)" : "Reduce (-)"}</option>
            </select>
            <button
              type="submit"
              id="claim-habit-btn"
              className="bg-[#161F30] border border-[#1E293B] hover:bg-[#1f2b42] text-slate-300 font-sans text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition shrink-0"
            >
              {t.logButton}
            </button>
          </form>

          {/* habits streak blocks */}
          <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-1">
            {habits.map((h) => {
              const buildColor = h.type === "positive" ? "text-emerald-400 bg-emerald-950/10 border-emerald-950" : "text-rose-400 bg-rose-950/10 border-rose-950";
              return (
                <div key={h.id} className={`border p-2 rounded-xl flex justify-between items-center ${buildColor}`}>
                  <div className="min-w-0">
                    <span className="font-sans font-bold text-xs truncate block">{h.title}</span>
                    <span className="text-[9px] font-mono opacity-65 flex items-center gap-1">
                      <Flame className="h-3 w-3 fill-rose-500 stroke-none" />
                      {language === "ur" ? "تسلسل" : "Streak"}: {h.streak} {t.days}
                    </span>
                  </div>

                  <div className="flex gap-1.5 items-center">
                    <button
                      type="button"
                      id={`inc-habit-streak-${h.id}`}
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        if (h.lastCompletedDate === today) {
                          alert(t.alreadyLoggedMessage);
                        } else {
                          handleIncrementStreak(h.id, h.streak);
                        }
                      }}
                      className="bg-slate-950/70 border border-slate-800/60 px-2 py-1 text-[9px] font-sans font-medium hover:bg-slate-900 rounded cursor-pointer"
                    >
                      +{h.type === "positive" ? (language === "ur" ? "بنائیں" : "Build") : (language === "ur" ? "روکیں" : "Block")}
                    </button>
                    <button type="button" onClick={() => handleDeleteHabit(h.id)} className="opacity-50 hover:opacity-100 text-slate-400">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locked credentials card */}
        <div className="bg-slate-950/30 border border-slate-900 p-3 rounded-xl flex flex-wrap items-center gap-3 mt-4">
          <Award className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-[9px] text-slate-500 uppercase">{language === "ur" ? "مستقل مزاجی میڈلز:" : "Consistency achievements:"}</span>
          <div className="flex flex-wrap gap-1">
            {rewardBadges.length === 0 ? (
              <span className="text-[9px] italic text-slate-600">Locked. Claim study cards to unlock badges.</span>
            ) : (
              rewardBadges.map((badge) => (
                <span 
                  key={badge.id} 
                  className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[8px] text-amber-500 font-sans font-semibold cursor-help"
                  title={`${badge.title}: ${badge.description}`}
                >
                  🏅 {badge.title}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* COLUMN 2: DAILY DISCIPLINE CHALLENGES */}
      <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              <h3 className="font-sans font-bold text-slate-100 text-sm">{t.dailyChallengesTitle}</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{language === "ur" ? "اہم چیلنجز" : "Coaching Focus"}</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-4 font-sans leading-relaxed">
            {language === "ur" 
              ? "روزانہ کے ڈسپلن چیلنجز مکمل کریں اور اپنی علمی پیداواری صلاحیت کو تیزی سے ترقی دیں!" 
              : "Execute daily consistency challenges designed to push metabolic limits and defeat procrastination."}
          </p>

          {/* Challenges List */}
          <div className="space-y-3">
            {dailyChallenges && dailyChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`p-3 border rounded-2xl flex items-start gap-3 transition-colors ${
                  challenge.isCompleted 
                    ? "bg-indigo-950/20 border-indigo-500/30" 
                    : "bg-[#070a11]/40 border-[#1E293B] hover:border-[#334155]"
                }`}
              >
                <button
                  type="button"
                  id={`dc-${challenge.id}-checkbox`}
                  onClick={() => handleToggleChallenge(challenge.id)}
                  className={`h-5 w-5 border rounded-lg flex items-center justify-center cursor-pointer transition shrink-0 ${
                    challenge.isCompleted 
                      ? "bg-indigo-500 border-transparent text-slate-950" 
                      : "border-slate-800 hover:border-slate-600 text-transparent"
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-sans font-bold leading-snug ${challenge.isCompleted ? "line-through text-slate-500" : "text-slate-200"}`}>
                    {language === "ur" ? challenge.titleUrdu : challenge.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-mono">
                    <span className="text-amber-500 font-bold">+{challenge.xpReward} {t.challengePoints}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-indigo-400">{language === "ur" ? "روزانہ چارج" : "Daily charge"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak milestone motivation */}
        <div className="bg-[#161F30]/40 border border-[#1E293B] p-3 rounded-2xl mt-4 text-[10.5px] leading-relaxed text-slate-400 flex items-start gap-2">
          <Trophy className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            {language === "ur"
              ? "5 دن کے تسلسل مائل اسٹون کو برقرار رکھیں تاکہ آپ 'ڈسپلن مونسٹر' کا خصوصی عہدہ اور بیج حاصل کر سکیں!"
              : "Unlock 'Discipline Demon' elite trophy and claim +500 XP bonus credits by locking in a flawless 5-day streak!"}
          </span>
        </div>
      </div>

      {/* COLUMN 3: WELLNESS COMPANION & UNLOCKABLE BOOSTS */}
      <div className="bg-[#0B0F17] border border-[#1E293B] rounded-3xl p-5 shadow-lg shadow-slate-950/30 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#1E293B] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400" />
              <h3 className="font-sans font-bold text-slate-100 text-sm">{t.wellnessTitle}</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{t.wellnessSub}</span>
          </div>

          {/* Current index warnings */}
          {activeWellness ? (
            <div className={`p-3 border border-slate-800 rounded-xl mb-3 ${risk.bg}`}>
              <div className="flex justify-between items-start">
                <div>
                  <label className="text-[8px] font-mono text-slate-500 uppercase">{t.burnoutStatusTitle}</label>
                  <p className={`text-xs ${risk.color}`}>{risk.label}</p>
                </div>
                <span className="text-[9px] font-mono text-slate-400">{activeWellness.timestamp}</span>
              </div>

              {/* Status bar matrix */}
              <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                <div className="bg-slate-950 p-1.5 border border-slate-900 rounded-lg">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">{language === "ur" ? "توانائی" : "Energy"}</span>
                  <div className="flex items-center gap-1">
                    <Battery className={`h-3 w-3 ${activeWellness.energyLevel < 4 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`} />
                    <span className="font-mono text-[10px] font-bold text-slate-200">{activeWellness.energyLevel}/10</span>
                  </div>
                </div>
                <div className="bg-slate-950 p-1.5 border border-slate-900 rounded-lg">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">{language === "ur" ? "دباؤ" : "Stress"}</span>
                  <div className="flex items-center gap-1">
                    <HeartCrack className={`h-3 w-3 ${activeWellness.stressLevel > 6 ? "text-rose-500 animate-bounce" : "text-indigo-400"}`} />
                    <span className="font-mono text-[10px] font-bold text-slate-200">{activeWellness.stressLevel}/10</span>
                  </div>
                </div>
                <div className="bg-[#070a11] p-1.5 border border-[#1E293B] rounded-lg">
                  <span className="block text-[8px] font-mono text-slate-500 uppercase mb-0.5">{language === "ur" ? "نیند" : "Sleep"}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-200 block">{activeWellness.sleepHoursLastNight}h</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#070a11]/60 border border-[#1E293B] rounded-2xl mb-3 text-center">
              <p className="text-xs text-slate-500 font-sans">{t.wellnessEmpty}</p>
            </div>
          )}

          {/* Wellness Checkin Input Form */}
          <form onSubmit={handleSubmitWellness} className="space-y-2 mb-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">{t.wellnessSubheading}</span>
            
            <div className="grid grid-cols-3 gap-1">
              {(["Focused", "Anxious", "Fatigued", "Stressed", "Motivated", "Relaxed"] as const).map((mood) => {
                const isSelected = moodState === mood;
                return (
                  <button
                    type="button"
                    key={mood}
                    onClick={() => setMoodState(mood)}
                    className={`p-1.5 border leading-tight rounded text-[9px] font-sans transition truncate cursor-pointer ${
                      isSelected 
                        ? "bg-rose-950/40 border-rose-500 text-rose-400 font-bold" 
                        : "bg-[#070a11] border-[#1E293B] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {language === "ur" ? (
                      mood === "Focused" ? "توجہ" : mood === "Anxious" ? "فکرمند" : mood === "Fatigued" ? "تھکا ہوا" : mood === "Stressed" ? "تناؤ" : mood === "Motivated" ? "پرعزم" : "پرسکون"
                    ) : mood}
                  </button>
                );
              })}
            </div>

            {/* Sliders energy/stress */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-semibold">{t.physicalEnergyTitle}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-300">{energy}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-[#070a11] border border-[#1E293B]/40 h-1 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono text-slate-500 uppercase font-semibold">{t.stressIntensityTitle}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-300">{stress}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(parseInt(e.target.value))}
                  className="w-full accent-rose-500 bg-[#070a11] border border-[#1E293B]/40 h-1 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              id="sumbit-wellcheck-btn"
              className="w-full bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-400 text-[11px] font-sans font-bold py-1.5 rounded-lg transition cursor-pointer mt-1"
            >
              {t.analyzeWellnessBtn}
            </button>
          </form>

          {/* UNLOCKABLE REWARDS LIST */}
          <div className="border-t border-[#1E293B]/60 pt-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2 flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-indigo-400" />
              {t.unlockableRewardsTitle}
            </span>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {rewards && rewards.map((rew) => {
                const isUnlocked = currentLevel >= rew.requiredLevel;
                return (
                  <div key={rew.id} className={`p-2 rounded-xl border text-[10.5px] font-sans flex items-center justify-between gap-2 ${
                    isUnlocked 
                      ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-300" 
                      : "bg-slate-950/45 border-slate-900 text-slate-500"
                  }`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-bold">
                        {isUnlocked ? <Unlock className="h-3 w-3 text-emerald-400 shrink-0" /> : <Lock className="h-3 w-3 text-slate-600 shrink-0" />}
                        <span className="truncate">{language === "ur" ? rew.titleUrdu : rew.title}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{language === "ur" ? rew.descriptionUrdu : rew.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {isUnlocked ? (
                        <button
                          type="button"
                          onClick={() => handleToggleActivateReward(rew.id)}
                          className={`px-1.5 py-0.5 text-[8.5px] rounded font-sans font-bold transition cursor-pointer ${
                            rew.isActivated 
                              ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400" 
                              : "bg-indigo-600 hover:bg-indigo-500 text-white"
                          }`}
                        >
                          {rew.isActivated ? t.activatedReward : t.activateReward}
                        </button>
                      ) : (
                        <span className="font-mono text-[8.5px] uppercase tracking-wide px-1 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-500">
                          {t.lockedStatus}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Relaxing guidance suggestions */}
        <div className="bg-[#070a11]/40 border border-[#1E293B]/60 p-2.5 rounded-2xl mt-3 text-[10.5px] leading-relaxed text-slate-400 font-sans">
          <Shield className="h-3.5 w-3.5 text-cyan-400 inline mr-1.5 shrink-0" />
          <span>{t.recLabel}</span>
        </div>
      </div>

    </div>
  );
}
