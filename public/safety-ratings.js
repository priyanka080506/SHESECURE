// Safety Ratings functionality
class SafetyRatings {
    constructor() {
        this.ratings = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRatings();
    }

    setupEventListeners() {
        // Rating form submission
        const ratingForm = document.getElementById('rating-form');
        if (ratingForm) {
            ratingForm.addEventListener('submit', (e) => this.handleRatingSubmission(e));
        }

        // Filter functionality
        const ratingFilter = document.getElementById('rating-filter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => this.filterRatings(e.target.value));
        }

        // Star rating interactions
        this.setupStarRatings();
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
                    rating.dataset.rating = currentRating;
                });
            });
        });
    }

    highlightStars(stars, count) {
        stars.forEach((star, index) => {
            if (index < count) {
                star.classList.add('active');
                star.style.color = '#ffd700';
            } else {
                star.classList.remove('active');
                star.style.color = '#ddd';
            }
        });
    }

    async handleRatingSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const location = e.target.querySelector('input[type="text"]').value;
        const review = e.target.querySelector('textarea').value;
        
        // Collect star ratings
        const ratings = {};
        document.querySelectorAll('.star-rating').forEach(rating => {
            const category = rating.dataset.category;
            const value = parseInt(rating.dataset.rating) || 0;
            ratings[category] = value;
        });

        const ratingData = {
            id: Date.now(),
            location: location,
            ratings: ratings,
            review: review,
            timestamp: new Date().toISOString(),
            userId: window.authManager?.currentUser?.uid || 'anonymous',
            userName: window.authManager?.currentUser?.displayName || 'Anonymous User'
        };

        try {
            // In a real app, save to Firebase
            await this.saveRating(ratingData);
            this.ratings.push(ratingData);
            this.displayRatings();
            
            // Close modal and show success message
            document.getElementById('rating-modal').style.display = 'none';
            this.showNotification('Rating submitted successfully!', 'success');
            
            // Reset form
            e.target.reset();
            this.resetStarRatings();
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showNotification('Failed to submit rating. Please try again.', 'error');
        }
    }

    async saveRating(ratingData) {
        // In a real app, this would save to Firebase Firestore
        if (window.db) {
            await db.collection('safety-ratings').add(ratingData);
        } else {
            // Store locally for demo
            const existingRatings = JSON.parse(localStorage.getItem('safety-ratings') || '[]');
            existingRatings.push(ratingData);
            localStorage.setItem('safety-ratings', JSON.stringify(existingRatings));
        }
    }

    async loadRatings() {
        try {
            if (window.db) {
                // Load from Firebase
                const snapshot = await db.collection('safety-ratings')
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .get();
                
                this.ratings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Load from localStorage for demo
                this.ratings = JSON.parse(localStorage.getItem('safety-ratings') || '[]');
                
                // Add sample data if empty
                if (this.ratings.length === 0) {
                    this.ratings = this.getSampleRatings();
                }
            }
            
            this.displayRatings();
        } catch (error) {
            console.error('Error loading ratings:', error);
            this.ratings = this.getSampleRatings();
            this.displayRatings();
        }
    }

    getSampleRatings() {
        return [
            {
                id: 1,
                location: 'Central Park, NYC',
                ratings: { overall: 5, lighting: 4, crowd: 5 },
                review: 'Very safe during the day with lots of people around. Well-lit paths.',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                userName: 'Sarah Johnson',
                userId: 'user1'
            },
            {
                id: 2,
                location: 'Times Square',
                ratings: { overall: 5, lighting: 5, crowd: 5 },
                review: 'Always crowded and very well lit. Feels very safe even at night.',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                userName: 'Emma Wilson',
                userId: 'user2'
            },
            {
                id: 3,
                location: 'Brooklyn Bridge',
                ratings: { overall: 4, lighting: 3, crowd: 4 },
                review: 'Beautiful walk but can get dark in some areas. Better during daylight.',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                userName: 'Lisa Chen',
                userId: 'user3'
            }
        ];
    }

    displayRatings() {
        const ratingsGrid = document.getElementById('ratings-grid');
        if (!ratingsGrid) return;

        ratingsGrid.innerHTML = this.ratings.map(rating => this.createRatingCard(rating)).join('');
    }

    createRatingCard(rating) {
        const overallRating = rating.ratings.overall || 0;
        const timeAgo = this.getTimeAgo(rating.timestamp);
        
        return `
            <div class="rating-card" data-rating="${overallRating}">
                <div class="card-header">
                    <h3>${rating.location}</h3>
                    <div class="overall-rating">
                        ${this.createStars(overallRating)}
                        <span class="rating-value">${overallRating.toFixed(1)}</span>
                    </div>
                </div>
                
                <div class="rating-details">
                    <div class="rating-detail">
                        <span class="rating-label">Overall Safety:</span>
                        <div class="rating-stars">${this.createStars(rating.ratings.overall || 0)}</div>
                    </div>
                    <div class="rating-detail">
                        <span class="rating-label">Lighting:</span>
                        <div class="rating-stars">${this.createStars(rating.ratings.lighting || 0)}</div>
                    </div>
                    <div class="rating-detail">
                        <span class="rating-label">Crowd Density:</span>
                        <div class="rating-stars">${this.createStars(rating.ratings.crowd || 0)}</div>
                    </div>
                </div>
                
                ${rating.review ? `
                    <div class="rating-review">
                        <p>"${rating.review}"</p>
                    </div>
                ` : ''}
                
                <div class="rating-footer">
                    <div class="rating-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${rating.userName}</span>
                    </div>
                    <div class="rating-time">
                        <i class="fas fa-clock"></i>
                        <span>${timeAgo}</span>
                    </div>
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

    filterRatings(filterValue) {
        const ratingsGrid = document.getElementById('ratings-grid');
        if (!ratingsGrid) return;

        let filteredRatings = this.ratings;

        if (filterValue !== 'all') {
            const targetRating = parseInt(filterValue);
            filteredRatings = this.ratings.filter(rating => {
                const overallRating = Math.round(rating.ratings.overall || 0);
                return overallRating === targetRating;
            });
        }

        ratingsGrid.innerHTML = filteredRatings.map(rating => this.createRatingCard(rating)).join('');
        
        // Show message if no results
        if (filteredRatings.length === 0) {
            ratingsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <p>No ratings found for the selected filter.</p>
                </div>
            `;
        }
    }

    resetStarRatings() {
        document.querySelectorAll('.star-rating').forEach(rating => {
            rating.dataset.rating = '0';
            const stars = rating.querySelectorAll('i');
            this.highlightStars(stars, 0);
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return time.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        // Use the main app's notification system
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize safety ratings
window.safetyRatings = new SafetyRatings();