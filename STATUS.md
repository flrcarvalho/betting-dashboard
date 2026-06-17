# STATUS — Betting Dashboard

## Estado atual: KPI cards sem sparkline, altura uniforme, secoes sem colapso — COMPLETO (2026-06-16 sessao 35)

## Sessao 2026-06-16 (sessao 35) — Correcoes visuais de cards e remocao de colapso

### O que foi feito

**assets/js/charts/performance.js**
- Removidas sparklines dos cards P/L Total (Esportes e Bookies) e P/L Carteira (Tipsters)
- Variaveis portDayMap/portDays/portVals/portSpark limpas nos 3 blocos de portfolio KPIs
- `style="position:relative"` removido dos cards que tinham sparkline

**assets/css/components.css**
- `.kpi`: adicionado `display:flex; flex-direction:column; min-height:120px`
- `.kpi-sub`: `margin-top:4px` substituido por `margin-top:auto; padding-top:6px` (subtitulo no fundo)
- `.card-hdr`: removidos `cursor:pointer` e `user-select:none`; removido hover azul
- Removidos: bloco `.card-tog`, `.card.collapsed .card-body/tog/hdr`

**assets/css/layout.css**
- `.kpi-grid`: adicionado `align-items:stretch`
- `[data-density="compact"] .kpi`: adicionado `min-height:96px`

**assets/js/charts/overview.js**
- Os 8 KPI cards da Visao Geral unificados em grid unico com `align-items:stretch`
- Elimina diferenca de altura entre linha de cima (P/L) e linha de baixo (metricas)

**assets/js/app.js**
- Removidos: `toggleCard()`, `CARD_STATE_KEY`, `cardStates` e IIFE de localStorage
- `mkCard()` simplificado: sem onclick, sem `.card-tog ▼`, sem estado colapsado

**assets/js/charts/shared.js**
- Removida `toggleBlock()` (codigo morto, nunca chamado nos arquivos ativos)

### Pendente
- Verificar no browser: 8 KPI cards identicos na Visao Geral; sem sparklines nos portfolios; sem botao v nas secoes
- Tooltip do "Max Drawdown" (popups Casa e Tipster) diz "XMDD" mas valor e calcMDDreais -- corrigir label
- EMDD: implementacao real e xmdd*0.85, documentacao diz Brownian Motion -- alinhar ou documentar fator 0.85

### Commit desta sessao
- 2e85f90 refactor(ui): remove sparklines dos KPI cards, uniformiza altura e elimina colapso de secoes

## Proximo passo
- Abrir index.html e verificar os 3 pontos visuais acima
- Corrigir tooltip "Max Drawdown" em performance.js linha 743 (trocar "XMDD" por "MDD")

---

## Estado atual: Cenario Atual e Diagnostico de Risco corrigidos na Visao Geral — COMPLETO (2026-06-16 sessao 34)

## Sessao 2026-06-16 (sessao 34) — Auditoria de drawdown + correcao Visao Geral

### O que foi feito

**Auditoria completa de drawdown (leitura)**
- Mapeadas 9 funcoes de calculo em app.js linhas 128-171
- Identificadas 6 inconsistencias, sendo a principal: "Drawdown Atual" na Visao Geral media dias negativos consecutivos (conceito errado)
- Tooltip do "Max Drawdown" nos popups Casa/Tipster diz "XMDD" mas exibe calcMDDreais (bug pendente)
- EMDD documentado como formula de Brownian Motion mas implementado como xmdd*0.85 (bug pendente)

**assets/js/charts/overview.js**
- renderOvStreaks: reescrita para usar calcTopoDrawdown, calcMDDreais, calcMDDpct, calcRecoveryFactor
- Exibe agora: Topo Historico, Drawdown Atual (R$), Max Drawdown, Recovery Factor
- Mesma logica e markup do popup de Tipster (Cenario Atual)
- renderOvRisco: nova funcao adicionada com Diagnostico de Risco
- Exibe: P-Value (bootstrap), DD Medio (MC.xmdd), DD Maximo (MC.p99), Nivel de Solidez
- Usa calcMCdrawdown(rows, 10000), calcPValueMC, calcSolidez

**assets/js/app.js**
- Card ov_risco adicionado em buildHTML() apos ov_streaks
- renderOvRisco(rows) adicionado em renderPage() para pagina overview

### Pendente
- Verificar no browser: Cenario Atual com 4 KPIs corretos; novo card Diagnostico de Risco visivel
- Tooltip do "Max Drawdown" (popups Casa e Tipster) diz "XMDD" mas valor e calcMDDreais — corrigir label
- EMDD: implementacao real e xmdd*0.85, documentacao diz Brownian Motion — alinhar ou documentar fator 0.85

## Proximo passo
- Abrir index.html, ir para Visao Geral e confirmar os 2 cards visuais
- Corrigir tooltip "Max Drawdown" em performance.js linha 743 (trocar "XMDD" por "MDD")

---

## Estado atual: KPI cards uniformes + Cenario Atual na Visao Geral — COMPLETO (2026-06-15 sessao 33)

## Sessao 2026-06-15 (sessoes 32-33) — KPI cards uniformes + Cenario Atual

### O que foi feito

**assets/js/charts/overview.js**
- Removido calculo do sparkline (byDay90, cumPL90, mkSparkline)
- Removida prop `spark` do objeto P/L Liquido em `row1`
- Removido `<div class="kpi-sparkline">` do template HTML
- Sub-texto W:/HW:/L:/HL:/V: removido do card Win Rate (substituido por "N encerradas")
- `renderOvStreaks`: cards migrados para `fdc-kpi__value` + `data-state` (pos/real/info)
- Inline styles kS/vS/sbS e kpi-pipe nos labels — mesmo padrao visual do popup de tipsters

**assets/css/layout.css**
- Removida regra `.kpi-sparkline` (CSS morto)

**assets/js/app.js**
- Titulo do card `'Sequencias & Topo Historico'` renomeado para `'Cenario Atual'`

Os 8 KPI cards agora tem estrutura e altura identicas. A secao Cenario Atual na Visao Geral
segue o mesmo padrao visual do popup de tipsters.

### Commits desta sessao
- 3398b51 refactor(overview): remove sparkline do card P/L Liquido
- d1da61c refactor(overview): renomeia secao para Cenario Atual e aplica estilo fdc-kpi__value

### Pendente historico (nao prioritario)
- gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)

## Proximo passo
- Verificar no browser: 8 KPI cards uniformes; secao Cenario Atual com cores pos/real/info corretas

---

## Estado atual: painel Aparencia simplificado para apenas toggle de tema — COMPLETO (2026-06-14 sessao 31)

## Sessao 2026-06-14 (sessao 31) — Limpeza do painel Aparencia

### O que foi feito

**assets/js/app.js**
- `APARENCIA_DEFAULTS` reduzido para `{theme:'dark'}` (era 4 chaves)
- `APARENCIA_PAGE_CLASSES` e `APARENCIA_KPI_CLASSES`: constantes removidas
- `applyAparencia()`: simplificada — aplica fixos (t-page-gradient, kpi-azul, data-density=compact) + le tema do APARENCIA
- `toggleTheme()`: removida (codigo morto, nao era chamada em nenhum lugar)
- `buildHTML()`: painel dropdown reduzido a apenas a secao Tema (Escuro/Claro)

**index.html**
- Init script inline simplificado: so le `theme` do localStorage; demais valores aplicados como fixos

**assets/css/layout.css**
- Regra `.t-page-blue .page-title` removida (inacessivel apos remocao da opcao)

**CLAUDE.md**
- Secao "Sistema de Aparencia" atualizada: tabela reflete valores fixos vs. configuravel (so tema)

### Commit desta sessao
- 2766a62 refactor(aparencia): remove opcoes de titulo/KPI/densidade — apenas tema permanece configuravel

### Pendente historico (nao prioritario)
- gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)

## Proximo passo
- Verificar no browser: painel Aparencia mostra apenas Escuro/Claro; titulo permanece com gradiente; densidade compacta ativa

---

## Estado atual: Custos de contas com data + popup Bookies reformulado — COMPLETO (2026-06-14 sessao 30)

## Sessao 2026-06-14 (sessao 30) — Custos com consciencia de data + KPIs do popup de Bookies

### O que foi feito

**gestao.js — infraestrutura de custo por data**
- `_firstBetMap`: mapa bidimensional `forn||casa -> {conta -> primeiraData}`, construido a partir de DADOS
- `_buildFirstBetMap()`: percorre DADOS uma vez e popula o mapa
- `buildCostState()`: chama `_buildFirstBetMap()` automaticamente a cada reconstrucao
- `calcCostFiltered(rows)`: retorna `{costConta}` somando so contas cuja primeira aposta esta no intervalo de datas das rows
- `calcCasaCost(nomeCasa, minDate, maxDate)`: retorna `{total, nContas}` para uma casa especifica no periodo

**overview.js — P/L Liquido filtrado por periodo**
- `renderKPI(rows)`: costConta agora vem de `calcCostFiltered(rows)` em vez do total all-time
- P/L Liquido no KPI row da Visao Geral agora reflete so os custos do periodo filtrado

**performance.js — popup de Bookies reformulado**
- Dois blocos separados (5 cards brutos + 3 cards waterfall) fundidos em uma secao unica "Resultado Geral"
- Linha 1 (5 cards): P/L Bruto, ROI Bruto, Custo, P/L Liquido, ROI Liquido (novo)
- Linha 2 (5 cards): Turnover, Volume, Stake Media, Odd Media Pond., Win Rate
- ROI Liquido: `plLiq / turnover * 100`
- Custo: neg se > 0, neutro se = 0 (grid sempre com 10 slots)
- Grafico renomeado para "Evolucao"
- Recovery Factor: alinhamento a direita corrigido (`text-align:right` inline)

### Commits desta sessao
- (ver step 4)

### Pendente historico (nao prioritario)
- gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)

---

## Estado anterior: Design System Fases 1-3 concluidas — COMPLETO (2026-06-14 sessao 28)

## Sessao 2026-06-14 (sessao 28) — Design System: tokens, seg-btn e migracao Esportes

### O que foi feito

**Fase 1 — Tokens semanticos (commit 5af6745)**
- tokens.css: adicionados --text-nano (9px), --text-xxs (10px), --text-md (14px)
- Secoes spacing e radius reorganizadas: --sp-* e --r-* como canonicos; --space-* e --radius-* deprecated
- components.css: ~50 substituicoes de literais px por tokens --text-*, --sp-*, --r-*
- layout.css: 8 substituicoes cirurgicas (mesmos tokens)

**Fase 2 — Botoes pill unificados (commit 5ff9229)**
- Criado .seg-btn como componente canonico em components.css
- .qbtn: var(--blue) substituido por var(--accent)
- .tcard-seg button: migrado de pill-sem-borda para visual identico ao .qbtn (borda individual, r-xs)
- .ap-btn: 11px hardcoded -> var(--text-xs); var(--radius-pill) -> var(--r-pill); visual alinhado

**Fase 3 — Aba Esportes migrada para .tcard (commits c19db49 + dd1b8d8)**
- renderSport() reescrito: acumula wt/stk/dayMap por esporte (odd media e sparkline)
- _mkSportCard(), _renderSportCards(), sportSortBy(), sportSortDir() adicionados em performance.js
- Removidos mkOneStatCard() e mkStatCards() de shared.js (sem uso apos migracao)
- Removido bloco .stat-card* de components.css (~40 linhas)
- 4 KPIs de portfolio (P/L Total + sparkline, ROI, Esportes Positivos X/N, Turnover Total) acima do sort bar
- Sort bar identico ao de Tipsters e Bookies (P/L, ROI, Turnover, Win Rate, Volume)
- Grid de 3 colunas com sparkline e rodape 4 colunas (Turnover, Stake Media, Odd Media, Win Rate)

### Commits desta sessao
- 5af6745 refactor(tokens): fase 1
- 5ff9229 refactor(ui): fase 2 -- seg-btn unificado
- c19db49 feat(sports): fase 3 -- migracao .stat-card -> .tcard
- dd1b8d8 feat(sports): KPIs de portfolio acima dos cards

### Sessao 29 (2026-06-14) — Design System: KPIs de Gestao, aliases e screenshots — COMPLETO

#### Fase 4 — KPI summary nas paginas de Gestao
- Fase 4: KPI strips em Fornecedores & Parceiros (8 KPIs, mkKpiGrid), Custos de Contas (4 KPIs, _renderCustosKpi, tempo real), Custo de Tipsters (4 KPIs, prepend no innerHTML)
- Ancoras #parcKpiGrid e #custosKpi adicionadas em app.js

#### Fase 5 — Aliases legados migrados
- 10 arquivos (JS + CSS): 381 substituicoes, zero aliases legados remanescentes
- --blue->--accent, --green->--pos, --red->--neg, --amber->--warn, --text->--ink, --text2->--ink-soft, --text3->--ink-mute, --bg3->--surface-2, --bg4->--field, --bg5->--elevated, --border->--line-2, --border2->--line

#### Fase 6 — Screenshots e documentacao
- 14 screenshots recapturados via docs/screenshot_pages.js (Playwright)
- UI_REFERENCE_BOARD.md atualizado com estado pos-implementacao
- CLAUDE.md e STATUS.md atualizados (sessao 29, auditoria pos-implementacao)

### Commits da sessao 29
- 7505c03 feat(gestao): fase 4 -- KPI strips nas paginas de gestao
- 93dfa97 refactor(tokens): fase 5 -- aliases legados para tokens canonicos
- 2a4a252 docs(screenshots): fase 6 -- board e screenshots pos-implementacao

### Pendente historico (nao prioritario)
- gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado atual: mini-cards do calendario alinhados ao padrao .kpi da marca — COMPLETO (2026-06-14 sessao 27)

## Sessao 2026-06-14 (sessao 27) — Reforma visual dos mini-cards do calendario heatmap

### Mudancas

**assets/js/charts/shared.js**
- Remove abreviacao `k` nos valores das celulas do grid (plAbs >= 1000 usava sufixo `k`)
- Hero card: label com `<span class="kpi-pipe"></span>`; remove `::before` azul
- Card "Apostas" -> "WIN RATE": exibe percentual + barra + "N apostas"
- Todos os 5 mini-cards com pipe nos labels
- Hero: adiciona sub-texto "N apostas"
- WIN RATE: sub-texto "taxa de acerto"; barra sem `.brk`
- TURNOVER: sub-texto "no mes"
- ROI: sub-texto "Σ(P/L)/Σ(turnover)"
- ODD MEDIA POND.: sub-texto "ponderada"
- STAKE MEDIA: sub-texto "por aposta"
- Remove legenda "perda -> lucro" da toolbar

**assets/css/components.css**
- `.cal__hero`: remove `::before` (borda azul); `r-md` -> `r-lg`; `surface-2` -> `surface`; padding `20px 22px`
- Labels `.cal__hero .k` e `.cal__kpi .k`: `letter-spacing .18em` -> `.08em` (correcao critica); `font-size 9px` -> `11px`; `font-weight` -> `700`; remove `gap`, usa `margin-bottom:5px`
- `.cal__kpi .v`: `font-size 16px` -> `28px`; `font-weight 600` -> `800`; `text-align:right`; `line-height:1`
- `.cal__kpi`: padding `14/16` -> `20px 22px`; `r-md` -> `r-lg`; `surface-2` -> `surface`
- Adiciona regras de cor: `.cal__hero .v.pos/.neg` e `.cal__kpi .v.pos/.neg/.neu`
- `.cal__cell .pl.pos/.neg`: valores das celulas agora verdes/vermelhos (marca)
- WR bar: `height 4px` -> `5px`; fill solid -> `linear-gradient(accent, accent-2)`
- Substitui `.cal__wr .brk` por `.cal__sub` (10px mono muted, igual a `.kpi-sub`)
- `.cal-tip` reformulado: `r-md` -> `r-lg`; padding `16/18`; P/L `22px/700` -> `28px/800`; grid 2 colunas + hairline; labels `8px/.1em` -> `9px/.08em`; valores `12px` -> `14px/700`

**assets/js/app.js**
- Tooltip do dia: substitui 3x `ct-row` por `ct-grid` (grid 2x3) + `ct-sep` (hairline)
- "Winrate" -> "WIN RATE"; W/L usa classes `.w/.l` em vez de `style` inline

### Commits desta sessao
- 6840df2 fix(calendar): reforma mini-cards do heatmap para padrao de marca
- 08764ff fix(calendar): alinhamento milimetrico dos mini-cards ao padrao .kpi da marca
- 39ba02d feat(calendar): adiciona sub-textos nos mini-cards e remove legenda de cores
- 264a7a0 fix(calendar): alinha mini-cards ao .kpi real da pagina (fontes e tamanhos)
- a463ffb fix(calendar): reformula tooltip do dia para padrao visual dos metric-tips

## Proximo passo
- Verificar calendario no browser: hover nas celulas (tooltip), mini-cards e cores pos/neg
- Pendente historico: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado anterior: redesign do calendario heatmap — COMPLETO (2026-06-13 sessao 26)

## Sessao 2026-06-13 (sessao 26) — Redesign completo do mkCalendarHeatmap

### Mudancas

**assets/js/charts/shared.js**
- Rewrite de mkCalendarHeatmap: estrutura nova com hero P/L + 5 KPIs (Apostas+WR, Turnover, ROI, Odd Media Pond., Stake Media)
- Opacidade calibrada 0.07-0.49 (era 0.15-0.93); maxAbs calculado por mes
- Celulas 62px mostrando so P/L (sem contador "Nb"); data-* attributes para tooltip
- Toolbar estilizada: botoes .cal__nav + pill .cal__month (select nativo transparente sobreposto) + legend perda/lucro
- Estado "hoje": borda --accent + anel inset + label "hoje"; celulas vazias: transparente + --line-2; fim de semana: fundo rgba sutil
- compact ignorado (design unico para as 4 instancias)

**assets/css/components.css**
- Classes .cal__bar, .cal__nav, .cal__month, .cal__legend adicionadas (toolbar)
- Classes .cal__sum, .cal__hero, .cal__kpis, .cal__kpi, .cal__wr (resumo)
- Classes .cal__wk, .cal__grid, .cal__cell e variantes (.we, .empty, .offset, .today, .has)
- Classe .cal-tip: tooltip fixed com visual identico ao .metric-tip

**assets/js/app.js**
- _calTip: singleton div .cal-tip appendado ao body
- _showCalTip(cell, cx, cy): le data-* da celula, calcula ROI/WR/stake-media, formata e posiciona
- Event delegation: mouseover/mousemove (follow-cursor) + mouseout em .cal__cell
- Esc fecha _calTip junto com _gTip

### Callers sem mudanca
- renderOvHeatmap (overview.js), renderConsolidado, renderMensal, renderSemana (temporal.js)

### Commits desta sessao
- 72af7ce feat(calendar): redesign completo do heatmap mensal

## Proximo passo
- Verificar na UI real: navegar Mensal e hover nas celulas para confirmar tooltip
- Pendente historico: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado anterior: limpeza de graficos redundantes na pagina Diario — COMPLETO (2026-06-13 sessao 25)

## Sessao 2026-06-13 (sessao 25) — Remocao de graficos da pagina Diario

### Mudancas

**assets/js/charts/temporal.js**
- Removido card e canvas `chartDiarioPL` ("P/L por Tipster") — grafico de barras horizontais com labels ROI/WR
- Removido card e canvas `chartDiarioRes` ("Distribuicao de Resultados") — grafico stacked por resultado
- Removido codigo de render de ambos os graficos dentro do `setTimeout` (~55 linhas)
- Mantidos: seletor de dia, KPIs, tabela "Tipsters - Resultados do Dia", lista de apostas

### Commits desta sessao
- (ver step 4)

### Notas
- `byTipster` e `tipEnts` preservados — alimentam a tabela que ficou
- `makeSortable('tblDiarioTip',...)` preservado no setTimeout

## Proximo passo
- Continuar limpeza de areas nao importantes (a definir na proxima sessao)
- Pendente historico: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado anterior: padrao panelbox formalizado e aplicado em todos os ambientes — COMPLETO (2026-06-12 sessao 24)

## Sessao 2026-06-12 (sessao 24) — Panelbox como regra de marca + correcoes de popup + varredura global

### Mudancas

**CLAUDE.md (Betting Dashboard)**
- Secao "Padrao Panelbox" adicionada: tabela canonica (bg/border/radius/padding/mb), tokens proibidos, lista de excecoes documentadas

**assets/css/components.css**
- `.analise-popup-section`: bg `--surface` -> `--surface-2` (restaura hierarquia visual dentro de modal)
- `.analise-popup-hdr`: border-bottom `--border` -> `--line`
- `#casaDrillBody`: regra adicionada (igual ao `#tipsterDrillBody`): padding 16/22, flex col, gap 16px
- `.tcard`: padding `20px 22px 16px` -> `20px 22px` (uniform)

**assets/css/layout.css**
- `.filters`: padding `16px 22px` -> `20px 22px`

**assets/js/app.js**
- `casaDrillPeriodBar` e `tipsterDrillPeriodBar`: border `--border` -> `--line`
- Barra de filtros da aba Apostas (L490): surface+line+r-lg+16/22 (era bg3+border+8px)

**assets/js/charts/gestao.js**
- `totalCard` (L214): surface+1px line+r-lg+20/22 (era bg4+2px+8px+1rem)
- `fornCards` (L242): surface+line+r-lg+20/22 (era bg4+border+8px+1rem)

**assets/js/charts/overview.js**
- `casaCards` (L281): surface+line+r-lg+16/22 (era bg4+border+8px+.75/1)
- `fornCards` (L314): surface+line+r-lg+20/22 (era bg4+border+8px+1rem)

### Commits desta sessao
- 19831dc fix(bookies): aplica padding/gap do panelbox no popup drill-down
- c91f062 fix(popup): restaura hierarquia de superficie nas secoes dos popups
- 82b712e feat(brand): formaliza padrao panelbox e aplica em todos os containers

### Excecoes documentadas (nao alterar)
- `.stat-card` padding 16/20: height 130px fixo
- `.bet-card`, `.month-block`, `.term-card`: componentes compact intencionais
- Celulas de calendario, botoes 32px, sticky headers de tabela em gestao.js

## Proximo passo
- Pendente historico: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)
- Visual check: abrir Parceiros, Custos, Apostas e Overview para confirmar cards com novo padrao

---

## Estado anterior: spacing unificado em todos os containers — COMPLETO (2026-06-11 sessao 23)

## Sessao 2026-06-11 (sessao 23) — Padronizacao global de panelbox

### Mudancas

**assets/css/components.css**
- `.card`: bg `--bg3` -> `--surface`; border `--border` -> `--line`
- `.card-hdr`: padding `0.85rem 22px` -> `16px 22px`; border-bottom `--border` -> `--line`
- `.kpi`: bg/border idem; radius `--r-md` -> `--r-lg`; padding `16px 20px` -> `20px 22px`
- `.analise-card`: bg/border padronizados para `--surface` / `--line`
- `.analise-popup-modal`: `border-radius: 12px` hardcoded -> `var(--r-lg)`
- `.analise-popup-section`: bg/border padronizados
- `.stat-card`: bg `--bg4` -> `--surface`; border `--border` -> `--line`; radius `--r-md` -> `--r-lg`; padding `14px 18px` -> `16px 20px`
- `.tcard`: bg `--surface-2` -> `--surface`; padding `16px 18px 14px` -> `20px 22px 16px`

**assets/css/layout.css**
- `.filters`: bg/border padronizados; radius `--r-md` -> `--r-lg`; padding `12px 16px` -> `16px 22px`
- compact `.card-hdr`: `0.55rem 14px` -> `10px 14px`
- compact `.kpi`: `10px 14px` -> `12px 14px`

### Commits desta sessao
- 61f62b6 style(spacing): padroniza bg, borda e radius em todos os containers

## Proximo passo (era)
- Verificar visual das paginas principais (overview, tipsters, casas, esportes) com novo spacing
- Pendente historico: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado anterior: padrao de spacing aplicado em todo o documento — COMPLETO (2026-06-11 sessao 22)

## Sessao 2026-06-11 (sessao 22) — Padronizacao de spacing e border-radius

### Mudancas

**assets/css/components.css**
- `.card`: border-radius `var(--radius-lg)` 12px -> `var(--r-lg)` 18px; margin-bottom 12px -> 16px
- `.card-hdr`: padding horizontal 16px -> 22px
- `.card-body`: padding lateral 16px -> 22px; bottom 17.6px -> 20px
- `.kpi`: border-radius 8px -> `var(--r-md)` 12px; padding 14px 17.6px -> 16px 20px
- `.stat-card`: border-radius 10px -> `var(--r-md)` 12px; padding lateral 16px -> 18px
- `.tcard`: border-radius `var(--r-md)` 12px -> `var(--r-lg)` 18px; padding 13/14/11 -> 16/18/14
- `.analise-card`: border-radius 12px -> `var(--r-lg)` 18px; padding 1.1rem -> 20px 22px
- `.analise-popup-section`: border-radius 12px -> `var(--r-lg)` 18px; padding -> 20px 22px
- `.analise-popup-hdr`: padding 1.25rem 1.5rem -> 20px 22px
- `#tipsterDrillBody`: padding 1rem 1.5rem -> 16px 22px; gap 12px -> 16px
- Modo compacto: `.card-hdr` 0.55rem 1rem -> 0.55rem 14px; `.card-body` -> 0.1rem 14px 12px; `.kpi` -> 10px 14px; `.tcard` -> 12px 14px 10px

**assets/css/layout.css**
- `.filters`: border-radius `var(--radius)` 8px -> `var(--r-md)` 12px
- `.row2`: gap e margin-bottom 12px -> `var(--space-4)` 16px
- `.month-block`: border-radius 7px -> `var(--r-sm)` 8px; margin-bottom 0.75rem -> `var(--space-4)` 16px
- Modo compacto card-hdr/card-body/kpi: alinhado com os novos valores normais

**assets/js/charts/performance.js**
- `_mkOddMediaTh`: tooltip da coluna Odd media simplificado -- so formula, sem descricao

### Commits desta sessao
- 111e1b0 style(spacing): padroniza padding/radius em todos os containers do documento

## Proximo passo (era)
- Verificar visual das paginas principais (overview, tipsters, casas) com novo spacing
- Pendentes anteriores: gestao.js tblCost/tblForn/tblCross/tblCG/tblCT (migracao para mkTh)

---

## Estado atual: sub-labels removidos + tooltip Odd Media — COMPLETO (2026-06-11 sessao 21)

## Sessao 2026-06-11 (sessao 21) — Limpeza de cabecalhos de tabela

### Mudancas

**assets/js/charts/shared.js** (buildSummaryTable)
- Sub-labels (R$, %, qtd) removidos de todos os mkTh calls
- Alinhamento das colunas numericas ajustado para 'r'

**assets/js/charts/temporal.js** (4 tabelas)
- tblConsAnual, tblMensalTip, tblDiarioTip, tblSemanaTip: sub-labels removidos
- Odd Media Pond. substituido por `_mkOddMediaTh('r')` nas 3 tabelas que a tem
- tblSemanaTip nao tem Odd Media: apenas sub-labels removidos

**assets/js/charts/performance.js** (6 locais)
- Helper `_mkOddMediaTh(align, width)` criado logo apos `_mkTipAnchor`
- _casaBreakdownTbl: oddTh vira `_mkOddMediaTh('r','88px')`, R$/% removidos
- _tipBreakdownTbl: idem
- casaDrillTblMensal: thead atualizado (R$/% removidos, oddTh via helper)
- tipDrillTblMensal: idem
- tblTipComp: header literal substituido por mkTh() + `_mkOddMediaTh('r')`
- tblResCasa: idem

### Commits desta sessao
- 484cb03 feat(tabelas): remove sub-labels R$/% e adiciona tooltip Odd media

### Notas
- `_mkOddMediaTh` e definida em performance.js mas usada em temporal.js (sem problema: todos os scripts sao `defer`, chamados apenas em runtime)
- `_tipBreakdownTbl` e `_casaBreakdownTbl` eram identicas na parte afetada: replace_all cobriu as duas

## Proximo passo
- Testar visual: todas as tabelas devem mostrar cabecalhos sem sub-labels; botao (i) de Odd Media funciona em todos os popups
- Pendente historico: gestao.js — tblCost, tblForn, tblCross, tblCG, tblCT (ainda com formato antigo)

---

## Estado atual: aba Bookies migrada para padrao .tcard + popup drill-down — COMPLETO (2026-06-11 sessao 20)

## Sessao 2026-06-11 (sessao 20) — Migracao aba Casas (Bookies)

### Mudancas

**assets/js/app.js**
- page-casas: substitui mkCard legado (casaTable + chartCasa) por strip de KPIs + sort bar + tcard-grid
- Adicionado popup casaDrillOverlay (header: logo + eyebrow BOOKIE + chip + nome + copy/save/fechar)
- Period chips: Hoje/WTD/MTD/YTD/7d/30d/90d/Tudo (callbacks setDrillCasaQuick/Type/All)

**assets/js/charts/performance.js**
- renderCasa(): reescrita — acumula _casaEnts, _casaDays, _casaAllDays; portfolio KPIs 4 colunas; chama _renderCasaCards()
- _mkCasaCard(): card .tcard com mkHouseChip no header (tcard__casa-hdr)
- _renderCasaCards(): sort por P/L/ROI/Turnover/WR/Volume; event delegation para openCasaDrill
- openCasaDrill/closeCasaDrill: abre popup filtrando DADOS por casa + sp_casas
- renderCasaDrill(): 6 secoes — KPIs, Resultado Geral (chart), Cenario Atual, Analise Mensal, Por Tipster, Por Esporte
- _casaBreakdownTbl(): top 10 por turnover + linha "Outros (N)" com tooltip hover mostrando nomes
- copyCasaDrill/saveCasaDrill: copia/salva PNG do popup
- _getOutrosTip(): singleton div fixo para tooltip "Outros"

**assets/css/components.css**
- .tcard__casa-hdr adicionado: flex container para chip + nome no header do card de casa

### Commits desta sessao
- ae1b280 feat(casas): migra aba Bookies para padrao .tcard + popup drill-down
- b4ca6cc fix(casas): renomeia 'ROI Ponderado' para 'ROI' no strip de KPIs
- 4350302 fix(casas): remove badge 'DRILL-DOWN' do cabecalho do popup

### Notas de design
- Secao Diagnostico de Risco omitida (sem Monte Carlo para casas — decisao intencional)
- "Por Tipster" e "Por Esporte" mostram top 10 por turnover; demais agregados em linha "Outros"
- Sparkline por casa reutiliza _tipSparkSVG (funcao compartilhada)

## Proximo passo
- Testar popup drill-down em producao: verificar chips periodo, tooltip "Outros", copy/save PNG
- Pendentes anteriores:
  1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)
  2. performance.js: tblResCasa

---

## Estado atual: p-value card dinamico + bootstrap-t studentizado — COMPLETO (2026-06-11 sessao 19)

## Sessao 2026-06-11 (sessao 19) — Card p-value dinamico e bootstrap-t

### Mudancas

**assets/js/app.js**
- calcPValue: floor 0.001 removido (retornava valor identico para todos os tipsters com z>=3.5)
- mulberry32: PRNG semeado adicionado (seed derivado de n e sumL, reproduzivel por tipster)
- calcPValueMC v1: bootstrap percentil (reamostragem centrada sob H0: yield=0)
- calcPValueMC v2 (final): bootstrap-t studentizado — compara t*=yield*/se* vs t_obs; corrige
  vies de assimetria em odds altas; calibrado ~5% sob H0; passada unica O(n) com rr/rsa/ssq

**assets/js/charts/performance.js**
- rodapePValue(pv): escala dinamica de 3 niveis (inconclusivo/significativo/robusto) com nivel
  ativo destacado em negrito; usado no bench do tooltip do card p-value
- Card p-value no popup drill-down:
  - display: `< 0,001` quando pv < 0.001; fmt(pv,4) caso contrario
  - data-state: `pos` se pv < 0.05; `proj` (ambar) se pv >= 0.05
  - sub-text: "resultado robusto" / "rejeita o acaso" / "inconclusivo"
  - chamada trocada de calcPValue para calcPValueMC
- calcPValue preservado intacto (em uso em gestao.js)

### Commits desta sessao
- 4f841b0 feat(pvalue): substitui p-value normal por bootstrap (calcPValueMC)
- ce531dd perf(pvalue): troca bootstrap percentil por bootstrap-t studentizado

## Proximo passo
- Mesmos pendentes das sessoes anteriores:
  1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)
  2. performance.js: tblResCasa

---

## Estado atual: seed de custos de contas + calcPValueMC aprimorado — COMPLETO (2026-06-11 sessao 18)

## Sessao 2026-06-11 (sessao 18) — Seed automatico de custos de contas + p-value robusto

### Mudancas

**assets/js/charts/gestao.js**
- Adicionado CUSTO_SEED com valores de referencia do dash_custos_v2
- Se localStorage estiver vazio ou ausente, os valores sao carregados automaticamente e salvos
- Valores: Annderson/JC/Move/P2Pro/Richard nas casas Bet365/Betano/Superbet

**assets/js/app.js**
- calcPValueMC: troca comparacao simples de yield por t-estatistico com bootstrap
- Sims ajustados por faixa: n>10000 usa 3000, n>3000 usa 5000, demais 10000
- Mais robusto para amostras grandes (reduz custo) e pequenas (mantem precisao)

### Commits desta sessao
- c30ea4d feat(custos): seed automatico dos custos de contas se localStorage vazio
- (app.js commitado nesta sessao junto com STATUS.md)

## Proximo passo
- Mesmos pendentes das sessoes anteriores:
  1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (migracao para mkTh)
  2. performance.js: tblResCasa

---

## Estado atual: tabelas do popup padronizadas — COMPLETO (2026-06-11 sessao 17)

## Sessao 2026-06-11 (sessao 17) — Padronizacao das colunas das 3 tabelas do popup drill-down

### Mudancas

**assets/js/charts/performance.js** (_tipBreakdownTbl + renderTipsterDrill)
- Tabelas Por Casa e Por Esporte: ordem de colunas corrigida para Bets / P/L / Turnover / ROI / Win Rate% / Stake Media / Odd Media Pond.
- Stake Media adicionada nas tabelas Por Casa e Por Esporte (calculo: d.s / d.n)
- Odd Media Pond.: largura fixada em width:88px nas 3 tabelas (era livre, ficava desproporcional)
- As 3 tabelas (Mensal, Por Casa, Por Esporte) agora tem estrutura identica de colunas

### Commits desta sessao
- b770621 feat(tooltip): padroniza todos os tooltips de metrica para MetricTooltip (inclui mudancas das tabelas)

## Proximo passo
- performance.js: tblResCasa (tabela Resultados por Casa, ainda com ordem antiga)
- gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT (nao tocadas)

---

## Estado anterior: MetricTooltip padronizado — COMPLETO (2026-06-11 sessao 16)

## Sessao 2026-06-11 (sessao 16) — Padronizacao dos tooltips de metrica

### Mudancas

**assets/css/components.css**
- Removidas .fdc-info e .fdc-tip (padrao antigo)
- Adicionado sistema .metric-tip: .tip-anchor, .metric-info (button), .metric-tip__caret,
  .metric-tip__formula, .metric-tip__desc, .metric-tip__bench com sub-classes .op/.lbl/.thr/.good/.scale
- Superficie var(--elevated) #1A2029 + borda --line + ring azul rgba(46,139,255,.16)

**assets/js/app.js**
- _gTip migrado para classe metric-tip; width de deteccao de borda: 220 -> 286
- Leitura do conteudo via .tip-anchor .metric-tip (irmao, nao filho)
- Caret posicionado dinamicamente; escondido no flip para cima
- Adicionados focusin/focusout (teclado) e keydown (Esc fecha)

**assets/js/charts/performance.js**
- Helper _mkTipAnchor(label, formula, desc, bench) no topo do arquivo
- 6 tooltips existentes: conteudo atualizado para 3 camadas (formula/desc/bench) em PT-BR puro
- 2 tooltips novos: Topo Historico e Drawdown Atual (painel agora consistente — 8 de 8 metricas)

### Commits desta sessao
- b770621 feat(tooltip): padroniza todos os tooltips de metrica para MetricTooltip

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa

---

## Estado anterior: tipografia Variante B — COMPLETO (2026-06-11 sessao 14)

## Sessao 2026-06-11 (sessao 14) — Sistema Tipografico Variante B (mono so nos numeros)

### Mudancas

**performance.js** (_tipMonthTbody + _tipBreakdownTbl)
- Todas as colunas numericas (bets, P/L, Turnover, ROI, WR, Stake, Odd) passaram para class="td-num"
- Bets formatado com toLocaleString('pt-BR') em vez de numero cru

**temporal.js** (renderMensal + renderSemana)
- Removido font-family:'JetBrains Mono' do style inline do table nas tabelas "Dia a Dia"
- Headers (Tipster, nomes de dia) herdam Manrope do body; valores P/L continuam mono via .money

> Nota: components.css e shared.js ja estavam corrigidos na sessao 13 (font-family sans nos .tbl th, gradiente no .wrc .f, class mono no mkWRC). Nao havia diff nesta sessao.

### Commits desta sessao
- (pendente — ver step 4)

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + header das tabelas Por Casa / Por Esporte no popup

---

## Estado anterior: correcao de favicons de casas — COMPLETO (2026-06-11 sessao 13)

## Sessao 2026-06-11 (sessao 13) — Favicons e visuais dos chips de casa

### Mudancas

**Dominios corrigidos** (assets/js/data.js — CASA_ICONS e HOUSE_DOMAIN)
- Liderbet: liderbet.bet.br -> lider.bet.br (dominio errado causava globe icon)
- Donald Bet: donaldbet.bet.br -> donald.bet.br (idem)
- BetMGM: betmgm.com -> betmgm.bet.br
- Tivo: adicionado tivo.bet.br (nao existia, exibia "T" fallback)

**Correcoes visuais por chip** (assets/css/components.css)
- Novibet, PixBet, Esportiva: transform:scale(1.3) — zoom corta margem transparente do S2
- KTO, BetMGM: filter brightness(1.8) sem contrast(0.5) — logos nao mais apagados
- BETesporte: invert(1) + mix-blend-mode:screen no dark mode — fundo branco desaparece

### Commits desta sessao
- b0b895d fix(chips): corrige favicons e visuais de casas

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: ajustes visuais no header do popup drill-down — COMPLETO (2026-06-11 sessao 12)

## Sessao 2026-06-11 (sessao 12) — Polimento do header do popup + titulos de secao

### Mudancas

**Header do popup drill-down** (assets/js/app.js)
- Gap logo+divider+tipster reduzido de 8px para 4px (tipster mais proximo do logo)
- Nome do tipster: 24->28px (+15%)
- Logo: 78->70px (-10%)

**Titulos de secao** (assets/js/charts/performance.js)
- Removido border-left:3px solid var(--d-info) de "Cenario Atual" e "Diagnostico de Risco"
- Agora consistentes com "Resultado Geral" e "Analise Mensal" (sem barra lateral)

**Tooltip** (assets/css/components.css + assets/js/app.js)
- Largura aumentada de 200px para 220px
- Posicionamento vertical dinamico via offsetHeight (era estimativa fixa de 130px)

### Commits desta sessao
- 2e5a542 style(drill): reduz gap logo+divider+tipster de 8px para 4px
- 8605346 fix(drill): remove border-left dos titulos Cenario Atual e Diagnostico de Risco
- 46942ff fix(tooltip): caixa visual + posicionamento por altura real

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: tooltips ⓘ do popup corrigidos — COMPLETO (2026-06-11 sessao 11)

## Sessao 2026-06-11 (sessao 11) — Fix definitivo dos tooltips explicativos do popup

### Problema
Tooltips ⓘ (Max Drawdown, Recovery Factor, p-value, DD Medio, DD Maximo, Nivel de Solidez) pararam
de aparecer apos a sessao 9. Causa: .fdc-tip com position:fixed estava dentro de .analise-popup-section
que tem backdrop-filter:blur(8px). backdrop-filter cria um novo containing block, fazendo o fixed
ser posicionado relativo ao container em vez do viewport — tooltip aparecia fora da area visivel.

### Solucao (assets/js/app.js)
- Criado _gTip: elemento div global appendado ao body (fora de qualquer stacking context)
- mouseover: copia innerHTML do .fdc-tip fonte para _gTip e o posiciona via getBoundingClientRect
- mouseout: simplificado — pointer-events:none no _gTip garante que o evento sempre dispara limpo
- Nenhuma mudanca em performance.js, components.css ou index.html

### Commits desta sessao
- fd34ad0 style(drill): logo -10% (78->70px), tipster name +10% (22->24px) [incluiu tooltip fix]

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: pill do tipster redesenhado — COMPLETO (2026-06-11 sessao 10)

## Sessao 2026-06-11 (sessao 10) — Cabecalho do popup drill-down: pill integrado ao logo

### Mudancas (assets/js/app.js)
- Pill azul com borda substituido por layout integrado: logo | divisor | eyebrow "TIPSTER" + nome
- Divisor: linha vertical 1px `--line`, 32px de altura
- Eyebrow: JetBrains Mono 9px uppercase letter-spacing 0.18em `--ink-mute`
- Nome do tipster: 24px bold `--text1` (era 22px `--accent` dentro de pill)
- Logo: reducao de 78 para 70px (-10%)
- ID `#tipsterDrillName` preservado, performance.js sem alteracao de logica

### Commits desta sessao
- c510324 feat(drill): integra nome do tipster ao header — logo | TIPSTER eyebrow + nome
- fd34ad0 style(drill): logo -10% (78->70px), tipster name +10% (22->24px)

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: tooltips fixed + greyscale nos filtros — COMPLETO (2026-06-11 sessao 9)

## Sessao 2026-06-11 (sessao 9) — Correccoes visuais de filtros e tooltips

### Mudancas

**Greyscale nos dropdowns de filtro** (assets/js/filters.js + assets/css/components.css)
- Emojis de esporte nos dropdowns agora envolvidos em `<span class="sport-emoji">` para herdar filter:grayscale(1)
- Logos de casas nos dropdowns: regra `.ms-opt img { filter: grayscale(1) contrast(0.5) brightness(1.25) }`

**Tooltips explicativos do popup** (assets/css/components.css + assets/js/app.js + assets/js/charts/performance.js)
- .fdc-tip migrado de position:absolute para position:fixed
- Posicionamento via JS (getBoundingClientRect) com deteccao de borda do viewport
- z-index elevado de 70 para 9999
- Tooltip adicionado ao "Nivel de Solidez"
- Removida classe .fdc-info--flip (nao mais necessaria)
- Removido overflow:hidden do kS dos cards .kpi no popup (era a raiz do primeiro clipping)

### Commits desta sessao
- 52c912a fix(filtros): greyscale em emojis e logos nos dropdowns multiselect
- b6bf1e3 fix(popup): corrige clipping dos tooltips + tooltip Nivel de Solidez
- 49347a5 fix(tooltip): position:fixed + JS para escapar overflow contexts

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: limpeza da aba Tipsters — COMPLETO (2026-06-11 sessao 7)

## Sessao 2026-06-11 (sessao 7) — Remocao de cards e fix de sort

### Mudancas (assets/js/app.js + assets/js/charts/performance.js)
- Removidos 4 cards da aba Tipsters: tipster_lines (P/L Acumulado), tipster_results (Resultados por Tipster), tipster_casa (Tipsters por Casa), tipster_month (Analise Mensal)
- Removido codigo de render correspondente em renderTipsters(): grafico chartTipsterLines, grafico chartTipsterResults, tabela tipsterCasaTable, tabela tipsterMonthTable
- Mantidos: cards tipster_kpi (Visao Geral com sort) e tipster_comp (Comparativo Geral)
- Fix: tipsterSortBy — dir=1 ao clicar novo criterio (era -1), garante ordenacao melhor para pior por padrao

### Commits desta sessao
- 978d4d7 chore(drill): remove cards redundantes da aba tipsters + fix sort dir

## Proximo passo
Migrar tabelas restantes para mkTh:
1. gestao.js: tblCost, tblForn, tblCross, tblCG, tblCT
2. performance.js: tblResCasa + tabelas do popup drill-down tipster

---

## Estado anterior: novo header do popup de tipsters — COMPLETO (2026-06-11 sessao 6)

## Sessao 2026-06-11 (sessao 6) — Header do popup redesenhado

### Mudancas (assets/js/app.js + assets/js/charts/performance.js)
- Header do popup drill-down: logo horizontal dark 98->78px (reducao 20%)
- Nome do tipster: span .nametag substituido por pill com borda azul (--accent 1.5px), border-radius 10px, padding 8x22px, font-weight 800
- Layout: logo (esquerda) | flex spacer | pill nome (direita) | botoes acao
- ID #tipsterDrillName preservado — performance.js sem mudancas de logica
- Classe .drill-brand-logo preservada — _buildDrillCanvas funciona sem alteracao

### Commits desta sessao
- d3edcbd feat(drill): novo header do popup — logo 78px + pill azul para nome do tipster

---

## Estado anterior: secao de risco no popup do tipster — COMPLETO (2026-06-11 sessao 5)

## Sessao 2026-06-11 (sessao 5) — Motor de calculo + wiring do popup de risco

### Funcoes adicionadas (assets/js/app.js)
- calcMCdrawdown(rows, sims=5000): Monte Carlo de drawdown maximo — retorna {xmdd, p50, p95, p99}
- calcRecoveryFactor(rows): Lucro / MDD realizado
- calcTopoDrawdown(rows): topo historico, data, drawdown atual e % do topo
- calcSolidez(o): score 0-1 + faixa textual com base em pValue/profitXmdd/nApostas/oddMedia

### Wiring no popup (assets/js/charts/performance.js)
- "Sequencias & Topo Historico" substituida por duas .analise-popup-section:
  1. Cenario Atual (barra --d-info): Topo Historico (pos) / Drawdown Atual (real) / Max Drawdown (real + tooltip) / Recovery Factor (info + tooltip)
  2. Diagnostico de Risco (barra --d-info, subtitulo "Monte Carlo 10.000 simulacoes"): p-value (pos) / DD Medio XMDD (proj) / DD Maximo P99 (proj, P95 no tooltip) / Nivel de Solidez (.fdc-risk-meter)
- Monte Carlo elevado de 5k para 10k sims (Arrudex com 2102 apostas: <1s)
- Usa tokens --d-* e componentes .fdc-kpi__value/.fdc-risk-meter ja existentes

### Commits desta sessao
- fe90598 feat(calc): calcMCdrawdown, calcRecoveryFactor, calcTopoDrawdown, calcSolidez
- 907270d feat(drill): secao de risco no popup — Cenario Atual + Diagnostico de Risco
- 69d1102 perf(drill): eleva Monte Carlo de 5.000 para 10.000 simulacoes

---

## Estado anterior: camada diagnostica --d-* + componentes CSS (2026-06-10 sessao 4)

## Sessao 2026-06-10 (sessao 4) — Tokens diagnosticos e componentes visuais

### Tokens adicionados (assets/css/tokens.css)
- 11 tokens --d-*: --d-pos/#4FC79A --d-neg/#E5524B --d-proj/#D6A45A --d-info/#4DA3FF
- Strong/soft variants: --d-pos-strong --d-proj-strong --d-pos-soft --d-neg-soft --d-proj-soft --d-info-soft
- --risk-grad: gradiente linear vermelho->ambar->mint para barras de risco
- Skin [data-skin="navy"] definido mas NAO aplicado (superficies Deep Navy para uso futuro)
- Pack espelhado: tokens.css/json/scss/tailwind.tokens.js/palette.csv todos atualizados

### Componentes adicionados (assets/css/components.css)
- .fdc-risk-meter + __tag + __track + __knob: trilho de gradiente com knob via --value CSS custom prop
- .fdc-kpi__value[data-state]: 4 estados semanticos (pos/real/proj/info)
- .fdc-info + .fdc-tip: icone de ajuda com tooltip puro CSS no hover

### Regra semantica documentada (CLAUDE.md + pack/CLAUDE.md)
- Vermelho (--d-neg) = perda REALIZADA (fato). Ambar (--d-proj) = perda PROJETADA (estatistica).
- Mint (--d-pos) = edge/significancia. Azul (--d-info) = metrica de qualidade.

---

## Estado anterior: popup drill-down tipster — layout em cards + legenda + KPI ajustados (2026-06-10 sessao 3)

## Sessao 2026-06-10 (sessao 3) — Cards no popup + legenda manual + font-size KPIs

### Correcoes visuais no popup drill-down
- Secoes do popup viram cards visuais: background var(--bg3) + border + border-radius + backdrop-filter
  - #tipsterDrillBody ganhou padding:1rem 1.5rem + flex-direction:column + gap:12px
  - .analise-popup-section: removidos padding antigo e border-bottom; agora e card standalone
- KPI cards (5 colunas): font-size reduzido 22px->18px->16px (valor P/L nao transborda mais)
- Legenda do grafico "Resultado Geral": removida do canvas Chart.js (display:false)
  - Substituida por HTML manual (row de spans) posicionado diretamente abaixo do titulo da secao
  - Alinhamento esquerda, mesmo estilo mono muted das legendas do dashboard
- Nome do tipster no cabecario do popup: color var(--ink) -> var(--accent) (azul FDC #2E8BFF)

### Commits desta sessao
- f368c46 fix(drill): corrige overflow dos KPI cards + secoes em card boxes + legenda abaixo do grafico
- 6a2d986 test(drill): nome do tipster em azul FDC (--accent) no cabecario do popup
- fa35d4f fix(drill): legenda manual abaixo do titulo Resultado Geral (fora do canvas)
- 14d2e51 fix(drill): reduz font-size dos KPI cards de 18px para 16px

---

## Sessao 2026-06-10 (tarde) — Polimento visual + favicons PNG + fix botao copiar

### Ajustes visuais
- Header popup: logo 123->98px, tipster 30->24px (reducao de 20%)
- KPI grid (5 cards): min-width:0 + overflow:hidden em cada card; width:100% no container
- Legenda dos graficos (bankroll e drill): position bottom->top, align start (visivel acima do grafico)

### Favicons de casa no PNG
- mkHouseChip: adicionado data-casa ao span para preservar nome mesmo apos onerror remover o img
- _buildDrillCanvas: fetch no-cors -> blob URL same-origin substitui a substituicao por inicial fixa
  - Se onerror ja removeu o img: recriar img temporario com blobUrl usando data-casa
  - Se fetch falhar (rede): fallback para chip-initial (comportamento anterior)
  - _restore(): revoga blob URLs apos captura (sem vazamento de memoria)

### Fix botao copiar (1o clique sempre falhava)
- Causa: html2canvas carregado via CDN com defer; guarda typeof===undefined retornava silenciosamente
- Solucao: _waitH2C() faz polling ate 8s; botao mostra "..." durante espera; funciona no 1o clique

---

## Sessao 2026-06-10 (manha) — Popup drill-down: captura PNG + layout

### Correcoes de captura (html2canvas)
- Favicons de casa (Google S2) falham CORS em html2canvas; substituidos por letra inicial (.chip-initial) durante captura e restaurados depois
- Emojis de esporte: CSS filter nao e suportado em html2canvas; convertidos para data URL grayscale via canvas pixel manipulation antes da captura (_emojiToGrayDataUrl helper)
- _buildDrillCanvas refatorado: removido bloco fetch/blob URL de houseImgs; adicionado _houseRestoreData e _spRestoreData com restore limpo

### Ajustes de layout do cabecario
- Logo: height 48 -> 82 -> 123px
- Nome do tipster: font-size 15 -> 20 -> 30px

### KPI cards (5 cards)
- "Odd Media Pond." -> "Odd Media" (label unica linha, simetria visual)
- Card Win Rate: barra azul (--accent-2) adicionada apos o valor (altura 5px, border-radius 3px)

---

## Estado anterior: refactor visual de tabelas em andamento (2026-06-09)

## Sessao 2026-06-09 (tarde) — mkTh + alinhamento de tabelas
- Removidos accent borders de .kpi e .card hover (layout.css)
- .kpi-pipe corrigido: flexbox no container, barra 4px sem float (components.css)
- Todos os titulos azuis de secao: uppercase + letter-spacing leve (components.css, app.js)
- mkTh() helper adicionado em shared.js; classes th-l/th-c/th-r/th-k/th-u em components.css
- sortTable em app.js corrigido: usa classList para nao apagar classes de alinhamento
- buildSummaryTable (shared.js) migrada para mkTh — cobre Esportes + Casas
- temporal.js: 4 tabelas migradas (tblConsAnual, tblMensalTip, tblDiarioTip, tblSemanaTip)

## T-6 FECHADO + refactor de export concluido (2026-06-09)

## T-6.5+ — Ajustes pos-fechamento (feito, 2026-06-09)
- Cards Sequencias redesenhados: kpi-pipe no label (sem cor especial), footer 2-col justify-content:space-between
- Cabecario reformulado (modelo topbar): logo 28px, botao Tipsters pill steel, nome 22px bold, badge DRILL-DOWN, linha meta
- window._dataLoadMs armazenado em loadData para calcular tempo relativo
- #tipsterDrillMeta populado em openTipsterDrill (performance.js)

## T-6.5 — Fechamento do drill-down (feito, 2026-06-09)
- Grafico: substituido P/L Acumulado por clone do "Resultado Geral" (linha + area + barras dia+/dia-, eixo duplo), height 220px
- Painel Sequencias & Topo Historico: novo painel, logica identica ao renderOvStreaks, scoped a drillRows
- Tabelas: classe .drill-tbl aplicada nas 3 tabelas
- Export PNG: favicons via fetch+createObjectURL; grayscale inline em .sp-chip; _restore() centraliza cleanup

## Mapa de arquitetura (aba Tipsters)
- Cards: renderTipsters em performance.js (_mkTipCard / _renderTipCards)
- Shell da aba: app.js buildHTML() (~linhas 465-470)
- CSS: assets/css/components.css (cards/KPIs) + layout.css (grid); variaveis em tokens.css
- Pagina viva = index.html; dashboard.html e legado, NAO editar
- Helpers: fmtPL, fmtR, fmt, fmtK, calcROI, calcWR, calcAvgOdd, calcMDDreais, calcMDDpct
- IMPORTANTE: "T-1..T-6" e o track da aba Tipsters. NAO confundir com as etapas do guia geral.
