// ===== scripts/main.js =====
// Initialisation, login/logout, event listeners with password support
// Updated for mana system, begin round button, game over popup, element guide toggle

/* global
   loginUser, registerUser, resetPassword, logoutUser,
   getRememberMe, getCurrentUser, setPlayerMove, setPlayerElement,
   resetGame, updateHPBars, updateManaBar, clearClashArea, updateLeaderboardUI,
   animateElementSelection, resolveRound, isGameOver, getPlayerHP,
   showGameOverPopup, hideGameOverPopup, toggleElementGuide,
   hasEnoughMana, getElementCost
*/

document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const loginSection = document.getElementById('login-section');
    const gameSection = document.getElementById('game-section');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const displayUsernameSpan = document.getElementById('display-username');
    const moveButtons = document.querySelectorAll('.move-btn');
    const elementButtons = document.querySelectorAll('.element-btn');
    const resetBtn = document.getElementById('reset-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const beginRoundBtn = document.getElementById('begin-round-btn');
    const toggleGuideBtn = document.getElementById('toggle-guide-btn');
    const gameOverPopup = document.getElementById('gameover-popup');
    const gameOverYes = document.getElementById('gameover-yes');
    const gameOverNo = document.getElementById('gameover-no');

    // Modal elements
    const registerModal = document.getElementById('register-modal');
    const forgotModal = document.getElementById('forgot-modal');
    const termsModal = document.getElementById('terms-modal');
    const registerLink = document.getElementById('register-link');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const termsLink = document.getElementById('terms-link');
    const termsLinkReg = document.getElementById('terms-link-reg');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const cancelRegisterBtn = document.getElementById('cancel-register-btn');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const registerBtn = document.getElementById('register-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const acceptTermsBtn = document.getElementById('accept-terms-btn');

    // Registration modal inputs
    const regUsername = document.getElementById('reg-username');
    const regPassword = document.getElementById('reg-password');
    const regConfirmPassword = document.getElementById('reg-confirm-password');

    // Reset modal inputs
    const resetUsername = document.getElementById('reset-username');

    // ===== State =====
    let currentUsername = null;
    let roundInProgress = false;

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
        moveButtons.forEach(btn => btn.classList.remove('selected'));
        elementButtons.forEach(btn => btn.classList.remove('selected'));
        if (typeof setPlayerMove === 'function') setPlayerMove(null);
        if (typeof setPlayerElement === 'function') setPlayerElement(null);
        if (beginRoundBtn) beginRoundBtn.disabled = true;
    }

    function resetUIAndGame() {
        if (typeof resetGame === 'function') resetGame();
        clearSelections();
        if (typeof updateHPBars === 'function') updateHPBars();
        if (typeof updateManaBar === 'function') updateManaBar();
        if (typeof clearClashArea === 'function') clearClashArea();
        moveButtons.forEach(btn => btn.disabled = false);
        elementButtons.forEach(btn => btn.disabled = false);
        if (beginRoundBtn) beginRoundBtn.disabled = true;
        roundInProgress = false;
        if (typeof hideGameOverPopup === 'function') hideGameOverPopup();
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

    function showModal(modal) {
        if (modal) modal.style.display = 'block';
    }

    function hideModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    function clearModalInputs() {
        if (regUsername) regUsername.value = '';
        if (regPassword) regPassword.value = '';
        if (regConfirmPassword) regConfirmPassword.value = '';
        if (resetUsername) resetUsername.value = '';
    }

    // ===== Login / Register / Logout (unchanged from previous) =====
    function login(username, password, remember = true) {
        if (!username?.trim()) {
            showTemporaryMessage('Please enter your username!', 'error');
            return;
        }
        if (!password?.trim()) {
            showTemporaryMessage('Please enter your password!', 'error');
            return;
        }
        if (loginBtn) loginBtn.classList.add('loading');
        if (typeof loginUser === 'function') {
            setTimeout(() => {
                const result = loginUser(username, password, remember);
                if (result.success) {
                    currentUsername = username.trim();
                    updateGreeting(currentUsername);
                    showSection(gameSection);
                    resetUIAndGame();
                    if (typeof updateLeaderboardUI === 'function') updateLeaderboardUI();
                    showTemporaryMessage(`Welcome, ${currentUsername}! ⚡`, 'success');
                    usernameInput.value = '';
                    passwordInput.value = '';
                } else {
                    showTemporaryMessage(result.message, 'error');
                }
                if (loginBtn) loginBtn.classList.remove('loading');
            }, 500);
        } else {
            console.warn('loginUser function not found, using fallback');
            currentUsername = username.trim();
            updateGreeting(currentUsername);
            showSection(gameSection);
            resetUIAndGame();
            showTemporaryMessage(`Welcome, ${currentUsername}! (Demo Mode)`, 'info');
            if (loginBtn) loginBtn.classList.remove('loading');
        }
    }

    function register() {
        const username = regUsername?.value;
        const password = regPassword?.value;
        const confirmPassword = regConfirmPassword?.value;
        if (!username?.trim()) {
            showTemporaryMessage('Please choose a username!', 'error');
            return;
        }
        if (!password?.trim()) {
            showTemporaryMessage('Please choose a password!', 'error');
            return;
        }
        if (password.length < 4) {
            showTemporaryMessage('Password must be at least 4 characters!', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showTemporaryMessage('Passwords do not match!', 'error');
            return;
        }
        if (typeof registerUser === 'function') {
            const result = registerUser(username, password);
            if (result.success) {
                showTemporaryMessage('Registration successful! Logging in...', 'success');
                hideModal(registerModal);
                clearModalInputs();
                login(username, password);
            } else {
                showTemporaryMessage(result.message, 'error');
            }
        } else {
            showTemporaryMessage('Registration not available in demo mode. Use any login.', 'info');
            hideModal(registerModal);
        }
    }

    function resetPassword() {
        const username = resetUsername?.value;
        if (!username?.trim()) {
            showTemporaryMessage('Please enter your username!', 'error');
            return;
        }
        if (typeof resetPassword === 'function') {
            const result = resetPassword(username);
            if (result.success) {
                showTemporaryMessage(result.message, 'success');
                hideModal(forgotModal);
                clearModalInputs();
            } else {
                showTemporaryMessage(result.message, 'error');
            }
        } else {
            showTemporaryMessage('Password reset not available. Try "demo123".', 'info');
            hideModal(forgotModal);
        }
    }

    function logout() {
        currentUsername = null;
        if (typeof logoutUser === 'function') logoutUser();
        resetUIAndGame();
        showSection(loginSection);
        usernameInput.value = '';
        passwordInput.value = '';
        showTemporaryMessage('Come back soon! 👋', 'info');
    }

    // ===== Round Execution (triggered by Begin Round button) =====
    function startRound() {
        if (roundInProgress) return;

        const selectedMove = document.querySelector('.move-btn.selected');
        const selectedElement = document.querySelector('.element-btn.selected');

        if (!selectedMove || !selectedElement) {
            showTemporaryMessage('Select a move and element first!', 'error');
            return;
        }

        const move = selectedMove.dataset.move;
        const element = selectedElement.dataset.element;

        // Check mana
        if (typeof hasEnoughMana === 'function' && !hasEnoughMana(element)) {
            showTemporaryMessage('Not enough mana!', 'error');
            return;
        }

        roundInProgress = true;
        beginRoundBtn.disabled = true;
        moveButtons.forEach(btn => btn.disabled = true);
        elementButtons.forEach(btn => btn.disabled = true);

        // Set player choices
        if (typeof setPlayerMove === 'function') setPlayerMove(move);
        if (typeof setPlayerElement === 'function') setPlayerElement(element);

        // Small delay for drama
        setTimeout(() => {
            if (typeof resolveRound === 'function') {
                const result = resolveRound();

                // Update UI
                if (typeof updateClashArea === 'function') {
                    updateClashArea(
                        move,
                        element,
                        result.computerMove,
                        result.computerElement,
                        result.result,
                        result.damage,
                        result.elementalMessage,
                        result.comboMessage
                    );
                }
                if (typeof updateHPBars === 'function') updateHPBars();
                if (typeof updateManaBar === 'function') updateManaBar();

                // Check game over
                if (typeof isGameOver === 'function' && isGameOver()) {
                    const playerHP = typeof getPlayerHP === 'function' ? getPlayerHP() : 0;
                    const winner = playerHP <= 0 ? 'computer' : 'player';
                    if (winner === 'player' && typeof incrementPlayerWins === 'function') {
                        incrementPlayerWins();
                        if (typeof updateLeaderboardUI === 'function') updateLeaderboardUI();
                    }
                    if (typeof showGameOverPopup === 'function') showGameOverPopup(winner);
                    // Buttons remain disabled until popup action
                } else {
                    // Re-enable for next round
                    moveButtons.forEach(btn => btn.disabled = false);
                    elementButtons.forEach(btn => btn.disabled = false);
                    // Clear selections? Or keep them? Let's keep them for convenience.
                    // But we should disable begin round until new selections?
                    // Actually after round, selections are still there; we can allow another round with same choices.
                    // However mana may be insufficient now; begin round should be re-enabled but will check mana.
                    beginRoundBtn.disabled = false;
                    roundInProgress = false;
                }
            }
        }, 100);
    }

    // ===== Event Listeners =====

    // Login
    loginBtn.addEventListener('click', () => {
        const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
        login(usernameInput.value, passwordInput.value, remember);
    });
    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : true;
                login(usernameInput.value, passwordInput.value, remember);
            }
        });
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Move selection – just highlight, no auto-round
    moveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;
            moveButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            // Enable begin round if both selected
            const selectedElement = document.querySelector('.element-btn.selected');
            if (selectedElement) beginRoundBtn.disabled = false;
        });
    });

    // Element selection – highlight and check mana
    elementButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;
            elementButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if (typeof animateElementSelection === 'function') {
                animateElementSelection(btn.dataset.element);
            }
            // Check if enough mana (visual cue)
            const element = btn.dataset.element;
            if (typeof hasEnoughMana === 'function' && !hasEnoughMana(element)) {
                btn.style.opacity = '0.6';
                btn.title = 'Not enough mana!';
            } else {
                btn.style.opacity = '1';
                btn.title = '';
            }
            // Enable begin round if move also selected
            const selectedMove = document.querySelector('.move-btn.selected');
            if (selectedMove) beginRoundBtn.disabled = false;
        });
    });

    // Begin Round button
    beginRoundBtn.addEventListener('click', startRound);

    // Reset button
    resetBtn.addEventListener('click', () => {
        resetUIAndGame();
        showTemporaryMessage('Game reset! Ready for battle! ⚔️', 'info');
    });

    // Game Over popup buttons
    if (gameOverYes) {
        gameOverYes.addEventListener('click', () => {
            resetUIAndGame();
            // Re-enable buttons
            moveButtons.forEach(btn => btn.disabled = false);
            elementButtons.forEach(btn => btn.disabled = false);
            beginRoundBtn.disabled = true; // until selections
            roundInProgress = false;
            hideGameOverPopup();
        });
    }
    if (gameOverNo) {
        gameOverNo.addEventListener('click', () => {
            hideGameOverPopup();
            logout(); // or just return to login? Logout is fine.
        });
    }

    // Toggle element guide
    if (toggleGuideBtn) {
        toggleGuideBtn.addEventListener('click', toggleElementGuide);
    }

    // Modal links
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(registerModal);
        });
    }
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(forgotModal);
        });
    }
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(termsModal);
        });
    }
    if (termsLinkReg) {
        termsLinkReg.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(termsModal);
        });
    }

    // Close modal buttons
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(registerModal);
            hideModal(forgotModal);
            hideModal(termsModal);
            clearModalInputs();
        });
    });
    if (cancelRegisterBtn) {
        cancelRegisterBtn.addEventListener('click', () => {
            hideModal(registerModal);
            clearModalInputs();
        });
    }
    if (cancelResetBtn) {
        cancelResetBtn.addEventListener('click', () => {
            hideModal(forgotModal);
            clearModalInputs();
        });
    }
    if (acceptTermsBtn) {
        acceptTermsBtn.addEventListener('click', () => {
            hideModal(termsModal);
            showTemporaryMessage('Terms accepted!', 'success');
        });
    }

    // Register button
    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
    // Reset password button
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', resetPassword);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === registerModal) {
            hideModal(registerModal);
            clearModalInputs();
        }
        if (e.target === forgotModal) {
            hideModal(forgotModal);
            clearModalInputs();
        }
        if (e.target === termsModal) {
            hideModal(termsModal);
        }
    });

    // Theme toggle
    if (themeToggle) {
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
            themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            showTemporaryMessage(`${isDark ? '🌙 Dark' : '☀️ Light'} mode activated!`, 'info');
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (!gameSection.classList.contains('active')) return;
        const key = e.key;
        if (key === '1') document.querySelector('.move-btn[data-move="rock"]')?.click();
        else if (key === '2') document.querySelector('.move-btn[data-move="paper"]')?.click();
        else if (key === '3') document.querySelector('.move-btn[data-move="scissors"]')?.click();

        const elementMap = {
            '4': 'fire', '5': 'water', '6': 'earth',
            '7': 'air', '8': 'lightning', '9': 'ice'
        };
        if (elementMap[key]) {
            document.querySelector(`.element-btn[data-element="${elementMap[key]}"]`)?.click();
        }

        if (key.toLowerCase() === 'r') resetBtn?.click();
        if (key.toLowerCase() === 'l') logout();
        if (key.toLowerCase() === 't') themeToggle?.click();
        if (key === 'Enter' && !beginRoundBtn.disabled) beginRoundBtn?.click();
    });

    // ===== Auto-login check =====
    function checkAutoLogin() {
        const remember = typeof getRememberMe === 'function' ? getRememberMe() : false;
        if (remember) {
            const savedUsername = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            if (savedUsername) {
                usernameInput.value = savedUsername;
                passwordInput.focus();
                showTemporaryMessage(`Welcome back, ${savedUsername}! Please enter your password.`, 'info');
            }
        }
    }

    // ===== Initialisation =====
    checkAutoLogin();
    if (typeof updateLeaderboardUI === 'function') updateLeaderboardUI();
});