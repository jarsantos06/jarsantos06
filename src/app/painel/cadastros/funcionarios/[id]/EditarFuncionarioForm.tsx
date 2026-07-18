"use client";

import { useActionState } from "react";
import { editarFuncionarioAction, type ActionState } from "../../actions";
import { Field, Input, Select, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

type Opcao = { id: string; nome: string };

export function EditarFuncionarioForm({
  funcionario,
  cargos,
  ehProprio,
}: {
  funcionario: {
    id: string;
    matricula: string;
    nome: string;
    email: string | null;
    cargoId: string | null;
    ativo: boolean;
  };
  cargos: Opcao[];
  ehProprio: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    editarFuncionarioAction,
    inicial,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={funcionario.id} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Matrícula" hint="(não muda)">
          <Input
            value={funcionario.matricula}
            disabled
            className="bg-slate-50"
          />
        </Field>
        <Field label="Cargo">
          <Select name="cargoId" defaultValue={funcionario.cargoId ?? ""}>
            <option value="" disabled>
              Selecione...
            </option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Nome completo">
        <Input name="nome" defaultValue={funcionario.nome} />
      </Field>

      <Field label="E-mail" hint="(opcional)">
        <Input
          name="email"
          type="email"
          defaultValue={funcionario.email ?? ""}
        />
      </Field>

      <Field label="Nova senha" hint="(deixe em branco para manter a atual)">
        <Input name="novaSenha" type="password" placeholder="••••••••" />
      </Field>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={funcionario.ativo}
          disabled={ehProprio}
          className="h-4 w-4 rounded border-slate-300"
        />
        Funcionário ativo (pode acessar o sistema)
        {ehProprio && (
          <span className="text-xs text-slate-400">
            — você não pode desativar a si mesmo
          </span>
        )}
      </label>
      {ehProprio && <input type="hidden" name="ativo" value="on" />}

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
