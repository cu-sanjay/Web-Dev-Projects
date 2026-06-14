(function () {
  'use strict';

  /* === DISEASE DATABASE === */
  const DISEASES = [
    {
      id: 'early-blight',
      name: 'Early Blight',
      pathogen: 'Alternaria solani',
      description: 'A common fungal disease affecting Solanaceae crops, thriving in warm, humid conditions. Characterized by target-like concentric rings on older leaves.',
      symptoms: ['Dark Brown Spots', 'Wilting Margins', 'Cankers'],
      organic: ['Apply copper-based fungicides', 'Neem oil foliar spray every 7 days', 'Remove infected lower leaves immediately'],
      chemical: ['Chlorothalonil (broad-spectrum)', 'Azoxystrobin rotation', 'Mancozeb preventative spray'],
      quarantine: 'MODERATE - ISOLATE FIELD'
    },
    {
      id: 'powdery-mildew',
      name: 'Powdery Mildew',
      pathogen: 'Erysiphe cichoracearum',
      description: 'Superficial fungal growth on leaf surfaces that thrives in moderate temperatures with high humidity, but does not require free water for germination.',
      symptoms: ['Powdery White Spots', 'Stunted Stems'],
      organic: ['Potassium bicarbonate solution (1 tbsp/L)', 'Milk spray (1:9 ratio with water)', 'Sulfur dust application'],
      chemical: ['Myclobutanil systemic fungicide', 'Triflumizole spray', 'Propiconazole rotation'],
      quarantine: 'LOW'
    },
    {
      id: 'black-rot',
      name: 'Black Rot',
      pathogen: 'Xanthomonas campestris',
      description: 'A devastating bacterial disease of crucifers that enters through hydathodes or wounds. Causes V-shaped yellow lesions that turn black along veins.',
      symptoms: ['Dark Brown Spots', 'Cankers', 'Fruit Rot', 'Gummy Ooze'],
      organic: ['Copper hydroxide spray', 'Bacillus subtilis biofungicide', 'Hot water seed treatment (50°C, 25 min)'],
      chemical: ['Copper-based bactericides', 'Streptomycin (limited use)', 'Fixed copper sprays'],
      quarantine: 'SEVERE - INCINERATE ACREAGE'
    },
    {
      id: 'root-rot',
      name: 'Root Rot Oomycete',
      pathogen: 'Phytophthora infestans',
      description: 'A water-mold pathogen that thrives in saturated soils, causing root decay, wilting, and plant collapse. Can survive in soil for years.',
      symptoms: ['Root Rot', 'Wilting Margins', 'Stunted Stems'],
      organic: ['Improve soil drainage', 'Trichoderma harzianum drench', 'Compost tea soil application'],
      chemical: ['Mefenoxam soil drench', 'Phosphorous acid fungicide', 'Metalaxyl seed treatment'],
      quarantine: 'MODERATE - ISOLATE FIELD'
    },
    {
      id: 'tobacco-mosaic',
      name: 'Tobacco Mosaic Virus',
      pathogen: 'Tobamovirus',
      description: 'A highly stable RNA virus transmitted mechanically through contaminated tools and hands. Causes distinctive mosaic mottling and leaf distortion.',
      symptoms: ['Yellowing Mottle', 'Wilting Margins', 'Stunted Stems'],
      organic: ['Remove and destroy infected plants', 'Milk-based leaf wash (20% solution)', 'Crop rotation (non-host 2 years)'],
      chemical: ['No direct chemical control', 'Insecticide for vector management', 'Clean tools with 10% bleach solution'],
      quarantine: 'SEVERE - INCINERATE ACREAGE'
    },
    {
      id: 'anthracnose',
      name: 'Anthracnose',
      pathogen: 'Colletotrichum gloeosporioides',
      description: 'A fungal disease causing dark sunken lesions on fruits, leaves, and stems. Spreads rapidly in warm, wet weather via splashing water.',
      symptoms: ['Dark Brown Spots', 'Fruit Rot', 'Wilting Margins'],
      organic: ['Copper soap spray', 'Bacillus subtilis application', 'Remove and destroy infected fruit'],
      chemical: ['Captan protective fungicide', 'Chlorothalonil rotation', 'Pyraclostrobin spray'],
      quarantine: 'MODERATE - ISOLATE FIELD'
    }
  ];

  /* === STATE === */
  let selectedSymptoms = [];
  let activeDisease = null;

  /* === DOM === */
  const $ = id => document.getElementById(id);
  const symptomBody = $('symptomBody');
  const resultsBody = $('resultsBody');
  const clinicalBody = $('clinicalBody');
  const symCount = $('symCount'), resultCount = $('resultCount');
  const stateDot = $('stateDot'), stateLabel = $('stateLabel');
  const btnAnalyze = $('btnAnalyze'), btnPreset = $('btnPreset'), btnPurge = $('btnPurge');

  /* === SYMPTOM CHANGE === */
  function onSymptomChange() {
    const checks = symptomBody.querySelectorAll('input[type="checkbox"]');
    selectedSymptoms = [];
    checks.forEach(c => { if (c.checked) selectedSymptoms.push(c.dataset.symptom); });
    symCount.textContent = selectedSymptoms.length + ' selected';
  }

  /* === DIAGNOSTIC ENGINE === */
  function diagnose() {
    if (selectedSymptoms.length === 0) {
      resultsBody.innerHTML = `
        <div class="results-empty">
          <span class="empty-icon">◆</span>
          <span>Botanical Matrix Cleared: No Pathogens Detected. Standing By for Symptom Input.</span>
        </div>
      `;
      resultCount.textContent = '0 matches';
      return [];
    }

    const results = DISEASES.map(d => {
      const intersect = d.symptoms.filter(s => selectedSymptoms.includes(s));
      const confidence = d.symptoms.length > 0 ? Math.round((intersect.length / d.symptoms.length) * 100) : 0;
      return { ...d, intersect: intersect.length, total: d.symptoms.length, confidence };
    })
    .filter(r => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence || b.intersect - a.intersect);

    if (results.length === 0) {
      resultsBody.innerHTML = `
        <div class="results-empty">
          <span class="empty-icon">⚠</span>
          <span>No matching pathogens found for the selected symptom vector. Consult a specialist.</span>
        </div>
      `;
      resultCount.textContent = '0 matches';
      return [];
    }

    resultCount.textContent = results.length + ' matches';
    renderResults(results);
    return results;
  }

  /* === RENDER RESULTS === */
  function renderResults(results) {
    let html = '';
    results.forEach(r => {
      const barColor = r.confidence >= 70 ? '#ff1744' : r.confidence >= 40 ? '#ffb800' : '#00e5ff';
      html += `
        <div class="result-card" data-id="${r.id}">
          <div class="result-name">${r.name}</div>
          <div class="result-bar-wrap">
            <div class="result-bar-track"><div class="result-bar-fill" style="width:${r.confidence}%;background:${barColor}"></div></div>
            <span class="result-pct" style="color:${barColor}">${r.confidence}%</span>
          </div>
        </div>
      `;
    });
    resultsBody.innerHTML = html;

    resultsBody.querySelectorAll('.result-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const disease = results.find(r => r.id === id);
        if (disease) showClinical(disease);
        resultsBody.querySelectorAll('.result-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

  /* === SHOW CLINICAL === */
  function showClinical(d) {
    activeDisease = d;
    const qClass = d.quarantine.includes('SEVERE') ? 'severe' : d.quarantine.includes('MODERATE') ? 'moderate' : 'low';
    const gaugeRotation = (d.confidence / 100) * 180;

    clinicalBody.innerHTML = `
      <div class="clinical-pathogen">${d.name}</div>
      <span class="clinical-sci">${d.pathogen}</span>

      <div class="clinical-gauge-wrap">
        <div class="clinical-gauge-ring">
          <div class="fill" style="transform:rotate(${gaugeRotation}deg)"></div>
          <span class="clinical-gauge-pct">${d.confidence}%</span>
        </div>
        <div>
          <div style="font-family:var(--fm);font-size:6px;color:var(--txtm);text-transform:uppercase">Infection Confidence</div>
          <div style="font-family:var(--fm);font-size:6px;color:var(--txt2)">${d.intersect}/${d.total} symptom match</div>
        </div>
      </div>

      <div class="clinical-desc">${d.description}</div>

      <div class="clinical-section">
        <div class="clinical-section-title">Organic Treatment Protocols</div>
        <ul class="clinical-checklist">
          ${d.organic.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="clinical-section">
        <div class="clinical-section-title">Chemical Prevention</div>
        <ul class="clinical-checklist">
          ${d.chemical.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="clinical-quarantine ${qClass}">${d.quarantine}</div>
    `;
  }

  /* === EXECUTE === */
  btnAnalyze.addEventListener('click', () => {
    if (selectedSymptoms.length === 0) {
      clinicalBody.innerHTML = `<div class="clinical-empty">No symptoms selected. Please check symptom boxes and re-run the diagnostic loop.</div>`;
      resultsBody.innerHTML = `
        <div class="results-empty">
          <span class="empty-icon">◆</span>
          <span>Botanical Matrix Cleared: No Pathogens Detected. Standing By for Symptom Input.</span>
        </div>
      `;
      resultCount.textContent = '0 matches';
      return;
    }
    const results = diagnose();
    if (results.length > 0) showClinical(results[0]);
    else {
      clinicalBody.innerHTML = `<div class="clinical-empty">No matching disease profile. Review symptom selections and consult a plant pathologist.</div>`;
    }
    stateDot.className = 'state-dot analyzing';
    stateLabel.textContent = 'ANALYZING';
  });

  /* === PRESET === */
  btnPreset.addEventListener('click', () => {
    const checks = symptomBody.querySelectorAll('input[type="checkbox"]');
    checks.forEach(c => c.checked = false);

    const preset = ['Dark Brown Spots', 'Wilting Margins', 'Cankers'];
    checks.forEach(c => {
      if (preset.includes(c.dataset.symptom)) c.checked = true;
    });
    onSymptomChange();
    const results = diagnose();
    if (results.length > 0) showClinical(results[0]);
    stateDot.className = 'state-dot preset';
    stateLabel.textContent = 'PRESET LOADED';
  });

  /* === PURGE === */
  btnPurge.addEventListener('click', () => {
    const checks = symptomBody.querySelectorAll('input[type="checkbox"]');
    checks.forEach(c => c.checked = false);
    onSymptomChange();
    resultsBody.innerHTML = `
      <div class="results-empty">
        <span class="empty-icon">◆</span>
        <span>Botanical Matrix Cleared: No Pathogens Detected. Standing By for Symptom Input.</span>
      </div>
    `;
    resultCount.textContent = '0 matches';
    clinicalBody.innerHTML = `<div class="clinical-empty">Select a disease result to view treatment protocols and quarantine guidance.</div>`;
    activeDisease = null;
    stateDot.className = 'state-dot';
    stateLabel.textContent = 'PURGED';
  });

  /* === AUTO-RUN ON CHECKBOX CHANGE === */
  symptomBody.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      onSymptomChange();
      diagnose();
    }
  });

  /* === INIT === */
  onSymptomChange();

})();
