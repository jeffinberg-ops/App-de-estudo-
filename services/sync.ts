import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppState } from '../types';

const COLLECTION_NAME = 'users';

export const saveUserData = async (userId: string, data: AppState): Promise<void> => {
  if (!db) {
    throw new Error('Firebase Firestore não está configurado');
  }
  
  const userDocRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(userDocRef, {
    ...data,
    lastSync: new Date().toISOString()
  });
};

export const getUserData = async (userId: string): Promise<AppState | null> => {
  if (!db) {
    throw new Error('Firebase Firestore não está configurado');
  }
  
  const userDocRef = doc(db, COLLECTION_NAME, userId);
  const docSnap = await getDoc(userDocRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    // Remove o campo lastSync antes de retornar
    const { lastSync, ...appData } = data;
    return appData as AppState;
  }
  
  return null;
};

export const mergeAppData = (localData: AppState, remoteData: AppState): AppState => {
  // Estratégia de merge: combinar dados locais e remotos
  // Prioriza dados mais recentes e completos
  
  return {
    // Combina matérias de ambas as fontes (sem duplicatas)
    subjects: Array.from(new Set([...localData.subjects, ...remoteData.subjects])),
    
    // Combina cores (prioriza remoto se houver conflito)
    subjectColors: { ...localData.subjectColors, ...remoteData.subjectColors },
    
    // Combina tópicos
    topics: {
      ...localData.topics,
      ...remoteData.topics,
      // Para cada matéria, combina tópicos sem duplicatas
      ...Object.keys({ ...localData.topics, ...remoteData.topics }).reduce((acc, subject) => {
        const localTopics = localData.topics[subject] || [];
        const remoteTopics = remoteData.topics[subject] || [];
        acc[subject] = Array.from(new Set([...localTopics, ...remoteTopics]));
        return acc;
      }, {} as Record<string, string[]>)
    },
    
    // Combina logs (remove duplicatas por ID)
    logs: Array.from(
      new Map([...localData.logs, ...remoteData.logs].map(log => [log.id, log])).values()
    ),
    
    // Usa metas remotas (mais atualizadas assumidas)
    goals: { ...localData.goals, ...remoteData.goals },
    
    // Combina questões (soma os valores)
    // Nota: Usa Math.max em vez de soma para evitar duplicação quando os mesmos
    // dados existem em ambos os locais. Em produção, considere implementar
    // um sistema de tracking único por tentativa de questão.
    questions: Object.keys({ ...localData.questions, ...remoteData.questions }).reduce((acc, subject) => {
      const local = localData.questions[subject] || { correct: 0, incorrect: 0 };
      const remote = remoteData.questions[subject] || { correct: 0, incorrect: 0 };
      acc[subject] = {
        correct: Math.max(local.correct, remote.correct),
        incorrect: Math.max(local.incorrect, remote.incorrect)
      };
      return acc;
    }, {} as Record<string, { correct: number; incorrect: number }>),
    
    // Combina logs de questões (remove duplicatas por ID)
    questionLogs: Array.from(
      new Map([...localData.questionLogs, ...remoteData.questionLogs].map(log => [log.id, log])).values()
    ),
    
    // Combina conquistas
    unlockedAchievements: Array.from(new Set([
      ...(localData.unlockedAchievements || []),
      ...(remoteData.unlockedAchievements || [])
    ])),
    
    viewedAchievements: Array.from(new Set([
      ...(localData.viewedAchievements || []),
      ...(remoteData.viewedAchievements || [])
    ])),
    
    // Prioriza configurações locais (são as mais recentes)
    selectedAchievementId: localData.selectedAchievementId || remoteData.selectedAchievementId,
    settings: { ...remoteData.settings, ...localData.settings },
    
    // Dados de exame (prioriza remoto)
    examDate: remoteData.examDate || localData.examDate,
    examName: remoteData.examName || localData.examName
  };
};

export const subscribeToUserData = (
  userId: string, 
  onUpdate: (data: AppState) => void
): (() => void) => {
  if (!db) {
    console.warn('Firebase Firestore não está configurado');
    return () => {};
  }
  
  const userDocRef = doc(db, COLLECTION_NAME, userId);
  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const { lastSync, ...appData } = data;
      onUpdate(appData as AppState);
    }
  });
};
