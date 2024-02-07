import app from '@adonisjs/core/services/app'
import { exec, type ChildProcess } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const sanitize = (str: string) => `"${str}"`

const getFFMpegArgs = (input: string, output: string) =>
  [
    '-fflags',
    'nobuffer',
    '-rtsp_transport',
    'tcp',
    'i',
    sanitize(input),
    '-copyts',
    '-c:v',
    'libx264',
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
    sanitize(output),
  ].join(' ')

class StreamConverterProcessHandler {
  private canRestart = true
  private process: ChildProcess | null = null

  constructor(
    private readonly id: string,
    private readonly url: string
  ) {}

  async start() {
    const outputFolder = app.tmpPath(this.id)
    await mkdir(outputFolder, { recursive: true }).catch(() => {})

    const outputPath = join(outputFolder, 'stream.m3u8')

    this.process = exec(getFFMpegArgs(this.url, outputPath))
    this.process.once('close', this.onClose.bind(this))
  }

  private onClose() {
    if (this.canRestart) {
      this.start().catch(() => {})
    }
  }

  stop() {
    this.canRestart = false
    this.process?.kill()
  }
}

interface ConverterConfig {
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
    converter.start().catch(() => {})
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
  }
}
