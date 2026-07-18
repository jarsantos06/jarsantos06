"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarEscalaAction, type ActionState } from "../actions";

const inicial: ActionState = {};

type Opcao = { id: string; label: string };

export function NovaEscalaForm({
  funcionarios,
  padroes,
  turnos,
  funcionarioIdInicial,
}: {
  funcionarios: Opcao[];
  padroes: Opcao[];
  turnos: Opcao[];
  funcionarioIdInicial?: string;
}) {
  const [state, formAction, pending] = useActionState(
    criarEscalaAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Funcionário
        </span>
        <select
          name="funcionarioId"
          defaultValue={funcionarioIdInicial ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
        >
          <option value="" disabled>
            Selecione...
          </option>
          {funcionarios.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Padrão</span>
          <select
            name="padraoId"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {padroes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Turno</span>
          <select
            name="turnoId"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="" disabled>
              Selecione...
            </option>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Início do ciclo
          </span>
          <input
            name="dataInicio"
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Fim <span className="text-slate-400">(opcional)</span>
          </span>
          <input
            name="dataFim"
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-slate-400">
        Deixe o fim em branco para a escala ser <strong>padronizada</strong>{" "}
        (repete o ciclo automaticamente até uma nova escala substituí-la).
      </p>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          Observação <span className="text-slate-400">(opcional)</span>
        </span>
        <input
          name="observacao"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: cobertura de férias"
        />
      </label>

      {state.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.erro}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}{" "}
          <Link href="/painel/escala/gerenciar" className="underline">
            Ver equipe
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Atribuir escala"}
      </button>
    </form>
  );
}
