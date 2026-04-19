window.updateSouthConfigChart = function() {
  const state = window.appState['1'];
  if (!state.rows.length || state.zoneIdx === -1) return;
  const southCodes = ['FTK', 'FBS', 'FNS', 'FMU', 'FAM'];
  const counts = { FTK: 0, FBS: 0, FNS: 0, FMU: 0, FAM: 0, Other: 0 };
  let totalSouth = 0;

  state.rows.forEach(r => {
    const zone = (r[state.zoneIdx] || '').toUpperCase();
    let found = false;
    for (const code of southCodes) {
      if (zone.startsWith(code)) { counts[code]++; totalSouth++; found = true; break; }
    }
    if (!found) counts.Other++;
  });

  document.getElementById('rowCount5').textContent = totalSouth.toLocaleString();
  const ctx = document.getElementById('canvas5').getContext('2d');
  if (window.appState['5'].chart) window.appState['5'].chart.destroy();

  window.appState['5'].chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: southCodes, datasets: [{ data: southCodes.map(c => counts[c]), backgroundColor: ['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#99f6e4'], borderRadius: 12, barThickness: 60 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', font: { weight: '900', size: 14 }, color: '#0d9488' } }, scales: { y: { display: false, grace: '20%' }, x: { grid: { display: false }, ticks: { font: { weight: '800', size: 12 } } } } }
  });
};
