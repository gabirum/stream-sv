import vine from '@vinejs/vine'

export const createStreamSourceValidator = vine.compile(
  vine.object({
    name: vine.string().alphaNumeric({ allowSpaces: true }).maxLength(55),
    url: vine.string().url({ protocols: ['rtsp'] }),
  })
)
