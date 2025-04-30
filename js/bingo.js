// Initialize game variables
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
let currentCalledLetter = '';
let waitingForClick = false;
let boardLetters = new Set();
let calledLetters = new Set();
let gameOver = false;

// Add an array of colors for the ball
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

function callNextTile() {
    if (waitingForClick || gameOver) return;

    const boardArray = Array.from(boardLetters).filter(word => !calledLetters.has(word));
    if (boardArray.length === 0) return;

    const randomIndex = Math.floor(Math.random() * boardArray.length);
    currentCalledLetter = boardArray[randomIndex];
    calledLetters.add(currentCalledLetter);

    const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];
    calledLetterTile.style.backgroundColor = randomColor;

    let displayText;
    switch (currentCallMode) {
        case CallMode.UPPERCASE:
            displayText = currentCalledLetter.toUpperCase();
            break;
        case CallMode.LOWERCASE:
            displayText = currentCalledLetter.toLowerCase();
            break;
        case CallMode.SIGHT_WORDS:
            displayText = currentCalledLetter;
            break;
    }
    calledLetterTile.innerHTML = `<span>${displayText}</span>`;
    waitingForClick = true;

    const utterance = new SpeechSynthesisUtterance(currentCalledLetter.toLowerCase());
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
}

function handleTileClick(cell, cellValue) {
    if (cell.classList.contains('free-space')) return;

    if (waitingForClick && cellValue === currentCalledLetter.toLowerCase()) {
        // Correct cell clicked
        cell.style.backgroundColor = '#90ee90';
        cell.classList.add('marked');
        waitingForClick = false;
        setTimeout(() => callNextTile(), 600);
        checkWin();
    } else if (waitingForClick) {
        // Wrong cell clicked
        cell.classList.add('wrong-cell');
        setTimeout(() => {
            cell.classList.remove('wrong-cell');
        }, 500);
    }
}

// Function to generate the bingo board
function generateBingoBoard(mode) {
    currentCallMode = mode; 
    grid.innerHTML = '';
    switch (mode) {
        case CallMode.UPPERCASE:
            grid.classList.add('uppercase-mode'); // Add the uppercase mode class
            break;
        case CallMode.LOWERCASE:
            grid.classList.remove('uppercase-mode'); // Remove the uppercase mode class
            break;
        case CallMode.SIGHT_WORDS:
            grid.classList.remove('uppercase-mode'); // Remove the uppercase mode class
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
                switch (mode) {
                    case CallMode.UPPERCASE:
                        cell.textContent = 'FREE';
                        break;
                    case CallMode.LOWERCASE:
                        cell.textContent = 'free';
                        break;
                    case CallMode.SIGHT_WORDS:
                        cell.textContent = 'Free';
                        break;
                    default:
                        console.error('Invalid mode:', mode);
                        return;
                }
                cell.classList.add('free-space');
                cell.style.animation = 'pulse 1s infinite';
                cell.addEventListener('click', () => {
                    if (cell.classList.contains('clicked')) {
                        return;
                    }
                    if (waitingForClick || currentCalledLetter === '') {
                        cell.style.backgroundColor = '#90ee90';
                        cell.style.animation = 'none';
                        cell.classList.add('clicked');
                        cell.classList.add('marked');
                        waitingForClick = false;
                        callNextTile();
                    }
                });
            } else {
                let value;
                if (mode === CallMode.SIGHT_WORDS) {
                    do {
                        const randomIndex = Math.floor(Math.random() * sightWords.length);
                        value = sightWords[randomIndex];
                    } while (usedWords.has(value));
                    usedWords.add(value);
                } else {
                    do {
                        const randomIndex = Math.floor(Math.random() * alphabet.length);
                        value = alphabet[randomIndex];
                    } while (usedLetters.has(value));
                    usedLetters.add(value);
                }
                boardLetters.add(value);
                cell.textContent =
                    mode === CallMode.UPPERCASE ? value.toUpperCase() :
                    mode === CallMode.LOWERCASE ? value.toLowerCase() :
                    value;

            }
            cell.addEventListener('click', () => {
                const normalizedCellValue = cell.textContent.toLowerCase();
                handleTileClick(cell, normalizedCellValue);
            });
            grid.appendChild(cell);
        }
    }
}

// Function to check for a win
function checkWin() {
    const cells = Array.from(document.querySelectorAll('.cell'));
    const gridSize = 5;
    function checkLine(indices) {
        return indices.every(index => cells[index].classList.contains('marked'));
    }
    const lines = [
        [0, 1, 2, 3, 4],
        [5, 6, 7, 8, 9],
        [10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19],
        [20, 21, 22, 23, 24],
        [0, 5, 10, 15, 20],
        [1, 6, 11, 16, 21],
        [2, 7, 12, 17, 22],
        [3, 8, 13, 18, 23],
        [4, 9, 14, 19, 24],
        [0, 6, 12, 18, 24],
        [4, 8, 12, 16, 20],
    ];
    for (const line of lines) {
        if (checkLine(line)) {
            bingoBoard.style.pointerEvents = 'none';
            gameOver = true;
            setTimeout(() => {
                line.forEach(index => {
                    cells[index].classList.add('winning-tile');
                });
                endGame();
            }, 400);
            return true;
        }
    }
    return false;
}

// Function to handle the end of the game
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

// Function to manage background music
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

// Event listeners for game controls
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

const toggleMusicBtn = document.getElementById('toggle-music-btn');
const musicIcon = document.getElementById('music-icon');
let isMusicMuted = false;

// Function to toggle music
toggleMusicBtn.addEventListener('click', () => {
    isMusicMuted = !isMusicMuted;
    backgroundMusic.muted = isMusicMuted;
    musicIcon.classList.toggle('muted', isMusicMuted); 
});