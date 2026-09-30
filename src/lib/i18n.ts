export type Locale = "en";

const COPY = {
  en: {
    chat: "Chat",
    visual: "Visual",
    call: "Call",
    message: "Message",
    chooseVoice: "Choose voice or text first",
    rememberHint: "Say “remember …” to store a fact. Voice never reads emotion chips.",
    more: "More",
    continue: "Continue",
    retry: "Retry",
    newChat: "New chat",
    pin: "Pin",
    pinned: "Pinned",
    language: "Language",
    languageHint: "Interface language. They still match how you write.",
    searchMemories: "Search memories",
    morningFrom: "Morning",
    plus: "Plus",
    create: "Create",
    plusActive: "Plus — high message limit",
    plusUnlock: "Plus · $5.99/mo",
    quotaLeft: "{n} messages left in the next 24 hours",
    quotaWait: "Daily limit. Come back {when}.",
    confirmPortrait: "This is the one — lock it",
    portraitLocked: "Main portrait is locked. Emotion pack can generate now.",
    packProgress: "{done} / {total} sprites",
    generatePack: "Generate the emotion pack",
    navHome: "Home",
    navExplore: "Explore",
    navChats: "Chats",
    navCalls: "Calls",
    navSettings: "Settings",
    navSaved: "Saved",
    navHouse: "House",
    searchChats: "Search chats",
    noChatsYet: "No chats yet.",
    account: "Account",
    signOut: "Sign out",
    recents: "Recents",
    homeEyebrow: "Home",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    homeTagline: "Pick up where you left off.",
    continueWith: "Continue with {name}",
    meetSomeone: "Meet someone",
    exploreCompanions: "Explore companions",
    createYours: "Create yours",
    lastCompanion: "Last companion",
    seeAll: "See all",
    onboardingTitle: "Get started",
    onboardingHint: "Three quick steps to your first reply.",
    onboardingAccount: "16+ account",
    onboardingCompanion: "Pick a companion",
    onboardingFirstReply: "Send your first reply",
    savedEyebrow: "Saved",
    savedTitle: "Lines and threads you kept",
    savedHint: "Memories and older threads.",
    savedMemories: "Memories",
    savedMemoriesHint: "Facts they should remember across chat and calls.",
    savedBookmarks: "Bookmarks",
    savedBookmarksHint: "Lines you saved from chat.",
    savedMoments: "Moments",
    savedMomentsHint: "Quiet album from your threads.",
    savedArchive: "Archive",
    savedArchiveHint: "Older threads tucked away.",
    houseEyebrow: "House",
    houseTitle: "Today at home",
    houseHint: "Journal, letters, rituals, and reminders — secondary rooms.",
    houseJournal: "Journal",
    houseLetters: "Letters",
    houseRituals: "Rituals",
    houseReminders: "Reminders",
    settingsEyebrow: "Settings",
    settingsTitle: "How the room behaves",
    settingsHint: "Account, voice, emotions, and how calls listen back.",
    settingsSaved: "Settings saved",
    settingsSaveFailed: "Could not save settings",
    displayName: "Display name",
    email: "Email",
    enterToSend: "Enter to send",
    enterToSendHint: "Shift+Enter still adds a new line.",
    speakReplies: "Speak replies in chat",
    speakRepliesHint: "Default after you start a thread with voice on.",
    showEmotions: "Show emotion chips",
    showEmotionsHint: "Inline chips in roleplay text.",
    callAutoListen: "Auto-listen on calls",
    callAutoListenHint: "Mic opens when a call starts.",
    nightRoom: "Night room",
    nightRoomHint: "Dark theme by default.",
    compactChat: "Compact chat",
    compactChatHint: "Smaller message text.",
    doNotDisturb: "Do not disturb",
    doNotDisturbHint: "Quiet notifications.",
    ambientSound: "Ambient scene sound",
    ambientSoundHint: "Soft background per scene.",
    statusLine: "Status line",
    statusLineHint: "Shown in chat header when set.",
    sleepMode: "Sleep mode",
    sleepModeHint: "Slower, softer replies.",
    saveSettings: "Save settings",
    voicePreparing: "Preparing voice",
    voicePreparingHint:
      "{name}'s voice is downloading to this browser. You can type while it loads, or continue in text only.",
    voiceDownload: "Voice download",
    voiceReady: "Voice is ready. You can start chatting.",
    startWithVoice: "Start with voice",
    downloadingVoice: "Downloading voice…",
    continueWithoutVoice: "Continue without voice",
    tryAgain: "Try again",
    exportChat: "Export",
    gift: "Gift",
    missYou: "Miss you",
    summarize: "Summarize",
    sleep: "Sleep",
    asleep: "Asleep",
    comfort: "Comfort",
    imOut: "I'm out",
    imBack: "I'm back",
    card: "Card",
    searchThread: "Search this thread",
    sceneRoom: "Room",
    sceneNight: "Night",
    sceneRain: "Rain",
    sceneTea: "Tea",
    sceneWalk: "Walk",
    sceneCouch: "Couch",
    scenePicker: "Scene",
    errorSendFailed: "Could not send. Try again.",
    errorRegenerateFailed: "Could not regenerate.",
    errorBookmarkFailed: "Could not bookmark",
    errorSummarizeFailed: "Could not fold this thread",
    savedToBookmarks: "Saved to bookmarks",
    copied: "Copied",
    boundaries: "Boundaries",
    boundariesHint: "What the room will not do. Used in every chat and call.",
    comfortHint: "What helps you feel better — soft words, quiet company, a check-in.",
    keepComfort: "Keep comfort note",
    memories: "Memories",
    memoriesHint: "Facts pinned for this companion.",
    addMemory: "Remember",
    memoryPlaceholder: "Call me…, I like…, remember that…",
    keepBoundary: "Keep boundary",
    remove: "Remove",
    profileScenes: "Scenes that fit",
    closeMenu: "Close menu",
    openMenu: "Open menu",
    mobileMore: "More",
  },
} as const;

export type CopyKey = keyof typeof COPY.en;

const SCENE_KEYS: Record<string, CopyKey> = {
  default: "sceneRoom",
  night: "sceneNight",
  rain: "sceneRain",
  tea: "sceneTea",
  walk: "sceneWalk",
  couch: "sceneCouch",
};

export function asLocale(_value: string | null | undefined): Locale {
  return "en";
}

export function t(locale: Locale, key: CopyKey) {
  return COPY[locale][key];
}

export function tf(locale: Locale, key: CopyKey, vars: Record<string, string>): string {
  let text: string = COPY[locale][key];
  for (const [name, value] of Object.entries(vars)) {
    text = text.replace(`{${name}}`, value);
  }
  return text;
}

export function sceneLabel(locale: Locale, sceneId: string) {
  const key = SCENE_KEYS[sceneId];
  return key ? t(locale, key) : sceneId;
}

export function greeting(locale: Locale, hour: number) {
  if (hour < 12) return t(locale, "goodMorning");
  if (hour < 18) return t(locale, "goodAfternoon");
  return t(locale, "goodEvening");
}
