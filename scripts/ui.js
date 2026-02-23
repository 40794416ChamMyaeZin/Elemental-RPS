// ===== scripts/ui.js =====
// UI updates: HP bars, clash display, leaderboard

// ===== Icon Mapping (Updated with Lightning & Ice) =====
const moveIcons = {
    rock: 'fa-hand-rock',
    paper: 'fa-hand-paper',
    scissors: 'fa-hand-scissors'
};

const elementIcons = {
    fire: 'fa-fire',
    water: 'fa-water',
    earth: 'fa-mountain',
    air: 'fa-wind',
    lightning: 'fa-bolt',    // Lightning icon
    ice: 'fa-snowflake'      // Ice icon
};

// ===== Element Colors for Visual Effects =====
const elementColors = {
    fire: '#e17055',
    water: '#0984e3',
    earth: '#27ae60',
    air: '#74b9ff',
    lightning: '#f1c40f',
    ice: '#3498db'
};

// ===== Element Display Names =====
const elementNames = {
    fire: 'Fire',
    water: 'Water',
    earth: 'Earth',
    air: 'Air',
    lightning: 'Lightning',
    ice: 'Ice'
};

// ===== Helper: Create icon HTML =====
function getIconHTML(iconClass, color = null) {
    const style = color ? ` style="color: ${color};"` : '';
    return `<i class="fas ${iconClass}"${style}></i>`;
}

// ===== Helper: Create element badge =====
function getElementBadge(element) {
    if (!element || !elementIcons[element]) return '';
    const icon = elementIcons[element];
    const color = elementColors[element];
    const name = elementNames[element];
    return `<span class="element-badge" style="color: ${color};">${getIconHTML(icon)} ${name}</span>`;
}

// ===== Update HP Bars =====
function updateHPBars() {
    const playerHP = typeof window.getPlayerHP === 'function' ? window.getPlayerHP() : 10;
    const computerHP = typeof window.getComputerHP === 'function' ? window.getComputerHP() : 10;

    const playerBar = document.getElementById('player-hp-bar');
    const playerText = document.getElementById('player-hp-text');
    const computerBar = document.getElementById('computer-hp-bar');
    const computerText = document.getElementById('computer-hp-text');

    if (playerBar) {
        const playerPercent = (playerHP / 10) * 100;
        playerBar.style.width = `${playerPercent}%`;

        // Change color based on HP level
        if (playerHP <= 3) {
            playerBar.style.background = 'linear-gradient(90deg, #d63031, #e17055)';
        } else if (playerHP <= 6) {
            playerBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
        } else {
            playerBar.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
        }
    }
    if (playerText) {
        playerText.textContent = `${playerHP}/10`;
    }

    if (computerBar) {
        const computerPercent = (computerHP / 10) * 100;
        computerBar.style.width = `${computerPercent}%`;

        // Computer HP bar always in reds
        if (computerHP <= 3) {
            computerBar.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
        } else if (computerHP <= 6) {
            computerBar.style.background = 'linear-gradient(90deg, #e67e22, #f39c12)';
        } else {
            computerBar.style.background = 'linear-gradient(90deg, #d63031, #e17055)';
        }
    }
    if (computerText) {
        computerText.textContent = `${computerHP}/10`;
    }
}

// ===== Update Clash Area with Animation =====
function updateClashArea(playerMove, playerElement, computerMove, computerElement, result, damage, elementalMessage = '') {
    const playerClashSpan = document.querySelector('.player-clash');
    const computerClashSpan = document.querySelector('.computer-clash');
    const clashMessage = document.getElementById('clash-message');
    const damageMessage = document.getElementById('damage-message');
    const elementalMessageDiv = document.getElementById('elemental-message');
    const clashIconsContainer = document.getElementById('clash-icons');

    if (!playerClashSpan || !computerClashSpan || !clashMessage || !damageMessage) return;

    // Build player side icons (move + element) with colors
    const playerMoveIcon = moveIcons[playerMove] ? getIconHTML(moveIcons[playerMove]) : '';
    const playerElementIcon = elementIcons[playerElement] ?
        getIconHTML(elementIcons[playerElement], elementColors[playerElement]) : '';
    playerClashSpan.innerHTML = playerMoveIcon + ' ' + playerElementIcon;

    // Add move name tooltip
    if (playerMove) {
        playerClashSpan.title = `${playerMove.charAt(0).toUpperCase() + playerMove.slice(1)} + ${elementNames[playerElement] || ''}`;
    }

    // Build computer side icons with element colors
    const computerMoveIcon = moveIcons[computerMove] ? getIconHTML(moveIcons[computerMove]) : '';
    const computerElementIcon = elementIcons[computerElement] ?
        getIconHTML(elementIcons[computerElement], elementColors[computerElement]) : '';
    computerClashSpan.innerHTML = computerMoveIcon + ' ' + computerElementIcon;

    // Add computer tooltip
    if (computerMove) {
        computerClashSpan.title = `${computerMove.charAt(0).toUpperCase() + computerMove.slice(1)} + ${elementNames[computerElement] || ''}`;
    }

    // Update result messages with emojis
    let resultText = '';
    let damageText = '';
    let elementalText = elementalMessage || '';

    if (result === 'player') {
        resultText = '✨ VICTORY! ✨';
        damageText = `💥 Dealt ${damage} damage!`;
    } else if (result === 'computer') {
        resultText = '💻 DEFEAT! 💻';
        damageText = `💔 Took ${damage} damage!`;
    } else if (result === 'tie') {
        resultText = '🤝 TIE! No damage. 🤝';
        damageText = '';
    } else if (result === 'invalid') {
        resultText = '⚠️ Select both move and element! ⚠️';
        damageText = '';
        elementalText = '';
    }

    clashMessage.textContent = resultText;
    damageMessage.textContent = damageText;

    if (elementalMessageDiv) {
        elementalMessageDiv.innerHTML = elementalText ?
            `<i class="fas fa-info-circle"></i> ${elementalText}` : '';
    }

    // Add animation class with element-specific effects
    if (clashIconsContainer) {
        // Remove any existing animation classes
        clashIconsContainer.classList.remove(
            'clash-animation', 'clash-lightning', 'clash-ice', 'clash-fire',
            'clash-water', 'clash-earth', 'clash-air', 'clash-critical'
        );

        // Add element-specific animation based on winner
        if (result === 'player' && playerElement) {
            clashIconsContainer.classList.add(`clash-${playerElement}`);
            // Check if it was a critical hit (damage >= 4)
            if (damage >= 4) {
                clashIconsContainer.classList.add('clash-critical');
            }
        } else if (result === 'computer' && computerElement) {
            clashIconsContainer.classList.add(`clash-${computerElement}`);
            if (damage >= 4) {
                clashIconsContainer.classList.add('clash-critical');
            }
        } else if (result === 'tie') {
            clashIconsContainer.classList.add('clash-animation');
        }

        // Always add base clash animation
        clashIconsContainer.classList.add('clash-animation');

        // Remove after animation ends
        setTimeout(() => {
            clashIconsContainer.classList.remove(
                'clash-animation', 'clash-lightning', 'clash-ice', 'clash-fire',
                'clash-water', 'clash-earth', 'clash-air', 'clash-critical'
            );
        }, 600);
    }
}

// ===== Update Leaderboard UI =====
function updateLeaderboardUI() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    // Get leaderboard from storage
    const leaderboard = typeof window.getLeaderboard === 'function' ? window.getLeaderboard() : [];

    // Clear current list
    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        // Show placeholder empty entries with trophy icons
        for (let i = 1; i <= 5; i++) {
            const li = document.createElement('li');
            li.innerHTML = `${i}. <i class="fas fa-trophy" style="color: ${getTrophyColor(i)};"></i> `;
            leaderboardList.appendChild(li);
        }
    } else {
        // Populate top 5
        leaderboard.slice(0, 5).forEach((entry, index) => {
            const li = document.createElement('li');
            const trophyColor = getTrophyColor(index + 1);
            li.innerHTML = `${index + 1}. <i class="fas fa-trophy" style="color: ${trophyColor};"></i> ` +
                `<strong>${entry.name}</strong> – ${entry.wins} win${entry.wins !== 1 ? 's' : ''}`;
            leaderboardList.appendChild(li);
        });

        // Fill remaining spots if less than 5
        for (let i = leaderboard.length; i < 5; i++) {
            const li = document.createElement('li');
            li.innerHTML = `${i + 1}. <i class="fas fa-trophy" style="color: ${getTrophyColor(i + 1)};"></i> `;
            leaderboardList.appendChild(li);
        }
    }
}

// ===== Helper: Get trophy color by rank =====
function getTrophyColor(rank) {
    switch(rank) {
        case 1: return '#ffd700'; // Gold
        case 2: return '#c0c0c0'; // Silver
        case 3: return '#cd7f32'; // Bronze
        default: return '#95a5a6'; // Grey
    }
}

// ===== Show Game Over Modal =====
function showGameOver(winner) {
    const username = typeof window.getUsername === 'function' ? window.getUsername() : 'Player';
    const message = winner === 'player' ?
        `${username} wins! 🏆` :
        'Computer wins! 💻';

    // Create a subtle game over notification
    const clashArea = document.getElementById('clash-area');
    if (clashArea) {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over-message';
        gameOverDiv.innerHTML = `
            <div class="game-over-content">
                <h3>${message}</h3>
                <p>Press Reset to play again</p>
            </div>
        `;

        // Remove any existing game over message
        const existing = document.querySelector('.game-over-message');
        if (existing) existing.remove();

        clashArea.appendChild(gameOverDiv);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (gameOverDiv.parentNode) {
                gameOverDiv.remove();
            }
        }, 3000);
    }
}

// ===== Clear Clash Area (for reset) =====
function clearClashArea() {
    const playerClashSpan = document.querySelector('.player-clash');
    const computerClashSpan = document.querySelector('.computer-clash');
    const clashMessage = document.getElementById('clash-message');
    const damageMessage = document.getElementById('damage-message');
    const elementalMessageDiv = document.getElementById('elemental-message');

    if (playerClashSpan) playerClashSpan.innerHTML = '';
    if (computerClashSpan) computerClashSpan.innerHTML = '';
    if (clashMessage) clashMessage.textContent = 'Make your choices!';
    if (damageMessage) damageMessage.textContent = '';
    if (elementalMessageDiv) elementalMessageDiv.innerHTML = '';

    // Remove any game over messages
    const gameOverMsg = document.querySelector('.game-over-message');
    if (gameOverMsg) gameOverMsg.remove();
}

// ===== Animate Element Selection =====
function animateElementSelection(element) {
    const buttons = document.querySelectorAll(`.element-btn[data-element="${element}"]`);
    buttons.forEach(btn => {
        btn.classList.add('element-pulse');
        setTimeout(() => {
            btn.classList.remove('element-pulse');
        }, 300);
    });
}

// ===== Expose functions globally =====
window.updateHPBars = updateHPBars;
window.updateClashArea = updateClashArea;
window.updateLeaderboardUI = updateLeaderboardUI;
window.showGameOver = showGameOver;
window.clearClashArea = clearClashArea;
window.animateElementSelection = animateElementSelection;
window.getElementBadge = getElementBadge;