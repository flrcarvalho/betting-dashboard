# STATUS — Aba Tipsters

## Feito e verificado (commit 7124328 — etapas T-1 a T-4; T-5 pendente verificação no navegador)
- Card .tcard com .nametag steel (nome completo, sem avatar colorido)
- P/L hero + badge ROI ao lado; rodapé 4 colunas: Turnover · Stake Média · Odd Média (Ponderada) · Win Rate com mini-barra
- Grid responsivo 3/2/1 colunas
- Sparkline SVG real via _tipSparkSVG (acumulação diária de P/L) — VERIFICADA no navegador (JDF cai, Arrudex sobe)
- Ordenação segmentada P/L·ROI·Turnover·WR·Volume + inverter, estado persistido
- T-5: 4 KPIs agregados da carteira no topo da aba (P/L Carteira com sparkline + destaque azul, ROI Ponderado, Tipsters Positivos, Turnover Total) — reagem aos filtros, computed em renderTipsters()

## Falta
- T-6: drill-down individual do tipster

## Mapa de arquitetura (aba Tipsters)
- Cards: renderTipsters em performance.js (_mkTipCard / _renderTipCards)
- Shell da aba: app.js buildHTML() (~linhas 465-473)
- CSS: assets/css/components.css (cards/KPIs) + layout.css (grid); variáveis em tokens.css
- Página viva = index.html; dashboard.html é legado, NÃO editar
- Sparkline = acumulação diária do chartTipsterLines (performance.js:106-112)
- Helpers: fmtPL, fmtR, fmt, fmtK, calcROI, calcWR, calcAvgOdd, calcMDDreais, calcMDDpct
- IMPORTANTE: "T-1..T-6" é o track da aba Tipsters (origem Claude Design). NÃO confundir com as etapas numeradas do guia geral "FDC - Guia de Implementacao (Claude Code).md" — a Etapa 5 daquele guia é "Tabelas", sem relação.
