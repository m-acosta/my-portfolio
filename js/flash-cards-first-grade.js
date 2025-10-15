// Card data
const firstSetWords = [
  "the", "see", "go", "she", "and", "play", "little", "you", "with", "for",
  "no", "jump", "one", "have", "are", "said", "two", "look", "my", "come",
  "here", "to", "of", "what", "put", "want", "this", "saw", "now", "do"
];
const secondSetWords = [
  "which", "went", "was", "there", "then", "out", "who", "good", "by", "them",
  "were", "our", "could", "these", "once", "upon", "hurt", "that", "because", "from",
  "their", "when", "why", "many", "right", "start", "find", "how", "over", "under",
  "try", "give", "far", "too"
];
const thirdSetWords = [
  "after", "call", "large", "her", "house", "long", "off", "small", "brown", "work",
  "year", "live", "found", "your", "know", "always", "all", "people", "where", "draw",
  "again", "round", "they", "country", "four", "great", "boy", "city", "laugh", "move",
  "change", "away", "every", "near", "school", "earth", "done", "about", "even", "walk",
  "buy", "only", "through", "does", "another", "wash", "some", "better", "carry", "learn",
  "very", "mother", "father", "never", "below", "blue", "answer","eight", "any"
];

let cardDeck = [];
let currentCardIndex = 0;
let customSet = [];

// --- DOM Elements ---
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const removeBtn = document.getElementById('remove-btn');
const rulesScreen = document.getElementById('rules-screen');
const flashCard = document.getElementById('flash-card');
const gameControls = document.getElementById('game-controls');
const progressBar = document.getElementById('progress-bar');
const finishMessage = document.getElementById('finish-message');
const firstSetCheckbox = document.getElementById('first-set');
const secondSetCheckbox = document.getElementById('second-set');
const thirdSetCheckbox = document.getElementById('third-set');
const includeCustomCheckbox = document.getElementById('include-custom');
const editCustomLink = document.getElementById('edit-custom');
const customSetModal = document.getElementById('custom-set-modal');
const closeCustomSetBtn = document.getElementById('close-custom-set');
const customSetInput = document.getElementById('custom-set-input');
const applyCustomSetBtn = document.getElementById('apply-custom-set');

// --- Custom Set Modal Logic ---
editCustomLink.addEventListener('click', () => {
    customSetModal.classList.remove('hidden');
    customSetInput.value = customSet.join(', ');
});
closeCustomSetBtn.addEventListener('click', () => {
    customSetModal.classList.add('hidden');
});
applyCustomSetBtn.addEventListener('click', () => {
    const input = customSetInput.value.trim();
    customSet = input ? input.split(',').map(w => w.trim()).filter(Boolean) : [];
    customSetModal.classList.add('hidden');
    includeCustomCheckbox.checked = customSet.length > 0;
});

// --- Start Game ---
startBtn.addEventListener('click', () => {
    cardDeck = [];

    if (firstSetCheckbox.checked) cardDeck = cardDeck.concat(firstSetWords);
    if (secondSetCheckbox.checked) cardDeck = cardDeck.concat(secondSetWords);
    if (thirdSetCheckbox.checked) cardDeck = cardDeck.concat(thirdSetWords);
    if (includeCustomCheckbox.checked && customSet.length > 0) cardDeck = cardDeck.concat(customSet);

    // Remove duplicates and empty
    cardDeck = Array.from(new Set(cardDeck)).filter(Boolean);

    // Shuffle the deck
    cardDeck = cardDeck.sort(() => Math.random() - 0.5);

    if (cardDeck.length === 0) {
        alert('Please select at least one set or enter custom cards.');
        return;
    }

    // Hide rules screen and show game
    rulesScreen.style.display = 'none';
    flashCard.style.display = 'block';
    gameControls.style.display = 'flex';
    nextBtn.style.display = 'block';
    progressBar.style.display = 'flex';
    finishMessage.style.display = 'none';

    // Make sure flash card is visible and on top
    flashCard.style.zIndex = '2';
    gameControls.style.zIndex = '2';
    progressBar.style.zIndex = '2';

    // Show the first card
    currentCardIndex = 0;
    showCard();
    resetProgressBar();
    enableButtons();
});

// --- Show the current card ---
function showCard() {
    if (cardDeck.length === 0) {
        flashCard.innerHTML = '<span>No more cards!</span>';
        nextBtn.disabled = true;
        removeBtn.disabled = true;
    } else {
        const cardText = cardDeck[currentCardIndex].trim();
        flashCard.innerHTML = `<span class="flash-text">${cardText}</span>`;
        nextBtn.disabled = false;
        removeBtn.disabled = false;
    }
}

// --- Next card ---
nextBtn.addEventListener('click', () => {
    if (cardDeck.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % cardDeck.length;
    showCard();
});

// --- Remove current card ---
removeBtn.addEventListener('click', () => {
    if (cardDeck.length === 0) return;
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
        coin.style.position = 'absolute';
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
                coin.style.position = 'fixed';

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

// --- Initialize UI state on load ---
rulesScreen.style.display = 'flex';
flashCard.style.display = 'none';
gameControls.style.display = 'none';
nextBtn.style.display = 'none';
progressBar.style.display = 'none';
finishMessage.style.display = 'none';
customSetModal.classList.add('hidden');