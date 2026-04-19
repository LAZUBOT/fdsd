window.renderSingleChart = function(fileNum, data) {
  document.getElementById(`rowCount${fileNum}`).textContent = data.length.toLocaleString();
  const counts = {};
  data.forEach(r => { const g = r[window.appState[fileNum].govIdx]; counts[g] = (counts[g] || 0) + 1; });
  const labels = Object.values(window.govMapping).filter(l => counts[l]).sort((a, b) => counts[b] - counts[a]);

  if (window.appState[fileNum].chart) window.appState[fileNum].chart.destroy();
  const ctx = document.getElementById(`canvas${fileNum}`).getContext('2d');
  window.appState[fileNum].chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: labels.map(l => counts[l]), backgroundColor: fileNum === '1' ? '#2563eb' : '#7c3aed', borderRadius: 12, barThickness: 28 }] },
    options: {
      indexAxis: 'y', maintainAspectRatio: false,
      plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'right', offset: 12, font: (ctx) => { const v = Number(ctx?.dataset?.data?.[ctx.dataIndex] || 0); return { weight: '800', size: v >= 350 ? 15 : 11 }; }, color: '#64748b' } },
      scales: { x: { display: false, grid: { display: false }, grace: '15%' }, y: { grid: { display: false }, ticks: { font: { weight: '700' } } } }
    }
  });
};
