// SHESECURE - Women's Safety Platform JavaScript

// Global Variables
let currentUser = null;
let isVoiceListening = false;
let posts = [];
let locations = [];
let instructors = [];
let currentPage = 'home';

// Mock Data
const mockUsers = [
    {
        id: 1,
        name: "Sara",
        email: "sarah@example.com",
        username: "sarah_secure",
        phone: "+1234567890",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
        location: "Downtown, Seattle",
        safetyScore: 4.8,
        posts: 156,
        followers: 2100
    }
];

// Mock user posts for profile
const mockUserPosts = [
    {
        id: 101,
        user: {
            name: "Sara",
            username: "sarah_secure",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "Pike Place Market, Seattle",
        image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400",
        caption: "Amazing security presence and well-lit pathways! Perfect for evening shopping 🛍️ #SafeShopping #Seattle",
        likes: 89,
        comments: 12,
        safetyRating: 4.7,
        timestamp: "3 days ago",
        isLiked: true
    },
    {
        id: 102,
        user: {
            name: "Sara",
            username: "sarah_secure",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "Capitol Hill, Seattle",
        image: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=400",
        caption: "Beautiful park area but could use better lighting after sunset. Stay aware! 🌅 #CapitolHill #SafetyFirst",
        likes: 156,
        comments: 28,
        safetyRating: 3.8,
        timestamp: "1 week ago",
        isLiked: false
    },
    {
        id: 103,
        user: {
            name: "Sara",
            username: "sarah_secure",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "University District",
        image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400",
        caption: "Great campus security and emergency call boxes everywhere! Feeling safe here 📚 #UDistrict #CampusSafety",
        likes: 234,
        comments: 45,
        safetyRating: 4.9,
        timestamp: "2 weeks ago",
        isLiked: true
    },
    {
        id: 104,
        user: {
            name: "Sara",
            username: "sarah_secure",
            avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "Waterfront Park",
        image: "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400",
        caption: "Stunning waterfront views with excellent visibility and regular patrols 🌊 #Waterfront #SafeViews",
        likes: 178,
        comments: 22,
        safetyRating: 4.4,
        timestamp: "3 weeks ago",
        isLiked: true
    }
];

// Mock user ratings
const mockUserRatings = [
    {
        id: 1,
        location: "Pike Place Market",
        image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.7,
        lighting: 4.8,
        crowdDensity: 4.5,
        safetyScore: 4.7,
        review: "Excellent security presence and well-maintained area. Perfect for day and evening visits. Highly recommend!",
        timestamp: "3 days ago",
        category: "Shopping"
    },
    {
        id: 2,
        location: "Capitol Hill Park",
        image: "https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 3.8,
        lighting: 3.2,
        crowdDensity: 4.1,
        safetyScore: 3.8,
        review: "Beautiful area during the day but lighting could be improved for evening hours. Generally safe with good foot traffic.",
        timestamp: "1 week ago",
        category: "Park"
    },
    {
        id: 3,
        location: "University District",
        image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.9,
        lighting: 4.9,
        crowdDensity: 4.8,
        safetyScore: 4.9,
        review: "Outstanding campus security with emergency call boxes every 100 meters. Feels very safe at all hours.",
        timestamp: "2 weeks ago",
        category: "Educational"
    },
    {
        id: 4,
        location: "Waterfront Pier",
        image: "https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.4,
        lighting: 4.6,
        crowdDensity: 3.9,
        safetyScore: 4.4,
        review: "Great visibility and regular security patrols. Perfect for morning jogs and evening walks.",
        timestamp: "3 weeks ago",
        category: "Recreation"
    },
    {
        id: 5,
        location: "Downtown Transit Hub",
        image: "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 3.5,
        lighting: 3.8,
        crowdDensity: 4.2,
        safetyScore: 3.5,
        review: "Busy area with good lighting but can get crowded during rush hours. Stay alert and keep belongings secure.",
        timestamp: "1 month ago",
        category: "Transit"
    }
];

// Mock route data
const mockRoutes = {
    "Mysure palace to University": [
        {
            id: 1,
            name: "Safe Route (Recommended)",
            duration: "18 minutes",
            distance: "2.3 miles",
            safetyScore: 4.8,
            type: "safe",
            description: "Well-lit streets with regular security patrols",
            waypoints: ["Mysure palace", "1st Avenue", "vontikoppal", "BMH", "15th Avenue", "University"],
            warnings: [],
            benefits: ["Excellent lighting", "High foot traffic", "Security cameras", "Emergency call boxes"],
            riskLevel: "Low"
        },
        {
            id: 2,
            name: "Fast Route",
            duration: "12 minutes",
            distance: "1.8 miles",
            safetyScore: 3.2,
            type: "fast",
            description: "Shortest route but passes through less monitored areas",
            waypoints: ["Mysure palace", "Alley Way", "2nd Avenue", "Construction Zone", "University"],
            warnings: ["Poor lighting on 2nd Avenue", "Construction zone with limited visibility", "Low foot traffic after 8 PM"],
            benefits: ["Shortest distance", "Less traffic"],
            riskLevel: "Moderate"
        },
        {
            id: 3,
            name: "Heavy Traffic Route",
            duration: "25 minutes",
            distance: "2.1 miles",
            safetyScore: 4.1,
            type: "traffic",
            description: "Main roads with heavy traffic congestion",
            waypoints: ["Pike Place Market", "1st Avenue", "Metropool", "I-5 Overpass", "BMH", "University District"],
            warnings: ["Heavy traffic congestion", "Air pollution", "Noise levels"],
            benefits: ["Well-monitored roads", "Good lighting", "Emergency services nearby"],
            riskLevel: "Low-Moderate"
        }
    ],
    "Downtown Shopping Mall to Central Park": [
        {
            id: 4,
            name: "Safe Route (Recommended)",
            duration: "22 minutes",
            distance: "2.8 miles",
            safetyScore: 4.9,
            type: "safe",
            description: "Premium safety route through monitored business district",
            waypoints: ["Downtown Mall", "Business District", "Security Plaza", "Park Avenue", "Central Park"],
            warnings: [],
            benefits: ["24/7 security monitoring", "Premium lighting", "Emergency stations", "High-end area"],
            riskLevel: "Very Low"
        },
        {
            id: 5,
            name: "Fast Route",
            duration: "15 minutes",
            distance: "2.2 miles",
            safetyScore: 2.8,
            type: "fast",
            description: "Direct route through industrial area",
            waypoints: ["Downtown Mall", "Industrial District", "Warehouse Area", "Central Park"],
            warnings: ["Industrial area with limited lighting", "Low pedestrian traffic", "Isolated sections"],
            benefits: ["Direct path", "Less crowded"],
            riskLevel: "High"
        },
        {
            id: 6,
            name: "Scenic Route",
            duration: "28 minutes",
            distance: "3.1 miles",
            safetyScore: 4.3,
            type: "traffic",
            description: "Longer route through residential neighborhoods",
            waypoints: ["Downtown Mall", "Residential Area", "Community Center", "School Zone", "Central Park"],
            warnings: ["Longer duration", "School zone traffic during peak hours"],
            benefits: ["Family-friendly areas", "Community presence", "Well-maintained sidewalks"],
            riskLevel: "Low"
        }
    ]
};
const mockPosts = [
    {
        id: 1,
        user: {
            name: "shru",
            username: "shru_safe",
            avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "Broadway Street, NYC",
        image: "broadwaystreet.jpeg",
        caption: "Well-lit area with good security presence. Felt safe walking here at night! ✨ #SafeSpaces #NYC",
        likes: 124,
        comments: 23,
        safetyRating: 4.5,
        timestamp: "2 hours ago",
        isLiked: false
    },
    {
        id: 2,
        user: {
            name: "Mary",
            username: "maria_secure",
            avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "Metro Station, Downtown",
        image: "metro.jpeg",
        caption: "Poor lighting here after 9 PM. Be cautious and stay alert. Reported to authorities 📍 #StaySafe #ReportIncidents",
        likes: 87,
        comments: 15,
        safetyRating: 2.1,
        timestamp: "5 hours ago",
        isLiked: false
    },
    {
        id: 3,
        user: {
            name: "Priya Sharma",
            username: "priya_safe",
            avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
        },
        location: "University Campus",
        image: "campus.jpeg",
        caption: "Great security measures and well-maintained paths. Perfect for evening walks! 🚶‍♀️ #CampusSafety",
        likes: 203,
        comments: 31,
        safetyRating: 4.8,
        timestamp: "1 day ago",
        isLiked: true
    }
];

const mockLocations = [
    {
        id: 1,
        name: "Cetral Park, mysure",
        image: "park.jpeg",
        rating: 4.2,
        reviews: 156,
        lighting: 4.5,
        crowdDensity: 3.8,
        safetyScore: 4.2,
        lastIncident: "2 months ago",
        category: "Park"
    },
    {
        id: 2,
        name: "University campus",
        image: "university.jpeg",
        rating: 3.8,
        reviews: 89,
        lighting: 3.5,
        crowdDensity: 4.2,
        safetyScore: 3.8,
        lastIncident: "1 week ago",
        category: "Educational"
    },
    {
        id: 3,
        name: "Downtown Shopping Mall",
        image: "https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=400",
        rating: 4.6,
        reviews: 234,
        lighting: 4.8,
        crowdDensity: 4.5,
        safetyScore: 4.6,
        lastIncident: "3 months ago",
        category: "Shopping"
    },
    {
        id: 4,
        name: "Business District",
        image: "business.jpeg",
        rating: 4.1,
        reviews: 127,
        lighting: 4.3,
        crowdDensity: 3.9,
        safetyScore: 4.1,
        lastIncident: "1 month ago",
        category: "Business"
    }
];

const mockInstructors = [
    {
        id: 1,
        name: "Jenny",
        avatar: "jenny.jpeg",
        specialization: "Krav Maga",
        experience: "8 years",
        rating: 4.9,
        reviews: 145,
        price: "₹100/hour",
        location: "Downtown Studio(online available)",
        description: "Certified Krav Maga instructor with military background. Specializes in practical self-defense techniques."
    },
    {
        id: 2,
        name: "Manoj",
        avatar: "manoj.jpeg",
        specialization: "Boxing & Kickboxing",
        experience: "6 years",
        rating: 4.7,
        reviews: 98,
        price: "Free",
        location: "Community Center",
        description: "Former professional boxer offering free self-defense classes to empower women in the community."
    },
    {
        id: 3,
        name: "Aman",
        avatar: "aman.jpeg",
        specialization: "Martial Arts",
        experience: "12 years",
        rating: 4.8,
        reviews: 203,
        price: "₹50/hour",
        location: "Martial Arts Academy(online available)",
        description: "Black belt in multiple martial arts. Focus on building confidence and practical defense skills."
    },
    {
        id: 4,
        name: "Reena",
        avatar: "reena.jpeg",
        specialization: "Personal Safety",
        experience: "5 years",
        rating: 4.6,
        reviews: 76,
        price: "₹35/hour",
        location: "Mobile Training",
        description: "Personal safety expert with law enforcement background. Offers personalized training sessions."
    }
];

const mockExploreItems = [
    {
        id: 1,
        name: "Safe Zones Map",
        image: "safemap.jpeg",
        rating: 4.5,
        type: "High Rated"
    },
    {
        id: 2,
        name: "Night Markets",
        image: "streestal.jpeg",
        rating: 4.2,
        type: "Recent"
    },
    {
        id: 3,
        name: "Transit Hubs",
        image: "metro.jpeg",
        rating: 3.8,
        type: "Nearby"
    },
    {
        id: 4,
        name: "Campus Areas",
        image: "campus.jpeg",
        rating: 4.7,
        type: "High Rated"
    }
];

// Chat responses for AI Guide
const aiResponses = {
    greetings: [
        "Hello! I'm your AI Safety Guide. How can I help keep you safe today?",
        "Hi there! I'm here to assist with your safety needs. What can I help you with?",
        "Welcome! I'm your personal safety assistant. How may I assist you?"
    ],
    safety: [
        "Based on current data, your area has a moderate safety rating. I recommend staying in well-lit areas and being aware of your surroundings.",
        "The location you're asking about has good lighting and regular security patrols. It's generally considered safe.",
        "This area has had some recent incidents. I'd suggest taking the alternate route I'm sending to your navigation."
    ],
    emergency: [
        "I've detected this might be an emergency. I'm activating your emergency protocol and notifying your contacts.",
        "Emergency mode activated. Your location has been shared with emergency services and your emergency contacts.",
        "I'm here to help. If this is an emergency, say 'emergency now' and I'll immediately alert authorities."
    ],
    route: [
        "I've calculated the safest route for you. It avoids low-light areas and recent incident zones.",
        "Your route is being optimized for safety. I'll alert you of any changes in real-time.",
        "I found a safer alternative route that adds only 3 minutes but avoids the construction zone."
    ]
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    showLoadingSpinner();
    
    // Simulate app loading
    setTimeout(() => {
        hideLoadingSpinner();
        showAuthModal();
    }, 2000);
});

function initializeApp() {
    posts = mockPosts;
    locations = mockLocations;
    instructors = mockInstructors;
    
    setupEventListeners();
    loadHomeFeed();
    loadExploreContent();
    loadSafetyDashboard();
    loadInstructors();
    loadProfile();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Voice activation for emergency
    if ('webkitSpeechRecognition' in window) {
        setupVoiceRecognition();
    }
    
    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}

// Loading Spinner
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

// Authentication
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    // Simulate login
    currentUser = mockUsers[0];
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Navigation
function switchPage(pageName) {
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
    
    // Update pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`${pageName}Page`).classList.add('active');
    
    currentPage = pageName;
    
    // Load page-specific content
    switch(pageName) {
        case 'home':
            loadHomeFeed();
            break;
        case 'explore':
            loadExploreContent();
            break;
        case 'safety':
            loadSafetyDashboard();
            break;
        case 'defense':
            loadInstructors();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Home Feed
function loadHomeFeed() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    
    const starsHtml = generateStars(post.safetyRating);
    const heartIcon = post.isLiked ? 'fas fa-heart' : 'far fa-heart';
    const heartColor = post.isLiked ? 'color: #EF4444;' : '';
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-avatar">
                <img src="${post.user.avatar}" alt="${post.user.name}">
            </div>
            <div class="post-user">
                <h4>${post.user.name}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${post.location}</p>
            </div>
            <div class="post-actions">
                <button><i class="fas fa-ellipsis-v"></i></button>
            </div>
        </div>
        <img src="${post.image}" alt="Post image" class="post-image">
        <div class="post-content">
            <div class="post-rating">
                <span class="rating-stars">${starsHtml}</span>
                <span class="rating-score">${post.safetyRating}</span>
            </div>
            <p class="post-caption">${post.caption}</p>
            <div class="post-meta">
                <div class="post-interactions">
                    <div class="interaction" onclick="toggleLike(${post.id})">
                        <i class="${heartIcon}" style="${heartColor}"></i>
                        <span>${post.likes}</span>
                    </div>
                    <div class="interaction">
                        <i class="far fa-comment"></i>
                        <span>${post.comments}</span>
                    </div>
                    <div class="interaction">
                        <i class="far fa-share-square"></i>
                        <span>Share</span>
                    </div>
                </div>
                <span class="post-time">${post.timestamp}</span>
            </div>
        </div>
    `;
    
    return postDiv;
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        loadHomeFeed(); // Refresh feed
    }
}

// Explore Content
function loadExploreContent() {
    const container = document.getElementById('exploreGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    mockExploreItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'explore-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="explore-image">
            <div class="explore-overlay">
                <div class="explore-name">${item.name}</div>
                <div class="explore-rating">
                    <i class="fas fa-star"></i>
                    <span>${item.rating}</span>
                </div>
            </div>
        `;
        container.appendChild(itemElement);
    });
}

// Safety Dashboard
function loadSafetyDashboard() {
    const container = document.getElementById('locationRatings');
    if (!container) return;
    
    container.innerHTML = '';
    
    locations.forEach(location => {
        const locationElement = createLocationCard(location);
        container.appendChild(locationElement);
    });
}

function createLocationCard(location) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'location-card';
    
    cardDiv.innerHTML = `
        <img src="${location.image}" alt="${location.name}" class="location-image">
        <div class="location-info">
            <div class="location-header">
                <div>
                    <h3 class="location-name">${location.name}</h3>
                    <div class="location-rating">
                        <span class="rating-stars">${generateStars(location.rating)}</span>
                        <span class="rating-number">${location.rating}</span>
                        <span class="rating-reviews">(${location.reviews} reviews)</span>
                    </div>
                </div>
            </div>
            <div class="location-metrics">
                <div class="metric">
                    <div class="metric-value">${location.lighting}</div>
                    <div class="metric-label">Lighting</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${location.crowdDensity}</div>
                    <div class="metric-label">Crowd</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${location.safetyScore}</div>
                    <div class="metric-label">Safety</div>
                </div>
            </div>
            <p class="last-incident">Last incident: ${location.lastIncident}</p>
        </div>
    `;
    
    return cardDiv;
}

// Instructors
function loadInstructors() {
    const container = document.getElementById('instructorsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    instructors.forEach(instructor => {
        const instructorElement = createInstructorCard(instructor);
        container.appendChild(instructorElement);
    });
}

function createInstructorCard(instructor) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'instructor-card';
    
    const priceClass = instructor.price === 'Free' ? 'free' : '';
    
    cardDiv.innerHTML = `
        <img src="${instructor.avatar}" alt="${instructor.name}" class="instructor-avatar">
        <div class="instructor-info">
            <h3 class="instructor-name">${instructor.name}</h3>
            <p class="instructor-specialty">${instructor.specialization}</p>
            <div class="instructor-details">
                <span class="instructor-rating">
                    <i class="fas fa-star"></i> ${instructor.rating} (${instructor.reviews})
                </span>
                <span>${instructor.experience} exp</span>
            </div>
            <div class="instructor-price ${priceClass}">${instructor.price}</div>
            <p style="font-size: 14px; color: #666; margin-bottom: 15px;">${instructor.description}</p>
            <button class="book-btn" onclick="bookInstructor(${instructor.id})">
                ${instructor.price === 'Free' ? 'Join Free Class' : 'Book Session'}
            </button>
        </div>
    `;
    
    return cardDiv;
}

function bookInstructor(instructorId) {
    const instructor = instructors.find(i => i.id === instructorId);
    if (instructor) {
        alert(`Booking session with ${instructor.name}. You'll be redirected to the booking page.`);
    }
}

// Profile
function loadProfile() {
    const container = document.getElementById('profileGrid');
    if (!container) return;
    
    // Load user's posts in grid format
    container.innerHTML = '';
    
    const userPosts = posts.filter(post => post.user.name === currentUser?.name);
    userPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'profile-post';
        postElement.style.cssText = `
            aspect-ratio: 1;
            background-image: url(${post.image});
            background-size: cover;
            background-position: center;
            border-radius: 10px;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        postElement.addEventListener('mouseover', () => {
            postElement.style.transform = 'scale(1.05)';
        });
        postElement.addEventListener('mouseout', () => {
            postElement.style.transform = 'scale(1)';
        });
        container.appendChild(postElement);
    });
    
    // Add some placeholder posts
    for (let i = 0; i < 6; i++) {
        const postElement = document.createElement('div');
        postElement.className = 'profile-post';
        postElement.style.cssText = `
            aspect-ratio: 1;
            background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 24px;
        `;
        postElement.innerHTML = '<i class="fas fa-image"></i>';
        container.appendChild(postElement);
    }
}

// Emergency Functions
function triggerEmergency() {
    if (confirm('This will send an emergency alert to authorities and your emergency contacts. Continue?')) {
        alert('🚨 EMERGENCY ALERT SENT!\n\n✅ Location shared with emergency services\n✅ Emergency contacts notified\n✅ Audio recording started\n\nHelp is on the way!');
        
        // Simulate emergency protocol
        addAIMessage("Emergency protocol activated! I've notified emergency services and your contacts. Your location has been shared. Stay calm and stay on the line.");
        openAIGuide();
    }
}

function openSafeRoute() {
    alert('🗺️ SAFE ROUTE ACTIVATED!\n\n✅ Calculating safest path\n✅ Avoiding risk zones\n✅ Real-time monitoring enabled\n\nYour safe route is being prepared...');
    addAIMessage("I'm calculating the safest route for you. This will avoid poorly lit areas and recent incident zones. Your route will be ready in a moment.");
    openAIGuide();
}

function activateVoiceAlert() {
    if (!isVoiceListening) {
        isVoiceListening = true;
        alert('🎤 VOICE ALERT ACTIVATED!\n\nSay "HELP ME" or "EMERGENCY" for immediate assistance.\nVoice recognition is now active...');
        
        // Start voice recognition if available
        if ('webkitSpeechRecognition' in window) {
            startVoiceRecognition();
        }
    } else {
        isVoiceListening = false;
        alert('Voice alert deactivated.');
    }
}

// Voice Recognition
function setupVoiceRecognition() {
    window.recognition = new webkitSpeechRecognition();
    window.recognition.continuous = true;
    window.recognition.interimResults = true;
    
    window.recognition.onresult = function(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        if (transcript.includes('help') || transcript.includes('emergency')) {
            triggerEmergency();
        }
    };
}

function startVoiceRecognition() {
    if (window.recognition && isVoiceListening) {
        window.recognition.start();
    }
}

// AI Guide
function openAIGuide() {
    document.getElementById('aiGuideModal').classList.remove('hidden');
}

function closeAIGuide() {
    document.getElementById('aiGuideModal').classList.add('hidden');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const response = generateAIResponse(message);
        addAIMessage(response);
    }, 1000);
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">Just now</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addAIMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-time">Just now</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('emergency') || message.includes('help')) {
        return aiResponses.emergency[Math.floor(Math.random() * aiResponses.emergency.length)];
    } else if (message.includes('route') || message.includes('navigation')) {
        return aiResponses.route[Math.floor(Math.random() * aiResponses.route.length)];
    } else if (message.includes('safe') || message.includes('danger') || message.includes('area')) {
        return aiResponses.safety[Math.floor(Math.random() * aiResponses.safety.length)];
    } else {
        return aiResponses.greetings[Math.floor(Math.random() * aiResponses.greetings.length)];
    }
}

// Search Functionality
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query.length < 2) return;
    
    // Simple search implementation
    console.log('Searching for:', query);
    
    // You can implement more sophisticated search here
    // This could search through posts, locations, instructors, etc.
}

// Utility Functions
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let starsHtml = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
}

function openAddInstructor() {
    alert('📚 BECOME AN INSTRUCTOR\n\nJoin our community of self-defense instructors!\n\n• Share your expertise\n• Set your own rates\n• Help empower women\n\nRedirecting to instructor registration...');
}

// Initialize Firebase (Mock)
function initializeFirebase() {
    // This is where you would initialize Firebase
    // const firebaseConfig = { ... };
    // firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized (mock)');
}

// Export functions for global access
window.closeAuthModal = closeAuthModal;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.triggerEmergency = triggerEmergency;
window.openSafeRoute = openSafeRoute;
window.activateVoiceAlert = activateVoiceAlert;
window.openAIGuide = openAIGuide;
window.closeAIGuide = closeAIGuide;
window.sendMessage = sendMessage;
window.toggleLike = toggleLike;
window.bookInstructor = bookInstructor;
window.openAddInstructor = openAddInstructor;

// Profile Tab Functions
function switchProfileTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load appropriate content
    switch(tabName) {
        case 'posts':
            loadProfilePosts();
            break;
        case 'ratings':
            loadProfileRatings();
            break;
        case 'settings':
            loadProfileSettings();
            break;
    }
}

// Rating Functions
function editRating(ratingId) {
    alert(`Editing rating ${ratingId}. This would open an edit form.`);
}

function deleteRating(ratingId) {
    if (confirm('Are you sure you want to delete this rating?')) {
        alert(`Rating ${ratingId} deleted successfully.`);
        loadProfileRatings(); // Refresh the ratings
    }
}

// Settings Functions
function setupSettingsToggles() {
    const toggles = document.querySelectorAll('.setting-toggle input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const settingName = e.target.id;
            const isEnabled = e.target.checked;
            handleSettingChange(settingName, isEnabled);
        });
    });
}

function handleSettingChange(settingName, isEnabled) {
    console.log(`${settingName} ${isEnabled ? 'enabled' : 'disabled'}`);
    
    // Show feedback to user
    const message = isEnabled ? 'enabled' : 'disabled';
    showSettingFeedback(`${settingName.replace(/([A-Z])/g, ' $1').toLowerCase()} ${message}`);
}

function showSettingFeedback(message) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'setting-feedback';
    feedback.textContent = `Setting ${message}`;
    feedback.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10B981;
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

function editProfile() {
    alert('Profile editing would open a form to update:\n• Name\n• Email\n• Phone\n• Bio\n• Profile Picture');
}

function changePassword() {
    alert('Password change form would open with:\n• Current Password\n• New Password\n• Confirm Password');
}

function emailSettings() {
    alert('Email preferences would allow you to:\n• Choose notification frequency\n• Select email types\n• Unsubscribe options');
}

function manageEmergencyContacts() {
    alert('Emergency contacts management:\n• Add/Remove contacts\n• Set priority levels\n• Test contact methods\n• Backup contacts');
}

function openHelpCenter() {
    alert('Help Center would include:\n• FAQ\n• Video tutorials\n• Contact support\n• Safety tips');
}

function openPrivacyPolicy() {
    alert('Privacy Policy would detail:\n• Data collection\n• Usage policies\n• Third-party sharing\n• User rights');
}

function openTerms() {
    alert('Terms of Service would cover:\n• User responsibilities\n• Platform rules\n• Liability\n• Service availability');
}

function deleteAccount() {
    if (confirm('⚠️ WARNING: This will permanently delete your account and all data.\n\nThis action cannot be undone. Are you sure?')) {
        if (confirm('Final confirmation: Delete account permanently?')) {
            alert('Account deletion initiated. You will receive a confirmation email within 24 hours.');
        }
    }
}

// Export new functions
window.switchProfileTab = switchProfileTab;
window.editRating = editRating;
window.deleteRating = deleteRating;
window.editProfile = editProfile;
window.changePassword = changePassword;
window.emailSettings = emailSettings;
window.manageEmergencyContacts = manageEmergencyContacts;
window.openHelpCenter = openHelpCenter;
window.openPrivacyPolicy = openPrivacyPolicy;
window.openTerms = openTerms;
window.deleteAccount = deleteAccount;
window.closeRouteModal = closeRouteModal;
window.calculateRoutes = calculateRoutes;
window.selectRoute = selectRoute;