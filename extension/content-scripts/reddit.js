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
    let isEnabled = true; // Default to enabled

    // Load initial state
    chrome.storage.local.get(["redditEnabled"], (result) => {
        isEnabled = result.redditEnabled !== false;
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
            message.platform === "reddit"
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
        console.log("AI Reply Assistant initialized for Reddit");

        // Add debug message to the page
        addDebugMessage("AI Reply Assistant initialized for Reddit");

        // Start observing for new posts/comments
        observeForPosts();

        // Initial scan for existing posts
        scanForPosts();

        // Force a scan after a short delay to catch any posts that might have loaded after initialization
        setTimeout(scanForPosts, 2000);
        setTimeout(scanForPosts, 5000);
    }

    // Add debug message to the page (for development only)
    function addDebugMessage(message) {
        const debugContainer = document.createElement("div");
        debugContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(255, 69, 0, 0.9);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        debugContainer.textContent = message;
        document.body.appendChild(debugContainer);

        // Remove after 5 seconds
        setTimeout(() => {
            debugContainer.remove();
        }, 5000);
    }

    // Create and inject the AI Reply button
    function createReplyButton() {
        // Don't create button if platform is disabled
        if (!isEnabled) return null;

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

        // Add debug info
        console.log("Attempting to inject button into:", postElement);

        // Find the post actions container - try multiple selectors for different Reddit layouts
        // Updated selectors for 2024 Reddit UI
        let actionsContainer =
            // Old Reddit
            postElement.querySelector(".entry .buttons") ||
            // New Reddit - try various selectors for different parts of the UI
            postElement.querySelector(
                "[data-testid='post-comment-header-actions']"
            ) ||
            postElement.querySelector(
                "[data-testid='comment-action-buttons']"
            ) ||
            postElement.querySelector(".comment-actions") ||
            postElement.querySelector(".post-actions") ||
            // Fallbacks for older Reddit versions
            postElement.querySelector("._1hwEKkB_38tIoal6fcdrt9") ||
            postElement.querySelector("._3-miAEojrCvx_4FQ8x3P-s") ||
            postElement.querySelector("._3KGXodqw1Rai1jVgOJjZYJ") ||
            postElement.querySelector("._1aTWHZoAHOJWj9gPX_xqbr") ||
            // Last resort - find any reply button and use its parent
            (
                postElement.querySelector("[data-click-id='reply']") ||
                postElement.querySelector(".reply-button") ||
                postElement.querySelector("button[aria-label*='Reply']")
            )?.parentElement;

        if (!actionsContainer) {
            // Try to find any action buttons container
            const possibleContainers = postElement.querySelectorAll(
                "div[role='group'], div.action-buttons, div.action-menu, div.actions, div.controls"
            );
            if (possibleContainers.length > 0) {
                // Use the last container (usually contains the action buttons)
                actionsContainer =
                    possibleContainers[possibleContainers.length - 1];
            } else {
                // Try to find any div that contains buttons
                const buttonContainers = Array.from(
                    postElement.querySelectorAll("div")
                ).filter(
                    (div) =>
                        div.querySelector("button") &&
                        !div.querySelector(`.${BUTTON_CLASS}`)
                );

                if (buttonContainers.length > 0) {
                    // Use the first container that has buttons
                    actionsContainer = buttonContainers[0];
                } else {
                    console.log(
                        "Could not find Reddit actions container",
                        postElement
                    );

                    // Last resort - create our own container and append it to the post element
                    actionsContainer = document.createElement("div");
                    actionsContainer.className = "ai-reply-actions-container";
                    actionsContainer.style.cssText = `
                        margin-top: 8px;
                        display: flex;
                        align-items: center;
                    `;

                    // Try to find a good place to insert our container
                    const possibleInsertPoints = [
                        postElement.querySelector("footer"),
                        postElement.querySelector(".footer"),
                        postElement.querySelector(".bottom"),
                        postElement.querySelector(".meta"),
                    ];

                    const insertPoint = possibleInsertPoints.find((el) => el);

                    if (insertPoint) {
                        insertPoint.appendChild(actionsContainer);
                    } else {
                        // Just append to the post element itself
                        postElement.appendChild(actionsContainer);
                    }
                }
            }
        }

        // Create and append the button
        const button = createReplyButton();
        if (!button) return; // Don't inject if button creation failed

        // Add debug info
        console.log(
            "Injecting button into actions container:",
            actionsContainer
        );

        actionsContainer.appendChild(button);

        // Add success debug message
        addDebugMessage("AI Reply button added to a post/comment!");

        // Add click event listener
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Get the post/comment text - try multiple selectors for different Reddit layouts
            // Updated selectors for 2024 Reddit UI
            let postTextElement =
                // Old Reddit
                postElement.querySelector(".md") ||
                // New Reddit - post content
                postElement.querySelector("[data-testid='post-content']") ||
                postElement.querySelector("[data-click-id='text']") ||
                postElement.querySelector("[data-click-id='body']") ||
                // New Reddit - comment content
                postElement.querySelector("[data-testid='comment']") ||
                // Fallbacks for older Reddit versions
                postElement.querySelector("._1qeIAgB0cPwnLhDF9XSiJM") ||
                postElement.querySelector("._3cjCphgls6DH-irkVaA0GM") ||
                postElement.querySelector("._292iotee39Lmt0MkQZ2hPV") ||
                // Last resort - find any paragraph in the post/comment
                postElement.querySelector("p");

            if (!postTextElement) {
                // If we still can't find the text element, use the post element itself
                console.log(
                    "Could not find specific text element, using post element text"
                );
                postTextElement = postElement;
            }

            // Extract text content, removing any extra whitespace
            const postText = postTextElement.textContent
                .trim()
                .replace(/\s+/g, " ");

            if (!postText) {
                console.error("Post text is empty");
                alert(
                    "Could not extract text from this post/comment. Please try another one."
                );
                return;
            }

            console.log("Extracted post text:", postText);
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
        suggestions.forEach((suggestion) => {
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
        // Find the comment textarea - updated selectors for 2024 Reddit UI
        const commentTextarea =
            // Try various selectors for the comment textarea
            document.querySelector(".usertext-edit textarea") || // Old Reddit
            document.querySelector(
                "[data-testid='comment-submission-form-richtext'] [contenteditable='true']"
            ) || // New Reddit rich text editor
            document.querySelector("[role='textbox']") || // Generic rich text editor
            document.querySelector("textarea[placeholder*='comment']") || // Generic comment textarea
            document.querySelector("textarea[placeholder*='reply']") || // Generic reply textarea
            document.querySelector("textarea.commentbox-textarea") || // Another possible selector
            document.querySelector("div[contenteditable='true']"); // Last resort - any editable div

        if (commentTextarea) {
            console.log("Found Reddit comment textarea:", commentTextarea);

            // Focus the textarea
            commentTextarea.focus();

            // Check if it's a contentEditable element
            if (commentTextarea.getAttribute("contenteditable") === "true") {
                // For contentEditable elements (rich text editors)
                try {
                    // Try to use the clipboard API first
                    navigator.clipboard
                        .writeText(replyText)
                        .then(() => {
                            // Set the innerHTML directly
                            commentTextarea.innerHTML = replyText;

                            // Also dispatch input and change events
                            commentTextarea.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                            commentTextarea.dispatchEvent(
                                new Event("change", { bubbles: true })
                            );

                            console.log(
                                "Successfully pasted text into contentEditable element"
                            );
                        })
                        .catch((err) => {
                            console.error("Clipboard API failed:", err);
                            // Fallback to direct setting
                            commentTextarea.innerHTML = replyText;
                            commentTextarea.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                        });
                } catch (e) {
                    console.error("Error pasting to contentEditable:", e);
                    // Last resort fallback
                    commentTextarea.innerHTML = replyText;
                }
            } else {
                // For regular textareas
                try {
                    // Modern approach - directly set the value
                    commentTextarea.value = replyText;

                    // Dispatch input event to trigger any listeners
                    const inputEvent = new Event("input", { bubbles: true });
                    commentTextarea.dispatchEvent(inputEvent);

                    // Also dispatch change event
                    const changeEvent = new Event("change", { bubbles: true });
                    commentTextarea.dispatchEvent(changeEvent);

                    console.log("Successfully pasted text into textarea");
                } catch (e) {
                    console.error("Error setting textarea value:", e);

                    // Fallback to clipboard API
                    navigator.clipboard
                        .writeText(replyText)
                        .then(() => {
                            // Try to set the value directly instead of using execCommand
                            commentTextarea.focus();
                            commentTextarea.value = replyText;
                            commentTextarea.dispatchEvent(
                                new Event("input", { bubbles: true })
                            );
                        })
                        .catch((err) => {
                            console.error("Clipboard API failed:", err);
                        });
                }
            }
        } else {
            console.error("Could not find Reddit comment textarea");

            // Try to find any reply button and click it first
            const replyButton =
                document.querySelector("[data-click-id='reply']") ||
                document.querySelector(".reply-button") ||
                document.querySelector("button[aria-label*='Reply']");

            if (replyButton) {
                console.log("Found reply button, clicking it first");
                replyButton.click();

                // Wait a moment for the textarea to appear
                setTimeout(() => {
                    // Try again to find the textarea
                    pasteReplyToReddit(replyText);
                }, 500);
            } else {
                // Show a user-friendly error message
                alert(
                    "Could not find the comment box. Please click 'Reply' on a comment first, then try again."
                );
            }
        }
    }

    // Scan for existing posts and comments
    function scanForPosts() {
        // Define selectors for both old and new Reddit (2024 updated)
        const selectors = [
            // Old Reddit
            ".thing.link",
            ".thing.comment",

            // New Reddit posts (2024)
            "[data-testid='post']",
            "[data-testid='post-container']",
            "shreddit-post",
            "div[data-click-id='body']", // Post body
            "div[data-click-id='text']", // Post text

            // New Reddit comments (2024)
            "[data-testid='comment']",
            "shreddit-comment",
            ".Comment",

            // Reddit comment containers
            ".top-level", // Top level comments
            ".comment-t1", // Comment type t1
            ".comment-t3", // Comment type t3

            // Reddit post containers
            ".post-container",
            ".post-content",

            // Fallbacks for older Reddit versions
            "._1oQyIsiPHYt6nx7VOmd1sz",
            "._1poyrkZ7g36PawDueRza-J",
            "._1qftyZQ2bhqP62lbPjoGAh",
            "._3tw__eCCe7j-epNCKGXUKk",
            "._1z5rdmX8TDr6mqwNv7A70U",

            // Generic post/comment containers
            "article",
            ".post",
            ".comment",
        ];

        // Combine all selectors
        const combinedSelector = selectors.join(", ");
        const elements = document.querySelectorAll(combinedSelector);

        console.log(
            `Found ${elements.length} Reddit posts/comments to inject buttons into`
        );

        // Add debug message
        if (elements.length > 0) {
            addDebugMessage(`Found ${elements.length} Reddit posts/comments`);
        } else {
            addDebugMessage(
                "No Reddit posts/comments found with standard selectors"
            );

            // Try a more direct approach - find the main post
            const mainPost =
                document.querySelector("div[data-test-id='post-content']") ||
                document.querySelector("div.post") ||
                document.querySelector("div[role='main']");

            if (mainPost) {
                addDebugMessage("Found main post, injecting button");
                injectButtonIntoPost(mainPost);
            }
        }

        // Process in batches to avoid blocking the main thread
        const batchSize = 10;
        for (let i = 0; i < elements.length; i += batchSize) {
            setTimeout(() => {
                const batch = Array.from(elements).slice(i, i + batchSize);
                batch.forEach((element) => {
                    injectButtonIntoPost(element);
                });
            }, 0);
        }

        // Direct approach for the specific Reddit post we're looking at
        // This is a more targeted approach for the specific post URL in the PRD
        if (window.location.href.includes("/comments/1keauuw/")) {
            // We're on the specific post mentioned in the PRD
            addDebugMessage(
                "Detected specific post from PRD, using direct injection"
            );

            // Try to find the main post content
            const mainPostContent =
                document.querySelector("div[data-click-id='text']") ||
                document.querySelector("div[data-click-id='body']");

            if (mainPostContent) {
                // Find the closest container that might have action buttons
                let parent = mainPostContent.parentElement;

                // Go up a few levels to find a suitable container
                for (let i = 0; i < 5; i++) {
                    if (!parent) break;

                    // Try to inject at this level
                    injectButtonIntoPost(parent);

                    // Move up one level
                    parent = parent.parentElement;
                }
            }

            // Also try to find all comments
            const comments = document.querySelectorAll(
                "div[data-testid='comment']"
            );
            if (comments.length > 0) {
                addDebugMessage(
                    `Found ${comments.length} comments with direct selector`
                );
                comments.forEach((comment) => {
                    injectButtonIntoPost(comment);
                });
            }
        }

        // Also look for any elements with "comment" or "post" in their ID or class
        // This is a more aggressive approach that might find elements the selectors missed
        const allElements = document.querySelectorAll("div, article");
        const potentialElements = Array.from(allElements).filter((el) => {
            if (!el.id && !el.className) return false;
            const idStr = el.id ? el.id.toLowerCase() : "";
            const classStr =
                typeof el.className === "string"
                    ? el.className.toLowerCase()
                    : "";
            return (
                (idStr.includes("post") ||
                    idStr.includes("comment") ||
                    classStr.includes("post") ||
                    classStr.includes("comment")) &&
                !el.classList.contains(BUTTON_CLASS)
            );
        });

        if (potentialElements.length > 0) {
            console.log(
                `Found ${potentialElements.length} potential post/comment elements by ID/class`
            );
            addDebugMessage(
                `Found ${potentialElements.length} potential elements by ID/class`
            );

            // Process these in batches too
            for (let i = 0; i < potentialElements.length; i += batchSize) {
                setTimeout(() => {
                    const batch = potentialElements.slice(i, i + batchSize);
                    batch.forEach((element) => {
                        // Only inject if it looks like a post/comment (has text content and action buttons)
                        if (
                            element.textContent &&
                            (element.querySelector("button") ||
                                element.querySelector('a[role="button"]'))
                        ) {
                            injectButtonIntoPost(element);
                        }
                    });
                }, 100);
            }
        }

        // Last resort - try to find any elements with reply buttons and inject our button next to them
        const replyButtons = document.querySelectorAll(
            "button[aria-label*='Reply'], button[data-click-id='reply'], a.reply-button"
        );

        if (replyButtons.length > 0) {
            console.log(`Found ${replyButtons.length} reply buttons`);
            addDebugMessage(`Found ${replyButtons.length} reply buttons`);

            replyButtons.forEach((replyButton) => {
                // Find the parent container that might be a comment
                let parent = replyButton.parentElement;
                for (let i = 0; i < 5; i++) {
                    if (!parent) break;
                    injectButtonIntoPost(parent);
                    parent = parent.parentElement;
                }
            });
        }
    }

    // Observe for new posts/comments being added to the DOM
    function observeForPosts() {
        // Define selectors for both old and new Reddit (2024 updated)
        const selectors = [
            // Old Reddit
            ".thing.link",
            ".thing.comment",

            // New Reddit posts (2024)
            "[data-testid='post']",
            "[data-testid='post-container']",
            "shreddit-post",

            // New Reddit comments (2024)
            "[data-testid='comment']",
            "shreddit-comment",
            ".Comment",

            // Fallbacks for older Reddit versions
            "._1oQyIsiPHYt6nx7VOmd1sz",
            "._1poyrkZ7g36PawDueRza-J",
            "._1qftyZQ2bhqP62lbPjoGAh",
            "._3tw__eCCe7j-epNCKGXUKk",
            "._1z5rdmX8TDr6mqwNv7A70U",

            // Generic post/comment containers
            "article",
            ".post",
            ".comment",
        ];

        // Extract class names and attribute selectors for matching
        const classAndAttrSelectors = selectors
            .map((selector) => {
                if (selector.startsWith(".")) {
                    return { type: "class", value: selector.substring(1) };
                } else if (selector.startsWith("[data-testid=")) {
                    return {
                        type: "attr",
                        attr: "data-testid",
                        value: selector.match(
                            /\[data-testid=['"]([^'"]+)['"]\]/
                        )[1],
                    };
                } else if (selector.includes("[")) {
                    // Generic attribute selector handling
                    const match = selector.match(
                        /\[([^=]+)=['"]([^'"]+)['"]\]/
                    );
                    if (match) {
                        return {
                            type: "attr",
                            attr: match[1],
                            value: match[2],
                        };
                    }
                }
                // Element selector (like "article" or "shreddit-post")
                return { type: "tag", value: selector };
            })
            .filter(Boolean);

        const observer = new MutationObserver((mutations) => {
            let shouldScan = false;

            mutations.forEach((mutation) => {
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a post/comment or contains posts/comments
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if node matches any of our selectors
                            let matches = false;

                            // Check tag name
                            for (const selector of classAndAttrSelectors) {
                                if (
                                    selector.type === "tag" &&
                                    node.tagName &&
                                    node.tagName.toLowerCase() ===
                                        selector.value.toLowerCase()
                                ) {
                                    matches = true;
                                    break;
                                }

                                // Check class
                                if (
                                    selector.type === "class" &&
                                    node.classList &&
                                    node.classList.contains(selector.value)
                                ) {
                                    matches = true;
                                    break;
                                }

                                // Check attribute
                                if (
                                    selector.type === "attr" &&
                                    node.getAttribute &&
                                    node.getAttribute(selector.attr) ===
                                        selector.value
                                ) {
                                    matches = true;
                                    break;
                                }
                            }

                            if (matches) {
                                injectButtonIntoPost(node);
                                shouldScan = true;
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

                            // Also check if this might be a post/comment by ID or class name
                            if (node.id || node.className) {
                                const idStr = node.id
                                    ? node.id.toLowerCase()
                                    : "";
                                const classStr =
                                    typeof node.className === "string"
                                        ? node.className.toLowerCase()
                                        : "";
                                if (
                                    (idStr.includes("post") ||
                                        idStr.includes("comment") ||
                                        classStr.includes("post") ||
                                        classStr.includes("comment")) &&
                                    !node.classList.contains(BUTTON_CLASS)
                                ) {
                                    // Only inject if it looks like a post/comment (has text content and action buttons)
                                    if (
                                        node.textContent &&
                                        (node.querySelector("button") ||
                                            node.querySelector(
                                                'a[role="button"]'
                                            ))
                                    ) {
                                        injectButtonIntoPost(node);
                                        shouldScan = true;
                                    }
                                }
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

        // Also periodically scan for new posts/comments
        setInterval(scanForPosts, 5000);
    }

    // Initialize when the DOM is fully loaded
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
