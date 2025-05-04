// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load required libraries if not already loaded
    loadRequiredLibraries()
      .then(() => {
        initCodeMirror();
      })
      .catch(error => {
        console.error('Error loading libraries:', error);
        displayError('Failed to load editor libraries. Please refresh the page and try again.');
      });
  });
  
  // Function to dynamically load required libraries
  function loadRequiredLibraries() {
    return new Promise((resolve, reject) => {
      // Check if CodeMirror is already loaded
      if (window.CodeMirror) {
        resolve();
        return;
      }
  
      // Load CodeMirror library and dependencies
      const scripts = [
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/mode/simple.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/fold/foldcode.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/fold/foldgutter.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/fold/brace-fold.min.js'
      ];
  
      const styles = [
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/theme/neo.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/addon/fold/foldgutter.min.css',
        'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap'
      ];
  
      // Load CSS files
      let styleCount = 0;
      styles.forEach(url => {
        if (!document.querySelector(`link[href="${url}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.onload = () => {
            styleCount++;
            if (styleCount === styles.length) {
              loadScripts();
            }
          };
          link.onerror = () => reject(new Error(`Failed to load style: ${url}`));
          document.head.appendChild(link);
        } else {
          styleCount++;
          if (styleCount === styles.length) {
            loadScripts();
          }
        }
      });
  
      // Load JS files sequentially
      function loadScripts(index = 0) {
        if (index === scripts.length) {
          resolve();
          return;
        }
  
        const url = scripts[index];
        if (!document.querySelector(`script[src="${url}"]`)) {
          const script = document.createElement('script');
          script.src = url;
          script.onload = () => loadScripts(index + 1);
          script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
          document.head.appendChild(script);
        } else {
          loadScripts(index + 1);
        }
      }
  
      // If no styles to load, start loading scripts
      if (styles.length === 0) {
        loadScripts();
      }
    });
  }
  
  // Initialize CodeMirror editor
  function initCodeMirror() {
    // Reuse existing rospec syntax highlighting if available
    if (!CodeMirror.modes.rospec) {
      defineRospecMode();
    }
  
    // Initialize CodeMirror editor
    const editor = CodeMirror.fromTextArea(document.getElementById('rospecEditor'), {
      lineNumbers: true,
      mode: 'rospec',
      theme: 'neo',
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      lineWrapping: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'error-gutter'],
      foldGutter: true,
    });
  
    // Set height to take available space
    editor.setSize(null, '450px');
  
    // Add event handlers for buttons
    document.getElementById('verifyCode').addEventListener('click', () => verifyCode(editor));
    document.getElementById('clearEditor').addEventListener('click', () => clearEditor(editor));
  
    // Set up error display
    document.getElementById('errorTab').style.display = 'none';
    
    // Show loading animation
    showLoadingAnimation(false);
  }
  
  // Define the rospec syntax highlighting mode if not already defined
  function defineRospecMode() {
    CodeMirror.defineSimpleMode('rospec', {
      start: [
        // Connection keywords (pink/purple)
        { 
          regex: /\b(subscribers|subscribes to|publishes to|broadcasts|listens|dynamic|broadcast|listen|static|publishers|remapping to|calls service|provides|consumes)\b/, 
          token: 'connection-keyword' 
        },
        // Regular keywords (black bold)
        { 
          regex: /\b(node|type|plugin type|policy|rules|attach to|message|service|action|qos|frame|link|hierarchy|alias|field|from|nodelet|instance|expects|system|ensures|and|or|optional|topic|param|where|response|request|feedback|remaps|external verify|plugin)\b/, 
          token: 'rospec-keyword' 
        },
        // Special keywords (orange)
        { 
          regex: /\b(exists|count|content|eventually|always|tag|in|out|context|childs|parents)\b/, 
          token: 'special-keyword' 
        },
        // Decorator syntax
        { 
          regex: /@\w+/, 
          token: 'special-keyword' 
        },
        // Types (blue)
        { 
          regex: /\b(int|float|double|bool|string|int8|int16|int32|int64|uint8|uint16|uint32|uint64)\b/, 
          token: 'ttype' 
        },
        // Boolean values (light blue)
        { 
          regex: /\b(true|false)\b/, 
          token: 'number' 
        },
        // ROS message types with namespace (blue)
        { 
          regex: /\b([a-z0-9_]+\/[a-zA-Z0-9_]*[A-Z][a-zA-Z0-9_\/]*)\b/, 
          token: 'ttype' 
        },
        // Custom types starting with capital letter (blue)
        { 
          regex: /\b([A-Z][a-zA-Z0-9_]+)\b/, 
          token: 'ttype' 
        },
        // Variables (dark red)
        { 
          regex: /\b([a-zA-Z_0-9]+)\b/, 
          token: 'variable' 
        },
        // Numbers (light blue)
        { 
          regex: /\b\d+(\.\d+)?\b/, 
          token: 'number' 
        },
        // Operators (black)
        { 
          regex: /[{}:;=<>!~]/, 
          token: 'operator' 
        },
        // Comments (gray italic)
        { 
          regex: /#.*/, 
          token: 'rospec-comment' 
        },
        // Strings (green)
        { 
          regex: /"(?:[^\\"]|\\.)*?"/, 
          token: 'string' 
        },
        { 
          regex: /'(?:[^\\']|\\.)*?'/, 
          token: 'string' 
        },
      ],
      meta: {
        lineComment: '#',
      }
    });
  }
  
  // Clear the editor
  function clearEditor(editor) {
    editor.setValue('');
    clearErrors();
  }
  
  // Show/hide loading animation
  function showLoadingAnimation(show) {
    const verifyButton = document.getElementById('verifyCode');
    
    if (show) {
      verifyButton.classList.add('loading');
      verifyButton.disabled = true;
    } else {
      verifyButton.classList.remove('loading');
      verifyButton.disabled = false;
    }
  }
  
  // Simulate verification of the code
  function verifyCode(editor) {
    const code = editor.getValue();
    
    // Show loading animation
    showLoadingAnimation(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Simple validation example - in a real implementation, this would call an API
      const errors = validateCode(code);
      
      if (errors.length > 0) {
        displayErrors(errors, editor);
      } else {
        clearErrors();
        displaySuccess();
      }
      
      // Hide loading animation
      showLoadingAnimation(false);
    }, 1000);
  }
  
  // Simple code validation for demonstration
  function validateCode(code) {
    const errors = [];
    const lines = code.split('\n');
    
    // Check for basic syntax issues
    let braceCount = 0;
    let lineNumber = 1;
    
    for (const line of lines) {
      // Count braces
      for (const char of line) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
      }
      
      // Very basic checks - in a real implementation, this would be much more sophisticated
      if (line.includes('node type') && !line.includes('{')) {
        errors.push({
          line: lineNumber,
          message: 'Node type declaration should be followed by an opening brace'
        });
      }
      
      if (line.includes('param') && !line.match(/param\s+\w+:\s*\w+/) && !line.includes('=')) {
        errors.push({
          line: lineNumber,
          message: 'Parameter declaration requires a name and type'
        });
      }
      
      lineNumber++;
    }
    
    // Check for unbalanced braces
    if (braceCount !== 0) {
      errors.push({
        line: 1,
        message: 'Unbalanced braces in the code'
      });
    }
    
    return errors;
  }
  
  // Display validation errors
  function displayErrors(errors, editor) {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'block';
    errorTab.innerHTML = '';
    
    // Clear previous error markers in the editor
    for (let i = 0; i < editor.doc.lineCount(); i++) {
      editor.doc.removeLineClass(i, 'background', 'error-line-background');
    }
    
    // Create error tab header
    const header = document.createElement('div');
    header.className = 'error-tab-header';
    header.innerHTML = `<svg class="error-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                       <span>${errors.length} ${errors.length === 1 ? 'Error' : 'Errors'} Detected</span>`;
    errorTab.appendChild(header);
    
    // Create error list
    const errorList = document.createElement('ul');
    errorList.className = 'error-list';
    
    errors.forEach(error => {
      const errorItem = document.createElement('li');
      errorItem.className = 'error-item';
      
      // Error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.innerHTML = `<span class="error-label">Error:</span> ${error.message}`;
      errorItem.appendChild(errorMessage);
      
      // Line number with location icon
      const errorLine = document.createElement('div');
      errorLine.className = 'error-line';
      errorLine.innerHTML = `<svg class="location-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            Line ${error.line}`;
      errorItem.appendChild(errorLine);
      
      // Make the error clickable to jump to the line
      errorItem.addEventListener('click', () => {
        editor.setCursor({line: error.line - 1, ch: 0});
        editor.focus();
      });
      
      errorList.appendChild(errorItem);
      
      // Add error markers to the editor
      const line = error.line - 1;
      editor.doc.addLineClass(line, 'background', 'error-line-background');
    });
    
    errorTab.appendChild(errorList);
  }
  
  // Display success message
  function displaySuccess() {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'block';
    errorTab.innerHTML = '';
    
    // Create success header
    const header = document.createElement('div');
    header.className = 'success-tab-header';
    header.innerHTML = `<svg class="success-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                       <span>Verification Successful</span>`;
    errorTab.appendChild(header);
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = 'Your code looks great! No syntax errors or configuration issues detected.';
    errorTab.appendChild(successMessage);
  }
  
  // Clear errors
  function clearErrors() {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'none';
    errorTab.innerHTML = '';
  }
  
  // Display a generic error message
  function displayError(message) {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'block';
    errorTab.innerHTML = '';
    
    const header = document.createElement('div');
    header.className = 'error-tab-header';
    header.innerHTML = `<svg class="error-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                       <span>Error</span>`;
    errorTab.appendChild(header);
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message generic-error';
    errorMessage.textContent = message;
    errorTab.appendChild(errorMessage);
  }