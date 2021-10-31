import { SpeechClient } from '@google-cloud/speech'
import { Readable } from 'stream'

const speech = new SpeechClient()

export const transcribe = async (audio: Readable): Promise<string | null> => {
  const stream = speech.streamingRecognize({
    config: {
      languageCode: 'en-AU',
      encoding: 'OGG_OPUS',
      sampleRateHertz: 48_000,
    },
  })

  const transcriptResultStream = audio.pipe(stream)

  const transcripts = []
  for await (const event of transcriptResultStream) transcripts.push(event)

  console.dir(transcripts, { depth: null })

  return null
}