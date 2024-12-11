import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/static'

/**
 * Configuration options to tweak the static files middleware.
 * The complete set of options are documented on the
 * official documentation website.
 *
 * https://docs.adonisjs.com/guides/static-assets
 */
const staticServerConfig = defineConfig({
  enabled: true,
  etag: true,
  lastModified: true,
  dotFiles: 'ignore',
  immutable: app.inProduction,
  maxAge: app.inProduction ? '365d' : 0,
  cacheControl: true,
})

export default staticServerConfig
