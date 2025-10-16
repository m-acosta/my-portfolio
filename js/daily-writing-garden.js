// Get DOM elements
const rulesScreen = document.getElementById('rules-screen');
const writingScreen = document.getElementById('writing-screen');
const startBtn = document.getElementById('start-btn');
const promptBox = document.getElementById('writing-prompt');
const writingInput = document.getElementById('writing-input');
const submitBtn = document.getElementById('submit-btn');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const treeStage = document.getElementById('tree-stage');
const tryAgainBtn = document.getElementById('try-again-btn');
const editBtn = document.getElementById('edit-btn');

let currentPrompt = null;
let editedOnce = false; // track if user has edited

const treeImages = [
    "../img/daily-writing-garden/acorn.png",       // stage 0
    "../img/daily-writing-garden/sapling.png",     // stage 1
    "../img/daily-writing-garden/young-oak-tree.png", // stage 2
    "../img/daily-writing-garden/mature-oak-tree.png" // stage 3
];

const writingPrompts = [
  { type: "narrative", prompt: "Write about a time you felt really proud of yourself." },
  { type: "narrative", prompt: "Imagine you found a mysterious box in your backyard. What happens next?" },
  { type: "narrative", prompt: "Tell a story about your best day at school." },
  { type: "narrative", prompt: "Describe a day where everything went wrong — but ended well." },
  { type: "narrative", prompt: "Write a story about a magical trip to the zoo." },
  { type: "narrative", prompt: "Tell a story about a talking animal who became your friend." },
  { type: "narrative", prompt: "Imagine you wake up with superpowers. What do you do?" },
  { type: "narrative", prompt: "Describe a fun adventure you went on with your family." },
  { type: "narrative", prompt: "Write about your favorite holiday memory." },
  { type: "narrative", prompt: "Tell a story about finding something surprising on the way home from school." },
  { type: "narrative", prompt: "Imagine your favorite toy came to life. What happens next?" },
  { type: "narrative", prompt: "Write about the first time you tried something new." },
  { type: "narrative", prompt: "Tell a story about a time you helped someone." },
  { type: "narrative", prompt: "Describe a day when it rained all day and you had to stay inside." },
  { type: "narrative", prompt: "Write a story about a secret tunnel you find at school." },
  { type: "narrative", prompt: "Imagine you are the teacher for a day. What would you do?" },
  { type: "narrative", prompt: "Tell a story about getting lost and finding your way back." },
  { type: "narrative", prompt: "Write about a dream you had that felt real." },

  { type: "opinion", prompt: "What is your favorite animal, and why?" },
  { type: "opinion", prompt: "Would you rather play inside or outside? Explain your choice." },
  { type: "opinion", prompt: "Is it better to work alone or with a team? Give reasons." },
  { type: "opinion", prompt: "Should school start later in the day? Why or why not?" },
  { type: "opinion", prompt: "What is the best season of the year? Why?" },
  { type: "opinion", prompt: "Which is better: reading a book or watching a movie? Explain." },
  { type: "opinion", prompt: "Should kids have homework every night? Give your opinion." },
  { type: "opinion", prompt: "What is the best lunch food in the cafeteria?" },
  { type: "opinion", prompt: "Should pets be allowed in school? Why or why not?" },
  { type: "opinion", prompt: "What is the most fun game to play with friends?" },
  { type: "opinion", prompt: "What’s the best thing to do on a rainy day?" },
  { type: "opinion", prompt: "Would you rather go to the beach or the mountains?" },
  { type: "opinion", prompt: "What is your favorite subject in school? Why?" },
  { type: "opinion", prompt: "Do you think video games are good or bad for kids?" },
  { type: "opinion", prompt: "What is one rule at home or school you would change?" },

  { type: "informational", prompt: "How do you take care of a pet?" },
  { type: "informational", prompt: "Explain how to make your favorite snack." },
  { type: "informational", prompt: "What do plants need to grow?" },
  { type: "informational", prompt: "What is your morning routine like?" },
  { type: "informational", prompt: "Describe how to be a good friend." },
  { type: "informational", prompt: "Explain how to play your favorite sport or game." },
  { type: "informational", prompt: "How do you stay safe while riding a bike?" },
  { type: "informational", prompt: "Describe how to clean your room step by step." },
  { type: "informational", prompt: "What are the steps to brush your teeth properly?" },
  { type: "informational", prompt: "How do you prepare for a test at school?" },
  { type: "informational", prompt: "What should you do if you get lost?" },
  { type: "informational", prompt: "Explain what makes a good team member." },
  { type: "informational", prompt: "How can kids help protect the environment?" },
  { type: "informational", prompt: "Describe your favorite animal and where it lives." },
  { type: "informational", prompt: "What happens in each season of the year?" },
  { type: "informational", prompt: "How does your family celebrate a special holiday?" },
  { type: "informational", prompt: "What are some healthy habits you follow every day?" }
];

// Start game
startBtn.addEventListener('click', () => {
    rulesScreen.style.display = 'none';
    feedbackContainer.style.display = 'none';
    writingScreen.style.display = 'block';
    loadRandomPrompt();
    writingInput.value = '';
    writingInput.focus();
});

function loadRandomPrompt() {
    const idx = Math.floor(Math.random() * writingPrompts.length);
    currentPrompt = writingPrompts[idx];
    promptBox.textContent = currentPrompt.prompt;
}

// --- Grading functions ---
function gradePunctuation(text) {
    let score = 0;
    const sentenceMatches = text.match(/[^.!?]+[.!?]/g) || [];
    if (sentenceMatches.length === 0) return 0;
    const properEndings = sentenceMatches.filter(s => /[.!?]$/.test(s.trim())).length;
    if (properEndings / sentenceMatches.length >= 0.9) score += 1;
    const capitalsOK = sentenceMatches.filter(s => /^[A-Z]/.test(s.trim())).length;
    if (capitalsOK / sentenceMatches.length >= 0.9) score += 1;
    return Math.min(score, 2);
}

function gradeVocabulary(text) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 0;
    const cleaned = words.map(w => w.toLowerCase().replace(/[.,!?;:]/g, ''));
    const unique = new Set(cleaned);
    const typeTokenRatio = unique.size / words.length;
    let score = typeTokenRatio > 0.65 ? 1 : typeTokenRatio > 0.4 ? 0.5 : 0;
    const interestingCount = cleaned.filter(w => w.length >= 6).length;
    if (interestingCount / words.length >= 0.2) score += 1;
    return Math.min(score, 2);
}

function gradeSentenceStructure(text) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    if (!sentences.length) return 0;
    let score = 0;
    const complete = sentences.filter(s => s.split(/\s+/).length >= 3).length;
    if (complete / sentences.length >= 0.9) score += 1;
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const hasShort = lengths.some(l => l <= 5);
    const hasLong = lengths.some(l => l >= 12);
    if (hasShort && hasLong) score += 0.5;
    const complexIndicators = /\b(and|but|because|so|although|when|while|before|after)\b/i;
    const complexCount = sentences.filter(s => complexIndicators.test(s)).length;
    if (complexCount >= 2) score += 0.5;
    return Math.min(score, 2);
}

function gradeEffort(text) {
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (sentences.length >= 4 && words.length >= 50) return 2;
    if (sentences.length >= 2 && words.length >= 25) return 1;
    return 0;
}

function gradeResponse(text) {
    const scores = {
        punctuation: gradePunctuation(text),
        vocabulary: gradeVocabulary(text),
        sentenceStructure: gradeSentenceStructure(text),
        effort: gradeEffort(text)
    };
    const totalScore = Math.min(Object.values(scores).reduce((a, b) => a + b, 0), 8);
    return { totalScore, scores };
}

function scoreToStage(score) {
    if (score >= 7) return 3;
    if (score >= 4) return 2;
    if (score >= 2) return 1;
    return 0;
}

function generateFeedback(promptType, scores) {
    let weakest = Object.entries(scores).sort((a,b) => a[1] - b[1])[0][0];
    const improvementTips = {
        punctuation: "Make sure each sentence starts with a capital letter and ends with the right punctuation.",
        vocabulary: "Try using more varied and interesting words.",
        sentenceStructure: "Mix short and long sentences, and make sure each is complete.",
        effort: "Add more details and sentences to fully answer the prompt."
    };
    const acknowledgments = {
        narrative: "You painted a picture with your words — I could imagine the scene!",
        opinion: "You explained your thoughts clearly and gave good reasons.",
        informational: "You shared helpful facts and explained them well."
    };
    const encouragements = [
        "Keep going — every draft makes your writing stronger!",
        "Great work! I can tell you’re thinking about your ideas.",
        "Your writing is growing just like your tree!"
    ];

    let editNote = editedOnce ? " I can see you worked to improve your writing — great job revising!" : "";

    return `${acknowledgments[promptType] || "Nice work writing your ideas!"}${editNote} One area to improve is: ${improvementTips[weakest]} ${encouragements[Math.floor(Math.random() * encouragements.length)]}`;
}

function animateTreeToStage(stageIndex, callback) {
    treeStage.style.opacity = 0;
    setTimeout(() => {
        treeStage.innerHTML = `<img src="${treeImages[stageIndex]}" alt="Tree stage" style="max-width:120px;" />`;
        treeStage.style.opacity = 1;
        if (callback) {
            setTimeout(callback, 800);
        }
    }, 800);
}

// On Submit
submitBtn.addEventListener('click', () => {
    const text = writingInput.value.trim();
    if (!text) {
        alert('Please write something before submitting.');
        return;
    }

    const { totalScore, scores } = gradeResponse(text);
    const stage = scoreToStage(totalScore);

    animateTreeToStage(stage, () => {
        feedbackText.textContent = generateFeedback(currentPrompt.type, scores);
        feedbackText.style.opacity = 1;
    });

    feedbackContainer.style.display = 'block';
    // show edit button if it exists
    if (editBtn) editBtn.style.display = 'inline-block';
    submitBtn.style.display = 'none';
});

// Edit Response
if (editBtn) {
    editBtn.addEventListener('click', () => {
        editedOnce = true;
        submitBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
        feedbackContainer.style.display = 'none';
        writingInput.focus();
    });
}

// New Prompt
tryAgainBtn.addEventListener('click', () => {
    loadRandomPrompt();
    writingInput.value = '';
    feedbackContainer.style.display = 'none';
    writingInput.focus();
});