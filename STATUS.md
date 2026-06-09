# STATUS — Aba Tipsters

## Estado atual: T-6.5 CONCLUÍDO. T-6 FECHADO.

## Próximo passo
Abrir index.html no navegador e verificar T-6.5:
1. Gráfico "Resultado Geral" no popup: linha azul acumulada + área + barras dia+/dia− + eixo duplo
2. KPIs do topo (P/L · ROI · Turnover · Win Rate): subtítulos alinhados na mesma linha de base
3. Painel "Sequências & Topo Histórico": 4 KPIs igual ao da Visão Geral, scoped ao tipster
4. Tabelas (Análise Mensal, Por Casa, Por Esporte): headers centrados, números à direita
5. Header: logo 50% maior (height 33, opacity 1), nome do tipster dentro da .nametag
6. Export PNG: favicons de casa aparecem (blob URLs), sp-chips em grayscale

## T-6.5 — Fechamento do drill-down (feito, 2026-06-09)
- Gráfico: substituído P/L Acumulado (linha simples) por clone exato do "Resultado Geral" (linha + área + barras dia+/dia− + eixo duplo), height 220px
- KPIs simetria: todos os 4 com `display:flex;flex-direction:column` + subtítulo `margin-top:auto` (pinado na base); Turnover: fmtK → fmtR (HTML consistente)
- Painel Sequências & Topo Histórico: novo painel no popup, lógica idêntica ao renderOvStreaks, scoped a drillRows
- Tabelas: classe `.drill-tbl` em components.css (`.drill-tbl .tbl th { text-align:center }` + `td:not(:first-child) { text-align:right }`); aplicada nas 3 tabelas do popup
- Header — logo: height 22→33, opacity .9→1 (50% maior e nítido)
- Header — nome: `id="tipsterDrillName"` agora dentro de `.nametag > .nametag__nm` (box steel igual aos cards)
- Export PNG: removido `allowTaint:true` (conflitava com useCORS); favicons de casa convertidos para blob URLs (fetch → createObjectURL) antes do html2canvas; filtro grayscale(1) aplicado inline em `.sp-chip` antes da captura e removido depois; função `_restore()` centraliza cleanup

## T-6 COMPLETO — todas as etapas concluídas

## T-6.4 — Ajustes finais + logo + export imagem (feito)
- Removido gráfico "Resultados" (barras W/HW/HL/L/V) do popup — canvas tipsterDrillBar eliminado
- Turnover KPI: fmtR(s) → fmtK(s) — remove tamanho 0.76em do "R$", deixa todos os 4 KPIs visuamente iguais
- P/L Acumulado: degradê azul sob a linha (createLinearGradient rgba(46,139,255,.16)→0, fill:true) — igual ao Resultado Geral
- Breakdown Por Esporte: sportEmoji() → mkSpChip() — emoji em grayscale, padrão de marca
- Logo FDC horizontal dark (brand/fdc-logo-horizontal-dark.svg) no header do popup; SVG pré-convertido a data URL antes do html2canvas
- Botão ⎘ "Copiar como imagem": html2canvas scale:2, ignoreElements com .no-export (botão ✕, botão ⎘, barra de chips); fallback download PNG; feedback ✓/⬇
- html2canvas 1.4.1 via CDN adicionado ao index.html
- .no-export aplicado: botão ✕, botão ⎘, #tipsterDrillPeriodBar

## T-6.3 — Filtro de período + ajuste de posição do popup (feito)
- Posição: `.analise-popup-overlay` mudou `align-items: flex-start` → `center` (components.css); scrollTop=0 ao abrir
- Barra de chips no modal: Hoje · WTD · MTD · YTD · 7d · 30d · 90d · Tudo (`#tipsterDrillPeriodBar` em app.js), reutiliza `.qbtn`
- Base do popup = todas as apostas do tipster respeitando esporte/casa, mas SEM herdar data global
- Refactor: `renderTipsterDrill(rows)` — função única que redesenha KPIs + charts + tabelas a partir das rows recebidas
- `_sliceDrillRows()` aplica período sobre `_drillBaseRows`; `_updateDrillChips()` atualiza ativo visualmente
- `window.setDrillQuick(days)`, `window.setDrillType(qt)`, `window.setDrillAll()` — callbacks dos chips
- `openTipsterDrill` refatorada: computa base sem data, reseta período para Tudo, chama `renderTipsterDrill`

## T-6.2 — Conteúdo do popup (feito, commit 2483c76)
- Fix de posicionamento: overlay flex + modal max-height:85vh + overflow-y:auto (scroll interno)
- KPIs: P/L · ROI · Turnover · Win Rate no topo do popup
- Gráfico de linha P/L acumulado (tipsterDrillLine) renderizado APÓS overlay.display='flex'
- Gráfico de barras de resultados W/HW/HL/L/V (tipsterDrillBar)
- Análise Mensal: _tipMonthTbody(rows) — helper reaproveitado em renderTipsters() e no popup
- Breakdown Por Casa (_tipBreakdownTbl + casaCell) e Por Esporte (sportEmoji)

## T-6.1 — Casca do popup (feito)
- `#tipsterDrillOverlay` / `#tipsterDrillModal` injetados em `buildHTML()` (app.js)
- Reaproveita 100% classes `.analise-popup-*` já existentes em components.css — zero CSS novo
- `openTipsterDrill(nome)` / `closeTipsterDrill()` em performance.js
- 3 formas de fechar: botão ✕, clique no overlay, tecla Esc (listener sem acúmulo)
- `.tcard` ganhou `cursor: pointer`; `data-name` em cada card; event delegation em `#tipsterKpiCards`
- `drillRows` calculado e exibido no placeholder (contagem de apostas no período)

## Mapa de arquitetura (aba Tipsters)
- Cards: renderTipsters em performance.js (_mkTipCard / _renderTipCards)
- Shell da aba: app.js buildHTML() (~linhas 465-473)
- CSS: assets/css/components.css (cards/KPIs) + layout.css (grid); variáveis em tokens.css
- Página viva = index.html; dashboard.html é legado, NÃO editar
- Sparkline = acumulação diária do chartTipsterLines (performance.js:106-112)
- Helpers: fmtPL, fmtR, fmt, fmtK, calcROI, calcWR, calcAvgOdd, calcMDDreais, calcMDDpct
- IMPORTANTE: "T-1..T-6" é o track da aba Tipsters (origem Claude Design). NÃO confundir com as etapas numeradas do guia geral "FDC - Guia de Implementacao (Claude Code).md" — a Etapa 5 daquele guia é "Tabelas", sem relação.
