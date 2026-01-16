
export type Tab = 'dashboard' | 'focus' | 'resumo' | 'weekly' | 'stats' | 'questoes' | 'calendario' | 'conquistas' | 'settings' | 'share' | 'ajuda' | 'provas' | 'subjects_manage' | 'revisar';

export type Language = 'pt-BR' | 'en-US' | 'es-ES' | 'ru-RU';

export interface StudyLog {
  id: number;
  date: string;
  subject: string;
  topic?: string;
  duration: number; // in seconds
  type: 'Pomodoro' | 'Cronômetro';
}

export interface QuestionLog {
  id: number;
  date: string;
  subject: string;
  correct: number;
  incorrect: number;
}

export interface QuestionData {
  correct: number;
  incorrect: number;
}

export type ThemePreset = 'dark' | 'light' | 'neon-purple' | 'neon-blue' | 'neon-green' | 'neon-pink' | 'elite' | 'mestre';

export interface UserSettings {
  theme: ThemePreset;
  username: string;
  language: Language;
  isTestMode?: boolean;
  isEpicMode?: boolean;
  reviewSessionLimit?: number; // Maximum number of topics to review per session
  isVacationMode?: boolean; // When true, pause all review scheduling
}

export interface ReviewState {
  reviewCount: number;
  correctTotal: number;
  incorrectTotal: number;
  dueAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  // Adaptive recovery fields
  inRecoveryMode?: boolean; // True when detecting performance spike
  previousInterval?: number; // Interval before spike (to restore on recovery)
  recoveryAttempts?: number; // Number of recovery attempts (0 = first attempt)
  lastSessionAccuracy?: number; // Accuracy of the last session (for spike detection)
}

export interface ExamEvent {
  id: string;
  name: string;
  date: string; // ISO datetime
}

export interface AppState {
  subjects: string[];
  subjectColors: Record<string, string>; // subject -> hex color
  topics: Record<string, string[]>; // subject -> [topic1, topic2...]
  logs: StudyLog[];
  goals: Record<string, number>; // hours per week (subject goals)
  topicGoals?: Record<string, number>; // hours per week (topic goals, key: "subject::topic")
  reviewStates?: Record<string, ReviewState>; // topic-level review state, key: "subject::topic"
  questions: Record<string, QuestionData>; // subject -> {correct, incorrect}
  questionLogs: QuestionLog[];
  unlockedAchievements?: string[]; // IDs of action-based achievements
  viewedAchievements?: string[]; // IDs of achievements the user has already clicked/seen
  selectedAchievementId?: string; // ID of the achievement to highlight in sidebar
  settings: UserSettings;
  examDate?: string;
  examName?: string;
  examEvents?: ExamEvent[]; // Array of exam events
}

export type TimerMode = 'pomodoro' | 'stopwatch';
export type PomoState = 'work' | 'break';
