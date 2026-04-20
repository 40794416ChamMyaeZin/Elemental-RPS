// ===== scripts/main.js =====
// Initialisation, login/logout, event listeners with password support
// Updated for mana system, begin round button, game over popup, element guide toggle
// Now also updates computer mana bar
// FIX: Element button opacity updates after every mana change (round, reset, selection)

/* global
   loginUser, registerUser, resetPassword, logoutUser,
   getRememberMe, getCurrentUser, setPlayerMove, setPlayerElement,
   resetGame, updateHPBars, updateManaBar, updateComputerManaBar, clearClashArea, updateLeaderboardUI,
   animateElementSelection, resolveRound, isGameOver, getPlayerHP,
   showGameOverPopup, hideGameOverPopup, toggleElementGuide,
   hasEnoughMana, getElementCost, getPlayerMana
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

    // FIX: Update element button opacity based on current mana
    function updateElementButtonsManaStyle() {
        elementButtons.forEach(btn => {
            const element = btn.dataset.element;
            if (typeof hasEnoughMana === 'function' && !hasEnoughMana(element)) {
                btn.style.opacity = '0.6';
                btn.title = 'Not enough mana!';
            } else {
                btn.style.opacity = '1';
                btn.title = '';
            }
        });
    }

    function updateBeginRoundButton() {
        const selectedMove = document.querySelector('.move-btn.selected');
        const selectedElement = document.querySelector('.element-btn.selected');
        if (!selectedMove || !selectedElement) {
            beginRoundBtn.disabled = true;
            return;
        }
        const element = selectedElement.dataset.element;
        if (typeof hasEnoughMana === 'function' && hasEnoughMana(element)) {
            beginRoundBtn.disabled = false;
        } else {
            beginRoundBtn.disabled = true;
        }
    }

    function resetUIAndGame() {
        if (typeof resetGame === 'function') resetGame();
        clearSelections();
        if (typeof updateHPBars === 'function') updateHPBars();
        if (typeof updateManaBar === 'function') updateManaBar();
        if (typeof updateComputerManaBar === 'function') updateComputerManaBar();
        if (typeof clearClashArea === 'function') clearClashArea();
        moveButtons.forEach(btn => btn.disabled = false);
        elementButtons.forEach(btn => btn.disabled = false);
        updateElementButtonsManaStyle();   // <-- Update opacity after reset
        updateBeginRoundButton();
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

    function showModal(modal) { if (modal) modal.style.display = 'block'; }
    function hideModal(modal) { if (modal) modal.style.display = 'none'; }
    function clearModalInputs() {
        if (regUsername) regUsername.value = '';
        if (regPassword) regPassword.value = '';
        if (regConfirmPassword) regConfirmPassword.value = '';
        if (resetUsername) resetUsername.value = '';
    }

    // ===== Authentication Functions =====
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

    // ===== Round Execution =====
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

        if (typeof hasEnoughMana === 'function' && !hasEnoughMana(element)) {
            showTemporaryMessage('Not enough mana!', 'error');
            return;
        }

        roundInProgress = true;
        beginRoundBtn.disabled = true;
        moveButtons.forEach(btn => btn.disabled = true);
        elementButtons.forEach(btn => btn.disabled = true);

        if (typeof setPlayerMove === 'function') setPlayerMove(move);
        if (typeof setPlayerElement === 'function') setPlayerElement(element);

        setTimeout(() => {
            if (typeof resolveRound === 'function') {
                const result = resolveRound();

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
                if (typeof updateComputerManaBar === 'function') updateComputerManaBar();

                updateElementButtonsManaStyle();   // <-- Update opacity after mana changes

                if (typeof isGameOver === 'function' && isGameOver()) {
                    const playerHP = typeof getPlayerHP === 'function' ? getPlayerHP() : 0;
                    const winner = playerHP <= 0 ? 'computer' : 'player';
                    if (typeof updateLeaderboardUI === 'function') updateLeaderboardUI();
                    if (typeof showGameOverPopup === 'function') showGameOverPopup(winner);
                } else {
                    moveButtons.forEach(btn => btn.disabled = false);
                    elementButtons.forEach(btn => btn.disabled = false);
                    updateBeginRoundButton();
                    roundInProgress = false;
                }
            }
        }, 100);
    }

    // ===== Event Listeners =====
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

    logoutBtn.addEventListener('click', logout);

    moveButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;
            moveButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            updateBeginRoundButton();
        });
    });

    elementButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (roundInProgress) return;
            elementButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            if (typeof animateElementSelection === 'function') {
                animateElementSelection(btn.dataset.element);
            }
            updateElementButtonsManaStyle();   // <-- Update opacity on element selection (in case mana changed earlier)
            updateBeginRoundButton();
        });
    });

    beginRoundBtn.addEventListener('click', startRound);

    resetBtn.addEventListener('click', () => {
        resetUIAndGame();
        showTemporaryMessage('Game reset! Ready for battle! ⚔️', 'info');
    });

    if (gameOverYes) {
        gameOverYes.addEventListener('click', () => {
            resetUIAndGame();
            moveButtons.forEach(btn => btn.disabled = false);
            elementButtons.forEach(btn => btn.disabled = false);
            updateBeginRoundButton();
            roundInProgress = false;
            hideGameOverPopup();
        });
    }
    if (gameOverNo) {
        gameOverNo.addEventListener('click', () => {
            hideGameOverPopup();
            logout();
        });
    }

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

    if (registerBtn) {
        registerBtn.addEventListener('click', register);
    }
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', resetPassword);
    }

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

    checkAutoLogin();
    if (typeof updateLeaderboardUI === 'function') updateLeaderboardUI();
});