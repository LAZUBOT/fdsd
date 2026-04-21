window.updateSouthConfigChart = function() {
  const state = window.appState['1'];
  
  // التحقق من وجود بيانات
  if (!state.rows.length || state.zoneIdx === -1) {
    document.getElementById('rowCount5').textContent = '0';
    if (window.appState['5'].chart) {
      window.appState['5'].chart.destroy();
      window.appState['5'].chart = null;
    }
    return;
  }

  // إعداد البيانات والمسميات
  const southCodes = ['FTK', 'FBS', 'FNS', 'FMU', 'FAM'];
  const southNames = { 
    FTK: 'Salah aldin', 
    FBS: 'Basrah', 
    FNS: 'Thy Qar', 
    FMU: 'Muthanna', 
    FAM: 'Misan' 
  };
  
  const counts = { FTK: 0, FBS: 0, FNS: 0, FMU: 0, FAM: 0 };
  let totalSouth = 0;

  // حساب الأعداد بناءً على المنطقة
  state.rows.forEach(r => {
    const zone = (r[state.zoneIdx] || '').toUpperCase();
    for (const code of southCodes) {
      if (zone.startsWith(code)) {
        counts[code] += 1;
        totalSouth += 1;
        break;
      }
    }
  });

  // منطق الترتيب (تصاعدي أو تنازلي)
  const sortType = document.getElementById('sortSouth')?.value || 'desc';
  const sortedCodes = [...southCodes].sort((a, b) => {
    return sortType === 'asc' ? counts[a] - counts[b] : counts[b] - counts[a];
  });

  // تحديث إجمالي العدد في واجهة المستخدم
  document.getElementById('rowCount5').textContent = totalSouth.toLocaleString();
  
  const ctx = document.getElementById('canvas5').getContext('2d');
  if (window.appState['5'].chart) window.appState['5'].chart.destroy();

  // لوحة الألوان (Palette)
  const palette = {
    FTK: '#0f766e',
    FBS: '#0d9488',
    FNS: '#14b8a6',
    FMU: '#2dd4bf',
    FAM: '#5eead4'
  };

  // إنشاء الرسم البياني
  window.appState['5'].chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedCodes.map(c => `${c}: ${southNames[c]}`),
      datasets: [{
        data: sortedCodes.map(c => counts[c]),
        backgroundColor: sortedCodes.map(c => palette[c]),
        borderRadius: 6,
        barThickness: 25,
        categoryPercentage: 0.8
      }]
    },
    options: {
      indexAxis: 'y', // تحويل الرسم إلى أفقي
      maintainAspectRatio: false,
      layout: { 
        padding: { top: 10, bottom: 10, left: 10, right: 45 } // مساحة كافية للتسميات جهة اليمين
      },
      plugins: {
        legend: { display: false },
        datalabels: {
          anchor: 'end',
          align: 'right', // وضع الرقم بجانب العمود
          offset: 8,
          font: { weight: '900', size: 13 },
          // تلوين الرقم بنفس لون العمود الخاص به
          color: (context) => context.dataset.backgroundColor[context.dataIndex],
          formatter: (value) => value.toLocaleString()
        }
      },
      scales: {
        x: { 
          display: false, 
          grace: '20%' // ترك مساحة في نهاية المحور الأفقي لعدم قص الأرقام
        },
        y: { 
          grid: { display: false }, 
          ticks: { 
            font: { weight: '700', size: 12 },
            color: '#334155'
          } 
        }
      }
    }
  });
};
