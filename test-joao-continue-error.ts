/**
 * Test: João continua errando depois da sessão 16
 * 
 * Este teste mostra o que acontece quando João, após ter bom desempenho,
 * começa a errar consistentemente nas sessões seguintes.
 */

import { simulateReviewScheduling } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║   TESTE: JOÃO CONTINUA ERRANDO APÓS A SESSÃO 16                   ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// João's journey: good start, then bad performance continues
const sessions = [
  // Sessions 1-10: Initial learning (good progress)
  { correct: 1, incorrect: 9 },   // S1: 10%
  { correct: 2, incorrect: 8 },   // S2: 20%
  { correct: 3, incorrect: 7 },   // S3: 30%
  { correct: 4, incorrect: 6 },   // S4: 40%
  { correct: 5, incorrect: 5 },   // S5: 50%
  { correct: 6, incorrect: 4 },   // S6: 60%
  { correct: 7, incorrect: 3 },   // S7: 70%
  { correct: 8, incorrect: 2 },   // S8: 80%
  { correct: 9, incorrect: 1 },   // S9: 90%
  { correct: 10, incorrect: 0 },  // S10: 100%
  
  // Sessions 11-15: Good performance continues
  { correct: 9, incorrect: 1 },   // S11: 90%
  { correct: 10, incorrect: 0 },  // S12: 100%
  { correct: 9, incorrect: 1 },   // S13: 90%
  { correct: 10, incorrect: 0 },  // S14: 100%
  { correct: 10, incorrect: 0 },  // S15: 100%
  
  // 🔴 Session 16 onwards: TUDO DÁ ERRADO!
  { correct: 0, incorrect: 10 },  // S16: 0% ❌
  { correct: 0, incorrect: 10 },  // S17: 0% ❌
  { correct: 1, incorrect: 9 },   // S18: 10% ❌
  { correct: 0, incorrect: 10 },  // S19: 0% ❌
  { correct: 2, incorrect: 8 },   // S20: 20% ❌
  { correct: 0, incorrect: 10 },  // S21: 0% ❌
  { correct: 1, incorrect: 9 },   // S22: 10% ❌
  { correct: 0, incorrect: 10 },  // S23: 0% ❌
  { correct: 0, incorrect: 10 },  // S24: 0% ❌
  { correct: 1, incorrect: 9 },   // S25: 10% ❌
];

const result = simulateReviewScheduling('Matemática', 'Função', sessions, 600);

console.log('📚 CENÁRIO:\n');
console.log('  Sessões 1-15: João aprende bem (55 → 103 acertos, 68.7% acurácia)');
console.log('  🔴 Sessões 16-25: João CONTINUA ERRANDO (quase tudo errado!)\n');

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                    EVOLUÇÃO SESSÃO POR SESSÃO                      ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

// Show key sessions
const keySessionNumbers = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
console.log('┌────────┬─────────┬──────────────┬──────────────┬────────────┬───────────┐');
console.log('│ Sessão │ Acertos │ Acurácia Ses │ Acurácia Acum│ Review Cnt │ Intervalo │');
console.log('├────────┼─────────┼──────────────┼──────────────┼────────────┼───────────┤');

keySessionNumbers.forEach(num => {
  const session = result.sessions[num - 1];
  const accuracySession = session.accuracy.toFixed(0);
  const accuracyCumul = session.cumulativeAccuracy.toFixed(1);
  const reviewCount = session.reviewCount;
  const interval = session.intervalDays;
  const resetMarker = (num > 15 && session.reviewCount === 1 && result.sessions[num - 2]?.reviewCount > 1) ? ' 🔄' : '';
  
  console.log(`│ ${num.toString().padStart(6)} │ ${session.correct}/10   │ ${accuracySession.padStart(10)}%  │ ${accuracyCumul.padStart(10)}%  │ ${reviewCount.toString().padStart(10)} │ ${interval.toString().padStart(6)} d${resetMarker}  │`);
});
console.log('└────────┴─────────┴──────────────┴──────────────┴────────────┴───────────┘');

// Find when reset happened
let resetSession = null;
for (let i = 15; i < result.sessions.length; i++) {
  const session = result.sessions[i];
  const prevSession = result.sessions[i - 1];
  if (session.reviewCount === 1 && prevSession.reviewCount > 1) {
    resetSession = session.sessionNumber;
    break;
  }
}

console.log('\n🔍 ANÁLISE DETALHADA:\n');

const session15 = result.sessions[14];
const session25 = result.sessions[24];

console.log(`📊 ANTES (Sessão 15):`);
console.log(`  • Total de questões: ${session15.cumulativeCorrect + session15.cumulativeIncorrect}`);
console.log(`  • Acertos: ${session15.cumulativeCorrect}`);
console.log(`  • Acurácia: ${session15.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  • Review count: ${session15.reviewCount}`);
console.log(`  • Intervalo: ${session15.intervalDays} dias\n`);

console.log(`📊 DEPOIS DE 10 SESSÕES RUINS (Sessão 25):`);
console.log(`  • Total de questões: ${session25.cumulativeCorrect + session25.cumulativeIncorrect}`);
console.log(`  • Acertos: ${session25.cumulativeCorrect}`);
console.log(`  • Acurácia: ${session25.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  • Review count: ${session25.reviewCount}`);
console.log(`  • Intervalo: ${session25.intervalDays} dias\n`);

if (resetSession) {
  console.log(`🔄 RESET ACONTECEU NA SESSÃO ${resetSession}!\n`);
  const resetSess = result.sessions[resetSession - 1];
  console.log(`  Quando a acurácia caiu para: ${resetSess.cumulativeAccuracy.toFixed(1)}%`);
  console.log(`  Review count voltou de ${result.sessions[resetSession - 2].reviewCount} para 1`);
  console.log(`  Intervalo caiu para ${resetSess.intervalDays} dia(s)\n`);
} else {
  console.log(`⚠️  RESET NÃO ACONTECEU (acurácia ainda acima de 40%)\n`);
}

console.log('💡 O QUE ACONTECE QUANDO CONTINUA ERRANDO:\n');

if (session25.cumulativeAccuracy < 40) {
  console.log('  ✅ Acurácia caiu abaixo de 40%');
  console.log('  ✅ Sistema RESETOU o review count para 1');
  console.log('  ✅ Intervalos voltaram a ser muito curtos (1 dia)');
  console.log('  ✅ João precisa revisar DIARIAMENTE até melhorar');
  console.log('  ✅ Sistema detectou que ele NÃO domina mais o conteúdo\n');
} else {
  console.log('  ⚠️  Mesmo errando muito, acurácia ainda está acima de 40%');
  console.log('  ⚠️  Isso porque João tinha MUITOS acertos acumulados');
  console.log('  ⚠️  Review count continua aumentando (não reseta)');
  console.log('  ⚠️  Intervalos diminuem mas não voltam para 1 dia\n');
}

console.log('📈 GRÁFICO DA ACURÁCIA:\n');
const maxWidth = 50;
[15, 16, 18, 20, 22, 24, 25].forEach(sessionNum => {
  const session = result.sessions[sessionNum - 1];
  const acc = session.cumulativeAccuracy;
  const barWidth = Math.round((acc / 100) * maxWidth);
  const bar = '█'.repeat(barWidth);
  const marker = acc < 40 ? '🔴' : acc < 60 ? '🟡' : '🟢';
  
  console.log(`S${sessionNum.toString().padStart(2)} ${marker} │${bar.padEnd(maxWidth, ' ')}│ ${acc.toFixed(1)}%`);
});
console.log('     ' + ' '.repeat(4) + '└' + '─'.repeat(20) + '40%');

console.log('\n🎯 CONCLUSÃO:\n');
console.log('  1️⃣  Acurácia é ACUMULATIVA (conta todas as questões desde o início)');
console.log('  2️⃣  Se você tinha muitos acertos, leva tempo para cair abaixo de 40%');
console.log('  3️⃣  Quando finalmente cai < 40%, o sistema RESETA review count para 1');
console.log('  4️⃣  Isso força revisões diárias até você melhorar de novo');
console.log('  5️⃣  É uma proteção: previne que você avance sem realmente saber\n');

console.log('📐 MATEMÁTICA DO RESET:\n');
const correctAt15 = session15.cumulativeCorrect;
const totalAt15 = session15.cumulativeCorrect + session15.cumulativeIncorrect;
const errorsNeeded = Math.ceil((correctAt15 - 0.4 * totalAt15) / 0.4);

console.log(`  Para cair de ${session15.cumulativeAccuracy.toFixed(1)}% para abaixo de 40%:`);
console.log(`  • João tinha ${correctAt15} acertos de ${totalAt15} questões`);
console.log(`  • Precisava errar aproximadamente ${errorsNeeded}+ questões seguidas`);
console.log(`  • Isso é ${Math.ceil(errorsNeeded / 10)} sessões errando quase tudo\n`);

console.log('✅ Execute: npm run test:joao-continue-error\n');
