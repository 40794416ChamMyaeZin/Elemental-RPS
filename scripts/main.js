// ===== scripts/main.js =====
// Initialisation, login/logout, event listeners with six elements support

document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const loginSection = document.getElementById('login-section');
    const gameSection = document.getElementById('game-section');
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const displayUsernameSpan = document.getElementById('display-username');
    const moveButtons = document.querySelectorAll('.move-btn');
    const elementButtons = document.querySelectorAll('.element-btn');
    const resetBtn = document.getElementById('reset-btn');
    const themeToggle = document.getElementById('theme-toggle');

    // ===== State =====
    let currentUsername = null;
    let roundInProgress = false; // Prevent multiple round executions

    // ===== Helper Functions =====
    function showSection(section) {
        loginSection.classList.remove('active');
        gameSection.classList.remove('active');
        section.classList.add('active');
    }

    function updateGreeting(name) {
        displayUsernameSpan.textContent = name;
    }

    function clearSelections() {
        // Remove selected class from all move and element buttons
        moveButtons.forEach(btn => btn.classList.remove('selected'));
        elementButtons.forEach(btn => btn.classList.remove('selected'));

        // Clear player choices in game.js
        if (typeof window.setPlayerMove === 'function') {
            window.setPlayerMove(null);
        }
        if (typeof window.setPlayerElement === 'function') {
            window.setPlayerElement(null);
        }
    }

    function resetUIAndGame() {
        // Reset game state
        if (typeof window.resetGame === 'function') {
            window.resetGame();
        }
        // Clear visual selections
        clearSelections();
        // Update HP bars
        if (typeof window.updateHPBars === 'function') {
            window.updateHPBars();
        }
        // Reset clash area
        if (typeof window.clearClashArea === 'function') {
            window.clearClashArea();
        }

        // Re-enable all buttons
        moveButtons.forEach(btn => btn.disabled = false);
        elementButtons.forEach(btn => btn.disabled = false);

        roundInProgress = false;
    }

    function login(username) {
        if (!username || !username.trim()) {
            alert('Please enter your name to enter the arena!');
            return;
        }
        currentUsername = username.trim();

        // Store in localStorage
        if (typeof window.setUsername === 'function') {
            window.setUsername(currentUsername);
        }

        // Update UI
        updateGreeting(currentUsername);
        showSection(gameSection);

        // Reset game for new player
        resetUIAndGame();

        // Load leaderboard
        if (typeof window.updateLeaderboardUI === 'function') {
            window.updateLeaderboardUI();
        }

        // Show welcome message
        showTemporaryMessage(`Welcome, ${currentUsername}! Choose your elements wisely!`, 'success');
    }

    function logout() {
        currentUsername = null;

        // Clear selections and reset game
        resetUIAndGame();

        // Return to login
        showSection(loginSection);
        usernameInput.value = '';

        // Show goodbye message
        showTemporaryMessage('Come back soon!', 'info');
    }

    function showTemporaryMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.classList.add('fade-out');
            setTimeout(() => messageDiv.remove(), 500);
        }, 2000);
    }

    async function executeRound() {
        if (roundInProgress) return;

        // Get selected move and element
        const selectedMove = document.querySelector('.move-btn.selected');
        const selectedElement = document.querySelector('.element-btn.selected');

        if (!selectedMove || !selectedElement) {
            // Update clash area with invalid message
            if (typeof window.updateClashArea === 'function') {
                window.updateClashArea(null, null, null, null, 'invalid', 0, '');
            }
            return;
        }

        roundInProgress = true;

        // Disable buttons during round resolution (optional)
        moveButtons.forEach(btn => btn.disabled = true);
        elementButtons.forEach(btn => btn.disabled = true);

        // Get move and element values
        const move = selectedMove.dataset.move;
        const element = selectedElement.dataset.element;

        // Set player choices in game.js
        if (typeof window.setPlayerMove === 'function') {
            window.setPlayerMove(move);
        }
        if (typeof window.setPlayerElement === 'function') {
            window.setPlayerElement(element);
        }

        // Add a small delay for drama (optional)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Resolve the round
        if (typeof window.resolveRound === 'function') {
            const result = window.resolveRound();

            // Update clash area with result
            if (typeof window.updateClashArea === 'function') {
                window.updateClashArea(
                    move,
                    element,
                    result.computerMove,
                    result.computerElement,
                    result.result,
                    result.damage,
                    result.elementalMessage || ''
                );
            }

            // Update HP bars
            if (typeof window.updateHPBars === 'function') {
                window.updateHPBars();
            }

            // Check for game over
            if (typeof window.isGameOver === 'function' && window.isGameOver()) {
                const playerHP = typeof window.getPlayerHP === 'function' ? window.getPlayerHP() : 0;
                const winner = playerHP <= 0 ? 'computer' : 'player';

                // Show game over message
                if (typeof window.showGameOver === 'function') {
                    window.showGameOver(winner);
                }

                // Update leaderboard if player won
                if (winner === 'player' && typeof window.updateLeaderboardUI === 'function') {
                    window.updateLeaderboardUI();
                }

                // Keep buttons disabled until reset
                return;
            }
        }

        // Re-enable buttons after round (if game not over)
        if (typeof window.isGameOver !== 'function' || !window.isGameOver()) {
            moveButtons.forEach(btn => btn.disabled = false);
            elementButtons.forEach(btn => btn.disabled = false);
        }

        roundInProgress = false;
    }

    // ===== Event Listeners =====
    loginBtn.addEventListener('click', () => {
        login(usernameInput.value);
    });

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            login(usernameInput.value);
        }
    });

    logoutBtn.addEventListener('click', logout);

    // Move selection
    moveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;

            // Deselect all moves
            moveButtons.forEach(b => b.classList.remove('selected'));
            // Select clicked button
            btn.classList.add('selected');

            // Trigger round if element also selected
            const selectedElement = document.querySelector('.element-btn.selected');
            if (selectedElement) {
                executeRound();
            }
        });
    });

    // Element selection (updated for six elements)
    elementButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;

            // Deselect all elements
            elementButtons.forEach(b => b.classList.remove('selected'));
            // Select clicked button
            btn.classList.add('selected');

            // Animate selection
            if (typeof window.animateElementSelection === 'function') {
                window.animateElementSelection(btn.dataset.element);
            }

            // Trigger round if move also selected
            const selectedMove = document.querySelector('.move-btn.selected');
            if (selectedMove) {
                executeRound();
            }
        });
    });

    // Reset button
    resetBtn.addEventListener('click', () => {
        resetUIAndGame();
        showTemporaryMessage('Game reset! Ready for a new battle!', 'info');
    });

    // Theme toggle
    if (themeToggle) {
        // Set initial icon based on saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');

            // Update icon
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

            // Save preference
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Show message
            showTemporaryMessage(`${isDark ? '🌙 Dark' : '☀️ Light'} mode activated!`, 'info');
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only if in game section
        if (!gameSection.classList.contains('active')) return;

        // Number keys for moves (1-3)
        if (e.key === '1') {
            document.querySelector('.move-btn[data-move="rock"]')?.click();
        } else if (e.key === '2') {
            document.querySelector('.move-btn[data-move="paper"]')?.click();
        } else if (e.key === '3') {
            document.querySelector('.move-btn[data-move="scissors"]')?.click();
        }

        // Number keys for elements (4-9 for six elements)
        if (e.key === '4') {
            document.querySelector('.element-btn[data-element="fire"]')?.click();
        } else if (e.key === '5') {
            document.querySelector('.element-btn[data-element="water"]')?.click();
        } else if (e.key === '6') {
            document.querySelector('.element-btn[data-element="earth"]')?.click();
        } else if (e.key === '7') {
            document.querySelector('.element-btn[data-element="air"]')?.click();
        } else if (e.key === '8') {
            document.querySelector('.element-btn[data-element="lightning"]')?.click();
        } else if (e.key === '9') {
            document.querySelector('.element-btn[data-element="ice"]')?.click();
        }

        // 'R' key for reset
        if (e.key === 'r' || e.key === 'R') {
            resetBtn?.click();
        }

        // 'L' key for logout
        if (e.key === 'l' || e.key === 'L') {
            logoutBtn?.click();
        }

        // 'T' key for theme toggle
        if (e.key === 't' || e.key === 'T') {
            themeToggle?.click();
        }
    });

    // Handle game over state - disable buttons if game over
    function checkGameOverAndDisable() {
        if (typeof window.isGameOver === 'function' && window.isGameOver()) {
            moveButtons.forEach(btn => btn.disabled = true);
            elementButtons.forEach(btn => btn.disabled = true);
            return true;
        }
        return false;
    }

    // Periodic check for game over (optional)
    setInterval(() => {
        if (gameSection.classList.contains('active')) {
            checkGameOverAndDisable();
        }
    }, 1000);

    // ===== Initialisation on page load =====
    const savedUsername = typeof window.getUsername === 'function' ? window.getUsername() : null;
    if (savedUsername) {
        // Auto-login
        login(savedUsername);
    } else {
        showSection(loginSection);
    }

    // Initial leaderboard load
    if (typeof window.updateLeaderboardUI === 'function') {
        window.updateLeaderboardUI();
    }

    // Add CSS for temporary messages
    const style = document.createElement('style');
    style.textContent = `
        .temp-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
        }
        
        .temp-message.success {
            background: linear-gradient(135deg, #00b894, #00cec9);
        }
        
        .temp-message.info {
            background: linear-gradient(135deg, #0984e3, #74b9ff);
        }
        
        .temp-message.error {
            background: linear-gradient(135deg, #d63031, #e17055);
        }
        
        .temp-message.fade-out {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        @keyframes slideDown {
            from {
                top: -50px;
                opacity: 0;
            }
            to {
                top: 20px;
                opacity: 1;
            }
        }
        
        .element-pulse {
            animation: elementPulse 0.3s ease;
        }
        
        @keyframes elementPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});