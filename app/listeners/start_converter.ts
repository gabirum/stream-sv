import { ConverterConfig, StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class StartConverter {
  constructor(private readonly service: StreamConverterManager) {}

  handle(source: ConverterConfig) {
    this.service.add(source)
  }
}
