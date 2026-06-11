(function () {

  const App = {
    state: {
      refString: [],
      frameCount: 4,
      algorithm: 'fifo',
      steps: [],
      currentStep: -1,
      fifoFaultCount: 0,
      fifoSteps: null,
    },

    dom: {},

    presets: {
      belady: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
      locality: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2],
      cyclic: [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5],
    },

    statusMessages: {
      awaiting: 'AWAITING TRANSITION TIMELINE',
      step: function (step, page, isHit) {
        if (isHit) return 'CACHE HIT: ADDRESS RESOLVED NATIVELY at t=' + step;
        return 'STEP ADVANCED: MEMORY BLOCK ALLOCATED at t=' + step;
      },
      evict: function (step, page) {
        return 'CACHE FULL: EVICTING TARGET BLOCK VIA ALGORITHM — Page ' + page + ' removed at t=' + step;
      },
    },

    init: function () {
      this.cacheDom();
      this.bindEvents();
      this.chart = null;
      this.initChart();
    },

    cacheDom: function () {
      this.dom.algoTabs = document.getElementById('algo-tabs');
      this.dom.frameSlider = document.getElementById('frame-slider');
      this.dom.frameCountDisplay = document.getElementById('frame-count-display');
      this.dom.refInput = document.getElementById('ref-string-input');
      this.dom.presetBtns = document.querySelectorAll('.preset-btn');
      this.dom.btnRun = document.getElementById('btn-run');
      this.dom.btnStep = document.getElementById('btn-step');
      this.dom.btnPrev = document.getElementById('btn-prev');
      this.dom.btnFlush = document.getElementById('btn-flush');
      this.dom.btnExport = document.getElementById('btn-export');
      this.dom.traceContainer = document.getElementById('trace-container');
      this.dom.logBody = document.getElementById('log-body');
      this.dom.statusBanner = document.getElementById('status-banner');
      this.dom.logInfo = document.getElementById('log-info');
      this.dom.traceInfo = document.getElementById('trace-info');
      this.dom.diagTime = document.getElementById('diag-time');
      this.dom.diagPage = document.getElementById('diag-page');
      this.dom.diagStatus = document.getElementById('diag-status');
      this.dom.diagChr = document.getElementById('diag-chr');
      this.dom.diagPfr = document.getElementById('diag-pfr');
      this.dom.metricFaults = document.getElementById('metric-faults');
      this.dom.metricChr = document.getElementById('metric-chr');
      this.dom.metricVariance = document.getElementById('metric-variance');
      this.dom.chartCanvas = document.getElementById('fault-chart');
    },

    bindEvents: function () {
      var self = this;

      this.dom.algoTabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.algo-tab');
        if (!tab) return;
        self.dom.algoTabs.querySelectorAll('.algo-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        self.state.algorithm = tab.dataset.algo;
      });

      this.dom.frameSlider.addEventListener('input', function () {
        self.state.frameCount = parseInt(this.value);
        self.dom.frameCountDisplay.textContent = self.state.frameCount;
      });

      this.dom.presetBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = this.dataset.preset;
          if (self.presets[key]) {
            self.dom.refInput.value = self.presets[key].join(', ');
          }
        });
      });

      this.dom.btnRun.addEventListener('click', function () { self.runSimulation(); self.goToStep(self.state.steps.length - 1); });
      this.dom.btnStep.addEventListener('click', function () { self.stepForward(); });
      this.dom.btnPrev.addEventListener('click', function () { self.stepBackward(); });
      this.dom.btnFlush.addEventListener('click', function () { self.flush(); });
      this.dom.btnExport.addEventListener('click', function () { self.exportCSV(); });
    },

    parseRefString: function (str) {
      return str.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(function (n) { return !isNaN(n); });
    },

    simulateFIFO: function (ref, frames) {
      var steps = [];
      var cache = new Array(frames).fill(null);
      var queueIdx = 0;
      var faults = 0;

      for (var t = 0; t < ref.length; t++) {
        var page = ref[t];
        var hitIdx = cache.indexOf(page);
        var isHit = hitIdx !== -1;
        var evicted = null;
        var prevCache = cache.slice();
        var faultCountBefore = faults;

        if (!isHit) {
          faults++;
          evicted = cache[queueIdx];
          cache[queueIdx] = page;
          queueIdx = (queueIdx + 1) % frames;
        }

        steps.push({
          t: t,
          page: page,
          frames: cache.slice(),
          prevFrames: prevCache,
          isHit: isHit,
          evicted: evicted,
          faultCount: faults,
          faultRate: faults / (t + 1),
        });
      }

      return { steps: steps, totalFaults: faults };
    },

    simulateLRU: function (ref, frames) {
      var steps = [];
      var cache = new Array(frames).fill(null);
      var lastUsed = {};
      var time = 0;
      var faults = 0;

      for (var t = 0; t < ref.length; t++) {
        var page = ref[t];
        var hitIdx = cache.indexOf(page);
        var isHit = hitIdx !== -1;
        var evicted = null;
        var prevCache = cache.slice();

        if (isHit) {
          lastUsed[page] = time++;
        } else {
          faults++;
          var emptyIdx = cache.indexOf(null);
          if (emptyIdx !== -1) {
            cache[emptyIdx] = page;
          } else {
            var oldestPage = null;
            var oldestTime = Infinity;
            for (var i = 0; i < cache.length; i++) {
              var p = cache[i];
              if (lastUsed[p] !== undefined && lastUsed[p] < oldestTime) {
                oldestTime = lastUsed[p];
                oldestPage = p;
              }
            }
            var evictIdx = cache.indexOf(oldestPage);
            evicted = cache[evictIdx];
            delete lastUsed[evicted];
            cache[evictIdx] = page;
          }
          lastUsed[page] = time++;
        }

        steps.push({
          t: t,
          page: page,
          frames: cache.slice(),
          prevFrames: prevCache,
          isHit: isHit,
          evicted: evicted,
          faultCount: faults,
          faultRate: faults / (t + 1),
        });
      }

      return { steps: steps, totalFaults: faults };
    },

    simulateOPT: function (ref, frames) {
      var steps = [];
      var cache = new Array(frames).fill(null);
      var faults = 0;

      for (var t = 0; t < ref.length; t++) {
        var page = ref[t];
        var hitIdx = cache.indexOf(page);
        var isHit = hitIdx !== -1;
        var evicted = null;
        var prevCache = cache.slice();

        if (!isHit) {
          faults++;
          var emptyIdx = cache.indexOf(null);
          if (emptyIdx !== -1) {
            cache[emptyIdx] = page;
          } else {
            var farthestIdx = -1;
            var evictPage = null;
            for (var i = 0; i < cache.length; i++) {
              var p = cache[i];
              var nextUse = Infinity;
              for (var j = t + 1; j < ref.length; j++) {
                if (ref[j] === p) {
                  nextUse = j;
                  break;
                }
              }
              if (nextUse > farthestIdx) {
                farthestIdx = nextUse;
                evictPage = p;
              }
            }
            var evictIdx = cache.indexOf(evictPage);
            evicted = cache[evictIdx];
            cache[evictIdx] = page;
          }
        }

        steps.push({
          t: t,
          page: page,
          frames: cache.slice(),
          prevFrames: prevCache,
          isHit: isHit,
          evicted: evicted,
          faultCount: faults,
          faultRate: faults / (t + 1),
        });
      }

      return { steps: steps, totalFaults: faults };
    },

    runSimulation: function () {
      var ref = this.parseRefString(this.dom.refInput.value);
      if (ref.length === 0) {
        this.setStatus('ERROR: Invalid reference string. Please enter valid numbers.', 'fault');
        return;
      }

      this.state.refString = ref;
      this.state.currentStep = -1;
      var algo = this.state.algorithm;
      var frames = this.state.frameCount;
      var result;

      switch (algo) {
        case 'fifo': result = this.simulateFIFO(ref, frames); break;
        case 'lru': result = this.simulateLRU(ref, frames); break;
        case 'opt': result = this.simulateOPT(ref, frames); break;
        default: result = this.simulateFIFO(ref, frames);
      }

      this.state.steps = result.steps;

      var fifoResult = this.simulateFIFO(ref, frames);
      this.state.fifoFaultCount = fifoResult.totalFaults;
      this.state.fifoSteps = fifoResult.steps;

      this.renderTraceMatrix();
      this.renderTelemetry(-1);
      this.renderLog(-1);
      this.setStatus(this.statusMessages.awaiting, 'awaiting');
      this.updateDiagnosticHeader(-1);
      this.updateChart(-1);
      this.state.currentStep = -1;

      this.dom.traceInfo.textContent = ref.length + ' steps loaded';
    },

    goToStep: function (index) {
      var steps = this.state.steps;
      if (steps.length === 0) return;

      var clamped = Math.max(-1, Math.min(index, steps.length - 1));
      this.state.currentStep = clamped;

      this.renderTraceMatrix(clamped);
      this.renderTelemetry(clamped);
      this.renderLog(clamped);
      this.updateDiagnosticHeader(clamped);
      this.updateChart(clamped);

      if (clamped === -1) {
        this.setStatus(this.statusMessages.awaiting, 'awaiting');
      } else {
        var s = steps[clamped];
        if (s.evicted !== null) {
          this.setStatus(this.statusMessages.evict(s.t, s.evicted), 'fault');
        } else if (!s.isHit) {
          this.setStatus(this.statusMessages.step(s.t, s.page, false), 'fault');
        } else {
          this.setStatus(this.statusMessages.step(s.t, s.page, true), 'hit');
        }
      }
    },

    stepForward: function () {
      if (this.state.steps.length === 0) return;
      var next = this.state.currentStep + 1;
      if (next >= this.state.steps.length) return;
      this.goToStep(next);
    },

    stepBackward: function () {
      var prev = this.state.currentStep - 1;
      if (prev < -1) return;
      this.goToStep(prev);
    },

    flush: function () {
      this.state.steps = [];
      this.state.currentStep = -1;
      this.state.refString = [];
      this.state.fifoFaultCount = 0;
      this.state.fifoSteps = null;
      this.dom.traceContainer.innerHTML = '';
      this.dom.logBody.innerHTML = '';
      this.dom.traceInfo.textContent = 'No data';
      this.dom.logInfo.textContent = '0 entries';
      this.renderTelemetry(-1);
      this.updateDiagnosticHeader(-1);
      this.updateChart(-1);
      this.setStatus('AWAITING TRANSITION TIMELINE', 'awaiting');
    },

    renderTraceMatrix: function (activeIdx) {
      var container = this.dom.traceContainer;
      var steps = this.state.steps;
      container.innerHTML = '';

      if (steps.length === 0) {
        container.innerHTML =
          '<div class="trace-empty">' +
          '<svg width="48" height="48" viewBox="0 0 48 48">' +
          '<rect x="4" y="4" width="40" height="40" rx="4" fill="none" stroke="#e2ebd9" stroke-width="2"/>' +
          '<rect x="10" y="10" width="28" height="28" rx="2" fill="#e8f5e9" stroke="#e2ebd9" stroke-width="1"/>' +
          '<text x="24" y="30" text-anchor="middle" fill="#a5c4a0" font-size="14" font-family="monospace">LOAD</text>' +
          '</svg><p>Load a reference string and run the simulation</p></div>';
        return;
      }

      var limit = activeIdx >= 0 ? activeIdx + 1 : steps.length;
      var visibleSteps = steps.slice(0, limit);

      var fragment = document.createDocumentFragment();

      for (var i = 0; i < visibleSteps.length; i++) {
        var s = visibleSteps[i];
        var col = document.createElement('div');
        col.className = 'trace-step' + (i === activeIdx ? ' current' : '');

        var header = document.createElement('div');
        header.className = 'trace-step-header';
        header.innerHTML = '<span class="step-num">t=' + s.t + '</span><span class="step-page">' + s.page + '</span>';
        col.appendChild(header);

        var framesDiv = document.createElement('div');
        framesDiv.className = 'trace-frames';

        for (var f = 0; f < s.frames.length; f++) {
          var slot = document.createElement('div');
          var val = s.frames[f];
          var className = 'trace-slot';

          if (val === null) {
            className += ' empty';
          }
          if (i === activeIdx) {
            if (val !== null && s.page === val && s.isHit) {
              className += ' highlight-hit';
            } else if (val !== null && s.page === val && !s.isHit) {
              className += ' highlight-fault';
            } else if (s.evicted !== null && val === null && s.prevFrames[f] === s.evicted) {
              className += ' highlight-evict';
            }
          }

          slot.className = className;
          slot.textContent = val !== null ? val.toString(16).toUpperCase() : '-';
          framesDiv.appendChild(slot);
        }

        col.appendChild(framesDiv);

        var badge = document.createElement('div');
        badge.className = 'trace-badge ' + (s.isHit ? 'hit' : 'fault');
        badge.textContent = s.isHit ? 'HIT' : 'FAULT';
        col.appendChild(badge);

        fragment.appendChild(col);
      }

      container.appendChild(fragment);

      container.scrollLeft = container.scrollWidth;
    },

    renderTelemetry: function (idx) {
      var steps = this.state.steps;
      var faults = 0;
      var chr = 0;
      var pfr = 0;
      var variance = 0;

      if (steps.length > 0 && idx >= 0) {
        var s = steps[idx];
        faults = s.faultCount;
        var total = idx + 1;
        pfr = (faults / total) * 100;
        chr = 100 - pfr;
        variance = faults - this.state.fifoFaultCount;
      } else if (steps.length > 0) {
        var last = steps[steps.length - 1];
        faults = last.faultCount;
        var total = steps.length;
        pfr = (faults / total) * 100;
        chr = 100 - pfr;
        variance = faults - this.state.fifoFaultCount;
      }

      this.dom.metricFaults.textContent = faults;
      this.dom.metricChr.textContent = chr.toFixed(1) + '%';

      var varianceEl = this.dom.metricVariance;
      varianceEl.innerHTML = '';
      var span = document.createElement('span');
      if (variance > 0) {
        span.className = 'variance-positive';
        span.textContent = '+' + variance;
      } else if (variance < 0) {
        span.className = 'variance-negative';
        span.textContent = variance;
      } else {
        span.className = 'variance-neutral';
        span.textContent = '0';
      }
      varianceEl.appendChild(span);
    },

    renderLog: function (activeIdx) {
      var tbody = this.dom.logBody;
      var steps = this.state.steps;
      tbody.innerHTML = '';

      if (steps.length === 0) {
        this.dom.logInfo.textContent = '0 entries';
        return;
      }

      var limit = activeIdx >= 0 ? activeIdx + 1 : steps.length;
      var fragment = document.createDocumentFragment();

      for (var i = 0; i < limit; i++) {
        var s = steps[i];
        var tr = document.createElement('tr');

        var cacheStr = s.frames.map(function (v) { return v !== null ? v.toString(16).toUpperCase() : '-'; }).join(' ');

        var eventClass = s.isHit ? 'event-hit' : 'event-fault';
        var eventText = s.isHit ? 'HIT' : 'FAULT';

        var faultRatio = (s.faultCount / (s.t + 1) * 100).toFixed(1) + '%';

        tr.innerHTML =
          '<td>' + s.t + '</td>' +
          '<td>' + s.page + '</td>' +
          '<td>[' + cacheStr + ']</td>' +
          '<td>' + (s.evicted !== null ? s.evicted : '-') + '</td>' +
          '<td class="' + eventClass + '">' + eventText + '</td>' +
          '<td>' + faultRatio + '</td>';

        fragment.appendChild(tr);
      }

      tbody.appendChild(fragment);
      this.dom.logInfo.textContent = limit + ' entries';

      var logContainer = tbody.closest('.log-container');
      if (logContainer) logContainer.scrollTop = logContainer.scrollHeight;
    },

    updateDiagnosticHeader: function (idx) {
      if (idx < 0 || this.state.steps.length === 0) {
        this.dom.diagTime.textContent = '0';
        this.dom.diagPage.textContent = '-';
        var statusEl = this.dom.diagStatus;
        statusEl.innerHTML = '<span class="status-dot awaiting"></span> AWAITING';
        this.dom.diagChr.textContent = '0%';
        this.dom.diagPfr.textContent = '0%';
        return;
      }

      var s = this.state.steps[idx];
      this.dom.diagTime.textContent = s.t;
      this.dom.diagPage.textContent = s.page.toString(16).toUpperCase();

      var statusEl = this.dom.diagStatus;
      if (s.isHit) {
        statusEl.innerHTML = '<span class="status-dot hit"></span> HIT';
      } else {
        statusEl.innerHTML = '<span class="status-dot fault"></span> FAULT';
      }

      var total = idx + 1;
      var chr = ((total - s.faultCount) / total) * 100;
      var pfr = (s.faultCount / total) * 100;
      this.dom.diagChr.textContent = chr.toFixed(1) + '%';
      this.dom.diagPfr.textContent = pfr.toFixed(1) + '%';
    },

    setStatus: function (message, type) {
      var banner = this.dom.statusBanner;
      var dot = banner.querySelector('.status-dot');
      var text = banner.querySelector('.status-text');

      dot.className = 'status-dot ' + (type || 'awaiting');
      text.textContent = message;
    },

    initChart: function () {
      var ctx = this.dom.chartCanvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Cumulative Page Faults',
            data: [],
            borderColor: '#c62828',
            backgroundColor: 'rgba(198, 40, 40, 0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#c62828',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return 'Faults: ' + ctx.raw;
                },
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Step (t)',
                color: '#557a61',
                font: { size: 10, family: 'ui-monospace, monospace' },
              },
              ticks: {
                color: '#557a61',
                font: { size: 9, family: 'ui-monospace, monospace' },
                maxTicksLimit: 20,
              },
              grid: { color: '#e2ebd9', drawBorder: false },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Faults',
                color: '#557a61',
                font: { size: 10, family: 'ui-monospace, monospace' },
              },
              ticks: {
                color: '#557a61',
                font: { size: 9, family: 'ui-monospace, monospace' },
                stepSize: 1,
              },
              grid: { color: '#e2ebd9', drawBorder: false },
            },
          },
          animation: { duration: 200 },
        },
      });
    },

    updateChart: function (idx) {
      if (!this.chart) return;
      var steps = this.state.steps;

      var limit = idx >= 0 ? idx + 1 : steps.length;
      var labels = [];
      var data = [];

      for (var i = 0; i < limit; i++) {
        labels.push(String(steps[i].t));
        data.push(steps[i].faultCount);
      }

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    },

    exportCSV: function () {
      var steps = this.state.steps;
      if (steps.length === 0) {
        this.setStatus('ERROR: No simulation data to export.', 'fault');
        return;
      }

      var rows = [];
      rows.push('Step t,Page Requested,Cache State,Evicted,Page Fault Event,Cumulative Faults,Fault Ratio (%)');

      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        var cacheStr = s.frames.map(function (v) { return v !== null ? v.toString(16).toUpperCase() : 'EMPTY'; }).join(';');
        var event = s.isHit ? 'HIT' : 'FAULT';
        var ratio = (s.faultCount / (s.t + 1) * 100).toFixed(2);
        rows.push(s.t + ',' + s.page + ',' + cacheStr + ',' + (s.evicted !== null ? s.evicted : 'NONE') + ',' + event + ',' + s.faultCount + ',' + ratio);
      }

      var csv = rows.join('\r\n');
      var algoLabel = this.state.algorithm.toUpperCase();
      var filename = 'page_replacement_' + algoLabel + '_' + this.state.frameCount + 'frames_' + new Date().toISOString().slice(0, 10) + '.csv';

      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      this.setStatus('CSV EXPORTED: Diagnostic matrices saved as ' + filename, 'hit');
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    App.init();
  });

})();
