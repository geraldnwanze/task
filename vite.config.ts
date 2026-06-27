import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))
const dataFilePath = resolve(projectRoot, 'data/task-data.json')
const defaultData = {
  expenses: [],
  tasks: [],
}

const ensureDataFile = () => {
  mkdirSync(dirname(dataFilePath), { recursive: true })

  if (!existsSync(dataFilePath)) {
    writeFileSync(dataFilePath, `${JSON.stringify(defaultData, null, 2)}\n`)
  }
}

const readRequestBody = (request: IncomingMessage) =>
  new Promise<string>((resolveBody, rejectBody) => {
    let body = ''

    request.on('data', (chunk: Buffer) => {
      body += chunk.toString()
    })
    request.on('end', () => resolveBody(body))
    request.on('error', rejectBody)
  })

const sendJson = (response: ServerResponse, statusCode: number, body: unknown) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(body))
}

const taskDataPlugin = (): Plugin => ({
  configureServer(server) {
    server.middlewares.use('/api/data', (request, response) => {
      void (async () => {
        ensureDataFile()

        if (request.method === 'GET') {
          sendJson(response, 200, JSON.parse(readFileSync(dataFilePath, 'utf-8')))
          return
        }

        if (request.method === 'PUT') {
          const body = await readRequestBody(request)
          const parsedData = JSON.parse(body)
          const nextFileContents = `${JSON.stringify(parsedData, null, 2)}\n`

          if (readFileSync(dataFilePath, 'utf-8') !== nextFileContents) {
            writeFileSync(dataFilePath, nextFileContents)
          }

          sendJson(response, 200, { ok: true })
          return
        }

        sendJson(response, 405, { error: 'Method not allowed' })
      })().catch(() => {
        sendJson(response, 500, { error: 'Unable to access data file' })
      })
    })
  },
  name: 'task-data-file-api',
})

const pwaBuildVersionPlugin = (): Plugin => {
  let viteConfig: ResolvedConfig

  return {
    closeBundle() {
      if (viteConfig.command !== 'build') {
        return
      }

      const swSourcePath = resolve(projectRoot, 'public/sw.js')
      const swOutputPath = resolve(projectRoot, viteConfig.build.outDir, 'sw.js')
      const buildId = `${Date.now()}`
      const swSource = readFileSync(swSourcePath, 'utf-8')

      writeFileSync(
        swOutputPath,
        swSource.replaceAll('__TASK_LEDGER_BUILD_ID__', buildId),
      )
    },
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig
    },
    name: 'pwa-build-version',
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), taskDataPlugin(), pwaBuildVersionPlugin()],
  server: {
    watch: {
      ignored: ['**/data/task-data.json'],
    },
  },
})
