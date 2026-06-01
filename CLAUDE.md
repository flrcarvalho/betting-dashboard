# FDC Capital — Contexto do Projeto

> Leia este arquivo antes de qualquer tarefa. Ele define identidade, padrões e regras para todos os produtos FDC Capital.

---

## Empresa

**FDC Capital** — Sports Analytics & Betting Intelligence  
Transforma dados em decisões melhores através de análise quantitativa.

**O que somos:** Sports Analytics · Betting Intelligence · Data Driven · Quantitative Analysis  
**O que NÃO somos:** Tipster · Canal de palpites · Cassino · Influenciador · Marketing esportivo

**Tagline oficial:** Dados & Análises  
**Mensagem central:** Transformar dados em decisões melhores.

---

## Paleta de Cores

```
--navy:     #081320   → fundo principal (70%)
--blue:     #1E90FF   → ações, CTAs, links (20%)
--cyan:     #00E5FF   → destaques, gradientes (10%)
--graphite: #2D323A   → bordas, divisores
--silver:   #B7BEC8   → texto secundário
--white:    #FFFFFF   → texto principal (dark mode)

Semânticas:
--success:  #00C896   → win, positivo
--warning:  #F5A623   → pending, atenção
--danger:   #FF4757   → loss, erro
```

**Cores proibidas:** vermelho dominante, laranja dominante, verde neon, roxo neon, gradientes multicoloridos.

---

## Tipografia

- **Principal:** `Manrope` (Google Fonts) — pesos 400 / 500 / 600 / 700 / 800
- **Código:** `JetBrains Mono`
- **Alternativa:** `Inter`

```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Escala: 11px (labels) · 13px (body/tabelas) · 15px (texto corrido) · 18px (subtítulos) · 22px (títulos) · 28px (headlines) · 36px (hero)

---

## Design System

### Espaçamento (base 4px)
```
4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96px
```

### Border Radius
```
4px (sm) · 8px (md/padrão) · 12px (cards) · 16px (xl) · 100px (badges/pills)
```

### Borders
```css
--border-subtle:  1px solid rgba(183,190,200,0.08);
--border-default: 1px solid rgba(183,190,200,0.15);
--border-strong:  1px solid rgba(183,190,200,0.25);
--border-blue:    1px solid rgba(30,144,255,0.3);
```

### Surfaces (dark mode)
```css
--surface-1: rgba(13,31,52,0.6);   /* cards */
--surface-2: rgba(13,31,52,0.9);   /* sidebar, modals */
--surface-3: rgba(8,19,32,0.8);    /* inputs */
```

### Sombras
```css
--shadow-sm:   0 1px 3px rgba(0,0,0,0.3);
--shadow-md:   0 4px 16px rgba(0,0,0,0.4);
--shadow-blue: 0 0 24px rgba(30,144,255,0.15);
```

---

## Componentes Padrão

### Botões
```css
/* Primário */
background: #1E90FF; color: #fff; padding: 10px 20px;
border-radius: 8px; font-weight: 600; font-size: 13px;
transition: all 0.2s; border: none;
hover: translateY(-1px) + shadow-blue

/* Secundário */
background: transparent; color: #1E90FF;
border: 1px solid rgba(30,144,255,0.3);
hover: background rgba(30,144,255,0.1)

/* Ghost */
background: rgba(183,190,200,0.06); color: #B7BEC8;
border: 1px solid rgba(183,190,200,0.08);
```

### Inputs
```css
background: rgba(8,19,32,0.8);
border: 1px solid rgba(183,190,200,0.15);
border-radius: 8px; padding: 10px 14px;
color: #fff; font-family: Manrope; font-size: 13px;
focus: border-color #1E90FF + box-shadow 0 0 0 3px rgba(30,144,255,0.1)
```

### Cards
```css
background: rgba(13,31,52,0.6);
border: 1px solid rgba(183,190,200,0.08);
border-radius: 12px; padding: 24px;
```

### Tabelas
```css
header: background rgba(13,31,52,0.8), font 11px uppercase, color silver 50%
row hover: background rgba(30,144,255,0.04)
border-bottom: 1px solid rgba(183,190,200,0.08)
```

### Badges de Status
```
Win/Positivo:  bg rgba(0,200,150,0.12)  · color #00C896 · border rgba(0,200,150,0.2)
Loss/Erro:     bg rgba(255,71,87,0.12)  · color #FF4757 · border rgba(255,71,87,0.2)
Pending:       bg rgba(245,166,35,0.12) · color #F5A623 · border rgba(245,166,35,0.2)
Info/Blue:     bg rgba(30,144,255,0.15) · color #5aaeff · border rgba(30,144,255,0.2)
Cyan:          bg rgba(0,229,255,0.12)  · color #00E5FF · border rgba(0,229,255,0.2)
```

### Stat Cards (KPIs)
```
Label:  Manrope 600 · 11px · uppercase · letter-spacing 0.08em · silver 45%
Valor:  Manrope 800 · 28px · white · letter-spacing -0.03em
Delta:  Manrope 600 · 12px · success (#00C896) ou danger (#FF4757)
```

---

## Tailwind Config (se usar Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy:     '#081320',
        blue:     '#1E90FF',
        cyan:     '#00E5FF',
        graphite: '#2D323A',
        silver:   '#B7BEC8',
        success:  '#00C896',
        warning:  '#F5A623',
        danger:   '#FF4757',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
    },
  },
}
```

---

## Regras Obrigatórias

### SEMPRE
- Dark mode como padrão (fundo `#081320`)
- Fonte Manrope em tudo
- Border-radius 8px nos elementos interativos
- Linguagem técnica, direta, baseada em dados
- Badges coloridos para status de apostas/análises
- Separação clara entre símbolo (gradiente) e tipografia (cor sólida)

### NUNCA
- Gradientes multicoloridos (rainbow)
- Imagens de cassino, fichas, roleta, dinheiro voando
- Textos motivacionais, hype, promessas de lucro
- Roxo ou laranja como cor dominante
- Efeitos neon ou glow excessivo
- Fontes genéricas sem Manrope
- Setas exageradas ou símbolos de riqueza

---

## Hierarquia de Informação (Dashboards)

| Nível | Elemento | Estilo |
|-------|----------|--------|
| 1 | KPI / número principal | Manrope 800, 28–36px, #fff |
| 2 | Label da métrica | Manrope 600, 11px, uppercase, silver 45% |
| 3 | Delta / variação | Manrope 600, 12px, success ou danger |
| 4 | Dados tabulares | Manrope 400, 13px, silver |
| 5 | Meta / badges | Manrope 600, 9–11px, uppercase, 0.2em tracking |

---

## Stack do Projeto

```
Frontend:  React + Next.js · Tailwind CSS · Recharts (gráficos)
Backend:   Python · FastAPI · PostgreSQL
Deploy:    Railway
Bots:      python-telegram-bot 21.6 · pg8000 (PostgreSQL driver puro Python)
Infra:     GitHub → Railway (worker service)
```

### Repositórios ativos
- `anticorner` — Bot Telegram AntiCorner (UNDER tips)
- `bot-odds` — Bot conversor de odds americanas → decimal BR

---

## Submarcas

```
FDC Capital
├── FDC Dashboard   → interface de análise
├── FDC Analytics   → relatórios quantitativos
├── FDC Research    → estudos e publicações
├── FDC Labs        → experimentos e P&D
└── Fernando Carvalho → marca pessoal
```

---

## Logos Disponíveis

Todos os arquivos estão na pasta `/brand/`:

```
brand/
├── logos/
│   ├── 01_logo_principal_dark.png    ← uso principal (fundo navy)
│   ├── 02_logo_principal_light.png   ← uso em fundos brancos
│   ├── 03_logo_compacto_dark.png     ← headers, dashboards
│   ├── 04_logo_compacto_light.png
│   ├── 05_logo_vertical_dark.png     ← apresentações, PPTs
│   ├── 06_logo_vertical_light.png
│   ├── 07_icone_dark.png             ← sidebar, avatar
│   ├── 08_icone_light.png
│   ├── 09_mono_branco.png            ← impressão, bordado
│   ├── 10_mono_preto.png
│   ├── 11_icone_mono_branco.png
│   └── 12_icone_mono_preto.png
├── favicons/
│   ├── favicon-16.png · 32.png · 64.png
│   ├── favicon-128.png · 256.png · 512.png
└── app-icons/
    ├── app-256.png · app-512.png · app-1024.png
```

**Regra:** sempre usar o logo correto para o contexto de fundo.  
**Área de proteção:** espaço mínimo = altura do círculo central do símbolo.  
**Tamanho mínimo:** logo horizontal 120px · ícone 32px.

---

## Como Usar Este Arquivo

Cole este `CLAUDE.md` na **raiz de qualquer projeto** FDC Capital.  
O Claude Code lê automaticamente ao iniciar uma sessão.

Para referenciar em prompts:
> "Use o design system definido no CLAUDE.md deste projeto"

Para outras IAs (GPT, Gemini), copie o conteúdo diretamente no prompt de sistema.

---

*FDC Capital · Design System v1.0 · Sports Analytics & Betting Intelligence*
