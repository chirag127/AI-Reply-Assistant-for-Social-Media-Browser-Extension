// AI Reply Assistant - Popup Script

// Configuration
const API_BASE_URL = "http://localhost:3000";
let HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

// Platform configuration
const PLATFORMS = {
    twitter: {
        id: "twitter-toggle",
        storageKey: "twitterEnabled",
        pattern: "https://*.x.com/*",
    },
    linkedin: {
        id: "linkedin-toggle",
        storageKey: "linkedinEnabled",
        pattern: "https://*.linkedin.com/*",
    },
    reddit: {
        id: "reddit-toggle",
        storageKey: "redditEnabled",
        pattern: "https://*.reddit.com/*",
    },
};

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

// Load settings from storage
function loadSettings() {
    chrome.storage.local.get(
        ["apiBaseUrl", ...Object.values(PLATFORMS).map((p) => p.storageKey)],
        (result) => {
            if (result.apiBaseUrl) {
                // If a custom API base URL is set, use it
                const customApiBaseUrl = result.apiBaseUrl;
                HEALTH_ENDPOINT = `${customApiBaseUrl}/health`;
                console.log(`Using custom API endpoint: ${HEALTH_ENDPOINT}`);
            }

            // Set toggle states
            Object.values(PLATFORMS).forEach((platform) => {
                const toggle = document.getElementById(platform.id);
                if (toggle) {
                    // Default to enabled if not set
                    toggle.checked = result[platform.storageKey] !== false;
                }
            });
        }
    );
}

// Save platform state
function savePlatformState(platformKey, enabled) {
    const platform = PLATFORMS[platformKey];
    if (platform) {
        chrome.storage.local.set({ [platform.storageKey]: enabled }, () => {
            console.log(`${platformKey} ${enabled ? "enabled" : "disabled"}`);
            // Notify content scripts of the change
            chrome.tabs.query({ url: platform.pattern }, (tabs) => {
                tabs.forEach((tab) => {
                    chrome.tabs.sendMessage(tab.id, {
                        action: "updatePlatformState",
                        platform: platformKey,
                        enabled: enabled,
                    });
                });
            });
        });
    }
}

// Check if the backend API is reachable
async function checkBackendStatus() {
    try {
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
    // Add change event listeners to platform toggles
    Object.entries(PLATFORMS).forEach(([key, platform]) => {
        const toggle = document.getElementById(platform.id);
        if (toggle) {
            toggle.addEventListener("change", (e) => {
                savePlatformState(key, e.target.checked);
            });
        }
    });

    // Example: Add click event to the status section to refresh status
    document.querySelector(".status-section").addEventListener("click", () => {
        updateExtensionStatus();
    });
}

// Update the extension status indicator
function updateExtensionStatus() {
    const statusIndicator = document.querySelector(".status-indicator");
    const statusText = document.querySelector(".status-section p");

    // Check if any platform is enabled
    chrome.storage.local.get(
        Object.values(PLATFORMS).map((p) => p.storageKey),
        (result) => {
            const anyEnabled = Object.values(PLATFORMS).some(
                (platform) => result[platform.storageKey] !== false
            );

            if (!anyEnabled) {
                statusIndicator.classList.remove("active");
                statusIndicator.classList.add("inactive");
                statusText.textContent = "Extension disabled for all platforms";
                return;
            }

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
    );
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
