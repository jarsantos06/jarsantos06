"use client";

import { useActionState } from "react";
import { editarMaterialAction, type ActionState } from "../../actions";
import { Field, Input, Select, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

export function EditarMaterialForm({
  material,
}: {
  material: {
    id: string;
    nome: string;
    categoria: string;
    unidade: string;
    estoqueMinimo: number;
    ativo: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(
    editarMaterialAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={material.id} />

      <Field label="Nome">
        <Input name="nome" defaultValue={material.nome} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <Select name="categoria" defaultValue={material.categoria}>
            <option value="USO_DIARIO">Uso diário</option>
            <option value="LIMPEZA">Limpeza</option>
          </Select>
        </Field>
        <Field label="Unidade">
          <Input name="unidade" defaultValue={material.unidade} />
        </Field>
      </div>

      <Field label="Estoque mínimo">
        <Input
          name="estoqueMinimo"
          type="number"
          min={0}
          defaultValue={material.estoqueMinimo}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={material.ativo}
          className="h-4 w-4 rounded border-slate-300"
        />
        Material ativo (aparece na listagem)
      </label>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
