import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { createCategory, listCategories, deleteCategory } from '../lib/categorias';
import { createAccount, listAccounts, deleteAccount } from '../lib/accounts';
import { createTransaction, listTransactions, deleteTransaction } from '../lib/transactions';
import { upsertBudget, listBudgets, startOfMonthISO } from '../lib/budgets';
import { createGoal, listGoals, deleteGoal } from '../lib/goals';

// 15 Testes de Integração com Dados Reais (Supabase)
describe('Integração - Sistema Financeiro (15 casos com banco real)', () => {
  let testUserId: string;
  const createdIds = {
    categories: [] as number[],
    accounts: [] as number[],
    transactions: [] as number[],
    budgets: [] as number[],
    goals: [] as number[],
  };

  beforeAll(async () => {
    // Cria usuário de teste real no Supabase
    const { data, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@integration.test`,
      password: 'TestPass123!',
    });

    if (error && !error.message.includes('already registered')) {
      throw error;
    }
    testUserId = data.user?.id || '';
    expect(testUserId).toBeTruthy();
  });

  afterAll(async () => {
    // Limpa todos os dados criados durante os testes
    for (const id of createdIds.goals) {
      try { await deleteGoal(id); } catch {}
    }
    for (const id of createdIds.transactions) {
      try { await deleteTransaction(id); } catch {}
    }
    for (const id of createdIds.budgets) {
      try { await supabase.from('budgets').delete().eq('id', id); } catch {}
    }
    for (const id of createdIds.accounts) {
      try { await deleteAccount(id); } catch {}
    }
    for (const id of createdIds.categories) {
      try { await deleteCategory(id); } catch {}
    }
    await supabase.auth.signOut();
  });

  // 1. Criar categoria de receita
  it('1. Cria categoria de receita no banco real', async () => {
    const cat = await createCategory({
      name: `Salário Teste ${Date.now()}`,
      type: 'income',
      user_id: testUserId,
    });

    expect(cat.id).toBeDefined();
    expect(cat.name).toContain('Salário');
    expect(cat.type).toBe('income');
    createdIds.categories.push(cat.id);
  });

  // 2. Criar categoria de despesa
  it('2. Cria categoria de despesa no banco real', async () => {
    const cat = await createCategory({
      name: `Alimentação Teste ${Date.now()}`,
      type: 'expense',
      user_id: testUserId,
    });

    expect(cat.type).toBe('expense');
    createdIds.categories.push(cat.id);
  });

  // 3. Listar categorias do usuário
  it('3. Lista categorias do usuário no banco real', async () => {
    const list = await listCategories(testUserId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  // 4. Criar conta bancária
  it('4. Cria conta bancária no banco real', async () => {
    const acc = await createAccount({
      user_id: testUserId,
      name: `Banco Teste ${Date.now()}`,
      type: 'bank',
      balance: 5000,
      icon: '🏦',
    });

    expect(acc.id).toBeDefined();
    expect(acc.type).toBe('bank');
    expect(acc.balance).toBe(5000);
    createdIds.accounts.push(acc.id);
  });

  // 5. Criar conta em dinheiro
  it('5. Cria conta em dinheiro no banco real', async () => {
    const acc = await createAccount({
      user_id: testUserId,
      name: `Carteira Teste ${Date.now()}`,
      type: 'cash',
      balance: 300.50,
    });

    expect(acc.type).toBe('cash');
    expect(acc.balance).toBeCloseTo(300.50, 2);
    createdIds.accounts.push(acc.id);
  });

  // 6. Listar contas do usuário
  it('6. Lista contas do usuário no banco real', async () => {
    const list = await listAccounts(testUserId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  // 7. Criar transação de despesa
  it('7. Cria transação de despesa no banco real', async () => {
    // Precisa de categoria e conta
    const cat = createdIds.categories[0] || (await createCategory({ name: 'Cat Temp', type: 'expense', user_id: testUserId })).id;
    const acc = createdIds.accounts[0] || (await createAccount({ user_id: testUserId, name: 'Acc Temp', type: 'bank', balance: 1000 })).id;
    
    if (!createdIds.categories.includes(cat)) createdIds.categories.push(cat);
    if (!createdIds.accounts.includes(acc)) createdIds.accounts.push(acc);

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: testUserId,
        type: 'expense',
        amount: 150.75,
        date: '2025-11-17',
        description: 'Teste Supermercado',
        category_id: cat,
        account_id: acc,
      }])
      .select('id')
      .single();

    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
    createdIds.transactions.push(data!.id);
  });

  // 8. Criar transação de receita
  it('8. Cria transação de receita no banco real', async () => {
    const cat = createdIds.categories[0] || (await createCategory({ name: 'Cat Inc', type: 'income', user_id: testUserId })).id;
    const acc = createdIds.accounts[0] || (await createAccount({ user_id: testUserId, name: 'Acc Inc', type: 'bank', balance: 1000 })).id;

    if (!createdIds.categories.includes(cat)) createdIds.categories.push(cat);
    if (!createdIds.accounts.includes(acc)) createdIds.accounts.push(acc);

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: testUserId,
        type: 'income',
        amount: 5000,
        date: '2025-11-01',
        description: 'Salário',
        category_id: cat,
        account_id: acc,
      }])
      .select('id')
      .single();

    expect(error).toBeNull();
    createdIds.transactions.push(data!.id);
  });

  // 9. Listar transações com joins
  it('9. Lista transações com nomes de categoria e conta (JOIN)', async () => {
    const list = await listTransactions(testUserId);
    expect(Array.isArray(list)).toBe(true);
    if (list.length > 0) {
      expect(list[0].category_name).toBeDefined();
      expect(list[0].account_name).toBeDefined();
    }
  });

  // 10. Criar orçamento (upsert)
  it('10. Cria orçamento no banco real (upsert)', async () => {
    const cat = createdIds.categories[0] || (await createCategory({ name: 'Cat Budget', type: 'expense', user_id: testUserId })).id;
    if (!createdIds.categories.includes(cat)) createdIds.categories.push(cat);

    const month = startOfMonthISO(new Date());
    const budget = await upsertBudget({
      user_id: testUserId,
      category_id: cat,
      month,
      limit_amount: 1000,
    });

    expect(budget.id).toBeDefined();
    expect(budget.limit_amount).toBe(1000);
    createdIds.budgets.push(budget.id);
  });

  // 11. Atualizar orçamento existente (upsert mesma chave)
  it('11. Atualiza orçamento existente (upsert)', async () => {
    const cat = createdIds.categories[0];
    const month = '2025-12-01';

    const b1 = await upsertBudget({
      user_id: testUserId,
      category_id: cat,
      month,
      limit_amount: 500,
    });
    createdIds.budgets.push(b1.id);

    const b2 = await upsertBudget({
      user_id: testUserId,
      category_id: cat,
      month,
      limit_amount: 1500,
    });

    expect(b2.limit_amount).toBe(1500);
  });

  // 12. Listar orçamentos
  it('12. Lista orçamentos do usuário no banco real', async () => {
    const list = await listBudgets(testUserId);
    expect(Array.isArray(list)).toBe(true);
    if (list.length > 0) {
      expect(list[0].category_name).toBeDefined();
    }
  });

  // 13. Criar meta financeira
  it('13. Cria meta financeira no banco real', async () => {
    const goal = await createGoal({
      user_id: testUserId,
      name: `Meta Teste ${Date.now()}`,
      target_amount: 10000,
      current_amount: 2000,
      deadline: '2026-12-31',
    });

    expect(goal.id).toBeDefined();
    expect(goal.target_amount).toBe(10000);
    expect(goal.current_amount).toBe(2000);
    createdIds.goals.push(goal.id);
  });

  // 14. Listar metas
  it('14. Lista metas do usuário no banco real', async () => {
    const list = await listGoals(testUserId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  // 15. Deletar categoria
  it('15. Deleta categoria no banco real', async () => {
    const cat = await createCategory({
      name: `Para Deletar ${Date.now()}`,
      type: 'expense',
      user_id: testUserId,
    });

    await expect(deleteCategory(cat.id)).resolves.not.toThrow();

    const list = await listCategories(testUserId);
    expect(list.some(c => c.id === cat.id)).toBe(false);
  });
});
