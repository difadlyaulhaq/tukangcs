import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_R_gJ-wu-.mjs';
import { manifest } from './manifest_BOaE-K_2.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/register.astro.mjs');
const _page4 = () => import('./pages/api/auth/signout.astro.mjs');
const _page5 = () => import('./pages/api/test-env.astro.mjs');
const _page6 = () => import('./pages/contact.astro.mjs');
const _page7 = () => import('./pages/dashboard.astro.mjs');
const _page8 = () => import('./pages/get-started.astro.mjs');
const _page9 = () => import('./pages/login.astro.mjs');
const _page10 = () => import('./pages/product.astro.mjs');
const _page11 = () => import('./pages/register.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/register.ts", _page3],
    ["src/pages/api/auth/signout.ts", _page4],
    ["src/pages/api/test-env.ts", _page5],
    ["src/pages/contact.astro", _page6],
    ["src/pages/dashboard.astro", _page7],
    ["src/pages/get-started.astro", _page8],
    ["src/pages/login.astro", _page9],
    ["src/pages/product.astro", _page10],
    ["src/pages/register.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "789489a3-ccc8-46ac-9f77-cb5729ad1d6b",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
