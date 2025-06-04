let conversationSessions = JSON.parse(localStorage.getItem('conversationSessions')) || [];

function saveSessions() {
    localStorage.setItem('conversationSessions', JSON.stringify(conversationSessions));
}

function startNewSession() {
    const newSession = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        messages: [],
        lastUpdated: new Date().getTime()
    };
    conversationSessions.push(newSession);
    saveSessions();
    return newSession.id;
}

function addMessageToSession(sessionId, message, isUser) {
    const session = conversationSessions.find(s => s.id === sessionId);
    if (session) {
        session.messages.push({
            text: message,
            isUser,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        session.lastUpdated = new Date().getTime();
        saveSessions();
    }
}

function getAllSessions() {
    // Sort by lastUpdated
    return [...conversationSessions]
        .sort((a, b) => b.lastUpdated - a.lastUpdated)
        .map(session => ({
            id: session.id,
            timestamp: session.timestamp,
            preview: session.messages.length > 0 
                ? session.messages[0].text.substring(0, 30) + (session.messages[0].text.length > 30 ? '...' : '')
                : 'New conversation'
        }));
}

function getSessionById(sessionId) {
    return conversationSessions.find(s => s.id === sessionId);
}

function renderHistoryList() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    const sessions = getAllSessions();
    historyList.innerHTML = '';
    
    sessions.forEach(session => {
        const item = document.createElement('div');
        item.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
        item.dataset.sessionId = session.id;
        item.innerHTML = `
            <div class="history-content">
                <div class="history-preview">${session.preview}</div>
                <div class="history-time">${session.timestamp}</div>
            </div>
            <button class="delete-btn" onclick="deleteSession(${session.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        item.addEventListener('click', (e) => {
            // Don't load conversation if clicking the delete button
            if (!e.target.closest('.delete-btn')) {
                loadConversation(session.id);
            }
        });
        historyList.appendChild(item);
    });
}

function deleteSession(sessionId) {
    conversationSessions = conversationSessions.filter(s => s.id !== sessionId);
    saveSessions();
    
    // If I deleted the current session, create a new one
    if (sessionId === currentSessionId) {
        currentSessionId = startNewSession();
        loadConversation(currentSessionId);
    }
    
    renderHistoryList();
}

window.deleteSession = deleteSession;