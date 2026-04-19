window.exportToExcel = function() {
  const selectedGov = document.getElementById('zoneGovFilter')?.value || 'all';
  let csv = 'Province,Contractor,New Users,Pending Physical,Total\n';
  document.querySelectorAll('#zoneTableBody tr').forEach(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length < 4) return;
    const zoneInfo = tds[0].innerText.split('\n');
    csv += `"${zoneInfo[0]}","${zoneInfo[1]}",${tds[1].innerText.replace(/,/g, '')},${tds[2].innerText.replace(/,/g, '')},${tds[3].innerText.replace(/,/g, '')}\n`;
  });
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `EL_Performance_${selectedGov}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

window.exportChartAsImage = async function(elementId) {
  try {
    window.showToast('Generating High-Res Capture...');
    const target = document.getElementById(elementId);
    const canvas = await html2canvas(target, {
      scale: 5,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        doc.getElementById(elementId).style.padding = '40px';
        doc.getElementById(elementId).style.borderRadius = '0';
      }
    });
    const link = document.createElement('a');
    link.download = `EL_Analytics_${elementId}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    window.showToast('Image exported successfully');
  } catch {
    window.showToast('Export Error');
  }
};


window.exportProvinceData = function(fileNum) {
  const state = window.appState[fileNum];
  if (!state || !state.rows.length || state.govIdx === -1) {
    return window.showToast('No data available for province export');
  }

  const counts = {};
  state.rows.forEach(r => {
    const province = r[state.govIdx] || 'Other';
    counts[province] = (counts[province] || 0) + 1;
  });

  const rows = Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .map(p => `"${p}",${counts[p]}`);

  const csv = `Province,Count\n${rows.join('\n')}\n`;
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `EL_Province_Data_${fileNum}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.showToast('Province data exported');
};
