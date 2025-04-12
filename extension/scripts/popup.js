// AI Reply Assistant - Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // Check if the extension is active
  updateExtensionStatus();
  
  // Add event listeners
  setupEventListeners();
});

// Update the extension status indicator
function updateExtensionStatus() {
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-section p');
  
  // Check if the backend is reachable
  checkBackendStatus()
    .then(isActive => {
      if (isActive) {
        statusIndicator.classList.add('active');
        statusIndicator.classList.remove('inactive');
        statusText.textContent = 'Extension is active';
      } else {
        statusIndicator.classList.remove('active');
        statusIndicator.classList.add('inactive');
        statusText.textContent = 'Backend is not reachable';
      }
    })
    .catch(() => {
      statusIndicator.classList.remove('active');
      statusIndicator.classList.add('inactive');
      statusText.textContent = 'Error checking status';
    });
}

// Check if the backend API is reachable
async function checkBackendStatus() {
  try {
    // This is a simple check - in production, you might want a dedicated health endpoint
    const response = await fetch('http://localhost:3000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking backend status:', error);
    return false;
  }
}

// Set up event listeners
function setupEventListeners() {
  // Example: Add click event to the status section to refresh status
  document.querySelector('.status-section').addEventListener('click', () => {
    updateExtensionStatus();
  });
  
  // You can add more event listeners here as needed
}

// Get the current version from the manifest
function getExtensionVersion() {
  const manifest = chrome.runtime.getManifest();
  return manifest.version;
}

// Update the version display
function updateVersionDisplay() {
  const versionElement = document.querySelector('.version');
  versionElement.textContent = `v${getExtensionVersion()}`;
}

// Initialize version display
updateVersionDisplay();
