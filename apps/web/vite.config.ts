import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // Workspace packages are consumed as TypeScript SOURCE, not as a built
      // artefact — each app compiles them with its own React and Vite. That is
      // what lets apps/web (React 18) and apps/admin (React 19) share the same
      // primitives while they sit on different majors.
      '@cabmora/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@cabmora/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
    },
  },
  server: {
    port: 5173,
    // Bind all interfaces so the dev server is reachable from outside the
    // container. Harmless when running on the host.
    host: true,
    proxy: {
      '/api': {
        // Inside Docker the API is another container ("api"), not localhost.
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
      // Share links are served by the API, not the SPA — they are HTML with
      // Open Graph tags so WhatsApp and the rest can unfurl them. nginx
      // routes /s/ to the API in deployment; without the same here, a share
      // link opened locally falls through to the router and looks broken in
      // a way it never is in production.
      //
      // A regex, not a prefix. Vite matches a plain string key by prefix, so
      // '/s' also caught '/src/main.tsx' and every other module the dev
      // server serves — all of them proxied to the API, nothing resolved,
      // blank page. Keys beginning with ^ are treated as expressions, and
      // this one needs the slash after the s.
      '^/s/': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
