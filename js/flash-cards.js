// Message displayed when there are no more cards
const NO_MORE_CARDS_MESSAGE = "You finished all the cards!";

// Default set of cards to be displayed
let defaultCards = [
    "a", "and", "go", "I", "is", "me", "no", "see", "the", "you",
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
];

// Current deck of cards (can be shuffled or reset)
let cards = [...defaultCards];

// Index of the currently displayed card
let currentIndex = 0;

// Centralized animation duration (in milliseconds)
const ANIMATION_DURATION = 700;

// Additional words for the modal
let availableWords = [
    "a", "are", "b", "big", "c", "can", "come", "d", "do", "e", "f", "for", "g", 
    "has", "have", "h", "he", "here", "i", "j", "jump", "k", "l", "like", "little", 
    "look", "m", "my", "n", "o", "of", "one", "p", "play", "put", "q", "r", "s", 
    "said", "saw", "she", "t", "this", "to", "too", "u", "v", "want", "we", "what", 
    "with", "w", "x", "y", "z"
];

/**
 * Updates the content of the card displayed on the screen.
 */
function updateCard() {
    const card = document.getElementById("card");

    // Clear existing content in the card
    card.innerHTML = ""; 

    // Create and append the card text
    const textNode = document.createElement("span");
    textNode.textContent = cards[currentIndex] || NO_MORE_CARDS_MESSAGE;
    card.appendChild(textNode);

    // Create and append the check button
    let button = document.createElement("button");
    button.className = "button check-button bg-success";
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
                      <button class="button check-button bg-success">
                          <i class="fas fa-check"></i>
                      </button>`;

    setTimeout(() => {
        card.classList.remove("animate-green");

        // Remove the current card from the deck
        if (cards.length > 0) {
            const removedWord = cards.splice(currentIndex, 1);
            availableWords.push(removedWord);
        }

        // Ensure the current index does not exceed the bounds of the deck
        currentIndex = Math.min(currentIndex, cards.length - 1);

        // Update the card counter and display the next card
        updateCardCounter();
        updateWordHeaders(); 

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

document.addEventListener("click", (event) => {
    const fabDropdown = document.querySelector('.fab-dropdown');
    const fabButton = document.querySelector('.fab-start');

    if (fabDropdown.classList.contains('show') &&
        !fabButton.contains(event.target)) {
        toggleFab(); // Hide the dropdown if clicked outside
    }
});

/**
 * Updates the headers with the count of current and available words.
 */
function updateWordHeaders() {
    const currentCount = cards.length; // Count of current words
    const availableCount = availableWords.length; // Count of available words

    // Update the headers with the counts
    const currentWordsHeader = document.getElementById("currentWordsHeader");
    const availableWordsHeader = document.getElementById("availableWordsHeader");

    currentWordsHeader.textContent = `Current Words: ${currentCount}`;
    availableWordsHeader.textContent = `Available Words: ${availableCount}`;
}

/**
 * Opens the modal and populates the word lists.
 */
function openModal() {
    populateWordLists();
    updateWordHeaders(); // Update the headers with word counts
    document.getElementById("wordModal").style.display = "flex";
}

/**
 * Closes the modal.
 */
function closeModal() {
    document.getElementById("wordModal").style.display = "none";
}

/**
 * Populates the current and available word lists in the modal.
 */
function populateWordLists() {
    const currentList = document.getElementById("currentWords");
    const availableList = document.getElementById("availableWords");

    currentList.innerHTML = "";
    availableList.innerHTML = "";

    cards.forEach(card => {
        const li = createWordListItem(card, "current");
        currentList.appendChild(li);
    });

    availableWords.forEach(word => {
        const li = createWordListItem(word, "available");
        availableList.appendChild(li);
    });
}

/**
 * Creates a list item for a word.
 * @param {string} word - The word to display.
 * @param {string} type - The type of list ("current" or "available").
 * @returns {HTMLElement} - The list item element.
 */
function createWordListItem(word, type) {
    const li = document.createElement("li");
    li.textContent = word;
    li.draggable = true;

    li.addEventListener("click", () => moveWord(word, type));
    li.addEventListener("dragstart", (e) => e.dataTransfer.setData("text", word));
    li.addEventListener("dragover", (e) => e.preventDefault());
    li.addEventListener("drop", (e) => handleDrop(e, type));

    return li;
}

/**
 * Moves a word between the current and available lists.
 * @param {string} word - The word to move.
 * @param {string} fromType - The source list type ("current" or "available").
 */
function moveWord(word, fromType) {
    if (fromType === "current") {
        cards = cards.filter(card => card !== word);
        availableWords.push(word);
    } else {
        availableWords = availableWords.filter(w => w !== word);
        cards.push(word);
    }

    availableWords.sort();

    populateWordLists();
    updateWordHeaders(); // Update the headers after moving words
}

/**
 * Handles the drop event for drag-and-drop functionality.
 * @param {DragEvent} event - The drag event.
 * @param {string} type - The target list type ("current" or "available").
 */
function handleDrop(event, type) {
    const word = event.dataTransfer.getData("text");
    moveWord(word, type === "current" ? "available" : "current");
}

/**
 * Saves the changes made in the modal and updates the cards.
 */
function saveWordChanges() {
    availableWords.sort();

    updateCard(); // Refresh the card display
    closeModal();
}

// Initialize the first card when the page loads
updateCard();