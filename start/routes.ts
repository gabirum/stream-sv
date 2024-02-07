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

router.resource('sources', SourcesController).only(['index', 'store', 'destroy'])
