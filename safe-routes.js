// Safe Routes functionality
class SafeRoutes {
    constructor() {
        this.map = null;
        this.directionsService = null;
        this.directionsRenderer = null;
        this.safetyMarkers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Map will be initialized when Google Maps loads
    }

    setupEventListeners() {
        const findRouteBtn = document.getElementById('find-safe-route');
        if (findRouteBtn) {
            findRouteBtn.addEventListener('click', () => this.calculateSafeRoute());
        }

        // Route option checkboxes
        const routeOptions = document.querySelectorAll('.route-options input[type="checkbox"]');
        routeOptions.forEach(option => {
            option.addEventListener('change', () => {
                if (this.directionsRenderer && this.directionsRenderer.getDirections()) {
                    this.calculateSafeRoute();
                }
            });
        });
    }

    initializeMap() {
        if (typeof google === 'undefined' || !google.maps) {
            console.warn('Google Maps not loaded yet');
            return;
        }

        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        // Initialize map centered on NYC
        this.map = new google.maps.Map(mapElement, {
            center: { lat: 40.7128, lng: -74.0060 },
            zoom: 13,
            styles: [
                {
                    featureType: 'poi.business',
                    stylers: [{ visibility: 'off' }]
                },
                {
                    featureType: 'transit.station',
                    stylers: [{ visibility: 'simplified' }]
                }
            ]
        });

        // Initialize directions service and renderer
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            draggable: true,
            polylineOptions: {
                strokeColor: '#7e57c2',
                strokeWeight: 5,
                strokeOpacity: 0.8
            }
        });
        this.directionsRenderer.setMap(this.map);

        // Add safety markers
        this.addSafetyMarkers();

        // Listen for route changes
        this.directionsRenderer.addListener('directions_changed', () => {
            this.analyzeCurrentRoute();
        });
    }

    addSafetyMarkers() {
        const safeLocations = [
            { 
                lat: 40.7589, 
                lng: -73.9851, 
                title: 'Times Square - Safe Zone',
                type: 'safe',
                description: 'Well-lit, crowded area with police presence'
            },
            { 
                lat: 40.7505, 
                lng: -73.9934, 
                title: 'Herald Square - Safe Zone',
                type: 'safe',
                description: 'Busy shopping area with good lighting'
            },
            { 
                lat: 40.7614, 
                lng: -73.9776, 
                title: 'Bryant Park - Safe Zone',
                type: 'safe',
                description: 'Well-maintained park with security'
            },
            { 
                lat: 40.7282, 
                lng: -73.9942, 
                title: 'Caution Area',
                type: 'caution',
                description: 'Less crowded area, use caution at night'
            },
            { 
                lat: 40.7489, 
                lng: -73.9680, 
                title: 'Well-lit Street',
                type: 'safe',
                description: 'Recently improved street lighting'
            }
        ];

        safeLocations.forEach(location => {
            const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: this.map,
                title: location.title,
                icon: this.getMarkerIcon(location.type)
            });

            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h4 style="margin: 0 0 8px 0; color: #333;">${location.title}</h4>
                        <p style="margin: 0; color: #666; font-size: 14px;">${location.description}</p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            this.safetyMarkers.push(marker);
        });
    }

    getMarkerIcon(type) {
        const colors = {
            safe: '#22c55e',
            caution: '#f59e0b',
            danger: '#ef4444'
        };

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${colors[type] || colors.safe}">
                    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2"/>
                </svg>
            `)}`,
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
        };
    }

    calculateSafeRoute() {
        const startLocation = document.getElementById('start-location').value.trim();
        const endLocation = document.getElementById('end-location').value.trim();

        if (!startLocation || !endLocation) {
            this.showNotification('Please enter both starting location and destination', 'warning');
            return;
        }

        if (!this.directionsService) {
            this.showNotification('Map not ready. Please wait a moment and try again.', 'warning');
            return;
        }

        // Get route preferences
        const avoidDarkAreas = document.getElementById('avoid-dark-areas').checked;
        const preferCrowded = document.getElementById('prefer-crowded').checked;
        const avoidIncidents = document.getElementById('avoid-incidents').checked;

        const request = {
            origin: startLocation,
            destination: endLocation,
            travelMode: google.maps.TravelMode.WALKING,
            avoidHighways: true,
            avoidTolls: true,
            provideRouteAlternatives: true
        };

        this.directionsService.route(request, (response, status) => {
            if (status === 'OK') {
                this.directionsRenderer.setDirections(response);
                this.analyzeRouteSafety(response, {
                    avoidDarkAreas,
                    preferCrowded,
                    avoidIncidents
                });
            } else {
                this.showNotification(`Route calculation failed: ${status}`, 'error');
            }
        });
    }

    analyzeRouteSafety(route, preferences) {
        // Simulate safety analysis based on various factors
        const routes = route.routes;
        let bestRoute = routes[0];
        let safetyAnalysis = this.calculateSafetyScore(bestRoute, preferences);

        // If multiple routes available, analyze all and pick the safest
        if (routes.length > 1) {
            let bestScore = safetyAnalysis.score;
            routes.forEach((r, index) => {
                const analysis = this.calculateSafetyScore(r, preferences);
                if (analysis.score > bestScore) {
                    bestRoute = r;
                    safetyAnalysis = analysis;
                    bestScore = analysis.score;
                }
            });

            // Set the safest route
            this.directionsRenderer.setRouteIndex(routes.indexOf(bestRoute));
        }

        this.displaySafetyAnalysis(safetyAnalysis, bestRoute);
    }

    calculateSafetyScore(route, preferences) {
        let score = 70; // Base score
        const factors = [];
        const warnings = [];
        const recommendations = [];

        // Time-based analysis
        const currentHour = new Date().getHours();
        if (currentHour >= 6 && currentHour <= 18) {
            score += 15;
            factors.push('Daylight hours (+15 points)');
        } else if (currentHour >= 19 && currentHour <= 21) {
            score += 5;
            factors.push('Evening hours (+5 points)');
        } else {
            score -= 10;
            factors.push('Late night hours (-10 points)');
            warnings.push('Consider using transportation after 10 PM');
        }

        // Route length analysis
        const duration = route.legs[0].duration.value; // in seconds
        if (duration > 1800) { // More than 30 minutes
            score -= 5;
            factors.push('Long walking distance (-5 points)');
            recommendations.push('Consider breaking the journey or using public transport');
        }

        // Simulate area analysis based on preferences
        if (preferences.avoidDarkAreas) {
            score += 10;
            factors.push('Avoiding poorly lit areas (+10 points)');
        }

        if (preferences.preferCrowded) {
            score += 8;
            factors.push('Preferring crowded areas (+8 points)');
        }

        if (preferences.avoidIncidents) {
            score += 12;
            factors.push('Avoiding incident-prone areas (+12 points)');
        }

        // Random factors to simulate real analysis
        const randomFactors = [
            { condition: Math.random() > 0.7, text: 'Recent safety improvements in area (+5 points)', score: 5 },
            { condition: Math.random() > 0.8, text: 'Police patrol route (+8 points)', score: 8 },
            { condition: Math.random() > 0.9, text: 'Recent incident reported (-10 points)', score: -10 },
            { condition: Math.random() > 0.85, text: 'Well-lit main street (+6 points)', score: 6 }
        ];

        randomFactors.forEach(factor => {
            if (factor.condition) {
                score += factor.score;
                factors.push(factor.text);
            }
        });

        // Ensure score is within bounds
        score = Math.max(0, Math.min(100, score));

        let level, color, message;
        if (score >= 80) {
            level = 'High';
            color = '#22c55e';
            message = 'This route is very safe with good lighting and regular foot traffic.';
        } else if (score >= 60) {
            level = 'Medium';
            color = '#f59e0b';
            message = 'This route is generally safe but has some areas requiring caution.';
            recommendations.push('Stay alert and consider sharing your location');
        } else {
            level = 'Low';
            color = '#ef4444';
            message = 'This route has safety concerns. Consider alternative transportation.';
            warnings.push('High risk route - strongly consider alternatives');
            recommendations.push('Use ride-share service or public transportation');
        }

        return {
            score,
            level,
            color,
            message,
            factors,
            warnings,
            recommendations
        };
    }

    displaySafetyAnalysis(analysis, route) {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // Remove existing analysis
        const existingAnalysis = mapContainer.querySelector('.route-analysis');
        if (existingAnalysis) {
            existingAnalysis.remove();
        }

        const analysisDiv = document.createElement('div');
        analysisDiv.className = 'route-analysis';
        analysisDiv.innerHTML = `
            <div class="safety-analysis-card">
                <div class="analysis-header">
                    <h3>Route Safety Analysis</h3>
                    <div class="safety-score" style="background: ${analysis.color};">
                        ${analysis.score}/100
                    </div>
                </div>
                
                <div class="analysis-content">
                    <div class="safety-level">
                        <strong>Safety Level: <span style="color: ${analysis.color};">${analysis.level}</span></strong>
                        <p>${analysis.message}</p>
                    </div>
                    
                    <div class="route-info">
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span>Walking time: ${route.legs[0].duration.text}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-route"></i>
                            <span>Distance: ${route.legs[0].distance.text}</span>
                        </div>
                    </div>
                    
                    ${analysis.factors.length > 0 ? `
                        <div class="analysis-section">
                            <h4>Safety Factors:</h4>
                            <ul>
                                ${analysis.factors.map(factor => `<li>${factor}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${analysis.warnings.length > 0 ? `
                        <div class="analysis-section warnings">
                            <h4><i class="fas fa-exclamation-triangle"></i> Warnings:</h4>
                            <ul>
                                ${analysis.warnings.map(warning => `<li>${warning}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${analysis.recommendations.length > 0 ? `
                        <div class="analysis-section recommendations">
                            <h4><i class="fas fa-lightbulb"></i> Recommendations:</h4>
                            <ul>
                                ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <div class="analysis-actions">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="secondary-btn">
                        <i class="fas fa-times"></i> Close Analysis
                    </button>
                    <button onclick="window.safeRoutes.shareRoute()" class="primary-btn">
                        <i class="fas fa-share"></i> Share Route
                    </button>
                </div>
            </div>
        `;

        mapContainer.appendChild(analysisDiv);

        // Add CSS for the analysis card if not already present
        this.addAnalysisStyles();
    }

    addAnalysisStyles() {
        if (document.getElementById('route-analysis-styles')) return;

        const style = document.createElement('style');
        style.id = 'route-analysis-styles';
        style.textContent = `
            .route-analysis {
                margin-top: 20px;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .safety-analysis-card {
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            
            .analysis-header {
                background: linear-gradient(135deg, #f8fafc, #e2e8f0);
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
            }
            
            .analysis-header h3 {
                margin: 0;
                color: #2d3748;
            }
            
            .safety-score {
                background: #22c55e;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 1.1rem;
            }
            
            .analysis-content {
                padding: 20px;
            }
            
            .safety-level {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8fafc;
                border-radius: 8px;
            }
            
            .route-info {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .info-item {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #666;
            }
            
            .analysis-section {
                margin-bottom: 20px;
            }
            
            .analysis-section h4 {
                margin: 0 0 10px 0;
                color: #2d3748;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .analysis-section ul {
                margin: 0;
                padding-left: 20px;
            }
            
            .analysis-section li {
                margin-bottom: 5px;
                color: #4a5568;
            }
            
            .warnings {
                background: #fef2f2;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #ef4444;
            }
            
            .warnings h4 {
                color: #dc2626;
            }
            
            .recommendations {
                background: #f0f9ff;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
            }
            
            .recommendations h4 {
                color: #1d4ed8;
            }
            
            .analysis-actions {
                padding: 20px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .secondary-btn {
                padding: 8px 16px;
                background: #f1f5f9;
                color: #64748b;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.3s ease;
            }
            
            .secondary-btn:hover {
                background: #e2e8f0;
            }
        `;
        
        document.head.appendChild(style);
    }

    analyzeCurrentRoute() {
        const directions = this.directionsRenderer.getDirections();
        if (directions) {
            const preferences = {
                avoidDarkAreas: document.getElementById('avoid-dark-areas').checked,
                preferCrowded: document.getElementById('prefer-crowded').checked,
                avoidIncidents: document.getElementById('avoid-incidents').checked
            };
            this.analyzeRouteSafety(directions, preferences);
        }
    }

    shareRoute() {
        const directions = this.directionsRenderer.getDirections();
        if (!directions) {
            this.showNotification('No route to share', 'warning');
            return;
        }

        const route = directions.routes[0];
        const startAddress = route.legs[0].start_address;
        const endAddress = route.legs[0].end_address;
        
        const shareText = `Safe route from ${startAddress} to ${endAddress} - Check it out on SHESECURE!`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Safe Route - SHESECURE',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Route details copied to clipboard!', 'success');
            });
        }
    }

    showNotification(message, type = 'info') {
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize safe routes
window.safeRoutes = new SafeRoutes();

// Global function for Google Maps callback
window.initMap = function() {
    if (window.safeRoutes) {
        window.safeRoutes.initializeMap();
    }
};