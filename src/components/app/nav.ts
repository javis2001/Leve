import {
  CalendarDays, ChefHat, CircleCheckBig, Download, Home, Map, NotebookPen, PersonStanding, ShieldCheck, ShoppingBasket, TrendingUp, UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV: NavItem[] = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/jornada", label: "Jornada", icon: Map },
  { href: "/app/receitas", label: "Receitas", icon: ChefHat },
  { href: "/app/exercicios", label: "Exercícios", icon: PersonStanding },
  { href: "/app/cardapio", label: "Cardápio", icon: CalendarDays },
  { href: "/app/compras", label: "Lista de compras", icon: ShoppingBasket },
  { href: "/app/habitos", label: "Hábitos", icon: CircleCheckBig },
  { href: "/app/diario", label: "Diário", icon: NotebookPen },
  { href: "/app/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/app/materiais", label: "Materiais", icon: Download },
  { href: "/app/perfil", label: "Perfil", icon: UserRound },
  { href: "/admin", label: "Administração", icon: ShieldCheck, adminOnly: true },
];

export const BOTTOM_NAV = ["/app", "/app/jornada", "/app/receitas", "/app/habitos"];

export function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(href + "/") || (href === "/app/jornada" && pathname.startsWith("/app/dia/"));
}
