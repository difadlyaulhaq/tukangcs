import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DttSE43h.mjs';
import { manifest } from './manifest_0EpuyXDW.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/_actions/_---path_.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/api/auth/login.astro.mjs');
const _page4 = () => import('./pages/api/auth/register.astro.mjs');
const _page5 = () => import('./pages/api/auth/signout.astro.mjs');
const _page6 = () => import('./pages/api/dashboard-data.astro.mjs');
const _page7 = () => import('./pages/api/knowledge-base/delete.astro.mjs');
const _page8 = () => import('./pages/api/knowledge-base/list.astro.mjs');
const _page9 = () => import('./pages/api/knowledge-base/stats.astro.mjs');
const _page10 = () => import('./pages/api/knowledge-base/text.astro.mjs');
const _page11 = () => import('./pages/api/knowledge-base/upload.astro.mjs');
const _page12 = () => import('./pages/api/knowledge-base/_id_.astro.mjs');
const _page13 = () => import('./pages/api/test-env.astro.mjs');
const _page14 = () => import('./pages/api/whatsapp/connect.astro.mjs');
const _page15 = () => import('./pages/api/whatsapp/connect copy.astro.mjs');
const _page16 = () => import('./pages/api/whatsapp/messages.astro.mjs');
const _page17 = () => import('./pages/api/whatsapp/send.astro.mjs');
const _page18 = () => import('./pages/api/whatsapp/status.astro.mjs');
const _page19 = () => import('./pages/contact.astro.mjs');
const _page20 = () => import('./pages/dashboard.astro.mjs');
const _page21 = () => import('./pages/get-started.astro.mjs');
const _page22 = () => import('./pages/login.astro.mjs');
const _page23 = () => import('./pages/product.astro.mjs');
const _page24 = () => import('./pages/register.astro.mjs');
const _page25 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["node_modules/astro/dist/actions/runtime/route.js", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/api/auth/login.ts", _page3],
    ["src/pages/api/auth/register.ts", _page4],
    ["src/pages/api/auth/signout.ts", _page5],
    ["src/pages/api/dashboard-data.ts", _page6],
    ["src/pages/api/knowledge-base/delete.ts", _page7],
    ["src/pages/api/knowledge-base/list.ts", _page8],
    ["src/pages/api/knowledge-base/stats.ts", _page9],
    ["src/pages/api/knowledge-base/text.ts", _page10],
    ["src/pages/api/knowledge-base/upload.ts", _page11],
    ["src/pages/api/knowledge-base/[id].ts", _page12],
    ["src/pages/api/test-env.ts", _page13],
    ["src/pages/api/whatsapp/connect.ts", _page14],
    ["src/pages/api/whatsapp/connect copy.js", _page15],
    ["src/pages/api/whatsapp/messages.js", _page16],
    ["src/pages/api/whatsapp/send.js", _page17],
    ["src/pages/api/whatsapp/status.ts", _page18],
    ["src/pages/contact.astro", _page19],
    ["src/pages/dashboard.astro", _page20],
    ["src/pages/get-started.astro", _page21],
    ["src/pages/login.astro", _page22],
    ["src/pages/product.astro", _page23],
    ["src/pages/register.astro", _page24],
    ["src/pages/index.astro", _page25]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_astro-internal_actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "c4bdf135-5d37-4ad3-84a7-217659b3ac6c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
