window.showToast = function(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'show';
  setTimeout(() => { t.className = ''; }, 3000);
};

window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.id === `btn-${tabId}`) {
      btn.classList.add('tab-active');
      btn.classList.remove('text-slate-500');
    } else {
      btn.classList.remove('tab-active');
      btn.classList.add('text-slate-500');
    }
  });
  if (tabId === 'tab3') window.updateComparisonChart();
  if (tabId === 'tab4') window.updateZoneContractorAnalysis();
  if (tabId === 'tab5') window.updateSouthConfigChart();
};

window.populateFilters = function(fileNum) {
  document.getElementById(`filterArea${fileNum}`)?.classList.remove('hidden');
  const provinces = [...new Set(Object.values(window.govMapping))].sort();
  [`govFilter${fileNum}`, 'zoneGovFilter'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="all">All Iraq</option>';
    provinces.forEach(v => sel.innerHTML += `<option value="${v}">${v}</option>`);
    if (currentVal && [...sel.options].some(o => o.value === currentVal)) sel.value = currentVal;
  });
};

window.applyFilter = function(fileNum) {
  const state = window.appState[fileNum];
  const select = document.getElementById(`govFilter${fileNum}`);
  if (!select) return;

  const val = select.value || 'all';
  const filtered = val === 'all' ? state.rows : state.rows.filter(r => r[state.govIdx] === val);
  window.renderSingleChart(fileNum, filtered);

  if (fileNum === '1') {
    window.updateSouthConfigChart();
    window.updateComparisonChart();
  }
  if (fileNum === '2') {
    window.updateComparisonChart();
    window.updateZoneContractorAnalysis();
  }
};

window.resetAllData = function() {
  ['1', '2'].forEach(fileNum => {
    const state = window.appState[fileNum];
    state.rows = [];
    state.headers = [];
    state.govIdx = -1;
    state.zoneIdx = -1;
    state.contractorIdx = -1;
    state.statusIdx = -1;

    if (state.chart) {
      state.chart.destroy();
      state.chart = null;
    }

    const filterArea = document.getElementById(`filterArea${fileNum}`);
    if (filterArea) filterArea.classList.add('hidden');
    const rowCount = document.getElementById(`rowCount${fileNum}`);
    if (rowCount) rowCount.textContent = '0';
    const fileInput = document.getElementById(`fileInput${fileNum}`);
    if (fileInput) fileInput.value = '';
  });

  ['5'].forEach(key => {
    const st = window.appState[key];
    if (st?.chart) {
      st.chart.destroy();
      st.chart = null;
    }
  });

  if (window.appState.comparisonChart) {
    window.appState.comparisonChart.destroy();
    window.appState.comparisonChart = null;
  }
  if (window.appState.zoneChart) {
    window.appState.zoneChart.destroy();
    window.appState.zoneChart = null;
  }

  const rowCount5 = document.getElementById('rowCount5');
  if (rowCount5) rowCount5.textContent = '0';
  const statTotal = document.getElementById('statTotal');
  if (statTotal) statTotal.textContent = '0';
  const statContractors = document.getElementById('statContractors');
  if (statContractors) statContractors.textContent = '0';
  const search = document.getElementById('contractorSearch');
  if (search) search.value = '';
  const tbody = document.getElementById('zoneTableBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="4" class="p-20 text-center text-slate-400 italic font-medium">Awaiting data upload...</td></tr>';

  window.showToast('All datasets and charts have been reset');
  window.switchTab('tab1');
};
