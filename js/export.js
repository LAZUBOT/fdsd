/**
 * Smart Export System
 * Features: Excel (XLSX) with Auto-fit, Image (PNG), and Province Statistics
 */

(function() {
    // --- Internal Helper Functions ---

    /**
     * Calculates column widths based on content to achieve 'Auto-fit'
     * @param {Array[]} data - 2D array of table data
     */
    const calculateColumnWidths = (data) => {
        return data[0].map((_, colIndex) => {
            const maxWidth = data.reduce((max, row) => {
                const value = row[colIndex] ? row[colIndex].toString() : "";
                // Measure length: assign more weight to characters for safety
                const len = value.split('').reduce((acc, char) => {
                    // Check if character is non-Latin (like Arabic) to give more space
                    return acc + (char.charCodeAt(0) > 128 ? 2 : 1.1);
                }, 0);
                return Math.max(max, len);
            }, 10); // Minimum width of 10
            return { wch: maxWidth + 3 }; // Add extra padding
        });
    };

    // --- Core Export Functions ---

    /**
     * 1. Exports the Performance Table to XLSX with Auto-fit
     */
    window.exportToExcel = function() {
        try {
            const selectedGov = document.getElementById('zoneGovFilter')?.value || 'all';
            const tableData = [['Province', 'Contractor', 'New Users', 'Pending Physical', 'Total']];
            
            const rows = document.querySelectorAll('#zoneTableBody tr');
            if (rows.length === 0) {
                return window.showToast?.('No data found in the table to export');
            }

            rows.forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length < 4) return;
                
                const zoneInfo = tds[0].innerText.split('\n');
                tableData.push([
                    zoneInfo[0] || "",                                // Province Name
                    zoneInfo[1] || "",                                // Contractor Name
                    Number(tds[1].innerText.replace(/,/g, '')) || 0,  // New Users
                    Number(tds[2].innerText.replace(/,/g, '')) || 0,  // Pending Physical
                    Number(tds[3].innerText.replace(/,/g, '')) || 0   // Total
                ]);
            });

            // Create Worksheet and apply Auto-fit
            const ws = XLSX.utils.aoa_to_sheet(tableData);
            ws['!cols'] = calculateColumnWidths(tableData);

            // Create Workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Performance Report");

            // Generate Filename and Save
            const dateStr = new Date().toISOString().split('T')[0];
            XLSX.writeFile(wb, `EL_Performance_${selectedGov}_${dateStr}.xlsx`);
            window.showToast?.('Excel file exported successfully');
            
        } catch (error) {
            console.error('Excel Export Error:', error);
            window.showToast?.('Error during Excel export');
        }
    };

    /**
     * 2. Exports a DOM element (Chart/Div) as a High-Res Image
     */
    window.exportChartAsImage = async function(elementId) {
        try {
            window.showToast?.('Generating High-Res Capture...');
            const target = document.getElementById(elementId);
            if (!target) return window.showToast?.('Element not found');

            const canvas = await html2canvas(target, {
                scale: 5, // High quality scaling
                useCORS: true,
                backgroundColor: '#ffffff',
                onclone: (doc) => {
                    const el = doc.getElementById(elementId);
                    el.style.padding = '30px';
                    el.style.borderRadius = '0';
                }
            });

            const link = document.createElement('a');
            link.download = `EL_Analytics_${elementId}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            window.showToast?.('Image saved successfully');
        } catch (error) {
            console.error('Image Export Error:', error);
            window.showToast?.('Error during image export');
        }
    };

    /**
     * 3. Exports Province Statistics from AppState to XLSX
     */
    window.exportProvinceData = function(fileNum) {
        const state = window.appState ? window.appState[fileNum] : null;
        if (!state || !state.rows || !state.rows.length || state.govIdx === -1) {
            return window.showToast?.('No data available for export');
        }

        const counts = {};
        state.rows.forEach(r => {
            const province = r[state.govIdx] || 'Undefined';
            counts[province] = (counts[province] || 0) + 1;
        });

        const dataForExcel = [['Province', 'Record Count']];
        Object.keys(counts)
            .sort((a, b) => counts[b] - counts[a])
            .forEach(p => dataForExcel.push([p, counts[p]]));

        // Create Worksheet and apply Auto-fit
        const ws = XLSX.utils.aoa_to_sheet(dataForExcel);
        ws['!cols'] = calculateColumnWidths(dataForExcel);

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Province Statistics");

        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `EL_Province_Stats_${fileNum}_${dateStr}.xlsx`);
        window.showToast?.('Province statistics exported');
    };

})();
