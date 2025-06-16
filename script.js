const allQuestions = [
    { question: "Mikä on Suomen pääkaupunki?", options: ["A. Tampere", "B. Helsinki", "C. Turku"], answer: "B", type: "multiple-choice", time: 5 },
    { question: "Paljonko on kaksi plus kaksi?", options: [], answer: "4", type: "text", time: 5 },
    { question: "Mikä on kuvassa näkyvä ruumiin osa?", image: "01.jpg", options: [], answer: "jalka", type: "text", time: 30 },
    { question: "Mitä ovat kuvassa näkyvät rakennukset?", image: "02.jpg", options: ["A. mummonmökkejä", "B. luxus huviloita", "C. kerrostaloja"], answer: "A", type: "multiple-choice", time: 5 },
   { question: "Mikä on maailman syvin järvi?", options: ["A. Kaspianmeri", "B. Tanganjikajärvi", "C. Baikaljärvi"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Minkä värinen on kirahvin kieli?", options: ["A. Punainen", "B. Musta", "C. Vaaleanpunainen"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on Australian pääkaupunki?", options: ["A. Sydney", "B. Canberra", "C. Melbourne"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuinka monta valtamerta maapallolla on virallisen luokituksen mukaan?", options: ["A. 3", "B. 7", "C. 5"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mitä kaasua kasvit pääasiassa käyttävät yhteyttämiseen?", options: ["A. Happi", "B. Hiilidioksidi", "C. Typpi"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Minä vuonna Titanic upposi?", options: ["A. 1907", "B. 1912", "C. 1921"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuka oli Rooman ensimmäinen keisari?", options: ["A. Julius Caesar", "B. Nero", "C. Augustus"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä oli ensimmäinen maa, joka lähetti ihmisen avaruuteen?", options: ["A. Yhdysvallat", "B. Kiina", "C. Neuvostoliitto"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka kirjoitti 'Seitsemän veljestä'?", options: ["A. Elias Lönnrot", "B. Aleksis Kivi", "C. J.L. Runeberg"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Minkä sodan aikana tapahtui Dunkerquen evakuointi?", options: ["A. Ensimmäinen maailmansota", "B. Toinen maailmansota", "C. Vietnamin sota"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on veden kemiallinen kaava?", options: ["A. CO2", "B. H2O", "C. O2"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuka keksi toimivan hehkulampun?", options: ["A. Alexander Graham Bell", "B. Nikola Tesla", "C. Thomas Edison"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä planeetta on tunnettu suuresta punaisesta pilkustaan?", options: ["A. Mars", "B. Saturnus", "C. Jupiter"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä on ihmisen suurin elin?", options: ["A. Maksa", "B. Iho", "C. Aivot"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä fysiikan laki selittää, miksi esineet pysyvät liikkeessä tai levossa?", options: ["A. Painovoimalaki", "B. Suhteellisuusteoria", "C. Newtonin ensimmäinen laki"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka maalasi Mona Lisan?", options: ["A. Vincent van Gogh", "B. Leonardo da Vinci", "C. Pablo Picasso"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on kaikkien aikojen myydyin videopeli?", options: ["A. Tetris", "B. Minecraft", "C. Grand Theft Auto V"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Missä elokuvassa kuullaan lause 'May the Force be with you'?", options: ["A. Taru sormusten herrasta", "B. Tähtien sota", "C. Harry Potter"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuka on 'The Beatles' -yhtyeen rumpali?", options: ["A. John Lennon", "B. Paul McCartney", "C. Ringo Starr"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä soitin on pääosassa Antonio Vivaldin teoksessa 'Neljä vuodenaikaa'?", options: ["A. Viulu", "B. Piano", "C. Kitara"], answer: "A", type: "multiple-choice", time: 5 },
  { question: "Kuinka monta rengasta on olympialipussa?", options: ["A. 4", "B. 5", "C. 6"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä maa voitti jalkapallon ensimmäiset maailmanmestaruuskilpailut vuonna 1930?", options: ["A. Brasilia", "B. Uruguay", "C. Argentiina"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on pisin virallinen juoksumatka kesäolympialaisissa?", options: ["A. 10 000 metriä", "B. Maraton", "C. 50 km kävely"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuka suomalainen on voittanut eniten olympiakultamitaleja?", options: ["A. Matti Nykänen", "B. Lasse Virén", "C. Paavo Nurmi"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mitä tarkoittaa lyhenne 'NBA' urheilussa?", options: ["A. National Boxing Association", "B. National Badminton Association", "C. National Basketball Association"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mistä alkuaineesta timantit pääasiassa koostuvat?", options: ["A. Pii", "B. Hiili", "C. Kulta"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Kuinka monta näppäintä on tavallisessa pianossa?", options: ["A. 76", "B. 88", "C. 92"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on shakin arvokkain nappula, jonka menettäminen lopettaa pelin?", options: ["A. Kuningatar", "B. Torni", "C. Kuningas"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mistä maasta paella-ruokalaji on kotoisin?", options: ["A. Italia", "B. Espanja", "C. Portugali"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Minkä värin saat, kun sekoitat sinistä ja keltaista?", options: ["A. Punainen", "B. Vihreä", "C. Oranssi"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on ihmisen pisin luu?", options: ["A. Sääriluu", "B. Olkaluu", "C. Reisiluu"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka ohjasi vuoden 1997 menestyselokuvan 'Titanic'?", options: ["A. Steven Spielberg", "B. James Cameron", "C. George Lucas"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitä japanilainen sana 'sushi' alun perin tarkoitti?", options: ["A. Raakaa kalaa", "B. Etikoitua riisiä", "C. Merilevää"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on Ruotsin valuutta?", options: ["A. Euro", "B. Norjan kruunu", "C. Ruotsin kruunu"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Montako pistettä on täydellinen, puhdas sarja keilailussa?", options: ["A. 100", "B. 200", "C. 300"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Minkä yhtyeen laulaja oli Freddie Mercury?", options: ["A. The Rolling Stones", "B. Queen", "C. Led Zeppelin"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on maailman suurin aavikko (polaariset aavikot mukaan lukien)?", options: ["A. Sahara", "B. Gobi", "C. Etelämanner"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka kirjoitti 'Harry Potter' -kirjasarjan?", options: ["A. J.R.R. Tolkien", "B. J.K. Rowling", "C. C.S. Lewis"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on Suomen kansallislintu?", options: ["A. Laulujoutsen", "B. Varis", "C. Merikotka"], answer: "A", type: "multiple-choice", time: 5 },
  { question: "Mikä metalli on nestemäistä huoneenlämmössä?", options: ["A. Lyijy", "B. Elohopea", "C. Tina"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Monesko päivä joulukuuta on Suomen itsenäisyyspäivä?", options: ["A. 24.", "B. 6.", "C. 31."], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mistä maasta löytyvät Gizan pyramidit?", options: ["A. Kreikka", "B. Turkki", "C. Egypti"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä on auringosta laskettuna kolmas planeetta?", options: ["A. Venus", "B. Maa", "C. Mars"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitkä ovat Aku Ankan kolmen veljenpojan nimet suomeksi?", options: ["A. Tiku, Taku ja Touho", "B. Tupu, Hupu ja Lupu", "C. Riku, Roope ja Rami"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitä lajia Michael Jordan pelasi ammatikseen?", options: ["A. Jalkapallo", "B. Koripallo", "C. Jääkiekko"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mistä kielestä sana 'sauna' on levinnyt maailmalle?", options: ["A. Ruotsi", "B. Venäjä", "C. Suomi"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä yritys kehitti ensimmäisen iPhonen?", options: ["A. Samsung", "B. Google", "C. Apple"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka on nykyinen Suomen tasavallan presidentti?", options: ["A. Sauli Niinistö", "B. Alexander Stubb", "C. Tarja Halonen"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on maailman korkein rakennus (vuoden 2024 tiedon mukaan)?", options: ["A. Shanghai Tower", "B. Burj Khalifa", "C. Merdeka 118"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitä 'www' tarkoittaa internet-osoitteen alussa?", options: ["A. Wide World Web", "B. World Web Wide", "C. World Wide Web"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka sävelsi 'Finlandia'-hymnin?", options: ["A. Jean Sibelius", "B. Oskar Merikanto", "C. Fredrik Pacius"], answer: "A", type: "multiple-choice", time: 5 },
  { question: "Mistä maasta Lego-palikat ovat peräisin?", options: ["A. Ruotsi", "B. Tanska", "C. Saksa"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Miten pH-arvot luokitellaan?", options: ["A. Hapan < 7, neutraali = 7, emäksinen > 7", "B. Hapan > 7, neutraali = 7, emäksinen < 7", "C. Hapan = 7, neutraali < 7, emäksinen > 7"], answer: "A", type: "multiple-choice", time: 5 },
  { question: "Mikä on Italian pääkaupunki?", options: ["A. Milano", "B. Rooma", "C. Venetsia"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitä eläintä pidetään 'viidakon kuninkaana'?", options: ["A. Tiikeri", "B. Leijona", "C. Gorilla"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mitä mittayksikköä käytetään mittaamaan sähkövastusta?", options: ["A. Voltti", "B. Ampeeri", "C. Ohmi"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Mikä on Välimeren suurin saari?", options: ["A. Sardinia", "B. Kypros", "C. Sisilia"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Kuka näytteli pääosaa 'Forrest Gump' -elokuvassa?", options: ["A. Brad Pitt", "B. Tom Hanks", "C. Leonardo DiCaprio"], answer: "B", type: "multiple-choice", time: 5 },
  { question: "Mikä on Espanjan kansallistanssi?", options: ["A. Tango", "B. Valssi", "C. Flamenco"], answer: "C", type: "multiple-choice", time: 5 },
  { question: "Montako pelaajaa on kentällä per joukkue jääkiekko-ottelun alkaessa?", options: ["A. 5", "B. 6", "C. 7"], answer: "B", type: "multiple-choice", time: 5 },
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
