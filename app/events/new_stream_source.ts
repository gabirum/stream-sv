import StreamSource from '#models/stream_source'
import { BaseEvent } from '@adonisjs/core/events'

export default class NewStreamSource extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public source: StreamSource) {
    super()
  }
}
