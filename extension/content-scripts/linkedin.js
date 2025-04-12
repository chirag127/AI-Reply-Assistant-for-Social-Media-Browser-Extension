// AI Reply Assistant - LinkedIn Content Script
// Handles DOM injection and interaction for LinkedIn

(function() {
  // Configuration
  const PLATFORM = 'LinkedIn';
  const BUTTON_CLASS = 'ai-reply-button-linkedin';
  const TONES = ['Friendly', 'Professional', 'Witty', 'Supportive', 'Sarcastic'];
  
  // Main initialization
  function init() {
    console.log('AI Reply Assistant initialized for LinkedIn');
    
    // Start observing for new posts/comments
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
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#004182';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#0a66c2';
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
    const actionsContainer = postElement.querySelector('.feed-shared-social-actions');
    if (!actionsContainer) return;
    
    // Create and append the button
    const button = createReplyButton();
    actionsContainer.appendChild(button);
    
    // Add click event listener
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Get the post text
      const postTextElement = postElement.querySelector('.feed-shared-update-v2__description-text');
      if (!postTextElement) {
        console.error('Could not find LinkedIn post text');
        return;
      }
      
      const postText = postTextElement.textContent;
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
        pasteReplyToLinkedIn(suggestion);
        container.remove();
      });
      
      container.appendChild(suggestionElement);
    });
  }
  
  // Paste the selected reply into LinkedIn's reply box
  function pasteReplyToLinkedIn(replyText) {
    // Find the comment input field
    const commentInput = document.querySelector('.comments-comment-box__text-input');
    
    if (commentInput) {
      // Focus the input
      commentInput.focus();
      
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
          commentInput.dispatchEvent(pasteEvent);
        });
      }
    } else {
      console.error('Could not find LinkedIn comment input');
    }
  }
  
  // Scan for existing posts
  function scanForPosts() {
    const posts = document.querySelectorAll('.feed-shared-update-v2');
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
            // Check if the added node is a post or contains posts
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains('feed-shared-update-v2')) {
                injectButtonIntoPost(node);
              } else {
                const posts = node.querySelectorAll('.feed-shared-update-v2');
                posts.forEach(post => {
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
