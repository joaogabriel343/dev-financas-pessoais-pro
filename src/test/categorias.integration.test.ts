import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../lib/supabase';
import { listCategories, createCategory, deleteCategory } from '../lib/categorias';

const testCategoryIds: number[] = [];
let testUserId: string;

describe('Testes de Integração - Categorias (Banco Real)', () => {
  beforeAll(async () => {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: `test-${Date.now()}@teste.com`,
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
    for (const id of testCategoryIds) {
      try {
        await deleteCategory(id);
      } catch (error) {
        console.log(`Erro ao limpar categoria ${id}:`, error);
      }
    }

    await supabase.auth.signOut();
  });

  describe('Caso de Teste 1: Criar Categoria', () => {
    it('deve criar uma categoria de receita', async () => {
      const newCategory = await createCategory({
        name: `Salário Teste ${Date.now()}`,
        type: 'income',
        user_id: testUserId,
      });

      expect(newCategory).toBeDefined();
      expect(newCategory.id).toBeDefined();
      expect(newCategory.name).toContain('Salário Teste');
      expect(newCategory.type).toBe('income');
      expect(newCategory.user_id).toBe(testUserId);

      testCategoryIds.push(newCategory.id);
    });

    it('deve criar uma categoria de despesa', async () => {
      const newCategory = await createCategory({
        name: `Alimentação Teste ${Date.now()}`,
        type: 'expense',
        user_id: testUserId,
      });

      expect(newCategory).toBeDefined();
      expect(newCategory.type).toBe('expense');

      testCategoryIds.push(newCategory.id);
    });
  });

  describe('Caso de Teste 2: Listar Categorias', () => {
    it('deve listar categorias do usuário', async () => {
      const category = await createCategory({
        name: `Transporte Teste ${Date.now()}`,
        type: 'expense',
        user_id: testUserId,
      });
      testCategoryIds.push(category.id);

      const categories = await listCategories(testUserId);

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some(c => c.id === category.id)).toBe(true);
    });

    it('deve retornar array vazio para usuário com UUID válido mas sem categorias', async () => {

      const fakeUuid = '00000000-0000-0000-0000-000000000000';
      const categories = await listCategories(fakeUuid);
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(0);
    });
  });

  describe('Caso de Teste 3: Deletar Categoria', () => {
    it('deve deletar uma categoria existente', async () => {

      const category = await createCategory({
        name: `Para Deletar ${Date.now()}`,
        type: 'income',
        user_id: testUserId,
      });

      await expect(deleteCategory(category.id)).resolves.not.toThrow();

      const categories = await listCategories(testUserId);
      expect(categories.some(c => c.id === category.id)).toBe(false);
    });
  });
});
