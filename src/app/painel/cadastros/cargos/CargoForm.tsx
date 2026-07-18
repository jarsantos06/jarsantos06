"use client";

import { useActionState } from "react";
import {
  criarCargoAction,
  editarCargoAction,
  type ActionState,
} from "../actions";
import { Field, Input, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

export type GrupoPermissoes = {
  grupo: string;
  permissoes: { chave: string; label: string }[];
};

export function CargoForm({
  grupos,
  cargo,
  ehCargoProprio = false,
}: {
  grupos: GrupoPermissoes[];
  /** presente = edição; ausente = criação */
  cargo?: {
    id: string;
    nome: string;
    nivel: number;
    ativo: boolean;
    permissoes: string[];
  };
  ehCargoProprio?: boolean;
}) {
  const action = cargo ? editarCargoAction : criarCargoAction;
  const [state, formAction, pending] = useActionState(action, inicial);
  const marcadas = new Set(cargo?.permissoes ?? []);

  return (
    <form action={formAction} className="space-y-5">
      {cargo && <input type="hidden" name="id" value={cargo.id} />}

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Field label="Nome do cargo">
            <Input
              name="nome"
              defaultValue={cargo?.nome ?? ""}
              placeholder="Ex.: Assistente de Logística N2"
            />
          </Field>
        </div>
        <Field label="Nível" hint="(ordem)">
          <Input
            name="nivel"
            type="number"
            min={0}
            max={99}
            defaultValue={cargo?.nivel ?? 0}
          />
        </Field>
      </div>

      {cargo && (
        <>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="ativo"
              defaultChecked={cargo.ativo}
              disabled={ehCargoProprio}
              className="h-4 w-4 rounded border-slate-300"
            />
            Cargo ativo
            {ehCargoProprio && (
              <span className="text-xs text-slate-400">
                — é o seu cargo, não pode ser desativado por você
              </span>
            )}
          </label>
          {ehCargoProprio && <input type="hidden" name="ativo" value="on" />}
        </>
      )}

      {/* Matriz de permissões por módulo */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">
          Regras de negócio do cargo
          <span className="ml-1 font-normal text-slate-400">
            (marque o que este cargo pode fazer)
          </span>
        </p>
        <div className="space-y-3">
          {grupos.map((g) => (
            <fieldset
              key={g.grupo}
              className="rounded-xl border border-slate-200 p-4"
            >
              <legend className="px-1 text-sm font-semibold text-slate-700">
                {g.grupo}
              </legend>
              <div className="mt-1 grid gap-2 sm:grid-cols-2">
                {g.permissoes.map((p) => (
                  <label
                    key={p.chave}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <input
                      type="checkbox"
                      name="permissoes"
                      value={p.chave}
                      defaultChecked={marcadas.has(p.chave)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </div>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Salvando..."
          : cargo
            ? "Salvar cargo e permissões"
            : "Criar cargo"}
      </Button>
    </form>
  );
}
