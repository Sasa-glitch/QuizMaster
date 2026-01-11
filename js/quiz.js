/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 *
 * This class manages the entire quiz game state.
 *
 * PROPERTIES TO CREATE:
 * - category (string) - The selected category ID
 * - difficulty (string) - easy, medium, or hard
 * - numberOfQuestions (number) - How many questions
 * - playerName (string) - The player's name
 * - score (number) - Current score, starts at 0
 * - questions (array) - Questions from API, starts empty
 * - currentQuestionIndex (number) - Which question we're on, starts at 0
 *
 * METHODS TO IMPLEMENT:
 * - constructor(category, difficulty, numberOfQuestions, playerName)
 * - async getQuestions() - Fetch questions from API
 * - buildApiUrl() - Create the API URL with parameters
 * - incrementScore() - Add 1 to score
 * - getCurrentQuestion() - Get the current question object
 * - nextQuestion() - Move to next question, return true/false
 * - isComplete() - Check if quiz is finished
 * - getScorePercentage() - Calculate percentage (0-100)
 * - saveHighScore() - Save to localStorage
 * - getHighScores() - Load from localStorage
 * - isHighScore() - Check if current score qualifies
 * - endQuiz() - Generate results screen HTML
 *
 */

export default class Quiz {
    // TODO: Create constructor
    // Initialize all properties mentioned above
    score = 0;
    questions = [];
    currentQuestionIndex = 0;
    constructor(category, difficulty, numberOfQuestions, playerName) {
        this.category = category;
        this.difficulty = difficulty;
        this.numberOfQuestions = Number(numberOfQuestions);
        this.playerName = playerName;
    }

    // TODO: Create async getQuestions() method
    // 1. Build the API URL using buildApiUrl()
    // 2. Use fetch() to get data
    // 3. Check if response.ok, throw error if not
    // 4. Parse JSON: const data = await response.json()
    // 5. Check if data.response_code === 0 (success)
    // 6. Store data.results in this.questions
    // 7. Return this.questions
    async getQuestions() {
        try {
            const apiURL = this.buildApiUrl();
            const response = await fetch(apiURL);
            if (!response.ok) {
                throw new Error("There is a connection issue!");
            }
            const data = await response.json();
            if (data.response_code === 0) {
                console.log(apiURL);
                this.questions = data.results;
                return this.questions;
            } else {
                console.error(apiURL);
                throw new Error("There is a server issue!");
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    // TODO: Create buildApiUrl() method
    // Use URLSearchParams to build query string
    // Example result: "https://opentdb.com/api.php?amount=10&difficulty=easy"
    buildApiUrl() {
        return `https://opentdb.com/api.php?amount=${this.numberOfQuestions}&category=${this.category}&difficulty=${this.difficulty}`;
    }
    // TODO: Create incrementScore() method
    // Simply add 1 to this.score
    incrementScore() {
        ++this.score;
    }
    // TODO: Create getCurrentQuestion() method
    // Return this.questions[this.currentQuestionIndex]
    // Return null if index is out of bounds
    getCurrentQuestion() {
        if (!this.isComplete()) {
            return this.questions[this.currentQuestionIndex];
        } else {
            return null;
        }
    }
    // TODO: Create nextQuestion() method
    // Increment currentQuestionIndex
    // Return true if there are more questions
    // Return false if quiz is complete
    nextQuestion() {
        ++this.currentQuestionIndex;
        if (this.isComplete()) {
            return false;
        } else {
            return true;
        }
    }
    // TODO: Create isComplete() method
    // Return true if currentQuestionIndex >= questions.length
    isComplete() {
        if (this.currentQuestionIndex >= this.questions.length) {
            return true;
        } else {
            return false;
        }
    }
    // TODO: Create getScorePercentage() method
    // Calculate: (score / numberOfQuestions) * 100
    // Round to whole number using Math.round()
    getScorePercentage() {
        return Math.round((this.score / this.numberOfQuestions) * 100);
    }

    // TODO: Create saveHighScore() method
    // 1. Get existing high scores using getHighScores()
    // 2. Create new score object: { name, score, total, percentage, difficulty, date }
    // 3. Push to array
    // 4. Sort by percentage (highest first)
    // 5. Keep only top 10
    // 6. Save to localStorage using JSON.stringify()

    // scoresArray = getHighScores();
    saveHighScore() {
        let scoresArray = this.getHighScores();
        const scoreObj = {
            name: this.playerName,
            currentScore: this.getScorePercentage(),
        };
        scoresArray.push(scoreObj);
        scoresArray.sort((a, b) => b.currentScore - a.currentScore);
        scoresArray = scoresArray.slice(0, 10);
        localStorage.setItem("quizHighScores", JSON.stringify(scoresArray));
    }
    // TODO: Create getHighScores() method
    // 1. Get from localStorage using 'quizHighScores' key
    // 2. Parse JSON
    // 3. Return array (or empty array if nothing saved)
    // Wrap in try/catch for safety
    getHighScores() {
        try {
            return JSON.parse(localStorage.getItem("quizHighScores")) || [];
        } catch (error) {
            console.error("getHighScores error", error);
            return [];
        }
    }
    // TODO: Create isHighScore() method
    // Return true if:
    // - Less than 10 saved, OR
    // - Current percentage beats the lowest saved score
    isHighScore() {
        const scoresArray = this.getHighScores();
        if (
            scoresArray.length < 10 ||
            scoresArray[scoresArray.length - 1].currentScore <
                this.getScorePercentage()
        ) {
            return true;
        } else {
            return false;
        }
    }
    // TODO: Create endQuiz() method
    // 1. Calculate percentage
    // 2. Check if it's a high score
    // 3. If yes, save it (BEFORE getting high scores for display)
    // 4. Get high scores (AFTER saving)
    // 5. Return HTML string for results screen
    //    (See index.html for the HTML structure to use)
    endQuiz() {
        const currentScore = this.getScorePercentage();
        if (this.isHighScore()) {
            this.saveHighScore();
        }
        const scoresArray = this.getHighScores();
        let htmlMarkup = `
            <div class="game-card results-card">
                <h2 class="results-title">Quiz Complete!</h2>
                <p class="results-score-display">${this.score}/${
            this.numberOfQuestions
        }</p>
                <p class="results-percentage">${currentScore}% Accuracy</p>
                ${
                    this.isHighScore() ?
                    `
                    <div class="new-record-badge">
                    <i class="fa-solid fa-star"></i> New High Score!
                </div>
                    ` : ""
                }
                
                
                <div class="leaderboard">
                    <h4 class="leaderboard-title">
                    <i class="fa-solid fa-trophy"></i> Leaderboard
                    </h4>
                    <ul class="leaderboard-list">
        `;
        for (let i = 0; i < scoresArray.length; i++) {
            htmlMarkup += `
                <li class="leaderboard-item ${
                    i === 0
                        ? "gold"
                        : i === 1
                        ? "silver"
                        : i === 2
                        ? "bronze"
                        : ""
                }">
                    <span class="leaderboard-rank">#${i + 1}</span>
                    <span class="leaderboard-name">${scoresArray[i].name}</span>
                    <span class="leaderboard-score">${
                        scoresArray[i].currentScore
                    }%</span>
                </li>
            `;
        }
        htmlMarkup += `
                    </ul>
                </div>
                <div class="action-buttons">
                    <button class="btn-restart">
                    <i class="fa-solid fa-rotate-right"></i> Play Again
                    </button>
                </div>
            </div>
        `;
        return htmlMarkup;
    }
}
