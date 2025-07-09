// ------------------------------
// Constants & Variables
// ------------------------------
const rulesScreen = document.getElementById('rules-screen');
const startLowercaseBtn = document.getElementById('start-lowercase-btn');
const startUppercaseBtn = document.getElementById('start-uppercase-btn');
const startSightWordsBtn = document.getElementById('start-sight-words-btn');
const bingoBoard = document.getElementById('bingo-board');
const grid = document.getElementById('grid');
const calledLetterTile = document.getElementById('called-letter-tile');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const backgroundMusic = document.getElementById('background-music');
const toggleMusicBtn = document.getElementById('toggle-music-btn');

const ballColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

const sightWords = [
    "a", "and", "go", "I", "is", "me", "no", "see", "the", "you",
    "are", "big", "can", "come", "do", "for",  
    "has", "have", "he", "here", "jump", "like", "little", 
    "look", "my", "of", "one", "play", "put", 
    "said", "saw", "she", "this", "to", "too", "want", "we", "what", "with",
];

const CallMode = {
    UPPERCASE: 'uppercase',
    LOWERCASE: 'lowercase',
    SIGHT_WORDS: 'sight_words',
};

let currentCallMode = CallMode.LOWERCASE; // Default mode
let currentCalledLetter = '';
let waitingForClick = false;
let boardLetters = new Set();
let calledLetters = new Set();
let gameOver = false;
let isMusicMuted = false;

// ------------------------------
// Music Control
// ------------------------------
toggleMusicBtn.addEventListener('click', () => {
    isMusicMuted = !isMusicMuted;
    backgroundMusic.muted = isMusicMuted;
    toggleMusicBtn.classList.toggle('muted', isMusicMuted);  // toggle muted class on button
});

window.addEventListener('blur', () => {
    if (!backgroundMusic.paused) {
        backgroundMusic.pause();
    }
});

window.addEventListener('focus', () => {
    if (bingoBoard.style.display === 'block') {
        backgroundMusic.play().catch((error) => {
            console.warn('Could not resume music on focus:', error);
        });
    }
});

function manageBackgroundMusic(action) {
    if (action === 'start') {
        backgroundMusic.volume = 0.1; 
        backgroundMusic.loop = true; 
        backgroundMusic.play().catch((error) => {
            console.error('Background music could not be played:', error);
        });
    } else if (action === 'reset') {
        backgroundMusic.volume = 0.2; 
    }
}

// ------------------------------
// Bingo Game Logic
// ------------------------------
function generateBingoBoard(mode) {
    currentCallMode = mode; 
    grid.innerHTML = '';
    switch (mode) {
        case CallMode.UPPERCASE:
            grid.classList.add('uppercase-mode');
            break;
        case CallMode.LOWERCASE:
        case CallMode.SIGHT_WORDS:
            grid.classList.remove('uppercase-mode');
            break;
        default:
            console.error('Invalid mode:', mode);
            return;
    }

    const usedLetters = new Set();
    const usedWords = new Set();
    boardLetters.clear();

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');

            if (row === 2 && col === 2) {
                // Free space in center
                switch (mode) {
                    case CallMode.UPPERCASE: cell.textContent = 'FREE'; break;
                    case CallMode.LOWERCASE: cell.textContent = 'free'; break;
                    case CallMode.SIGHT_WORDS: cell.textContent = 'Free'; break;
                }
                cell.classList.add('free-space');
                cell.style.animation = 'pulse 1s infinite';
                cell.addEventListener('click', () => {
                    if (cell.classList.contains('clicked')) return;
                    if (waitingForClick || currentCalledLetter === '') {
                        cell.style.backgroundColor = '#90ee90';
                        cell.style.animation = 'none';
                        cell.classList.add('clicked', 'marked');
                        waitingForClick = false;
                        callNextTile();
                    }
                });
            } else {
                let value;
                if (mode === CallMode.SIGHT_WORDS) {
                    do {
                        value = sightWords[Math.floor(Math.random() * sightWords.length)];
                    } while (usedWords.has(value));
                    usedWords.add(value);
                } else {
                    do {
                        value = alphabet[Math.floor(Math.random() * alphabet.length)];
                    } while (usedLetters.has(value));
                    usedLetters.add(value);
                }
                boardLetters.add(value);

                cell.textContent = mode === CallMode.UPPERCASE ? value.toUpperCase() :
                                   mode === CallMode.LOWERCASE ? value.toLowerCase() :
                                   value;
            }

            cell.addEventListener('click', () => {
                handleTileClick(cell, cell.textContent.toLowerCase());
            });

            grid.appendChild(cell);
        }
    }
}

function callNextTile() {
    if (waitingForClick || gameOver) return;

    const available = Array.from(boardLetters).filter(word => !calledLetters.has(word));
    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    currentCalledLetter = available[randomIndex];
    calledLetters.add(currentCalledLetter);

    const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];
    calledLetterTile.style.backgroundColor = randomColor;

    let displayText;
    switch (currentCallMode) {
        case CallMode.UPPERCASE: displayText = currentCalledLetter.toUpperCase(); break;
        case CallMode.LOWERCASE: displayText = currentCalledLetter.toLowerCase(); break;
        case CallMode.SIGHT_WORDS: displayText = currentCalledLetter; break;
    }

    // Animate out & in
    calledLetterTile.classList.remove('roll-in');
    calledLetterTile.classList.add('roll-out');
    waitingForClick = true;

    const utterance = new SpeechSynthesisUtterance(currentCalledLetter.toLowerCase());
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    speechSynthesis.speak(utterance);

    setTimeout(() => {
        calledLetterTile.innerHTML = `<span>${displayText}</span>`;
        calledLetterTile.classList.remove('roll-out');
        void calledLetterTile.offsetWidth; // reflow
        calledLetterTile.classList.add('roll-in');

        setTimeout(() => {
            calledLetterTile.classList.remove('roll-in');
        }, 500);
    }, 500);
}

function handleTileClick(cell, cellValue) {
    if (cell.classList.contains('free-space')) return;

    if (waitingForClick && cellValue === currentCalledLetter.toLowerCase()) {
        cell.style.backgroundColor = '#90ee90';
        cell.classList.add('marked');
        waitingForClick = false;
        setTimeout(callNextTile, 600);
        checkWin();
    } else if (waitingForClick) {
        cell.classList.add('wrong-cell');
        setTimeout(() => cell.classList.remove('wrong-cell'), 500);
    }
}

function checkWin() {
    const cells = Array.from(document.querySelectorAll('.cell'));

    function checkLine(indices) {
        return indices.every(index => cells[index].classList.contains('marked'));
    }

    const lines = [
        [0, 1, 2, 3, 4],    [5, 6, 7, 8, 9],   [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],[20, 21, 22, 23, 24],[0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24], [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
    ];

    for (const line of lines) {
        if (checkLine(line)) {
            bingoBoard.style.pointerEvents = 'none';
            gameOver = true;
            setTimeout(() => {
                line.forEach(i => cells[i].classList.add('winning-tile'));
                endGame();
            }, 400);
            return true;
        }
    }
    return false;
}

function endGame() {
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ffeb3b', '#ffd700', '#ffcc00'],
    });

    const cheeringSound = document.getElementById('cheering-sound');
    cheeringSound.play();

    setTimeout(() => {
        gameOverScreen.style.display = 'flex';
    }, 500);
}

// ------------------------------
// Event Listeners for Game Control Buttons
// ------------------------------
startLowercaseBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    bingoBoard.style.display = 'block';
    bingoBoard.style.pointerEvents = 'auto';
    calledLetterTile.textContent = '';
    calledLetters.clear();
    generateBingoBoard(CallMode.LOWERCASE);
    manageBackgroundMusic('start');
});

startUppercaseBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    bingoBoard.style.display = 'block';
    bingoBoard.style.pointerEvents = 'auto';
    calledLetterTile.textContent = '';
    calledLetters.clear();
    generateBingoBoard(CallMode.UPPERCASE);
    manageBackgroundMusic('start');
});

startSightWordsBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    bingoBoard.style.display = 'block';
    bingoBoard.style.pointerEvents = 'auto';
    calledLetterTile.textContent = '';
    calledLetters.clear();
    generateBingoBoard(CallMode.SIGHT_WORDS);
    manageBackgroundMusic('start');
});

restartBtn.addEventListener('click', () => {
    gameOver = false;
    gameOverScreen.style.display = 'none';
    rulesScreen.style.display = 'flex';
    bingoBoard.style.display = 'none';
    bingoBoard.style.pointerEvents = 'auto';
    grid.innerHTML = '';
    calledLetters.clear();
    boardLetters.clear();
    currentCalledLetter = '';
    waitingForClick = false;
    manageBackgroundMusic('reset');
});
