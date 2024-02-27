import DeleteStreamSource from '#events/delete_stream_source'
import NewStreamSource from '#events/new_stream_source'
import RestartAllConverters from '#events/restart_all_converters'
import RestartConverter from '#events/restart_converter'
import emitter from '@adonisjs/core/services/emitter'

const StartConverter = () => import('#listeners/start_converter')
const DropConverter = () => import('#listeners/drop_converter')
const RestartConverterListener = () => import('#listeners/restart_converter')
const RestartAllConvertersListener = () => import('#listeners/restart_all_converters')

emitter.on(NewStreamSource, [StartConverter])
emitter.on(DeleteStreamSource, [DropConverter])
emitter.on(RestartConverter, [RestartConverterListener])
emitter.on(RestartAllConverters, [RestartAllConvertersListener])
