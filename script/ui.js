// ===== scripts/ui.js =====
// UI updates: HP bars, mana bar, clash display, leaderboard, element guide, game over popup

// ===== Icon Mapping =====
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
    lightning: 'fa-bolt',
    ice: 'fa-snowflake'
};

// ===== Element Colors =====
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
    const playerHP = typeof window.getPlayerHP === 'function' ? window.getPlayerHP() : 30;
    const computerHP = typeof window.getComputerHP === 'function' ? window.getComputerHP() : 30;

    const playerBar = document.getElementById('player-hp-bar');
    const playerText = document.getElementById('player-hp-text');
    const computerBar = document.getElementById('computer-hp-bar');
    const computerText = document.getElementById('computer-hp-text');

    if (playerBar) {
        const playerPercent = (playerHP / 30) * 100;
        playerBar.style.width = `${playerPercent}%`;
        
        if (playerHP <= 9) {
            playerBar.style.background = 'linear-gradient(90deg, #d63031, #e17055)';
        } else if (playerHP <= 18) {
            playerBar.style.background = 'linear-gradient(90deg, #f39c12, #f1c40f)';
        } else {
            playerBar.style.background = 'linear-gradient(90deg, #00b894, #00cec9)';
        }
    }
    if (playerText) {
        playerText.textContent = `${playerHP}/30`;
    }

    if (computerBar) {
        const computerPercent = (computerHP / 30) * 100;
        computerBar.style.width = `${computerPercent}%`;
        
        if (computerHP <= 9) {
            computerBar.style.background = 'linear-gradient(90deg, #c0392b, #e74c3c)';
        } else if (computerHP <= 18) {
            computerBar.style.background = 'linear-gradient(90deg, #e67e22, #f39c12)';
        } else {
            computerBar.style.background = 'linear-gradient(90deg, #d63031, #e17055)';
        }
    }
    if (computerText) {
        computerText.textContent = `${computerHP}/30`;
    }
}

// ===== Update Mana Bar =====
function updateManaBar() {
    const playerMana = typeof window.getPlayerMana === 'function' ? window.getPlayerMana() : 20;
    const maxMana = typeof window.getMaxMana === 'function' ? window.getMaxMana() : 20;

    const manaBar = document.getElementById('player-mana-bar');
    const manaText = document.getElementById('player-mana-text');

    if (manaBar) {
        const manaPercent = (playerMana / maxMana) * 100;
        manaBar.style.width = `${manaPercent}%`;
    }
    if (manaText) {
        manaText.textContent = `${playerMana}/${maxMana}`;
    }
}

// ===== Update Clash Area with Animation =====
function updateClashArea(playerMove, playerElement, computerMove, computerElement, result, damage, elementalMessage = '', comboMessage = '') {
    const playerClashSpan = document.querySelector('.player-clash');
    const computerClashSpan = document.querySelector('.computer-clash');
    const clashMessage = document.getElementById('clash-message');
    const damageMessage = document.getElementById('damage-message');
    const elementalMessageDiv = document.getElementById('elemental-message');
    const clashIconsContainer = document.getElementById('clash-icons');

    if (!playerClashSpan || !computerClashSpan || !clashMessage || !damageMessage) return;

    // Build player side icons
    const playerMoveIcon = moveIcons[playerMove] ? getIconHTML(moveIcons[playerMove]) : '';
    const playerElementIcon = elementIcons[playerElement] ? 
        getIconHTML(elementIcons[playerElement], elementColors[playerElement]) : '';
    playerClashSpan.innerHTML = playerMoveIcon + ' ' + playerElementIcon;
    if (playerMove) {
        playerClashSpan.title = `${playerMove.charAt(0).toUpperCase() + playerMove.slice(1)} + ${elementNames[playerElement] || ''}`;
    }

    // Build computer side icons
    const computerMoveIcon = moveIcons[computerMove] ? getIconHTML(moveIcons[computerMove]) : '';
    const computerElementIcon = elementIcons[computerElement] ? 
        getIconHTML(elementIcons[computerElement], elementColors[computerElement]) : '';
    computerClashSpan.innerHTML = computerMoveIcon + ' ' + computerElementIcon;
    if (computerMove) {
        computerClashSpan.title = `${computerMove.charAt(0).toUpperCase() + computerMove.slice(1)} + ${elementNames[computerElement] || ''}`;
    }

    // Update messages
    let resultText = '';
    let damageText = '';

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
        elementalMessage = '';
    } else if (result === 'insufficient_mana') {
        resultText = '⚠️ INSUFFICIENT MANA! ⚠️';
        damageText = 'You need more mana for that element.';
        elementalMessage = '';
    }

    clashMessage.textContent = resultText;
    damageMessage.textContent = damageText;

    if (elementalMessageDiv) {
        let fullMessage = elementalMessage;
        if (comboMessage) {
            fullMessage = comboMessage + ' ' + elementalMessage;
        }
        elementalMessageDiv.innerHTML = fullMessage ? 
            `<i class="fas fa-info-circle"></i> ${fullMessage}` : '';
    }

    // Add animation
    if (clashIconsContainer) {
        clashIconsContainer.classList.remove(
            'clash-animation', 'clash-lightning', 'clash-ice', 'clash-fire',
            'clash-water', 'clash-earth', 'clash-air', 'clash-critical'
        );

        if (result === 'player' && playerElement) {
            clashIconsContainer.classList.add(`clash-${playerElement}`);
            if (damage >= 5) {
                clashIconsContainer.classList.add('clash-critical');
            }
        } else if (result === 'computer' && computerElement) {
            clashIconsContainer.classList.add(`clash-${computerElement}`);
            if (damage >= 5) {
                clashIconsContainer.classList.add('clash-critical');
            }
        } else {
            clashIconsContainer.classList.add('clash-animation');
        }

        setTimeout(() => {
            clashIconsContainer.classList.remove(
                'clash-animation', 'clash-lightning', 'clash-ice', 'clash-fire',
                'clash-water', 'clash-earth', 'clash-air', 'clash-critical'
            );
        }, 600);
    }
}

// ===== Toggle Element Guide =====
function toggleElementGuide() {
    const guideContent = document.getElementById('element-guide-content');
    const toggleBtn = document.getElementById('toggle-guide-btn');
    if (!guideContent || !toggleBtn) return;

    guideContent.classList.toggle('hidden');
    if (guideContent.classList.contains('hidden')) {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Show Element Guide';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Element Guide';
    }
}

// ===== Show Game Over Popup =====
function showGameOverPopup(winner) {
    const popup = document.getElementById('gameover-popup');
    const message = document.getElementById('gameover-message');
    if (!popup || !message) return;

    const username = typeof window.getUsername === 'function' ? window.getUsername() : 'Player';
    if (winner === 'player') {
        message.textContent = `Congratulations ${username}! You won! Play again?`;
    } else {
        message.textContent = `Computer wins! Try again?`;
    }
    popup.classList.remove('hidden');
}

// ===== Hide Game Over Popup =====
function hideGameOverPopup() {
    const popup = document.getElementById('gameover-popup');
    if (popup) popup.classList.add('hidden');
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
}

// ===== Animate Element Selection =====
function animateElementSelection(element) {
    const buttons = document.querySelectorAll(`.element-btn[data-element="${element}"]`);
    buttons.forEach(btn => {
        btn.classList.add('element-pulse');
        setTimeout(() => btn.classList.remove('element-pulse'), 300);
    });
}

// ===== Update Leaderboard UI =====
function updateLeaderboardUI() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    const leaderboard = typeof window.getLeaderboard === 'function' ? window.getLeaderboard() : [];

    leaderboardList.innerHTML = '';

    if (leaderboard.length === 0) {
        for (let i = 1; i <= 5; i++) {
            const li = document.createElement('li');
            li.innerHTML = `${i}. <i class="fas fa-trophy" style="color: ${getTrophyColor(i)};"></i> `;
            leaderboardList.appendChild(li);
        }
    } else {
        leaderboard.slice(0, 5).forEach((entry, index) => {
            const li = document.createElement('li');
            const trophyColor = getTrophyColor(index + 1);
            li.innerHTML = `${index + 1}. <i class="fas fa-trophy" style="color: ${trophyColor};"></i> ` +
                          `<strong>${entry.name}</strong> – ${entry.wins} win${entry.wins !== 1 ? 's' : ''}`;
            leaderboardList.appendChild(li);
        });
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
        case 1: return '#ffd700';
        case 2: return '#c0c0c0';
        case 3: return '#cd7f32';
        default: return '#95a5a6';
    }
}

// ===== Expose functions globally =====
window.updateHPBars = updateHPBars;
window.updateManaBar = updateManaBar;
window.updateClashArea = updateClashArea;
window.toggleElementGuide = toggleElementGuide;
window.showGameOverPopup = showGameOverPopup;
window.hideGameOverPopup = hideGameOverPopup;
window.clearClashArea = clearClashArea;
window.animateElementSelection = animateElementSelection;
window.updateLeaderboardUI = updateLeaderboardUI;
window.getElementBadge = getElementBadge;