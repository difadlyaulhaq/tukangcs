export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async () => {
  return new Response(
    JSON.stringify({
      NODE_ENV: process.env.NODE_ENV,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "✓ Set" : "✗ Missing",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "✓ Set" : "✗ Missing",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
      FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID ? "✓ Set" : "✗ Missing",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, null, 2),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
