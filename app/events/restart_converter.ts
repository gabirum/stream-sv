import { BaseEvent } from '@adonisjs/core/events'

export default class RestartConverter extends BaseEvent {
  /**
   * Accept event data as constructor parameters
   */
  constructor(public id: string) {
    super()
  }
}
