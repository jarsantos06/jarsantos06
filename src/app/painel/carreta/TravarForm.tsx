"use client";

import { useActionState, useRef } from "react";
import { travarAction, type ActionState } from "./actions";

const inicial: ActionState = {};

export function TravarForm() {
  const [state, formAction, pending] = useActionState(travarAction, inicial);
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
          Placa da carreta
        </span>
        <input
          name="placa"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 uppercase outline-none focus:border-brand-500"
          placeholder="ABC1D23"
          maxLength={8}
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Foto da carreta travada
        </span>
        <input
          name="foto"
          type="file"
          accept="image/*"
          capture="environment"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-600 outline-none file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
        <span className="mt-1 block text-xs text-slate-400">
          Ticket e data/hora são gerados automaticamente.
        </span>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Observação <span className="text-slate-400">(opcional)</span>
        </span>
        <input
          name="observacao"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: Doca 3, aguardando conferência"
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
        {pending ? "Travando..." : "🔒 Travar carreta"}
      </button>
    </form>
  );
}
