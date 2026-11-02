// src/features/projects/schemas/project.ts
//
// Gli schema sono il confine tra "dati che controlliamo" e "dati che arrivano".
// I tipi TypeScript si derivano da qui con z.infer: una sola fonte di verità.
// Se scrivi lo schema E il tipo a mano, prima o poi divergono e il tipo mente.
import { z } from "zod";

export const projectStatus = ["draft", "active", "archived"] as const;

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Il nome è obbligatorio")
    .max(100, "Massimo 100 caratteri"),
  description: z.string().trim().max(1000).optional(),
  // I form HTML mandano sempre stringhe: la coercizione va qui, non nel componente.
  budget: z.coerce.number().positive("Il budget deve essere positivo").optional(),
  status: z.enum(projectStatus).default("draft"),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid(),
});

export const projectFiltersSchema = z.object({
  status: z.enum(projectStatus).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
