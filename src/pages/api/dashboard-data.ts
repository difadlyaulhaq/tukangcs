import type { APIRoute } from "astro";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inisialisasi Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: import.meta.env.FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const userId = cookies.get("user_id")?.value || "demo_user";
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.exists ? userDoc.data() : {};

    const pesanSnap = await db
      .collection("pesan")
      .where("userId", "==", userId)
      .orderBy("waktu", "desc")
      .limit(3)
      .get();
    const pesan = pesanSnap.docs.map(doc => doc.data());

    const pesanMasuk = await db.collection("pesan").where("userId", "==", userId).get();
    const responOtomatis = await db.collection("pesan").where("userId", "==", userId).where("status", "==", "otomatis").get();
    const perluPerhatian = await db.collection("pesan").where("userId", "==", userId).where("status", "==", "perlu_perhatian").get();

    return new Response(
      JSON.stringify({
        user,
        stats: {
          pesanMasuk: pesanMasuk.size,
          responOtomatis: responOtomatis.size,
          perluPerhatian: perluPerhatian.size,
          pesanTerbaru: pesan,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("DASHBOARD API ERROR:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", detail: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};