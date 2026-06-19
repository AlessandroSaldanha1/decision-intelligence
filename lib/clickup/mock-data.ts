import type {
  ClickUpComment,
  ClickUpFolder,
  ClickUpList,
  ClickUpSpace,
  ClickUpTask,
  ClickUpWorkspace,
} from '@/types/clickup'

export const mockWorkspaces: ClickUpWorkspace[] = [
  {
    id: 'ws-001',
    name: 'Produto Digital',
    color: '#7C3AED',
    avatar: null,
    members: [
      {
        user: { id: 1, username: 'maria.silva', email: 'maria@empresa.com', profilePicture: null },
        role: 1,
      },
      {
        user: { id: 2, username: 'joao.santos', email: 'joao@empresa.com', profilePicture: null },
        role: 2,
      },
    ],
  },
  {
    id: 'ws-002',
    name: 'Engenharia',
    color: '#2563EB',
    avatar: null,
    members: [
      {
        user: { id: 3, username: 'ana.costa', email: 'ana@empresa.com', profilePicture: null },
        role: 1,
      },
    ],
  },
]

export const mockSpaces: ClickUpSpace[] = [
  {
    id: 'sp-001',
    name: 'Frontend',
    private: false,
    statuses: [
      { id: 's1', status: 'To Do', color: '#d3d3d3', orderindex: 0, type: 'open' },
      { id: 's2', status: 'In Progress', color: '#4169E1', orderindex: 1, type: 'custom' },
      { id: 's3', status: 'Done', color: '#008000', orderindex: 2, type: 'closed' },
    ],
    features: {},
  },
  {
    id: 'sp-002',
    name: 'Backend',
    private: false,
    statuses: [
      { id: 's4', status: 'Backlog', color: '#d3d3d3', orderindex: 0, type: 'open' },
      { id: 's5', status: 'Doing', color: '#FF8C00', orderindex: 1, type: 'custom' },
      { id: 's6', status: 'Review', color: '#9400D3', orderindex: 2, type: 'custom' },
      { id: 's7', status: 'Done', color: '#008000', orderindex: 3, type: 'closed' },
    ],
    features: {},
  },
]

export const mockFolders: ClickUpFolder[] = [
  {
    id: 'f-001',
    name: 'Sprint 2024-Q1',
    orderindex: 1,
    override_statuses: false,
    hidden: false,
    space: { id: 'sp-001', name: 'Frontend' },
    task_count: '12',
    lists: [],
  },
]

export const mockLists: ClickUpList[] = [
  {
    id: 'l-001',
    name: 'Backlog',
    orderindex: 1,
    status: null,
    priority: null,
    assignee: null,
    task_count: 8,
    due_date: null,
    start_date: null,
    folder: { id: 'f-001', name: 'Sprint 2024-Q1', hidden: false, access: true },
    space: { id: 'sp-001', name: 'Frontend', access: true },
    archived: false,
    override_statuses: null,
    statuses: null,
    permission_level: 'create',
  },
]

export const mockTasks: ClickUpTask[] = [
  {
    id: 't-001',
    name: 'Implementar autenticação OAuth',
    description: 'Adicionar fluxo de login com Google e GitHub para usuários do produto.',
    status: { id: 's7', status: 'Done', color: '#008000', orderindex: 3, type: 'closed' },
    orderindex: '1',
    date_created: '1700000000000',
    date_updated: '1700500000000',
    creator: { id: 1, username: 'maria.silva', email: 'maria@empresa.com', profilePicture: null },
    assignees: [
      { id: 2, username: 'joao.santos', email: 'joao@empresa.com', profilePicture: null },
    ],
    tags: [{ name: 'auth', tag_fg: '#fff', tag_bg: '#7C3AED', creator: 1 }],
    parent: null,
    priority: { id: 'p1', priority: 'high', color: '#f50000', orderindex: '2' },
    due_date: '1700800000000',
    start_date: '1700100000000',
    points: 8,
    time_estimate: 28800000,
    url: 'https://app.clickup.com/t/t-001',
    list: { id: 'l-001', name: 'Backlog', access: true },
    folder: { id: 'f-001', name: 'Sprint 2024-Q1', hidden: false, access: true },
    space: { id: 'sp-001' },
  },
  {
    id: 't-002',
    name: 'Refatorar módulo de pagamentos',
    description: 'Extrair lógica de pagamento para serviço dedicado, adicionar retry e DLQ.',
    status: { id: 's5', status: 'Doing', color: '#FF8C00', orderindex: 1, type: 'custom' },
    orderindex: '2',
    date_created: '1700200000000',
    date_updated: '1700600000000',
    creator: { id: 3, username: 'ana.costa', email: 'ana@empresa.com', profilePicture: null },
    assignees: [{ id: 3, username: 'ana.costa', email: 'ana@empresa.com', profilePicture: null }],
    tags: [{ name: 'payments', tag_fg: '#fff', tag_bg: '#2563EB', creator: 3 }],
    parent: null,
    priority: { id: 'p2', priority: 'urgent', color: '#800080', orderindex: '1' },
    due_date: '1701000000000',
    start_date: '1700300000000',
    points: 13,
    time_estimate: 57600000,
    url: 'https://app.clickup.com/t/t-002',
    list: { id: 'l-001', name: 'Backlog', access: true },
    folder: { id: 'f-001', name: 'Sprint 2024-Q1', hidden: false, access: true },
    space: { id: 'sp-002' },
  },
]

export const mockComments: Record<string, ClickUpComment[]> = {
  't-001': [
    {
      id: 'c-001',
      comment: [
        { text: 'Decidimos usar NextAuth v5 para simplificar a integração com o App Router.' },
      ],
      comment_text: 'Decidimos usar NextAuth v5 para simplificar a integração com o App Router.',
      user: { id: 1, username: 'maria.silva', email: 'maria@empresa.com', profilePicture: null },
      resolved: false,
      date: '1700400000000',
    },
    {
      id: 'c-002',
      comment: [
        {
          text: 'Atenção: precisamos adicionar rate limiting no endpoint de callback para evitar abuso.',
        },
      ],
      comment_text:
        'Atenção: precisamos adicionar rate limiting no endpoint de callback para evitar abuso.',
      user: { id: 2, username: 'joao.santos', email: 'joao@empresa.com', profilePicture: null },
      resolved: false,
      date: '1700450000000',
    },
  ],
  't-002': [
    {
      id: 'c-003',
      comment: [
        {
          text: 'A fila SQS já está criada no AWS. Precisamos apenas configurar as políticas IAM.',
        },
      ],
      comment_text:
        'A fila SQS já está criada no AWS. Precisamos apenas configurar as políticas IAM.',
      user: { id: 3, username: 'ana.costa', email: 'ana@empresa.com', profilePicture: null },
      resolved: false,
      date: '1700550000000',
    },
  ],
}
