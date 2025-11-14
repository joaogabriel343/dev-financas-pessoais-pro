import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  PlusCircle,
  Receipt,
  Tags,
  Wallet,
  Target,
  PieChart,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/novo", icon: PlusCircle, label: "Nova Transação" },
  { to: "/extrato", icon: Receipt, label: "Extrato" },
  { to: "/categorias", icon: Tags, label: "Categorias" },
  { to: "/contas", icon: Wallet, label: "Contas" },
  { to: "/metas", icon: Target, label: "Metas" },
  { to: "/orcamentos", icon: PieChart, label: "Orçamentos" },
  { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { to: "/perfil", icon: Settings, label: "Configurações" },
];

export const Sidebar = () => {
  const { logout, user } = useAuth();

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">
          Finanças Pro
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="text-sm text-sidebar-foreground/70 px-3">
          {user?.name}
        </div>
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
