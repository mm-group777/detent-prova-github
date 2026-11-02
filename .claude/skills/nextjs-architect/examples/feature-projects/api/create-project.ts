// src/features/projects/api/create-project.ts
//
// Server Action: autorizzazione → validazione → effetto → invalidazione → navigazione.
// Ogni Server Action è un endpoint HTTP pubblico: chiunque può invocarla con un
// payload arbitrario. Nascondere il bottone nella UI non protegge niente.
"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { createProjectSchema } from "../schemas/project";
import type { ActionState } from "../types";

export async function createProject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1. Autorizzazione
  const user = await requireUser();

  // 2. Validazione. formData arriva dalla rete, non dal tuo form:
  //    i vincoli scritti nell'HTML non sono garanzie.
  const parsed = createProjectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    budget: formData.get("budget") || undefined,
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Controlla i campi evidenziati",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. Effetto
  let project;
  try {
    project = await db.projects.create({
      data: { ...parsed.data, ownerId: user.id },
    });
  } catch (error) {
    // Errore INATTESO: logga il dettaglio, restituisci un messaggio generico.
    // Il messaggio del DB può rivelare struttura e a volte dati.
    logger.error("createProject failed", { error, userId: user.id });
    return { status: "error", message: "Non è stato possibile creare il progetto. Riprova." };
  }

  // 4. Invalidazione della cache. In Next 16 revalidateTag vuole il profilo
  //    come secondo argomento: se ottieni un errore TS qui, è quasi sempre questo.
  revalidateTag("projects", "max");

  // 5. Navigazione. redirect() funziona lanciando un'eccezione: va chiamato
  //    FUORI dal try/catch, altrimenti il catch la intercetta e non navighi.
  redirect(`/projects/${project.id}`);
}
