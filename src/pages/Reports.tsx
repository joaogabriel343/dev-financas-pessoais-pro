import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { listTransactions, type TransactionWithNames } from "../lib/transactions";

const Reports = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionWithNames[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await listTransactions(user.id);
        setTransactions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const monthlyData = useMemo(() => {
    const data: Record<string, { income: number; expenses: number }> = {};
    
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!data[month]) {
        data[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        data[month].income += Number(t.amount);
      } else {
        data[month].expenses += Number(t.amount);
      }
    });
    
    return Object.entries(data).sort((a, b) => a[0].localeCompare(b[0]));
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    transactions.forEach(t => {
      const catName = t.category_name || 'Sem categoria';
      totals[catName] = (totals[catName] || 0) + Number(t.amount);
    });
    
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMonth = (month: string) => {
    return new Date(month + '-01').toLocaleDateString('pt-BR', { 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Análises</h1>
          <p className="text-muted-foreground">Visualize suas finanças em detalhes</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map(([month, data]) => {
                const balance = data.income - data.expenses;
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{formatMonth(month)}</span>
                      <span className={`font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
                        <span className="text-muted-foreground">Receitas</span>
                        <span className="font-semibold text-success">{formatCurrency(data.income)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
                        <span className="text-muted-foreground">Despesas</span>
                        <span className="font-semibold text-destructive">{formatCurrency(data.expenses)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria (Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryTotals.map(([category, amount], index) => {
                const maxAmount = categoryTotals[0][1];
                const percentage = (amount / maxAmount) * 100;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Maior Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const maxIncome = transactions
                  .filter(t => t.type === 'income')
                  .sort((a, b) => Number(b.amount) - Number(a.amount))[0];
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-2xl font-bold text-success">
                        {formatCurrency(Number(maxIncome?.amount) || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{maxIncome?.description}</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Maior Despesa
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const maxExpense = transactions
                  .filter(t => t.type === 'expense')
                  .sort((a, b) => Number(b.amount) - Number(a.amount))[0];
                return (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      <span className="text-2xl font-bold text-destructive">
                        {formatCurrency(Number(maxExpense?.amount) || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{maxExpense?.description}</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Média de Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const expenses = transactions.filter(t => t.type === 'expense');
                const avgExpense = expenses.length > 0 
                  ? expenses.reduce((sum, t) => sum + Number(t.amount), 0) / expenses.length 
                  : 0;
                return (
                  <div className="space-y-1">
                    <span className="text-2xl font-bold">
                      {formatCurrency(avgExpense)}
                    </span>
                    <p className="text-sm text-muted-foreground">por transação</p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
