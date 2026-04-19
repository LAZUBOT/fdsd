window.updateSouthConfigChart = function() {
  const state = window.appState['1'];
  if (!state.rows.length || state.zoneIdx === -1) {
    document.getElementById('rowCount5').textContent = '0';
    if (window.appState['5'].chart) {
      window.appState['5'].chart.destroy();
      window.appState['5'].chart = null;
    }
    return;
  }

  const southCodes = ['FTK', 'FBS', 'FNS', 'FMU', 'FAM'];
  const southNames = { FTK: 'Salah aldin', FBS: 'Basrah', FNS: 'Thy Qar', FMU: 'Muthanna', FAM: 'Misan' };
  const counts = { FTK: 0, FBS: 0, FNS: 0, FMU: 0, FAM: 0, Other: 0 };
  let totalSouth = 0;

  state.rows.forEach(r => {
    const zone = (r[state.zoneIdx] || '').toUpperCase();
    let found = false;
    for (const code of southCodes) {
      if (zone.startsWith(code)) {
        counts[code] += 1;
        totalSouth += 1;
        found = true;
        break;
      }
    }
    if (!found) counts.Other += 1;
  });

  const sortType = document.getElementById('sortSouth')?.value || 'desc';
  const sortedCodes = [...southCodes].sort((a, b) => {
    return sortType === 'asc' ? counts[a] - counts[b] : counts[b] - counts[a];
  });

  document.getElementById('rowCount5').textContent = totalSouth.toLocaleString();
  const ctx = document.getElementById('canvas5').getContext('2d');
  if (window.appState['5'].chart) window.appState['5'].chart.destroy();

  const palette = {
    FTK: '#0f766e',
    FBS: '#0d9488',
    FNS: '#14b8a6',
    FMU: '#2dd4bf',
    FAM: '#99f6e4'
  };

  window.appState['5'].chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedCodes.map(c => `${c}: ${southNames[c]}`),
      datasets: [{
        data: sortedCodes.map(c => counts[c]),
        backgroundColor: sortedCodes.map(c => palette[c] || '#0d9488'),
        borderRadius: 12,
        barThickness: 60
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: { anchor: 'end', align: 'top', font: { weight: '900', size: 14 }, color: '#0d9488' }
      },
      scales: {
        y: { display: false, grace: '20%' },
        x: { grid: { display: false }, ticks: { font: { weight: '800', size: 12 } } }
      }
    }
  });
};
