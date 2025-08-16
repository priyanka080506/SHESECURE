// AI Guide functionality
class AIGuide {
    constructor() {
        this.chatHistory = [];
        this.isTyping = false;
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        const chatInput = document.getElementById('ai-chat-input');
        const sendButton = document.getElementById('send-ai-message');
        const chatMessages = document.getElementById('ai-chat-messages');

        if (sendButton) {
            sendButton.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Show typing indicator
            chatInput.addEventListener('input', () => {
                this.handleTyping();
            });
        }

        // Quick action buttons
        this.setupQuickActions();
    }

    setupQuickActions() {
        // Add quick action buttons to the chat interface
        const quickActionsHTML = `
            <div class="quick-actions">
                <button class="quick-action-btn" data-action="safety-tips">
                    <i class="fas fa-shield-alt"></i> Safety Tips
                </button>
                <button class="quick-action-btn" data-action="emergency-help">
                    <i class="fas fa-exclamation-triangle"></i> Emergency Help
                </button>
                <button class="quick-action-btn" data-action="route-advice">
                    <i class="fas fa-route"></i> Route Advice
                </button>
                <button class="quick-action-btn" data-action="self-defense">
                    <i class="fas fa-fist-raised"></i> Self Defense
                </button>
            </div>
        `;

        const chatContainer = document.querySelector('.ai-chat-container');
        if (chatContainer && !chatContainer.querySelector('.quick-actions')) {
            chatContainer.insertAdjacentHTML('beforeend', quickActionsHTML);
            
            // Add event listeners to quick action buttons
            document.querySelectorAll('.quick-action-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const action = e.currentTarget.dataset.action;
                    this.handleQuickAction(action);
                });
            });
        }
    }

    handleQuickAction(action) {
        const quickMessages = {
            'safety-tips': 'Can you give me some general safety tips?',
            'emergency-help': 'What should I do in an emergency situation?',
            'route-advice': 'How can I plan a safe route?',
            'self-defense': 'Tell me about self-defense techniques'
        };

        const message = quickMessages[action];
        if (message) {
            document.getElementById('ai-chat-input').value = message;
            this.sendMessage();
        }
    }

    async sendMessage() {
        const chatInput = document.getElementById('ai-chat-input');
        const message = chatInput.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Generate AI response
            const response = await this.generateResponse(message);
            
            // Remove typing indicator and add AI response
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            
            // Save chat history
            this.saveChatHistory();
            
        } catch (error) {
            console.error('Error generating AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('I apologize, but I\'m having trouble responding right now. Please try again or contact emergency services if this is urgent.', 'ai');
        }
    }

    addMessage(content, sender) {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add to chat history
        this.chatHistory.push({
            content,
            sender,
            timestamp: new Date().toISOString()
        });

        // Animate message appearance
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
    }

    formatMessage(content) {
        // Format message with basic markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isTyping = false;
    }

    async generateResponse(userMessage) {
        // Simulate AI thinking time
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const message = userMessage.toLowerCase();
        
        // Context-aware responses based on user input
        if (this.containsKeywords(message, ['emergency', 'help', 'danger', 'unsafe', 'scared', 'attack'])) {
            return this.getEmergencyResponse(message);
        }
        
        if (this.containsKeywords(message, ['route', 'path', 'walk', 'go', 'travel', 'navigation'])) {
            return this.getRouteResponse(message);
        }
        
        if (this.containsKeywords(message, ['self defense', 'protect', 'fight', 'defend', 'martial arts', 'karate'])) {
            return this.getSelfDefenseResponse(message);
        }
        
        if (this.containsKeywords(message, ['safety tips', 'advice', 'precaution', 'careful', 'aware'])) {
            return this.getSafetyTipsResponse(message);
        }
        
        if (this.containsKeywords(message, ['night', 'dark', 'evening', 'late'])) {
            return this.getNightSafetyResponse(message);
        }
        
        if (this.containsKeywords(message, ['report', 'incident', 'harassment', 'suspicious'])) {
            return this.getReportingResponse(message);
        }
        
        if (this.containsKeywords(message, ['location', 'share', 'gps', 'where'])) {
            return this.getLocationResponse(message);
        }
        
        if (this.containsKeywords(message, ['contact', 'family', 'friend', 'emergency contact'])) {
            return this.getContactResponse(message);
        }

        if (this.containsKeywords(message, ['app', 'feature', 'how to', 'use', 'help'])) {
            return this.getAppHelpResponse(message);
        }

        // General conversation
        return this.getGeneralResponse(message);
    }

    containsKeywords(message, keywords) {
        return keywords.some(keyword => message.includes(keyword));
    }

    getEmergencyResponse(message) {
        const responses = [
            `🚨 **Emergency Situation Detected** 🚨

If you're in immediate danger:
1. **Call 911** immediately
2. Use the **Emergency Button** in the top right corner
3. **Share your location** with trusted contacts
4. Get to a **safe, public place** if possible

**Quick Actions:**
- Press the emergency button for instant alerts
- Use voice activation by saying "Help me"
- Shake your phone 3 times for silent alert

Stay calm and prioritize your safety. Help is available 24/7.`,

            `I understand you may be in a concerning situation. Here's what you can do:

**Immediate Actions:**
• **Emergency Button**: Top right corner - sends alerts to contacts and authorities
• **Voice Alert**: Say "emergency" or "help me" for voice-activated assistance
• **Silent Alert**: Discreet notification to your emergency contacts

**If you feel unsafe:**
1. Move to a well-lit, populated area
2. Call someone you trust
3. Use ride-share services instead of walking
4. Trust your instincts

Would you like me to help you with any specific safety concern?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getRouteResponse(message) {
        const responses = [
            `**Safe Route Planning** 🗺️

I can help you plan the safest route! Here's how:

**Using Safe Routes Feature:**
1. Go to the **Safe Routes** section
2. Enter your starting point and destination
3. Enable safety preferences:
   - ✅ Avoid poorly lit areas
   - ✅ Prefer crowded areas
   - ✅ Avoid recent incident locations

**Safety Tips for Any Route:**
• Choose well-lit main streets over shortcuts
• Avoid isolated areas, especially at night
• Share your route with someone you trust
• Keep your phone charged and accessible

**Best Times to Travel:**
- Daylight hours are safest
- Early evening (6-8 PM) is generally safe
- After 10 PM, consider ride-share services

Would you like me to guide you through planning a specific route?`,

            `Let me help you with safe navigation! 🧭

**Route Safety Checklist:**
✅ **Well-lit streets** - Avoid dark alleys and poorly lit areas
✅ **Populated areas** - Stay where other people are present
✅ **Familiar routes** - Use paths you know well when possible
✅ **Emergency exits** - Know where you can get help quickly

**SHESECURE Route Features:**
- Real-time safety analysis
- Community-reported hazards
- Alternative route suggestions
- Integration with emergency services

**Pro Tips:**
• Walk confidently and stay alert
• Keep your phone visible (deters potential threats)
• Vary your routine occasionally
• Trust your instincts - if something feels wrong, change course

What's your destination? I can provide specific advice!`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSelfDefenseResponse(message) {
        const responses = [
            `**Self-Defense Guidance** 🥋

**Basic Self-Defense Principles:**
1. **Awareness** - Your first line of defense
2. **Avoidance** - Remove yourself from dangerous situations
3. **De-escalation** - Try to calm situations verbally
4. **Action** - Physical defense as a last resort

**Simple Techniques:**
• **Palm strike** - Use heel of palm to strike upward
• **Knee strike** - Drive knee upward into attacker's groin
• **Elbow strike** - Use elbow for close-range defense
• **Escape moves** - Break free from grabs

**Find Local Instructors:**
Check our **Self Defense** section for verified instructors in your area. Many offer:
- Free beginner classes
- Women-only sessions
- Practical street defense
- Confidence building

**Remember:** The goal is always to escape safely, not to fight.

Would you like information about instructors near you?`,

            `**Empowering Self-Defense Knowledge** 💪

**Mental Preparation:**
• **Confidence** - Walk with purpose and awareness
• **Situational awareness** - Stay alert to your surroundings
• **Trust instincts** - If something feels wrong, it probably is
• **Verbal assertiveness** - Use your voice as a deterrent

**Physical Techniques (Last Resort):**
1. **Target vulnerable areas**: Eyes, nose, throat, groin, knees
2. **Use your strongest parts**: Elbows, knees, heel of palm
3. **Create distance**: Strike and immediately move away
4. **Make noise**: Yell, scream, use a whistle

**Training Options:**
Our platform connects you with certified instructors offering:
- Krav Maga (practical defense)
- Women's self-defense classes
- Situational awareness training
- Confidence building workshops

**Important:** Self-defense is about survival and escape, not fighting. The best defense is avoiding dangerous situations altogether.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getSafetyTipsResponse(message) {
        const responses = [
            `**Essential Safety Tips** 🛡️

**Personal Safety Basics:**
• **Stay alert** - Avoid distractions like headphones in unfamiliar areas
• **Trust your instincts** - If something feels wrong, leave immediately
• **Share your plans** - Tell someone where you're going and when you'll return
• **Keep phone charged** - Your lifeline in emergencies

**When Walking:**
✅ Use well-lit, populated routes
✅ Walk confidently with purpose
✅ Stay aware of your surroundings
✅ Avoid isolated areas, especially at night

**Digital Safety:**
• Share location with trusted contacts
• Use safety apps like SHESECURE
• Keep emergency numbers easily accessible
• Consider personal safety devices

**At Home:**
• Lock doors and windows
• Know your neighbors
• Have emergency contacts readily available
• Keep lights on when arriving home

**Transportation:**
• Use reputable ride-share services
• Sit behind the driver in taxis
• Share trip details with friends
• Trust your instincts about drivers

Stay safe and remember - your safety is the top priority! 💜`,

            `**Comprehensive Safety Guide** 🌟

**The SAFE Method:**
**S** - **Situational Awareness**: Always know what's happening around you
**A** - **Avoid Risk**: Stay away from dangerous situations and people
**F** - **Fast Response**: React quickly to threats or uncomfortable situations
**E** - **Emergency Plan**: Always have a way to get help or escape

**Daily Safety Habits:**
1. **Morning**: Check weather, plan safe routes, charge devices
2. **During Day**: Stay alert, trust instincts, maintain communication
3. **Evening**: Use well-lit paths, inform others of your location
4. **Night**: Avoid walking alone, use transportation, stay in groups

**Technology for Safety:**
• Location sharing with trusted contacts
• Emergency alert systems
• Safety apps with panic buttons
• Regular check-ins with family/friends

**Building Confidence:**
- Take self-defense classes
- Practice assertive communication
- Learn about your local area
- Build a support network

Remember: Being cautious isn't being paranoid - it's being smart! 🧠✨`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getNightSafetyResponse(message) {
        const responses = [
            `**Night Safety Essentials** 🌙

**After Dark Guidelines:**
• **Avoid walking alone** - Use ride-share or public transport
• **Stay in well-lit areas** - Avoid shortcuts through dark spaces
• **Keep phone accessible** - But don't be distracted by it
• **Walk with confidence** - Appear alert and purposeful

**Transportation Options:**
1. **Ride-share services** (Uber, Lyft) - Safest option
2. **Public transportation** - Stay near other passengers
3. **Taxi services** - Use licensed, reputable companies
4. **Walking with others** - Never walk alone if possible

**If You Must Walk:**
✅ Stick to main streets with good lighting
✅ Stay aware of your surroundings
✅ Keep emergency contacts ready
✅ Share your location with someone
✅ Trust your instincts completely

**Emergency Preparedness:**
• Have emergency numbers on speed dial
• Keep phone charged
• Carry a whistle or personal alarm
• Know locations of 24-hour businesses

**SHESECURE Night Features:**
- Real-time risk assessment
- Safe route recommendations
- Emergency alert system
- Community safety updates

Your safety is worth more than convenience. When in doubt, choose the safer option! 🚗💜`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getReportingResponse(message) {
        const responses = [
            `**Reporting Safety Concerns** 📢

**What to Report:**
• Suspicious behavior or individuals
• Poor lighting or unsafe conditions
• Harassment or inappropriate conduct
• Areas that feel unsafe
• Positive safety improvements

**How to Report in SHESECURE:**
1. **Community Feed** - Share safety updates with photos/videos
2. **Safety Ratings** - Rate locations on safety factors
3. **Emergency Alerts** - For immediate threats
4. **Direct Reports** - Contact local authorities when needed

**When to Contact Authorities:**
🚨 **Immediate danger** - Call 911
🚨 **Crimes in progress** - Call 911
🚨 **Harassment** - Document and report to police
🚨 **Suspicious activity** - Non-emergency police line

**Documentation Tips:**
• Take photos/videos when safe to do so
• Note time, date, and location
• Describe individuals involved
• Save any evidence (messages, etc.)

**Community Impact:**
Your reports help other women stay safe by:
- Warning others of potential dangers
- Identifying areas needing improvement
- Building a safer community together

Remember: If you see something, say something. Your voice matters! 💪`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getLocationResponse(message) {
        const responses = [
            `**Location Sharing for Safety** 📍

**Why Share Your Location:**
• Emergency contacts can find you quickly
• Authorities can respond to exact location
• Creates accountability for your safety
• Provides peace of mind for loved ones

**SHESECURE Location Features:**
1. **Real-time sharing** with emergency contacts
2. **Automatic alerts** if you don't check in
3. **Safe zone notifications** when you arrive
4. **Emergency location broadcasting**

**Best Practices:**
✅ Share with trusted contacts only
✅ Update emergency contacts regularly
✅ Use location sharing during risky situations
✅ Set up automatic check-ins for routine trips

**Privacy Control:**
• You control who sees your location
• Turn sharing on/off as needed
• Set time limits for sharing
• Delete location history when desired

**Emergency Location Sharing:**
- Instantly shares with all emergency contacts
- Sends to local emergency services
- Includes additional safety information
- Works even with limited phone battery

**Quick Setup:**
Go to Emergency Settings → Add Contacts → Enable Location Sharing

Your location can be your lifeline in an emergency! 🆘`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getContactResponse(message) {
        const responses = [
            `**Emergency Contacts Setup** 👥

**Who to Add as Emergency Contacts:**
• **Family members** - Parents, siblings, spouse
• **Close friends** - People who know your routines
• **Neighbors** - Someone nearby who can respond quickly
• **Colleagues** - If you work late or travel for work

**Contact Information Needed:**
✅ Full name and relationship
✅ Primary phone number
✅ Alternative contact method
✅ Their availability/schedule

**Setting Up in SHESECURE:**
1. Go to **Emergency Panel**
2. Click **Add Emergency Contact**
3. Enter their information
4. Test the system with them
5. Keep information updated

**Best Practices:**
• Have at least 3 emergency contacts
• Include people in different locations
• Make sure they know they're your emergency contact
• Update information regularly
• Test the system periodically

**What Contacts Receive:**
- Your exact location during emergencies
- Time and type of alert
- Instructions on how to help
- Direct line to emergency services

**Important:** Make sure your emergency contacts know they're listed and understand what to do if they receive an alert.

Would you like help setting up your emergency contacts? 📞`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getAppHelpResponse(message) {
        const responses = [
            `**SHESECURE App Guide** 📱

**Main Features:**
🏠 **Home Feed** - Community safety updates and posts
⭐ **Safety Ratings** - Rate and review location safety
🗺️ **Safe Routes** - AI-powered safe navigation
👥 **Community** - Share photos/videos of safety concerns
🥋 **Self Defense** - Find certified instructors
🧠 **AI Risk Prediction** - Real-time safety assessment
🚨 **Emergency Panel** - Instant alerts and help

**Getting Started:**
1. Complete your profile and add emergency contacts
2. Enable location services for better safety features
3. Explore your neighborhood's safety ratings
4. Join the community by sharing safety updates

**Pro Tips:**
• Use voice commands for hands-free emergency alerts
• Set up automatic check-ins for regular routes
• Rate locations you visit to help other women
• Keep the app updated for latest safety features

**Emergency Features:**
- **Voice Alert**: Say "help me" or "emergency"
- **Shake Detection**: Shake phone 3 times for silent alert
- **Panic Button**: Red emergency button in header
- **Auto-Location**: Shares location during emergencies

**Privacy & Security:**
Your safety data is encrypted and only shared with your chosen emergency contacts and relevant authorities during emergencies.

Need help with a specific feature? Just ask! 🤝`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getGeneralResponse(message) {
        const responses = [
            `I'm here to help you stay safe! I can assist with:

• **Emergency situations** - Immediate help and guidance
• **Route planning** - Finding the safest paths
• **Safety tips** - General and specific advice
• **Self-defense** - Techniques and instructor recommendations
• **Reporting concerns** - How to document and report issues
• **App features** - Using SHESECURE effectively

What would you like to know more about? 😊`,

            `Hello! I'm your AI Safety Guide. I'm here 24/7 to help with:

🛡️ **Personal safety advice**
🗺️ **Safe route recommendations**
🚨 **Emergency procedures**
🥋 **Self-defense guidance**
📱 **App feature explanations**
👥 **Community safety tips**

Feel free to ask me anything about staying safe. Your wellbeing is my priority! 💜`,

            `I'm designed to help keep you safe! Whether you need:

- Immediate emergency assistance
- Advice on safe travel routes
- Self-defense recommendations
- General safety tips
- Help using app features
- Community safety information

Just ask, and I'll provide personalized guidance based on your situation. What can I help you with today? 🌟`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    initializeKnowledgeBase() {
        return {
            emergencyNumbers: {
                police: '911',
                fire: '911',
                medical: '911',
                nationalSuicidePreventionLifeline: '988',
                nationalDomesticViolenceHotline: '1-800-799-7233'
            },
            safetyTips: [
                'Trust your instincts - if something feels wrong, it probably is',
                'Stay alert and avoid distractions like headphones in unfamiliar areas',
                'Share your location and plans with trusted contacts',
                'Use well-lit, populated routes whenever possible',
                'Keep your phone charged and emergency contacts accessible'
            ],
            selfDefenseBasics: [
                'Awareness is your first line of defense',
                'Avoidance is better than confrontation',
                'Target vulnerable areas: eyes, nose, throat, groin, knees',
                'Use your strongest parts: elbows, knees, heel of palm',
                'The goal is always to escape, not to fight'
            ]
        };
    }

    addWelcomeMessage() {
        if (this.chatHistory.length === 0) {
            this.addMessage(
                `Hello! I'm your AI Safety Guide. I'm here to help you stay safe 24/7. 

I can assist with:
• Emergency situations and procedures
• Safe route planning and navigation
• Personal safety tips and advice
• Self-defense guidance and resources
• Using SHESECURE app features
• Community safety information

What can I help you with today? 😊`,
                'ai'
            );
        }
    }

    handleTyping() {
        // Could implement typing indicators or suggestions here
    }

    loadChatHistory() {
        try {
            const saved = localStorage.getItem('ai-chat-history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                
                // Display recent messages (last 10)
                const recentMessages = this.chatHistory.slice(-10);
                recentMessages.forEach(msg => {
                    this.addMessageToDOM(msg.content, msg.sender, msg.timestamp);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chatHistory = [];
        }
    }

    addMessageToDOM(content, sender, timestamp) {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
    }

    saveChatHistory() {
        try {
            // Keep only last 50 messages to prevent storage bloat
            if (this.chatHistory.length > 50) {
                this.chatHistory = this.chatHistory.slice(-50);
            }
            
            localStorage.setItem('ai-chat-history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    clearChatHistory() {
        this.chatHistory = [];
        localStorage.removeItem('ai-chat-history');
        
        const chatMessages = document.getElementById('ai-chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
        
        this.addWelcomeMessage();
    }
}

// Initialize AI Guide
window.aiGuide = new AIGuide();