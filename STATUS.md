# STATUS — Aba Tipsters

## Estado atual: T-6 FECHADO. Próxima sessão: verificar no navegador.

## Próximo passo
Abrir index.html no navegador (versão publicada) e verificar:
1. Cabeçalho: logo 28px, botão `‹ Tipsters`, nome 22px bold, badge DRILL-DOWN, linha meta
2. Linha meta: "N apostas · jan-jun 2026 · atualizado há X min"
3. Gráfico "Resultado Geral": linha acumulada + área + barras dia+/dia− + eixo duplo
4. KPIs topo: subtítulos alinhados na mesma linha de base
5. Painel Sequências: 4 cards assimétricos (kpi-pipe + footer 2-col)
6. Tabelas: headers centrados, números à direita
7. Export PNG: favicons aparecem, sp-chips em grayscale

## T-6.5+ — Ajustes pós-fechamento (feito, 2026-06-09)
- Cards Sequências redesenhados: kpi-pipe no label (sem cor especial), footer 2-col justify-content:space-between
  - Streaks (dias): font-size var(--text-xl) 22px — menor que valores monetários (assimetria visual)
  - Footer streaks: "melhor/pior: N dias" + P/L do período
  - Footer Topo: data + badge "pico" verde
  - Footer Distância: "do pico · data" + percentual abaixo do pico
  - Título da seção com border-left: 3px azul (pipe visual)
- Cabeçalho reformulado (modelo topbar):
  - Logo: height 66→28px (mesmo tamanho do topbar)
  - Botão `‹ Tipsters`: pill steel, substitui ✕ como fechamento principal
  - Nome: texto 22px bold direto (sem .nametag box)
  - Badge DRILL-DOWN: pill com borda azul + texto mono caps
  - Linha meta: N apostas · range de meses · "atualizado há X min"
  - `window._dataLoadMs` armazenado em loadData para calcular tempo relativo
  - `#tipsterDrillMeta` populado em openTipsterDrill (performance.js)

## T-6.5 — Fechamento do drill-down (feito, 2026-06-09)
- Gráfico: substituído P/L Acumulado (linha simples) por clone do "Resultado Geral" (linha + área + barras dia+/dia− + eixo duplo), height 220px
- KPIs simetria: todos os 4 com flex-column + subtítulo margin-top:auto; Turnover: fmtK → fmtR
- Painel Sequências & Topo Histórico: novo painel, lógica idêntica ao renderOvStreaks, scoped a drillRows
- Tabelas: classe .drill-tbl (th centrado + td:not(:first-child) direita); aplicada nas 3 tabelas
- Export PNG: removido allowTaint; favicons via fetch+createObjectURL; grayscale inline em .sp-chip; _restore() centraliza cleanup
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
