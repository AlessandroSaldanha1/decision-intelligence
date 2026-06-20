'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen =
  | 'dashboard'
  | 'demand'
  | 'searching'
  | 'insights'
  | 'analysis'
  | 'artifacts'
  | 'plan'
  | 'preview'
  | 'result';

interface AnalysisSection {
  q: string;
  a: string;
}

interface ArtifactsData {
  userStory: string;
  bdd: string[];
  testCases: string[];
  dod: string[];
  dependencies: string[];
  subtasks: string[];
}

interface PublishConfig {
  listId: string;
  status: string;
  priority: string;
  tags: string;
  optTask: boolean;
  optSubtasks: boolean;
  optComment: boolean;
  optBdd: boolean;
  optDod: boolean;
}

interface PublishResult {
  mode: 'mock' | 'real';
  taskId: string;
  taskUrl: string | null;
  subtasksCreated: number;
  commentCreated: boolean;
}

interface PublishError {
  title: string;
  detail: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────

const orgKnowledge = [
  { n: '1.284', l: 'tasks indexadas' },
  { n: '92', l: 'projetos indexados' },
  { n: '48.000', l: 'comentários analisados' },
  { n: '7.300', l: 'decisões catalogadas' },
];

const intelGen = [
  { n: '312', l: 'riscos evitados' },
  { n: '194', l: 'requisitos enriquecidos' },
  { n: '76', l: 'incidentes reaproveitados' },
  { n: '88%', l: 'redução de ambiguidades' },
];

const sources = ['ClickUp', 'Jira', 'Confluence', 'Notion', 'Reuniões', 'Comentários'];

const kbDefs = [
  { key: 'tasks', label: 'Tasks e Sprints' },
  { key: 'comments', label: 'Comentários' },
  { key: 'subtasks', label: 'Subtasks' },
  { key: 'docs', label: 'Docs' },
];

const memoryMetrics = [
  { n: '12', l: 'Spaces' },
  { n: '43', l: 'Lists' },
  { n: '1.284', l: 'Tasks' },
  { n: '48.000', l: 'Comentários' },
  { n: '7', l: 'Documentos' },
];

const scanLabels = [
  'ClickUp · 412 tasks varridas',
  'Jira · 7.300 decisões',
  'Confluence + Notion · documentação',
  '48.000 comentários analisados',
  'Incidentes e post-mortems',
  'Construindo contexto semântico (RAG)',
];

const counts = { projetos: 3, incidentes: 2, regras: 4, solucoes: 1 };

const projects = [
  {
    name: 'Atlas Fundos',
    sim: 91,
    kind: 'Problema encontrado',
    detail: 'Mudança de vigência impactou PL/Cota',
    result: 'Incidente em produção',
    tc: 'var(--clay)',
  },
  {
    name: 'Previdência',
    sim: 84,
    kind: 'Problema encontrado',
    detail: 'Ausência de justificativa obrigatória',
    result: 'Falha de auditoria',
    tc: 'var(--clay)',
  },
  {
    name: 'Cadastro',
    sim: 79,
    kind: 'Solução aplicada',
    detail: 'Análise de impacto antes da aplicação',
    result: 'Redução de chamados',
    tc: 'var(--sage)',
  },
];

const people = [
  { name: 'Ricardo Silva', role: 'Tech Lead · Atlas', initials: 'RS' },
  { name: 'Jessica Moraes', role: 'Compliance', initials: 'JM' },
  { name: 'Thaís Andrade', role: 'Product · Previdência', initials: 'TA' },
];

const teams = ['Operação', 'Compliance', 'Produto', 'Engenharia'];
const lessons = [
  'Sempre exigir justificativa',
  'Não alterar fundos encerrados',
  'Validar impacto em entidades filhas',
  'Auditar alterações sensíveis',
];

const planData = {
  epic: 'Alteração de Vigência de Classe',
  usTitle: 'Operador pode alterar vigência de classe para corrigir dados cadastrais',
  usDesc:
    'Como operador autorizado, quero alterar a data de início e fim de vigência de uma classe para corrigir informações cadastrais com rastreabilidade e análise de impacto.',
  groups: [
    {
      frente: 'Backend',
      items: [
        'Criar endpoint de análise de impacto',
        'Criar endpoint de aplicação de vigência',
        'Implementar auditoria e histórico de alterações',
      ],
    },
    {
      frente: 'Frontend',
      items: [
        'Criar tela/modal de alteração de vigência',
        'Criar etapa de análise de impacto',
        'Criar confirmação final antes da aplicação',
      ],
    },
    {
      frente: 'QA',
      items: [
        'Criar cenários BDD automatizáveis',
        'Validar fluxo com subclasses relacionadas',
        'Validar bloqueios e mensagens de erro',
      ],
    },
    {
      frente: 'Produto',
      items: [
        'Validar regra de propagação',
        'Validar necessidade de justificativa obrigatória',
        'Validar comportamento para fundo encerrado',
      ],
    },
  ],
  deps: [
    'API de dados cadastrais',
    'Banco de dados',
    'Histórico de alterações',
    'Regras de PL/Cota',
    'Webhook de notificação',
  ],
  risk: { score: 82, label: 'Alto' },
  reuse: [
    { n: '3', l: 'projetos semelhantes usados' },
    { n: '2', l: 'incidentes históricos considerados' },
    { n: '4', l: 'regras organizacionais aplicadas' },
    { n: '1', l: 'solução validada reutilizada' },
  ],
};

const previewSubtasks = [
  { group: 'Backend', name: 'Análise de impacto' },
  { group: 'Backend', name: 'Aplicação de vigência' },
  { group: 'Backend', name: 'Auditoria' },
  { group: 'Frontend', name: 'Modal de alteração' },
  { group: 'Frontend', name: 'Lista de impactos' },
  { group: 'QA', name: 'Cenários BDD' },
  { group: 'Produto', name: 'Validação de regra' },
];

const previewSections = [
  'Contexto de negócio',
  'User Story',
  'Critérios BDD',
  'Casos de teste',
  'Definition of Done',
  'Dependências',
  'Conhecimento organizacional reaproveitado',
];

const checkDefs: { key: keyof PublishConfig; label: string }[] = [
  { key: 'optTask', label: 'Criar task principal' },
  { key: 'optSubtasks', label: 'Criar subtarefas' },
  { key: 'optComment', label: 'Adicionar comentário com análise crítica' },
  { key: 'optBdd', label: 'Incluir BDD na descrição' },
  { key: 'optDod', label: 'Incluir Definition of Done' },
];

const stepDefs = [
  { n: '01', label: 'Painel', key: 'dashboard' },
  { n: '02', label: 'Nova demanda', key: 'demand' },
  { n: '03', label: 'Conhecimento organizacional', key: 'insights' },
  { n: '04', label: 'Análise Claude', key: 'analysis' },
  { n: '05', label: 'Artefatos', key: 'artifacts' },
  { n: '06', label: 'Plano de entrega', key: 'plan' },
  { n: '07', label: 'Publicar no ClickUp', key: 'preview' },
];

const publishStepLabels = [
  'Conectando ao ClickUp…',
  'Criando task principal…',
  'Criando subtarefas…',
  'Adicionando comentário de análise…',
];

const analysisFallback: AnalysisSection[] = [
  {
    q: 'O que estamos esquecendo?',
    a: 'A justificativa obrigatória e o impacto em entidades filhas. Em casos similares (91%), a vigência alterou o cálculo de PL/Cota a jusante.',
  },
  {
    q: 'O que pode dar errado?',
    a: 'Recálculo indevido de PL/Cota em produção e alteração de fundos encerrados — exatamente o incidente registrado no projeto Atlas Fundos.',
  },
  {
    q: 'Quem será impactado?',
    a: 'Operação e Compliance (trilha de auditoria), além de Produto e Engenharia no recálculo de cotas e validações.',
  },
  {
    q: 'Quais erros já aconteceram antes?',
    a: 'Incidente em produção no Atlas Fundos e falha de auditoria na Previdência pela ausência de justificativa obrigatória.',
  },
  {
    q: 'Quais soluções já funcionaram?',
    a: 'A análise de impacto antes da aplicação, usada no projeto Cadastro, reduziu chamados; auditar alterações sensíveis sustentou a conformidade.',
  },
];

const artifactsFallback: ArtifactsData = {
  userStory:
    'Como analista de operações, eu quero alterar a vigência de um fundo exigindo justificativa e análise de impacto, para que mudanças sensíveis sejam rastreáveis e não gerem incidentes de PL/Cota.',
  bdd: [
    'Dado um fundo ativo com vigência vigente',
    'Quando o usuário solicita alteração de vigência sem justificativa',
    'Então o sistema bloqueia a operação e exige justificativa obrigatória',
    'E registra autor, data e motivo na trilha de auditoria',
  ],
  testCases: [
    'Bloquear alteração de vigência em fundo encerrado',
    'Exigir justificativa obrigatória antes de confirmar',
    'Exibir análise de impacto em entidades filhas (PL/Cota)',
    'Registrar a alteração na trilha de auditoria',
  ],
  dod: [
    'Justificativa obrigatória validada',
    'Análise de impacto exibida antes da confirmação',
    'Trilha de auditoria completa e testável',
    'Testes de regressão de PL/Cota aprovados',
  ],
  dependencies: [
    'Serviço de cálculo de PL/Cota',
    'Módulo de auditoria',
    'Catálogo de entidades filhas',
  ],
  subtasks: [
    'Bloquear fundos encerrados',
    'Campo de justificativa obrigatório',
    'Tela de pré-visualização de impacto',
    'Evento de auditoria de alteração',
  ],
};

const DEFAULT_PUBLISH_CONFIG: PublishConfig = {
  listId: '',
  status: 'to do',
  priority: 'normal',
  tags: 'decision-intelligence',
  optTask: true,
  optSubtasks: true,
  optComment: true,
  optBdd: true,
  optDod: true,
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const s = {
  card: {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 12,
    padding: '24px 28px',
  } as React.CSSProperties,

  cardDark: {
    background: 'var(--clay)',
    border: '1px solid var(--line-on-ink)',
    borderRadius: 12,
    padding: '24px 28px',
    color: 'var(--on-ink-1)',
  } as React.CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--ink-3)',
  } as React.CSSProperties,

  labelLight: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--on-ink-3)',
  } as React.CSSProperties,

  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '11px 22px',
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity .15s',
  } as React.CSSProperties,

  btnPrimary: {
    background: 'var(--clay)',
    color: 'var(--on-ink-1)',
  } as React.CSSProperties,

  btnGhost: {
    background: 'transparent',
    color: 'var(--ink-2)',
    border: '1px solid var(--line-strong)',
  } as React.CSSProperties,

  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 500,
    background: 'var(--paper-2)',
    color: 'var(--ink-2)',
    border: '1px solid var(--line)',
  } as React.CSSProperties,

  screenPad: {
    padding: 'var(--pad-x)',
  } as React.CSSProperties,
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Spinner({ size = 20, color = 'var(--clay)' }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'di-spin .7s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

function Skel({ h = 20, w = '100%' }: { h?: number; w?: number | string }) {
  return <div className="di-skel" style={{ height: h, width: w }} />;
}

function StatGrid({ items, dark = false }: { items: { n: string; l: string }[]; dark?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            padding: '16px 20px',
            borderRight:
              i < items.length - 1
                ? `1px solid ${dark ? 'var(--line-on-ink)' : 'var(--line)'}`
                : 'none',
          }}
        >
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: dark ? 'var(--on-ink-1)' : 'var(--clay)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {item.n}
          </div>
          <div style={{ fontSize: 12, color: dark ? 'var(--on-ink-3)' : 'var(--ink-3)', marginTop: 4 }}>
            {item.l}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScreenHeader({ step, title }: { step: string; title: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={s.label}>{step}</div>
      <h1
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          color: 'var(--ink)',
          lineHeight: 1.15,
          marginTop: 8,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
    </div>
  );
}

// ─── Screen props interfaces ──────────────────────────────────────────────────

interface GoFn {
  (screen: Screen): void;
}

interface DashboardProps {
  go: GoFn;
}

interface DemandProps {
  demand: string;
  setDemand: (v: string) => void;
  workspace: string;
  setWorkspace: (v: string) => void;
  kb: Record<string, boolean>;
  isOn: (key: string) => boolean;
  toggleKb: (key: string) => void;
  runSearch: () => void;
}

interface SearchingProps {
  demand: string;
}

interface InsightsProps {
  go: GoFn;
  demand: string;
}

interface AnalysisProps {
  analysisState: 'idle' | 'loading' | 'done';
  analysis: AnalysisSection[] | null;
  go: GoFn;
}

interface ArtifactsProps {
  artifactsState: 'idle' | 'loading' | 'done';
  artifacts: ArtifactsData | null;
  go: GoFn;
}

interface PlanProps {
  go: GoFn;
}

interface PreviewProps {
  demand: string;
  publishConfig: PublishConfig;
  setPublishConfig: React.Dispatch<React.SetStateAction<PublishConfig>>;
  go: GoFn;
  doPublish: (forceMock: boolean) => void;
}

interface ResultProps {
  publishState: 'idle' | 'loading' | 'success' | 'error';
  publishStep: number;
  publishResult: PublishResult | null;
  publishError: PublishError | null;
  publishConfig: PublishConfig;
  go: GoFn;
  doPublish: (forceMock: boolean) => void;
}

interface SidebarProps {
  activeKey: string;
  go: GoFn;
}

// ─── Screen components (defined outside DIPage) ───────────────────────────────

function DashboardScreen({ go }: { go: (s: Screen) => void }) {
  const cellStyle: React.CSSProperties = {
    padding: '24px 26px',
    borderRight: '1px solid var(--line)',
    borderTop: '1px solid var(--line)',
  };
  const cellStyleLast: React.CSSProperties = {
    padding: '24px 26px',
    borderRight: 'none',
    borderTop: '1px solid var(--line)',
  };
  const cellStyleInk: React.CSSProperties = {
    padding: '24px 26px',
    borderRight: '1px solid var(--line-on-ink)',
    borderTop: '1px solid var(--line-on-ink)',
  };
  const cellStyleInkLast: React.CSSProperties = {
    padding: '24px 26px',
    borderRight: 'none',
    borderTop: '1px solid var(--line-on-ink)',
  };
  const numStyle: React.CSSProperties = {
    fontFamily: 'var(--serif)',
    fontSize: 40,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  };
  const labelStyleCell: React.CSSProperties = {
    fontSize: 13.5,
    color: 'var(--ink-2)',
    marginTop: 8,
    lineHeight: 1.4,
  };
  const numStyleInk: React.CSSProperties = {
    fontFamily: 'var(--serif)',
    fontSize: 40,
    letterSpacing: '-0.02em',
    lineHeight: 1,
    color: 'var(--on-ink-1)',
  };
  const labelStyleInk: React.CSSProperties = {
    fontSize: 13.5,
    color: 'var(--on-ink-2)',
    marginTop: 8,
    lineHeight: 1.4,
  };

  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 80px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          01 / PAINEL
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          Inteligência Organizacional
        </span>
      </div>

      {/* Hero section */}
      <div className="di-stag" style={{ maxWidth: 1080 }}>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}
        >
          A verdadeira entrega
        </div>

        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            lineHeight: 1.0,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(46px, 5.6vw, 76px)',
            margin: '18px 0 0',
            maxWidth: '18ch',
          }}
        >
          Transformamos conhecimento disperso em{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>decisões melhores</em>.
        </h1>

        <p
          style={{
            fontSize: 21,
            lineHeight: 1.5,
            color: 'var(--ink-2)',
            maxWidth: '62ch',
            margin: '26px 0 0',
          }}
        >
          O conhecimento da organização existe — mas está preso em ClickUp, Jira, Confluence, Notion,
          reuniões e pessoas. A Decision Intelligence descobre e reaproveita essa inteligência para
          que nenhum time resolva, sozinho, o que a empresa já aprendeu.
        </p>

        <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
          <button
            className="di-btn-primary"
            style={{
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              fontSize: 15,
              padding: '13px 26px',
              borderRadius: 8,
              border: '1px solid var(--clay)',
              background: 'var(--clay)',
              color: 'var(--paper)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
            onClick={() => go('demand')}
          >
            Iniciar nova demanda{' '}
            <span style={{ fontFamily: 'var(--mono)' }}>→</span>
          </button>
          <button
            className="di-btn-ghost"
            style={{
              fontWeight: 600,
              fontSize: 15,
              padding: '13px 24px',
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'transparent',
              color: 'var(--ink)',
              cursor: 'pointer',
            }}
            onClick={() => go('insights')}
          >
            Ver exemplo de inteligência
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 64 }}>
        {/* Left card */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--paper)',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15 }}>Conhecimento Organizacional</span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--ink-3)',
                letterSpacing: '0.08em',
              }}
            >
              INDEXADO
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={cellStyle}>
              <div style={numStyle}>{orgKnowledge[0].n}</div>
              <div style={labelStyleCell}>{orgKnowledge[0].l}</div>
            </div>
            <div style={cellStyleLast}>
              <div style={numStyle}>{orgKnowledge[1].n}</div>
              <div style={labelStyleCell}>{orgKnowledge[1].l}</div>
            </div>
            <div style={cellStyle}>
              <div style={numStyle}>{orgKnowledge[2].n}</div>
              <div style={labelStyleCell}>{orgKnowledge[2].l}</div>
            </div>
            <div style={cellStyleLast}>
              <div style={numStyle}>{orgKnowledge[3].n}</div>
              <div style={labelStyleCell}>{orgKnowledge[3].l}</div>
            </div>
          </div>
        </div>

        {/* Right card — dark */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 16,
            overflow: 'hidden',
            background: 'var(--ink)',
            color: 'var(--on-ink-1)',
          }}
        >
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--line-on-ink)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: 15 }}>Inteligência Gerada</span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--accent-ink)',
                letterSpacing: '0.08em',
              }}
            >
              IMPACTO
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={cellStyleInk}>
              <div style={numStyleInk}>{intelGen[0].n}</div>
              <div style={labelStyleInk}>{intelGen[0].l}</div>
            </div>
            <div style={cellStyleInkLast}>
              <div style={numStyleInk}>{intelGen[1].n}</div>
              <div style={labelStyleInk}>{intelGen[1].l}</div>
            </div>
            <div style={cellStyleInk}>
              <div style={numStyleInk}>{intelGen[2].n}</div>
              <div style={labelStyleInk}>{intelGen[2].l}</div>
            </div>
            <div style={cellStyleInkLast}>
              <div style={numStyleInk}>{intelGen[3].n}</div>
              <div style={labelStyleInk}>{intelGen[3].l}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources row */}
      <div
        style={{
          marginTop: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
          paddingTop: 30,
          borderTop: '1px solid var(--line)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
          }}
        >
          Fontes conectadas
        </span>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          {sources.map((src) => (
            <span
              key={src}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--ink-2)',
                border: '1px solid var(--line)',
                borderRadius: 100,
                padding: '5px 13px',
              }}
            >
              {src}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DemandScreen({ demand, setDemand, workspace, setWorkspace, isOn, toggleKb, runSearch }: DemandProps) {
  const [textareaFocused, setTextareaFocused] = useState(false);

  const selectedKbLabels = kbDefs.filter((kd) => isOn(kd.key)).map((kd) => kd.label);
  const selectedCount = selectedKbLabels.length;
  const scopeLabel =
    selectedCount === 4 ? 'Completo' : selectedCount === 0 ? 'Nenhuma fonte' : 'Parcial';

  return (
    <div
      className="di-scrn"
      style={{ padding: '56px var(--pad-x) 80px', maxWidth: 900 }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          02 / NOVA DEMANDA
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      {/* Hero */}
      <div className="di-stag">
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(40px, 4.6vw, 60px)',
            margin: 0,
            maxWidth: '16ch',
            color: 'var(--ink)',
          }}
        >
          Descreva a nova demanda.
        </h1>
        <p
          style={{
            fontSize: 19,
            lineHeight: 1.5,
            color: 'var(--ink-2)',
            maxWidth: '58ch',
            margin: '20px 0 0',
          }}
        >
          Antes de gerar qualquer artefato, a plataforma busca em toda a organização o que já foi
          decidido, errado e resolvido sobre problemas semelhantes.
        </p>
      </div>

      {/* Textarea */}
      <div style={{ marginTop: 36 }}>
        <label
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: 10,
          }}
        >
          Demanda
        </label>
        <textarea
          value={demand}
          onChange={(e) => setDemand(e.target.value)}
          onFocus={() => setTextareaFocused(true)}
          onBlur={() => setTextareaFocused(false)}
          placeholder="Ex: Permitir alteração de vigência"
          style={{
            width: '100%',
            minHeight: 120,
            resize: 'vertical',
            fontFamily: 'var(--serif)',
            fontSize: 26,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            padding: '22px 24px',
            border: `1px solid ${textareaFocused ? 'var(--clay)' : 'var(--line-strong)'}`,
            borderRadius: 16,
            background: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
            outline: 'none',
            boxShadow: textareaFocused ? '0 0 0 3px rgba(36,75,107,0.28)' : 'none',
            transition: 'border-color .15s, box-shadow .15s',
          }}
        />
      </div>

      {/* Context pills */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 18,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.06em',
          }}
        >
          CONTEXTO
        </span>
        {['Domínio · Fundos', 'Tipo · Mudança de regra', 'Squad · Plataforma'].map((pill) => (
          <span
            key={pill}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--ink-2)',
              border: '1px solid var(--line)',
              borderRadius: 100,
              padding: '5px 13px',
            }}
          >
            {pill}
          </span>
        ))}
      </div>

      {/* Fontes de Conhecimento section */}
      <div
        style={{
          marginTop: 42,
          paddingTop: 36,
          borderTop: '1px solid var(--line)',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(26px, 2.6vw, 32px)',
            letterSpacing: '-0.01em',
            marginBottom: 8,
            fontWeight: 600,
            color: 'var(--ink)',
          }}
        >
          Fontes de Conhecimento
        </h2>
        <p
          style={{
            fontSize: 16,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            maxWidth: '62ch',
            margin: '0 0 24px',
          }}
        >
          Selecione o Workspace e as fontes que serão utilizadas para construir a memória
          organizacional desta análise.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Workspace select */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Workspace
              </label>
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 16,
                  padding: '13px 16px',
                  border: '1px solid var(--line-strong)',
                  borderRadius: 8,
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  maxWidth: 320,
                  width: '100%',
                  outline: 'none',
                }}
              >
                <option value="ANBIMA">ANBIMA</option>
                <option value="Orla">Orla</option>
                <option value="Cliente XPTO">Cliente XPTO</option>
                <option value="Sandbox">Sandbox</option>
              </select>
            </div>

            {/* KB checkboxes */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 8,
                }}
              >
                Fontes disponíveis
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 11,
                }}
              >
                {kbDefs.map((kd) => {
                  const on = isOn(kd.key);
                  return (
                    <div
                      key={kd.key}
                      onClick={() => toggleKb(kd.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '13px 15px',
                        background: 'var(--paper)',
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          background: on ? 'var(--clay)' : 'transparent',
                          border: `1px solid ${on ? 'var(--clay)' : 'var(--line-strong)'}`,
                          color: on ? 'var(--paper)' : 'transparent',
                          fontSize: 12,
                          fontWeight: 700,
                          transition: 'all .15s',
                        }}
                      >
                        ✓
                      </div>
                      <span
                        style={{
                          fontSize: 15,
                          color: 'var(--ink)',
                          fontWeight: 500,
                        }}
                      >
                        {kd.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: 'var(--ink-2)',
                lineHeight: 1.55,
                maxWidth: '62ch',
                margin: 0,
              }}
            >
              Estas fontes alimentarão o RAG e serão utilizadas para recuperar experiências
              anteriores, decisões, riscos, regras de negócio e soluções já utilizadas pela
              organização.
            </p>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Dark memory card */}
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 16,
                background: 'var(--ink)',
                color: 'var(--on-ink-1)',
                padding: '22px 24px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-ink)',
                  marginBottom: 16,
                }}
              >
                Memória organizacional
              </div>

              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--on-ink-3)',
                }}
              >
                Workspace
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 24,
                  letterSpacing: '-0.01em',
                  margin: '3px 0 16px',
                  color: 'var(--on-ink-1)',
                }}
              >
                {workspace}
              </div>

              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--on-ink-3)',
                  marginBottom: 6,
                }}
              >
                Fontes
              </div>
              <p
                style={{
                  fontSize: 14.5,
                  color: 'var(--on-ink-1)',
                  lineHeight: 1.5,
                  margin: '0 0 16px',
                }}
              >
                {selectedKbLabels.length > 0 ? selectedKbLabels.join(' · ') : '—'}
              </p>

              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--on-ink-3)',
                }}
              >
                Escopo
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: 'var(--on-ink-1)',
                  marginTop: 3,
                }}
              >
                {scopeLabel}
              </div>
            </div>

            {/* Metrics card */}
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: 16,
                background: 'var(--paper)',
                padding: '8px 22px',
              }}
            >
              {memoryMetrics.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom:
                      i < memoryMetrics.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 26,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                      flex: '0 0 auto',
                      color: 'var(--ink)',
                    }}
                  >
                    {m.n}
                  </span>
                  <span
                    style={{
                      fontSize: 13.5,
                      color: 'var(--ink-2)',
                      lineHeight: 1.3,
                    }}
                  >
                    {m.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          marginTop: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="di-btn-primary"
          onClick={runSearch}
          style={{
            fontWeight: 600,
            fontSize: 16,
            padding: '15px 30px',
            borderRadius: 8,
            border: '1px solid var(--clay)',
            background: 'var(--clay)',
            color: 'var(--paper)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 11,
            cursor: 'pointer',
          }}
        >
          Buscar conhecimento organizacional{' '}
          <span style={{ fontFamily: 'var(--mono)' }}>→</span>
        </button>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--ink-3)',
          }}
        >
          RAG sobre {workspace} ·{' '}
          {selectedKbLabels.length > 0 ? selectedKbLabels.join(', ') : 'nenhuma fonte'}
        </span>
      </div>
    </div>
  );
}

function SearchingScreen({ demand }: SearchingProps) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        textAlign: 'center',
      }}
    >
      {/* Spinner */}
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 34 }}>
        {/* Track ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid var(--line)',
            borderRadius: '50%',
          }}
        />
        {/* Active ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid var(--line)',
            borderTopColor: 'var(--clay)',
            borderRadius: '50%',
            animation: 'di-spin 1s linear infinite',
          }}
        />
        {/* RAG label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--clay)',
            letterSpacing: '0.08em',
          }}
        >
          RAG
        </div>
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          fontSize: 'clamp(28px, 3.2vw, 40px)',
          letterSpacing: '-0.02em',
          margin: 0,
          maxWidth: '18ch',
        }}
      >
        Buscando conhecimento em toda a organização…
      </h2>

      {/* Demand text */}
      <p
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 13,
          color: 'var(--ink-3)',
          margin: '16px 0 30px',
          letterSpacing: '0.04em',
        }}
      >
        &ldquo;{demand}&rdquo;
      </p>

      {/* Scan rows */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
          minWidth: 320,
          textAlign: 'left',
        }}
      >
        {scanLabels.map((label, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              opacity: 0,
              animation: `di-pop .4s var(--ease) ${0.15 + i * 0.26}s forwards`,
            }}
          >
            {/* Checkmark box */}
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                border: '1px solid var(--sage)',
                display: 'inline-grid',
                placeItems: 'center',
                color: 'var(--sage)',
                fontFamily: 'var(--mono)',
                fontSize: 10,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            {/* Label */}
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--ink-2)',
                letterSpacing: '0.03em',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsScreen({ go, demand }: { go: (s: Screen) => void; demand: string }) {
  const countsData = [
    { n: String(counts.projetos), color: 'var(--clay)', label: 'projetos' },
    { n: String(counts.incidentes), color: 'var(--clay)', label: 'incidentes' },
    { n: String(counts.regras), color: 'var(--ink)', label: 'regras de negócio' },
    { n: String(counts.solucoes), color: 'var(--sage)', label: 'solução validada' },
  ];

  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 80px' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          03 / CONHECIMENTO ORGANIZACIONAL
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'var(--sage)',
            whiteSpace: 'nowrap',
          }}
        >
          ● ENCONTRADO
        </span>
      </div>

      {/* Hero */}
      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(36px, 4.2vw, 56px)',
          margin: '0 0 8px',
          maxWidth: '20ch',
          color: 'var(--ink)',
        }}
      >
        A organização já enfrentou isto{' '}
        <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>três vezes</em>.
      </h1>

      <p
        style={{
          fontSize: 18,
          color: 'var(--ink-2)',
          maxWidth: '64ch',
          margin: '0 0 38px',
          lineHeight: 1.5,
        }}
      >
        Conhecimento relevante descoberto fora do projeto atual — decisões, incidentes e soluções
        que normalmente se perderiam.
      </p>

      {/* Counts grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 44,
        }}
      >
        {countsData.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '24px 26px',
              borderRight: i < countsData.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 48,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: item.color,
              }}
            >
              {item.n}
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginTop: 10,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Demand node */}
      <div
        style={{
          border: '1px solid var(--clay)',
          borderRadius: 16,
          background: 'rgba(36,75,107,0.06)',
          padding: '20px 26px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          Demanda atual
        </span>
        <span
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 24,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          {demand}
        </span>
      </div>

      {/* Tree SVG connector */}
      <div style={{ height: 42 }}>
        <svg
          viewBox="0 0 1000 42"
          preserveAspectRatio="none"
          width="100%"
          height="100%"
        >
          <path
            d="M500 0 L500 14 M166 14 L834 14 M166 14 L166 42 M500 14 L500 42 M834 14 L834 42"
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth="1.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Project cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}
      >
        {projects.map((p, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--paper)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 10.5,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                  }}
                >
                  Projeto
                </div>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 24,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.05,
                    marginTop: 4,
                    color: 'var(--ink)',
                  }}
                >
                  {p.name}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 30,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    color: p.tc,
                  }}
                >
                  {p.sim}%
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                    marginTop: 2,
                  }}
                >
                  similaridade
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 5,
                borderRadius: 100,
                background: 'var(--paper-3)',
                margin: '16px 0 20px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  borderRadius: 100,
                  background: p.tc,
                  width: `${p.sim}%`,
                  transformOrigin: 'left',
                  animation: 'di-grow .9s var(--ease) both',
                }}
              />
            </div>

            {/* Kind */}
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 10.5,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
            >
              {p.kind}
            </div>

            {/* Detail */}
            <div
              style={{
                fontSize: 15,
                color: 'var(--ink)',
                lineHeight: 1.45,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {p.detail}
            </div>

            {/* Result row */}
            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: '1px solid var(--line-soft)',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: p.tc,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  letterSpacing: '0.03em',
                  color: p.tc,
                }}
              >
                {p.result}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* People + Teams + Lessons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: 24,
          marginTop: 44,
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* People card */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--paper)',
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 18,
              }}
            >
              Quem já trabalhou nisto
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {people.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      border: '1px solid var(--line-strong)',
                      display: 'inline-grid',
                      placeItems: 'center',
                      fontFamily: 'var(--serif)',
                      fontSize: 15,
                      color: 'var(--ink)',
                      background: 'var(--paper-2)',
                      flexShrink: 0,
                    }}
                  >
                    {p.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: 'var(--ink-3)',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {p.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Teams card */}
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--paper)',
              padding: 24,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                marginBottom: 16,
              }}
            >
              Times impactados
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
              {teams.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--ink)',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 100,
                    padding: '7px 15px',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: lessons card */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 16,
            background: 'var(--ink)',
            color: 'var(--on-ink-1)',
            padding: '26px 28px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--accent-ink)',
              marginBottom: 20,
            }}
          >
            Lições aprendidas encontradas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {lessons.map((l, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 13,
                  alignItems: 'baseline',
                  padding: '13px 0',
                  borderBottom:
                    i < lessons.length - 1 ? '1px solid var(--line-on-ink)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    color: 'var(--accent-ink)',
                    flex: '0 0 auto',
                  }}
                >
                  →
                </span>
                <span
                  style={{
                    fontFamily: 'var(--serif)',
                    fontSize: 16,
                    color: 'var(--on-ink-1)',
                    lineHeight: 1.45,
                  }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA row */}
      <div
        style={{
          marginTop: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
        }}
      >
        <button
          className="di-btn-primary"
          style={{
            fontWeight: 600,
            fontSize: 16,
            padding: '15px 30px',
            borderRadius: 8,
            border: '1px solid var(--ink)',
            background: 'var(--ink)',
            color: 'var(--paper)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 11,
            cursor: 'pointer',
          }}
          onClick={() => go('analysis')}
        >
          Analisar contexto com Claude{' '}
          <span style={{ fontFamily: 'var(--mono)' }}>→</span>
        </button>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--ink-3)',
          }}
        >
          Claude lê todo o conhecimento acima antes de opinar
        </span>
      </div>
    </div>
  );
}

function AnalysisScreen({ analysisState, analysis, go }: { analysisState: 'idle'|'loading'|'done'; analysis: {q:string;a:string}[]|null; go: (s:Screen)=>void }) {
  const sections = analysis ?? analysisFallback;
  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 80px', maxWidth: 1000 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          04 / ANÁLISE CLAUDE
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          {analysisState === 'done' ? '● ANÁLISE CONCLUÍDA' : 'PROCESSANDO'}
        </span>
      </div>

      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(38px, 4.2vw, 56px)',
          margin: '0 0 10px',
          maxWidth: '18ch',
        }}
      >
        Análise de contexto.
      </h1>
      <p
        style={{
          fontSize: 18,
          color: 'var(--ink-2)',
          maxWidth: '62ch',
          margin: '0 0 40px',
        }}
      >
        Claude cruzou a demanda com o conhecimento de 3 projetos, 2 incidentes e 4 regras organizacionais.
      </p>

      {analysisState !== 'done' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ position: 'relative', width: 20, height: 20 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  border: '2px solid var(--line)',
                  borderTopColor: 'var(--clay)',
                  borderRadius: '50%',
                  animation: 'di-spin .9s linear infinite',
                }}
              />
            </div>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--ink-2)',
                letterSpacing: '0.04em',
              }}
            >
              Claude está analisando o contexto organizacional…
            </span>
          </div>
          <Skel h={78} />
          <Skel h={78} />
          <Skel h={78} />
        </div>
      ) : (
        <div>
          <div
            className="di-stag"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              border: '1px solid var(--line)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {sections.map((sec, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'flex-start',
                  padding: '26px 28px',
                  borderBottom: i < sections.length - 1 ? '1px solid var(--line)' : 'none',
                }}
              >
                <span
                  style={{
                    flex: '0 0 56px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--clay)',
                    letterSpacing: '0.04em',
                    paddingTop: 3,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--serif)',
                      fontSize: 23,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.15,
                      marginBottom: 8,
                    }}
                  >
                    {sec.q}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: 'var(--ink-2)',
                      lineHeight: 1.55,
                      maxWidth: '64ch',
                    }}
                  >
                    {sec.a}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 18,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="di-btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 11,
                padding: '15px 30px',
                border: '1px solid var(--clay)',
                background: 'var(--clay)',
                color: 'var(--paper)',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                cursor: 'pointer',
              }}
              onClick={() => go('artifacts')}
            >
              Gerar artefatos enriquecidos{' '}
              <span style={{ fontFamily: 'var(--mono)' }}>→</span>
            </button>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--ink-3)',
              }}
            >
              User Story · BDD · testes · DoD · dependências
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ArtifactsScreen({ artifactsState, artifacts, go }: { artifactsState: 'idle'|'loading'|'done'; artifacts: {userStory:string;bdd:string[];testCases:string[];dod:string[];dependencies:string[];subtasks:string[]}|null; go: (s:Screen)=>void }) {
  const art = artifacts ?? artifactsFallback;
  const bddKeywords = ['Dado', 'Quando', 'Então', 'Mas', 'E'];

  const colorBdd = (line: string) => {
    for (const kw of bddKeywords) {
      if (line.startsWith(kw)) {
        return (
          <span>
            <span style={{ color: 'var(--clay)' }}>{kw}</span>
            {line.slice(kw.length)}
          </span>
        );
      }
    }
    return <span>{line}</span>;
  };

  // Reusable card header style
  const cardHeader: React.CSSProperties = {
    padding: '13px 22px',
    borderBottom: '1px solid var(--line)',
    background: 'var(--paper-2)',
  };
  const cardHeaderLabel: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--ink-2)',
  };
  const cardBase: React.CSSProperties = {
    border: '1px solid var(--line)',
    borderRadius: 16,
    overflow: 'hidden',
  };

  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 90px', maxWidth: 1000 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            letterSpacing: '0.14em',
            color: 'var(--clay)',
            whiteSpace: 'nowrap',
          }}
        >
          05 / ARTEFATOS
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: artifactsState === 'done' ? 'var(--sage)' : 'var(--ink-3)',
            whiteSpace: 'nowrap',
          }}
        >
          {artifactsState === 'done' ? '● GERADO' : 'GERANDO'}
        </span>
      </div>

      {/* H1 */}
      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(38px, 4.2vw, 56px)',
          margin: '0 0 18px',
          maxWidth: '18ch',
          color: 'var(--ink)',
        }}
      >
        Artefatos{' '}
        <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>enriquecidos</em>.
      </h1>

      {/* Info banner */}
      <div
        style={{
          border: '1px solid rgba(36,75,107,0.35)',
          background: 'rgba(36,75,107,0.07)',
          borderRadius: 8,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 40,
          maxWidth: 760,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--clay)',
            flex: '0 0 auto',
          }}
        />
        <span style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.4 }}>
          Gerado utilizando conhecimento de{' '}
          <strong>3 projetos</strong>, <strong>2 incidentes</strong> e{' '}
          <strong>4 regras organizacionais</strong>.
        </span>
      </div>

      {artifactsState !== 'done' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Spinner color="var(--accent-ink)" />
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              Gerando artefatos com a experiência acumulada…
            </span>
          </div>
          <Skel h={90} />
          <Skel h={120} />
          <Skel h={90} />
        </div>
      ) : (
        <div className="di-stag" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* 1. User Story card */}
          <div style={cardBase}>
            <div style={cardHeader}>
              <span style={cardHeaderLabel}>User Story</span>
            </div>
            <div style={{ padding: 24 }}>
              <p
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 23,
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                  color: 'var(--ink)',
                  margin: 0,
                }}
              >
                {art.userStory}
              </p>
            </div>
          </div>

          {/* 2. BDD card */}
          <div style={cardBase}>
            <div style={cardHeader}>
              <span style={cardHeaderLabel}>BDD · Gherkin</span>
            </div>
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {art.bdd.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--ink)',
                  }}
                >
                  {colorBdd(line)}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Two-col: Test Cases + DoD */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {/* Test Cases */}
            <div style={cardBase}>
              <div style={cardHeader}>
                <span style={cardHeaderLabel}>Casos de teste</span>
              </div>
              <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column' }}>
                {art.testCases.map((tc, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 11,
                      alignItems: 'flex-start',
                      padding: '11px 0',
                      borderBottom: i < art.testCases.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        color: 'var(--sage)',
                        flex: '0 0 auto',
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      {tc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Definition of Done */}
            <div style={cardBase}>
              <div style={cardHeader}>
                <span style={cardHeaderLabel}>Definition of Done</span>
              </div>
              <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column' }}>
                {art.dod.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 11,
                      alignItems: 'flex-start',
                      padding: '11px 0',
                      borderBottom: i < art.dod.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 15,
                        height: 15,
                        border: '1px solid var(--ink-3)',
                        borderRadius: 3,
                        flex: '0 0 auto',
                        marginTop: 2,
                      }}
                    />
                    <span style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Two-col: Deps + Subtasks */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
            {/* Dependencies */}
            <div style={cardBase}>
              <div style={cardHeader}>
                <span style={cardHeaderLabel}>Dependências</span>
              </div>
              <div
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {art.dependencies.map((d) => (
                  <span
                    key={d}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      color: 'var(--ink-2)',
                      border: '1px solid var(--line)',
                      borderRadius: 100,
                      padding: '6px 13px',
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Subtasks */}
            <div style={cardBase}>
              <div style={cardHeader}>
                <span style={cardHeaderLabel}>Subtarefas</span>
              </div>
              <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
                {art.subtasks.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 11,
                      alignItems: 'flex-start',
                      padding: '11px 0',
                      borderBottom: i < art.subtasks.length - 1 ? '1px solid var(--line-soft)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        flex: '0 0 auto',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')} ·
                    </span>
                    <span style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                      {st}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            style={{
              marginTop: 48,
              paddingTop: 34,
              borderTop: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 30,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(24px, 2.6vw, 34px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.12,
                maxWidth: '22ch',
                margin: 0,
                color: 'var(--ink)',
              }}
            >
              A especificação está pronta. Agora vire{' '}
              <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>trabalho executável</em>.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="di-btn-ghost"
                style={{ ...s.btn, ...s.btnGhost }}
                onClick={() => go('dashboard')}
              >
                Nova demanda
              </button>
              <button
                className="di-btn-primary"
                style={{ ...s.btn, ...s.btnPrimary }}
                onClick={() => go('plan')}
              >
                Montar plano de entrega →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 90px', maxWidth: 1060 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            whiteSpace: 'nowrap',
          }}
        >
          06 / PLANO DE ENTREGA
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(38px, 4.2vw, 56px)',
          margin: '0 0 10px',
          color: 'var(--ink)',
        }}
      >
        Plano de Entrega.
      </h1>
      <p
        style={{
          fontSize: 18,
          color: 'var(--ink-2)',
          maxWidth: '62ch',
          margin: '0 0 40px',
          lineHeight: 1.5,
        }}
      >
        Transforme a especificação gerada em trabalho executável no ClickUp.
      </p>

      {/* Epic Card */}
      <div
        style={{
          border: '1px solid var(--line)',
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        {/* Card header */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--paper-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
            }}
          >
            Epic / Feature
          </span>
          <span
            style={{
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              fontSize: 15,
              color: 'var(--ink)',
            }}
          >
            {planData.epic}
          </span>
        </div>
        {/* Card body */}
        <div style={{ padding: '26px 24px', background: 'var(--paper)' }}>
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--clay)',
              marginBottom: 10,
            }}
          >
            User Story principal
          </div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 26,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              marginBottom: 14,
              color: 'var(--ink)',
            }}
          >
            {planData.usTitle}
          </div>
          <div
            style={{
              fontSize: 16,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
              maxWidth: '70ch',
            }}
          >
            {planData.usDesc}
          </div>
        </div>
      </div>

      {/* Subtasks label */}
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          margin: '6px 0 14px',
        }}
      >
        Subtarefas sugeridas
      </div>

      {/* Subtasks grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          marginBottom: 32,
        }}
      >
        {planData.groups.map((g, i) => (
          <div
            key={i}
            style={{
              border: '1px solid var(--line)',
              borderRadius: 16,
              background: 'var(--paper)',
              padding: '22px 24px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--sans)',
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 2,
                  background: 'var(--clay)',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              {g.frente}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {g.items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: '9px 0',
                    borderTop: '1px solid var(--line-soft)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      color: 'var(--ink-3)',
                      flex: '0 0 auto',
                      fontSize: 13,
                    }}
                  >
                    +
                  </span>
                  <span style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Deps + Risk */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 18,
          marginBottom: 32,
        }}
      >
        {/* Dependencies card */}
        <div
          style={{
            border: '1px solid var(--line)',
            borderRadius: 16,
            background: 'var(--paper)',
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--ink-3)',
              marginBottom: 14,
            }}
          >
            Dependências
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {planData.deps.map((d) => (
              <span
                key={d}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 100,
                  padding: '6px 13px',
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Risk card */}
        <div
          style={{
            border: '1px solid var(--clay)',
            borderRadius: 16,
            background: 'rgba(36,75,107,0.06)',
            padding: 24,
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--clay)',
              marginBottom: 14,
            }}
          >
            Risco da implementação
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 52,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--clay)',
              }}
            >
              {planData.risk.score}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--ink-3)',
              }}
            >
              / 100
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--clay)',
                border: '1px solid rgba(36,75,107,0.35)',
                borderRadius: 100,
                padding: '4px 10px',
                marginLeft: 'auto',
              }}
            >
              {planData.risk.label}
            </span>
          </div>
          {/* Risk bar */}
          <div
            style={{
              height: 6,
              borderRadius: 100,
              background: 'var(--paper-3)',
              marginTop: 18,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                borderRadius: 100,
                background: 'var(--clay)',
                width: `${planData.risk.score}%`,
                transformOrigin: 'left',
                animation: 'di-grow .9s var(--ease)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Reuse label */}
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          margin: '6px 0 14px',
        }}
      >
        Conhecimento reaproveitado
      </div>

      {/* Reuse grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4,1fr)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {planData.reuse.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '22px 22px',
              borderRight: i < planData.reuse.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 42,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--clay)',
              }}
            >
              {r.n}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.4 }}>
              {r.l}
            </div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="di-btn-ghost"
          style={{ ...s.btn, ...s.btnGhost }}
          onClick={() => go('artifacts')}
        >
          ← Voltar para Artefatos
        </button>
        <button
          className="di-btn-primary"
          style={{ ...s.btn, ...s.btnPrimary }}
          onClick={() => go('preview')}
        >
          Preview no ClickUp <span style={{ fontFamily: 'var(--mono)' }}>→</span>
        </button>
      </div>
    </div>
  );
}

function PreviewScreen({ demand, publishConfig, setPublishConfig, go, doPublish }: PreviewProps) {
  const updateCfg = (key: keyof PublishConfig, value: string | boolean) =>
    setPublishConfig((prev) => ({ ...prev, [key]: value }));

  const connReal = publishConfig.listId.trim().length > 0;
  const connLabel = connReal ? 'ClickUp real conectado' : 'Demo mode';
  const connColor = connReal ? 'var(--sage)' : 'var(--ochre)';
  const connBg = connReal ? 'rgba(30,122,92,0.12)' : 'rgba(138,100,24,0.12)';

  const previewComment = `Análise crítica gerada pelo Decision Intelligence.

Ambiguidades: escopo de "vigência" não distingue claramente data de início e fim; comportamento para entidades filhas (subclasses) indefinido.
Riscos: inconsistência em PL/Cota · histórico incompleto · propagação indevida · falha de auditoria.
Stakeholders impactados: Operação, Compliance, Produto, Engenharia.
Score de risco: 82/100 (Alto).
Contextos históricos usados: Atlas Fundos (incidente de PL/Cota), Previdência (falha de auditoria), Cadastro (análise de impacto reduziu chamados).`;

  const previewSubtasksFull = [
    { group: 'Backend', name: 'Análise de impacto' },
    { group: 'Backend', name: 'Aplicação de vigência' },
    { group: 'Backend', name: 'Auditoria' },
    { group: 'Frontend', name: 'Modal de alteração' },
    { group: 'Frontend', name: 'Lista de impactos' },
    { group: 'QA', name: 'Cenários BDD' },
    { group: 'Produto', name: 'Validação de regra' },
  ];

  const previewSectionsFull = [
    'Contexto de negócio',
    'User Story',
    'Critérios BDD',
    'Casos de teste',
    'Definition of Done',
    'Dependências',
    'Conhecimento organizacional reaproveitado',
  ];

  const checkDefsFull: { key: keyof PublishConfig; label: string }[] = [
    { key: 'optTask', label: 'Criar task principal' },
    { key: 'optSubtasks', label: 'Criar subtarefas' },
    { key: 'optComment', label: 'Adicionar comentário com análise crítica' },
    { key: 'optBdd', label: 'Incluir BDD na descrição' },
    { key: 'optDod', label: 'Incluir Definition of Done' },
  ];

  const monoStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 10.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-3)',
  };

  return (
    <div className="di-scrn" style={{ padding: '56px var(--pad-x) 90px', maxWidth: 1100 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 34 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--clay)', whiteSpace: 'nowrap' }}>
          07 / PUBLICAR NO CLICKUP
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          color: connColor,
          background: connBg,
          border: `1px solid ${connColor}`,
          borderRadius: 100,
          padding: '5px 12px',
          whiteSpace: 'nowrap',
        }}>
          ● {connLabel}
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--serif)',
        fontSize: 'clamp(26px, 3.5vw, 36px)',
        fontWeight: 700,
        color: 'var(--ink)',
        lineHeight: 1.2,
        marginBottom: 8,
        letterSpacing: '-0.02em',
      }}>
        Publicar no ClickUp.
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-2)', marginBottom: 36 }}>
        Revise a estrutura que será criada.
      </p>

      {/* 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 24 }}>

        {/* LEFT: tree preview card */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
          {/* Card header */}
          <div style={{
            padding: '14px 22px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--paper-2)',
          }}>
            <span style={{ ...monoStyle }}>Estrutura que será criada</span>
          </div>

          {/* Card body */}
          <div style={{ padding: 24 }}>
            {/* Main task row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--clay)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--serif)', fontSize: 21, letterSpacing: '-0.01em', color: 'var(--ink)', flex: 1 }}>
                Alteração de Vigência de Classe
              </span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
                border: '1px solid var(--line)',
                borderRadius: 100,
                padding: '3px 9px',
                flexShrink: 0,
              }}>
                Task
              </span>
            </div>

            {/* Task content */}
            <div style={{ margin: '14px 0 22px 5px', paddingLeft: 18, borderLeft: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 6 }}>
                Conteúdo da descrição
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {previewSectionsFull.map((sec, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '9px 0',
                    borderBottom: i < previewSectionsFull.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  }}>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--ink-3)', fontSize: 12, flexShrink: 0 }}>#</span>
                    <span style={{ fontSize: 14.5, color: 'var(--ink)' }}>{sec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtasks */}
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', margin: '0 0 4px 5px' }}>
              Subtasks
            </div>
            <div style={{ marginLeft: 5, paddingLeft: 18, borderLeft: '1px solid var(--line)' }}>
              {previewSubtasksFull.map((st, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 0',
                  borderBottom: i < previewSubtasksFull.length - 1 ? '1px solid var(--line-soft)' : 'none',
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', border: '1px solid var(--line-strong)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.06em', color: 'var(--clay)', flex: '0 0 auto' }}>
                    {st.group}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{st.name}</span>
                </div>
              ))}
            </div>

            {/* Auto comment */}
            <div style={{
              marginTop: 22,
              border: '1px solid var(--line)',
              borderRadius: 8,
              background: 'var(--paper-2)',
              padding: '16px 18px',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clay)', marginBottom: 8 }}>
                Comentário automático
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {previewComment}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* "O que publicar" card */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--paper)', padding: '22px 24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
              O que publicar
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {checkDefsFull.map(({ key, label }) => {
                const checked = publishConfig[key] as boolean;
                return (
                  <div
                    key={key}
                    onClick={() => updateCfg(key, !checked)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  >
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      flex: '0 0 auto',
                      display: 'grid',
                      placeItems: 'center',
                      background: checked ? 'var(--clay)' : 'transparent',
                      border: checked ? '1px solid var(--clay)' : '1px solid var(--line-strong)',
                      color: checked ? 'var(--paper)' : 'transparent',
                      fontSize: 13,
                      fontWeight: 700,
                      userSelect: 'none',
                    }}>
                      ✓
                    </div>
                    <span style={{ fontSize: 14.5, color: 'var(--ink)', lineHeight: 1.35 }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ClickUp config card */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--paper)', padding: '22px 24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 16 }}>
              Configuração do ClickUp
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* List ID */}
              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>
                  LIST ID
                </label>
                <input
                  type="text"
                  value={publishConfig.listId}
                  onChange={(e) => updateCfg('listId', e.target.value)}
                  placeholder="Ex: 9014388920"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--mono)',
                    fontSize: 14,
                    padding: '10px 13px',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 8,
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status + Priority 2-col */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>
                    STATUS
                  </label>
                  <select
                    value={publishConfig.status}
                    onChange={(e) => updateCfg('status', e.target.value)}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      padding: '10px 13px',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 8,
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="to do">A fazer</option>
                    <option value="in progress">Em andamento</option>
                    <option value="review">Em revisão</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>
                    PRIORIDADE
                  </label>
                  <select
                    value={publishConfig.priority}
                    onChange={(e) => updateCfg('priority', e.target.value)}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      padding: '10px 13px',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 8,
                      background: 'var(--paper)',
                      color: 'var(--ink)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="1">Urgente</option>
                    <option value="2">Alta</option>
                    <option value="3">Normal</option>
                    <option value="4">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>
                  TAGS
                </label>
                <input
                  type="text"
                  value={publishConfig.tags}
                  onChange={(e) => updateCfg('tags', e.target.value)}
                  placeholder="Ex: decision-intelligence"
                  style={{
                    width: '100%',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    padding: '10px 13px',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 8,
                    background: 'var(--paper)',
                    color: 'var(--ink)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Info row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '11px 14px',
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--paper-2)',
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--sage)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ink-2)', letterSpacing: '0.03em' }}>
                  Token do ClickUp configurado no servidor
                </span>
              </div>

              {/* Note */}
              <p style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.6, color: 'var(--ink-3)', margin: 0 }}>
                List ID, status, prioridade e tags ficam salvos neste navegador. O token vive no backend — o usuário final não precisa informá-lo. Com um List ID válido, a publicação tenta criar a estrutura no ClickUp real.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button
          className="di-btn-ghost"
          style={{ ...s.btn, ...s.btnGhost }}
          onClick={() => go('plan')}
        >
          ← Voltar
        </button>
        <button
          className="di-btn-primary"
          style={{ ...s.btn, ...s.btnPrimary }}
          onClick={() => doPublish(false)}
        >
          Publicar no ClickUp →
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ publishState, publishStep, publishResult, publishError, publishConfig, go, doPublish }: ResultProps) {
  const stepLabels = [
    'Conectando ao ClickUp…',
    'Criando task principal…',
    'Criando subtarefas…',
    'Adicionando comentário de análise…',
  ];

  if (publishState === 'loading') {
    return (
      <div
        className="di-scrn"
        style={{
          padding: '56px var(--pad-x) 90px',
          maxWidth: 820,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <Spinner size={28} color="var(--clay)" />
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontWeight: 600,
            fontSize: 'clamp(30px, 3.4vw, 42px)',
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            lineHeight: 1.1,
          }}>
            Publicando no ClickUp…
          </h1>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isDone = stepNum < publishStep;
            const isActive = stepNum === publishStep;
            const isPending = stepNum > publishStep;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  flex: '0 0 auto',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: isPending ? 'transparent' : 'var(--paper)',
                  background: isPending ? 'transparent' : 'var(--clay)',
                  border: isPending ? '1px solid var(--line-strong)' : '1px solid var(--clay)',
                  animation: isActive ? 'di-pulse 1s ease-in-out infinite' : 'none',
                }}>
                  {isDone ? '✓' : isActive ? '' : ''}
                </div>
                <span style={{ fontSize: 16, color: isPending ? 'var(--ink-3)' : 'var(--ink)' }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (publishState === 'success' && publishResult) {
    const isMock = publishResult.mode === 'mock';
    const connColor = isMock ? 'var(--ochre)' : 'var(--sage)';
    const connBg = isMock ? 'rgba(138,100,24,0.12)' : 'rgba(30,122,92,0.12)';
    const connLabel = isMock ? 'DEMO MODE' : 'CLICKUP REAL';
    const modeText = isMock
      ? 'Modo demo: publicação simulada com sucesso.'
      : 'Publicado no ClickUp real.';

    const resultRows = [
      { k: 'Task principal criada', v: publishResult.taskId },
      { k: 'Subtarefas criadas', v: String(publishResult.subtasksCreated) },
      { k: 'Comentário de análise', v: publishResult.commentCreated ? 'Adicionado' : '—' },
      { k: 'BDD anexado à descrição', v: publishConfig.optBdd ? 'Sim' : 'Não' },
      { k: 'Definition of Done incluída', v: publishConfig.optDod ? 'Sim' : 'Não' },
    ];

    return (
      <div className="di-scrn di-stag" style={{ padding: '56px var(--pad-x) 90px', maxWidth: 820 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'var(--sage)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--paper)',
            fontSize: 22,
            flexShrink: 0,
          }}>
            ✓
          </div>
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: connColor,
            background: connBg,
            border: `1px solid ${connColor}`,
            borderRadius: 100,
            padding: '5px 12px',
          }}>
            {connLabel}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--serif)',
          fontWeight: 600,
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          fontSize: 'clamp(36px, 4.2vw, 54px)',
          color: 'var(--ink)',
          margin: '14px 0 8px',
        }}>
          Plano publicado com sucesso.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', margin: '0 0 32px' }}>
          {modeText}
        </p>

        {/* Results table */}
        <div style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--paper)', padding: '8px 24px' }}>
          {resultRows.map((row, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 18,
              padding: '14px 0',
              borderBottom: i < resultRows.length - 1 ? '1px solid var(--line-soft)' : 'none',
            }}>
              <span style={{ fontSize: 15, color: 'var(--ink-2)' }}>{row.k}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{row.v}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {publishResult.taskUrl && (
            <a
              href={publishResult.taskUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.btn, ...s.btnPrimary, textDecoration: 'none' }}
            >
              Abrir no ClickUp ↗
            </a>
          )}
          <button
            className="di-btn-ghost"
            style={{ ...s.btn, ...s.btnGhost }}
            onClick={() => go('dashboard')}
          >
            Ver histórico
          </button>
          <button
            style={{
              ...s.btn,
              background: 'var(--clay-deep)',
              color: 'var(--on-ink-1)',
              border: 'none',
            }}
            onClick={() => go('demand')}
          >
            Analisar nova demanda
          </button>
        </div>
      </div>
    );
  }

  if (publishState === 'error' && publishError) {
    return (
      <div className="di-scrn di-stag" style={{
        padding: '56px var(--pad-x) 90px',
        maxWidth: 820,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '50vh',
      }}>
        <div style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          background: 'rgba(36,75,107,0.10)',
          border: '1px solid var(--clay)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--clay)',
          fontSize: 22,
          marginBottom: 22,
        }}>
          !
        </div>
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(24px, 3vw, 34px)',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '-0.02em',
          marginBottom: 14,
        }}>
          Não foi possível publicar no ClickUp.
        </h1>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.04em', color: 'var(--clay)', marginBottom: 10 }}>
          {publishError.title}
        </div>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '60ch', margin: '0 0 32px' }}>
          {publishError.detail}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="di-btn-primary"
            style={{ ...s.btn, ...s.btnPrimary }}
            onClick={() => doPublish(false)}
          >
            Tentar novamente
          </button>
          <button
            className="di-btn-ghost"
            style={{ ...s.btn, ...s.btnGhost }}
            onClick={() => doPublish(true)}
          >
            Publicar em modo demo
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function Sidebar({ screen, go }: { screen: Screen; go: (s: Screen) => void }) {
  const navMap: Partial<Record<Screen, Screen>> = { searching: 'insights', result: 'preview' };
  const activeKey = navMap[screen] || screen;

  const sidebarStepDefs = [
    { n: '01', label: 'Painel', key: 'dashboard' },
    { n: '02', label: 'Nova demanda', key: 'demand' },
    { n: '03', label: 'Conhecimento organizacional', key: 'insights' },
    { n: '04', label: 'Análise Claude', key: 'analysis' },
    { n: '05', label: 'Artefatos', key: 'artifacts' },
    { n: '06', label: 'Plano de entrega', key: 'plan' },
    { n: '07', label: 'Publicar no ClickUp', key: 'preview' },
  ];

  return (
    <aside
      style={{
        width: 256,
        flex: '0 0 256px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'var(--paper)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '30px 24px 24px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 6 }}>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 30,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: 'var(--clay)',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          Orla
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--clay)',
          }}
        >
          Decision Intelligence
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
          margin: '18px 2px 24px',
          fontFamily: 'var(--mono)',
          letterSpacing: '0.02em',
        }}
      >
        Plataforma de Inteligência Organizacional
      </p>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sidebarStepDefs.map((step) => {
          const isActive = activeKey === step.key;
          return (
            <button
              key={step.key}
              onClick={() => go(step.key as Screen)}
              style={{
                display: 'grid',
                gridTemplateColumns: '26px 1fr',
                gap: 11,
                alignItems: 'center',
                padding: '11px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: isActive ? 'var(--ink)' : 'transparent',
                border: 'none',
                textAlign: 'left',
                transition: 'background .15s',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: isActive ? 'var(--accent-ink)' : 'var(--ink-3)',
                }}
              >
                {step.n}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.25,
                  color: isActive ? 'var(--paper)' : 'var(--ink-2)',
                }}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 22,
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--sage)',
              display: 'inline-block',
              flexShrink: 0,
              animation: 'di-pulse 2.4s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--ink-2)',
              letterSpacing: '0.04em',
            }}
          >
            Conhecimento vivo
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10.5,
            letterSpacing: '0.03em',
            color: 'var(--ink-3)',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          92 projetos indexados / 48.000 comentários analisados / RAG · sincronizado há 2 min
        </p>
      </div>
    </aside>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const globalCss = `
  :root {
    --canvas: #F7F6F2;
    --paper: #FFFFFF;
    --paper-2: #F2F4F7;
    --paper-3: #ECEEF1;
    --ink: #1F2933;
    --ink-soft: #2B3A47;
    --ink-2: #667085;
    --ink-3: #7B8694;
    --clay: #244B6B;
    --clay-deep: #1B3A53;
    --accent-ink: #2EC4B6;
    --sage: #1E7A5C;
    --ochre: #8A6418;
    --line: #D9DEE5;
    --line-soft: #E4E8ED;
    --line-strong: #C2C9D2;
    --line-on-ink: rgba(255,255,255,0.16);
    --on-ink-1: #FFFFFF;
    --on-ink-2: #B5BEC9;
    --on-ink-3: #98A2AE;
    --shadow-1: none;
    --shadow-2: none;
    --serif: "Kantumruy Pro", system-ui, sans-serif;
    --sans: "Kantumruy Pro", system-ui, sans-serif;
    --mono: "Kantumruy Pro", ui-monospace, monospace;
    --pad-x: clamp(32px, 4vw, 48px);
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    font-variant-numeric: tabular-nums;
  }

  @keyframes di-fade {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes di-grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes di-spin {
    to { transform: rotate(360deg); }
  }
  @keyframes di-pulse {
    0%, 100% { opacity: .35; }
    50% { opacity: 1; }
  }
  @keyframes di-shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes di-pop {
    from { opacity: 0; transform: scale(.85); }
    to { opacity: 1; transform: none; }
  }
  @keyframes di-scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(2200%); }
  }

  .di-scrn { animation: di-fade .5s var(--ease) both; }
  .di-stag > *:nth-child(1) { animation: di-fade .55s var(--ease) .0s both; }
  .di-stag > *:nth-child(2) { animation: di-fade .55s var(--ease) .07s both; }
  .di-stag > *:nth-child(3) { animation: di-fade .55s var(--ease) .14s both; }
  .di-stag > *:nth-child(4) { animation: di-fade .55s var(--ease) .21s both; }
  .di-stag > *:nth-child(5) { animation: di-fade .55s var(--ease) .28s both; }
  .di-skel {
    background: linear-gradient(90deg, var(--paper-2) 0px, var(--paper-3) 200px, var(--paper-2) 400px);
    background-size: 800px 100%;
    animation: di-shimmer 1.3s linear infinite;
    border-radius: 4px;
  }

  .di-btn-primary:hover { opacity: .88; }
  .di-btn-ghost:hover { background: var(--paper-2); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// ─── Main component ───────────────────────────────────────────────────────────

function getInitialPublishConfig(): PublishConfig {
  if (typeof window === 'undefined') return DEFAULT_PUBLISH_CONFIG;
  try {
    const stored = localStorage.getItem('di-publish-config');
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<PublishConfig>;
      return { ...DEFAULT_PUBLISH_CONFIG, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PUBLISH_CONFIG;
}

export default function DIPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [demand, setDemand] = useState('Permitir alteração de vigência');
  const [workspace, setWorkspace] = useState('ANBIMA');
  const [kb, setKb] = useState<Record<string, boolean>>({});

  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [analysis, setAnalysis] = useState<AnalysisSection[] | null>(null);

  const [artifactsState, setArtifactsState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [artifacts, setArtifacts] = useState<ArtifactsData | null>(null);

  const [publishState, setPublishState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [publishStep, setPublishStep] = useState(0);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<PublishError | null>(null);

  const [publishConfig, setPublishConfig] = useState<PublishConfig>(getInitialPublishConfig);

  // Save publishConfig to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('di-publish-config', JSON.stringify(publishConfig));
    } catch {
      // ignore
    }
  }, [publishConfig]);

  const isOn = (key: string) => kb[key] !== false;
  const toggleKb = (key: string) => setKb((prev) => ({ ...prev, [key]: !isOn(key) }));

  const runAnalysis = useCallback(async () => {
    setAnalysisState('loading');
    try {
      const [res] = await Promise.all([
        fetch('/api/platform/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand }),
        }),
        new Promise<void>((r) => setTimeout(r, 1400)),
      ]);
      if (res.ok) {
        const data = (await res.json()) as { sections: AnalysisSection[] };
        setAnalysis(data.sections);
      } else {
        setAnalysis(analysisFallback);
      }
    } catch {
      setAnalysis(analysisFallback);
    }
    setAnalysisState('done');
  }, [demand]);

  const runArtifacts = useCallback(async () => {
    setArtifactsState('loading');
    try {
      const [res] = await Promise.all([
        fetch('/api/platform/artifacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand }),
        }),
        new Promise<void>((r) => setTimeout(r, 1400)),
      ]);
      if (res.ok) {
        const data = (await res.json()) as ArtifactsData;
        setArtifacts(data);
      } else {
        setArtifacts(artifactsFallback);
      }
    } catch {
      setArtifacts(artifactsFallback);
    }
    setArtifactsState('done');
  }, [demand]);

  const go = useCallback(
    (s: Screen) => {
      setScreen(s);
      if (mainRef.current) mainRef.current.scrollTop = 0;
      if (s === 'analysis' && analysisState === 'idle') runAnalysis();
      if (s === 'artifacts' && artifactsState === 'idle') runArtifacts();
    },
    [analysisState, artifactsState, runAnalysis, runArtifacts]
  );

  const runSearch = useCallback(() => {
    go('searching');
    setTimeout(() => go('insights'), 2000);
  }, [go]);

  const doPublish = useCallback(
    async (forceMock: boolean) => {
      setPublishState('loading');
      setPublishStep(0);
      setPublishResult(null);
      setPublishError(null);
      setScreen('result');
      if (mainRef.current) mainRef.current.scrollTop = 0;

      const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

      try {
        for (let i = 0; i < 4; i++) {
          setPublishStep(i);
          await delay(700);
        }

        const res = await fetch('/api/platform/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand, publishConfig, forceMock }),
        });

        if (res.ok) {
          const data = (await res.json()) as PublishResult;
          setPublishResult(data);
          setPublishState('success');
        } else {
          setPublishResult({
            mode: 'mock',
            taskId: 'DI-2847',
            taskUrl: null,
            subtasksCreated: previewSubtasks.length,
            commentCreated: true,
          });
          setPublishState('success');
        }
      } catch {
        setPublishResult({
          mode: 'mock',
          taskId: 'DI-2847',
          taskUrl: null,
          subtasksCreated: previewSubtasks.length,
          commentCreated: true,
        });
        setPublishState('success');
      }
    },
    [demand, publishConfig]
  );

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <DashboardScreen go={go} />;
      case 'demand':
        return (
          <DemandScreen
            demand={demand}
            setDemand={setDemand}
            workspace={workspace}
            setWorkspace={setWorkspace}
            kb={kb}
            isOn={isOn}
            toggleKb={toggleKb}
            runSearch={runSearch}
          />
        );
      case 'searching':
        return <SearchingScreen demand={demand} />;
      case 'insights':
        return <InsightsScreen go={go} demand={demand} />;
      case 'analysis':
        return <AnalysisScreen analysisState={analysisState} analysis={analysis} go={go} />;
      case 'artifacts':
        return (
          <ArtifactsScreen artifactsState={artifactsState} artifacts={artifacts} go={go} />
        );
      case 'plan':
        return <PlanScreen go={go} />;
      case 'preview':
        return (
          <PreviewScreen
            demand={demand}
            publishConfig={publishConfig}
            setPublishConfig={setPublishConfig}
            go={go}
            doPublish={doPublish}
          />
        );
      case 'result':
        return (
          <ResultScreen
            publishState={publishState}
            publishStep={publishStep}
            publishResult={publishResult}
            publishError={publishError}
            publishConfig={publishConfig}
            go={go}
            doPublish={doPublish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalCss }} />
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          background: 'var(--canvas)',
          color: 'var(--ink)',
          fontFamily: 'var(--sans)',
        }}
      >
        <Sidebar screen={screen} go={go} />
        <main
          ref={mainRef}
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            overflowY: 'auto',
            height: '100vh',
          }}
        >
          {renderScreen()}
        </main>
      </div>
    </>
  );
}
