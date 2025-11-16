import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Building2, Wallet, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listAccounts, createAccount, updateAccount, type AccountRow } from "../lib/accounts";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Accounts = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<AccountRow | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank' as 'bank' | 'cash' | 'investment',
    balance: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await listAccounts(user.id);
        setAccounts(data);
      } catch (err: any) {
        toast({ title: 'Erro ao carregar', description: err.message ?? 'Não foi possível carregar contas', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'bank': return Building2;
      case 'cash': return Wallet;
      case 'investment': return TrendingUp;
      default: return Wallet;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bank': return 'Banco';
      case 'cash': return 'Dinheiro';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!formData.name || !formData.balance) {
        toast({ title: 'Campos obrigatórios', description: 'Preencha nome e saldo.', variant: 'destructive' });
        return;
      }

      if (editMode && currentAccount) {
        const updated = await updateAccount({
          id: currentAccount.id,
          name: formData.name,
          type: formData.type,
          balance: Number(formData.balance),
        });
        setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a));
        toast({ title: 'Conta atualizada!', description: `A conta "${formData.name}" foi atualizada com sucesso.` });
      } else {
        const created = await createAccount({
          user_id: user.id,
          name: formData.name,
          type: formData.type,
          balance: Number(formData.balance),
        });
        setAccounts(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast({ title: 'Conta criada!', description: `A conta "${formData.name}" foi adicionada com sucesso.` });
      }

      setFormData({ name: '', type: 'bank', balance: '' });
      setOpen(false);
      setEditMode(false);
      setCurrentAccount(null);
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message ?? 'Não foi possível salvar a conta', variant: 'destructive' });
    }
  };

  const handleEdit = (account: AccountRow) => {
    setCurrentAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
    });
    setEditMode(true);
    setOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
            <p className="text-muted-foreground">Gerencie suas contas e carteiras</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { setEditMode(false); setFormData({ name: '', type: 'bank', balance: '' }); }}>
                <Plus className="h-4 w-4" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editMode ? 'Editar Conta' : 'Adicionar Conta'}</DialogTitle>
                <DialogDescription>
                  {editMode ? 'Atualize os dados da conta' : 'Crie uma nova conta para gerenciar seus recursos'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Nubank"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Banco</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-10"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  {editMode ? 'Atualizar Conta' : 'Adicionar Conta'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-sm text-muted-foreground col-span-full text-center">Carregando...</p>}
          {!loading && accounts.map((account) => {
            const Icon = getIcon(account.type);
            return (
              <Card key={account.id} className="transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {getTypeLabel(account.type)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{account.name}</p>
                      <p className="text-2xl font-bold mt-1">{formatCurrency(account.balance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Accounts;
