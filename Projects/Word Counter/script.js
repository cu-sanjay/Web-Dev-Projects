(function() {
  const textarea = document.getElementById('textInput');
  const wordSpan = document.getElementById('wordCount');
  const charSpan = document.getElementById('charCount');
  const charNoSpaceSpan = document.getElementById('charNoSpaceCount');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Helper: update all counters based on textarea value
  function updateCounters() {
    let rawText = textarea.value;
    
    // 1. Character count (including spaces, line breaks count as 1 char each)
    const totalChars = rawText.length;
    
    // 2. Character count without spaces (remove spaces, tabs, newlines)
    const noSpaceChars = rawText.replace(/\s/g, '').length;
    
    // 3. Word count: split by whitespace, filter out empty strings
    let words = 0;
    if (rawText.trim() === '') {
      words = 0;
    } else {
      words = rawText.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    
    // Update DOM
    wordSpan.textContent = words;
    charSpan.textContent = totalChars;
    charNoSpaceSpan.textContent = noSpaceChars;
  }

  // Clear entire textarea and reset counters
  function clearText() {
    textarea.value = '';
    updateCounters();
    textarea.focus();
  }

  // Copy current textarea content to clipboard
  async function copyText() {
    const textToCopy = textarea.value;
    if (!textToCopy) {
      // subtle feedback
      copyBtn.style.backgroundColor = "#ffe6e6";
      setTimeout(() => {
        copyBtn.style.backgroundColor = "";
      }, 300);
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      // temporary visual feedback
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = "✓ Copied!";
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1500);
    } catch (err) {
      console.warn('Clipboard failed', err);
      alert('Unable to copy. Manually select text.');
    }
  }

  // Event listeners
  if (textarea) {
    textarea.addEventListener('input', updateCounters);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', clearText);
  }
  if (copyBtn) {
    copyBtn.addEventListener('click', copyText);
  }

  // initial load: update counters (in case pre-filled or empty)
  updateCounters();
})();