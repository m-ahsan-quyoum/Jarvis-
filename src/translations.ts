export interface LanguageTranslations {
  logoTitle: string;
  logoSub: string;
  days: string;
  streakTitle: string;
  lvl: string;
  lvlTitle: string;
  xpText: string;
  reqText: string;
  
  // Tabs
  tabCoach: string;
  tabSchedule: string;
  tabAddiction: string;
  tabFocus: string;
  tabGoals: string;
  tabAutomation: string;
  
  // AI Coach Sub-view
  aiMentorTitle: string;
  holographicTitle: string;
  placeholderAiHint: string;
  replayVoice: string;
  muteVoice: string;
  unmuteVoice: string;
  voiceSpeedLabel: string;
  circleChallengeTitle: string;
  circleChallengeSub: string;
  cohortStatusTitle: string;
  circleButtonStart: string;
  circleButtonActive: string;
  victoryTitle: string;
  victorySub: string;
  dismissText: string;

  // Schedule view
  scheduleSub: string;
  rescheduleButton: string;
  todayGoalTitle: string;
  todayGoalInputPlaceholder: string;
  examInputTitle: string;
  examInputPlaceholder: string;
  addSessionTitle: string;
  timeSlotTitle: string;
  eventTypeTitle: string;
  eventNamePlaceholder: string;
  eventDescriptionTitle: string;
  eventTipLabel: string;
  generateAiButton: string;
  generateCustomButton: string;
  generateAiSlots: string;
  academicScheduleBlocks: string;
  completedText: string;
  pendingText: string;

  // Addiction view
  addictionSub: string;
  detoxShieldButtonActive: string;
  detoxShieldButtonInactive: string;
  browserSandboxTab: string;
  distractionLogsTab: string;
  simulatorHeading: string;
  simulatorSub: string;
  simulatorBtn: string;
  appFeedLockoutTitle: string;
  appFeedLockoutSub: string;
  appFeedLockoutTip: string;
  appFeedLockoutRemain: string;
  appFeedBrowserExit: string;
  purgeLogsBtn: string;
  wasBlocked: string;
  timesScrolled: string;

  // Focus view
  focusSub: string;
  binauralHumPlay: string;
  binauralHumMute: string;
  focusSubjectTitle: string;
  focusSubjectPlaceholder: string;
  workSessionTitle: string;
  breakSessionTitle: string;
  startBtnState: string;
  pauseBtnState: string;
  suppressFeedTitle: string;
  suppressFeedPlaceholder: string;
  clearConsoleBtn: string;

  // Goals & Wellness view
  goalsTitle: string;
  goalsSub: string;
  goalTargetPlannerTitle: string;
  goalPlaceholder: string;
  habitTrackerPlaceholder: string;
  claimButton: string;
  horizonTitle: string;
  disciplineTitle: string;
  goalsEmpty: string;
  streakTitleLabel: string;
  habitTypeLabel: string;
  logButton: string;
  alreadyLoggedMessage: string;
  wellnessTitle: string;
  wellnessSub: string;
  wellnessEmpty: string;
  wellnessSubheading: string;
  physicalEnergyTitle: string;
  stressIntensityTitle: string;
  sleepLastNightTitle: string;
  analyzeWellnessBtn: string;
  burnoutStatusTitle: string;
  recLabel: string;
  
  // Game system extra extensions
  dailyChallengesTitle: string;
  unlockableRewardsTitle: string;
  lockedStatus: string;
  unlockedStatus: string;
  activateReward: string;
  activatedReward: string;
  challengePoints: string;
  completedBadge: string;
  dayStreakBadges: string;
  continuousVoiceTitle: string;
  continuousVoiceActive: string;
  continuousVoiceDesc: string;
}

export const translations: Record<"en" | "ur", LanguageTranslations> = {
  en: {
    logoTitle: "Discipline AI System",
    logoSub: "Personal Productivity & Study Companion",
    days: "Days",
    streakTitle: "Study Streak",
    lvl: "Lvl",
    lvlTitle: "Productivity Level",
    xpText: "XP",
    reqText: "req",
    
    tabCoach: "AI Coach & Circles",
    tabSchedule: "Schedule Planner",
    tabAddiction: "Addiction Jail",
    tabFocus: "Deep Work Space",
    tabGoals: "Consistency & Wellness",
    tabAutomation: "Desktop & Social Automation",
    
    aiMentorTitle: "AI Mentor Core",
    holographicTitle: "Holographic Interface",
    placeholderAiHint: "Type advice request, e.g. 'Help me plan for math exam'",
    replayVoice: "Replay Voice",
    muteVoice: "Mute Voice",
    unmuteVoice: "Enable Voice Output",
    voiceSpeedLabel: "Speed",
    circleChallengeTitle: "Circle Study Challenge",
    circleChallengeSub: "Study with peer networks and execute mutual focus missions",
    cohortStatusTitle: "Cohort Members Status",
    circleButtonStart: "Launch Circle Duel (2X XP)",
    circleButtonActive: "METRIC SYNC ACTIVE",
    victoryTitle: "Cooperative Victory!",
    victorySub: "Conquered accountability challenge. Mutual +120 XP injected!",
    dismissText: "Dismiss",
    continuousVoiceTitle: "Continuous Talk Mode",
    continuousVoiceActive: "🎙️ Auto-Listening Active",
    continuousVoiceDesc: "Hands-free continuous voice conversation. Speak naturally without clicking mic buttons!",

    scheduleSub: "Generates hourly slots customized to weak areas & exams",
    rescheduleButton: "Smart Reschedule",
    todayGoalTitle: "Today's Goals / Key Aim",
    todayGoalInputPlaceholder: "e.g., Review biology chapter 4, mock exam, write article",
    examInputTitle: "Exam Information / Dates",
    examInputPlaceholder: "e.g., Biology final on June 12",
    addSessionTitle: "Add Custom Event Slot",
    timeSlotTitle: "TIME SLOT",
    eventTypeTitle: "EVENT TYPE",
    eventNamePlaceholder: "Enter task name...",
    eventDescriptionTitle: "Activity details & guidelines",
    eventTipLabel: "FOCUS TIP (BLOCKERS)",
    generateAiButton: "Generate AI study slots (Gemini Guided)",
    generateCustomButton: "Lock Single Session",
    generateAiSlots: "AI Schedule Generation Panel",
    academicScheduleBlocks: "Academic Schedule blocks",
    completedText: "Completed",
    pendingText: "Mark Complete",

    addictionSub: "Simulate distraction feeds and measure dopamine hijacking",
    detoxShieldButtonActive: "Detox Shield Active",
    detoxShieldButtonInactive: "Engage Digital Detox Shield",
    browserSandboxTab: "Browser Sandbox",
    distractionLogsTab: "Distraction Logs",
    simulatorHeading: "Dopamine Depletion Simulator",
    simulatorSub: "Launch sandbox browser overlay environment to test dopamine resistance and lockouts.",
    simulatorBtn: "Open Sandbox Browser",
    appFeedLockoutTitle: "DOPAMINE HIJACK LOCKOUT ACTIVE",
    appFeedLockoutSub: "You exceeded 6 seconds of endless scrolling! In a live app, this app is now hard locked.",
    appFeedLockoutTip: "Focus on your goals! Digital detox shield engaged to recover prefrontal cortex strength.",
    appFeedLockoutRemain: "seconds until Lockout Intervention",
    appFeedBrowserExit: "Exit Sandbox Browser",
    purgeLogsBtn: "Purge Distraction History",
    wasBlocked: "Detox Intervention Blocked Feed Scroll",
    timesScrolled: "Endless Scrolls Suppressed",

    focusSub: "Automated notification blocker and binaural study hum",
    binauralHumPlay: "Play Binaural Hum",
    binauralHumMute: "Mute Binaural Hum",
    focusSubjectTitle: "Current focus topic:",
    focusSubjectPlaceholder: "Enter study topic...",
    workSessionTitle: "Active Deep Work Session",
    breakSessionTitle: "Active Mental Recovery",
    startBtnState: "Initiate Focus Zone",
    pauseBtnState: "Pause Session",
    suppressFeedTitle: "Notification Suppressor Feed",
    suppressFeedPlaceholder: "Activate Focus mode to trigger automated workspace shielding.",
    clearConsoleBtn: "Clear Suppressed Console",

    goalsTitle: "Targets & Atomic Habits",
    goalsSub: "Gamified Actions",
    goalTargetPlannerTitle: "Goal Target Planner",
    goalPlaceholder: "e.g., Memorize skeletal formulas",
    habitTrackerPlaceholder: "e.g., Read standard chemistry summary",
    claimButton: "Claim",
    horizonTitle: "HORIZON",
    disciplineTitle: "DISCIPLINE",
    goalsEmpty: "No custom academic cards. Set one above!",
    streakTitleLabel: "Atomic habits streak log",
    habitTypeLabel: "DISCIPLINE TYPE",
    logButton: "Log",
    alreadyLoggedMessage: "Already reported for today!",
    wellnessTitle: "Wellness & Burnout Shield",
    wellnessSub: "Daily Wellness Diagnostics",
    wellnessEmpty: "Wellness baseline has not been logged today. Submit below to calibrate strain.",
    wellnessSubheading: "Wellness Diagnostics Checkin",
    physicalEnergyTitle: "PHYSICAL ENERGY",
    stressIntensityTitle: "STRESS INTENSITY",
    sleepLastNightTitle: "LAST NIGHT SLEEP",
    analyzeWellnessBtn: "Analyze Wellness Calibration",
    burnoutStatusTitle: "Burnout Status Indices",
    recLabel: "AI Wellness Shield Plan:",
    
    dailyChallengesTitle: "Daily Challenges Checklist",
    unlockableRewardsTitle: "Unlockable Productivity Rewards",
    lockedStatus: "Locked",
    unlockedStatus: "Unlocked",
    activateReward: "Unlock/Activate Now",
    activatedReward: "Active Reward Mode",
    challengePoints: "Points",
    completedBadge: "Earned At",
    dayStreakBadges: "Study Streak Milestone Badges"
  },
  ur: {
    logoTitle: "ڈسپلن برائے مصنوعی ذہانت",
    logoSub: "ذاتی پیداواری صلاحیت اور مطالعہ کا معاون",
    days: "دن",
    streakTitle: "مطالعہ کا تسلسل",
    lvl: "لیول",
    lvlTitle: "پیداواری صلاحیت کا درجہ",
    xpText: "پوائنٹس",
    reqText: "مطلوبہ",
    
    tabCoach: "اے آئی ٹیوٹر اور حلقے",
    tabSchedule: "جدول ساز",
    tabAddiction: "ڈیجیٹل جیل",
    tabFocus: "توجہ کا مرکز",
    tabGoals: "ہدف اور صحت کا توازن",
    tabAutomation: "ڈیسک ٹاپ اور واٹس ایپ",
    
    aiMentorTitle: "اے آئی استاد کا مرکز",
    holographicTitle: "ہولوگرافک انٹرفیس",
    placeholderAiHint: "مشورہ طلب کریں، مثلاً 'ریاضی کے امتحان کی تیاری میں مدد کریں'",
    replayVoice: "دوبارہ آواز سنیں",
    muteVoice: "آواز بند کریں",
    unmuteVoice: "آواز آن کریں",
    voiceSpeedLabel: "رفتار",
    circleChallengeTitle: "ہم جماعتوں کا مطالعہ چیلنج",
    circleChallengeSub: "ساتھیوں کے ساتھ مل کر پڑھیں اور مشترکہ پیداواری مشن مکمل کریں",
    cohortStatusTitle: "ہم جماعتوں کی حالت",
    circleButtonStart: "حلقہ مقابلہ شروع کریں (دوگنا پوائنٹس)",
    circleButtonActive: "پوائنٹس سنکنگ فعال ہے",
    victoryTitle: "کامیابی کا جشن!",
    victorySub: "آپ نے ساتھیوں کا چیلنج جیت لیا۔ مشترکہ +120 پوائنٹس حاصل کر لیے گئے!",
    dismissText: "ٹھیک ہے",

    scheduleSub: "آپ کی کمزوریوں اور امتحانات کے مطابق گھنٹہ وار جدول بنائیں",
    rescheduleButton: "ہوشیار ترتیب نو",
    todayGoalTitle: "آج کے اہداف / بنیادی مقصد",
    todayGoalInputPlaceholder: "مثلاً حیاتیات کا چوتھا باب پڑھیں، فرضی امتحان دیں",
    examInputTitle: "امتحانات کی تفصیل / تاریخیں",
    examInputPlaceholder: "مثلاً 12 جون کو حیاتیات کا فائنل امتحان",
    addSessionTitle: "نیا وقت مختص کریں",
    timeSlotTitle: "وقت کا دورانیہ",
    eventTypeTitle: "بلاک کی نوعیت",
    eventNamePlaceholder: "کام کا نام لکھیں...",
    eventDescriptionTitle: "سرگرمی کی تفصیل اور ہدایات",
    eventTipLabel: "توجہ برقرار رکھنے کا اشارہ",
    generateAiButton: "اے آئی کے ذریعے خودکار جدول بنائیں (معاون جیمنی)",
    generateCustomButton: "جدول میں شامل کریں",
    generateAiSlots: "اے آئی خودکار جدول پینل",
    academicScheduleBlocks: "تعلیمی نظام الاوقات",
    completedText: "مکمل ہو گیا",
    pendingText: "مکمل نشان زد کریں",

    addictionSub: "فضول ایپس کی لت کی جانچ کریں اور عادات پر نظر رکھیں",
    detoxShieldButtonActive: "ڈیٹوکس شیلڈ فعال ہے",
    detoxShieldButtonInactive: "ڈیجیٹل ڈیٹوکس شیلڈ آن کریں",
    browserSandboxTab: "براؤزر سینڈ باکس",
    distractionLogsTab: "خلل کا ریکارڈ",
    simulatorHeading: "ڈوپامائن ضائع کرنے کا سمیلیٹر",
    simulatorSub: "اپنے نفس پر قابو پانے کی صلاحیت کو آزمانے کے لیے سینڈ باکس ماحول شروع کریں۔",
    simulatorBtn: "سینڈ باکس براؤزر کھولیں",
    appFeedLockoutTitle: "ڈوپامائن ہائی جیک لاک آؤٹ اب چالو ہے",
    appFeedLockoutSub: "آپ نے 6 سیکنڈ سے زیادہ مسلسل اسکرول کیا! حقیقی ماحول میں یہ ایپ اب لاک کر دی گئی ہے۔",
    appFeedLockoutTip: "اپنے مقاصد پر توجہ دیں! دماغی صلاحیت کی بحالی کے لیے ڈیجیٹل ڈیٹوکس آن ہو گیا ہے۔",
    appFeedLockoutRemain: "سیکنڈ لاک آؤٹ مداخلت تک باقی",
    appFeedBrowserExit: "سینڈ باکس براؤزر بند کریں",
    purgeLogsBtn: "ساری ہسٹری صاف کریں",
    wasBlocked: "ڈیٹوکس شیلڈ نے اسکرولنگ کو کامیابی سے بلاک کیا",
    timesScrolled: "لاپرواہی اسکرولنگ روکی گئی",

    focusSub: "خودکار نوٹیفکیشن بلاکر اور تعلیمی بائنورل آوازیں",
    binauralHumPlay: "بائنورل مطالعہ ہوم چلائیں",
    binauralHumMute: "آواز بند کریں",
    focusSubjectTitle: "موجودہ زیر مطالعہ موضوع:",
    focusSubjectPlaceholder: "موضوع کا نام درج کریں...",
    workSessionTitle: "گہرا مطالعہ کا دورانیہ چالو ہے",
    breakSessionTitle: "ذہنی سکون کا دورانیہ چالو ہے",
    startBtnState: "توجہ کا دورانیہ شروع کریں",
    pauseBtnState: "توقف کریں",
    suppressFeedTitle: "روکے گئے نوٹیفیکیشنز کا فیڈ",
    suppressFeedPlaceholder: "توجہ کا دورانیہ شروع کریں تاکہ خودکار فلٹرنگ ایکٹیو ہو۔",
    clearConsoleBtn: "ریکارڈ صاف کریں",

    goalsTitle: "اہداف اور چھوٹی عادات",
    goalsSub: "کھیل نما اعمال",
    goalTargetPlannerTitle: "ہدف کا منصوبہ ساز",
    goalPlaceholder: "مثلاً کیمسٹری کے سائنسی فارمولے یاد کریں",
    habitTrackerPlaceholder: "مثلاً روزانہ کیمسٹری کا خلاصہ پڑھیں",
    claimButton: "بنائیں",
    horizonTitle: "دور اندیشی",
    disciplineTitle: "تعلیمی زمرہ",
    goalsEmpty: "کوئی ہدف موجود نہیں ہے۔ اوپر سے ایک ہدف بنائیں!",
    streakTitleLabel: "روزمرہ کی عادات کا تسلسل",
    habitTypeLabel: "عادت کی قسم",
    logButton: "ریکارڈ درج کریں",
    alreadyLoggedMessage: "آج کا ریکارڈ پہلے ہی درج کیا جا چکا ہے!",
    wellnessTitle: "صحت اور برن آؤٹ بچاؤ",
    wellnessSub: "روزانہ صحت کا جائزہ",
    wellnessEmpty: "صحت کی جانچ نہیں کی گئی۔ ذہنی دباؤ معلوم کرنے کے لیے نیچے والا فارم جمع کریں۔",
    wellnessSubheading: "صحت کی جانچ کا فارم",
    physicalEnergyTitle: "جسمانی توانائی",
    stressIntensityTitle: "ذہنی دباؤ کی کیفیت",
    sleepLastNightTitle: "پچھلی رات کی نیند",
    analyzeWellnessBtn: "صحت کا تجزیہ کریں",
    burnoutStatusTitle: "برن آؤٹ کی مجموعی کیفیت",
    recLabel: "اے آئی صحت بچاؤ کا منصوبہ:",
    
    dailyChallengesTitle: "روزانہ کے چیلنجز کی فہرست",
    unlockableRewardsTitle: "انلاک ہونے والے انعامات",
    lockedStatus: "مقفل",
    unlockedStatus: "کھل گیا ہے",
    activateReward: "ابھی انلاک یا چالو کریں",
    activatedReward: "فعال انعام موڈ",
    challengePoints: "رکورڈ",
    completedBadge: "کامیابی کی تاریخ",
    dayStreakBadges: "مطالعہ کے تسلسل کے حاصل کردہ بیجز",
    continuousVoiceTitle: "مسلسل گفتگو کا موڈ",
    continuousVoiceActive: "🎙️ خودکار سماعت فعال ہے",
    continuousVoiceDesc: "ہینڈز فری مسلسل گفتگو۔ مائیک کے بٹنوں کو بار بار دبائے بغیر قدرتی طور پر گفتگو کریں!"
  }
};
