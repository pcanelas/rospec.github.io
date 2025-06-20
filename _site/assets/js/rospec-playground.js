/**
 * RoSpec Playground Script with Pyodide
 * Interactive playground for writing and verifying rospec code
 */

let pyodide = null;
let pyodideReady = false;
let initializationPromise = null;

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
    
    // Initialize Pyodide (but don't wait for it)
    setTimeout(() => {
      initializationPromise = initializePyodide();
    }, 500);
  });

/**
 * Initialize Pyodide and set up the verification environment
 */
async function initializePyodide() {
  console.log('Initializing Pyodide for playground...');
  
  try {
    // Wait for loadPyodide to be available if it's not already
    if (typeof loadPyodide === 'undefined') {
      console.log('Waiting for Pyodide to be available...');
      await waitForPyodide();
    }
    
    // Load Pyodide
    console.log('Loading Pyodide...');
    pyodide = await loadPyodide();
    console.log('Pyodide loaded successfully');
    
    // Install required packages
    console.log('Installing required packages...');
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    
    // Install lark first with specific version
    console.log('Installing lark==1.2.2...');
    await micropip.install("lark==1.2.2");
    console.log('Lark 1.2.2 installed');
    
    // Install rospec package - should work now with minimal dependencies
    console.log('Installing rospec package...');
    try {
      // Try latest version first
      console.log('Trying latest rospec version...');
      await micropip.install("rospec");
      console.log('RoSpec package installed (latest version)');
    } catch (error1) {
      console.log('Latest version failed, trying specific version...');
      try {
        // Try specific version 
        await micropip.install("rospec==0.0.3");
        console.log('RoSpec package installed (version 0.0.2)');
      } catch (error2) {
        console.log('Specific version failed, trying without dependencies...');
        try {
          // Try without dependencies as fallback
          await micropip.install("rospec==0.0.3", {deps: false});
          console.log('RoSpec package installed (no deps)');
        } catch (error3) {
          console.log('All installation methods failed');
          throw new Error(`Could not install rospec package. Errors: ${error1.message}, ${error2.message}, ${error3.message}`);
        }
      }
    }
    
    // Set up the verification function in Python
    await setupVerificationFunction();
    
    pyodideReady = true;
    console.log('✅ Pyodide verification environment ready for playground');
    
  } catch (error) {
    console.error('❌ Failed to initialize Pyodide:', error);
    pyodideReady = false;
    throw error;
  }
}

/**
 * Wait for loadPyodide to be available
 */
function waitForPyodide(maxWaitTime = 10000) {
  return new Promise((resolve, reject) => {
    const checkInterval = 100;
    let elapsedTime = 0;
    
    const check = () => {
      if (typeof loadPyodide !== 'undefined') {
        resolve();
      } else if (elapsedTime >= maxWaitTime) {
        reject(new Error('Pyodide not available after waiting'));
      } else {
        elapsedTime += checkInterval;
        setTimeout(check, checkInterval);
      }
    };
    
    check();
  });
}

/**
 * Set up the Python verification function in Pyodide
 */
async function setupVerificationFunction() {
  pyodide.runPython(`
import sys
import traceback

def verify_rospec_code(code):
    """
    Verify rospec code using the rospec library
    
    Args:
        code (str): The rospec code to verify
        
    Returns:
        str: Error message if verification fails, empty string if successful
    """
    try:
        # Import rospec modules (using the pip package structure)
        from rospec.language.frontend import parse_program
        from rospec.types_database.ttypes_loader import get_ros_types, get_native_types
        from rospec.verification.context import Context
        from rospec.verification.definition_formation import program_formation
        
        # Parse the program
        parsed_program = parse_program(code)
        
        # Load context with ROS types
        context = Context()
        context = get_ros_types(context)
        context = get_native_types(context)
        
        # Verify the program
        errors = program_formation(context, parsed_program)
        
        if errors:
            return "\\n".join(errors)
        else:
            return ""
            
    except Exception as e:
        # Get full traceback for debugging
        error_details = traceback.format_exc()
        return f"Verification error: {str(e)}\\n\\nDetails:\\n{error_details}"
  `);
  
  console.log('Python verification function set up for playground');
}
  
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
  
  // Verify code using Pyodide
  async function verifyCode(editor) {
    const code = editor.getValue();
    
    // Show loading animation
    showLoadingAnimation(true);
    
    // Clear previous error markers in the editor
    for (let i = 0; i < editor.doc.lineCount(); i++) {
      editor.doc.removeLineClass(i, 'background', 'error-line-background');
    }
    
    try {
      // Wait for Pyodide to be ready if it's still initializing
      if (!pyodideReady) {
        displayLoadingMessage('Initializing verification environment...');
        await initializationPromise;
      }
      
      // Check if initialization succeeded
      if (!pyodideReady) {
        throw new Error('Verification environment failed to initialize');
      }
      
      // Verify code using Pyodide
      const result = await verifyRospecCodePyodide(code);
      console.log(`Verification complete. Result length: ${result.length}`);
      
      if (result.trim() === '') {
        // Success case
        clearErrors();
        displaySuccess();
      } else {
        // Parse and display errors
        const errors = parseVerificationErrors(result);
        displayErrors(errors, editor);
      }
    } catch (error) {
      // Handle error
      console.error('Verification error:', error);
      const errors = [{
        line: 1,
        message: `Verification failed: ${error.message}`
      }];
      displayErrors(errors, editor);
    } finally {
      // Hide loading animation
      showLoadingAnimation(false);
    }
  }

  /**
   * Verify rospec code using Pyodide
   * @param {string} code - The rospec code to verify
   * @returns {Promise<string>} - The verification result
   */
  async function verifyRospecCodePyodide(code) {
    console.log('Verifying code with Pyodide in playground');
    
    try {
      // Call the Python verification function
      const result = pyodide.runPython(`verify_rospec_code(${JSON.stringify(code)})`);
      console.log(`Verification result: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
      return result;
    } catch (error) {
      console.error('Error during Pyodide verification:', error);
      throw new Error(`Pyodide verification failed: ${error.message}`);
    }
  }

  /**
   * Parse verification errors from the result string
   * @param {string} errorString - The error string from verification
   * @returns {Array} - Array of error objects
   */
  function parseVerificationErrors(errorString) {
    const errors = [];
    const lines = errorString.split('\n');
    
    for (const line of lines) {
      if (line.trim()) {
        // Try to extract line numbers from error messages
        // This is a simple heuristic - you might need to adjust based on your error format
        const lineMatch = line.match(/line (\d+)/i);
        const lineNumber = lineMatch ? parseInt(lineMatch[1]) : 1;
        
        errors.push({
          line: lineNumber,
          message: line.trim()
        });
      }
    }
    
    // If no errors were parsed, create a generic error
    if (errors.length === 0) {
      errors.push({
        line: 1,
        message: errorString.trim() || 'Unknown verification error'
      });
    }
    
    return errors;
  }

  /**
   * Display loading message
   * @param {string} message - The loading message
   */
  function displayLoadingMessage(message) {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'block';
    errorTab.innerHTML = '';
    
    // Create loading header
    const header = document.createElement('div');
    header.className = 'loading-tab-header';
    header.innerHTML = `<svg class="loading-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416"><animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/><animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/></circle></svg>
                       <span>${message}</span>`;
    errorTab.appendChild(header);
  }
  
  // Display validation errors
  function displayErrors(errors, editor) {
    const errorTab = document.getElementById('errorTab');
    errorTab.style.display = 'block';
    errorTab.innerHTML = '';
    
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
      if (error.line > 0) {
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
        
        // Add error markers to the editor
        const line = error.line - 1;
        if (line >= 0 && line < editor.doc.lineCount()) {
          editor.doc.addLineClass(line, 'background', 'error-line-background');
        }
      }
      
      errorList.appendChild(errorItem);
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