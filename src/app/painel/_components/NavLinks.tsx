"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/ui";

export type NavItem = { href: string; label: string; emoji: string };

export function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const estaAtivo = (href: string) =>
    href === "/painel" ? pathname === "/painel" : pathname.startsWith(href);

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const ativo = estaAtivo(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={ativo ? "page" : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
              ativo
                ? "bg-brand-600 font-medium text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <span className="text-base">{item.emoji}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
