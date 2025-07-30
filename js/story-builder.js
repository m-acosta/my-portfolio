const startBtn = document.getElementById('start-btn');
const rulesScreen = document.getElementById('rules-screen');
const sentence = document.getElementById('sentence');
const readBtn = document.getElementById('read-btn');
const bookLayout = document.getElementById('book-layout');
const leftPage = document.getElementById('left-page');
const rightPage = document.getElementById('right-page');
const readingScreen = document.getElementById('reading-screen');
const nextBtn = document.getElementById('next-btn');
const medalDivs = document.querySelectorAll('.reading-content.medal');

const subjects = ['pirate', 'robot', 'unicorn', 'cat', 'dragon', 'dog', 'monkey', 'tiger'];
const subjectImages = [
    "../img/story-builder/pirate.png",
    "../img/story-builder/robot.png",
    "../img/story-builder/unicorn.png",
    "../img/story-builder/cat.png",
    "../img/story-builder/dragon.png",
    "../img/story-builder/dog.png",
    "../img/story-builder/monkey.png",
    "../img/story-builder/tiger.png",
];
const verbs = ['juggles', 'dances', 'sings', 'builds'];
const prepositions = ['in', 'on', 'at', 'near', 'at'];
const places = ['library', 'moon', 'zoo', 'castle', 'playground'];
const placeImages = [
    "../img/story-builder/library.png",
    "../img/story-builder/moon.png",
    "../img/story-builder/zoo.png",
    "../img/story-builder/castle.png",
    "../img/story-builder/playground.png",
];

// Initialize a current index for each category (subject, verb, place)
const currentIndices = {
    subject: Math.floor(Math.random() * subjects.length),
    verb: Math.floor(Math.random() * verbs.length),
    place: Math.floor(Math.random() * places.length),
    preposition: Math.floor(Math.random() * prepositions.length)
};

// The objects that hold the arrays for subject, verb, and place
const blanks = {
    subject: subjects,
    verb: verbs,
    place: places,
    preposition: prepositions
};

// Track the status of each blank
const selectionStatus = {
    subject: false,
    verb: false,
    place: false,
    preposition: true
};

const stories = [
  (subject, verb, preposition, place) => [
    `Once upon a time ${preposition} the ${place}, there lived a ${subject}.`,
    `The ${place} was not very big.`,
    `Soon, everyone learned about the ${subject} and told stories.`,
    `And so, the tale of the ${subject} that ${verb} was told for generations.`
  ],

  (subject, verb, preposition, place) => [
    `Once upon a time, a ${subject} dreamed of adventures.`,
    `One day, the ${subject} built up the courage to ${getBaseVerb(verb)}.`,
    `The ${place} was filled with magic and mystery.`,
    `Nobody in the ${place} would forget that day.`
  ],

  (subject, verb, preposition, place) => [
    `Once upon a time, a ${subject} lived ${preposition} the ${place}.`,
    `The ${subject} ${verb} every day.`,
    `But each day brought a new surprise to the ${subject}.`,
    `Some days, a friendly lion would join in.`,
    `Oh, what fun they had!`
  ],
];

let sentenceCount = 0; // Counter for the number of sentences read
let currentStoryIndex = Math.floor(Math.random() * stories.length); // Index to track the current story

function getBaseVerb(verb) {
  if (verb.endsWith('s')) return verb.slice(0, -1);
  return verb;
}

// Function to check if all blanks have been filled
function checkAllSelected() {
    return Object.values(selectionStatus).every(status => status);
}

function triggerPlaceImageAnimation() {
    const placeImgEl = document.getElementById('place-image');
    
    // Remove the animation
    placeImgEl.style.animation = 'none';
    
    // Force a reflow
    placeImgEl.offsetWidth; // <-- this triggers a reflow and makes the browser "forget" the animation

    // Re-add the animation
    placeImgEl.style.animation = 'place-entry 1s ease forwards';
}

function resetToBookLayout() {
    // Show book layout
    bookLayout.style.display = 'flex';
    leftPage.style.display = 'flex';
    rightPage.style.display = 'block';
    sentence.style.display = 'block';

    // Reset selection status
    Object.keys(selectionStatus).forEach(key => {
        selectionStatus[key] = key === 'preposition'; // Only preposition starts selected
    });

    // Reset blank text
    ['subject', 'verb', 'place'].forEach(id => {
        const content = document.querySelector(`#${id} .blank-text`);
        content.innerHTML = '___';
    });
    document.getElementById('preposition').innerHTML = 'in';

    // Hide subject/place images
    document.getElementById('subject-image').style.display = 'none';
    document.getElementById('place-image').style.display = 'none';

    // Disable the Read button
    readBtn.style.display = 'inline-block';
    readBtn.disabled = true;

    nextBtn.style.display = 'none';
    nextBtn.disabled = true;
}

startBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    resetToBookLayout();
});

nextBtn.addEventListener('click', () => {
    speechSynthesis.cancel(); // Stop any lingering speech
    readingScreen.style.display = 'none';
    resetToBookLayout();
});

Object.keys(blanks).forEach(id => {
    const el = document.getElementById(id);
    const content = el.querySelector('.blank-text');  // Text container
    const bar = el.querySelector('.progress-bar');
    
    el.addEventListener('click', () => {
        // Fade out the text content before starting the progress bar
        content.style.opacity = '0';

        // Start the progress bar animation (fill it to 100%)
        bar.style.width = '100%';

        // After the progress bar reaches 100%, we update the word
        setTimeout(() => {
            // Update the index first to ensure correct mapping for subject/image
            if (id === 'subject') {
                // Update the subject index first
                currentIndices.subject = (currentIndices.subject + 1) % subjects.length;
                const index = currentIndices.subject; // Get the new index
                
                // Update the subject text and image after the index is changed
                content.innerHTML = subjects[index];
                const subjectImgEl = document.getElementById('subject-image');

                // Show the image if it's not visible
                if (subjectImgEl.style.display === 'none' || subjectImgEl.style.display === '') {
                    subjectImgEl.style.display = 'block'; // Ensure the image is visible
                }
                
                subjectImgEl.src = subjectImages[index];

                // Force DOM reflow (reset animation)
                subjectImgEl.style.animation = 'none'; // Reset animation
                void subjectImgEl.offsetWidth; // Trigger reflow
                subjectImgEl.style.animation = 'wiggle-in 0.8s ease forwards'; // Apply animation
            }
            
            // Update for other blanks (place, verb, preposition)
            if (id === 'place') {
                currentIndices.place = (currentIndices.place + 1) % blanks.place.length;
                
                const placeIndex = currentIndices.place;
                const preposition = blanks.preposition[currentIndices.place];
                const place = blanks.place[currentIndices.place];
                
                document.getElementById('preposition').innerHTML = preposition;
                content.innerHTML = place;

                const placeImgEl = document.getElementById('place-image');
                // Show the image if it's not visible
                if (placeImgEl.style.display === 'none' || placeImgEl.style.display === '') {
                    placeImgEl.style.display = 'block'; // Ensure the image is visible
                }

                placeImgEl.src = '';
                placeImgEl.src = placeImages[placeIndex];
                triggerPlaceImageAnimation(); // Trigger the animation

            } else if (id === 'verb') {
                
                const verbIndex = currentIndices.verb;
                const verb = blanks.verb[verbIndex];
                content.innerHTML = verb;
                
                // Update the verb index (rotation logic)
                currentIndices.verb = (verbIndex + 1) % blanks.verb.length;
                
            }

            // Fade the text back in after the progress bar completes
            content.style.opacity = '1';

            // Mark this blank as selected
            selectionStatus[id] = true;

            // Check if all blanks have been selected, and enable the "Read" button if true
            if (checkAllSelected()) {
                readBtn.style.display = 'inline-block'; // Show the button
                readBtn.disabled = false; // Enable the button
            }

            const utterance = new SpeechSynthesisUtterance(content.innerHTML.toLowerCase());
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            speechSynthesis.speak(utterance);

            // Reset the progress bar after filling
            bar.style.width = '0%';
        }, 1500);  // Delay matches the progress bar animation time
    });
});


readBtn.addEventListener('click', () => {
    readBtn.style.display = 'none'; // Hide the Read button
    speechSynthesis.cancel(); // Stop any ongoing speech synthesis

    const subjectText = document.getElementById('subject').textContent.trim();
    const verbText = document.getElementById('verb').textContent.trim();
    const placeText = document.getElementById('place').textContent.trim();
    const prepositionText = document.getElementById('preposition').textContent.trim();

    const currentStory = stories[currentStoryIndex];
    const storySentences = currentStory(subjectText, verbText, prepositionText, placeText);
    const sentenceText = storySentences.join(' ');

    // Hide book layout
    bookLayout.style.display = 'none';

    // Prepare reading screen
    readingScreen.style.display = 'block';
    nextBtn.style.display = 'block';
    nextBtn.disabled = true;

    // Just show the full sentence without per-word spans
    const highlightedSentence = document.querySelector('.highlighted-sentence');
    highlightedSentence.textContent = sentenceText;

    // Speak the entire sentence at once
    const utter = new SpeechSynthesisUtterance(sentenceText);
    utter.rate = 1.0;
    utter.lang = 'en-US';

    utter.onend = () => {
        nextBtn.disabled = false;
        sentenceCount++;
    };

    speechSynthesis.speak(utter);

    currentStoryIndex = (currentStoryIndex + 1) % stories.length;
});