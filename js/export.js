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
        doc.getElementById(elementId).style.padding = '10px';
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
