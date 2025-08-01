console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
   button.style.marginRight = '8px';
   button.innerHTML = 'AI Reply';
   button.setAttribute('role','button');
   button.setAttribute('data-tooltip','Generate AI Reply');
   return button;
}

// Add this function after createAIButton()
function createToneSelector() {
    const tones = [
        'Professional',
        'Friendly',
        'Formal',
        'Casual',
        'Enthusiastic',
        'Empathetic',
        'Confident',
        'Diplomatic',
        'Persuasive',
        'Urgent',
        'Appreciative', 
        'Technical',
        'Supportive'
    ];
    const select = document.createElement('select');
    select.className = 'tone-selector T-I J-J5-Ji';
    
    // Updated styling to match Gmail's blue button theme
    select.style.cssText = `
        margin-right: 8px;
        padding: 0 12px;
        border-radius: 4px;
        border: 1px solid #c6c6c6;
        background-color: #fff;
        font-size: 13px;
        color: #444;
        cursor: pointer;
        min-width: 120px;
        height: 32px;
        line-height: 32px;
        -webkit-appearance: menulist !important;
        -moz-appearance: menulist !important;
        appearance: menulist !important;
        display: inline-flex !important;
        align-items: center;
        font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
        transition: box-shadow .28s cubic-bezier(.4,0,.2,1);
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149);
        background-image: none;
    `;

    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = 'Select Tone';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    // Updated option styling
    tones.forEach(tone => {
        const option = document.createElement('option');
        option.value = tone.toLowerCase();
        option.text = tone;
        option.style.cssText = `
            padding: 8px;
            background-color: #fff;
            color: #444;
            font-family: 'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;
        `;
        select.appendChild(option);
    });

    // Enhanced hover and focus effects
    select.addEventListener('mouseover', () => {
        select.style.backgroundColor = '#f6f6f6';
        select.style.borderColor = '#c6c6c6';
        select.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149)';
    });
    
    select.addEventListener('mouseout', () => {
        select.style.backgroundColor = '#fff';
        select.style.borderColor = '#c6c6c6';
        select.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149)';
    });

    select.addEventListener('focus', () => {
        select.style.borderColor = '#4285f4';
        select.style.boxShadow = '0 1px 2px 0 rgba(66,133,244,0.302), 0 1px 3px 1px rgba(66,133,244,0.149)';
    });

    select.addEventListener('blur', () => {
        select.style.borderColor = '#c6c6c6';
        select.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.302), 0 1px 3px 1px rgba(60,64,67,0.149)';
    });

    // Ensure the dropdown is interactive
    select.addEventListener('change', (e) => {
        console.log('Selected tone:', e.target.value);
    });

    return select;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }        
    }
    return '';
}


function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
        return null;
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    const existingSelector = document.querySelector('.tone-selector');
    if (existingButton) existingButton.remove();
    if (existingSelector) existingSelector.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, creating AI button and tone selector");
    const button = createAIButton();
    const toneSelector = createToneSelector();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const selectedTone = toneSelector.value;
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    // Insert both elements
    toolbar.insertBefore(toneSelector, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});


observer.observe(document.body, {
    childList: true,
    subtree: true
});
