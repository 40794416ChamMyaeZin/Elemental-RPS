// ===== scripts/game.js =====
// Core game logic: RPS, elements, damage, HP, mana for both players

// ===== Game State =====
let playerHP = 30;
let computerHP = 30;
let playerMana = 20;
let computerMana = 20;
const maxMana = 20;
const manaRegen = 3;

let playerMove = null;
let playerElement = null;
let computerMove = null;
let computerElement = null;
let lastPlayerElement = null;

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

// ===== Elemental Effectiveness =====
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

function getRandomElement() {
    const elements = ['fire', 'water', 'earth', 'air', 'lightning', 'ice'];
    return elements[Math.floor(Math.random() * elements.length)];
}

function getRandomMove() {
    const moves = ['rock', 'paper', 'scissors'];
    return moves[Math.floor(Math.random() * moves.length)];
}

function getRPSWinner(pMove, cMove) {
    if (pMove === cMove) return 'tie';
    return rpsWinMap[pMove] === cMove ? 'player' : 'computer';
}

function getElementMultiplier(attacker, defender) {
    if (!attacker || !defender) return 1.0;
    if (elementStrongAgainst[attacker] === defender) return 2.0;
    if (attacker === 'lightning' && defender === 'air') return 1.5;
    if (attacker === 'ice' && defender === 'water') return 1.5;
    if (attacker === 'fire' && defender === 'ice') return 1.5;
    if (attacker === 'earth' && defender === 'lightning') return 1.5;
    if (elementWeakAgainst[attacker] === defender) return 0.5;
    if (attacker === 'water' && defender === 'lightning') return 0.25;
    if (attacker === 'ice' && defender === 'fire') return 0.25;
    if (attacker === 'air' && defender === 'earth') return 0.25;
    return 1.0;
}

function calculateBaseDamage(winner, pElem, cElem) {
    const base = 2;
    if (winner === 'tie') return 0;
    if (winner === 'player') {
        return Math.round(base * getElementMultiplier(pElem, cElem));
    } else {
        return Math.round(base * getElementMultiplier(cElem, pElem));
    }
}

function checkCombo(prevElem, currentElem) {
    if (!prevElem) return null;
    for (let combo of combos) {
        if ((combo.elements[0] === prevElem && combo.elements[1] === currentElem) ||
            (combo.elements[0] === currentElem && combo.elements[1] === prevElem)) {
            return combo;
        }
    }
    return null;
}

// Computer chooses an affordable element
function getComputerElementWithMana() {
    const affordable = Object.keys(elementCosts).filter(e => elementCosts[e] <= computerMana);
    if (affordable.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * affordable.length);
    return affordable[randomIndex];
}

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

    const playerCost = elementCosts[playerElement];
    if (playerMana < playerCost) {
        return {
            result: 'insufficient_mana',
            damage: 0,
            computerMove: null,
            computerElement: null,
            elementalMessage: `Need ${playerCost} mana, you have ${playerMana}.`,
            comboMessage: ''
        };
    }

    // Deduct player mana
    playerMana -= playerCost;

    // Computer chooses move and element
    computerMove = getRandomMove();
    const chosenElement = getComputerElementWithMana();
    let computerCost = 0;
    if (chosenElement) {
        computerElement = chosenElement;
        computerCost = elementCosts[computerElement];
        computerMana -= computerCost;
    } else {
        computerElement = null;
    }

    const rpsWinner = getRPSWinner(playerMove, computerMove);
    let damage = calculateBaseDamage(rpsWinner, playerElement, computerElement);

    // Combo check (based on previous player element)
    const combo = checkCombo(lastPlayerElement, playerElement);
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
    }

    // Refund mana if combo
    if (manaRefund > 0) {
        playerMana = Math.min(maxMana, playerMana + manaRefund);
    }

    // Regenerate mana for both
    playerMana = Math.min(maxMana, playerMana + manaRegen);
    computerMana = Math.min(maxMana, computerMana + manaRegen);

    // Store last element for next combo
    lastPlayerElement = playerElement;

    // Check win
    if (computerHP === 0) {
        playerWins++;
        if (typeof window.incrementPlayerWins === 'function') {
            window.incrementPlayerWins();
        }
    }

    // Build elemental feedback message
    let elementalMessage = '';
    if (rpsWinner === 'player') {
        elementalMessage = `Your ${playerElement} vs ${computerElement ? computerElement : 'no element'}: `;
        const mult = getElementMultiplier(playerElement, computerElement);
        if (mult >= 2) elementalMessage += 'Super effective!';
        else if (mult >= 1.5) elementalMessage += 'Strong!';
        else if (mult <= 0.25) elementalMessage += 'Disaster!';
        else if (mult <= 0.5) elementalMessage += 'Weak...';
        else elementalMessage += 'Neutral.';
    } else if (rpsWinner === 'computer') {
        elementalMessage = `Enemy ${computerElement ? computerElement : 'no element'} vs your ${playerElement}: `;
        const mult = getElementMultiplier(computerElement, playerElement);
        if (mult >= 2) elementalMessage += 'Super effective against you!';
        else if (mult >= 1.5) elementalMessage += 'Strong against you!';
        else if (mult <= 0.25) elementalMessage += 'You resist!';
        else if (mult <= 0.5) elementalMessage += 'You are weak!';
        else elementalMessage += 'Neutral.';
    } else {
        elementalMessage = 'Tie! No damage.';
    }

    return {
        result: rpsWinner,
        damage: damage,
        computerMove: computerMove,
        computerElement: computerElement,
        elementalMessage: elementalMessage,
        comboMessage: comboMessage,
        playerManaAfter: playerMana,
        computerManaAfter: computerMana,
        playerHP: playerHP,
        computerHP: computerHP
    };
}

function resetGame() {
    playerHP = 30;
    computerHP = 30;
    playerMana = 20;
    computerMana = 20;
    playerMove = null;
    playerElement = null;
    computerMove = null;
    computerElement = null;
    lastPlayerElement = null;
}

function resetWins() {
    playerWins = 0;
}

// Getters / Setters
function setPlayerMove(move) { playerMove = move; }
function setPlayerElement(element) { playerElement = element; }
function getPlayerHP() { return playerHP; }
function getComputerHP() { return computerHP; }
function getPlayerMana() { return playerMana; }
function getComputerMana() { return computerMana; }
function getMaxMana() { return maxMana; }
function getElementCost(element) { return elementCosts[element] || 0; }
function hasEnoughMana(element) { return playerMana >= elementCosts[element]; }
function getPlayerWins() { return playerWins; }
function isGameOver() { return playerHP === 0 || computerHP === 0; }
function getLastPlayerElement() { return lastPlayerElement; }

// Expose globally
window.setPlayerMove = setPlayerMove;
window.setPlayerElement = setPlayerElement;
window.resolveRound = resolveRound;
window.resetGame = resetGame;
window.getPlayerHP = getPlayerHP;
window.getComputerHP = getComputerHP;
window.getPlayerMana = getPlayerMana;
window.getComputerMana = getComputerMana;
window.getMaxMana = getMaxMana;
window.getElementCost = getElementCost;
window.hasEnoughMana = hasEnoughMana;
window.isGameOver = isGameOver;
window.getPlayerWins = getPlayerWins;
window.resetWins = resetWins;
window.getLastPlayerElement = getLastPlayerElement;