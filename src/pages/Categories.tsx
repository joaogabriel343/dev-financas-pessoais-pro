import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { mockCategories } from "@/data/mockData";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, deleteCategory, listCategories, type Category } from "@/lib/categorias";
import { useAuth } from "@/contexts/AuthContext";

const Categories = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'expense' as 'income' | 'expense' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await listCategories(user.id);
        setCategories(data);
      } catch (err: any) {
        toast({ title: "Erro ao carregar", description: err.message ?? "Não foi possível carregar categorias", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const handleAdd = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: "Nome obrigatório", description: "Informe um nome para a categoria.", variant: "destructive" });
      return;
    }
    try {
      if (!user?.id) throw new Error("Usuário não autenticado");
      const created = await createCategory({ name: newCategory.name.trim(), type: newCategory.type, user_id: user.id });
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: "Categoria criada!", description: `A categoria "${created.name}" foi adicionada com sucesso.` });
      setNewCategory({ name: '', type: 'expense' });
      setOpen(false);
    } catch (err: any) {
      toast({ title: "Erro ao criar", description: err.message ?? "Não foi possível criar a categoria", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Categoria excluída", description: `A categoria "${name}" foi removida.` });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err.message ?? "Não foi possível excluir a categoria", variant: "destructive" });
    }
  };
  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">Gerencie suas categorias de receitas e despesas</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Categoria</DialogTitle>
                <DialogDescription>
                  Crie uma nova categoria para organizar suas transações
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Streaming"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newCategory.type} onValueChange={(v: 'income' | 'expense') => setNewCategory({ ...newCategory, type: v })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Adicionar Categoria
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-success">Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
                {!loading && incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
                {!loading && expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <span className="font-medium">{category.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
