export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    console.log("Register API called at:", (/* @__PURE__ */ new Date()).toISOString());
    const { adminAuth, adminDb } = await import('../../../chunks/firebase-admin_w9s0bARV.mjs');
    if (!adminAuth || !adminDb) {
      console.error("Firebase Admin not initialized");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Service tidak tersedia saat ini"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const body = await request.json();
    const { email, password, nama_umkm, sektor, sosmed } = body;
    if (!email || !password || !nama_umkm || !sektor) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Semua field wajib diisi"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password minimal 6 karakter"
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: nama_umkm
    });
    await adminDb.collection("users").doc(userRecord.uid).set({
      email,
      nama_umkm,
      sektor,
      sosmed: sosmed || [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      role: "user"
    });
    return new Response(
      JSON.stringify({
        success: true,
        message: "Registrasi berhasil! Silakan login dengan akun baru Anda."
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    let errorMessage = "Gagal melakukan registrasi";
    if (error.code === "auth/email-already-exists") {
      errorMessage = "Email sudah terdaftar, gunakan email lain";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Format email tidak valid";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password terlalu lemah";
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        debug: process.env.NODE_ENV === "development" ? error.message : void 0
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
