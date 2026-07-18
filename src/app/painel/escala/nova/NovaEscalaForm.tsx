"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarEscalaAction, type ActionState } from "../actions";
import { Field, Input, Select, Button, Alert } from "@/components/ui";

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
      <Field label="Funcionário">
        <Select name="funcionarioId" defaultValue={funcionarioIdInicial ?? ""}>
          <option value="" disabled>
            Selecione...
          </option>
          {funcionarios.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Padrão">
          <Select name="padraoId" defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            {padroes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Turno">
          <Select name="turnoId" defaultValue="">
            <option value="" disabled>
              Selecione...
            </option>
            {turnos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Início do ciclo">
          <Input name="dataInicio" type="date" />
        </Field>
        <Field label="Fim" hint="(opcional)">
          <Input name="dataFim" type="date" />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-400">
        Deixe o fim em branco para a escala ser <strong>padronizada</strong>{" "}
        (repete o ciclo automaticamente até uma nova escala substituí-la).
      </p>

      <Field label="Observação" hint="(opcional)">
        <Input name="observacao" placeholder="Ex.: cobertura de férias" />
      </Field>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && (
        <Alert tone="success">
          {state.ok}{" "}
          <Link href="/painel/escala/gerenciar" className="underline">
            Ver equipe
          </Link>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Atribuir escala"}
      </Button>
    </form>
  );
}
