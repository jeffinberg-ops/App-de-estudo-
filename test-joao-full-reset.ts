/**
 * Test: Reset completo - muitas sessões ruins
 */

import { simulateReviewScheduling } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║      O QUE ACONTECE: CONTINUAR ERRANDO ATÉ O RESET                ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

const sessions = [
  ...Array(15).fill({ correct: 9, incorrect: 1 }),  // 90% acurácia (135/150)
  ...Array(25).fill({ correct: 0, incorrect: 10 }), // 0% acurácia (0/250 novos)
];

const result = simulateReviewScheduling('Matemática', 'Função', sessions, 600);

// Find reset
let resetSession = null;
for (let i = 1; i < result.sessions.length; i++) {
  if (result.sessions[i].reviewCount === 1 && result.sessions[i-1].reviewCount > 1) {
    resetSession = i + 1;
    break;
  }
}

console.log('📊 PROGRESSÃO:\n');
[15, 20, 25, 30, 35, 40].forEach(num => {
  if (num <= result.sessions.length) {
    const s = result.sessions[num - 1];
    const marker = num === resetSession ? ' 🔄 RESET!' : '';
    console.log(`Sessão ${num}: Acurácia ${s.cumulativeAccuracy.toFixed(1)}% | Review: ${s.reviewCount} | Intervalo: ${s.intervalDays}d${marker}`);
  }
});

if (resetSession) {
  const s = result.sessions[resetSession - 1];
  console.log(`\n✅ RESET ACIONADO NA SESSÃO ${resetSession}!`);
  console.log(`   Acurácia caiu para: ${s.cumulativeAccuracy.toFixed(1)}%`);
  console.log(`   Review count resetou para: 1`);
  console.log(`   Intervalo voltou para: ${s.intervalDays} dia\n`);
} else {
  console.log('\n❌ Reset não aconteceu mesmo após 25 sessões ruins\n');
}

console.log('💡 RESPOSTA COMPLETA:\n');
console.log('Se João continuar errando após a sessão 16:\n');
console.log('1. A acurácia ACUMULADA vai caindo gradualmente');
console.log('2. Intervalos diminuem (multiplicador fica menor)');
console.log('3. Mas review count continua aumentando');
console.log('4. Quando acurácia < 40%, RESET acontece');
console.log('5. Review count volta para 1');
console.log('6. Intervalos voltam para 1 dia');
console.log('7. João é forçado a revisar DIARIAMENTE\n');
