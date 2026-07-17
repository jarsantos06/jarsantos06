"use client";

import { useActionState } from "react";
import { destravarAction, type ActionState } from "./actions";

const inicial: ActionState = {};

export function DestravarButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(destravarAction, inicial);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-green-300 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:opacity-60"
      >
        {pending ? "..." : "🔓 Destravar"}
      </button>
      {state.erro && <p className="mt-1 text-xs text-red-600">{state.erro}</p>}
    </form>
  );
}
