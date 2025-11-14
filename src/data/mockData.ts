export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description: string;
  categoryId: string;
  accountId: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'investment';
  balance: number;
  icon: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limit: number;
  spent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  theme: 'light' | 'dark';
}

export const mockCategories: Category[] = [
  { id: '1', name: 'Salário', type: 'income', icon: 'Wallet', color: '#10B981' },
  { id: '2', name: 'Freelance', type: 'income', icon: 'Briefcase', color: '#10B981' },
  { id: '3', name: 'Investimentos', type: 'income', icon: 'TrendingUp', color: '#10B981' },
  { id: '4', name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: '5', name: 'Transporte', type: 'expense', icon: 'Car', color: '#EF4444' },
  { id: '6', name: 'Moradia', type: 'expense', icon: 'Home', color: '#EF4444' },
  { id: '7', name: 'Lazer', type: 'expense', icon: 'Gamepad2', color: '#EF4444' },
  { id: '8', name: 'Saúde', type: 'expense', icon: 'Heart', color: '#EF4444' },
  { id: '9', name: 'Educação', type: 'expense', icon: 'GraduationCap', color: '#EF4444' },
  { id: '10', name: 'Compras', type: 'expense', icon: 'ShoppingBag', color: '#EF4444' },
];

export const mockAccounts: Account[] = [
  { id: '1', name: 'Banco Principal', type: 'bank', balance: 5420.50, icon: 'Building2' },
  { id: '2', name: 'Carteira', type: 'cash', balance: 230.00, icon: 'Wallet' },
  { id: '3', name: 'Investimentos', type: 'investment', balance: 12500.00, icon: 'TrendingUp' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 4500.00, date: '2025-11-01', description: 'Salário Novembro', categoryId: '1', accountId: '1' },
  { id: '2', type: 'expense', amount: 350.00, date: '2025-11-03', description: 'Compras Supermercado', categoryId: '4', accountId: '1' },
  { id: '3', type: 'expense', amount: 120.00, date: '2025-11-05', description: 'Combustível', categoryId: '5', accountId: '2' },
  { id: '4', type: 'income', amount: 800.00, date: '2025-11-07', description: 'Projeto Freelance', categoryId: '2', accountId: '1' },
  { id: '5', type: 'expense', amount: 1200.00, date: '2025-11-10', description: 'Aluguel', categoryId: '6', accountId: '1' },
  { id: '6', type: 'expense', amount: 85.00, date: '2025-11-12', description: 'Cinema', categoryId: '7', accountId: '2' },
  { id: '7', type: 'expense', amount: 200.00, date: '2025-11-13', description: 'Academia', categoryId: '8', accountId: '1' },
  { id: '8', type: 'expense', amount: 450.00, date: '2025-11-13', description: 'Curso Online', categoryId: '9', accountId: '1' },
];

export const mockGoals: Goal[] = [
  { id: '1', name: 'Reserva de Emergência', targetAmount: 20000, currentAmount: 12500, deadline: '2026-12-31', icon: 'Shield' },
  { id: '2', name: 'Viagem Europa', targetAmount: 15000, currentAmount: 5800, deadline: '2026-06-30', icon: 'Plane' },
  { id: '3', name: 'Carro Novo', targetAmount: 50000, currentAmount: 18000, deadline: '2027-12-31', icon: 'Car' },
];

export const mockBudgets: Budget[] = [
  { id: '1', categoryId: '4', month: '2025-11', limit: 800, spent: 350 },
  { id: '2', categoryId: '5', month: '2025-11', limit: 400, spent: 120 },
  { id: '3', categoryId: '6', month: '2025-11', limit: 1200, spent: 1200 },
  { id: '4', categoryId: '7', month: '2025-11', limit: 300, spent: 85 },
  { id: '5', categoryId: '8', month: '2025-11', limit: 500, spent: 200 },
];

export const mockUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao.silva@email.com',
  currency: 'BRL',
  theme: 'light',
};
