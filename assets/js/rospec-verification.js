/**
 * RoSpec Verification Script
 * Adds Verify buttons to rospec code blocks and handles verification with backend
 */
document.addEventListener('DOMContentLoaded', function() {
  // Add verify buttons to all rospec code blocks in the evaluation table
  //addVerifyButtons(); // Enabled to use verification
  
  // Set up styles for verification UI
  addVerificationStyles();
  
  // Test the server connection
  testServerConnection();
});

/**
 * Test if the server is reachable
 */
function testServerConnection() {
  const serverUrl = 'http://194.117.20.223:8000/api/status';
  console.log(`Testing server connection to: ${serverUrl}`);
  
  fetch(serverUrl, { 
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'text/plain',
    }
  })
    .then(response => {
      console.log(`Server test response status: ${response.status}`);
      if (response.ok) {
        console.log('✅ RoSpec verification server is reachable');
        return response.text();
      } else {
        console.warn(`⚠️ RoSpec verification server returned non-OK status: ${response.status}`);
        throw new Error(`Status: ${response.status}`);
      }
    })
    .then(text => {
      console.log(`Server response: ${text}`);
    })
    .catch(error => {
      console.error('❌ RoSpec verification server not reachable:', error.message);
      console.error('Please check:');
      console.error('1. Server is running on the correct IP and port');
      console.error('2. Firewall allows connections to port 8000');
      console.error('3. CORS is properly configured on the server');
    });
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
      
      console.log(`Added verify button to spec row ${index + 1}`);
    }
  });
}

/**
 * Handle verify button click event
 */
function handleVerifyClick(event) {
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
  
  // Send code to the verification endpoint
  verifyRospecCode(code)
    .then(result => {
      console.log(`Verification complete. Result length: ${result.length}`);
      
      // Handle verification result
      if (result.trim() === '') {
        // Success case
        showSuccessMessage(container);
      } else {
        // Error case
        showErrorMessage(container, result);
      }
    })
    .catch(error => {
      // Handle error
      console.error('Verification error:', error);
      showErrorMessage(container, `Verification failed: ${error.message}`);
    })
    .finally(() => {
      // Reset button state
      button.classList.remove('loading');
      button.disabled = false;
    });
}

/**
 * Send rospec code to the verification endpoint
 * @param {string} code - The rospec code to verify
 * @returns {Promise<string>} - The verification result
 */
async function verifyRospecCode(code) {
  console.log('Sending code for verification');
  
  try {
    // Updated with the CORRECT IP address from your server
    const apiUrl = 'http://194.117.20.223:8000/api/verify-rospec';
    
    console.log(`Sending verification request to: ${apiUrl}`);
    console.log(`Code to verify (first 100 chars): ${code.substring(0, 100)}...`);
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain',
      },
      body: JSON.stringify({ code: code }),
      mode: 'cors',
    };
    
    console.log('Request options:', requestOptions);
    
    const response = await fetch(apiUrl, requestOptions);
    
    console.log(`Server response status: ${response.status}`);
    console.log('Response headers:', [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Server error response: ${errorText}`);
      throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.text();
    console.log(`Received response: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
    return result;
  } catch (error) {
    console.error('Error during verification request:', error);
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to verification server. Please check if the server is running and accessible.');
    } else if (error.message.includes('CORS')) {
      throw new Error('CORS error: The server is not allowing requests from this domain.');
    } else {
      throw error;
    }
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
