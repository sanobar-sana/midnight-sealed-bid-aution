import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import wasm from 'vite-plugin-wasm'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    (wasm as unknown as () => import('vite').Plugin)(),
    tailwindcss(),
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    // Midnight's excluded Compact runtime imports this CommonJS package from
    // browser ESM. Prebundle it so Vite provides the synthetic default export.
    include: ['object-inspect', '@subsquid/scale-codec'],
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js-protocol',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/midnight-js-types',
      '@midnightntwrk/onchain-runtime-v4',
    ],
  },
})
