// Search functionality
class Search {
    constructor() {
        this.searchResults = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSearchData();
    }

    setupEventListeners() {
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

            // Handle enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                
                const query = searchInput ? searchInput.value : '';
                this.performSearch(query, this.currentFilter);
            });
        });

        // Search button in header
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showSearchModal();
            });
        }
    }

    showSearchModal() {
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
            
            // Focus on search input
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }

    initializeSearchData() {
        // Initialize search data from various sources
        this.loadSearchableContent();
    }

    async loadSearchableContent() {
        try {
            // Combine data from all sections
            const locations = await this.getLocationData();
            const users = await this.getUserData();
            const posts = await this.getPostData();
            const instructors = await this.getInstructorData();

            this.searchableData = {
                locations,
                users,
                posts,
                instructors
            };
        } catch (error) {
            console.error('Error loading searchable content:', error);
            this.searchableData = {
                locations: [],
                users: [],
                posts: [],
                instructors: []
            };
        }
    }

    async getLocationData() {
        // Get location data from safety ratings
        const ratings = JSON.parse(localStorage.getItem('safety-ratings') || '[]');
        return ratings.map(rating => ({
            type: 'location',
            id: rating.id,
            title: rating.location,
            description: rating.review || 'Safety rated location',
            rating: rating.ratings?.overall || 0,
            category: 'locations',
            data: rating
        }));
    }

    async getUserData() {
        // Get user data (in real app, this would be from Firebase with privacy controls)
        const sampleUsers = [
            {
                type: 'user',
                id: 1,
                title: 'Sarah Johnson',
                description: 'Active safety advocate and community member',
                avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                category: 'users',
                verified: true
            },
            {
                type: 'user',
                id: 2,
                title: 'Emma Wilson',
                description: 'Self-defense instructor and safety expert',
                avatar: 'https://images.pexels.com/photos/594421/pexels-photo-594421.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                category: 'users',
                verified: true
            },
            {
                type: 'user',
                id: 3,
                title: 'Lisa Chen',
                description: 'Community safety coordinator',
                avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                category: 'users',
                verified: false
            }
        ];
        return sampleUsers;
    }

    async getPostData() {
        // Get post data from community posts
        const posts = JSON.parse(localStorage.getItem('community-posts') || '[]');
        return posts.map(post => ({
            type: 'post',
            id: post.id,
            title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
            description: `Safety update about ${post.location}`,
            location: post.location,
            safetyLevel: post.safetyLevel,
            timestamp: post.timestamp,
            category: 'posts',
            data: post
        }));
    }

    async getInstructorData() {
        // Get instructor data
        const instructors = JSON.parse(localStorage.getItem('self-defense-instructors') || '[]');
        return instructors.map(instructor => ({
            type: 'instructor',
            id: instructor.id,
            title: instructor.name,
            description: `${instructor.specialization} instructor in ${instructor.location}`,
            specialization: instructor.specialization,
            location: instructor.location,
            rating: instructor.rating,
            pricing: instructor.pricing,
            category: 'instructors',
            data: instructor
        }));
    }

    performSearch(query, filter = 'all') {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (!query || query.trim().length < 2) {
            searchResults.innerHTML = this.getSearchPlaceholder();
            return;
        }

        const results = this.searchContent(query.trim(), filter);
        
        if (results.length === 0) {
            searchResults.innerHTML = this.getNoResultsHTML(query);
        } else {
            searchResults.innerHTML = results.map(result => this.createSearchResultItem(result)).join('');
            this.setupResultInteractions();
        }
    }

    searchContent(query, filter) {
        if (!this.searchableData) {
            return [];
        }

        const queryLower = query.toLowerCase();
        let allResults = [];

        // Search in different categories based on filter
        if (filter === 'all' || filter === 'locations') {
            const locationResults = this.searchableData.locations.filter(item =>
                item.title.toLowerCase().includes(queryLower) ||
                item.description.toLowerCase().includes(queryLower)
            );
            allResults.push(...locationResults);
        }

        if (filter === 'all' || filter === 'users') {
            const userResults = this.searchableData.users.filter(item =>
                item.title.toLowerCase().includes(queryLower) ||
                item.description.toLowerCase().includes(queryLower)
            );
            allResults.push(...userResults);
        }

        if (filter === 'all' || filter === 'posts') {
            const postResults = this.searchableData.posts.filter(item =>
                item.title.toLowerCase().includes(queryLower) ||
                item.description.toLowerCase().includes(queryLower) ||
                item.location.toLowerCase().includes(queryLower)
            );
            allResults.push(...postResults);
        }

        if (filter === 'all' || filter === 'instructors') {
            const instructorResults = this.searchableData.instructors.filter(item =>
                item.title.toLowerCase().includes(queryLower) ||
                item.description.toLowerCase().includes(queryLower) ||
                item.specialization.toLowerCase().includes(queryLower) ||
                item.location.toLowerCase().includes(queryLower)
            );
            allResults.push(...instructorResults);
        }

        // Sort results by relevance
        return this.sortResultsByRelevance(allResults, queryLower);
    }

    sortResultsByRelevance(results, query) {
        return results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            
            // Exact matches first
            if (aTitle === query && bTitle !== query) return -1;
            if (bTitle === query && aTitle !== query) return 1;
            
            // Title starts with query
            if (aTitle.startsWith(query) && !bTitle.startsWith(query)) return -1;
            if (bTitle.startsWith(query) && !aTitle.startsWith(query)) return 1;
            
            // Title contains query
            if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
            if (bTitle.includes(query) && !aTitle.includes(query)) return 1;
            
            // Sort by rating if available
            if (a.rating && b.rating) {
                return b.rating - a.rating;
            }
            
            return 0;
        });
    }

    createSearchResultItem(result) {
        const icon = this.getResultIcon(result.type);
        const badge = this.getResultBadge(result);
        const metadata = this.getResultMetadata(result);
        
        return `
            <div class="search-result-item" data-type="${result.type}" data-id="${result.id}">
                <div class="result-content">
                    <div class="result-header">
                        <div class="result-icon">
                            <i class="fas ${icon}"></i>
                        </div>
                        <div class="result-info">
                            <div class="result-title">${this.highlightQuery(result.title)}</div>
                            <div class="result-description">${this.highlightQuery(result.description)}</div>
                        </div>
                        ${badge}
                    </div>
                    ${metadata}
                </div>
                <div class="result-actions">
                    <button class="result-action-btn" onclick="window.search.handleResultClick('${result.type}', ${result.id})">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;
    }

    getResultIcon(type) {
        const icons = {
            location: 'fa-map-marker-alt',
            user: 'fa-user',
            post: 'fa-file-alt',
            instructor: 'fa-fist-raised'
        };
        return icons[type] || 'fa-search';
    }

    getResultBadge(result) {
        switch (result.type) {
            case 'location':
                if (result.rating) {
                    return `<div class="result-badge rating-badge">★ ${result.rating.toFixed(1)}</div>`;
                }
                break;
            case 'user':
                if (result.verified) {
                    return `<div class="result-badge verified-badge"><i class="fas fa-check-circle"></i> Verified</div>`;
                }
                break;
            case 'post':
                const safetyColors = {
                    safe: '#22c55e',
                    caution: '#f59e0b',
                    unsafe: '#ef4444',
                    emergency: '#dc2626'
                };
                const color = safetyColors[result.safetyLevel] || '#6b7280';
                return `<div class="result-badge safety-badge" style="background: ${color};">${result.safetyLevel?.toUpperCase()}</div>`;
            case 'instructor':
                const priceText = result.pricing === 'free' ? 'Free' : 'Paid';
                return `<div class="result-badge price-badge">${priceText}</div>`;
        }
        return '';
    }

    getResultMetadata(result) {
        switch (result.type) {
            case 'location':
                return `<div class="result-metadata">
                    <span><i class="fas fa-map-marker-alt"></i> Location</span>
                </div>`;
            case 'user':
                return `<div class="result-metadata">
                    <span><i class="fas fa-user"></i> Community Member</span>
                </div>`;
            case 'post':
                const timeAgo = this.getTimeAgo(result.timestamp);
                return `<div class="result-metadata">
                    <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${result.location}</span>
                </div>`;
            case 'instructor':
                return `<div class="result-metadata">
                    <span><i class="fas fa-star"></i> ${result.rating?.toFixed(1) || 'New'}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${result.location}</span>
                </div>`;
        }
        return '';
    }

    highlightQuery(text) {
        const searchInput = document.getElementById('search-input');
        if (!searchInput || !searchInput.value) return text;
        
        const query = searchInput.value.trim();
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    setupResultInteractions() {
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.result-action-btn')) return;
                
                const type = item.dataset.type;
                const id = parseInt(item.dataset.id);
                this.handleResultClick(type, id);
            });
        });
    }

    handleResultClick(type, id) {
        // Close search modal
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }

        // Navigate to appropriate section
        switch (type) {
            case 'location':
                this.navigateToLocation(id);
                break;
            case 'user':
                this.navigateToUser(id);
                break;
            case 'post':
                this.navigateToPost(id);
                break;
            case 'instructor':
                this.navigateToInstructor(id);
                break;
        }
    }

    navigateToLocation(id) {
        // Navigate to safety ratings section
        const navItem = document.querySelector('[data-section="safety-ratings"]');
        if (navItem) {
            navItem.click();
            
            // Highlight the specific location
            setTimeout(() => {
                const locationCard = document.querySelector(`[data-rating-id="${id}"]`);
                if (locationCard) {
                    locationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    locationCard.style.animation = 'highlight 2s ease';
                }
            }, 500);
        }
    }

    navigateToUser(id) {
        // In a real app, this would navigate to user profile
        this.showNotification(`Navigating to user profile (ID: ${id})`, 'info');
    }

    navigateToPost(id) {
        // Navigate to community section
        const navItem = document.querySelector('[data-section="community"]');
        if (navItem) {
            navItem.click();
            
            // Highlight the specific post
            setTimeout(() => {
                const postCard = document.querySelector(`[data-post-id="${id}"]`);
                if (postCard) {
                    postCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    postCard.style.animation = 'highlight 2s ease';
                }
            }, 500);
        }
    }

    navigateToInstructor(id) {
        // Navigate to self-defense section
        const navItem = document.querySelector('[data-section="self-defense"]');
        if (navItem) {
            navItem.click();
            
            // Highlight the specific instructor
            setTimeout(() => {
                const instructorCard = document.querySelector(`[data-instructor-id="${id}"]`);
                if (instructorCard) {
                    instructorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    instructorCard.style.animation = 'highlight 2s ease';
                }
            }, 500);
        }
    }

    getSearchPlaceholder() {
        return `
            <div class="search-placeholder">
                <div class="placeholder-content">
                    <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 20px;"></i>
                    <h3>Search SHESECURE</h3>
                    <p>Find locations, users, safety updates, and self-defense instructors</p>
                    <div class="search-suggestions">
                        <h4>Try searching for:</h4>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag" onclick="document.getElementById('search-input').value='Central Park'; window.search.performSearch('Central Park')">Central Park</span>
                            <span class="suggestion-tag" onclick="document.getElementById('search-input').value='self defense'; window.search.performSearch('self defense')">Self Defense</span>
                            <span class="suggestion-tag" onclick="document.getElementById('search-input').value='safety tips'; window.search.performSearch('safety tips')">Safety Tips</span>
                            <span class="suggestion-tag" onclick="document.getElementById('search-input').value='instructors'; window.search.performSearch('instructors')">Instructors</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNoResultsHTML(query) {
        return `
            <div class="no-results">
                <div class="no-results-content">
                    <i class="fas fa-search" style="font-size: 3rem; color: #d1d5db; margin-bottom: 20px;"></i>
                    <h3>No results found for "${query}"</h3>
                    <p>Try adjusting your search terms or browse different categories</p>
                    <div class="search-tips">
                        <h4>Search Tips:</h4>
                        <ul>
                            <li>Check your spelling</li>
                            <li>Try more general terms</li>
                            <li>Use different keywords</li>
                            <li>Browse by category using the filter buttons</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return time.toLocaleDateString();
    }

    showNotification(message, type = 'info') {
        if (window.sheSecureApp) {
            window.sheSecureApp.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Add CSS for search results if not already present
    addSearchStyles() {
        if (document.getElementById('search-styles')) return;

        const style = document.createElement('style');
        style.id = 'search-styles';
        style.textContent = `
            .search-result-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .search-result-item:hover {
                background: #f8fafc;
                transform: translateX(5px);
            }
            
            .result-content {
                flex: 1;
            }
            
            .result-header {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-bottom: 8px;
            }
            
            .result-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #ff6b9d, #7e57c2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .result-info {
                flex: 1;
            }
            
            .result-title {
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 4px;
            }
            
            .result-description {
                color: #718096;
                font-size: 0.9rem;
            }
            
            .result-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                color: white;
            }
            
            .rating-badge {
                background: #f59e0b;
            }
            
            .verified-badge {
                background: #22c55e;
            }
            
            .safety-badge {
                text-transform: uppercase;
            }
            
            .price-badge {
                background: #6366f1;
            }
            
            .result-metadata {
                display: flex;
                gap: 15px;
                font-size: 0.8rem;
                color: #9ca3af;
            }
            
            .result-metadata span {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .result-actions {
                margin-left: 15px;
            }
            
            .result-action-btn {
                width: 36px;
                height: 36px;
                border: none;
                background: #f1f5f9;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: #6b7280;
            }
            
            .result-action-btn:hover {
                background: linear-gradient(135deg, #ff6b9d, #7e57c2);
                color: white;
                transform: scale(1.1);
            }
            
            .search-placeholder, .no-results {
                padding: 40px 20px;
                text-align: center;
                color: #6b7280;
            }
            
            .placeholder-content h3, .no-results-content h3 {
                margin: 0 0 10px 0;
                color: #374151;
            }
            
            .search-suggestions, .search-tips {
                margin-top: 30px;
            }
            
            .search-suggestions h4, .search-tips h4 {
                margin: 0 0 15px 0;
                color: #374151;
                font-size: 1rem;
            }
            
            .suggestion-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
            }
            
            .suggestion-tag {
                padding: 6px 12px;
                background: #f3f4f6;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .suggestion-tag:hover {
                background: linear-gradient(135deg, #ff6b9d, #7e57c2);
                color: white;
            }
            
            .search-tips ul {
                text-align: left;
                display: inline-block;
                margin: 0;
                padding-left: 20px;
            }
            
            .search-tips li {
                margin-bottom: 5px;
            }
            
            mark {
                background: #fef3c7;
                color: #92400e;
                padding: 1px 2px;
                border-radius: 2px;
            }
            
            @keyframes highlight {
                0% { background: transparent; }
                50% { background: #fef3c7; }
                100% { background: transparent; }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize search
window.search = new Search();

// Add search styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.search) {
        window.search.addSearchStyles();
    }
});