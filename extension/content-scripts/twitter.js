// AI Reply Assistant - Twitter Content Script
// Handles DOM injection and interaction for Twitter

(function() {
  // Configuration
  const PLATFORM = 'Twitter';
  const BUTTON_CLASS = 'ai-reply-button-twitter';
  const TONES = ['Friendly', 'Professional', 'Witty', 'Supportive', 'Sarcastic'];
  
  // Main initialization
  function init() {
    console.log('AI Reply Assistant initialized for Twitter');
    
    // Start observing for new tweets/posts
    observeForPosts();
    
    // Initial scan for existing posts
    scanForPosts();
  }
  
  // Create and inject the AI Reply button
  function createReplyButton() {
    const button = document.createElement('button');
    button.className = BUTTON_CLASS;
    button.innerHTML = '💬 AI Reply';
    button.style.cssText = `
      background-color: #1DA1F2;
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
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#0c85d0';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#1DA1F2';
    });
    
    return button;
  }
  
  // Inject AI Reply button into tweet actions
  function injectButtonIntoPost(postElement) {
    // Check if button already exists
    if (postElement.querySelector(`.${BUTTON_CLASS}`)) {
      return;
    }
    
    // Find the tweet actions container
    const actionsContainer = postElement.querySelector('[role="group"]');
    if (!actionsContainer) return;
    
    // Create and append the button
    const button = createReplyButton();
    actionsContainer.appendChild(button);
    
    // Add click event listener
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get the tweet text
      const tweetTextElement = postElement.querySelector('[data-testid="tweetText"]');
      if (!tweetTextElement) {
        console.error('Could not find tweet text');
        return;
      }
      
      const postText = tweetTextElement.textContent;
      handleButtonClick(button, postText);
    });
  }
  
  // Handle AI Reply button click
  function handleButtonClick(button, postText) {
    // Create tone selector UI
    const toneSelector = createToneSelector(postText);
    
    // Position the tone selector near the button
    const buttonRect = button.getBoundingClientRect();
    toneSelector.style.position = 'absolute';
    toneSelector.style.left = `${buttonRect.left}px`;
    toneSelector.style.top = `${buttonRect.bottom + 5}px`;
    toneSelector.style.zIndex = '9999';
    
    // Add to DOM
    document.body.appendChild(toneSelector);
    
    // Close when clicking outside
    document.addEventListener('click', function closeSelector(e) {
      if (!toneSelector.contains(e.target) && e.target !== button) {
        toneSelector.remove();
        document.removeEventListener('click', closeSelector);
      }
    });
  }
  
  // Create tone selector UI
  function createToneSelector(postText) {
    const container = document.createElement('div');
    container.className = 'ai-reply-tone-selector';
    container.style.cssText = `
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      padding: 12px;
      width: 200px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Select Tone:';
    title.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    `;
    container.appendChild(title);
    
    // Add tone buttons
    TONES.forEach(tone => {
      const toneButton = document.createElement('button');
      toneButton.textContent = tone;
      toneButton.style.cssText = `
        display: block;
        width: 100%;
        text-align: left;
        padding: 8px;
        margin: 4px 0;
        border: none;
        background-color: #f0f0f0;
        border-radius: 4px;
        cursor: pointer;
      `;
      
      toneButton.addEventListener('mouseover', () => {
        toneButton.style.backgroundColor = '#e0e0e0';
      });
      
      toneButton.addEventListener('mouseout', () => {
        toneButton.style.backgroundColor = '#f0f0f0';
      });
      
      toneButton.addEventListener('click', () => {
        generateReply(postText, PLATFORM, tone, container);
      });
      
      container.appendChild(toneButton);
    });
    
    return container;
  }
  
  // Generate reply using the background script
  function generateReply(postText, platform, tone, container) {
    // Show loading state
    container.innerHTML = '<div style="text-align: center; padding: 20px;">Generating replies...</div>';
    
    // Send message to background script
    chrome.runtime.sendMessage(
      {
        action: 'generateReply',
        postText,
        platform,
        tone
      },
      response => {
        if (response.success) {
          displaySuggestions(response.suggestions, container);
        } else {
          container.innerHTML = `<div style="color: red; padding: 10px;">Error: ${response.error || 'Failed to generate replies'}</div>`;
        }
      }
    );
  }
  
  // Display reply suggestions
  function displaySuggestions(suggestions, container) {
    container.innerHTML = '';
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Suggested Replies:';
    title.style.cssText = `
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    `;
    container.appendChild(title);
    
    // Add each suggestion
    suggestions.forEach(suggestion => {
      const suggestionElement = document.createElement('div');
      suggestionElement.textContent = suggestion;
      suggestionElement.style.cssText = `
        padding: 8px;
        margin: 4px 0;
        background-color: #f8f8f8;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid #e1e8ed;
      `;
      
      suggestionElement.addEventListener('mouseover', () => {
        suggestionElement.style.backgroundColor = '#e8f5fd';
      });
      
      suggestionElement.addEventListener('mouseout', () => {
        suggestionElement.style.backgroundColor = '#f8f8f8';
      });
      
      suggestionElement.addEventListener('click', () => {
        pasteReplyToTwitter(suggestion);
        container.remove();
      });
      
      container.appendChild(suggestionElement);
    });
  }
  
  // Paste the selected reply into Twitter's reply box
  function pasteReplyToTwitter(replyText) {
    // Find the reply input field
    const replyInput = document.querySelector('[data-testid="tweetTextarea_0"]');
    
    if (replyInput) {
      // Focus the input
      replyInput.focus();
      
      // Use execCommand for older browsers
      if (document.execCommand) {
        // Create a temporary textarea to copy from
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = replyText;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        
        // Paste into the input
        document.execCommand('paste');
      } else {
        // Use clipboard API for modern browsers
        navigator.clipboard.writeText(replyText).then(() => {
          // Simulate paste event
          const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: new DataTransfer(),
            bubbles: true
          });
          Object.defineProperty(pasteEvent.clipboardData, 'getData', {
            value: () => replyText
          });
          replyInput.dispatchEvent(pasteEvent);
        });
      }
    } else {
      console.error('Could not find Twitter reply input');
    }
  }
  
  // Scan for existing posts
  function scanForPosts() {
    const posts = document.querySelectorAll('[data-testid="tweet"]');
    posts.forEach(post => {
      injectButtonIntoPost(post);
    });
  }
  
  // Observe for new posts being added to the DOM
  function observeForPosts() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            // Check if the added node is a tweet or contains tweets
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.getAttribute('data-testid') === 'tweet') {
                injectButtonIntoPost(node);
              } else {
                const tweets = node.querySelectorAll('[data-testid="tweet"]');
                tweets.forEach(tweet => {
                  injectButtonIntoPost(tweet);
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
