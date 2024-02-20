import { ConverterConfig } from '#services/stream_converter_manager_service'
import { BaseEvent } from '@adonisjs/core/events'

export default class NewStreamSource extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public source: ConverterConfig) {
    super()
  }
}
