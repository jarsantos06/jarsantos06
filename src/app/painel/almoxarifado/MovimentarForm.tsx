"use client";

import { useActionState } from "react";
import { movimentarAction, type ActionState } from "./actions";

const inicial: ActionState = {};

export function MovimentarForm({
  materialId,
  unidade,
  podeMovimentar,
}: {
  materialId: string;
  unidade: string;
  podeMovimentar: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    movimentarAction,
    inicial,
  );

  if (!podeMovimentar) {
    return (
      <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Seu perfil pode consultar, mas não movimentar materiais.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="materialId" value={materialId} />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tipo</span>
          <select
            name="tipo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
            defaultValue="ENTRADA"
          >
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Quantidade ({unidade})
          </span>
          <input
            name="quantidade"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
            placeholder="0"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Destino / Origem <span className="text-slate-400">(opcional)</span>
        </span>
        <input
          name="destino"
          type="text"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: Setor de expedição / Fornecedor X"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Observação <span className="text-slate-400">(opcional)</span>
        </span>
        <textarea
          name="observacao"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      </label>

      {state.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.erro}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Registrando..." : "Registrar movimentação"}
      </button>
    </form>
  );
}
