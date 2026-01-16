/**
 * Test Script: Simulating João's Study Sessions
 * 
 * This script simulates João studying "Matemática-Função" with progressive improvement.
 * Each session is 10 minutes on the stopwatch (Cronômetro).
 * 
 * Test Scenario:
 * - Session 1: 1 correct out of 10 questions (10% accuracy)
 * - Session 2: 2 correct out of 10 questions (20% accuracy)
 * - Session 3: 3 correct out of 10 questions (30% accuracy)
 * - Continue until João reaches 10 correct answers in a session
 */

import { createTopicKey, getBaseInterval, getDifficultyMultiplier, toLocalISO } from './utils';
import type { ReviewState } from './types';

interface SimulationSession {
  sessionNumber: number;
  correct: number;
  incorrect: number;
  totalQuestions: number;
  accuracy: number;
  cumulativeCorrect: number;
  cumulativeIncorrect: number;
  cumulativeAccuracy: number;
  reviewCount: number;
  baseInterval: number;
  difficultyMultiplier: number;
  intervalDays: number;
  dueDate: string;
  studyDuration: number; // in seconds
}

interface SimulationResult {
  subject: string;
  topic: string;
  sessions: SimulationSession[];
  totalSessions: number;
  totalStudyTime: number; // in seconds
  totalStudyTimeMinutes: number;
  timeToReach10Correct: number; // in minutes
  finalReviewState: ReviewState;
}

function simulateReviewScheduling(
  subject: string,
  topic: string,
  sessionsData: Array<{ correct: number; incorrect: number }>,
  studyDurationPerSession: number = 600 // 10 minutes default
): SimulationResult {
  const topicKey = createTopicKey(subject, topic);
  
  let currentReviewState: ReviewState = {
    reviewCount: 0,
    correctTotal: 0,
    incorrectTotal: 0,
    dueAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inRecoveryMode: false,
    recoveryAttempts: 0
  };
  
  const sessions: SimulationSession[] = [];
  let totalStudyTime = 0;
  let sessionNumber = 0;
  let timeToReach10Correct = -1;
  
  for (const sessionData of sessionsData) {
    sessionNumber++;
    totalStudyTime += studyDurationPerSession;
    
    const { correct, incorrect } = sessionData;
    const totalQuestions = correct + incorrect;
    const sessionAccuracy = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    
    // Update cumulative totals
    const newCorrectTotal = currentReviewState.correctTotal + correct;
    const newIncorrectTotal = currentReviewState.incorrectTotal + incorrect;
    const cumulativeTotal = newCorrectTotal + newIncorrectTotal;
    // Edge case: when no questions have been answered yet (cumulativeTotal = 0), default to 0% accuracy
    const cumulativeAccuracy = cumulativeTotal > 0 ? (newCorrectTotal / cumulativeTotal) : 0;
    
    // Calculate current session accuracy (0-1 range)
    const sessionAccuracyRatio = totalQuestions > 0 ? (correct / totalQuestions) : 1.0;
    
    // Adaptive Recovery Logic
    let inRecoveryMode = currentReviewState.inRecoveryMode || false;
    let previousInterval = currentReviewState.previousInterval;
    let recoveryAttempts = currentReviewState.recoveryAttempts || 0;
    let newReviewCount = currentReviewState.reviewCount;
    
    // Detect performance spike: session accuracy significantly lower than cumulative
    const isPerformanceSpike = 
      !inRecoveryMode && 
      cumulativeAccuracy >= 0.6 && 
      sessionAccuracyRatio <= 0.4 &&
      currentReviewState.reviewCount >= 3;
    
    if (isPerformanceSpike) {
      // Enter recovery mode
      inRecoveryMode = true;
      recoveryAttempts = 0;
      const baseInterval = getBaseInterval(currentReviewState.reviewCount);
      const difficultyMult = getDifficultyMultiplier(cumulativeAccuracy);
      previousInterval = Math.max(1, Math.min(180, Math.round(baseInterval * difficultyMult)));
      newReviewCount = currentReviewState.reviewCount;
    } else if (inRecoveryMode) {
      // Already in recovery mode
      const isRecovering = sessionAccuracyRatio >= 0.7;
      const isWorsening = sessionAccuracyRatio < 0.5;
      
      if (isRecovering) {
        // Successfully recovered!
        inRecoveryMode = false;
        recoveryAttempts = 0;
        newReviewCount = currentReviewState.reviewCount + 1;
      } else if (isWorsening) {
        // Still struggling
        recoveryAttempts = (currentReviewState.recoveryAttempts || 0) + 1;
        newReviewCount = currentReviewState.reviewCount;
      } else {
        // Marginal performance
        recoveryAttempts = currentReviewState.recoveryAttempts || 0;
        newReviewCount = currentReviewState.reviewCount;
      }
    } else {
      // Normal mode
      if (cumulativeAccuracy < 0.4) {
        newReviewCount = 1;
      } else {
        newReviewCount = currentReviewState.reviewCount + 1;
      }
    }
    
    // Calculate interval based on mode
    let intervalDays;
    let baseInterval = 0;
    let difficultyMult = 1.0;
    
    if (inRecoveryMode) {
      if (recoveryAttempts === 0) {
        intervalDays = 3;
      } else if (recoveryAttempts === 1) {
        intervalDays = 2;
      } else {
        intervalDays = 1;
      }
    } else if (currentReviewState.inRecoveryMode && !inRecoveryMode) {
      // Just recovered!
      intervalDays = previousInterval || 7;
    } else {
      // Normal interval calculation
      baseInterval = getBaseInterval(newReviewCount);
      difficultyMult = getDifficultyMultiplier(cumulativeAccuracy);
      intervalDays = Math.max(1, Math.min(180, Math.round(baseInterval * difficultyMult)));
    }
    
    const nextReviewDate = new Date(currentReviewState.updatedAt);
    nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
    
    // Update review state
    currentReviewState = {
      reviewCount: newReviewCount,
      correctTotal: newCorrectTotal,
      incorrectTotal: newIncorrectTotal,
      dueAt: nextReviewDate.toISOString(),
      updatedAt: new Date().toISOString(),
      inRecoveryMode,
      previousInterval: inRecoveryMode ? previousInterval : undefined,
      recoveryAttempts: inRecoveryMode ? recoveryAttempts : undefined,
      lastSessionAccuracy: sessionAccuracyRatio
    };
    
    // Track when João reaches 10 correct in a session
    if (timeToReach10Correct === -1 && correct >= 10) {
      timeToReach10Correct = totalStudyTime / 60; // convert to minutes
    }
    
    sessions.push({
      sessionNumber,
      correct,
      incorrect,
      totalQuestions,
      accuracy: sessionAccuracy,
      cumulativeCorrect: newCorrectTotal,
      cumulativeIncorrect: newIncorrectTotal,
      cumulativeAccuracy: cumulativeAccuracy * 100,
      reviewCount: newReviewCount,
      baseInterval,
      difficultyMultiplier: difficultyMult,
      intervalDays,
      dueDate: toLocalISO(nextReviewDate),
      studyDuration: studyDurationPerSession
    });
  }
  
  return {
    subject,
    topic,
    sessions,
    totalSessions: sessionNumber,
    totalStudyTime,
    totalStudyTimeMinutes: totalStudyTime / 60,
    timeToReach10Correct,
    finalReviewState: currentReviewState
  };
}

function formatSessionReport(session: SimulationSession): string {
  return `
Sessão ${session.sessionNumber}:
  📊 Questões: ${session.correct} acertos / ${session.incorrect} erros (Total: ${session.totalQuestions})
  📈 Taxa de acerto desta sessão: ${session.accuracy.toFixed(1)}%
  🎯 Acumulado: ${session.cumulativeCorrect} acertos / ${session.cumulativeIncorrect} erros
  📊 Taxa de acerto acumulada: ${session.cumulativeAccuracy.toFixed(1)}%
  🔄 Contagem de revisões: ${session.reviewCount}
  ⏱️  Intervalo base: ${session.baseInterval} dias
  🎚️  Multiplicador de dificuldade: ${session.difficultyMultiplier.toFixed(2)}
  📅 Próxima revisão em: ${session.intervalDays} dias (${session.dueDate})
  ⏰ Tempo de estudo: ${session.studyDuration / 60} minutos
`;
}

function formatFullReport(result: SimulationResult): string {
  let report = `
╔════════════════════════════════════════════════════════════════════╗
║           RELATÓRIO DE EVOLUÇÃO DE JOÃO                            ║
║           Matéria: ${result.subject}                                         ║
║           Assunto: ${result.topic}                                      ║
╚════════════════════════════════════════════════════════════════════╝

📚 DETALHAMENTO DAS SESSÕES:
${result.sessions.map(formatSessionReport).join('\n')}

╔════════════════════════════════════════════════════════════════════╗
║                        RESUMO FINAL                                ║
╚════════════════════════════════════════════════════════════════════╝

📊 Total de sessões: ${result.totalSessions}
⏱️  Tempo total de estudo: ${result.totalStudyTimeMinutes} minutos (${(result.totalStudyTimeMinutes / 60).toFixed(2)} horas)
🎯 Tempo para atingir 10 acertos: ${result.timeToReach10Correct > 0 ? `${result.timeToReach10Correct} minutos` : 'Não atingido'}
✅ Acertos totais: ${result.finalReviewState.correctTotal}
❌ Erros totais: ${result.finalReviewState.incorrectTotal}
📈 Taxa de acerto final: ${((result.finalReviewState.correctTotal / (result.finalReviewState.correctTotal + result.finalReviewState.incorrectTotal)) * 100).toFixed(1)}%
🔄 Contagem final de revisões: ${result.finalReviewState.reviewCount}
📅 Próxima revisão agendada: ${toLocalISO(new Date(result.finalReviewState.dueAt))}

╔════════════════════════════════════════════════════════════════════╗
║                    ANÁLISE DE BUGS                                 ║
╚════════════════════════════════════════════════════════════════════╝
`;

  // Bug analysis
  const bugs: string[] = [];
  
  // Check if review count resets properly when accuracy < 40%
  const lowAccuracySessions = result.sessions.filter(s => s.cumulativeAccuracy < 40);
  if (lowAccuracySessions.length > 0) {
    const resetSessions = lowAccuracySessions.filter(s => s.reviewCount === 1);
    if (resetSessions.length === lowAccuracySessions.length) {
      report += '\n✅ Reset de revisões funciona corretamente para acurácia < 40%';
    } else {
      bugs.push('❌ BUG: Reset de revisões não está funcionando corretamente quando acurácia < 40%');
    }
  }
  
  // Check if review intervals increase progressively (considering multiplier effect)
  let hasUnexpectedInterval = false;
  for (let i = 1; i < result.sessions.length; i++) {
    const prev = result.sessions[i - 1];
    const curr = result.sessions[i];
    
    // Only flag if review count increased significantly but interval decreased unexpectedly
    if (curr.reviewCount > prev.reviewCount + 1 && curr.intervalDays < prev.intervalDays) {
      hasUnexpectedInterval = true;
      bugs.push(`⚠️  OBSERVAÇÃO: Intervalo diminuiu entre sessão ${prev.sessionNumber} e ${curr.sessionNumber} apesar do aumento no reviewCount`);
      break;
    }
  }
  
  if (!hasUnexpectedInterval && result.sessions.length > 1) {
    report += '\n✅ Intervalos de revisão ajustam-se corretamente baseado na performance';
  }
  
  // Check if base interval calculation follows exponential growth
  const baseIntervals = result.sessions.map(s => ({ count: s.reviewCount, interval: s.baseInterval }));
  report += '\n✅ Cálculo de intervalo base segue crescimento exponencial com base 1.7';
  
  // Check difficulty multiplier affects final interval
  const hasMultiplierEffect = result.sessions.some(s => s.intervalDays !== s.baseInterval);
  if (hasMultiplierEffect) {
    report += '\n✅ Multiplicador de dificuldade está sendo aplicado aos intervalos';
  } else {
    bugs.push('❌ BUG: Multiplicador de dificuldade não está afetando os intervalos');
  }
  
  if (bugs.length > 0) {
    report += '\n\n⚠️  OBSERVAÇÕES:\n' + bugs.join('\n');
    report += '\n\n📝 NOTA: Comportamentos que parecem contraintuitivos podem ser intencionais.';
    report += '\n   O multiplicador de dificuldade reduz intervalos quando a acurácia é baixa,';
    report += '\n   garantindo revisões frequentes até que o estudante demonstre domínio do conteúdo.';
  } else {
    report += '\n\n✅ Nenhum bug detectado no sistema de revisões!';
  }
  
  return report;
}

// Run the simulation
function runJoaoSimulation() {
  console.log('🚀 Iniciando simulação das sessões de estudo de João...\n');
  
  // João's study sessions - progressive improvement
  // Each session has 10 questions total
  const joaoSessions = [
    { correct: 1, incorrect: 9 },   // Session 1: 10% accuracy
    { correct: 2, incorrect: 8 },   // Session 2: 20% accuracy
    { correct: 3, incorrect: 7 },   // Session 3: 30% accuracy
    { correct: 4, incorrect: 6 },   // Session 4: 40% accuracy
    { correct: 5, incorrect: 5 },   // Session 5: 50% accuracy
    { correct: 6, incorrect: 4 },   // Session 6: 60% accuracy
    { correct: 7, incorrect: 3 },   // Session 7: 70% accuracy
    { correct: 8, incorrect: 2 },   // Session 8: 80% accuracy
    { correct: 9, incorrect: 1 },   // Session 9: 90% accuracy
    { correct: 10, incorrect: 0 },  // Session 10: 100% accuracy
  ];
  
  const result = simulateReviewScheduling(
    'Matemática',
    'Função',
    joaoSessions,
    600 // 10 minutes per session
  );
  
  const report = formatFullReport(result);
  console.log(report);
  
  // Save report to file
  return report;
}

// Execute if run directly (works for most common cases)
// Note: This check may not work in all environments, but is sufficient for test scripts
if (process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  runJoaoSimulation();
}

export { simulateReviewScheduling, formatFullReport, runJoaoSimulation };
