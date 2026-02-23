// ===== scripts/game.js (Updated with Lightning & Ice) =====
// Core game logic: RPS, elements, damage, HP, win tracking

// ===== Game State =====
let playerHP = 10;
let computerHP = 10;
let playerMove = null;      // 'rock', 'paper', 'scissors'
let playerElement = null;   // 'fire', 'water', 'earth', 'air', 'lightning', 'ice'
let computerMove = null;
let computerElement = null;

// Win tracking (for leaderboard)
let playerWins = 0; // number of complete game wins in current session (persisted via storage)

// ===== RPS Win Map =====
const rpsWinMap = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
};

// ===== Elemental Effectiveness Matrix =====
// Defines which element is strong against which
// Now includes Lightning and Ice
const elementStrongAgainst = {
    fire: 'air',        // Fire scorches Air
    air: 'earth',       // Air erodes Earth
    earth: 'water',     // Earth absorbs Water
    water: 'fire',      // Water extinguishes Fire
    lightning: 'water', // Lightning electrocutes Water
    ice: 'earth'        // Ice freezes Earth
};

// Defines which element is weak against which (inverse relationships)
// This helps with damage calculation
const elementWeakAgainst = {
    fire: 'water',      // Fire weakened by Water
    air: 'fire',        // Air weakened by Fire
    earth: 'air',       // Earth weakened by Air
    water: 'earth',     // Water weakened by Earth
    lightning: 'earth', // Lightning grounded by Earth
    ice: 'fire'         // Ice melted by Fire
};

// Additional special interactions for new elements
// Lightning is also strong against Air (superconductivity)
// Ice is also strong against Water (freezes)
// These are handled in getElementMultiplier

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
 * Get elemental damage multiplier based on attacker's element vs defender's element
 * Enhanced with 6 elements and special interactions
 * Returns: 2.0 (super effective), 1.5 (strong), 0.5 (weak), 0.25 (very weak), 1.0 (neutral)
 */
function getElementMultiplier(attackerElement, defenderElement) {
    // Super effective (2.0) - primary strengths
    if (elementStrongAgainst[attackerElement] === defenderElement) {
        return 2.0;
    }

    // Secondary strong interactions (1.5)
    // Lightning also strong against Air (superconductivity)
    if (attackerElement === 'lightning' && defenderElement === 'air') {
        return 1.5;
    }
    // Ice also strong against Water (freezes)
    if (attackerElement === 'ice' && defenderElement === 'water') {
        return 1.5;
    }
    // Fire also strong against Ice (melts)
    if (attackerElement === 'fire' && defenderElement === 'ice') {
        return 1.5;
    }
    // Earth also strong against Lightning (insulator)
    if (attackerElement === 'earth' && defenderElement === 'lightning') {
        return 1.5;
    }

    // Weak (0.5) - primary weaknesses
    if (elementWeakAgainst[attackerElement] === defenderElement) {
        return 0.5;
    }

    // Very weak (0.25) - double weaknesses
    // Water vs Lightning (conducts but gets electrocuted? Actually Lightning strong vs Water)
    // But we'll make some combinations very weak
    if (attackerElement === 'water' && defenderElement === 'lightning') {
        return 0.25;
    }
    if (attackerElement === 'ice' && defenderElement === 'fire') {
        return 0.25;
    }
    if (attackerElement === 'air' && defenderElement === 'earth') {
        return 0.25;
    }

    return 1.0; // neutral
}

/**
 * Calculate damage for a round
 * Base damage = 2
 * If RPS winner is 'tie', damage = 0 (no one takes damage)
 * Otherwise, damage = base * elemental multiplier (rounded)
 */
function calculateDamage(winner, playerElement, computerElement) {
    const baseDamage = 2;
    if (winner === 'tie') return 0;

    let multiplier = 1.0;

    if (winner === 'player') {
        // Player attacks computer
        multiplier = getElementMultiplier(playerElement, computerElement);
    } else {
        // Computer attacks player
        multiplier = getElementMultiplier(computerElement, playerElement);
    }

    // Round to nearest integer
    return Math.round(baseDamage * multiplier);
}

/**
 * Get descriptive message for elemental interaction
 */
function getElementalMessage(attackerElement, defenderElement, multiplier) {
    if (multiplier >= 2.0) {
        return `SUPER EFFECTIVE! ${attackerElement.toUpperCase()} utterly destroys ${defenderElement}!`;
    } else if (multiplier >= 1.5) {
        return `Strong! ${attackerElement} beats ${defenderElement}!`;
    } else if (multiplier <= 0.25) {
        return `Disaster! ${attackerElement} is useless against ${defenderElement}!`;
    } else if (multiplier <= 0.5) {
        return `Weak... ${attackerElement} struggles against ${defenderElement}.`;
    } else {
        return `Neutral trade.`;
    }
}

/**
 * Resolve a round: generate computer choices, determine winner, apply damage, return result object
 */
function resolveRound() {
    // Validate that player has selected both move and element
    if (!playerMove || !playerElement) {
        console.warn('Player must select both move and element');
        return {
            result: 'invalid',
            damage: 0,
            computerMove: null,
            computerElement: null,
            elementalMessage: ''
        };
    }

    // Generate computer choices
    computerMove = getRandomMove();
    computerElement = getRandomElement();

    // Determine RPS winner
    const rpsWinner = getRPSWinner(playerMove, computerMove);

    // Calculate damage (depends on winner and elements)
    const damage = calculateDamage(rpsWinner, playerElement, computerElement);

    // Get elemental message for flavor
    let elementalMessage = '';
    if (rpsWinner === 'player') {
        elementalMessage = getElementalMessage(playerElement, computerElement,
            getElementMultiplier(playerElement, computerElement));
    } else if (rpsWinner === 'computer') {
        elementalMessage = getElementalMessage(computerElement, playerElement,
            getElementMultiplier(computerElement, playerElement));
    }

    // Apply damage
    if (rpsWinner === 'player') {
        computerHP = Math.max(0, computerHP - damage);
    } else if (rpsWinner === 'computer') {
        playerHP = Math.max(0, playerHP - damage);
    }
    // Tie: no damage

    // Check if game ended (HP zero)
    if (computerHP === 0) {
        // Player wins the game
        playerWins++;
        // Call storage function to update leaderboard (if defined)
        if (typeof incrementPlayerWins === 'function') {
            incrementPlayerWins();
        }
    }

    // Return result info (for UI updates)
    return {
        result: rpsWinner, // 'player', 'computer', 'tie', 'invalid'
        damage: damage,
        computerMove: computerMove,
        computerElement: computerElement,
        elementalMessage: elementalMessage
    };
}

/**
 * Reset the game (new game)
 */
function resetGame() {
    playerHP = 10;
    computerHP = 10;
    playerMove = null;
    playerElement = null;
    computerMove = null;
    computerElement = null;
    // Note: playerWins persists across resets (they accumulate in session)
    // If you want to reset wins, call resetWins() separately.
}

/**
 * Reset wins (e.g., when user logs out or manually)
 */
function resetWins() {
    playerWins = 0;
    // Also update storage if needed
    if (typeof setPlayerWins === 'function') {
        setPlayerWins(0);
    }
}

// ===== Getter / Setter Functions (for main.js) =====

function setPlayerMove(move) {
    playerMove = move;
}

function setPlayerElement(element) {
    playerElement = element;
}

function getPlayerHP() {
    return playerHP;
}

function getComputerHP() {
    return computerHP;
}

function getPlayerWins() {
    return playerWins;
}

function isGameOver() {
    return playerHP === 0 || computerHP === 0;
}

// ===== Expose functions globally =====
// (Since we're not using modules, attach to window)
window.setPlayerMove = setPlayerMove;
window.setPlayerElement = setPlayerElement;
window.resolveRound = resolveRound;
window.resetGame = resetGame;
window.getPlayerHP = getPlayerHP;
window.getComputerHP = getComputerHP;
window.isGameOver = isGameOver;
window.getPlayerWins = getPlayerWins;
window.resetWins = resetWins;