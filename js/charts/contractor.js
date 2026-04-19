window.updateZoneContractorAnalysis = function() {
  const tbody = document.getElementById('zoneTableBody');
  const filterEl = document.getElementById('zoneGovFilter');
  const totalEl = document.getElementById('statTotal');
  const contractorEl = document.getElementById('statContractors');
  const chartEl = document.getElementById('canvasZoneChart');

  if (!tbody || !filterEl || !totalEl || !contractorEl || !chartEl) return;

  const selectedGov = filterEl.value || 'all';
  const search = (document.getElementById('contractorSearch')?.value || '').trim().toLowerCase();
  tbody.innerHTML = '';

  const state1 = window.appState['1'];
  const state2 = window.appState['2'];
  const hasData1 = state1.rows.length > 0 && state1.contractorIdx !== -1;
  const hasData2 = state2.rows.length > 0 && state2.contractorIdx !== -1;

  if (!hasData1 && !hasData2) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-20 text-center text-slate-400 italic font-medium">Upload at least one valid dataset with Contractor and Zone columns.</td></tr>';
    totalEl.textContent = '0';
    contractorEl.textContent = '0';
    if (window.appState.zoneChart) {
      window.appState.zoneChart.destroy();
      window.appState.zoneChart = null;
    }
    return;
  }

  const masterMap = {};
  const processRows = (rows, type, state) => {
    rows.forEach(r => {
      const province = r[state.govIdx];
      if (selectedGov !== 'all' && province !== selectedGov) return;
      if (province === 'Other') return;

      const contractor = (r[state.contractorIdx] || 'Non-Contracted').trim() || 'Non-Contracted';
      if (search && !contractor.toLowerCase().includes(search)) return;
      if (!masterMap[province]) masterMap[province] = {};
      if (!masterMap[province][contractor]) masterMap[province][contractor] = { new: 0, pending: 0 };
      masterMap[province][contractor][type] += 1;
    });
  };

  if (hasData1) processRows(state1.rows, 'new', state1);
  if (hasData2) processRows(state2.rows, 'pending', state2);

  const sortedZones = Object.keys(masterMap).sort();
  if (sortedZones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="p-20 text-center text-slate-400 italic font-medium">No results found for current filter.</td></tr>';
    totalEl.textContent = '0';
    contractorEl.textContent = '0';
    if (window.appState.zoneChart) {
      window.appState.zoneChart.destroy();
      window.appState.zoneChart = null;
    }
    return;
  }

  const chartData = { labels: [], newUsers: [], pendingUsers: [] };
  let totalUnitCount = 0;
  let contractorCount = 0;

  sortedZones.forEach(zoneName => {
    const contractorNames = Object.keys(masterMap[zoneName]).sort((a, b) => {
      const totalA = masterMap[zoneName][a].new + masterMap[zoneName][a].pending;
      const totalB = masterMap[zoneName][b].new + masterMap[zoneName][b].pending;
      return totalB - totalA;
    });

    contractorNames.forEach(contractorName => {
      const stats = masterMap[zoneName][contractorName];
      const rowTotal = stats.new + stats.pending;
      totalUnitCount += rowTotal;
      contractorCount += 1;

      if (chartData.labels.length < 15) {
        chartData.labels.push(contractorName.length > 22 ? `${contractorName.substring(0, 20)}...` : contractorName);
        chartData.newUsers.push(stats.new);
        chartData.pendingUsers.push(stats.pending);
      }

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition-colors group';
      tr.innerHTML = `
        <td class="px-8 py-5">
          <span class="block text-[9px] font-black text-blue-500 uppercase tracking-tighter mb-1">${zoneName}</span>
          <span class="text-slate-900 font-bold">${contractorName}</span>
        </td>
        <td class="px-6 py-5 text-center font-bold text-blue-600">${stats.new.toLocaleString()}</td>
        <td class="px-6 py-5 text-center font-bold text-purple-600">${stats.pending.toLocaleString()}</td>
        <td class="px-8 py-5 text-center font-black text-slate-900 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-all">${rowTotal.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  totalEl.textContent = totalUnitCount.toLocaleString();
  contractorEl.textContent = contractorCount.toLocaleString();

  if (window.appState.zoneChart) window.appState.zoneChart.destroy();
  const ctx = chartEl.getContext('2d');
  window.appState.zoneChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        { label: 'New', data: chartData.newUsers, backgroundColor: '#2563eb', barThickness: 18, categoryPercentage: 0.62 },
        { label: 'Pending', data: chartData.pendingUsers, backgroundColor: '#7c3aed', barThickness: 18, categoryPercentage: 0.62 }
      ]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', align: 'end', labels: { font: { weight: '700' }, boxWidth: 12 } },
        datalabels: { color: '#fff', font: { size: 9, weight: '900' }, formatter: v => v > 0 ? v : '' }
      },
      scales: {
        x: { stacked: true, display: false, grace: '5%' },
        y: { stacked: true, grid: { display: false }, ticks: { font: { weight: '700', size: 11 }, padding: 10 } }
      }
    }
  });
};
