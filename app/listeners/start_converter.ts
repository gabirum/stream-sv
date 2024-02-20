import NewStreamSource from '#events/new_stream_source'
import { StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class StartConverter {
  constructor(private readonly service: StreamConverterManager) {}

  handle(event: NewStreamSource) {
    this.service.add(event.source)
  }
}
