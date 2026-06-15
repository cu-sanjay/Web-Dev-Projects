/**
 * APIDoc - Interactive API Documentation Viewer script.js
 * Parses OpenAPI specs, builds layouts, auto-generates schema mocks, and runs try-it out sandboxes.
 */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- SPEC PRESET DATABASES ---
  const specPresets = {
    // 1. Swagger Petstore
    petstore: {
      openapi: "3.0.0",
      info: {
        title: "Swagger Petstore API",
        version: "1.0.4",
        description: "A sample OpenAPI documentation mapping a pet store service. Test query models, authentication schemes, and data objects.",
      },
      servers: [
        { url: "https://petstore.swagger.io/v2", description: "Production live API server" },
        { url: "http://localhost:8080/v2", description: "Local developer environment" }
      ],
      components: {
        securitySchemes: {
          api_key: {
            type: "apiKey",
            name: "api_key",
            in: "header",
            description: "Default header key for authentication."
          }
        },
        schemas: {
          Pet: {
            type: "object",
            required: ["name", "photoUrls"],
            properties: {
              id: { type: "integer", format: "int64", description: "Unique identifier for the pet object" },
              category: {
                type: "object",
                properties: {
                  id: { type: "integer", format: "int64" },
                  name: { type: "string" }
                }
              },
              name: { type: "string", example: "doggie", description: "Friendly name of the pet" },
              photoUrls: {
                type: "array",
                items: { type: "string" },
                description: "Array of URLs showing images of this pet"
              },
              tags: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer", format: "int64" },
                    name: { type: "string" }
                  }
                }
              },
              status: {
                type: "string",
                description: "Availability status of the pet in the inventory",
                enum: ["available", "pending", "sold"]
              }
            }
          },
          Order: {
            type: "object",
            properties: {
              id: { type: "integer", format: "int64" },
              petId: { type: "integer", format: "int64" },
              quantity: { type: "integer", format: "int32", default: 1 },
              shipDate: { type: "string", format: "date-time" },
              status: {
                type: "string",
                description: "Order status check",
                enum: ["placed", "approved", "delivered"]
              },
              complete: { type: "boolean", default: false }
            }
          }
        }
      },
      paths: {
        "/pet": {
          post: {
            tags: ["pet"],
            summary: "Add a new pet to the store",
            description: "Add a new pet record to the database catalog.",
            requestBody: {
              description: "Pet object details to be added",
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Pet" }
                }
              }
            },
            responses: {
              200: {
                description: "Successful operation",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Pet" }
                  }
                }
              },
              400: { description: "Invalid input" },
              405: { description: "Validation exception" }
            },
            security: [{ api_key: [] }]
          }
        },
        "/pet/findByStatus": {
          get: {
            tags: ["pet"],
            summary: "Finds Pets by status",
            description: "Multiple status values can be provided with comma separated strings.",
            parameters: [
              {
                name: "status",
                in: "query",
                description: "Status values that need to be considered for filter",
                required: true,
                schema: {
                  type: "string",
                  default: "available",
                  enum: ["available", "pending", "sold"]
                }
              }
            ],
            responses: {
              200: {
                description: "Successful operation",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Pet" }
                    }
                  }
                }
              },
              400: { description: "Invalid status value" }
            }
          }
        },
        "/pet/{petId}": {
          get: {
            tags: ["pet"],
            summary: "Find pet by ID",
            description: "Returns a single pet object record.",
            parameters: [
              {
                name: "petId",
                in: "path",
                description: "ID of pet to retrieve",
                required: true,
                schema: { type: "integer", format: "int64" }
              }
            ],
            responses: {
              200: {
                description: "Successful operation",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Pet" }
                  }
                }
              },
              400: { description: "Invalid ID supplied" },
              404: { description: "Pet not found" }
            }
          },
          delete: {
            tags: ["pet"],
            summary: "Deletes a pet",
            description: "Removes a pet record from the system.",
            parameters: [
              {
                name: "api_key",
                in: "header",
                required: false,
                schema: { type: "string" }
              },
              {
                name: "petId",
                in: "path",
                description: "Pet id to delete",
                required: true,
                schema: { type: "integer", format: "int64" }
              }
            ],
            responses: {
              200: { description: "Pet deleted successfully" },
              400: { description: "Invalid ID supplied" },
              404: { description: "Pet not found" }
            },
            security: [{ api_key: [] }]
          }
        },
        "/store/inventory": {
          get: {
            tags: ["store"],
            summary: "Returns pet inventories by status",
            description: "Returns a map of status codes to quantities.",
            responses: {
              200: {
                description: "Successful operation",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        available: { type: "integer", format: "int32" },
                        pending: { type: "integer", format: "int32" },
                        sold: { type: "integer", format: "int32" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/store/order": {
          post: {
            tags: ["store"],
            summary: "Place an order for a pet",
            description: "Submit an order form for a pet purchase.",
            requestBody: {
              description: "Order details to submit",
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Order" }
                }
              }
            },
            responses: {
              200: {
                description: "Successful operation",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Order" }
                  }
                }
              },
              400: { description: "Invalid Order" }
            }
          }
        }
      }
    },
    // 2. E-Commerce Shop API
    ecommerce: {
      openapi: "3.0.0",
      info: {
        title: "E-Commerce Shop API",
        version: "2.1.0",
        description: "API for shopping operations, listing items, managing cart structures, and completing checkout procedures.",
      },
      servers: [
        { url: "https://api.shopflow.dev/v1", description: "Production Sandbox Gate" }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT access token header."
          }
        },
        schemas: {
          Product: {
            type: "object",
            properties: {
              id: { type: "integer" },
              title: { type: "string" },
              price: { type: "number" },
              category: { type: "string" },
              inStock: { type: "boolean" }
            }
          },
          CartItem: {
            type: "object",
            required: ["productId", "quantity"],
            properties: {
              productId: { type: "integer" },
              quantity: { type: "integer", default: 1 }
            }
          }
        }
      },
      paths: {
        "/products": {
          get: {
            tags: ["products"],
            summary: "List catalog products",
            description: "Returns a list of products filterable by category tags.",
            parameters: [
              {
                name: "category",
                in: "query",
                required: false,
                schema: { type: "string", enum: ["electronics", "clothing", "home"] }
              },
              {
                name: "limit",
                in: "query",
                required: false,
                schema: { type: "integer", default: 10 }
              }
            ],
            responses: {
              200: {
                description: "Products list returned",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" }
                    }
                  }
                }
              }
            }
          }
        },
        "/cart": {
          get: {
            tags: ["cart"],
            summary: "View active shopping cart",
            description: "Retrieve shopping items currently stored in session.",
            responses: {
              200: {
                description: "Active cart returned",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/CartItem" }
                    }
                  }
                }
              }
            }
          }
        },
        "/cart/add": {
          post: {
            tags: ["cart"],
            summary: "Add product item to cart",
            description: "Adds product records into customer shopping cart.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CartItem" }
                }
              }
            },
            responses: {
              200: { description: "Item added successfully" },
              400: { description: "Invalid quantity or product ID" }
            }
          }
        },
        "/checkout": {
          post: {
            tags: ["orders"],
            summary: "Complete cart checkout",
            description: "Submits cart configurations, creates transaction record, and invoices user.",
            responses: {
              200: {
                description: "Checkout successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        orderId: { type: "string" },
                        total: { type: "number" },
                        status: { type: "string" }
                      }
                    }
                  }
                }
              },
              401: { description: "Unauthorized - missing JWT" }
            },
            security: [{ BearerAuth: [] }]
          }
        }
      }
    },
    // 3. Tasks & Auth
    tasks: {
      openapi: "3.0.0",
      info: {
        title: "Auth & Tasks API",
        version: "1.0.0",
        description: "Simple API managing user credentials registers and todo list task workflows.",
      },
      servers: [
        { url: "http://localhost:8000/api", description: "Local database server" }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        },
        schemas: {
          User: {
            type: "object",
            required: ["username", "password"],
            properties: {
              username: { type: "string" },
              password: { type: "string", format: "password" }
            }
          },
          Task: {
            type: "object",
            required: ["title"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              completed: { type: "boolean", default: false }
            }
          }
        }
      },
      paths: {
        "/auth/login": {
          post: {
            tags: ["auth"],
            summary: "User authentication check",
            description: "Verifies user password credentials and registers session token JWT.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" }
                }
              }
            },
            responses: {
              200: {
                description: "Token generated",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        token: { type: "string" },
                        expiresIn: { type: "integer" }
                      }
                    }
                  }
                }
              },
              400: { description: "Invalid username or password" }
            }
          }
        },
        "/tasks": {
          get: {
            tags: ["tasks"],
            summary: "Retrieve task items list",
            description: "Access and filter standard database todo list items.",
            parameters: [
              {
                name: "completed",
                in: "query",
                required: false,
                schema: { type: "boolean" }
              }
            ],
            responses: {
              200: {
                description: "List returned",
                content: {
                  "application/json": {
                    schema: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Task" }
                    }
                  }
                }
              },
              401: { description: "Missing auth JWT" }
            },
            security: [{ BearerAuth: [] }]
          },
          post: {
            tags: ["tasks"],
            summary: "Create new task details",
            description: "Adds a new todo list task.",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Task" }
                }
              }
            },
            responses: {
              201: {
                description: "Task created",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/Task" }
                  }
                }
              }
            },
            security: [{ BearerAuth: [] }]
          }
        }
      }
    }
  };

  // --- STATE ---
  let currentSpec = null;
  let currentEndpoint = null; // { path, method, data }
  let authSettings = { scheme: 'none', bearerToken: '', apiKeyHeader: 'api_key', apiKeyValue: '', username: '', password: '' };
  let sandboxMode = 'mock'; // 'mock' | 'live'
  let activeSnippetLang = 'curl'; // 'curl' | 'fetch' | 'python' | 'go'

  // --- DOM ELEMENTS ---
  const presetSelector = document.getElementById('preset-selector');
  const uploadTrigger = document.getElementById('upload-trigger');
  const specFileInput = document.getElementById('spec-file-input');
  const themeToggle = document.getElementById('theme-toggle');
  
  const searchInput = document.getElementById('endpoint-search');
  const authSectionToggle = document.getElementById('auth-section-toggle');
  const authSectionContent = document.getElementById('auth-section-content');
  const authTypeSelect = document.getElementById('auth-type-select');
  const authFieldsContainer = document.getElementById('auth-scheme-fields');
  const saveAuthBtn = document.getElementById('save-auth-btn');
  const apiNavigationList = document.getElementById('api-navigation-list');

  const docDetailsPane = document.getElementById('doc-details-pane');

  const sandboxMock = document.getElementById('sandbox-mock');
  const sandboxLive = document.getElementById('sandbox-live');
  const tryItForm = document.getElementById('try-it-form');
  const dynamicParamsFields = document.getElementById('dynamic-params-fields');
  const requestBodyEditor = document.getElementById('request-body-editor');
  const formatBodyBtn = document.getElementById('format-body-btn');
  const snippetOutput = document.getElementById('snippet-output');
  const copySnippetBtn = document.getElementById('copy-snippet-btn');
  const sendRequestBtn = document.getElementById('send-request-btn');

  const responseMetaTags = document.getElementById('response-meta-tags');
  const responseStatus = document.getElementById('response-status');
  const responseTime = document.getElementById('response-time');
  const responseSpinner = document.getElementById('response-spinner');
  const responseViewport = document.getElementById('response-viewport');
  const tabRespBody = document.getElementById('tab-resp-body');
  const tabRespHeaders = document.getElementById('tab-resp-headers');
  const responseBodyPanel = document.getElementById('response-body-panel');
  const responseBodyPre = document.getElementById('response-body-pre');
  const responseHeadersPanel = document.getElementById('response-headers-panel');
  const responseHeadersPre = document.getElementById('response-headers-pre');
  const copyResponseBtn = document.getElementById('copy-response-btn');

  // --- INITIALIZATIONS ---
  const init = () => {
    // Theme config
    const savedTheme = localStorage.getItem('apidoc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initial spec loading
    loadPreset(presetSelector.value);

    // Initial auth fields loading
    updateAuthFields('none');
  };

  const updateThemeIcon = (theme) => {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('apidoc_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // --- SPEC LOADERS ---
  const loadPreset = (presetName) => {
    const spec = specPresets[presetName];
    if (spec) {
      currentSpec = spec;
      document.title = `${spec.info.title} - APIDoc Viewer`;
      buildNavigation();
      loadDefaultEndpoint();
    }
  };

  presetSelector.addEventListener('change', (e) => {
    loadPreset(e.target.value);
  });

  uploadTrigger.addEventListener('click', () => {
    specFileInput.click();
  });

  specFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      try {
        let specObj = null;
        if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
          if (typeof jsyaml !== 'undefined') {
            specObj = jsyaml.load(content);
          } else {
            alert("YAML parser library is not loaded. Try uploading a JSON spec.");
            return;
          }
        } else {
          specObj = JSON.parse(content);
        }

        if (specObj && specObj.openapi) {
          currentSpec = specObj;
          document.title = `${specObj.info.title} - APIDoc Viewer`;
          buildNavigation();
          loadDefaultEndpoint();
          alert(`Successfully uploaded and parsed: ${specObj.info.title}`);
        } else {
          alert("Invalid spec. Could not find a valid OpenAPI header line.");
        }
      } catch (err) {
        alert(`Failed to parse specification file:\n${err.message}`);
      }
    };
    reader.readAsText(file);
  });

  // --- SCHEMA REFERENCE RESOLVER ---
  const resolveSchema = (schema) => {
    if (!schema) return null;
    if (schema.$ref) {
      const refPath = schema.$ref.replace('#/', '').split('/');
      let current = currentSpec;
      for (const path of refPath) {
        if (!current) return null;
        current = current[path];
      }
      return resolveSchema(current);
    }
    return schema;
  };

  // --- AUTH ACCORDION ---
  authSectionToggle.addEventListener('click', () => {
    authSectionToggle.classList.toggle('active');
    authSectionContent.classList.toggle('hidden-height');
  });

  authTypeSelect.addEventListener('change', (e) => {
    updateAuthFields(e.target.value);
  });

  const updateAuthFields = (scheme) => {
    authFieldsContainer.innerHTML = '';
    if (scheme === 'bearer') {
      authFieldsContainer.innerHTML = `
        <div class="auth-group">
          <label for="bearer-token-input" class="form-label">Token (JWT)</label>
          <input type="text" id="bearer-token-input" class="auth-input" placeholder="eyJhbGciOi..." value="${authSettings.bearerToken}">
        </div>
      `;
    } else if (scheme === 'apikey') {
      authFieldsContainer.innerHTML = `
        <div class="auth-group">
          <label for="apikey-name-input" class="form-label">Key Name</label>
          <input type="text" id="apikey-name-input" class="auth-input" placeholder="X-API-KEY" value="${authSettings.apiKeyHeader}">
        </div>
        <div class="auth-group">
          <label for="apikey-value-input" class="form-label">Key Value</label>
          <input type="text" id="apikey-value-input" class="auth-input" placeholder="your_secret_key" value="${authSettings.apiKeyValue}">
        </div>
      `;
    } else if (scheme === 'basic') {
      authFieldsContainer.innerHTML = `
        <div class="auth-group">
          <label for="basic-user-input" class="form-label">Username</label>
          <input type="text" id="basic-user-input" class="auth-input" placeholder="admin" value="${authSettings.username}">
        </div>
        <div class="auth-group">
          <label for="basic-pass-input" class="form-label">Password</label>
          <input type="password" id="basic-pass-input" class="auth-input" placeholder="••••••••" value="${authSettings.password}">
        </div>
      `;
    }
  };

  saveAuthBtn.addEventListener('click', () => {
    const scheme = authTypeSelect.value;
    authSettings.scheme = scheme;
    
    if (scheme === 'bearer') {
      authSettings.bearerToken = document.getElementById('bearer-token-input').value.trim();
    } else if (scheme === 'apikey') {
      authSettings.apiKeyHeader = document.getElementById('apikey-name-input').value.trim() || 'api_key';
      authSettings.apiKeyValue = document.getElementById('apikey-value-input').value.trim();
    } else if (scheme === 'basic') {
      authSettings.username = document.getElementById('basic-user-input').value.trim();
      authSettings.password = document.getElementById('basic-pass-input').value;
    }

    // Collapse auth window
    authSectionToggle.classList.remove('active');
    authSectionContent.classList.add('hidden-height');

    // Re-compile documentation active endpoint auth headers state & code snippets
    if (currentEndpoint) {
      loadEndpointDetails(currentEndpoint.path, currentEndpoint.method);
    }
  });

  // --- NAVIGATION GENERATOR ---
  const buildNavigation = () => {
    apiNavigationList.innerHTML = '';
    if (!currentSpec || !currentSpec.paths) return;

    // Group paths by tags
    const groups = {};

    Object.keys(currentSpec.paths).forEach(path => {
      const methods = currentSpec.paths[path];
      Object.keys(methods).forEach(method => {
        // Skip keys that are not HTTP verbs
        if (!['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) return;

        const data = methods[method];
        const tags = data.tags || ['general'];

        tags.forEach(tag => {
          if (!groups[tag]) {
            groups[tag] = [];
          }
          groups[tag].push({
            path,
            method: method.toLowerCase(),
            summary: data.summary || `${method.toUpperCase()} ${path}`
          });
        });
      });
    });

    // Renders tags and elements
    Object.keys(groups).sort().forEach(tag => {
      const groupEl = document.createElement('div');
      groupEl.className = 'nav-group';

      const header = document.createElement('div');
      header.className = 'group-header';
      header.innerHTML = `
        <span>${tag}</span>
        <i class="fa-solid fa-chevron-down arrow"></i>
      `;

      const endpointsContainer = document.createElement('div');
      endpointsContainer.className = 'group-endpoints';

      groups[tag].forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'nav-item';
        itemEl.setAttribute('data-path', item.path);
        itemEl.setAttribute('data-method', item.method);
        itemEl.innerHTML = `
          <span class="badge-verb ${item.method}">${item.method}</span>
          <span class="nav-path" title="${item.path}">${item.path}</span>
        `;

        itemEl.addEventListener('click', () => {
          // Select item
          document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
          itemEl.classList.add('active');
          loadEndpointDetails(item.path, item.method);
        });

        endpointsContainer.appendChild(itemEl);
      });

      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        endpointsContainer.classList.toggle('collapsed');
      });

      groupEl.appendChild(header);
      groupEl.appendChild(endpointsContainer);
      apiNavigationList.appendChild(groupEl);
    });

    // Run active filters if search term present
    filterNavigation(searchInput.value.trim());
  };

  const loadDefaultEndpoint = () => {
    const firstNavItem = apiNavigationList.querySelector('.nav-item');
    if (firstNavItem) {
      firstNavItem.click();
    } else {
      docDetailsPane.innerHTML = `
        <div class="empty-state-intro">
          <i class="fa-solid fa-circle-nodes"></i>
          <h2>No Endpoints</h2>
          <p>This specification does not contain valid path configurations.</p>
        </div>
      `;
    }
  };

  // Search Filter function
  const filterNavigation = (query) => {
    const searchVal = query.toLowerCase();
    const navGroups = apiNavigationList.querySelectorAll('.nav-group');

    navGroups.forEach(group => {
      let groupHasMatch = false;
      const items = group.querySelectorAll('.nav-item');

      items.forEach(item => {
        const path = item.getAttribute('data-path').toLowerCase();
        const method = item.getAttribute('data-method').toLowerCase();
        
        if (path.includes(searchVal) || method.includes(searchVal)) {
          item.classList.remove('hidden');
          groupHasMatch = true;
        } else {
          item.classList.add('hidden');
        }
      });

      if (groupHasMatch) {
        group.classList.remove('hidden');
      } else {
        group.classList.add('hidden');
      }
    });
  };

  searchInput.addEventListener('input', (e) => {
    filterNavigation(e.target.value.trim());
  });

  // --- ENDPOINT DETAILS CONTROLLER (COLUMN 2 & 3 INTEGRATION) ---
  const loadEndpointDetails = (path, method) => {
    if (!currentSpec || !currentSpec.paths[path]) return;
    const data = currentSpec.paths[path][method];
    currentEndpoint = { path, method, data };

    // Reset console states
    responseMetaTags.classList.add('hidden');
    responseViewport.classList.add('hidden');
    responseSpinner.classList.add('hidden');

    // 1. Build Docs Detail Column (Middle)
    buildDocumentationPane(path, method, data);

    // 2. Build Try It Out Column console parameters fields (Right)
    buildConsoleSandboxFields(path, method, data);

    // 3. Render snippet output initial configuration
    updateCodeSnippet();
  };

  const buildDocumentationPane = (path, method, data) => {
    const servers = currentSpec.servers || [{ url: "/" }];
    const serverUrl = servers[0].url;

    // Security constraints description
    let isSecured = false;
    let authSchemeName = 'No Authentication';
    
    if (data.security && data.security.length > 0) {
      isSecured = true;
      const schemeKeys = Object.keys(data.security[0]);
      if (schemeKeys.length > 0) {
        authSchemeName = schemeKeys[0];
      }
    } else if (currentSpec.security && currentSpec.security.length > 0) {
      isSecured = true;
      const schemeKeys = Object.keys(currentSpec.security[0]);
      if (schemeKeys.length > 0) {
        authSchemeName = schemeKeys[0];
      }
    }

    let authPillHtml = '';
    if (isSecured) {
      const isAuthApplied = authSettings.scheme !== 'none';
      const lockIcon = isAuthApplied ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open';
      authPillHtml = `
        <div class="auth-req-bar ${isAuthApplied ? 'authenticated' : ''}">
          <i class="${lockIcon}"></i>
          <span>Requires Authorization: <strong>${authSchemeName}</strong> ${isAuthApplied ? '(Applied)' : '(Missing)'}</span>
        </div>
      `;
    }

    // Parameters builder HTML
    let paramsHtml = '';
    const params = data.parameters || [];
    
    if (params.length > 0) {
      paramsHtml = `
        <div class="doc-detail-section">
          <h3>Parameters</h3>
          <div class="params-table-wrapper">
            <table class="params-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${params.map(p => {
                  const resolvedParam = resolveSchema(p);
                  const schema = resolveSchema(resolvedParam.schema);
                  const pType = schema ? schema.type || 'any' : 'any';
                  const isRequired = resolvedParam.required ? '<span class="param-required">* required</span>' : '';
                  return `
                    <tr>
                      <td class="param-name-cell">
                        <span class="param-name">${resolvedParam.name}</span>
                        ${isRequired}
                        <span class="param-type-badge">${pType}</span>
                      </td>
                      <td>
                        <span class="param-location-badge">${resolvedParam.in}</span>
                      </td>
                      <td class="param-desc">
                        ${resolvedParam.description || 'No description provided.'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // Request Body Schema Tree HTML
    let requestBodyHtml = '';
    if (data.requestBody) {
      const content = data.requestBody.content;
      const jsonContent = content ? content['application/json'] : null;
      const schema = jsonContent ? resolveSchema(jsonContent.schema) : null;

      if (schema) {
        requestBodyHtml = `
          <div class="doc-detail-section">
            <h3>Request Body Schema</h3>
            <div class="params-table-wrapper" style="padding: 14px; background-color: rgba(255, 255, 255, 0.01)">
              ${renderSchemaTreeNode("Request Body", schema, true)}
            </div>
          </div>
        `;
      }
    }

    // Responses status layouts
    let responsesHtml = '';
    if (data.responses) {
      const statusCodes = Object.keys(data.responses);
      const initialCode = statusCodes[0];

      responsesHtml = `
        <div class="doc-detail-section">
          <h3>Responses</h3>
          <div class="responses-card">
            <!-- Responses status select bar tabs -->
            <div class="response-status-bar">
              ${statusCodes.map((code, idx) => {
                const codeClass = code.startsWith('2') ? 'code-2xx' : code.startsWith('4') ? 'code-4xx' : 'code-5xx';
                return `
                  <button type="button" class="response-status-btn ${codeClass} ${idx === 0 ? 'active' : ''}" data-status="${code}">
                    <span class="status-indicator-dot"></span>${code}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Responses content display schemas -->
            <div id="response-schemas-container">
              ${renderResponseSchemaDetails(initialCode, data.responses[initialCode])}
            </div>
          </div>
        </div>
      `;
    }

    docDetailsPane.innerHTML = `
      <div class="endpoint-title-block">
        <span class="endpoint-tag-category">${data.tags ? data.tags[0] : 'general'}</span>
        <div class="endpoint-header-path">
          <span class="badge-verb ${method}">${method}</span>
          <h2>${path}</h2>
        </div>
        <div class="endpoint-description">${data.summary || 'No summary provided.'}</div>
        ${authPillHtml}
      </div>

      ${paramsHtml}
      ${requestBodyHtml}
      ${responsesHtml}
    `;

    // Attaches Event listeners for responses tab switch
    const responseBtns = docDetailsPane.querySelectorAll('.response-status-btn');
    responseBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        responseBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const code = btn.getAttribute('data-status');
        const schemaContainer = docDetailsPane.querySelector('#response-schemas-container');
        schemaContainer.innerHTML = renderResponseSchemaDetails(code, data.responses[code]);
        setupTreeEvents(schemaContainer);
      });
    });

    setupTreeEvents(docDetailsPane);
  };

  // Traverses OpenAPI JSON schema and compiles a nested HTML structure
  const renderSchemaTreeNode = (name, schema, isRequired = false) => {
    const resolved = resolveSchema(schema);
    if (!resolved) return '';

    const type = resolved.type || 'object';
    const desc = resolved.description ? `<span class="schema-node-desc"> // ${resolved.description}</span>` : '';
    const reqText = isRequired ? '<span class="schema-node-required">*</span>' : '';

    if (type === 'object' && resolved.properties) {
      const keys = Object.keys(resolved.properties);
      return `
        <div class="schema-node">
          <div class="schema-node-header">
            <i class="fa-solid fa-chevron-down schema-node-expand-btn"></i>
            <span class="schema-node-name">${name}</span>
            <span class="schema-node-type">object</span>
            ${reqText}
            ${desc}
          </div>
          <div class="schema-node-children">
            ${keys.map(k => {
              const reqList = resolved.required || [];
              const childReq = reqList.includes(k);
              return renderSchemaTreeNode(k, resolved.properties[k], childReq);
            }).join('')}
          </div>
        </div>
      `;
    } else if (type === 'array' && resolved.items) {
      return `
        <div class="schema-node">
          <div class="schema-node-header">
            <i class="fa-solid fa-chevron-down schema-node-expand-btn"></i>
            <span class="schema-node-name">${name}</span>
            <span class="schema-node-type">array[]</span>
            ${reqText}
            ${desc}
          </div>
          <div class="schema-node-children">
            ${renderSchemaTreeNode("[items]", resolved.items, false)}
          </div>
        </div>
      `;
    } else {
      // Leaf Node (Primitive fields)
      return `
        <div class="schema-node">
          <div class="schema-node-header" style="padding-left: 16px;">
            <span class="schema-node-name">${name}</span>:
            <span class="schema-node-type">${type}${resolved.format ? `(${resolved.format})` : ''}</span>
            ${reqText}
            ${desc}
          </div>
        </div>
      `;
    }
  };

  const renderResponseSchemaDetails = (code, responseObj) => {
    const resolvedResponse = resolveSchema(responseObj);
    const desc = resolvedResponse.description || 'No description provided.';
    const content = resolvedResponse.content;
    const jsonContent = content ? content['application/json'] : null;
    const schema = jsonContent ? resolveSchema(jsonContent.schema) : null;

    let schemaTreeHtml = '<div class="console-info-message">No response schema definition for this status code.</div>';
    if (schema) {
      schemaTreeHtml = renderSchemaTreeNode("Response Payload", schema);
    }

    return `
      <p class="endpoint-description" style="margin-bottom: 12px;"><strong>${code}</strong>: ${desc}</p>
      <div class="params-table-wrapper" style="padding: 14px; background-color: rgba(255, 255, 255, 0.01)">
        ${schemaTreeHtml}
      </div>
    `;
  };

  const setupTreeEvents = (container) => {
    const expandBtns = container.querySelectorAll('.schema-node-expand-btn');
    expandBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('collapsed');
        const parentNode = btn.closest('.schema-node');
        const children = parentNode.querySelector('.schema-node-children');
        if (children) {
          children.classList.toggle('collapsed');
        }
      });
    });
  };

  // --- COLUMN 3: TRY-IT-OUT CONSOLE SANDBOX GENERATION ---
  const buildConsoleSandboxFields = (path, method, data) => {
    // 1. Parameters fields
    dynamicParamsFields.innerHTML = '';
    const params = data.parameters || [];

    if (params.length === 0) {
      dynamicParamsFields.innerHTML = '<div class="console-info-message">No query or path parameters for this endpoint.</div>';
    } else {
      params.forEach(p => {
        const resolved = resolveSchema(p);
        const schema = resolveSchema(resolved.schema);
        const pType = schema ? schema.type || 'string' : 'string';
        const defaultValue = schema ? schema.default || '' : '';
        const isRequired = resolved.required;

        const inputGroup = document.createElement('div');
        inputGroup.className = 'param-input-group';
        inputGroup.innerHTML = `
          <div class="param-input-label">
            <span>${resolved.name} <span class="param-location-badge">(${resolved.in})</span></span>
            ${isRequired ? '<span class="req">* required</span>' : ''}
          </div>
          <input type="text" class="param-text-field" data-name="${resolved.name}" data-in="${resolved.in}" placeholder="${pType}..." value="${defaultValue}">
        `;

        const inputEl = inputGroup.querySelector('input');
        inputEl.addEventListener('input', () => {
          updateCodeSnippet();
        });

        dynamicParamsFields.appendChild(inputGroup);
      });
    }

    // 2. Request Body prefill Mocks
    const consoleBodySection = document.getElementById('console-body-section');
    requestBodyEditor.value = '';

    if (data.requestBody) {
      consoleBodySection.classList.remove('hidden');
      const content = data.requestBody.content;
      const jsonContent = content ? content['application/json'] : null;
      const schema = jsonContent ? resolveSchema(jsonContent.schema) : null;

      if (schema) {
        const mockObj = generateMockJson(schema);
        requestBodyEditor.value = JSON.stringify(mockObj, null, 2);
      } else {
        requestBodyEditor.value = '{}';
      }
    } else {
      consoleBodySection.classList.add('hidden');
    }
  };

  // Recursively traverses schema definitions and compiles a mock JS object
  const generateMockJson = (schema) => {
    const resolved = resolveSchema(schema);
    if (!resolved) return null;

    const type = resolved.type || 'object';

    if (resolved.example) {
      return resolved.example;
    }

    if (type === 'object') {
      const mockObj = {};
      if (resolved.properties) {
        Object.keys(resolved.properties).forEach(k => {
          mockObj[k] = generateMockJson(resolved.properties[k]);
        });
      }
      return mockObj;
    } else if (type === 'array') {
      const items = resolved.items ? [generateMockJson(resolved.items)] : [];
      return items;
    } else if (type === 'integer' || type === 'number') {
      return resolved.default !== undefined ? resolved.default : 101;
    } else if (type === 'boolean') {
      return resolved.default !== undefined ? resolved.default : true;
    } else if (type === 'string') {
      if (resolved.enum && resolved.enum.length > 0) {
        return resolved.enum[0];
      }
      if (resolved.format === 'date-time') {
        return new Date().toISOString();
      }
      if (resolved.format === 'password') {
        return "password123";
      }
      return resolved.default || "string_sample";
    }
    return null;
  };

  // JSON Body formatter
  formatBodyBtn.addEventListener('click', () => {
    try {
      const rawText = requestBodyEditor.value.trim();
      if (!rawText) return;
      const obj = JSON.parse(rawText);
      requestBodyEditor.value = JSON.stringify(obj, null, 2);
    } catch (err) {
      alert("Invalid JSON format. Check brackets and commas.");
    }
  });

  requestBodyEditor.addEventListener('input', () => {
    updateCodeSnippet();
  });

  // --- SNIPPET COMPILER ---
  const compileUrl = () => {
    if (!currentEndpoint) return '';
    const servers = currentSpec.servers || [{ url: "/" }];
    const baseUrl = servers[0].url;
    let url = baseUrl + currentEndpoint.path;

    // Path parameters replacing
    const paramInputs = dynamicParamsFields.querySelectorAll('input');
    paramInputs.forEach(input => {
      const loc = input.getAttribute('data-in');
      const name = input.getAttribute('data-name');
      const val = input.value.trim();

      if (loc === 'path') {
        url = url.replace(`{${name}}`, encodeURIComponent(val || `{${name}}`));
      }
    });

    // Query parameters appending
    let queryParams = [];
    paramInputs.forEach(input => {
      const loc = input.getAttribute('data-in');
      const name = input.getAttribute('data-name');
      const val = input.value.trim();

      if (loc === 'query' && val !== '') {
        queryParams.push(`${name}=${encodeURIComponent(val)}`);
      }
    });

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  };

  const getHeaders = () => {
    const headers = {
      'Accept': 'application/json'
    };

    if (currentEndpoint && currentEndpoint.data.requestBody) {
      headers['Content-Type'] = 'application/json';
    }

    // Injects Authorization settings
    if (authSettings.scheme === 'bearer' && authSettings.bearerToken) {
      headers['Authorization'] = `Bearer ${authSettings.bearerToken}`;
    } else if (authSettings.scheme === 'apikey' && authSettings.apiKeyValue) {
      headers[authSettings.apiKeyHeader] = authSettings.apiKeyValue;
    } else if (authSettings.scheme === 'basic' && authSettings.username) {
      const encoded = btoa(`${authSettings.username}:${authSettings.password}`);
      headers['Authorization'] = `Basic ${encoded}`;
    }

    // Paths header parameter inputs overriding
    const paramInputs = dynamicParamsFields.querySelectorAll('input');
    paramInputs.forEach(input => {
      const loc = input.getAttribute('data-in');
      const name = input.getAttribute('data-name');
      const val = input.value.trim();

      if (loc === 'header' && val !== '') {
        headers[name] = val;
      }
    });

    return headers;
  };

  const updateCodeSnippet = () => {
    if (!currentEndpoint) return;
    const url = compileUrl();
    const headers = getHeaders();
    const method = currentEndpoint.method.toUpperCase();

    // Request Body value
    let hasBody = !!currentEndpoint.data.requestBody;
    let bodyRaw = requestBodyEditor.value.trim();

    let output = '';

    if (activeSnippetLang === 'curl') {
      output = `curl -X ${method} "${url}" \\\n`;
      Object.keys(headers).forEach(k => {
        output += `  -H "${k}: ${headers[k]}" \\\n`;
      });
      if (hasBody && bodyRaw) {
        // inline compacting single quotes
        const compactBody = JSON.stringify(JSON.parse(bodyRaw || '{}')).replace(/'/g, "'\\''");
        output += `  -d '${compactBody}'`;
      } else {
        // remove trailing slash if no body
        output = output.slice(0, -3);
      }
    } else if (activeSnippetLang === 'fetch') {
      const headersStr = JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ');
      output = `fetch('${url}', {\n`;
      output += `  method: '${method}',\n`;
      output += `  headers: ${headersStr}`;
      if (hasBody && bodyRaw) {
        output += `,\n  body: JSON.stringify(${JSON.stringify(JSON.parse(bodyRaw || '{}'), null, 2).replace(/\n/g, '\n  ')})`;
      }
      output += `\n})`;
    } else if (activeSnippetLang === 'python') {
      const pyHeaders = JSON.stringify(headers, null, 4);
      output = `import requests\n\n`;
      output += `url = "${url}"\n`;
      output += `headers = ${pyHeaders}\n\n`;
      if (hasBody && bodyRaw) {
        output += `payload = ${JSON.stringify(JSON.parse(bodyRaw || '{}'), null, 4)}\n`;
        output += `response = requests.${method.toLowerCase()}(url, headers=headers, json=payload)\n`;
      } else {
        output += `response = requests.${method.toLowerCase()}(url, headers=headers)\n`;
      }
      output += `print(response.json())`;
    } else if (activeSnippetLang === 'go') {
      output = `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n`;
      if (hasBody && bodyRaw) output += `\t"bytes"\n`;
      output += `)\n\nfunc main() {\n`;
      output += `\turl := "${url}"\n`;
      if (hasBody && bodyRaw) {
        const compactGoBody = JSON.stringify(JSON.parse(bodyRaw || '{}')).replace(/"/g, "\\\"");
        output += `\tvar jsonStr = []byte(\`${compactGoBody}\`)\n`;
        output += `\treq, _ := http.NewRequest("${method}", url, bytes.NewBuffer(jsonStr))\n`;
      } else {
        output += `\treq, _ := http.NewRequest("${method}", url, nil)\n`;
      }
      Object.keys(headers).forEach(k => {
        output += `\treq.Header.Set("${k}", "${headers[k]}")\n`;
      });
      output += `\tclient := &http.Client{}\n\tresp, _ := client.Do(req)\n\tdefer resp.Body.Close()\n`;
      output += `\tbody, _ := ioutil.ReadAll(resp.Body)\n\tfmt.Println(string(body))\n}`;
    }

    snippetOutput.textContent = output;
  };

  // Snippet tabs bindings
  const snippetTabs = document.querySelectorAll('.snippet-tab');
  snippetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      snippetTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeSnippetLang = tab.getAttribute('data-lang');
      updateCodeSnippet();
    });
  });

  copySnippetBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(snippetOutput.textContent).then(() => {
      const icon = copySnippetBtn.querySelector('i');
      icon.className = 'fa-solid fa-check';
      setTimeout(() => {
        icon.className = 'fa-regular fa-copy';
      }, 1500);
    });
  });

  // --- INTERACTIVE HTTP SANDBOX CLIENT ---
  sandboxMock.addEventListener('click', () => {
    sandboxMock.classList.add('active');
    sandboxLive.classList.remove('active');
    sandboxMode = 'mock';
  });

  sandboxLive.addEventListener('click', () => {
    sandboxLive.classList.add('active');
    sandboxMock.classList.remove('active');
    sandboxMode = 'live';
  });

  tryItForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEndpoint) return;

    responseMetaTags.classList.add('hidden');
    responseViewport.classList.add('hidden');
    responseSpinner.classList.remove('hidden');

    const url = compileUrl();
    const headers = getHeaders();
    const method = currentEndpoint.method.toUpperCase();
    const hasBody = !!currentEndpoint.data.requestBody;
    const bodyRaw = requestBodyEditor.value.trim();

    if (sandboxMode === 'mock') {
      // 1. MOCK SERVICE SANDBOX ENGINE (OFFLINE SECURE)
      setTimeout(() => {
        responseSpinner.classList.add('hidden');
        responseMetaTags.classList.remove('hidden');
        responseViewport.classList.remove('hidden');

        // Look up success response or use default
        const responses = currentEndpoint.data.responses || {};
        const successCode = Object.keys(responses).find(c => c.startsWith('2')) || '200';
        
        responseStatus.className = 'status-pill status-success';
        responseStatus.textContent = `${successCode} OK`;
        responseTime.textContent = `${Math.floor(Math.random() * 20) + 5} ms`;

        // Generates mockup payload JSON matching response schema structure
        const responseData = responses[successCode] ? resolveSchema(responses[successCode]) : {};
        const content = responseData.content;
        const jsonContent = content ? content['application/json'] : null;
        const schema = jsonContent ? resolveSchema(jsonContent.schema) : null;

        let mockResponseObj = { message: "Success" };
        if (schema) {
          mockResponseObj = generateMockJson(schema);
        }

        responseBodyPre.textContent = JSON.stringify(mockResponseObj, null, 2);
        responseHeadersPre.textContent = `content-type: application/json\nx-powered-by: apidoc-mock-service\nx-request-mode: mock-sandbox\ndate: ${new Date().toUTCString()}`;
      }, 450);
    } else {
      // 2. LIVE FETCH OPERATIONS
      const startTime = performance.now();
      const fetchOptions = {
        method,
        headers
      };

      if (hasBody && bodyRaw) {
        try {
          fetchOptions.body = JSON.stringify(JSON.parse(bodyRaw));
        } catch (err) {
          responseSpinner.classList.add('hidden');
          alert("Invalid JSON request body. Please verify before sending.");
          return;
        }
      }

      fetch(url, fetchOptions)
        .then(resp => {
          const duration = Math.round(performance.now() - startTime);
          responseSpinner.classList.add('hidden');
          responseMetaTags.classList.remove('hidden');
          responseViewport.classList.remove('hidden');

          const is2xx = resp.status >= 200 && resp.status < 300;
          responseStatus.className = `status-pill ${is2xx ? 'status-success' : 'status-error'}`;
          responseStatus.textContent = `${resp.status} ${resp.statusText || 'Response'}`;
          responseTime.textContent = `${duration} ms`;

          // Format headers
          let headersText = '';
          resp.headers.forEach((val, key) => {
            headersText += `${key}: ${val}\n`;
          });
          responseHeadersPre.textContent = headersText || 'No headers returned.';

          // Try parsing body as JSON or falls to plain text
          return resp.text().then(text => {
            try {
              const obj = JSON.parse(text);
              responseBodyPre.textContent = JSON.stringify(obj, null, 2);
            } catch (err) {
              responseBodyPre.textContent = text || 'Empty Response Body';
            }
          });
        })
        .catch(err => {
          responseSpinner.classList.add('hidden');
          responseMetaTags.classList.remove('hidden');
          responseViewport.classList.remove('hidden');

          responseStatus.className = 'status-pill status-error';
          responseStatus.textContent = 'Network Error';
          responseTime.textContent = '0 ms';

          responseHeadersPre.textContent = `error-type: client-network-failure\ncors-warning: browser-cors-policy-blocks-request`;
          
          responseBodyPre.textContent = JSON.stringify({
            error: "Failed to complete HTTP request.",
            cause: err.message || "Network Error or CORS policy block.",
            resolution: "This API server may not support CORS requests from local origins. Try switching the console switcher above to 'Mock' sandbox mode to test schemas locally."
          }, null, 2);
        });
    }
  });

  // Response tab switcher
  tabRespBody.addEventListener('click', () => {
    tabRespBody.classList.add('active');
    tabRespHeaders.classList.remove('active');
    responseBodyPanel.classList.remove('hidden');
    responseHeadersPanel.classList.add('hidden');
  });

  tabRespHeaders.addEventListener('click', () => {
    tabRespHeaders.classList.add('active');
    tabRespBody.classList.remove('active');
    responseHeadersPanel.classList.remove('hidden');
    responseBodyPanel.classList.add('hidden');
  });

  // Copy response
  copyResponseBtn.addEventListener('click', () => {
    const activePanel = responseBodyPanel.classList.contains('hidden') ? responseHeadersPre : responseBodyPre;
    navigator.clipboard.writeText(activePanel.textContent).then(() => {
      const icon = copyResponseBtn.querySelector('i');
      icon.className = 'fa-solid fa-check';
      setTimeout(() => {
        icon.className = 'fa-regular fa-copy';
      }, 1500);
    });
  });

  // Run init
  init();
});
