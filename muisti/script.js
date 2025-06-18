document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const levelDisplay = document.getElementById('level-display');
    const totalLevelsDisplay = document.getElementById('total-levels');
    const timerDisplay = document.getElementById('timer-display');
    const matchedPairsDisplay = document.getElementById('matched-pairs-display');
    const movesDisplay = document.getElementById('moves-display');
    const gameMessage = document.getElementById('game-message');
    const revealedSentencePart = document.getElementById('revealed-sentence-part');
    const hiddenSentenceFull = document.getElementById('hidden-sentence-full');
    const fullSentenceDisplay = document.getElementById('full-sentence-display');
    const restartButton = document.getElementById('restart-button');
    const bonusWordReveal = document.getElementById('bonus-word-reveal');
    const bonusWordDisplay = document.getElementById('bonus-word-display');
    const bonusSentenceDisplay = document.getElementById('bonus-sentence-display');
    const bonusSentenceIntro = document.querySelector('.bonus-sentence-intro');
    const finalPuzzleArea = document.getElementById('final-puzzle-area');
    const bonusSentenceInput = document.getElementById('bonus-sentence-input');
    const checkBonusSentenceButton = document.getElementById('check-bonus-sentence-button');
    const finalClueDisplay = document.getElementById('final-clue-display');

    // Power-up napit
    const powerUpRevealAllBtn = document.getElementById('power-up-reveal-all');
    const powerUpRevealPairBtn = document.getElementById('power-up-reveal-pair');
    const powerUpAddTimeBtn = document.getElementById('power-up-add-time');

    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer;
    let timeLeft;
    let currentLevel = 1;
    let gameActive = false; // Estää klikkaukset, kun peli ei ole aktiivinen
    let sentencePartsFound = [];
    let bonusWords = []; // Tallenna bonus sanat tähän
    let powerUpsUsed = {
        'reveal-all': false,
        'reveal-pair': false,
        'add-time': false
    };

    // Määritä tasot, korttien symbolit, parien määrä ja vihjesanat
    const levelConfigs = [
        { level: 1, pairs: 4, symbols: ['🌲', '🧭', '📍', '🔑'], hintPart: 'Piilotettu aarre on ' },
        { level: 2, pairs: 6, symbols: ['☀️', '🌧️', '⚡', '🌈', '🌙', '⭐'], hintPart: 'syvällä maan povessa,' },
        { level: 3, pairs: 8, symbols: ['🔥', '💧', '🌬️', '⛰️', '🌊', '🌾', '🌸', '🍂'], hintPart: 'jossa menneisyys kohtaa ' },
        { level: 4, pairs: 10, symbols: ['🦊', '🐻', '🦉', '🐺', '🦌', '🐇', '🐿️', '🦢', '🦅', '🐟'], hintPart: 'tulevaisuuden arvoituksen. ' },
        { level: 5, pairs: 12, symbols: ['🏰', '🗼', '🗽', '🗿', '⛩️', '🏟️', '🏛️', '⛪', '🕌', '🕍', '🌉', '🛕'], hintPart: 'Ratkaise palapeli, ' },
        { level: 6, pairs: 14, symbols: ['🚀', '🌌', '🌠', '🛰️', '👽', '🪐', '💫', '☄️', '🌑', '🌕', '🧑‍🚀', '✨', '🌍', '🧑‍🔬'], hintPart: 'niin kätkö aukeaa!' }
    ];

    const bonusWordList = [
        "koira", "kissa", "lintu", "puu", "talo", "auto", "kirja", "valo", "vesi", "tuli"
    ];

    const finalBonusSentence = "Kätkö löytyy sateenkaaripuun alta"; // Oikea bonuslause
    const finalClue = "Löydä paikka, jossa sateenkaari koskettaa maata, ja kätkö on sinun!";

    totalLevelsDisplay.textContent = levelConfigs.length;

    // Koodin sekoitusfunktio (Fisher-Yates)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Alusta peli tai taso
    function initializeGame(level = 1) {
        currentLevel = level;
        matchedPairs = 0;
        moves = 0;
        flippedCards = [];
        cards = [];
        sentencePartsFound = [];
        bonusWords = [];
        gameActive = false; // Estä klikkaukset alussa
        updateDisplay();
        stopTimer();
        gameMessage.textContent = 'Aloita peli klikkaamalla korttia!';
        
        // Piilota bonuslauseen syöttöalue ja viimeinen vihje uudelleenkäynnistyksessä
        hiddenSentenceFull.style.display = 'none';
        finalPuzzleArea.classList.add('hidden');
        finalClueDisplay.classList.add('hidden');
        restartButton.classList.add('hidden');
        bonusWordReveal.classList.add('hidden'); // Piilota bonus-sana näyttö

        // Palauta power-up napit aktiivisiksi
        powerUpRevealAllBtn.disabled = false;
        powerUpRevealPairBtn.disabled = false;
        powerUpAddTimeBtn.disabled = false;
        powerUpsUsed = { // Resetoi käytetyt power-upit
            'reveal-all': false,
            'reveal-pair': false,
            'add-time': false
        };

        createBoard();
        startTimer(level);
    }

    // Luo pelilauta
    function createBoard() {
        gameBoard.innerHTML = ''; // Tyhjennä vanha lauta
        const levelConfig = levelConfigs[currentLevel - 1];
        levelDisplay.textContent = currentLevel;

        let cardValues = [];
        // Lisää tason perusparit
        levelConfig.symbols.forEach(symbol => {
            cardValues.push(symbol, symbol);
        });

        // Lisää bonuskorttiparit mukaan, jos niitä ei ole käytetty
        if (!powerUpsUsed['reveal-all']) {
            cardValues.push('🔬', '🔬');
        }
        if (!powerUpsUsed['reveal-pair']) {
            cardValues.push('🗺️', '🗺️');
        }
        if (!powerUpsUsed['add-time']) {
            cardValues.push('⏱️', '⏱️');
        }
        
        cardValues = shuffle(cardValues); // Sekoita kortit

        gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(Math.sqrt(cardValues.length))}, 1fr)`; // Säädä ruudukkoa dynaamisesti

        cards = []; // Tyhjennä vanhat kortit

        cardValues.forEach((value, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value;
            card.dataset.index = index;

            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = '❓'; // Kortin kääntöpuoli (kysymysmerkki tai muu symboli)

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            cardBack.textContent = value; // Kortin etupuoli

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            gameBoard.appendChild(card);
            cards.push(card); // Tallenna korttielementit

            card.addEventListener('click', () => flipCard(card));
        });
        gameActive = true; // Salli klikkaukset, kun lauta on luotu
    }

    // Kortin kääntäminen
    function flipCard(card) {
        if (!gameActive || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return; // Estä klikkaukset, jos peli ei ole aktiivinen, kaksi korttia jo käännetty tai kortti on jo käännetty/löydetty
        }

        card.classList.add('flipped');
        flippedCards.push(card);
        moves++;
        updateDisplay();

        if (flippedCards.length === 2) {
            gameActive = false; // Estä lisäklikkaukset tarkistuksen ajaksi
            setTimeout(checkForMatch, 1000);
        }
    }

    // Tarkista, ovatko kortit pari
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const value1 = card1.dataset.value;
        const value2 = card2.dataset.value;

        if (value1 === value2) {
            // Pari löytyi
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;

            handleSpecialCard(value1); // Käsittele bonuskortit

            gameMessage.textContent = 'Pari löytyi!';

            // Varmista, että kortteja ei voi enää klikata, kun ne on löydetty
            card1.style.pointerEvents = 'none';
            card2.style.pointerEvents = 'none';

        } else {
            // Ei pari, käännä takaisin
            gameMessage.textContent = 'Ei osunut, yritä uudelleen.';
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 800);
        }

        flippedCards = []; // Tyhjennä käännetyt kortit
        gameActive = true; // Salli klikkaukset uudelleen

        // Tarkista, onko kaikki parit löydetty (sisältäen myös bonuskortit)
        if (matchedPairs * 2 === cards.length) { // KORJATTU EHTO
            stopTimer();
            if (currentLevel < levelConfigs.length) {
                gameMessage.textContent = `Taso ${currentLevel} läpäisty! Siirrytään seuraavalle...`;
                setTimeout(nextLevel, 2000);
            } else {
                gameMessage.textContent = 'Onneksi olkoon! Löysit kaikki kätköt!';
                showFinalClue();
            }
        }
        updateDisplay();
    }

    // Käsittele bonuskortit
    function handleSpecialCard(symbol) {
        switch (symbol) {
            case '🔬':
                // Paljasta kaikki kortit 5 sekunnin ajaksi
                activatePowerUp('🔬');
                break;
            case '🗺️':
                // Paljasta yksi pari
                activatePowerUp('🗺️');
                break;
            case '⏱️':
                // Lisää 30 sekuntia aikaa
                activatePowerUp('⏱️');
                break;
            default:
                // Normaali kortti, lisää vihjeosa ja bonus-sana
                const levelConfig = levelConfigs[currentLevel - 1];
                if (levelConfig.hintPart && !sentencePartsFound.includes(levelConfig.hintPart)) {
                    sentencePartsFound.push(levelConfig.hintPart);
                    revealedSentencePart.textContent = sentencePartsFound.join('');
                }

                // Lisää satunnainen bonus-sana
                if (bonusWords.length < bonusWordList.length) {
                    let randomBonusWord;
                    do {
                        randomBonusWord = bonusWordList[Math.floor(Math.random() * bonusWordList.length)];
                    } while (bonusWords.includes(randomBonusWord));
                    bonusWords.push(randomBonusWord);
                    bonusWordDisplay.textContent = bonusWords.join(', ');
                    bonusWordReveal.classList.remove('hidden');
                }
                break;
        }
    }

    // Aktivoi power-upit
    function activatePowerUp(type) {
        if (powerUpsUsed[type]) {
            return; // Estä uudelleenkäyttö
        }

        powerUpsUsed[type] = true;
        gameMessage.textContent = ''; // Tyhjennä edellinen viesti

        let buttonToDisable;
        if (type === '🔬') {
            buttonToDisable = powerUpRevealAllBtn;
            gameMessage.textContent = 'Kaikki kortit näkyviin 5 sekunnin ajaksi!';
            cards.forEach(card => card.classList.add('flipped'));
            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                });
                gameMessage.textContent = ''; // Tyhjennä viesti
            }, 5000);
        } else if (type === '🗺️') {
            buttonToDisable = powerUpRevealPairBtn;
            gameMessage.textContent = 'Paljastetaan yksi pari!';
            let found = false;
            // Etsi paljastamaton pari
            for (let i = 0; i < cards.length; i++) {
                const card1 = cards[i];
                if (!card1.classList.contains('matched') && !card1.classList.contains('flipped')) {
                    for (let j = i + 1; j < cards.length; j++) {
                        const card2 = cards[j];
                        if (!card2.classList.contains('matched') && !card2.classList.contains('flipped') && card1.dataset.value === card2.dataset.value) {
                            card1.classList.add('flipped', 'matched');
                            card2.classList.add('flipped', 'matched');
                            matchedPairs++;
                            // Käynnistä power-upin "normaali" kortin käsittely, jos se on vihjekortti
                            handleSpecialCard(card1.dataset.value);
                            card1.style.pointerEvents = 'none';
                            card2.style.pointerEvents = 'none';
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
            if (matchedPairs * 2 === cards.length) { // Tarkista, onko kaikki parit löydetty
                stopTimer();
                if (currentLevel < levelConfigs.length) {
                    gameMessage.textContent = `Taso ${currentLevel} läpäisty! Siirrytään seuraavalle...`;
                    setTimeout(nextLevel, 2000);
                } else {
                    gameMessage.textContent = 'Onneksi olkoon! Löysit kaikki kätköt!';
                    showFinalClue();
                }
            }
            updateDisplay();
        } else if (type === '⏱️') {
            buttonToDisable = powerUpAddTimeBtn;
            gameMessage.textContent = 'Lisäaikaa +30 sekuntia!';
            timeLeft += 30;
        }
        
        if (buttonToDisable) {
            buttonToDisable.disabled = true; // Estä napin käyttö
        }
    }

    // Ajastin
    function startTimer(level) {
        let initialTime;
        switch (level) {
            case 1: initialTime = 120; break; // 2 minuuttia
            case 2: initialTime = 180; break; // 3 minuuttia
            case 3: initialTime = 240; break; // 4 minuuttia
            case 4: initialTime = 300; break; // 5 minuuttia
            case 5: initialTime = 360; break; // 6 minuuttia
            case 6: initialTime = 420; break; // 7 minuuttia
            default: initialTime = 120; // Oletus
        }
        timeLeft = initialTime;
        updateTimerDisplay();

        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                gameActive = false;
                gameMessage.textContent = 'Aika loppui! Peli ohi.';
                restartButton.classList.remove('hidden');
                // Voit lisätä tähän myös "game over" näytön tai vastaavan
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timer);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Päivitä näyttö
    function updateDisplay() {
        matchedPairsDisplay.textContent = matchedPairs;
        movesDisplay.textContent = moves;
    }

    // Siirry seuraavalle tasolle
    function nextLevel() {
        stopTimer();
        currentLevel++;
        if (currentLevel <= levelConfigs.length) {
            initializeGame(currentLevel);
        } else {
            // Kaikki tasot läpäisty, näytä loppuvihje
            gameMessage.textContent = 'Onneksi olkoon! Olet läpäissyt kaikki tasot!';
            showFinalClue();
        }
    }

    // Näytä lopullinen vihje
    function showFinalClue() {
        hiddenSentenceFull.style.display = 'block'; // Näytä kokonaisvihje-alue
        fullSentenceDisplay.textContent = sentencePartsFound.join(''); // Näytä kerätty vihjelause

        if (bonusWords.length > 0) {
            bonusSentenceIntro.classList.remove('hidden');
            bonusSentenceDisplay.textContent = bonusWords.join(' '); // Näytä bonus-sanat välilyönnillä eroteltuna
            bonusSentenceDisplay.classList.remove('hidden');
        } else {
            bonusSentenceIntro.classList.add('hidden');
            bonusSentenceDisplay.classList.add('hidden');
        }

        finalPuzzleArea.classList.remove('hidden');
        restartButton.classList.remove('hidden'); // Näytä aloita uudelleen -nappi
    }

    // Tarkista bonuslause
    checkBonusSentenceButton.addEventListener('click', () => {
        const userInput = bonusSentenceInput.value.trim();
        if (userInput.toLowerCase() === finalBonusSentence.toLowerCase()) {
            finalClueDisplay.textContent = finalClue;
            finalClueDisplay.classList.remove('hidden');
            gameMessage.textContent = 'Oikein! Tässä on viimeinen vihje!';
            checkBonusSentenceButton.disabled = true; // Estä uudet tarkistukset
        } else {
            finalClueDisplay.textContent = 'Väärin, yritä uudelleen.';
            finalClueDisplay.classList.remove('hidden');
        }
    });

    // Aloita peli uudelleen
    restartButton.addEventListener('click', () => {
        initializeGame(1); // Aloita ensimmäisestä tasosta
    });

    // Lisää kuuntelijat power-up -napeille
    powerUpRevealAllBtn.addEventListener('click', () => activatePowerUp('🔬'));
    powerUpRevealPairBtn.addEventListener('click', () => activatePowerUp('🗺️'));
    powerUpAddTimeBtn.addEventListener('click', () => activatePowerUp('⏱️'));

    // Aloita peli ensimmäisellä tasolla, kun sivu latautuu
    initializeGame(1);
});
