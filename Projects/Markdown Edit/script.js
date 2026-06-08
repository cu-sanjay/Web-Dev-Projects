(function () {
  var STORAGE_KEY = 'markdown_edit_draft';

  var input = document.getElementById('input');
  var preview = document.getElementById('preview');
  var wordCount = document.getElementById('wordCount');
  var lineCount = document.getElementById('lineCount');
  var toolbarBtns = document.querySelectorAll('.tb-btn[data-action]');

  /* ---- XSS Sanitize ---- */
  function sanitize(raw) {
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---- Markdown Parser ---- */
  function parseInline(md) {
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    md = md.replace(/\*(.+?)\*/g, '<em>$1</em>');
    md = md.replace(/`(.+?)`/g, '<code>$1</code>');
    md = md.replace(/\[(.+?)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return md;
  }

  function parse(md) {
    var html = '';
    var lines = md.split('\n');
    var i = 0;

    function processList(start, ordered) {
      var items = [];
      while (i < lines.length) {
        var line = lines[i];
        var trimmed = line.trim();
        var match;

        if (ordered) {
          match = trimmed.match(/^\d+\.\s+(.*)/);
        } else {
          match = trimmed.match(/^[-*+]\s+(.*)/);
        }

        if (!match) break;
        items.push(parseInline(sanitize(match[1])));
        i++;
      }
      if (items.length) {
        var tag = ordered ? 'ol' : 'ul';
        html += '<' + tag + '>';
        for (var j = 0; j < items.length; j++) {
          html += '<li>' + items[j] + '</li>';
        }
        html += '</' + tag + '>\n';
      }
    }

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      /* code block */
      if (/^```/.test(trimmed)) {
        var lang = trimmed.slice(3).trim();
        var code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) {
          code.push(lines[i]);
          i++;
        }
        i++;
        html += '<pre><code class="lang-' + sanitize(lang) + '">' + sanitize(code.join('\n')) + '</code></pre>\n';
        continue;
      }

      /* heading */
      var hMatch = trimmed.match(/^(#{1,4})\s+(.+)/);
      if (hMatch) {
        html += '<h' + hMatch[1].length + '>' + parseInline(sanitize(hMatch[2])) + '</h' + hMatch[1].length + '>\n';
        i++;
        continue;
      }

      /* horizontal rule */
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
        html += '<hr>\n';
        i++;
        continue;
      }

      /* blockquote */
      if (/^>\s?(.*)/.test(trimmed)) {
        var qLines = [];
        while (i < lines.length) {
          var qMatch = lines[i].match(/^>\s?(.*)/);
          if (!qMatch) break;
          qLines.push(qMatch[1]);
          i++;
        }
        html += '<blockquote><p>' + parseInline(sanitize(qLines.join('\n'))) + '</p></blockquote>\n';
        continue;
      }

      /* unordered list */
      if (/^[-*+]\s/.test(trimmed)) {
        processList(i, false);
        continue;
      }

      /* ordered list */
      if (/^\d+\.\s/.test(trimmed)) {
        processList(i, true);
        continue;
      }

      /* paragraph */
      var para = [];
      while (i < lines.length) {
        var t = lines[i].trim();
        if (t === '' || /^(#{1,4}|```|> |[-*+]\s|\d+\.\s)/.test(t)) break;
        para.push(t);
        i++;
      }
      if (para.length) {
        html += '<p>' + parseInline(sanitize(para.join(' '))) + '</p>\n';
        continue;
      }

      /* empty line */
      i++;
    }

    return html;
  }

  /* ---- Render ---- */
  function render() {
    var raw = input.value;
    var html = parse(raw);
    preview.innerHTML = html;
    updateStats(raw);
  }

  function updateStats(raw) {
    var words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    var lines = raw ? raw.split('\n').length : 0;
    wordCount.textContent = words + ' word' + (words !== 1 ? 's' : '');
    lineCount.textContent = lines + ' line' + (lines !== 1 ? 's' : '');
  }

  /* ---- Input / Auto-save ---- */
  input.addEventListener('input', function () {
    render();
    try { localStorage.setItem(STORAGE_KEY, input.value); } catch (e) {}
  });

  /* ---- Toolbar ---- */
  function wrapSelection(before, after) {
    var start = input.selectionStart;
    var end = input.selectionEnd;
    var text = input.value;
    var selected = text.substring(start, end) || '';
    var replacement = before + selected + after;
    input.value = text.substring(0, start) + replacement + text.substring(end);
    input.selectionStart = start + before.length;
    input.selectionEnd = start + replacement.length;
    input.focus();
    input.dispatchEvent(new Event('input'));
  }

  toolbarBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = this.dataset.action;
      switch (action) {
        case 'bold': wrapSelection('**', '**'); break;
        case 'italic': wrapSelection('*', '*'); break;
        case 'link': wrapSelection('[', '](url)'); break;
        case 'code': wrapSelection('```\n', '\n```'); break;
        case 'clear':
          input.value = '';
          input.dispatchEvent(new Event('input'));
          input.focus();
          break;
        case 'export':
          var blob = new Blob([input.value], { type: 'text/markdown' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = 'document.md';
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
    });
  });

  /* ---- Keyboard shortcuts ---- */
  input.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': e.preventDefault(); wrapSelection('**', '**'); break;
        case 'i': e.preventDefault(); wrapSelection('*', '*'); break;
        case 'k': e.preventDefault(); wrapSelection('[', '](url)'); break;
      }
    }
  });

  /* ---- Boot ---- */
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { input.value = saved; }
  } catch (e) {}
  render();
  input.focus();
})();
