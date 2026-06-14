# UI Audit — FDC Capital Betting Dashboard
> Gerado em: 2026-06-14 | Fase 1 do processo de design system

---

## 1. FONTES

### Famílias em uso

| Token | Stack real | Uso |
|---|---|---|
| `--font-sans` | Manrope → Inter → system-ui | Corpo, nav, botões, filtros, tabelas (dados), topbar |
| `--font-mono` | JetBrains Mono → ui-monospace → SF Mono | Labels KPI, badges, datas, values mono, heatmap, tooltips |

**Carregamento:** Google Fonts (Manrope + JetBrains Mono) via CDN em `index.html`.

---

### Tamanhos tipográficos (tokens CSS)

| Token | Valor | Onde aparece |
|---|---|---|
| `--text-xs` | 11px | Labels de filtro, badges, eyebrow/sub do topbar, chips de sort |
| `--text-sm` | 13px | Corpo geral (`html`), nav-items, texto de tabela (font-size padrão de `.tbl`), tooltip body |
| `--text-base` | 15px | Card titles (`.card-title`) |
| `--text-lg` | 18px | `.metric-title` (página Métricas) |
| `--text-xl` | 22px | Page title no topbar, `.tcard__pl` (P/L hero do tipster card), `.tcard-dir` |
| `--text-2xl` | 28px | `.kpi-val` (valores KPI), `.cal__hero .v`, `.cal__kpi .v`, `.cal-tip .ct-pl` |
| `--text-3xl` | 36px | Definido, não encontrado em uso ativo |

### Tamanhos hardcoded (sem token)

| Valor | Contexto |
|---|---|
| 9px | `.nav-group`, `.page-sub`, labels de footer de card, `.tcard__stat-lbl`, `.tcard__roi-lbl`, `.cal__cell .hoje` |
| 9.5px | `.nav-group` (layout.css) |
| 10px | `.kpi-sub`, `.ms-cl`, `.month-tog`, `.last-update`, `.bet-num-lbl`, `.bet-time`, `.bet-sport-tag`, `.bet-res-pill`, `.cal__sub`, `.cal__wk span` |
| 12px | `.tbl` padrão, `.bet-aposta`, `.ms-btn`, `.ms-opt`, `.update-btn`, `.metric-formula`, `.metric-example`, `.daily-tbl` |
| 14px | `.analise-popup-avatar` font-size, `.tcard__roi-val`, `.cal__cell .pl`, `.cal-tip .ct-item .val` |
| 20px | `.stat-card-pl` |
| 22px | `.tcard__pl` (compact) |

### Pesos em uso

| Token | Valor |
|---|---|
| `--weight-regular` | 400 |
| `--weight-medium` | 500 |
| `--weight-semibold` | 600 |
| `--weight-bold` | 700 |
| `--weight-extrabold` | 800 |

---

## 2. PALETA DE CORES

### Constantes de marca (tema-agnostic)

| Token | Hex | Nome semântico |
|---|---|---|
| `--fdc-base` | `#0A0D12` | Preto FDC |
| `--fdc-blue` | `#2E8BFF` | Azul elétrico primário |
| `--fdc-blue-2` | `#7FB2FF` | Azul secundário (mais claro) |
| `--fdc-steel` | `#222831` | Steel (fundo de chips/nametags) |
| `--fdc-platinum` | `#AEB7C2` | Platinum |
| `--fdc-white` | `#FFFFFF` | Branco |

### Funcionais (sem tema)

| Token | Hex | Uso |
|---|---|---|
| `--pos` | `#2BC07E` | P/L positivo, Win, badges verdes |
| `--neg` | `#E5524B` | P/L negativo, Loss, badges vermelhos |
| `--warn` | `#E0A21A` | Pendente, HW/HL dots, alerta |

### Superfícies — Dark (padrão)

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#0A0D12` | Fundo da página, topbar |
| `--surface` | `#12161D` | Cards, KPIs, panels, filtros |
| `--surface-2` | `#161B22` | Popup modais, field inputs, tcard-seg bg |
| `--elevated` | `#1A2029` | Hover state de cards, metric-tip bg |
| `--field` | `#161B22` | Inputs, ms-btn bg |
| `--line` | rgba(255,255,255,0.08) | Bordas primárias |
| `--line-2` | rgba(255,255,255,0.05) | Bordas secundárias (mais suaves) |

### Superfícies — Light

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#F4F7FB` | Fundo |
| `--surface` | `#FFFFFF` | Cards |
| `--surface-2` | `#EDF2F7` | Secundário |
| `--elevated` | `#FFFFFF` | Elevados |
| `--line` | rgba(10,15,25,0.10) | Bordas |
| `--line-2` | rgba(10,15,25,0.055) | Bordas suaves |

### Tinta (texto)

| Token | Dark | Light | Uso |
|---|---|---|---|
| `--ink` | `#EEF2F7` | `#0E1626` | Texto principal |
| `--ink-soft` | `#95A1B0` | `#46586D` | Texto secundário |
| `--ink-mute` | `#5E6775` | `#7C8BA0` | Labels, nav-groups, texto mudo |

### Acento

| Token | Dark | Light | Uso |
|---|---|---|---|
| `--accent` | `#2E8BFF` | `#1E7CF0` | Primário — links, active, botões, kpi-pipe |
| `--accent-2` | `#7FB2FF` | `#2E8BFF` | Card titles, section titles, operadores em tooltip |

### Camada de diagnóstico (risco)

| Token | Hex | Semântica |
|---|---|---|
| `--d-neg` | `#E5524B` | Perda realizada (MDD real) |
| `--d-proj` | `#D6A45A` | Perda projetada (EMDD, XMDD) |
| `--d-pos` | `#4FC79A` | Resultado a favor / edge |
| `--d-info` | `#4DA3FF` | Métrica de qualidade / rótulo neutro |
| `--d-pos-strong` | `#2BC07E` | Positivo forte (= `--pos`) |
| `--d-proj-strong` | `#E0A21A` | Projeção forte (= `--warn`) |
| `--risk-grad` | gradiente | Barra de risco contínuo |

### Hexadecimais hardcoded (em JS de charts — permitido por limitação do Canvas)

| Valor | Arquivo | Contexto |
|---|---|---|
| `#2E8BFF` | charts/*.js | Linha bankroll, accent em Canvas |
| `#2BC07E` | charts/*.js | Barras/linhas positivas |
| `#E5524B` | charts/*.js | Barras/linhas negativas |
| `#AEB7C2` | charts/*.js | Labels de eixo (dark) |
| `#666E7A` | charts/*.js | Labels de eixo (light) |
| `rgba(46,139,255,…)` | vários | Fills/hover/glow |
| `rgba(43,192,126,…)` | vários | Fills verde dim |
| `rgba(229,82,75,…)` | vários | Fills vermelho dim |

---

## 3. ESPAÇAMENTOS

### Escala de tokens (base 4px)

| Token | Valor |
|---|---|
| `--space-1` / `--sp-1` | 4px |
| `--space-2` / `--sp-2` | 8px |
| `--space-3` / `--sp-3` | 12px |
| `--space-4` / `--sp-4` | 16px |
| `--sp-5` | 20px |
| `--space-6` / `--sp-6` | 24px |
| `--space-8` / `--sp-8` | 32px |
| `--sp-10` | 40px |
| `--space-12` | 48px |
| `--sp-14` | 56px |
| `--space-16` | 64px |
| `--sp-20` | 80px |

### Espaçamentos estruturais fixos

| Valor | Onde |
|---|---|
| 44px × 44px | Grid de fundo (body::before) |
| 220px | Largura da sidebar |
| 68px | Altura do topbar |
| `padding: 0 24px` | Topbar horizontal |
| `padding: 24px 28px` | Main content horizontal |
| `padding: 20px 22px` | Padrão panelbox (cards, KPIs, filtros, popups) |
| `padding: 16px 22px` | Card header |
| `padding: 16px 20px` | `.stat-card` |
| `padding: 12px 14px` | `.tcard` compacto |
| `gap: 10px` | KPI grid, tcard-grid |
| `gap: 12px` | `.analise-cards-grid` |
| `gap: 16px` | `.filters`, sidebar-bottom flex |
| `margin-bottom: 16px` | `.card` padrão |

### Raio de borda

| Token | Valor | Uso |
|---|---|---|
| `--r-xs` / `--radius-sm` | 4px | Inputs, sort buttons, tiny elements |
| `--r-sm` / `--radius` | 8px | `.bet-card`, sort-btn, nav-items, mês-block |
| `--r-md` / `--radius-lg` | 12px | `aparencia-panel`, `metric-tip` |
| `--r-lg` / `--radius-xl` | 18px | Cards, KPIs, filtros, popups (padrão panelbox) |
| `--r-xl` | 26px | Definido, pouco uso ativo |
| `--r-pill` / `--radius-pill` | 999px/100px | Badges, botões de filtro rápido, tcard-seg, aparencia-trigger |

> **Nota:** Existem dois sets de tokens paralelos (`--radius-*` e `--r-*`) com os mesmos valores. Ver inconsistências.

---

## 4. TIPOS DE BOTÃO

| Classe(s) | Estilo | Tamanho | Fonte | Uso |
|---|---|---|---|---|
| `.btn-export` | Preenchido azul (`--accent`) | `5px 13px`, 12px | sans 600 | Export/ação primária em headers |
| `.qbtn` | Outline neutro → hover azul → active preenchido | `3px 8px`, 11px | mono | Filtros rápidos de data (7d, 30d…) |
| `.qbtn.active` | Preenchido azul | — | mono | Filtro rápido ativo |
| `.ms-ok` | Preenchido azul | `4px 14px`, 11px | sans 700 | "OK" no multiselect |
| `.update-btn` | Outline neutro | `4px 8px`, 12px | sans 500 | Atualizar dados na sidebar |
| `.ap-btn` | Pill outline → active preenchido | `5px 8px`, 11px | mono | Opções do painel Aparência |
| `.ap-btn.active` | Pill preenchido azul | — | mono | Opção ativa do painel |
| `.tcard-seg button` | Pill transparente → active azul | `5px 11px`, 11px | mono | Sort de tipster cards |
| `.tcard-dir` | Quadrado 32×30px outline | 13px | mono | Direção do sort (asc/desc) |
| `.cal__nav` | Quadrado 32×32px outline | 15px | mono | Navegação do calendário |
| `.analise-small-toggle` | Outline neutro 6px radius | `5px 12px`, 11px | mono | Toggle "mostrar todos" |
| `.aparencia-trigger` | Pill outline muted | `4px 12px`, 11px | mono | Trigger do painel Aparência |
| `.metric-info` | Círculo 14px `i` outline | 9px italic | mono | Tooltips de informação de métrica |

**Padrão de interação universal:**
- Hover: `border-color: var(--accent)` + `color: var(--accent)` + `background: rgba(46,139,255, 0.06–0.12)`
- Active/preenchido: `background: var(--accent)` + `color: #fff`

---

## 5. TIPOS DE CARD

### Família `.card` (colapsável)

Estrutura: `.card > .card-hdr + .card-body`

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding body | `0.1rem 22px 20px` |
| Margin-bottom | 16px |
| Header padding | `16px 22px` |
| Header min-height | 44px (38px compact) |
| Hover | `translateY(-1px)` |

Exemplos: todos os blocos de gráfico (bankroll, ROI mensal, distribuição, etc.)

---

### `.kpi` (KPI card)

Estrutura: `.kpi > .kpi-label + .kpi-val + .kpi-sub`

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `20px 22px` (12px 14px compact) |
| Valor | `--text-2xl` = 28px, weight 800 |
| Label | `--text-xs` = 11px, mono, uppercase, muted |
| Sub | 10px, mono, muted |
| Indicador | `.kpi-pipe` — barra vertical 4×13px `--accent` |

Variante `kpi-azul`: todos os KPIs ganham cor azul (class no `<html>`).

---

### `.stat-card` (card de entidade — Esportes/Bookies)

Estrutura: `.stat-card > .stat-card-hdr + .stat-card-pl + .stat-card-footer`

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `16px 20px` |
| Height | 130px fixo |
| P/L hero | 20px, peso 700 |
| Footer | 3 colunas (ROI · Turnover · WR) |

---

### `.tcard` (card redesenhado de Tipsters)

Estrutura: `.tcard > .tcard__top + .tcard__hero + .tcard__spark + .tcard__foot`

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `20px 22px` (12px 14px compact) |
| P/L hero | 22px, peso 600, mono |
| Sparkline | 28px altura, SVG inline |
| Footer | 4 colunas: Turnover · Stake Média · Odd Pond. · Win Rate |
| Hover | `translateY(-2px)` + borda azul |

---

### `.analise-card` (card de seleção — Esportes/Casas)

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `20px 22px` |
| Cursor | pointer |
| Hover | `border-color: --blue` + `box-shadow: --shadow-blue` + `translateY(-1px)` |

---

### `.analise-popup-section` (seção dentro de popup)

| Prop | Valor |
|---|---|
| Background | `var(--surface-2)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `20px 22px` |

---

### `.cal__hero` / `.cal__kpi` (mini-cards do calendário)

| Prop | Valor |
|---|---|
| Background | `var(--surface)` |
| Border | `1px solid var(--line)` |
| Border-radius | `var(--r-lg)` = 18px |
| Padding | `20px 22px` |
| Valor | 28px, peso 800, mono |
| Label | 11px, mono, uppercase, muted |

---

### `.bet-card` (card de aposta individual — scroll virtual)

| Prop | Valor |
|---|---|
| Background | `var(--surface-2)` |
| Border | `1px solid var(--line-2)` |
| Border-radius | `var(--r-sm)` = 8px |
| Margin-bottom | 5px |
| Border-left | 3px colorida por resultado (verde/vermelho/muted) |

---

### `.term-card` (definição de métrica)

| Prop | Valor |
|---|---|
| Background | `var(--field)` |
| Border | `1px solid var(--line-2)` |
| Border-radius | 6px |
| Padding | `0.75rem 12px` |

---

## 6. TIPOS DE TABELA

### `.tbl` (tabela padrão)

| Prop | Valor |
|---|---|
| Font-size | 12px |
| Header | 11px, sans, uppercase, letter-spacing 0.12em, cor `--text2`, sticky top |
| Header bg | `var(--field)` |
| Cell padding | `7px 10px` (4px 8px compact) |
| Zebra | `rgba(255,255,255, 0.015)` nos pares |
| Hover | `rgba(46,139,255, 0.05)` |
| Total row | peso bold, `var(--field)` bg, `var(--text)` cor |
| Sort | `--blue` highlight, seta CSS |
| Números | `.td-num` → mono, align-right |

Variante `.drill-tbl`: headers centrados, colunas de dados à direita, 1ª coluna à esquerda.

---

### `.daily-tbl` (tabela diária com coluna fixa)

| Prop | Valor |
|---|---|
| Font-size | 11px (header) |
| 1ª coluna | sticky left, `var(--surface-2)` bg |
| Header weight | semibold |
| Letter-spacing | 0.06em |

---

### `.heatmap-table` (heatmap de resultado)

| Prop | Valor |
|---|---|
| Border-spacing | 3px |
| Células | 26px height, 3px border-radius |
| Font | 10px, mono, semibold |
| Vazia | `var(--field)` bg, 25% opacity |

---

## 7. COMPONENTES REUTILIZÁVEIS

| Componente | Arquivo | Descrição |
|---|---|---|
| `mkCalendarHeatmap()` | `shared.js` | Calendário mensal completo: mini-cards + grid de dias + tooltip |
| `mkSparkline()` | `shared.js` | SVG inline de P/L acumulado 90d |
| `mkKpiGrid()` | `shared.js` | Grid de cards KPI padronizados |
| `toggleBlock()` | `shared.js` | Toggle collapse de blocos `.card` |
| `buildSummaryTable()` | `shared.js` | Tabela de resumo reutilizável |
| `mkStatCards()` | `shared.js` | Grid de `.stat-card` para Esportes/Casas |
| `mkOneStatCard()` | `shared.js` | Render de um `.stat-card` individual |
| `mkWRC(wr)` | `shared.js` | Win Rate Component: número + barra proporcional |
| `mkEmpty(msg)` | `shared.js` | Empty state: ícone inbox + mensagem mono |
| `mkSpChip(sport)` | `app.js` | Chip 24×24px de esporte (emoji grayscale) |
| `mkHouseChip(nome)` | `app.js` | Chip 24×24px de casa (favicon grayscale) |
| `casaCell(nome)` | `app.js` | Chip + nome da casa em linha |
| `sportCell(esporte)` | `app.js` | Chip + nome do esporte em linha |
| `fmtPL(v)` | `app.js` | Money layout: `+R$ 1.234,56` com `.money-sign` + `.money-val` |
| `fmtPct(v,d,signed)` | `app.js` | Percentual pt-BR com sinal tipográfico |
| `fmtOdd(v)` | `app.js` | Odd com 2 casas pt-BR |
| `fmt(v,d)` | `app.js` | Número pt-BR genérico |
| `_mkTipAnchor()` | `performance.js` | Tooltip de métrica (MetricTooltip) |
| `buildFilters()` | `filters.js` | Barra de filtros por página |
| `renderKPI()` | `overview.js` | Grid KPI da visão geral |
| `renderBankroll()` | `overview.js` | Gráfico combinado bankroll |
| `renderTipsters()` / `_renderTipCards()` | `performance.js` | Grid de `.tcard` |
| `openTipsterDrill()` / `openCasaDrill()` | `performance.js` | Popup de drill-down |

---

## 8. SISTEMA DE LAYOUT

| Elemento | Valor |
|---|---|
| Sidebar | 220px fixo, esquerda |
| Topbar | 68px fixo, topo |
| Main | `margin-left: 220px`, `padding-top: 68px` |
| Grid KPI | 4 colunas (`repeat(4, 1fr)`), gap 10px |
| `.row2` | 2 colunas iguais, gap 16px |
| `.tcard-grid` | 3 colunas (→ 2 em <1080px → 1 em <680px) |
| `.analise-cards-grid` | `auto-fill minmax(210px, 1fr)`, gap 12px |
| `.cal__kpis` | 5 colunas (→ 3 em <900px → 2 em <620px) |
| Max-width content | 1600px |

---

## 9. BADGES E STATUS

| Classe | Cor texto | Fundo | Borda | Uso |
|---|---|---|---|---|
| `.badge-win` | `--pos` `#2BC07E` | rgba(43,192,126,0.12) | rgba(43,192,126,0.2) | Win |
| `.badge-loss` | `--neg` `#E5524B` | rgba(229,82,75,0.12) | rgba(229,82,75,0.2) | Loss |
| `.badge-hw` | `--hw` `#2BC07E` | rgba(43,192,126,0.12) | rgba(43,192,126,0.25) | Half Win |
| `.badge-hl` | `--hl` `#E5524B` | rgba(229,82,75,0.12) | rgba(229,82,75,0.25) | Half Loss |
| `.badge-void` | `--text3` | rgba(128,128,128,0.1) | `--border2` | Void |
| `.badge-blue` | `--blue` | rgba(46,139,255,0.15) | rgba(46,139,255,0.2) | Info/drill-down |
| `.badge-cyan` | `--accent-2` | rgba(127,178,255,0.12) | rgba(127,178,255,0.2) | Neutro azul-soft |
| `.badge-amber` | `--amber` | rgba(224,162,26,0.12) | rgba(224,162,26,0.2) | Pendente/warn |

---

## 10. ANIMAÇÕES E TRANSIÇÕES

| Elemento | Animação | Duração |
|---|---|---|
| Page switch | `fadeIn` opacity + translateY(3px) | 0.18s |
| Card hover | `translateY(-1px)` | 0.15s |
| `.tcard` hover | `translateY(-2px)` | 0.22s `--ease` |
| `.btn-export` hover | `filter: brightness(0.88)` | 0.12s |
| `.qbtn` | `all` | 0.1s |
| Topbar panel | open/close toggle | — |
| Loader bar | CSS `@keyframes _loaderP1` 0→90% | 90s ease-out |
| Skeleton shimmer | translateX(-100%→100%) | 1.4s infinite |
| Pulse dot | opacity + box-shadow | 2s infinite |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | — |

---

## 11. PADRÃO DE DADOS MONETÁRIOS

Formatação unificada via helpers em `app.js`:

```
fmtPL(v)   → <span class="money pos/neg">
               <span class="money-sign">+R$</span>
               <span class="money-val">1.234,56</span>
             </span>

Regra: sinal colado ao "R$", sem espaço.
Sinal: + (positivo) / − U+2212 (negativo).
.money-sign: 0.76em, cor --ink-soft (neutro).
.money-val: alinhamento direita, tabular-nums.
```
