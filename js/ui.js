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
    sel.innerHTML = '<option value="all">All Iraq</option>';
    provinces.forEach(v => sel.innerHTML += `<option value="${v}">${v}</option>`);
  });
};

window.applyFilter = function(fileNum) {
  const state = window.appState[fileNum];
  const select = document.getElementById(`govFilter${fileNum}`);
  if (!select) return;

  const val = select.value || 'all';
  const filtered = val === 'all' ? state.rows : state.rows.filter(r => r[state.govIdx] === val);
  window.renderSingleChart(fileNum, filtered);

  if (fileNum === '1') window.updateSouthConfigChart();
  if (fileNum === '2') window.updateComparisonChart();
};
