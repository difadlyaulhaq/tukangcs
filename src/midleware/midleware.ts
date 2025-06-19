// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { adminAuth } from "../lib/firebase-admin";

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect } = context;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/signin', '/get-started'];
  
  const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtected) {
    const sessionCookie = cookies.get("__session")?.value;
    
    if (!sessionCookie) {
      return redirect("/signin");
    }
    
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      // Add user info to locals for use in pages
      context.locals.user = {
        uid: decodedClaims.uid,
        email: decodedClaims.email || '',
      };
    } catch (error) {
      // Invalid session, redirect to signin
      cookies.delete("__session", { path: "/" });
      return redirect("/signin");
    }
  }
  
  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute) {
    const sessionCookie = cookies.get("__session")?.value;
    
    if (sessionCookie) {
      try {
        await adminAuth.verifySessionCookie(sessionCookie, true);
        return redirect("/dashboard");
      } catch (error) {
        // Invalid session, clean up cookie
        cookies.delete("__session", { path: "/" });
      }
    }
  }
  
  return next();
});