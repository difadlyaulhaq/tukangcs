// src/pages/api/test-env.ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      NODE_ENV: import.meta.env.NODE_ENV,
      FIREBASE_PROJECT_ID: import.meta.env.FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
      FIREBASE_CLIENT_EMAIL: import.meta.env.FIREBASE_CLIENT_EMAIL ? '✓ Set' : '✗ Missing',
      FIREBASE_PRIVATE_KEY: import.meta.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '✗ Missing',
      FIREBASE_PRIVATE_KEY_ID: import.meta.env.FIREBASE_PRIVATE_KEY_ID ? '✓ Set' : '✗ Missing',
      timestamp: new Date().toISOString()
    }, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};