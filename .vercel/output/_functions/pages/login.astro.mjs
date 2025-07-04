import { c as createComponent, d as renderTemplate, f as createAstro, a as renderComponent, r as renderHead, e as addAttribute } from '../chunks/astro/server_CR1q8Skd.mjs';
import 'kleur/colors';
import { $ as $$Navbar, a as $$Footer } from '../chunks/footer_LNyrN76G.mjs';
import 'clsx';
/* empty css                                 */
import { a as actions } from '../chunks/_astro_actions_DKVyX9cp.mjs';
export { renderers } from '../renderers.mjs';

const $$LoginStyle = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate``;
}, "D:/project/web/tukangcs/absent-accretion/src/components/styles/LoginStyle.astro", void 0);

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const result = Astro2.getActionResult(actions.login);
  const sessionCookie = Astro2.cookies.get("session");
  if (sessionCookie?.value) {
    try {
      const { adminAuth } = await import('../chunks/firebase-admin_BfKP5ctk.mjs');
      if (adminAuth) {
        await adminAuth.verifySessionCookie(sessionCookie.value);
        return Astro2.redirect("/dashboard");
      }
    } catch (error) {
      Astro2.cookies.delete("session");
    }
  }
  if (result && !result.error) {
    return Astro2.redirect("/dashboard");
  }
  return renderTemplate`<html lang="id"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Login - TukangCS</title>${renderComponent($$result, "LoginStyle", $$LoginStyle, {})}${renderHead()}</head> <body> ${renderComponent($$result, "Navbar", $$Navbar, {})} <div class="container"> <h1>Login</h1> <form method="POST"${addAttribute(actions.login, "action")}> <div id="message"> ${result?.error && renderTemplate`<div class="message error">${result.error.message}</div>`} ${result && !result.error && renderTemplate`<div class="message success">Login berhasil!</div>`} </div> <input type="email" name="email" placeholder="Gmail" required${addAttribute(result?.error ? Astro2.url.searchParams.get("email") || "" : "", "value")}> <input type="password" name="password" placeholder="Password" required> <button type="submit">Masuk</button> </form> <p class="note">Belum punya akun? <a href="/register">Daftar di sini</a></p> </div> ${renderComponent($$result, "Footer", $$Footer, {})} </body></html>`;
}, "D:/project/web/tukangcs/absent-accretion/src/pages/login.astro", void 0);

const $$file = "D:/project/web/tukangcs/absent-accretion/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
