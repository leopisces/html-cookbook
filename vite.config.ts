import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'

function contentBuilder() {
  return {
    name: 'content-builder',
    handleHotUpdate({ file, server }: { file: string; server: { ws: { send: (msg: object) => void } } }) {
      if (file.includes('demos') && file.endsWith('.html')) {
        console.log('[content-builder] Demo changed, regenerating content.json...')
        try {
          execSync('npx tsx scripts/build-content.ts', { stdio: 'inherit' })
          server.ws.send({ type: 'full-reload' })
        } catch (e) {
          console.error('[content-builder] Failed to regenerate:', e)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentBuilder()],
})
