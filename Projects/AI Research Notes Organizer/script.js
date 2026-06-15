/**
 * ResearchAI - AI Research Notes Organizer
 * Core Frontend Javascript Logic
 */

// 1. NOTES SEED DATA
const SEED_FOLDERS = [
  "Computer Science",
  "Biotechnology",
  "Economics",
  "History"
];

const SEED_NOTES = [
  {
    id: "note_1",
    title: "Transformer Architectures & Attention Mechanisms",
    content: "The core of modern LLMs is the Transformer model, relying on Self-Attention formulas to compute similarity between input tokens. Unlike sequential RNN cells, transformers process inputs in parallel, scaling token lengths significantly. Standard multi-head attention computes Query, Key, and Value matrices to map relative importances of words regardless of distance.",
    folder: "Computer Science",
    sourceTitle: "Attention Is All You Need (Vaswani et al.)",
    sourceUrl: "https://arxiv.org/abs/1706.03762",
    tags: ["transformer", "attention", "tokens", "scaling"],
    aiSummary: "Explores Transformer architectures and how parallel attention formulas map relative word importances, scaling past RNN cell bounds.",
    created: new Date(Date.now() - 3600000 * 24).toLocaleString()
  },
  {
    id: "note_2",
    title: "CRISPR-Cas9 Gene Editing Targets",
    content: "CRISPR gene modifications rely on guide RNA (gRNA) arrays matching target genome bases. The Cas9 endonuclease protein binds to gRNA, scans DNA for protospacer adjacent motifs (PAM), and cuts the double helix strand. Homology-directed repair (HDR) templates can then introduce custom sequences at the cut site.",
    folder: "Biotechnology",
    sourceTitle: "Broad Institute Genome Editing guides",
    sourceUrl: "https://www.broadinstitute.org/crispr",
    tags: ["crispr", "cas9", "genome", "dna"],
    aiSummary: "Details double-strand cutting mechanics using guide RNA and Cas9 endonuclease complexes to edit targeting base sequences.",
    created: new Date(Date.now() - 3600000 * 12).toLocaleString()
  },
  {
    id: "note_3",
    title: "Inflation Pressures and Supply Constraints",
    content: "Macroeconomic models suggest inflation rises when aggregates demand outpaces aggregates supply. Pandemic-era supply bottlenecks and energy supply shocks shifted supply curves leftward, resulting in cost-push price jumps. Central bank monetary policies counter this by raising base interest rates to cool down aggregate demand levels.",
    folder: "Economics",
    sourceTitle: "Federal Reserve Economic Research Reports",
    sourceUrl: "https://www.federalreserve.gov/econres.htm",
    tags: ["inflation", "supply", "macroeconomics", "rates"],
    aiSummary: "Analyzes cost-push inflation resulting from supply shocks and bottleneck curves, and central bank interest rate interventions.",
    created: new Date().toLocaleString()
  }
];

// Academic dictionary words for heuristic keyword extraction
const RESEARCH_DICTIONARY = [
  "transformer", "attention", "tokens", "scaling", "rnn", "neural", "network",
  "crispr", "cas9", "genome", "dna", "rna", "endonuclease", "biology", "gene",
  "inflation", "supply", "demand", "macroeconomics", "monetary", "interest", "bank",
  "algorithm", "reasoning", "model", "quantum", "optimization", "history", "carbon",
  "database", "systems", "security", "framework", "analysis", "empirical", "theory"
];

// 2. STATE LOGS & LOCAL MEMORY
let folders = [];
let notes = [];
let activeFolder = "All"; // "All" or folder name
let searchQuery = "";
let activeNoteId = null;

// 3. DOM ELEMENT CACHE
const txtSearchEl = document.getElementById("txt-search");
const foldersListEl = document.getElementById("folders-list");
const txtNewFolderEl = document.getElementById("txt-new-folder");
const btnAddFolderEl = document.getElementById("btn-add-folder");
const btnResetWorkspaceEl = document.getElementById("btn-reset-workspace");

const lblActiveFolderTitleEl = document.getElementById("lbl-active-folder-title");
const notesCountEl = document.getElementById("notes-count");
const btnNewNoteEl = document.getElementById("btn-new-note");
const notesListEl = document.getElementById("notes-list");

const editorEmptyEl = document.getElementById("editor-empty");
const editorActiveEl = document.getElementById("editor-active");

const noteTitleEl = document.getElementById("note-title");
const noteFolderSelectEl = document.getElementById("note-folder-select");
const noteSourceTitleEl = document.getElementById("note-source-title");
const noteSourceUrlEl = document.getElementById("note-source-url");
const noteBodyEl = document.getElementById("note-body");

const btnDeleteNoteEl = document.getElementById("btn-delete-note");
const btnAnalyzeNoteEl = document.getElementById("btn-analyze-note");
const btnSaveNoteEl = document.getElementById("btn-save-note");

const aiStatusTextEl = document.getElementById("ai-status-text");
const aiSummaryEl = document.getElementById("ai-summary");
const aiTagsEl = document.getElementById("ai-tags");
const aiRelatedNotesEl = document.getElementById("ai-related-notes");

const lblStatTotalEl = document.getElementById("lbl-stat-total");
const lblStatSourcesEl = document.getElementById("lbl-stat-sources");

// 4. MAIN INTIALIZER
window.addEventListener("DOMContentLoaded", () => {
  loadWorkspaceData();
  setupEventListeners();
  renderFoldersUI();
  populateFolderDropdown();
  renderNotesList();
  updateStatsUI();
});

// 5. LOCAL STORAGE SYNCS
function loadWorkspaceData() {
  const storedFolders = localStorage.getItem("research_folders");
  if (storedFolders) {
    try { folders = JSON.parse(storedFolders); } catch (e) { folders = [...SEED_FOLDERS]; }
  } else {
    folders = [...SEED_FOLDERS];
  }

  const storedNotes = localStorage.getItem("research_notes");
  if (storedNotes) {
    try { notes = JSON.parse(storedNotes); } catch (e) { notes = [...SEED_NOTES]; }
  } else {
    notes = [...SEED_NOTES];
  }

  saveWorkspaceData();
}

function saveWorkspaceData() {
  localStorage.setItem("research_folders", JSON.stringify(folders));
  localStorage.setItem("research_notes", JSON.stringify(notes));
}

function updateStatsUI() {
  lblStatTotalEl.textContent = notes.length;
  
  const sourcesCount = notes.filter(n => n.sourceTitle.trim() !== "" || n.sourceUrl.trim() !== "").length;
  lblStatSourcesEl.textContent = sourcesCount;
}

// 6. DIRECTORY & FOLDERS RENDERING
function renderFoldersUI() {
  foldersListEl.innerHTML = "";

  // Insert "All Notes" item
  const allEl = document.createElement("div");
  allEl.className = `folder-item ${activeFolder === 'All' ? 'active' : ''}`;
  allEl.innerHTML = `
    <div class="folder-item-meta">
      <i class="fa-solid fa-folder-open"></i>
      <span>All Notebooks</span>
    </div>
    <span class="folder-count">${notes.length}</span>
  `;
  allEl.addEventListener("click", () => {
    activeFolder = "All";
    searchQuery = "";
    txtSearchEl.value = "";
    renderFoldersUI();
    renderNotesList();
  });
  foldersListEl.appendChild(allEl);

  // Render specific folders
  folders.forEach(f => {
    const fNotes = notes.filter(n => n.folder === f);
    const item = document.createElement("div");
    item.className = `folder-item ${activeFolder === f ? 'active' : ''}`;
    item.innerHTML = `
      <div class="folder-item-meta">
        <i class="fa-solid fa-folder"></i>
        <span>${f}</span>
      </div>
      <span class="folder-count">${fNotes.length}</span>
    `;

    item.addEventListener("click", () => {
      activeFolder = f;
      searchQuery = "";
      txtSearchEl.value = "";
      renderFoldersUI();
      renderNotesList();
    });
    foldersListEl.appendChild(item);
  });
}

function populateFolderDropdown() {
  noteFolderSelectEl.innerHTML = "";
  folders.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    noteFolderSelectEl.appendChild(opt);
  });
}

// 7. NOTES FEED RENDERER
function renderNotesList() {
  notesListEl.innerHTML = "";

  // Filter notes by active folder and search query
  let filtered = [...notes];
  if (activeFolder !== "All") {
    filtered = filtered.filter(n => n.folder === activeFolder);
  }

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query) ||
      n.tags.some(t => t.toLowerCase().includes(query)) ||
      n.folder.toLowerCase().includes(query)
    );
  }

  // Update counts
  lblActiveFolderTitleEl.textContent = activeFolder === "All" ? "All Notebooks" : activeFolder;
  notesCountEl.textContent = `${filtered.length} Note${filtered.length === 1 ? '' : 's'}`;

  if (filtered.length === 0) {
    notesListEl.innerHTML = `
      <div class="welcome-placeholder">
        <i class="fa-solid fa-book-open placeholder-icon"></i>
        <h3>Empty Notebook</h3>
        <p>No research note matches your active notebook directory or search criteria.</p>
      </div>
    `;
    return;
  }

  // Sort notes: newest first
  filtered.sort((a, b) => new Date(b.created) - new Date(a.created));

  filtered.forEach(n => {
    const isSelected = activeNoteId === n.id;
    const card = document.createElement("div");
    card.className = `note-card ${isSelected ? 'active' : ''}`;
    
    // Preview description snippet
    let previewText = n.content.substring(0, 110);
    if (n.content.length > 110) previewText += "...";

    // Source indicators
    let sourceBadgeHTML = "";
    if (n.sourceUrl.trim() !== "") {
      sourceBadgeHTML = `<span class="note-source-indicator"><i class="fa-solid fa-link"></i> Ref</span>`;
    }

    card.innerHTML = `
      <div class="note-card-header">
        <h4>${n.title || 'Untitled Note'}</h4>
        <span class="note-folder-tag">${n.folder}</span>
      </div>
      <p class="note-card-desc">${previewText || 'No contents written...'}</p>
      <div class="note-card-footer">
        <span class="note-date">${n.created}</span>
        ${sourceBadgeHTML}
      </div>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".note-card").forEach(el => el.classList.remove("active"));
      card.classList.add("active");
      loadActiveNote(n.id);
    });

    notesListEl.appendChild(card);
  });
}

// 8. EDITOR STATE LOADERS
function loadActiveNote(noteId) {
  activeNoteId = noteId;
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  editorEmptyEl.classList.add("hidden");
  editorActiveEl.classList.remove("hidden");

  // Populate form fields
  noteTitleEl.value = note.title;
  noteFolderSelectEl.value = note.folder;
  noteSourceTitleEl.value = note.sourceTitle;
  noteSourceUrlEl.value = note.sourceUrl;
  noteBodyEl.value = note.content;

  // Populate AI Drawer Panel
  renderAIResults(note);
}

function renderAIResults(note) {
  // Reset AI states values
  aiStatusTextEl.textContent = "Status: Idle";
  
  if (note.aiSummary) {
    aiSummaryEl.innerHTML = note.aiSummary;
  } else {
    aiSummaryEl.innerHTML = "Write some research details and click 'AI Organize' to produce an automated text summary outline.";
  }

  // Keywords
  aiTagsEl.innerHTML = "";
  if (note.tags && note.tags.length > 0) {
    note.tags.forEach(t => {
      const lbl = document.createElement("span");
      lbl.className = "ai-tag-lbl";
      lbl.textContent = `#${t}`;
      aiTagsEl.appendChild(lbl);
    });
  } else {
    aiTagsEl.innerHTML = `<span class="no-tags-lbl">No keywords generated</span>`;
  }

  // Related notes finder
  findRelatedNotes(note);
}

// 9. CLIENT-SIDE HEURISTICS AI CALCULATORS
function performNoteAIHeuristics() {
  const title = noteTitleEl.value.trim();
  const body = noteBodyEl.value.trim();
  
  if (!body) {
    alert("Please write some notes content before triggering the AI Organize model.");
    return;
  }

  aiStatusTextEl.textContent = "Status: Analyzing...";
  aiStatusTextEl.style.color = "var(--clr-warning)";

  setTimeout(() => {
    // A. Generate Summary Heuristic
    // Clean text, split by sentences (using dot separators)
    const sentences = body.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
    let summary = "";
    
    if (sentences.length === 0) {
      summary = "Notes contents are too brief to summarize accurately.";
    } else {
      // Capture the first 2 sentences
      const limit = Math.min(sentences.length, 2);
      summary = sentences.slice(0, limit).join(". ") + ".";
    }

    // B. Keyword Extraction Heuristic
    let suggestedTags = [];
    const textLower = (title + " " + body).toLowerCase();
    
    RESEARCH_DICTIONARY.forEach(word => {
      const reg = new RegExp(`\\b${word}\\b`, "i");
      if (reg.test(textLower) && !suggestedTags.includes(word)) {
        suggestedTags.push(word);
      }
    });

    // Fallback: If no dictionary keyword matches, extract words > 5 letters
    if (suggestedTags.length === 0) {
      const words = textLower.split(/[^a-zA-Z]/).filter(w => w.length > 5);
      const frequencies = {};
      words.forEach(w => {
        frequencies[w] = (frequencies[w] || 0) + 1;
      });
      const sorted = Object.keys(frequencies).sort((a, b) => frequencies[b] - frequencies[a]);
      suggestedTags = sorted.slice(0, 3);
    } else {
      suggestedTags = suggestedTags.slice(0, 4); // limit to 4
    }

    // C. Update active note object
    const note = notes.find(n => n.id === activeNoteId);
    if (note) {
      note.aiSummary = summary;
      note.tags = suggestedTags;
      
      saveWorkspaceData();
      renderNotesList();
      renderAIResults(note);
      updateStatsUI();
    }

    aiStatusTextEl.textContent = "Status: Synced";
    aiStatusTextEl.style.color = "var(--clr-success)";
  }, 400);
}

function findRelatedNotes(currentNote) {
  aiRelatedNotesEl.innerHTML = "";
  
  // Scoring function based on tags overlaps and folders
  const scored = notes
    .filter(n => n.id !== currentNote.id)
    .map(n => {
      let score = 0;
      if (n.folder === currentNote.folder) score += 2;
      
      // Intersecting tags
      if (n.tags && currentNote.tags) {
        const intersection = n.tags.filter(t => currentNote.tags.includes(t));
        score += intersection.length * 3;
      }

      return { note: n, score: score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // top 3

  if (scored.length === 0) {
    aiRelatedNotesEl.innerHTML = `<span class="no-related-lbl">No related notes found</span>`;
    return;
  }

  scored.forEach(item => {
    const card = document.createElement("div");
    card.className = "related-link-card";
    card.innerHTML = `
      <span><i class="fa-solid fa-file-lines"></i> ${item.note.title}</span>
      <i class="fa-solid fa-chevron-right"></i>
    `;
    card.addEventListener("click", () => {
      loadActiveNote(item.note.id);
      renderNotesList();
    });
    aiRelatedNotesEl.appendChild(card);
  });
}

// 9. EVENT LISTENERS SETUP
function setupEventListeners() {
  
  // Search Query Input
  txtSearchEl.addEventListener("input", () => {
    searchQuery = txtSearchEl.value;
    renderNotesList();
  });

  // Add Folder Notebook category
  btnAddFolderEl.addEventListener("click", () => {
    const folderName = txtNewFolderEl.value.trim();
    if (!folderName) return;

    if (folders.includes(folderName)) {
      alert("A notebook folder with this name already exists.");
      return;
    }

    folders.push(folderName);
    txtNewFolderEl.value = "";
    
    saveWorkspaceData();
    renderFoldersUI();
    populateFolderDropdown();
  });

  txtNewFolderEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnAddFolderEl.click();
    }
  });

  // Create Note
  btnNewNoteEl.addEventListener("click", () => {
    const newId = "note_" + Date.now();
    const defaultFolder = activeFolder === "All" ? folders[0] : activeFolder;
    
    const newNote = {
      id: newId,
      title: "Untitled Research Note",
      content: "",
      folder: defaultFolder,
      sourceTitle: "",
      sourceUrl: "",
      tags: [],
      aiSummary: "",
      created: new Date().toLocaleString()
    };

    notes.push(newNote);
    activeNoteId = newId;

    saveWorkspaceData();
    renderFoldersUI();
    renderNotesList();
    loadActiveNote(newId);
    updateStatsUI();
  });

  // Save Note Details
  btnSaveNoteEl.addEventListener("click", () => {
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;

    note.title = noteTitleEl.value.trim() || "Untitled Research Note";
    note.folder = noteFolderSelectEl.value;
    note.sourceTitle = noteSourceTitleEl.value.trim();
    note.sourceUrl = noteSourceUrlEl.value.trim();
    note.content = noteBodyEl.value;
    note.created = new Date().toLocaleString();

    saveWorkspaceData();
    renderFoldersUI();
    renderNotesList();
    loadActiveNote(activeNoteId);
    updateStatsUI();

    // Trigger feedback outline saved
    btnSaveNoteEl.innerHTML = `<i class="fa-solid fa-check"></i> Saved`;
    btnSaveNoteEl.style.background = "var(--clr-success)";
    
    setTimeout(() => {
      btnSaveNoteEl.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Note`;
      btnSaveNoteEl.style.background = "";
    }, 1200);
  });

  // Delete Note Details
  btnDeleteNoteEl.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this research note? This cannot be undone.")) {
      notes = notes.filter(n => n.id !== activeNoteId);
      activeNoteId = null;

      saveWorkspaceData();
      renderFoldersUI();
      renderNotesList();
      updateStatsUI();

      // Reset editor to placeholder
      editorActiveEl.classList.add("hidden");
      editorEmptyEl.classList.remove("hidden");
    }
  });

  // AI Organize trigger button
  btnAnalyzeNoteEl.addEventListener("click", performNoteAIHeuristics);

  // Clear workspace history logs
  btnResetWorkspaceEl.addEventListener("click", () => {
    if (confirm("Delete all research notes and custom notebook folders? This resets back to default seeds.")) {
      localStorage.clear();
      
      folders = [...SEED_FOLDERS];
      notes = [...SEED_NOTES];
      activeFolder = "All";
      searchQuery = "";
      activeNoteId = null;
      txtSearchEl.value = "";

      saveWorkspaceData();
      renderFoldersUI();
      populateFolderDropdown();
      renderNotesList();
      updateStatsUI();

      editorActiveEl.classList.add("hidden");
      editorEmptyEl.classList.remove("hidden");
    }
  });
}
