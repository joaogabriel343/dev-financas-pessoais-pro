
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { listTransactions, deleteTransaction, updateTransaction, type TransactionWithNames, type TransactionType } from "../lib/transactions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listCategories, type Category } from "../lib/categorias";
import { listAccounts, type AccountRow } from "../lib/accounts";

const Transactions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<TransactionWithNames[]>([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [editing, setEditing] = useState<null | TransactionWithNames>(null);
  const [form, setForm] = useState({
    type: 'expense' as TransactionType,
    amount: '',
    date: '',
    description: '',
    categoryId: '',
    accountId: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [data, cats, accs] = await Promise.all([
          listTransactions(user.id),
          listCategories(user.id),
          listAccounts(user.id),
        ]);
        setTransactions(data);
        setCategories(cats);
        setAccounts(accs);
      } catch (err: any) {
        toast({ title: 'Erro ao carregar', description: err.message ?? 'Não foi possível carregar transações', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const items = transactions.filter(t =>
      t.description.toLowerCase().includes(term) ||
      t.category_name.toLowerCase().includes(term) ||
      t.account_name.toLowerCase().includes(term)
    );
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({ title: 'Transação excluída', description: 'A transação foi removida com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message ?? 'Não foi possível excluir a transação', variant: 'destructive' });
    }
  };

  const openEdit = (tx: TransactionWithNames) => {
    setEditing(tx);
    setForm({
      type: tx.type,
      amount: String(tx.amount),
      date: tx.date,
      description: tx.description,
      categoryId: String(tx.category_id),
      accountId: String(tx.account_id),
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await updateTransaction({
        id: editing.id,
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        category_id: Number(form.categoryId),
        account_id: Number(form.accountId),
      });

      const newCatName = categories.find(c => c.id === Number(form.categoryId))?.name ?? editing.category_name;
      const newAccName = accounts.find(a => a.id === Number(form.accountId))?.name ?? editing.account_name;

      setTransactions(prev => prev.map(t => t.id === editing.id ? {
        ...t,
        type: form.type,
        amount: Number(form.amount),
        date: form.date,
        description: form.description,
        category_id: Number(form.categoryId),
        account_id: Number(form.accountId),
        category_name: newCatName,
        account_name: newAccName,
      } : t));

      toast({ title: 'Transação atualizada', description: 'As alterações foram salvas.' });
      setEditOpen(false);
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar', description: err.message ?? 'Não foi possível atualizar a transação', variant: 'destructive' });
    }
  };

  return (
    <>
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Extrato Detalhado</h1>
            <p className="text-muted-foreground">Todas as suas transações em um só lugar</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Histórico de Transações</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">Carregando...</TableCell>
                    </TableRow>
                  )}
                  {!loading && filteredTransactions.map((transaction) => {
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                            {transaction.category_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {transaction.account_name}
                        </TableCell>
                        <TableCell className={`text-right font-semibold ${
                          transaction.type === 'income' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(transaction)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>Atualize os dados da transação selecionada</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={form.type} onValueChange={(v: TransactionType) => setForm({ ...form, type: v })}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Despesa</SelectItem>
                <SelectItem value="income">Receita</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
              <Input id="amount" type="number" step="0.01" className="pl-10" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger id="category"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {categories
                  .filter(c => c.type === form.type)
                  .map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Conta</Label>
            <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
              <SelectTrigger id="account"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpdate} className="w-full">Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default Transactions;