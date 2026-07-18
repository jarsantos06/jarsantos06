"use client";

import { useState } from "react";
import { Logo } from "@/components/ui";
import { NavLinks, type NavItem } from "./NavLinks";

export function MobileNav({
  items,
  userNome,
  userPapel,
  userMatricula,
}: {
  items: NavItem[];
  userNome: string;
  userPapel: string;
  userMatricula: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir menu"
        className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 md:hidden"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setAberto(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80%] flex-col bg-slate-900 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo tone="onDark" />
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              <NavLinks items={items} onNavigate={() => setAberto(false)} />
            </div>

            <div className="border-t border-slate-800 px-5 py-4 text-sm">
              <p className="font-medium">{userNome}</p>
              <p className="text-xs text-slate-400">
                {userPapel} · {userMatricula}
              </p>
              <form action="/api/auth/logout" method="post" className="mt-3">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-slate-700 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
