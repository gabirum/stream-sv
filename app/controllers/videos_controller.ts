import StreamSource from '#models/stream_source'
import { type HttpContext } from '@adonisjs/core/http'

export default class VideosController {
  async index({ view, params }: HttpContext) {
    const source = await StreamSource.findOrFail(params.id)

    return view.render('pages/video', { link: `/stream/${source.id}/stream.m3u8` })
  }
}
