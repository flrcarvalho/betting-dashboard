# STATUS — Aba Tipsters

## Feito e verificado (commit 7124328 — etapas T-1 a T-4; T-5 pendente verificação no navegador)
- Card .tcard com .nametag steel (nome completo, sem avatar colorido)
- P/L hero + badge ROI ao lado; rodapé 4 colunas: Turnover · Stake Média · Odd Média (Ponderada) · Win Rate com mini-barra
- Grid responsivo 3/2/1 colunas
- Sparkline SVG real via _tipSparkSVG (acumulação diária de P/L) — VERIFICADA no navegador (JDF cai, Arrudex sobe)
- Ordenação segmentada P/L·ROI·Turnover·WR·Volume + inverter, estado persistido
- T-5: 4 KPIs agregados da carteira no topo da aba (P/L Carteira com sparkline + destaque azul, ROI Ponderado, Tipsters Positivos, Turnover Total) — reagem aos filtros, computed em renderTipsters()

## Falta
- T-6.4: export (opcional)

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
