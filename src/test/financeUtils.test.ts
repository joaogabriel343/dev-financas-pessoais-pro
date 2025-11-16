import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  calculateBalance,
  calculatePercentage,
  isOverBudget,
  isWarningBudget,
  validateTransactionAmount,
  formatMonth,
  calculateGoalProgress,
  getDaysUntilDeadline,
  categorizeTransactionsByMonth,
} from '../utils/financeUtils';

describe('Testes Unitários - Sistema de Finanças Pessoais', () => {
  describe('Caso de Teste 1: formatCurrency - Formatação de moeda', () => {
    it('deve formatar valor positivo corretamente em BRL', () => {
      const input = 1234.56;
      const expected = 'R$ 1.234,56';
      const result = formatCurrency(input);
      expect(result).toBe(expected);
    });

    it('deve formatar valor zero', () => {
      const input = 0;
      const expected = 'R$ 0,00';
      const result = formatCurrency(input);
      expect(result).toBe(expected);
    });

    it('deve formatar valor negativo', () => {
      const input = -500.75;
      const expected = '-R$ 500,75';
      const result = formatCurrency(input);
      expect(result).toBe(expected);
    });
  });

  describe('Caso de Teste 2: calculateBalance - Cálculo de saldo', () => {
    it('deve calcular saldo positivo quando receita > despesa', () => {
      const income = 5000;
      const expenses = 3000;
      const expected = 2000;
      const result = calculateBalance(income, expenses);
      expect(result).toBe(expected);
    });

    it('deve calcular saldo negativo quando despesa > receita', () => {
      const income = 2000;
      const expenses = 3500;
      const expected = -1500;
      const result = calculateBalance(income, expenses);
      expect(result).toBe(expected);
    });

    it('deve retornar zero quando receita = despesa', () => {
      const income = 1000;
      const expenses = 1000;
      const expected = 0;
      const result = calculateBalance(income, expenses);
      expect(result).toBe(expected);
    });
  });

  describe('Caso de Teste 3: calculatePercentage - Cálculo de percentual', () => {
    it('deve calcular percentual corretamente', () => {
      const value = 75;
      const total = 100;
      const expected = 75;
      const result = calculatePercentage(value, total);
      expect(result).toBe(expected);
    });

    it('deve retornar 0 quando total é zero (evitar divisão por zero)', () => {
      const value = 50;
      const total = 0;
      const expected = 0;
      const result = calculatePercentage(value, total);
      expect(result).toBe(expected);
    });

    it('deve calcular percentual maior que 100', () => {
      const value = 150;
      const total = 100;
      const expected = 150;
      const result = calculatePercentage(value, total);
      expect(result).toBe(expected);
    });
  });

  describe('Caso de Teste 4: isOverBudget - Verificação de orçamento estourado', () => {
    it('deve retornar true quando gasto excede o limite', () => {
      const spent = 1200;
      const limit = 1000;
      const result = isOverBudget(spent, limit);
      expect(result).toBe(true);
    });

    it('deve retornar false quando gasto está dentro do limite', () => {
      const spent = 800;
      const limit = 1000;
      const result = isOverBudget(spent, limit);
      expect(result).toBe(false);
    });

    it('deve retornar false quando gasto é igual ao limite', () => {
      const spent = 1000;
      const limit = 1000;
      const result = isOverBudget(spent, limit);
      expect(result).toBe(false);
    });
  });

  describe('Caso de Teste 5: isWarningBudget - Verificação de alerta de orçamento', () => {
    it('deve retornar true quando gasto está entre 80% e 100%', () => {
      const spent = 900;
      const limit = 1000;
      const result = isWarningBudget(spent, limit);
      expect(result).toBe(true);
    });

    it('deve retornar false quando gasto está abaixo de 80%', () => {
      const spent = 700;
      const limit = 1000;
      const result = isWarningBudget(spent, limit);
      expect(result).toBe(false);
    });

    it('deve retornar false quando gasto excede 100%', () => {
      const spent = 1100;
      const limit = 1000;
      const result = isWarningBudget(spent, limit);
      expect(result).toBe(false);
    });
  });

  describe('Caso de Teste 6: validateTransactionAmount - Validação de valor de transação', () => {
    it('deve validar valor positivo válido', () => {
      const amount = 150.50;
      const result = validateTransactionAmount(amount);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('deve rejeitar valor zero', () => {
      const amount = 0;
      const result = validateTransactionAmount(amount);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valor deve ser maior que zero');
    });

    it('deve rejeitar valor negativo', () => {
      const amount = -100;
      const result = validateTransactionAmount(amount);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valor deve ser maior que zero');
    });

    it('deve rejeitar valor inválido (NaN)', () => {
      const amount = NaN;
      const result = validateTransactionAmount(amount);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valor inválido');
    });

    it('deve rejeitar valor muito alto', () => {
      const amount = 1000000000;
      const result = validateTransactionAmount(amount);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Valor muito alto');
    });
  });

  describe('Caso de Teste 7: calculateGoalProgress - Cálculo de progresso de meta', () => {
    it('deve calcular progresso corretamente', () => {
      const current = 7500;
      const target = 10000;
      const expected = 75;
      const result = calculateGoalProgress(current, target);
      expect(result).toBe(expected);
    });

    it('deve retornar 100 quando meta é atingida', () => {
      const current = 10000;
      const target = 10000;
      const expected = 100;
      const result = calculateGoalProgress(current, target);
      expect(result).toBe(expected);
    });

    it('deve limitar em 100% mesmo quando excede a meta', () => {
      const current = 12000;
      const target = 10000;
      const expected = 100;
      const result = calculateGoalProgress(current, target);
      expect(result).toBe(expected);
    });

    it('deve retornar 0 quando meta é zero', () => {
      const current = 5000;
      const target = 0;
      const expected = 0;
      const result = calculateGoalProgress(current, target);
      expect(result).toBe(expected);
    });
  });

  describe('Caso de Teste 8: categorizeTransactionsByMonth - Categorização por mês', () => {
    it('deve categorizar transações por mês corretamente', () => {
      const transactions = [
        { date: '2025-11-01', amount: 5000, type: 'income' as const },
        { date: '2025-11-05', amount: 1500, type: 'expense' as const },
        { date: '2025-11-10', amount: 800, type: 'expense' as const },
        { date: '2025-10-01', amount: 4500, type: 'income' as const },
        { date: '2025-10-15', amount: 2000, type: 'expense' as const },
      ];

      const result = categorizeTransactionsByMonth(transactions);

      expect(result['2025-11'].income).toBe(5000);
      expect(result['2025-11'].expense).toBe(2300);
      expect(result['2025-10'].income).toBe(4500);
      expect(result['2025-10'].expense).toBe(2000);
    });

    it('deve lidar com array vazio', () => {
      const transactions: Array<{ date: string; amount: number; type: 'income' | 'expense' }> = [];
      const result = categorizeTransactionsByMonth(transactions);
      expect(Object.keys(result).length).toBe(0);
    });

    it('deve somar múltiplas transações do mesmo tipo no mesmo mês', () => {
      const transactions = [
        { date: '2025-11-01', amount: 1000, type: 'expense' as const },
        { date: '2025-11-05', amount: 2000, type: 'expense' as const },
        { date: '2025-11-10', amount: 1500, type: 'expense' as const },
      ];

      const result = categorizeTransactionsByMonth(transactions);

      expect(result['2025-11'].expense).toBe(4500);
      expect(result['2025-11'].income).toBe(0);
    });
  });

  describe('Caso de Teste 9: parseCurrency - Parse de string de moeda', () => {
    it('deve converter string formatada em número', () => {
      const input = 'R$ 1.234,56';
      const expected = 1234.56;
      const result = parseCurrency(input);
      expect(result).toBeCloseTo(expected, 2);
    });

    it('deve retornar 0 para string vazia', () => {
      const input = '';
      const expected = 0;
      const result = parseCurrency(input);
      expect(result).toBe(expected);
    });

    it('deve lidar com valor sem formatação', () => {
      const input = '500.75';
      const expected = 500.75;
      const result = parseCurrency(input);
      expect(result).toBeCloseTo(expected, 2);
    });
  });

  describe('Caso de Teste 10: getDaysUntilDeadline - Dias até prazo', () => {
    it('deve calcular dias restantes até deadline futuro', () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      const deadline = futureDate.toISOString().split('T')[0];

      const result = getDaysUntilDeadline(deadline);
      expect(result).toBeGreaterThanOrEqual(29);
      expect(result).toBeLessThanOrEqual(31);
    });

    it('deve retornar número negativo para deadline passado', () => {
      const pastDate = '2020-01-01';
      const result = getDaysUntilDeadline(pastDate);
      expect(result).toBeLessThan(0);
    });
  });
});
