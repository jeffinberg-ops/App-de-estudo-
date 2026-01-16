/**
 * Test: Adaptive Recovery System
 * 
 * Demonstrates the new adaptive recovery feature where the system detects
 * performance spikes and gives students a chance to recover before full reset.
 */

import { simulateReviewScheduling } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║        TESTE: SISTEMA DE RECUPERAÇÃO ADAPTATIVA                   ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

console.log('🎯 CENÁRIO 1: Spike com Recuperação Bem-sucedida\n');

const scenario1 = [
  ...Array(10).fill({ correct: 9, incorrect: 1 }),  // Build up to 90% (90/100)
  { correct: 2, incorrect: 8 },  // SPIKE! Session 11: 20% (but cumulative: 73%)
  { correct: 8, incorrect: 2 },  // Recover! Session 12: 80%
];

const result1 = simulateReviewScheduling('Matemática', 'Função', scenario1, 600);

console.log('┌────────┬─────────┬──────────┬────────────┬───────────┬────────────┐');
console.log('│ Sessão │ Acertos │ Sess Acc │ Acum. Acc  │ Review Cnt│ Intervalo  │');
console.log('├────────┼─────────┼──────────┼────────────┼───────────┼────────────┤');

[9, 10, 11, 12].forEach(num => {
  const s = result1.sessions[num - 1];
  const marker = s.sessionNumber === 11 ? ' 🔴 SPIKE!' : s.sessionNumber === 12 ? ' ✅ RECUPEROU!' : '';
  console.log(`│ ${num.toString().padStart(6)} │ ${s.correct}/10   │ ${s.accuracy.toFixed(0).padStart(6)}%  │ ${s.cumulativeAccuracy.toFixed(1).padStart(8)}%  │ ${s.reviewCount.toString().padStart(9)} │ ${s.intervalDays.toString().padStart(7)} d${marker} │`);
});
console.log('└────────┴─────────┴──────────┴────────────┴───────────┴────────────┘');

console.log('\n💡 O que aconteceu:');
console.log('  • Sessão 10: 90% acum, 125 dias (performance excelente)');
console.log('  • Sessão 11: Spike detectado! (20% sessão vs 90% acum)');
console.log('    → Entra em modo recuperação: 3 dias');
console.log('    → Review count mantido (não avança)');
console.log('    → Intervalo anterior (125d) salvo');
console.log('  • Sessão 12: Recuperação! (80% sessão)');
console.log('    → Sai do modo recuperação');
console.log('    → Intervalo restaurado para ~125 dias');
console.log('    → Review count avança normalmente');
console.log();

console.log('🎯 CENÁRIO 2: Spike com Piora Progressiva\n');

const scenario2 = [
  ...Array(10).fill({ correct: 9, incorrect: 1 }),  // 90%
  { correct: 2, incorrect: 8 },  // SPIKE! 20%
  { correct: 3, incorrect: 7 },  // Piora: 30%
  { correct: 2, incorrect: 8 },  // Continua ruim: 20%
  { correct: 1, incorrect: 9 },  // Ainda pior: 10%
];

const result2 = simulateReviewScheduling('Matemática', 'Função', scenario2, 600);

console.log('┌────────┬─────────┬──────────┬────────────┬───────────┬────────────┐');
console.log('│ Sessão │ Acertos │ Sess Acc │ Acum. Acc  │ Review Cnt│ Intervalo  │');
console.log('├────────┼─────────┼──────────┼────────────┼───────────┼────────────┤');

[10, 11, 12, 13, 14].forEach(num => {
  const s = result2.sessions[num - 1];
  const marker = s.sessionNumber === 11 ? ' 🔴 SPIKE' : 
                  s.sessionNumber === 12 ? ' ⚠️ 2d' :
                  s.sessionNumber === 13 ? ' ⚠️ 1d' : 
                  s.sessionNumber === 14 ? ' ⚠️ 1d' : '';
  console.log(`│ ${num.toString().padStart(6)} │ ${s.correct}/10   │ ${s.accuracy.toFixed(0).padStart(6)}%  │ ${s.cumulativeAccuracy.toFixed(1).padStart(8)}%  │ ${s.reviewCount.toString().padStart(9)} │ ${s.intervalDays.toString().padStart(7)} d${marker} │`);
});
console.log('└────────┴─────────┴──────────┴────────────┴───────────┴────────────┘');

console.log('\n💡 O que aconteceu:');
console.log('  • Sessão 11: Spike detectado → 3 dias (tentativa 0)');
console.log('  • Sessão 12: Piora → 2 dias (tentativa 1)');
console.log('  • Sessão 13: Piora → 1 dia (tentativa 2)');
console.log('  • Sessão 14: Piora → 1 dia (mantém mínimo)');
console.log('  • Review count não avança durante recuperação');
console.log('  • Intervalos apertam progressivamente: 3d → 2d → 1d → 1d');
console.log();

console.log('🎯 CENÁRIO 3: Recuperação Tardia\n');

const scenario3 = [
  ...Array(10).fill({ correct: 9, incorrect: 1 }),  // 90%
  { correct: 2, incorrect: 8 },  // SPIKE! 20%
  { correct: 4, incorrect: 6 },  // Marginal: 40%
  { correct: 5, incorrect: 5 },  // Marginal: 50%
  { correct: 8, incorrect: 2 },  // RECUPERA! 80%
];

const result3 = simulateReviewScheduling('Matemática', 'Função', scenario3, 600);

console.log('┌────────┬─────────┬──────────┬────────────┬───────────┬────────────┐');
console.log('│ Sessão │ Acertos │ Sess Acc │ Acum. Acc  │ Review Cnt│ Intervalo  │');
console.log('├────────┼─────────┼──────────┼────────────┼───────────┼────────────┤');

[10, 11, 12, 13, 14].forEach(num => {
  const s = result3.sessions[num - 1];
  const marker = s.sessionNumber === 11 ? ' 🔴 SPIKE' :
                  s.sessionNumber === 12 ? ' 🟡 Marginal' :
                  s.sessionNumber === 13 ? ' 🟡 Marginal' :
                  s.sessionNumber === 14 ? ' ✅ RECUPEROU!' : '';
  console.log(`│ ${num.toString().padStart(6)} │ ${s.correct}/10   │ ${s.accuracy.toFixed(0).padStart(6)}%  │ ${s.cumulativeAccuracy.toFixed(1).padStart(8)}%  │ ${s.reviewCount.toString().padStart(9)} │ ${s.intervalDays.toString().padStart(7)} d${marker} │`);
});
console.log('└────────┴─────────┴──────────┴────────────┴───────────┴────────────┘');

console.log('\n💡 O que aconteceu:');
console.log('  • Sessão 11: Spike → 3 dias');
console.log('  • Sessões 12-13: Performance marginal (40-50%)');
console.log('    → Mantém em modo recuperação');
console.log('    → Não piora (não aumenta tentativas)');
console.log('    → Dá mais chances');
console.log('  • Sessão 14: Finalmente recupera (80%)');
console.log('    → Restaura intervalo longo');
console.log('    → Avança review count');
console.log();

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                    COMO O SISTEMA FUNCIONA                         ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

console.log('🔍 DETECÇÃO DE SPIKE:');
console.log('  • Acurácia acumulada ≥ 60% (estudante estava indo bem)');
console.log('  • Acurácia da sessão ≤ 40% (performance ruim repentina)');
console.log('  • Review count ≥ 3 (tópico já estabelecido)');
console.log();

console.log('🔄 MODO RECUPERAÇÃO:');
console.log('  • Tentativa 0: 3 dias (primeira chance)');
console.log('  • Tentativa 1: 2 dias (segunda chance)');
console.log('  • Tentativa 2+: 1 dia (mínimo intensivo)');
console.log();

console.log('✅ CRITÉRIOS DE RECUPERAÇÃO:');
console.log('  • Sessão com ≥ 70% de acerto');
console.log('  • Restaura intervalo anterior (ex: 125 dias)');
console.log('  • Avança review count normalmente');
console.log();

console.log('❌ CRITÉRIOS DE PIORA:');
console.log('  • Sessão com < 50% de acerto');
console.log('  • Aumenta tentativas de recuperação');
console.log('  • Reduz intervalo (3d → 2d → 1d)');
console.log();

console.log('🟡 PERFORMANCE MARGINAL (50-70%):');
console.log('  • Mantém em recuperação sem piorar');
console.log('  • Dá mais chances sem apertar intervalo');
console.log();

console.log('💡 BENEFÍCIOS DO SISTEMA:');
console.log('  ✅ Responde RÁPIDO a problemas (3 dias vs esperar reset)');
console.log('  ✅ Dá "segunda chance" antes de punir');
console.log('  ✅ Restaura progresso se foi só um "dia ruim"');
console.log('  ✅ Aperta gradualmente se problema persiste');
console.log('  ✅ Protege o intervalo longo conquistado');
console.log();

console.log('🚀 Execute: npm run test:joao-adaptive\n');
