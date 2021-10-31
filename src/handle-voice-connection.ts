import { EndBehaviorType, VoiceConnection } from '@discordjs/voice'
import prism from 'prism-media'
import { transcribe } from './transcribe.js'

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
    });
  
    const oggStream = new prism.opus.OggLogicalBitstream({
      opusHead: new prism.opus.OpusHead({
        channelCount: 2,
        sampleRate: 48_000,
      }),
      pageSizeControl: {
        maxPackets: 10,
      },
    });
  
    const audio = opusStream.pipe(oggStream)
    
    const text = await transcribe(audio)
    
    if (text) callback(userId, text)
  }

  voiceConnection.receiver.speaking.on('start', handleSpeakingStart)
}
