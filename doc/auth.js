// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // DOM elements
        this.authContainer = document.getElementById('auth-container');
        this.dashboardContainer = document.getElementById('dashboard-container');
        this.authForm = document.getElementById('auth-form');
        this.authTabs = document.querySelectorAll('.auth-tab');
        this.togglePassword = document.querySelector('.toggle-password');
        
        // Event listeners
        this.setupEventListeners();
        
        // Check auth state
        this.checkAuthState();
    }

    setupEventListeners() {
        // Auth tabs
        this.authTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });

        // Form submission
        this.authForm.addEventListener('submit', (e) => this.handleAuth(e));

        // Password toggle
        this.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    switchTab(activeTab) {
        const tabType = activeTab.dataset.tab;
        
        // Update active tab
        this.authTabs.forEach(tab => tab.classList.remove('active'));
        activeTab.classList.add('active');

        // Show/hide fields based on tab
        const nameField = document.getElementById('name-field');
        const confirmPasswordField = document.getElementById('confirm-password-field');
        const submitBtn = this.authForm.querySelector('.auth-btn');

        if (tabType === 'register') {
            nameField.classList.remove('hidden');
            confirmPasswordField.classList.remove('hidden');
            submitBtn.textContent = 'Create Account';
        } else {
            nameField.classList.add('hidden');
            confirmPasswordField.classList.add('hidden');
            submitBtn.textContent = 'Sign In';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const icon = this.togglePassword.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const activeTab = document.querySelector('.auth-tab.active');
        const isLogin = activeTab.dataset.tab === 'login';
        
        const formData = new FormData(this.authForm);
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        
        try {
            if (isLogin) {
                await this.login(email, password);
            } else {
                if (password !== document.getElementById('confirmPassword').value) {
                    throw new Error('Passwords do not match');
                }
                await this.register(email, password, name);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async login(email, password) {
        try {
            const result = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = result.user;
            this.showDashboard();
        } catch (error) {
            throw error;
        }
    }

    async register(email, password, name) {
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update profile
            await result.user.updateProfile({
                displayName: name
            });

            // Save user data to Firestore
            await db.collection('users').doc(result.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                emergencyContacts: [],
                preferences: {
                    notifications: true,
                    locationSharing: true
                }
            });

            this.currentUser = result.user;
            this.showDashboard();
        } catch (error) {
            throw error;
        }
    }

    checkAuthState() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showDashboard();
            } else {
                this.showAuth();
            }
        });
    }

    showDashboard() {
        this.authContainer.classList.add('hidden');
        this.dashboardContainer.classList.remove('hidden');
        
        // Update user name in header
        const userName = document.getElementById('user-name');
        if (userName) {
            userName.textContent = this.currentUser.displayName || this.currentUser.email;
        }
        
        // Initialize dashboard
        if (window.dashboard) {
            window.dashboard.init();
        }
    }

    showAuth() {
        this.authContainer.classList.remove('hidden');
        this.dashboardContainer.classList.add('hidden');
    }

    async logout() {
        try {
            await auth.signOut();
            this.currentUser = null;
            this.showAuth();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.auth-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'auth-error';
            errorDiv.style.cssText = `
                background: #fee;
                color: #c53030;
                padding: 10px;
                border-radius: 8px;
                margin-bottom: 15px;
                border: 1px solid #feb2b2;
            `;
            this.authForm.insertBefore(errorDiv, this.authForm.firstChild);
        }
        errorDiv.textContent = message;
        
        // Remove error after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize auth manager
window.authManager = new AuthManager();