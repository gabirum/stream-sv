import type RestartConverterEvent from '#events/restart_converter'
import { StreamConverterManager } from '#services/stream_converter_manager_service'
import { inject } from '@adonisjs/core'

@inject()
export default class RestartConverter {
  constructor(private readonly service: StreamConverterManager) {}

  async handle(event: RestartConverterEvent) {
    this.service.restart(event.id)
  }
}
