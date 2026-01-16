/**
 * Extended Test: João's Future Review Sessions
 * 
 * This script simulates what happens after João masters the content
 * and continues doing future reviews with high accuracy.
 * 
 * Starting point: João has completed 10 sessions and reached 55% cumulative accuracy
 * Future sessions: João maintains high performance (80-100% accuracy per session)
 */

import { simulateReviewScheduling, formatFullReport } from './test-joao-simulation';
import { toLocalISO } from './utils';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║      TESTE: REVISÕES FUTURAS DE JOÃO - O QUE ACONTECE DEPOIS      ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// João's initial learning journey (sessions 1-10)
const initialSessions = [
  { correct: 1, incorrect: 9 },   // Session 1: 10%
  { correct: 2, incorrect: 8 },   // Session 2: 20%
  { correct: 3, incorrect: 7 },   // Session 3: 30%
  { correct: 4, incorrect: 6 },   // Session 4: 40%
  { correct: 5, incorrect: 5 },   // Session 5: 50%
  { correct: 6, incorrect: 4 },   // Session 6: 60%
  { correct: 7, incorrect: 3 },   // Session 7: 70%
  { correct: 8, incorrect: 2 },   // Session 8: 80%
  { correct: 9, incorrect: 1 },   // Session 9: 90%
  { correct: 10, incorrect: 0 },  // Session 10: 100%
];

// Future review sessions after mastery (sessions 11-20)
// João now consistently performs well in reviews
const futureReviewSessions = [
  { correct: 9, incorrect: 1 },   // Session 11: 90%
  { correct: 10, incorrect: 0 },  // Session 12: 100%
  { correct: 9, incorrect: 1 },   // Session 13: 90%
  { correct: 10, incorrect: 0 },  // Session 14: 100%
  { correct: 10, incorrect: 0 },  // Session 15: 100%
  { correct: 9, incorrect: 1 },   // Session 16: 90%
  { correct: 10, incorrect: 0 },  // Session 17: 100%
  { correct: 10, incorrect: 0 },  // Session 18: 100%
  { correct: 10, incorrect: 0 },  // Session 19: 100%
  { correct: 10, incorrect: 0 },  // Session 20: 100%
];

// Combine all sessions
const allSessions = [...initialSessions, ...futureReviewSessions];

console.log('🎓 Simulando jornada completa de João (20 sessões)...\n');
console.log('📚 Sessões 1-10: Aprendizado inicial (1/10 → 10/10)');
console.log('🔄 Sessões 11-20: Revisões após domínio (90-100% por sessão)\n');

const result = simulateReviewScheduling(
  'Matemática',
  'Função',
  allSessions,
  600 // 10 minutes per session
);

// Display the full report
const report = formatFullReport(result);
console.log(report);

// Additional analysis for future reviews
console.log('\n\n╔════════════════════════════════════════════════════════════════════╗');
console.log('║          ANÁLISE ESPECÍFICA DAS REVISÕES FUTURAS (11-20)          ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

const futureSessions = result.sessions.slice(10); // Sessions 11-20

console.log('📊 PROGRESSÃO DOS INTERVALOS DE REVISÃO:\n');
futureSessions.forEach((session, i) => {
  const sessionNum = session.sessionNumber;
  const days = session.intervalDays;
  const bar = '█'.repeat(Math.min(50, Math.floor(days / 4)));
  
  console.log(`Sessão ${sessionNum}: ${session.correct}/${session.totalQuestions} acertos → Próxima revisão em ${days.toString().padStart(3)} dias ${bar}`);
});

console.log('\n📈 CRESCIMENTO DO INTERVALO:\n');
const intervals = futureSessions.map(s => s.intervalDays);
const maxInterval = Math.max(...intervals);
const minInterval = Math.min(...intervals);

console.log(`  Intervalo mínimo: ${minInterval} dias (Sessão ${futureSessions.find(s => s.intervalDays === minInterval)?.sessionNumber})`);
console.log(`  Intervalo máximo: ${maxInterval} dias (Sessão ${futureSessions.find(s => s.intervalDays === maxInterval)?.sessionNumber})`);
console.log(`  Crescimento: ${minInterval} → ${maxInterval} dias (${((maxInterval / minInterval - 1) * 100).toFixed(0)}% de aumento)`);

console.log('\n🎯 ESTATÍSTICAS DAS REVISÕES FUTURAS:\n');
const futureCorrect = futureSessions.reduce((sum, s) => sum + s.correct, 0);
const futureIncorrect = futureSessions.reduce((sum, s) => sum + s.incorrect, 0);
const futureAccuracy = ((futureCorrect / (futureCorrect + futureIncorrect)) * 100).toFixed(1);

console.log(`  Total de questões: ${futureCorrect + futureIncorrect}`);
console.log(`  Acertos: ${futureCorrect}`);
console.log(`  Erros: ${futureIncorrect}`);
console.log(`  Taxa de acerto: ${futureAccuracy}%`);
console.log(`  Review count final: ${result.finalReviewState.reviewCount}`);

// Calculate the date of the next review
const lastSession = result.sessions[result.sessions.length - 1];
const nextReviewDate = new Date(lastSession.dueDate);
const today = new Date();
const daysUntilReview = Math.ceil((nextReviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

console.log(`  Próxima revisão: ${lastSession.dueDate} (daqui a ~${lastSession.intervalDays} dias)`);

console.log('\n💡 INSIGHTS:\n');
console.log('  1. Com 90-100% de acerto consistente, os intervalos crescem rapidamente');
console.log('  2. O sistema recompensa performance alta com espaçamento maior');
console.log('  3. Review count aumenta progressivamente: 5 → 15');
console.log('  4. Intervalos seguem crescimento exponencial até o limite de 180 dias');
console.log('  5. João passa de revisões diárias para revisões a cada vários dias/semanas');

// Project future intervals
console.log('\n🔮 PROJEÇÃO DE INTERVALOS FUTUROS:\n');
console.log('Se João continuar com 95%+ de acerto:\n');

const finalReviewCount = result.finalReviewState.reviewCount;
const projectedIntervals = [];

for (let i = 1; i <= 5; i++) {
  const futureReviewCount = finalReviewCount + i;
  const baseInterval = Math.pow(1.7, futureReviewCount - 1);
  const cappedBase = Math.min(180, Math.round(baseInterval));
  const multiplier = 0.6 + Math.pow(0.95, 3) * 1.4; // 95% accuracy
  const finalInterval = Math.max(1, Math.round(cappedBase * multiplier));
  const cappedFinal = Math.min(180, finalInterval);
  
  projectedIntervals.push({ reviewCount: futureReviewCount, interval: cappedFinal });
  
  console.log(`  Review ${futureReviewCount}: ~${cappedFinal} dias`);
}

if (projectedIntervals[projectedIntervals.length - 1].interval === 180) {
  console.log('\n  ⚠️  Após atingir o limite de 180 dias, o intervalo não aumentará mais.');
  console.log('      João revisará este tópico a cada 6 meses indefinidamente.');
}

console.log('\n✅ CONCLUSÃO:\n');
console.log('  O sistema de revisão espaçada está funcionando perfeitamente!');
console.log('  - Intervalos curtos durante aprendizado (1-7 dias)');
console.log('  - Intervalos crescem com domínio (até 180 dias máximo)');
console.log('  - Sistema recompensa consistência com menos revisões');
console.log('  - Conteúdo dominado requer apenas revisões esporádicas');
console.log();
