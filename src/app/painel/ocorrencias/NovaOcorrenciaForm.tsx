"use client";

import { useActionState, useRef } from "react";
import { criarOcorrenciaAction, type ActionState } from "./actions";

const inicial: ActionState = {};

export function NovaOcorrenciaForm({ nomeUsuario }: { nomeUsuario: string }) {
  const [state, formAction, pending] = useActionState(
    criarOcorrenciaAction,
    inicial,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await formAction(fd);
        formRef.current?.reset();
      }}
      className="space-y-4"
    >
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Funcionário
        </span>
        <input
          value={nomeUsuario}
          disabled
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Tipo</span>
          <select
            name="tipo"
            defaultValue="FALTA"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="FALTA">Falta</option>
            <option value="ATRASO">Atraso</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Data da ocorrência
          </span>
          <input
            name="dataOcorrencia"
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Motivo</span>
        <textarea
          name="motivo"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Descreva o motivo da falta ou atraso"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Evidência <span className="text-slate-400">(opcional — imagem)</span>
        </span>
        <input
          name="evidencia"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-600 outline-none file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
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
        {pending ? "Enviando..." : "Enviar para aprovação"}
      </button>
    </form>
  );
}
