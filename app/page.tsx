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
  { n: '1.284', l: 'tasks indexadas', tip: 'Total de tasks do ClickUp lidas e indexadas pelo sistema para busca e contexto.' },
  { n: '92', l: 'projetos indexados', tip: 'Número de espaços e projetos distintos encontrados no workspace do ClickUp.' },
  { n: '48.000', l: 'comentários analisados', tip: 'Comentários de tasks processados para extração de conhecimento e contexto histórico.' },
  { n: '7.300', l: 'insights catalogados', tip: 'Padrões, decisões e aprendizados extraídos das tasks e catalogados para uso futuro.' },
];

const intelGen = [
  { n: '312', l: 'riscos identificados', tip: 'Riscos detectados pelo assistente IA ao analisar demandas com base no histórico organizacional.' },
  { n: '194', l: 'requisitos enriquecidos', tip: 'Requisitos que receberam contexto adicional com base em experiências anteriores similares.' },
  { n: '76', l: 'incidentes reaproveitados', tip: 'Ocorrências passadas usadas como referência para enriquecer análises de novas demandas.' },
  { n: '88%', l: 'score de enriquecimento contextual', tip: 'Percentual médio de enriquecimento contextual aplicado às demandas — quanto o histórico organizacional contribuiu para as análises.' },
];

const connectedSources = ['ClickUp'];
const futureSources = ['Jira', 'Confluence', 'Notion', 'Reuniões', 'Comentários'];

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
  { n: '7', l: 'Documentos' },
];

// scanLabels is built dynamically in SearchingScreen from real stats

// ─── Insights + Plan types ────────────────────────────────────────────────────
interface InsightsProject {
  name: string; sim: number; kind: string; detail: string; result: string; tc: string;
}
interface InsightsPerson { name: string; role: string; initials: string; }
interface InsightsData {
  projects: InsightsProject[];
  people: InsightsPerson[];
  teams: string[];
  lessons: string[];
  counts: { projetos: number; incidentes: number; regras: number; solucoes: number };
}
interface PlanGroup { frente: string; items: string[]; }
interface PlanData {
  epic: string; usTitle: string; usDesc: string;
  groups: PlanGroup[];
  deps: string[];
  risk: { score: number; label: string; factors: string[] };
  reuse: { n: string; l: string }[];
}


const previewSubtasks: { group: string; name: string }[] = [];

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
  { n: '04', label: 'Análise Assistente IA', key: 'analysis' },
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


const DEFAULT_PUBLISH_CONFIG: PublishConfig = {
  listId: '',
  status: 'to do',
  priority: '3',
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

function Skel({ h = 20, w = '100%', r = 4 }: { h?: number; w?: number | string; r?: number }) {
  return <div className="di-skel" style={{ height: h, width: w, borderRadius: r }} />;
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
  workspaceId: string;
  workspaces: { id: string; name: string }[];
  setWorkspace: (v: string) => void;
  setWorkspaceId: (v: string) => void;
  kb: Record<string, boolean>;
  isOn: (key: string) => boolean;
  toggleKb: (key: string) => void;
  runSearch: () => void;
  stats: { spaces: number; lists: number; tasks: number } | null;
}

interface SearchingProps {
  demand: string;
  stats: { spaces: number; lists: number; tasks: number } | null;
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
  artifactsError: string | null;
  onRetryArtifacts: () => void;
  go: GoFn;
}

interface PlanProps {
  go: GoFn;
}

interface ListOption { id: string; name: string; }
interface FolderOption { id: string; name: string; lists: ListOption[]; }
interface SpaceOption { id: string; name: string; folders: FolderOption[]; lists: ListOption[]; }

interface PreviewProps {
  demand: string;
  artifacts: ArtifactsData | null;
  analysis: AnalysisSection[] | null;
  plan: PlanData | null;
  workspace: string;
  workspaceId: string;
  publishConfig: PublishConfig;
  setPublishConfig: React.Dispatch<React.SetStateAction<PublishConfig>>;
  go: GoFn;
  doPublish: () => void;
}

interface ResultProps {
  publishState: 'idle' | 'loading' | 'success' | 'error';
  publishStep: number;
  publishResult: PublishResult | null;
  publishError: PublishError | null;
  publishConfig: PublishConfig;
  go: GoFn;
  doPublish: () => void;
}

interface SidebarProps {
  activeKey: string;
  go: GoFn;
}

// ─── Screen components (defined outside DIPage) ───────────────────────────────

function DashboardScreen({ go, stats }: { go: (s: Screen) => void; stats: { spaces: number; lists: number; tasks: number } | null }) {
  const liveKnowledge = stats
    ? [
        { n: stats.tasks >= 100 ? `${stats.tasks}+` : String(stats.tasks), l: 'tasks indexadas', tip: orgKnowledge[0].tip },
        { n: String(stats.spaces), l: 'spaces indexados', tip: orgKnowledge[1].tip },
        { n: String(stats.lists), l: 'listas indexadas', tip: orgKnowledge[1].tip },
        { n: orgKnowledge[3].n, l: 'insights catalogados', tip: orgKnowledge[3].tip },
      ]
    : orgKnowledge;
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
          reuniões e pessoas. A lore descobre e reaproveita essa inteligência para
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
            {liveKnowledge.map((item, i) => (
              <div key={i} style={i % 2 === 0 ? cellStyle : cellStyleLast}>
                <div style={numStyle}>{item.n}</div>
                <div title={item.tip} style={{ ...labelStyleCell, cursor: item.tip ? 'help' : undefined, borderBottom: item.tip ? '1px dashed currentColor' : undefined, display: 'inline-block' }}>{item.l}</div>
              </div>
            ))}
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
            {intelGen.map((item, i) => (
              <div key={i} style={i % 2 === 0 ? cellStyleInk : cellStyleInkLast}>
                <div style={numStyleInk}>{item.n}</div>
                <div title={item.tip} style={{ ...labelStyleInk, cursor: 'help', borderBottom: '1px dashed currentColor', display: 'inline-block' }}>{item.l}</div>
              </div>
            ))}
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
          {connectedSources.map((src) => (
            <span
              key={src}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--ink)',
                border: '1px solid rgba(74,222,128,0.45)',
                borderRadius: 100,
                padding: '5px 13px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ color: 'var(--sage)', fontSize: 8 }}>●</span>
              {src}
            </span>
          ))}
          {futureSources.map((src) => (
            <span
              key={src}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--ink-3)',
                border: '1px solid var(--line)',
                borderRadius: 100,
                padding: '5px 13px',
                opacity: 0.55,
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

function DemandScreen({ demand, setDemand, workspace, workspaceId, workspaces, setWorkspace, setWorkspaceId, isOn, toggleKb, runSearch, stats }: DemandProps) {
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
          placeholder="Descreva a demanda ou cole a transcrição da reunião…"
          style={{
            width: '100%',
            minHeight: 120,
            maxHeight: 280,
            resize: 'vertical',
            overflowY: 'auto',
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
        {['Tipo · Nova demanda', 'Squad · Plataforma'].map((pill) => (
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
                value={workspaceId || workspace}
                onChange={(e) => {
                  const val = e.target.value;
                  if (workspaces.length > 0) {
                    const found = workspaces.find((w) => w.id === val);
                    setWorkspaceId(val);
                    setWorkspace(found?.name ?? val);
                  } else {
                    setWorkspace(val);
                    setWorkspaceId(val);
                  }
                }}
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
                {workspaces.length > 0 ? (
                  workspaces.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))
                ) : (
                  <>
                    <option value="ANBIMA">ANBIMA</option>
                    <option value="Orla">Orla</option>
                    <option value="Cliente XPTO">Cliente XPTO</option>
                    <option value="Sandbox">Sandbox</option>
                  </>
                )}
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
              {(stats
                ? [
                    { n: String(stats.spaces), l: 'Spaces' },
                    { n: String(stats.lists), l: 'Lists' },
                    { n: stats.tasks >= 100 ? `${stats.tasks}+` : String(stats.tasks), l: 'Tasks' },
                  ]
                : memoryMetrics
              ).map((m, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom:
                      i < arr.length - 1 ? '1px solid var(--line-soft)' : 'none',
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

// ─── Loading quips per step ───────────────────────────────────────────────────

const quipsByStep: Record<string, string[]> = {
  searching: [
    'Vasculhando o ClickUp como se fosse o baú do tesouro…',
    'Lendo 48 mil comentários. Sim, todos.',
    'Consultando o histórico de decisões (algumas delas, questionáveis)…',
    'Encontrando padrões que ninguém sabia que existiam…',
    'Buscando quem já resolveu algo parecido antes (alguém sempre já resolveu).',
  ],
  analysis: [
    'Perguntando ao assistente IA o que ele acha disso tudo…',
    'O assistente está lendo entre as linhas. E entre as tasks.',
    'Identificando o que pode dar errado antes que você descubra sozinho…',
    'Cruzando sua demanda com anos de histórico organizacional.',
    'Analisando riscos que você nem sabia que existiam. De nada.',
    'Pensando nas perguntas difíceis que ninguém quer fazer em reunião.',
  ],
  artifacts: [
    'Escrevendo a User Story com todo o cuidado que ela merece…',
    'Gerando BDD. Dado que você pediu, quando o sistema processar, então vai aparecer.',
    'Checando se os critérios de aceite fazem sentido. Alguém tinha que fazer isso.',
    'Transformando reunião em especificação. Mágica organizacional em andamento.',
    'Definindo o Definition of Done. Porque "tá bom" não é critério.',
    'Construindo artefatos com base na experiência de quem veio antes.',
  ],
  plan: [
    'Montando o plano de entrega com base no que realmente funciona aqui…',
    'Distribuindo tarefas entre Backend, Frontend e QA. Com carinho.',
    'Calculando o risco. Spoiler: sempre tem algum.',
    'Verificando dependências para evitar bloqueios surpresa.',
    'Estruturando épico e sprints. O time vai agradecer (ou reclamar, mas com estrutura).',
    'Consultando projetos similares para não reinventar a roda.',
  ],
};

function LoadingQuip({ step }: { step: keyof typeof quipsByStep }) {
  const quips = quipsByStep[step] ?? quipsByStep.searching;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % quips.length), 2800);
    return () => clearInterval(id);
  }, [quips.length]);
  return (
    <div style={{
      padding: '13px 18px',
      border: '1px solid var(--line)',
      borderRadius: 10,
      background: 'var(--paper-2)',
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      marginBottom: 24,
    }}>
      <div style={{ position: 'relative', width: 16, height: 16, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, border: '2px solid var(--line)', borderTopColor: 'var(--clay)', borderRadius: '50%', animation: 'di-spin .9s linear infinite' }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--ink-2)', letterSpacing: '0.01em' }}>
        {quips[idx]}
      </span>
    </div>
  );
}

function SearchingScreen({ demand, stats }: SearchingProps) {
  const scanLabels = [
    `ClickUp · ${stats ? `${stats.tasks}+` : '…'} tasks varridas`,
    `${stats ? `${stats.spaces} spaces` : 'Spaces'} · ${stats ? `${stats.lists} listas` : 'listas'}`,
    'Confluence + Notion · documentação',
    'Incidentes e post-mortems',
    'Construindo contexto semântico (RAG)',
    'Passando para a IA…',
  ];
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
          maxHeight: 72,
          overflowY: 'auto',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        &ldquo;{demand}&rdquo;
      </p>

      <LoadingQuip step="searching" />

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


function InsightsScreen({ go, demand, insightsState, insights }: {
  go: (s: Screen) => void;
  demand: string;
  insightsState: 'idle' | 'loading' | 'done';
  insights: InsightsData | null;
}) {
  const loading = insightsState === 'loading';
  const c = insights?.counts;
  const countsData = [
    { n: c ? String(c.projetos) : null, color: 'var(--clay)', label: 'projetos' },
    { n: c ? String(c.incidentes) : null, color: 'var(--clay)', label: 'incidentes' },
    { n: c ? String(c.regras) : null, color: 'var(--ink)', label: 'regras de negócio' },
    { n: c ? String(c.solucoes) : null, color: 'var(--sage)', label: 'solução validada' },
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

      {loading && <LoadingQuip step="searching" />}

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
        {loading ? <Skel w="60%" h={52} r={8} /> : (
          <>A organização já enfrentou isto{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>
            {c && c.projetos > 0 ? `${c.projetos} ${c.projetos === 1 ? 'vez' : 'vezes'}` : 'antes'}
          </em>.</>
        )}
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
            {loading || item.n === null ? (
              <><Skel w={40} h={44} r={6} /><div style={{ marginTop: 14 }}><Skel w={80} h={10} /></div></>
            ) : (
              <>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 48, lineHeight: 1, letterSpacing: '-0.02em', color: item.color }}>
                  {item.n}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginTop: 10 }}>
                  {item.label}
                </div>
              </>
            )}
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
            maxHeight: 96,
            overflowY: 'auto',
            display: 'block',
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
        {loading ? [0,1,2].map((i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--paper)', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skel w="55%" h={12} /><Skel w="70%" h={26} r={6} /><Skel w="100%" h={5} r={100} />
            <Skel w="40%" h={10} /><Skel w="90%" h={14} /><Skel w="60%" h={14} />
          </div>
        )) : (insights?.projects ?? []).map((p, i) => (
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
                  title="Estimativa gerada pelo assistente IA sobre o quanto esse projeto se relaciona com a demanda atual, com base no conteúdo das tasks encontradas no ClickUp."
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 9.5,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-3)',
                    marginTop: 2,
                    cursor: 'help',
                    borderBottom: '1px dashed var(--ink-3)',
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
              {loading ? [0,1,2].map((i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <Skel w={38} h={38} r={100} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skel w="60%" h={13} /><Skel w="40%" h={10} />
                  </div>
                </div>
              )) : insights && insights.people.length > 0 ? insights.people.map((p, i) => (
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
              )) : (
                <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>Nenhum responsável identificado.</p>
              )}
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
              {loading ? [0,1,2,3].map((i) => <Skel key={i} w={80} h={32} r={100} />) :
              (insights?.teams ?? []).map((t) => (
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
            {loading ? [0,1,2,3].map((i) => (
              <div key={i} style={{ padding: '13px 0', borderBottom: i < 3 ? '1px solid var(--line-on-ink)' : 'none' }}>
                <Skel w={`${60 + i * 8}%`} h={14} />
              </div>
            )) : (insights?.lessons ?? []).map((l, i, arr) => (
              <div
                key={i}
                style={{
                  display: 'flex', gap: 13, alignItems: 'baseline', padding: '13px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--line-on-ink)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent-ink)', flex: '0 0 auto' }}>→</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--on-ink-1)', lineHeight: 1.45 }}>{l}</span>
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
          Analisar com IA{' '}
          <span style={{ fontFamily: 'var(--mono)' }}>→</span>
        </button>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--ink-3)',
          }}
        >
          A IA lê todo o conhecimento acima antes de opinar
        </span>
      </div>
    </div>
  );
}

function AnalysisScreen({ analysisState, analysis, analysisError, onRetryAnalysis, insights, go }: { analysisState: 'idle'|'loading'|'done'; analysis: {q:string;a:string}[]|null; analysisError: string|null; onRetryAnalysis: ()=>void; insights: InsightsData|null; go: (s:Screen)=>void }) {
  const sections = analysis ?? [];
  const c = insights?.counts;
  const statsLine = c
    ? `A IA cruzou a demanda com o conhecimento de ${c.projetos} projeto${c.projetos !== 1 ? 's' : ''}, ${c.incidentes} incidente${c.incidentes !== 1 ? 's' : ''} e ${c.regras} regra${c.regras !== 1 ? 's' : ''} organizacional${c.regras !== 1 ? 'is' : ''}.`
    : 'A IA analisou a demanda com base no conhecimento organizacional disponível.';
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
          04 / ANÁLISE ASSISTENTE IA
        </span>
        <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: analysisError ? 'var(--clay)' : 'var(--ink-3)',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}
        >
          {analysisState === 'done' ? (analysisError ? '● ERRO' : '● ANÁLISE CONCLUÍDA') : 'PROCESSANDO'}
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
        {statsLine}
      </p>

      {analysisState === 'done' && analysisError && (
        <div style={{ border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)', borderRadius: 12, padding: '20px 24px', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠</span>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Análise indisponível</span>
          </div>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 15 }}>{analysisError}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onRetryAnalysis}
              style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--paper-2)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              Tentar novamente
            </button>
            <button
              onClick={() => go('insights')}
              style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid var(--line)', background: 'transparent', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--sans)', color: 'var(--ink-2)' }}
            >
              ← Voltar
            </button>
          </div>
        </div>
      )}

      {analysisState !== 'done' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LoadingQuip step="analysis" />
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

function ArtifactsScreen({ artifactsState, artifacts, artifactsError, onRetryArtifacts, insights, go }: { artifactsState: 'idle'|'loading'|'done'; artifacts: ArtifactsData|null; artifactsError: string|null; onRetryArtifacts: ()=>void; insights: InsightsData|null; go: (s:Screen)=>void }) {
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
          {(() => {
            const c = insights?.counts;
            if (!c) return 'Gerado utilizando o conhecimento organizacional disponível.';
            return (
              <>
                Gerado utilizando conhecimento de{' '}
                <strong>{c.projetos} projeto{c.projetos !== 1 ? 's' : ''}</strong>,{' '}
                <strong>{c.incidentes} incidente{c.incidentes !== 1 ? 's' : ''}</strong> e{' '}
                <strong>{c.regras} regra{c.regras !== 1 ? 's' : ''} organizacional{c.regras !== 1 ? 'is' : ''}</strong>.
              </>
            );
          })()}
        </span>
      </div>

      {artifactsState !== 'done' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LoadingQuip step="artifacts" />
          <Skel h={90} />
          <Skel h={120} />
          <Skel h={90} />
        </div>
      ) : artifactsError || !artifacts ? (
        /* ── Error state ── */
        <div style={{
          border: '1px solid rgba(220,50,50,0.3)',
          background: 'rgba(220,50,50,0.06)',
          borderRadius: 16,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 640,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>⚠</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)', fontWeight: 600 }}>
              Falha na geração de artefatos
            </span>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
            {artifactsError ?? 'Ocorreu um erro inesperado. Verifique o console para mais detalhes.'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: 0 }}>
            Dica: verifique se a análise com IA foi concluída e se a demanda está preenchida.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="di-btn-primary"
              style={{ ...s.btn, ...s.btnPrimary }}
              onClick={onRetryArtifacts}
            >
              Tentar gerar novamente
            </button>
            <button
              className="di-btn-ghost"
              style={{ ...s.btn, ...s.btnGhost }}
              onClick={() => go('analysis')}
            >
              ← Voltar para Análise
            </button>
          </div>
        </div>
      ) : (() => {
        const art = artifacts as ArtifactsData;
        return (
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
        );
      })()}
    </div>
  );
}

function PlanScreen({ go, planState, plan, planError, onRetryPlan }: { go: (s: Screen) => void; planState: 'idle' | 'loading' | 'done'; plan: PlanData | null; planError: string | null; onRetryPlan: () => void }) {
  const loading = planState !== 'done';
  const d = plan;
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

      {/* Error state */}
      {!loading && (planError || !d) && (
        <div style={{
          border: '1px solid rgba(220,50,50,0.3)',
          background: 'rgba(220,50,50,0.06)',
          borderRadius: 16,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 640,
          marginBottom: 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>⚠</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink)', fontWeight: 600 }}>
              Falha na geração do plano
            </span>
          </div>
          <p style={{ fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5, margin: 0 }}>
            {planError ?? 'Ocorreu um erro inesperado. Verifique o console para mais detalhes.'}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="di-btn-primary" style={{ ...s.btn, ...s.btnPrimary }} onClick={onRetryPlan}>
              Tentar gerar novamente
            </button>
            <button className="di-btn-ghost" style={{ ...s.btn, ...s.btnGhost }} onClick={() => go('artifacts')}>
              ← Voltar para Artefatos
            </button>
          </div>
        </div>
      )}

      {/* Content (only when plan loaded successfully) */}
      {(loading || d) && (<>
      {loading && <LoadingQuip step="plan" />}

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
            {loading || !d ? <Skel w={160} h={14} /> : d.epic}
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
            {loading || !d ? <><Skel w="80%" h={22} r={6} /><div style={{marginTop:8}}><Skel w="55%" h={22} r={6} /></div></> : d.usTitle}
          </div>
          <div
            style={{
              fontSize: 16,
              color: 'var(--ink-2)',
              lineHeight: 1.55,
              maxWidth: '70ch',
            }}
          >
            {loading || !d ? <><Skel w="100%" h={14} /><div style={{marginTop:6}}><Skel w="70%" h={14} /></div></> : d.usDesc}
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
        {(loading || !d) ? [0,1,2,3].map((i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--paper)', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skel w="40%" h={16} r={6} />
            <Skel w="100%" h={12} /><Skel w="85%" h={12} /><Skel w="90%" h={12} />
          </div>
        )) : d.groups.map((g, i) => (
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
            {(loading || !d) ? [0,1,2].map((i) => <Skel key={i} w={90} h={30} r={100} />) :
            d.deps.map((dep) => (
              <span
                key={dep}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--ink-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 100,
                  padding: '6px 13px',
                }}
              >
                {dep}
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
              {loading || !d ? <Skel w={48} h={44} r={6} /> : d.risk.score}
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
              {loading || !d ? '…' : d.risk.label}
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
                width: `${d?.risk.score ?? 0}%`,
                transformOrigin: 'left',
                animation: 'di-grow .9s var(--ease)',
              }}
            />
          </div>

          {/* Risk factors */}
          {d?.risk.factors?.length ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {d.risk.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--clay)', fontSize: 10, marginTop: 4, flex: '0 0 auto' }}>▲</span>
                  <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          ) : loading ? (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skel h={14} />
              <Skel h={14} />
            </div>
          ) : null}
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
        {(loading || !d) ? [0,1,2,3].map((i) => (
          <div key={i} style={{ padding: '22px 22px', borderRight: i < 3 ? '1px solid var(--line)' : 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skel w={40} h={38} r={6} /><Skel w="80%" h={11} /><Skel w="60%" h={11} />
          </div>
        )) : d.reuse.map((r, i) => (
          <div
            key={i}
            style={{
              padding: '22px 22px',
              borderRight: i < d.reuse.length - 1 ? '1px solid var(--line)' : 'none',
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

      </>)}
    </div>
  );
}

function PreviewScreen({ demand, artifacts, analysis, plan, workspace, workspaceId, publishConfig, setPublishConfig, go, doPublish }: PreviewProps) {
  const updateCfg = (key: keyof PublishConfig, value: string | boolean) =>
    setPublishConfig((prev) => ({ ...prev, [key]: value }));

  const [ckSpaces,   setCkSpaces]   = useState<SpaceOption[]>([]);
  const [ckLoading,  setCkLoading]  = useState(false);
  const [selectedSpaceId,   setSelectedSpaceId]   = useState('');
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [selectedListName,   setSelectedListName]   = useState('');

  useEffect(() => {
    if (!workspaceId) return;
    setCkLoading(true);
    fetch(`/api/platform/lists?workspaceId=${encodeURIComponent(workspaceId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { spaces: SpaceOption[] } | null) => {
        if (!data?.spaces?.length) return;
        setCkSpaces(data.spaces);
        const sp     = data.spaces[0];
        const folder = sp.folders[0] ?? null;
        const lists  = folder ? folder.lists : sp.lists;
        setSelectedSpaceId(sp.id);
        setSelectedFolderName(folder?.name ?? '');
        setSelectedListName(lists[0]?.name ?? '');
        if (lists[0]) updateCfg('listId', lists[0].id);
      })
      .catch(() => {})
      .finally(() => setCkLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const currentSpace  = ckSpaces.find((s) => s.id === selectedSpaceId) ?? ckSpaces[0] ?? null;
  const hasFolders    = (currentSpace?.folders?.length ?? 0) > 0;
  const currentFolder = hasFolders ? (currentSpace!.folders.find((f) => f.name === selectedFolderName) ?? currentSpace!.folders[0]) : null;
  const currentLists  = currentFolder ? currentFolder.lists : (currentSpace?.lists ?? []);

  const onSpaceChange = (id: string) => {
    const sp     = ckSpaces.find((s) => s.id === id);
    if (!sp) return;
    const folder = sp.folders[0] ?? null;
    const lists  = folder ? folder.lists : sp.lists;
    setSelectedSpaceId(id);
    setSelectedFolderName(folder?.name ?? '');
    setSelectedListName(lists[0]?.name ?? '');
    updateCfg('listId', lists[0]?.id ?? '');
  };

  const onFolderChange = (name: string) => {
    const folder = currentSpace?.folders.find((f) => f.name === name);
    const lists  = folder?.lists ?? currentSpace?.lists ?? [];
    setSelectedFolderName(name);
    setSelectedListName(lists[0]?.name ?? '');
    updateCfg('listId', lists[0]?.id ?? '');
  };

  const onListChange = (id: string) => {
    const list = currentLists.find((l) => l.id === id);
    setSelectedListName(list?.name ?? '');
    updateCfg('listId', id);
  };

  const connReal = publishConfig.listId.trim().length > 0;
  const connLabel = connReal ? 'ClickUp real conectado' : 'Demo mode';
  const connColor = connReal ? 'var(--sage)' : 'var(--ochre)';
  const connBg = connReal ? 'rgba(30,122,92,0.12)' : 'rgba(138,100,24,0.12)';

  const previewComment = analysis?.length
    ? `Análise crítica gerada pelo lore.\n\nDemanda: ${demand}\n\n` +
      analysis.map((s) => `${s.q}\n${s.a}`).filter((s) => !s.endsWith('\n')).join('\n\n')
    : `Análise crítica gerada pelo lore.\n\nDemanda: ${demand}`;

  const previewSubtasksFull: { group: string; name: string }[] = plan?.groups?.length
    ? plan.groups.flatMap((g) => g.items.map((name) => ({ group: g.frente, name })))
    : [];

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
                {artifacts?.userStory
                  ? artifacts.userStory.replace(/^Como [^,]+, eu quero /i, '').split(' para ')[0].slice(0, 80)
                  : demand.slice(0, 80) || 'Nova demanda'}
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
                Demanda enviada
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 220, overflowY: 'auto' }}>
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

              {/* ── Hierarchy selects ── */}
              {(() => {
                const selStyle: React.CSSProperties = { width: '100%', fontFamily: 'var(--mono)', fontSize: 13, padding: '9px 13px', border: '1px solid var(--line-strong)', borderRadius: 8, background: 'var(--paper)', color: 'var(--ink)', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' };
                const lbl = (t: string) => (
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', marginBottom: 5, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{t}</div>
                );
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {/* Workspace — static display (only one connected) */}
                    <div>
                      {lbl('Workspace')}
                      <div style={{ ...selStyle, cursor: 'default', color: 'var(--ink-2)', background: 'var(--paper-2)' }}>{workspace}</div>
                    </div>
                    {/* Space */}
                    <div>
                      {lbl('Space')}
                      {ckLoading ? (
                        <div style={{ ...selStyle, cursor: 'default', color: 'var(--ink-3)' }}>Carregando…</div>
                      ) : (
                        <select value={selectedSpaceId} onChange={(e) => onSpaceChange(e.target.value)} style={selStyle} disabled={!ckSpaces.length}>
                          {ckSpaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      )}
                    </div>
                    {/* Folder (optional) */}
                    {hasFolders && (
                      <div>
                        {lbl('Pasta')}
                        <select value={selectedFolderName} onChange={(e) => onFolderChange(e.target.value)} style={selStyle}>
                          {currentSpace.folders.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
                        </select>
                      </div>
                    )}
                    {/* List */}
                    <div>
                      {lbl('List')}
                      <select value={publishConfig.listId} onChange={(e) => onListChange(e.target.value)} style={selStyle}>
                        {currentLists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })()}

              {/* ── Destino da Publicação summary ── */}
              <div style={{ border: '1px solid var(--line)', borderRadius: 10, background: 'var(--paper-2)', padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--clay)', marginBottom: 10 }}>
                  Destino da publicação
                </div>
                {[
                  { k: 'Workspace', v: workspace },
                  { k: 'Space',     v: currentSpace?.name ?? '' },
                  ...(hasFolders ? [{ k: 'Pasta', v: selectedFolderName }] : []),
                  { k: 'List',      v: selectedListName },
                ].map((row, i, arr) => (
                  <div key={row.k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < arr.length - 1 ? 6 : 0 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-3)', flex: '0 0 64px', letterSpacing: '0.04em' }}>{row.k}</span>
                    <span style={{ width: 1, height: 12, background: 'var(--line)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{row.v || '—'}</span>
                  </div>
                ))}
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
                A publicação será realizada na lista selecionada acima.
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
          onClick={() => doPublish()}
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
    const connColor = 'var(--sage)';
    const connBg = 'rgba(30,122,92,0.12)';
    const connLabel = 'CLICKUP REAL';
    const modeText = 'Publicado com sucesso no ClickUp.';

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
            onClick={() => doPublish()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const STEP_DEFS = [
  { label: 'Painel',                   key: 'dashboard', icon: 'space_dashboard' },
  { label: 'Nova demanda',             key: 'demand',    icon: 'edit_note' },
  { label: 'Conhecimento organizacional', key: 'insights', icon: 'hub' },
  { label: 'Análise Assistente IA',    key: 'analysis',  icon: 'neurology' },
  { label: 'Artefatos',                key: 'artifacts', icon: 'description' },
  { label: 'Plano de entrega',         key: 'plan',      icon: 'checklist' },
  { label: 'Publicar no ClickUp',      key: 'preview',   icon: 'rocket_launch' },
] as const;

function Sidebar({ screen, go, maxReached, onReset }: { screen: Screen; go: (s: Screen) => void; maxReached: number; onReset: () => void }) {
  const activeIndex = SCREEN_INDEX[screen] ?? 0;
  const lastIdx = STEP_DEFS.length - 1;

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
        padding: '32px 24px 24px',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/orla-mark.png" alt="Orla" style={{ width: 34, height: 34, display: 'block', objectFit: 'contain' }} />
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 10.5,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--clay)',
          textAlign: 'center',
        }}>
          lore
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontSize: 12.5,
        color: 'var(--ink-3)',
        lineHeight: 1.5,
        margin: '18px 2px 24px',
        fontFamily: 'var(--mono)',
        letterSpacing: '0.02em',
      }}>
        Plataforma de Inteligência<br />Organizacional
      </p>

      {/* Nav trail */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {STEP_DEFS.map((step, i) => {
          const locked = i > maxReached;
          const isCurrent = i === activeIndex;
          const isDone = !isCurrent && i < activeIndex;

          let circleBg: string, circleBorder: string, circleGlow: string, iconColor: string;
          if (isCurrent) {
            circleBg = 'var(--clay)'; circleBorder = 'var(--clay)';
            circleGlow = '0 0 0 4px rgba(36,75,107,0.16)'; iconColor = 'var(--paper)';
          } else if (isDone) {
            circleBg = 'var(--clay)'; circleBorder = 'var(--clay)';
            circleGlow = 'none'; iconColor = 'var(--paper)';
          } else if (!locked) {
            circleBg = 'var(--paper)'; circleBorder = 'var(--clay)';
            circleGlow = 'none'; iconColor = 'var(--clay)';
          } else {
            circleBg = 'var(--paper)'; circleBorder = 'var(--line-strong)';
            circleGlow = 'none'; iconColor = 'var(--ink-3)';
          }

          const connColor = i <= maxReached ? 'var(--clay)' : 'var(--line-strong)';
          const connPos = i === 0
            ? { top: 15, bottom: -9 }
            : i === lastIdx
              ? { top: -9, bottom: 15 }
              : { top: -9, bottom: -9 };

          const labelColor = isCurrent ? 'var(--ink)' : locked ? 'var(--ink-3)' : 'var(--ink-2)';

          return (
            <button
              key={step.key}
              onClick={() => { if (!locked) go(step.key as Screen); }}
              style={{
                display: 'grid',
                gridTemplateColumns: '30px 1fr',
                gap: 12,
                alignItems: 'center',
                padding: '9px 10px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                textAlign: 'left',
                position: 'relative',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.5 : 1,
                transition: 'opacity .15s',
              }}
            >
              {/* Circle + connector */}
              <span style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 30, height: 30 }}>
                {/* Vertical connector line */}
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 2,
                  top: connPos.top,
                  bottom: connPos.bottom,
                  background: connColor,
                  zIndex: 0,
                }} />
                {/* Circle icon */}
                <span style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  boxSizing: 'border-box',
                  position: 'relative',
                  zIndex: 1,
                  background: circleBg,
                  border: `1.5px solid ${circleBorder}`,
                  boxShadow: circleGlow,
                  transition: 'all .2s var(--ease)',
                }}>
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 17,
                    lineHeight: 1,
                    color: iconColor,
                    userSelect: 'none',
                    fontVariationSettings: "'FILL' 1, 'wght' 400",
                  }}>
                    {step.icon}
                  </span>
                </span>
              </span>

              {/* Label + lock */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{
                  fontSize: 13.5,
                  lineHeight: 1.2,
                  color: labelColor,
                  fontWeight: isCurrent ? 600 : 500,
                }}>
                  {step.label}
                </span>
                {locked && (
                  <span style={{
                    fontFamily: "'Material Symbols Outlined'",
                    fontSize: 14,
                    color: 'var(--ink-3)',
                    marginLeft: 'auto',
                    userSelect: 'none',
                  }}>
                    lock
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Reset */}
      {maxReached > 0 && (
        <button
          onClick={onReset}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            padding: '7px 10px',
            borderRadius: 6,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--ink-3)',
            fontSize: 12.5,
            fontFamily: 'var(--mono)',
            letterSpacing: '0.03em',
            transition: 'color .15s, background .15s',
            width: '100%',
            textAlign: 'left',
          }}
          className="di-nav-btn"
        >
          <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 15, lineHeight: 1, userSelect: 'none' }}>
            restart_alt
          </span>
          Reiniciar trilha
        </button>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 22,
        borderTop: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--sage)',
            display: 'inline-block',
            flexShrink: 0,
            animation: 'di-pulse 2.4s infinite',
          }} />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-2)', letterSpacing: '0.04em' }}>
            Conhecimento vivo
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: 10.5,
          letterSpacing: '0.03em',
          color: 'var(--ink-3)',
          lineHeight: 1.7,
          margin: 0,
        }}>
          92 projetos indexados<br />
          48.000 comentários analisados<br />
          RAG · sincronizado há 2 min
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
    --ink: #18222E;
    --ink-soft: #2B3A47;
    --ink-2: #45505F;
    --ink-3: #5A6573;
    --clay: #244B6B;
    --clay-deep: #1B3A53;
    --accent-ink: #2EC4B6;
    --sage: #1E7A5C;
    --ochre: #8A6418;
    --danger: #B23535;
    --danger-tint: #FBEAEA;
    --line: #D9DEE5;
    --line-soft: #E4E8ED;
    --line-strong: #C2C9D2;
    --line-on-ink: rgba(255,255,255,0.16);
    --on-ink-1: #FFFFFF;
    --on-ink-2: #C2CAD3;
    --on-ink-3: #A6B0BC;
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
  .di-nav-btn:hover { background: var(--paper-2); color: var(--ink-2); }

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

const SCREEN_INDEX: Partial<Record<Screen, number>> = {
  dashboard: 0, demand: 1,
  insights: 2, searching: 2,
  analysis: 3, artifacts: 4, plan: 5,
  preview: 6, result: 6,
};

function getInitialMaxReached(): number {
  if (typeof window === 'undefined') return 0;
  try { return Number(localStorage.getItem('di-max-reached') ?? 0); } catch { return 0; }
}

export default function DIPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [maxReached, setMaxReached] = useState<number>(getInitialMaxReached);
  const [demand, setDemand] = useState('');
  const [workspace, setWorkspace] = useState('ANBIMA');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<{ spaces: number; lists: number; tasks: number } | null>(null);
  const [kb, setKb] = useState<Record<string, boolean>>({});

  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [analysis, setAnalysis] = useState<AnalysisSection[] | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [artifactsState, setArtifactsState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [artifacts, setArtifacts] = useState<ArtifactsData | null>(null);
  const [artifactsError, setArtifactsError] = useState<string | null>(null);

  const [publishState, setPublishState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [publishStep, setPublishStep] = useState(0);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);
  const [publishError, setPublishError] = useState<PublishError | null>(null);

  const [publishConfig, setPublishConfig] = useState<PublishConfig>(getInitialPublishConfig);

  const [insightsState, setInsightsState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [planState, setPlanState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  // Save publishConfig to localStorage (excluding listId — it's workspace-specific)
  useEffect(() => {
    try {
      const { listId: _omit, ...rest } = publishConfig;
      localStorage.setItem('di-publish-config', JSON.stringify(rest));
    } catch {
      // ignore
    }
  }, [publishConfig]);

  // Load real ClickUp workspaces on mount
  useEffect(() => {
    fetch('/api/clickup/workspaces')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { workspaces: { id: string; name: string }[] } | null) => {
        if (data?.workspaces?.length) {
          setWorkspaces(data.workspaces);
          setWorkspaceId(data.workspaces[0].id);
          setWorkspace(data.workspaces[0].name);
        }
      })
      .catch(() => {});
  }, []);

  // Load workspace stats when workspaceId changes
  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/clickup/stats?workspaceId=${workspaceId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { spaces: number; lists: number; tasks: number } | null) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, [workspaceId]);

  const isOn = (key: string) => kb[key] !== false;
  const toggleKb = (key: string) => setKb((prev) => ({ ...prev, [key]: !isOn(key) }));

  const runAnalysis = useCallback(async () => {
    setAnalysisState('loading');
    setAnalysisError(null);
    setAnalysis(null);
    try {
      const [res] = await Promise.all([
        fetch('/api/platform/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand, workspaceId }),
        }),
        new Promise<void>((r) => setTimeout(r, 1400)),
      ]);
      if (res.ok) {
        const data = (await res.json()) as { sections: AnalysisSection[] };
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setAnalysis(data.sections);
        } else {
          setAnalysisError('Resposta inválida da análise. Tente novamente.');
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        setAnalysisError(errData.error ?? 'Erro ao gerar análise. Tente novamente.');
      }
    } catch {
      setAnalysisError('Erro de conexão ao gerar análise. Tente novamente.');
    }
    setAnalysisState('done');
  }, [demand, workspaceId]);

  const runArtifacts = useCallback(async () => {
    setArtifactsState('loading');
    setArtifactsError(null);
    setArtifacts(null);
    try {
      const [res] = await Promise.all([
        fetch('/api/platform/artifacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand, workspaceId, analysis }),
        }),
        new Promise<void>((r) => setTimeout(r, 1400)),
      ]);
      if (res.ok) {
        const data = (await res.json()) as ArtifactsData;
        if (data.userStory && Array.isArray(data.bdd) && data.bdd.length > 0) {
          setArtifacts(data);
        } else {
          console.error('[runArtifacts] Received data with invalid structure:', data);
          setArtifactsError('Os artefatos gerados têm estrutura inválida. Tente novamente.');
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = errData.error ?? `Erro ${res.status} ao gerar artefatos.`;
        console.error('[runArtifacts] API error:', res.status, msg);
        setArtifactsError(msg);
      }
    } catch (err) {
      console.error('[runArtifacts] Network error:', err);
      setArtifactsError('Erro de rede ao chamar o serviço de artefatos.');
    }
    setArtifactsState('done');
  }, [demand, workspaceId, analysis]);

  const runPlan = useCallback(async () => {
    setPlanState('loading');
    setPlan(null);
    setPlanError(null);
    try {
      const [res] = await Promise.all([
        fetch('/api/platform/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demand, workspaceId, artifacts, analysis }),
        }),
        new Promise<void>((r) => setTimeout(r, 1400)),
      ]);
      if (res.ok) {
        const data = (await res.json()) as PlanData;
        if (data.epic && Array.isArray(data.groups) && data.groups.length > 0) {
          setPlan(data);
        } else {
          console.error('[runPlan] Invalid plan structure received:', data);
          setPlanError('Plano gerado com estrutura inválida. Tente novamente.');
        }
      } else {
        const errData = (await res.json().catch(() => ({}))) as { error?: string };
        const msg = errData.error ?? `Erro ${res.status} ao gerar plano.`;
        console.error('[runPlan] API error:', res.status, msg);
        setPlanError(msg);
      }
    } catch (err) {
      console.error('[runPlan] Network error:', err);
      setPlanError('Erro de rede ao chamar o serviço de plano.');
    }
    setPlanState('done');
  }, [demand, workspaceId, artifacts, analysis]);

  const go = useCallback(
    (s: Screen) => {
      setScreen(s);
      const idx = SCREEN_INDEX[s] ?? 0;
      setMaxReached((prev) => {
        const next = Math.max(prev, idx);
        try { localStorage.setItem('di-max-reached', String(next)); } catch { /* ignore */ }
        return next;
      });
      if (mainRef.current) mainRef.current.scrollTop = 0;
      if (s === 'analysis' && analysisState === 'idle') runAnalysis();
      if (s === 'artifacts' && artifactsState === 'idle') runArtifacts();
      if (s === 'plan' && planState === 'idle') runPlan();
    },
    [analysisState, artifactsState, planState, runAnalysis, runArtifacts, runPlan]
  );

  const resetTrail = useCallback(() => {
    setScreen('dashboard');
    setMaxReached(0);
    try { localStorage.removeItem('di-max-reached'); } catch { /* ignore */ }
    setDemand('');
    setKb({});
    setAnalysisState('idle'); setAnalysis(null); setAnalysisError(null);
    setArtifactsState('idle'); setArtifacts(null); setArtifactsError(null);
    setInsightsState('idle'); setInsights(null);
    setPlanState('idle'); setPlan(null); setPlanError(null);
    setPublishState('idle'); setPublishStep(0); setPublishResult(null); setPublishError(null);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const runSearch = useCallback(() => {
    // Reset all generated states so a new demand always triggers fresh generation
    setAnalysisState('idle');
    setAnalysis(null);
    setAnalysisError(null);
    setArtifactsState('idle');
    setArtifacts(null);
    setArtifactsError(null);
    setPlanState('idle');
    setPlan(null);
    setPlanError(null);
    setInsightsState('loading');
    setInsights(null);
    go('searching');
    fetch('/api/platform/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demand, workspaceId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: InsightsData | null) => { if (data) setInsights(data); })
      .catch(() => {})
      .finally(() => setInsightsState('done'));
    setTimeout(() => go('insights'), 2000);
  }, [demand, workspaceId, go]);

  const doPublish = useCallback(
    async () => {
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
          body: JSON.stringify({ demand, publishConfig, artifacts, analysis }),
        });

        if (res.ok) {
          const data = (await res.json()) as PublishResult;
          setPublishResult(data);
          setPublishState('success');
        } else {
          const errBody = await res.json().catch(() => ({})) as { error?: string };
          setPublishError({
            title: `Erro ${res.status}`,
            detail: errBody.error ?? 'A publicação falhou. Verifique o token e a lista selecionada.',
          });
          setPublishState('error');
        }
      } catch {
        setPublishError({
          title: 'Erro de rede',
          detail: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        });
        setPublishState('error');
      }
    },
    [demand, publishConfig, artifacts, analysis]
  );

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <DashboardScreen go={go} stats={stats} />;
      case 'demand':
        return (
          <DemandScreen
            demand={demand}
            setDemand={setDemand}
            workspace={workspace}
            workspaceId={workspaceId}
            workspaces={workspaces}
            setWorkspace={setWorkspace}
            setWorkspaceId={setWorkspaceId}
            kb={kb}
            isOn={isOn}
            toggleKb={toggleKb}
            runSearch={runSearch}
            stats={stats}
          />
        );
      case 'searching':
        return <SearchingScreen demand={demand} stats={stats} />;
      case 'insights':
        return <InsightsScreen go={go} demand={demand} insightsState={insightsState} insights={insights} />;
      case 'analysis':
        return <AnalysisScreen analysisState={analysisState} analysis={analysis} analysisError={analysisError} onRetryAnalysis={() => { setAnalysisState('idle'); runAnalysis(); }} insights={insights} go={go} />;
      case 'artifacts':
        return (
          <ArtifactsScreen
            artifactsState={artifactsState}
            artifacts={artifacts}
            artifactsError={artifactsError}
            onRetryArtifacts={() => { setArtifactsState('idle'); runArtifacts(); }}
            insights={insights}
            go={go}
          />
        );
      case 'plan':
        return <PlanScreen go={go} planState={planState} plan={plan} planError={planError} onRetryPlan={() => { setPlanState('idle'); runPlan(); }} />;
      case 'preview':
        return (
          <PreviewScreen
            demand={demand}
            artifacts={artifacts}
            analysis={analysis}
            plan={plan}
            workspace={workspace}
            workspaceId={workspaceId}
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
        <Sidebar screen={screen} go={go} maxReached={maxReached} onReset={resetTrail} />
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
