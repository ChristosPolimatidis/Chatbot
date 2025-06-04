const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5209;

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Chatbot responses
const resumeResponses = 
{
    'hi|hello|hello chat|hello chris assistant':
        "Hi👋🏻, I am Chris assistant. I am capable of answering some basic questions about my maker's resume, feel free to ask me anything",
    'about yourself|who are you|tell me about': 
        "I'm Christos, a passionate developer with expertise in web technologies and AI applications.",
    'projects|worked on|experience': 
        "I've developed several projects💼 including a weather app☁️, personal budgeting tool🔧, and a RESTful API for task management.",
    'skills|skill|expertise|technologies': 
        "My technical skills ⚙️ include JavaScript, Python, React, Node.js, and SQL.",
    'study|education|university|degree': 
        "I graduated XYZ University🏢 with a Computer Science degree.",
    'hobbies|interests|free time': 
        "I enjoy hiking🧗🏻‍♂️, reading science fiction📔, and working on open-source projects👨🏻‍💻.",
    'contact|reach you':
        "I have both an email📧 and a phone number📱, which one do you prefer?",
    'email': 
        "📧 You can reach me at polimatidischris@gmail.com or connect on LinkedIn.",
    'phone':
        "📱 You can call me at 699 347 5428 or connect on LinkedIn.",
    'purpose|your purpose':
        "I was created by Christos Polimatidis as an Interview assignment given to him for an internship position at Conveos",    
    'default': 
        "I'm sorry, I didn't understand that question. Could you ask about my skills, projects, or education?"
    };

app.post('/chat', (req, res) => 
{
    const userInput = req.body.prompt.toLowerCase().replace(/[^\w\s]/g, '');
    let response = resumeResponses.default;

    // Exact matching logic that preserves my format
    for (const [keywords, answer] of Object.entries(resumeResponses)) {
        const keywordList = keywords.toLowerCase().split('|');
        
        // Check if any exact keyword exists in the input
        if (keywordList.some(keyword => {
            return (
                userInput.includes(keyword) ||
                new RegExp(`\\b${keyword}\\b`).test(userInput)
            );
        })) {
            response = answer;
            break;
        }
    }

    res.json({ response });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});