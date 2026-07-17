"use client";

import { useActionState } from "react";
import {
  criarTurnoAction,
  criarPadraoAction,
  type ActionState,
} from "../actions";

const inicial: ActionState = {};

export function NovoTurnoForm() {
  const [state, action, pending] = useActionState(criarTurnoAction, inicial);
  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Nome</span>
        <input
          name="nome"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: Comercial"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Início</span>
          <input
            name="horaInicio"
            type="time"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Fim</span>
          <input
            name="horaFim"
            type="time"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar turno"}
      </button>
    </form>
  );
}

export function NovoPadraoForm() {
  const [state, action, pending] = useActionState(criarPadraoAction, inicial);
  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Nome</span>
        <input
          name="nome"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: 4x2"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Dias de trabalho
          </span>
          <input
            name="diasTrabalho"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Dias de folga
          </span>
          <input
            name="diasFolga"
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Criar padrão"}
      </button>
    </form>
  );
}

function Feedback({ state }: { state: ActionState }) {
  return (
    <>
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
    </>
  );
}
