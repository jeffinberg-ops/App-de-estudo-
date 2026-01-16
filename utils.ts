
import { StudyLog } from './types';

export const formatTime = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0');
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return h === '00' ? `${m}:${sec}` : `${h}:${m}:${sec}`;
};

export const formatTimeShort = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0 && m === 0) return `${s}s`;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const toLocalISO = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayISO = () => toLocalISO(new Date());

/**
 * Returns start and end date keys for the current week (Monday-Sunday).
 */
export const getWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Move to Monday
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return {
    start: toLocalISO(monday),
    end: toLocalISO(sunday)
  };
};

/**
 * Returns start and end date keys for the previous week.
 */
export const getPreviousWeekRange = (): { start: string; end: string } => {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() + diff - 7);
  lastMonday.setHours(0, 0, 0, 0);
  
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);
  
  return {
    start: toLocalISO(lastMonday),
    end: toLocalISO(lastSunday)
  };
};

/**
 * Creates a topic key from subject and topic.
 */
export const createTopicKey = (subject: string, topic: string): string => {
  return `${subject}::${topic}`;
};

/**
 * Parses a topic key to extract subject and topic.
 */
export const parseTopicKey = (key: string): { subject: string; topic: string } => {
  const parts = key.split('::');
  return {
    subject: parts[0] || '',
    topic: parts[1] || ''
  };
};

/**
 * Calculates the base interval in days based on review count.
 */
export const getBaseInterval = (reviewCount: number): number => {
  if (reviewCount <= 1) return 1;
  // Exponential growth with base 1.7, capped at 180 days
  const interval = Math.pow(1.7, reviewCount - 1);
  return Math.min(180, Math.round(interval));
};

/**
 * Calculates the difficulty multiplier based on accuracy (0-1 range).
 */
export const getDifficultyMultiplier = (accuracy: number): number => {
  // New formula that rewards high performance (>80%) with multiplier > 1.0
  // Median performance results in multiplier <= 1.0
  const mult = 0.6 + Math.pow(accuracy, 3) * 1.4;
  return mult;
};

/**
 * Calculates days between two date strings (YYYY-MM-DD).
 */
export const daysBetween = (dateStr1: string, dateStr2: string): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calcula a sequência de dias seguidos (streak).
 */
export const calculateStreak = (logs: StudyLog[]): number => {
  if (!logs || logs.length === 0) return 0;

  // Extrai datas únicas locais e ordena (mais nova para mais velha)
  const uniqueDays = Array.from(
    new Set(logs.map(l => toLocalISO(new Date(l.date))))
  ).sort((a, b) => b.localeCompare(a));

  if (uniqueDays.length === 0) return 0;

  const today = getTodayISO();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toLocalISO(yesterdayDate);

  // Se o dia mais recente de estudo não for hoje nem ontem, a sequência quebrou
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  // Começamos a verificação a partir do dia de estudo mais recente encontrado
  let checkDate = new Date(uniqueDays[0].replace(/-/g, '/'));

  for (const dayStr of uniqueDays) {
    const currentCheckStr = toLocalISO(checkDate);
    
    if (dayStr === currentCheckStr) {
      streak++;
      // Prepara a data do dia anterior para a próxima iteração
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Se houver um buraco na sequência, paramos
      break;
    }
  }

  return streak;
};

/**
 * Verifica se o tema Elite foi desbloqueado (100 horas de estudo).
 */
export const isEliteThemeUnlocked = (logs: StudyLog[]): boolean => {
  const totalSeconds = logs.reduce((acc, log) => acc + log.duration, 0);
  const totalHours = totalSeconds / 3600;
  return totalHours >= 100;
};

/**
 * Verifica se o tema Mestre foi desbloqueado (30 dias consecutivos).
 */
export const isMestreThemeUnlocked = (logs: StudyLog[]): boolean => {
  return calculateStreak(logs) >= 30;
};
