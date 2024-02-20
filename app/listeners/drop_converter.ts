import DeleteStreamSource from '#events/delete_stream_source'
import { StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class DropConverter {
  constructor(private readonly service: StreamConverterManager) {}

  handle(event: DeleteStreamSource) {
    this.service.drop(event.id)
  }
}
