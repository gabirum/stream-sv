import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { execFile, type ChildProcess } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const getFFMpegArgs = (input: string, output: string) => [
  '-hide_banner',
  '-loglevel',
  'warning',
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

const logError = (error: unknown) => {
  logger.error(error, 'Error ffmpeg')
}

class StreamConverterProcessHandler {
  private canRestart = true
  private restartCount = 0
  private restartTimeout: NodeJS.Timeout | null = null
  private resetCountTimeout: NodeJS.Timeout | null = null
  private process: ChildProcess | null = null

  constructor(
    private readonly id: string,
    private readonly url: string
  ) {}

  async start() {
    const outputFolder = app.tmpPath(this.id)
    await mkdir(outputFolder, { recursive: true }).catch(logError)

    const outputPath = join(outputFolder, 'stream.m3u8')

    this.process = execFile('ffmpeg', getFFMpegArgs(this.url, outputPath))
    this.process.stdout?.on('data', (data) => {
      logger.info(data.toString())
    })
    this.process.stderr?.on('data', (data) => {
      logger.error(data.toString())
    })
    this.process.once('spawn', this.onSpawn.bind(this))
    this.process.once('close', this.onClose.bind(this))
  }

  private onSpawn() {
    this.resetCountTimeout = setTimeout(
      () => {
        this.restartCount = 0

        if (this.resetCountTimeout) clearTimeout(this.resetCountTimeout)
        this.resetCountTimeout = null
      },
      5 * 60 * 1000 // 5 minutes to reset count
    )
  }

  private onClose() {
    this.process?.stdout?.removeAllListeners('data')
    this.process?.stderr?.removeAllListeners('data')

    if (this.resetCountTimeout) clearTimeout(this.resetCountTimeout)
    this.resetCountTimeout = null

    if (!this.canRestart) return

    const time = Math.min(1000 * 2 ** this.restartCount, 60 * 1000) // max each 60 sec

    this.restartTimeout = setTimeout(() => {
      this.restartCount++
      this.start().catch(logError)

      if (this.restartTimeout) clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }, time)
    this.process = null
  }

  restart() {
    this.canRestart = false
    this.restartCount = 0
    if (!this.process?.kill()) {
      this.start().catch(logError)
    }
  }

  stop() {
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
