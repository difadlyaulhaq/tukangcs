import type { APIRoute } from "astro";
import { jwtDecode } from "jwt-decode";

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const phoneNumber = formData.get("phoneNumber") as string;
  const session = cookies.get("session")?.value;
  const decodedToken: {
    user_id: string;
  } = jwtDecode(session || "");
  try {
    const req = await fetch(
      `http://localhost:3000/session/${decodedToken.user_id}/${phoneNumber}`
    );
    const res: {
      message: string;
      pairing_code: string;
    } = await req.json();

    console.log("Response from WhatsApp service:", res);
    return new Response(
      JSON.stringify({
        res,
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
    return new Response(
      JSON.stringify({
        error: "Gagal menghubungkan WhatsApp",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
};
