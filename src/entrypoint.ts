import 'source-map-support/register.js'
import 'dotenv/config'
import 'isomorphic-fetch'
import './patch-global-require.js'
import '@discordjs/voice' // side-effects?
import Discord from 'discord.js'
import { once } from 'events'
import { DISCORD_GUILD_ID, DISCORD_TOKEN, DISCORD_VOICE_CHANNEL_ID } from './environment.js'
import { handleVoiceConnection } from './handle-voice-connection.js'
import {
  DiscordGatewayAdapterCreator,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice'
import { createWebHookMessage } from './create-webhook-message.js'

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILDS,
  ],
})

client.login(DISCORD_TOKEN)

await once(client, 'ready')

const guild = await client.guilds.fetch(DISCORD_GUILD_ID)
const voiceChannel = await guild.channels.fetch(DISCORD_VOICE_CHANNEL_ID)
const voiceConnection = joinVoiceChannel({
  channelId: voiceChannel!.id,
  guildId: voiceChannel!.guild.id,
  selfDeaf: false,
  selfMute: true,
  adapterCreator: voiceChannel!.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator,
})

await Promise.race([
  entersState(voiceConnection, VoiceConnectionStatus.Signalling, 1000 * 5),
  entersState(voiceConnection, VoiceConnectionStatus.Connecting, 1000 * 5),
])

await entersState(voiceConnection, VoiceConnectionStatus.Ready, 1000 * 30)

handleVoiceConnection(voiceConnection, async (userId, text) => {
  const user = await guild.members.fetch(userId)

  await createWebHookMessage({
    username: user.displayName,
    avatar_url: user.displayAvatarURL(),
    content: text,
  })
})

console.log(
  client.generateInvite({ scopes: ['bot'], permissions: [Discord.Permissions.FLAGS.CONNECT] })
)