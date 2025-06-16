const allQuestions = [
    { question: "Mikä on Suomen pääkaupunki?", options: ["A. Tampere", "B. Helsinki", "C. Turku"], answer: "B", type: "multiple-choice", time: 10 },
    { question: "Paljonko on kaksi plus kaksi?", options: [], answer: "4", type: "text", time: 30 },
    { question: "Mikä on kuvassa näkyvä ruumiin osa?", image: "01.jpg", options: [], answer: "jalka", type: "text", time: 30 },
    { question: "Mitä ovat kuvassa näkyvät rakennukset?", image: "02.jpg", options: ["A. mummonmökkejä", "B. luxus huviloita", "C. kerrostaloja"], answer: "A", type: "multiple-choice", time: 30 },
    { question: "Mikä on maailman syvin järvi?", options: ["A. Kaspianmeri", "B. Tanganjikajärvi", "C. Baikaljärvi"], answer: "C", type: "multiple-choice", time: 15 },
    { question: "Minkä värinen on kirahvin kieli?", options: [], answer: "Musta", type: "text", time: 20 },
    { question: "Mikä on Australian pääkaupunki?", options: ["A. Sydney", "B. Canberra", "C. Melbourne"], answer: "B", type: "multiple-choice", time: 15 },
    { question: "Kuinka monta valtamerta maapallolla on virallisen luokituksen mukaan?", options: [], answer: "5", type: "text", time: 20 },
    { question: "Mitä kaasua kasvit pääasiassa käyttävät yhteyttämiseen?", options: ["A. Happi", "B. Hiilidioksidi", "C. Typpi"], answer: "B", type: "multiple-choice", time: 15 },
    { question: "Minä vuonna Titanic upposi?", options: [], answer: "1912", type: "text", time: 15 },
    { question: "Kuka oli Rooman ensimmäinen keisari?", options: ["A. Julius Caesar", "B. Nero", "C. Augustus"], answer: "C", type: "multiple-choice", time: 20 },
    { question: "Mikä oli ensimmäinen maa, joka lähetti ihmisen avaruuteen?", options: [], answer: "Neuvostoliitto", type: "text", time: 20 },
    { question: "Kuka kirjoitti 'Seitsemän veljestä'?", options: ["A. Elias Lönnrot", "B. Aleksis Kivi", "C. J.L. Runeberg"], answer: "B", type: "multiple-choice", time: 10 },
    { question: "Minkä sodan aikana tapahtui Dunkerquen evakuointi?", options: [], answer: "Toinen maailmansota", type: "text", time: 25 },
    { question: "Mikä on veden kemiallinen kaava?", options: [], answer: "H2O", type: "text", time: 10 },
    { question: "Kuka keksi toimivan hehkulampun?", options: ["A. Alexander Graham Bell", "B. Nikola Tesla", "C. Thomas Edison"], answer: "C", type: "multiple-choice", time: 15 },
    { question: "Mikä planeetta on tunnettu suuresta punaisesta pilkustaan?", options: [], answer: "Jupiter", type: "text", time: 15 },
    { question: "Mikä on ihmisen suurin elin?", options: ["A. Maksa", "B. Iho", "C. Aivot"], answer: "B", type: "multiple-choice", time: 15 },
    { question: "Mikä fysiikan laki selittää, miksi esineet pysyvät liikkeessä tai levossa?", options: [], answer: "Newtonin ensimmäinen laki", type: "text", time: 30 },
    { question: "Kuka maalasi Mona Lisan?", options: ["A. Vincent van Gogh", "B. Leonardo da Vinci", "C. Pablo Picasso"], answer: "B", type: "multiple-choice", time: 10 },
    { question: "Mikä on kaikkien aikojen myydyin videopeli?", options: [], answer: "Minecraft", type: "text", time: 20 },
    { question: "Missä elokuvassa kuullaan lause 'May the Force be with you'?", options: ["A. Taru sormusten herrasta", "B. Tähtien sota", "C. Harry Potter"], answer: "B", type: "multiple-choice", time: 10 },
    { question: "Kuka on 'The Beatles' -yhtyeen rumpali?", options: [], answer: "Ringo Starr", type: "text", time: 20 },
    { question: "Mikä soitin on pääosassa Antonio Vivaldin teoksessa 'Neljä vuodenaikaa'?", options: ["A. Viulu", "B. Piano", "C. Kitara"], answer: "A", type: "multiple-choice", time: 20 },
    { question: "Kuinka monta rengasta on olympialipussa?", options: [], answer: "5", type: "text", time: 10 },
    { question: "Mikä maa voitti jalkapallon ensimmäiset maailmanmestaruuskilpailut vuonna 1930?", options: ["A. Brasilia", "B. Uruguay", "C. Argentiina"], answer: "B", type: "multiple-choice", time: 25 },
    { question: "Mikä on pisin virallinen juoksumatka kesäolympialaisissa?", options: [], answer: "Maraton", type: "text", time: 15 },
    { question: "Kuka suomalainen on voittanut eniten olympiakultamitaleja?", options: ["A. Matti Nykänen", "B. Lasse Virén", "C. Paavo Nurmi"], answer: "C", type: "multiple-choice", time: 20 },
    { question: "Mitä tarkoittaa lyhenne 'NBA' urheilussa?", options: [], answer: "National Basketball Association", type: "text", time: 25 },
    { question: "Mistä alkuaineesta timantit pääasiassa koostuvat?", options: ["A. Pii", "B. Hiili", "C. Kulta"], answer: "B", type: "multiple-choice", time: 15 },
    { question: "Kuinka monta näppäintä on tavallisessa pianossa?", options: [], answer: "88", type: "text", time: 20 },
    { question: "Mikä on shakin arvokkain nappula, jonka menettäminen lopettaa pelin?", options: ["A. Kuningatar", "B. Torni", "C. Kuningas"], answer: "C", type: "multiple-choice", time: 15 },
    { question: "Mistä maasta paella-ruokalaji on kotoisin?", options: [], answer: "Espanja", type: "text", time: 10 },
    { question: "Minkä värin saat, kun sekoitat sinistä ja keltaista?", options: ["A. Punainen", "B. Vihreä", "C. Oranssi"], answer: "B", type: "multiple-choice", time: 10 },


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
