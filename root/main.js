// Main application initialization and utility functions
class SheSecureApp {
    constructor() {
        this.init();
    }

    init() {
        // Initialize app when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupGlobalEventListeners();
        this.setupFormHandlers();
        this.setupStarRatings();
        this.setupSearch();
        this.setupAIGuide();
        this.setupEmergencyFeatures();
        this.setupNotifications();
    }

    setupGlobalEventListeners() {
        // Handle escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Connection lost - some features may not work', 'warning');
        });
    }

    setupFormHandlers() {
        // Post creation form
        const createPostForm = document.getElementById('create-post-form');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handlePostCreation(e));
        }

        // Rating form
        const ratingForm = document.getElementById('rating-form');
        if (ratingForm) {
            ratingForm.addEventListener('submit', (e) => this.handleRatingSubmission(e));
        }

        // Instructor registration form
        const instructorForm = document.getElementById('instructor-form');
        if (instructorForm) {
            instructorForm.addEventListener('submit', (e) => this.handleInstructorRegistration(e));
        }

        // Pricing option toggle
        const pricingOptions = document.querySelectorAll('input[name="pricing"]');
        pricingOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                const priceInput = document.getElementById('price-input');
                if (e.target.value === 'paid') {
                    priceInput.classList.remove('hidden');
                } else {
                    priceInput.classList.add('hidden');
                }
            });
        });
    }

    setupStarRatings() {
        document.querySelectorAll('.star-rating').forEach(rating => {
            const stars = rating.querySelectorAll('i');
            let currentRating = 0;

            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, index + 1);
                });

                star.addEventListener('mouseleave', () => {
                    this.highlightStars(stars, currentRating);
                });

                star.addEventListener('click', () => {
                    currentRating = index + 1;
                    this.highlightStars(stars, currentRating);
                    
                    // Store rating value
                    rating.dataset.rating = currentRating;
                });
            });
        });
    }

    highlightStars(stars, count) {
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const filterButtons = document.querySelectorAll('.filter-btn');

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
                this.performSearch(searchInput.value, btn.dataset.filter);
            });
        });
    }

    setupAIGuide() {
        const chatInput = document.getElementById('ai-chat-input');
        const sendButton = document.getElementById('send-ai-message');
        const chatMessages = document.getElementById('ai-chat-messages');

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            // Add user message
            this.addChatMessage(message, 'user');
            chatInput.value = '';

            // Simulate AI response
            setTimeout(() => {
                const aiResponse = this.generateAIResponse(message);
                this.addChatMessage(aiResponse, 'ai');
            }, 1000);
        };

        if (sendButton) {
            sendButton.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }
    }

    setupEmergencyFeatures() {
        // Voice alert button
        const voiceAlertBtn = document.getElementById('voice-alert-btn');
        if (voiceAlertBtn) {
            voiceAlertBtn.addEventListener('click', () => {
                this.activateVoiceAlert();
            });
        }

        // Silent alert button
        const silentAlertBtn = document.getElementById('silent-alert-btn');
        if (silentAlertBtn) {
            silentAlertBtn.addEventListener('click', () => {
                this.sendSilentAlert();
            });
        }

        // Call police button
        const callPoliceBtn = document.getElementById('call-police-btn');
        if (callPoliceBtn) {
            callPoliceBtn.addEventListener('click', () => {
                this.callPolice();
            });
        }

        // Share location button
        const shareLocationBtn = document.getElementById('share-location-btn');
        if (shareLocationBtn) {
            shareLocationBtn.addEventListener('click', () => {
                this.shareCurrentLocation();
            });
        }

        // Add emergency contact button
        const addContactBtn = document.querySelector('.add-contact-btn');
        if (addContactBtn) {
            addContactBtn.addEventListener('click', () => {
                this.addEmergencyContact();
            });
        }
    }

    setupNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Check for location permission
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => console.log('Location access granted'),
                () => console.log('Location access denied')
            );
        }
    }

    // Form handlers
    async handlePostCreation(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            // In a real app, this would save to Firebase
            const post = {
                content: formData.get('content') || e.target.querySelector('textarea').value,
                location: formData.get('location') || e.target.querySelector('input[type="text"]').value,
                safetyLevel: formData.get('safetyLevel') || e.target.querySelector('select').value,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.currentUser?.uid,
                media: []
            };

            console.log('Creating post:', post);
            
            this.showNotification('Safety update posted successfully!', 'success');
            this.closeAllModals();
            
            // Refresh feed
            if (window.dashboard) {
                window.dashboard.loadSafetyFeed();
            }
        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification('Failed to post update. Please try again.', 'error');
        }
    }

    async handleRatingSubmission(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const ratings = {};
            document.querySelectorAll('.star-rating').forEach(rating => {
                const category = rating.dataset.category;
                const value = parseInt(rating.dataset.rating) || 0;
                ratings[category] = value;
            });

            const ratingData = {
                location: e.target.querySelector('input[type="text"]').value,
                ratings: ratings,
                review: e.target.querySelector('textarea').value,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.currentUser?.uid
            };

            console.log('Submitting rating:', ratingData);
            
            this.showNotification('Rating submitted successfully!', 'success');
            this.closeAllModals();
            
            // Refresh ratings
            if (window.dashboard) {
                window.dashboard.loadSafetyRatings();
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showNotification('Failed to submit rating. Please try again.', 'error');
        }
    }

    async handleInstructorRegistration(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const instructorData = {
                name: formData.get('name') || e.target.querySelector('input[placeholder*="Name"]').value,
                specialization: formData.get('specialization') || e.target.querySelector('input[placeholder*="Specialization"]').value,
                experience: formData.get('experience') || e.target.querySelector('textarea').value,
                location: formData.get('location') || e.target.querySelector('input[placeholder*="Location"]').value,
                pricing: formData.get('pricing'),
                price: formData.get('price') || e.target.querySelector('input[type="number"]')?.value,
                skillLevel: formData.get('skillLevel') || e.target.querySelector('select').value,
                contact: formData.get('contact') || e.target.querySelector('input[type="tel"]').value,
                email: formData.get('email') || e.target.querySelector('input[type="email"]').value,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.currentUser?.uid,
                verified: false
            };

            console.log('Registering instructor:', instructorData);
            
            this.showNotification('Instructor registration submitted! We will review and contact you soon.', 'success');
            this.closeAllModals();
        } catch (error) {
            console.error('Error registering instructor:', error);
            this.showNotification('Failed to submit registration. Please try again.', 'error');
        }
    }

    // Search functionality
    performSearch(query, filter = 'all') {
        const searchResults = document.getElementById('search-results');
        if (!searchResults || !query.trim()) {
            searchResults.innerHTML = '';
            return;
        }

        // Sample search results (in real app, this would query Firebase)
        const sampleResults = [
            {
                type: 'location',
                title: 'Central Park',
                description: 'Well-lit park with good safety ratings',
                rating: 4.5
            },
            {
                type: 'user',
                title: 'Sarah Johnson',
                description: 'Active safety advocate and community member',
                avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
            },
            {
                type: 'post',
                title: 'Safety update about downtown area',
                description: 'Recent lighting improvements make evening walks safer',
                timestamp: '2 hours ago'
            }
        ];

        const filteredResults = filter === 'all' ? sampleResults : 
            sampleResults.filter(result => result.type === filter);

        const resultsHTML = filteredResults
            .filter(result => result.title.toLowerCase().includes(query.toLowerCase()))
            .map(result => this.createSearchResultItem(result))
            .join('');

        searchResults.innerHTML = resultsHTML || '<p style="padding: 20px; text-align: center; color: #666;">No results found</p>';
    }

    createSearchResultItem(result) {
        const icon = result.type === 'location' ? 'fa-map-marker-alt' : 
                    result.type === 'user' ? 'fa-user' : 'fa-file-alt';
        
        return `
            <div class="search-result-item">
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${result.avatar ? 
                        `<img src="${result.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` :
                        `<i class="fas ${icon}" style="width: 40px; text-align: center; color: #666;"></i>`
                    }
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${result.title}</div>
                        <div style="color: #666; font-size: 0.9rem;">${result.description}</div>
                        ${result.rating ? `<div style="color: #f59e0b; margin-top: 4px;">★ ${result.rating}</div>` : ''}
                        ${result.timestamp ? `<div style="color: #999; font-size: 0.8rem; margin-top: 4px;">${result.timestamp}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // AI Guide functionality
    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('ai-chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (message.includes('safe') && (message.includes('route') || message.includes('path'))) {
            return "I recommend using well-lit main streets and avoiding isolated areas. Would you like me to help you plan a specific route?";
        } else if (message.includes('emergency') || message.includes('help')) {
            return "In an emergency, press the emergency button in the top right corner. This will immediately alert authorities and your emergency contacts with your location.";
        } else if (message.includes('self defense') || message.includes('protect')) {
            return "Self-defense is important! Check our Self Defense section to find qualified instructors near you. Basic awareness and confidence are your first lines of defense.";
        } else if (message.includes('dark') || message.includes('night')) {
            return "When walking at night: stay in well-lit areas, keep your phone charged, share your location with trusted contacts, and consider using ride-share services for longer distances.";
        } else if (message.includes('report') || message.includes('incident')) {
            return "You can report incidents through our community feed. This helps other women stay informed about potential safety concerns in different areas.";
        } else {
            return "I'm here to help with safety advice, route planning, emergency procedures, and connecting you with self-defense resources. What specific safety concern can I help you with?";
        }
    }

    // Emergency functionality
    activateVoiceAlert() {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('Emergency alert activated. Help is on the way.');
            utterance.volume = 1.0;
            utterance.rate = 1.0;
            speechSynthesis.speak(utterance);
        }
        
        this.sendEmergencyAlert();
        this.showNotification('Voice alert activated!', 'success');
    }

    sendSilentAlert() {
        this.sendEmergencyAlert();
        this.showNotification('Silent alert sent to emergency contacts', 'success');
    }

    callPolice() {
        if (confirm('This will attempt to call emergency services. Continue?')) {
            // In a real app, this would integrate with emergency services
            window.open('tel:911');
            this.sendEmergencyAlert();
        }
    }

    shareCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // In a real app, this would share location with emergency contacts
                console.log('Sharing location:', location);
                this.showNotification('Location shared with emergency contacts', 'success');
            }, () => {
                this.showNotification('Unable to get location. Please enable location services.', 'error');
            });
        } else {
            this.showNotification('Location services not available', 'error');
        }
    }

    addEmergencyContact() {
        const name = prompt('Enter contact name:');
        const phone = prompt('Enter phone number:');
        
        if (name && phone) {
            // In a real app, this would save to Firebase
            const contact = { name, phone, id: Date.now() };
            console.log('Adding emergency contact:', contact);
            
            this.displayEmergencyContact(contact);
            this.showNotification('Emergency contact added', 'success');
        }
    }

    displayEmergencyContact(contact) {
        const contactsList = document.getElementById('emergency-contacts-list');
        if (!contactsList) return;

        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';
        contactDiv.innerHTML = `
            <div>
                <strong>${contact.name}</strong><br>
                <span style="color: #666;">${contact.phone}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                Remove
            </button>
        `;
        
        contactsList.appendChild(contactDiv);
    }

    sendEmergencyAlert() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const alertData = {
                    userId: window.authManager?.currentUser?.uid,
                    location: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    },
                    timestamp: new Date().toISOString(),
                    type: 'emergency'
                };

                // In a real app, this would:
                // 1. Send to emergency services API
                // 2. Notify emergency contacts via SMS/push notifications
                // 3. Log the incident in Firebase
                
                console.log('Emergency alert data:', alertData);
                
                // Send push notification if permission granted
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Emergency Alert Sent', {
                        body: 'Your emergency contacts and authorities have been notified.',
                        icon: '/favicon.ico'
                    });
                }
            });
        }
    }

    // Utility functions
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Add CSS animations if not already present
    addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize the application
window.sheSecureApp = new SheSecureApp();