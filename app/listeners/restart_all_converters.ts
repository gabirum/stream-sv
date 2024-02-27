import type RestartAllConvertersEvent from '#events/restart_all_converters'
import { type StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class RestartAllConverters {
  constructor(private readonly service: StreamConverterManager) {}

  async handle(_event: RestartAllConvertersEvent) {
    this.service.restartAll()
  }
}
