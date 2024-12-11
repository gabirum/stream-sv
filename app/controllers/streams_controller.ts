import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { access, constants, readFile } from 'node:fs/promises'

const safeAccess = (path: string) =>
  access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false)

const APP_URL = env.get('APP_URL')

export default class StreamsController {
  async index({ params, response }: HttpContext) {
    const path = app.tmpPath(params.id, params.file)

    if (!(await safeAccess(path))) {
      response.notFound()
      return
    }

    if (path.endsWith('.m3u8')) {
      const content = await readFile(path, 'utf-8')

      return content
        .split('\n')
        .map((line) => {
          if (line.startsWith('#') || line.length === 0) {
            return line
          }

          return `${APP_URL}/stream/${params.id}/${line}`
        })
        .join('\n')
    }

    response.download(path)
  }
}
