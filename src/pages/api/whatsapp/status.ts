import type { APIRoute } from "astro";
import { jwtDecode } from "jwt-decode";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const session = cookies.get("session")?.value;
    
    if (!session) {
      return new Response(
        JSON.stringify({
          error: "No session found",
          connected: false
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const decodedToken: {
      user_id: string;
    } = jwtDecode(session);

    // Check status from WhatsApp service
    const statusRes = await fetch(
      `http://localhost:3000/session`,
      {
        method: 'GET'
      }
    );

    if (!statusRes.ok) {
      return new Response(
        JSON.stringify({
          connected: false,
          error: "Service unavailable"
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const statusData: {
        id: string;
        status: string;
    }[] = await statusRes.json();

    const currentStatus = statusData.find(status => status.id === decodedToken.user_id);

    return new Response(
      JSON.stringify({
        connected: currentStatus?.status === "connected" || currentStatus?.status === "open",
        status: currentStatus?.status || "disconnected",
        phoneNumber: (currentStatus?.status === "connected" || currentStatus?.status === "open") ? "Connected" : null,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );

  } catch (error) {
    console.error("WhatsApp status check error:", error);
    
    return new Response(
      JSON.stringify({
        connected: false,
        error: "Internal server error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
