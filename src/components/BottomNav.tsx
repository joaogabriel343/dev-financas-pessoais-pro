import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, PlusCircle, Receipt, Target, PieChart } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Início" },
  { to: "/novo", icon: PlusCircle, label: "Novo" },
  { to: "/extrato", icon: Receipt, label: "Extrato" },
  { to: "/orcamentos", icon: PieChart, label: "Orçamento" },
  { to: "/metas", icon: Target, label: "Metas" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground transition-colors hover:text-foreground"
            activeClassName="text-primary font-medium"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
