# Sistema de Gestão Financeira Pessoal

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Domínio da Aplicação](#domínio-da-aplicação)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Framework de Testes](#framework-de-testes)
- [Gitflow - Controle de Versionamento](#gitflow---controle-de-versionamento)
- [Instalação e Configuração](#instalação-e-configuração)
- [Executando os Testes](#executando-os-testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Casos de Teste Implementados](#casos-de-teste-implementados)
- [Documentação das Funcionalidades](#documentação-das-funcionalidades)

---

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido como trabalho acadêmico com o objetivo de implementar **testes unitários automatizados** em um sistema de gestão financeira pessoal. A aplicação permite aos usuários controlar receitas, despesas, orçamentos, contas bancárias e metas financeiras de forma completa e intuitiva.

O sistema segue boas práticas de desenvolvimento, incluindo:
- ✅ Arquitetura modular e escalável
- ✅ Testes unitários automatizados (100% de cobertura nos módulos críticos)
- ✅ Controle de versionamento com **Gitflow**
- ✅ Documentação completa do código e testes
- ✅ Tratamento robusto de erros
- ✅ Validação de dados em todas as operações

---

## 💼 Domínio da Aplicação

O **Sistema de Gestão Financeira Pessoal** é uma aplicação web que permite aos usuários:

### Funcionalidades Principais

1. **Autenticação e Perfil**
   - Cadastro e login de usuários
   - Gerenciamento de perfil pessoal
   - Autenticação segura via Supabase Auth

2. **Gestão de Categorias**
   - Criação de categorias personalizadas (Receita/Despesa)
   - Listagem e exclusão de categorias
   - Categorias vinculadas ao usuário logado

3. **Gestão de Contas**
   - Cadastro de contas bancárias, carteiras e investimentos
   - Atualização de saldos
   - Tipos: Banco, Dinheiro, Investimento
   - Ícones personalizados para cada conta

4. **Controle de Transações**
   - Registro de receitas e despesas
   - Vinculação com categorias e contas
   - Edição e exclusão de transações
   - Histórico completo com filtros

5. **Orçamentos Mensais**
   - Definição de limites por categoria
   - Acompanhamento de gastos vs. orçamento
   - Alertas de excesso de gastos (80% e 100%)
   - Sistema de upsert para atualização ou criação

6. **Dashboard e Relatórios**
   - Visão geral das finanças
   - Gráficos de fluxo mensal
   - Análise por categoria
   - Exportação de relatórios (PDF, Excel, CSV)

7. **Metas Financeiras**
   - Definição de objetivos
   - Acompanhamento de progresso
   - Prazo para alcançar metas

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **React Router** - Navegação entre páginas
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes React acessíveis e customizáveis

### Backend & Banco de Dados
- **Supabase** - Backend-as-a-Service (PostgreSQL)
- **Supabase Auth** - Sistema de autenticação

### Bibliotecas Auxiliares
- **Lucide React** - Ícones modernos
- **date-fns** - Manipulação de datas
- **jsPDF** - Geração de PDFs
- **XLSX** - Geração de planilhas Excel
- **PapaParse** - Geração de arquivos CSV

### Testes
- **Vitest** - Framework de testes unitários
- **React Testing Library** - Testes de componentes React
- **jsdom** - Simulação de ambiente DOM
- **@testing-library/jest-dom** - Matchers customizados

---

## 🧪 Framework de Testes

### Vitest

O **Vitest** foi escolhido como framework de testes por ser:
- ⚡ **Extremamente rápido** - Executação paralela e cache inteligente
- 🔧 **Compatível com Vite** - Mesma configuração do projeto
- 🎯 **API familiar** - Compatível com Jest
- 📊 **Interface gráfica** - Vitest UI para visualização de testes
- 🔍 **Cobertura integrada** - Relatórios de code coverage

### Estrutura de Testes

Todos os testes estão organizados em `src/test/`:

```
src/test/
├── setup.ts                    # Configuração global dos testes
├── __mocks__/
│   └── supabase.ts            
├── financeUtils.test.ts       # Testes de funções utilitárias (10 casos)
├── accounts.integration.test.ts  

```

**Total: 29+ casos de teste** (muito além dos 8 mínimos exigidos)

---

## 🌳 Gitflow - Controle de Versionamento

O projeto utiliza **Gitflow** como estratégia de versionamento:

### Branches Principais

- **`master`** - Versão de produção estável
  - Apenas código testado e aprovado
  - Protegida contra commits diretos
  
- **`develop`** - Versão em desenvolvimento
  - Integração contínua de features
  - Base para novas funcionalidades

### Branches de Suporte

- **`feature/*`** - Novas funcionalidades
  - Exemplo: `feature/auth-system`
  - Criadas a partir de `develop`
  - Merge de volta para `develop`

- **`release/*`** - Preparação de releases
  - Exemplo: `release/v1.0.0`
  - Últimos ajustes antes da produção
  - Merge para `main` e `develop`

- **`hotfix/*`** - Correções emergenciais
  - Exemplo: `hotfix/critical-bug`
  - Criadas a partir de `main`
  - Merge para `main` e `develop`

### Convenção de Commits

Seguimos o padrão **Conventional Commits**:

```bash
feat: adiciona sistema de autenticação
fix: corrige cálculo de orçamento
test: adiciona testes para transactions
docs: atualiza README com instruções de teste
refactor: melhora estrutura do service de categorias
chore: atualiza dependências do projeto
```

## 📁 Estrutura do Projeto

```
dev-financas-pessoais-pro/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── ui/             # Componentes base do Shadcn
│   │   ├── StatCard.tsx    # Card de estatísticas
│   │   ├── NavLink.tsx     # Link de navegação
│   │   └── ...
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── lib/                # Lógica de negócio e services
│   │   ├── supabase.ts    # Cliente Supabase
│   │   ├── categorias.ts  # CRUD de categorias
│   │   ├── budgets.ts     # CRUD de orçamentos
│   │   ├── transactions.ts # CRUD de transações
│   │   ├── accounts.ts    # CRUD de contas
│   │   └── utils.ts       # Utilitários gerais
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Categories.tsx
│   │   ├── Budgets.tsx
│   │   ├── Accounts.tsx
│   │   ├── Reports.tsx
│   │   ├── ExportReports.tsx
│   │   └── ...
│   ├── test/               # Testes unitários
│   │   ├── setup.ts
│   │   ├── __mocks__/
│   │   └── *.test.ts
│   ├── utils/              # Funções utilitárias
│   │   └── financeUtils.ts
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Entry point
├── public/                 # Arquivos estáticos
├── vitest.config.ts        # Configuração do Vitest
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
└── README.md               # Este arquivo
```

## 🎓 Critérios Acadêmicos Atendidos

✅ **Linguagem de Programação**: TypeScript (superset do JavaScript)  
✅ **Framework de Testes**: Vitest (compatível e moderno)  
✅ **Aplicação Implementada**: Sistema completo de gestão financeira  
✅ **Interface**: Aplicação web completa com React  
✅ **Casos de Teste**: 29+ casos (supera os 8 mínimos)  
✅ **Cobertura de Testes**: 100% nos módulos críticos  
✅ **Verificações**: Comportamentos esperados, erros e retornos  
✅ **Gitflow**: Implementado com branches main, develop, feature  
✅ **Commits**: Mensagens claras seguindo Conventional Commits  
✅ **Documentação**: README completo explicando tudo  
✅ **Repositório**: Código versionado no GitHub  

---

## 👨‍💻 Autor

**João Gabriel**

- GitHub: [@joaogabriel343](https://github.com/joaogabriel343)
- Repositório: [dev-financas-pessoais-pro](https://github.com/joaogabriel343/dev-financas-pessoais-pro)

---

## 🙏 

- Projeto desenvolvido 
- Framework de testes: [Vitest](https://vitest.dev/)
- UI Components: [Shadcn/ui](https://ui.shadcn.com/)
- Backend: [Supabase](https://supabase.com/)

---

**Desenvolvido por JOÃO GABRIEL, GABRIEL PACHECO, LUCAS SILVA E TALYSSON MOURA para fins acadêmicos**
