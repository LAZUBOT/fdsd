window.updateZoneContractorAnalysis = function() {
  const tbody = document.getElementById('zoneTableBody');
  const selectedGov = document.getElementById('zoneGovFilter')?.value || 'all';
  if (!tbody) return;
  tbody.innerHTML = '';

  if (window.appState['1'].contractorIdx === -1 || window.appState['2'].contractorIdx === -1) {
    tbody.innerHTML = '<tr><td colspan="4">Upload valid datasets with Contractor column first.</td></tr>';
    return;
  }

  const masterMap = {};
  const processRows = (rows, type, state) => {
    rows.forEach(r => {
      const zone = r[state.govIdx];
      if (selectedGov !== 'all' && zone !== selectedGov) return;
      const con = (r[state.contractorIdx] || 'Non-Contracted').trim();
      if (zone === 'Other') return;
      if (!masterMap[zone]) masterMap[zone] = {};
      if (!masterMap[zone][con]) masterMap[zone][con] = { new: 0, pending: 0 };
      masterMap[zone][con][type]++;
    });
  };

  processRows(window.appState['1'].rows, 'new', window.appState['1']);
  processRows(window.appState['2'].rows, 'pending', window.appState['2']);

  const sortedZones = Object.keys(masterMap).sort();
  if (sortedZones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No results found for current filter.</td></tr>';
    return;
  }

  const chartData = { labels: [], newUsers: [], pendingUsers: [] };
  let totalUnitCount = 0;
  let contractorCount = 0;

  sortedZones.forEach(zName => {
    Object.keys(masterMap[zName]).forEach(cName => {
      const stats = masterMap[zName][cName];
      const rowTotal = stats.new + stats.pending;
      totalUnitCount += rowTotal;
      contractorCount++;
      if (chartData.labels.length < 15) {
        chartData.labels.push(cName.length > 22 ? `${cName.substring(0, 20)}...` : cName);
        chartData.newUsers.push(stats.new);
        chartData.pendingUsers.push(stats.pending);
      }
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${zName}<br>${cName}</td><td>${stats.new}</td><td>${stats.pending}</td><td>${rowTotal}</td>`;
      tbody.appendChild(tr);
    });
  });

  document.getElementById('statTotal').textContent = totalUnitCount.toLocaleString();
  document.getElementById('statContractors').textContent = contractorCount;

  if (window.appState.zoneChart) window.appState.zoneChart.destroy();
  const ctx = document.getElementById('canvasZoneChart').getContext('2d');
  window.appState.zoneChart = new Chart(ctx, {
    type: 'bar',
    data: { labels: chartData.labels, datasets: [{ label: 'New', data: chartData.newUsers, backgroundColor: '#2563eb' }, { label: 'Pending', data: chartData.pendingUsers, backgroundColor: '#7c3aed' }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: { x: { stacked: true, display: false }, y: { stacked: true, grid: { display: false } } } }
  });
};
