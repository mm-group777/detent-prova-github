// src/features/projects/utils/budget.ts
//
// Funzione pura di dominio: sa cosa sia un progetto, quindi vive nella feature.
// `formatCurrency`, che non sa niente di progetti, sta invece in src/utils/.
import type { Project } from "../types";

export function totalBudget(projects: Project[]): number {
  return projects.reduce((sum, p) => sum + (p.budget ?? 0), 0);
}

export function isOverBudget(project: Project, spent: number): boolean {
  if (project.budget === null) return false;
  return spent > project.budget;
}
