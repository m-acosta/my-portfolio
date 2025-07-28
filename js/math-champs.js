function generateRandomQuestions(count = 10) {
	const questions = [];
	const shapes = ["circle", "square", "triangle", "rectangle"];
	const shapeSides = {
		circle: 0,
		triangle: 3,
		square: 4,
		rectangle: 4,
	};

	for (let i = 0; i < count; i++) {
		const type = ["sequence", "math", "comparison", "shape"][Math.floor(Math.random() * 4)];

		switch (type) {
			case 'sequence': {
				const step = Math.random() < 0.5 ? 1 : 2;
				const start = Math.floor(Math.random() * (100 - 4 * step));
				const seq = [start, start + step, '?', start + 3 * step, start + 4 * step];
				const answer = start + 2 * step;
				const choices = shuffle([answer, answer + 1, answer - 1, answer + 2]);
				questions.push({ type, sequence: seq, question: "What number goes in the blank?", choices, answer });
				break;
			}
			case 'math': {
				let a, b, operator, answer;
				do {
					a = Math.floor(Math.random() * 10);
					b = Math.floor(Math.random() * 10);
					operator = Math.random() < 0.5 ? '+' : '-';
					answer = operator === '+' ? a + b : a - b;
				} while (answer <= 0);

				const choices = shuffle([answer, answer + 1, answer - 1, answer + 2]).filter(x => x >= 0 && x <= 18).slice(0, 4);
				questions.push({ type, leftNumber: a, operator, rightNumber: b, choices, answer });
				break;
			}
			case 'comparison': {
				let a = Math.floor(Math.random() * 10);
				let b;
				do {
					b = Math.floor(Math.random() * 10);
				} while (a === b);
				const answer = a > b ? a : b;
				questions.push({ type, question: "Which number is bigger?", choices: [a, b], answer });
				break;
			}
			case 'shape': {
				const answer = shapes[Math.floor(Math.random() * shapes.length)];
				const choices = shuffle([...shapes]);
				questions.push({ type, question: "What shape is this?", choices, answer });
				break;
			}
		}
	}

	return questions;
}

function shuffle(arr) {
	return [...arr].sort(() => Math.random() - 0.5);
}


document.addEventListener('DOMContentLoaded', () => {
	const ui = {
		startBtn: document.getElementById('start-btn'),
		rulesScreen: document.getElementById('rules-screen'),
		quizScreen: document.getElementById('quiz-screen'),
		questionText: document.getElementById('question-text'),
		choicesContainer: document.getElementById('choices-container'),
		nextBtn: document.getElementById('next-btn'),
		scoreText: document.getElementById('score-text'),
		sequenceRow: document.getElementById('sequence-row'),
        rewardScreen: document.getElementById('reward-screen'),
        rewardMessage: document.getElementById('reward-message'),
        trophyImg: document.getElementById('trophy-img'),
        playAgainBtn: document.getElementById('play-again-btn'),
	};

	const questions = generateRandomQuestions(10); // or however many you want

	const game = new QuizGame(ui, questions);
	game.initialize();
});

class QuizGame {
    constructor(ui, questions) {
        this.ui = ui;
        this.questions = questions;
        this.currentIndex = 0;
        this.correctCount = 0;
        this.streak = 0;
        this.trophyLevel = 0;
        this.questionRenderer = new QuestionRenderer(ui);
        this.answerHandler = new AnswerHandler(ui, this);
    }


	initialize() {
		this.ui.startBtn.addEventListener('click', () => this.startGame());
		this.ui.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.ui.playAgainBtn.addEventListener('click', () => this.returnToQuiz());
	}

	startGame() {
		this.ui.rulesScreen.style.display = 'none';
		this.ui.quizScreen.hidden = false;
		this.currentIndex = 0;
		this.correctCount = 0;
		this.ui.scoreText.textContent = '';
		this.ui.nextBtn.disabled = true;
		this.showQuestion();
		this.ui.questionText.focus();
	}

    nextQuestion() {
        this.currentIndex++;

        // If we've reached the end of current questions, load more
        if (this.currentIndex >= this.questions.length) {
            const moreQuestions = generateRandomQuestions(10);
            this.questions.push(...moreQuestions);
        }

        this.ui.nextBtn.disabled = true;
        this.ui.scoreText.textContent = '';
        this.showQuestion();
        this.ui.questionText.focus();
    }


	showQuestion() {
		const current = this.questions[this.currentIndex];
		this.questionRenderer.render(current, (selected) => {
			this.answerHandler.handleAnswer(selected, current);
		});
	}

    returnToQuiz() {
        this.ui.rewardScreen.hidden = true;

        if (this.trophyLevel === 3) {
            // Reset game after final trophy
            this.currentIndex = 0;
            this.correctCount = 0;
            this.streak = 0;
            this.trophyLevel = 0;
            this.questions = generateRandomQuestions(10);
            this.ui.quizScreen.hidden = false;
            this.showQuestion();
            this.ui.nextBtn.disabled = true;
            this.ui.scoreText.textContent = '';
        } else {
            // Continue the quiz for next questions
            this.ui.quizScreen.hidden = false;
            this.ui.nextBtn.disabled = true;
            this.ui.scoreText.textContent = '';
            this.nextQuestion();
        }
    }


    showRewardScreen() {
        this.ui.quizScreen.hidden = true;
        this.ui.rewardScreen.hidden = false;

        const trophyImg = this.ui.trophyImg;
        trophyImg.src = `../img/math-champs/trophy${this.trophyLevel}.png`;

        if (this.trophyLevel === 3) {
            this.ui.rewardMessage.textContent = "You win! You earned the highest trophy!";
            this.ui.playAgainBtn.textContent = "Play Again";
        } else {
            this.ui.rewardMessage.textContent = "Great job! You earned a new trophy!";
            this.ui.playAgainBtn.textContent = "Next";
        }
    }
}

class QuestionRenderer {
	constructor(ui) {
		this.ui = ui;
		this.mathRenderer = new MathVisualRenderer(ui);
		this.sequenceRenderer = new SequenceRenderer(ui);
        this.comparisonRenderer = new ComparisonRenderer(ui);
        this.shapeRenderer = new ShapeRenderer(ui);
	}

	render(question, onSelect) {
		const { questionText, choicesContainer, sequenceRow } = this.ui;

		document.querySelector('.math-visual')?.remove();
        document.querySelector('.shape-visual')?.remove();
        questionText.textContent = question.question || '';
		choicesContainer.innerHTML = '';
		choicesContainer.className = '';
		sequenceRow.style.display = 'none';

		switch (question.type) {
			case 'sequence':
				this.sequenceRenderer.render(question);
				break;
			case 'math':
				this.mathRenderer.render(question);
				break;
            case 'comparison':
                this.comparisonRenderer.render(question);
                break;
            case 'shape':
                this.shapeRenderer.render(question);
                break;

		}

		question.choices.forEach(choice => {
			const btn = document.createElement('button');
			btn.textContent = choice;
			btn.classList.add('choice-btn');
			btn.setAttribute('role', 'listitem');
			btn.setAttribute('aria-pressed', 'false');
			btn.addEventListener('click', () => onSelect(choice));
			choicesContainer.appendChild(btn);
		});
	}
}

class MathVisualRenderer {
	constructor(ui) {
		this.ui = ui;
	}

	render(question) {
		const { questionText } = this.ui;
		questionText.textContent = `What is ${question.leftNumber} ${question.operator} ${question.rightNumber}?`;

		document.querySelector('.math-visual')?.remove();
		const mathVisual = document.createElement('div');
		mathVisual.classList.add('math-visual');

		const shapeTypes = ['circle', 'square', 'triangle'];
		const colors = ['#6ab6b4', '#f27c38', '#e84a5f', '#86af49', '#9d79bc'];
		const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
		const shapeColor = colors[Math.floor(Math.random() * colors.length)];

		const createColumn = (num) => {
			const col = document.createElement('div');
			col.classList.add('math-column');
			const numLabel = document.createElement('div');
			numLabel.textContent = num;
			numLabel.classList.add('math-number');
			const shapeBox = document.createElement('div');
			shapeBox.classList.add('shape-box');

			for (let i = 0; i < num; i++) {
				const shape = document.createElement('div');
				shape.classList.add('shape', `shape-${shapeType}`);
				if (shapeType === 'triangle') {
					shape.style.borderBottomColor = shapeColor;
				} else {
					shape.style.backgroundColor = shapeColor;
				}
				shapeBox.appendChild(shape);
			}

			col.appendChild(numLabel);
			col.appendChild(shapeBox);
			return col;
		};

        const row = document.createElement('div');
        row.classList.add('math-grid-row');
        row.appendChild(ShapeVisualHelper.createColumn(question.leftNumber));
        row.appendChild(ShapeVisualHelper.createColumn(question.rightNumber));
        mathVisual.appendChild(row);

		questionText.insertAdjacentElement('afterend', mathVisual);
	}
}

class SequenceRenderer {
	constructor(ui) {
		this.ui = ui;
	}

	render(question) {
		const { sequenceRow, choicesContainer, questionText } = this.ui;
		sequenceRow.style.display = 'flex';
		sequenceRow.innerHTML = '';

		question.sequence.forEach(val => {
			const box = document.createElement('div');
			box.textContent = val;
			box.classList.add('sequence-box');
			sequenceRow.appendChild(box);
		});

		questionText.textContent = question.question;
	}
}

class ComparisonRenderer {
	constructor(ui) {
		this.ui = ui;
	}

	render(question) {
		const { questionText } = this.ui;
		document.querySelector('.math-visual')?.remove();

		const comparisonVisual = document.createElement('div');
		comparisonVisual.classList.add('math-visual');

		const leftNum = question.choices[0];
		const rightNum = question.choices[1];

		const row = document.createElement('div');
		row.classList.add('math-grid-row');
		row.appendChild(ShapeVisualHelper.createColumn(leftNum));
		row.appendChild(ShapeVisualHelper.createColumn(rightNum));

		comparisonVisual.appendChild(row);
		questionText.insertAdjacentElement('afterend', comparisonVisual);
	}
}

class AnswerHandler {
	constructor(ui, game) {
		this.ui = ui;
		this.game = game;
	}

	handleAnswer(selected, question) {
		const { choicesContainer, nextBtn, scoreText } = this.ui;
		const buttons = choicesContainer.querySelectorAll('button');
		buttons.forEach(btn => {
			btn.disabled = true;
			btn.classList.remove('correct', 'wrong', 'shake');
		});
		nextBtn.disabled = false;

		const correct = selected === question.answer;
		const selectedBtn = [...buttons].find(btn => btn.textContent == selected);

        if (correct) {
            selectedBtn.classList.add('correct');
            this.game.correctCount++;
            this.game.streak++;

            if (this.game.streak % 3 === 0 && this.game.trophyLevel < 3) {
                this.game.trophyLevel++;
                this.game.showRewardScreen();
                return; // stop for reward screen
            }

            this.ui.scoreText.textContent = "Correct!";
        } else {
            selectedBtn.classList.add('wrong', 'shake');
            this.ui.scoreText.textContent = `Oops! Try next one.`;
            buttons.forEach(btn => {
                if (btn.textContent == question.answer) btn.classList.add('correct');
            });
        }
	}
}

class ShapeRenderer {
	constructor(ui) {
		this.ui = ui;
	}

    render(question) {
        document.querySelector('.shape-visual')?.remove();

        const shapeVisual = document.createElement('div');
        shapeVisual.classList.add('shape-visual');

        const shapeBox = document.createElement('div');
        shapeBox.classList.add('shape-box', 'single-shape-box');

        // Determine shape type based on answer type
        let shapeType = '';
        if (typeof question.answer === 'string') {
            shapeType = question.answer.toLowerCase();
        } else {
            shapeType = 'square'; // default fallback
        }

        const shapeColor = ShapeVisualHelper.randomColor();

        const shape = ShapeVisualHelper.createSingleShape(shapeType, shapeColor);
        shapeBox.appendChild(shape);
        shapeVisual.appendChild(shapeBox);

        this.ui.questionText.insertAdjacentElement('afterend', shapeVisual);
    }
}

class ShapeVisualHelper {
	static createColumn(num, options = {}) {
		const {
			shapeType = ShapeVisualHelper.randomShapeType(),
			shapeColor = ShapeVisualHelper.randomColor(),
			showLabel = true
		} = options;

		const col = document.createElement('div');
		col.classList.add('math-column');

		if (showLabel) {
			const numLabel = document.createElement('div');
			numLabel.textContent = num;
			numLabel.classList.add('math-number');
			col.appendChild(numLabel);
		}

		const shapeBox = document.createElement('div');
		shapeBox.classList.add('shape-box');

		for (let i = 0; i < num; i++) {
			const shape = document.createElement('div');
			shape.classList.add('shape', `shape-${shapeType}`);

			if (shapeType === 'triangle') {
				shape.style.borderBottomColor = shapeColor;
			} else {
				shape.style.backgroundColor = shapeColor;
			}

			shapeBox.appendChild(shape);
		}

		col.appendChild(shapeBox);
		return col;
	}

	static randomShapeType() {
		return ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
	}

	static randomColor() {
		const colors = ['#6ab6b4', '#f27c38', '#e84a5f', '#86af49', '#9d79bc'];
		return colors[Math.floor(Math.random() * colors.length)];
	}

    static createSingleShape(shapeType, shapeColor) {
        const shape = document.createElement('div');
        shape.classList.add('shape', `shape-${shapeType}`, 'large-shape');

        if (shapeType === 'triangle') {
            shape.style.borderBottomColor = shapeColor;
        } else {
            shape.style.backgroundColor = shapeColor;
        }

        return shape;
	}
}

