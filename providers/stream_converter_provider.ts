import { StreamConverterManager } from '#services/stream_converter_manager_service'
import type { ApplicationService } from '@adonisjs/core/types'

export default class StreamConverterProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    this.app.container.singleton('stream_converter_manager', () => {
      return new StreamConverterManager()
    })
  }

  /**
   * The container bindings have booted
   */
  async boot() {}

  /**
   * The application has been booted
   */
  async start() {}

  /**
   * The process has been started
   */
  async ready() {
    const converter = await this.app.container.make('stream_converter_manager')
    const db = await this.app.container.make('lucid.db')

    const items = await db.from('stream_sources').select('id', 'url')

    converter.addMany(items)
  }

  /**
   * Preparing to shutdown the app
   */
  async shutdown() {
    const converter = await this.app.container.make('stream_converter_manager')

    converter.dropAll()
  }
}

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    stream_converter_manager: StreamConverterManager
  }
}
