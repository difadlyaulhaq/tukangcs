import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import vercel from '@astrojs/vercel/serverless'; // or '@astrojs/vercel/edge'

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [svelte()],
});
