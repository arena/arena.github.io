import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

// In dev, serve public/<dir>/index.html for /<dir>/ the way GitHub Pages does,
// instead of falling back to the React app's index.html.
const publicDirIndex = (): Plugin => ({
  name: 'public-dir-index',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const [path, query] = (req.url ?? '/').split('?')
      if (path === '/' || !existsSync(join(server.config.publicDir, path, 'index.html'))) {
        return next()
      }
      if (!path.endsWith('/')) {
        // GitHub Pages redirects /dir to /dir/, so relative links resolve the same.
        res.writeHead(301, { Location: path + '/' + (query ? '?' + query : '') })
        return res.end()
      }
      req.url = path + 'index.html' + (query ? '?' + query : '')
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [publicDirIndex(), react()],
})
