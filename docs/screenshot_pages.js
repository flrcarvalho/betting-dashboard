const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const DASH_PATH = path.resolve(__dirname, '..', 'index.html');
const OUT_DIR   = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PAGES = [
  { id: 'overview',        label: 'Visão Geral' },
  { id: 'sports',          label: 'Esportes' },
  { id: 'casas',           label: 'Bookies' },
  { id: 'apostas',         label: 'Apostas' },
  { id: 'tipsters',        label: 'Tipsters' },
  { id: 'consolidado',     label: 'Consolidado' },
  { id: 'mensal',          label: 'Mensal' },
  { id: 'diario',          label: 'Diário' },
  { id: 'semana',          label: 'Semana' },
  { id: 'resultados_casa', label: 'Por Casa' },
  { id: 'parceiros',       label: 'Fornecedores' },
  { id: 'custos',          label: 'Custos Contas' },
  { id: 'custos_tipster',  label: 'Custos Tipsters' },
  { id: 'metrics',         label: 'Métricas' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const url = 'file:///' + DASH_PATH.replace(/\\/g, '/');
  console.log('Abrindo:', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Aguarda o loader sumir
  try {
    await page.waitForSelector('.loader', { state: 'hidden', timeout: 20000 });
  } catch(e) {
    console.warn('Loader não encontrou ou timeout — continuando');
  }
  await page.waitForTimeout(1500);

  for (const pg of PAGES) {
    console.log('Capturando:', pg.label);
    // Navega via click no nav-item ou via JS
    const clicked = await page.evaluate((id) => {
      const el = document.querySelector(`.nav-item[data-page="${id}"]`);
      if (el) { el.click(); return true; }
      // fallback: chama showPage diretamente
      if (typeof window.showPage === 'function') { window.showPage(id); return true; }
      return false;
    }, pg.id);

    if (!clicked) {
      console.warn('  ⚠ Não encontrou navegação para:', pg.id);
      continue;
    }

    await page.waitForTimeout(800);

    const fname = `${pg.id}.png`;
    await page.screenshot({
      path: path.join(OUT_DIR, fname),
      fullPage: false,
    });
    console.log('  ✓ Salvo:', fname);
  }

  await browser.close();
  console.log('\nPronto! Screenshots em:', OUT_DIR);
})();
