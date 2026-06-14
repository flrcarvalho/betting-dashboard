# UI Rules — FDC Capital Betting Dashboard
> Documento vivo. Toda implementação deve passar por estas regras antes de ir ao ar.
> Baseado em: UI_AUDIT.md · UI_INCONSISTENCIES.md · DESIGN_SYSTEM_PROPOSAL.md · UI_REFERENCE_BOARD.md

---

## REGRA 0 — FILOSOFIA

**Padronização cirúrgica. Sem redesign.**
Cada nova linha de CSS ou HTML deve reduzir o número de variações, nunca aumentar.
Se existe um padrão para algo → use-o. Se não existe → crie-o aqui antes de implementar.

**Gabarito positivo:** página Diário. Tudo novo deve parecer que saiu da mesma mão que fez o Diário.
**Gabarito negativo:** página Esportes (antes da migração). Cards de geração diferente das abas irmãs = proibido.

---

## REGRA 1 — TOKENS SÃO OBRIGATÓRIOS

### 1.1 Nenhum valor hardcoded permitido em CSS de componentes

❌ Proibido:
```css
font-size: 9px;
border-radius: 6px;
padding: 0.55rem 0.9rem;
color: #2E8BFF;
gap: 7px;
```

✅ Correto:
```css
font-size: var(--text-nano);
border-radius: var(--r-sm);
padding: var(--sp-5) var(--sp-6);
color: var(--accent);
gap: var(--sp-2);
```

**Exceção documentada:** valores de layout em `px` para dimensões estruturais fixas (220px sidebar, 68px topbar, 24px/22px em `.tcard` compact override). Anotar o motivo inline.

---

### 1.2 Escala tipográfica completa — 9 tokens

| Token | Valor | Uso canônico |
|---|---|---|
| `--text-nano` | 9px | Nav-group, page-sub, eyebrow, labels de footer de card, `.tcard__stat-lbl` |
| `--text-xxs` | 10px | `.kpi-sub`, `.bet-time`, `.last-update`, `.cal__sub`, `.bet-num-lbl` |
| `--text-xs` | 11px | Badges, sort chips, eyebrow topbar, `.tbl th` |
| `--text-sm` | 13px | Corpo base (`html`), nav-items, texto de tabela, tooltip body |
| `--text-md` | 14px | `.tcard__roi-val`, `.cal-tip` valores secundários |
| `--text-base` | 15px | `.card-title` |
| `--text-lg` | 18px | `.metric-title` |
| `--text-xl` | 22px | Page title (topbar), `.tcard__pl`, `.stat-card-pl` |
| `--text-2xl` | 28px | `.kpi-val`, `.cal__hero .v`, `.cal__kpi .v` |

`--text-3xl` (36px): definido, sem uso ativo — reservado.

---

### 1.3 Escala de espaçamento — `--sp-*` é o canônico

| Token | Valor |
|---|---|
| `--sp-1` | 4px |
| `--sp-2` | 8px |
| `--sp-3` | 12px |
| `--sp-4` | 16px |
| `--sp-5` | 20px |
| `--sp-6` | 24px |
| `--sp-8` | 32px |
| `--sp-10` | 40px |

`--space-*`: deprecated. Mantido como alias. Não usar em código novo.

---

### 1.4 Escala de raio — `--r-*` é o canônico

| Token | Valor | Uso |
|---|---|---|
| `--r-xs` | 4px | Inputs, badges nano |
| `--r-sm` | 8px | Botões, sort-chips, `.bet-card`, month-block |
| `--r-md` | 12px | Aparencia panel, metric-tip, `.analise-toast` |
| `--r-lg` | 18px | **Padrão panelbox** — cards, KPIs, filtros, popups, tcard |
| `--r-pill` | 999px | Badges, quick-btns, segmentos, aparencia-trigger |

`6px` e `7px` são proibidos. Usar `--r-sm` (8px).
`--radius-*`: deprecated. Mantido como alias. Não usar em código novo.

---

## REGRA 2 — PALETA DE CORES

### 2.1 Tokens de cor obrigatórios

**Usar sempre o token semântico, nunca o alias legado:**

| ❌ Alias legado | ✅ Token canônico |
|---|---|
| `--blue` | `--accent` |
| `--text` | `--ink` |
| `--text2` | `--ink-soft` |
| `--text3` | `--ink-mute` |
| `--bg2` | `--surface` |
| `--bg3` | `--surface-2` |
| `--bg4` | `--field` |
| `--bg5` | `--elevated` |
| `--border` | `--line-2` |
| `--border2` | `--line` |

Os aliases continuam existindo para não quebrar JS legado — mas todo código novo usa o canônico.

---

### 2.2 Regra semântica de cor — o que cada cor significa

| Cor | Token | Quando usar | Quando NÃO usar |
|---|---|---|---|
| Azul | `--accent` / `--accent-2` | Acento, interação, foco, dado ativo, `.kpi-pipe` | Decoração, fundo geral, ícones neutros |
| Verde | `--pos` | P/L positivo, Win, badge-win, barra WR | Win Rate (neutro por definição) |
| Vermelho | `--neg` | P/L negativo, Loss, badge-loss, MDD realizado | Projeções estatísticas (EMDD, XMDD) |
| Âmbar | `--warn` | Pendente, HW/HL dots, projeções estatísticas | Perdas realizadas |
| Branco/Ink | `--ink` | Texto principal, valores neutros, Win Rate | Substituir verde/vermelho semânticos |
| Muted | `--ink-mute` | Labels, nav-groups, texto terciário | Valores numéricos importantes |

**Win Rate é sempre neutro** — nunca verde, nunca vermelho. Usar `--ink` ou `--ink-soft`.

---

### 2.3 Cores em Chart.js (canvas — exceção documentada)

Canvas não lê CSS vars. Usar as constantes definidas em `shared.js`:

```js
const C_ACCENT      = '#2E8BFF';
const C_POS         = '#2BC07E';
const C_NEG         = '#E5524B';
const C_WARN        = '#E0A21A';
const C_LABEL_DARK  = '#AEB7C2';
const C_LABEL_LIGHT = '#666E7A';
const C_GRID_DARK   = 'rgba(255,255,255,0.05)';
const C_GRID_LIGHT  = 'rgba(0,0,0,0.06)';
```

Nunca digitar hex de cor diretamente em chart configs — sempre via constante.

---

## REGRA 3 — PADRÃO PANELBOX (containers visuais)

Todo container visual (card, KPI, filtro, popup-section) segue:

| Propriedade | Standalone (página) | Dentro de modal/popup |
|---|---|---|
| `background` | `var(--surface)` | `var(--surface-2)` |
| `border` | `1px solid var(--line)` | `1px solid var(--line)` |
| `border-radius` | `var(--r-lg)` = 18px | `var(--r-lg)` = 18px |
| `padding` | `var(--sp-5) var(--sp-6)` = 20px 24px | `var(--sp-5) var(--sp-6)` = 20px 24px |
| `margin-bottom` | `var(--sp-4)` = 16px | — (gap: 16px no flex pai) |

**Compact override** (aplicado via `[data-density="compact"]`):
```css
padding: 12px 14px;
```

**Exceções documentadas — não alterar:**
- `.stat-card`: padding `16px 20px`, height 130px fixo → em migração para `.tcard`
- `.bet-card`: item de scroll virtual, compact intencional
- `.term-card`: definição de métrica, compact intencional
- `.month-block`: linha colapsável, `--r-sm` intencional
- Células do heatmap: componente visual específico

---

## REGRA 4 — HIERARQUIA TIPOGRÁFICA

### 4.1 Valores numéricos — peso por nível

| Nível | Peso | Token | Exemplos |
|---|---|---|---|
| Hero principal | 800 extrabold | `--weight-extrabold` | `.kpi-val` (28px), `.cal__hero .v` (28px) |
| Hero de card | 800 extrabold | `--weight-extrabold` | `.tcard__pl` (22px), `.stat-card-pl` (22px) |
| Valor secundário | 700 bold | `--weight-bold` | `.tcard__roi-val` (14px), `.bet-num-val` (13px) |
| Valor terciário | 600 semibold | `--weight-semibold` | `.tcard__stat-val` (12px), footer de card |

**Regra de ouro:** se dois números estão no mesmo componente e um é mais importante, ele tem peso maior. Nunca dois valores no mesmo nível com pesos diferentes.

---

### 4.2 Labels e rótulos — sempre mono, sempre uppercase

Qualquer texto que funciona como "etiqueta de dado":
```css
font-family: var(--font-mono);
font-size: var(--text-nano);   /* ou --text-xxs, --text-xs */
font-weight: var(--weight-bold);
text-transform: uppercase;
letter-spacing: 0.08em;        /* mínimo; eyebrows usam 0.18em */
color: var(--ink-mute);
```

---

### 4.3 Títulos de seção (card-title, section-title)

```css
font-family: var(--font-sans);
font-size: var(--text-base);   /* 15px */
font-weight: var(--weight-extrabold);
color: var(--accent-2);
text-transform: uppercase;
letter-spacing: 0.04em;
```

Nunca usar `--ink` ou `--text` para títulos de seção — sempre `--accent-2`.

---

## REGRA 5 — CARD DE ENTIDADE (`.tcard`)

**Esta é a regra mais importante para consistência visual.**

Todo card que representa uma entidade (esporte, casa, tipster, qualquer outra) usa `.tcard`.
`.stat-card` é deprecated — qualquer código novo de card de entidade usa `.tcard`.

### Estrutura obrigatória

```html
<div class="tcard" data-name="Nome">
  <div class="tcard__top">
    <!-- chip (sp-chip / house-chip / nametag) + volume -->
  </div>
  <div class="tcard__hero">
    <!-- P/L 22px extrabold + badge ROI -->
  </div>
  <svg class="tcard__spark"><!-- sparkline SVG --></svg>
  <div class="tcard__foot">
    <!-- 3-4 colunas: métricas específicas da entidade -->
  </div>
</div>
```

### Colunas do footer por tipo de entidade

| Tipo | Col 1 | Col 2 | Col 3 | Col 4 |
|---|---|---|---|---|
| Tipster | Turnover | Stake Média | Odd Pond. | Win Rate |
| Casa (Bookmaker) | Turnover | Stake Média | Odd Média | Win Rate |
| Esporte | Turnover | Stake Média | Odd Média | Win Rate |

### Grid

```css
.tcard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;  /* 8px em compact */
}
```

---

## REGRA 6 — BOTÃO TOGGLE (`.seg-btn`)

Um único componente para todos os botões de seleção exclusiva (filtro rápido, sort, período, aparência):

```css
/* Default */
font-family: var(--font-mono);
font-size: var(--text-xs);      /* 11px */
color: var(--ink-mute);
background: transparent;
border: 1px solid var(--line);
border-radius: var(--r-pill);
padding: 5px 12px;
cursor: pointer;
transition: color .18s var(--ease), background .18s var(--ease);

/* Hover */
color: var(--ink);
border-color: rgba(46,139,255,.45);

/* Active */
background: var(--accent);
border-color: var(--accent);
color: #fff;
font-weight: var(--weight-bold);
```

**Substitui:** `.qbtn`, `.tcard-seg button`, `.ap-btn`, chips de drill-down.

---

## REGRA 7 — TABELAS

### `.tbl` — tabela padrão

```css
/* Header */
font-size: var(--text-xs);           /* 11px */
font-family: var(--font-sans);
font-weight: var(--weight-bold);
text-transform: uppercase;
letter-spacing: 0.12em;
color: var(--ink-soft);
background: var(--field);
padding: var(--sp-2) var(--sp-3);   /* 8px 12px */
position: sticky; top: 0;

/* Célula */
font-size: var(--text-sm);           /* 13px — usa --font-sans por default */
padding: var(--sp-2) var(--sp-3);   /* 8px 12px */
color: var(--ink-soft);

/* Número em célula */
font-family: var(--font-mono);
text-align: right;
font-variant-numeric: tabular-nums;
```

**Alinhamento obrigatório:**
- 1ª coluna (entidade/nome): `text-align: left`
- Todas as demais (números): `text-align: right`
- Exceção documentada: colunas de Win Rate com `.wrc` podem ser `text-align: center`

---

## REGRA 8 — LAYOUT DE PÁGINA

### Estrutura obrigatória de toda página de análise

```
1. Barra de filtros (.filters) — sempre presente
2. Grid de KPIs (.kpi-grid) — sempre presente, 4 colunas
3. Conteúdo principal (.card ou .tcard-grid)
```

Páginas de gestão (Custos, Fornecedores) que hoje violam essa estrutura devem receber
pelo menos um KPI summary no topo antes de exibir tabelas.

### Grid de KPIs

```css
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;  /* 7px em compact */
  margin-bottom: var(--sp-4);
}
```

Todos os KPIs dentro de um grid devem ter a mesma altura implícita (controlada pelo conteúdo mais alto). Nunca fixar altura em KPI cards — o conteúdo define.

---

## REGRA 9 — FORMATAÇÃO DE DADOS

### Funções obrigatórias (fonte única de verdade em `app.js`)

| Dado | Função | Output exemplo |
|---|---|---|
| P/L monetário com sinal | `fmtPL(v)` | `+R$ 12.450,00` ou `−R$ 302,00` |
| Valor monetário neutro | `fmtR(v)` | `R$ 5.848.584` |
| Percentual com sinal | `fmtPct(v, d, signed)` | `+4,88%` ou `−3,05%` |
| Odd | `fmtOdd(v)` | `2,72` |
| Número genérico | `fmt(v, d)` | `1.234,56` |

❌ Proibido: `.toFixed(2) + '%'`, `.replace('.', ',')`, qualquer formatação manual.
✅ Exceção: valores de layout CSS (`width: ${pct.toFixed(1)}%`) — não são display.

### Money layout

```html
<span class="money pos">
  <span class="money-sign">+R$</span>
  <span class="money-val">12.450,00</span>
</span>
```

- `.money-sign`: `0.76em`, `color: var(--ink-soft)` — sempre neutro
- `.money-val`: cor positiva/negativa fica aqui, não no `.money-sign`
- Sinal: `+` para positivo, `−` U+2212 para negativo (nunca hífen `-`)

---

## REGRA 10 — CHIPS DE ESPORTE E CASA

Nunca construir chips manualmente. Sempre usar os helpers:

```js
mkSpChip(sport)   // → <span class="sp-chip">⚽</span>
mkHouseChip(nome) // → <span class="house-chip"><img ...></span>
```

**Tamanho:** 24×24px, `border-radius: var(--r-sm)` = 7px (exceção documentada — não é panelbox)
**Filtro:** `grayscale(1)` obrigatório — nunca emoji ou favicon colorido
**Fallback de esporte:** `🏅` — nunca `•`, `?` ou string vazia
**Fallback de casa sem domínio:** inicial uppercase via `.chip-initial`

Para nova casa: adicionar entrada em `HOUSE_DOMAIN` em `data.js` antes de qualquer outra coisa.

---

## REGRA 11 — ESTADOS VAZIOS

Toda view ou tabela que pode ficar sem dados no período selecionado usa `mkEmpty(msg)`:

```js
mkEmpty('Sem apostas no período')
// → <div class="empty-state">
//     <svg class="empty-state-icon">...</svg>
//     <p class="empty-state-msg">Sem apostas no período</p>
//   </div>
```

Nunca: string vazia, `null`, `—`, ou tabela com 0 linhas sem estado vazio.

---

## REGRA 12 — TOOLTIPS DE MÉTRICA

Usar sempre o componente MetricTooltip via `_mkTipAnchor()`:

```js
_mkTipAnchor(label, formula, desc, bench)
// → <span class="tip-anchor">
//     <button class="metric-info" type="button" aria-label="Sobre X">i</button>
//     <div class="metric-tip" role="tooltip" hidden>...</div>
//   </span>
```

❌ Proibido: `.fdc-info`, `.fdc-tip`, `title=""`, tooltip customizado inline.
O singleton `_gTip` em `app.js` gerencia posicionamento — não criar segundo mecanismo de tooltip.

---

## REGRA 13 — DENSIDADE

O painel Aparência controla densidade via `data-density="compact"` no `<html>`.

**Compact é o padrão.** Ambos os modos devem ser igualmente polidos.

### Overrides obrigatórios em `[data-density="compact"]`

```css
.card-hdr    { min-height: 38px; padding: 10px 14px; }
.card-body   { padding: 0.1rem 14px 12px; }
.kpi         { padding: 12px 14px; }
.kpi-val     { font-size: var(--text-xl); }   /* 22px → compact */
.tcard       { padding: 12px 14px 10px; gap: 8px; }
.tcard__pl   { font-size: 19px; }
.tcard-grid  { gap: 8px; }
.kpi-grid    { gap: 7px; }
.nav-item    { height: 28px; }
.tbl th,
.tbl td      { padding: 4px 8px; }
```

Ao adicionar qualquer novo componente com padding/gap, criar o compact override correspondente imediatamente.

---

## REGRA 14 — CHECKLIST PRÉ-IMPLEMENTAÇÃO

Antes de escrever qualquer CSS ou HTML novo, responder:

- [ ] Existe um token para este valor numérico? (font-size, spacing, radius, color)
- [ ] Este componente já existe no sistema? (`.tcard`, `.kpi`, `.seg-btn`, `.tbl`, `.badge-*`)
- [ ] O peso tipográfico está correto para o nível de hierarquia?
- [ ] O compact override está implementado?
- [ ] Se é um estado vazio, uso `mkEmpty()`?
- [ ] Se é um tooltip de métrica, uso `_mkTipAnchor()`?
- [ ] Se é um chip de esporte/casa, uso `mkSpChip()` / `mkHouseChip()`?
- [ ] Se é formatação de número, uso `fmt()` / `fmtPL()` / `fmtPct()` / `fmtOdd()`?

---

## REGRA 15 — CHECKLIST PÓS-IMPLEMENTAÇÃO

Após implementar qualquer mudança visual:

- [ ] Comparar visualmente com a página Diário (gabarito)
- [ ] Verificar em dark E light mode
- [ ] Verificar em compact E comfortable
- [ ] Verificar que Win Rate está neutro (nunca verde/vermelho)
- [ ] Verificar que o P/L hero tem peso 800 extrabold
- [ ] Verificar que não introduziu nenhum valor hardcoded fora dos tokens
- [ ] Capturar screenshot e comparar com `docs/screenshots/` (baseline)

---

## APÊNDICE — ORDEM DE IMPLEMENTAÇÃO

### Fase 1 — Tokens (zero risco) ← Fazer primeiro
1. Adicionar `--text-nano` (9px), `--text-xxs` (10px), `--text-md` (14px) em `tokens.css`
2. Marcar `--space-*` e `--radius-*` como deprecated com comentário
3. Migrar todos os `9px`/`10px`/`14px`/`20px` hardcoded nos CSS para os novos tokens
4. Migrar `6px`/`7px` border-radius para `--r-sm`
5. Migrar `22px` de padding para `--sp-6` (24px)

### Fase 2 — `.seg-btn` unificado (baixo risco)
1. Criar `.seg-btn` em `components.css`
2. Migrar `.qbtn` → `.seg-btn` (manter `.qbtn` como alias)
3. Migrar `.tcard-seg button` → `.seg-btn`
4. Migrar `.ap-btn` → `.seg-btn`
5. Migrar chips de período nos drill-downs

### Fase 3 — Unificação de cards (maior mudança visual)
1. Migrar `renderSport()` em `performance.js` de `.stat-card` → `.tcard`
2. Ajustar sparkline e footer para esportes
3. Garantir compact override
4. Atualizar baseline de screenshots

### Fase 4 — Estrutura das páginas de Gestão
1. Adicionar KPI summary em Custos de Contas
2. Adicionar KPI summary em Custo de Tipsters
3. Adicionar KPI summary em Fornecedores & Parceiros

### Fase 5 — Migração de aliases (progressiva)
- A cada edição de qualquer JS, substituir `--blue` → `--accent`, `--text2` → `--ink-soft`, etc.
- Sem prazo fixo — migração oportunista
