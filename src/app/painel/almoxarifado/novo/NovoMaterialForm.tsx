"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarMaterialAction, type ActionState } from "../actions";

const inicial: ActionState = {};

export function NovoMaterialForm() {
  const [state, formAction, pending] = useActionState(
    criarMaterialAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Código</span>
          <input
            name="codigo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
            placeholder="Ex.: MAT-010"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Unidade</span>
          <input
            name="unidade"
            defaultValue="UN"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
            placeholder="UN, CX, L, KG..."
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Nome</span>
        <input
          name="nome"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          placeholder="Ex.: Álcool em gel 500ml"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Categoria</span>
          <select
            name="categoria"
            defaultValue="USO_DIARIO"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            <option value="USO_DIARIO">Uso diário</option>
            <option value="LIMPEZA">Limpeza</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            Estoque mínimo
          </span>
          <input
            name="estoqueMinimo"
            type="number"
            min={0}
            defaultValue={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
      </div>

      {state.erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.erro}
        </p>
      )}
      {state.ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {state.ok}{" "}
          <Link href="/painel/almoxarifado" className="underline">
            Ver materiais
          </Link>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Cadastrar material"}
      </button>
    </form>
  );
}
