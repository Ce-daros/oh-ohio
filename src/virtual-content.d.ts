// Type declarations for the virtual modules provided by
// scripts/vite-plugin-content.mjs. The values are computed at build
// time from the canonical content sources.
declare module 'virtual:content-manifest' {
  const manifest: unknown;
  export default manifest;
}
declare module 'virtual:routes' {
  const catalog: unknown;
  export default catalog;
}
declare module 'virtual:coverage' {
  const coverage: {
    auditReviewedAt: string;
    totals: { documents: number; dossiers: number; sources: number };
    worldCoverage: { id: string; title: string; kinds: Record<string, number>; dossierIds: string[] }[];
    evidence: { verifiedDocuments: string[]; unverifiedDocuments: string[] };
  };
  export default coverage;
}
