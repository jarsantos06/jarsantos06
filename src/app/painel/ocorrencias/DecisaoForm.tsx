"use client";

import { useActionState } from "react";
import { decidirOcorrenciaAction, type ActionState } from "./actions";

const inicial: ActionState = {};

export function DecisaoForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(
    decidirOcorrenciaAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="parecer"
        placeholder="Parecer (opcional)"
        className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          name="decisao"
          value="APROVADA"
          disabled={pending}
          className="flex-1 rounded-lg border border-green-300 bg-green-50 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
        >
          ✓ Aprovar
        </button>
        <button
          type="submit"
          name="decisao"
          value="REPROVADA"
          disabled={pending}
          className="flex-1 rounded-lg border border-red-300 bg-red-50 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          ✕ Reprovar
        </button>
      </div>
      {state.erro && <p className="text-xs text-red-600">{state.erro}</p>}
      {state.ok && <p className="text-xs text-green-700">{state.ok}</p>}
    </form>
  );
}
