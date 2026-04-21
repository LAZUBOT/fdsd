/**
 * Refined CSV Logic & File Handling
 */

// 1. Robust CSV Parser: Handles double-quote escaping ("") and quoted commas
window.parseCSVLine = function(text) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    // Handle escaped quotes: "" -> "
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
      continue;
    }

    // Toggle quote state
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    // Handle delimiters
    if (char === ',' && !inQuotes) {
      result.push(current); 
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  // Single pass trim at the end for efficiency
  return result.map(v => (v || '').trim());
};

// 2. Header Normalization & Schema Validation
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
  
  return { 
    ok: missing.length === 0, 
    zoneIdx, 
    contractorIdx, 
    statusIdx, 
    missing 
  };
};

// 3. Mapping Logic
window.mapProvinceFromZone = function(zoneValue) {
  const zone = (zoneValue || '').toUpperCase();
  for (const [code, name] of Object.entries(window.govMapping || {})) {
    if (zone.startsWith(code)) return name;
  }
  return 'Other';
};

window.normalizeStatus = v => (v || '').toString().trim().toLowerCase();

// 4. Unified File Upload Handler
window.handleFileUpload = function(event, fileNum) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    // Basic line split (Note: does not support newlines inside quoted cells)
    const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
    
    if (lines.length < 2) return window.showToast('File appears to be empty');

    const headers = window.parseCSVLine(lines[0]);
    const state = window.appState[fileNum];
    state.headers = headers;

    const schema = window.validateUploadSchema(fileNum, headers);
    if (!schema.ok) {
      return window.showToast(`Missing required column(s): ${schema.missing.join(', ')}`);
    }

    // Map Schema to State
    state.zoneIdx = schema.zoneIdx;
    state.contractorIdx = schema.contractorIdx;
    state.statusIdx = schema.statusIdx;
    state.govIdx = headers.length; // The new 'Province' column will be at the end

    // Process Rows with safety checks
    const initialRows = lines.slice(1).map(line => {
      const row = window.parseCSVLine(line);
      // Ensure we don't map from an undefined index
      const zoneValue = row[state.zoneIdx] || '';
      const mappedGov = window.mapProvinceFromZone(zoneValue);
      return [...row, mappedGov];
    });

    state.rows = initialRows;

    // Specific logic for File 2: Filter for pending status
    if (fileNum === '2' && state.statusIdx !== -1) {
      state.rows = state.rows.filter(r => 
        window.normalizeStatus(r[state.statusIdx]) === 'pending physical installation'
      );
    }

    // Update UI & Internal State
    window.populateFilters(fileNum);
    window.applyFilter(fileNum);
    
    window.showToast(
      `Success: Dataset ${fileNum} integrated (${state.rows.length}/${initialRows.length} rows)`
    );

    if (fileNum === '1') window.updateSouthConfigChart();
  };
  
  reader.readAsText(file);
};
