// src/features/projects/api/get-projects.ts
//
// "server-only" fa fallire il BUILD se questo file viene importato da un
// componente client. È la protezione più economica che esista contro il
// classico incidente in cui una query — e le credenziali che usa — finisce
// nel bundle spedito al browser.
import "server-only";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { Project } from "../types";
import type { ProjectFilters } from "../schemas/project";

const PAGE_SIZE = 20;

export async function getProjects(filters: ProjectFilters): Promise<{
  projects: Project[];
  total: number;
}> {
  // L'autorizzazione sta QUI, vicino ai dati. Non nel proxy, non nella UI:
  // quelli si possono aggirare, questo no.
  const user = await requireUser();

  const where = {
    ownerId: user.id,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search ? { nameContains: filters.search } : {}),
  };

  // Le due query sono indipendenti: in parallelo, altrimenti le latenze si sommano.
  const [projects, total] = await Promise.all([
    db.projects.findMany({
      where,
      orderBy: { createdAt: "desc" },
      limit: PAGE_SIZE,
      offset: (filters.page - 1) * PAGE_SIZE,
    }),
    db.projects.count({ where }),
  ]);

  return { projects, total };
}

export async function getProject(id: string): Promise<Project | null> {
  const user = await requireUser();

  const project = await db.projects.findFirst({ where: { id } });
  if (!project) return null;

  // Non basta che l'utente sia autenticato: deve possedere QUESTA risorsa.
  // Saltare questo controllo è il modo più comune per costruire un IDOR.
  if (project.ownerId !== user.id) return null;

  return project;
}
