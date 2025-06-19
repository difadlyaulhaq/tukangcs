import { a as adminAuth, b as adminDb } from '../../../chunks/firebase-admin_VpHvryV6.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  console.log("Login API called at:", (/* @__PURE__ */ new Date()).toISOString());
  console.log("Environment check:", {
    NODE_ENV: process.env.NODE_ENV,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "✓" : "✗"
  });
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email dan password wajib diisi"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const apiKey = "AIzaSyD_b0lWXcpnNbSRIt1v9A1jCgCsfXWI6Zw";
    const authResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      }
    );
    const authData = await authResponse.json();
    if (!authResponse.ok) {
      let errorMessage = "Login gagal";
      if (authData.error) {
        switch (authData.error.message) {
          case "EMAIL_NOT_FOUND":
            errorMessage = "Email tidak terdaftar";
            break;
          case "INVALID_PASSWORD":
            errorMessage = "Password salah";
            break;
          case "USER_DISABLED":
            errorMessage = "Akun telah dinonaktifkan";
            break;
          case "TOO_MANY_ATTEMPTS_TRY_LATER":
            errorMessage = "Terlalu banyak percobaan, coba lagi nanti";
            break;
          case "INVALID_LOGIN_CREDENTIALS":
            errorMessage = "Email atau password salah";
            break;
          default:
            errorMessage = "Login gagal, periksa email dan password";
        }
      }
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const decodedToken = await adminAuth.verifyIdToken(authData.idToken);
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const fiveDays = 60 * 60 * 24 * 5 * 1e3;
    const sessionCookie = await adminAuth.createSessionCookie(authData.idToken, {
      expiresIn: fiveDays
    });
    cookies.set("__session", sessionCookie, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: fiveDays / 1e3
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Login berhasil",
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          nama_umkm: userData?.nama_umkm || "",
          sektor: userData?.sektor || "",
          sosmed: userData?.sosmed || []
        },
        session: {
          access_token: authData.idToken,
          refresh_token: authData.refreshToken,
          expires_at: Math.floor(Date.now() / 1e3) + parseInt(authData.expiresIn)
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Terjadi kesalahan saat login"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
