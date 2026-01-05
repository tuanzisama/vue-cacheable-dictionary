import vue from '@vitejs/plugin-vue'
import express from 'express'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'

function mockExpressServer(): Plugin {
  return {
    name: 'mock-express-server',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const app = express()
      app.use(express.json())

      const data: Record<string, any[]> = {
        type: [
          { label: '类型A', value: 'A' },
          { label: '类型B', value: 'B' },
        ],
        status: [
          { label: '启用', value: 1, color: '#4caf50' },
          { label: '禁用', value: 0, color: '#f44336' },
        ],
        order_type: [
          { label: '线上', value: 'online' },
          { label: '线下', value: 'offline' },
        ],
      }

      app.get('/health', (_req, res) => {
        res.status(200).json({ ok: true })
      })

      app.post('/dict', (req, res) => {
        const keys = Array.isArray(req.body) ? req.body : []
        const result: Record<string, any[]> = {}

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          if (typeof key === 'string') {
            result[key] = data[key] ?? []
          }
        }

        res.status(200).json(result)
      })
      server.middlewares.use(app)
    },
  }
}

export default defineConfig(() => {
  const root = process.env.VITEST ? '.' : './playground'

  return {
    root,
    plugins: [vue(), mockExpressServer()],
    test: {
      root: '.',
    },
  }
})
