import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { mockBudgets, mockCategories } from "@/data/mockData";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Budgets = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    limit: '',
  });

  const expenseCategories = mockCategories.filter(c => c.type === 'expense');

  const handleSubmit = () => {
    toast({
      title: "Orçamento definido!",
      description: "O limite de gastos foi configurado com sucesso.",
    });
    setFormData({ categoryId: '', limit: '' });
    setOpen(false);
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
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos Mensais</h1>
            <p className="text-muted-foreground">Defina limites de gastos por categoria</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Definir Orçamento</DialogTitle>
                <DialogDescription>
                  Estabeleça um limite de gastos para uma categoria
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Limite Mensal</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="limit"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-10"
                      value={formData.limit}
                      onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Definir Orçamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {mockBudgets.map((budget) => {
            const category = mockCategories.find(c => c.id === budget.categoryId);
            const percentage = (budget.spent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isWarning = percentage > 80 && percentage <= 100;

            return (
              <Card key={budget.id} className={`transition-all hover:shadow-lg ${
                isOverBudget ? 'border-destructive' : isWarning ? 'border-warning' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{category?.name}</CardTitle>
                    {(isOverBudget || isWarning) && (
                      <AlertCircle className={`h-5 w-5 ${isOverBudget ? 'text-destructive' : 'text-warning'}`} />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gasto</span>
                      <span className={`font-medium ${isOverBudget ? 'text-destructive' : ''}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className={`h-2 ${isOverBudget ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-warning' : ''}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gasto</span>
                      <span className="font-semibold">{formatCurrency(budget.spent)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Limite</span>
                      <span className="font-semibold">{formatCurrency(budget.limit)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Disponível</span>
                      <span className={`font-semibold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
                        {formatCurrency(Math.max(0, budget.limit - budget.spent))}
                      </span>
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

export default Budgets;
