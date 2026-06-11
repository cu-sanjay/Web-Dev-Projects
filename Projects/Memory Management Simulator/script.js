var state = {
    blocks: [],
    totalRAM: 0,
    clockStep: 0,
    algorithm: 'first-fit',
    diagnostics: 'AWAITING INITIALIZATION',
    initialized: false,
    utilizationHistory: []
};

function toHex(offset) {
    return '0x' + offset.toString(16).toUpperCase().padStart(4, '0');
}

function initializeRAM(inputStr) {
    var sizes = inputStr.split(',').map(function(s) { return parseInt(s.trim()); }).filter(function(n) { return !isNaN(n) && n > 0; });
    if (sizes.length === 0) {
        setDiagnostics('ERROR: Invalid RAM configuration. Enter comma-separated sizes.');
        return false;
    }

    state.blocks = [];
    var offset = 0;
    sizes.forEach(function(size, i) {
        state.blocks.push({
            baseAddr: offset,
            size: size,
            status: 'free',
            processId: null,
            usedSize: null,
            waste: null,
            lifetime: null
        });
        offset += size;
    });

    state.totalRAM = offset;
    state.clockStep = 0;
    state.initialized = true;
    state.utilizationHistory = [0];

    renderAll();
    setDiagnostics('RAM initialized. Ready for allocations.');
    return true;
}

function allocate(pid, requestSize, lifetime) {
    if (!state.initialized) {
        setDiagnostics('ERROR: RAM not initialized.');
        return false;
    }

    if (requestSize <= 0) {
        setDiagnostics('ERROR: Request size must be positive.');
        return false;
    }

    if (lifetime <= 0) {
        setDiagnostics('ERROR: Lifetime must be positive.');
        return false;
    }

    if (requestSize > state.totalRAM) {
        setDiagnostics('ERROR: Request exceeds total system RAM capacity.');
        return false;
    }

    var targetIndex = -1;
    switch (state.algorithm) {
        case 'first-fit':
            targetIndex = firstFit(requestSize);
            break;
        case 'best-fit':
            targetIndex = bestFit(requestSize);
            break;
        case 'worst-fit':
            targetIndex = worstFit(requestSize);
            break;
    }

    if (targetIndex === -1) {
        var totalFree = 0;
        var largestFree = 0;
        state.blocks.forEach(function(b) {
            if (b.status === 'free') {
                totalFree += b.size;
                if (b.size > largestFree) largestFree = b.size;
            }
        });

        if (totalFree >= requestSize) {
            setDiagnostics('OUT OF MEMORY ERROR: External fragmentation detected. Largest free block: ' + largestFree + ' KB. Compaction recommended.');
        } else {
            setDiagnostics('OUT OF MEMORY ERROR: Insufficient total memory. Need ' + requestSize + ' KB, have ' + totalFree + ' KB free.');
        }
        return false;
    }

    var block = state.blocks[targetIndex];
    var waste = block.size - requestSize;

    block.status = 'allocated';
    block.processId = pid;
    block.usedSize = requestSize;
    block.waste = waste;
    block.lifetime = lifetime;

    setDiagnostics('SEGMENT ALLOCATED SUCCESSFULLY: ' + pid + ' @ ' + toHex(block.baseAddr) + '-' + toHex(block.baseAddr + block.size) + ' (' + requestSize + ' KB used, ' + waste + ' KB waste)');
    renderAll();
    return true;
}

function firstFit(requestSize) {
    for (var i = 0; i < state.blocks.length; i++) {
        if (state.blocks[i].status === 'free' && state.blocks[i].size >= requestSize) {
            return i;
        }
    }
    return -1;
}

function bestFit(requestSize) {
    var bestIdx = -1;
    var bestSize = Infinity;
    for (var i = 0; i < state.blocks.length; i++) {
        var b = state.blocks[i];
        if (b.status === 'free' && b.size >= requestSize && b.size < bestSize) {
            bestIdx = i;
            bestSize = b.size;
        }
    }
    return bestIdx;
}

function worstFit(requestSize) {
    var worstIdx = -1;
    var worstSize = -1;
    for (var i = 0; i < state.blocks.length; i++) {
        var b = state.blocks[i];
        if (b.status === 'free' && b.size >= requestSize && b.size > worstSize) {
            worstIdx = i;
            worstSize = b.size;
        }
    }
    return worstIdx;
}

function deallocateAll() {
    if (!state.initialized) return;
    state.blocks.forEach(function(b) {
        b.status = 'free';
        b.processId = null;
        b.usedSize = null;
        b.waste = null;
        b.lifetime = null;
    });
    mergeAdjacentFree();
    setDiagnostics('All blocks deallocated.');
    renderAll();
}

function mergeAdjacentFree() {
    var i = 0;
    while (i < state.blocks.length - 1) {
        if (state.blocks[i].status === 'free' && state.blocks[i + 1].status === 'free') {
            state.blocks[i].size += state.blocks[i + 1].size;
            state.blocks.splice(i + 1, 1);
        } else {
            i++;
        }
    }
}

function compactRAM() {
    if (!state.initialized || state.blocks.length === 0) {
        setDiagnostics('ERROR: Nothing to compact.');
        return;
    }

    var allocated = [];
    for (var i = 0; i < state.blocks.length; i++) {
        if (state.blocks[i].status === 'allocated') {
            allocated.push(state.blocks[i]);
        }
    }

    allocated.sort(function(a, b) { return a.baseAddr - b.baseAddr; });

    var newBlocks = [];
    var offset = 0;

    allocated.forEach(function(block) {
        newBlocks.push({
            baseAddr: offset,
            size: block.usedSize,
            status: 'allocated',
            processId: block.processId,
            usedSize: block.usedSize,
            waste: 0,
            lifetime: block.lifetime
        });
        offset += block.usedSize;
    });

    var remaining = state.totalRAM - offset;
    if (remaining > 0) {
        newBlocks.push({
            baseAddr: offset,
            size: remaining,
            status: 'free',
            processId: null,
            usedSize: null,
            waste: null,
            lifetime: null
        });
    }

    state.blocks = newBlocks;
    setDiagnostics('HEAP FRAGMENTS CONSOLIDATED: Memory compacted successfully. ' + remaining + ' KB free at ' + toHex(offset) + '.');
    renderAll();
}

function stepClock() {
    if (!state.initialized) {
        setDiagnostics('ERROR: RAM not initialized.');
        return;
    }

    state.clockStep++;
    var deallocated = 0;

    state.blocks.forEach(function(b) {
        if (b.status === 'allocated' && b.lifetime !== null) {
            b.lifetime--;
            if (b.lifetime <= 0) {
                b.status = 'free';
                b.processId = null;
                b.usedSize = null;
                b.waste = null;
                b.lifetime = null;
                deallocated++;
            }
        }
    });

    if (deallocated > 0) {
        mergeAdjacentFree();
        setDiagnostics('Clock tick: ' + deallocated + ' process(es) expired and deallocated.');
    } else {
        setDiagnostics('Clock step ' + state.clockStep + ': no processes expired.');
    }

    renderAll();
}

function calculateMetrics() {
    var totalUsed = 0;
    var totalWaste = 0;
    var totalFree = 0;
    var largestFree = 0;

    state.blocks.forEach(function(b) {
        if (b.status === 'allocated') {
            totalUsed += b.usedSize;
            totalWaste += b.waste;
        } else {
            totalFree += b.size;
            if (b.size > largestFree) largestFree = b.size;
        }
    });

    var utilization = state.totalRAM > 0 ? (totalUsed / state.totalRAM) * 100 : 0;

    return { totalUsed: totalUsed, totalWaste: totalWaste, totalFree: totalFree, largestFree: largestFree, utilization: utilization };
}

function renderAll() {
    renderRAMMap();
    renderTelemetryTable();
    renderMetrics();
    updateChart();
}

function renderRAMMap() {
    var container = document.getElementById('ram-map');
    container.innerHTML = '';

    if (!state.initialized || state.blocks.length === 0) {
        container.innerHTML = '<div class="empty-state">Initialize RAM to view memory map</div>';
        return;
    }

    state.blocks.forEach(function(block) {
        var pct = (block.size / state.totalRAM) * 100;
        var wrapper = document.createElement('div');
        wrapper.className = 'block-segment block-' + block.status;
        wrapper.style.width = pct + '%';
        wrapper.style.minWidth = block.status === 'free' ? '4px' : '20px';

        var title = 'Base: ' + toHex(block.baseAddr) + '\nLimit: ' + toHex(block.baseAddr + block.size) + '\nSize: ' + block.size + ' KB\nStatus: ' + block.status.toUpperCase();
        if (block.processId) title += '\nPID: ' + block.processId;
        if (block.waste > 0) title += '\nWaste: ' + block.waste + ' KB';
        wrapper.title = title;

        if (block.status === 'allocated' && block.waste > 0) {
            var usedPct = (block.usedSize / block.size) * 100;
            wrapper.style.background = 'linear-gradient(to right, #2e7d32 0%, #2e7d32 ' + usedPct + '%, #d32f2f ' + usedPct + '%, #d32f2f 100%)';
        } else if (block.status === 'allocated') {
            wrapper.style.background = '#2e7d32';
        } else {
            wrapper.style.background = '#e8f5e9';
        }

        var label = document.createElement('span');
        label.className = 'block-label';
        label.textContent = block.status === 'free' ? toHex(block.baseAddr) : block.processId + ' @ ' + toHex(block.baseAddr);
        wrapper.appendChild(label);

        container.appendChild(wrapper);
    });

    document.getElementById('total-capacity').textContent = state.totalRAM + ' KB';
    document.getElementById('active-allocations').textContent = state.blocks.filter(function(b) { return b.status === 'allocated'; }).length;
    document.getElementById('clock-step').textContent = state.clockStep;
}

function renderTelemetryTable() {
    var tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (!state.initialized || state.blocks.length === 0) return;

    state.blocks.forEach(function(block, idx) {
        var tr = document.createElement('tr');
        tr.className = 'row-' + block.status;

        if (block.status === 'allocated' && block.waste > 0.3 * block.size) {
            tr.classList.add('high-waste');
        }

        var addrClass = 'addr';
        var wasteDisplay = block.status === 'allocated' ? block.waste + ' KB' : '\u2014';

        tr.innerHTML =
            '<td>' + idx + '</td>' +
            '<td class="' + addrClass + '">' + toHex(block.baseAddr) + '</td>' +
            '<td class="' + addrClass + '">' + toHex(block.baseAddr + block.size) + '</td>' +
            '<td>' + block.size + ' KB</td>' +
            '<td><span class="badge badge-' + block.status + '">' + block.status.toUpperCase() + '</span></td>' +
            '<td>' + (block.processId || '\u2014') + '</td>' +
            '<td>' + wasteDisplay + '</td>';

        tbody.appendChild(tr);
    });
}

function renderMetrics() {
    var m = calculateMetrics();
    document.getElementById('utilization').textContent = m.utilization.toFixed(1) + '%';
    document.getElementById('internal-frag').textContent = m.totalWaste + ' KB';
    document.getElementById('free-space').textContent = m.totalFree + ' KB';
}

function setDiagnostics(msg) {
    state.diagnostics = msg;
    var el = document.getElementById('diagnostics');
    if (el) {
        el.innerHTML = '<span class="diag-icon">&#9670;</span><span class="diag-text">' + msg + '</span>';
    }
}

var utilChart = null;

function initChart() {
    if (typeof Chart === 'undefined') {
        var wrap = document.querySelector('.chart-container');
        if (wrap) wrap.style.display = 'none';
        return;
    }

    var canvas = document.getElementById('util-chart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    try {
        utilChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [0],
                datasets: [{
                    label: 'Utilization %',
                    data: [0],
                    borderColor: '#2e7d32',
                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                    pointBackgroundColor: '#2e7d32',
                    pointBorderColor: '#2e7d32',
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1b3a24',
                        titleFont: { size: 11 },
                        bodyFont: { size: 12 },
                        cornerRadius: 6,
                        padding: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#e2ebd9', drawBorder: false },
                        ticks: { color: '#557a61', font: { size: 10 }, stepSize: 25 }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#557a61', font: { size: 10 }, maxTicksLimit: 8 }
                    }
                },
                animation: { duration: 300 }
            }
        });
    } catch (e) {
        var wrap = document.querySelector('.chart-container');
        if (wrap) wrap.style.display = 'none';
    }
}

function updateChart() {
    if (!utilChart) return;
    var m = calculateMetrics();
    if (state.initialized) {
        state.utilizationHistory.push(parseFloat(m.utilization.toFixed(1)));
        utilChart.data.labels = state.utilizationHistory.map(function(_, i) { return i; });
        utilChart.data.datasets[0].data = state.utilizationHistory;
        utilChart.update();
    }
}

function exportCSV() {
    if (!state.initialized || state.blocks.length === 0) {
        setDiagnostics('ERROR: No data to export.');
        return;
    }

    var headers = ['Block ID', 'Base Address', 'Limit Address', 'Size (KB)', 'Status', 'Process ID', 'Used Size (KB)', 'Fragment Waste (KB)'];
    var rows = state.blocks.map(function(b, i) {
        return [
            i,
            toHex(b.baseAddr),
            toHex(b.baseAddr + b.size),
            b.size,
            b.status,
            b.processId || '-',
            b.status === 'allocated' ? b.usedSize : '-',
            b.status === 'allocated' ? b.waste : '-'
        ];
    });

    var csv = headers.join(',') + '\n' + rows.map(function(r) { return r.join(','); }).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'heap_profile_step_' + state.clockStep + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDiagnostics('CSV exported: heap_profile_step_' + state.clockStep + '.csv');
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.algo-tabs button').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.algo-tabs button').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            state.algorithm = btn.dataset.algo;
            var name = btn.dataset.algo.replace('-', ' ').toUpperCase();
            setDiagnostics('Algorithm switched to ' + name + '.');
        });
    });

    document.getElementById('init-ram').addEventListener('click', function() {
        var val = document.getElementById('ram-input').value;
        initializeRAM(val);
    });

    document.getElementById('allocate-btn').addEventListener('click', function() {
        var pid = document.getElementById('pid-input').value.trim() || 'P' + (Math.floor(Math.random() * 900) + 100);
        var size = parseInt(document.getElementById('size-input').value);
        var lifetime = parseInt(document.getElementById('lifetime-input').value);

        if (isNaN(size) || size <= 0) {
            setDiagnostics('ERROR: Invalid request size. Enter a positive number.');
            return;
        }
        if (isNaN(lifetime) || lifetime <= 0) {
            setDiagnostics('ERROR: Invalid lifetime value.');
            return;
        }

        allocate(pid, size, lifetime);
    });

    document.getElementById('compact-btn').addEventListener('click', compactRAM);
    document.getElementById('deallocate-btn').addEventListener('click', deallocateAll);
    document.getElementById('export-btn').addEventListener('click', exportCSV);
    document.getElementById('step-btn').addEventListener('click', stepClock);

    document.querySelectorAll('#pid-input, #size-input, #lifetime-input').forEach(function(el) {
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('allocate-btn').click();
        });
    });

    document.getElementById('ram-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('init-ram').click();
    });

    initChart();
    initializeRAM(document.getElementById('ram-input').value);
});
