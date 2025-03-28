// Message displayed when there are no more cards
const NO_MORE_CARDS_MESSAGE = "No more cards!";

// Default set of cards with sight words
let defaultCards = [
    { front: "go" },
    { front: "the" },
    { front: "see" },
    { front: "a" },
    { front: "I" },
    { front: "and" },
    { front: "you" },
    { front: "me" },
    { front: "is" },
    { front: "no" }
];

// Current deck of cards (can be shuffled or reset)
let cards = [...defaultCards];

// Index of the currently displayed card
let currentIndex = 0;

// Centralized animation duration (in milliseconds)
const ANIMATION_DURATION = 800;

/**
 * Updates the content of the card displayed on the screen.
 */
function updateCard() {
    const card = document.getElementById("card");

    // Clear existing content in the card
    card.innerHTML = ""; 

    // Create and append the card text
    const textNode = document.createElement("span");
    textNode.textContent = cards[currentIndex]?.front || NO_MORE_CARDS_MESSAGE;
    card.appendChild(textNode);

    // Create and append the check button
    let button = document.createElement("button");
    button.className = "button check-button";
    button.innerHTML = '<i class="fas fa-check"></i>';
    button.addEventListener("click", handleCheckButtonClick); // Attach click event
    card.appendChild(button);

    // Update the card counter
    updateCardCounter();
}

/**
 * Updates the card counter to reflect the current card index and total cards.
 */
function updateCardCounter() {
    const counter = document.getElementById("cardCounter");
    counter.textContent = `${cards.length > 0 ? currentIndex + 1 : 0} / ${cards.length}`;
}

/**
 * Handles the click event for the check button.
 * Removes the current card and updates the deck.
 */
function handleCheckButtonClick(event) {
    const card = document.getElementById("card");

    // Add animation to indicate success
    card.classList.add("animate-green");

    // Temporarily display a success message
    card.innerHTML = `<span>Good job!</span>
                      <button class="button check-button">
                          <i class="fas fa-check"></i>
                      </button>`;

    setTimeout(() => {
        card.classList.remove("animate-green");

        // Remove the current card from the deck
        if (cards.length > 0) {
            cards.splice(currentIndex, 1);
        }

        // Ensure the current index does not exceed the bounds of the deck
        currentIndex = Math.min(currentIndex, cards.length - 1);

        // Update the card counter and display the next card
        updateCardCounter();

        if (cards.length === 0) {
            card.innerHTML = NO_MORE_CARDS_MESSAGE; // Show message if no cards remain
        } else {
            updateCard();
        }
    }, ANIMATION_DURATION); // Use centralized animation duration
}

/**
 * Displays the previous card in the deck.
 * Loops to the last card if the current card is the first one.
 */
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
    } else {
        currentIndex = cards.length - 1; // Loop to the last card
    }
    updateCard();
}

/**
 * Displays the next card in the deck.
 * Loops to the first card if the current card is the last one.
 */
function nextCard() {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
    } else {
        currentIndex = 0; // Loop to the first card
    }
    updateCard();
}

/**
 * Resets the deck to the default set of cards and displays the first card.
 */
function resetCards() {
    cards = [...defaultCards];
    currentIndex = 0;

    // Temporarily display a resetting message
    const card = document.getElementById("card");
    card.textContent = "Resetting cards...";
    setTimeout(updateCard, ANIMATION_DURATION); // Use centralized animation duration
}

/**
 * Shuffles the deck of cards and displays the first card.
 */
function shuffleCards() {
    cards = shuffleArray([...cards]); // Shuffle the default cards
    currentIndex = 0;

    // Temporarily display a shuffling message
    const card = document.getElementById("card");
    card.textContent = "Shuffling...";
    setTimeout(updateCard, ANIMATION_DURATION); // Use centralized animation duration
}

/**
 * Utility function to shuffle an array using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} - The shuffled array.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

/**
 * Toggles the visibility of the floating action button (FAB) dropdown menu.
 */
function toggleFab() {
    const fabDropdown = document.querySelector('.fab-dropdown');
    const fabButton = document.querySelector('.fab-start');

    // Toggle the dropdown visibility
    fabDropdown.classList.toggle('show');

    // Adjust the FAB button's display based on the dropdown state
    if (fabDropdown.classList.contains('show')) {
        fabButton.style.display = 'none';
    } else {
        fabButton.style.display = 'flex';
    }
}

// Initialize the first card when the page loads
updateCard();