"use client";

import { useActionState } from "react";
import Link from "next/link";
import { criarMaterialAction, type ActionState } from "../actions";
import { Field, Input, Select, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

export function NovoMaterialForm() {
  const [state, formAction, pending] = useActionState(
    criarMaterialAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Código">
          <Input name="codigo" placeholder="Ex.: MAT-010" />
        </Field>
        <Field label="Unidade">
          <Input
            name="unidade"
            defaultValue="UN"
            placeholder="UN, CX, L, KG..."
          />
        </Field>
      </div>

      <Field label="Nome">
        <Input name="nome" placeholder="Ex.: Álcool em gel 500ml" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <Select name="categoria" defaultValue="USO_DIARIO">
            <option value="USO_DIARIO">Uso diário</option>
            <option value="LIMPEZA">Limpeza</option>
          </Select>
        </Field>
        <Field label="Estoque mínimo">
          <Input name="estoqueMinimo" type="number" min={0} defaultValue={0} />
        </Field>
      </div>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && (
        <Alert tone="success">
          {state.ok}{" "}
          <Link href="/painel/almoxarifado" className="underline">
            Ver materiais
          </Link>
        </Alert>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Cadastrar material"}
      </Button>
    </form>
  );
}
