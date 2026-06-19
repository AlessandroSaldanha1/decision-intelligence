import Anthropic from '@anthropic-ai/sdk'
import { env } from '../config/env'

let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: env.anthropic.apiKey })
  }
  return _client
}
