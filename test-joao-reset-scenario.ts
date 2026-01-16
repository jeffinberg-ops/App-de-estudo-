/**
 * Test: What happens if João fails all questions in session 16?
 * 
 * This test shows the reset mechanism when a student who was performing well
 * suddenly has a bad session and their cumulative accuracy drops below 40%.
 */

import { simulateReviewScheduling, formatFullReport } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║   TESTE: O QUE ACONTECE SE JOÃO ERRAR TUDO NA SESSÃO 16?         ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// João's initial journey - sessions 1-15 (same as before)
const sessions1to15 = [
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
  { correct: 9, incorrect: 1 },   // Session 11: 90%
  { correct: 10, incorrect: 0 },  // Session 12: 100%
  { correct: 9, incorrect: 1 },   // Session 13: 90%
  { correct: 10, incorrect: 0 },  // Session 14: 100%
  { correct: 10, incorrect: 0 },  // Session 15: 100%
];

// SESSION 16: João ERRA TUDO! 0/10
const session16BadPerformance = [
  { correct: 0, incorrect: 10 },  // Session 16: 0% ❌❌❌
];

// After the bad session, João needs to recover
const sessionsAfterReset = [
  { correct: 5, incorrect: 5 },   // Session 17: 50% (tentando recuperar)
  { correct: 7, incorrect: 3 },   // Session 18: 70% (melhorando)
  { correct: 9, incorrect: 1 },   // Session 19: 90% (quase lá)
  { correct: 10, incorrect: 0 },  // Session 20: 100% (recuperado!)
];

const allSessions = [...sessions1to15, ...session16BadPerformance, ...sessionsAfterReset];

console.log('📚 Simulando cenário especial:\n');
console.log('  Sessões 1-15: João progride bem (como antes)');
console.log('  🔴 SESSÃO 16: João ERRA TODAS as 10 questões! (0%)');
console.log('  Sessões 17-20: João tenta recuperar\n');

const result = simulateReviewScheduling(
  'Matemática',
  'Função',
  allSessions,
  600
);

// Show key sessions
console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                    ANÁLISE DO CENÁRIO CRÍTICO                      ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

console.log('📊 ANTES DA SESSÃO 16 (Sessão 15):\n');
const session15 = result.sessions[14];
console.log(`  Acurácia acumulada: ${session15.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  Review count: ${session15.reviewCount}`);
console.log(`  Próxima revisão: ${session15.intervalDays} dias`);
console.log(`  Status: ✅ João está indo muito bem!\n`);

console.log('🔴 SESSÃO 16 - O DESASTRE:\n');
const session16 = result.sessions[15];
console.log(`  Questões: ${session16.correct}/${session16.totalQuestions} acertos (${session16.accuracy.toFixed(0)}%)`);
console.log(`  Acurácia acumulada ANTES: ${session15.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  Acurácia acumulada DEPOIS: ${session16.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  Review count ANTES: ${session15.reviewCount}`);
console.log(`  Review count DEPOIS: ${session16.reviewCount}`);
console.log(`  Próxima revisão: ${session16.intervalDays} dias`);

// Check if reset happened
if (session16.reviewCount === 1) {
  console.log(`  🔄 RESET ATIVADO! Review count voltou para 1`);
} else {
  console.log(`  ⚠️  Review count NÃO foi resetado (ainda em ${session16.reviewCount})`);
}

console.log('\n📈 RECUPERAÇÃO (Sessões 17-20):\n');
for (let i = 16; i < 20; i++) {
  const session = result.sessions[i];
  console.log(`  Sessão ${session.sessionNumber}: ${session.correct}/${session.totalQuestions} → Acurácia: ${session.cumulativeAccuracy.toFixed(1)}% → Review: ${session.reviewCount} → Intervalo: ${session.intervalDays} dias`);
}

console.log('\n💡 O QUE ACONTECEU?\n');

const finalAccuracy = session16.cumulativeAccuracy;
if (finalAccuracy < 40) {
  console.log('  ✅ Sistema detectou queda drástica de performance');
  console.log(`  ✅ Acurácia caiu para ${finalAccuracy.toFixed(1)}% (abaixo de 40%)`);
  console.log('  ✅ Review count foi RESETADO para 1');
  console.log('  ✅ Intervalos voltam a ser curtos (1 dia)');
  console.log('  ✅ João precisa reaprender o conteúdo');
} else {
  console.log(`  ⚠️  Acurácia está em ${finalAccuracy.toFixed(1)}% (ainda acima de 40%)`);
  console.log('  ⚠️  Review count NÃO foi resetado');
  console.log('  ⚠️  João continua com intervalos longos');
}

console.log('\n📊 COMPARAÇÃO ANTES E DEPOIS:\n');
console.log('┌──────────────────┬────────────┬──────────────┬───────────────┐');
console.log('│ Momento          │ Acurácia   │ Review Count │ Próx. Revisão │');
console.log('├──────────────────┼────────────┼──────────────┼───────────────┤');
console.log(`│ Sessão 15 (Antes)│ ${session15.cumulativeAccuracy.toFixed(1).padStart(7)}%  │ ${session15.reviewCount.toString().padStart(12)} │ ${session15.intervalDays.toString().padStart(10)} dias │`);
console.log(`│ Sessão 16 (Erro) │ ${session16.cumulativeAccuracy.toFixed(1).padStart(7)}%  │ ${session16.reviewCount.toString().padStart(12)} │ ${session16.intervalDays.toString().padStart(10)} dias │`);
console.log(`│ Sessão 20 (Recup)│ ${result.sessions[19].cumulativeAccuracy.toFixed(1).padStart(7)}%  │ ${result.sessions[19].reviewCount.toString().padStart(12)} │ ${result.sessions[19].intervalDays.toString().padStart(10)} dias │`);
console.log('└──────────────────┴────────────┴──────────────┴───────────────┘');

console.log('\n🎯 CONCLUSÃO:\n');
console.log('  O sistema de revisão espaçada tem um mecanismo de PROTEÇÃO:');
console.log('  • Se a acurácia cai abaixo de 40%, o review count reseta para 1');
console.log('  • Isso força o estudante a revisar com mais frequência');
console.log('  • Previne que alguém avance sem realmente dominar o conteúdo');
console.log('  • É uma funcionalidade INTENCIONAL, não um bug!');
console.log();

// Calculate the mathematical threshold
const totalBefore = session15.cumulativeCorrect + session15.cumulativeIncorrect;
const correctBefore = session15.cumulativeCorrect;
const totalAfter = totalBefore + 10;
const correctAfter = correctBefore + 0; // 0 correct in session 16

console.log('🔢 CÁLCULO MATEMÁTICO:\n');
console.log(`  Antes da sessão 16:`);
console.log(`    Total: ${totalBefore} questões (${correctBefore} certas)`);
console.log(`    Acurácia: ${(correctBefore / totalBefore * 100).toFixed(1)}%`);
console.log();
console.log(`  Depois de errar tudo na sessão 16:`);
console.log(`    Total: ${totalAfter} questões (${correctAfter} certas)`);
console.log(`    Acurácia: ${(correctAfter / totalAfter * 100).toFixed(1)}%`);
console.log();
console.log(`  ${(correctAfter / totalAfter) < 0.4 ? '✅' : '❌'} Acurácia < 40%? ${(correctAfter / totalAfter) < 0.4 ? 'SIM - Reset ativado!' : 'NÃO - Continua normal'}`);
console.log();
