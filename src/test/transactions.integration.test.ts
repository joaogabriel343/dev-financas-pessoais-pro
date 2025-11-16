import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from '../lib/transactions';
import { createCategory, deleteCategory } from '../lib/categorias';
import { createAccount, deleteAccount } from '../lib/accounts';

const testTransactionIds: number[] = [];
const testCategoryIds: number[] = [];
const testAccountIds: number[] = [];
let testUserId: string;
let testCategoryId: number;
let testAccountId: number;

describe('Testes de Integração - Transações (Banco Real)', () => {
  beforeAll(async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-transactions-${Date.now()}@teste.com`,
      password: 'Test123456!',
    });

    if (error && !error.message.includes('already registered')) {
      const { data: { user: existingUser } } = await supabase.auth.signInWithPassword({
        email: 'test@teste.com',
        password: 'Test123456!',
      });
      testUserId = existingUser?.id || 'test-user-id';
    } else {
      testUserId = user?.id || 'test-user-id';
    }

    const category = await createCategory({
      name: `Categoria Teste ${Date.now()}`,
      type: 'expense',
      user_id: testUserId,
    });
    testCategoryId = category.id;
    testCategoryIds.push(category.id);

    const account = await createAccount({
      user_id: testUserId,
      name: `Conta Teste ${Date.now()}`,
      type: 'bank',
      balance: 10000,
    });
    testAccountId = account.id;
    testAccountIds.push(account.id);
  });

  afterAll(async () => {
    for (const id of testTransactionIds) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.log(`Erro ao limpar transação ${id}:`, error);
      }
    }

    for (const id of testAccountIds) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.log(`Erro ao limpar conta ${id}:`, error);
      }
    }

    for (const id of testCategoryIds) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.log(`Erro ao limpar categoria ${id}:`, error);
      }
    }

    await supabase.auth.signOut();
  });

  describe('Caso de Teste 8: Criar Transação', () => {
    it('deve criar uma transação de despesa', async () => {
      const newTransaction = await createTransaction({
        type: 'expense',
        amount: 150.50,
        date: '2025-11-15',
        description: 'Supermercado Teste',
        category_id: testCategoryId,
        account_id: testAccountId,
        user_id: testUserId,
      });

      expect(newTransaction).toBeDefined();
      expect(newTransaction.id).toBeDefined();
      expect(newTransaction.type).toBe('expense');
      expect(parseFloat(String(newTransaction.amount))).toBe(150.50);

      testTransactionIds.push(newTransaction.id);
    });

    it('deve criar uma transação de receita', async () => {
      const incomeCategory = await createCategory({
        name: `Receita Teste ${Date.now()}`,
        type: 'income',
        user_id: testUserId,
      });
      testCategoryIds.push(incomeCategory.id);

      const newTransaction = await createTransaction({
        type: 'income',
        amount: 5000,
        date: '2025-11-15',
        description: 'Salário Teste',
        category_id: incomeCategory.id,
        account_id: testAccountId,
        user_id: testUserId,
      });

      expect(newTransaction.type).toBe('income');
      expect(parseFloat(String(newTransaction.amount))).toBe(5000);

      testTransactionIds.push(newTransaction.id);
    });
  });

  describe('Caso de Teste 9: Listar Transações', () => {
    it('deve listar transações do usuário', async () => {
      const transaction = await createTransaction({
        type: 'expense',
        amount: 200,
        date: '2025-11-15',
        description: 'Teste Lista',
        category_id: testCategoryId,
        account_id: testAccountId,
        user_id: testUserId,
      });
      testTransactionIds.push(transaction.id);

      const transactions = await listTransactions(testUserId);

      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions.some(t => t.id === transaction.id)).toBe(true);

      const found = transactions.find(t => t.id === transaction.id);
      expect(found?.category_name).toBeDefined();
      expect(found?.account_name).toBeDefined();
    });

    it('deve retornar array vazio para usuário com UUID válido mas sem transações', async () => {
      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const transactions = await listTransactions(fakeUuid);
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBe(0);
    });
  });

  describe('Caso de Teste 10: Atualizar Transação', () => {
    it('deve atualizar os dados de uma transação', async () => {
      const transaction = await createTransaction({
        type: 'expense',
        amount: 100,
        date: '2025-11-15',
        description: 'Original',
        category_id: testCategoryId,
        account_id: testAccountId,
        user_id: testUserId,
      });
      testTransactionIds.push(transaction.id);

      const updated = await updateTransaction({
        id: transaction.id,
        type: 'expense',
        amount: 250,
        date: '2025-11-16',
        description: 'Atualizado',
        category_id: testCategoryId,
        account_id: testAccountId,
      });

      expect(updated.description).toBe('Atualizado');
      expect(parseFloat(String(updated.amount))).toBe(250);
      expect(updated.date).toBe('2025-11-16');
    });
  });

  describe('Caso de Teste 11: Deletar Transação', () => {
    it('deve deletar uma transação existente', async () => {
      const transaction = await createTransaction({
        type: 'expense',
        amount: 50,
        date: '2025-11-15',
        description: 'Para Deletar',
        category_id: testCategoryId,
        account_id: testAccountId,
        user_id: testUserId,
      });

      await expect(deleteTransaction(transaction.id)).resolves.not.toThrow();

      const transactions = await listTransactions(testUserId);
      expect(transactions.some(t => t.id === transaction.id)).toBe(false);
    });
  });
});
