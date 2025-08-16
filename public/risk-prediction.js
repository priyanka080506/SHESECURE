// Risk Prediction functionality
class RiskPrediction {
    constructor() {
        this.currentRisk = {
            level: 'LOW',
            percentage: 25,
            score: 25
        };
        this.riskFactors = [];
        this.recommendations = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startRiskMonitoring();
        this.updateRiskPrediction();
    }

    setupEventListeners() {
        // Refresh risk assessment button (if added)
        const refreshBtn = document.querySelector('.refresh-risk-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateRiskPrediction());
        }

        // Location sharing toggle
        const locationToggle = document.querySelector('.location-sharing-toggle');
        if (locationToggle) {
            locationToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.enableLocationTracking();
                } else {
                    this.disableLocationTracking();
                }
            });
        }
    }

    startRiskMonitoring() {
        // Update risk assessment every 5 minutes
        setInterval(() => {
            this.updateRiskPrediction();
        }, 300000); // 5 minutes

        // Update more frequently during high-risk periods
        setInterval(() => {
            const currentHour = new Date().getHours();
            if (currentHour >= 22 || currentHour <= 5) {
                this.updateRiskPrediction();
            }
        }, 60000); // 1 minute during night hours
    }

    async updateRiskPrediction() {
        try {
            // Get current location if available
            const location = await this.getCurrentLocation();
            
            // Analyze various risk factors
            const riskAnalysis = await this.analyzeRiskFactors(location);
            
            // Update risk display
            this.displayRiskAssessment(riskAnalysis);
            
            // Update recommendations
            this.updateRecommendations(riskAnalysis);
            
            // Store risk data for historical analysis
            this.storeRiskData(riskAnalysis);
            
        } catch (error) {
            console.error('Error updating risk prediction:', error);
            this.displayDefaultRisk();
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
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    // Use default location (NYC) if geolocation fails
                    resolve({
                        lat: 40.7128,
                        lng: -74.0060,
                        accuracy: null
                    });
                },
                {
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    async analyzeRiskFactors(location) {
        const factors = [];
        let riskScore = 50; // Base risk score

        // Time-based risk analysis
        const timeAnalysis = this.analyzeTimeFactors();
        riskScore += timeAnalysis.scoreModifier;
        factors.push(...timeAnalysis.factors);

        // Location-based risk analysis
        if (location) {
            const locationAnalysis = await this.analyzeLocationFactors(location);
            riskScore += locationAnalysis.scoreModifier;
            factors.push(...locationAnalysis.factors);
        }

        // Weather-based risk analysis
        const weatherAnalysis = await this.analyzeWeatherFactors();
        riskScore += weatherAnalysis.scoreModifier;
        factors.push(...weatherAnalysis.factors);

        // Historical data analysis
        const historicalAnalysis = this.analyzeHistoricalData();
        riskScore += historicalAnalysis.scoreModifier;
        factors.push(...historicalAnalysis.factors);

        // Personal behavior analysis
        const behaviorAnalysis = this.analyzeBehaviorPatterns();
        riskScore += behaviorAnalysis.scoreModifier;
        factors.push(...behaviorAnalysis.factors);

        // Ensure score is within bounds
        riskScore = Math.max(0, Math.min(100, riskScore));

        return {
            score: riskScore,
            factors: factors,
            location: location,
            timestamp: new Date().toISOString()
        };
    }

    analyzeTimeFactors() {
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const factors = [];
        let scoreModifier = 0;

        // Hour-based analysis
        if (hour >= 6 && hour <= 18) {
            // Daytime - lower risk
            scoreModifier -= 20;
            factors.push({
                type: 'time',
                description: 'Daytime hours (6 AM - 6 PM)',
                impact: 'positive',
                weight: 'high'
            });
        } else if (hour >= 19 && hour <= 21) {
            // Early evening - moderate risk
            scoreModifier -= 5;
            factors.push({
                type: 'time',
                description: 'Early evening hours (7 PM - 9 PM)',
                impact: 'neutral',
                weight: 'medium'
            });
        } else if (hour >= 22 || hour <= 2) {
            // Late night - higher risk
            scoreModifier += 25;
            factors.push({
                type: 'time',
                description: 'Late night hours (10 PM - 2 AM)',
                impact: 'negative',
                weight: 'high'
            });
        } else {
            // Very early morning - high risk
            scoreModifier += 15;
            factors.push({
                type: 'time',
                description: 'Very early morning hours (3 AM - 5 AM)',
                impact: 'negative',
                weight: 'high'
            });
        }

        // Day of week analysis
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Weekend - potentially higher risk due to more activity
            scoreModifier += 5;
            factors.push({
                type: 'time',
                description: 'Weekend - increased social activity',
                impact: 'neutral',
                weight: 'low'
            });
        }

        return { scoreModifier, factors };
    }

    async analyzeLocationFactors(location) {
        const factors = [];
        let scoreModifier = 0;

        // Simulate location-based risk analysis
        // In a real app, this would use actual crime data, lighting data, etc.
        
        // Population density simulation
        const populationDensity = this.simulatePopulationDensity(location);
        if (populationDensity > 0.7) {
            scoreModifier -= 10;
            factors.push({
                type: 'location',
                description: 'High population density area',
                impact: 'positive',
                weight: 'medium'
            });
        } else if (populationDensity < 0.3) {
            scoreModifier += 15;
            factors.push({
                type: 'location',
                description: 'Low population density area',
                impact: 'negative',
                weight: 'medium'
            });
        }

        // Lighting conditions simulation
        const lightingQuality = this.simulateLightingConditions(location);
        if (lightingQuality > 0.8) {
            scoreModifier -= 8;
            factors.push({
                type: 'location',
                description: 'Well-lit area with good visibility',
                impact: 'positive',
                weight: 'medium'
            });
        } else if (lightingQuality < 0.4) {
            scoreModifier += 12;
            factors.push({
                type: 'location',
                description: 'Poorly lit area with limited visibility',
                impact: 'negative',
                weight: 'high'
            });
        }

        // Crime statistics simulation
        const crimeRate = this.simulateCrimeRate(location);
        if (crimeRate > 0.7) {
            scoreModifier += 20;
            factors.push({
                type: 'location',
                description: 'Area with higher reported incidents',
                impact: 'negative',
                weight: 'high'
            });
        } else if (crimeRate < 0.3) {
            scoreModifier -= 10;
            factors.push({
                type: 'location',
                description: 'Area with low incident reports',
                impact: 'positive',
                weight: 'medium'
            });
        }

        return { scoreModifier, factors };
    }

    async analyzeWeatherFactors() {
        const factors = [];
        let scoreModifier = 0;

        // Simulate weather conditions
        // In a real app, this would use actual weather API
        const weather = this.simulateWeatherConditions();

        if (weather.visibility === 'poor') {
            scoreModifier += 10;
            factors.push({
                type: 'weather',
                description: 'Poor visibility due to weather conditions',
                impact: 'negative',
                weight: 'medium'
            });
        } else if (weather.visibility === 'excellent') {
            scoreModifier -= 5;
            factors.push({
                type: 'weather',
                description: 'Clear weather with good visibility',
                impact: 'positive',
                weight: 'low'
            });
        }

        if (weather.precipitation === 'heavy') {
            scoreModifier += 8;
            factors.push({
                type: 'weather',
                description: 'Heavy precipitation affecting movement',
                impact: 'negative',
                weight: 'medium'
            });
        }

        return { scoreModifier, factors };
    }

    analyzeHistoricalData() {
        const factors = [];
        let scoreModifier = 0;

        // Analyze stored risk data for patterns
        const historicalData = this.getStoredRiskData();
        
        if (historicalData.length > 0) {
            const recentHighRiskEvents = historicalData.filter(data => {
                const dataTime = new Date(data.timestamp);
                const hoursDiff = (new Date() - dataTime) / (1000 * 60 * 60);
                return hoursDiff <= 24 && data.score > 70;
            });

            if (recentHighRiskEvents.length > 0) {
                scoreModifier += 5;
                factors.push({
                    type: 'historical',
                    description: 'Recent high-risk periods detected in your area',
                    impact: 'negative',
                    weight: 'low'
                });
            }
        }

        return { scoreModifier, factors };
    }

    analyzeBehaviorPatterns() {
        const factors = [];
        let scoreModifier = 0;

        // Analyze user behavior patterns
        const behaviorData = this.getUserBehaviorData();
        
        if (behaviorData.frequentNightActivity) {
            scoreModifier += 5;
            factors.push({
                type: 'behavior',
                description: 'Frequent late-night activity detected',
                impact: 'neutral',
                weight: 'low'
            });
        }

        if (behaviorData.regularRoutes) {
            scoreModifier -= 3;
            factors.push({
                type: 'behavior',
                description: 'Using familiar, regular routes',
                impact: 'positive',
                weight: 'low'
            });
        }

        return { scoreModifier, factors };
    }

    displayRiskAssessment(analysis) {
        const riskMeter = document.getElementById('current-risk-level');
        const factorsContainer = document.getElementById('risk-factors');
        
        if (!riskMeter || !factorsContainer) return;

        // Determine risk level and color
        let level, className, percentage;
        if (analysis.score <= 30) {
            level = 'LOW';
            className = 'low';
            percentage = analysis.score;
        } else if (analysis.score <= 60) {
            level = 'MEDIUM';
            className = 'medium';
            percentage = analysis.score;
        } else {
            level = 'HIGH';
            className = 'high';
            percentage = analysis.score;
        }

        // Update risk meter
        riskMeter.className = `risk-level ${className}`;
        riskMeter.innerHTML = `
            <span class="risk-text">${level}</span>
            <span class="risk-percentage">${percentage}%</span>
        `;

        // Update risk factors
        factorsContainer.innerHTML = analysis.factors.map(factor => `
            <div class="factor-item ${factor.impact}">
                <div class="factor-header">
                    <i class="fas fa-${this.getFactorIcon(factor.type)}"></i>
                    <span class="factor-type">${factor.type.toUpperCase()}</span>
                    <span class="factor-weight ${factor.weight}">${factor.weight}</span>
                </div>
                <div class="factor-description">${factor.description}</div>
            </div>
        `).join('');

        // Store current risk
        this.currentRisk = {
            level,
            percentage,
            score: analysis.score
        };
    }

    updateRecommendations(analysis) {
        const recommendationsContainer = document.getElementById('recommendations-list');
        if (!recommendationsContainer) return;

        const recommendations = this.generateRecommendations(analysis);
        
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}">
                <div class="recommendation-header">
                    <i class="fas fa-${rec.icon}"></i>
                    <span class="recommendation-title">${rec.title}</span>
                    <span class="priority-badge ${rec.priority}">${rec.priority}</span>
                </div>
                <div class="recommendation-description">${rec.description}</div>
                ${rec.action ? `
                    <button class="recommendation-action" onclick="${rec.action}">
                        ${rec.actionText}
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        const currentHour = new Date().getHours();

        // Time-based recommendations
        if (currentHour >= 22 || currentHour <= 5) {
            recommendations.push({
                title: 'Late Night Safety',
                description: 'Consider using ride-share services or public transportation instead of walking alone.',
                icon: 'car',
                priority: 'high',
                action: 'window.open("https://uber.com", "_blank")',
                actionText: 'Book Ride'
            });
        }

        // Score-based recommendations
        if (analysis.score > 70) {
            recommendations.push({
                title: 'High Risk Alert',
                description: 'Current conditions indicate elevated risk. Share your location with trusted contacts.',
                icon: 'exclamation-triangle',
                priority: 'high',
                action: 'window.safeRoutes?.shareCurrentLocation()',
                actionText: 'Share Location'
            });
        }

        // Location-based recommendations
        const hasLocationFactors = analysis.factors.some(f => f.type === 'location' && f.impact === 'negative');
        if (hasLocationFactors) {
            recommendations.push({
                title: 'Area Awareness',
                description: 'Stay alert in this area. Keep to well-lit, populated streets and trust your instincts.',
                icon: 'eye',
                priority: 'medium'
            });
        }

        // General safety recommendations
        recommendations.push({
            title: 'Emergency Preparedness',
            description: 'Ensure your emergency contacts are up to date and your phone is charged.',
            icon: 'battery-full',
            priority: 'low',
            action: 'document.getElementById("emergency-btn").click()',
            actionText: 'Check Emergency Settings'
        });

        if (analysis.score > 40) {
            recommendations.push({
                title: 'Route Planning',
                description: 'Plan your route in advance using our safe route navigation feature.',
                icon: 'route',
                priority: 'medium',
                action: 'document.querySelector("[data-section=\'safe-routes\']").click()',
                actionText: 'Plan Safe Route'
            });
        }

        return recommendations;
    }

    // Simulation functions (in real app, these would use actual data)
    simulatePopulationDensity(location) {
        // Simulate based on location coordinates
        return 0.3 + (Math.sin(location.lat) + Math.cos(location.lng)) * 0.3;
    }

    simulateLightingConditions(location) {
        const hour = new Date().getHours();
        let baseLight = hour >= 6 && hour <= 18 ? 0.9 : 0.4;
        return Math.max(0, Math.min(1, baseLight + Math.random() * 0.3 - 0.15));
    }

    simulateCrimeRate(location) {
        // Simulate crime rate based on location
        return Math.random() * 0.8;
    }

    simulateWeatherConditions() {
        const conditions = ['clear', 'cloudy', 'rainy', 'foggy'];
        const visibility = ['excellent', 'good', 'fair', 'poor'];
        const precipitation = ['none', 'light', 'moderate', 'heavy'];
        
        return {
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            visibility: visibility[Math.floor(Math.random() * visibility.length)],
            precipitation: precipitation[Math.floor(Math.random() * precipitation.length)]
        };
    }

    getFactorIcon(type) {
        const icons = {
            time: 'clock',
            location: 'map-marker-alt',
            weather: 'cloud',
            historical: 'history',
            behavior: 'user'
        };
        return icons[type] || 'info-circle';
    }

    storeRiskData(analysis) {
        try {
            const existingData = JSON.parse(localStorage.getItem('risk-history') || '[]');
            existingData.push(analysis);
            
            // Keep only last 100 entries
            if (existingData.length > 100) {
                existingData.splice(0, existingData.length - 100);
            }
            
            localStorage.setItem('risk-history', JSON.stringify(existingData));
        } catch (error) {
            console.error('Error storing risk data:', error);
        }
    }

    getStoredRiskData() {
        try {
            return JSON.parse(localStorage.getItem('risk-history') || '[]');
        } catch (error) {
            console.error('Error retrieving risk data:', error);
            return [];
        }
    }

    getUserBehaviorData() {
        // Simulate user behavior analysis
        return {
            frequentNightActivity: Math.random() > 0.7,
            regularRoutes: Math.random() > 0.5,
            emergencyContactsUpdated: Math.random() > 0.3
        };
    }

    displayDefaultRisk() {
        const riskMeter = document.getElementById('current-risk-level');
        if (riskMeter) {
            riskMeter.className = 'risk-level medium';
            riskMeter.innerHTML = `
                <span class="risk-text">MEDIUM</span>
                <span class="risk-percentage">50%</span>
            `;
        }

        const factorsContainer = document.getElementById('risk-factors');
        if (factorsContainer) {
            factorsContainer.innerHTML = `
                <div class="factor-item neutral">
                    <div class="factor-description">Unable to assess current risk factors. Please enable location services for more accurate predictions.</div>
                </div>
            `;
        }
    }

    enableLocationTracking() {
        this.updateRiskPrediction();
        this.showNotification('Location tracking enabled for better risk assessment', 'success');
    }

    disableLocationTracking() {
        this.showNotification('Location tracking disabled. Risk assessment will be limited.', 'info');
    }

    showNotification(message, type = 'info') {
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize risk prediction
window.riskPrediction = new RiskPrediction();