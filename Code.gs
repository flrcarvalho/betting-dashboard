// ============================================================
//  BETTING DASHBOARD — Apps Script v6.1 (cache pré-construído)
//  Cole este código em: Extensões > Apps Script > Code.gs
//
//  MUDANÇA-CHAVE vs v6:
//    getData() deixa de ler a planilha via SpreadsheetApp (que
//    ESPERA o recálculo das fórmulas e estourava o teto de 6 min
//    do gatilho → "Exceeded maximum execution time"). Agora lê os
//    VALORES JÁ ARMAZENADOS via Sheets API (serviço avançado):
//    Sheets.Spreadsheets.Values.get com UNFORMATTED_VALUE. Não
//    força recálculo, é uma única chamada HTTP e roda em segundos.
//    O contrato de saída (campos do JSON) é IDÊNTICO ao v6.
//
//  PASSO A PASSO DE INSTALAÇÃO (importante: 2 e 3 são NOVOS):
//    1) Cole este arquivo inteiro no Code.gs.
//    2) Editor > Serviços (＋, painel esquerdo) > "Google Sheets API"
//       > Adicionar. O identificador TEM que ficar como "Sheets".
//    3) Rode rebuildCache() uma vez à mão (reautoriza os acessos).
//    4) Acionadores (relógio) > o gatilho rebuildCache a cada 30 min
//       já existente continua valendo (não precisa recriar).
//    5) Implantar > Gerenciar implantações > Editar > Nova versão.
// ============================================================

const SHEET_NAME = "DB Apostas";
const SPREADSHEET_ID = "15UgB5yLtlNbMzTn3nYKFpeXA69C0iwHvTPGeFafq6Rs";

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
// rebuildCache — roda o getData() (agora rápido), monta o JSON
// pronto, grava no Drive e devolve a string (reusada pelo doGet
// quando precisa servir ao vivo). É a função do gatilho agendado.
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
// Helpers de leitura
// ------------------------------------------------------------

// Célula segura: arrays da Sheets API são "ragged" (linhas com
// células finais vazias vêm mais curtas). Evita "undefined".
function _cell(row, i) {
  return (i < row.length && row[i] != null) ? row[i] : "";
}

// Serial do Sheets (dias desde 1899-12-30) → "yyyy-MM-dd".
// Usa componentes UTC para não deslocar o dia pelo fuso (BRT).
// 25569 = dias entre 1899-12-30 e 1970-01-01.
function _serialToISO(serial) {
  const n = Math.floor(serial);
  const d = new Date((n - 25569) * 86400000);
  const m   = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return d.getUTCFullYear() + "-" + m + "-" + day;
}

// ------------------------------------------------------------
// Lê e normaliza os dados — via Sheets API (sem recálculo).
// Contrato de saída IDÊNTICO ao v6.
// ------------------------------------------------------------
function getData() {
  const resp = Sheets.Spreadsheets.Values.get(
    SPREADSHEET_ID,
    SHEET_NAME + "!A2:L",
    { valueRenderOption: "UNFORMATTED_VALUE", dateTimeRenderOption: "SERIAL_NUMBER" }
  );

  const values = resp.values || [];
  const rows   = [];

  values.forEach(row => {

    // ── Resultado — única validação obrigatória ────────────
    const resultado = String(_cell(row, COL_RESULTADO - 1)).trim().toUpperCase();
    if (!["W","L","V","HW","HL"].includes(resultado)) return;

    // ── Coluna L — deve ser número válido ──────────────────
    const rawPL = _cell(row, COL_PL - 1);
    if (typeof rawPL !== 'number') return;  // ignora se não for número nativo
    const lucro = parseFloat(rawPL.toFixed(2));

    // ── Stake ──────────────────────────────────────────────
    const rawStake = _cell(row, COL_STAKE - 1);
    const stake = typeof rawStake === 'number' ? rawStake : 0;
    if (stake <= 0) return;

    // ── Odd ────────────────────────────────────────────────
    const rawOdd = _cell(row, COL_ODD - 1);
    const odd = typeof rawOdd === 'number' ? rawOdd : parseFloat(String(rawOdd).replace(",",".")) || 0;

    // ── Data ───────────────────────────────────────────────
    // UNFORMATTED_VALUE + SERIAL_NUMBER: datas chegam como número
    // (serial). Texto "DD/MM/YYYY" continua string (fallback).
    const rawData = _cell(row, COL_DATA - 1);
    let dataISO = "";
    if (typeof rawData === 'number' && rawData > 0) {
      dataISO = _serialToISO(rawData);
    } else {
      const parts = String(rawData).split("/");
      if (parts.length === 3) {
        dataISO = `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
      }
    }
    if (!dataISO) return;

    // ── Parceiro ───────────────────────────────────────────
    const parceiroRaw = String(_cell(row, COL_PARCEIRO - 1)).trim();
    let conta = parceiroRaw, fornecedor = "";
    const m = parceiroRaw.match(/^(.+?)\s*\[(.+?)\]$/);
    if (m) { conta = m[1].trim(); fornecedor = m[2].trim(); }

    rows.push({
      data:      dataISO,
      esporte:   String(_cell(row, COL_ESPORTE   - 1)).trim(),
      tipster:   String(_cell(row, COL_TIPSTER   - 1)).trim(),
      casa:      String(_cell(row, COL_CASA      - 1)).trim(),
      parceiro:  parceiroRaw,
      conta,
      fornecedor,
      aposta:    String(_cell(row, COL_APOSTA    - 1)).trim(),
      descricao: String(_cell(row, COL_DESCRICAO - 1)).trim(),
      stake,
      odd,
      resultado,
      lucro,
    });
  });

  return rows;
}

// ------------------------------------------------------------
// Teste — mostra o tempo de leitura (agora deve ser segundos)
// ------------------------------------------------------------
function testar() {
  const t0 = Date.now();
  const rows = getData();
  const segs = ((Date.now() - t0) / 1000).toFixed(1);
  const lucroTotal = rows.reduce((a, r) => a + r.lucro, 0);
  const stakeTotal = rows.reduce((a, r) => a + r.stake, 0);
  Logger.log("Leitura via Sheets API: " + segs + "s");
  Logger.log("Total apostas: " + rows.length);
  Logger.log("Lucro total: R$ " + lucroTotal.toFixed(2));
  Logger.log("Stake total: R$ " + stakeTotal.toFixed(2));
  Logger.log("ROI: " + (lucroTotal / stakeTotal * 100).toFixed(2) + "%");
}
