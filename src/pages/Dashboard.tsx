import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listAccounts, type AccountRow } from "../lib/accounts";
import { listTransactions, type TransactionWithNames } from "../lib/transactions";

const Dashboard = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithNames[]>([]);
  const [loading, setLoading] = useState(false);

  const currentMonthPrefix = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [accs, txs] = await Promise.all([
          listAccounts(user.id),
          listTransactions(user.id),
        ]);
        setAccounts(accs);
        setTransactions(txs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const stats = useMemo(() => {
    const monthTx = transactions.filter(t => t.date.startsWith(currentMonthPrefix));
    const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    return { income, expenses, balance };
  }, [transactions, accounts, currentMonthPrefix]);

  const expensesByCategory = useMemo(() => {
    const monthTx = transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthPrefix));
    const totals = monthTx.reduce((acc, t) => {
      const key = t.category_name || 'Sem categoria';
      acc[key] = (acc[key] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions, currentMonthPrefix]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(stats.balance)}
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Receitas do Mês"
            value={formatCurrency(stats.income)}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(stats.expenses)}
            icon={TrendingDown}
            variant="danger"
          />
          <StatCard
            title="Saldo do Mês"
            value={formatCurrency(stats.income - stats.expenses)}
            icon={stats.income - stats.expenses >= 0 ? TrendingUp : TrendingDown}
            variant={stats.income - stats.expenses >= 0 ? 'success' : 'danger'}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesByCategory.map(([category, amount]) => {
                  const percentage = stats.expenses ? (amount / stats.expenses) * 100 : 0;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-destructive transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  return (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${
                          transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category_name}</p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounts Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Minhas Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-lg border p-4 transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{account.name}</span>
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(Number(account.balance))}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;