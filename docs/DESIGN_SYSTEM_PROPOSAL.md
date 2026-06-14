# Design System Proposal — FDC Capital Betting Dashboard
> Fase 4 | Baseado na auditoria UI_AUDIT.md + UI_INCONSISTENCIES.md
> Objetivo: padronização cirúrgica — sem redesign, sem mudança de identidade visual.

---

## PRINCÍPIO GUIA

> "O dashboard está ótimo. Cada card, fonte e espaçamento deve parecer que saiu da mesma mão, na mesma hora."

Todas as mudanças são **conservadoras**: eliminam variações desnecessárias, nunca introduzem novos estilos.

---

## 1. TYPOGRAPHY SCALE

### Problema atual
7 tokens tipográficos + 4 valores soltos hardcoded (9px, 10px, 14px, 20px). Três pesos diferentes para "valor numérico hero" (600 / 700 / 800).

### Proposta: escala de 9 passos + regra de peso por nível

| Token | Valor | Nome semântico | Uso canônico |
|---|---|---|---|
| `--text-nano` | 9px | Eyebrow / rótulo mínimo | nav-group, page-sub, labels de footer de card, tcard__stat-lbl |
| `--text-xxs` | 10px | Label micro | kpi-sub, bet-time, last-update, cal__sub, filtro mínimo |
| `--text-xs` | 11px | Label pequeno (já existe) | badges, eyebrow topbar, sort chips |
| `--text-sm` | 13px | Corpo (já existe) | nav-items, tabelas, tooltip body |
| `--text-md` | 14px | *(novo)* Valor secundário | tcard__roi-val, cal-tip ct-item val |
| `--text-base` | 15px | Card title (já existe) | `.card-title` |
| `--text-lg` | 18px | Título de seção (já existe) | `.metric-title` |
| `--text-xl` | 22px | Hero médio (já existe) | Page title, tcard__pl, stat-card-pl |
| `--text-2xl` | 28px | Hero principal (já existe) | `.kpi-val`, `.cal__hero .v` |

> **`--text-3xl` (36px):** mantido no token mas sem uso ativo — reservado para futura tela de relatório.

### Regra de peso por nível (unifica os 3 pesos atuais)

| Nível | Peso | Aplicação |
|---|---|---|
| Rótulo / label | `--weight-bold` 700 | Todo `--text-nano`, `--text-xxs`, `--text-xs` em uppercase |
| Corpo / nav | `--weight-semibold` 600 | `.nav-item`, texto de tabela |
| **Valor numérico hero** | **`--weight-extrabold` 800** | **`.kpi-val`, `.tcard__pl`, `.stat-card-pl`, `.cal__hero .v`** |
| Valor numérico secundário | `--weight-bold` 700 | `.tcard__roi-val`, `.bet-num-val` |
| Título de card | `--weight-extrabold` 800 | `.card-title` |

**Impacto:** `.tcard__pl` sobe de 600 → 800. `.stat-card-pl` mantém 700 (pode subir para 800 na unificação dos cards — ver seção 5).

---

## 2. COLOR PALETTE

### Sem mudanças na paleta

A paleta está correta e alinhada ao brand pack. Nenhuma cor nova é introduzida.

### Correção: renomeação dos aliases de borda

| Alias atual | Valor real | Problema | Novo nome canônico |
|---|---|---|---|
| `--border` | `rgba(255,255,255,0.05)` — mais fraco | Nome sugere primário, mas é o mais fraco | `--line-subtle` (alias de `--line-2`) |
| `--border2` | `rgba(255,255,255,0.08)` — padrão | Nome sugere secundário, mas é o padrão | `--line-default` (alias de `--line`) |

Na prática: os arquivos JS/CSS continuam funcionando porque os aliases não são removidos — apenas os novos nomes são adicionados como preferência. A migração progressiva ocorre ao editar componentes.

### Migração de aliases legados (JS → tokens novos)

Os arquivos de chart JS usam `var(--blue)`, `var(--text2)`, `var(--bg3)`, `var(--border2)`. Como o canvas não lê CSS vars, essas referências existem apenas em `innerHTML` gerado. A migração é progressiva: ao tocar qualquer componente, substituir pelo token canônico.

| Alias legado | Token canônico |
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

---

## 3. SPACING SYSTEM

### Problema atual
Dois sets paralelos (`--space-*` e `--sp-*`) com valores parcialmente sobrepostos. Valores hardcoded em rem e px misturados.

### Proposta: consolidar em `--sp-*` como canônico

O set `--sp-*` é mais completo (tem `--sp-5`, `--sp-10`, `--sp-14`, `--sp-20`). O set `--space-*` vira alias de backward-compat e é marcado como deprecated.

| Token canônico | Valor | Uso |
|---|---|---|
| `--sp-1` | 4px | Micro gap |
| `--sp-2` | 8px | Gap entre elementos irmãos (badges, chips) |
| `--sp-3` | 12px | Padding interno compacto |
| `--sp-4` | 16px | Margin-bottom padrão de card, gap de grid |
| `--sp-5` | 20px | Padding padrão de card (vertical) |
| `--sp-6` | 24px | Padding horizontal de main content |
| `--sp-8` | 32px | Gap entre seções |
| `--sp-10` | 40px | — |
| `--sp-14` | 56px | — |
| `--sp-20` | 80px | — |

### Regra de padding panelbox (unifica inconsistência D-1)

| Nível | Padding | Token |
|---|---|---|
| Standalone (card, kpi, filtro, popup-section) | `var(--sp-5) var(--sp-6)` = `20px 24px` | `--sp-5` / `--sp-6` |
| Card header | `var(--sp-4) var(--sp-6)` = `16px 24px` | `--sp-4` / `--sp-6` |
| Card body | `0 var(--sp-6) var(--sp-5)` = `0 24px 20px` | — |
| Compact standalone | `12px 14px` | hardcoded no `[data-density="compact"]` override |

> **Nota:** O padding horizontal muda de 22px → 24px (= `--sp-6`). Diferença de 2px, mas elimina o "22" hardcoded que não tem token e permite usar a escala 4px.

---

## 4. BORDER-RADIUS SYSTEM

### Problema atual
Dois sets paralelos (`--radius-*` e `--r-*`), valores 6px e 7px sem token.

### Proposta: consolidar em `--r-*` como canônico

| Token canônico | Valor | Uso |
|---|---|---|
| `--r-xs` | 4px | Inputs, badges nano |
| `--r-sm` | 8px | Botões, sort-chips, bet-card, month-block |
| `--r-md` | 12px | Aparencia panel, metric-tip |
| `--r-lg` | 18px | **Padrão panelbox** — cards, KPIs, filtros, popups |
| `--r-xl` | 26px | Reservado |
| `--r-pill` | 999px | Badges, quick-btns, segmentos de sort, aparencia-trigger |

**Eliminar 6px e 7px:** todos os elementos com `border-radius: 6px` ou `7px` migram para `--r-sm` (8px). A diferença de 1-2px não é perceptível e elimina os valores fora da escala.

Impacto: `.btn-export`, `.metric-formula`, `.analise-toast`, `.term-card`, `.nametag` → todos passam para `--r-sm`.

O set `--radius-*` vira alias deprecated (mantido para não quebrar nada imediatamente).

---

## 5. CARD SYSTEM (prioridade máxima)

### Problema atual
Três famílias divergentes para o mesmo conceito de "card de entidade":

| Família | Usado em | Height | P/L peso | Footer |
|---|---|---|---|---|
| `.stat-card` | Esportes, Casas | **130px fixo** | 700 | 3 cols |
| `.tcard` | Tipsters | **flexível** | 600 | 4 cols + sparkline |
| `.analise-card` | Seleção drill-down | auto | — | — |

### Proposta: unificar `.stat-card` no padrão `.tcard`

O `.tcard` é a versão mais moderna e completa. As abas Esportes e Casas migram para a mesma estrutura.

**Estrutura unificada (entity card):**
```
.tcard
  ├── .tcard__top      → chip (esporte/favicon) + nome + volume de apostas
  ├── .tcard__hero     → P/L 22px extrabold mono + badge ROI
  ├── .tcard__spark    → sparkline SVG 28px (P/L acumulado)
  └── .tcard__foot     → 3-4 colunas métricas (ROI · Turnover · WR · col específica)
```

**Diferenças por aba:**

| Aba | Col específica no footer | Chip |
|---|---|---|
| Esportes | Odd Média | `.sp-chip` (emoji esporte) |
| Casas | Dias ativos | `.house-chip` (favicon) |
| Tipsters | Stake Média | `.nametag` (nome) |

**Altura:** deixa de ser fixa (130px). O card expande com o conteúdo — sparkline garante altura mínima consistente.

**P/L peso:** todos → `--weight-extrabold` 800 (alinha com `.kpi-val`).

---

## 6. BUTTON SYSTEM

### Problema atual
4 implementações do padrão "toggle/pill outline → active preenchido azul": `.qbtn`, `.tcard-seg button`, `.ap-btn`, chips de drill-down.

### Proposta: 3 variantes canônicas

| Variante | Classe | Uso |
|---|---|---|
| **Pill toggle** | `.seg-btn` | Sort e período rápido em qualquer contexto |
| **Ação primária** | `.btn-primary` (renomear `.btn-export`) | Export, OK, ação destrutiva |
| **Ghost/outline** | `.btn-ghost` | Secundário, toggle neutro |

**`.seg-btn` unifica:** `.qbtn` + `.tcard-seg button` + `.ap-btn` + chips de drill-down.

Comportamento idêntico:
- Default: `border: 1px solid var(--line)`, `color: var(--ink-mute)`, `background: transparent`
- Hover: `color: var(--ink)`, `border-color: rgba(46,139,255,.45)`
- Active: `background: var(--accent)`, `color: #fff`, `border-color: var(--accent)`
- Font: `var(--font-mono)`, 11px, `border-radius: var(--r-pill)`
- Padding: `5px 12px`

---

## 7. TABLE SYSTEM

### Sem mudança estrutural

As tabelas `.tbl` e `.daily-tbl` estão bem implementadas. Ajuste apenas:

- Header padding: `7px 10px` → `var(--sp-2) var(--sp-3)` (= 8px 12px) para usar tokens
- Compact override já existe e é mantido

### `.drill-tbl` permanece como wrapper class

---

## 8. CHART SYSTEM

### Sem mudança visual

Os gráficos estão corretos. Consolidação:

1. **Cores canvas** documentadas em um único lugar (`assets/js/charts/shared.js` header) como constantes nomeadas:
   ```js
   const C_ACCENT = '#2E8BFF';
   const C_POS    = '#2BC07E';
   const C_NEG    = '#E5524B';
   const C_LABEL_DARK  = '#AEB7C2';
   const C_LABEL_LIGHT = '#666E7A';
   ```
2. Todos os chart files importam essas constantes em vez de repetir literais hex.

---

## 9. DENSITY SYSTEM

### Mantido: compact como padrão, comfortable disponível

O painel Aparência continua com o toggle. A mudança é garantir que **os dois modos fiquem igualmente polidos** após a unificação dos cards.

| Propriedade | Comfortable | Compact |
|---|---|---|
| `.tcard` padding | `20px 24px` | `12px 14px` |
| `.kpi` padding | `20px 24px` | `12px 14px` |
| `.card-hdr` padding | `16px 24px` | `10px 14px` |
| `.tbl th/td` padding | `var(--sp-2) var(--sp-3)` | `4px 8px` |
| `.kpi-val` font-size | `28px` | `22px` |
| `.tcard__pl` font-size | `22px` | `19px` |
| gap do grid de cards | `10px` | `8px` |

---

## 10. SUMÁRIO DE MUDANÇAS (escopo da implementação)

### O que muda (cirúrgico)

| # | Mudança | Arquivo(s) | Impacto visual |
|---|---|---|---|
| 1 | Adicionar `--text-nano`, `--text-xxs`, `--text-md` | `tokens.css` | Zero — apenas adiciona tokens |
| 2 | Migrar todos os `9px`/`10px`/`14px`/`20px` hardcoded para tokens | `components.css`, `layout.css` | Zero |
| 3 | Unificar peso de valor numérico hero → 800 | `components.css` | Mínimo — tcard__pl fica ligeiramente mais bold |
| 4 | Deprecar `--radius-*`, consolidar em `--r-*` | `tokens.css` | Zero |
| 5 | Migrar `6px`/`7px` border-radius → `--r-sm` | `components.css` | Mínimo — cantos 1-2px diferentes |
| 6 | Deprecar `--space-*`, consolidar em `--sp-*` | `tokens.css` | Zero |
| 7 | Padding horizontal 22px → 24px (`--sp-6`) | `components.css`, `layout.css` | Mínimo — 2px |
| 8 | Criar `.seg-btn` unificado | `components.css` | Zero — novo componente |
| 9 | Migrar `.qbtn`, `.ap-btn`, `.tcard-seg button` → `.seg-btn` | `components.css`, `layout.css` | Zero visual |
| 10 | Migrar Esportes e Casas de `.stat-card` → `.tcard` | `performance.js` | **Alto** — cards unificados visualmente |
| 11 | Definir constantes de cor canvas em `shared.js` | `shared.js` | Zero |
| 12 | Migrar aliases legados (`--blue` → `--accent` etc.) progressivamente | JS/CSS | Zero |

### O que NÃO muda

- Paleta de cores — nenhuma cor nova, nenhuma cor removida
- Layout (sidebar 220px, topbar 68px, grid de fundo)
- Sistema de Aparência (dark/light/gradient/compact)
- Gráficos (Chart.js) — apenas constantes de cor
- Lógica de dados, filtros, App Script
- Brand book, logos, favicons

---

## ORDEM DE IMPLEMENTAÇÃO SUGERIDA

**Fase 1 — Tokens (zero risco, impacto zero):**
- Adicionar `--text-nano`, `--text-xxs`, `--text-md` em `tokens.css`
- Deprecar `--space-*` e `--radius-*` com comentários
- Migrar todos os hardcoded de font-size, border-radius e spacing nos CSS

**Fase 2 — Botão unificado (baixo risco):**
- Criar `.seg-btn` em `components.css`
- Migrar `.qbtn`, `.ap-btn`, `.tcard-seg button` para usar `.seg-btn`

**Fase 3 — Unificação de cards (maior mudança):**
- Migrar renderização de Esportes e Casas em `performance.js` para estrutura `.tcard`
- Ajustar sparkline para esportes e casas (reutiliza `_tipSparkSVG`)
- Garantir compact override funciona nos três

**Fase 4 — Migração de aliases (progressiva, sem prazo fixo):**
- A cada edição de qualquer arquivo JS, substituir alias pelo token canônico
