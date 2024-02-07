import type { HttpContext } from '@adonisjs/core/http'
import { getPagination } from '../utils/req.js'
import StreamSource from '#models/stream_source'
import { createStreamSourceValidator } from '#validators/stream_source'
import { cuid } from '@adonisjs/core/helpers'
import NewStreamSource from '#events/new_stream_source'
import DeleteStreamSource from '#events/delete_stream_source'

export default class SourcesController {
  async index({ view, request }: HttpContext) {
    const [page, perPage] = getPagination(request.qs())

    const sources = await StreamSource.query().paginate(page, perPage)
    sources.baseUrl('sources')

    return view.render('pages/sources', { sources })
  }

  async store({ request, response }: HttpContext) {
    const { url } = await request.validateUsing(createStreamSourceValidator)

    const streamSource = await StreamSource.create({ id: cuid(), url })
    await NewStreamSource.dispatch(streamSource)

    response.redirect().toRoute('sources.index')
  }

  async destroy({ params, response }: HttpContext) {
    const source = await StreamSource.findOrFail(params.id)

    await source.delete()
    await DeleteStreamSource.dispatch(source.id)

    response.redirect().toRoute('sources.index')
  }
}
