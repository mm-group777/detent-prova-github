// src/config/env.ts
//
// Validazione delle variabili d'ambiente all'avvio. Il punto non è l'eleganza:
// è fallire subito con un messaggio chiaro. Senza validazione una variabile
// mancante diventa `undefined` e produce un errore incomprensibile in
// produzione, tre livelli più in là e mezz'ora dopo il deploy.
import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve essere lungo almeno 32 caratteri"),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
});

// ATTENZIONE: tutto ciò che sta qui finisce nel bundle JavaScript ed è
// pubblicamente leggibile. Nessun segreto in questo schema, mai.
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

// Next sostituisce le NEXT_PUBLIC_* staticamente al build: vanno referenziate
// per nome esteso, non con un accesso dinamico a process.env.
const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

if (!parsedClient.success) {
  console.error("❌ Variabili d'ambiente client non valide:", parsedClient.error.flatten().fieldErrors);
  throw new Error("Configurazione client non valida");
}

export const clientEnv = parsedClient.data;

// Lo schema server si valida solo sul server: sul client process.env è vuoto.
function loadServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv non è accessibile dal client");
  }
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Variabili d'ambiente server non valide:", parsed.error.flatten().fieldErrors);
    throw new Error("Configurazione server non valida");
  }
  return parsed.data;
}

export const serverEnv = typeof window === "undefined" ? loadServerEnv() : ({} as never);
