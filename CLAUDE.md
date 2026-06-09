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
  data.js               → constantes (APPS_SCRIPT_URL, BASE_BANK, CASA_ICONS, SPORT_SVG,
                            SPORT_EMOJI, HOUSE_DOMAIN, SPORT_KEY)
                          + sportEmoji(), sportCell(), sportSvg()
                          + helpers de normalização, cálculos de métricas, utilidades
  filters.js            → lógica de filtros (data, período rápido, multiselect por esporte/casa/tipster)
  charts/
    shared.js           → mkCalendarHeatmap, mkSparkline, mkKpiGrid, toggleBlock, buildSummaryTable,
                          mkStatCards, mkOneStatCard, mkWRC(wr), mkEmpty(msg), constantes APOSTAS_COLS/CARD_H
    gestao.js           → custoData, buildCostState, renderParceiros, renderCustos,
                          renderCustoTipster, renderCustoCards, renderMetrics
    overview.js         → renderKPI, renderBankroll, renderROIMonthly, renderOddsDist,
                          renderHeatmap, renderOvHeatmap, renderOvStreaks, renderOvCusto
    temporal.js         → renderConsolidado, renderMensal, renderDiario, renderSemana
                          (+ getAvailableMonths/Days/Weeks e helpers de navegação)
    performance.js      → renderSport, renderCasa, renderTipsters, renderResultadosCasa
                          + _tipSparkSVG, _mkTipCard, _renderTipCards (T-1 — cards de tipster)
                          + _tipsterEnts, _tipsterDays, _tipsterAllDays, _tipsterSort (estado sort)
                          + window.tipsterSortBy(k), window.tipsterSortDir() (callbacks sort bar)
                          + openTipsterDrill(nome), closeTipsterDrill() (T-6 — popup drill-down)
                          + _tipMonthTbody(rows) — tbody HTML de análise mensal (reusado em popup)
                          + _tipBreakdownTbl(rows, dimKey, labelFn) — tabela por casa/esporte (popup)
    apostas.js          → renderApostas, renderApostasVirt, apostasSort, apostasFilter
  app.js                → buildHTML(), loadData(), renderPage(), PAGE_META, updateTopbarTitle(),
                          showPage(), APARENCIA/applyAparencia()/setAparencia(), utilitários de UI
                          favicon(domain), mkSpChip(sport), mkHouseChip(nome), casaCell(),
                          auditCasas(dados)
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

O topbar contém um painel dropdown (`#aparenciaPanel`) com 4 seções de preferências visuais:

| Chave | Opções | Efeito |
|-------|--------|--------|
| `titlePage` | neutro / blue / **gradient** | Classe `t-page-*` no `<html>` |
| `kpiStyle` | neutro / **azul** | Classe `kpi-azul` no `<html>` |
| `density` | comfortable / **compact** | Atributo `data-density="compact"` no `<html>` |
| `theme` | **dark** / light | Atributo `data-theme` no `<html>` |

- `titlePanel` foi removido — `.card-title { color: var(--accent-2) }` é hardcoded na CSS base.
- Persiste em `localStorage` como JSON na chave `aparencia_v1`.
- `applyAparencia()` aplica todas as preferências. Deve ser chamado após `buildHTML()`.
- `index.html` tem init script inline que aplica `aparencia_v1` antes do primeiro render (evita FOUC).
- **Defaults:** gradient, azul, compact, dark.

## Design system aplicado

- **Topbar:** Manrope 800 22px tracking -0.035em (título) + JetBrains Mono 9px uppercase tracking 0.18em (eyebrow/sub).
- **KPI labels** (`.kpi-label`): JetBrains Mono — tudo que é dado usa mono, não sans.
- **P/L Líquido:** realce azul `rgba(46,139,255,.08)` + borda azul + sparkline de 90d. Os demais ficam neutros (a menos que `kpi-azul` esteja ativo no painel Aparência).
- **Sparkline** (`mkSparkline` em `shared.js`): SVG inline, linha `--ink-soft`, ponto final `--accent`. Ultimos 90 dias de P/L acumulado.
- **Calendário** (`mkCalendarHeatmap` em `shared.js`): opacidade proporcional ao P/L do mês (0.15–0.93). Mini-cards acima do grid. O título inline do `ovHeatmapCard` em `app.js` usa `color:var(--accent-2)` (nunca `--text2`).
- **Gráfico Resultado Geral** (`renderBankroll`): linha acumulada `#2E8BFF` com gradient fill, barras `--pos`/`--neg`. Legenda em `position:'bottom'`, `align:'center'`, eixo X oculto (`display:false`). `generateLabels` deve incluir `fontColor` em cada item (Chart.js v4 não herda `labels.color` em callbacks customizados) — usar `isDark()?'#AEB7C2':'#666E7A'`.
- **Card headers** (`.card-hdr`): sem `border-left`. O título (`.card-title`) mantém `color: var(--accent-2)` (azul).
- **Card titles** (`.card-title`): `color: var(--accent-2)` — azul suave, sem barra lateral na caixa.
- **KPI labels** (`.kpi-label`): precedidos por `<span class="kpi-pipe"></span>` (span vazio). A barra é gerada puramente via CSS: `.kpi-pipe { display:inline-block; width:3px; height:0.85em; background:var(--accent); border-radius:1px; vertical-align:text-bottom }`. Gerados em `renderKPI` (overview.js) e `mkKpiGrid` (shared.js).
- **Nav groups** (`.nav-group`): JetBrains Mono, uppercase, `letter-spacing: 0.18em`, `color: var(--ink-mute)` — padrão eyebrow da sidebar.
- **Títulos de seção** (`.metric-title`, `.analise-popup-section-title`): `color: var(--accent-2)` — azul suave, sem barra lateral.
- **Nav icons:** `stroke-width="1.6"`, cor `var(--ink-mute)`, ativo em `var(--accent)`.
- **Tabelas** (`.tbl`): header em JetBrains Mono, zebra `rgba(255,255,255,0.015)`, hover azul. Cabeçalhos em pt-BR: "P/L" (nunca "Profit"), "Win Rate", "Turnover".
- **Grid de fundo:** pseudo-elemento `body::before` com `position: fixed; z-index: 0; opacity: 0.55`. Grid via `linear-gradient + background-size: 44px 44px`, cor `--grid` (`rgba(255,255,255,0.05)` dark / `rgba(0,0,0,0.06)` light). `.app` tem `position: relative; z-index: 1` para ficar acima do grid.
- **`.mono`**: alias de `.num` em `components.css` — `font-family: var(--font-mono); font-variant-numeric: tabular-nums`. Não força `text-align: right` (diferente de `.num`).
- **`.sp-chip` / `.house-chip`** (`components.css`): chips simétricos 24×24px, `border-radius: 7px`, fundo `--fdc-steel`, borda `--line`. `.sp-chip` exibe emoji (14px) com `filter: grayscale(1)` no próprio elemento. `.house-chip` exibe favicon via `<img>` com `filter: grayscale(1) contrast(0.5) brightness(1.25)` na `<img>` — o `contrast+brightness` levanta pixels pretos para ~`#50`, normalizando logos de fundo escuro (Betboom, Pinnacle, BetMGM, KTO…). Fallback de casa sem domínio: `.chip-initial`. Erro de favicon tratado por event delegation (`document.addEventListener('error', …, true)`) em `app.js` — nunca usar `onerror` inline em `mkHouseChip`. Gerados por `mkSpChip(sport)` e `mkHouseChip(nome)` em `app.js`.
- **`.sport-emoji`**: classe legada com `filter: grayscale(1)` — ainda usada em chart labels do `performance.js`. Em todos os outros contextos (tabelas, cards, apostas) usar `.sp-chip` via `mkSpChip()`.
- **`.wrc`** (`mkWRC(wr)` em `shared.js`): componente de Win Rate — número em cima + barra proporcional azul (`--accent-2`) abaixo. Largura fixa 76px em tabelas. Em cards KPI, override `.kpi .wrc { width:100% }` e `.kpi .wrc .t { width:100% }` fazem a barra ocupar toda a largura sem repetir o número (já está no `.kpi-val`).
- **`.empty-state`** (`mkEmpty(msg)` em `shared.js`): estado vazio reutilizável — ícone inbox SVG neutro + mensagem JetBrains Mono. Usar em toda view/tabela que pode ficar sem dados no período selecionado.
- **`.stat-card-*`**: classes CSS para os cards de resumo por entidade (esporte/casa). Rodapé em 3 colunas — ROI (colorido) · Turnover (neutro) · WR (neutro) — com `border-right` como divisória. P/L é o elemento hero do card. Callers: `renderSport`, `renderCasa` em `performance.js`. **`renderTipsters` migrou para `.tcard` (T-1).**
- **`.tcard` / `.nametag`** (`components.css`, T-1): card redesenhado para a aba Tipsters. Estrutura: `.tcard__top` (`.nametag` steel neutro + volume), `.tcard__hero` (P/L 22px + badge ROI), `.tcard__spark` (sparkline SVG real via `_tipSparkSVG`), `.tcard__foot` (4 colunas: Turnover · Stake Média · Odd Média Pond. · Win Rate com mini-barra `--ink-mute`). Odd Média Pond. = `Σ(odd×stake)/Σ(stake)` — acumulada em `tipMap[t].wt` e `tipMap[t].stk` no loop de `renderTipsters`. Grid 3 colunas (`.tcard-grid`); sort segmentado por `.tcard-seg` (P/L · ROI · Turnover · Win Rate · Volume). Sort state em `_tipsterSort` module-level — persiste entre re-renders de filtro. Win Rate sempre neutro (`--ink-mute`). `R$` sinal: `.tcard__cur` com `color: var(--ink-soft)` mesmo dentro de `.tcard__pl.pos/.neg`. Cada card tem `data-name` com o nome do tipster; clique abre `openTipsterDrill(name)` via event delegation no container `#tipsterKpiCards`.
- **Popup drill-down de tipster** (`#tipsterDrillOverlay` / `#tipsterDrillModal`, T-6): overlay usa classes `.analise-popup-overlay` + `.analise-popup-modal` já existentes — zero CSS novo. `openTipsterDrill` faz `overlay.style.display='flex'` (não `'block'`) para ativar o centramento flex. `mkChart` para `tipsterDrillLine` e `tipsterDrillBar` chamados APÓS `display='flex'` (canvas precisa de dimensões). Fecha por botão ✕, clique no overlay (com `stopPropagation()` no modal) e Esc. `.analise-popup-modal` tem `max-height:85vh; overflow-y:auto` para scroll interno — não criar modal novo para outros drill-downs, reusar o mesmo padrão.
- **`.analise-popup-overlay`** (posicionamento correto): `align-items:flex-start; justify-content:center` são propriedades flex declaradas na regra CSS, mas só ativam quando o JS faz `display='flex'`. `.analise-popup-modal` tem `max-height:85vh; overflow-y:auto; width:100%`. NÃO usar `display='block'` no overlay — usar `display='flex'`.

## Regras específicas

- NÃO alterar estrutura de pastas nem nomes de arquivos sem confirmação.
- Badges de resultado: Win = `#2BC07E` (`--pos`), Loss = `#E5524B` (`--neg`), HW = `#2BC07E`, HL = `#E5524B`, Pending = `#E0A21A` (`--warn`).
- **Cyan (#00E5FF) foi removido da marca** — não reintroduzir. Usar `--accent-2` (`#7FB2FF`) no lugar.
- Tabela de apostas: ordenação padrão por data decrescente.
- Página `apostas` usa scroll virtual — não renderiza todos os cards de uma vez.
- `dashboard.html` é versão legada; não editar, serve como referência histórica.
- Custos de contas e custos de tipsters são persistidos em `localStorage` (não no Apps Script).
- Filtros são por página e independentes entre si (estado em `FS[page]`).
- `fmtPL`: sinal colado sem espaço (`+R$`/`-R$`). `.money-sign` em `0.76em`, cor `var(--ink-soft)` (neutro) — a cor pos/neg fica exclusiva do `.money-val` (número).
- Sidebar bottom: `#lastUpdate` é flexbox com `.pulse-dot` + `#lastUpdateText`.
- **Win Rate (WR) é NEUTRO** — nunca usar `pos`/`neg` no WR. Verde/vermelho somente em P/L, ROI e badges de win/loss. Locais: `mkCalendarHeatmap` (shared.js), `mkKpiGrid` (shared.js), `renderKPI` (overview.js).
- **Chips de esporte e casa**: usar `mkSpChip(sport)` e `mkHouseChip(nome)` — nunca construir chips à mão. Fallback de esporte: `🏅` (nunca `•`, nunca `?`). Fallback de casa sem domínio em `HOUSE_DOMAIN`: inicial mono via `.chip-initial`. O glifo de múltiplas é `🔗` — `🎰` (cassino) é proibido pela marca.
- **`HOUSE_DOMAIN`** (`data.js`): mapa nome→domínio para todas as casas. Para nova casa: adicionar entrada aqui. `favicon(domain)` em `app.js` constrói a URL Google S2. Para produção offline: substituir `favicon()` por `assets/casas/NOME.png` — o CSS `.house-chip img` continua igual.
- **`auditCasas(dados)`** (`app.js`): chamada em `loadData` após `normalizeDados`. Loga `[audit-casas]` no console para casas sem entrada em `HOUSE_DOMAIN`.
- **CSS sem hex hardcoded**: `.btn-export:hover` usa `filter: brightness(0.88)` (não hex). Toda cor deve vir de token CSS.
- **Hex em Chart.js é permitido**: Chart.js (canvas) não lê variáveis CSS. Cores `#2E8BFF`, `#2BC07E`, `#E5524B` etc. podem aparecer como literais nos arquivos `.js` de charts — não são desvios de marca.
