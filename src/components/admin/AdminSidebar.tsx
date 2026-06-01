"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarOff,
  Sparkles,
  Home,
  Settings,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays },
  { href: "/admin/calendario", label: "Calendario", icon: CalendarOff },
  { href: "/admin/cotizaciones", label: "Eventos", icon: Sparkles },
  { href: "/admin/propiedades", label: "Propiedades", icon: Home },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-line/60 bg-bg min-h-screen">
      <div className="p-6">
        <Link
          href="/"
          className="font-semibold tracking-tight text-teal-deep text-lg"
        >
          CasaCampo
        </Link>
        <p className="text-xs uppercase tracking-widest text-ink/40 mt-1">
          Administración
        </p>
      </div>
      <nav className="px-3 space-y-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-teal-deep text-bg"
                  : "text-ink/75 hover:bg-teal-soft/60"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
