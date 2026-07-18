"use client";

import { useActionState, useRef } from "react";
import { criarOcorrenciaAction, type ActionState } from "./actions";
import { Field, Input, Select, Textarea, Button, Alert } from "@/components/ui";

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
      <Field label="Funcionário">
        <Input value={nomeUsuario} disabled />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <Select name="tipo" defaultValue="FALTA">
            <option value="FALTA">Falta</option>
            <option value="ATRASO">Atraso</option>
          </Select>
        </Field>
        <Field label="Data da ocorrência">
          <Input name="dataOcorrencia" type="date" />
        </Field>
      </div>

      <Field label="Motivo">
        <Textarea
          name="motivo"
          rows={3}
          placeholder="Descreva o motivo da falta ou atraso"
        />
      </Field>

      <Field label="Evidência" hint="(opcional — imagem)">
        <Input
          name="evidencia"
          type="file"
          accept="image/*"
          className="file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
      </Field>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando..." : "Enviar para aprovação"}
      </Button>
    </form>
  );
}
