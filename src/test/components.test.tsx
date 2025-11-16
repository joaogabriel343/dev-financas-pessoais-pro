import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { NavLink } from '../components/NavLink';
import { DollarSign, TrendingUp } from 'lucide-react';

describe('Testes Unitários - Componentes React', () => {
  describe('Caso de Teste 25: StatCard - Renderização básica', () => {
    it('deve renderizar título e valor corretamente', () => {
      render(
        <StatCard
          title="Saldo Total"
          value="R$ 10.000,00"
          icon={DollarSign}
        />
      );

      expect(screen.getByText('Saldo Total')).toBeInTheDocument();
      expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument();
    });

    it('deve renderizar com variante success', () => {
      render(
        <StatCard
          title="Receita"
          value="R$ 5.000,00"
          icon={TrendingUp}
          variant="success"
        />
      );

      const title = screen.getByText('Receita');
      expect(title).toBeInTheDocument();
    });

    it('deve renderizar com variante danger', () => {
      render(
        <StatCard
          title="Despesas"
          value="R$ 3.000,00"
          icon={DollarSign}
          variant="danger"
        />
      );

      expect(screen.getByText('Despesas')).toBeInTheDocument();
    });

    it('deve renderizar trend quando fornecido', () => {
      render(
        <StatCard
          title="Saldo"
          value="R$ 2.000,00"
          icon={DollarSign}
          trend="+15% em relação ao mês passado"
        />
      );

      expect(screen.getByText('+15% em relação ao mês passado')).toBeInTheDocument();
    });

    it('não deve renderizar trend quando não fornecido', () => {
      const { container } = render(
        <StatCard
          title="Saldo"
          value="R$ 2.000,00"
          icon={DollarSign}
        />
      );

      const trends = container.querySelectorAll('.text-xs');
      expect(trends.length).toBe(0);
    });
  });

  describe('Caso de Teste 26: NavLink - Navegação', () => {
    it('deve renderizar link com href correto', () => {
      render(
        <BrowserRouter>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </BrowserRouter>
      );

      const link = screen.getByText('Dashboard');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('deve aplicar className customizada', () => {
      render(
        <BrowserRouter>
          <NavLink to="/categorias" className="custom-class">
            Categorias
          </NavLink>
        </BrowserRouter>
      );

      const link = screen.getByText('Categorias');
      expect(link).toHaveClass('custom-class');
    });

    it('deve renderizar múltiplos links', () => {
      render(
        <BrowserRouter>
          <nav>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/transacoes">Transações</NavLink>
            <NavLink to="/categorias">Categorias</NavLink>
          </nav>
        </BrowserRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Transações')).toBeInTheDocument();
      expect(screen.getByText('Categorias')).toBeInTheDocument();
    });

    it('deve aceitar rotas com parâmetros', () => {
      render(
        <BrowserRouter>
          <NavLink to="/transacoes/123">Editar Transação</NavLink>
        </BrowserRouter>
      );

      const link = screen.getByText('Editar Transação');
      expect(link).toHaveAttribute('href', '/transacoes/123');
    });
  });

  describe('Caso de Teste 27: StatCard - Variantes de cor', () => {
    it('deve usar variante default quando não especificado', () => {
      const { container } = render(
        <StatCard
          title="Teste"
          value="R$ 100"
          icon={DollarSign}
        />
      );

      expect(container.querySelector('.text-primary')).toBeInTheDocument();
    });

    it('deve aceitar variante warning', () => {
      render(
        <StatCard
          title="Alerta"
          value="R$ 800"
          icon={DollarSign}
          variant="warning"
        />
      );

      expect(screen.getByText('Alerta')).toBeInTheDocument();
    });
  });

  describe('Caso de Teste 28: StatCard - Formatação de valores', () => {
    it('deve exibir valor com formatação brasileira', () => {
      render(
        <StatCard
          title="Total"
          value="R$ 1.234,56"
          icon={DollarSign}
        />
      );

      expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument();
    });

    it('deve exibir valores negativos', () => {
      render(
        <StatCard
          title="Deficit"
          value="-R$ 500,00"
          icon={DollarSign}
          variant="danger"
        />
      );

      expect(screen.getByText('-R$ 500,00')).toBeInTheDocument();
    });

    it('deve exibir valores grandes', () => {
      render(
        <StatCard
          title="Patrimônio"
          value="R$ 1.000.000,00"
          icon={DollarSign}
        />
      );

      expect(screen.getByText('R$ 1.000.000,00')).toBeInTheDocument();
    });
  });
});
