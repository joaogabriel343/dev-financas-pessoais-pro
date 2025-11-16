import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { listBudgets, upsertBudget, startOfMonthISO } from '../lib/budgets';
import { createCategory, deleteCategory } from '../lib/categorias';

const testBudgetIds: number[] = [];
const testCategoryIds: number[] = [];
let testUserId: string;
let testCategoryId: number;

describe('Testes de Integração - Orçamentos (Banco Real)', () => {
  beforeAll(async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-budgets-${Date.now()}@teste.com`,
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
      name: `Categoria Budget ${Date.now()}`,
      type: 'expense',
      user_id: testUserId,
    });
    testCategoryId = category.id;
    testCategoryIds.push(category.id);
  });

  afterAll(async () => {
    if (testBudgetIds.length > 0) {
      await supabase.from('budgets').delete().in('id', testBudgetIds);
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

  describe('Caso de Teste 12: Função startOfMonthISO', () => {
    it('deve retornar o primeiro dia do mês em formato ISO', () => {
      const date = new Date(2025, 10, 15); 
      const result = startOfMonthISO(date);
      expect(result).toBe('2025-11-01');
    });

    it('deve funcionar para o último dia do mês', () => {
      const date = new Date(2025, 10, 30);
      const result = startOfMonthISO(date);
      expect(result).toBe('2025-11-01');
    });

    it('deve funcionar quando já é o primeiro dia', () => {
      const date = new Date(2025, 0, 1); 
      const result = startOfMonthISO(date);
      expect(result).toBe('2025-01-01');
    });
  });

  describe('Caso de Teste 13: Criar/Atualizar Orçamento (Upsert)', () => {
    it('deve criar um novo orçamento', async () => {
      const month = startOfMonthISO(new Date());
      const budget = await upsertBudget({
        user_id: testUserId,
        category_id: testCategoryId,
        month: month,
        limit_amount: 1000,
      });

      expect(budget).toBeDefined();
      expect(budget.id).toBeDefined();
      expect(budget.limit_amount).toBe(1000);

      testBudgetIds.push(budget.id);
    });

    it('deve atualizar orçamento existente', async () => {
      const month = '2025-12-01';
      
      // Criar orçamento inicial
      const budget1 = await upsertBudget({
        user_id: testUserId,
        category_id: testCategoryId,
        month: month,
        limit_amount: 500,
      });
      testBudgetIds.push(budget1.id);

      // Atualizar o mesmo orçamento
      const budget2 = await upsertBudget({
        user_id: testUserId,
        category_id: testCategoryId,
        month: month,
        limit_amount: 1500,
      });

      expect(budget2.limit_amount).toBe(1500);
      // Deve ser o mesmo registro (mesmo id ou mesmo mês/categoria)
      expect(budget2.category_id).toBe(testCategoryId);
    });
  });

  describe('Caso de Teste 14: Listar Orçamentos', () => {
    it('deve listar orçamentos do usuário', async () => {
      const month = '2025-10-01';
      const budget = await upsertBudget({
        user_id: testUserId,
        category_id: testCategoryId,
        month: month,
        limit_amount: 800,
      });
      testBudgetIds.push(budget.id);

      const budgets = await listBudgets(testUserId);

      expect(Array.isArray(budgets)).toBe(true);
      expect(budgets.length).toBeGreaterThan(0);
      expect(budgets.some(b => b.id === budget.id)).toBe(true);

      // Verificar se tem nome da categoria
      const found = budgets.find(b => b.id === budget.id);
      expect(found?.category_name).toBeDefined();
    });

    it('deve filtrar orçamentos por mês', async () => {
      const month = '2025-09-01';
      const budget = await upsertBudget({
        user_id: testUserId,
        category_id: testCategoryId,
        month: month,
        limit_amount: 600,
      });
      testBudgetIds.push(budget.id);

      const budgets = await listBudgets(testUserId, month);

      expect(budgets.every(b => b.month === month)).toBe(true);
      expect(budgets.some(b => b.id === budget.id)).toBe(true);
    });
  });
});
