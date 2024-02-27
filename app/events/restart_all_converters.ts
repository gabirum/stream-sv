import { BaseEvent } from '@adonisjs/core/events'

export default class RestartAllConverters extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor() {
    super()
  }
}
