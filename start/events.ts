import DeleteStreamSource from '#events/delete_stream_source'
import NewStreamSource from '#events/new_stream_source'
import emitter from '@adonisjs/core/services/emitter'

const StartConverter = () => import('#listeners/start_converter')
const DropConverter = () => import('#listeners/drop_converter')

emitter.on(NewStreamSource, [StartConverter])
emitter.on(DeleteStreamSource, [DropConverter])
