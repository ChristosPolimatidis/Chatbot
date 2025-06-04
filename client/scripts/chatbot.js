let currentSessionId;

document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    const sessions = getAllSessions();
    currentSessionId = sessions.length > 0 ? sessions[0].id : startNewSession();
    
    // Load the current session
    loadConversation(currentSessionId);
    renderHistoryList();


    // Function to add a message to the chat
    function addMessage(text, isUser, sessionId = currentSessionId) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', isUser ? 'user-message' : 'bot-message');
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-content">${text}</div>
            <div class="message-time">${timeString}</div>
        `;

        chatMessages.appendChild(messageDiv);
        addMessageToSession(sessionId, text, isUser);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to find the appropriate response
    async function getResponse(userInput) {
        try {
            const response = await fetch('http://localhost:5209/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userInput })
            });
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error fetching response:', error);
            return "Sorry, I couldn't connect to the server. Try again later!";
        }
    }

    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            // Show typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator bot-message';
            typingDiv.innerHTML = `🤖
                <span></span>
                <span></span>
                <span></span>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get and display response after a short delay
            setTimeout(async () => {
                typingDiv.remove();
                const response = await getResponse(message);
                addMessage(response, false);
                renderHistoryList();
            }, 1000);
        }
    });

    // Add event listeners for sample questions
    document.querySelectorAll('.sample-question').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const question = this.getAttribute('data-question') || this.textContent.trim();
            userInput.value = question;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });
});

window.askQuestion = function(question) {
    const userInput = document.getElementById('user-input');
    const chatForm = document.getElementById('chat-form');
    if (userInput && chatForm) {
        userInput.value = question;
        chatForm.dispatchEvent(new Event('submit'));
    }
};

window.loadConversation = function(sessionId) 
{
    const session = getSessionById(sessionId);
    if (!session) return;
    
    currentSessionId = sessionId;
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Highlight active session in history
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active');
        if (Number(item.dataset.sessionId) === sessionId) {
            item.classList.add('active');
        }
    });
    
    // Load messages
    session.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', message.isUser ? 'user-message' : 'bot-message');
        messageDiv.innerHTML = `
            <div class="message-content">${message.text}</div>
            <div class="message-time">${message.timestamp}</div>
        `;
        chatMessages.appendChild(messageDiv);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
};

window.startNewChat = function() {
    currentSessionId = startNewSession();
    loadConversation(currentSessionId);
    renderHistoryList();
};