import { createWriteStream } from 'fs'
import { Readable } from 'stream'

export const transcribe = async (audio: Readable): Promise<string | null> => {
  audio.pipe(
    createWriteStream(`./recording-${Date.now()}.ogg`)
  )
  
  return null
}