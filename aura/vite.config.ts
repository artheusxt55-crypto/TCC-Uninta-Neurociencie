// aura/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/aura/', // ISSO AQUI É A CHAVE! Diz que a Aura mora na pasta /aura/
  build: {
    outDir: '../public/aura', // Joga o resultado para uma pasta que a raiz enxerga
    emptyOutDir: true,
  }
})
