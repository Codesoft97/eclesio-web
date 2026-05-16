import {
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Home,
  Megaphone,
  UserRound,
} from "lucide-react";

export const memberPortalNavItems = [
  { href: "/portal", label: "Inicio", icon: Home },
  { href: "/portal/perfil", label: "Perfil", icon: UserRound },
  { href: "/portal/comunicados", label: "Comunicados", icon: Megaphone },
  { href: "/portal/doacoes", label: "Doações", icon: HeartHandshake },
  { href: "/portal/escalas", label: "Escalas", icon: CheckCircle2 },
  { href: "/portal/eventos", label: "Eventos", icon: CalendarDays },
];
