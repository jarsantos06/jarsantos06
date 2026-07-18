"use client";

import { useActionState, useRef } from "react";
import { criarFuncionarioAction, type ActionState } from "../../actions";
import { Field, Input, Select, Button, Alert } from "@/components/ui";

const inicial: ActionState = {};

type Opcao = { id: string; nome: string };

export function NovoFuncionarioForm({ cargos }: { cargos: Opcao[] }) {
  const [state, formAction, pending] = useActionState(
    criarFuncionarioAction,
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Matrícula">
          <Input name="matricula" placeholder="Ex.: 6001" maxLength={20} />
        </Field>
        <Field label="Cargo">
          <Select name="cargoId" defaultValue="">
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
        <Input name="nome" placeholder="Nome do funcionário" />
      </Field>

      <Field label="E-mail" hint="(opcional)">
        <Input name="email" type="email" placeholder="email@empresa.com" />
      </Field>

      <Field
        label="Senha inicial"
        hint="(o funcionário usa no primeiro acesso)"
      >
        <Input name="senha" type="password" placeholder="Mínimo 6 caracteres" />
      </Field>

      {state.erro && <Alert tone="danger">{state.erro}</Alert>}
      {state.ok && <Alert tone="success">{state.ok}</Alert>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Cadastrando..." : "Cadastrar funcionário"}
      </Button>
    </form>
  );
}
