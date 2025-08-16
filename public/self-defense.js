// Self Defense functionality
class SelfDefense {
    constructor() {
        this.instructors = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInstructors();
    }

    setupEventListeners() {
        // Become instructor button
        const becomeInstructorBtn = document.querySelector('.become-instructor-btn');
        if (becomeInstructorBtn) {
            becomeInstructorBtn.addEventListener('click', () => {
                this.showModal('instructor-modal');
            });
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
                    priceInput.querySelector('input').required = true;
                } else {
                    priceInput.classList.add('hidden');
                    priceInput.querySelector('input').required = false;
                }
            });
        });

        // Filter functionality
        const priceFilter = document.getElementById('price-filter');
        const skillFilter = document.getElementById('skill-filter');
        
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.filterInstructors());
        }
        
        if (skillFilter) {
            skillFilter.addEventListener('change', () => this.filterInstructors());
        }
    }

    async handleInstructorRegistration(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = e.target.querySelector('input[placeholder*="Name"]').value;
        const specialization = e.target.querySelector('input[placeholder*="Specialization"]').value;
        const experience = e.target.querySelector('textarea').value;
        const location = e.target.querySelector('input[placeholder*="Location"]').value;
        const pricing = e.target.querySelector('input[name="pricing"]:checked').value;
        const price = e.target.querySelector('input[type="number"]')?.value || 0;
        const skillLevel = e.target.querySelector('select').value;
        const contact = e.target.querySelector('input[type="tel"]').value;
        const email = e.target.querySelector('input[type="email"]').value;

        // Validation
        if (!name || !specialization || !experience || !location || !skillLevel || !contact || !email) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        if (pricing === 'paid' && (!price || price <= 0)) {
            this.showNotification('Please enter a valid price for paid sessions', 'warning');
            return;
        }

        try {
            const instructorData = {
                id: Date.now(),
                name: name,
                specialization: specialization,
                experience: experience,
                location: location,
                pricing: pricing,
                price: pricing === 'paid' ? parseFloat(price) : 0,
                skillLevel: skillLevel,
                contact: contact,
                email: email,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.currentUser?.uid || 'anonymous',
                verified: false,
                rating: 0,
                students: 0,
                reviews: []
            };

            await this.saveInstructor(instructorData);
            this.instructors.push(instructorData);
            this.displayInstructors();
            
            // Close modal and reset form
            this.hideModals();
            e.target.reset();
            document.getElementById('price-input').classList.add('hidden');
            
            this.showNotification('Instructor registration submitted! We will review and contact you soon.', 'success');
            
        } catch (error) {
            console.error('Error registering instructor:', error);
            this.showNotification('Failed to submit registration. Please try again.', 'error');
        }
    }

    async saveInstructor(instructorData) {
        if (window.db) {
            // Save to Firebase Firestore
            await db.collection('self-defense-instructors').add(instructorData);
        } else {
            // Save to localStorage for demo
            const existingInstructors = JSON.parse(localStorage.getItem('self-defense-instructors') || '[]');
            existingInstructors.push(instructorData);
            localStorage.setItem('self-defense-instructors', JSON.stringify(existingInstructors));
        }
    }

    async loadInstructors() {
        try {
            if (window.db) {
                // Load from Firebase
                const snapshot = await db.collection('self-defense-instructors')
                    .where('verified', '==', true)
                    .orderBy('rating', 'desc')
                    .get();
                
                this.instructors = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Load from localStorage
                this.instructors = JSON.parse(localStorage.getItem('self-defense-instructors') || '[]');
                
                // Add sample data if empty
                if (this.instructors.length === 0) {
                    this.instructors = this.getSampleInstructors();
                }
            }
            
            this.displayInstructors();
        } catch (error) {
            console.error('Error loading instructors:', error);
            this.instructors = this.getSampleInstructors();
            this.displayInstructors();
        }
    }

    getSampleInstructors() {
        return [
            {
                id: 1,
                name: 'Jennifer Adams',
                specialization: 'Krav Maga & Women\'s Self Defense',
                experience: '8 years teaching experience with focus on practical self-defense techniques for women. Certified Krav Maga instructor.',
                location: 'Manhattan, NYC',
                pricing: 'free',
                price: 0,
                skillLevel: 'all',
                contact: '+1 (555) 123-4567',
                email: 'jennifer.adams@email.com',
                verified: true,
                rating: 4.9,
                students: 245,
                reviews: [
                    'Amazing instructor! Very patient and knowledgeable.',
                    'Learned so much in just a few sessions. Highly recommend!',
                    'Jennifer makes everyone feel comfortable and confident.'
                ]
            },
            {
                id: 2,
                name: 'Michelle Torres',
                specialization: 'Karate & Traditional Martial Arts',
                experience: '12 years martial arts experience, 6 years teaching. Black belt in Shotokan Karate with emphasis on discipline and technique.',
                location: 'Brooklyn, NYC',
                pricing: 'paid',
                price: 30,
                skillLevel: 'beginner',
                contact: '+1 (555) 234-5678',
                email: 'michelle.torres@email.com',
                verified: true,
                rating: 4.7,
                students: 156,
                reviews: [
                    'Great technique instruction and very professional.',
                    'Worth every penny! Michelle is an excellent teacher.',
                    'Perfect for beginners who want to learn proper form.'
                ]
            },
            {
                id: 3,
                name: 'Ashley Kim',
                specialization: 'Women\'s Self Defense & Situational Awareness',
                experience: '5 years specialized training in women\'s safety and self-defense. Focus on practical techniques and confidence building.',
                location: 'Queens, NYC',
                pricing: 'free',
                price: 0,
                skillLevel: 'beginner',
                contact: '+1 (555) 345-6789',
                email: 'ashley.kim@email.com',
                verified: true,
                rating: 4.8,
                students: 89,
                reviews: [
                    'Ashley creates a safe and supportive learning environment.',
                    'Learned valuable skills that I hope I never need to use.',
                    'Great for building confidence and awareness.'
                ]
            },
            {
                id: 4,
                name: 'Rachel Martinez',
                specialization: 'Boxing & Fitness Self Defense',
                experience: '10 years boxing experience, 4 years teaching self-defense through boxing techniques. Focus on fitness and practical skills.',
                location: 'Bronx, NYC',
                pricing: 'paid',
                price: 25,
                skillLevel: 'intermediate',
                contact: '+1 (555) 456-7890',
                email: 'rachel.martinez@email.com',
                verified: true,
                rating: 4.6,
                students: 134,
                reviews: [
                    'Great workout combined with practical self-defense.',
                    'Rachel pushes you to be your best while staying safe.',
                    'Love the combination of fitness and self-defense.'
                ]
            }
        ];
    }

    displayInstructors() {
        const instructorsGrid = document.getElementById('instructors-grid');
        if (!instructorsGrid) return;

        if (this.instructors.length === 0) {
            instructorsGrid.innerHTML = `
                <div class="empty-instructors" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <i class="fas fa-fist-raised" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>No instructors found</h3>
                    <p>Be the first to register as a self-defense instructor!</p>
                    <button class="primary-btn" onclick="document.querySelector('.become-instructor-btn').click()">
                        <i class="fas fa-plus"></i> Become an Instructor
                    </button>
                </div>
            `;
            return;
        }

        instructorsGrid.innerHTML = this.instructors.map(instructor => this.createInstructorCard(instructor)).join('');
        
        // Add event listeners to contact buttons
        this.setupInstructorInteractions();
    }

    createInstructorCard(instructor) {
        const priceDisplay = instructor.pricing === 'free' ? 'Free' : `$${instructor.price}/session`;
        const skillLevelDisplay = instructor.skillLevel === 'all' ? 'All Levels' : 
            instructor.skillLevel.charAt(0).toUpperCase() + instructor.skillLevel.slice(1);
        
        return `
            <div class="instructor-card" data-instructor-id="${instructor.id}">
                <div class="instructor-header">
                    <div class="instructor-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="instructor-info">
                        <h3>${instructor.name}</h3>
                        <div class="instructor-rating">
                            ${this.createStars(instructor.rating)}
                            <span class="rating-text">${instructor.rating.toFixed(1)} (${instructor.students} students)</span>
                        </div>
                    </div>
                    <div class="verified-badge ${instructor.verified ? 'verified' : 'pending'}">
                        <i class="fas fa-${instructor.verified ? 'check-circle' : 'clock'}"></i>
                        ${instructor.verified ? 'Verified' : 'Pending'}
                    </div>
                </div>
                
                <div class="instructor-details">
                    <div class="detail-item">
                        <strong>Specialization:</strong>
                        <span>${instructor.specialization}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Experience:</strong>
                        <span>${instructor.experience}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Location:</strong>
                        <span>${instructor.location}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Skill Level:</strong>
                        <span>${skillLevelDisplay}</span>
                    </div>
                </div>
                
                ${instructor.reviews && instructor.reviews.length > 0 ? `
                    <div class="instructor-reviews">
                        <h4>Recent Reviews:</h4>
                        <div class="review-preview">
                            "${instructor.reviews[0]}"
                        </div>
                        ${instructor.reviews.length > 1 ? `
                            <button class="view-all-reviews" data-instructor-id="${instructor.id}">
                                View all ${instructor.reviews.length} reviews
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div class="instructor-footer">
                    <div class="price-tag ${instructor.pricing}">
                        <strong>${priceDisplay}</strong>
                    </div>
                    <div class="instructor-actions">
                        <button class="contact-btn" data-instructor-id="${instructor.id}" data-contact="${instructor.contact}">
                            <i class="fas fa-phone"></i> Contact
                        </button>
                        <button class="email-btn" data-instructor-id="${instructor.id}" data-email="${instructor.email}">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupInstructorInteractions() {
        // Contact buttons
        document.querySelectorAll('.contact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contact = e.currentTarget.dataset.contact;
                window.open(`tel:${contact}`);
            });
        });

        // Email buttons
        document.querySelectorAll('.email-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.currentTarget.dataset.email;
                const instructorId = e.currentTarget.dataset.instructorId;
                const instructor = this.instructors.find(i => i.id == instructorId);
                
                const subject = `Self Defense Training Inquiry - ${instructor.name}`;
                const body = `Hi ${instructor.name},\n\nI'm interested in your self-defense classes. Could you please provide more information about:\n\n- Available schedules\n- Class locations\n- What to expect in the first session\n\nThank you!\n\nBest regards`;
                
                window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
            });
        });

        // View all reviews buttons
        document.querySelectorAll('.view-all-reviews').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const instructorId = e.currentTarget.dataset.instructorId;
                this.showAllReviews(instructorId);
            });
        });
    }

    showAllReviews(instructorId) {
        const instructor = this.instructors.find(i => i.id == instructorId);
        if (!instructor || !instructor.reviews) return;

        const modal = document.createElement('div');
        modal.className = 'reviews-modal modal active';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reviews for ${instructor.name}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="reviews-content">
                    <div class="instructor-summary">
                        <div class="rating-summary">
                            ${this.createStars(instructor.rating)}
                            <span>${instructor.rating.toFixed(1)} out of 5 (${instructor.students} students)</span>
                        </div>
                    </div>
                    <div class="all-reviews">
                        ${instructor.reviews.map((review, index) => `
                            <div class="review-item">
                                <div class="review-header">
                                    <div class="reviewer-avatar">
                                        <i class="fas fa-user-circle"></i>
                                    </div>
                                    <div class="reviewer-info">
                                        <strong>Student ${index + 1}</strong>
                                        <div class="review-rating">${this.createStars(5)}</div>
                                    </div>
                                </div>
                                <div class="review-text">"${review}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.body.appendChild(modal);
    }

    filterInstructors() {
        const priceFilter = document.getElementById('price-filter').value;
        const skillFilter = document.getElementById('skill-filter').value;
        
        let filteredInstructors = this.instructors;

        // Filter by price
        if (priceFilter !== 'all') {
            filteredInstructors = filteredInstructors.filter(instructor => {
                return instructor.pricing === priceFilter;
            });
        }

        // Filter by skill level
        if (skillFilter !== 'all') {
            filteredInstructors = filteredInstructors.filter(instructor => {
                return instructor.skillLevel === skillFilter || instructor.skillLevel === 'all';
            });
        }

        // Display filtered results
        const instructorsGrid = document.getElementById('instructors-grid');
        if (filteredInstructors.length === 0) {
            instructorsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <p>No instructors found matching your criteria.</p>
                    <button class="primary-btn" onclick="this.parentElement.parentElement.querySelector('#price-filter').value='all'; this.parentElement.parentElement.querySelector('#skill-filter').value='all'; window.selfDefense.filterInstructors();">
                        Clear Filters
                    </button>
                </div>
            `;
        } else {
            instructorsGrid.innerHTML = filteredInstructors.map(instructor => this.createInstructorCard(instructor)).join('');
            this.setupInstructorInteractions();
        }
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

    showNotification(message, type = 'info') {
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize self defense
window.selfDefense = new SelfDefense();