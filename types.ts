
export type AppView = 'home' | 'challenge' | 'focus' | 'dopamine' | 'skill' | 'log' | 'settings' | 'onboarding' | 'admin' | 'wipe_confirm' | 'inbox' | 'penalties';

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface SkillProgress {
  name: string;
  currentTask: string;
  generatedDate: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  content: string;
  imageUrl?: string;
  isFollowUp?: boolean; // Identifies admin-sent messages
}

export type MessageType = 'Penalty' | 'Warning' | 'System' | 'Admin Broadcast';

export interface InboxMessage {
  id: string;
  text: string;
  timestamp: number;
  type: MessageType;
  read: boolean;
}

export interface PenaltyRecord {
  id: string;
  type: string;
  reason: string;
  timestamp: number;
  status: 'pending' | 'completed';
  resolvedTimestamp?: number;
}

export interface FocusReport {
  id: string;
  duration: number; // total focus seconds
  breaks: number; // count
  pauses: number; // count
  totalBreakSeconds: number; // sum of break time
  timestamp: number; // session start time
  completed: boolean; // status
}

export interface NotificationSettings {
  focusAlerts: boolean;
  missedDayWarning: boolean;
  morningReminder: boolean;
}

export interface UserState {
  id: string;
  loginCode: string; // 6-digit recovery code
  adminNote?: string;

  // Onboarding
  onboarded: boolean;
  userName: string;
  userAge: string;
  userSource: string;
  hasSeenIntro: boolean;
  introStep: number;

  // Progress
  streak: number;
  lastStreakDate: string; // YYYY-MM-DD
  lastCheckIn: string; // Date string
  lastActiveTimestamp: number;
  lastDailyCoachMessageDate: string; // YYYY-MM-DD
  selfScore: number;
  mainFocus: string;
  coreObjectiveCompleted: boolean;
  focusSessionsCompletedToday: number;
  dailyTasks: DailyTask[];
  challengeDays: boolean[]; // 90 items
  penalty: string; // Current manual penalty selection
  
  // Structured Penalties & Inbox
  inbox: InboxMessage[];
  penaltyHistory: PenaltyRecord[];
  focusReports: FocusReport[];
  lastPenaltyCheckDate: string; // YYYY-MM-DD
  warningSentToday: boolean;
  
  selectedSkill: string;
  skillProgress: SkillProgress | null;
  dopamineRelapses: Record<string, string[]>; // date -> [categories]
  logs: LogEntry[];

  // Settings
  notifications: NotificationSettings;
  experimentalFeatures: Record<string, boolean>;
  systemLogs: string[];
}

export const calculateDisciplineScore = (state: UserState): number => {
  const today = new Date().toDateString();
  const todayRelapses = (state.dopamineRelapses[today] || []).length;
  const tasksCompletedCount = state.dailyTasks.filter(t => t.completed).length;

  let score = 0;
  if (state.coreObjectiveCompleted && state.mainFocus) score += 35;
  score += Math.min(3, tasksCompletedCount) * 10;
  if (state.focusSessionsCompletedToday > 0) score += 15;
  if (todayRelapses === 0) score += 10;
  if (state.streak > 0) score += 10;
  
  const pendingCount = state.penaltyHistory.filter(p => p.status === 'pending').length;
  score = Math.max(0, score - (pendingCount * 5)); 

  return score;
};