import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { execFile, type ChildProcess } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const getFFMpegArgs = (input: string, output: string) => [
  '-fflags',
  'nobuffer',
  '-hide_banner',
  '-loglevel',
  'error',
  '-rtsp_transport',
  'udp',
  '-i',
  input,
  '-copyts',
  '-c:v',
  'copy',
  '-tune',
  'zerolatency',
  '-movflags',
  'frag_keyframe+empty_moov',
  '-an',
  '-f',
  'hls',
  '-hls_list_size',
  '5',
  '-hls_segment_type',
  'mpegts',
  '-hls_flags',
  'delete_segments+append_list',
  output,
]

class StreamConverterProcessHandler {
  private canRestart = true
  private restartTimeout: NodeJS.Timeout | null = null
  private process: ChildProcess | null = null

  constructor(
    private readonly id: string,
    private readonly url: string
  ) {}

  async start() {
    const outputFolder = app.tmpPath(this.id)
    await mkdir(outputFolder, { recursive: true }).catch(() => {})

    const outputPath = join(outputFolder, 'stream.m3u8')

    logger.info('Starting ffmpeg of %s', this.id)
    this.process = execFile('ffmpeg', getFFMpegArgs(this.url, outputPath))
    this.process.stdout?.on('data', (data) => {
      logger.info('ffmpeg data %s: %s', this.id, data.toString())
    })
    this.process.stderr?.on('data', (data) => {
      logger.warn('ffmpeg error %s: %s', this.id, data.toString())
    })
    this.process.once('spawn', this.onSpawn.bind(this))
    this.process.once('close', this.onClose.bind(this))
  }

  private onSpawn() {
    this.canRestart = true
    logger.info('ffmpeg for %s started', this.id)
  }

  private onClose() {
    logger.info('ffmpeg for %s died', this.id)

    this.process?.stdout?.removeAllListeners('data')
    this.process?.stderr?.removeAllListeners('data')

    if (!this.canRestart) {
      return
    }

    this.restartTimeout = setTimeout(() => {
      logger.info('Restarting ffmpeg for %s', this.id)
      this.start().catch((e) => logger.warn(e, 'Error while starting ffmpeg for %s', this.id))

      if (this.restartTimeout) clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }, 1000)
    this.process = null
  }

  restart() {
    logger.info('Restarting ffmpeg for %s', this.id)
    this.canRestart = false
    this.process?.kill('SIGKILL')
    this.start().catch((e) => logger.warn(e, 'Error while starting ffmpeg for %s', this.id))
  }

  stop() {
    logger.info('Stopping ffmpeg for %s', this.id)
    this.canRestart = false
    this.process?.kill()
  }
}

export interface ConverterConfig {
  id: string
  url: string
}

export class StreamConverterManager {
  private registry = new Map<string, StreamConverterProcessHandler>()

  add({ id, url }: ConverterConfig) {
    if (this.registry.has(id)) {
      return
    }

    const converter = new StreamConverterProcessHandler(id, url)
    void converter.start()
    this.registry.set(id, converter)
  }

  addMany(configs: ConverterConfig[]) {
    configs.forEach(this.add.bind(this))
  }

  restart(id: string) {
    if (!this.registry.has(id)) {
      return
    }

    const converter = this.registry.get(id)!
    converter.restart()
  }

  restartAll() {
    this.registry.forEach((c) => {
      c.restart()
    })
  }

  drop(id: string) {
    if (!this.registry.has(id)) {
      return
    }

    const converter = this.registry.get(id)!
    converter.stop()

    this.registry.delete(id)
  }

  dropAll() {
    this.registry.forEach((c) => {
      c.stop()
    })
    this.registry.clear()
  }
}
