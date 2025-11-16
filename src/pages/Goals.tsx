import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { createGoal, deleteGoal, listGoals, type GoalRow } from "@/lib/goals";
import { calculateGoalProgress, formatCurrency } from "@/utils/financeUtils";

const Goals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await listGoals(user.id);
        setGoals(data);
      } catch (err: any) {
        toast({ title: "Erro ao carregar", description: err.message ?? "Não foi possível carregar metas", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Nome obrigatório", description: "Informe um nome para a meta.", variant: "destructive" });
      return;
    }
    if (!user?.id) {
      toast({ title: "Usuário não autenticado", description: "Faça login para criar metas.", variant: "destructive" });
      return;
    }
    const target = parseFloat((formData.targetAmount || '0').toString().replace(',', '.')) || 0;
    const current = parseFloat((formData.currentAmount || '0').toString().replace(',', '.')) || 0;
    if (target <= 0) {
      toast({ title: "Valor alvo inválido", description: "O valor alvo deve ser maior que zero.", variant: "destructive" });
      return;
    }
    if (current < 0) {
      toast({ title: "Valor atual inválido", description: "O valor atual não pode ser negativo.", variant: "destructive" });
      return;
    }
    try {
      const created = await createGoal({
        user_id: user.id,
        name: formData.name.trim(),
        target_amount: target,
        current_amount: current,
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
      });
      setGoals((prev) => {
        const next = [...prev, created];
        return next.sort((a, b) => a.deadline.localeCompare(b.deadline));
      });
      toast({ title: "Meta criada!", description: `A meta "${created.name}" foi adicionada com sucesso.` });
      setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: '' });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erro ao criar", description: err.message ?? "Não foi possível criar a meta", variant: "destructive" });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
            <p className="text-muted-foreground">Defina e acompanhe seus objetivos financeiros</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma meta financeira e acompanhe seu progresso
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Meta</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Comprar um carro"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Valor Alvo</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="target"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-10"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current">Valor Atual</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                    <Input
                      id="current"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-10"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Criar Meta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          )}
          {!loading && goals.length === 0 && (
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-muted-foreground">Nenhuma meta cadastrada ainda.</p>
              </CardContent>
            </Card>
          )}
          {!loading && goals.map((goal) => {
            const progress = calculateGoalProgress(goal.current_amount, goal.target_amount);
            return (
              <Card key={goal.id} className="transition-all hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={async () => {
                        try {
                          await deleteGoal(goal.id);
                          setGoals((prev) => prev.filter((g) => g.id !== goal.id));
                          toast({ title: "Meta excluída", description: `A meta "${goal.name}" foi removida.` });
                        } catch (err: any) {
                          toast({ title: "Erro ao excluir", description: err.message ?? "Não foi possível excluir a meta", variant: "destructive" });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Atual</span>
                      <span className="font-semibold">{formatCurrency(goal.current_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Meta</span>
                      <span className="font-semibold">{formatCurrency(goal.target_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Prazo</span>
                      <span className="font-semibold">{formatDate(goal.deadline)}</span>
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

export default Goals;