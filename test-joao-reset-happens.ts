/**
 * Test: Reset finalmente acontece
 * 
 * Mostra o momento exato quando o reset é acionado após muitas sessões ruins
 */

import { simulateReviewScheduling } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║   TESTE: QUANDO O RESET FINALMENTE ACONTECE                       ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// More bad sessions to trigger reset
const sessions = [
  // Good start
  ...Array(15).fill({ correct: 9, incorrect: 1 }),  // 90% acurácia
  
  // Many bad sessions
  ...Array(15).fill({ correct: 0, incorrect: 10 }),  // 0% acurácia
];

const result = simulateReviewScheduling('Matemática', 'Função', sessions, 600);

console.log('📚 CENÁRIO: 15 sessões boas + 15 sessões ruins\n');

// Find the reset point
let resetSession = null;
for (let i = 1; i < result.sessions.length; i++) {
  const curr = result.sessions[i];
  const prev = result.sessions[i - 1];
  if (curr.reviewCount === 1 && prev.reviewCount > 1) {
    resetSession = i + 1;
    break;
  }
}

console.log('┌────────┬─────────┬──────────────┬────────────┬───────────┐');
console.log('│ Sessão │ Acertos │ Acurácia Acum│ Review Cnt │ Status    │');
console.log('├────────┼─────────┼──────────────┼────────────┼───────────┤');

result.sessions.forEach((s, i) => {
  const num = s.sessionNumber;
  if (num === 15 || num >= 16) {
    const marker = num === resetSession ? ' 🔄 RESET!' : '';
    const color = s.cumulativeAccuracy < 40 ? '🔴' : s.cumulativeAccuracy < 60 ? '🟡' : '🟢';
    console.log(`│ ${num.toString().padStart(6)} │ ${s.correct}/10   │ ${s.cumulativeAccuracy.toFixed(1).padStart(10)}%  │ ${s.reviewCount.toString().padStart(10)} │ ${color}${marker.padEnd(9)} │`);
  }
});
console.log('└────────┴─────────┴──────────────┴────────────┴───────────┘');

if (resetSession) {
  const sess = result.sessions[resetSession - 1];
  console.log(`\n🔄 RESET ACONTECEU NA SESSÃO ${resetSession}!\n`);
  console.log(`  📉 Acurácia: ${sess.cumulativeAccuracy.toFixed(1)}% (caiu abaixo de 40%)`);
  console.log(`  🔄 Review count: ${result.sessions[resetSession - 2].reviewCount} → 1`);
  console.log(`  📅 Intervalo: ${sess.intervalDays} dia (voltou ao mínimo)`);
  console.log(`  ✅ Sistema detectou: João NÃO domina mais o conteúdo\n`);
} else {
  console.log('\n⚠️  Reset ainda não aconteceu até a sessão 30\n');
}

console.log('💡 RESUMO:\n');
console.log(`  • Começou com ${result.sessions[14].cumulativeAccuracy.toFixed(1)}% de acurácia`);
console.log(`  • Terminou com ${result.sessions[result.sessions.length - 1].cumulativeAccuracy.toFixed(1)}% de acurácia`);
if (resetSession) {
  console.log(`  • Reset aconteceu na sessão ${resetSession}`);
  console.log('  • A partir daí, revisões diárias até melhorar\n');
} else {
  console.log('  • Reset não aconteceu (ainda > 40%)\n');
}
