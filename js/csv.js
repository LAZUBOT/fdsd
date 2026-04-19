window.parseCSVLine = function(text) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result.map(v => v.trim());
};

window.normalizeHeader = h => (h || '').toString().trim().toLowerCase();
window.findHeaderIndex = function(headers, candidates) {
  const normalized = headers.map(window.normalizeHeader);
  for (const c of candidates) {
    const idx = normalized.findIndex(h => h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
};

window.validateUploadSchema = function(fileNum, headers) {
  const zoneIdx = window.findHeaderIndex(headers, ['zone']);
  const contractorIdx = window.findHeaderIndex(headers, ['contractor']);
  const statusIdx = window.findHeaderIndex(headers, ['status']);
  const missing = [];
  if (zoneIdx === -1) missing.push('Zone');
  if (contractorIdx === -1) missing.push('Contractor');
  if (fileNum === '2' && statusIdx === -1) missing.push('Status');
  return { ok: missing.length === 0, zoneIdx, contractorIdx, statusIdx, missing };
};

window.mapProvinceFromZone = function(zoneValue) {
  const zone = (zoneValue || '').toUpperCase();
  for (const [code, name] of Object.entries(window.govMapping)) {
    if (zone.startsWith(code)) return name;
  }
  return 'Other';
};

window.normalizeStatus = v => (v || '').toString().trim().toLowerCase();

window.handleFileUpload = function(event, fileNum) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return window.showToast('File appears to be empty');

    const headers = window.parseCSVLine(lines[0]);
    const state = window.appState[fileNum];
    state.headers = headers;

    const schema = window.validateUploadSchema(fileNum, headers);
    if (!schema.ok) return window.showToast(`Missing required column(s): ${schema.missing.join(', ')}`);

    state.zoneIdx = schema.zoneIdx;
    state.contractorIdx = schema.contractorIdx;
    state.statusIdx = schema.statusIdx;
    state.govIdx = headers.length;

    const initialRows = lines.slice(1).map(line => {
      const row = window.parseCSVLine(line);
      const mappedGov = window.mapProvinceFromZone(row[state.zoneIdx] || '');
      return [...row, mappedGov];
    });

    state.rows = initialRows;

    if (fileNum === '2' && state.statusIdx !== -1) {
      state.rows = state.rows.filter(r => window.normalizeStatus(r[state.statusIdx]) === 'pending physical installation');
    }

    window.populateFilters(fileNum);
    window.applyFilter(fileNum);
    window.showToast(`Success: Dataset ${fileNum} integrated (${state.rows.length}/${initialRows.length} rows)`);
    if (fileNum === '1') window.updateSouthConfigChart();
  };
  reader.readAsText(file);
};
