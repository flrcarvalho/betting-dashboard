# STATUS — Betting Dashboard

## Estado atual: fix da atualizacao de dados (botao Atualizar ao vivo) + cache-busting + builtAt na sidebar - COMPLETO (2026-06-26 sessao 45)

## Sessao 2026-06-26 (sessao 45) - Frescura de dados (botao Atualizar, cache-busting, builtAt)

### Contexto
Fernando adicionou apostas novas e elas nao apareciam no dashboard, mesmo clicando em "Atualizar dados". Sintoma surgiu apos a migracao para o Apps Script v6 (cache no Drive) da sessao 43.

### Diagnostico (com teste direto na URL)
- O doGet v6 normal devolve o cache do Drive. O botao "Atualizar dados" chamava loadData() com fetch sem parametro, ou seja, so re-lia o cache velho. As apostas novas so entrariam quando o gatilho rebuildCache rodasse.
- Teste direto na URL: GET normal e GET ?refresh=1 (98s, leitura ao vivo) devolveram os mesmos 25698 registros, ja com as apostas de hoje (06-26, 14 linhas). Ou seja, o backend estava correto; o que faltava era o botao forcar a leitura ao vivo e o navegador estar com JS/IndexedDB velho.

### O que foi feito
1. fix(refresh) commit 7decc5b: loadData(force). Quando force, anexa ?refresh=1 a URL (reconstrucao ao vivo). Botao "Atualizar dados" e botao de retry do banner passaram a chamar loadData(true). Boot e revalidacao em 2o plano seguem no cache rapido.
2. feat(frescura) commit b041497:
   - Cache-busting: ?v=2 nos 3 CSS e 9 JS locais do index.html. Edicoes de codigo passam a carregar sem depender de hard reload. Bumpar o N a cada edicao.
   - Sidebar mostra o builtAt do servidor: loadData captura json.builtAt (quando o servidor reconstruiu o cache) em window._dataBuiltMs, persistido no IndexedDB. _setLastUpdate exibe "dados de DD/MM HH:MM" em vez da hora do fetch. Se o gatilho travar, o horario fica visivelmente velho. _dataLoadMs (hora do fetch) intacto, ainda usado no #tipsterDrillMeta.

### Validacao
- node --check ok em app.js. Teste real da URL confirmou ?refresh=1 funcionando (98s) e apostas de hoje presentes.
- Fernando confirmou: apos Ctrl+Shift+R as apostas novas apareceram.
- Decisao: NAO usar LockService no Code.gs. A corrida entre gatilho e refresh manual e inofensiva (setContent atomico, payload completo dos dois lados) e o lock so adicionaria modo de falha.

### Pendente (lado do Fernando, fora do codigo)
- Conferir no editor do Apps Script, em Acionadores, se existe o rebuildCache por tempo (30 min). Agora da pra monitorar pela sidebar: se "dados de ..." nunca avancar sozinho, o gatilho nao esta ativo.
- Corrigir na planilha a aposta com data 2026-06-27 (provavel typo, aparece como aposta futura).

## Proximo passo
- Validar o gatilho rebuildCache nos Acionadores e corrigir a data 06-27 na planilha.

## Estado anterior: secao Resultados consolidada (5 abas viraram 1) + fix do bug de title - COMPLETO (2026-06-26 sessao 44)

## Sessao 2026-06-26 (sessao 44) - Consolidacao da secao Resultados + fix de bug

### Contexto
Fernando nao usava as abas Consolidado, Mensal, Diario, Semana e Por Casa (fase 1 do projeto) e pediu auditoria. Conclusao: Por Casa duplica a aba Bookies; as outras tres sao a mesma visao em zooms diferentes; o unico recurso exclusivo e a matriz tipster x tempo. Decisao do Fernando: opcao A (consolidar tudo em uma aba) + opcao C (trazer analises que nao existiam).

### Bug encontrado
As celulas da matriz Evolucao Mensal apareciam com texto sobreposto e ">" vazando. Causa: fmtPL() devolve HTML com aspas (class="money...") e estava dentro de title="". A aspa fechava o atributo no meio. O mesmo bug existia no heatmap da Overview (overview.js).

### O que foi feito (commit d9e078f)
1. Nova aba unica "Resultados" (temporal.js reescrito como renderResultados).
   - KPIs do periodo, Matriz tipster x tempo com seletor Ano/Mes/Semana (hero), grafico Resultado Geral, Calendario navegavel.
   - 3 analises novas: Desempenho por Dia da Semana; Contribuicao & Consistencia (Peso no P/L que soma 100%, Volatilidade = desvio dos P/L mensais, Forma 30d, Melhor/Pior mes); Correlacao entre tipsters (top 8 por turnover, Pearson do P/L mensal).
   - Bug do title corrigido: helper _txtPL(v) gera texto puro para tooltips.
2. Removido todo o legado (frontend + logica): renderConsolidado/Mensal/Diario/Semana/ResultadosCasa, os window.* de navegacao, helpers (getAvailableMonths/Weeks etc.), blocos de pagina, PAGE_META, roteamento e msInit. A aba daily oculta tambem saiu.
3. overview.js: mesmo bug de title corrigido no heatmap.
4. Nav: grupo Resultados agora com 1 item (Resultados). Code.gs nao foi tocado (serve dados genericos, sem logica por pagina).
5. CLAUDE.md atualizado (tabela de views, arquivos, regra anti-regressao: fmtPL/fmtR nunca dentro de title="").

### Validacao
- node --check ok nos 4 arquivos JS.
- Smoke test com dados sinteticos: renderiza nos 3 modos da matriz, navegacao e sort ok, e confirma ausencia de HTML dentro de title=. Passou.
- Backup dos originais em Backups/resultados-merge-<timestamp>/.
- Falta o render visual no browser (a pagina puxa dados do Apps Script remoto).

### Pendente
- Conferir no browser apos o deploy: a aba Resultados renderizando, os 3 modos da matriz, o calendario e os 3 paineis novos.
- Avaliar o nome do item de nav (hoje grupo "Resultados" com item "Resultados", leve eco). Alternativa: "Matriz & Analises" ou mover para o grupo Analise.
- (herdado) Estender o worker do Monte Carlo para Metricas e drill de tipster, ou fazer gzip do Apps Script.
- (herdado) Card Max Drawdown nos drills ainda usa "pior real" sem periodo pico-vale.

## Proximo passo
- Validar a aba Resultados no browser apos o deploy do GitHub Pages.

## Estado anterior: aba Metricas reconstruida e performance (cache local, Web Worker, Apps Script v6) - COMPLETO (2026-06-25 sessao 43)

## Sessao 2026-06-25 (sessao 43) — Performance: abertura e navegacao

### Contexto
Fernando reportou lentidao para abrir o dashboard e para navegar entre abas, pior ao voltar para a Visao Geral. Dois gargalos confirmados por medicao.

### Diagnostico
- Abertura: fetch do Apps Script levava 137-212s por requisicao. Causa: recalculo das formulas da planilha a cada doGet (nao era cold start; a 2a chamada veio mais lenta). Payload de 7,9 MB. A medicao mostrou tambem que servir 8 MB pelo ContentService e um piso lento por si so (cache no servidor sozinho cai apenas para ~137s).
- Navegacao: Monte Carlo (calcMCdrawdown + calcPValueMC, 10.000 sims cada) rodava sincrono na thread principal sobre ~25.430 apostas, sem cache. ~508M iteracoes por render. Dispara em Visao Geral (boot e todo filtro), Metricas e drill de tipster.

### O que foi feito (commit 6318629)
1. Apps Script v6 (Code.gs, novo no repo como referencia)
   - doGet serve JSON pre-construido de um arquivo no Drive (betting-dashboard-cache.json). rebuildCache() roda o getData() pesado e grava o cache. Gatilho de tempo (a cada 1h) chama rebuildCache em 2o plano. ?refresh=1 forca reconstrucao. getData() intacto, nenhuma coluna cortada.
   - Ja colado, autorizado e implantado pelo Fernando (nova versao, mesma URL). Endpoint passou a servir do cache (builtAt presente na resposta).
2. Cache local IndexedDB (app.js, loadData)
   - stale-while-revalidate: boot instantaneo com o ultimo dado salvo + revalidacao em 2o plano. IndexedDB porque 8 MB excede o localStorage (~5 MB). 3 casos: 1a carga com cache, 1a carga sem cache (loader original), refresh manual (DOM ja montado, feedback "atualizando...").
3. Memoizacao do Monte Carlo (app.js)
   - calcMCdrawdown/calcPValueMC viraram wrappers com cache (_mcCache/_pvCache) por assinatura de rows (_rowsSig: n + somas de P/L, stake e |P/L|). Corpos renomeados para _calcMCdrawdownRaw/_calcPValueMCraw. Voltar a aba com mesmo filtro reusa o resultado.
4. Web Worker do Monte Carlo (app.js + overview.js)
   - mcComputeAsync: worker gerado das proprias funcoes via toString() (numero identico ao sincrono). Alimenta o mesmo cache da memoizacao. Fallback sincrono adiado se Worker indisponivel (ex.: file://).
   - renderOvRisco assincrono: o painel pinta na hora com spinner "calculando..." nos 4 cards de risco; os valores entram quando o worker responde. Guarda de corrida (_ovRiscoReq) descarta resultado obsoleto.

### Validacao
- Sintaxe ok (node --check) em app.js e overview.js.
- Medicao do endpoint apos v6: 200 OK, count 25430, builtAt presente (cache servido).
- Site hospedado em http/https (worker funciona 100%). Commit pushado para main; deploy via GitHub Pages.

### Pendente
- Aplicar o padrao worker (mcComputeAsync) tambem em Metricas (gestao.js renderMetrics) e no drill de tipster (performance.js, linha ~926). Hoje ainda calculam sincrono no 1o acesso, mas ficam instantaneos na repeticao pela memoizacao (cache compartilhado com a Visao Geral).
- gzip no Apps Script (Utilities.gzip + DecompressionStream no browser) para encurtar a 1a carga de dados (~137s) sem cortar colunas.
- Confirmar no browser apos o deploy: abertura instantanea no 2o load, spinner nos cards de risco, volta instantanea, numeros identicos aos de antes.
- (herdado) Card Max Drawdown nos drills de tipster/casa/esporte ainda usa "pior real" sem o periodo pico-vale.
- Pagina Metricas: rework completo FEITO nesta data em terminal paralelo (commit 735977e). Ver bloco "sessao 43, paralela - Metricas" abaixo.

## Proximo passo
- Validar no browser apos o deploy do GitHub Pages.
- Estender o worker para Metricas e drill de tipster, ou fazer o gzip do Apps Script.

## Sessao 2026-06-25 (sessao 43, paralela) - Reconstrucao completa da aba Metricas

### O que foi feito

Aba Metricas refeita do zero (commit 735977e, anterior ao commit de performance 6318629). Era 9 cards planos cobrindo ~6 metricas, com 3 erros factuais e sem a camada de cor --d-*. Agora sao 4 secoes cobrindo as 14 metricas que o codigo calcula, cada card com explicacao para leigo + formula real + benchmark + badge de valor ao vivo.

Diagnostico por 3 agentes (mapeamento, design, formulas). Achado: o desastre de tokens legados estava no dashboard.html legado, nao na aba viva (que ja usava tokens canonicos).

**components.css**
- Tokeniza border-radius 4px -> var(--r-xs) em .metric-example e .metric-warn.
- Novo .metric-live: badge de valor no header, variantes pos/neg/neu e --d-neg/-proj/-pos/-info.
- Novo .metric-note: caixa azul neutra para regras de calculo.
- .metric-formula em camadas: variaveis --ink-soft, operadores .op em --accent-2.

**app.js (buildHTML)**
- page-metrics trocada por 4 secoes: Fundamentais (ROI, Turnover, Win Rate, Odd Media, Stake Media, P/L), Risco & Drawdown (Max DD R$/%, Recovery Factor, DD Medio, p95, DD Extremo p99, Profit/DD), Significancia (P-Value, Nivel de Solidez), Glossario (12 termos). Cada card com badge #mv_*.

**gestao.js (renderMetrics)**
- Reescrita. Calcula via funcoes canonicas e preenche cada #mv_* + a faixa de KPIs de resumo. Chama calcMCdrawdown/calcPValueMC com 10.000, agora memoizadas pelo trabalho de performance (mesma assinatura, reusa o cache da Visao Geral).

**3 erros factuais corrigidos**
- Turnover: explicita a exclusao de Void (era "soma de todas as stakes").
- MDD: formula real MDD/(BASE_BANK+pico)*100 + nota de agregacao por dia cronologica.
- P-Value: bootstrap t-test sobre residuos lucro~yo*stake (nao mais teste de Win Rate).

### Validacao
- node --check OK em app.js e gestao.js. Badges #mv_* casados entre markup e render, sem residuos do antigo m_xmdd.

### Backup
- Backups/metrics-rework-<timestamp>/ com components.css, app.js e gestao.js antes da edicao.

### Commit
- 735977e feat(metrics): reconstroi aba Metricas em 4 secoes com valor ao vivo

### Pendente
- Revisar a aba no browser: badges ao vivo, cores --d-*, layout das 4 secoes.
- renderMetrics ainda roda Monte Carlo sincrono no 1o acesso (instantaneo na repeticao pela memoizacao). Aplicar mcComputeAsync/worker aqui fica como melhoria, alinhado ao pendente da sessao 43 (performance).

## Proximo passo
- Revisar a aba Metricas no browser e ajustar textos/benchmarks se preciso.

## Estado anterior: drill-down de Esportes + fix de datas no Max Drawdown — COMPLETO (2026-06-25 sessao 42)

## Sessao 2026-06-25 (sessao 42) — Drill-down de Esportes e ano nas datas do Max Drawdown

### O que foi feito

**1. Drill-down de Esportes (commit 81afa2c)**

Os cards da aba Esportes nao abriam popup. A infraestrutura nunca tinha sido feita (faltavam data-attribute, handler de clique e a funcao de drill). Replicado o padrao de Bookies, sem custo.

- app.js (buildHTML): novo markup #sportDrillOverlay/#sportDrillModal/#sportDrillBody/#sportDrillPeriodBar. Eyebrow ESPORTE, chip via mkSpChip, botoes copy/save/fechar.
- performance.js: card clicavel. data-sport no _mkSportCard + el.onclick delegado no _renderSportCards (ignora .tip-anchor).
- performance.js: openSportDrill/renderSportDrill/closeSportDrill, estado e period bar (_sliceSportDrillRows, _updateSportDrillChips, setDrillSportQuick/Type/All), copySportDrill/saveSportDrill.
- Secoes do popup: Resultado Geral (8 KPIs em 4x2, sem custo) · Evolucao (canvas sportDrillLine) · Cenario Atual (Topo · DD Atual · Max DD · Recovery Factor) · Analise Mensal · Por Casa · Por Tipster.
- openSportDrill respeita o multiselect de casa da pagina (ca_sports) e tem periodo proprio.
- _casaBreakdownTbl ganhou rotulo "Casa" quando dimKey==='casa' (era so tipster/esporte).

**2. Fix de datas no card Max Drawdown (commit 5295d4d)**

- overview.js (renderOvCusto): sub-texto passou a "15,9% · 18/03/2026 - 08/04/2026 - 21 dias". Antes "15,9% · 18/03→08/04 · 21 dias".
- Datas com ano completo (usa _fmtD) e separador " - " no lugar de seta e middot. _fmtDC orfao removido.
- So formatacao. Calculo (calcDrawdownReal) intacto.

### Pendente
- Card Max Drawdown nos drills de tipster/casa/esporte (performance.js) ainda usa o sub "pior real", sem o periodo pico-vale. Decidir se padroniza com o do Overview.
- Verificar perf do painel de risco com p-value em 10.000 (pendente da sessao 40).
- Pagina Metricas: rework completo pendente.

## Proximo passo
- Testar o drill de Esportes no browser (clicar num card, conferir secoes, copy/save PNG).
- Avaliar padronizar o sub do Max Drawdown (periodo + dias) nos popups de drill.

## Estado anterior: card Max Drawdown mostra periodo pico-vale e duracao em dias — COMPLETO (2026-06-25 sessao 41)

## Sessao 2026-06-25 (sessao 41) — Periodo e duracao no card Max Drawdown

### O que foi feito

Card Max Drawdown do Cenario Atual (Visao Geral) ganhou o periodo e a duracao no sub-texto.

**overview.js (renderOvCusto)**
- Novo sub-texto do Max Drawdown: "15,9% · 18/03 a 08/04 · 21 dias". Antes era "15,9% · pior real".
- Helpers locais: _fmtDC (data DD/MM sem ano) e _ddDias (diferenca em dias entre peakDate e troughDate).
- Dados vem do mesmo episodio que calcDrawdownReal ja retorna (peakDate, troughDate). Coerente com R$, % e grafico.
- "pior real" saiu por ser redundante com o selo "DADOS REAIS · HISTORICO" do painel. Fallback mantem "pior real" se faltar data.

### Nota
- Os dias contam a fase de queda (pico a vale), nao incluem o tempo de recuperacao ate voltar ao pico. Nao rastreamos data de recuperacao.

### Pendente
- Card Max Drawdown identico no popup drill-down de tipster (performance.js, linhas 695/741) ainda mostra "pior real". Aplicar a mesma melhoria la para nao divergir. Usuario nao confirmou ainda.
- Verificar perf do painel de risco com p-value em 10.000 (pendente da sessao 40).
- Pagina Metricas: rework completo pendente.

## Proximo passo
- Aplicar periodo/duracao no card Max Drawdown do drill-down de tipster (performance.js).
- Testar performance do painel de risco no browser.

## Estado anterior: Max Drawdown real por dia cronologico + separacao real/simulado + p-value em 10.000 sims — COMPLETO (2026-06-25 sessao 40)

## Sessao 2026-06-25 (sessao 40) — Bug do Max Drawdown real e selo de simulacoes

### Contexto

Fernando notou que o "Max Drawdown" do card Cenario Atual (Visao Geral) mostrava -R$ 70.800,12, valor que nao aparece no grafico Resultado Geral.

Causa-raiz: calcMDDreais e calcMDDpct acumulavam o P/L na ordem bruta da planilha, sem ordenar por data. A planilha vem organizada por casa/parceiro, nao por data, entao a curva acumulada ficava fora de ordem temporal e gerava um vale que nunca aconteceu. Valor correto por dia: -R$ 56.341,44 (15,9%), episodio 18/03 a 08/04.

### O que foi feito

**Fase 1+2 (commit 5909814)**
- Novo calcDrawdownReal(rows) em app.js: agrega P/L por dia, ordena cronologico (igual a renderBankroll) e devolve mddReais, mddPct, peakDate, troughDate do mesmo episodio pico-vale. R$ e % sempre coerentes.
- calcMDDreais e calcMDDpct viram wrappers de calcDrawdownReal. calcRecoveryFactor herda.
- Propagado para overview, gestao e performance (x2).

**Fase 3 (commit 2a84d10)**
- Separacao visual real vs simulado. Cenario Atual = realizado (badge "dados reais · historico"). Diagnostico de Risco = Monte Carlo (badge "simulado").
- "DD Maximo" renomeado para "DD Extremo" (p99), evita colisao com "Max Drawdown" real.
- Tooltips e regra documentada no CLAUDE.md.

**Fase 4 (commit desta sessao)**
- Selo "Monte Carlo · 10.000" cobria todo o painel de risco, mas calcPValueMC rodava 3.000 sims (adaptive: com n=25.430 cai para 3000), enquanto calcMCdrawdown ja rodava 10.000.
- Decisao do usuario: padronizar em 10.000. calcPValueMC(rows) passou a calcPValueMC(rows, 10000) nos 3 pontos de uso (overview.js:237, gestao.js:353, performance.js:691).
- Selo "10.000" agora vale para o painel inteiro. O default adaptive da funcao fica intacto para chamadas sem argumento.

### Validacao
- Grep confirma zero chamadas calcPValueMC(rows) sem argumento restantes.

### Pendente
- Verificar no browser se o painel de risco (Visao Geral e drill de tipster) ficou lento com o p-value em 10.000. calcMCdrawdown ja pagava esse custo, entao deve ser ~2x o tempo anterior. Se travar, otimizar.
- Pagina Metricas: rework completo pendente (ver sessao 39).

## Proximo passo
- Testar performance do painel de risco no browser com base completa.
- Tratar a pagina Metricas (rework).

## Estado anterior: apostas Void excluidas de Turnover, ROI e Stake Media em todo o sistema — COMPLETO (2026-06-23 sessao 39)

## Sessao 2026-06-23 (sessao 39) — Void fora de Turnover, ROI e Stake Media

### O que foi feito

Apostas Void (resultado 'V') devolvem a stake e tem lucro 0. Antes, a stake de Void entrava no Turnover (denominador do ROI = Sigma P/L / Sigma stake), entao inflava o denominador e deprimia o ROI. Auditadas todas as formulas de ROI/Turnover (~40 pontos em 7 arquivos) e aplicada uma regra unica.

**Regra aplicada em todo o sistema**
- A stake de Void sai do Turnover. Por consequencia, sai do ROI e da Stake Media.
- P/L nao muda (Void ja e 0). ROI = P/L / Turnover continua reconciliando.

**app.js**
- Novo helper canonico calcTurnover(rows): soma stake so de apostas nao-Void.
- calcROI passou a usar calcTurnover no denominador.

**Cobertura (Turnover/ROI nao-Void)**
- overview.js: KPI principal, ROI mensal, heatmap anual.
- shared.js: calendario (mkCalendarHeatmap), mkKpiGrid.
- temporal.js: Consolidado, Mensal, Diario, Semana (totais, por-tipster, heatmap mensal).
- performance.js: Esportes, Bookies, Tipsters (cards, portfolio, comparativo), drills de casa/tipster, _tipMonthTbody, _casaBreakdownTbl, _tipBreakdownTbl, Resultados por Casa, turnover recente r30s/r15s.
- apostas.js: KPI header.
- gestao.js: Fornecedores e Contas (decisao do usuario: aplicar tambem).

**Stake Media**
- Passou a usar denominador de apostas encerradas (d.t / v.t / settled / totT / totN-totV).
- Reconcilia: Turnover / encerradas = Stake Media.

**Inalterado**
- P/L, contagem total de apostas (n), detalhe W/HW/L/HL/V.
- Win Rate (calcWR ja excluia Void).
- Odd Media (calcAvgOdd segue ponderada sobre todas as bets com odd>0 — fora do escopo desta mudanca).

### Validacao
- node --check OK nos 7 arquivos.

### Commit desta sessao
- 287143c fix(metrics): exclui apostas Void do Turnover, ROI e Stake Media em todo o sistema

### Pendente
- Pagina Metricas: glossario "V — Void" e descricoes de ROI ainda dizem so "nao conta no Win Rate". Atualizar para citar Turnover/ROI/Stake Media no rework da pagina (que sera refeita inteira; nao mexer pontual).
- Decidir se Odd Media tambem deve excluir Void (fora do escopo de hoje; usuario nao pediu).
- Pendentes anteriores: tooltip "Max Drawdown" (label XMDD vs calcMDDreais); reexaminar cortes 5/2 da Solidez.

## Proximo passo
- Verificar no browser: ROI/Turnover/Stake Media coerentes nas views (com base que tenha Voids).
- Tratar a pagina Metricas (rework) ou o label do tooltip "Max Drawdown".

## Estado anterior: auditoria A3/M2/M3, remocao da calcXMDD orfa e rotulo Odd Media Ponderada padronizado — COMPLETO (2026-06-22 sessao 38)

## Sessao 2026-06-22 (sessao 38) — Auditoria A3/M2/M3, limpeza e rotulos

### O que foi feito

Continuacao da auditoria matematica (sessao 37). Corrigidos os pendentes A3, M2 e M3, removida a funcao morta calcXMDD, e padronizado o rotulo "Odd Media Ponderada" em todo o app.

**A3 — custo de contas ignorava filtros (gestao.js)**
- Bug: calcCostFiltered usava os rows filtrados so para extrair a janela de datas; depois somava o custo de TODAS as contas globais cuja primeira aposta caia na janela. Filtrar uma casa subtraia o custo de todas as casas no P/L Liquido.
- Fix: adicionada restricao de escopo. So entram contas presentes nos rows filtrados (respeita casa/tipster/esporte), alem da janela de datas. Filtro so-data permanece identico (zero regressao).

**M2 — Win Rate pela fonte unica (shared.js, temporal.js)**
- 7 sites baseados em rows passaram a usar o canonico calcWR (denominador !=='V'): calendario, mkKpiGrid, e os totais de Consolidado/Mensal/Diario/Semana + por-tipster do Consolidado.
- Contadores W/HW/L/HL/V mantidos onde alimentam o detalhe. wr2 per-tipster (acumuladores) deixados (ja canonicos por construcao). Zero mudanca numerica hoje.

**M3 — odd media do calendario (shared.js)**
- Antes dividia Sigma(odd x stake) por mTurnover (todas as stakes, sem filtro).
- Agora usa calcAvgOdd(mRows): ponderada com filtro odd>0 && stake>0. Voids com stake e odd=0 nao distorcem mais.

**Limpeza — calcXMDD orfa (app.js)**
- Removida de app.js. Era a unica media simples de odd do codigo ativo. mulberry32 (na mesma linha) preservada. So restava no dashboard.html legado.

**Rotulos — Odd Media Ponderada padronizado**
- Cards KPI (Overview, Apostas, Diario/Mensal/Semana, calendario, popups): "Odd Media" no topo + sub-texto "ponderada". Removido o "Pond." do rotulo.
- Cards .tcard (Esportes/Bookies/Tipsters) e cabecalhos de tabela: "Odd Media" + botao (i) com tooltip via helper compartilhado _mkOddTip. Formula quebra apos o "=": linha 1 "Odd media ponderada =", linha 2 "Sigma(odd x stake) / Sigma(stake)".
- Guard de clique: clicar no (i) nos cards de Bookie/Tipster nao abre o drill.
- CSS: .tcard__stat-lbl com display:flex, align-items:center, min-height:14px para o (i) de 14px nao desalinhar os valores das 4 colunas.

### Commits desta sessao
- b51e003 fix(metrics): A3 -- custo de contas respeita filtros de casa/tipster/esporte
- 28aa8dd fix(metrics): M2/M3 -- WR canonico, odd ponderada no calendario e remove calcXMDD orfa
- 710f87f fix(ui): padroniza rotulo Odd Media Ponderada (sub-texto + tooltip)

### Pendente
- Pagina Metricas (card m_odd, app.js:546) sera reformulada inteira em breve. Nao fazer ajustes pontuais nela. Por isso ficou com o rotulo antigo "Odd Media Pond.".
- Tooltip "Max Drawdown" nos popups Casa/Tipster diz "XMDD" mas mostra calcMDDreais -- corrigir label.
- A auditoria deixou aberto: reexaminar os cortes 5/2 da escala de Solidez (calcSolidez).

## Proximo passo
- Decidir a reformulacao da pagina Metricas, ou corrigir o label do tooltip "Max Drawdown".

## Estado anterior: auditoria matematica — heatmap ROI, p-value, drawdown esperado e determinismo corrigidos — COMPLETO (2026-06-22 sessao 37)

## Sessao 2026-06-22 (sessao 37) — Auditoria matematica completa (C1, C2, A1, A2, M1)

### O que foi feito

Auditoria distribuida em 3 agentes conferiu TODAS as formulas. Nucleo financeiro (ROI, P/L, turnover, stake media, odd ponderada) correto e consistente em todas as copias inline. Corrigidos os bugs C1, C2, A1, A2 e o determinismo M1.

**C1 — ROI do heatmap "Evolucao Mensal" (assets/js/charts/temporal.js)**
- Bug: chave de mes 0-indexada (`getMonth()`, ex. "2026-00") cruzada com `r.data.slice(0,7)` ISO 1-indexada ("2026-01") -> ROI por celula usava turnover do mes ERRADO (off-by-one); jan/dez sempre 0,00%
- Fix: acumular `stake` em `monthlyByT` no loop principal (campo `s`) e usar `d.s` direto na celula; eliminado o re-filtro bugado

**C2 — P-Value invalido (gestao.js + app.js)**
- Bug: `calcPValue` testava H0 `WinRate = 1/odd_media` — invalida por desigualdade de Jensen (subestima break-even) e por contar HW como vitoria cheia. Estudo do usuario: 26,4% de falso-positivo vs 5% alvo
- Fix: pagina Metricas passou a usar `calcPValueMC` (bootstrap recentralizado/studentizado, ja rodava nos drill-downs). Funcao `calcPValue` REMOVIDA de app.js. `normalCDF` mantida (utilitario correto, agora sem uso)

**A1 — XMDD subestimava risco (app.js + gestao.js)**
- Bug: `calcXMDD` simulava odd/stake uniformes -> apagava a variancia real -> subestimava MDD 18-70% (pior quanto mais dispersas as odds; estudo mostrou ate inversao do sinal risco x dispersao)
- Fix: Metricas usa `calcMCdrawdown` (bootstrap dos P/L reais, 10.000 sims). `calcXMDD` ficou orfa em app.js (so resta no dashboard.html legado)

**A2 — "EMDD" era numero inventado (app.js + gestao.js)**
- Bug: `emdd = xmdd*0.85` (fator magico) rotulado como formula browniana de Magdon-Ismail. Formula do card invalida (nem e Magdon-Ismail; expoente dimensionalmente quebrado)
- Fix: KPIs renomeados -> "Drawdown Medio Esperado" (xmdd) e "Drawdown p95 (risco)" (p95), ambos do bootstrap. Ratio "Profit / Drawdown" = pl/xmdd (MEDIA, igual ao profitXmdd dos drill-downs -> escala 5/2 da Solidez MANTIDA sem refit). Cards m_emdd/m_xmdd/m_pemdd reescritos
- Aviso esperado e correto: ratio de Metricas cai ~15% (sai o 0,85); tambem conserta a Solidez que estava inflada 1/0,85 em Metricas vs drill-down

**M1 — Determinismo (app.js calcMCdrawdown)**
- Bug: `Math.random()` -> numeros tremiam a cada render; ordem do array divergia entre telas
- Fix: semeado com `mulberry32` (semente derivada dos dados, independente de ordem) + ordenacao dos VALORES de P/L (`pls.sort()`). Ordenar por data NAO bastava (apostas do mesmo dia empatam). Verificado por teste: ordem natural vs embaralhada -> xmdd/p95/p99 identicos bit-a-bit; deterministico entre renders

### Criterio de aceite
- Um tipster filtrado em Metricas e seu drill-down devem exibir o MESMO Drawdown Medio e a MESMA Solidez (mesmo pl/xmdd). Garantido por construcao (motor unico + determinismo)

### Fora de escopo (issue a parte — nao misturar com a correcao)
- Reexaminar se os cortes 5/2 da escala de Solidez (calcSolidez) sao os ideais — independente de A1/A2
- Remover `calcXMDD` de app.js (orfa); tooltip "Max Drawdown" que diz "XMDD" mas mostra calcMDDreais

### Pendentes da auditoria (nao criticos)
- A3: P/L Liquido (calcCostFiltered) ignora filtros de casa/tipster ao ratear custo por janela de data
- M2: WR em shared.js/temporal.js usa W+HW+L+HL em vez de `!=='V'` (equivalente hoje, fragil se surgir novo codigo)
- M3: odd media do calendario (shared.js) nao aplica filtro odd>0 && stake>0

### Estudos de referencia (do usuario, claudeweb)
- estudo_pvalue_C2.md — fundamentacao do C2 (ASA 2016, Hall & Wilson 1991, North-Curtis-Sham 2002)
- estudo_drawdown_A1_A2.md — fundamentacao A1/A2; §3.6 atualizado para a decisao final (media no ratio, p95 no display, sem refit, determinismo por ordenacao de valores)

## Proximo passo
- Decidir A3/M2/M3 da auditoria, ou abrir issue para recalibracao da escala 5/2 da Solidez

---

## Estado anterior: navegacao de dias/meses nos filtros, delay de data corrigido, ROI renomeado — COMPLETO (2026-06-18 sessao 36)

## Sessao 2026-06-18 (sessao 36) — Navegacao de dias/meses e correcoes de filtro

### O que foi feito

**assets/js/filters.js**
- Setas de navegacao de dias: ao ativar "Hoje", aparecem setas ◀▶ abaixo dos atalhos
- Setas de navegacao de meses: ao ativar "MTD", aparecem setas ◀▶ para navegar entre meses
- Dias anteriores: rotulo mostra dd/mm/yyyy. Meses anteriores: rotulo mostra Mmm/YYYY. Offset 0 = "Hoje" / "Este mes"
- Meses passados: periodo completo (1 ao ultimo dia). Mes atual: de 1 ate hoje (MTD)
- Debounce de inputs de data corrigido de 120ms para 700ms (eliminado travamento ao digitar dia/mes/ano)
- Estado dayOff e monthOff adicionados ao FS; todos os atalhos resetam ambos

**assets/css/components.css**
- Adicionados `.day-nav`, `.day-nav-arrow`, `.day-nav-label` (setas de navegacao, tema FDC)
- min-width do label ajustado para 72px (acomodar dd/mm/yyyy)

**assets/js/charts/performance.js**
- "ROI Ponderado" renomeado para "ROI" no KPI de visao geral dos Tipsters (unica ocorrencia)

### Pendente
- Tooltip do "Max Drawdown" (popups Casa e Tipster) diz "XMDD" mas valor e calcMDDreais -- corrigir label
- EMDD: implementacao real e xmdd*0.85, documentacao diz Brownian Motion -- alinhar ou documentar fator 0.85

### Commits desta sessao
- 7aa1273 feat(filters): navegacao de dias com setas apos botao Hoje
- 761ec21 fix(filters,tipsters): data dd/mm/yyyy na nav de dias e renomeia ROI
- 887847e feat(filters): nav de meses no MTD e corrige delay nos inputs de data
- d3a601a fix(filters): remove labels 'Ontem' e 'Mes passado', exibe data direta

## Proximo passo
- Corrigir tooltip "Max Drawdown" em performance.js (trocar label "XMDD" por "MDD")
- Alinhar EMDD: documentar fator 0.85 ou implementar formula correta de Brownian Motion

---

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
