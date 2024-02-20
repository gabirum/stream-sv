import type { HttpContext } from '@adonisjs/core/http'
import { getPagination } from '../utils/req.js'
import StreamSource from '#models/stream_source'
import { createStreamSourceValidator } from '#validators/stream_source'
import { cuid } from '@adonisjs/core/helpers'
import NewStreamSource from '#events/new_stream_source'
import DeleteStreamSource from '#events/delete_stream_source'
import env from '#start/env'

export default class SourcesController {
  async index({ view, request }: HttpContext) {
    const [page, perPage] = getPagination(request.qs())

    const sources = await StreamSource.query().paginate(page, perPage)
    sources.baseUrl('sources')

    return view.render('pages/sources', { sources, app_url: env.get('APP_URL') })
  }

  async store({ request, response }: HttpContext) {
    const { url } = await request.validateUsing(createStreamSourceValidator)

    const data = { id: cuid(), url }
    await StreamSource.create(data)
    await NewStreamSource.dispatch(data)

    response.redirect().toRoute('sources.index')
  }

  async destroy({ params, response }: HttpContext) {
    const source = await StreamSource.findOrFail(params.id)

    await source.delete()
    await DeleteStreamSource.dispatch(source.id)

    response.redirect().toRoute('sources.index')
  }
}
