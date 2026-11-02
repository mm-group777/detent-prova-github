// src/features/projects/components/projects-list.tsx
//
// Server Component: nessun "use client", quindi zero JavaScript spedito al
// browser per questa lista. È il default — si passa a client solo dove serve
// davvero stato o eventi.
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import type { Project } from "../types";

type ProjectsListProps = {
  projects: Project[];
  total: number;
};

export function ProjectsList({ projects, total }: ProjectsListProps) {
  if (projects.length === 0) {
    // Lo stato vuoto è parte del design, non un caso limite: è la prima cosa
    // che vede ogni nuovo utente.
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Nessun progetto. Creane uno per iniziare.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{total} progetti</p>
      <ul className="divide-y rounded-lg border">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div>
                <span className="font-medium">{project.name}</span>
                <StatusBadge status={project.status} />
              </div>
              {project.budget !== null && (
                <span className="text-sm tabular-nums">
                  {formatCurrency(project.budget)}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Sotto-componente privato: usato solo qui, quindi resta qui. Sale in
// components/ui solo quando lo usa davvero una seconda feature.
function StatusBadge({ status }: { status: Project["status"] }) {
  const labels = { draft: "Bozza", active: "Attivo", archived: "Archiviato" } as const;
  return <span className="ml-2 rounded px-2 py-0.5 text-xs">{labels[status]}</span>;
}
