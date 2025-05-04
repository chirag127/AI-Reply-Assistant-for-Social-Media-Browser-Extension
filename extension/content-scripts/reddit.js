// AI Reply Assistant - Reddit Content Script
// Handles DOM injection and interaction for Reddit

(function () {
    // Configuration
    const PLATFORM = "Reddit";
    const BUTTON_CLASS = "ai-reply-button-reddit";
    const TONES = [
        "Friendly",
        "Professional",
        "Witty",
        "Supportive",
        "Sarcastic",
    ];

    // Main initialization
    function init() {
        console.log("AI Reply Assistant initialized for Reddit");

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
      background-color: #FF4500;
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
            button.style.backgroundColor = "#cc3700";
        });

        button.addEventListener("mouseout", () => {
            button.style.backgroundColor = "#FF4500";
        });

        return button;
    }

    // Inject AI Reply button into Reddit post/comment actions
    function injectButtonIntoPost(postElement) {
        // Check if button already exists
        if (postElement.querySelector(`.${BUTTON_CLASS}`)) {
            return;
        }

        // Find the post actions container - try multiple selectors for different Reddit layouts
        const actionsContainer =
            postElement.querySelector(".entry .buttons") || // Old Reddit
            postElement.querySelector("._1hwEKkB_38tIoal6fcdrt9") || // New Reddit comments
            postElement.querySelector("._3-miAEojrCvx_4FQ8x3P-s") || // New Reddit posts
            postElement.querySelector("._3KGXodqw1Rai1jVgOJjZYJ") || // Another New Reddit container
            postElement.querySelector("._1aTWHZoAHOJWj9gPX_xqbr"); // Another New Reddit container

        if (!actionsContainer) {
            console.log("Could not find Reddit actions container", postElement);
            return;
        }

        // Create and append the button
        const button = createReplyButton();
        actionsContainer.appendChild(button);

        // Add click event listener
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Get the post/comment text - try multiple selectors for different Reddit layouts
            const postTextElement =
                postElement.querySelector(".md") || // Old Reddit
                postElement.querySelector("._1qeIAgB0cPwnLhDF9XSiJM") || // New Reddit post
                postElement.querySelector("._3cjCphgls6DH-irkVaA0GM") || // New Reddit comment
                postElement.querySelector("._292iotee39Lmt0MkQZ2hPV"); // Another New Reddit text container

            if (!postTextElement) {
                console.error("Could not find Reddit post/comment text");
                return;
            }

            const postText = postTextElement.textContent;
            handleButtonClick(button, postText);
        });
    }

    // Handle AI Reply button click
    function handleButtonClick(button, postText) {
        console.log("AI Reply button clicked for Reddit");

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
                pasteReplyToReddit(suggestion);
                container.remove();
            });

            container.appendChild(suggestionElement);
        });
    }

    // Paste the selected reply into Reddit's reply box
    function pasteReplyToReddit(replyText) {
        // Find the comment textarea
        const commentTextarea = document.querySelector(
            ".usertext-edit textarea"
        );

        if (commentTextarea) {
            // Focus the textarea
            commentTextarea.focus();

            // Use execCommand for older browsers
            if (document.execCommand) {
                // Create a temporary textarea to copy from
                const tempTextarea = document.createElement("textarea");
                tempTextarea.value = replyText;
                document.body.appendChild(tempTextarea);
                tempTextarea.select();
                document.execCommand("copy");
                document.body.removeChild(tempTextarea);

                // Paste into the textarea
                document.execCommand("paste");
            } else {
                // Use clipboard API for modern browsers
                navigator.clipboard.writeText(replyText).then(() => {
                    // Set the value directly for Reddit
                    commentTextarea.value = replyText;

                    // Dispatch input event to trigger any listeners
                    const inputEvent = new Event("input", { bubbles: true });
                    commentTextarea.dispatchEvent(inputEvent);
                });
            }
        } else {
            console.error("Could not find Reddit comment textarea");
        }
    }

    // Scan for existing posts and comments
    function scanForPosts() {
        // Define selectors for both old and new Reddit
        const selectors = [
            // Old Reddit
            ".thing.link",
            ".thing.comment",
            // New Reddit posts
            "._1oQyIsiPHYt6nx7VOmd1sz",
            "._1poyrkZ7g36PawDueRza-J",
            "._1qftyZQ2bhqP62lbPjoGAh",
            // New Reddit comments
            "._3tw__eCCe7j-epNCKGXUKk",
            "._1z5rdmX8TDr6mqwNv7A70U",
            ".Comment",
        ];

        // Combine all selectors
        const combinedSelector = selectors.join(", ");
        const elements = document.querySelectorAll(combinedSelector);

        console.log(
            `Found ${elements.length} Reddit posts/comments to inject buttons into`
        );

        elements.forEach((element) => {
            injectButtonIntoPost(element);
        });
    }

    // Observe for new posts/comments being added to the DOM
    function observeForPosts() {
        // Define selectors for both old and new Reddit
        const selectors = [
            // Old Reddit
            ".thing.link",
            ".thing.comment",
            // New Reddit posts
            "._1oQyIsiPHYt6nx7VOmd1sz",
            "._1poyrkZ7g36PawDueRza-J",
            "._1qftyZQ2bhqP62lbPjoGAh",
            // New Reddit comments
            "._3tw__eCCe7j-epNCKGXUKk",
            "._1z5rdmX8TDr6mqwNv7A70U",
            ".Comment",
        ];

        // Extract class names without the dots
        const classNames = selectors.map((selector) =>
            selector.startsWith(".") ? selector.substring(1) : selector
        );

        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a post/comment or contains posts/comments
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if node matches any of our class names
                            if (node.classList) {
                                for (const className of classNames) {
                                    if (className.includes(".")) {
                                        // Handle complex selectors like '.thing.comment'
                                        const parts = className.split(".");
                                        let matches = true;
                                        for (const part of parts) {
                                            if (
                                                part &&
                                                !node.classList.contains(part)
                                            ) {
                                                matches = false;
                                                break;
                                            }
                                        }
                                        if (matches) {
                                            injectButtonIntoPost(node);
                                            shouldScan = true;
                                            break;
                                        }
                                    } else if (
                                        node.classList.contains(className)
                                    ) {
                                        injectButtonIntoPost(node);
                                        shouldScan = true;
                                        break;
                                    }
                                }
                            }

                            // Check for posts/comments inside the added node
                            const combinedSelector = selectors.join(", ");
                            const elements =
                                node.querySelectorAll(combinedSelector);
                            if (elements.length > 0) {
                                elements.forEach((element) => {
                                    injectButtonIntoPost(element);
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
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
