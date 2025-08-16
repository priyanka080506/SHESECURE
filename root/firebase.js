// Firebase Configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "your-api-key",
    authDomain: "shesecure-app.firebaseapp.com",
    projectId: "shesecure-app",
    storageBucket: "shesecure-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other modules
window.auth = auth;
window.db = db;
window.storage = storage;