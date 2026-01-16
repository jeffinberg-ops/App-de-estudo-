/**
 * Test: Multiple bad sessions causing reset
 * 
 * Shows when the reset mechanism actually triggers (accuracy < 40%)
 */

import { simulateReviewScheduling } from './test-joao-simulation';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                    ║');
console.log('║  TESTE: CENÁRIOS DE RESET - QUANDO O SISTEMA RESETA?             ║');
console.log('║                                                                    ║');
console.log('╚════════════════════════════════════════════════════════════════════╝');
console.log();

// Scenario 1: One bad session after mastery
console.log('📊 CENÁRIO 1: Uma sessão ruim após domínio\n');
const scenario1 = [
  ...Array(15).fill({ correct: 9, incorrect: 1 }),  // 15 sessions at 90%
  { correct: 0, incorrect: 10 },  // 1 bad session
];

const result1 = simulateReviewScheduling('Matemática', 'Função', scenario1, 600);
const lastSession1 = result1.sessions[result1.sessions.length - 1];

console.log(`  Sessões 1-15: 90% acerto (135/150 questões)`);
console.log(`  Sessão 16: 0% acerto (0/10 questões)`);
console.log(`  📈 Acurácia final: ${lastSession1.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  🔄 Review count: ${lastSession1.reviewCount}`);
console.log(`  ${lastSession1.cumulativeAccuracy < 40 ? '✅ RESET ATIVADO' : '❌ SEM RESET'} (acurácia ${lastSession1.cumulativeAccuracy < 40 ? '<' : '≥'} 40%)\n`);

// Scenario 2: Multiple bad sessions
console.log('📊 CENÁRIO 2: Múltiplas sessões ruins\n');
const scenario2 = [
  ...Array(10).fill({ correct: 9, incorrect: 1 }),  // 10 sessions at 90%
  { correct: 0, incorrect: 10 },  // 5 bad sessions
  { correct: 0, incorrect: 10 },
  { correct: 0, incorrect: 10 },
  { correct: 0, incorrect: 10 },
  { correct: 0, incorrect: 10 },
];

const result2 = simulateReviewScheduling('Matemática', 'Função', scenario2, 600);
const lastSession2 = result2.sessions[result2.sessions.length - 1];

console.log(`  Sessões 1-10: 90% acerto (90/100 questões)`);
console.log(`  Sessões 11-15: 0% acerto (0/50 questões)`);
console.log(`  📈 Acurácia final: ${lastSession2.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  🔄 Review count: ${lastSession2.reviewCount}`);
console.log(`  ${lastSession2.cumulativeAccuracy < 40 ? '✅ RESET ATIVADO' : '❌ SEM RESET'} (acurácia ${lastSession2.cumulativeAccuracy < 40 ? '<' : '≥'} 40%)\n`);

// Scenario 3: Starting with bad performance
console.log('📊 CENÁRIO 3: Iniciando com performance baixa\n');
const scenario3 = [
  { correct: 1, incorrect: 9 },
  { correct: 2, incorrect: 8 },
  { correct: 1, incorrect: 9 },
  { correct: 2, incorrect: 8 },
  { correct: 3, incorrect: 7 },
];

const result3 = simulateReviewScheduling('Matemática', 'Função', scenario3, 600);
const lastSession3 = result3.sessions[result3.sessions.length - 1];

console.log(`  Sessões 1-5: 10-30% acerto (9/50 questões)`);
console.log(`  📈 Acurácia final: ${lastSession3.cumulativeAccuracy.toFixed(1)}%`);
console.log(`  🔄 Review count: ${lastSession3.reviewCount}`);
console.log(`  ${lastSession3.cumulativeAccuracy < 40 ? '✅ MANTÉM review=1' : '❌ Aumenta review count'} (acurácia ${lastSession3.cumulativeAccuracy < 40 ? '<' : '≥'} 40%)\n`);

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║                        REGRA DO RESET                              ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');

console.log('🔄 O RESET acontece quando:\n');
console.log('  • Acurácia ACUMULADA < 40%');
console.log('  • Conta TODAS as questões desde o início');
console.log('  • Uma sessão ruim sozinha pode não ser suficiente');
console.log('  • Múltiplas sessões ruins podem causar reset');
console.log();

console.log('📐 EXEMPLO DE CÁLCULO:\n');
console.log('  Se você tem:');
console.log('    • 150 questões certas de 200 tentativas = 75% acurácia');
console.log('    • E erra 10 questões na próxima sessão');
console.log('    • Nova acurácia: 150/210 = 71.4%');
console.log('    • 71.4% > 40% → SEM RESET\n');
console.log();
console.log('  Para cair abaixo de 40% com 150 acertos:');
console.log('    • Precisaria ter mais de 225 erros totais');
console.log('    • Ou seja, precisaria errar MUITAS sessões seguidas\n');
console.log();

console.log('💡 RESPOSTA À PERGUNTA:\n');
console.log('  "E se João errar todas as questões na sessão 16?"\n');
console.log('  → Se ele tinha boa performance antes (70%+), uma sessão ruim');
console.log('     NÃO causará reset imediato.');
console.log('  → A acurácia cairá um pouco (ex: 68% → 64%), mas ainda > 40%');
console.log('  → O sistema NÃO reseta para review=1');
console.log('  → Intervalos continuam longos (mas podem diminuir um pouco)');
console.log();
console.log('  ⚠️  Para o reset acontecer, João precisaria:');
console.log('      • Ter performance consistentemente baixa por várias sessões');
console.log('      • Ou estar com acurácia já próxima de 40% antes da sessão ruim');
console.log();

console.log('✅ ISSO É BOM porque:\n');
console.log('  • Protege contra "dias ruins" ocasionais');
console.log('  • Foca na performance de longo prazo');
console.log('  • Reseta apenas quando há evidência consistente de não-domínio');
console.log();
