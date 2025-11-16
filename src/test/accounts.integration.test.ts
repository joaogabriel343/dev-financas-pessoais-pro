import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { listAccounts, createAccount, updateAccount, deleteAccount } from '../lib/accounts';

const testAccountIds: number[] = [];
let testUserId: string;

describe('Testes de Integração - Contas (Banco Real)', () => {
  beforeAll(async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-accounts-${Date.now()}@teste.com`,
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
  });

  afterAll(async () => {
    for (const id of testAccountIds) {
      try {
        await deleteAccount(id);
      } catch (error) {
        console.log(`Erro ao limpar conta ${id}:`, error);
      }
    }
    await supabase.auth.signOut();
  });

  describe('Caso de Teste 4: Criar Conta', () => {
    it('deve criar uma conta bancária', async () => {
      const newAccount = await createAccount({
        user_id: testUserId,
        name: `Banco Teste ${Date.now()}`,
        type: 'bank',
        balance: 1000,
        icon: '🏦',
      });

      expect(newAccount).toBeDefined();
      expect(newAccount.id).toBeDefined();
      expect(newAccount.type).toBe('bank');
      expect(newAccount.balance).toBe(1000);

      testAccountIds.push(newAccount.id);
    });

    it('deve criar uma conta em dinheiro', async () => {
      const newAccount = await createAccount({
        user_id: testUserId,
        name: `Carteira Teste ${Date.now()}`,
        type: 'cash',
        balance: 500.50,
      });

      expect(newAccount.type).toBe('cash');
      expect(newAccount.balance).toBe(500.50);

      testAccountIds.push(newAccount.id);
    });

    it('deve criar uma conta de investimento', async () => {
      const newAccount = await createAccount({
        user_id: testUserId,
        name: `Investimentos Teste ${Date.now()}`,
        type: 'investment',
        balance: 10000,
        icon: '📈',
      });

      expect(newAccount.type).toBe('investment');
      testAccountIds.push(newAccount.id);
    });
  });

  describe('Caso de Teste 5: Listar Contas', () => {
    it('deve listar contas do usuário', async () => {
      const account = await createAccount({
        user_id: testUserId,
        name: `Poupança Teste ${Date.now()}`,
        type: 'bank',
        balance: 2000,
      });
      testAccountIds.push(account.id);

      const accounts = await listAccounts(testUserId);

      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts.some(a => a.id === account.id)).toBe(true);
    });
  });

  describe('Caso de Teste 6: Atualizar Conta', () => {
    it('deve atualizar os dados de uma conta', async () => {
      const account = await createAccount({
        user_id: testUserId,
        name: `Conta Original ${Date.now()}`,
        type: 'bank',
        balance: 1000,
      });
      testAccountIds.push(account.id);

      const updated = await updateAccount({
        id: account.id,
        name: 'Conta Atualizada',
        type: 'investment',
        balance: 5000,
        icon: '💰',
      });

      expect(updated.name).toBe('Conta Atualizada');
      expect(updated.type).toBe('investment');
      expect(updated.balance).toBe(5000);
    });
  });

  describe('Caso de Teste 7: Deletar Conta', () => {
    it('deve deletar uma conta existente', async () => {
      const account = await createAccount({
        user_id: testUserId,
        name: `Para Deletar ${Date.now()}`,
        type: 'cash',
        balance: 100,
      });

      await expect(deleteAccount(account.id)).resolves.not.toThrow();

      const accounts = await listAccounts(testUserId);
      expect(accounts.some(a => a.id === account.id)).toBe(false);
    });
  });
});
