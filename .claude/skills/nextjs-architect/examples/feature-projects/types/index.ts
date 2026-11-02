// src/features/projects/types/index.ts
import type { projectStatus } from "../schemas/project";

export type ProjectStatus = (typeof projectStatus)[number];

export type Project = {
  id: string;
  name: string;
  description: string | null;
  budget: number | null;
  status: ProjectStatus;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

// Risultato delle Server Action. Gli errori ATTESI (validazione, permessi) sono
// un valore di ritorno, non un'eccezione: l'utente deve vedere un messaggio nel
// form, non una pagina di errore.
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };
