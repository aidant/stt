import { Readable } from 'stream'

export const streamToBuffer = async (stream: Readable) => {
  const buffers = []

  for await (const buffer of stream) buffers.push(buffer)

  return Buffer.concat(buffers)
}