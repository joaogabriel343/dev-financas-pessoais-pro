import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockCategories, mockAccounts } from "@/data/mockData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const NewTransaction = () => {
  const { toast } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    categoryId: '',
    accountId: '',
  });

  const filteredCategories = mockCategories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Transação criada!",
      description: `${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${formData.amount} adicionada com sucesso.`,
    });
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: '',
      accountId: '',
    });
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
              <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="expense" className="gap-2">
                    <ArrowDownRight className="h-4 w-4" />
                    Despesa
                  </TabsTrigger>
                  <TabsTrigger value="income" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Receita
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="pl-10"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Compras no supermercado"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Conta</Label>
                <Select value={formData.accountId} onValueChange={(v) => setFormData({ ...formData, accountId: v })}>
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Adicionar Transação
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NewTransaction;
