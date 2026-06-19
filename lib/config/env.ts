export const env = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  },
  clickup: {
    apiToken: process.env.CLICKUP_API_TOKEN ?? '',
    workspaceId: process.env.CLICKUP_WORKSPACE_ID ?? '',
    defaultListId: process.env.CLICKUP_DEFAULT_LIST_ID ?? '',
  },
  app: {
    env: process.env.APP_ENV ?? 'development',
    name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Decision Intelligence',
  },
}

export const isMockMode = (token?: string) => {
  const t = token ?? env.clickup.apiToken
  return !t || t.trim() === ''
}

export const isClaudeMockMode = () => {
  return !env.anthropic.apiKey || env.anthropic.apiKey.trim() === ''
}
