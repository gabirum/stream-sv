import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { createReadStream } from 'node:fs'
import { access, constants, readFile } from 'node:fs/promises'
import { Readable } from 'node:stream'

const safeAccess = (path: string) =>
  access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false)

export default class StreamsController {
  async index({ params, response }: HttpContext) {
    const path = app.tmpPath(params.id, params.file)

    if (!(await safeAccess(path))) {
      response.notFound()
      return
    }

    if (path.endsWith('.m3u8')) {
      const content = await readFile(path, 'utf-8')

      const data = content
        .split('\n')
        .map((line) => {
          if (line.startsWith('#') || line.length === 0) {
            return line
          }

          return `http://localhost:3333/stream/${params.id}/${line}`
        })
        .join('\n')

      response.stream(Readable.from(data))
      return
    }

    response.stream(createReadStream(path))
  }
}
