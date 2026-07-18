"use client";

import { useActionState } from "react";
import { movimentarAction, type ActionState } from "./actions";
import { Field, Input, Select, Textarea, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

export function MovimentarForm({
  materialId,
  unidade,
  podeMovimentar,
}: {
  materialId: string;
  unidade: string;
  podeMovimentar: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    movimentarAction,
    inicial,
  );

  if (!podeMovimentar) {
    return (
      <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-500">
        Seu perfil pode consultar, mas não movimentar materiais.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="materialId" value={materialId} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <Select name="tipo" defaultValue="ENTRADA">
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </Select>
        </Field>
        <Field label={`Quantidade (${unidade})`}>
          <Input name="quantidade" type="number" min={1} placeholder="0" />
        </Field>
      </div>

      <Field label="Destino / Origem" hint="(opcional)">
        <Input
          name="destino"
          placeholder="Ex.: Setor de expedição / Fornecedor X"
        />
      </Field>

      <Field label="Observação" hint="(opcional)">
        <Textarea name="observacao" rows={2} />
      </Field>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Registrando..." : "Registrar movimentação"}
      </Button>
    </form>
  );
}
