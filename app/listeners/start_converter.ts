import StreamSource from '#models/stream_source'
import { StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class StartConverter {
  constructor(private readonly service: StreamConverterManager) {}

  handle(source: StreamSource) {
    this.service.add(source)
  }
}
