import vine from '@vinejs/vine'

export const createStreamSourceValidator = vine.compile(
  vine.object({
    url: vine.string().url({ protocols: ['rtsp'] }),
  })
)
