# STATUS — Betting Dashboard

## Estado atual: correcao de favicons de casas — COMPLETO (2026-06-11 sessao 13)

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
