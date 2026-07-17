"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const inicial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, inicial);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            SO
          </div>
          <h1 className="text-xl font-semibold text-slate-800">
            Sistema Operacional
          </h1>
          <p className="text-sm text-slate-500">Acesse com sua matrícula</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Matrícula
            </label>
            <input
              name="matricula"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="Ex.: 1001"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              name="senha"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              placeholder="••••••••"
            />
          </div>

          {state.erro && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.erro}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
