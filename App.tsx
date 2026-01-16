
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Layout, Zap, Target, BarChart2, Download, Menu, X, CheckSquare, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Tab, AppState, StudyLog, QuestionData, QuestionLog, UserSettings, TimerMode, PomoState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FocusTimer from './components/FocusTimer';
import WeeklyGoals from './components/WeeklyGoals';
import Stats from './components/Stats';
import QuestionTracker from './components/QuestionTracker';
import CalendarView from './components/CalendarView';
import DailySummary from './components/DailySummary';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import ShareView from './components/ShareView';
import HelpView from './components/HelpView';
import ExamsView from './components/ExamsView';
import ManageSubjectsView from './components/ManageSubjectsView';
import ReviewView from './components/ReviewView';
import { TRANSLATIONS } from './translations';
import { ACHIEVEMENTS } from './constants/achievements';
import { getData, saveData } from './services/db';
import { getTodayISO, createTopicKey, getBaseInterval, getDifficultyMultiplier, calculateStreak } from './utils';

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#f97316', '#84cc16', '#ec4899', '#64748b'];
const START_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3';
const END_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
const BREAK_START_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3';
const BREAK_END_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3';

const INITIAL_STATE: AppState = {
  subjects: ['Matemática', 'Programação', 'Inglês'],
  subjectColors: { 'Matemática': '#6366f1', 'Programação': '#10b981', 'Inglês': '#f43f5e' },
  topics: { 'Matemática': [], 'Programação': [], 'Inglês': [] },
  logs: [],
  goals: { 'Matemática': 0, 'Programação': 0, 'Inglês': 0 },
  topicGoals: {},
  reviewStates: {},
  questions: { 'Matemática': { correct: 0, incorrect: 0 }, 'Programação': { correct: 0, incorrect: 0 }, 'Inglês': { correct: 0, incorrect: 0 } },
  questionLogs: [],
  unlockedAchievements: [],
  viewedAchievements: [],
  selectedAchievementId: undefined,
  settings: { theme: 'dark', username: '', language: 'pt-BR', isTestMode: false, isEpicMode: false },
  examEvents: []
};

const App: React.FC = () => {
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(getTodayISO());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [appData, setAppDataState] = useState<AppState>(INITIAL_STATE);

  useEffect(() => {
    const interval = setInterval(() => {
      const today = getTodayISO();
      if (today !== currentDate) {
        setCurrentDate(today);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentDate]);

  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('light-theme', 'preset-neon-purple', 'preset-neon-blue', 'preset-neon-green', 'preset-neon-pink', 'preset-elite', 'preset-mestre');
    
    // Apply the selected theme class
    if (appData.settings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else if (appData.settings.theme.startsWith('neon-') || appData.settings.theme === 'elite' || appData.settings.theme === 'mestre') {
      document.body.classList.add(`preset-${appData.settings.theme}`);
    }
    // 'dark' theme is the default, no class needed
  }, [appData.settings.theme]);

  useEffect(() => {
    const loadData = async () => {
      try {
        let saved = await getData('focus-app-data');
        if (saved) {
          // Migration: Convert old examDate/examName to examEvents array
          if (saved.examDate && saved.examName && !saved.examEvents) {
            saved.examEvents = [{
              id: `exam_${Date.now()}`,
              name: saved.examName,
              date: saved.examDate
            }];
          }
          // Ensure examEvents is initialized
          if (!saved.examEvents) {
            saved.examEvents = [];
          }
          setAppDataState({ ...INITIAL_STATE, ...saved });
        }
        
        // Load timer session from IndexedDB with validation
        let savedSession = await getData('focus-timer-session');
        if (savedSession && typeof savedSession === 'object') {
          // Validate required fields exist and have correct types
          if (
            typeof savedSession.mode === 'string' &&
            typeof savedSession.pomoPreset === 'number' &&
            typeof savedSession.lastTick === 'number'
          ) {
            setTimerSessionState({
              mode: savedSession.mode || 'pomodoro',
              pomoPreset: savedSession.pomoPreset || 50,
              breakPreset: savedSession.breakPreset || 10,
              pomoActive: savedSession.pomoActive || false,
              pomoTimeLeft: savedSession.pomoTimeLeft || 50 * 60,
              pomoState: savedSession.pomoState || 'work',
              stopwatchActive: savedSession.stopwatchActive || false,
              stopwatchTimeLeft: savedSession.stopwatchTimeLeft || 0,
              subject: savedSession.subject || '',
              topic: savedSession.topic || '',
              sessionCorrect: savedSession.sessionCorrect || '',
              sessionIncorrect: savedSession.sessionIncorrect || '',
              lastTick: Date.now() // Reset lastTick to current time
            });
          }
        }
      } catch (e) {
        console.error('Falha ao carregar dados:', e);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadData();
  }, []);

  const setAppData = useCallback((updater: (prev: AppState) => AppState) => {
    setAppDataState(prev => {
      const next = updater(prev);
      saveData('focus-app-data', next).catch(console.error);
      return next;
    });
  }, []);

  const checkAchievements = useCallback(() => {
    setAppData(prev => {
      const currentUnlocked = new Set(prev.unlockedAchievements || []);
      let changed = false;
      const pendingAchievements = ACHIEVEMENTS.filter(a => !currentUnlocked.has(a.id));
      if (pendingAchievements.length === 0) return prev;
      pendingAchievements.forEach(ach => {
        if (ach.check && ach.check(prev)) {
          currentUnlocked.add(ach.id);
          changed = true;
        }
      });
      if (!changed) return prev;
      return { ...prev, unlockedAchievements: Array.from(currentUnlocked) };
    });
  }, [setAppData]);

  const unlockAllAchievements = useCallback(() => {
    setAppData(prev => ({
      ...prev,
      unlockedAchievements: ACHIEVEMENTS.map(a => a.id)
    }));
  }, [setAppData]);

  const generateTestData = useCallback(() => {
    setAppData(prev => {
      const newLogs: StudyLog[] = [];
      const newQuestionLogs: QuestionLog[] = [];
      const questions: Record<string, QuestionData> = { ...prev.questions };
      
      const now = new Date();
      for (let i = 0; i < 14; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateISO = date.toISOString().split('T')[0];
        
        prev.subjects.forEach(sub => {
          const duration = Math.floor(Math.random() * 7200) + 1800; // 30min a 2.5h
          newLogs.push({
            id: Date.now() + Math.random(),
            date: date.toISOString(),
            subject: sub,
            duration,
            type: Math.random() > 0.5 ? 'Pomodoro' : 'Cronômetro'
          });

          const correct = Math.floor(Math.random() * 15);
          const incorrect = Math.floor(Math.random() * 5);
          if (correct > 0 || incorrect > 0) {
            newQuestionLogs.push({
              id: Date.now() + Math.random(),
              date: date.toISOString(),
              subject: sub,
              correct,
              incorrect
            });
            
            if (!questions[sub]) questions[sub] = { correct: 0, incorrect: 0 };
            questions[sub].correct += correct;
            questions[sub].incorrect += incorrect;
          }
        });
      }

      return {
        ...prev,
        logs: [...prev.logs, ...newLogs],
        questionLogs: [...prev.questionLogs, ...newQuestionLogs],
        questions
      };
    });
    alert("Histórico de teste gerado com sucesso! Verifique o painel e estatísticas.");
  }, [setAppData]);

  const generateAdaptiveRecoveryTestData = useCallback(() => {
    setAppData(prev => {
      // Ensure we have Matemática subject
      const subjects = prev.subjects.includes('Matemática') ? prev.subjects : [...prev.subjects, 'Matemática'];
      const topics = prev.topics.Matemática ? prev.topics : { ...prev.topics, Matemática: [] };
      
      // Add test topics if they don't exist
      const testTopics = ['Função Spike+Recuperação', 'Função Spike+Piora', 'Função Recuperação Tardia'];
      testTopics.forEach(topic => {
        if (!topics.Matemática.includes(topic)) {
          topics.Matemática.push(topic);
        }
      });

      const newReviewStates = { ...prev.reviewStates };
      
      // Scenario 1: Spike with successful recovery
      const topic1Key = createTopicKey('Matemática', testTopics[0]);
      newReviewStates[topic1Key] = {
        reviewCount: 11,
        correctTotal: 100,
        incorrectTotal: 20,
        dueAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inRecoveryMode: false,
        lastSessionAccuracy: 0.8
      };

      // Scenario 2: Spike with worsening (currently in recovery mode) - Due TODAY
      const topic2Key = createTopicKey('Matemática', testTopics[1]);
      newReviewStates[topic2Key] = {
        reviewCount: 10,
        correctTotal: 90,
        incorrectTotal: 50,
        dueAt: new Date().toISOString(), // Due today to show in review list
        updatedAt: new Date().toISOString(),
        inRecoveryMode: true,
        previousInterval: 180,
        recoveryAttempts: 2,
        lastSessionAccuracy: 0.2
      };

      // Scenario 3: Currently in recovery with marginal performance - Due TODAY
      const topic3Key = createTopicKey('Matemática', testTopics[2]);
      newReviewStates[topic3Key] = {
        reviewCount: 10,
        correctTotal: 96,
        incorrectTotal: 24,
        dueAt: new Date().toISOString(), // Due today to show in review list
        updatedAt: new Date().toISOString(),
        inRecoveryMode: true,
        previousInterval: 169,
        recoveryAttempts: 1,
        lastSessionAccuracy: 0.5
      };

      return {
        ...prev,
        subjects,
        topics: {
          ...prev.topics,
          Matemática: topics.Matemática
        },
        reviewStates: newReviewStates,
        subjectColors: {
          ...prev.subjectColors,
          'Matemática': prev.subjectColors['Matemática'] || '#6366f1'
        }
      };
    });
    alert("✅ Dados de teste do Sistema de Recuperação Adaptativa gerados!\n\n🎯 3 tópicos criados em 'Matemática' (todos para HOJE):\n1. Função Spike+Recuperação ✅ (recuperado com sucesso)\n2. Função Spike+Piora 🔴 (em modo recuperação - tentativa 3)\n3. Função Recuperação Tardia 🟡 (em modo recuperação - tentativa 2)\n\n💡 Vá para a aba 'Revisar' para ver os indicadores de recuperação laranja!");
  }, [setAppData]);

  useEffect(() => {
    if (isDataLoaded) {
      const timer = setTimeout(() => checkAchievements(), 1000);
      return () => clearTimeout(timer);
    }
  }, [appData.logs.length, checkAchievements, isDataLoaded]);

  // Auto-switch theme based on achievements
  useEffect(() => {
    if (!isDataLoaded) return;
    
    // Only auto-switch if user is still on the default dark theme
    // This prevents overriding manual theme selections
    if (appData.settings.theme !== 'dark') return;
    
    const totalSeconds = appData.logs.reduce((acc, log) => acc + log.duration, 0);
    const totalHours = totalSeconds / 3600;
    const currentStreak = calculateStreak(appData.logs);
    
    // Check if Elite theme should be auto-applied (100 hours)
    if (totalHours >= 100) {
      setAppData(prev => ({
        ...prev,
        settings: { ...prev.settings, theme: 'elite' }
      }));
    }
    // Check if Mestre theme should be auto-applied (30 consecutive days)
    // Only check this if Elite wasn't just unlocked
    else if (currentStreak >= 30) {
      setAppData(prev => ({
        ...prev,
        settings: { ...prev.settings, theme: 'mestre' }
      }));
    }
  }, [appData.logs.length, isDataLoaded, appData.settings.theme, setAppData]);

  const [timerSession, setTimerSessionState] = useState({
    mode: 'pomodoro' as TimerMode,
    pomoPreset: 50,
    breakPreset: 10,
    pomoActive: false,
    pomoTimeLeft: 50 * 60,
    pomoState: 'work' as PomoState,
    stopwatchActive: false,
    stopwatchTimeLeft: 0,
    subject: '',
    topic: '',
    sessionCorrect: '',
    sessionIncorrect: '',
    lastTick: Date.now()
  });
  
  const lastSaveRef = useRef<number>(0);

  const setTimerSession = useCallback((updater: (prev: typeof timerSession) => typeof timerSession) => {
    setTimerSessionState(prev => {
      const next = updater(prev);
      // Save immediately for manual changes (mode switch, pause, etc.)
      // Auto-save in timer effect handles periodic saves when timer is running
      if (!next.pomoActive && !next.stopwatchActive) {
        saveData('focus-timer-session', next).catch(console.error);
      }
      return next;
    });
  }, []);

  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const breakEndSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startSoundRef.current = new Audio(START_SOUND_URL);
    endSoundRef.current = new Audio(END_SOUND_URL);
    breakStartSoundRef.current = new Audio(BREAK_START_SOUND_URL);
    breakEndSoundRef.current = new Audio(BREAK_END_SOUND_URL);
  }, []);

  /**
   * Updates the review state for a topic based on session data.
   * This function is called whenever a study session ends (manual save or automatic completion).
   */
  const updateReviewStateForTopic = useCallback((
    subject: string,
    topic: string,
    correct: number,
    incorrect: number
  ) => {
    if (!topic || !topic.trim()) {
      return;
    }
    
    const topicKey = createTopicKey(subject, topic);
    
    setAppData(prev => {
      const currentReviewState = prev.reviewStates?.[topicKey] || {
        reviewCount: 0,
        correctTotal: 0,
        incorrectTotal: 0,
        dueAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        inRecoveryMode: false,
        recoveryAttempts: 0
      };
      
      // Update totals if questions were answered
      const newCorrectTotal = currentReviewState.correctTotal + correct;
      const newIncorrectTotal = currentReviewState.incorrectTotal + incorrect;
      
      // Calculate cumulative accuracy
      const totalQuestions = newCorrectTotal + newIncorrectTotal;
      const cumulativeAccuracy = totalQuestions > 0 ? newCorrectTotal / totalQuestions : 1.0;
      
      // Calculate current session accuracy
      const sessionTotal = correct + incorrect;
      const sessionAccuracy = sessionTotal > 0 ? correct / sessionTotal : 1.0;
      
      // Adaptive Recovery Logic
      let inRecoveryMode = currentReviewState.inRecoveryMode || false;
      let previousInterval = currentReviewState.previousInterval;
      let recoveryAttempts = currentReviewState.recoveryAttempts || 0;
      let newReviewCount = currentReviewState.reviewCount;
      
      // Detect performance spike: session accuracy significantly lower than cumulative
      // Only trigger if cumulative accuracy is good (>= 60%) and session is poor (<= 40%)
      const isPerformanceSpike = 
        !inRecoveryMode && 
        cumulativeAccuracy >= 0.6 && 
        sessionAccuracy <= 0.4 &&
        currentReviewState.reviewCount >= 3; // Only for established topics
      
      if (isPerformanceSpike) {
        // Enter recovery mode
        inRecoveryMode = true;
        recoveryAttempts = 0;
        // Save current interval to restore later if recovery is successful
        const baseInterval = getBaseInterval(currentReviewState.reviewCount);
        const difficultyMult = getDifficultyMultiplier(cumulativeAccuracy);
        previousInterval = Math.max(1, Math.min(180, Math.round(baseInterval * difficultyMult)));
        // Don't increment review count when entering recovery
        newReviewCount = currentReviewState.reviewCount;
      } else if (inRecoveryMode) {
        // Already in recovery mode, check if recovering or worsening
        const isRecovering = sessionAccuracy >= 0.7; // Good performance
        const isWorsening = sessionAccuracy < 0.5; // Still struggling
        
        if (isRecovering) {
          // Successfully recovered! Restore previous interval and exit recovery mode
          inRecoveryMode = false;
          recoveryAttempts = 0;
          // Restore review count and continue normal progression
          newReviewCount = currentReviewState.reviewCount + 1;
        } else if (isWorsening) {
          // Still struggling, increment recovery attempts
          recoveryAttempts = (currentReviewState.recoveryAttempts || 0) + 1;
          newReviewCount = currentReviewState.reviewCount; // Don't advance
        } else {
          // Marginal performance (50-70%), stay in recovery but don't worsen
          recoveryAttempts = currentReviewState.recoveryAttempts || 0;
          newReviewCount = currentReviewState.reviewCount;
        }
      } else {
        // Normal mode: standard reset logic
        if (cumulativeAccuracy < 0.4) {
          newReviewCount = 1;
        } else {
          newReviewCount = currentReviewState.reviewCount + 1;
        }
      }
      
      // Calculate interval based on mode
      let intervalDays;
      
      if (inRecoveryMode) {
        // Recovery mode: use short intervals that decrease with attempts
        if (recoveryAttempts === 0) {
          intervalDays = 3; // First recovery attempt: 3 days
        } else if (recoveryAttempts === 1) {
          intervalDays = 2; // Second attempt: 2 days
        } else {
          intervalDays = 1; // Subsequent attempts: 1 day minimum
        }
      } else if (currentReviewState.inRecoveryMode && !inRecoveryMode) {
        // Just recovered! Restore previous interval
        intervalDays = previousInterval || 7; // Fallback to 7 if not saved
      } else {
        // Normal interval calculation
        const baseInterval = getBaseInterval(newReviewCount);
        const difficultyMult = getDifficultyMultiplier(cumulativeAccuracy);
        intervalDays = Math.max(1, Math.min(180, Math.round(baseInterval * difficultyMult)));
      }
      
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
      
      return {
        ...prev,
        reviewStates: {
          ...prev.reviewStates,
          [topicKey]: {
            reviewCount: newReviewCount,
            correctTotal: newCorrectTotal,
            incorrectTotal: newIncorrectTotal,
            dueAt: nextReviewDate.toISOString(),
            updatedAt: new Date().toISOString(),
            inRecoveryMode,
            previousInterval: inRecoveryMode ? previousInterval : undefined,
            recoveryAttempts: inRecoveryMode ? recoveryAttempts : undefined,
            lastSessionAccuracy: sessionAccuracy
          }
        }
      };
    });
  }, [setAppData]);

  useEffect(() => {
    if (timerSession.pomoActive || timerSession.stopwatchActive) {
      const timerInterval = window.setInterval(() => {
        setTimerSession(prev => {
          const now = Date.now();
          const deltaSeconds = Math.floor((now - prev.lastTick) / 1000);
          if (deltaSeconds < 1) return prev;
          
          let nextPomoTime = prev.pomoTimeLeft;
          let nextPomoActive = prev.pomoActive;
          let nextPomoState = prev.pomoState;
          let nextStopwatchTime = prev.stopwatchTimeLeft;
          let shouldUpdateReviewState = false;

          if (prev.pomoActive) {
            nextPomoTime = prev.pomoTimeLeft - deltaSeconds;
            if (nextPomoTime <= 0) {
              if (prev.pomoState === 'work') {
                if (endSoundRef.current) endSoundRef.current.play().catch(() => {});
                
                // Mark that we should update review state when work phase ends
                shouldUpdateReviewState = true;
              } else {
                if (breakEndSoundRef.current) breakEndSoundRef.current.play().catch(() => {});
              }

              if (prev.pomoState === 'break') {
                if (startSoundRef.current) startSoundRef.current.play().catch(() => {});
                nextPomoTime = prev.pomoPreset * 60;
                nextPomoState = 'work';
                nextPomoActive = true;
              } else {
                nextPomoTime = 0;
                nextPomoActive = false;
              }
            }
          }

          if (prev.stopwatchActive) {
            nextStopwatchTime = prev.stopwatchTimeLeft + deltaSeconds;
          }

          const nextState = { 
            ...prev, 
            pomoTimeLeft: nextPomoTime, 
            pomoActive: nextPomoActive, 
            pomoState: nextPomoState,
            stopwatchTimeLeft: nextStopwatchTime,
            lastTick: now 
          };
          
          // Update review state when Pomodoro work session completes
          if (shouldUpdateReviewState && prev.topic && prev.topic.trim()) {
            const correct = parseInt(prev.sessionCorrect as string) || 0;
            const incorrect = parseInt(prev.sessionIncorrect as string) || 0;
            const sub = prev.subject || appData.subjects[0];
            
            // Call the review state update function
            updateReviewStateForTopic(sub, prev.topic, correct, incorrect);
          }
          
          // Auto-save to IndexedDB every 2 seconds to reduce database writes
          // Only save if at least 2 seconds have passed since last save
          const timeSinceLastSave = now - lastSaveRef.current;
          if (timeSinceLastSave >= 2000) {
            saveData('focus-timer-session', nextState).catch(console.error);
            lastSaveRef.current = now;
          }
          
          return nextState;
        });
      }, 500);
      return () => clearInterval(timerInterval);
    }
  }, [timerSession.pomoActive, timerSession.stopwatchActive, setTimerSession, updateReviewStateForTopic, appData.subjects]);

  const t = useMemo(() => TRANSLATIONS[appData.settings.language || 'pt-BR'], [appData.settings.language]);

  const handleExport = useCallback(() => {
    try {
      const dataStr = JSON.stringify(appData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const dlAnchorElem = document.createElement('a');
      dlAnchorElem.setAttribute("href", url);
      dlAnchorElem.setAttribute("download", `focus_backup_${new Date().toISOString().split('T')[0]}.json`);
      dlAnchorElem.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Falha ao exportar:', e);
      alert('Erro ao gerar arquivo de backup.');
    }
  }, [appData]);

  const handleImport = useCallback((importedData: AppState) => {
    setAppDataState(prev => {
      const next = { ...INITIAL_STATE, ...importedData };
      saveData('focus-app-data', next).catch(console.error);
      return next;
    });
    
    setTimerSession(prev => ({
      ...prev,
      pomoActive: false,
      stopwatchActive: false,
      subject: importedData.subjects?.[0] || '',
      topic: '',
      pomoTimeLeft: prev.pomoPreset * 60,
      stopwatchTimeLeft: 0,
      lastTick: Date.now()
    }));
  }, [setTimerSession]);

  const addLog = useCallback((log: Omit<StudyLog, 'id'>) => {
    setAppData(prev => ({
      ...prev,
      logs: [...prev.logs, { ...log, id: Date.now() }]
    }));
  }, [setAppData]);

  const saveTimerSession = useCallback(() => {
    const { mode, pomoPreset, pomoState, pomoTimeLeft, stopwatchTimeLeft, subject, topic, sessionCorrect, sessionIncorrect } = timerSession;
    
    if (mode === 'pomodoro' && pomoState === 'work') {
      const workTotal = pomoPreset * 60;
      let duration = workTotal - pomoTimeLeft;

      if (duration >= 60) {
        addLog({
          date: new Date().toISOString(),
          subject: subject || appData.subjects[0],
          topic: topic || undefined,
          duration: duration,
          type: 'Pomodoro'
        });
      }
    } else if (mode === 'stopwatch') {
      if (stopwatchTimeLeft >= 60) {
        addLog({
          date: new Date().toISOString(),
          subject: subject || appData.subjects[0],
          topic: topic || undefined,
          duration: stopwatchTimeLeft,
          type: 'Cronômetro'
        });
      }
    }

    const currentDuration = mode === 'pomodoro' ? (pomoPreset * 60 - pomoTimeLeft) : stopwatchTimeLeft;
    if (currentDuration >= 60) {
      const correct = parseInt(sessionCorrect as string) || 0;
      const incorrect = parseInt(sessionIncorrect as string) || 0;
      const sub = subject || appData.subjects[0];
      
      if (correct > 0 || incorrect > 0) {
        const current = appData.questions[sub] || { correct: 0, incorrect: 0 };
        setAppData(prev => ({
          ...prev,
          questions: { ...prev.questions, [sub]: { correct: current.correct + correct, incorrect: current.incorrect + incorrect } },
          questionLogs: [...prev.questionLogs, { id: Date.now(), date: new Date().toISOString(), subject: sub, correct, incorrect }]
        }));
      }
      
      // Update review state for topic if present
      if (topic && topic.trim()) {
        updateReviewStateForTopic(sub, topic, correct, incorrect);
      }
    }

    setTimerSession(prev => {
      if (mode === 'pomodoro') {
        return {
          ...prev,
          pomoActive: false,
          pomoState: 'work',
          pomoTimeLeft: pomoPreset * 60,
          sessionCorrect: '',
          sessionIncorrect: '',
          lastTick: Date.now()
        };
      } else {
        return {
          ...prev,
          stopwatchActive: false,
          stopwatchTimeLeft: 0,
          sessionCorrect: '',
          sessionIncorrect: '',
          lastTick: Date.now()
        };
      }
    });
  }, [timerSession, addLog, setAppData, appData.subjects, appData.questions, setTimerSession, updateReviewStateForTopic]);

  const startBreakSession = useCallback(() => {
    if (breakStartSoundRef.current) breakStartSoundRef.current.play().catch(() => {});
    
    const workTotal = timerSession.pomoPreset * 60;
    addLog({
      date: new Date().toISOString(),
      subject: timerSession.subject || appData.subjects[0],
      topic: timerSession.topic || undefined,
      duration: workTotal,
      type: 'Pomodoro'
    });

    // Update review state when starting a break (work session completed)
    if (timerSession.topic && timerSession.topic.trim()) {
      const correct = parseInt(timerSession.sessionCorrect as string) || 0;
      const incorrect = parseInt(timerSession.sessionIncorrect as string) || 0;
      const sub = timerSession.subject || appData.subjects[0];
      updateReviewStateForTopic(sub, timerSession.topic, correct, incorrect);
    }

    setTimerSession(prev => ({
      ...prev,
      pomoState: 'break',
      pomoTimeLeft: prev.breakPreset * 60,
      pomoActive: true,
      lastTick: Date.now()
    }));
  }, [timerSession, addLog, appData.subjects, setTimerSession, updateReviewStateForTopic]);

  const addSubject = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAppData(prev => {
      if (prev.subjects.includes(trimmed)) return prev;
      return {
        ...prev,
        subjects: [...prev.subjects, trimmed],
        subjectColors: { ...prev.subjectColors, [trimmed]: DEFAULT_COLORS[prev.subjects.length % DEFAULT_COLORS.length] },
        topics: { ...prev.topics, [trimmed]: [] },
        questions: { ...prev.questions, [trimmed]: { correct: 0, incorrect: 0 } },
        goals: { ...prev.goals, [trimmed]: 0 }
      };
    });
  };

  const deleteSubject = (name: string) => {
    if (!confirm(`Excluir "${name}" e todo seu histórico permanentemente?`)) return;
    setAppData(prev => {
      const { [name]: _, ...newQuestions } = prev.questions;
      const { [name]: __, ...newSubjectColors } = prev.subjectColors;
      const { [name]: ___, ...newTopics } = prev.topics;
      const { [name]: ____, ...newGoals } = prev.goals;
      
      return { 
        ...prev, 
        subjects: prev.subjects.filter(s => s !== name), 
        questions: newQuestions,
        subjectColors: newSubjectColors,
        topics: newTopics,
        goals: newGoals,
        logs: prev.logs.filter(l => l.subject !== name),
        questionLogs: prev.questionLogs.filter(l => l.subject !== name)
      };
    });
  };

  const renameSubject = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    setAppData(prev => {
      if (prev.subjects.includes(newName)) {
        alert("Já existe uma matéria com este nome.");
        return prev;
      }

      const next = { ...prev };
      
      // 1. Array de matérias
      next.subjects = prev.subjects.map(s => s === oldName ? newName : s);
      
      // 2. Cores
      if (prev.subjectColors[oldName]) {
        next.subjectColors = { ...prev.subjectColors };
        next.subjectColors[newName] = prev.subjectColors[oldName];
        delete next.subjectColors[oldName];
      }
      
      // 3. Tópicos
      if (prev.topics[oldName]) {
        next.topics = { ...prev.topics };
        next.topics[newName] = prev.topics[oldName];
        delete next.topics[oldName];
      }
      
      // 4. Questões
      if (prev.questions[oldName]) {
        next.questions = { ...prev.questions };
        next.questions[newName] = prev.questions[oldName];
        delete next.questions[oldName];
      }
      
      // 5. Metas
      if (prev.goals[oldName] !== undefined) {
        next.goals = { ...prev.goals };
        next.goals[newName] = prev.goals[oldName];
        delete next.goals[oldName];
      }
      
      // 6. Logs de Estudo
      next.logs = prev.logs.map(log => 
        log.subject === oldName ? { ...log, subject: newName } : log
      );
      
      // 7. Logs de Questões
      next.questionLogs = prev.questionLogs.map(log => 
        log.subject === oldName ? { ...log, subject: newName } : log
      );

      return next;
    });
  };

  const renameTopic = (subject: string, oldTopic: string, newTopic: string) => {
    if (oldTopic === newTopic) return;
    setAppData(prev => {
      const next = { ...prev };
      
      // 1. Lista de tópicos no registro da matéria
      if (prev.topics[subject]) {
        next.topics = {
          ...prev.topics,
          [subject]: prev.topics[subject].map(t => t === oldTopic ? newTopic : t)
        };
      }
      
      // 2. Logs de estudo (atualizar o campo topic)
      next.logs = prev.logs.map(log => 
        (log.subject === subject && log.topic === oldTopic) 
          ? { ...log, topic: newTopic } 
          : log
      );
      
      return next;
    });
  };

  const postponeReview = (topicKey: string) => {
    if (appData.settings.isVacationMode) return;
    
    setAppData(prev => {
      const currentReviewState = prev.reviewStates?.[topicKey];
      if (!currentReviewState) return prev;
      
      // Add 1 day to the due date
      const currentDueDate = new Date(currentReviewState.dueAt);
      const newDueDate = new Date(currentDueDate);
      newDueDate.setDate(currentDueDate.getDate() + 1);
      
      return {
        ...prev,
        reviewStates: {
          ...prev.reviewStates,
          [topicKey]: {
            ...currentReviewState,
            dueAt: newDueDate.toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      };
    });
    
    // Show feedback
    setToastMessage(t.postponeSuccess || 'Review postponed for +1 day');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isDataLoaded) {
    return (
      <div className="h-screen w-full bg-[#09090b] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl animate-pulse">F</div>
        <div className="flex items-center gap-2 text-zinc-500 font-bold tracking-widest uppercase text-xs">
          <Loader2 className="animate-spin" size={16} /> 
          Carregando Banco de Dados...
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-all duration-700 ${appData.settings.theme === 'light' ? 'bg-[#f4f4f5] text-zinc-900' : 'bg-[#09090b] text-[#f4f4f5]'}`}>
      <div className={`md:hidden fixed top-0 left-0 right-0 h-16 border-b z-50 flex items-center justify-between px-6 transition-colors ${appData.settings.theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <span className={`font-bold ${appData.settings.theme === 'light' ? 'text-zinc-900' : 'text-white'}`}>Focus</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }}
        onExport={handleExport}
        isOpen={isSidebarOpen}
        unlockedAchievements={appData.unlockedAchievements || []}
        selectedAchievementId={appData.selectedAchievementId}
        settings={appData.settings}
        t={t}
      />

      <main className={`flex-1 overflow-y-auto custom-scrollbar relative pt-16 md:pt-0 transition-all duration-700`}>
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full h-full relative z-10">
          {activeTab === 'dashboard' && (
            <Dashboard logs={appData.logs} subjects={appData.subjects} questions={appData.questions} username={appData.settings.username} theme={appData.settings.theme} t={t} />
          )}
          {activeTab === 'focus' && (
            <FocusTimer 
              subjects={appData.subjects} 
              topics={appData.topics}
              theme={appData.settings.theme}
              t={t}
              mode={timerSession.mode}
              setMode={(m) => setTimerSession(prev => ({ ...prev, mode: m }))}
              pomoTimeLeft={timerSession.pomoTimeLeft}
              pomoActive={timerSession.pomoActive}
              setPomoActive={(act) => {
                if (act && timerSession.pomoState === 'work' && startSoundRef.current) startSoundRef.current.play().catch(() => {});
                if (act && timerSession.pomoState === 'break' && breakStartSoundRef.current) breakStartSoundRef.current.play().catch(() => {});
                setTimerSession(prev => ({ ...prev, pomoActive: act, lastTick: Date.now() }));
              }}
              pomoPreset={timerSession.pomoPreset}
              setPomoPreset={preset => setTimerSession(prev => ({ ...prev, pomoPreset: preset, pomoTimeLeft: preset * 60, pomoActive: false, pomoState: 'work', lastTick: Date.now() }))}
              pomoState={timerSession.pomoState}
              stopwatchTimeLeft={timerSession.stopwatchTimeLeft}
              stopwatchActive={timerSession.stopwatchActive}
              setStopwatchActive={(act) => {
                if (act && startSoundRef.current) startSoundRef.current.play().catch(() => {});
                setTimerSession(prev => ({ ...prev, stopwatchActive: act, lastTick: Date.now() }));
              }}
              breakPreset={timerSession.breakPreset}
              setBreakPreset={preset => setTimerSession(prev => ({ ...prev, breakPreset: preset }))}
              selectedSubject={timerSession.subject || appData.subjects[0]}
              setSelectedSubject={(s) => setTimerSession(prev => ({ ...prev, subject: s }))}
              selectedTopic={timerSession.topic}
              setSelectedTopic={(tp) => setTimerSession(prev => ({ ...prev, topic: tp }))}
              sessionCorrect={timerSession.sessionCorrect}
              setSessionCorrect={(v) => setTimerSession(prev => ({ ...prev, sessionCorrect: v.toString() }))}
              sessionIncorrect={timerSession.sessionIncorrect}
              setSessionIncorrect={(v) => setTimerSession(prev => ({ ...prev, sessionIncorrect: v.toString() }))}
              onSaveSession={saveTimerSession}
              onStartBreak={startBreakSession}
            />
          )}
          {activeTab === 'resumo' && <DailySummary logs={appData.logs} goals={appData.goals} theme={appData.settings.theme} t={t} />}
          {activeTab === 'revisar' && <ReviewView reviewStates={appData.reviewStates || {}} theme={appData.settings.theme} t={t} onPostpone={postponeReview} isVacationMode={appData.settings.isVacationMode} reviewSessionLimit={appData.settings.reviewSessionLimit} />}
          {activeTab === 'conquistas' && <Achievements state={appData} onSelectHighlight={(id) => setAppData(prev => ({ ...prev, selectedAchievementId: id }))} onMarkSeen={(id) => setAppData(prev => {
            const viewed = new Set(prev.viewedAchievements || []);
            if (viewed.has(id)) return prev;
            viewed.add(id);
            return { ...prev, viewedAchievements: Array.from(viewed) };
          })} theme={appData.settings.theme} t={t} />}
          {activeTab === 'questoes' && <QuestionTracker subjects={appData.subjects} questions={appData.questions} questionLogs={appData.questionLogs || []} subjectColors={appData.subjectColors || {}} onUpdate={(sub, q, log) => {
             setAppData(prev => ({
               ...prev,
               questions: { ...prev.questions, [sub]: q },
               questionLogs: [...prev.questionLogs, { id: Date.now(), date: new Date().toISOString(), subject: sub, correct: log.correct, incorrect: log.incorrect }]
             }));
          }} theme={appData.settings.theme} t={t} />}
          {activeTab === 'calendario' && <CalendarView logs={appData.logs} reviewStates={appData.reviewStates} examEvents={appData.examEvents} theme={appData.settings.theme} t={t} />}
          {activeTab === 'weekly' && <WeeklyGoals subjects={appData.subjects} topics={appData.topics} logs={appData.logs} goals={appData.goals} topicGoals={appData.topicGoals || {}} onSetGoal={(sub, hrs) => setAppData(prev => ({ ...prev, goals: { ...prev.goals, [sub]: hrs } }))} onSetTopicGoal={(key, hrs) => setAppData(prev => ({ ...prev, topicGoals: { ...prev.topicGoals, [key]: hrs } }))} theme={appData.settings.theme} t={t} />}
          {activeTab === 'stats' && <Stats subjects={appData.subjects} logs={appData.logs} subjectColors={appData.subjectColors || {}} reviewStates={appData.reviewStates} theme={appData.settings.theme} t={t} />}
          {activeTab === 'subjects_manage' && <ManageSubjectsView subjects={appData.subjects} topics={appData.topics} subjectColors={appData.subjectColors || {}} onAddSubject={addSubject} onDeleteSubject={deleteSubject} onRenameSubject={renameSubject} onSetColor={(s, c) => setAppData(prev => ({ ...prev, subjectColors: { ...prev.subjectColors, [s]: c } }))} onAddTopic={(s, tp) => setAppData(prev => ({ ...prev, topics: { ...prev.topics, [s]: [...(prev.topics[s] || []), tp] } }))} onDeleteTopic={(s, tp) => setAppData(prev => ({ ...prev, topics: { ...prev.topics, [s]: prev.topics[s].filter(t => t !== tp) } }))} onRenameTopic={renameTopic} theme={appData.settings.theme} t={t} />}
          {activeTab === 'provas' && <ExamsView 
            examEvents={appData.examEvents || []} 
            onAddExam={(name, date) => setAppData(prev => ({ 
              ...prev, 
              examEvents: [...(prev.examEvents || []), { id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name, date }] 
            }))} 
            onRemoveExam={(id) => setAppData(prev => ({ 
              ...prev, 
              examEvents: (prev.examEvents || []).filter(e => e.id !== id) 
            }))} 
            theme={appData.settings.theme} 
            t={t} 
          />}
          {activeTab === 'share' && <ShareView state={appData} theme={appData.settings.theme} t={t} />}
          {activeTab === 'ajuda' && <HelpView theme={appData.settings.theme} t={t} />}
          {activeTab === 'settings' && <Settings settings={appData.settings} onUpdate={(s) => setAppData(prev => ({ ...prev, settings: { ...prev.settings, ...s } }))} theme={appData.settings.theme} appState={appData} onExport={handleExport} onImport={handleImport} onReset={() => setAppData(() => INITIAL_STATE)} onUnlockAll={unlockAllAchievements} onGenerateTestData={generateTestData} onGenerateAdaptiveRecoveryTestData={generateAdaptiveRecoveryTestData} t={t} />}
        </div>
      </main>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border-2 ${
            appData.settings.theme === 'light' 
              ? 'bg-white border-emerald-200 text-zinc-900' 
              : 'bg-zinc-900 border-emerald-500/50 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
