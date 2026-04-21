window.updateComparisonChart = function() {
  // 1. التحقق الأولي من وجود البيانات لتجنب الأخطاء البرمجية
  if (!window.appState || !window.appState['1'] || !window.appState['2']) {
    console.warn("Comparison Chart: البيانات غير مكتملة في appState.");
    return;
  }

  const sortType = document.getElementById('sortComparison')?.value || 'desc';
  const rows1 = window.appState['1'].rows || [];
  const rows2 = window.appState['2'].rows || [];
  
  const d1 = {}, d2 = {};

  // 2. دالة داخلية لتجميع البيانات ومعالجة القيم غير المعرفة (Fix undefined issue)
  const processRows = (rows, govIdx, targetObj) => {
    rows.forEach(r => {
      let val = r[govIdx];
      // إذا كانت القيمة غير موجودة أو فارغة، نضعها تحت مسمى "غير محدد" أو نتجاهلها
      const label = (val !== undefined && val !== null && val.toString().trim() !== "") 
                    ? val.toString().trim() 
                    : "0";
      targetObj[label] = (targetObj[label] || 0) + 1;
    });
  };

  // 3. التحقق من وجود بيانات لعرضها
  if (rows1.length === 0 && rows2.length === 0) {
    const elements = ['cmpNewTotal', 'cmpPendingTotal', 'cmpCombinedTotal'];
    elements.forEach(id => { if(document.getElementById(id)) document.getElementById(id).textContent = '0'; });
    
    if (window.appState.comparisonChart) {
      window.appState.comparisonChart.destroy();
      window.appState.comparisonChart = null;
    }
    return;
  }

  // معالجة المجموعات
  processRows(rows1, window.appState['1'].govIdx, d1);
  processRows(rows2, window.appState['2'].govIdx, d2);

  // 4. إنشاء القائمة الموحدة للعناوين (Labels) وترتيبها
  let labels = Array.from(new Set([...Object.keys(d1), ...Object.keys(d2)]));

  labels.sort((a, b) => {
    const totalA = (d1[a] || 0) + (d2[a] || 0);
    const totalB = (d1[b] || 0) + (d2[b] || 0);
    if (totalA === totalB) return a.localeCompare(b);
    return sortType === 'desc' ? totalB - totalA : totalA - totalB;
  });

  // 5. تحديث الأرقام الإجمالية في واجهة المستخدم
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

  // 6. تدمير المخطط القديم لإنشاء الجديد (بناءً على طلب Chart.js)
  if (window.appState.comparisonChart) {
    window.appState.comparisonChart.destroy();
  }

  const canvas = document.getElementById('canvasComparison');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // 7. إنشاء الرسم البياني الجديد
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
        legend: { 
          position: 'top', 
          align: 'start', 
          labels: { font: { weight: '700', size: 12 }, padding: 18, usePointStyle: true } 
        },
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
