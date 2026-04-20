// ===== scripts/game.js =====
// Core game logic: RPS, elements, damage, HP, mana, combos

// ===== Game State =====
let playerHP = 30;
let computerHP = 30;
let playerMana = 20;
const maxMana = 20;
const manaRegen = 2;
let playerMove = null;      // 'rock', 'paper', 'scissors'
let playerElement = null;   // one of the six elements
let computerMove = null;
let computerElement = null;
let lastPlayerElement = null; // for combos

// Win tracking (for leaderboard)
let playerWins = 0;

// ===== Element Costs =====
const elementCosts = {
    fire: 3,
    water: 2,
    earth: 4,
    air: 2,
    lightning: 5,
    ice: 3
};

// ===== Combo Definitions =====
// Format: [element1, element2] => { name, damageBonus, manaRefund, selfHeal }
const combos = [
    { elements: ['fire', 'lightning'], name: 'Firestorm', damageBonus: 2, manaRefund: 1, selfHeal: 0 },
    { elements: ['water', 'ice'], name: 'Frost', damageBonus: 1, manaRefund: 0, selfHeal: 0 },
    { elements: ['earth', 'water'], name: 'Mudslide', damageBonus: 1, manaRefund: 0, selfHeal: 1 },
    { elements: ['air', 'lightning'], name: 'Storm', damageBonus: 2, manaRefund: 2, selfHeal: 0 },
    { elements: ['fire', 'earth'], name: 'Magma', damageBonus: 2, manaRefund: 0, selfHeal: 0 },
    { elements: ['ice', 'air'], name: 'Blizzard', damageBonus: 1, manaRefund: 1, selfHeal: 0 },
    { elements: ['lightning', 'water'], name: 'Hydro Shock', damageBonus: 3, manaRefund: 0, selfHeal: 0 },
    { elements: ['earth', 'lightning'], name: 'Tectonic', damageBonus: 2, manaRefund: 1, selfHeal: 0 }
];

// ===== RPS Win Map =====
const rpsWinMap = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
};

// ===== Elemental Effectiveness Matrix =====
const elementStrongAgainst = {
    fire: 'air',
    air: 'earth',
    earth: 'water',
    water: 'fire',
    lightning: 'water',
    ice: 'earth'
};

const elementWeakAgainst = {
    fire: 'water',
    air: 'fire',
    earth: 'air',
    water: 'earth',
    lightning: 'earth',
    ice: 'fire'
};

// ===== Helper Functions =====

/**
 * Get random element from the six
 */
function getRandomElement() {
    const elements = ['fire', 'water', 'earth', 'air', 'lightning', 'ice'];
    return elements[Math.floor(Math.random() * elements.length)];
}

/**
 * Get random move from RPS
 */
function getRandomMove() {
    const moves = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Determine RPS winner: returns 'player', 'computer', or 'tie'
 */
function getRPSWinner(playerMove, computerMove) {
    if (playerMove === computerMove) return 'tie';
    if (rpsWinMap[playerMove] === computerMove) return 'player';
    return 'computer';
}

/**
 * Get elemental damage multiplier
 */
function getElementMultiplier(attackerElement, defenderElement) {
    // Super effective (2.0)
    if (elementStrongAgainst[attackerElement] === defenderElement) {
        return 2.0;
    }
    // Secondary strong (1.5)
    if (attackerElement === 'lightning' && defenderElement === 'air') return 1.5;
    if (attackerElement === 'ice' && defenderElement === 'water') return 1.5;
    if (attackerElement === 'fire' && defenderElement === 'ice') return 1.5;
    if (attackerElement === 'earth' && defenderElement === 'lightning') return 1.5;
    // Weak (0.5)
    if (elementWeakAgainst[attackerElement] === defenderElement) {
        return 0.5;
    }
    // Very weak (0.25)
    if (attackerElement === 'water' && defenderElement === 'lightning') return 0.25;
    if (attackerElement === 'ice' && defenderElement === 'fire') return 0.25;
    if (attackerElement === 'air' && defenderElement === 'earth') return 0.25;
    return 1.0;
}

/**
 * Calculate base damage for a round (before combo bonus)
 */
function calculateBaseDamage(winner, playerElement, computerElement) {
    const baseDamage = 2;
    if (winner === 'tie') return 0;
    if (winner === 'player') {
        return Math.round(baseDamage * getElementMultiplier(playerElement, computerElement));
    } else {
        return Math.round(baseDamage * getElementMultiplier(computerElement, playerElement));
    }
}

/**
 * Check for combo and return bonus object
 */
function checkCombo(prevElement, currentElement) {
    if (!prevElement) return null;
    for (let combo of combos) {
        if ((combo.elements[0] === prevElement && combo.elements[1] === currentElement) ||
            (combo.elements[0] === currentElement && combo.elements[1] === prevElement)) {
            return combo;
        }
    }
    return null;
}

/**
 * Resolve a round: called when player clicks Begin Round
 * Assumes playerMove and playerElement are set.
 * Returns result object with all details.
 */
function resolveRound() {
    if (!playerMove || !playerElement) {
        return {
            result: 'invalid',
            damage: 0,
            computerMove: null,
            computerElement: null,
            elementalMessage: '',
            comboMessage: ''
        };
    }

    // Check mana
    const cost = elementCosts[playerElement];
    if (playerMana < cost) {
        return {
            result: 'insufficient_mana',
            damage: 0,
            computerMove: null,
            computerElement: null,
            elementalMessage: 'Not enough mana!',
            comboMessage: ''
        };
    }

    // Deduct mana
    playerMana -= cost;

    // Generate computer choices
    computerMove = getRandomMove();
    computerElement = getRandomElement();

    // Determine RPS winner
    const rpsWinner = getRPSWinner(playerMove, computerMove);

    // Calculate base damage
    const baseDamage = calculateBaseDamage(rpsWinner, playerElement, computerElement);

    // Check for combo
    const combo = checkCombo(lastPlayerElement, playerElement);
    let damage = baseDamage;
    let comboMessage = '';
    let manaRefund = 0;
    let selfHeal = 0;

    if (combo) {
        damage += combo.damageBonus;
        manaRefund = combo.manaRefund;
        selfHeal = combo.selfHeal;
        comboMessage = `Combo: ${combo.name}!`;
    }

    // Apply damage and effects
    if (rpsWinner === 'player') {
        computerHP = Math.max(0, computerHP - damage);
        if (selfHeal > 0) {
            playerHP = Math.min(30, playerHP + selfHeal);
        }
    } else if (rpsWinner === 'computer') {
        playerHP = Math.max(0, playerHP - damage);
        // Computer doesn't get combo benefits
    }

    // Refund mana if applicable
    if (manaRefund > 0) {
        playerMana = Math.min(maxMana, playerMana + manaRefund);
    }

    // Regenerate mana after round (always)
    playerMana = Math.min(maxMana, playerMana + manaRegen);

    // Update last element for next combo
    lastPlayerElement = playerElement;

    // Check for game over
    if (computerHP === 0) {
        playerWins++;
        // Storage update will be handled in main.js
    }

    // Build elemental message
    let elementalMessage = '';
    if (rpsWinner === 'player') {
        elementalMessage = `Your ${playerElement} vs ${computerElement}: `;
        const mult = getElementMultiplier(playerElement, computerElement);
        if (mult >= 2) elementalMessage += 'Super effective!';
        else if (mult >= 1.5) elementalMessage += 'Strong!';
        else if (mult <= 0.25) elementalMessage += 'Disaster!';
        else if (mult <= 0.5) elementalMessage += 'Weak...';
        else elementalMessage += 'Neutral.';
    } else if (rpsWinner === 'computer') {
        elementalMessage = `Enemy ${computerElement} vs your ${playerElement}: `;
        const mult = getElementMultiplier(computerElement, playerElement);
        if (mult >= 2) elementalMessage += 'Super effective against you!';
        else if (mult >= 1.5) elementalMessage += 'Strong against you!';
        else if (mult <= 0.25) elementalMessage += 'You resist!';
        else if (mult <= 0.5) elementalMessage += 'You are weak!';
        else elementalMessage += 'Neutral.';
    } else {
        elementalMessage = 'Tie! No damage.';
    }

    // Return result object
    return {
        result: rpsWinner,
        damage: damage,
        computerMove: computerMove,
        computerElement: computerElement,
        elementalMessage: elementalMessage,
        comboMessage: comboMessage,
        manaCost: cost,
        manaAfter: playerMana,
        playerHP: playerHP,
        computerHP: computerHP
    };
}

/**
 * Reset the game (new game)
 */
function resetGame() {
    playerHP = 30;
    computerHP = 30;
    playerMana = 20;
    playerMove = null;
    playerElement = null;
    computerMove = null;
    computerElement = null;
    lastPlayerElement = null;
    // Note: playerWins persists across resets (accumulate)
}

/**
 * Reset wins (e.g., when user logs out or manually)
 */
function resetWins() {
    playerWins = 0;
}

// ===== Getter / Setter Functions =====

function setPlayerMove(move) {
    playerMove = move;
}

function setPlayerElement(element) {
    // Only set if enough mana? But we'll check in main.js before enabling Begin Round.
    // However we still set it, and resolveRound will check mana.
    playerElement = element;
}

function getPlayerHP() {
    return playerHP;
}

function getComputerHP() {
    return computerHP;
}

function getPlayerMana() {
    return playerMana;
}

function getMaxMana() {
    return maxMana;
}

function getElementCost(element) {
    return elementCosts[element] || 0;
}

function hasEnoughMana(element) {
    return playerMana >= elementCosts[element];
}

function getPlayerWins() {
    return playerWins;
}

function isGameOver() {
    return playerHP === 0 || computerHP === 0;
}

// Expose functions globally
window.setPlayerMove = setPlayerMove;
window.setPlayerElement = setPlayerElement;
window.resolveRound = resolveRound;
window.resetGame = resetGame;
window.getPlayerHP = getPlayerHP;
window.getComputerHP = getComputerHP;
window.getPlayerMana = getPlayerMana;
window.getMaxMana = getMaxMana;
window.getElementCost = getElementCost;
window.hasEnoughMana = hasEnoughMana;
window.isGameOver = isGameOver;
window.getPlayerWins = getPlayerWins;
window.resetWins = resetWins;