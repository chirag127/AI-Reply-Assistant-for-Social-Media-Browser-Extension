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

        // Find the post actions container
        const actionsContainer = postElement.querySelector(
            ".feed-shared-social-actions"
        );
        if (!actionsContainer) return;

        // Create and append the button
        const button = createReplyButton();
        actionsContainer.appendChild(button);

        // Add click event listener
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Get the post text
            const postTextElement = postElement.querySelector(
                ".feed-shared-update-v2__description-text"
            );
            if (!postTextElement) {
                console.error("Could not find LinkedIn post text");
                return;
            }

            const postText = postTextElement.textContent;
            handleButtonClick(button, postText);
        });
    }

    // Handle AI Reply button click
    function handleButtonClick(button, postText) {
        // Create an iframe for the tone selector
        const iframe = document.createElement("iframe");
        iframe.className = "ai-reply-tone-selector-iframe";
        iframe.src = chrome.runtime.getURL("ui/tone-selector.html");
        iframe.style.cssText = `
      position: absolute;
      border: none;
      width: 250px;
      height: 280px;
      z-index: 9999;
      background: transparent;
    `;

        // Position the iframe near the button
        const buttonRect = button.getBoundingClientRect();
        iframe.style.left = `${buttonRect.left}px`;
        iframe.style.top = `${buttonRect.bottom + 5}px`;

        // Add to DOM
        document.body.appendChild(iframe);

        // Store the post text and iframe for later use
        const postData = {
            postText,
            iframe,
            platform: PLATFORM,
        };

        // Listen for messages from the iframe
        window.addEventListener("message", function handleToneSelection(event) {
            // Check if the message is from our iframe
            if (event.source === iframe.contentWindow) {
                const { action, tone } = event.data;

                if (action === "toneSelected") {
                    console.log(
                        `Selected tone: ${tone} for platform: ${PLATFORM}`
                    );
                    // Generate reply with the selected tone
                    generateReply(
                        postData.postText,
                        postData.platform,
                        tone,
                        iframe
                    );
                    // Remove the event listener
                    window.removeEventListener("message", handleToneSelection);
                }
            }
        });

        // Close when clicking outside
        document.addEventListener("click", function closeSelector(e) {
            if (e.target !== button && !iframe.contains(e.target)) {
                iframe.remove();
                document.removeEventListener("click", closeSelector);
            }
        });
    }

    // Generate reply using the background script
    function generateReply(postText, platform, tone, iframe) {
        console.log(`Generating reply for: ${platform} with tone: ${tone}`);

        // Create a loading message in the iframe
        const loadingMessage = `
            <html>
                <body style="font-family: sans-serif; padding: 20px; text-align: center;">
                    <div>Generating replies...</div>
                    <div style="margin-top: 10px;">Please wait...</div>
                </body>
            </html>
        `;

        // Set the loading message
        if (iframe.contentWindow) {
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(loadingMessage);
            iframe.contentWindow.document.close();
        }

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
                    displaySuggestions(response.suggestions, iframe);
                } else {
                    const errorMessage = `
                        <html>
                            <body style="font-family: sans-serif; padding: 20px; text-align: center;">
                                <div style="color: red;">
                                    Error: ${
                                        (response && response.error) ||
                                        "Failed to generate replies"
                                    }
                                </div>
                            </body>
                        </html>
                    `;

                    if (iframe.contentWindow) {
                        iframe.contentWindow.document.open();
                        iframe.contentWindow.document.write(errorMessage);
                        iframe.contentWindow.document.close();
                    }
                }
            }
        );
    }

    // Display reply suggestions
    function displaySuggestions(suggestions, iframe) {
        // Create HTML content for suggestions
        let suggestionsHtml = `
            <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            margin: 0;
                            padding: 15px;
                            background-color: white;
                        }
                        .title {
                            font-weight: bold;
                            margin-bottom: 12px;
                            color: #333;
                            font-size: 16px;
                        }
                        .suggestion {
                            padding: 10px;
                            margin: 8px 0;
                            background-color: #f8f8f8;
                            border-radius: 4px;
                            cursor: pointer;
                            border: 1px solid #e1e8ed;
                            transition: background-color 0.2s;
                        }
                        .suggestion:hover {
                            background-color: #e8f5fd;
                        }
                    </style>
                </head>
                <body>
                    <div class="title">Suggested Replies:</div>
        `;

        // Add each suggestion
        suggestions.forEach((suggestion, index) => {
            suggestionsHtml += `
                <div class="suggestion" data-index="${index}">${suggestion}</div>
            `;
        });

        // Close the HTML
        suggestionsHtml += `
                    <script>
                        // Add click event listeners to suggestions
                        document.querySelectorAll('.suggestion').forEach(element => {
                            element.addEventListener('click', () => {
                                const suggestion = element.textContent;
                                window.parent.postMessage({
                                    action: 'suggestionSelected',
                                    suggestion
                                }, '*');
                            });
                        });
                    </script>
                </body>
            </html>
        `;

        // Write the HTML to the iframe
        if (iframe.contentWindow) {
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(suggestionsHtml);
            iframe.contentWindow.document.close();

            // Add message listener for suggestion selection
            window.addEventListener(
                "message",
                function handleSuggestionSelection(event) {
                    if (
                        event.source === iframe.contentWindow &&
                        event.data.action === "suggestionSelected"
                    ) {
                        pasteReplyToLinkedIn(event.data.suggestion);
                        iframe.remove();
                        window.removeEventListener(
                            "message",
                            handleSuggestionSelection
                        );
                    }
                }
            );
        }
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
        const posts = document.querySelectorAll(".feed-shared-update-v2");
        posts.forEach((post) => {
            injectButtonIntoPost(post);
        });
    }

    // Observe for new posts being added to the DOM
    function observeForPosts() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a post or contains posts
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (
                                node.classList &&
                                node.classList.contains("feed-shared-update-v2")
                            ) {
                                injectButtonIntoPost(node);
                            } else {
                                const posts = node.querySelectorAll(
                                    ".feed-shared-update-v2"
                                );
                                posts.forEach((post) => {
                                    injectButtonIntoPost(post);
                                });
                            }
                        }
                    });
                }
            });
        });

        // Start observing the document with the configured parameters
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Initialize when the DOM is fully loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
