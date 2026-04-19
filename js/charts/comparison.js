window.updateComparisonChart = function() {
  const sortType = document.getElementById('sortComparison')?.value || 'desc';
  let labels = [];
  const d1 = {}, d2 = {};

  if (!window.appState['1'].rows.length && !window.appState['2'].rows.length) {
    const newTotalEl = document.getElementById('cmpNewTotal');
    const pendingTotalEl = document.getElementById('cmpPendingTotal');
    const combinedTotalEl = document.getElementById('cmpCombinedTotal');
    if (newTotalEl) newTotalEl.textContent = '0';
    if (pendingTotalEl) pendingTotalEl.textContent = '0';
    if (combinedTotalEl) combinedTotalEl.textContent = '0';
    if (window.appState.comparisonChart) {
      window.appState.comparisonChart.destroy();
      window.appState.comparisonChart = null;
    }
    return;
  }

  window.appState['1'].rows.forEach(r => { const g = r[window.appState['1'].govIdx]; d1[g] = (d1[g] || 0) + 1; });
  window.appState['2'].rows.forEach(r => { const g = r[window.appState['2'].govIdx]; d2[g] = (d2[g] || 0) + 1; });

  labels = Array.from(new Set([...Object.keys(d1), ...Object.keys(d2)]));
  if (!labels.length) labels = [...new Set(Object.values(window.govMapping))];

  labels.sort((a, b) => {
    const totalA = (d1[a] || 0) + (d2[a] || 0);
    const totalB = (d1[b] || 0) + (d2[b] || 0);
    if (totalA === totalB) return a.localeCompare(b);
    return sortType === 'desc' ? totalB - totalA : totalA - totalB;
  });

  const newTotal = Object.values(d1).reduce((a, b) => a + b, 0);
  const pendingTotal = Object.values(d2).reduce((a, b) => a + b, 0);
  const combinedTotal = newTotal + pendingTotal;
  const newTotalEl = document.getElementById('cmpNewTotal');
  const pendingTotalEl = document.getElementById('cmpPendingTotal');
  const combinedTotalEl = document.getElementById('cmpCombinedTotal');
  if (newTotalEl) newTotalEl.textContent = newTotal.toLocaleString();
  if (pendingTotalEl) pendingTotalEl.textContent = pendingTotal.toLocaleString();
  if (combinedTotalEl) combinedTotalEl.textContent = combinedTotal.toLocaleString();

  if (window.appState.comparisonChart) window.appState.comparisonChart.destroy();

  const canvas = document.getElementById('canvasComparison');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  window.appState.comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'New User Acquisition', data: labels.map(l => d1[l] || 0), backgroundColor: '#2563eb', borderRadius: 8, barThickness: 16 },
        { label: 'Pending Physical Install', data: labels.map(l => d2[l] || 0), backgroundColor: '#7c3aed', borderRadius: 8, barThickness: 16 }
      ]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      layout: { padding: { right: 95, left: 6 } },
      plugins: {
        legend: { position: 'top', align: 'start', labels: { font: { weight: '700', size: 12 }, padding: 18, usePointStyle: true } },
        datalabels: {
          anchor: 'end',
          align: 'right',
          offset: 10,
          font: { size: 11, weight: '900' },
          formatter: v => v > 0 ? v.toLocaleString() : '',
          color: (context) => context.dataset.backgroundColor
        }
      },
      scales: {
        x: { grid: { color: '#f1f5f9' }, border: { display: false }, grace: '28%', ticks: { display: false } },
        y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: '700', size: 11 } } }
      }
    }
  });
};
