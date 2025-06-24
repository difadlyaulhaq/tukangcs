import type { APIRoute } from "astro";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Type definitions
interface UserData {
  email?: string;
  nama_umkm?: string;
  sektor?: string;
  sosmed?: string[] | string;
  bergabung?: string;
  createdAt?: string;
  [key: string]: any;
}

interface PesanData {
  id: string;
  nama?: string;
  isi?: string;
  waktu?: string;
  status?: string;
  userId?: string;
  [key: string]: any;
}

// Inisialisasi Firebase Admin SDK
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: import.meta.env.FIREBASE_PROJECT_ID,
        clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
        privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

const db = getFirestore();

export const GET: APIRoute = async ({ cookies }) => {
  try {
    // Validasi environment variables
    if (
      !import.meta.env.FIREBASE_PROJECT_ID ||
      !import.meta.env.FIREBASE_CLIENT_EMAIL ||
      !import.meta.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error("Missing Firebase configuration");
    }

    let userId = cookies.get("user_id")?.value;

    // Jika tidak ada user_id di cookie, ambil user pertama dari Firestore
    let user: UserData = {};
    if (!userId) {
      const usersSnap = await db.collection("users").limit(1).get();
      if (!usersSnap.empty) {
        user = usersSnap.docs[0].data() as UserData;
        userId = usersSnap.docs[0].id;
      }
    } else {
      const userDoc = await db.collection("users").doc(userId).get();
      user = userDoc.exists ? (userDoc.data() as UserData) || {} : {};
    }

    // Pastikan sosmed selalu array
    let sosmed: string[] = [];
    if (Array.isArray(user.sosmed)) {
      sosmed = user.sosmed as string[];
    } else if (typeof user.sosmed === "string") {
      sosmed = [user.sosmed];
    }

    // Gunakan createdAt jika bergabung tidak ada
    let bergabung = user.bergabung;
    if (!bergabung && user.createdAt) {
      try {
        bergabung = new Date(user.createdAt).toLocaleDateString("id-ID");
      } catch {
        bergabung = user.createdAt;
      }
    }

    // Ambil pesan terbaru
    let pesan: PesanData[] = [];
    try {
      const pesanSnap = await db
        .collection("pesan")
        .where("userId", "==", userId)
        .orderBy("waktu", "desc")
        .limit(3)
        .get();

      pesan = pesanSnap.docs.map((doc) => {
        const data = doc.data() as PesanData;
        return {
          id: doc.id,
          nama: data.nama || "Unknown",
          isi: data.isi || "No message",
          waktu: data.waktu || new Date().toISOString(),
          status: data.status || "baru",
        };
      });
    } catch (pesanError) {
      console.warn("Error fetching messages:", pesanError);
      pesan = [];
    }

    // Hitung statistik
    let pesanMasukCount = 0;
    let responOtomatisCount = 0;
    let perluPerhatianCount = 0;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pesanMasukSnap = await db
        .collection("pesan")
        .where("userId", "==", userId)
        .where("waktu", ">=", today.toISOString())
        .get();
      pesanMasukCount = pesanMasukSnap.size;

      const responOtomatisSnap = await db
        .collection("pesan")
        .where("userId", "==", userId)
        .where("status", "==", "otomatis")
        .get();
      responOtomatisCount = responOtomatisSnap.size;

      const perluPerhatianSnap = await db
        .collection("pesan")
        .where("userId", "==", userId)
        .where("status", "==", "perlu_perhatian")
        .get();
      perluPerhatianCount = perluPerhatianSnap.size;
    } catch (statsError) {
      console.warn("Error fetching statistics:", statsError);
      pesanMasukCount = 0;
      responOtomatisCount = 0;
      perluPerhatianCount = 0;
    }

    const responseData = {
      user: {
        email: user?.email || "-",
        nama_umkm: user?.nama_umkm || "-",
        sektor: user?.sektor || "-",
        sosmed,
        bergabung: bergabung || "-",
      },
      stats: {
        pesanMasuk: pesanMasukCount,
        responOtomatis: responOtomatisCount,
        perluPerhatian: perluPerhatianCount,
        pesanTerbaru: pesan,
      },
    };

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("DASHBOARD API ERROR:", err);

    // Fallback response jika semua gagal
    const fallbackData = {
      user: {
        email: "demo@example.com",
        nama_umkm: "Demo UMKM",
        sektor: "Demo Sektor",
        sosmed: ["Instagram", "WhatsApp"],
        bergabung: new Date().toLocaleDateString("id-ID"),
      },
      stats: {
        pesanMasuk: 0,
        responOtomatis: 0,
        perluPerhatian: 0,
        pesanTerbaru: [] as PesanData[],
      },
    };

    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  }
};