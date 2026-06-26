// ============================================================
//  BETTING DASHBOARD — Apps Script v6 (cache pré-construído)
//  Cole este código em: Extensões > Apps Script > Code.gs
//
//  MUDANÇA-CHAVE vs v5:
//    O recálculo das fórmulas da planilha (que custava ~150-210s
//    por requisição) deixa de rodar quando VOCÊ abre o dashboard.
//    Agora um gatilho agendado roda rebuildCache() em segundo plano
//    e guarda o JSON pronto num arquivo no Drive. O doGet só LÊ esse
//    arquivo e devolve (~1-2s). getData() permanece IDÊNTICO ao v5.
//
//  PASSO A PASSO DE INSTALAÇÃO (ver instruções detalhadas no chat):
//    1) Cole este arquivo inteiro no Code.gs.
//    2) Rode rebuildCache() uma vez à mão (autoriza o acesso ao Drive).
//    3) Acionadores (relógio) > adicionar > rebuildCache > a cada 30 min.
//    4) Implantar > Gerenciar implantações > Editar > Nova versão.
// ============================================================

const SHEET_NAME = "DB Apostas";

const COL_DATA      = 1;   // A
const COL_ESPORTE   = 2;   // B
const COL_TIPSTER   = 3;   // C
const COL_CASA      = 4;   // D
const COL_PARCEIRO  = 5;   // E
const COL_APOSTA    = 6;   // F
const COL_DESCRICAO = 7;   // G
const COL_STAKE     = 8;   // H
const COL_ODD       = 9;   // I
const COL_RESULTADO = 10;  // J
const COL_PL        = 12;  // L — P/L líquido (fonte de verdade)

// Nome do arquivo de cache no Google Drive (raiz do Meu Drive).
const CACHE_FILE_NAME = "betting-dashboard-cache.json";

// ------------------------------------------------------------
// Entry point GET
//   • normal           → devolve o JSON já pronto do cache (rápido)
//   • ?refresh=1        → reconstrói na hora e devolve fresco (lento)
//   • cache inexistente → fallback: lê ao vivo (lento, só na 1ª vez)
// ------------------------------------------------------------
function doGet(e) {
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  const forceRefresh = e && e.parameter && e.parameter.refresh === "1";

  try {
    if (forceRefresh) {
      output.setContent(rebuildCache());        // reconstrói e já devolve
      return output;
    }

    const cached = readCache();
    if (cached) {
      output.setContent(cached);                // caminho rápido (~1-2s)
      return output;
    }

    // Cache ainda não existe (primeira vez antes do gatilho rodar):
    // serve ao vivo desta vez E grava o cache para as próximas.
    output.setContent(rebuildCache());
  } catch (err) {
    output.setContent(JSON.stringify({ ok: false, error: err.message }));
  }
  return output;
}

// ------------------------------------------------------------
// rebuildCache — roda o getData() pesado, monta o JSON pronto,
// grava no Drive e devolve a string (reusada pelo doGet quando
// precisa servir ao vivo). Esta é a função do gatilho agendado.
// ------------------------------------------------------------
function rebuildCache() {
  const t0 = Date.now();
  const data = getData();
  const payload = JSON.stringify({
    ok: true,
    data: data,
    builtAt: new Date().toISOString(),   // quando o cache foi gerado
    count: data.length,
  });
  writeCache(payload);
  Logger.log("rebuildCache: " + data.length + " apostas em " +
             ((Date.now() - t0) / 1000).toFixed(1) + "s — " +
             (payload.length / 1024 / 1024).toFixed(2) + " MB");
  return payload;
}

// ------------------------------------------------------------
// Helpers de cache em arquivo do Drive
// ------------------------------------------------------------
function _getCacheFile() {
  const it = DriveApp.getFilesByName(CACHE_FILE_NAME);
  return it.hasNext() ? it.next() : null;
}

function writeCache(content) {
  const f = _getCacheFile();
  if (f) { f.setContent(content); return f; }
  return DriveApp.createFile(CACHE_FILE_NAME, content, "application/json");
}

function readCache() {
  const f = _getCacheFile();
  return f ? f.getBlob().getDataAsString() : null;
}

// ------------------------------------------------------------
// Lê e normaliza os dados  —  IDÊNTICO AO v5 (não tocar)
// ------------------------------------------------------------
function getData() {
  const ss = SpreadsheetApp.openById('15UgB5yLtlNbMzTn3nYKFpeXA69C0iwHvTPGeFafq6Rs');
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Aba "${SHEET_NAME}" não encontrada.`);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const rows   = [];

  values.forEach(row => {

    // ── Resultado — única validação obrigatória ────────────
    const resultado = String(row[COL_RESULTADO - 1]).trim().toUpperCase();
    if (!["W","L","V","HW","HL"].includes(resultado)) return;

    // ── Coluna L — deve ser número válido ──────────────────
    const rawPL = row[COL_PL - 1];
    if (typeof rawPL !== 'number') return;  // ignora se não for número nativo
    const lucro = parseFloat(rawPL.toFixed(2));

    // ── Stake ──────────────────────────────────────────────
    const rawStake = row[COL_STAKE - 1];
    const stake = typeof rawStake === 'number' ? rawStake : 0;
    if (stake <= 0) return;

    // ── Odd ────────────────────────────────────────────────
    const rawOdd = row[COL_ODD - 1];
    const odd = typeof rawOdd === 'number' ? rawOdd : parseFloat(String(rawOdd).replace(",",".")) || 0;

    // ── Data ───────────────────────────────────────────────
    const rawData = row[COL_DATA - 1];
    let dataISO = "";
    if (rawData instanceof Date && !isNaN(rawData)) {
      dataISO = Utilities.formatDate(rawData, Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else {
      const parts = String(rawData).split("/");
      if (parts.length === 3) {
        dataISO = `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
      }
    }
    if (!dataISO) return;

    // ── Parceiro ───────────────────────────────────────────
    const parceiroRaw = String(row[COL_PARCEIRO - 1]).trim();
    let conta = parceiroRaw, fornecedor = "";
    const m = parceiroRaw.match(/^(.+?)\s*\[(.+?)\]$/);
    if (m) { conta = m[1].trim(); fornecedor = m[2].trim(); }

    rows.push({
      data:      dataISO,
      esporte:   String(row[COL_ESPORTE   - 1]).trim(),
      tipster:   String(row[COL_TIPSTER   - 1]).trim(),
      casa:      String(row[COL_CASA      - 1]).trim(),
      parceiro:  parceiroRaw,
      conta,
      fornecedor,
      aposta:    String(row[COL_APOSTA    - 1]).trim(),
      descricao: String(row[COL_DESCRICAO - 1]).trim(),
      stake,
      odd,
      resultado,
      lucro,
    });
  });

  return rows;
}

// ------------------------------------------------------------
// Teste — agora também mostra o tempo de leitura ao vivo
// ------------------------------------------------------------
function testar() {
  const t0 = Date.now();
  const rows = getData();
  const segs = ((Date.now() - t0) / 1000).toFixed(1);
  const lucroTotal = rows.reduce((a, r) => a + r.lucro, 0);
  const stakeTotal = rows.reduce((a, r) => a + r.stake, 0);
  Logger.log("Leitura ao vivo: " + segs + "s");
  Logger.log("Total apostas: " + rows.length);
  Logger.log("Lucro total: R$ " + lucroTotal.toFixed(2));
  Logger.log("Stake total: R$ " + stakeTotal.toFixed(2));
  Logger.log("ROI: " + (lucroTotal / stakeTotal * 100).toFixed(2) + "%");
}
