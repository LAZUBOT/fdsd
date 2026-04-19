window.updateComparisonChart = function() {
  const sortType = document.getElementById('sortComparison')?.value || 'desc';
  const labels = [...new Set(Object.values(window.govMapping))];
  const d1 = {}, d2 = {};
  window.appState['1'].rows.forEach(r => { const g = r[window.appState['1'].govIdx]; d1[g] = (d1[g] || 0) + 1; });
  window.appState['2'].rows.forEach(r => { const g = r[window.appState['2'].govIdx]; d2[g] = (d2[g] || 0) + 1; });

  labels.sort((a, b) => {
    const totalA = (d1[a] || 0) + (d2[a] || 0);
    const totalB = (d1[b] || 0) + (d2[b] || 0);
    return sortType === 'desc' ? totalB - totalA : totalA - totalB;
  });

  if (window.appState.comparisonChart) window.appState.comparisonChart.destroy();
  const ctx = document.getElementById('canvasComparison').getContext('2d');
  window.appState.comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'New User Acquisition', data: labels.map(l => d1[l] || 0), backgroundColor: '#2563eb', borderRadius: 8, barThickness: 14 },
        { label: 'Pending Physical Install', data: labels.map(l => d2[l] || 0), backgroundColor: '#7c3aed', borderRadius: 8, barThickness: 14 }
      ]
    },
    options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { position: 'top', align: 'start' }, datalabels: { anchor: 'end', align: 'right', offset: 10, formatter: v => v > 0 ? v.toLocaleString() : '' } }, scales: { x: { ticks: { display: false } }, y: { grid: { display: false } } } }
  });
};
