/**
 * RoSpec Verification Script with Pyodide
 * Adds Verify buttons to rospec code blocks and handles verification using Pyodide
 */

let pyodide = null;
let pyodideReady = false;
let initializationPromise = null;

document.addEventListener('DOMContentLoaded', function() {
  // Add verify buttons to all rospec code blocks in the evaluation table
  addVerifyButtons();
  
  // Set up styles for verification UI
  addVerificationStyles();
  
  // Wait a bit for Pyodide to be available if it's still loading
  setTimeout(() => {
    initializationPromise = initializePyodide();
  }, 500);
});

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
 * Initialize Pyodide and set up the verification environment
 */
async function initializePyodide() {
  console.log('Initializing Pyodide...');
  
  try {
    // Wait for loadPyodide to be available if it's not already
    if (typeof loadPyodide === 'undefined') {
      console.log('Waiting for Pyodide to be available...');
      await waitForPyodide();
    }
    
    // Use the locally available Pyodide (no indexURL to use local version)
    console.log('Using locally available Pyodide...');
    pyodide = await loadPyodide();
    console.log('Pyodide loaded successfully');
    
    // Install required packages
    console.log('Installing required packages...');
    await pyodide.loadPackage("micropip");
    const micropip = pyodide.pyimport("micropip");
    console.log('Installed micropip')

    // Install lark first with specific version
    console.log('Installing lark==1.2.2...');
    await micropip.install("lark==1.2.2");
    console.log('Lark 1.2.2 installed');
    
    // Install rospec (skipping dependencies as requested)
    console.log('Installing rospec package...');
    await micropip.install("rospec==0.0.2", {deps: false});
    console.log('RoSpec package installed');
    
    // Set up the verification function in Python
    await setupVerificationFunction();
    
    pyodideReady = true;
    console.log('✅ Pyodide verification environment ready');
    
  } catch (error) {
    console.error('❌ Failed to initialize Pyodide:', error);
    pyodideReady = false;
    throw error;
  }
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
  
  console.log('Python verification function set up');
}

/**
 * Adds "Verify" buttons to all rospec code blocks in the evaluation table
 */
function addVerifyButtons() {
  console.log('Adding verify buttons to rospec code blocks');
  
  // Select all spec rows in the evaluation table
  const specRows = document.querySelectorAll('.spec-row');
  console.log(`Found ${specRows.length} spec rows`);
  
  specRows.forEach((row, index) => {
    const codeBlock = row.querySelector('pre');
    
    if (codeBlock) {
      // Create container for the code block and button
      const container = document.createElement('div');
      container.className = 'rospec-verification-container';
      
      // Move the code block inside the container
      const parent = codeBlock.parentNode;
      parent.insertBefore(container, codeBlock);
      container.appendChild(codeBlock);
      
      // Create the verify button
      const verifyButton = document.createElement('button');
      verifyButton.className = 'rospec-verify-button';
      verifyButton.innerHTML = '<span>Verify</span>';
      verifyButton.dataset.specId = row.id.replace('spec-', '');
      
      // Add the button to the container
      container.insertBefore(verifyButton, codeBlock);
      
      // Create result container (hidden initially)
      const resultContainer = document.createElement('div');
      resultContainer.className = 'rospec-result-container';
      resultContainer.id = `result-${row.id}`;
      container.appendChild(resultContainer);
      
      // Add click event listener to the button
      verifyButton.addEventListener('click', handleVerifyClick);      
    }
  });
}

/**
 * Handle verify button click event
 */
async function handleVerifyClick(event) {
  const button = event.currentTarget;
  const specId = button.dataset.specId;
  const container = button.closest('.rospec-verification-container');
  const codeBlock = container.querySelector('pre code');
  const resultContainer = container.querySelector('.rospec-result-container');
  
  console.log(`Verify button clicked for spec ID: ${specId}`);
  
  // Get the rospec code
  const code = codeBlock.textContent;
  console.log(`Code length: ${code.length} characters`);
  
  // Show loading state
  button.classList.add('loading');
  button.disabled = true;
  
  // Clear previous results
  resultContainer.innerHTML = '';
  resultContainer.style.display = 'none';
  
  try {
    // Wait for Pyodide to be ready if it's still initializing
    if (!pyodideReady) {
      showLoadingMessage(container, 'Initializing verification environment...');
      await initializationPromise;
    }
    
    // Check if initialization succeeded
    if (!pyodideReady) {
      throw new Error('Verification environment failed to initialize');
    }
    
    // Verify code using Pyodide
    const result = await verifyRospecCodePyodide(code);
    console.log(`Verification complete. Result length: ${result.length}`);
    
    // Handle verification result
    if (result.trim() === '') {
      // Success case
      showSuccessMessage(container);
    } else {
      // Error case
      showErrorMessage(container, result);
    }
  } catch (error) {
    // Handle error
    console.error('Verification error:', error);
    showErrorMessage(container, `Verification failed: ${error.message}`);
  } finally {
    // Reset button state
    button.classList.remove('loading');
    button.disabled = false;
  }
}

/**
 * Show loading message while Pyodide is initializing
 * @param {HTMLElement} container - The container element
 * @param {string} message - The loading message
 */
function showLoadingMessage(container, message) {
  const resultContainer = container.querySelector('.rospec-result-container');
  
  resultContainer.innerHTML = `
    <div class="rospec-loading">
      <div class="rospec-loading-icon">⏳</div>
      <div class="rospec-loading-message">${message}</div>
    </div>
  `;
  resultContainer.style.display = 'block';
}

/**
 * Verify rospec code using Pyodide
 * @param {string} code - The rospec code to verify
 * @returns {Promise<string>} - The verification result
 */
async function verifyRospecCodePyodide(code) {
  console.log('Verifying code with Pyodide');
  
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
 * Display success message
 * @param {HTMLElement} container - The container element
 */
function showSuccessMessage(container) {
  const resultContainer = container.querySelector('.rospec-result-container');
  
  // Show success message
  resultContainer.innerHTML = `
    <div class="rospec-success">
      <div class="rospec-success-icon">✓</div>
      <div class="rospec-success-message">Verification successful! No errors detected.</div>
      <button class="rospec-dismiss-button">Dismiss</button>
    </div>
  `;
  resultContainer.style.display = 'block';
  
  // Add dismiss button event listener
  resultContainer.querySelector('.rospec-dismiss-button').addEventListener('click', () => {
    resultContainer.style.display = 'none';
  });
}

/**
 * Display error message
 * @param {HTMLElement} container - The container element
 * @param {string} errorMessage - The error message to display
 */
function showErrorMessage(container, errorMessage) {
  const resultContainer = container.querySelector('.rospec-result-container');
  
  // Format error message (preserve line breaks)
  const formattedError = errorMessage.replace(/\n/g, '<br>');
  
  // Show error message
  resultContainer.innerHTML = `
    <div class="rospec-error">
      <div class="rospec-error-icon">⚠</div>
      <div class="rospec-error-message">${formattedError}</div>
      <button class="rospec-dismiss-button">Dismiss</button>
    </div>
  `;
  resultContainer.style.display = 'block';
  
  // Add dismiss button event listener
  resultContainer.querySelector('.rospec-dismiss-button').addEventListener('click', () => {
    resultContainer.style.display = 'none';
  });
}

/**
 * Add CSS styles for verification UI
 */
function addVerificationStyles() {
  // Create style element
  const style = document.createElement('style');
  style.textContent = `
    /* Container for code block and button */
    .rospec-verification-container {
      position: relative;
      margin-bottom: 1rem;
    }
    
    /* Verify button styles */
    .rospec-verify-button {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      background-color: #2980b9;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .rospec-verify-button:hover {
      background-color: #3498db;
    }
    
    .rospec-verify-button:active {
      background-color: #1c638e;
    }
    
    .rospec-verify-button.loading {
      background-color: #95a5a6;
      cursor: not-allowed;
    }
    
    .rospec-verify-button.loading::after {
      content: '';
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-left: 8px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: rospec-spin 1s linear infinite;
    }
    
    @keyframes rospec-spin {
      to { transform: rotate(360deg); }
    }
    
    /* Result container styles */
    .rospec-result-container {
      margin-top: 10px;
      display: none;
    }
    
    /* Loading message styles */
    .rospec-loading {
      background-color: #e3f2fd;
      color: #1565c0;
      border: 1px solid #bbdefb;
      border-radius: 4px;
      padding: 12px;
      display: flex;
      align-items: flex-start;
    }
    
    .rospec-loading-icon {
      background-color: #2196f3;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .rospec-loading-message {
      flex-grow: 1;
    }
    
    /* Success message styles */
    .rospec-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      padding: 12px;
      display: flex;
      align-items: flex-start;
    }
    
    .rospec-success-icon {
      background-color: #28a745;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .rospec-success-message {
      flex-grow: 1;
    }
    
    /* Error message styles */
    .rospec-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 12px;
      display: flex;
      align-items: flex-start;
    }
    
    .rospec-error-icon {
      background-color: #dc3545;
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .rospec-error-message {
      flex-grow: 1;
      font-family: monospace;
      white-space: pre-wrap;
    }
    
    /* Dismiss button */
    .rospec-dismiss-button {
      background-color: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 4px 8px;
      margin-left: 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }
    
    .rospec-dismiss-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  `;
  
  // Add styles to document
  document.head.appendChild(style);
}