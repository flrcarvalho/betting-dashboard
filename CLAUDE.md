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
    shared.js           → mkCalendarHeatmap, mkSparkline, mkKpiGrid, buildSummaryTable,
                          mkWRC(wr), mkEmpty(msg), constantes APOSTAS_COLS/CARD_H
    gestao.js           → custoData, buildCostState, renderParceiros, renderCustos,
                          renderCustoTipster, renderCustoCards, renderMetrics
                          + _renderCustosKpi — faixa de 4 KPIs em #custosKpi (atualiza em tempo real)
    overview.js         → renderKPI, renderBankroll, renderROIMonthly, renderOddsDist,
                          renderHeatmap, renderOvHeatmap, renderOvStreaks, renderOvCusto
                          + renderOvRisco — ASSÍNCRONO: pinta o painel com spinner "calculando…"
                            e preenche via mcComputeAsync (Web Worker). Guarda de corrida _ovRiscoReq.
    temporal.js         → renderConsolidado, renderMensal, renderDiario, renderSemana
                          (+ getAvailableMonths/Days/Weeks e helpers de navegação)
    performance.js      → renderSport, renderCasa, renderTipsters, renderResultadosCasa
                          + _sportEnts, _sportDays, _sportAllDays, _sportSort (estado sort Esportes)
                          + _mkSportCard, _renderSportCards — grid .tcard para esportes (card clicável via data-sport → openSportDrill)
                          + window.sportSortBy(k), window.sportSortDir() — sort bar Esportes
                          + openSportDrill(sport), closeSportDrill() — popup drill-down Esportes (molde Bookies, sem custo)
                          + renderSportDrill(rows) — 6 seções: Resultado Geral (4×2, sem custo), Evolução, Cenário Atual, Mensal, Por Casa, Por Tipster
                          + _sliceSportDrillRows(), _updateSportDrillChips() — período do popup Esportes
                          + window.setDrillSportQuick/Type/All — chips período Esportes
                          + window.copySportDrill(), window.saveSportDrill() — copy/save PNG popup Esportes
                          + _casaEnts, _casaDays, _casaAllDays, _casaSort (estado sort Bookies)
                          + _mkCasaCard, _renderCasaCards — grid .tcard para casas
                          + window.casaSortBy(k), window.casaSortDir() — sort bar Bookies
                          + openCasaDrill(nome), closeCasaDrill() — popup drill-down Bookies
                          + renderCasaDrill(rows) — 6 seções: KPIs, gráfico, Cenário Atual, Mensal, Por Tipster, Por Esporte
                          + _sliceCasaDrillRows(), _updateCasaDrillChips() — período do popup Bookies
                          + window.setDrillCasaQuick/Type/All — chips período Bookies
                          + _casaBreakdownTbl(rows, dimKey, labelFn, maxVisible=10, tableId='') — top 10 + Outros com tooltip; header rotula tipster/casa/esporte (reusado no drill de Esportes)
                          + _getOutrosTip() — singleton tooltip fixo para linha "Outros"
                          + window.copyCasaDrill(), window.saveCasaDrill() — copy/save PNG popup Bookies
                          + _tipSparkSVG, _mkTipCard, _renderTipCards (T-1 — cards de tipster)
                          + _tipsterEnts, _tipsterDays, _tipsterAllDays, _tipsterSort (estado sort)
                          + window.tipsterSortBy(k), window.tipsterSortDir() (callbacks sort bar)
                          + openTipsterDrill(nome), closeTipsterDrill() (T-6 — popup drill-down)
                          + renderTipsterDrill(rows) — redesenha KPIs + gráfico + sequências + tabelas
                          + _sliceDrillRows(), _updateDrillChips() — período do popup
                          + window.setDrillQuick(days), setDrillType(qt), setDrillAll() — chips período
                          + _tipMonthTbody(rows) — tbody HTML de análise mensal (reusado em popup)
                          + _tipBreakdownTbl(rows, dimKey, labelFn) — tabela por casa/esporte (popup)
                          + _buildDrillCanvas(modal) — async; prepara DOM + html2canvas + _restore(); retorna {canvas}
                          + window.copyDrill() — só clipboard.write(); mostra X se falhar (sem fallback)
                          + window.saveDrill() — só download via blob URL; sem tentativa de clipboard
    apostas.js          → renderApostas, renderApostasVirt, apostasSort, apostasFilter
  app.js                → buildHTML(), loadData(), renderPage(), PAGE_META, updateTopbarTitle(),
                          showPage(), APARENCIA/applyAparencia()/setAparencia(), utilitários de UI
                          favicon(domain), mkSpChip(sport), mkHouseChip(nome), casaCell(), sportCell(),
                          auditCasas(dados)
                          window._dataLoadMs — timestamp do último loadData (usado em #tipsterDrillMeta)
                          + loadData usa cache local IndexedDB (_idbOpen/_idbGetData/_idbSetData)
                            em stale-while-revalidate: boot instantâneo + revalidação em 2º plano
                            (payload de ~8MB excede o localStorage). _setLastUpdate/_errBanner.
                          + Monte Carlo memoizado: calcMCdrawdown/calcPValueMC são wrappers com
                            cache (_mcCache/_pvCache) por _rowsSig(rows); corpos = _calcMCdrawdownRaw/
                            _calcPValueMCraw. mcComputeAsync — roda o MC em Web Worker (gerado das
                            próprias funções via toString, número idêntico) e alimenta o mesmo cache;
                            fallback síncrono adiado se Worker indisponível.
brand/                  → logos e favicons FDC Capital
Code.gs                 → referência do Apps Script v6 (NÃO é carregado pelo site). doGet serve
                          JSON pré-construído de arquivo no Drive; rebuildCache() (gatilho 1h) faz o
                          getData() pesado em 2º plano; ?refresh=1 força. Fonte de verdade é o que
                          está colado/implantado no editor do Google Apps Script.
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
| `metrics` | Métricas | Base de conhecimento: ROI, WR, MDD, Drawdown Médio Esperado (xmdd), Drawdown p95, P-Value |

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

O topbar contém um painel dropdown (`#aparenciaPanel`) com **apenas o toggle de tema** — as demais
propriedades visuais são fixas (hardcoded como padrão de marca):

| Propriedade | Valor fixo | Efeito |
|---|---|---|
| Título da página | `t-page-gradient` | Gradiente azul no título do topbar |
| Cards KPI | `kpi-azul` | Classe aplicada ao `<html>` (referenciada por JS) |
| Densidade | `data-density="compact"` | Layout compacto em cards, tabelas e nav |

| Chave configurável | Opções | Efeito |
|---|---|---|
| `theme` | **dark** / light | Atributo `data-theme` no `<html>` |

- Persiste em `localStorage` como JSON na chave `aparencia_v1` (apenas `{theme}` é lido).
- `applyAparencia()` aplica o tema e garante os valores fixos. Deve ser chamado após `buildHTML()`.
- `index.html` tem init script inline que aplica tema + valores fixos antes do primeiro render (evita FOUC).
- `toggleTheme()` foi removido — usar `setAparencia('theme', val)` via painel.

## Padrão Panelbox — regra de marca obrigatória

Todo container visual (painel, caixa, card de seção, card de entidade) usa:

| Propriedade | Standalone (página) | Dentro de modal/popup |
|---|---|---|
| `background` | `var(--surface)` #12161D | `var(--surface-2)` #161B22 |
| `border` | `1px solid var(--line)` | `1px solid var(--line)` |
| `border-radius` | `var(--r-lg)` 18px | `var(--r-lg)` 18px |
| `padding` | `20px 22px` | `20px 22px` |
| `margin-bottom` | `16px` | — (gap:16px no flex pai) |

**Header de seção:** `display:flex; justify-content:space-between; align-items:center; margin-bottom:16px`

**Tokens proibidos em containers:** `var(--line-2)` (=border sutil, 5%), `border-radius:8px` fixo, `border:2px`

**Aliases legados — NÃO usar em código novo** (existem em `tokens.css` apenas como backward-compat):

| Alias legado | Token canônico |
|---|---|
| `--blue` | `--accent` |
| `--green` | `--pos` |
| `--red` | `--neg` |
| `--amber` | `--warn` |
| `--text` | `--ink` |
| `--text2` | `--ink-soft` |
| `--text3` | `--ink-mute` |
| `--bg3` | `--surface-2` |
| `--bg4` | `--field` |
| `--bg5` | `--elevated` |
| `--border` | `--line-2` |
| `--border2` | `--line` |

**Exceções documentadas (não alterar):**
- `.card-hdr` / `.card-body` — sub-elementos de `.card`, padding próprio
- `.bet-card` — item de scroll virtual, compact intencional
- `.month-block` — linha colapsável, `var(--r-sm)` intencional
- `.term-card` — definição de métrica, compact intencional
- Células do calendário heatmap — componente visual específico
- Botões 32×32px — `border-radius:8px` é intencional (não são containers)
- Sticky headers de tabela em `gestao.js` — `var(--bg4)` para adesão ao scroll

---

## Design system aplicado

- **Topbar:** Manrope 800 22px tracking -0.035em (título) + JetBrains Mono 9px uppercase tracking 0.18em (eyebrow/sub).
- **KPI labels** (`.kpi-label`): JetBrains Mono — tudo que é dado usa mono, não sans.
- **P/L Líquido:** realce azul `rgba(46,139,255,.08)` + borda azul + sparkline de 90d. Os demais ficam neutros. A classe `kpi-azul` é sempre aplicada no `<html>` (valor fixo de marca).
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
- **`.tcard` / `.nametag`** (`components.css`): card canônico para cards de entidade — usado em **Esportes, Bookies e Tipsters**. Estrutura: `.tcard__top` (`.nametag` steel neutro + volume), `.tcard__hero` (P/L 22px + badge ROI), `.tcard__spark` (sparkline SVG real via `_tipSparkSVG`), `.tcard__foot` (4 colunas: Turnover · Stake Média · Odd Média · Win Rate com mini-barra `--ink-mute`). A coluna Odd Média tem botão `(i)` com tooltip ponderada via `_mkOddTip()`; `.tcard__stat-lbl` usa `display:flex; align-items:center; min-height:14px` para o `(i)` não desalinhar os valores. Grid 3 colunas (`.tcard-grid`); sort bar (`.tcard-seg`) com P/L · ROI · Turnover · Win Rate · Volume. Sort state module-level persiste entre re-renders. Win Rate sempre neutro (`--ink-mute`). `R$` sinal: `.tcard__cur` com `color: var(--ink-soft)`. Clique no card abre drill-down do tipster/casa via event delegation. **`.stat-card-*` foi removido** (Fase 3, commit c19db49) — não reintroduzir.
- **Popup drill-down de tipster** (`#tipsterDrillOverlay` / `#tipsterDrillModal`, T-6): overlay usa classes `.analise-popup-overlay` + `.analise-popup-modal` já existentes. `openTipsterDrill` faz `overlay.style.display='flex'` (não `'block'`). Canvas `tipsterDrillLine` criado APÓS `display='flex'`. Fecha por `‹ Tipsters`, clique no overlay e Esc. `.analise-popup-modal` tem `max-height:85vh; overflow-y:auto` — não criar modal novo, reusar padrão.
- **`.analise-popup-overlay`** (posicionamento): NÃO usar `display='block'` — usar `display='flex'`. `.analise-popup-modal` tem `max-height:85vh; overflow-y:auto; width:100%`.
- **Cabeçalho do popup drill-down** (T-6.5+): logo 28px (mesmo nível do topbar) + botão `‹ Tipsters` (pill steel, fecha o popup) + nome 22px bold + badge DRILL-DOWN (pill borda azul) + `#tipsterDrillMeta` (linha mono muted: "N apostas · jan-jun 2026 · atualizado há X min"). O `#tipsterDrillMeta` é populado em `openTipsterDrill` usando `window._dataLoadMs` (armazenado em `loadData`) e `MESES_CURTOS` para o range de meses.
- **Gráfico do popup drill-down** (`tipsterDrillLine`, T-6.5): clone exato do `renderBankroll` — `type:'bar'` com dataset line (P/L acumulado, eixo y1) + dataset bar (P/L diário pos/neg, eixo y). Eixo X oculto (`display:false`). Legend bottom com `generateLabels` customizado (inclui `fontColor`). Altura 220px.
- **Painel Sequências no popup** (T-6.5): cards assimétricos em grid 4 colunas. Streaks (dias): `font-size:var(--text-xl)` 22px. Monetários (topo/distância): `.kpi-val` padrão 28px. Footer 2-col com `justify-content:space-between`: streaks mostram "melhor/pior: N dias" + P/L; Topo mostra data + badge "pico"; Distância mostra "do pico · data" + percentual. Labels com `.kpi-pipe` (sem cor especial). Título da seção com `border-left:3px solid var(--accent);padding-left:8px`.
- **`.drill-tbl`** (`components.css`, T-6.5): wrapper class para tabelas do popup. `.drill-tbl .tbl th { text-align:center }` + `.drill-tbl .tbl td:not(:first-child) { text-align:right }`. Primeira coluna (entidade/mês) fica com `style="text-align:left"` inline no `th`.
- **`_buildDrillCanvas` / `copyDrill` / `saveDrill`** (T-6.5+): NÃO usar `allowTaint:true` (conflita com useCORS). `_buildDrillCanvas` centraliza prep: logo → data URL, favicons de `.house-chip img` → blob URLs (fetch+createObjectURL), `filter:grayscale(1)` inline em `.sp-chip`, modal `maxHeight:none; overflowY:visible`; chama html2canvas e executa `_restore()` antes de retornar `{canvas}`. `copyDrill`: só `navigator.clipboard.write()`; mostra ✗ se falhar, sem fallback download. `saveDrill`: só download via `URL.createObjectURL(blob)`; sem tentativa de clipboard. Header do popup tem dois botões separados: `.copy-drill-btn` e `.save-drill-btn`.
- **MetricTooltip** (`components.css` + `app.js` + `performance.js`): componente padrão para tooltips de métrica — **nunca usar `.fdc-info`/`.fdc-tip` (removidos)**. Markup: `<span class="tip-anchor"><button class="metric-info" type="button" aria-label="Sobre X">i</button><div class="metric-tip" role="tooltip" hidden>…</div></span>`. O `.metric-tip` inline fica `hidden` (fonte de dados); JS global `_gTip` em `app.js` o clona e posiciona com `position:fixed` (escapa de `backdrop-filter` stacking contexts). Gerado pelo helper `_mkTipAnchor(label, formula, desc, bench)` em `performance.js`. Abre no hover e no foco; fecha no blur e no Esc. O tooltip de Odd Média é gerado por `_mkOddTip()` (helper que encapsula `_mkTipAnchor` com a fórmula `_ODD_TIP_FORMULA`), reusado em cabeçalhos de tabela (`_mkOddMediaTh`) e nos cards `.tcard`. Em cards clicáveis, o `onclick` ignora alvos dentro de `.tip-anchor` para o `(i)` não abrir o drill. 3 camadas: `__formula` (mono, `--ink-soft`, operadores `.op` em `--accent-2`), `__desc` (sans, `--ink`, negrito na ideia-chave), `__bench` (mono, separado por hairline, `.good` em `--pos`). 8 tooltips no popup drill-down do tipster (Topo Histórico · Drawdown Atual · Max Drawdown · Recovery Factor · p-value · DD Médio · DD Extremo · Nível de Solidez).

## Regra semântica: camada de diagnóstico (`--d-*`)

Tokens para o painel de risco do tipster (MDD, Drawdown Médio Esperado, Drawdown p95, P-Value). Usar `--neg` /
`--pos` / `--warn` direto acoplaria cor e significado incorretamente — âmbar para um
fato realizado, ou vermelho para uma projeção estatística, confunde o leitor.

| Token | Hex | Semântica — quando usar |
|---|---|---|
| `--d-neg` | `#E5524B` | Perda **REALIZADA** — fato registrado (MDD real, P/L negativo, barra de loss) |
| `--d-proj` | `#D6A45A` | Perda **PROJETADA** — estatística (drawdown médio esperado, p95, bootstrap) |
| `--d-pos` | `#4FC79A` | Resultado a favor / edge significativo (mint suave; P-value < 5%) |
| `--d-info` | `#4DA3FF` | Métrica de qualidade / rótulo neutro (ROI, WR, odd média, labels) |
| `--d-pos-strong` | `#2BC07E` | Positivo forte (= `--pos`) — igual ao verde de P/L |
| `--d-proj-strong` | `#E0A21A` | Projeção forte (= `--warn`) — destaque âmbar |
| `--risk-grad` | neg→proj→pos | Barra de risco contínuo (gradiente) |

**Regras duras:**
- Nunca vermelho (`--d-neg`) para projeções — vermelho = fato acontecido.
- Nunca âmbar (`--d-proj`) para resultados realizados — âmbar = estimativa.
- Win Rate sempre neutro (`--d-info` ou `--ink-soft`), nunca verde/vermelho.
- `--risk-grad` só para barras de risco contínuo.
- Os soft variants (`--d-*-soft`) são para fundos/fills de cards; os sólidos para texto e bordas.

## Regras específicas

- NÃO alterar estrutura de pastas nem nomes de arquivos sem confirmação.
- Badges de resultado: Win = `#2BC07E` (`--pos`), Loss = `#E5524B` (`--neg`), HW = `#2BC07E`, HL = `#E5524B`, Pending = `#E0A21A` (`--warn`).
- **Cyan (#00E5FF) foi removido da marca** — não reintroduzir. Usar `--accent-2` (`#7FB2FF`) no lugar.
- Tabela de apostas: ordenação padrão por data decrescente.
- Página `apostas` usa scroll virtual — não renderiza todos os cards de uma vez.
- `dashboard.html` é versão legada; não editar, serve como referência histórica.
- Custos de contas e custos de tipsters são persistidos em `localStorage` (não no Apps Script).
- Filtros são por página e independentes entre si (estado em `FS[page]`).
- `fmtPL`: sinal colado sem espaço (`+R$`/`−R$`), usa minus tipográfico U+2212. `.money-sign` em `0.76em`, cor `var(--ink-soft)` (neutro) — a cor pos/neg fica exclusiva do `.money-val` (número).
- **Formatação numérica — fonte única de verdade** (`app.js`): `fmt(v,d)` para moeda; `fmtPct(v,d=2,signed=true)` para percentual pt-BR com sinal `+`/`−` e `%` colado; `fmtOdd(v)` para odd com 2 casas pt-BR. Nunca usar `.toFixed(N)+'%'` ou `.replace('.',',')` fora destes helpers. CSS widths e coords SVG usam `.toFixed()` diretamente (valores de layout, não display).
- Sidebar bottom: `#lastUpdate` é flexbox com `.pulse-dot` + `#lastUpdateText`.
- **Win Rate (WR) é NEUTRO** — nunca usar `pos`/`neg` no WR. Verde/vermelho somente em P/L, ROI e badges de win/loss. Locais: `mkCalendarHeatmap` (shared.js), `mkKpiGrid` (shared.js), `renderKPI` (overview.js).
- **Void fora de Turnover/ROI/Stake Média** — apostas Void (`resultado === 'V'`) devolvem a stake (lucro 0) e **não entram** no Turnover, no ROI nem na Stake Média, em todo o sistema. Fonte de verdade: `calcTurnover(rows)` em `app.js` (soma stake de não-Void); `calcROI` usa esse denominador. Em código novo, sempre usar `calcTurnover` — nunca `rows.reduce((a,r)=>a+r.stake,0)` para turnover. Em mapas de agregação, guardar `map.s += r.stake` com `if(r.resultado!=='V')`; o campo `t` do mapa = nº de encerradas. **Stake Média = Turnover ÷ encerradas** (denominador `d.t`/`v.t`/`settled`, nunca `d.n`/total). Inalterados: P/L, contagem total `n`, detalhe `W/HW/L/HL/V`, e `calcAvgOdd` (Odd Média segue ponderada sobre todas as bets com odd>0).
- **Drawdown real sempre por dia cronológico** — a planilha de origem é organizada por casa → parceiro (com linhas em branco), **nunca por data**: o JSON do Apps Script chega na ordem das linhas, não cronológica. Toda métrica que percorre uma curva acumulada **tem que ordenar por data internamente** — nunca confiar na ordem de `DADOS`/`rows`. Fonte de verdade: `calcDrawdownReal(rows)` em `app.js` — agrega o P/L **por dia**, ordena cronologicamente (igual a `renderBankroll`) e devolve `{mddReais, mddPct, peakDate, troughDate}` do **mesmo episódio** pico→vale (R$ e % sempre coerentes). `calcMDDreais`/`calcMDDpct` são wrappers dela; `calcRecoveryFactor` herda. Em código novo, usar `calcDrawdownReal` — nunca acumular `rows` na ordem recebida. Separação real vs simulado: **Cenário Atual** = realizado (badge "dados reais · histórico"); **Diagnóstico de Risco** = Monte Carlo (badge "simulado"). O card de cauda simulado chama-se **DD Extremo** (p99), nunca "DD Máximo" (evita colisão com "Max Drawdown" real).
- **Chips de esporte e casa**: usar `mkSpChip(sport)` e `mkHouseChip(nome)` — nunca construir chips à mão. Fallback de esporte: `🏅` (nunca `•`, nunca `?`). Fallback de casa sem domínio em `HOUSE_DOMAIN`: inicial mono via `.chip-initial`. O glifo de múltiplas é `🔗` — `🎰` (cassino) é proibido pela marca.
- **`HOUSE_DOMAIN`** (`data.js`): mapa nome→domínio para todas as casas. Para nova casa: adicionar entrada aqui. `favicon(domain)` em `app.js` constrói a URL Google S2. Para produção offline: substituir `favicon()` por `assets/casas/NOME.png` — o CSS `.house-chip img` continua igual.
- **`auditCasas(dados)`** (`app.js`): chamada em `loadData` após `normalizeDados`. Loga `[audit-casas]` no console para casas sem entrada em `HOUSE_DOMAIN`.
- **CSS sem hex hardcoded**: `.btn-export:hover` usa `filter: brightness(0.88)` (não hex). Toda cor deve vir de token CSS.
- **Hex em Chart.js é permitido**: Chart.js (canvas) não lê variáveis CSS. Cores `#2E8BFF`, `#2BC07E`, `#E5524B` etc. podem aparecer como literais nos arquivos `.js` de charts — não são desvios de marca.
