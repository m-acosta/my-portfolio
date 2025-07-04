const startBtn = document.getElementById('start-btn');
const rulesScreen = document.getElementById('rules-screen');
const flashCard = document.getElementById('flash-card');
const gameControls = document.getElementById('game-controls');
const nextBtn = document.getElementById('next-btn');
const removeBtn = document.getElementById('remove-btn');
const progressBar = document.getElementById('progress-bar');

// Card data
const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const lowercase = 'abcdefghijklmnopqrstuvwxyz'.split('');
const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const words = [
  "are", "big", "can", "come", "do", "for", "has", "have", "he", "here",
  "jump", "like", "little", "look", "my", "of", "one", "play", "put",
  "said", "saw", "she", "this", "to", "too", "want", "we", "what", "with"
];

const finishMessage = document.getElementById('finish-message');

let cardDeck = [];
let currentCardIndex = 0;

// Start game
startBtn.addEventListener('click', () => {
    const includeDigits = document.getElementById('include-digits').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeWords = document.getElementById('include-words').checked;

    // Build the card deck
    cardDeck = [];
    if (includeDigits) cardDeck = cardDeck.concat(digits);
    if (includeLowercase) cardDeck = cardDeck.concat(lowercase);
    if (includeUppercase) cardDeck = cardDeck.concat(uppercase);
    if (includeWords) cardDeck = cardDeck.concat(words);

    // Shuffle the deck
    cardDeck = cardDeck.sort(() => Math.random() - 0.5);

    // Hide rules screen and show game
    rulesScreen.style.display = 'none';
    flashCard.style.display = 'block';
    gameControls.style.display = 'flex';
    nextBtn.style.display = 'block';
    progressBar.style.display = 'flex';

    // Show the first card
    currentCardIndex = 0;
    showCard();
});

// Show the current card
function showCard() {
    if (cardDeck.length === 0) {
        flashCard.innerHTML = '<span>No more cards!</span>';
        nextBtn.disabled = true;
        removeBtn.disabled = true;
    } else {
        const cardText = cardDeck[currentCardIndex].trim();
        flashCard.innerHTML = `<span class="flash-text">${cardText}</span>`;
    }
}

// Next card
nextBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex + 1) % cardDeck.length;
    showCard();
});

// Remove current card

removeBtn.addEventListener('click', () => {
    cardDeck.splice(currentCardIndex, 1);
    if (currentCardIndex >= cardDeck.length) {
        currentCardIndex = 0;
    }

    if (cardDeck.length === 0) {
        // Show full screen finish message
        finishMessage.style.display = 'flex';

        nextBtn.disabled = true;
        removeBtn.disabled = true;

        setTimeout(() => {
            finishMessage.style.display = 'none';

            // Reset UI back to rules screen
            rulesScreen.style.display = 'flex';
            flashCard.style.display = 'none';
            gameControls.style.display = 'none';
            nextBtn.style.display = 'none';
            progressBar.style.display = 'none';

            nextBtn.disabled = false;
            removeBtn.disabled = false;

            resetProgressBar();
        }, 2000);

        return; // exit early
    }

    showCard();
    moveToNextSpot();
});

let currentSpot = 0;
let repeatCount = 0;

function disableButtons() {
    startBtn.disabled = true;
    nextBtn.disabled = true;
    removeBtn.disabled = true;
}

function enableButtons() {
    startBtn.disabled = false;
    nextBtn.disabled = false;
    removeBtn.disabled = false;
}

function moveToNextSpot() {
    if (currentSpot < 5) {
        currentSpot++;
        const spot = document.getElementById(`spot-${currentSpot}`);

        const coin = document.createElement('div');
        coin.classList.add('coin');
        document.body.appendChild(coin);

        const spotRect = spot.getBoundingClientRect();
        coin.style.width = '40px';
        coin.style.height = '40px';
        coin.style.left = `${spotRect.left + spotRect.width / 2}px`;
        coin.style.top = `${spotRect.top - 60 + window.scrollY}px`;

        setTimeout(() => {
            coin.style.top = `${spotRect.top + window.scrollY}px`;
        }, 20);

        setTimeout(() => {
            coin.remove();
            spot.classList.add('active');

            // Trigger coin rain if bar is full
            if (currentSpot === 5) {
                disableButtons();  // Disable here

                animateCoinRain().then(() => {
                    resetProgressBar();
                    enableButtons();  // Enable after animation
                });
            }
        }, 500);
    }
}

function animateCoinRain() {
    return new Promise((resolve) => {
        const rows = 4;
        const cols = 6;
        const coinSize = 40;
        const spacing = 100 / cols; // % spacing

        let totalCoins = rows * cols;
        let dropped = 0;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const coin = document.createElement('div');
                coin.classList.add('falling-coin');

                // Evenly space horizontally
                coin.style.left = `${(col + 0.5) * spacing}%`;

                // Delay per row for staggered drop
                const delay = row * 100 + Math.random() * 100;

                setTimeout(() => {
                    document.body.appendChild(coin);

                    setTimeout(() => {
                        coin.remove();
                        dropped++;
                        if (dropped === totalCoins) resolve();
                    }, 1000); // match keyframe duration
                }, delay);
            }
        }
    });
}

function resetProgressBar() {
    const spots = document.querySelectorAll('.progress-spot');
    spots.forEach((spot) => spot.classList.remove('active'));
    currentSpot = 0;
}