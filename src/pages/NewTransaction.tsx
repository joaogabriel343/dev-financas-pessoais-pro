import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { createTransaction } from "@/lib/transactions";
import { useAuth } from "@/contexts/AuthContext";
import { listCategories, type Category } from "@/lib/categorias";
import { listAccounts, type AccountRow } from "@/lib/accounts";

// A linha que importava 'mockCategories' e 'mockAccounts' foi removida para evitar confusão.

const NewTransaction = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: '',
    accountId: '',
  });

  // Estados para armazenar os dados REAIS do banco
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [cats, accs] = await Promise.all([
          listCategories(user.id),
          listAccounts(user.id),
        ]);
        setCategories(cats);
        setAccounts(accs);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar categorias e contas.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, toast]);

  // Filtra as categorias REAIS com base no tipo (receita/despesa)
  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
      return;
    }

    if (!formData.amount || !formData.categoryId || !formData.accountId) {
      toast({ variant: "destructive", title: "Campos obrigatórios", description: "Preencha valor, categoria e conta." });
      return;
    }

    setIsSubmitting(true);

    try {
      await createTransaction({
        type: type,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        category_id: parseInt(formData.categoryId),
        account_id: parseInt(formData.accountId),
        user_id: user.id,
      });

      toast({
        title: "Transação criada!",
        description: `Sua ${type === 'income' ? 'receita' : 'despesa'} foi adicionada com sucesso.`,
      });

      setFormData({ amount: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '', accountId: '' });

    } catch (error: any) {
      console.error("Erro ao criar transação:", error);
      toast({
        variant: "destructive",
        title: "Erro!",
        description: error.message || "Não foi possível adicionar a transação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Transação</h1>
          <p className="text-muted-foreground">Adicione uma nova receita ou despesa</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Transação</CardTitle>
            <CardDescription>Preencha os dados abaixo para registrar uma transação</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs value={type} onValueChange={(v) => {
                setType(v as 'income' | 'expense');
                setFormData(currentData => ({ ...currentData, categoryId: '' }));
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" className="gap-2"> <ArrowDownRight className="h-4 w-4" /> Despesa </TabsTrigger>
                  <TabsTrigger value="income" className="gap-2"> <ArrowUpRight className="h-4 w-4" /> Receita </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input id="amount" type="number" step="0.01" placeholder="0,00" className="pl-10" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Ex: Compras no supermercado" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select required value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })} disabled={loading}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder={loading ? "Carregando..." : "Selecione uma categoria"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Select required value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })} disabled={loading}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder={loading ? "Carregando..." : "Selecione uma conta"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || loading}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar Transação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewTransaction;
