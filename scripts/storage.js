// ===== scripts/storage.js =====
// LocalStorage functions for username and leaderboard

// ===== Keys =====
const STORAGE_KEYS = {
    USERNAME: 'elementalRPS_username',
    LEADERBOARD: 'elementalRPS_leaderboard'
};

// ===== Username =====
function getUsername() {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
}

function setUsername(name) {
    if (name) {
        localStorage.setItem(STORAGE_KEYS.USERNAME, name);
    } else {
        localStorage.removeItem(STORAGE_KEYS.USERNAME);
    }
}

// ===== Leaderboard =====
function getLeaderboard() {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse leaderboard', e);
            return [];
        }
    }
    return [];
}

function saveLeaderboard(leaderboard) {
    // Sort by wins descending and keep top 5
    const sorted = leaderboard.sort((a, b) => b.wins - a.wins);
    const top5 = sorted.slice(0, 5);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(top5));
}

/**
 * Add or update a player's win count
 * @param {string} name - player name
 * @param {number} increment - number of wins to add (usually 1)
 */
function updateLeaderboard(name, increment = 1) {
    if (!name) return;

    const leaderboard = getLeaderboard();
    const existing = leaderboard.find(entry => entry.name === name);

    if (existing) {
        existing.wins += increment;
    } else {
        leaderboard.push({ name, wins: increment });
    }

    saveLeaderboard(leaderboard);
}

/**
 * Convenience function: increment wins for current user (from game.js)
 * Assumes getUsername() returns current user
 */
function incrementPlayerWins() {
    const username = getUsername();
    if (username) {
        updateLeaderboard(username, 1);
        // Optionally trigger UI update if needed
        if (typeof window.updateLeaderboardUI === 'function') {
            window.updateLeaderboardUI();
        }
    }
}

/**
 * Reset leaderboard completely (for testing or admin)
 */
function resetLeaderboard() {
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
}

// ===== Expose globally =====
window.getUsername = getUsername;
window.setUsername = setUsername;
window.getLeaderboard = getLeaderboard;
window.updateLeaderboard = updateLeaderboard;
window.incrementPlayerWins = incrementPlayerWins;
window.resetLeaderboard = resetLeaderboard;