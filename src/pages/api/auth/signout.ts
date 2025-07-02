// src/pages/api/auth/signout.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ redirect, cookies }) => {
  cookies.delete("__session", {
    path: "/",
  });
  cookies.delete("sessionId", {
    path: "/",
  });
  cookies.delete("session", {
    path: "/",
  });
  return redirect("/");
};