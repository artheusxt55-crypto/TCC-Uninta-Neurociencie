// aura/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Renomeie a saída do chat aqui para não ser "index"
        aura_chat: './index.html' 
      },
      output: {
        // Isso vai gerar um arquivo chamado aura_chat.html no final
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
})
