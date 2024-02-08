/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const SourcesController = () => import('#controllers/sources_controller')
const StreamsController = () => import('#controllers/streams_controller')
const VideosController = () => import('#controllers/videos_controller')

router.resource('sources', SourcesController).only(['index', 'store', 'destroy'])
router.get('stream/:id/:file', [StreamsController, 'index'])
router.get('video/:id', [VideosController, 'index'])
