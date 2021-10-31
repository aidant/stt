import {
  AudioStream,
  LanguageCode,
  MediaEncoding,
  StartStreamTranscriptionCommand,
  TranscribeStreamingClient
} from '@aws-sdk/client-transcribe-streaming'
import { Readable } from 'stream'

const client = new TranscribeStreamingClient({ region: 'ap-southeast-2' })

async function * createAudioStream (audio: Readable): AsyncIterable<AudioStream> {
  for await (const chunk of audio) {
    yield { AudioEvent: { AudioChunk: chunk } }
  }
}

export const transcribe = async (audio: Readable): Promise<string | null> => {
  const result = await client.send(
    new StartStreamTranscriptionCommand({
      AudioStream: createAudioStream(audio),
      LanguageCode: LanguageCode.EN_AU,
      MediaEncoding: MediaEncoding.OGG_OPUS,
      MediaSampleRateHertz: 48_000,
    }),
  )

  const transcripts = []
  for await (const event of result.TranscriptResultStream!) transcripts.push(event)
  
  return transcripts.at(-1)?.TranscriptEvent?.Transcript?.Results?.[0]?.Alternatives?.[0]?.Transcript || null
}