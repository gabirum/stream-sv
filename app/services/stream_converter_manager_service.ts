import app from '@adonisjs/core/services/app'
import { execFile, type ChildProcess } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const getFFMpegArgs = (input: string, output: string) => [
  '-fflags',
  'nobuffer',
  '-rtsp_transport',
  'tcp',
  '-i',
  input,
  '-copyts',
  '-c:v',
  'libx264',
  '-profile:v',
  'baseline',
  '-tune',
  'zerolatency',
  '-movflags',
  'frag_keyframe+empty_moov',
  '-an',
  '-f',
  'hls',
  '-hls_time',
  '1',
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
    await mkdir(outputFolder, { recursive: true }).catch(console.error)

    const outputPath = join(outputFolder, 'stream.m3u8')

    this.process = execFile('ffmpeg', getFFMpegArgs(this.url, outputPath))
    this.process.once('spawn', () => {
      this.resetCountTimeout = setTimeout(
        () => {
          this.restartCount = 0

          if (this.resetCountTimeout) clearTimeout(this.resetCountTimeout)
          this.resetCountTimeout = null
        },
        5 * 60 * 1000
      )
    })
    this.process.once('close', this.onClose.bind(this))
  }

  private onClose() {
    if (this.resetCountTimeout) clearTimeout(this.resetCountTimeout)
    this.resetCountTimeout = null

    if (!this.canRestart) return

    const time = Math.min(1000 * 2 ** this.restartCount, 10 * 60 * 1000) // max each 10 min

    this.restartTimeout = setTimeout(() => {
      this.restartCount++
      this.start().catch(console.error)

      if (this.restartTimeout) clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }, time)
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
    converter.start().catch(console.error)
    this.registry.set(id, converter)
  }

  addMany(configs: ConverterConfig[]) {
    configs.forEach(this.add.bind(this))
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
