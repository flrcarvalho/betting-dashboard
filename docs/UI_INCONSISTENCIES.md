# UI Inconsistencies — FDC Capital Betting Dashboard
> Gerado em: 2026-06-14 | Fase 2 do processo de design system

---

## CATEGORIA A — Tokens duplicados / paralelos

### A-1. Dois sets de tokens de `border-radius`

O sistema mantém **dois sets paralelos** com os mesmos valores numéricos:

| `--radius-*` (antigo) | `--r-*` (novo) | Valor |
|---|---|---|
| `--radius-sm` | `--r-xs` | 4px |
| `--radius` | `--r-sm` | 8px |
| `--radius-lg` | `--r-md` | 12px |
| `--radius-xl` | `--r-lg` | 18px |
| `--radius-pill` | `--r-pill` | 100px / 999px |

**Problema:** `components.css` e `layout.css` usam os dois sets misturados. Um leitor novo não sabe qual usar. `--radius-xl` = 16px ≠ `--r-xl` = 26px (são diferentes, o que aumenta a confusão).

**Impacto:** Médio — nenhum bug visual, mas manutenção confusa.

---

### A-2. Dois sets de tokens de `spacing`

| `--space-*` | `--sp-*` | Valor |
|---|---|---|
| `--space-1` | `--sp-1` | 4px |
| `--space-2` | `--sp-2` | 8px |
| `--space-3` | `--sp-3` | 12px |
| `--space-4` | `--sp-4` | 16px |
| `--space-6` | `--sp-6` | 24px |
| `--space-8` | `--sp-8` | 32px |
| `--space-12` | — | 48px |
| `--space-16` | — | 64px |
| — | `--sp-5` | 20px |
| — | `--sp-10` | 40px |
| — | `--sp-14` | 56px |
| — | `--sp-20` | 80px |

**Problema:** Mesmos valores, dois nomes. O leitor não sabe qual usar. Falta o `--sp-5` (20px) no set `--space-*`, e faltam vários do `--sp-*` no set `--space-*`.

**Impacto:** Baixo — mas contribui para proliferação de valores hardcoded.

---

### A-3. Aliases de backward-compat ainda em uso ativo

`tokens.css` define aliases que deveriam ser temporários:

```css
--blue     → var(--accent)
--navy     → var(--bg)
--graphite → var(--fdc-steel)
--silver   → var(--fdc-platinum)
--text     → var(--ink)
--text2    → var(--ink-soft)
--text3    → var(--ink-mute)
--bg2      → var(--surface)
--bg3      → var(--surface-2)
--bg4      → var(--field)
--bg5      → var(--elevated)
--border   → var(--line-2)
--border2  → var(--line)
--green    → var(--pos)
--red      → var(--neg)
--amber    → var(--warn)
```

**Problema:** Os arquivos JS (gestao.js, shared.js, overview.js, performance.js, temporal.js) ainda usam majoritariamente `--blue`, `--text2`, `--text3`, `--bg3`, `--bg4`, `--border`, `--border2`, não os tokens semânticos novos. A migração está incompleta.

**Impacto:** Médio — o HTML/CSS do produto roda `--ink` / `--surface`, mas o JS injeta HTML com `var(--blue)` / `var(--text2)`. Qualquer rename futuro quebra o JS.

---

## CATEGORIA B — Valores hardcoded que deveriam usar tokens

### B-1. Tamanhos de fonte sem token

Os seguintes valores aparecem diretamente no CSS sem token correspondente:

| Valor | Ocorrências | Token que deveria mapear |
|---|---|---|
| `9px` | nav-group, page-sub, bet-num-lbl, tcard__stat-lbl | Sem token — abaixo de `--text-xs` (11px) |
| `10px` | kpi-sub, ms-cl, last-update, bet-time, cal__sub | Sem token — entre `9px` e `11px` |
| `14px` | tcard__roi-val, cal-tip ct-item val | Entre `--text-sm` (13px) e `--text-base` (15px) |
| `20px` | stat-card-pl | Entre `--text-lg` (18px) e `--text-xl` (22px) |

**Impacto:** Médio — impede ajustes globais de escala tipográfica. Para um dashboard de dados em que o usuário pode querer fonte maior/menor, isso é relevante.

---

### B-2. `border-radius: 6px` hardcoded

Aparece em vários lugares sem corresponder a nenhum token:

- `.btn-export` → `border-radius: 6px`
- `.metric-formula` → `border-radius: 6px`
- `.analise-toast` → `border-radius: 8px` (usa `--r-sm` mas inline)
- `.term-card` → `border-radius: 6px`
- `.nametag` → `border-radius: 7px`

**Impacto:** Baixo — mas impede coerência visual de cantos. `6px` e `7px` ficam "entre" os tokens e não representam nenhuma escolha declarada.

---

### B-3. `gap` e `padding` hardcoded em vez de tokens

| Valor | Onde |
|---|---|
| `gap: 6px` | ms-btn, analise-sort-bar, .ms-footer |
| `gap: 7px` | stat-card-hdr, .analise-popup-hdr |
| `gap: 3px` | .streak, .quick-btns |
| `gap: 5px` | .ap-btns, .kpi-sparkline, .tcard__wrbar |
| `padding: 0.55rem 0.9rem` | .bet-card-main |
| `padding: 0.75rem 12px` | .term-card, .metric-formula |
| `padding: 0.65rem 12px` | .month-hdr |
| `padding: 5px 12px` | .analise-small-toggle |

**Impacto:** Baixo — mas ruído acumulado dificulta ajustes globais de density.

---

## CATEGORIA C — Componentes sobrepostos / fazendo a mesma função

### C-1. Três variantes de "card de entidade"

O dashboard tem três famílias de cards para representar entidades (esporte, casa, tipster):

| Família | Usado em | Estrutura |
|---|---|---|
| `.stat-card` | Esportes, Casas | 130px fixo, 3 cols no footer |
| `.tcard` | Tipsters | Flexível, 4 cols no footer + sparkline |
| `.analise-card` | Drill-down seleção | Simples, sem hero P/L |

**Problema:** `.stat-card` e `.tcard` são semanticamente equivalentes (card de entidade com P/L hero + métricas no footer) mas têm estruturas HTML, CSS e alturas completamente diferentes. A migração dos Tipsters para `.tcard` criou divergência visual entre as abas.

**Impacto:** Alto — inconsistência visual perceptível. Esportes e Casas parecem "mais antigos" que Tipsters.

---

### C-2. Dois mecanismos de tooltip

| Mecanismo | Arquivo | Quando aparece |
|---|---|---|
| `.fdc-tip` / `.fdc-info` | removido (mas aliases podem subsistir em HTML gerado dinamicamente) | — |
| `.metric-tip` + `_gTip` (global singleton) | `app.js` + `components.css` | Tooltips de métricas em drill-down |

**Problema:** O CLAUDE.md documenta a remoção de `.fdc-info` / `.fdc-tip`, mas o novo sistema `_gTip` é um singleton com lógica não-trivial. Qualquer tooltip fora do padrão tende a ser implementado ad-hoc.

**Impacto:** Médio — risco de regressão em tooltips se alterações no `_gTip` global quebrarem contextos.

---

### C-3. Dois mecanismos de "botão de período rápido"

| Classe | Fonte | Uso |
|---|---|---|
| `.qbtn` | `components.css` | Filtros de data rápidos (7d, 30d, 90d…) na filter bar |
| `.tcard-seg button` | `components.css` | Sort tabs do tcard (P/L, ROI, Turnover…) |
| `.ap-btn` | `layout.css` | Opções do painel Aparência |

Os três têm comportamento idêntico (toggle pill/outline → active preenchido azul) mas CSS completamente separado.

**Impacto:** Médio — tripla manutenção para o mesmo padrão visual.

---

### C-4. Dois sistemas de "filtros de chip" no drill-down

No popup de tipster e no popup de casas existem chips de período (30d, 90d, 1a, tudo) implementados com HTML gerado por JS inline (`_updateDrillChips`, `_updateCasaDrillChips`), sem reutilizar `.qbtn` ou `.tcard-seg`.

**Impacto:** Baixo — mas são uma 4ª implementação do mesmo padrão.

---

## CATEGORIA D — Inconsistências de escala entre componentes similares

### D-1. Padding assimétrico no padrão panelbox

O padrão documentado é `padding: 20px 22px`. Mas na prática:

| Componente | Padding real |
|---|---|
| `.kpi` | `20px 22px` ✓ |
| `.card-body` | `0.1rem 22px 20px` — top inconsistente |
| `.analise-popup-section` | `20px 22px` ✓ |
| `.cal__hero` / `.cal__kpi` | `20px 22px` ✓ |
| `.stat-card` | `16px 20px` — exceção documentada |
| `.tcard` | `20px 22px` ✓ (12px 14px compact) |
| `.filters` | `20px 22px` ✓ |
| `.bet-card-main` | `0.55rem 0.9rem` — ~8.8px / 14.4px |
| `.term-card` | `0.75rem 12px` — ~12px / 12px |

O `card-body` tem `0.1rem` no top (1.6px) — claramente um ajuste de "anular" o padding do header, mas visualmente cria uma assimetria.

---

### D-2. Peso tipográfico inconsistente em "valores numéricos"

| Componente | Peso do valor |
|---|---|
| `.kpi-val` | 800 (extrabold) |
| `.tcard__pl` | 600 (semibold) |
| `.stat-card-pl` | 700 (bold) |
| `.cal__hero .v` | 800 (extrabold) |
| `.cal-tip .ct-pl` | 800 (extrabold) |
| `.bet-num-val` | 700 (bold) |
| `.tcard__roi-val` | 600 (semibold) |

Três pesos diferentes (600/700/800) para o mesmo conceito de "valor numérico hero".

**Impacto:** Médio — hierarquia visual inconsistente. O usuário não lê consistência de importância nos valores.

---

### D-3. Hover de elevação: `translateY` inconsistente

| Componente | Elevação no hover |
|---|---|
| `.card` | `translateY(-1px)` |
| `.analise-card` | `translateY(-1px)` |
| `.tcard` | `translateY(-2px)` |
| `.qbtn`, `.ap-btn` | sem translateY |

`.tcard` eleva o dobro de `.card`. Sem motivação semântica clara.

---

## CATEGORIA E — Problemas de semântica de cor

### E-1. `--border` aponta para `--line-2` (mais fraco), não `--line`

```css
--border:  var(--line-2);  /* rgba(255,255,255, 0.05) — fraquíssimo */
--border2: var(--line);    /* rgba(255,255,255, 0.08) — padrão */
```

O naming sugere que `--border` seria o primário e `--border2` o secundário, mas **a semântica está invertida**. O alias `--border` é o mais fraco dos dois, enquanto `--border2` é o mais usado. Quem escreve `var(--border)` intuitivamente erra.

**Impacto:** Médio — fonte recorrente de bordas "sumindo" em light mode.

---

### E-2. `rgba(255,255,255,0.06)` hardcoded em Chart.js (canvas)

Os arquivos de chart injetam cores de grid e fundo via literal. Isso é **correto e necessário** (canvas não lê CSS vars), mas o comentário/documentação não esclarece quais desses valores devem mudar quando o tema muda.

**Impacto:** Baixo — workaround necessário, mas precisaria de mapeamento explícito dark/light para cada cor canvas.

---

## CATEGORIA F — Estrutura e organização

### F-1. `dashboard.html` legacy no repo principal

`dashboard.html` (v25 monolítica com CSS inline) fica na raiz junto com `index.html` e pode ser confundida com a versão ativa.

**Impacto:** Baixo — risco de confusão para colaboradores.

---

### F-2. `assets/js/data.js` contém lógica de UI

`data.js` exporta constantes (`APPS_SCRIPT_URL`, `BASE_BANK`, `CASA_ICONS`, `SPORT_SVG`, `SPORT_EMOJI`, `HOUSE_DOMAIN`) e também funções de render (`sportEmoji()`, `sportCell()`, `sportSvg()`). A separação de dados e apresentação não está completa.

**Impacto:** Baixo — manutenção, não visual.

---

## SUMÁRIO DE PRIORIDADES

| ID | Inconsistência | Impacto | Complexidade de fix |
|---|---|---|---|
| C-1 | Cards de entidade: 3 famílias divergentes (.stat-card vs .tcard) | Alto | Alto |
| A-3 | Aliases legados ainda usados no JS | Médio | Médio |
| D-2 | Pesos tipográficos inconsistentes nos valores numéricos | Médio | Baixo |
| E-1 | `--border` / `--border2` semântica invertida | Médio | Baixo |
| C-3 | Três implementações de "botão período/toggle" | Médio | Médio |
| A-1 | Dois sets de tokens de border-radius | Médio | Baixo |
| A-2 | Dois sets de tokens de spacing | Médio | Baixo |
| D-1 | Padding panelbox inconsistente | Médio | Baixo |
| B-1 | Font sizes sem token (9px, 10px, 14px, 20px) | Médio | Baixo |
| D-3 | translateY inconsistente nos hovers | Baixo | Trivial |
| B-2 | border-radius 6px/7px hardcoded | Baixo | Trivial |
| C-2 | Dois mecanismos de tooltip | Médio | Médio |
| C-4 | Chips de período no drill-down (4ª implementação) | Baixo | Médio |
| B-3 | Gaps/paddings hardcoded | Baixo | Baixo |
| F-1 | dashboard.html legacy na raiz | Baixo | Trivial |
| F-2 | data.js mistura dados e UI | Baixo | Alto |
