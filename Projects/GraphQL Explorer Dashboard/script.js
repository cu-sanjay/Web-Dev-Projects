/**
 * GraphExplorer - GraphQL IDE & Resolver Engine
 * Contains preset schemas, lexer/parser query interpreters, mock database resolvers, and code generators.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- MOCK DATABASE SCHEMAS ---
  const schemas = {
    users: {
      types: {
        Query: {
          description: "Root Query operations",
          fields: {
            users: { type: "[User!]", description: "List all user profiles", args: { limit: { type: "Int", description: "Maximum records to return" } } },
            user: { type: "User", description: "Fetch a specific user by identifier", args: { id: { type: "ID!", description: "Target user ID" } } }
          }
        },
        Mutation: {
          description: "Root Mutation operations",
          fields: {
            createUser: {
              type: "User!",
              description: "Create and register a new user",
              args: {
                name: { type: "String!", description: "Full name of the user" },
                email: { type: "String!", description: "Valid email address" },
                companyId: { type: "ID!", description: "Associated company identifier" }
              }
            }
          }
        },
        User: {
          description: "User profile details",
          fields: {
            id: { type: "ID!", description: "Unique user identifier" },
            name: { type: "String!", description: "Display name" },
            email: { type: "String!", description: "Email coordinates" },
            age: { type: "Int", description: "Age in years" },
            company: { type: "Company!", description: "Associated employment company details" }
          }
        },
        Company: {
          description: "Corporate organisation details",
          fields: {
            id: { type: "ID!", description: "Unique company identifier" },
            name: { type: "String!", description: "Registered corporate title" },
            industry: { type: "String", description: "Commercial industry sector" }
          }
        }
      },
      database: {
        companies: [
          { id: "1", name: "TechCorp", industry: "Technology" },
          { id: "2", name: "FinGroup", industry: "Finance" }
        ],
        users: [
          { id: "1", name: "Alice Smith", email: "alice@tech.com", age: 28, companyId: "1" },
          { id: "2", name: "Bob Jones", email: "bob@finance.com", age: 34, companyId: "2" },
          { id: "3", name: "Charlie Brown", email: "charlie@tech.com", age: 22, companyId: "1" }
        ]
      },
      defaultQuery: `# User Directory Query Preset
query GetUsersList {
  users(limit: 2) {
    id
    name
    email
    company {
      name
      industry
    }
  }
}
`,
      defaultVariables: `{
  "limit": 2
}`
    },
    blog: {
      types: {
        Query: {
          description: "Root Query operations",
          fields: {
            posts: { type: "[Post!]", description: "List all published posts" },
            post: { type: "Post", description: "Retrieve post by ID", args: { id: { type: "ID!", description: "Target post ID" } } }
          }
        },
        Mutation: {
          description: "Root Mutation operations",
          fields: {
            createPost: {
              type: "Post!",
              description: "Publish a new blog post",
              args: {
                title: { type: "String!", description: "Title of the post" },
                content: { type: "String!", description: "Body text content" },
                authorId: { type: "ID!", description: "Author account ID" }
              }
            }
          }
        },
        Post: {
          description: "Blog publication post details",
          fields: {
            id: { type: "ID!", description: "Unique post ID" },
            title: { type: "String!", description: "Title heading" },
            content: { type: "String!", description: "Body paragraph content" },
            author: { type: "Author!", description: "Writer credentials" },
            comments: { type: "[Comment!]", description: "List of reader comments" }
          }
        },
        Author: {
          description: "Author profile credentials",
          fields: {
            id: { type: "ID!", description: "Account identifier" },
            name: { type: "String!", description: "Display writer name" },
            email: { type: "String!", description: "Email address" }
          }
        },
        Comment: {
          description: "Reader feedback responses",
          fields: {
            id: { type: "ID!", description: "Comment ID" },
            text: { type: "String!", description: "Reader response commentary" },
            author: { type: "String!", description: "Display name of reader" }
          }
        }
      },
      database: {
        authors: [
          { id: "1", name: "John Doe", email: "john@blog.com" },
          { id: "2", name: "Jane Smith", email: "jane@blog.com" }
        ],
        posts: [
          { id: "1", title: "Introduction to GraphQL", content: "GraphQL is an API query language that enables clients to request exactly the data they need, no more and no less.", authorId: "1", comments: [{ id: "c1", text: "Brilliant explanation!", author: "Sarah" }, { id: "c2", text: "Helped me a lot, thanks!", author: "Mike" }] },
          { id: "2", title: "Vanilla JS vs Frameworks", content: "While frameworks offer structure, Vanilla JS provides raw speed and full canvas layout control without heavy build bundles.", authorId: "2", comments: [] }
        ]
      },
      defaultQuery: `# Blog Platform Query
query GetArticles {
  posts {
    id
    title
    content
    author {
      name
    }
    comments {
      text
      author
    }
  }
}
`,
      defaultVariables: `{}`
    },
    spacex: {
      types: {
        Query: {
          description: "SpaceX missions query",
          fields: {
            launches: { type: "[Launch!]", description: "Retrieve recent SpaceX space missions", args: { upcoming: { type: "Boolean", description: "Upcoming launches filter toggle" } } },
            launch: { type: "Launch", description: "Fetch specific mission log by ID", args: { id: { type: "ID!", description: "Launch mission ID" } } }
          }
        },
        Launch: {
          description: "Rocket launch mission stats",
          fields: {
            id: { type: "ID!", description: "Unique mission ID" },
            mission_name: { type: "String!", description: "Title of the space mission" },
            launch_year: { type: "Int!", description: "Calendar year of takeoff" },
            rocket: { type: "Rocket!", description: "Rocket model configuration" },
            details: { type: "String", description: "Objective status logs summary" }
          }
        },
        Rocket: {
          description: "Takeoff shuttle model settings",
          fields: {
            rocket_id: { type: "String!", description: "Unique model key" },
            rocket_name: { type: "String!", description: "Display shuttle name" },
            rocket_type: { type: "String!", description: "Propulsion configuration type" }
          }
        }
      },
      database: {
        rockets: [
          { rocket_id: "falcon9", rocket_name: "Falcon 9", rocket_type: "Merlin 1D" },
          { rocket_id: "falconheavy", rocket_name: "Falcon Heavy", rocket_type: "Merlin Boosted" }
        ],
        launches: [
          { id: "1", mission_name: "Starlink v1.0 L24", launch_year: 2021, rocketId: "falcon9", details: "Successful deployment of 60 Starlink satellites into orbit." },
          { id: "2", mission_name: "Demo-2 Crew Mission", launch_year: 2020, rocketId: "falcon9", details: "First crewed launch of Dragon spacecraft carrying NASA astronauts." },
          { id: "3", mission_name: "Arabsat-6A Mission", launch_year: 2019, rocketId: "falconheavy", details: "Successful launch and landing of all three Falcon Heavy booster cores." }
        ]
      },
      defaultQuery: `# SpaceX Missions Log Query
query GetLaunchHistory {
  launches {
    mission_name
    launch_year
    details
    rocket {
      rocket_name
      rocket_type
    }
  }
}
`,
      defaultVariables: `{}`
    }
  };

  // --- STATE ---
  let activePreset = 'users';
  let activeTab = 'docs'; // 'docs' | 'history'
  let activeSnippetLang = 'curl'; // 'curl' | 'fetch' | 'python'
  let queryHistory = [];

  // --- DOM ELEMENTS ---
  const schemaPresetSelect = document.getElementById('schema-preset');
  const endpointUrlInput = document.getElementById('endpoint-url');
  const sandboxBadge = document.getElementById('sandbox-badge');
  const runQueryBtn = document.getElementById('run-query-btn');
  const formatQueryBtn = document.getElementById('format-query-btn');
  const themeToggle = document.getElementById('theme-toggle');

  const tabDocs = document.getElementById('tab-docs');
  const tabHistory = document.getElementById('tab-history');
  const panelDocs = document.getElementById('panel-docs');
  const panelHistory = document.getElementById('panel-history');

  const schemaSearch = document.getElementById('schema-search');
  const schemaTreeView = document.getElementById('schema-tree-view');
  
  const historyItemsList = document.getElementById('history-items-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  const queryTextarea = document.getElementById('query-textarea');
  const variablesTextarea = document.getElementById('variables-textarea');
  const variablesDrawer = document.getElementById('variables-drawer');
  const variablesToggle = document.getElementById('variables-toggle');

  const statusIndicator = document.getElementById('status-indicator');
  const resultMetaTags = document.getElementById('result-meta-tags');
  const responseDuration = document.getElementById('response-duration');
  const resultSpinner = document.getElementById('result-spinner');
  const resultJsonPre = document.getElementById('result-json-pre');
  const snippetCodePre = document.getElementById('snippet-code-pre');
  const copySnippetBtn = document.getElementById('copy-snippet-btn');

  // Autocomplete tools
  const autocompleteTools = document.querySelectorAll('.toolbar-tool-btn');

  // --- INIT APPLICATION ---
  const init = () => {
    // Theme config
    const savedTheme = localStorage.getItem('graphexplorer_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Initial state loading
    loadPresetState(activePreset);
    loadHistoryCache();

    // Check custom URL badge matching
    updateUrlBadge();
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
    localStorage.setItem('graphexplorer_theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // --- PRESETS LOADING ---
  const loadPresetState = (presetKey) => {
    const data = schemas[presetKey];
    if (!data) return;

    activePreset = presetKey;
    queryTextarea.value = data.defaultQuery;
    variablesTextarea.value = data.defaultVariables;

    // Reset result windows
    resultJsonPre.textContent = '{}';
    statusIndicator.className = 'status-led led-idle';
    resultMetaTags.classList.add('hidden');

    buildSchemaTree();
    updateCodeSnippet();
  };

  schemaPresetSelect.addEventListener('change', (e) => {
    loadPresetState(e.target.value);
  });

  const updateUrlBadge = () => {
    const url = endpointUrlInput.value.trim();
    if (url.includes('api.graphexplorer.mock')) {
      sandboxBadge.textContent = 'MOCK';
      sandboxBadge.style.backgroundColor = 'var(--accent-bg)';
      sandboxBadge.style.color = 'var(--accent)';
    } else {
      sandboxBadge.textContent = 'LIVE';
      sandboxBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.12)';
      sandboxBadge.style.color = 'var(--led-success)';
    }
    updateCodeSnippet();
  };

  endpointUrlInput.addEventListener('input', updateUrlBadge);

  // --- TABS BINDINGS ---
  tabDocs.addEventListener('click', () => {
    tabDocs.classList.add('active');
    tabHistory.classList.remove('active');
    panelDocs.classList.remove('hidden');
    panelHistory.classList.add('hidden');
    activeTab = 'docs';
  });

  tabHistory.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabDocs.classList.remove('active');
    panelHistory.classList.remove('hidden');
    panelDocs.classList.add('hidden');
    activeTab = 'history';
    renderHistoryList();
  });

  // --- VARIABLES PANEL TOGGLE ---
  variablesToggle.addEventListener('click', () => {
    variablesDrawer.classList.toggle('collapsed');
  });

  // --- SIDEBAR SCHEMA TREE RENDERER ---
  const buildSchemaTree = () => {
    schemaTreeView.innerHTML = '';
    const preset = schemas[activePreset];
    if (!preset || !preset.types) return;

    Object.keys(preset.types).forEach(typeName => {
      const typeData = preset.types[typeName];
      const typeNode = document.createElement('div');
      typeNode.className = 'doc-node';
      typeNode.setAttribute('data-name', typeName.toLowerCase());

      const header = document.createElement('div');
      header.className = 'doc-node-header';
      header.innerHTML = `
        <i class="fa-solid fa-chevron-down doc-node-expand-btn"></i>
        <span class="doc-node-name">${typeName}</span>
        <span class="doc-node-type">(${typeName === 'Query' || typeName === 'Mutation' ? 'root operational' : 'object type'})</span>
      `;

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'doc-node-children';

      // Renders descriptions
      if (typeData.description) {
        const descNode = document.createElement('div');
        descNode.className = 'doc-node-desc';
        descNode.textContent = `// ${typeData.description}`;
        childrenContainer.appendChild(descNode);
      }

      // Renders child fields
      Object.keys(typeData.fields).forEach(fieldName => {
        const field = typeData.fields[fieldName];
        const fieldNode = document.createElement('div');
        fieldNode.className = 'doc-node';
        fieldNode.setAttribute('data-name', fieldName.toLowerCase());

        let argsText = '';
        if (field.args) {
          const argKeys = Object.keys(field.args);
          argsText = `(${argKeys.map(k => `${k}: ${field.args[k].type}`).join(', ')})`;
        }

        const isScalar = ['String', 'Int', 'Float', 'Boolean', 'ID'].includes(field.type.replace(/[![\]]/g, ''));
        const typeClass = isScalar ? 'doc-node-scalar' : 'doc-node-type';

        fieldNode.innerHTML = `
          <div class="doc-node-header" style="padding-left: 14px;">
            <span class="doc-node-name doc-node-field">${fieldName}</span>
            ${argsText ? `<span class="doc-node-args">${argsText}</span>` : ''}
            : <span class="${typeClass}">${field.type}</span>
          </div>
          ${field.description ? `<div class="doc-node-desc" style="padding-left: 14px;">// ${field.description}</div>` : ''}
        `;

        childrenContainer.appendChild(fieldNode);
      });

      // Collapse tree nodes listener
      header.querySelector('.doc-node-expand-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        btn.classList.toggle('collapsed');
        childrenContainer.classList.toggle('collapsed');
      });

      typeNode.appendChild(header);
      typeNode.appendChild(childrenContainer);
      schemaTreeView.appendChild(typeNode);
    });
  };

  // Schema Search Filter
  schemaSearch.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    const nodes = schemaTreeView.querySelectorAll('.doc-node');

    nodes.forEach(node => {
      const name = node.getAttribute('data-name');
      if (name.includes(val)) {
        node.classList.remove('hidden');
      } else {
        node.classList.add('hidden');
      }
    });
  });

  // --- AUTOCOMPLETE SUGGESTIONS INSERT TOOLBAR ---
  autocompleteTools.forEach(btn => {
    btn.addEventListener('click', () => {
      const insertType = btn.getAttribute('data-insert');
      let text = '';
      const start = queryTextarea.selectionStart;
      const end = queryTextarea.selectionEnd;
      const originalValue = queryTextarea.value;

      if (insertType === 'query') {
        text = `query MyQuery {\n  \n}`;
      } else if (insertType === 'mutation') {
        text = `mutation MyMutation {\n  \n}`;
      } else if (insertType === 'variables') {
        // Expand variables drawer and focus
        variablesDrawer.classList.remove('collapsed');
        variablesTextarea.focus();
        return;
      } else if (insertType === 'brackets') {
        text = `{\n  \n}`;
      }

      queryTextarea.value = originalValue.slice(0, start) + text + originalValue.slice(end);
      queryTextarea.selectionStart = queryTextarea.selectionEnd = start + text.indexOf('\n') + 3;
      queryTextarea.focus();
      updateCodeSnippet();
    });
  });

  queryTextarea.addEventListener('input', updateCodeSnippet);
  variablesTextarea.addEventListener('input', updateCodeSnippet);

  // --- QUERY FORMATTER (BEAUTIFY) ---
  formatQueryBtn.addEventListener('click', () => {
    const raw = queryTextarea.value.trim();
    if (!raw) return;

    try {
      // Basic formatting lexer (braces clean structure builder)
      let formatted = '';
      let indentLevel = 0;
      const tokens = raw.replace(/\s+/g, ' ').split(/(?=[{}])|(?<=[{}])/g);

      tokens.forEach(token => {
        const trimmed = token.trim();
        if (!trimmed) return;

        if (trimmed === '}') {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        const spaces = '  '.repeat(indentLevel);
        formatted += spaces + trimmed + '\n';

        if (trimmed === '{') {
          indentLevel++;
        }
      });

      queryTextarea.value = formatted.trim();
      updateCodeSnippet();
    } catch (err) {
      console.warn("GraphQL formatter failed: ", err);
    }
  });

  // --- SNIPPETS GENERATOR ---
  const updateCodeSnippet = () => {
    const url = endpointUrlInput.value.trim();
    const queryStr = queryTextarea.value.trim();
    let varStr = variablesTextarea.value.trim() || '{}';

    let varObj = {};
    try {
      varObj = JSON.parse(varStr);
    } catch (err) {
      // invalid JSON, ignore
    }

    const requestBody = {
      query: queryStr,
      variables: varObj
    };

    let output = '';

    if (activeSnippetLang === 'curl') {
      const escapedBody = JSON.stringify(requestBody).replace(/"/g, '\\"');
      output = `curl -X POST "${url}" \\\n`;
      output += `  -H "Content-Type: application/json" \\\n`;
      output += `  -d "${escapedBody}"`;
    } else if (activeSnippetLang === 'fetch') {
      output = `fetch('${url}', {\n`;
      output += `  method: 'POST',\n`;
      output += `  headers: { 'Content-Type': 'application/json' },\n`;
      output += `  body: JSON.stringify({\n`;
      output += `    query: \`${queryStr.replace(/`/g, '\\`').replace(/\n/g, '\n    ')}\`,\n`;
      output += `    variables: ${JSON.stringify(varObj, null, 6).replace(/\n/g, '\n    ')}\n`;
      output += `  })\n`;
      output += `})`;
    } else if (activeSnippetLang === 'python') {
      output = `import requests\n\n`;
      output += `url = "${url}"\n`;
      output += `payload = {\n`;
      output += `    "query": """${queryStr.replace(/"""/g, '\\"\\"\\""')}""",\n`;
      output += `    "variables": ${JSON.stringify(varObj, null, 4).replace(/\n/g, '\n    ')}\n`;
      output += `}\n\n`;
      output += `response = requests.post(url, json=payload)\n`;
      output += `print(response.json())`;
    }

    snippetCodePre.textContent = output;
  };

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
    navigator.clipboard.writeText(snippetCodePre.textContent).then(() => {
      const icon = copySnippetBtn.querySelector('i');
      icon.className = 'fa-solid fa-check';
      setTimeout(() => {
        icon.className = 'fa-regular fa-copy';
      }, 1500);
    });
  });

  // --- MOCK RESOLVER SOLVER ENGINE ---
  const parseQueryToObj = (queryString) => {
    // Basic lexer regex tokenizer
    const clean = queryString.replace(/#.*$/gm, '').replace(/\s+/g, ' ');
    const tokens = clean.match(/[\w!:[\]]+|[{}(),]/g) || [];
    let index = 0;

    function parseFields() {
      const fields = {};
      while (index < tokens.length) {
        const token = tokens[index];
        if (token === '}') {
          index++;
          break;
        } else if (token === '{') {
          index++;
          Object.assign(fields, parseFields());
        } else if (token === '(') {
          index++;
          while (index < tokens.length && tokens[index] !== ')') {
            index++;
          }
          index++; // skip )
        } else if (tokens[index + 1] === '{') {
          const name = token;
          index += 2;
          fields[name] = parseFields();
        } else if (tokens[index + 1] === '(') {
          const name = token;
          index += 2; // skip name and (
          const args = {};
          while (index < tokens.length && tokens[index] !== ')') {
            const argName = tokens[index];
            if (tokens[index + 1] === ':') {
              let argVal = tokens[index + 2];
              args[argName] = argVal;
              index += 3;
            } else {
              index++;
            }
          }
          index++; // skip )
          if (tokens[index] === '{') {
            index++;
            fields[name] = { _args: args, _fields: parseFields() };
          } else {
            fields[name] = { _args: args };
          }
        } else {
          fields[token] = true;
          index++;
        }
      }
      return fields;
    }

    let opType = 'query';
    let opName = '';

    if (tokens[0] === 'query' || tokens[0] === 'mutation') {
      opType = tokens[0];
      opName = tokens[1] !== '{' ? tokens[1] : '';
      while (index < tokens.length && tokens[index] !== '{') {
        index++;
      }
    }

    if (tokens[index] === '{') {
      index++;
    }

    return {
      type: opType,
      name: opName,
      fields: parseFields()
    };
  };

  // Resolves the parsed query fields against mock databases
  const resolveMockGraphQL = (parsed, variables) => {
    const db = schemas[activePreset].database;
    const resultData = {};

    const resolveFieldNode = (fieldName, fieldNode, dbContext) => {
      // Extract arguments if structured
      const args = fieldNode._args || {};
      const childFields = fieldNode._fields || fieldNode;

      // Variables lookup binding
      const getArgVal = (val) => {
        if (typeof val === 'string' && val.startsWith('$')) {
          const varName = val.slice(1);
          return variables[varName] !== undefined ? variables[varName] : val;
        }
        // strip double quotes if present
        if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
          return val.slice(1, -1);
        }
        return val;
      };

      // 1. Resolve Queries depending on preset
      if (activePreset === 'users') {
        if (fieldName === 'users') {
          let usersList = [...db.users];
          if (args.limit) {
            const limit = parseInt(getArgVal(args.limit));
            if (!isNaN(limit)) usersList = usersList.slice(0, limit);
          }
          
          return usersList.map(u => mapObjectFields(u, childFields, 'User'));
        }
        if (fieldName === 'user') {
          const targetId = String(getArgVal(args.id));
          const match = db.users.find(u => u.id === targetId);
          return match ? mapObjectFields(match, childFields, 'User') : null;
        }
      } else if (activePreset === 'blog') {
        if (fieldName === 'posts') {
          return db.posts.map(p => mapObjectFields(p, childFields, 'Post'));
        }
        if (fieldName === 'post') {
          const targetId = String(getArgVal(args.id));
          const match = db.posts.find(p => p.id === targetId);
          return match ? mapObjectFields(match, childFields, 'Post') : null;
        }
      } else if (activePreset === 'spacex') {
        if (fieldName === 'launches') {
          return db.launches.map(l => mapObjectFields(l, childFields, 'Launch'));
        }
        if (fieldName === 'launch') {
          const targetId = String(getArgVal(args.id));
          const match = db.launches.find(l => l.id === targetId);
          return match ? mapObjectFields(match, childFields, 'Launch') : null;
        }
      }

      // 2. Resolve Mutations
      if (parsed.type === 'mutation') {
        if (fieldName === 'createUser') {
          const name = getArgVal(args.name);
          const email = getArgVal(args.email);
          const companyId = getArgVal(args.companyId) || "1";

          const newId = String(db.users.length + 1);
          const newUser = { id: newId, name, email, age: 24, companyId };
          
          // Commit to memory database
          db.users.push(newUser);
          
          return mapObjectFields(newUser, childFields, 'User');
        }
        if (fieldName === 'createPost') {
          const title = getArgVal(args.title);
          const content = getArgVal(args.content);
          const authorId = getArgVal(args.authorId) || "1";

          const newId = String(db.posts.length + 1);
          const newPost = { id: newId, title, content, authorId, comments: [] };
          
          db.posts.push(newPost);
          
          return mapObjectFields(newPost, childFields, 'Post');
        }
      }

      return null;
    };

    const mapObjectFields = (sourceObj, fieldsMap, typeName) => {
      const output = {};
      const db = schemas[activePreset].database;

      Object.keys(fieldsMap).forEach(key => {
        // Skip argument keywords helper
        if (key === '_args' || key === '_fields') return;

        // Resolve relationships
        if (typeName === 'User' && key === 'company') {
          const compMatch = db.companies.find(c => c.id === sourceObj.companyId);
          if (compMatch) {
            output.company = mapObjectFields(compMatch, fieldsMap[key]._fields || fieldsMap[key], 'Company');
          } else {
            output.company = null;
          }
        } else if (typeName === 'Post' && key === 'author') {
          const authMatch = db.authors.find(a => a.id === sourceObj.authorId);
          if (authMatch) {
            output.author = mapObjectFields(authMatch, fieldsMap[key]._fields || fieldsMap[key], 'Author');
          } else {
            output.author = null;
          }
        } else if (typeName === 'Post' && key === 'comments') {
          output.comments = (sourceObj.comments || []).map(c => mapObjectFields(c, fieldsMap[key]._fields || fieldsMap[key], 'Comment'));
        } else if (typeName === 'Launch' && key === 'rocket') {
          const rktMatch = db.rockets.find(r => r.rocket_id === sourceObj.rocketId);
          if (rktMatch) {
            output.rocket = mapObjectFields(rktMatch, fieldsMap[key]._fields || fieldsMap[key], 'Rocket');
          } else {
            output.rocket = null;
          }
        } else {
          // Direct field mapping
          if (sourceObj[key] !== undefined) {
            output[key] = sourceObj[key];
          } else {
            output[key] = null;
          }
        }
      });

      return output;
    };

    // Evaluate root fields
    Object.keys(parsed.fields).forEach(rootField => {
      resultData[rootField] = resolveFieldNode(rootField, parsed.fields[rootField], db);
    });

    return { data: resultData };
  };

  // --- QUERY HISTORY STORAGE ---
  const loadHistoryCache = () => {
    const cache = localStorage.getItem('graphexplorer_history');
    if (cache) {
      queryHistory = JSON.parse(cache);
    } else {
      queryHistory = [
        {
          preset: 'users',
          query: `query GetUsersList {\n  users(limit: 2) {\n    id\n    name\n    company {\n      name\n    }\n  }\n}`,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      saveHistoryCache();
    }
  };

  const saveHistoryCache = () => {
    localStorage.setItem('graphexplorer_history', JSON.stringify(queryHistory));
  };

  const addQueryToHistory = (queryStr) => {
    // Avoid duplicates inside immediate queue
    if (queryHistory.length > 0 && queryHistory[0].query === queryStr) return;

    queryHistory.unshift({
      preset: activePreset,
      query: queryStr,
      timestamp: new Date().toISOString()
    });

    // cap history
    if (queryHistory.length > 20) queryHistory.pop();
    saveHistoryCache();
  };

  const renderHistoryList = () => {
    historyItemsList.innerHTML = '';
    if (queryHistory.length === 0) {
      historyItemsList.innerHTML = '<div class="console-info-message">No execution history found.</div>';
      return;
    }

    queryHistory.forEach(item => {
      const card = document.createElement('div');
      card.className = 'history-item';
      
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      card.innerHTML = `
        <div class="history-item-top">
          <span class="history-item-method">${item.preset.toUpperCase()}</span>
          <span class="history-item-time">${timeStr}</span>
        </div>
        <div class="history-item-query">${item.query.replace(/\n/g, ' ')}</div>
      `;

      card.addEventListener('click', () => {
        schemaPresetSelect.value = item.preset;
        activePreset = item.preset;
        queryTextarea.value = item.query;
        buildSchemaTree();
        updateCodeSnippet();
        
        // Tab back to docs
        tabDocs.click();
      });

      historyItemsList.appendChild(card);
    });
  };

  clearHistoryBtn.addEventListener('click', () => {
    queryHistory = [];
    saveHistoryCache();
    renderHistoryList();
  });

  // --- QUERY RUN TRIGGER (EXECUTE) ---
  runQueryBtn.addEventListener('click', () => {
    const queryStr = queryTextarea.value.trim();
    if (!queryStr) return;

    // Reset console states
    resultJsonPre.textContent = '';
    resultMetaTags.classList.add('hidden');
    resultSpinner.classList.remove('hidden');
    statusIndicator.className = 'status-led led-running';

    const url = endpointUrlInput.value.trim();
    const isMock = url.includes('api.graphexplorer.mock');
    const startTime = performance.now();

    // Cache to history logs list
    addQueryToHistory(queryStr);

    if (isMock) {
      // 1. Local Resolver execution sandbox
      setTimeout(() => {
        resultSpinner.classList.add('hidden');
        resultMetaTags.classList.remove('hidden');
        responseDuration.textContent = `${Math.floor(Math.random() * 10) + 2} ms`;

        try {
          let vars = {};
          const varRaw = variablesTextarea.value.trim();
          if (varRaw) {
            vars = JSON.parse(varRaw);
          }

          const parsed = parseQueryToObj(queryStr);
          const resolved = resolveMockGraphQL(parsed, vars);

          resultJsonPre.textContent = JSON.stringify(resolved, null, 2);
          statusIndicator.className = 'status-led led-success';
        } catch (err) {
          resultJsonPre.textContent = JSON.stringify({
            errors: [
              {
                message: err.message || "Failed to resolve mock query fields syntax.",
                locations: [],
                path: []
              }
            ]
          }, null, 2);
          statusIndicator.className = 'status-led led-error';
        }
      }, 350);
    } else {
      // 2. Real HTTP fetch execution sandbox
      let vars = {};
      try {
        const varRaw = variablesTextarea.value.trim();
        if (varRaw) {
          vars = JSON.parse(varRaw);
        }
      } catch (err) {
        resultSpinner.classList.add('hidden');
        alert("Query variables is not valid JSON.");
        statusIndicator.className = 'status-led led-idle';
        return;
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: queryStr,
          variables: vars
        })
      })
      .then(resp => {
        const duration = Math.round(performance.now() - startTime);
        resultSpinner.classList.add('hidden');
        resultMetaTags.classList.remove('hidden');
        responseDuration.textContent = `${duration} ms`;

        const isOk = resp.status >= 200 && resp.status < 300;
        statusIndicator.className = `status-led ${isOk ? 'led-success' : 'led-error'}`;

        return resp.text().then(text => {
          try {
            const obj = JSON.parse(text);
            resultJsonPre.textContent = JSON.stringify(obj, null, 2);
          } catch (err) {
            resultJsonPre.textContent = text || 'Empty response';
          }
        });
      })
      .catch(err => {
        resultSpinner.classList.add('hidden');
        resultMetaTags.classList.remove('hidden');
        responseDuration.textContent = '0 ms';
        statusIndicator.className = 'status-led led-error';

        resultJsonPre.textContent = JSON.stringify({
          errors: [
            {
              message: "Network Error: Failed to execute HTTP POST query request.",
              cause: err.message,
              suggestion: "This SpaceX/user endpoint might be offline or blocked by browser CORS locks. Try using default mock playground endpoint for offline execution."
            }
          ]
        }, null, 2);
      });
    }
  });

  // Short cut bindings: Ctrl + Enter
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      runQueryBtn.click();
    }
  });

  // Run init
  init();
});
