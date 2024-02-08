import { type HttpContext } from '@adonisjs/core/http'

export default class VideosController {
  async index({ view, params }: HttpContext) {
    return view.render('pages/video', { link: `/stream/${params.id}/stream.m3u8` })
  }
}
