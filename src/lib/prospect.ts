import { useRouterState } from "@tanstack/react-router";

export type ProspectSearch = { prospect?: string };

/**
 * `?prospect=Name` personalises any page and must survive navigation, so Jerry
 * can send a cold email straight at one feature and have the name follow the
 * visitor through the rest of the site.
 */
export function validateProspectSearch(search: Record<string, unknown>): ProspectSearch {
  const raw = search["prospect"];
  const prospect = typeof raw === "string" ? raw.trim().slice(0, 40) : "";
  return prospect ? { prospect } : {};
}

/** Reads the prospect name regardless of which route the visitor is on. */
export function useProspect(): string | undefined {
  return useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      return validateProspectSearch(search).prospect;
    },
  });
}

/** Spread into a `<Link search={...}>` to carry the name forward. */
export function prospectSearch(prospect?: string): ProspectSearch {
  return prospect ? { prospect } : {};
}
