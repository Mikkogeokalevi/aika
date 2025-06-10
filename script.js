const allQuestions = [
    { question: "Mikä on Suomen pääkaupunki?", options: ["A. Tampere", "B. Helsinki", "C. Turku"], answer: "B", type: "multiple-choice", time: 10 },
    { question: "Paljonko on kaksi plus kaksi?", options: [], answer: "4", type: "text", time: 30 },
    { question: "Mikä on kuvassa näkyvä ruumiin osa?", image: "01.jpg", options: [], answer: "koira", type: "text", time: 30 },
    { question: "Mitä ovat kuvassa näkyvät rakennukset?", image: "02.jpg", options: ["A. mummonmökkejä", "B. luxus huviloita", "C. kerrostaloja"], answer: "A", type: "multiple-choice", time: 30 }
];

let questions = [];
let currentQuestionIndex = 0;
let timeLeft = 0;
let timer;
let mistakes = 0;
let keyDownListener = null;

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("gameContent").style.display = "block";
    selectRandomQuestions();
    loadQuestion();
});

function selectRandomQuestions() {
    questions = [...allQuestions].sort(() => 0.5 - Math.random());
}

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    const imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = "";

    if (question.image) {
        const img = document.createElement("img");
        img.src = question.image;
        img.alt = "Kysymyskuva";
        img.style.maxWidth = "100%";
        img.style.height = "auto";
        img.style.display = "block";
        img.style.margin = "0 auto";
        imageContainer.appendChild(img);
    }

    document.getElementById("question").textContent = question.question;
    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    const textAnswer = document.getElementById("textAnswer");
    const submitAnswer = document.getElementById("submitAnswer");

    if (keyDownListener) {
        document.removeEventListener('keydown', keyDownListener);
    }

    if (question.type === "multiple-choice") {
        textAnswer.style.display = "none";
        submitAnswer.style.display = "none";
        question.options.forEach(option => {
            const button = document.createElement("button");
            button.textContent = option;
            button.onclick = () => checkAnswer(option[0]);
            optionsContainer.appendChild(button);
        });

        keyDownListener = function(event) {
            const key = event.key.toLowerCase();
            if (['a', 'b', 'c'].includes(key)) {
                const optionIndex = key.charCodeAt(0) - 'a'.charCodeAt(0);
                if (optionIndex < question.options.length) {
                    checkAnswer(question.options[optionIndex][0]);
                }
            }
        };
        document.addEventListener('keydown', keyDownListener);
    } else {
        textAnswer.style.display = "block";
        textAnswer.value = "";
        textAnswer.focus();
        submitAnswer.style.display = "block";
        submitAnswer.onclick = () => checkAnswer(textAnswer.value);

        keyDownListener = function(event) {
            if (event.key === "Enter") {
                checkAnswer(textAnswer.value);
            }
        };
        document.addEventListener('keydown', keyDownListener);
    }

    timeLeft = question.time;
    document.getElementById("time").textContent = timeLeft;
    mistakes = 0;

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time").textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            resetGame();
        }
    }, 1000);
}

function checkAnswer(answer) {
    const question = questions[currentQuestionIndex];
    const userAnswer = typeof answer === 'string' ? answer.toLowerCase() : answer;
    const correctAnswer = typeof question.answer === 'string' ? question.answer.toLowerCase() : question.answer;

    if (userAnswer === correctAnswer) {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            clearInterval(timer);
            alert("Onneksi olkoon! Olet suorittanut kaikki kysymykset oikein. Salainen viesti: MaailmaOnKaunisPaikka");
            resetGame();
        }
    } else {
        mistakes++;
        if (mistakes >= 2) {
            alert("Olet vastannut väärin liian monta kertaa. Peli aloitetaan alusta.");
            resetGame();
        } else {
            alert("Väärin! Yritä uudelleen.");
        }
    }
}

function resetGame() {
    clearInterval(timer);
    if (keyDownListener) {
        document.removeEventListener('keydown', keyDownListener);
    }
    currentQuestionIndex = 0;
    document.getElementById("gameContent").style.display = "none";
    document.getElementById("startButton").style.display = "block";
}
