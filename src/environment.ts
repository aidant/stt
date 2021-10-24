const invalid = (name: string): never => {
  throw new Error(`Invalid Environment Variable: "${name}".`)
}

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN || invalid('DISCORD_TOKEN')
export const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || invalid('DISCORD_WEBHOOK_URL')
export const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || invalid('DISCORD_GUILD_ID')
export const DISCORD_VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID || invalid('DISCORD_VOICE_CHANNEL_ID')
