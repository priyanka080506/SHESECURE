// Emergency functionality
class Emergency {
    constructor() {
        this.emergencyContacts = [];
        this.isEmergencyActive = false;
        this.emergencyTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEmergencyContacts();
        this.setupVoiceRecognition();
    }

    setupEventListeners() {
        // Emergency action buttons
        const voiceAlertBtn = document.getElementById('voice-alert-btn');
        const silentAlertBtn = document.getElementById('silent-alert-btn');
        const callPoliceBtn = document.getElementById('call-police-btn');
        const shareLocationBtn = document.getElementById('share-location-btn');
        const addContactBtn = document.querySelector('.add-contact-btn');

        if (voiceAlertBtn) {
            voiceAlertBtn.addEventListener('click', () => this.activateVoiceAlert());
        }

        if (silentAlertBtn) {
            silentAlertBtn.addEventListener('click', () => this.sendSilentAlert());
        }

        if (callPoliceBtn) {
            callPoliceBtn.addEventListener('click', () => this.callEmergencyServices());
        }

        if (shareLocationBtn) {
            shareLocationBtn.addEventListener('click', () => this.shareCurrentLocation());
        }

        if (addContactBtn) {
            addContactBtn.addEventListener('click', () => this.addEmergencyContact());
        }

        // Panic button (shake detection)
        this.setupShakeDetection();

        // Emergency hotkey (Ctrl + E)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                this.quickEmergencyAlert();
            }
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript.toLowerCase();
                }
                
                // Check for emergency phrases
                const emergencyPhrases = [
                    'help me', 'emergency', 'call police', 'i need help', 
                    'danger', 'unsafe', 'scared', 'help'
                ];
                
                if (emergencyPhrases.some(phrase => transcript.includes(phrase))) {
                    this.triggerVoiceEmergency(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
            };

            // Start listening after user interaction
            document.addEventListener('click', () => {
                if (!this.voiceRecognitionStarted) {
                    this.startVoiceRecognition();
                    this.voiceRecognitionStarted = true;
                }
            }, { once: true });
        }
    }

    startVoiceRecognition() {
        try {
            this.recognition.start();
            console.log('Voice recognition started');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
        }
    }

    setupShakeDetection() {
        if (window.DeviceMotionEvent) {
            let lastX, lastY, lastZ;
            let shakeCount = 0;
            let lastShakeTime = 0;

            window.addEventListener('devicemotion', (event) => {
                const acceleration = event.accelerationIncludingGravity;
                const currentTime = new Date().getTime();
                
                if (lastX !== undefined) {
                    const deltaX = Math.abs(acceleration.x - lastX);
                    const deltaY = Math.abs(acceleration.y - lastY);
                    const deltaZ = Math.abs(acceleration.z - lastZ);
                    
                    const totalDelta = deltaX + deltaY + deltaZ;
                    
                    if (totalDelta > 30) { // Shake threshold
                        if (currentTime - lastShakeTime > 500) { // Debounce
                            shakeCount++;
                            lastShakeTime = currentTime;
                            
                            if (shakeCount >= 3) { // Three shakes trigger emergency
                                this.triggerShakeEmergency();
                                shakeCount = 0;
                            }
                        }
                    }
                }
                
                lastX = acceleration.x;
                lastY = acceleration.y;
                lastZ = acceleration.z;
                
                // Reset shake count after 3 seconds
                setTimeout(() => {
                    if (currentTime - lastShakeTime > 3000) {
                        shakeCount = 0;
                    }
                }, 3000);
            });
        }
    }

    async activateVoiceAlert() {
        this.isEmergencyActive = true;
        
        try {
            // Play loud alarm sound
            this.playAlarmSound();
            
            // Speak emergency message
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(
                    'Emergency alert activated! Help is on the way! This is an emergency situation!'
                );
                utterance.volume = 1.0;
                utterance.rate = 1.2;
                utterance.pitch = 1.2;
                speechSynthesis.speak(utterance);
            }
            
            // Flash screen
            this.flashScreen();
            
            // Send emergency alerts
            await this.sendEmergencyAlert('voice');
            
            this.showNotification('Voice emergency alert activated!', 'success');
            
        } catch (error) {
            console.error('Error activating voice alert:', error);
            this.showNotification('Error activating voice alert', 'error');
        }
    }

    async sendSilentAlert() {
        this.isEmergencyActive = true;
        
        try {
            await this.sendEmergencyAlert('silent');
            this.showNotification('Silent alert sent to emergency contacts and authorities', 'success');
        } catch (error) {
            console.error('Error sending silent alert:', error);
            this.showNotification('Error sending silent alert', 'error');
        }
    }

    callEmergencyServices() {
        const confirmCall = confirm(
            'This will attempt to call emergency services (911). Continue?'
        );
        
        if (confirmCall) {
            // Attempt to call emergency services
            window.open('tel:911');
            
            // Also send emergency alert
            this.sendEmergencyAlert('police-call');
            
            this.showNotification('Calling emergency services...', 'success');
        }
    }

    async shareCurrentLocation() {
        try {
            const location = await this.getCurrentLocation();
            
            if (location) {
                // Share location with emergency contacts
                await this.shareLocationWithContacts(location);
                
                // Create shareable location link
                const locationUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
                
                if (navigator.share) {
                    await navigator.share({
                        title: 'My Current Location - Emergency',
                        text: 'I am sharing my location for safety reasons.',
                        url: locationUrl
                    });
                } else {
                    // Fallback - copy to clipboard
                    await navigator.clipboard.writeText(
                        `My current location: ${locationUrl}\nShared via SHESECURE for safety reasons.`
                    );
                    this.showNotification('Location copied to clipboard!', 'success');
                }
                
                this.showNotification('Location shared with emergency contacts', 'success');
            } else {
                this.showNotification('Unable to get current location', 'error');
            }
        } catch (error) {
            console.error('Error sharing location:', error);
            this.showNotification('Error sharing location', 'error');
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    async sendEmergencyAlert(type = 'general') {
        try {
            const location = await this.getCurrentLocation();
            
            const alertData = {
                id: Date.now(),
                type: type,
                userId: window.authManager?.currentUser?.uid || 'anonymous',
                userName: window.authManager?.currentUser?.displayName || 'Anonymous User',
                location: location,
                timestamp: new Date().toISOString(),
                status: 'active',
                contacts: this.emergencyContacts
            };

            // Save emergency alert
            await this.saveEmergencyAlert(alertData);
            
            // Send notifications to emergency contacts
            await this.notifyEmergencyContacts(alertData);
            
            // Send to emergency services (in real app)
            await this.notifyEmergencyServices(alertData);
            
            // Send push notification
            this.sendPushNotification(alertData);
            
            // Start emergency timer
            this.startEmergencyTimer(alertData);
            
            return alertData;
            
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            throw error;
        }
    }

    async saveEmergencyAlert(alertData) {
        if (window.db) {
            // Save to Firebase Firestore
            await db.collection('emergency-alerts').add(alertData);
        } else {
            // Save to localStorage for demo
            const existingAlerts = JSON.parse(localStorage.getItem('emergency-alerts') || '[]');
            existingAlerts.push(alertData);
            localStorage.setItem('emergency-alerts', JSON.stringify(existingAlerts));
        }
    }

    async notifyEmergencyContacts(alertData) {
        if (this.emergencyContacts.length === 0) {
            console.warn('No emergency contacts configured');
            return;
        }

        const message = this.createEmergencyMessage(alertData);
        
        // In a real app, this would send SMS/push notifications
        this.emergencyContacts.forEach(contact => {
            console.log(`Sending emergency alert to ${contact.name} (${contact.phone}):`, message);
            
            // Simulate SMS sending
            if (contact.phone) {
                // In real app: send SMS via Twilio or similar service
                console.log(`SMS sent to ${contact.phone}`);
            }
            
            // Simulate push notification
            if (contact.pushToken) {
                // In real app: send push notification
                console.log(`Push notification sent to ${contact.name}`);
            }
        });
    }

    async notifyEmergencyServices(alertData) {
        // In a real app, this would integrate with local emergency services
        console.log('Emergency services notified:', alertData);
        
        // Simulate emergency services API call
        const emergencyData = {
            type: 'safety_alert',
            location: alertData.location,
            timestamp: alertData.timestamp,
            user_id: alertData.userId,
            priority: alertData.type === 'voice' ? 'high' : 'medium'
        };
        
        console.log('Emergency services data:', emergencyData);
    }

    createEmergencyMessage(alertData) {
        const locationText = alertData.location ? 
            `Location: https://maps.google.com/?q=${alertData.location.lat},${alertData.location.lng}` :
            'Location: Unable to determine';
            
        return `🚨 EMERGENCY ALERT 🚨
        
${alertData.userName} has activated an emergency alert.

${locationText}

Time: ${new Date(alertData.timestamp).toLocaleString()}

This alert was sent via SHESECURE safety platform.

If this is a real emergency, please contact local authorities immediately.`;
    }

    sendPushNotification(alertData) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Emergency Alert Sent', {
                body: 'Your emergency contacts and authorities have been notified.',
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'emergency-alert',
                requireInteraction: true
            });
        }
    }

    startEmergencyTimer(alertData) {
        // Auto-cancel alert after 30 minutes if not manually cancelled
        this.emergencyTimer = setTimeout(() => {
            this.cancelEmergencyAlert(alertData.id);
        }, 30 * 60 * 1000); // 30 minutes
    }

    async cancelEmergencyAlert(alertId) {
        this.isEmergencyActive = false;
        
        if (this.emergencyTimer) {
            clearTimeout(this.emergencyTimer);
            this.emergencyTimer = null;
        }
        
        // Update alert status
        try {
            if (window.db) {
                await db.collection('emergency-alerts').doc(alertId).update({
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString()
                });
            }
            
            this.showNotification('Emergency alert cancelled', 'info');
        } catch (error) {
            console.error('Error cancelling emergency alert:', error);
        }
    }

    addEmergencyContact() {
        const name = prompt('Enter contact name:');
        if (!name || !name.trim()) return;
        
        const phone = prompt('Enter phone number:');
        if (!phone || !phone.trim()) return;
        
        const relationship = prompt('Relationship (e.g., family, friend, colleague):') || 'Contact';
        
        const contact = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.trim(),
            relationship: relationship.trim(),
            addedAt: new Date().toISOString()
        };
        
        this.emergencyContacts.push(contact);
        this.saveEmergencyContacts();
        this.displayEmergencyContacts();
        
        this.showNotification(`Emergency contact ${name} added successfully!`, 'success');
    }

    removeEmergencyContact(contactId) {
        const contactIndex = this.emergencyContacts.findIndex(c => c.id === contactId);
        if (contactIndex !== -1) {
            const contact = this.emergencyContacts[contactIndex];
            if (confirm(`Remove ${contact.name} from emergency contacts?`)) {
                this.emergencyContacts.splice(contactIndex, 1);
                this.saveEmergencyContacts();
                this.displayEmergencyContacts();
                this.showNotification(`${contact.name} removed from emergency contacts`, 'info');
            }
        }
    }

    async loadEmergencyContacts() {
        try {
            if (window.db && window.authManager?.currentUser) {
                // Load from Firebase
                const doc = await db.collection('users').doc(window.authManager.currentUser.uid).get();
                if (doc.exists) {
                    this.emergencyContacts = doc.data().emergencyContacts || [];
                }
            } else {
                // Load from localStorage
                this.emergencyContacts = JSON.parse(localStorage.getItem('emergency-contacts') || '[]');
            }
            
            this.displayEmergencyContacts();
        } catch (error) {
            console.error('Error loading emergency contacts:', error);
            this.emergencyContacts = [];
        }
    }

    async saveEmergencyContacts() {
        try {
            if (window.db && window.authManager?.currentUser) {
                // Save to Firebase
                await db.collection('users').doc(window.authManager.currentUser.uid).update({
                    emergencyContacts: this.emergencyContacts
                });
            } else {
                // Save to localStorage
                localStorage.setItem('emergency-contacts', JSON.stringify(this.emergencyContacts));
            }
        } catch (error) {
            console.error('Error saving emergency contacts:', error);
        }
    }

    displayEmergencyContacts() {
        const contactsList = document.getElementById('emergency-contacts-list');
        if (!contactsList) return;

        if (this.emergencyContacts.length === 0) {
            contactsList.innerHTML = `
                <div class="no-contacts">
                    <i class="fas fa-address-book" style="font-size: 2rem; color: #ccc; margin-bottom: 10px;"></i>
                    <p>No emergency contacts added yet.</p>
                    <p style="font-size: 0.9rem; color: #666;">Add trusted contacts who will be notified in case of emergency.</p>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = this.emergencyContacts.map(contact => `
            <div class="contact-item">
                <div class="contact-info">
                    <div class="contact-name">
                        <i class="fas fa-user"></i>
                        <strong>${contact.name}</strong>
                    </div>
                    <div class="contact-details">
                        <div class="contact-phone">
                            <i class="fas fa-phone"></i>
                            ${contact.phone}
                        </div>
                        <div class="contact-relationship">
                            <i class="fas fa-heart"></i>
                            ${contact.relationship}
                        </div>
                    </div>
                </div>
                <div class="contact-actions">
                    <button onclick="window.open('tel:${contact.phone}')" class="contact-call-btn" title="Call">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button onclick="window.emergency.removeEmergencyContact(${contact.id})" class="contact-remove-btn" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async shareLocationWithContacts(location) {
        if (this.emergencyContacts.length === 0) return;

        const locationMessage = `🚨 LOCATION SHARE 🚨
        
I am sharing my current location for safety:

https://maps.google.com/?q=${location.lat},${location.lng}

Shared at: ${new Date().toLocaleString()}

Via SHESECURE safety platform`;

        // In a real app, send this message to all emergency contacts
        this.emergencyContacts.forEach(contact => {
            console.log(`Location shared with ${contact.name}: ${locationMessage}`);
        });
    }

    triggerVoiceEmergency(transcript) {
        console.log('Voice emergency triggered:', transcript);
        this.activateVoiceAlert();
    }

    triggerShakeEmergency() {
        console.log('Shake emergency triggered');
        
        // Show confirmation dialog
        const confirmed = confirm('Shake detected! Activate emergency alert?');
        if (confirmed) {
            this.quickEmergencyAlert();
        }
    }

    quickEmergencyAlert() {
        // Quick emergency without confirmation
        this.sendSilentAlert();
    }

    playAlarmSound() {
        // Create audio context for alarm sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            
            oscillator.start();
            
            // Create alarm pattern
            let time = audioContext.currentTime;
            for (let i = 0; i < 10; i++) {
                oscillator.frequency.setValueAtTime(800, time);
                oscillator.frequency.setValueAtTime(400, time + 0.1);
                time += 0.2;
            }
            
            oscillator.stop(time);
        } catch (error) {
            console.error('Error playing alarm sound:', error);
        }
    }

    flashScreen() {
        // Flash screen red for attention
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: red;
            opacity: 0.8;
            z-index: 9999;
            pointer-events: none;
            animation: flash 0.5s ease-in-out 6;
        `;
        
        // Add flash animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes flash {
                0%, 100% { opacity: 0; }
                50% { opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(flashOverlay);
        
        setTimeout(() => {
            flashOverlay.remove();
            style.remove();
        }, 3000);
    }

    showNotification(message, type = 'info') {
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize emergency system
window.emergency = new Emergency();