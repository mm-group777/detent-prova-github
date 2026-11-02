// src/features/projects/components/create-project-form.tsx
//
// Client Component: ha stato di form ed eventi, quindi "use client" sta QUI —
// sulla foglia — e non sulla pagina, che resta un Server Component.
//
// useActionState collega il form alla Server Action: niente fetch scritto a
// mano, niente stato di loading gestito manualmente, e il form funziona anche
// prima che il JavaScript sia stato idratato (progressive enhancement).
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createProject } from "../api/create-project";
import type { ActionState } from "../types";

const initialState: ActionState = { status: "idle" };

export function CreateProjectForm() {
  const [state, formAction] = useActionState(createProject, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          // aria-invalid + aria-describedby: gli screen reader annunciano
          // l'errore invece di lasciare l'utente davanti a un campo rosso muto.
          aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.name)}
          aria-describedby={state.status === "error" && state.fieldErrors?.name ? "name-error" : undefined}
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        {state.status === "error" && state.fieldErrors?.name && (
          <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium">
          Budget (opzionale)
        </label>
        <input
          id="budget"
          name="budget"
          type="number"
          min="0"
          step="0.01"
          className="mt-1 w-full rounded-md border px-3 py-2"
        />
        {state.status === "error" && state.fieldErrors?.budget && (
          <p role="alert" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.budget[0]}
          </p>
        )}
      </div>

      {/* Errore non legato a un campo: DB giù, permessi mancanti. */}
      {state.status === "error" && !state.fieldErrors && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}

// useFormStatus va letto in un componente FIGLIO del form: nel componente che
// contiene il <form> restituirebbe sempre pending: false.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-4 py-2 font-medium disabled:opacity-50"
    >
      {pending ? "Creazione…" : "Crea progetto"}
    </button>
  );
}
