"use client";

import { useActionState } from "react";
import {
  criarTurnoAction,
  criarPadraoAction,
  type ActionState,
} from "../actions";
import { Field, Input, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

export function NovoTurnoForm() {
  const [state, action, pending] = useActionState(criarTurnoAction, inicial);
  return (
    <form action={action} className="space-y-3">
      <Field label="Nome">
        <Input name="nome" placeholder="Ex.: Comercial" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Início">
          <Input name="horaInicio" type="time" />
        </Field>
        <Field label="Fim">
          <Input name="horaFim" type="time" />
        </Field>
      </div>
      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Criar turno"}
      </Button>
    </form>
  );
}

export function NovoPadraoForm() {
  const [state, action, pending] = useActionState(criarPadraoAction, inicial);
  return (
    <form action={action} className="space-y-3">
      <Field label="Nome">
        <Input name="nome" placeholder="Ex.: 4x2" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Dias de trabalho">
          <Input name="diasTrabalho" type="number" min={1} />
        </Field>
        <Field label="Dias de folga">
          <Input name="diasFolga" type="number" min={1} />
        </Field>
      </div>
      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}
      <Button type="submit" size="sm" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Criar padrão"}
      </Button>
    </form>
  );
}
