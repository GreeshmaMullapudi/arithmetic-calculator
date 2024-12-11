// Generate arithmetic questions
function generateQuestions(num, range, operations) {
    const questions = [];
    for (let i = 0; i < num; i++) {
        const num1 = Math.floor(Math.random() * range) + 1;
        const num2 = Math.floor(Math.random() * range) + 1;
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let text, correctAnswer;

        switch (operation) {
            case "add":
                text = `${num1} + ${num2}`;
                correctAnswer = num1 + num2;
                break;
            case "subtract":
                text = `${num1} - ${num2}`;
                correctAnswer = num1 - num2;
                break;
            case "multiply":
                text = `${num1} × ${num2}`;
                correctAnswer = num1 * num2;
                break;
            case "divide":
                if (num2 === 0) num2 = 1; // Prevent division by zero
                text = `${num1} ÷ ${num2}`;
                correctAnswer = Math.floor(num1 / num2);
                break;
            case "Algebra":
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                const c = Math.floor(Math.random() * 10) + 1;
                text = `${a}x + ${b} = ${c}`;
                correctAnswer = (c - b) / a;
                break;
            case "wordProblem":
                const personNames = ["Alice", "Bob", "Charlie", "Dana"];
                const objects = ["apples", "oranges", "books", "candies"];
                const name = personNames[Math.floor(Math.random() * personNames.length)];
                const object = objects[Math.floor(Math.random() * objects.length)];
                const total = num1 + num2;
                text = `${name} has ${num1} ${object}, and they get ${num2} more. How many ${object} do they have in total?`;
                correctAnswer = total;
                break;
            default:
                text = "Unsupported operation";
                correctAnswer = null;
        }

        questions.push({ text, correctAnswer });
    }
    return questions;
}

// Quiz flow
let currentQuestionIndex = 0;
let questions = [];
let userAnswers = [];
let correctAnswersCount = 0;
let incorrectAnswersCount = 0;

function startQuiz(event) {
    event.preventDefault(); // Prevent form submission reload

    const numQuestions = parseInt(document.getElementById("numQuestions").value) || 5;
    const range = parseInt(document.getElementById("range").value) || 10;
    const operations = Array.from(document.querySelectorAll("input[name='operation']:checked"), el => el.value);
    const timerValue = parseInt(document.getElementById("timer").value) || 30;

    if (operations.length === 0) {
        alert("Please select at least one operation.");
        return;
    }

    questions = generateQuestions(numQuestions, range, operations);

    currentQuestionIndex = 0;
    userAnswers = [];

    document.getElementById("settings").classList.add("hidden"); // Hide settings section
    document.getElementById("quiz-container").classList.remove("hidden"); // Show quiz section
    displayQuestion();

    if (timerValue > 0) {
        let timeLeft = timerValue;
        const timerElement = document.getElementById("timer-display");
        timerElement.textContent = `Time left: ${timeLeft}s`;

        const timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Time left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endQuiz();
            }
        }, 1000);
    }
}

function restartQuiz() {
    // Reset and show settings
    document.getElementById("result").classList.add("hidden");
    document.getElementById("settings").classList.remove("hidden");
}

function displayQuestion() {
    const questionElement = document.getElementById("question");
    questionElement.textContent = questions[currentQuestionIndex].text;

    const answerInput = document.getElementById("answer");
    answerInput.value = "";
    answerInput.focus();
}

function nextQuestion() {
    const userAnswer = document.getElementById("answer").value;
    userAnswers.push(userAnswer ? parseFloat(userAnswer) : null);

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        displayQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById("quiz-container").classList.add("hidden"); // Hide quiz section
    const resultsContainer = document.getElementById("results");
    resultsContainer.classList.remove("hidden"); // Show results section

    resultsContainer.innerHTML = "<h3>Results</h3>";
    const list = document.createElement("ul");

    questions.forEach((question, index) => {
        const listItem = document.createElement("li");
        const isCorrect = userAnswers[index] === question.correctAnswer;

        listItem.textContent = `${question.text} Your answer: ${userAnswers[index] || "N/A"}. Correct answer: ${question.correctAnswer}`;
        listItem.style.color = isCorrect ? "green" : "red";

        list.appendChild(listItem);
    });

    resultsContainer.appendChild(list);
    calculateResults();
    const percentageScore = ((correctAnswersCount / questions.length) * 100).toFixed(2);
    document.getElementById("score").textContent =
        `You got ${correctAnswersCount} /${questions.length} correct. (${percentageScore}%)`;
    generateResultChart();

    // Optionally show time taken
    document.getElementById("time-taken").textContent = "Quiz completed!";
}

function calculateResults() {
    correctAnswersCount = userAnswers.filter((ans, index) => ans === questions[index].correctAnswer).length;
    incorrectAnswersCount = questions.length - correctAnswersCount;
}

function generateResultChart() {
    const ctx = document.getElementById("result-graph").getContext("2d");

    // Create a new chart
    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Correct", "Incorrect"],
            datasets: [{
                label: "Results",
                data: [correctAnswersCount, incorrectAnswersCount],
                backgroundColor: ["#28a745", "#dc3545"],
                borderColor: ["#155724", "#721c24"],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = correctAnswersCount + incorrectAnswersCount;
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
        }
    });
}

function displayAnswers() {
    const answersList = document.getElementById("correct-answers");
    answersList.innerHTML = "";
    answersList.classList.remove("hidden");

    questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        const listItem = document.createElement("li");
        listItem.style.color = isCorrect ? "green" : "red";
        listItem.innerHTML = `Question: ${question.text} <br>
                              Your Answer: ${userAnswer ?? "No answer"}<br>
                              Correct Answer: ${question.correctAnswer}`;
        answersList.appendChild(listItem);
    });
}

// Event listeners
document.getElementById("settings-form").addEventListener("submit", startQuiz);
document.getElementById("next-question").addEventListener("click", nextQuestion);
