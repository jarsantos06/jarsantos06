"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { Field, Input, Button, Alert, Logo } from "@/components/ui";

const inicial: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, inicial);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo tone="onLight" size="lg" tagline />
          <p className="mt-4 text-sm text-slate-500">
            Acesse com sua matrícula
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <Field label="Matrícula">
            <Input
              name="matricula"
              type="text"
              autoComplete="username"
              placeholder="Ex.: 1001"
            />
          </Field>

          <Field label="Senha">
            <Input
              name="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          {state.erro && <Alert tone="danger">{state.erro}</Alert>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
