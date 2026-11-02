// src/features/projects/hooks/use-project-filters.ts
//
// I filtri vivono nell'URL, non in uno useState: così la pagina è
// condivisibile, il tasto indietro funziona e un refresh non azzera la vista.
// È anche ciò che permette al Server Component di leggerli da searchParams.
"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProjectStatus } from "../types";

export function useProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = useCallback(
    (key: "status" | "search", value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page"); // cambiare filtro riporta a pagina 1
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return {
    status: searchParams.get("status") as ProjectStatus | null,
    search: searchParams.get("search") ?? "",
    setFilter,
  };
}
