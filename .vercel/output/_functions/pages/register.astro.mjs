import { c as createComponent, r as renderHead, b as renderScript, d as renderTemplate } from '../chunks/astro/server_BmReEcGK.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                                    */
export { renderers } from '../renderers.mjs';

const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="id" data-astro-cid-qraosrxq> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Daftar - TukangCS</title>${renderHead()}</head> <body data-astro-cid-qraosrxq> <div class="container" data-astro-cid-qraosrxq> <h1 data-astro-cid-qraosrxq>Daftar Akun</h1> <form id="register-form" data-astro-cid-qraosrxq> <div id="message" data-astro-cid-qraosrxq></div> <input type="text" name="nama_umkm" placeholder="Nama Perusahaan / UMKM" required data-astro-cid-qraosrxq> <input type="email" name="email" placeholder="Gmail" required data-astro-cid-qraosrxq> <input type="password" name="password" placeholder="Password" minlength="6" required data-astro-cid-qraosrxq> <input type="text" name="sektor" placeholder="Sektor Usaha" required data-astro-cid-qraosrxq> <div class="form-group" data-astro-cid-qraosrxq> <label for="sosmed" data-astro-cid-qraosrxq>Platform Sosial Media yang Ingin Dihubungkan:</label> <select id="sosmed" name="sosmed" multiple size="4" data-astro-cid-qraosrxq> <option value="whatsapp" data-astro-cid-qraosrxq>WhatsApp</option> <option value="telegram" data-astro-cid-qraosrxq>Telegram</option> <option value="instagram" data-astro-cid-qraosrxq>Instagram</option> <option value="facebook" data-astro-cid-qraosrxq>Facebook</option> </select> <small style="color: #94a3b8; font-size: 0.8rem;" data-astro-cid-qraosrxq>Tekan Ctrl/Cmd untuk memilih beberapa platform</small> </div> <button type="submit" id="submit-btn" data-astro-cid-qraosrxq>Daftar Sekarang</button> </form> <p class="note" data-astro-cid-qraosrxq>Sudah punya akun? <a href="/login" data-astro-cid-qraosrxq>Masuk di sini</a></p> </div> ${renderScript($$result, "D:/Perkuliahan/Perlombaan/ITFest/tukangcs/src/pages/register.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "D:/Perkuliahan/Perlombaan/ITFest/tukangcs/src/pages/register.astro", void 0);

const $$file = "D:/Perkuliahan/Perlombaan/ITFest/tukangcs/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
