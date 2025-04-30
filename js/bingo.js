// Initialize game variables
const rulesScreen = document.getElementById('rules-screen');
const startLowercaseBtn = document.getElementById('start-lowercase-btn');
const startUppercaseBtn = document.getElementById('start-uppercase-btn');
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

// Function to call a new letter
function callNewLetter(uppercase) {
    if (waitingForClick || gameOver) return;
    const boardArray = Array.from(boardLetters).filter(letter => !calledLetters.has(letter));
    if (boardArray.length === 0) {
        return;
    }
    const randomIndex = Math.floor(Math.random() * boardArray.length);
    currentCalledLetter = boardArray[randomIndex];
    calledLetters.add(currentCalledLetter);

    // Change the ball's color
    const randomColor = ballColors[Math.floor(Math.random() * ballColors.length)];
    calledLetterTile.style.backgroundColor = randomColor;

    // Update the letter inside the ball
    calledLetterTile.innerHTML = `<span>${uppercase ? currentCalledLetter.toUpperCase() : currentCalledLetter.toLowerCase()}</span>`;
    waitingForClick = true;

    // Speak the letter
    const utterance = new SpeechSynthesisUtterance(currentCalledLetter.toLowerCase());
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
}

// Function to generate the bingo board
function generateBingoBoard(uppercase) {
    grid.innerHTML = '';
    grid.classList.toggle('uppercase-mode', uppercase); // Add or remove the uppercase mode class
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const usedLetters = new Set();
    boardLetters.clear();
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (row === 2 && col === 2) {
                cell.textContent = uppercase ? 'FREE' : 'free';
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
                        callNewLetter(uppercase);
                    }
                });
            } else {
                let randomLetter;
                do {
                    const randomIndex = Math.floor(Math.random() * alphabet.length);
                    randomLetter = alphabet[randomIndex];
                } while (usedLetters.has(randomLetter));
                usedLetters.add(randomLetter);
                boardLetters.add(randomLetter);
                cell.textContent = uppercase
                    ? randomLetter.toUpperCase()
                    : randomLetter.toLowerCase();
            }
            cell.addEventListener('click', () => {
                if (cell.classList.contains('free-space')) {
                    // Skip the effect for the free cell
                    return;
                }
                if (waitingForClick && cell.textContent.toLowerCase() === currentCalledLetter) {
                    // Correct cell clicked
                    cell.style.backgroundColor = '#90ee90';
                    cell.classList.add('marked');
                    waitingForClick = false;
                    setTimeout(() => {
                        callNewLetter(uppercase);
                    }, 600);
                    checkWin();
                } else if (waitingForClick && cell.textContent.toLowerCase() !== currentCalledLetter) {
                    // Wrong cell clicked
                    cell.classList.add('wrong-cell'); 
                    setTimeout(() => {
                        cell.classList.remove('wrong-cell'); 
                    }, 500);
                }
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
    generateBingoBoard(false);
    manageBackgroundMusic('start'); 
});

startUppercaseBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    bingoBoard.style.display = 'block';
    bingoBoard.style.pointerEvents = 'auto';
    calledLetterTile.textContent = '';
    calledLetters.clear();
    generateBingoBoard(true);
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