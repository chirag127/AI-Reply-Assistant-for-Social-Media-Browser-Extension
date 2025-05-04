// AI Reply Assistant - LinkedIn Content Script
// Handles DOM injection and interaction for LinkedIn

(function () {
    // Configuration
    const PLATFORM = "LinkedIn";
    const BUTTON_CLASS = "ai-reply-button-linkedin";
    const TONES = [
        "Friendly",
        "Professional",
        "Witty",
        "Supportive",
        "Sarcastic",
    ];
    let isEnabled = true; // Default to enabled

    // Load initial state
    chrome.storage.local.get(["linkedinEnabled"], (result) => {
        isEnabled = result.linkedinEnabled !== false;
        if (isEnabled) {
            init();
        } else {
            // Remove any existing buttons if the platform is disabled
            removeExistingButtons();
        }
    });

    // Listen for state changes
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (
            message.action === "updatePlatformState" &&
            message.platform === "linkedin"
        ) {
            isEnabled = message.enabled;
            if (isEnabled) {
                init();
            } else {
                removeExistingButtons();
            }
        }
    });

    // Remove all AI Reply buttons
    function removeExistingButtons() {
        const buttons = document.querySelectorAll(`.${BUTTON_CLASS}`);
        buttons.forEach((button) => button.remove());
    }

    // Main initialization
    function init() {
        console.log("AI Reply Assistant initialized for LinkedIn");

        // Start observing for new posts/comments
        observeForPosts();

        // Initial scan for existing posts
        scanForPosts();
    }

    // Create and inject the AI Reply button
    function createReplyButton() {
        // Don't create button if platform is disabled
        if (!isEnabled) return null;

        const button = document.createElement("button");
        button.className = BUTTON_CLASS;
        button.innerHTML = "💬 AI Reply";
        button.style.cssText = `
      background-color: #0a66c2;
      color: white;
      border: none;
      border-radius: 16px;
      padding: 4px 12px;
      margin-left: 8px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: background-color 0.2s;
    `;

        button.addEventListener("mouseover", () => {
            button.style.backgroundColor = "#004182";
        });

        button.addEventListener("mouseout", () => {
            button.style.backgroundColor = "#0a66c2";
        });

        return button;
    }

    // Inject AI Reply button into LinkedIn post actions
    function injectButtonIntoPost(postElement) {
        // Check if button already exists
        if (postElement.querySelector(`.${BUTTON_CLASS}`)) {
            return;
        }

        // Find the post actions container - try multiple selectors for different LinkedIn layouts
        const actionsContainer =
            postElement.querySelector(".feed-shared-social-actions") ||
            postElement.querySelector(".social-details-social-actions") ||
            postElement.querySelector(".social-actions-button") ||
            postElement.querySelector(".feed-shared-social-action-bar") ||
            postElement.querySelector(
                ".comments-comment-social-bar__actions-container"
            );

        if (!actionsContainer) {
            console.log(
                "Could not find LinkedIn actions container",
                postElement
            );
            return;
        }

        // Create and append the button
        const button = createReplyButton();
        if (button) {
            actionsContainer.appendChild(button);

            // Add click event listener
            button.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();

                // Get the post text - try multiple selectors for different LinkedIn layouts
                const postTextElement =
                    postElement.querySelector(
                        ".feed-shared-update-v2__description-text"
                    ) ||
                    postElement.querySelector(".feed-shared-text") ||
                    postElement.querySelector(".update-components-text") ||
                    postElement.querySelector(
                        ".comments-comment-item__main-content"
                    ) ||
                    postElement.querySelector(
                        ".feed-shared-update-v2__commentary"
                    );

                if (!postTextElement) {
                    console.error("Could not find LinkedIn post text");
                    return;
                }

                const postText = postTextElement.textContent;
                handleButtonClick(button, postText);
            });
        }
    }

    // Handle AI Reply button click
    function handleButtonClick(button, postText) {
        console.log("AI Reply button clicked for LinkedIn");

        // Instead of using an iframe, let's create the tone selector directly in the DOM
        const toneSelector = document.createElement("div");
        toneSelector.className = "ai-reply-tone-selector";
        toneSelector.style.cssText = `
            position: absolute;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            padding: 12px;
            width: 220px;
            z-index: 9999;
        `;

        // Position the tone selector near the button
        const buttonRect = button.getBoundingClientRect();
        toneSelector.style.left = `${buttonRect.left}px`;
        toneSelector.style.top = `${buttonRect.bottom + 5}px`;

        // Add title
        const title = document.createElement("div");
        title.textContent = "Select Tone:";
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 12px;
            color: #333;
            font-size: 16px;
        `;
        toneSelector.appendChild(title);

        // Add tone buttons
        const tones = [
            "Friendly",
            "Professional",
            "Witty",
            "Supportive",
            "Sarcastic",
        ];
        tones.forEach((tone) => {
            const toneButton = document.createElement("button");
            toneButton.textContent = tone;
            toneButton.style.cssText = `
                display: block;
                width: 100%;
                text-align: left;
                padding: 10px;
                margin: 6px 0;
                border: none;
                background-color: #f0f0f0;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s;
                font-size: 14px;
            `;

            toneButton.addEventListener("mouseover", () => {
                toneButton.style.backgroundColor = "#e0e0e0";
            });

            toneButton.addEventListener("mouseout", () => {
                toneButton.style.backgroundColor = "#f0f0f0";
            });

            toneButton.addEventListener("click", () => {
                console.log(`Selected tone: ${tone} for platform: ${PLATFORM}`);
                generateReply(postText, PLATFORM, tone, toneSelector);
            });

            toneSelector.appendChild(toneButton);
        });

        // Add to DOM
        document.body.appendChild(toneSelector);

        // Close when clicking outside
        document.addEventListener("click", function closeSelector(e) {
            if (e.target !== button && !toneSelector.contains(e.target)) {
                toneSelector.remove();
                document.removeEventListener("click", closeSelector);
            }
        });
    }

    // Generate reply using the background script
    function generateReply(postText, platform, tone, container) {
        console.log(`Generating reply for: ${platform} with tone: ${tone}`);

        // Show loading message
        container.innerHTML = "";
        const loadingDiv = document.createElement("div");
        loadingDiv.style.cssText = `
            text-align: center;
            padding: 20px;
            font-family: sans-serif;
        `;
        loadingDiv.innerHTML = `
            <div>Generating replies...</div>
            <div style="margin-top: 10px;">Please wait...</div>
        `;
        container.appendChild(loadingDiv);

        // Send message to background script
        chrome.runtime.sendMessage(
            {
                action: "generateReply",
                postText,
                platform,
                tone,
            },
            (response) => {
                if (response && response.success) {
                    displaySuggestions(response.suggestions, container);
                } else {
                    container.innerHTML = "";
                    const errorDiv = document.createElement("div");
                    errorDiv.style.cssText = `
                        color: red;
                        padding: 10px;
                        text-align: center;
                    `;
                    errorDiv.textContent = `Error: ${
                        (response && response.error) ||
                        "Failed to generate replies"
                    }`;
                    container.appendChild(errorDiv);
                }
            }
        );
    }

    // Display reply suggestions
    function displaySuggestions(suggestions, container) {
        // Clear the container
        container.innerHTML = "";

        // Add title
        const title = document.createElement("div");
        title.textContent = "Suggested Replies:";
        title.style.cssText = `
            font-weight: bold;
            margin-bottom: 12px;
            color: #333;
            font-size: 16px;
        `;
        container.appendChild(title);

        // Add each suggestion
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement("div");
            suggestionElement.textContent = suggestion;
            suggestionElement.style.cssText = `
                padding: 10px;
                margin: 8px 0;
                background-color: #f8f8f8;
                border-radius: 4px;
                cursor: pointer;
                border: 1px solid #e1e8ed;
                transition: background-color 0.2s;
            `;

            suggestionElement.addEventListener("mouseover", () => {
                suggestionElement.style.backgroundColor = "#e8f5fd";
            });

            suggestionElement.addEventListener("mouseout", () => {
                suggestionElement.style.backgroundColor = "#f8f8f8";
            });

            suggestionElement.addEventListener("click", () => {
                pasteReplyToLinkedIn(suggestion);
                container.remove();
            });

            container.appendChild(suggestionElement);
        });
    }

    // Paste the selected reply into LinkedIn's reply box
    function pasteReplyToLinkedIn(replyText) {
        // Find the comment input field
        const commentInput = document.querySelector(
            ".comments-comment-box__text-input"
        );

        if (commentInput) {
            // Focus the input
            commentInput.focus();

            // Use execCommand for older browsers
            if (document.execCommand) {
                // Create a temporary textarea to copy from
                const tempTextarea = document.createElement("textarea");
                tempTextarea.value = replyText;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand("copy");
                document.body.removeChild(tempTextarea);

                // Paste into the input
                document.execCommand("paste");
            } else {
                // Use clipboard API for modern browsers
                navigator.clipboard.writeText(replyText).then(() => {
                    // Simulate paste event
                    const pasteEvent = new ClipboardEvent("paste", {
                        clipboardData: new DataTransfer(),
                        bubbles: true,
                    });
                    Object.defineProperty(pasteEvent.clipboardData, "getData", {
                        value: () => replyText,
                    });
                    commentInput.dispatchEvent(pasteEvent);
                });
            }
        } else {
            console.error("Could not find LinkedIn comment input");
        }
    }

    // Scan for existing posts
    function scanForPosts() {
        // Try multiple selectors for different LinkedIn post types
        const postSelectors = [
            ".feed-shared-update-v2",
            ".occludable-update",
            ".comments-comment-item",
            ".feed-shared-update",
            ".update-components-actor",
            ".comments-comments-list__comment-item",
        ];

        // Combine all selectors
        const combinedSelector = postSelectors.join(", ");
        const posts = document.querySelectorAll(combinedSelector);

        console.log(
            `Found ${posts.length} LinkedIn posts/comments to inject buttons into`
        );

        posts.forEach((post) => {
            injectButtonIntoPost(post);
        });
    }

    // Observe for new posts being added to the DOM
    function observeForPosts() {
        // Define post selectors
        const postSelectors = [
            ".feed-shared-update-v2",
            ".occludable-update",
            ".comments-comment-item",
            ".feed-shared-update",
            ".update-components-actor",
            ".comments-comments-list__comment-item",
        ];

        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a post or contains posts
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if node matches any of our selectors
                            if (node.classList) {
                                for (const selector of postSelectors) {
                                    // Remove the dot from the selector
                                    const className = selector.substring(1);
                                    if (node.classList.contains(className)) {
                                        injectButtonIntoPost(node);
                                        shouldScan = true;
                                        break;
                                    }
                                }
                            }

                            // Check for posts inside the added node
                            const combinedSelector = postSelectors.join(", ");
                            const posts =
                                node.querySelectorAll(combinedSelector);
                            if (posts.length > 0) {
                                posts.forEach((post) => {
                                    injectButtonIntoPost(post);
                                });
                                shouldScan = true;
                            }
                        }
                    });
                }
            });

            // If we found new content, do a full scan to catch anything we missed
            if (shouldScan) {
                setTimeout(scanForPosts, 500); // Delay to ensure DOM is updated
            }
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize when the DOM is fully loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            if (isEnabled) {
                init();
            }
        });
    } else {
        if (isEnabled) {
            init();
        }
    }
})();
