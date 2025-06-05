// ─── env.d.ts ─────────────────────────────────────────────────────────
/**
 * Declarem aquí quines variables exporta `@env`.
 * Haurien de coincidir amb el que tens a `.env`.
 */
declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
}
