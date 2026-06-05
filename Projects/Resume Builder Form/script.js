(function () {
  'use strict';

  /* ========================================================================
     DOM REFS
     ======================================================================== */
  const $ = (id) => document.getElementById(id);

  const DOM = {
    form: $('resume-form'),
    preview: $('resume-preview'),
    previewFrame: $('preview-frame'),
    templateSelect: $('template-select'),
    printBtn: $('print-btn'),
    swatches: document.querySelectorAll('.swatch'),

    // Personal
    name: $('full-name'),
    title: $('title'),
    email: $('email'),
    phone: $('phone'),
    website: $('website'),
    photoUpload: $('photo-upload'),
    photoPreview: $('photo-preview'),
    photoClear: $('photo-clear'),
    summary: $('summary'),

    // Lists
    expList: $('exp-list'),
    eduList: $('edu-list'),
    addExp: $('add-exp'),
    addEdu: $('add-edu'),

    // Tags
    skillsInput: $('skills-input'),
    skillsContainer: $('skills-container'),
    langsInput: $('langs-input'),
    langsContainer: $('langs-container'),
  };

  /* ========================================================================
     STATE
     ======================================================================== */
  let photoData = null;
  let expCount = 1;
  let eduCount = 1;
  let skills = [];
  let languages = [];
  let currentTemplate = 'classic';
  let currentAccent = '#1e293b';

  /* ========================================================================
     RENDER RESUME
     ======================================================================== */
  function render() {
    const tpl = currentTemplate;
    const data = collectData();

    // Set accent on frame for modern sidebar / classic borders
    DOM.previewFrame.style.setProperty('--accent', currentAccent);

    const html = tpl === 'classic' ? renderClassic(data) : renderModern(data);
    DOM.preview.innerHTML = html;
  }

  /* ========================================================================
     COLLECT FORM DATA
     ======================================================================== */
  function collectData() {
    const exps = [];
    DOM.expList.querySelectorAll('.entry').forEach((entry) => {
      exps.push({
        company: val(entry, 'company'),
        location: val(entry, 'location'),
        role: val(entry, 'role'),
        start: val(entry, 'start'),
        end: val(entry, 'end'),
        desc: val(entry, 'desc'),
      });
    });

    const edus = [];
    DOM.eduList.querySelectorAll('.entry').forEach((entry) => {
      edus.push({
        school: val(entry, 'school'),
        degree: val(entry, 'degree'),
        start: val(entry, 'start'),
        end: val(entry, 'end'),
        desc: val(entry, 'desc'),
      });
    });

    return {
      name: DOM.name.value.trim(),
      title: DOM.title.value.trim(),
      email: DOM.email.value.trim(),
      phone: DOM.phone.value.trim(),
      website: DOM.website.value.trim(),
      photo: photoData,
      summary: DOM.summary.value.trim(),
      experience: exps,
      education: edus,
      skills: skills,
      languages: languages,
    };
  }

  function val(parent, key) {
    const el = parent.querySelector(`[data-${key}]`);
    return el ? el.value.trim() : '';
  }

  /* ========================================================================
     CLASSIC TEMPLATE
     ======================================================================== */
  function renderClassic(d) {
    return `
      <div class="resume resume--classic">
        ${photoHTML(d.photo, 'classic')}
        <header class="resume__header">
          ${tag('h1', 'resume__name', d.name || 'Your Name')}
          ${tag('p', 'resume__title', d.title)}
          <div class="resume__contact">
            ${d.email ? linkHTML('mailto:' + d.email, d.email) : ''}
            ${d.phone ? span('', d.phone) : ''}
            ${d.website ? linkHTML('https://' + d.website.replace(/^https?:\/\//, ''), d.website) : ''}
          </div>
        </header>
        ${section('Summary', d.summary ? `<p class="resume__summary">${esc(d.summary)}</p>` : '', !!d.summary)}
        ${section('Experience', renderItems(d.experience, 'exp', 'classic'), d.experience.some(hasAny))}
        ${section('Education', renderItems(d.education, 'edu', 'classic'), d.education.some(hasAny))}
        ${section('Skills', renderTags(d.skills, 'classic'), d.skills.length > 0)}
        ${section('Languages', renderTags(d.languages, 'classic'), d.languages.length > 0)}
      </div>`;
  }

  function renderItems(items, type, tpl) {
    return items.filter(hasAny).map((item, i) => {
      const isExp = type === 'exp';
      const title = isExp ? item.role : item.degree;
      const sub = isExp ? item.company : item.school;
      const loc = isExp ? item.location : '';
      const date = [item.start, item.end].filter(Boolean).join(' — ');

      return `
        <div class="resume__item ${i > 0 ? '' : ''}">
          <div class="resume__item-header">
            <div>
              <div class="resume__item-title">${esc(title || sub || '')}</div>
              ${sub && title ? `<div class="resume__item-sub">${esc(sub)}${loc ? ', ' + esc(loc) : ''}</div>` : ''}
              ${!title && sub ? '' : ''}
            </div>
            ${date ? `<span class="resume__item-date">${esc(date)}</span>` : ''}
          </div>
          ${item.desc ? `<p class="resume__item-desc">${esc(item.desc)}</p>` : ''}
        </div>`;
    }).join('');
  }

  function renderTags(items, tpl) {
    if (items.length === 0) return '';
    return `<div class="resume__tags">${items.map(s =>
      `<span class="resume__tag">${esc(s)}</span>`
    ).join('')}</div>`;
  }

  function photoHTML(photo, tpl) {
    if (!photo) return '';
    const cls = 'resume__photo resume__photo--visible';
    return `<img class="${cls}" src="${photo}" alt="Profile photo">`;
  }

  /* ========================================================================
     MODERN TEMPLATE
     ======================================================================== */
  function renderModern(d) {
    const hasContact = d.email || d.phone || d.website;
    const hasSideSkills = d.skills.length > 0;
    const hasSideLangs = d.languages.length > 0;
    const sidebarHasContent = d.photo || d.name || d.title || hasContact || hasSideSkills || hasSideLangs;

    return `
      <div class="resume resume--modern">
        <aside class="resume__sidebar">
          ${d.photo ? `<img class="resume__photo resume__photo--visible" src="${d.photo}" alt="Profile photo">` : ''}
          ${d.name ? `<div class="resume__sidebar-name">${esc(d.name)}</div>` : ''}
          ${d.title ? `<div class="resume__sidebar-title">${esc(d.title)}</div>` : ''}
          ${hasContact ? `<div class="resume__sidebar-divider"></div>` : ''}
          ${hasContact ? `
            <div>
              <div class="resume__sidebar-label">Contact</div>
              <div class="resume__sidebar-contact">
                ${d.email ? `<span>${esc(d.email)}</span>` : ''}
                ${d.phone ? `<span>${esc(d.phone)}</span>` : ''}
                ${d.website ? `<a href="https://${d.website.replace(/^https?:\/\//, '')}">${esc(d.website)}</a>` : ''}
              </div>
            </div>
          ` : ''}
          ${hasSideSkills ? `<div class="resume__sidebar-divider"></div>
            <div>
              <div class="resume__sidebar-label">Skills</div>
              <div class="resume__sidebar-tags">
                ${d.skills.map(s => `<span class="resume__sidebar-tag">${esc(s)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
          ${hasSideLangs ? `<div class="resume__sidebar-divider"></div>
            <div>
              <div class="resume__sidebar-label">Languages</div>
              <div class="resume__sidebar-tags">
                ${d.languages.map(l => `<span class="resume__sidebar-tag">${esc(l)}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </aside>
        <div class="resume__main">
          <header class="resume__main-header">
            <div class="resume__main-name">${esc(d.name || 'Your Name')}</div>
            <div class="resume__main-title">${esc(d.title || 'Professional Title')}</div>
            <div class="resume__main-contact">
              ${d.email ? `<span>${esc(d.email)}</span>` : ''}
              ${d.phone ? `<span>${esc(d.phone)}</span>` : ''}
              ${d.website ? `<a href="https://${d.website.replace(/^https?:\/\//, '')}">${esc(d.website)}</a>` : ''}
            </div>
          </header>
          ${section('Professional Summary', d.summary ? `<p class="resume__summary">${esc(d.summary)}</p>` : '', !!d.summary)}
          ${section('Experience', renderItemsModern(d.experience), d.experience.some(hasAny))}
          ${section('Education', renderItemsModern(d.education), d.education.some(hasAny))}
        </div>
      </div>`;
  }

  function renderItemsModern(items) {
    return items.filter(hasAny).map((item, i) => {
      const title = item.role || item.degree || '';
      const sub = item.company || item.school || '';
      const loc = item.location || '';
      const date = [item.start, item.end].filter(Boolean).join(' — ');

      return `
        <div class="resume__item">
          <div class="resume__item-header">
            <div>
              <div class="resume__item-title">${esc(title || sub)}</div>
              ${sub && title ? `<div class="resume__item-sub">${esc(sub)}${loc ? ', ' + esc(loc) : ''}</div>` : ''}
              ${!title && sub ? `<div class="resume__item-sub">${esc(sub)}${loc ? ', ' + esc(loc) : ''}</div>` : ''}
            </div>
            ${date ? `<span class="resume__item-date">${esc(date)}</span>` : ''}
          </div>
          ${item.desc ? `<p class="resume__item-desc">${esc(item.desc)}</p>` : ''}
        </div>`;
    }).join('');
  }

  /* ========================================================================
     HELPERS
     ======================================================================== */
  function esc(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function tag(el, cls, content) {
    return content ? `<${el} class="${cls}">${content}</${el}>` : '';
  }

  function span(cls, content) {
    return content ? `<span class="${cls}">${esc(content)}</span>` : '';
  }

  function linkHTML(href, text) {
    const cleanHref = href.replace(/^https?:\/\//, '');
    return `<a href="${href.startsWith('http') || href.startsWith('mailto:') ? href : 'https://' + cleanHref}">${esc(text)}</a>`;
  }

  function section(title, content, condition) {
    if (!condition || !content) return '';
    return `
      <div class="resume__section">
        <div class="resume__section-title">${title}</div>
        ${content}
      </div>`;
  }

  function hasAny(item) {
    return Object.values(item).some(v => v && v.trim);
  }

  /* ========================================================================
     PHOTO UPLOAD
     ======================================================================== */
  function setupPhoto() {
    DOM.photoUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        photoData = ev.target.result;
        DOM.photoPreview.src = photoData;
        DOM.photoPreview.classList.add('photo-upload__preview--visible');
        DOM.photoClear.classList.add('photo-upload__clear--visible');
        render();
      };
      reader.readAsDataURL(file);
    });

    DOM.photoClear.addEventListener('click', (e) => {
      e.stopPropagation();
      photoData = null;
      DOM.photoPreview.classList.remove('photo-upload__preview--visible');
      DOM.photoClear.classList.remove('photo-upload__clear--visible');
      DOM.photoUpload.value = '';
      render();
    });
  }

  /* ========================================================================
     DYNAMIC ENTRIES (Experience / Education)
     ======================================================================== */
  function makeEntry(type, index) {
    const prefix = type === 'exp' ? 'exp' : 'edu';
    const label1 = type === 'exp' ? { a: 'Company', b: 'Location', phA: 'Acme Corp', phB: 'San Francisco, CA' }
                                 : { a: 'School', b: 'Degree', phA: 'Stanford University', phB: 'B.S. Computer Science' };
    const label2 = type === 'exp' ? { a: 'Role', b: 'Start', c: 'End', phA: 'Senior Engineer', phB: 'Jan 2020', phC: 'Present' }
                                 : { a: 'Start', b: 'End', phA: 'Sep 2016', phB: 'Jun 2020' };
    const descPH = type === 'exp' ? 'Describe your responsibilities and achievements...'
                                  : 'Honors, activities, or relevant coursework...';

    let fields = `
      <div class="field-row">
        <div class="field field--half">
          <label class="field__label">${label1.a}</label>
          <input class="field__input" type="text" placeholder="${label1.phA}" data-${prefix}="${type === 'exp' ? 'company' : 'school'}">
        </div>
        <div class="field field--half">
          <label class="field__label">${label1.b}</label>
          <input class="field__input" type="text" placeholder="${label1.phB}" data-${prefix}="${type === 'exp' ? 'location' : 'degree'}">
        </div>
      </div>`;

    if (type === 'exp') {
      fields += `
        <div class="field-row">
          <div class="field field--half">
            <label class="field__label">${label2.a}</label>
            <input class="field__input" type="text" placeholder="${label2.phA}" data-exp="role">
          </div>
          <div class="field field--fourth">
            <label class="field__label">${label2.b}</label>
            <input class="field__input" type="text" placeholder="${label2.phB}" data-exp="start">
          </div>
          <div class="field field--fourth">
            <label class="field__label">${label2.c}</label>
            <input class="field__input" type="text" placeholder="${label2.phC}" data-exp="end">
          </div>
        </div>`;
    } else {
      fields += `
        <div class="field-row">
          <div class="field field--half">
            <label class="field__label">${label2.a}</label>
            <input class="field__input" type="text" placeholder="${label2.phA}" data-edu="start">
          </div>
          <div class="field field--half">
            <label class="field__label">${label2.b}</label>
            <input class="field__input" type="text" placeholder="${label2.phB}" data-edu="end">
          </div>
        </div>`;
    }

    fields += `
      <div class="field">
        <label class="field__label">Description</label>
        <textarea class="field__input field__textarea" rows="2" placeholder="${descPH}" data-${prefix}="desc"></textarea>
      </div>`;

    const div = document.createElement('div');
    div.className = 'entry';
    div.dataset.index = index;
    div.innerHTML = `
      <div class="entry__fields">${fields}</div>
      <button class="entry__remove" type="button" aria-label="Remove entry">&times;</button>`;

    div.querySelector('.entry__remove').addEventListener('click', () => {
      div.remove();
      render();
    });

    // Auto-render on any input
    div.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', render);
    });

    return div;
  }

  function setupDynamicLists() {
    DOM.addExp.addEventListener('click', () => {
      const entry = makeEntry('exp', expCount++);
      DOM.expList.appendChild(entry);
      render();
    });

    DOM.addEdu.addEventListener('click', () => {
      const entry = makeEntry('edu', eduCount++);
      DOM.eduList.appendChild(entry);
      render();
    });

    // Initial entry remove buttons
    document.querySelectorAll('.entry__remove').forEach(btn => {
      btn.addEventListener('click', function () {
        this.closest('.entry').remove();
        render();
      });
    });

    // Delegate input events on existing entries
    DOM.expList.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', render);
    });
    DOM.eduList.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', render);
    });
  }

  /* ========================================================================
     TAGS (Skills / Languages)
     ======================================================================== */
  function setupTags() {
    setupTagInput(DOM.skillsInput, DOM.skillsContainer, skills,
      () => render());
    setupTagInput(DOM.langsInput, DOM.langsContainer, languages,
      () => render());
  }

  function setupTagInput(input, container, arr, onchange) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = input.value.trim();
        if (val && !arr.includes(val)) {
          arr.push(val);
          input.value = '';
          renderTagsUI(container, arr, input);
          onchange();
        }
      }
    });

    // Initial render
    renderTagsUI(container, arr, input);
  }

  function renderTagsUI(container, arr, input) {
    // Remove all non-input children
    container.querySelectorAll('.tag').forEach(el => el.remove());

    arr.forEach((item, i) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.innerHTML = `${esc(item)} <button class="tag__remove" data-i="${i}" type="button">&times;</button>`;
      tag.querySelector('.tag__remove').addEventListener('click', () => {
        arr.splice(i, 1);
        renderTagsUI(container, arr, input);
        render();
      });
      container.insertBefore(tag, input);
    });
  }

  /* ========================================================================
     ACCENT COLOR SWATCHES
     ======================================================================== */
  function setupSwatches() {
    DOM.swatches.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.swatches.forEach(b => b.classList.remove('swatch--active'));
        btn.classList.add('swatch--active');
        currentAccent = btn.dataset.color;
        render();
      });
    });
  }

  /* ========================================================================
     TEMPLATE TOGGLE
     ======================================================================== */
  function setupTemplate() {
    DOM.templateSelect.addEventListener('change', () => {
      currentTemplate = DOM.templateSelect.value;
      render();
    });
  }

  /* ========================================================================
     PRINT
     ======================================================================== */
  function setupPrint() {
    DOM.printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  /* ========================================================================
     AUTO-RENDER ON TEXT INPUTS
     ======================================================================== */
  function setupAutoRender() {
    DOM.form.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', render);
    });
  }

  /* ========================================================================
     BOOT
     ======================================================================== */
  function init() {
    setupAutoRender();
    setupPhoto();
    setupDynamicLists();
    setupTags();
    setupSwatches();
    setupTemplate();
    setupPrint();
    render();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
