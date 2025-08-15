// Dashboard functionality
class Dashboard {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupHeaderActions();
        this.loadSampleData();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    switchSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Load section-specific data
            this.loadSectionData(sectionName);
        }
    }

    setupModals() {
        // Modal triggers
        document.getElementById('search-btn').addEventListener('click', () => {
            this.showModal('search-modal');
        });

        document.getElementById('ai-guide-btn').addEventListener('click', () => {
            this.showModal('ai-guide-modal');
        });

        document.getElementById('emergency-btn').addEventListener('click', () => {
            this.showModal('emergency-modal');
        });

        document.querySelector('.create-post-btn').addEventListener('click', () => {
            this.showModal('create-post-modal');
        });

        document.querySelector('.rate-location-btn').addEventListener('click', () => {
            this.showModal('rating-modal');
        });

        document.querySelector('.become-instructor-btn').addEventListener('click', () => {
            this.showModal('instructor-modal');
        });

        // Close modal functionality
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModals();
            });
        });

        // Close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModals();
                }
            });
        });
    }

    setupHeaderActions() {
        // Voice activation for emergency
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceRecognition();
        }
    }

    setupVoiceRecognition() {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            
            // Check for emergency phrases
            if (transcript.toLowerCase().includes('help') || 
                transcript.toLowerCase().includes('emergency')) {
                this.triggerEmergencyAlert();
            }
        };

        // Start listening on page load (with user permission)
        document.addEventListener('click', () => {
            recognition.start();
        }, { once: true });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
            modal.style.display = 'none';
        });
    }

    loadSectionData(section) {
        switch (section) {
            case 'home':
                this.loadSafetyFeed();
                break;
            case 'safety-ratings':
                this.loadSafetyRatings();
                break;
            case 'safe-routes':
                this.initializeMap();
                break;
            case 'community':
                this.loadCommunityFeed();
                break;
            case 'self-defense':
                this.loadInstructors();
                break;
            case 'risk-prediction':
                this.loadRiskPrediction();
                break;
        }
    }

    loadSampleData() {
        // Load initial home feed
        this.loadSafetyFeed();
    }

    loadSafetyFeed() {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;

        const samplePosts = [
            {
                id: 1,
                user: {
                    name: 'Sarah Johnson',
                    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
                },
                content: 'Just walked through Central Park at 8 PM. Well lit and plenty of people around. Felt very safe!',
                location: 'Central Park, NYC',
                safetyLevel: 'safe',
                timestamp: '2 hours ago',
                likes: 15,
                comments: 3
            },
            {
                id: 2,
                user: {
                    name: 'Emma Wilson',
                    avatar: 'https://images.pexels.com/photos/594421/pexels-photo-594421.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
                },
                content: 'Avoid the downtown subway station after 10 PM. Poor lighting and not many security personnel.',
                location: 'Downtown Subway Station',
                safetyLevel: 'caution',
                timestamp: '5 hours ago',
                likes: 28,
                comments: 7
            },
            {
                id: 3,
                user: {
                    name: 'Lisa Chen',
                    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
                },
                content: 'Great self-defense class today! Feeling more confident walking alone. Highly recommend learning basic techniques.',
                location: 'Community Center',
                safetyLevel: 'safe',
                timestamp: '1 day ago',
                likes: 42,
                comments: 12
            }
        ];

        postsContainer.innerHTML = samplePosts.map(post => this.createPostCard(post)).join('');
    }

    loadSafetyRatings() {
        const ratingsGrid = document.getElementById('ratings-grid');
        if (!ratingsGrid) return;

        const sampleRatings = [
            {
                id: 1,
                location: 'Central Park',
                overallRating: 4.5,
                lighting: 4,
                crowdDensity: 5,
                recentIncidents: 0,
                reviews: 156
            },
            {
                id: 2,
                location: 'Times Square',
                overallRating: 4.8,
                lighting: 5,
                crowdDensity: 5,
                recentIncidents: 1,
                reviews: 289
            },
            {
                id: 3,
                location: 'Brooklyn Bridge',
                overallRating: 4.2,
                lighting: 3,
                crowdDensity: 4,
                recentIncidents: 0,
                reviews: 98
            }
        ];

        ratingsGrid.innerHTML = sampleRatings.map(rating => this.createRatingCard(rating)).join('');
    }

    loadCommunityFeed() {
        const mediaFeed = document.getElementById('media-feed');
        if (!mediaFeed) return;

        const sampleMedia = [
            {
                id: 1,
                user: {
                    name: 'Jessica Lee',
                    avatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
                },
                content: 'New street lighting installed on 5th Avenue - much safer for evening walks!',
                image: 'https://images.pexels.com/photos/327174/pexels-photo-327174.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                location: '5th Avenue',
                timestamp: '3 hours ago'
            },
            {
                id: 2,
                user: {
                    name: 'Maria Garcia',
                    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
                },
                content: 'Security cameras added to this parking lot. Women can park here more safely now.',
                image: 'https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                location: 'Main Street Parking',
                timestamp: '1 day ago'
            }
        ];

        mediaFeed.innerHTML = sampleMedia.map(media => this.createMediaCard(media)).join('');
    }

    loadInstructors() {
        const instructorsGrid = document.getElementById('instructors-grid');
        if (!instructorsGrid) return;

        const sampleInstructors = [
            {
                id: 1,
                name: 'Jennifer Adams',
                specialization: 'Krav Maga',
                experience: '8 years teaching experience',
                location: 'Manhattan, NYC',
                price: 'Free',
                rating: 4.9,
                students: 245,
                skillLevel: 'All Levels'
            },
            {
                id: 2,
                name: 'Michelle Torres',
                specialization: 'Karate & Self Defense',
                experience: '12 years martial arts, 6 years teaching',
                location: 'Brooklyn, NYC',
                price: '$30/session',
                rating: 4.7,
                students: 156,
                skillLevel: 'Beginner to Advanced'
            },
            {
                id: 3,
                name: 'Ashley Kim',
                specialization: 'Women\'s Self Defense',
                experience: '5 years specialized training',
                location: 'Queens, NYC',
                price: 'Free',
                rating: 4.8,
                students: 89,
                skillLevel: 'Beginner'
            }
        ];

        instructorsGrid.innerHTML = sampleInstructors.map(instructor => this.createInstructorCard(instructor)).join('');
    }

    loadRiskPrediction() {
        // Simulate AI risk assessment
        const currentTime = new Date().getHours();
        let riskLevel, riskPercentage, riskClass;

        if (currentTime >= 6 && currentTime <= 18) {
            riskLevel = 'LOW';
            riskPercentage = '25%';
            riskClass = 'low';
        } else if (currentTime >= 19 && currentTime <= 21) {
            riskLevel = 'MEDIUM';
            riskPercentage = '45%';
            riskClass = 'medium';
        } else {
            riskLevel = 'HIGH';
            riskPercentage = '70%';
            riskClass = 'high';
        }

        // Update risk meter
        const riskMeter = document.getElementById('current-risk-level');
        if (riskMeter) {
            riskMeter.className = `risk-level ${riskClass}`;
            riskMeter.innerHTML = `
                <span class="risk-text">${riskLevel}</span>
                <span class="risk-percentage">${riskPercentage}</span>
            `;
        }

        // Update risk factors
        this.updateRiskFactors();
        this.updateRecommendations();
    }

    updateRiskFactors() {
        const factorsContainer = document.getElementById('risk-factors');
        if (!factorsContainer) return;

        const factors = [
            'Time of day: Late evening increases risk',
            'Location: Downtown area has higher incident rates',
            'Weather: Clear conditions improve visibility',
            'Day of week: Weekend nights have more activity'
        ];

        factorsContainer.innerHTML = factors.map(factor => 
            `<div class="factor-item">${factor}</div>`
        ).join('');
    }

    updateRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations-list');
        if (!recommendationsContainer) return;

        const recommendations = [
            'Use well-lit main streets instead of side alleys',
            'Consider taking a ride-share service after 10 PM',
            'Inform someone of your planned route and arrival time',
            'Keep phone charged and emergency contacts accessible'
        ];

        recommendationsContainer.innerHTML = recommendations.map(rec => 
            `<div class="recommendation-item">${rec}</div>`
        ).join('');
    }

    createPostCard(post) {
        return `
            <div class="post-card">
                <div class="post-header">
                    <img src="${post.user.avatar}" alt="${post.user.name}" class="user-avatar">
                    <div class="post-meta">
                        <div class="username">${post.user.name}</div>
                        <div class="post-time">${post.timestamp}</div>
                    </div>
                    <div class="safety-badge ${post.safetyLevel}">${post.safetyLevel.toUpperCase()}</div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${post.location}
                </div>
                <div class="post-actions">
                    <button class="action-btn">
                        <i class="fas fa-heart"></i>
                        ${post.likes}
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-comment"></i>
                        ${post.comments}
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                </div>
            </div>
        `;
    }

    createRatingCard(rating) {
        return `
            <div class="rating-card">
                <div class="card-header">
                    <h3>${rating.location}</h3>
                    <div class="overall-rating">
                        ${this.createStars(rating.overallRating)}
                        <span>${rating.overallRating}</span>
                    </div>
                </div>
                <div class="rating-details">
                    <div class="rating-detail">
                        <span>Lighting:</span>
                        ${this.createStars(rating.lighting)}
                    </div>
                    <div class="rating-detail">
                        <span>Crowd Density:</span>
                        ${this.createStars(rating.crowdDensity)}
                    </div>
                    <div class="rating-detail">
                        <span>Recent Incidents:</span>
                        <span class="${rating.recentIncidents === 0 ? 'text-green-600' : 'text-red-600'}">
                            ${rating.recentIncidents}
                        </span>
                    </div>
                </div>
                <div class="rating-footer">
                    <span>${rating.reviews} reviews</span>
                </div>
            </div>
        `;
    }

    createMediaCard(media) {
        return `
            <div class="media-card">
                <div class="post-header">
                    <img src="${media.user.avatar}" alt="${media.user.name}" class="user-avatar">
                    <div class="post-meta">
                        <div class="username">${media.user.name}</div>
                        <div class="post-time">${media.timestamp}</div>
                    </div>
                </div>
                <div class="post-content">${media.content}</div>
                <img src="${media.image}" alt="Community update" style="width: 100%; border-radius: 8px; margin: 10px 0;">
                <div class="post-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${media.location}
                </div>
            </div>
        `;
    }

    createInstructorCard(instructor) {
        return `
            <div class="instructor-card">
                <div class="instructor-header">
                    <h3>${instructor.name}</h3>
                    <div class="instructor-rating">
                        ${this.createStars(instructor.rating)}
                        <span>${instructor.rating} (${instructor.students} students)</span>
                    </div>
                </div>
                <div class="instructor-details">
                    <p><strong>Specialization:</strong> ${instructor.specialization}</p>
                    <p><strong>Experience:</strong> ${instructor.experience}</p>
                    <p><strong>Location:</strong> ${instructor.location}</p>
                    <p><strong>Skill Level:</strong> ${instructor.skillLevel}</p>
                </div>
                <div class="instructor-footer">
                    <div class="price-tag">
                        <strong>${instructor.price}</strong>
                    </div>
                    <button class="primary-btn">Contact Instructor</button>
                </div>
            </div>
        `;
    }

    createStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star" style="color: #ffd700;"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt" style="color: #ffd700;"></i>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star" style="color: #ddd;"></i>';
        }

        return starsHTML;
    }

    triggerEmergencyAlert() {
        // Show emergency modal
        this.showModal('emergency-modal');
        
        // Simulate sending alerts
        this.sendEmergencyAlert();
    }

    async sendEmergencyAlert() {
        try {
            // Get current location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // In a real app, this would send to emergency services
                    console.log('Emergency alert sent with location:', location);
                    
                    // Show confirmation
                    alert('Emergency alert sent to authorities and emergency contacts!');
                });
            }
        } catch (error) {
            console.error('Emergency alert failed:', error);
        }
    }

    initializeMap() {
        // This will be called when Google Maps is loaded
        if (typeof google !== 'undefined' && google.maps) {
            const map = new google.maps.Map(document.getElementById('google-map'), {
                center: { lat: 40.7128, lng: -74.0060 }, // NYC
                zoom: 13,
                styles: [
                    {
                        featureType: 'poi.business',
                        stylers: [{ visibility: 'off' }]
                    }
                ]
            });

            // Add sample safe route markers
            const safeLocations = [
                { lat: 40.7589, lng: -73.9851, title: 'Times Square (Safe Zone)' },
                { lat: 40.7505, lng: -73.9934, title: 'Herald Square (Safe Zone)' },
                { lat: 40.7614, lng: -73.9776, title: 'Bryant Park (Safe Zone)' }
            ];

            safeLocations.forEach(location => {
                new google.maps.Marker({
                    position: location,
                    map: map,
                    title: location.title,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="%2322c55e"><circle cx="12" cy="12" r="10"/></svg>',
                        scaledSize: new google.maps.Size(30, 30)
                    }
                });
            });

            // Set up route planning
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({
                draggable: true,
                polylineOptions: {
                    strokeColor: '#7e57c2',
                    strokeWeight: 5
                }
            });
            directionsRenderer.setMap(map);

            document.getElementById('find-safe-route').addEventListener('click', () => {
                this.calculateSafeRoute(directionsService, directionsRenderer);
            });
        }
    }

    calculateSafeRoute(directionsService, directionsRenderer) {
        const start = document.getElementById('start-location').value;
        const end = document.getElementById('end-location').value;

        if (!start || !end) {
            alert('Please enter both starting location and destination');
            return;
        }

        directionsService.route({
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode.WALKING,
            avoidHighways: true,
            avoidTolls: true
        }, (response, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(response);
                
                // In a real app, this would analyze the route for safety factors
                this.analyzeRouteSafety(response);
            } else {
                alert('Directions request failed: ' + status);
            }
        });
    }

    analyzeRouteSafety(route) {
        // Simulate safety analysis
        const safetyScore = Math.random() * 100;
        let safetyLevel, message, color;

        if (safetyScore > 75) {
            safetyLevel = 'High';
            message = 'This route is well-lit and frequently traveled.';
            color = '#22c55e';
        } else if (safetyScore > 50) {
            safetyLevel = 'Medium';
            message = 'This route has some areas with lower lighting.';
            color = '#f59e0b';
        } else {
            safetyLevel = 'Low';
            message = 'Consider taking an alternative route or transportation.';
            color = '#ef4444';
        }

        // Show safety analysis
        const analysisDiv = document.createElement('div');
        analysisDiv.innerHTML = `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid ${color};">
                <h4>Route Safety Analysis</h4>
                <p><strong>Safety Level:</strong> <span style="color: ${color};">${safetyLevel}</span></p>
                <p>${message}</p>
                <p><strong>Estimated walking time:</strong> ${route.routes[0].legs[0].duration.text}</p>
            </div>
        `;

        const mapContainer = document.getElementById('map-container');
        const existingAnalysis = mapContainer.querySelector('.route-analysis');
        if (existingAnalysis) {
            existingAnalysis.remove();
        }
        
        analysisDiv.className = 'route-analysis';
        mapContainer.appendChild(analysisDiv);
    }
}

// Initialize dashboard
window.dashboard = new Dashboard();

// Global function for Google Maps callback
window.initMap = function() {
    if (window.dashboard) {
        window.dashboard.initializeMap();
    }
};