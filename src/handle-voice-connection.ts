import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import { SpeechClient } from '@google-cloud/speech'
import type { google } from '@google-cloud/speech/build/protos/protos'
import { createWriteStream } from 'fs'
import prism, { ogg } from 'prism-media'
import { pipeline } from 'stream/promises'
import { streamToBuffer } from './stream-to-buffer.js'

const speech = new SpeechClient({})

interface Callback {
  (userId: string, text: string): void
}

export const handleVoiceConnection = (voiceConnection: VoiceConnection, callback: Callback) => {
  const handleSpeakingStart = async (userId: string) => {
    const opusStream = voiceConnection.receiver.subscribe(userId, {
      end: {
        behavior: EndBehaviorType.AfterSilence,
        duration: 100,
      },
    })

    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48000,
      }),
      pageSizeControl: {
        maxPackets: 10,
      },
    })

    const result = await speech.recognize({
      config: {
        encoding: 'OGG_OPUS',
        languageCode: 'en-AU',
        sampleRateHertz: 48000,
      },
      audio: {
        content: await streamToBuffer(opusStream.pipe(oggStream)),
      },
    })

    console.log(result)

    const text = result?.[0]?.results?.[0]?.alternatives?.[0]?.transcript

    if (text) {
      callback(userId, text)
    }

    // const recognizeStream = speech.streamingRecognize({
    //   config: {
    //     encoding: 'OGG_OPUS',
    //     languageCode: 'en-AU',
    //     sampleRateHertz: 48000,
    //   },
    //   interimResults: false,
    // })

    // const stream = opusStream
    //   .pipe(
    //     new Transform({
    //       transform: (chunk, encoding, callback) => {
    //         console.log('opusStream', chunk, encoding)
    //         callback(null, chunk)
    //       },
    //     })
    //   )
    //   .pipe(recognizeStream)
    //   .pipe(
    //     new Transform({
    //       transform: (chunk, encoding, callback) => {
    //         console.log('opusStream', chunk, encoding)
    //         callback(null, chunk)
    //       },
    //     })
    //   )

    // const data: google.cloud.speech.v1.ISpeechRecognitionResult = await new Promise(
    //   (resolve, reject) => {
    //     let data: any = undefined

    //     const handleData = (newData: any) => {
    //       stream.off('data', handleData)
    //       stream.off('end', handleEnd)
    //       stream.off('error', handleError)

    //       resolve(newData)

    //       console.log('handleData', newData)
    //       data = newData
    //     }

    //     const handleEnd = () => {}

    //     const handleError = (error: unknown) => {
    //       stream.off('data', handleData)
    //       stream.off('end', handleEnd)
    //       stream.off('error', handleError)

    //       reject(error)
    //     }

    //     stream.on('data', handleData)
    //     stream.on('end', handleEnd)
    //     stream.on('error', handleError)
    //   }
    // )

    // console.log(data)

    // const text = data.alternatives?.[0].transcript
    // if (text) {
    //   callback(userId, text)
    // }
  }

  voiceConnection.receiver.speaking.on('start', handleSpeakingStart)
}
