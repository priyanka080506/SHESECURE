// Community functionality
class Community {
    constructor() {
        this.posts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCommunityFeed();
    }

    setupEventListeners() {
        // Share media button
        const shareMediaBtn = document.querySelector('.share-media-btn');
        if (shareMediaBtn) {
            shareMediaBtn.addEventListener('click', () => {
                this.showModal('create-post-modal');
            });
        }

        // Create post form
        const createPostForm = document.getElementById('create-post-form');
        if (createPostForm) {
            createPostForm.addEventListener('submit', (e) => this.handlePostCreation(e));
        }

        // File upload handling
        const fileInput = document.querySelector('#create-post-form input[type="file"]');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }
    }

    async handlePostCreation(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const content = e.target.querySelector('textarea').value;
        const location = e.target.querySelector('input[type="text"]').value;
        const safetyLevel = e.target.querySelector('select').value;
        const files = e.target.querySelector('input[type="file"]').files;

        if (!content.trim()) {
            this.showNotification('Please enter some content for your post', 'warning');
            return;
        }

        if (!location.trim()) {
            this.showNotification('Please enter a location', 'warning');
            return;
        }

        if (!safetyLevel) {
            this.showNotification('Please select a safety level', 'warning');
            return;
        }

        try {
            const postData = {
                id: Date.now(),
                content: content,
                location: location,
                safetyLevel: safetyLevel,
                timestamp: new Date().toISOString(),
                userId: window.authManager?.currentUser?.uid || 'anonymous',
                userName: window.authManager?.currentUser?.displayName || 'Anonymous User',
                userAvatar: this.getRandomAvatar(),
                likes: 0,
                comments: 0,
                media: []
            };

            // Handle file uploads
            if (files.length > 0) {
                postData.media = await this.uploadFiles(files);
            }

            // Save post
            await this.savePost(postData);
            this.posts.unshift(postData);
            this.displayCommunityFeed();
            
            // Close modal and reset form
            this.hideModals();
            e.target.reset();
            
            this.showNotification('Post shared successfully!', 'success');
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification('Failed to share post. Please try again.', 'error');
        }
    }

    async uploadFiles(files) {
        const mediaUrls = [];
        
        for (let file of files) {
            try {
                if (window.storage) {
                    // Upload to Firebase Storage
                    const storageRef = storage.ref(`community-media/${Date.now()}_${file.name}`);
                    const snapshot = await storageRef.put(file);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    mediaUrls.push({
                        url: downloadURL,
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        name: file.name
                    });
                } else {
                    // For demo purposes, create object URLs
                    mediaUrls.push({
                        url: URL.createObjectURL(file),
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        name: file.name
                    });
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
        
        return mediaUrls;
    }

    async savePost(postData) {
        if (window.db) {
            // Save to Firebase Firestore
            await db.collection('community-posts').add(postData);
        } else {
            // Save to localStorage for demo
            const existingPosts = JSON.parse(localStorage.getItem('community-posts') || '[]');
            existingPosts.unshift(postData);
            localStorage.setItem('community-posts', JSON.stringify(existingPosts));
        }
    }

    async loadCommunityFeed() {
        try {
            if (window.db) {
                // Load from Firebase
                const snapshot = await db.collection('community-posts')
                    .orderBy('timestamp', 'desc')
                    .limit(50)
                    .get();
                
                this.posts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                // Load from localStorage
                this.posts = JSON.parse(localStorage.getItem('community-posts') || '[]');
                
                // Add sample data if empty
                if (this.posts.length === 0) {
                    this.posts = this.getSamplePosts();
                }
            }
            
            this.displayCommunityFeed();
        } catch (error) {
            console.error('Error loading community feed:', error);
            this.posts = this.getSamplePosts();
            this.displayCommunityFeed();
        }
    }

    getSamplePosts() {
        return [
            {
                id: 1,
                userName: 'Jessica Lee',
                userAvatar: 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                content: 'New street lighting installed on 5th Avenue - much safer for evening walks! The city really listened to our community feedback.',
                location: '5th Avenue, NYC',
                safetyLevel: 'safe',
                timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
                likes: 24,
                comments: 8,
                media: [{
                    url: 'https://images.pexels.com/photos/327174/pexels-photo-327174.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                    type: 'image',
                    name: 'street_lighting.jpg'
                }]
            },
            {
                id: 2,
                userName: 'Maria Garcia',
                userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                content: 'Security cameras added to this parking lot. Women can park here more safely now. Great improvement!',
                location: 'Main Street Parking, Downtown',
                safetyLevel: 'safe',
                timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                likes: 31,
                comments: 12,
                media: [{
                    url: 'https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
                    type: 'image',
                    name: 'parking_security.jpg'
                }]
            },
            {
                id: 3,
                userName: 'Amanda Chen',
                userAvatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                content: 'Be careful around this area after 9 PM. Poor lighting and not many people around. Stick to main streets.',
                location: 'Oak Street & 3rd Ave',
                safetyLevel: 'caution',
                timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                likes: 18,
                comments: 6,
                media: []
            },
            {
                id: 4,
                userName: 'Sophie Williams',
                userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
                content: 'Amazing self-defense workshop today! Feeling so much more confident. Thank you to instructor Sarah for the great session.',
                location: 'Community Center, Westside',
                safetyLevel: 'safe',
                timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                likes: 45,
                comments: 15,
                media: []
            }
        ];
    }

    displayCommunityFeed() {
        const mediaFeed = document.getElementById('media-feed');
        if (!mediaFeed) return;

        if (this.posts.length === 0) {
            mediaFeed.innerHTML = `
                <div class="empty-feed">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                    <h3>No community posts yet</h3>
                    <p>Be the first to share a safety update with the community!</p>
                    <button class="primary-btn" onclick="document.querySelector('.share-media-btn').click()">
                        <i class="fas fa-plus"></i> Share Update
                    </button>
                </div>
            `;
            return;
        }

        mediaFeed.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
        
        // Add event listeners to post actions
        this.setupPostInteractions();
    }

    createPostCard(post) {
        const timeAgo = this.getTimeAgo(post.timestamp);
        const safetyBadgeClass = this.getSafetyBadgeClass(post.safetyLevel);
        
        return `
            <div class="community-post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.userAvatar}" alt="${post.userName}" class="user-avatar">
                    <div class="post-meta">
                        <div class="username">${post.userName}</div>
                        <div class="post-time">${timeAgo}</div>
                    </div>
                    <div class="safety-badge ${safetyBadgeClass}">
                        ${post.safetyLevel.toUpperCase()}
                    </div>
                </div>
                
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                
                ${post.media && post.media.length > 0 ? `
                    <div class="post-media">
                        ${post.media.map(media => this.createMediaElement(media)).join('')}
                    </div>
                ` : ''}
                
                <div class="post-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${post.location}</span>
                </div>
                
                <div class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${post.id}">
                        <i class="fas fa-heart"></i>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <button class="action-btn comment-btn" data-post-id="${post.id}">
                        <i class="fas fa-comment"></i>
                        <span class="comment-count">${post.comments}</span>
                    </button>
                    <button class="action-btn share-btn" data-post-id="${post.id}">
                        <i class="fas fa-share"></i>
                        Share
                    </button>
                    <button class="action-btn report-btn" data-post-id="${post.id}">
                        <i class="fas fa-flag"></i>
                        Report
                    </button>
                </div>
            </div>
        `;
    }

    createMediaElement(media) {
        if (media.type === 'image') {
            return `
                <div class="media-item">
                    <img src="${media.url}" alt="${media.name}" onclick="window.community.openMediaModal('${media.url}', 'image')">
                </div>
            `;
        } else if (media.type === 'video') {
            return `
                <div class="media-item">
                    <video controls onclick="this.play()">
                        <source src="${media.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            `;
        }
        return '';
    }

    setupPostInteractions() {
        // Like buttons
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.currentTarget.dataset.postId);
                this.toggleLike(postId, e.currentTarget);
            });
        });

        // Comment buttons
        document.querySelectorAll('.comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.currentTarget.dataset.postId);
                this.showComments(postId);
            });
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.currentTarget.dataset.postId);
                this.sharePost(postId);
            });
        });

        // Report buttons
        document.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = parseInt(e.currentTarget.dataset.postId);
                this.reportPost(postId);
            });
        });
    }

    toggleLike(postId, buttonElement) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const likeCountSpan = buttonElement.querySelector('.like-count');
        const heartIcon = buttonElement.querySelector('i');
        
        // Toggle like state
        if (buttonElement.classList.contains('liked')) {
            post.likes--;
            buttonElement.classList.remove('liked');
            heartIcon.style.color = '';
        } else {
            post.likes++;
            buttonElement.classList.add('liked');
            heartIcon.style.color = '#ef4444';
        }
        
        likeCountSpan.textContent = post.likes;
        
        // Save updated post
        this.updatePost(post);
    }

    showComments(postId) {
        // For now, just show a simple prompt
        const comment = prompt('Add a comment:');
        if (comment && comment.trim()) {
            const post = this.posts.find(p => p.id === postId);
            if (post) {
                post.comments++;
                this.updatePost(post);
                this.displayCommunityFeed();
                this.showNotification('Comment added!', 'success');
            }
        }
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const shareText = `Check out this safety update: "${post.content}" - Location: ${post.location}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Safety Update - SHESECURE',
                text: shareText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Post details copied to clipboard!', 'success');
            });
        }
    }

    reportPost(postId) {
        const reason = prompt('Why are you reporting this post?\n\n1. Inappropriate content\n2. False information\n3. Spam\n4. Other\n\nEnter reason:');
        
        if (reason && reason.trim()) {
            // In a real app, this would send to moderation system
            console.log(`Post ${postId} reported for: ${reason}`);
            this.showNotification('Post reported. Thank you for helping keep our community safe.', 'success');
        }
    }

    async updatePost(post) {
        if (window.db) {
            // Update in Firebase
            await db.collection('community-posts').doc(post.id).update(post);
        } else {
            // Update in localStorage
            const posts = JSON.parse(localStorage.getItem('community-posts') || '[]');
            const index = posts.findIndex(p => p.id === post.id);
            if (index !== -1) {
                posts[index] = post;
                localStorage.setItem('community-posts', JSON.stringify(posts));
            }
        }
    }

    openMediaModal(mediaUrl, mediaType) {
        // Create and show media modal
        const modal = document.createElement('div');
        modal.className = 'media-modal';
        modal.innerHTML = `
            <div class="media-modal-content">
                <button class="close-media-btn">&times;</button>
                ${mediaType === 'image' ? 
                    `<img src="${mediaUrl}" alt="Community media">` :
                    `<video controls><source src="${mediaUrl}" type="video/mp4"></video>`
                }
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
        `;
        
        const content = modal.querySelector('.media-modal-content');
        content.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
        `;
        
        const media = content.querySelector('img, video');
        media.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        
        const closeBtn = modal.querySelector('.close-media-btn');
        closeBtn.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
        `;
        
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    getSafetyBadgeClass(safetyLevel) {
        const classes = {
            safe: 'safe',
            caution: 'caution',
            unsafe: 'unsafe',
            emergency: 'emergency'
        };
        return classes[safetyLevel] || 'safe';
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

    getRandomAvatar() {
        const avatars = [
            'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            'https://images.pexels.com/photos/594421/pexels-photo-594421.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop'
        ];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    handleFileUpload(e) {
        const files = e.target.files;
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
        
        for (let file of files) {
            if (file.size > maxSize) {
                this.showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
                e.target.value = '';
                return;
            }
            
            if (!allowedTypes.includes(file.type)) {
                this.showNotification(`File type ${file.type} is not supported.`, 'error');
                e.target.value = '';
                return;
            }
        }
        
        if (files.length > 5) {
            this.showNotification('Maximum 5 files allowed per post.', 'warning');
            e.target.value = '';
            return;
        }
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

// Initialize community
window.community = new Community();