document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const regexInput = document.getElementById('regex-input');
    const regexInputContainer = document.querySelector('.regex-input-container');
    const flagsContainer = document.getElementById('flags-container');
    const flagsDropdown = document.getElementById('flags-dropdown');
    const errorMsg = document.getElementById('error-message');
    
    const testInput = document.getElementById('test-input');
    const highlightLayer = document.getElementById('highlight-layer');
    const matchCountDisplay = document.getElementById('match-count');
    
    const flagCheckboxes = {
        g: document.getElementById('flag-g'),
        m: document.getElementById('flag-m'),
        i: document.getElementById('flag-i')
    };

    // State
    let currentFlags = 'gmi';

    // Initialize
    updateHighlights();

    // Event Listeners
    regexInput.addEventListener('input', updateHighlights);
    testInput.addEventListener('input', updateHighlights);
    
    // Sync scrolling between textarea and highlight layer
    testInput.addEventListener('scroll', () => {
        highlightLayer.scrollTop = testInput.scrollTop;
        highlightLayer.scrollLeft = testInput.scrollLeft;
    });

    // Flags Dropdown Toggle
    flagsContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        flagsDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        flagsDropdown.classList.remove('show');
    });

    flagsDropdown.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing when clicking inside
    });

    // Handle flag changes
    Object.values(flagCheckboxes).forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // Rebuild flags string
            currentFlags = '';
            if (flagCheckboxes.g.checked) currentFlags += 'g';
            if (flagCheckboxes.m.checked) currentFlags += 'm';
            if (flagCheckboxes.i.checked) currentFlags += 'i';
            
            flagsContainer.textContent = currentFlags;
            updateHighlights();
        });
    });

    // Core Logic
    function updateHighlights() {
        const pattern = regexInput.value;
        const text = testInput.value;

        // Reset states
        errorMsg.textContent = '';
        regexInputContainer.classList.remove('error');
        
        // If empty pattern, just display text unhighlighted
        if (!pattern) {
            highlightLayer.innerHTML = escapeHTML(text);
            updateMatchCount(0);
            return;
        }

        try {
            // Attempt to compile Regex
            const regex = new RegExp(pattern, currentFlags);
            
            // Generate highlighted HTML
            let matchCount = 0;
            
            // To prevent infinite loops with zero-length matches (like ^ or $)
            // we use a specific replacement strategy instead of a while loop.
            // If the user types ^, it technically matches 0 chars at the beginning.
            // We only want to highlight actual characters consumed.
            
            // We use string.replace with a replacer function
            // Note: If 'g' is not in flags, replace only does it once.
            
            // First we need to handle HTML escaping carefully.
            // If we escape first, our regex tests against escaped characters (e.g. &lt; instead of <)
            // If we regex first, injecting <mark> tags makes it hard to escape later without escaping the <mark> tags too.
            
            // Strategy: 
            // 1. Find all match indices and lengths in the raw string.
            let matches = [];
            
            if (regex.global) {
                let match;
                // prevent infinite loop for zero length matches
                let lastIndex = -1;
                while ((match = regex.exec(text)) !== null) {
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++; // force advance if 0-length match
                    }
                    if (match[0].length > 0) { // Only highlight matches that consume characters
                        matches.push({ start: match.index, end: match.index + match[0].length });
                        matchCount++;
                    }
                }
            } else {
                const match = regex.exec(text);
                if (match && match[0].length > 0) {
                    matches.push({ start: match.index, end: match.index + match[0].length });
                    matchCount++;
                }
            }

            // 2. Build the output HTML piece by piece, escaping text segments as we go.
            let resultHTML = '';
            let lastCursor = 0;

            matches.forEach(m => {
                // Add unescaped text before match
                resultHTML += escapeHTML(text.substring(lastCursor, m.start));
                // Add wrapped match
                resultHTML += `<mark>${escapeHTML(text.substring(m.start, m.end))}</mark>`;
                lastCursor = m.end;
            });

            // Add remaining text
            resultHTML += escapeHTML(text.substring(lastCursor));
            
            // Fix textarea newline bug: textarea allows scrolling past the last newline, 
            // so we add a zero-width space if the text ends in a newline to match heights.
            if (text[text.length - 1] === '\n') {
                resultHTML += '&#8203;';
            }

            highlightLayer.innerHTML = resultHTML;
            updateMatchCount(matchCount);

        } catch (e) {
            // Syntax error in Regex
            regexInputContainer.classList.add('error');
            errorMsg.textContent = e.message;
            highlightLayer.innerHTML = escapeHTML(text);
            updateMatchCount(0);
        }
    }

    function updateMatchCount(count) {
        if (count === 1) {
            matchCountDisplay.textContent = '1 match';
        } else {
            matchCountDisplay.textContent = `${count} matches`;
        }
    }

    // Utility: Escape HTML to prevent XSS and formatting breakage
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
