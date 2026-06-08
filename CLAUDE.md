# Betting Dashboard — Contexto do Projeto

Dashboard de performance de apostas esportivas da FDC Capital.
Exibe KPIs, histórico de apostas, filtros e gráficos de evolução de banca.
Interface 100% front-end estática (sem build step), suporta dark mode e light mode.

Design system no CLAUDE.md da pasta-mãe `FDC Capital/`.

---

## Arquivos principais

```
index.html              → entrada principal (carrega os CSS e JS abaixo)
dashboard.html          → versão legada standalone (v25, HTML monolítico com CSS inline)
assets/css/
  tokens.css            → variáveis CSS (cores, tipografia, espaçamento, dark+light)
  components.css        → botões, cards, badges, tabelas, multiselect
  layout.css            → grid, sidebar, topbar, responsividade
assets/js/
  data.js               → constantes (APPS_SCRIPT_URL, BASE_BANK, CASA_ICONS, SPORT_SVG)
                          + helpers de normalização, cálculos de métricas, utilidades
  filters.js            → lógica de filtros (data, período rápido, multiselect por esporte/casa/tipster)
  charts/
    shared.js           → mkCalendarHeatmap, mkSparkline, mkKpiGrid, toggleBlock, buildSummaryTable,
                          mkStatCards, mkOneStatCard, constantes APOSTAS_COLS/CARD_H
    gestao.js           → custoData, buildCostState, renderParceiros, renderCustos,
                          renderCustoTipster, renderCustoCards, renderMetrics
    overview.js         → renderKPI, renderBankroll, renderROIMonthly, renderOddsDist,
                          renderHeatmap, renderOvHeatmap, renderOvStreaks, renderOvCusto
    temporal.js         → renderConsolidado, renderMensal, renderDiario, renderSemana
                          (+ getAvailableMonths/Days/Weeks e helpers de navegação)
    performance.js      → renderSport, renderCasa, renderTipsters, renderResultadosCasa
    apostas.js          → renderApostas, renderApostasVirt, apostasSort, apostasFilter
  app.js                → buildHTML(), loadData(), renderPage(), PAGE_META, updateTopbarTitle(),
                          showPage(), APARENCIA/applyAparencia()/setAparencia(), utilitários de UI
brand/                  → logos e favicons FDC Capital
```

---

## Fonte de dados

- **Google Apps Script**: `APPS_SCRIPT_URL` em `data.js` aponta para um Apps Script que retorna JSON `{ok: true, data: [...]}`.
- `BASE_BANK = 100000` — banca de referência para cálculos de MDD% e simulações.
- Dados são normalizados ao carregar: nomes de tipster/casa/esporte são canonicalizados via `normalizeDados()`.

---

## Páginas (views)

| ID | Título | Descrição |
|----|--------|-----------|
| `overview` | Visão Geral | KPIs principais, bankroll chart, streaks, ROI mensal, heatmap |
| `sports` | Esportes | Performance por modalidade esportiva |
| `casas` | Bookies | Performance e ROI por bookmaker |
| `apostas` | Apostas | Espelho completo da base com scroll virtual |
| `tipsters` | Tipsters | Análise comparativa e individual |
| `consolidado` | Consolidado | Resumo anual e evolução mensal |
| `mensal` | Mensal | Análise detalhada do mês selecionado |
| `diario` | Diário | Análise detalhada do dia selecionado |
| `semana` | Semana | Análise da semana (seg → dom) |
| `resultados_casa` | Por Casa | Performance por bookmaker |
| `parceiros` | Fornecedores & Parceiros | Turnover/lucro por conta e fornecedor |
| `custos` | Custos de Contas | Custo de aquisição por conta (salvo em localStorage) |
| `custos_tipster` | Custo de Tipsters | Assinaturas e pagamentos a tipsters (localStorage) |
| `metrics` | Métricas | Base de conhecimento: ROI, WR, MDD, EMDD, XMDD, P-Value |

---

## Bibliotecas externas (CDN)

- **Chart.js 4.4.1** — todos os gráficos (`chart.umd.js` via cdnjs)
- **html2canvas 1.4.1** — presente em `dashboard.html`, não usado em `index.html`
- **Manrope + JetBrains Mono** — Google Fonts

---

## Logos usados no código

| Contexto | Arquivo |
|----------|---------|
| Favicon | `brand/favicon.svg` + `brand/favicon-32.png` |
| Loader (tela de carregamento) | `brand/fdc-logo-horizontal-dark.svg` |
| Sidebar dark mode | `brand/fdc-logo-vertical-dark.svg` |
| Sidebar light mode | `brand/fdc-logo-vertical-light.svg` |

---

## Arquitetura do topbar e navegação

- O topbar (68px fixo) exibe o título da página ativa via `#topbarTitle` e `#topbarSub`.
- `showPage(id)` chama `updateTopbarTitle(id)` que consulta `PAGE_META` em `app.js`.
- **NÃO adicionar `.page-header` dentro de páginas** — título fica sempre no topbar.
- Para nova página: adicionar entrada em `PAGE_META` + ID na lista de `msInit` em `buildHTML()`.
- Tipsters: o filtro de tipster vai como 4º parâmetro de `buildFilters('tipsters', sports, casas, tipsters)`.
- **Não há mais `#themeLabel` no DOM** — foi substituído pelo painel Aparência (`#aparenciaPanel`).

## Sistema de Aparência

O topbar contém um painel dropdown (`#aparenciaPanel`) com 5 seções de preferências visuais:

| Chave | Opções | Efeito |
|-------|--------|--------|
| `titlePage` | neutro / blue / **gradient** | Classe `t-page-*` no `<html>` |
| `titlePanel` | tick / accent2 / **blue** | Classe `panel-title-*` no `<html>` |
| `kpiStyle` | neutro / **azul** | Classe `kpi-azul` no `<html>` |
| `density` | comfortable / **compact** | Atributo `data-density="compact"` no `<html>` |
| `theme` | **dark** / light | Atributo `data-theme` no `<html>` |

- Persiste em `localStorage` como JSON na chave `aparencia_v1`.
- `applyAparencia()` aplica todas as preferências. Deve ser chamado após `buildHTML()`.
- `index.html` tem init script inline que aplica `aparencia_v1` antes do primeiro render (evita FOUC).
- **Defaults:** gradient, blue, azul, compact, dark.

## Design system aplicado

- **Topbar:** Manrope 800 22px tracking -0.035em (título) + JetBrains Mono 9px uppercase tracking 0.18em (eyebrow/sub).
- **KPI labels** (`.kpi-label`): JetBrains Mono — tudo que é dado usa mono, não sans.
- **P/L Líquido:** realce azul `rgba(46,139,255,.08)` + borda azul + sparkline de 90d. Os demais ficam neutros (a menos que `kpi-azul` esteja ativo no painel Aparência).
- **Sparkline** (`mkSparkline` em `shared.js`): SVG inline, linha `--ink-soft`, ponto final `--accent`. Ultimos 90 dias de P/L acumulado.
- **Calendário** (`mkCalendarHeatmap` em `shared.js`): opacidade proporcional ao P/L do mês (0.15–0.93). Mini-cards acima do grid.
- **Gráfico Resultado Geral** (`renderBankroll`): linha acumulada `#2E8BFF` com gradient fill, barras `--pos`/`--neg`.
- **Card headers** (`.card-hdr`): `border-left: 3px solid var(--accent)` — tick azul estrutural.
- **Nav icons:** `stroke-width="1.6"`, cor `var(--ink-mute)`, ativo em `var(--accent)`.
- **Tabelas** (`.tbl`): header em JetBrains Mono, zebra `rgba(255,255,255,0.015)`, hover azul.
- **Grid de fundo:** `repeating-linear-gradient` 64px em `body`, usando `var(--grid)`.

## Regras específicas

- NÃO alterar estrutura de pastas nem nomes de arquivos sem confirmação.
- Badges de resultado: Win = `#2BC07E` (`--pos`), Loss = `#E5524B` (`--neg`), HW = `#2BC07E`, HL = `#E5524B`, Pending = `#E0A21A` (`--warn`).
- **Cyan (#00E5FF) foi removido da marca** — não reintroduzir. Usar `--accent-2` (`#7FB2FF`) no lugar.
- Tabela de apostas: ordenação padrão por data decrescente.
- Página `apostas` usa scroll virtual — não renderiza todos os cards de uma vez.
- `dashboard.html` é versão legada; não editar, serve como referência histórica.
- Custos de contas e custos de tipsters são persistidos em `localStorage` (não no Apps Script).
- Filtros são por página e independentes entre si (estado em `FS[page]`).
- `fmtPL`: sinal colado sem espaço (`+R$`/`-R$`). `money-sign` em `0.78em` (R$ menor que o número).
- Sidebar bottom: `#lastUpdate` é flexbox com `.pulse-dot` + `#lastUpdateText`.
