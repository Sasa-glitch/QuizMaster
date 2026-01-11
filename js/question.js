/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

export default class Question {
    // TODO: Create constructor(quiz, container, onQuizEnd)
    // 1. Store the three parameters
    // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
    // 3. Store index: this.index = quiz.currentQuestionIndex
    // 4. Decode and store: question, correctAnswer, category
    // 5. Decode wrong answers (use .map())
    // 6. Shuffle all answers
    // 7. Initialize: answered = false, timerInterval = null, timeRemaining

    constructor(quiz, container, onQuizEnd) {
        this.quiz = quiz;
        this.container = container;
        this.onQuizEnd = onQuizEnd;
        this.allAnswers = [];
    }
    createANewQuestion() {
        this.questionData = this.quiz.getCurrentQuestion();
        this.index = this.quiz.currentQuestionIndex;
        const question = new DOMParser().parseFromString(
            this.questionData.question,
            "text/html"
        );
        this.question = question.documentElement.textContent;
        const correctAnswer = new DOMParser().parseFromString(
            this.questionData.correct_answer,
            "text/html"
        );
        this.correctAnswer = correctAnswer.documentElement.textContent;
        const category = new DOMParser().parseFromString(
            this.questionData.category,
            "text/html"
        );
        this.category = category.documentElement.textContent;
        const wrongAnswers = this.questionData.incorrect_answers;
        this.wrongAnswers = wrongAnswers.map((answer) => {
            const doc1 = new DOMParser().parseFromString(answer, "text/html");
            return doc1.documentElement.textContent;
        });
        const allAnswers = [...this.wrongAnswers, this.correctAnswer];
        this.allAnswers = this.shuffleAnswers(allAnswers);
        this.answered = false;
        this.timerInterval = null;
        this.timeRemaining = 30;
    }
    // TODO: Create decodeHtml(html) method
    // Use DOMParser to decode HTML entities
    // TODO: Create shuffleAnswers() method
    // 1. Combine wrongAnswers and correctAnswer into one array
    // 2. Shuffle using Fisher-Yates algorithm
    // 3. Return shuffled array
    shuffleAnswers(array) {
        for (let i = 0; i < array.length; i++) {
            const j = Math.floor(Math.random() * (array.length - i));
            [array[j], array[array.length - (i + 1)]] = [
                array[array.length - (i + 1)],
                array[j],
            ];
        }
        return array;
    }
    // TODO: Create getProgress() method
    // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
    // Round to whole number
    getProgress() {
        return Math.round(
            ((this.index + 1) / this.quiz.numberOfQuestions) * 100
        );
    }
    // TODO: Create displayQuestion() method
    // 1. Create HTML string for the question card
    //    (See index.html for the structure to use)
    // 2. Use template literals with ${} for dynamic data
    // 3. Set this.container.innerHTML = yourHTML
    // 4. Call this.addEventListeners()
    // 5. Call this.startTimer()
    displayQuestion() {
        let htmlMarkup = `
            <div class="game-card question-card">
                <div class="xp-bar-container">
                    <div class="xp-bar-header">
                    <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
                    <span class="xp-value">Question ${this.index + 1}/${
            this.quiz.numberOfQuestions
        }</span>
                    </div>
                    <div class="xp-bar">
                    <div class="xp-bar-fill" style="width: ${this.getProgress()}%"></div>
                    </div>
                </div>
                <div class="stats-row">
                    <div class="stat-badge category">
                    <i class="fa-solid fa-bookmark"></i>
                    <span>${this.category}</span>
                    </div>
                    <div class="stat-badge difficulty ${this.quiz.difficulty}">
                    <i class="fa-solid fa-face-smile"></i>
                    <span>${this.quiz.difficulty}</span>
                    </div>
                    <div class="stat-badge timer">
                    <i class="fa-solid fa-stopwatch"></i>
                    <span class="timer-value">${this.timeRemaining}</span>s
                    </div>
                    <div class="stat-badge counter">
                    <i class="fa-solid fa-gamepad"></i>
                    <span>${this.index + 1}/${
            this.quiz.numberOfQuestions
        }</span>
                    </div>
                </div>
                <h2 class="question-text">${this.question}</h2>
            <div class="answers-grid">
        `;
        for (let i = 0; i < this.allAnswers.length; i++) {
            htmlMarkup += `
                <button class="answer-btn" data-answer="${this.allAnswers[i]}">
                    <span class="answer-key">${i + 1}</span>
                    <span class="answer-text">${this.allAnswers[i]}</span>
                </button>
            `;
        }
        htmlMarkup += `
            </div>
                <p class="keyboard-hint">
                    <i class="fa-regular fa-keyboard"></i> Press 1-${this.allAnswers.length} to select
                </p>
                <div class="score-panel">
                    <div class="score-item">
                    <div class="score-item-label">Score</div>
                    <div class="score-item-value">${this.quiz.score}</div>
                    </div>
                </div>
            </div>
        `;
        this.container.innerHTML = htmlMarkup;
        this.addEventListeners();
        this.startTimer();
    }
    // TODO: Create addEventListeners() method
    // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
    // 2. Add click event to each: call this.checkAnswer(button)
    // 3. Add keyboard support: listen for keys 1-4
    //    Valid keys are: ['1', '2', '3', '4']
    addEventListeners() {
        const answerButtons = document.querySelectorAll(".answer-btn");
        answerButtons.forEach((button) => {
            button.addEventListener("click", () => this.checkAnswer(button));
            const keyDownFun = (e) => {
                if (e.key == button.querySelector(".answer-key").textContent) {
                    button.click();
                }
            };
            this.addKeyDownEvent(window, "keydown", keyDownFun);
        });
    }
    // TODO: Create removeEventListeners() method
    // Remove any keyboard listeners you added
    removeEventListeners() {
        this.keydownEvents.forEach((eventObject) => {
            eventObject.element.removeEventListener(
                eventObject.event,
                eventObject.callback
            );
        });
        this.keydownEvents = [];
    }
    // tracking events
    keydownEvents = [];
    addKeyDownEvent(element, event, callback) {
        element.addEventListener(event, callback);
        this.keydownEvents.push({ element, event, callback });
    }
    // TODO: Create startTimer() method
    // 1. Get timer display element
    // 2. Use setInterval to run every 1000ms (1 second)
    // 3. Decrement timeRemaining
    // 4. Update the display
    // 5. If timeRemaining <= 10 seconds, add 'warning' class
    // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
    startTimer() {
        const timerDisplay = document.querySelector(".timer");
        let warningStarted = false;
        const warningAudio = new Audio("./sounds/tick-tock-echoing-with-quarter-ticks.wav")
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            document.querySelector("span.timer-value").textContent =
                this.timeRemaining;
            if (this.timeRemaining <= 10 && !warningStarted) {
                timerDisplay.classList.add("warning");
                warningAudio.play();
                warningStarted = true;
            }
            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.handleTimeUp();
                warningAudio.pause();
            }
        }, 1000);
    }
    // TODO: Create stopTimer() method
    // Use clearInterval(this.timerInterval)
    stopTimer() {
        clearInterval(this.timerInterval);
    }
    // TODO: Create handleTimeUp() method
    // 1. Set answered = true
    // 2. Call removeEventListeners()
    // 3. Show correct answer (add 'correct' class)
    // 4. Show "TIME'S UP!" message
    // 5. Call animateQuestion() after a delay
    handleTimeUp() {
        const revealAudio = new Audio("./sounds/reveal.wav");
        revealAudio.play();
        this.answered = true;
        this.removeEventListeners();
        document.querySelectorAll(".answer-btn").forEach((answer) => {
            console.log(answer.getAttribute("data-answer") === this.correctAnswer);
            console.log(answer.getAttribute("data-answer"));
            console.log(this.correctAnswer);
            if (answer.getAttribute("data-answer") === this.correctAnswer) {
                answer.classList.add("correct");
            }
        });
        const htmlMarkup = `<div class="time-up-message">
            <i class="fa-solid fa-clock"></i> TIME'S UP!
            </div>`;
        document
            .querySelector(".keyboard-hint")
            .insertAdjacentHTML("afterend", htmlMarkup);
        setTimeout(() => {
            this.animateQuestion();
        }, 1500);
    }
    // TODO: Create checkAnswer(choiceElement) method
    // 1. If already answered, return early
    // 2. Set answered = true
    // 3. Stop the timer
    // 4. Get selected answer from data-answer attribute
    // 5. Compare with correctAnswer (case insensitive)
    // 6. If correct: add 'correct' class, call quiz.incrementScore()
    // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
    // 8. Disable other buttons (add 'disabled' class)
    // 9. Call animateQuestion()
    checkAnswer(choiceElement) {
        if (this.answered) {
            return;
        }
        const correctAudio = new Audio("./sounds/correct.wav");
        const wrongAudio = new Audio("./sounds/wrong-one.ogg");

        this.answered = true;
        this.stopTimer();
        const selectedAnswer = choiceElement.getAttribute("data-answer");
        if (selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase()) {
            correctAudio.play();
            choiceElement.classList.add("correct");
            this.quiz.incrementScore();
        } else {
            wrongAudio.play();
            choiceElement.classList.add("wrong");
            this.highlightCorrectAnswer();
            document.querySelectorAll(".answer-btn").forEach((answer) => {
                if (answer !== choiceElement) {
                    answer.classList.add("disabled");
                }
            });
        }
        this.animateQuestion();
    }
    // TODO: Create highlightCorrectAnswer() method
    // Find the button with correct answer and add 'correct-reveal' class
    highlightCorrectAnswer() {
        document.querySelectorAll(".answer-btn").forEach((answer) => {
            if (answer.getAttribute("data-answer") === this.correctAnswer) {
                answer.classList.add("correct-reveal");
            }
        });
    }
    // TODO: Create getNextQuestion() method
    // 1. Call quiz.nextQuestion()
    // 2. If returns true: create new Question and display it
    // 3. If returns false: show results using quiz.endQuiz()
    //    Also add click listener to Play Again button
    getNextQuestion() {
        const isThereIsMore = this.quiz.nextQuestion();
        if (isThereIsMore) {
            this.createANewQuestion();
            this.displayQuestion();
        } else {
            const results = this.quiz.endQuiz();
            const finishedAudio = new Audio("./sounds/finished.wav");
            finishedAudio.play();
            this.container.innerHTML = results;
            document
                .querySelector(".btn-restart")
                .addEventListener("click", this.onQuizEnd);
        }
    }
    // TODO: Create animateQuestion(duration) method
    // 1. Wait for 1500ms (transition delay)
    // 2. Add 'exit' class to question card
    // 3. Wait for duration
    // 4. Call getNextQuestion()
    animateQuestion(duration = 500) {
        setTimeout(() => {
            document.querySelector(".question-card").classList.add("exit");
            setTimeout(() => {
                this.getNextQuestion();
            }, duration);
        }, 1500);
    }
}
