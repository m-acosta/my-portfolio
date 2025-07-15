const startBtn = document.getElementById('start-btn');
const rulesScreen = document.getElementById('rules-screen');
const flashCard = document.getElementById('flash-card');
const gameControls = document.getElementById('game-controls');
const nextBtn = document.getElementById('next-btn');
const removeBtn = document.getElementById('remove-btn');
const progressBar = document.getElementById('progress-bar');
const customCheckbox = document.getElementById('include-custom');
const customModal = document.getElementById('custom-set-modal');
const customInput = document.getElementById('custom-set-input');
const applyCustomBtn = document.getElementById('apply-custom-set');
const closeCustomModal = document.getElementById('close-custom-set');
const include0to10 = document.getElementById('include-0-10');
const include0to100 = document.getElementById('include-0-100');
const editCustomLink = document.getElementById('edit-custom');

// Card data
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
let customSet = [];

// Open modal when checkbox is checked
customCheckbox.addEventListener('change', () => {
    if (customCheckbox.checked) {
        customModal.classList.remove('hidden');
    }
});

editCustomLink.addEventListener('click', (event) => {
    event.preventDefault();         // Prevent any default link behavior
    event.stopPropagation();        // Prevent triggering the label/checkbox toggle
    customModal.classList.remove('hidden');
});

// Close modal
closeCustomModal.addEventListener('click', () => {
    customModal.classList.add('hidden');
});

// Apply custom set
applyCustomBtn.addEventListener('click', () => {
    const rawInput = customInput.value;
    customSet = rawInput.split(',').map(item => item.trim()).filter(Boolean);
    customModal.classList.add('hidden');
});

include0to10.addEventListener('change', () => {
    if (include0to10.checked) {
        include0to100.checked = false;
    }
});

include0to100.addEventListener('change', () => {
    if (include0to100.checked) {
        include0to10.checked = false;
    }
});

// Start game
startBtn.addEventListener('click', () => {
    const include0to10 = document.getElementById('include-0-10').checked;
    const include0to100 = document.getElementById('include-0-100').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeWords = document.getElementById('include-words').checked;
    const includeCustom = document.getElementById('include-custom').checked;

    cardDeck = [];

    if (include0to10) {
        cardDeck = cardDeck.concat(['0','1','2','3','4','5','6','7','8','9','10']);
    }
    if (include0to100) {
        for (let i = 0; i <= 100; i++) {
            cardDeck.push(i.toString());
        }
    }
    if (includeLowercase) cardDeck = cardDeck.concat(lowercase);
    if (includeUppercase) cardDeck = cardDeck.concat(uppercase);
    if (includeWords) cardDeck = cardDeck.concat(words);
    if (includeCustom && customSet.length > 0) {
        cardDeck = cardDeck.concat(customSet);
    }

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