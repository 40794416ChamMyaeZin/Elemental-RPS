// ===== scripts/storage.js =====
// LocalStorage functions for username, password, and leaderboard

// ===== Keys =====
const STORAGE_KEYS = {
    USERS: 'elementalRPS_users',
    CURRENT_USER: 'elementalRPS_current_user',
    REMEMBER_ME: 'elementalRPS_remember',
    TERMS_ACCEPTED: 'elementalRPS_terms_accepted'
};

// ===== User Management =====

function getUsers() {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse users', e);
            return {};
        }
    }
    return {};
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Simple hash for demo (not secure, but sufficient for this assignment)
function simpleHash(str) {
    if (!str) return '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32-bit integer
    }
    const salt = 'elemRPS';
    return Math.abs(hash).toString(16) + salt;
}

function registerUser(username, password) {
    if (!username || !username.trim()) {
        return { success: false, message: 'Username is required!' };
    }
    if (!password || !password.trim()) {
        return { success: false, message: 'Password is required!' };
    }
    if (password.length < 4) {
        return { success: false, message: 'Password must be at least 4 characters!' };
    }
    const users = getUsers();
    const cleanUsername = username.trim();
    if (users[cleanUsername]) {
        return { success: false, message: 'Username already exists! Please choose another.' };
    }
    users[cleanUsername] = {
        password: simpleHash(password),
        wins: 0,
        created: new Date().toISOString(),
        lastLogin: null,
        termsAccepted: false
    };
    saveUsers(users);
    setCurrentUser(cleanUsername);
    return { success: true, message: 'Registration successful!' };
}

function loginUser(username, password, remember = true) {
    if (!username || !username.trim()) {
        return { success: false, message: 'Please enter your username!' };
    }
    if (!password || !password.trim()) {
        return { success: false, message: 'Please enter your password!' };
    }
    const users = getUsers();
    const cleanUsername = username.trim();
    const user = users[cleanUsername];

    // Demo mode: any password "demo123" works (auto‑creates user if needed)
    if (password === 'demo123') {
        if (!user) {
            users[cleanUsername] = {
                password: simpleHash(password),
                wins: 0,
                created: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                termsAccepted: false
            };
            saveUsers(users);
        } else {
            user.lastLogin = new Date().toISOString();
            saveUsers(users);
        }
        setCurrentUser(cleanUsername);
        if (remember) setRememberMe(true);
        return {
            success: true,
            message: 'Login successful! (Demo mode)',
            wins: users[cleanUsername]?.wins || 0
        };
    }

    // Normal authentication
    if (!user) {
        return { success: false, message: 'User not found! Please register.' };
    }
    if (user.password !== simpleHash(password)) {
        return { success: false, message: 'Incorrect password!' };
    }
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setCurrentUser(cleanUsername);
    if (remember) setRememberMe(true);
    return {
        success: true,
        message: 'Login successful!',
        wins: user.wins || 0
    };
}

function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || '';
}

function setCurrentUser(username) {
    if (username) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
}

function userExists(username) {
    const users = getUsers();
    return !!users[username];
}

function getUserData(username) {
    const users = getUsers();
    return users[username] || null;
}

// ===== Remember Me =====
function setRememberMe(remember) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, remember ? 'true' : 'false');
}

function getRememberMe() {
    return localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
}

// ===== Wins Management =====
function incrementPlayerWins() {
    const username = getCurrentUser();
    if (!username) return 0;
    const users = getUsers();
    if (users[username]) {
        users[username].wins = (users[username].wins || 0) + 1;
        saveUsers(users);
        if (typeof window.updateLeaderboardUI === 'function') {
            window.updateLeaderboardUI();
        }
        return users[username].wins;
    }
    return 0;
}

function getUserWins(username = null) {
    const targetUser = username || getCurrentUser();
    if (!targetUser) return 0;
    const users = getUsers();
    return users[targetUser]?.wins || 0;
}

function resetUserWins(username) {
    const users = getUsers();
    if (users[username]) {
        users[username].wins = 0;
        saveUsers(users);
    }
}

// ===== Leaderboard =====
function getLeaderboard() {
    const users = getUsers();
    return Object.entries(users)
        .map(([name, data]) => ({ name, wins: data.wins || 0 }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 5);
}

// ===== Password Management =====
function changePassword(username, oldPassword, newPassword) {
    if (!username) return { success: false, message: 'Not logged in!' };
    if (!newPassword || newPassword.length < 4) {
        return { success: false, message: 'New password must be at least 4 characters!' };
    }
    const users = getUsers();
    const user = users[username];
    if (!user) return { success: false, message: 'User not found!' };
    if (oldPassword === 'demo123' || user.password === simpleHash(oldPassword)) {
        user.password = simpleHash(newPassword);
        saveUsers(users);
        return { success: true, message: 'Password changed successfully!' };
    }
    return { success: false, message: 'Current password is incorrect!' };
}

function resetPassword(username) {
    if (!username) return { success: false, message: 'Username is required!' };
    const users = getUsers();
    if (!users[username]) return { success: false, message: 'User not found!' };
    users[username].password = simpleHash('demo123');
    saveUsers(users);
    return { success: true, message: 'Password reset to "demo123"' };
}

// ===== Terms Acceptance =====
function acceptTerms(username) {
    const users = getUsers();
    if (users[username]) {
        users[username].termsAccepted = true;
        saveUsers(users);
        return true;
    }
    return false;
}

function hasAcceptedTerms(username) {
    const users = getUsers();
    return users[username]?.termsAccepted || false;
}

// ===== Session Info =====
function isLoggedIn() {
    return !!getCurrentUser();
}

function getSessionInfo() {
    const username = getCurrentUser();
    if (!username) return { loggedIn: false };
    const users = getUsers();
    const userData = users[username];
    return {
        loggedIn: true,
        username,
        wins: userData?.wins || 0,
        created: userData?.created,
        lastLogin: userData?.lastLogin,
        rememberMe: getRememberMe(),
        termsAccepted: userData?.termsAccepted || false
    };
}

// ===== Clear All (for testing) =====
function clearAllStorage() {
    if (confirm('Are you sure? This will delete all users and leaderboard data!')) {
        localStorage.removeItem(STORAGE_KEYS.USERS);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(STORAGE_KEYS.TERMS_ACCEPTED);
        location.reload();
    }
}

// ===== Legacy exports (backward compatibility) =====
window.getUsername = getCurrentUser;
window.setUsername = setCurrentUser;
window.updateLeaderboard = function(name, wins) {
    // Legacy – no longer used, but kept to avoid breaking old code
    console.log('updateLeaderboard called (legacy)');
};

// ===== Expose all new functions globally =====
window.getUsers = getUsers;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentUser = getCurrentUser;
window.userExists = userExists;
window.getUserData = getUserData;
window.incrementPlayerWins = incrementPlayerWins;
window.getUserWins = getUserWins;
window.resetUserWins = resetUserWins;
window.getLeaderboard = getLeaderboard;
window.changePassword = changePassword;
window.resetPassword = resetPassword;
window.acceptTerms = acceptTerms;
window.hasAcceptedTerms = hasAcceptedTerms;
window.isLoggedIn = isLoggedIn;
window.getSessionInfo = getSessionInfo;
window.clearAllStorage = clearAllStorage;
window.setRememberMe = setRememberMe;
window.getRememberMe = getRememberMe;

// ===== Initialise demo user if no users exist =====
(function initDemoUser() {
    const users = getUsers();
    if (Object.keys(users).length === 0) {
        users['Player'] = {
            password: simpleHash('demo123'),
            wins: 0,
            created: new Date().toISOString(),
            lastLogin: null,
            termsAccepted: false
        };
        saveUsers(users);
        console.log('Demo user "Player" created with password "demo123"');
    }
})();