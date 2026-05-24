export type ScheduleEventType = "study" | "break" | "exam-prep" | "recreation" | "wellness";

export interface ScheduleEvent {
  id: string; // added dynamically if missing
  title: string;
  time: string;
  type: ScheduleEventType;
  description: string;
  focusTip: string;
  isCompleted?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    type: string;
    previewUrl?: string;
    size?: number;
    data?: string;
  };
}

export type GoalCategory = "Academic" | "Habit" | "Exam-Prep" | "Mindfulness";

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  type: "daily" | "milestone" | "longTerm";
  isCompleted: boolean;
  xpValue: number;
  deadline?: string;
}

export interface FocusLog {
  id: string;
  subject: string;
  durationMinutes: number;
  timestamp: string;
  focusScore: number; // 0-100 scale based on interactive activity
  distractionsCount: number;
}

export interface AddictionLog {
  id: string;
  appName: string;
  timeMinutes: number;
  timestamp: string;
  wasInterrupted: boolean;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  frequency: "daily" | "weekly";
  type: "positive" | "negative"; // e.g., 'Do flashcards' vs 'Social Scrolling'
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon identifier
  unlockedAt?: string;
}

export interface StudentProfile {
  name: string;
  level: number;
  xp: number;
  xpRequired: number;
  totalStreak: number;
  learningStyle: "Visual" | "Auditory" | "Kinesthetic" | "Read/Write";
  productivityType: "Early Bird" | "Night Owl" | "Pomodoro Master" | "Deep Work Enthusiast";
  targetSleepHours: number;
  weakSubjects: string[];
  examCountdowns: { id: string; subject: string; date: string; daysLeft: number }[];
}

export interface WellnessCheckin {
  timestamp: string;
  mood: "Focused" | "Anxious" | "Fatigued" | "Stressed" | "Motivated" | "Relaxed";
  energyLevel: number; // 1-10
  stressLevel: number; // 1-10
  sleepHoursLastNight: number;
}

export interface StudyPartner {
  id: string;
  name: string;
  avatarSeed: string;
  isFocusing: boolean;
  statusText: string;
  todayMinutes: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  titleUrdu: string;
  isCompleted: boolean;
  xpReward: number;
}

export interface UnlockableReward {
  id: string;
  title: string;
  titleUrdu: string;
  description: string;
  descriptionUrdu: string;
  requiredLevel: number;
  isUnlocked: boolean;
  isActivated: boolean;
}
