"use client";

import { useActionState } from "react";
import {
  encerrarEscalaAction,
  excluirEscalaAction,
  type ActionState,
} from "./actions";

const inicial: ActionState = {};

export function EscalaAcoes({
  id,
  encerrada,
}: {
  id: string;
  encerrada: boolean;
}) {
  const [encState, encAction, encPending] = useActionState(
    encerrarEscalaAction,
    inicial,
  );
  const [delState, delAction, delPending] = useActionState(
    excluirEscalaAction,
    inicial,
  );

  return (
    <div className="space-y-2">
      {!encerrada && (
        <form action={encAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={id} />
          <label className="text-xs text-slate-500">
            Encerrar em
            <input
              name="dataFim"
              type="date"
              required
              className="mt-0.5 block rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
            />
          </label>
          <button
            type="submit"
            disabled={encPending}
            className="rounded border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-700 hover:bg-amber-100 disabled:opacity-60"
          >
            Encerrar
          </button>
        </form>
      )}

      <form action={delAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={delPending}
          className="rounded border border-red-300 bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          Excluir
        </button>
      </form>

      {(encState.erro || delState.erro) && (
        <p className="text-xs text-red-600">{encState.erro ?? delState.erro}</p>
      )}
      {(encState.ok || delState.ok) && (
        <p className="text-xs text-green-700">{encState.ok ?? delState.ok}</p>
      )}
    </div>
  );
}
