import { SpeechClient } from '@google-cloud/speech'
import { spawn } from 'child_process'
import ffmpeg from 'ffmpeg-static'
import { Readable } from 'stream'
import { streamToBuffer } from './stream-to-buffer.js'

const speech = new SpeechClient()

export const convertOggToMp3 = (audio: Readable): Readable => {
  const child = spawn(ffmpeg as unknown as string, '-i pipe:0 -f wav -ac 1 pipe:1'.split(' '), {
    stdio: ['pipe', 'pipe', 'ignore'],
  })

  audio.pipe(child.stdin)

  return child.stdout
}

export const transcribe = async (audio: Readable): Promise<string | null> => {
  const mp3 = await streamToBuffer(convertOggToMp3(audio))

  const recognize = await speech.recognize({
    config: {
      languageCode: 'en-AU',
      encoding: 'LINEAR16',
      sampleRateHertz: 48_000,
      enableAutomaticPunctuation: true,
    },
    audio: {
      content: mp3,
    },
  })

  return recognize?.[0]?.results?.[0]?.alternatives?.[0]?.transcript || null
}
