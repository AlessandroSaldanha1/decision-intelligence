import axios, { type AxiosInstance } from 'axios'
import { env } from '../config/env'

const CLICKUP_BASE_URL = 'https://api.clickup.com/api/v2'

export function createClickUpClient(token?: string): AxiosInstance {
  const apiToken = token ?? env.clickup.apiToken

  return axios.create({
    baseURL: CLICKUP_BASE_URL,
    headers: {
      Authorization: apiToken,
      'Content-Type': 'application/json',
    },
  })
}
