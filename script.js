// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const questionCountSpan = document.getElementById('question-count');
const timerSpan = document.getElementById('timer');
const progressBar = document.getElementById('progress-bar');
const scoreSpan = document.getElementById('score');
const totalQuestionsSpan = document.getElementById('total-questions');
const correctAnswersSpan = document.getElementById('correct-answers');
const wrongAnswersSpan = document.getElementById('wrong-answers');
const resultTitle = document.getElementById('result-title');
const resultIcon = document.getElementById('result-icon');
const viewCorrectionsBtn = document.getElementById('view-corrections-btn');
const correctionsScreen = document.getElementById('corrections-screen');
const correctionsContainer = document.getElementById('corrections-container');
const backToResultsBtn = document.getElementById('back-to-results-btn');
const restartFromCorrectionsBtn = document.getElementById('restart-from-corrections-btn');

// Quiz State
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 15;
let timerInterval;
let userAnswers = new Array(quizData.length).fill(null); // Store user answers

// Constants
const TIME_PER_QUESTION = 15;

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
    saveAnswer();
    nextQuestion();
});
prevBtn.addEventListener('click', prevQuestion);
restartBtn.addEventListener('click', restartQuiz);
viewCorrectionsBtn.addEventListener('click', showCorrections);
backToResultsBtn.addEventListener('click', backToResults);
restartFromCorrectionsBtn.addEventListener('click', restartFromCorrections);

// Functions

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers.fill(null);

    startScreen.classList.add('hidden');
    startScreen.classList.remove('active');

    quizScreen.classList.remove('hidden');
    quizScreen.classList.add('active');

    loadQuestion();
}

function loadQuestion() {
    clearInterval(timerInterval);
    timeLeft = TIME_PER_QUESTION;
    timerSpan.textContent = timeLeft;
    startTimer();

    const currentQuestion = quizData[currentQuestionIndex];

    // Update UI
    questionText.textContent = currentQuestion.question;
    questionCountSpan.textContent = `Question ${currentQuestionIndex + 1}/${quizData.length}`;

    // Update Progress Bar
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;

    // Render Options
    optionsContainer.innerHTML = '';
    currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.onclick = () => selectOption(index);

        // Check if previously selected (for navigation)
        if (userAnswers[currentQuestionIndex] === index) {
            btn.classList.add('selected');
        }

        optionsContainer.appendChild(btn);
    });

    // Button States
    prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.textContent = 'Submit';
    } else {
        nextBtn.textContent = 'Next';
    }

    // Disable Next button initially if no answer selected
    // But if we are revisiting a question and it has an answer, enable it.
    if (userAnswers[currentQuestionIndex] === null) {
        nextBtn.disabled = true;
    } else {
        nextBtn.disabled = false;
    }
}

function selectOption(index) {
    // Update UI
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    buttons[index].classList.add('selected');

    // Enable Next Button
    nextBtn.disabled = false;

    // Save selection temporarily (committed on Next)
    userAnswers[currentQuestionIndex] = index;
}

function saveAnswer() {
    // Answer is already saved in userAnswers array during selection
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    // If time runs out, auto-select null (wrong) if nothing selected, or keep selected
    // Then move next
    if (userAnswers[currentQuestionIndex] === null) {
        // Mark as -1 or null to indicate no answer
        userAnswers[currentQuestionIndex] = -1;
    }
    nextQuestion();
}

function calculateScore() {
    score = 0;
    let correct = 0;
    let wrong = 0;

    userAnswers.forEach((answer, index) => {
        if (answer === quizData[index].answer) {
            score++;
            correct++;
        } else {
            wrong++;
        }
    });

    return { correct, wrong };
}

function showResults() {
    clearInterval(timerInterval);

    quizScreen.classList.add('hidden');
    quizScreen.classList.remove('active');

    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');

    const { correct, wrong } = calculateScore();

    scoreSpan.textContent = correct;
    totalQuestionsSpan.textContent = quizData.length;
    correctAnswersSpan.textContent = correct;
    wrongAnswersSpan.textContent = wrong;

    // Summary Message
    const percentage = (correct / quizData.length) * 100;
    if (percentage === 100) {
        resultTitle.textContent = "Excellent!";
        resultIcon.textContent = "🏆";
    } else if (percentage >= 60) {
        resultTitle.textContent = "Good Job!";
        resultIcon.textContent = "👏";
    } else {
        resultTitle.textContent = "Try Again!";
        resultIcon.textContent = "💪";
    }
}

function restartQuiz() {
    resultScreen.classList.add('hidden');
    resultScreen.classList.remove('active');

    startQuiz();
}

function showCorrections() {
    resultScreen.classList.add('hidden');
    resultScreen.classList.remove('active');

    correctionsScreen.classList.remove('hidden');
    correctionsScreen.classList.add('active');

    correctionsContainer.innerHTML = '';

    let wrongAnswersCount = 0;

    quizData.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const correctAnswerIndex = question.answer;

        if (userAnswerIndex !== correctAnswerIndex) {
            wrongAnswersCount++;

            const item = document.createElement('div');
            item.classList.add('correction-item');

            const questionTitle = document.createElement('div');
            questionTitle.classList.add('correction-question');
            questionTitle.textContent = `${index + 1}. ${question.question}`;

            const userAnswerDiv = document.createElement('div');
            userAnswerDiv.classList.add('answer-detail');

            const userAnswerLabel = document.createElement('span');
            userAnswerLabel.classList.add('answer-label');
            userAnswerLabel.textContent = 'Your Answer:';

            const userAnswerText = document.createElement('span');
            userAnswerText.classList.add('user-answer-text');
            if (userAnswerIndex === -1 || userAnswerIndex === null) {
                userAnswerText.textContent = 'Skipped / Time Out';
            } else {
                userAnswerText.textContent = question.options[userAnswerIndex];
            }

            userAnswerDiv.appendChild(userAnswerLabel);
            userAnswerDiv.appendChild(userAnswerText);

            const correctAnswerDiv = document.createElement('div');
            correctAnswerDiv.classList.add('answer-detail');

            const correctAnswerLabel = document.createElement('span');
            correctAnswerLabel.classList.add('answer-label');
            correctAnswerLabel.textContent = 'Correct Answer:';

            const correctAnswerText = document.createElement('span');
            correctAnswerText.classList.add('correct-answer-text');
            correctAnswerText.textContent = question.options[correctAnswerIndex];

            correctAnswerDiv.appendChild(correctAnswerLabel);
            correctAnswerDiv.appendChild(correctAnswerText);

            item.appendChild(questionTitle);
            item.appendChild(userAnswerDiv);
            item.appendChild(correctAnswerDiv);

            correctionsContainer.appendChild(item);
        }
    });

    if (wrongAnswersCount === 0) {
        correctionsContainer.innerHTML = '<p style="text-align:center; font-size: 1.2rem;">🎉 Perfect Score! No corrections needed.</p>';
    }
}

function backToResults() {
    correctionsScreen.classList.add('hidden');
    correctionsScreen.classList.remove('active');

    resultScreen.classList.remove('hidden');
    resultScreen.classList.add('active');
}

function restartFromCorrections() {
    correctionsScreen.classList.add('hidden');
    correctionsScreen.classList.remove('active');
    startQuiz();
}
