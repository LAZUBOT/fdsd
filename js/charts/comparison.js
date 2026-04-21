window.updateComparisonChart = function() {
  // 1. التأكد من وجود البيانات الأساسية
  if (!window.appState || !window.appState['1'] || !window.appState['2']) {
    return;
  }

  const sortType = document.getElementById('sortComparison')?.value || 'desc';
  const rows1 = window.appState['1'].rows || [];
  const rows2 = window.appState['2'].rows || [];
  
  const d1 = {}, d2 = {};

  // 2. دالة معالجة البيانات مع تجاهل القيم التالفة أو الفارغة تماماً
  const processRows = (rows, govIdx, targetObj) => {
    rows.forEach(r => {
      if (!r) return; // تجاهل إذا كان السطر نفسه غير موجود
      
      let val = r[govIdx];
      
      // التحقق: إذا كانت القيمة فارغة أو غير معرفة، يتم القفز للسطر التالي (Skip)
      if (val === undefined || val === null || val.toString().trim() === "") {
        return; 
      }

      const label = val.toString().trim();
      targetObj[label] = (targetObj[label] || 0) + 1;
    });
  };

  // معالجة المجموعات (سيتم تجاهل أي خلل تلقائياً هنا)
  processRows(rows1, window.appState['1'].govIdx, d1);
  processRows(rows2, window.appState['2'].govIdx, d2);

  // 3. التحقق مما إذا كان هناك بيانات صالحة للعرض بعد الفلترة
  const labels = Array.from(new Set([...Object.keys(d1), ...Object.keys(d2)]));

  if (labels.length === 0) {
    const ids = ['cmpNewTotal', 'cmpPendingTotal', 'cmpCombinedTotal'];
    ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).textContent = '0'; });
    
    if (window.appState.comparisonChart) {
      window.appState.comparisonChart.destroy();
      window.appState.comparisonChart = null;
    }
    return;
  }

  // 4. ترتيب البيانات
  labels.sort((a, b) => {
    const totalA = (d1[a] || 0) + (d2[a] || 0);
    const totalB = (d1[b] || 0) + (d2[b] || 0);
    if (totalA === totalB) return a.localeCompare(b);
    return sortType === 'desc' ? totalB - totalA : totalA - totalB;
  });

  // 5. تحديث الأرقام الإجمالية (بناءً على البيانات الصالحة فقط)
  const newTotal = Object.values(d1).reduce((a, b) => a + b, 0);
  const pendingTotal = Object.values(d2).reduce((a, b) => a + b, 0);
  const combinedTotal = newTotal + pendingTotal;

  const setElText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text.toLocaleString();
  };

  setElText('cmpNewTotal', newTotal);
  setElText('cmpPendingTotal', pendingTotal);
  setElText('cmpCombinedTotal', combinedTotal);

  // 6. رسم المخطط البياني
  if (window.appState.comparisonChart) window.appState.comparisonChart.destroy();

  const canvas = document.getElementById('canvasComparison');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  window.appState.comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { 
          label: 'New User Acquisition', 
          data: labels.map(l => d1[l] || 0), 
          backgroundColor: '#2563eb', 
          borderRadius: 8, 
          barThickness: 14, 
          categoryPercentage: 0.6 
        },
        { 
          label: 'Pending Physical Install', 
          data: labels.map(l => d2[l] || 0), 
          backgroundColor: '#7c3aed', 
          borderRadius: 8, 
          barThickness: 14, 
          categoryPercentage: 0.6 
        }
      ]
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      layout: { padding: { top: 12, bottom: 12, right: 95, left: 10 } },
      plugins: {
        legend: { position: 'top', align: 'start', labels: { font: { weight: '700', size: 12 }, usePointStyle: true } },
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
        y: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: '700', size: 11 }, padding: 10 } }
      }
    }
  });
};
