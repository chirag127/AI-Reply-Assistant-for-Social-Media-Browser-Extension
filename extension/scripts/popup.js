// AI Reply Assistant - Popup Script

// Configuration
// In production, this should be updated to the deployed backend URL with HTTPS
const API_BASE_URL = "http://localhost:3000";
let HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

// Initialize when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Load settings from storage
    loadSettings();

    // Check if the extension is active
    updateExtensionStatus();

    // Add event listeners
    setupEventListeners();

    // Update version display
    updateVersionDisplay();
});

// Update the extension status indicator
function updateExtensionStatus() {
    const statusIndicator = document.querySelector(".status-indicator");
    const statusText = document.querySelector(".status-section p");

    // Check if the backend is reachable
    checkBackendStatus()
        .then((isActive) => {
            if (isActive) {
                statusIndicator.classList.add("active");
                statusIndicator.classList.remove("inactive");
                statusText.textContent = "Extension is active";
            } else {
                statusIndicator.classList.remove("active");
                statusIndicator.classList.add("inactive");
                statusText.textContent = "Backend is not reachable";
            }
        })
        .catch(() => {
            statusIndicator.classList.remove("active");
            statusIndicator.classList.add("inactive");
            statusText.textContent = "Error checking status";
        });
}

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(["apiBaseUrl"], (result) => {
        if (result.apiBaseUrl) {
            // If a custom API base URL is set, use it
            const customApiBaseUrl = result.apiBaseUrl;
            HEALTH_ENDPOINT = `${customApiBaseUrl}/health`;
            console.log(`Using custom API endpoint: ${HEALTH_ENDPOINT}`);
        }
    });
}

// Check if the backend API is reachable
async function checkBackendStatus() {
    try {
        // Use the health endpoint to check if the backend is reachable
        const response = await fetch(HEALTH_ENDPOINT, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error checking backend status:", error);
        return false;
    }
}

// Set up event listeners
function setupEventListeners() {
    // Example: Add click event to the status section to refresh status
    document.querySelector(".status-section").addEventListener("click", () => {
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
    const versionElement = document.querySelector(".version");
    versionElement.textContent = `v${getExtensionVersion()}`;
}

// Initialize version display
updateVersionDisplay();
