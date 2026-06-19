export interface ClickUpWorkspace {
  id: string
  name: string
  color: string
  avatar: string | null
  members: ClickUpMember[]
}

export interface ClickUpMember {
  user: {
    id: number
    username: string
    email: string
    profilePicture: string | null
  }
  role: number
}

export interface ClickUpSpace {
  id: string
  name: string
  private: boolean
  statuses: ClickUpStatus[]
  features: Record<string, unknown>
}

export interface ClickUpStatus {
  id: string
  status: string
  color: string
  orderindex: number
  type: string
}

export interface ClickUpFolder {
  id: string
  name: string
  orderindex: number
  override_statuses: boolean
  hidden: boolean
  space: { id: string; name: string }
  task_count: string
  lists: ClickUpList[]
}

export interface ClickUpList {
  id: string
  name: string
  orderindex: number
  status: string | null
  priority: string | null
  assignee: string | null
  task_count: number
  due_date: string | null
  start_date: string | null
  folder: { id: string; name: string; hidden: boolean; access: boolean }
  space: { id: string; name: string; access: boolean }
  archived: boolean
  override_statuses: boolean | null
  statuses: ClickUpStatus[] | null
  permission_level: string
}

export interface ClickUpTask {
  id: string
  name: string
  description: string | null
  status: ClickUpStatus
  orderindex: string
  date_created: string
  date_updated: string
  creator: ClickUpMember['user']
  assignees: ClickUpMember['user'][]
  tags: ClickUpTag[]
  parent: string | null
  priority: ClickUpPriority | null
  due_date: string | null
  start_date: string | null
  points: number | null
  time_estimate: number | null
  url: string
  list: { id: string; name: string; access: boolean }
  folder: { id: string; name: string; hidden: boolean; access: boolean }
  space: { id: string }
  subtasks?: ClickUpTask[]
}

export interface ClickUpTag {
  name: string
  tag_fg: string
  tag_bg: string
  creator: number
}

export interface ClickUpPriority {
  id: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  color: string
  orderindex: string
}

export interface ClickUpComment {
  id: string
  comment: Array<{ text: string }>
  comment_text: string
  user: ClickUpMember['user']
  resolved: boolean
  date: string
}

export interface ClickUpCreateTaskPayload {
  name: string
  description?: string
  assignees?: number[]
  tags?: string[]
  status?: string
  priority?: 1 | 2 | 3 | 4
  due_date?: number
  start_date?: number
  parent?: string
  markdown_description?: string
}
