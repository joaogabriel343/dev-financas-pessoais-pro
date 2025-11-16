export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
  return formatted.replace(/\u00A0/g, ' ');
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  if (/^\d+\.?\d*$/.test(value)) {
    return parseFloat(value) || 0;
  }
  const cleanValue = value.replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
}

export function calculateBalance(income: number, expenses: number): number {
  return income - expenses;
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

export function isOverBudget(spent: number, limit: number): boolean {
  return spent > limit;
}

export function isWarningBudget(spent: number, limit: number): boolean {
  const percentage = calculatePercentage(spent, limit);
  return percentage > 80 && percentage <= 100;
}

export function validateTransactionAmount(amount: number): { valid: boolean; error?: string } {
  if (isNaN(amount)) {
    return { valid: false, error: 'Valor inválido' };
  }
  if (amount <= 0) {
    return { valid: false, error: 'Valor deve ser maior que zero' };
  }
  if (amount > 999999999.99) {
    return { valid: false, error: 'Valor muito alto' };
  }
  return { valid: true };
}

export function formatMonth(dateString: string): string {
  try {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function startOfMonthISO(date: Date = new Date()): string {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  return d.toISOString().split('T')[0];
}

export function calculateGoalProgress(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function categorizeTransactionsByMonth(transactions: Array<{ date: string; amount: number; type: 'income' | 'expense' }>): Record<string, { income: number; expense: number }> {
  return transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expense += t.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);
}
