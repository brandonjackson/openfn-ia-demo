import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `--mode lightning` (.env.lightning) builds the app to run on a real Lightning at /v3, as
// lightning-full-api serves it (docs/lightning-backend.md). In dev, everything outside /v3/,
// and /v3/sign_in, goes to the Lightning on port 4000, so this server looks like that one.
export default defineConfig(({ mode }) => ({
  base: mode === 'lightning' ? '/v3/' : '/openfn-ia-demo/',
  plugins: [react(), tailwindcss()],
  ...(mode === 'lightning' && {
    server: { proxy: { '^/(?!v3/)|^/v3/sign_in': { target: 'http://localhost:4000', ws: true } } },
  }),
}))
