/**
 * JSON Schema Playground & Form Builder - script.js
 * Comprehensive validation engine, dynamic form compiler, bidirectional bindings, search documentation list.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const selectPreset = document.getElementById('select-preset');
  const schemaTextarea = document.getElementById('schema-editor-textarea');
  const dataTextarea = document.getElementById('data-editor-textarea');

  // Badge Statuses
  const schemaStatusText = document.getElementById('schema-status-text');
  const validationStatusText = document.getElementById('validation-status-text');

  // Actions
  const btnFormatSchema = document.getElementById('btn-format-schema');
  const btnMinifySchema = document.getElementById('btn-minify-schema');
  const btnFormatData = document.getElementById('btn-format-data');
  const btnMinifyData = document.getElementById('btn-minify-data');
  const btnCopyData = document.getElementById('btn-copy-data');
  const btnClearData = document.getElementById('btn-clear-data');

  // Error Alert boxes
  const schemaErrorAlert = document.getElementById('schema-error-alert');
  const schemaErrorMsg = document.getElementById('schema-error-msg');
  const dataErrorAlert = document.getElementById('data-error-alert');
  const dataErrorMsg = document.getElementById('data-error-msg');

  // Dynamic Panels
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const paneDynamicForm = document.getElementById('pane-dynamic-form');
  const paneSchemaDocs = document.getElementById('pane-schema-docs');
  const formContainer = document.getElementById('dynamic-form-container');
  const docsList = document.getElementById('schema-docs-list');
  const docsSearchInput = document.getElementById('docs-search-input');
  const validationLogsList = document.getElementById('validation-logs-list');
  const reportCount = document.getElementById('report-count');

  // --- App State ---
  let state = {
    schemaObj: null,         // Parsed JSON Schema object
    dataObj: null,           // Parsed JSON Instance object
    activeTab: 'form',       // 'form' or 'docs'
    validationErrors: [],    // Current validation errors from Ajv
    docsCached: [],          // Flat documentation elements cache
    isSchemaCompiling: false // Prevent compilation loops
  };

  // --- Preloaded Presets ---
  const presets = {
    'user-registration': {
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "User Profile Registration",
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "title": "Full Name",
            "description": "Enter first and last name (minimum 3 characters)",
            "minLength": 3
          },
          "email": {
            "type": "string",
            "title": "Email Address",
            "description": "Provide a valid electronic mail address",
            "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
          },
          "age": {
            "type": "integer",
            "title": "Age",
            "description": "Must be 18 or older to register",
            "minimum": 18,
            "maximum": 120
          },
          "preferences": {
            "type": "object",
            "title": "User Preferences",
            "properties": {
              "theme": {
                "type": "string",
                "title": "Theme Color Choice",
                "enum": ["dark", "light", "glassmorphic"],
                "default": "dark"
              },
              "subscribe": {
                "type": "boolean",
                "title": "Newsletter Subscription",
                "description": "Receive monthly developer platform updates",
                "default": true
              }
            },
            "required": ["theme"]
          }
        },
        "required": ["name", "email", "age"]
      },
      instance: {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "age": 25,
        "preferences": {
          "theme": "glassmorphic",
          "subscribe": true
        }
      }
    },
    'product-inventory': {
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "E-Commerce Product Item",
        "type": "object",
        "properties": {
          "productId": {
            "type": "string",
            "title": "Stock SKU ID",
            "description": "Must match format AAA-NNNN (e.g. PRD-1024)",
            "pattern": "^[A-Z]{3}-\\d{4}$"
          },
          "price": {
            "type": "number",
            "title": "Unit Price (USD)",
            "description": "Value between $0.01 and $5000.00",
            "minimum": 0.01,
            "maximum": 5000
          },
          "categories": {
            "type": "array",
            "title": "Product Categories",
            "description": "Assign at least one categorical label",
            "items": {
              "type": "string"
            },
            "minItems": 1
          },
          "inStock": {
            "type": "boolean",
            "title": "Availability",
            "default": true
          }
        },
        "required": ["productId", "price", "categories"]
      },
      instance: {
        "productId": "PRD-2034",
        "price": 149.99,
        "categories": ["electronics", "peripherals"],
        "inStock": true
      }
    },
    'complex-config': {
      schema: {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "App System Configurations",
        "type": "object",
        "properties": {
          "appName": {
            "type": "string",
            "title": "Application Name",
            "default": "SchemaPlay"
          },
          "port": {
            "type": "integer",
            "title": "Port Range Allocation",
            "minimum": 80,
            "maximum": 65535,
            "default": 8080
          },
          "features": {
            "type": "object",
            "title": "Enabled Core Modules",
            "properties": {
              "enableLogs": {
                "type": "boolean",
                "title": "Diagnostic Logs",
                "default": true
              },
              "corsOrigins": {
                "type": "array",
                "title": "CORS Allowed Domains",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "required": ["appName", "port"]
      },
      instance: {
        "appName": "SchemaPlay Sandbox",
        "port": 8080,
        "features": {
          "enableLogs": true,
          "corsOrigins": ["http://localhost:3000", "https://schemaplay.dev"]
        }
      }
    }
  };

  // --- Ajv Validator Instantiation ---
  let ajvInstance = null;
  if (typeof Ajv !== 'undefined') {
    try {
      ajvInstance = new Ajv({ allErrors: true, strict: false });
    } catch (e) {
      console.error('AJV library initialization failed:', e);
    }
  }

  // --- Initializer ---
  function init() {
    loadPreset('user-registration');
  }

  // --- Loading presets ---
  function loadPreset(key) {
    const item = presets[key];
    if (!item) return;

    schemaTextarea.value = JSON.stringify(item.schema, null, 2);
    dataTextarea.value = JSON.stringify(item.instance, null, 2);

    processSchema(schemaTextarea.value);
    processData(dataTextarea.value);
  }

  // --- Parsing JSON Schema ---
  function processSchema(schemaRaw) {
    const trimmed = schemaRaw.trim();
    if (!trimmed) {
      state.schemaObj = null;
      schemaStatusText.textContent = 'Empty';
      schemaStatusText.className = 'badge-value text-secondary';
      renderBlankForm("Provide a Schema", "JSON Schema input is empty. Write or paste a valid JSON Schema draft-07.");
      renderBlankDocs();
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      state.schemaObj = parsed;
      schemaErrorAlert.classList.add('hidden');

      // Test Ajv Compilation of schema
      if (ajvInstance) {
        try {
          ajvInstance.compile(parsed);
          schemaStatusText.textContent = 'Draft-07';
          schemaStatusText.className = 'badge-value text-accent';
        } catch (e) {
          throw new Error('AJV schema compilation failed: ' + e.message);
        }
      } else {
        schemaStatusText.textContent = 'Offline Engine';
        schemaStatusText.className = 'badge-value text-warning';
      }

      // Rebuild Dynamic Form & Documentation
      rebuildForm();
      rebuildDocs();

      // Trigger re-validation with new schema
      runValidation();

    } catch (err) {
      state.schemaObj = null;
      schemaStatusText.textContent = 'Invalid';
      schemaStatusText.className = 'badge-value text-danger';

      schemaErrorMsg.textContent = err.message;
      schemaErrorAlert.classList.remove('hidden');

      renderBlankForm("Schema Syntax Error", "The JSON schema is invalid and cannot be parsed to build form inputs.");
      renderBlankDocs();
      runValidation(); // will show schema error report
    }
  }

  // --- Parsing JSON Instance ---
  function processData(dataRaw) {
    const trimmed = dataRaw.trim();
    if (!trimmed) {
      state.dataObj = null;
      dataErrorAlert.classList.add('hidden');
      runValidation();
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      state.dataObj = parsed;
      dataErrorAlert.classList.add('hidden');

      // Sync data back to form elements values
      syncDataToForm();

      // Validate
      runValidation();

    } catch (err) {
      state.dataObj = null;
      dataErrorMsg.textContent = err.message;
      dataErrorAlert.classList.remove('hidden');

      runValidation(); // validation report will state invalid JSON
    }
  }

  // --- AJV / Fallback Validation Orchestrator ---
  function runValidation() {
    // If Instance JSON is invalid
    if (state.dataObj === null && dataTextarea.value.trim() !== '') {
      validationStatusText.textContent = 'Invalid JSON';
      validationStatusText.className = 'badge-value text-danger';
      reportCount.textContent = '1 Error';
      renderValidationLogs([{
        instancePath: '',
        keyword: 'parse',
        message: 'The test instance is not valid JSON. Resolve formatting syntax errors.'
      }]);
      return;
    }

    // If Schema JSON is invalid
    if (state.schemaObj === null) {
      validationStatusText.textContent = 'Schema Error';
      validationStatusText.className = 'badge-value text-danger';
      reportCount.textContent = '1 Error';
      renderValidationLogs([{
        instancePath: '',
        keyword: 'schema',
        message: 'The JSON schema is invalid. Rectify schema compilation errors.'
      }]);
      return;
    }

    // Run Validation
    const report = performValidation(state.schemaObj, state.dataObj || {});
    state.validationErrors = report.errors;

    if (report.valid) {
      validationStatusText.textContent = 'Valid';
      validationStatusText.className = 'badge-value text-success';
      reportCount.textContent = '0 Errors';
      renderValidationLogs([]);
    } else {
      validationStatusText.textContent = 'Invalid';
      validationStatusText.className = 'badge-value text-danger';
      reportCount.textContent = `${report.errors.length} Error${report.errors.length > 1 ? 's' : ''}`;
      renderValidationLogs(report.errors);
    }

    // Highlight form input errors inline
    highlightFormErrors();
  }

  // Performance validation core (with offline fallback engine)
  function performValidation(schema, data) {
    if (ajvInstance) {
      try {
        const validate = ajvInstance.compile(schema);
        const valid = validate(data);
        if (valid) return { valid: true, errors: [] };
        return {
          valid: false,
          errors: validate.errors.map(err => ({
            instancePath: err.instancePath,
            schemaPath: err.schemaPath,
            keyword: err.keyword,
            message: err.message,
            params: err.params
          }))
        };
      } catch (e) {
        return {
          valid: false,
          errors: [{
            instancePath: '',
            schemaPath: '',
            keyword: 'compilation',
            message: 'Schema validation rule error: ' + e.message
          }]
        };
      }
    } else {
      // Basic fallback schema validator
      const errors = [];

      function check(schemaNode, dataNode, path) {
        if (!schemaNode) return;
        const type = schemaNode.type;

        // Check required fields
        if (schemaNode.type === 'object' && schemaNode.required && dataNode && typeof dataNode === 'object') {
          schemaNode.required.forEach(reqKey => {
            if (!(reqKey in dataNode) || dataNode[reqKey] === undefined) {
              errors.push({
                instancePath: path ? `${path}/${reqKey}` : `/${reqKey}`,
                schemaPath: `#/properties/${reqKey}`,
                keyword: 'required',
                message: `must have required property '${reqKey}'`
              });
            }
          });
        }

        if (dataNode === undefined || dataNode === null) return;

        // Type checking
        if (type) {
          const actualType = typeof dataNode;
          if (type === 'string' && actualType !== 'string') {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be string' });
          } else if (type === 'integer' && !Number.isInteger(dataNode)) {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be integer' });
          } else if (type === 'number' && typeof dataNode !== 'number') {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be number' });
          } else if (type === 'boolean' && actualType !== 'boolean') {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be boolean' });
          } else if (type === 'array' && !Array.isArray(dataNode)) {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be array' });
          } else if (type === 'object' && (actualType !== 'object' || Array.isArray(dataNode))) {
            errors.push({ instancePath: path, keyword: 'type', message: 'must be object' });
          }
        }

        // Numeric ranges
        if (typeof dataNode === 'number') {
          if (schemaNode.minimum !== undefined && dataNode < schemaNode.minimum) {
            errors.push({ instancePath: path, keyword: 'minimum', message: `must be >= ${schemaNode.minimum}` });
          }
          if (schemaNode.maximum !== undefined && dataNode > schemaNode.maximum) {
            errors.push({ instancePath: path, keyword: 'maximum', message: `must be <= ${schemaNode.maximum}` });
          }
        }

        // String constraints
        if (typeof dataNode === 'string') {
          if (schemaNode.minLength !== undefined && dataNode.length < schemaNode.minLength) {
            errors.push({ instancePath: path, keyword: 'minLength', message: `must not be shorter than ${schemaNode.minLength} characters` });
          }
          if (schemaNode.pattern !== undefined) {
            const regex = new RegExp(schemaNode.pattern);
            if (!regex.test(dataNode)) {
              errors.push({ instancePath: path, keyword: 'pattern', message: `must match pattern "${schemaNode.pattern}"` });
            }
          }
        }

        // Object children
        if (schemaNode.type === 'object' && schemaNode.properties && typeof dataNode === 'object') {
          Object.keys(schemaNode.properties).forEach(propKey => {
            check(schemaNode.properties[propKey], dataNode[propKey], path ? `${path}/${propKey}` : `/${propKey}`);
          });
        }

        // Array items
        if (schemaNode.type === 'array' && schemaNode.items && Array.isArray(dataNode)) {
          dataNode.forEach((item, idx) => {
            check(schemaNode.items, item, `${path}/${idx}`);
          });
        }
      }

      check(schema, data, '');
      return { valid: errors.length === 0, errors };
    }
  }

  // --- Dynamic Form Compiler ---
  function rebuildForm() {
    formContainer.innerHTML = '';
    if (!state.schemaObj) return;

    try {
      const formEl = compileFormNode(state.schemaObj, '', state.dataObj);
      formContainer.appendChild(formEl);
    } catch (e) {
      console.error("Failed to build form elements:", e);
      renderBlankForm("Form Generation Failed", "The form compiler crashed: " + e.message);
    }
  }

  function compileFormNode(schema, path = '', value = undefined, requiredFields = []) {
    const type = schema.type || 'object';

    if (type === 'object') {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'form-fieldset';
      
      const legend = document.createElement('legend');
      legend.textContent = schema.title || (path ? path.split('.').pop() : 'Root Document');
      fieldset.appendChild(legend);

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'form-fieldset-children';

      const props = schema.properties || {};
      const reqs = schema.required || [];

      Object.keys(props).forEach(key => {
        const childSchema = props[key];
        const childPath = path ? `${path}.${key}` : key;
        const childVal = value ? value[key] : undefined;
        
        const childNode = compileFormNode(childSchema, childPath, childVal, reqs);
        childrenContainer.appendChild(childNode);
      });

      fieldset.appendChild(childrenContainer);
      return fieldset;

    } else if (type === 'array') {
      const fieldset = document.createElement('fieldset');
      fieldset.className = 'form-array-fieldset';

      const header = document.createElement('div');
      header.className = 'form-array-header';
      
      const title = document.createElement('h4');
      title.textContent = schema.title || path.split('.').pop();
      header.appendChild(title);

      const btnAdd = document.createElement('button');
      btnAdd.type = 'button';
      btnAdd.className = 'btn btn-secondary btn-sm';
      btnAdd.innerHTML = `<i class="fa-solid fa-plus"></i> Add`;
      
      btnAdd.addEventListener('click', () => {
        const itemDefault = compileDefaultValue(schema.items);
        appendPathItem(state.dataObj, path, itemDefault);
        
        // Render updated string and forms
        dataTextarea.value = JSON.stringify(state.dataObj, null, 2);
        rebuildForm();
        runValidation();
      });
      header.appendChild(btnAdd);
      fieldset.appendChild(header);

      const listContainer = document.createElement('div');
      listContainer.className = 'array-items-list';

      const arrVal = Array.isArray(value) ? value : [];
      arrVal.forEach((itemVal, idx) => {
        const row = document.createElement('div');
        row.className = 'array-item-row';

        const content = document.createElement('div');
        content.className = 'array-item-content';
        
        const childPath = `${path}.${idx}`;
        const childNode = compileFormNode(schema.items, childPath, itemVal, []);
        content.appendChild(childNode);
        row.appendChild(content);

        const btnRemove = document.createElement('button');
        btnRemove.type = 'button';
        btnRemove.className = 'btn-remove-array-item';
        btnRemove.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
        
        btnRemove.addEventListener('click', () => {
          deletePathIndex(state.dataObj, path, idx);
          
          dataTextarea.value = JSON.stringify(state.dataObj, null, 2);
          rebuildForm();
          runValidation();
        });
        row.appendChild(btnRemove);

        listContainer.appendChild(row);
      });

      fieldset.appendChild(listContainer);
      return fieldset;

    } else {
      // Primitive types
      const group = document.createElement('div');
      group.className = 'form-group';

      const label = document.createElement('label');
      const keyName = path.split('.').pop();
      const title = schema.title || keyName;
      const isRequired = requiredFields.includes(keyName);

      label.innerHTML = `${title}${isRequired ? '<span class="required-star">*</span>' : ''}`;
      
      if (schema.description) {
        const desc = document.createElement('span');
        desc.className = 'field-desc';
        desc.textContent = schema.description;
        label.appendChild(desc);
      }
      group.appendChild(label);

      let inputEl;

      if (schema.enum) {
        inputEl = document.createElement('select');
        inputEl.className = 'form-select';
        
        // Placeholder option
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.textContent = 'Select value...';
        inputEl.appendChild(placeholder);

        schema.enum.forEach(val => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          if (value === val) opt.selected = true;
          inputEl.appendChild(opt);
        });

      } else if (type === 'boolean') {
        group.className = 'form-group form-checkbox-group';
        
        inputEl = document.createElement('input');
        inputEl.type = 'checkbox';
        inputEl.checked = value !== undefined ? value : (schema.default || false);
        
        // Move checkbox before the label for layouts
        group.insertBefore(inputEl, label);

      } else if (type === 'integer' || type === 'number') {
        inputEl = document.createElement('input');
        inputEl.type = 'number';
        inputEl.className = 'form-input';
        inputEl.step = type === 'integer' ? '1' : 'any';
        if (schema.minimum !== undefined) inputEl.min = schema.minimum;
        if (schema.maximum !== undefined) inputEl.max = schema.maximum;
        inputEl.value = value !== undefined ? value : '';

      } else {
        // String fallback
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.className = 'form-input';
        inputEl.value = value !== undefined ? value : '';
      }

      inputEl.setAttribute('data-path', path);

      // Hook up change events to update data object
      const handleEvent = () => {
        const serialized = serializeForm();
        state.dataObj = serialized;
        dataTextarea.value = JSON.stringify(serialized, null, 2);
        runValidation();
      };
      
      inputEl.addEventListener('input', handleEvent);
      inputEl.addEventListener('change', handleEvent);

      group.appendChild(inputEl);

      // Create an inline validation element
      const errorMsg = document.createElement('div');
      errorMsg.className = 'field-error-msg hidden';
      errorMsg.id = `error-msg-${path.replace(/\./g, '-')}`;
      group.appendChild(errorMsg);

      return group;
    }
  }

  // Dynamic values helper builders
  function compileDefaultValue(schema) {
    if (!schema) return '';
    if (schema.default !== undefined) return schema.default;
    
    switch (schema.type) {
      case 'object': return {};
      case 'array': return [];
      case 'boolean': return false;
      case 'number':
      case 'integer': return 0;
      default: return '';
    }
  }

  function serializeForm() {
    const inputs = formContainer.querySelectorAll('[data-path]');
    let result = {};

    inputs.forEach(input => {
      const path = input.getAttribute('data-path');
      if (!path) return;

      let val;
      if (input.type === 'checkbox') {
        val = input.checked;
      } else if (input.type === 'number') {
        val = input.value === '' ? undefined : Number(input.value);
      } else {
        val = input.value === '' ? undefined : input.value;
      }

      if (val !== undefined) {
        setPathValue(result, path, val);
      }
    });

    return result;
  }

  function setPathValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const nextIsNum = !isNaN(nextPart);

      if (!(part in current)) {
        current[part] = nextIsNum ? [] : {};
      }
      current = current[part];
    }

    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  function deletePathIndex(obj, path, index) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        if (Array.isArray(current[part])) {
          current[part].splice(index, 1);
        }
      } else {
        current = current[part];
      }
    }
  }

  function appendPathItem(obj, path, defaultValue) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        if (!Array.isArray(current[part])) {
          current[part] = [];
        }
        current[part].push(defaultValue);
      } else {
        if (!(part in current)) {
          const nextIsNum = !isNaN(parts[i + 1]);
          current[part] = nextIsNum ? [] : {};
        }
        current = current[part];
      }
    }
  }

  function syncDataToForm() {
    if (state.dataObj === null) return;
    const inputs = formContainer.querySelectorAll('[data-path]');
    
    inputs.forEach(input => {
      const path = input.getAttribute('data-path');
      const val = getPathValue(state.dataObj, path);

      if (input.type === 'checkbox') {
        input.checked = val === true;
      } else {
        input.value = val !== undefined ? val : '';
      }
    });
  }

  function getPathValue(obj, path) {
    if (obj === null || obj === undefined) return undefined;
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }

  // --- Inline Form Error Highlighting ---
  function highlightFormErrors() {
    // Reset all errors first
    formContainer.querySelectorAll('.invalid-field').forEach(input => {
      input.classList.remove('invalid-field');
    });
    formContainer.querySelectorAll('.field-error-msg').forEach(msg => {
      msg.classList.add('hidden');
      msg.textContent = '';
    });

    if (state.validationErrors.length === 0) return;

    state.validationErrors.forEach(err => {
      // Convert instance path: '/preferences/subscribe' -> 'preferences.subscribe'
      // or '/categories/0' -> 'categories.0'
      const formattedPath = err.instancePath
        .replace(/^\//, '')
        .replace(/\//g, '.');

      const input = formContainer.querySelector(`[data-path="${formattedPath}"]`);
      if (input) {
        input.classList.add('invalid-field');
        
        // Show message
        const errSpan = document.getElementById(`error-msg-${formattedPath.replace(/\./g, '-')}`);
        if (errSpan) {
          errSpan.textContent = err.message;
          errSpan.classList.remove('hidden');
        }
      }
    });
  }

  // --- Documentation Generator ---
  function rebuildDocs() {
    docsList.innerHTML = '';
    if (!state.schemaObj) return;

    state.docsCached = generateDocs(state.schemaObj);
    renderDocsList(state.docsCached);
  }

  function generateDocs(schema, path = '', requiredFields = []) {
    if (!schema) return [];
    let docs = [];

    const type = schema.type || 'object';

    if (type === 'object' && schema.properties) {
      const reqs = schema.required || [];
      Object.keys(schema.properties).forEach(key => {
        const prop = schema.properties[key];
        const fullPath = path ? `${path}.${key}` : key;
        const isRequired = reqs.includes(key);

        docs.push({
          path: fullPath,
          title: prop.title || key,
          type: prop.type || 'any',
          description: prop.description || 'No description provided.',
          required: isRequired,
          default: prop.default,
          minimum: prop.minimum,
          maximum: prop.maximum,
          minLength: prop.minLength,
          pattern: prop.pattern,
          enum: prop.enum
        });

        // Recursively fetch nested configurations
        if (prop.type === 'object') {
          docs = docs.concat(generateDocs(prop, fullPath, prop.required || []));
        } else if (prop.type === 'array' && prop.items) {
          if (prop.items.type === 'object') {
            docs = docs.concat(generateDocs(prop.items, `${fullPath}[]`, prop.items.required || []));
          } else {
            docs.push({
              path: `${fullPath}[]`,
              title: `${prop.items.title || key} Item`,
              type: prop.items.type || 'any',
              description: `Type constraint of array elements inside ${title}.`,
              required: false,
              minimum: prop.items.minimum,
              maximum: prop.items.maximum,
              minLength: prop.items.minLength,
              pattern: prop.items.pattern,
              enum: prop.items.enum
            });
          }
        }
      });
    }

    return docs;
  }

  function renderDocsList(docs) {
    docsList.innerHTML = '';
    if (docs.length === 0) {
      docsList.innerHTML = `
        <div style="color: var(--text-muted); font-style: italic; text-align: center; margin-top: 20px;">
          No property details found.
        </div>
      `;
      return;
    }

    docs.forEach(prop => {
      const card = document.createElement('div');
      card.className = 'doc-item-card';

      // Header row
      const header = document.createElement('div');
      header.className = 'doc-item-header';
      
      const keySpan = document.createElement('span');
      keySpan.className = 'doc-item-key';
      keySpan.textContent = prop.path;
      header.appendChild(keySpan);

      const badges = document.createElement('div');
      badges.className = 'doc-item-badges';

      const typeBadge = document.createElement('span');
      typeBadge.className = 'doc-badge badge-type';
      typeBadge.textContent = prop.type;
      badges.appendChild(typeBadge);

      if (prop.required) {
        const reqBadge = document.createElement('span');
        reqBadge.className = 'doc-badge badge-required';
        reqBadge.textContent = 'Required';
        badges.appendChild(reqBadge);
      }

      header.appendChild(badges);
      card.appendChild(header);

      // Description
      const desc = document.createElement('p');
      desc.className = 'doc-item-desc';
      desc.textContent = prop.description;
      card.appendChild(desc);

      // Constraints details
      const details = [];
      if (prop.default !== undefined) details.push({ label: 'Default', val: JSON.stringify(prop.default) });
      if (prop.minimum !== undefined) details.push({ label: 'Minimum', val: prop.minimum });
      if (prop.maximum !== undefined) details.push({ label: 'Maximum', val: prop.maximum });
      if (prop.minLength !== undefined) details.push({ label: 'Min Length', val: prop.minLength });
      if (prop.pattern !== undefined) details.push({ label: 'Pattern', val: prop.pattern });
      if (prop.enum !== undefined) details.push({ label: 'Enum Values', val: prop.enum.join(', ') });

      if (details.length > 0) {
        const detailContainer = document.createElement('div');
        detailContainer.className = 'doc-item-details';

        details.forEach(d => {
          const row = document.createElement('div');
          row.className = 'doc-detail-row';
          row.innerHTML = `<span class="doc-detail-label">${d.label}:</span> <span class="doc-detail-value">${d.val}</span>`;
          detailContainer.appendChild(row);
        });

        card.appendChild(detailContainer);
      }

      docsList.appendChild(card);
    });
  }

  // Docs Search handlers
  docsSearchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (q === '') {
      renderDocsList(state.docsCached);
      return;
    }

    const filtered = state.docsCached.filter(doc => {
      return doc.path.toLowerCase().includes(q) || 
             doc.description.toLowerCase().includes(q) ||
             doc.type.toLowerCase().includes(q);
    });

    renderDocsList(filtered);
  });

  // --- Validation Reports Renderer ---
  function renderValidationLogs(errors) {
    validationLogsList.innerHTML = '';
    
    if (errors.length === 0) {
      validationLogsList.innerHTML = `
        <div class="report-success-state">
          <i class="fa-solid fa-circle-check"></i>
          <h4>Validation Passed Successfully</h4>
          <p>The JSON instance conforms precisely to all schemas and formats declared.</p>
        </div>
      `;
      return;
    }

    errors.forEach(err => {
      const errorItem = document.createElement('div');
      errorItem.className = 'report-error-item';

      const top = document.createElement('div');
      top.className = 'error-item-top';

      const path = document.createElement('span');
      path.className = 'error-item-path';
      path.textContent = err.instancePath || '/ (Root)';
      top.appendChild(path);

      const keyword = document.createElement('span');
      keyword.className = 'error-item-keyword';
      keyword.textContent = err.keyword;
      top.appendChild(keyword);

      errorItem.appendChild(top);

      const msg = document.createElement('p');
      msg.className = 'error-item-msg';
      msg.textContent = err.message;
      errorItem.appendChild(msg);

      validationLogsList.appendChild(errorItem);
    });
  }

  // --- Blank Screen views ---
  function renderBlankForm(title, subtitle) {
    formContainer.innerHTML = `
      <div class="workspace-empty-state" style="margin: 40px auto; text-align: center; max-width: 320px; color: var(--text-secondary);">
        <i class="fa-solid fa-wpforms" style="font-size: 2.25rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="font-family: var(--font-header); font-weight:700; color: var(--text-primary); margin-bottom: 4px;">${title}</h3>
        <p style="font-size: 0.8rem; line-height: 1.4;">${subtitle}</p>
      </div>
    `;
  }

  function renderBlankDocs() {
    docsList.innerHTML = `
      <div class="workspace-empty-state" style="margin: 40px auto; text-align: center; max-width: 320px; color: var(--text-secondary);">
        <i class="fa-solid fa-book" style="font-size: 2.25rem; color: var(--text-muted); margin-bottom: 12px;"></i>
        <h3 style="font-family: var(--font-header); font-weight:700; color: var(--text-primary); margin-bottom: 4px;">No Schema Loaded</h3>
        <p style="font-size: 0.8rem; line-height: 1.4;">Resolve syntax errors in schema to build interactive documentation.</p>
      </div>
    `;
  }

  // --- Event Listeners ---

  // Hot edit Schema Textarea
  schemaTextarea.addEventListener('input', (e) => {
    processSchema(e.target.value);
  });

  // Hot edit Data Textarea
  dataTextarea.addEventListener('input', (e) => {
    processData(e.target.value);
  });

  // Action clicks - Schema
  btnFormatSchema.addEventListener('click', () => {
    if (state.schemaObj) {
      schemaTextarea.value = JSON.stringify(state.schemaObj, null, 2);
    }
  });

  btnMinifySchema.addEventListener('click', () => {
    if (state.schemaObj) {
      schemaTextarea.value = JSON.stringify(state.schemaObj);
    }
  });

  // Action clicks - Data
  btnFormatData.addEventListener('click', () => {
    if (state.dataObj) {
      dataTextarea.value = JSON.stringify(state.dataObj, null, 2);
    }
  });

  btnMinifyData.addEventListener('click', () => {
    if (state.dataObj) {
      dataTextarea.value = JSON.stringify(state.dataObj);
    }
  });

  btnCopyData.addEventListener('click', () => {
    const raw = dataTextarea.value;
    if (!raw) return;
    navigator.clipboard.writeText(raw).then(() => {
      const originalText = btnCopyData.innerHTML;
      btnCopyData.innerHTML = `<i class="fa-solid fa-check text-success"></i> Copied!`;
      setTimeout(() => {
        btnCopyData.innerHTML = originalText;
      }, 1500);
    });
  });

  btnClearData.addEventListener('click', () => {
    dataTextarea.value = '';
    state.dataObj = {};
    rebuildForm();
    runValidation();
  });

  // Preset loading trigger
  selectPreset.addEventListener('change', (e) => {
    loadPreset(e.target.value);
  });

  // Mode switching Tabs triggers
  tabTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      tabTriggers.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.getAttribute('data-tab');
      state.activeTab = tab;

      if (tab === 'form') {
        paneDynamicForm.classList.add('active');
        paneSchemaDocs.classList.remove('active');
      } else {
        paneDynamicForm.classList.remove('active');
        paneSchemaDocs.classList.add('active');
      }
    });
  });

  // Start app
  init();
});
