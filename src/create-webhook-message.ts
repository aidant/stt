import { DISCORD_WEBHOOK_URL } from './environment.js'

export interface WebHookMessage {
  content: string
  username: string
  avatar_url: string
}

export const createWebHookMessage = async (message: WebHookMessage) => {
  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(message),
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

  if (!response.ok) {
    throw new Error()
  }
}
