import type { APIRoute } from "astro";
import { adminAuth, adminDb } from "../../lib/firebase-admin";
import { jwtDecode } from "jwt-decode";

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

export const GET: APIRoute = async ({ cookies }) => {
  console.log('Dashboard data API called at:', new Date().toISOString());
  
  try {
    // Cek berbagai kemungkinan nama session cookie
    const sessionCookie = cookies.get("__session")?.value || 
                         cookies.get("session")?.value || 
                         cookies.get("sessionId")?.value;
    
    const userIdCookie = cookies.get("user_id")?.value;
    
    console.log('Session cookie exists:', !!sessionCookie);
    console.log('User ID cookie exists:', !!userIdCookie);
    
    if (!sessionCookie && !userIdCookie) {
      return new Response(
        JSON.stringify({
          error: "No session found",
          requiresAuth: true
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    let userId = userIdCookie;
    let user: UserData = {};

    try {
      // Jika ada session cookie, decode untuk mendapatkan user info
      if (sessionCookie) {
        // Verify session cookie dengan Firebase Admin
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        userId = decodedClaims.uid;
        console.log('Session verified for user:', userId);
      }

      // Jika masih tidak ada userId, return error
      if (!userId) {
        return new Response(
          JSON.stringify({
            error: "User ID not found",
            requiresAuth: true
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );
      }

      // Ambil data user dari Firestore
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
        user = userDoc.data() as UserData;
        console.log('User data loaded:', user.email);
      } else {
        console.log('User document not found for ID:', userId);
      }

    } catch (authError) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({
          error: "Invalid session",
          requiresAuth: true
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
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
    let pesanMasukCount = 0;
    let responOtomatisCount = 0;
    let perluPerhatianCount = 0;

    try {
      // Ambil pesan terbaru
      const pesanSnap = await adminDb
        .collection("pesan")
        .where("userId", "==", userId)
        .orderBy("waktu", "desc")
        .limit(5)
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

      // Hitung statistik
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Pesan masuk hari ini
      const pesanMasukSnap = await adminDb
        .collection("pesan")
        .where("userId", "==", userId)
        .where("waktu", ">=", todayISO)
        .get();
      pesanMasukCount = pesanMasukSnap.size;

      // Respon otomatis
      const responOtomatisSnap = await adminDb
        .collection("pesan")
        .where("userId", "==", userId)
        .where("status", "==", "otomatis")
        .get();
      responOtomatisCount = responOtomatisSnap.size;

      // Perlu perhatian
      const perluPerhatianSnap = await adminDb
        .collection("pesan")
        .where("userId", "==", userId)
        .where("status", "==", "perlu_perhatian")
        .get();
      perluPerhatianCount = perluPerhatianSnap.size;

    } catch (firestoreError) {
      console.warn("Error fetching Firestore data:", firestoreError);
      // Biarkan dengan nilai default 0 dan array kosong
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

    console.log('Dashboard data response:', {
      userEmail: responseData.user.email,
      pesanCount: responseData.stats.pesanTerbaru.length
    });

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });

  } catch (error: any) {
    console.error("DASHBOARD API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        requiresAuth: false
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