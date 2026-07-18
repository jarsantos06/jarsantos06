"use client";

import { useActionState, useRef } from "react";
import { travarAction, type ActionState } from "./actions";
import { Field, Input, Button, Alert } from "@/components/ui";

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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Placa">
          <Input
            name="placa"
            className="uppercase"
            placeholder="ABC1D23"
            maxLength={8}
          />
        </Field>
        <Field label="Ticket">
          <Input name="ticket" placeholder="Nº do ticket" maxLength={40} />
        </Field>
      </div>

      <Field label="Foto da carreta travada">
        <Input
          name="foto"
          type="file"
          accept="image/*"
          capture="environment"
          className="file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1 file:text-brand-700"
        />
        <span className="mt-1 block text-xs text-slate-400">
          A data e a hora são registradas automaticamente.
        </span>
      </Field>

      <Field label="Observação" hint="(opcional)">
        <Input
          name="observacao"
          placeholder="Ex.: Doca 3, aguardando conferência"
        />
      </Field>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Travando..." : "🔒 Travar carreta"}
      </Button>
    </form>
  );
}
