window._rafJobs = {};

window.scheduleUpdate = function(key, fn) {
  if (window._rafJobs[key]) cancelAnimationFrame(window._rafJobs[key]);
  window._rafJobs[key] = requestAnimationFrame(() => {
    fn();
    delete window._rafJobs[key];
  });
};

// Keep track of the timeout to prevent overlapping toasts hiding each other
let toastTimeout; 
window.showToast = function(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  
  t.textContent = msg;
  t.classList.add('show');
  
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3000);
};

window.switchTab = function(tabId) {
  // Use classList.toggle for cleaner state management
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('hidden', t.id !== tabId));
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.id === `btn-${tabId}`;
    btn.classList.toggle('tab-active', isActive);
    btn.classList.toggle('text-slate-500', !isActive);
  });

  // Map specific actions to tabs instead of chained IF statements
  const tabActions = {
    'tab3': () => window.scheduleUpdate('cmp-tab', window.updateComparisonChart),
    'tab4': () => window.scheduleUpdate('contractor-tab', window.updateZoneContractorAnalysis),
    'tab5': () => window.scheduleUpdate('south-tab', window.updateSouthConfigChart)
  };

  if (tabActions[tabId]) tabActions[tabId]();
};

window.populateFilters = function(fileNum) {
  document.getElementById(`filterArea${fileNum}`)?.classList.remove('hidden');
  
  const provinces = [...new Set(Object.values(window.govMapping || {}))].sort();
  
  // Batch HTML construction to prevent multiple costly DOM reflows
  const optionsHTML = '<option value="all">All Iraq</option>' + 
    provinces.map(v => `<option value="${v}">${v}</option>`).join('');

  [`govFilter${fileNum}`, 'zoneGovFilter'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    
    const currentVal = sel.value;
    sel.innerHTML = optionsHTML; 
    
    // Efficiently restore previous value if it exists in the new options
    if (currentVal && provinces.includes(currentVal)) {
      sel.value = currentVal;
    }
  });
};

window.applyFilter = function(fileNum) {
  const state = window.appState[fileNum];
  const select = document.getElementById(`govFilter${fileNum}`);
  if (!state || !select) return;

  const val = select.value || 'all';
  const filtered = val === 'all' ? state.rows : state.rows.filter(r => r[state.govIdx] === val);
  
  window.scheduleUpdate(`single-${fileNum}`, () => window.renderSingleChart(fileNum, filtered));

  // Data-driven update dependencies
  const updates = {
    '1': [
      { key: 'south-filter', fn: window.updateSouthConfigChart },
      { key: 'cmp-filter-1', fn: window.updateComparisonChart }
    ],
    '2': [
      { key: 'cmp-filter-2', fn: window.updateComparisonChart },
      { key: 'contractor-filter-2', fn: window.updateZoneContractorAnalysis }
    ]
  };

  if (updates[fileNum]) {
    updates[fileNum].forEach(u => window.scheduleUpdate(u.key, u.fn));
  }
};

window.resetAllData = function() {
  const resetElements = (fileNum) => {
    document.getElementById(`filterArea${fileNum}`)?.classList.add('hidden');
    const rowCount = document.getElementById(`rowCount${fileNum}`);
    if (rowCount) rowCount.textContent = '0';
    const fileInput = document.getElementById(`fileInput${fileNum}`);
    if (fileInput) fileInput.value = '';
  };

  // Reset file states (1 and 2)
  ['1', '2'].forEach(fileNum => {
    const state = window.appState[fileNum];
    if (state) {
      Object.assign(state, { rows: [], headers: [], govIdx: -1, zoneIdx: -1, contractorIdx: -1, statusIdx: -1 });
      if (state.chart) {
        state.chart.destroy();
        state.chart = null;
      }
    }
    resetElements(fileNum);
  });

  // Destroy remaining explicit charts
  ['5', 'comparisonChart', 'zoneChart'].forEach(key => {
    const target = key.length === 1 ? window.appState[key] : window.appState;
    const chartKey = key.length === 1 ? 'chart' : key;
    
    if (target?.[chartKey]) {
      target[chartKey].destroy();
      target[chartKey] = null;
    }
  });

  // Reset loose UI elements safely
  const uiDefaults = {
    'rowCount5': '0',
    'statTotal': '0',
    'statContractors': '0'
  };
  
  Object.entries(uiDefaults).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  const search = document.getElementById('contractorSearch');
  if (search) search.value = '';

  const tbody = document.getElementById('zoneTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="p-20 text-center text-slate-400 italic font-medium">Awaiting data upload...</td></tr>';

  window.showToast('All datasets and charts have been reset');
  window.switchTab('tab1');
};
