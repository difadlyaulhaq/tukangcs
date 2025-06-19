import { c as createComponent, e as createAstro, r as renderHead, b as renderScript, d as renderTemplate } from '../chunks/astro/server_Bbe2uEvn.mjs';
import 'kleur/colors';
import 'clsx';
import { b as adminDb } from '../chunks/firebase-admin_D9DK7rPw.mjs';
/* empty css                                     */
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const user = Astro2.locals.user;
  let userData = null;
  if (user?.uid) {
    try {
      const userDoc = await adminDb.collection("users").doc(user.uid).get();
      userData = userDoc.data();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }
  return renderTemplate`<html lang="id" data-astro-cid-3nssi2tu> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Dashboard - TukangCS</title>${renderHead()}</head> <body data-astro-cid-3nssi2tu> <div class="header" data-astro-cid-3nssi2tu> <div class="logo" data-astro-cid-3nssi2tu>TukangCS</div> <button class="logout-btn" onclick="logout()" data-astro-cid-3nssi2tu>Logout</button> </div> <div class="container" data-astro-cid-3nssi2tu> <div class="welcome-card" data-astro-cid-3nssi2tu> <h1 class="welcome-title" data-astro-cid-3nssi2tu>Selamat Datang! 👋</h1> <p class="welcome-subtitle" data-astro-cid-3nssi2tu>Anda berhasil masuk ke dashboard TukangCS</p> ${userData && renderTemplate`<div class="user-info" data-astro-cid-3nssi2tu> <h3 data-astro-cid-3nssi2tu>Informasi Profil</h3> ${user && renderTemplate`<p data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>Email:</strong> ${user.email}</p>`} <p data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>Nama UMKM:</strong> ${userData.nama_umkm}</p> <p data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>Sektor:</strong> ${userData.sektor}</p> ${userData.sosmed && userData.sosmed.length > 0 && renderTemplate`<p data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>Platform Sosmed:</strong> ${userData.sosmed.join(", ")}</p>`} <p data-astro-cid-3nssi2tu><strong data-astro-cid-3nssi2tu>Bergabung:</strong> ${new Date(userData.createdAt).toLocaleDateString("id-ID")}</p> </div>`} </div> <div class="features-grid" data-astro-cid-3nssi2tu> <div class="feature-card" data-astro-cid-3nssi2tu> <div class="feature-icon" data-astro-cid-3nssi2tu>🤖</div> <h3 class="feature-title" data-astro-cid-3nssi2tu>AI Customer Service <span class="coming-soon" data-astro-cid-3nssi2tu>Coming Soon</span></h3> <p class="feature-description" data-astro-cid-3nssi2tu>
Chatbot AI yang dapat menangani pertanyaan pelanggan secara otomatis 24/7
</p> </div> <div class="feature-card" data-astro-cid-3nssi2tu> <div class="feature-icon" data-astro-cid-3nssi2tu>📊</div> <h3 class="feature-title" data-astro-cid-3nssi2tu>Analytics Dashboard <span class="coming-soon" data-astro-cid-3nssi2tu>Coming Soon</span></h3> <p class="feature-description" data-astro-cid-3nssi2tu>
Analisis mendalam tentang interaksi pelanggan dan performa bisnis Anda
</p> </div> <div class="feature-card" data-astro-cid-3nssi2tu> <div class="feature-icon" data-astro-cid-3nssi2tu>🔗</div> <h3 class="feature-title" data-astro-cid-3nssi2tu>Multi-Platform Integration <span class="coming-soon" data-astro-cid-3nssi2tu>Coming Soon</span></h3> <p class="feature-description" data-astro-cid-3nssi2tu>
Hubungkan WhatsApp, Instagram, Facebook, dan platform lainnya dalam satu dashboard
</p> </div> <div class="feature-card" data-astro-cid-3nssi2tu> <div class="feature-icon" data-astro-cid-3nssi2tu>⚡</div> <h3 class="feature-title" data-astro-cid-3nssi2tu>Quick Responses <span class="coming-soon" data-astro-cid-3nssi2tu>Coming Soon</span></h3> <p class="feature-description" data-astro-cid-3nssi2tu>
Template respon cepat untuk pertanyaan yang sering diajukan pelanggan
</p> </div> </div> </div> ${renderScript($$result, "D:/project/web/tukangcs/absent-accretion/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts")} </body> </html> `;
}, "D:/project/web/tukangcs/absent-accretion/src/pages/dashboard.astro", void 0);

const $$file = "D:/project/web/tukangcs/absent-accretion/src/pages/dashboard.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
