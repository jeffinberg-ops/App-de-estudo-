/**
 * Serviço de sincronização de dados com o Firestore.
 * 
 * MODELO DE SEGURANÇA:
 * ====================
 * Este módulo implementa acesso aos dados do Firestore seguindo um modelo de segurança
 * baseado em documentos individuais por usuário. As regras de segurança do Firestore
 * estão configuradas para permitir que cada usuário autenticado acesse APENAS seu próprio
 * documento em /users/{userId}, onde userId corresponde ao seu UID de autenticação.
 * 
 * REGRAS DE SEGURANÇA DO FIRESTORE:
 * ```
 * match /users/{userId} {
 *   allow read, write: if request.auth != null && request.auth.uid == userId;
 * }
 * ```
 * 
 * PADRÕES DE ACESSO PERMITIDOS:
 * - ✅ doc(db, 'users', userId) - Acesso direto ao documento do usuário
 * - ✅ getDoc(userDocRef) - Leitura do documento específico
 * - ✅ setDoc(userDocRef, data) - Escrita no documento específico
 * - ✅ onSnapshot(userDocRef, callback) - Escuta em tempo real do documento específico
 * 
 * PADRÕES DE ACESSO BLOQUEADOS:
 * - ❌ collection(db, 'users') - Acesso à coleção completa
 * - ❌ getDocs(collection(db, 'users')) - Listagem de documentos
 * - ❌ query(collection(db, 'users'), ...) - Consultas à coleção
 * 
 * IMPORTANTE: Todas as funções neste módulo devem usar apenas referências diretas
 * a documentos (doc()) e NUNCA operações de coleção. Isso garante que o código
 * esteja alinhado com as regras de segurança e evita erros de permissão.
 */

import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AppState } from '../types';

const COLLECTION_NAME = 'users';

/**
 * Salva os dados do usuário no Firestore.
 * 
 * IMPORTANTE: Esta função acessa diretamente o documento do usuário em /users/{userId}.
 * As regras de segurança do Firestore exigem que:
 * - O usuário esteja autenticado (request.auth != null)
 * - O userId corresponda ao UID do usuário autenticado (request.auth.uid == userId)
 * 
 * NÃO use operações de coleção (collection(), getDocs(), query()) pois elas serão
 * bloqueadas pelas regras de segurança.
 * 
 * @param userId - O UID do usuário autenticado
 * @param data - Os dados do estado da aplicação a serem salvos
 * @throws Error se o Firestore não estiver configurado
 * @throws Error se o userId estiver vazio
 * @throws FirebaseError se houver erro de permissão ou de rede
 */
export const saveUserData = async (userId: string, data: AppState): Promise<void> => {
  if (!db) {
    throw new Error('Firebase Firestore não está configurado');
  }
  
  if (!userId || userId.trim() === '') {
    throw new Error('userId é obrigatório para salvar dados do usuário');
  }
  
  try {
    // Acessa diretamente o documento do usuário - alinhado com as regras de segurança
    const userDocRef = doc(db, COLLECTION_NAME, userId);
    await setDoc(userDocRef, {
      ...data,
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    // Fornece mensagem de erro mais específica para erros de permissão
    if (error?.code === 'permission-denied') {
      throw new Error(`Permissão negada: Certifique-se de que o usuário está autenticado e o userId (${userId}) corresponde ao UID do usuário autenticado.`);
    }
    throw error;
  }
};

/**
 * Busca os dados do usuário do Firestore.
 * 
 * IMPORTANTE: Esta função acessa diretamente o documento do usuário em /users/{userId}.
 * As regras de segurança do Firestore exigem que:
 * - O usuário esteja autenticado (request.auth != null)
 * - O userId corresponda ao UID do usuário autenticado (request.auth.uid == userId)
 * 
 * NÃO use operações de coleção (collection(), getDocs(), query()) pois elas serão
 * bloqueadas pelas regras de segurança.
 * 
 * @param userId - O UID do usuário autenticado
 * @returns Os dados do estado da aplicação ou null se o documento não existir
 * @throws Error se o Firestore não estiver configurado
 * @throws Error se o userId estiver vazio
 * @throws FirebaseError se houver erro de permissão ou de rede
 */
export const getUserData = async (userId: string): Promise<AppState | null> => {
  if (!db) {
    throw new Error('Firebase Firestore não está configurado');
  }
  
  if (!userId || userId.trim() === '') {
    throw new Error('userId é obrigatório para buscar dados do usuário');
  }
  
  try {
    // Acessa diretamente o documento do usuário - alinhado com as regras de segurança
    const userDocRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove o campo lastSync antes de retornar
      const { lastSync, ...appData } = data;
      return appData as AppState;
    }
    
    return null;
  } catch (error: any) {
    // Fornece mensagem de erro mais específica para erros de permissão
    if (error?.code === 'permission-denied') {
      throw new Error(`Permissão negada: Certifique-se de que o usuário está autenticado e o userId (${userId}) corresponde ao UID do usuário autenticado.`);
    }
    throw error;
  }
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

/**
 * Inscreve-se para receber atualizações em tempo real dos dados do usuário.
 * 
 * IMPORTANTE: Esta função acessa diretamente o documento do usuário em /users/{userId}.
 * As regras de segurança do Firestore exigem que:
 * - O usuário esteja autenticado (request.auth != null)
 * - O userId corresponda ao UID do usuário autenticado (request.auth.uid == userId)
 * 
 * NÃO use operações de coleção (collection(), getDocs(), query()) pois elas serão
 * bloqueadas pelas regras de segurança.
 * 
 * @param userId - O UID do usuário autenticado
 * @param onUpdate - Função de callback chamada quando os dados são atualizados
 * @returns Função de cleanup para cancelar a inscrição
 */
export const subscribeToUserData = (
  userId: string, 
  onUpdate: (data: AppState) => void
): (() => void) => {
  if (!db) {
    console.warn('Firebase Firestore não está configurado');
    return () => {};
  }
  
  if (!userId || userId.trim() === '') {
    console.error('userId é obrigatório para inscrever-se aos dados do usuário');
    return () => {};
  }
  
  try {
    // Acessa diretamente o documento do usuário - alinhado com as regras de segurança
    const userDocRef = doc(db, COLLECTION_NAME, userId);
    return onSnapshot(
      userDocRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const { lastSync, ...appData } = data;
          onUpdate(appData as AppState);
        }
      },
      (error: any) => {
        // Log de erros de permissão de forma mais descritiva
        if (error?.code === 'permission-denied') {
          console.error(`Permissão negada ao inscrever-se aos dados: Certifique-se de que o usuário está autenticado e o userId (${userId}) corresponde ao UID do usuário autenticado.`);
        } else {
          console.error('Erro ao inscrever-se aos dados do usuário:', error);
        }
      }
    );
  } catch (error: any) {
    console.error('Erro ao configurar inscrição aos dados do usuário:', error);
    return () => {};
  }
};
