import { StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class DropConverter {
  constructor(private readonly service: StreamConverterManager) {}

  handle(id: string) {
    this.service.drop(id)
  }
}
