import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { listTransactions, type TransactionWithNames } from "../lib/transactions";
import { listAccounts, type AccountRow } from "../lib/accounts";
import { listCategories, type Category } from "../lib/categorias";
import { Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown, PieChart, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const ExportReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<TransactionWithNames[]>([]);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current-month");
  const [selectedFormat, setSelectedFormat] = useState<string>("pdf");

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const [txs, accs, cats] = await Promise.all([listTransactions(user.id), listAccounts(user.id), listCategories(user.id)]);
        setTransactions(txs);
        setAccounts(accs);
        setCategories(cats);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    switch (selectedPeriod) {
      case "current-month": startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case "last-3-months": startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); break;
      case "last-6-months": startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1); break;
      case "current-year": startDate = new Date(now.getFullYear(), 0, 1); break;
      case "all": return transactions;
      default: return transactions;
    }
    return transactions.filter(t => new Date(t.date) >= startDate);
  }, [transactions, selectedPeriod]);

  const stats = useMemo(() => {
    const income = filteredData.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = filteredData.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const categoryBreakdown = filteredData.reduce((acc, t) => {
      const key = t.category_name || "Sem categoria";
      if (!acc[key]) acc[key] = { income: 0, expense: 0 };
      if (t.type === "income") acc[key].income += Number(t.amount); else acc[key].expense += Number(t.amount);
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);
    const monthlyFlow = filteredData.reduce((acc, t) => {
      const month = t.date.substring(0, 7);
      if (!acc[month]) acc[month] = { income: 0, expense: 0 };
      if (t.type === "income") acc[month].income += Number(t.amount); else acc[month].expense += Number(t.amount);
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);
    return { income, expenses, balance, categoryBreakdown, monthlyFlow };
  }, [filteredData, accounts]);

  const topCategories = useMemo(() => Object.entries(stats.categoryBreakdown).map(([name, data]) => ({ name, total: data.expense })).sort((a, b) => b.total - a.total).slice(0, 5), [stats.categoryBreakdown]);
  const monthlyData = useMemo(() => Object.entries(stats.monthlyFlow).sort((a, b) => a[0].localeCompare(b[0])), [stats.monthlyFlow]);
  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');
  const formatMonth = (month: string) => new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  const maxMonthlyValue = Math.max(...monthlyData.map(([, data]) => Math.max(data.income, data.expense)), 1);
  const maxCategoryValue = topCategories[0]?.total || 1;

  const exportToPDF = () => {
    const doc = new jsPDF();
    const generationDate = new Date();
    const periodText = document.querySelector('#period > span')?.textContent || selectedPeriod;
    const finalY = (doc.internal.pageSize.height || doc.internal.pageSize.getHeight()) - 15;

    doc.setFillColor(244, 244, 245); 
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    doc.setFillColor(3, 102, 214); 
    doc.rect(14, 12, 10, 10, 'F'); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Finanças Pro", 28, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatório de Transações", 28, 25);
    doc.setFontSize(8);
    doc.text(`Gerado em: ${generationDate.toLocaleString('pt-BR')}`, doc.internal.pageSize.width - 14, 18, { align: 'right' });
    doc.text(`Período: ${periodText}`, doc.internal.pageSize.width - 14, 24, { align: 'right' });

    const summaryY = 50;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo do Período", 14, summaryY);
    doc.setLineWidth(0.2);
    doc.line(14, summaryY + 2, doc.internal.pageSize.width - 14, summaryY + 2);
    
    const summaryData = [
      { title: "Total de Receitas", value: formatCurrency(stats.income), color: [22, 163, 74] }, 
      { title: "Total de Despesas", value: formatCurrency(stats.expenses), color: [239, 68, 68] }, 
      { title: "Saldo do Período", value: formatCurrency(stats.income - stats.expenses), color: [0, 0, 0] },
    ];
    const colWidth = (doc.internal.pageSize.width - 28) / 3;
    summaryData.forEach((item, index) => {
      const x = 14 + (index * colWidth);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      doc.text(item.value, x, summaryY + 10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); 
      doc.text(item.title, x, summaryY + 15);
    });
    doc.setTextColor(0, 0, 0); 

    const tableData = filteredData.map(t => [formatDate(t.date), t.description, t.category_name, t.account_name, t.type === 'income' ? 'Receita' : 'Despesa', formatCurrency(t.amount)]);
    autoTable(doc, {
      startY: summaryY + 25,
      head: [['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor']],
      body: tableData,
      theme: 'grid', 
      headStyles: { fillColor: [3, 102, 214], textColor: 255, fontStyle: 'bold' },
      didDrawPage: (data) => {
        const pageCount = (doc.internal as any).pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width / 2, finalY, { align: 'center' });
      },
    });

    doc.save(`Relatorio_Financas_Pro_${generationDate.toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = () => {
    const jsonData = filteredData.map(t => ({ Data: formatDate(t.date), Descrição: t.description, Categoria: t.category_name, Conta: t.account_name, Tipo: t.type === 'income' ? 'Receita' : 'Despesa', Valor: t.amount }));
    const transactionsWorksheet = XLSX.utils.json_to_sheet(jsonData);

    const objectMaxLength = Object.keys(jsonData[0] || {}).map(key => key.length);
    const maxLengths = jsonData.reduce((acc, curr) => {
      Object.values(curr).forEach((val, i) => {
        const len = String(val).length;
        if (!acc[i] || len > acc[i]) acc[i] = len;
      });
      return acc;
    }, objectMaxLength);
    transactionsWorksheet["!cols"] = maxLengths.map(w => ({ wch: w + 2 })); 

    const summaryData = Object.entries(stats.categoryBreakdown).map(([name, data]) => ({ Categoria: name, Receitas: data.income, Despesas: data.expense }));
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    summaryWorksheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }]; 

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, transactionsWorksheet, "Transações");
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Resumo por Categoria");

    XLSX.writeFile(workbook, `relatorio_transacoes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToCSV = () => {
    const csvData = Papa.unparse(filteredData.map(t => ({ data: t.date, descricao: t.description, categoria: t.category_name, conta: t.account_name, tipo: t.type, valor: t.amount })), {
      delimiter: ';', 
    });
    const blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_transacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format?: 'pdf' | 'excel' | 'csv') => {
    const exportFormat = format || selectedFormat;
    if (filteredData.length === 0) {
      toast({ variant: "destructive", title: "Nenhum dado para exportar", description: "Selecione um período com transações." });
      return;
    }
    toast({ title: "Exportando relatório", description: `Gerando arquivo ${exportFormat.toUpperCase()}...` });
    try {
      switch (exportFormat) {
        case 'pdf': exportToPDF(); break;
        case 'excel': exportToExcel(); break;
        case 'csv': exportToCSV(); break;
        default: toast({ variant: "destructive", title: "Formato inválido" }); return;
      }
      toast({ title: "Relatório exportado!", description: `O arquivo foi baixado com sucesso.` });
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast({ variant: "destructive", title: "Erro ao exportar", description: "Não foi possível gerar o arquivo." });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold tracking-tight">Exportar Relatórios</h1><p className="text-muted-foreground">Gere relatórios personalizados e exporte seus dados</p></div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats.balance)}</div></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /><div className="text-2xl font-bold text-success">{formatCurrency(stats.income)}</div></div></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle></CardHeader><CardContent><div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-destructive" /><div className="text-2xl font-bold text-destructive">{formatCurrency(stats.expenses)}</div></div></CardContent></Card>
          <Card><CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Saldo Período</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${stats.income - stats.expenses >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(stats.income - stats.expenses)}</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Configurações de Exportação</CardTitle><CardDescription>Selecione o período e formato para gerar o relatório</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="period">Período</Label><Select value={selectedPeriod} onValueChange={setSelectedPeriod}><SelectTrigger id="period"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="current-month">Mês Atual</SelectItem><SelectItem value="last-3-months">Últimos 3 Meses</SelectItem><SelectItem value="last-6-months">Últimos 6 Meses</SelectItem><SelectItem value="current-year">Ano Atual</SelectItem><SelectItem value="all">Todo o Período</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="format">Formato</Label><Select value={selectedFormat} onValueChange={setSelectedFormat}><SelectTrigger id="format"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pdf">PDF</SelectItem><SelectItem value="excel">Excel (XLSX)</SelectItem><SelectItem value="csv">CSV</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleExport()} className="flex-1 gap-2" size="lg"><Download className="h-4 w-4" />Exportar Relatório Completo</Button>
              <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2" size="lg"><FileText className="h-4 w-4" />PDF</Button>
              <Button variant="outline" onClick={() => handleExport('excel')} className="gap-2" size="lg"><FileSpreadsheet className="h-4 w-4" />Excel</Button>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /><CardTitle>Fluxo de Caixa Mensal</CardTitle></div></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>) : (monthlyData.map(([month, data]) => (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><span className="font-medium capitalize">{formatMonth(month)}</span><span className={`font-semibold ${data.income - data.expense >= 0 ? "text-success" : "text-destructive"}`}>{formatCurrency(data.income - data.expense)}</span></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2"><div className="h-6 rounded bg-success/10 relative overflow-hidden w-full"><div className="h-full bg-success" style={{ width: `${(data.income / maxMonthlyValue) * 100}%` }} /></div><span className="text-xs text-muted-foreground min-w-[70px] text-right">{formatCurrency(data.income)}</span></div>
                      <div className="flex items-center gap-2"><div className="h-6 rounded bg-destructive/10 relative overflow-hidden w-full"><div className="h-full bg-destructive" style={{ width: `${(data.expense / maxMonthlyValue) * 100}%` }} /></div><span className="text-xs text-muted-foreground min-w-[70px] text-right">{formatCurrency(data.expense)}</span></div>
                    </div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><div className="flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" /><CardTitle>Top 5 Categorias de Despesas</CardTitle></div></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.length === 0 ? (<p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>) : (topCategories.map((cat, idx) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">{idx + 1}</span><span className="font-medium">{cat.name}</span></div><span className="text-muted-foreground">{formatCurrency(cat.total)}</span></div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-destructive transition-all" style={{ width: `${(cat.total / maxCategoryValue) * 100}%` }} /></div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Resumo de Categorias</CardTitle><CardDescription>Detalhamento completo por categoria no período selecionado</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown).sort((a, b) => b[1].expense - a[1].expense).map(([name, data]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="font-medium">{name}</span>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-success" /><span className="text-success font-semibold">{formatCurrency(data.income)}</span></div>
                    <div className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-destructive" /><span className="text-destructive font-semibold">{formatCurrency(data.expense)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ExportReports;
