import { c as createComponent, r as renderHead, a as renderComponent, b as renderScript, d as renderTemplate } from '../chunks/astro/server_BmReEcGK.mjs';
import 'kleur/colors';
import { $ as $$Navbar, a as $$Footer } from '../chunks/footer_5O4tyabJ.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Contact = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" data-astro-cid-uw5kdbxl> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Contact - Arctiq</title>${renderHead()}</head> <body data-astro-cid-uw5kdbxl> <!-- Navbar --> ${renderComponent($$result, "Navbar", $$Navbar, { "data-astro-cid-uw5kdbxl": true })} <!-- Main Content --> <section class="bg-gradient-to-br" data-astro-cid-uw5kdbxl> <div class="container" style="margin-top: 4rem;" data-astro-cid-uw5kdbxl> <!-- Contact Form Section --> <div class="form-section" data-astro-cid-uw5kdbxl> <h1 data-astro-cid-uw5kdbxl>We're here to help</h1> <form id="contactForm" data-astro-cid-uw5kdbxl> <div class="form-group" data-astro-cid-uw5kdbxl> <label for="name" data-astro-cid-uw5kdbxl>Name</label> <input type="text" id="name" name="name" placeholder="e.g. John Smith" required data-astro-cid-uw5kdbxl> </div> <div class="form-group" data-astro-cid-uw5kdbxl> <label for="email" data-astro-cid-uw5kdbxl>Email address</label> <input type="email" id="email" name="email" placeholder="e.g. example@gmail.com" required data-astro-cid-uw5kdbxl> </div> <div class="form-group" data-astro-cid-uw5kdbxl> <label for="message" data-astro-cid-uw5kdbxl>Message</label> <textarea id="message" name="message" placeholder="Let us know how we can help..." required data-astro-cid-uw5kdbxl></textarea> </div> <button type="submit" class="submit-btn" data-astro-cid-uw5kdbxl>Send message</button> </form> </div> <!-- Testimonial Section --> <!-- <div class="testimonial-section">
            <div class="testimonial-card">
                <div class="testimonial-header">
                    <div class="testimonial-logo">🔗 Arctiq</div>
                    <div class="nav-arrows">
                        <div class="nav-arrow">←</div>
                        <div class="nav-arrow">→</div>
                    </div>
                </div>
                
                <div class="testimonial-text">
                    "Arctic <span class="testimonial-highlight">cut project delays by 30%</span> and transformed our global team communication, saving us hours every week."
                </div>
                
                <div class="testimonial-company">
                    <span class="ebay-logo">ebay</span>
                </div>
            </div>
        </div> --> </div> </section> <!-- Footer --> <footer data-astro-cid-uw5kdbxl> ${renderComponent($$result, "Footer", $$Footer, { "data-astro-cid-uw5kdbxl": true })} ${renderScript($$result, "D:/project/web/tukangcs/absent-accretion/src/pages/contact.astro?astro&type=script&index=0&lang.ts")} </footer> </body></html>`;
}, "D:/project/web/tukangcs/absent-accretion/src/pages/contact.astro", void 0);

const $$file = "D:/project/web/tukangcs/absent-accretion/src/pages/contact.astro";
const $$url = "/contact";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Contact,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
