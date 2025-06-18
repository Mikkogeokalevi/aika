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
    let timeLeft = 600; // 10 minuuttia (600 sekuntia) koko peliin
    let currentLevel = 1;
    let gameActive = false; // Estää klikkaukset, kun peli ei ole aktiivinen
    let timerStarted = false; // Uusi: Seuraa, onko ajastin käynnistetty
    let sentencePartsFound = [];
    let bonusWords = []; // Tallenna bonus sanat tähän
    let powerUpsUsed = {
        'reveal-all': false,
        'reveal-pair': false,
        'add-time': false
    };

    // Määritä tasot, korttien symbolit, parien määrä ja vihjesanat
    const levelConfigs = [
        { level: 1, pairs: 4, symbols: ['🌲', '🧭', '📍', '🔑'], hintPart: 'Piilotettu aarre on ' }, // 4 paria = 8 korttia
        { level: 2, pairs: 6, symbols: ['☀️', '🌧️', '⚡', '🌈', '🌙', '⭐'], hintPart: 'syvällä maan povessa,' }, // 6 paria = 12 korttia
        { level: 3, pairs: 8, symbols: ['🔥', '💧', '🌬️', '⛰️', '🌊', '🌾', '🌸', '🍂'], hintPart: 'jossa menneisyys kohtaa ' }, // 8 paria = 16 korttia
        { level: 4, pairs: 10, symbols: ['🦊', '🐻', '🦉', '🐺', '🦌', '🐇', '🐿️', '🦢', '🦅', '🐟'], hintPart: 'tulevaisuuden arvoituksen. ' }, // 10 paria = 20 korttia
        { level: 5, pairs: 12, symbols: ['🏰', '🗼', '🗽', '🗿', '⛩️', '🏟️', '🏛️', '⛪', '🕌', '🕍', '🌉', '🛕'], hintPart: 'Ratkaise palapeli, ' }, // 12 paria = 24 korttia
        { level: 6, pairs: 14, symbols: ['🚀', '🌌', '🌠', '🛰️', '👽', '🪐', '💫', '☄️', '🌑', '🌕', '🧑‍🚀', '✨', '🌍', '🧑‍🔬'], hintPart: 'niin kätkö aukeaa!' } // 14 paria = 28 korttia
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
        timerStarted = false; // Uusi: Resetoi ajastimen tila
        updateDisplay();
        stopTimer(); // Pysäytä vanha ajastin, jos se oli käynnissä
        gameMessage.textContent = 'Aloita peli klikkaamalla korttia!';
        
        // Piilota bonuslauseen syöttöalue ja viimeinen vihje uudelleenkäynnistyksessä
        hiddenSentenceFull.style.display = 'none';
        finalPuzzleArea.classList.add('hidden');
        finalClueDisplay.classList.add('hidden');
        restartButton.classList.add('hidden');
        bonusWordReveal.classList.add('hidden'); // Piilota bonus-sana näyttö

        // Palauta power-up napit aktiivisiksi ja resetoi käytetyt
        powerUpRevealAllBtn.disabled = false;
        powerUpRevealPairBtn.disabled = false;
        powerUpAddTimeBtn.disabled = false;
        
        // Resetoi power-upit ja ajastimen aika vain, jos peli aloitetaan kokonaan alusta (taso 1)
        if (level === 1) { 
            powerUpsUsed = {
                'reveal-all': false,
                'reveal-pair': false,
                'add-time': false
            };
            timeLeft = 600; // Resetoi ajastin vain, jos aloitetaan peli alusta
            updateTimerDisplay(); // Päivitä ajastinnäyttö heti
        }

        createBoard();
        // Ajastin käynnistetään nyt flipCard-funktiossa ensimmäisen klikkauksen yhteydessä
    }

    // Luo pelilauta
    function createBoard() {
        gameBoard.innerHTML = ''; // Tyhjennä vanha lauta
        const levelConfig = levelConfigs[currentLevel - 1];
        levelDisplay.textContent = currentLevel;

        let symbolsForCurrentLevel = [];
        let bonusCardsIncluded = 0;

        // Lisää bonuskorttien symbolit, jos niitä ei ole käytetty ja tilaa on
        // Huomaa: Nämä KORVAAVAT yhden tason perussymbolin paikan.
        // Nämä varmistavat, että total pairs pysyy levelConfig.pairs -määrässä.
        if (!powerUpsUsed['reveal-all']) {
            symbolsForCurrentLevel.push('🔬');
            bonusCardsIncluded++;
        }
        if (!powerUpsUsed['reveal-pair']) {
            symbolsForCurrentLevel.push('🗺️');
            bonusCardsIncluded++;
        }
        if (!powerUpsUsed['add-time']) {
            symbolsForCurrentLevel.push('⏱️');
            bonusCardsIncluded++;
        }

        // Täytä loput paikat tason perussymboleilla
        let normalSymbolsNeeded = levelConfig.pairs - bonusCardsIncluded;
        for (let i = 0; i < normalSymbolsNeeded; i++) {
            // Varmista, että indeksi ei mene yli levelConfig.symbols -taulukon pituuden
            // Käytä mod-operaattoria, jotta saadaan toistettua symboleita, jos normalSymbolsNeeded > levelConfig.symbols.length
            symbolsForCurrentLevel.push(levelConfig.symbols[i % levelConfig.symbols.length]);
        }
        
        // Nyt `symbolsForCurrentLevel` sisältää täsmälleen `levelConfig.pairs` kappaletta *uniikkeja* korttisymboleita,
        // joista jokaisesta tehdään pari. Bonus-kortit ovat mukana, jos ne ovat käytettävissä.

        // Luodaan varsinaiset parit
        let cardValues = [];
        symbolsForCurrentLevel.forEach(symbol => {
            cardValues.push(symbol, symbol);
        });

        cardValues = shuffle(cardValues); // Sekoita kortit
        
        // Aseta ruudukko dynaamisesti korttien määrän mukaan
        const numColumns = Math.ceil(Math.sqrt(cardValues.length));
        gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;

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

        // KÄYNNISTÄ AJASTIN TÄSSÄ, VAIN KERRAN ENSIMMÄISELLÄ KLIKKAUKSELLA
        if (!timerStarted) {
            startTimer();
            timerStarted = true;
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

            // Käsittele bonuskortit VAIN jos löydetty symboli on power-up
            handleSpecialCard(value1); // Käsittele bonuskortit, jos kyseessä on bonuskortti

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
        if (matchedPairs * 2 === cards.length) { // Tarkista, onko kaikki kortit käännetty
            stopTimer(); // Pysäytä ajastin hetkeksi tasonvaihdon ajaksi
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

    // Käsittele korttien löytyminen (lisää vihjeitä tai aktivoi power-upeja)
    function handleSpecialCard(symbol) {
        // Tarkista, onko löydetty symboli jokin power-up -korteista
        if (symbol === '🔬') {
            activatePowerUp('reveal-all');
        } else if (symbol === '🗺️') {
            activatePowerUp('reveal-pair');
        } else if (symbol === '⏱️') {
            activatePowerUp('add-time');
        } else {
            // Jos symboli EI ole power-up, se on normaali kortti
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
                } while (bonusWords.includes(randomBonusWord)); // Varmista, ettei sanaa ole jo lisätty
                bonusWords.push(randomBonusWord);
                bonusWordDisplay.textContent = bonusWords.join(', ');
                bonusWordReveal.classList.remove('hidden'); // Näytä bonus-sana näyttö
            }
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
        // Valitse oikea nappi tyypin perusteella ja poista se käytöstä
        if (type === 'reveal-all') {
            buttonToDisable = powerUpRevealAllBtn;
            gameMessage.textContent = 'Kaikki kortit näkyviin 5 sekunnin ajaksi!';
            cards.forEach(card => card.classList.add('flipped', 'no-click')); // no-click estää klikkaukset väliaikaisesti
            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                    card.classList.remove('no-click'); // Poista no-click
                });
                gameMessage.textContent = ''; // Tyhjennä viesti
            }, 5000);
        } else if (type === 'reveal-pair') {
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
                            matchedPairs++; // Lisää parin löytyminen
                            // ÄLÄ kutsu handleSpecialCardia tässä, jotta ei synny silmukkaa tai vahinkoaktivoitumista
                            card1.style.pointerEvents = 'none'; // Estä klikkaukset löydetyille korteille
                            card2.style.pointerEvents = 'none';
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
            // Tarkista, onko kaikki parit löydetty power-upin jälkeen
            if (matchedPairs * 2 === cards.length) {
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
        } else if (type === 'add-time') {
            buttonToDisable = powerUpAddTimeBtn;
            gameMessage.textContent = 'Lisäaikaa +30 sekuntia!';
            timeLeft += 30;
        }
        
        if (buttonToDisable) {
            buttonToDisable.disabled = true; // Estä napin käyttö
        }
    }

    // Ajastin
    function startTimer() { // Ei ota enää 'level' parametria
        updateTimerDisplay(); // Päivitä näyttö heti

        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                stopTimer();
                gameActive = false;
                gameMessage.textContent = 'Aika loppui! Peli ohi.';
                restartButton.classList.remove('hidden');
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
        // Nyt initializeGame() hoitaa kaiken tason vaihtoon liittyvän nollauksen.
        currentLevel++;
        if (currentLevel <= levelConfigs.length) {
            initializeGame(currentLevel); // Kutsu initializeGame, joka luo uuden laudan ja resetoi tason tilan
            // Ajastin jatkaa juoksemistaan, koska sitä ei stopattu tässä funktiossa
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
        initializeGame(1); // Aloita ensimmäisestä tasosta (nollaa kaiken, myös ajastimen)
        // startTimer() kutsutaan initializeGame-funktion sisällä, jos se alkaa tasolta 1
        // TAI, se alkaa kun ensimmäinen kortti klikataan
    });

    // Lisää kuuntelijat power-up -napeille
    powerUpRevealAllBtn.addEventListener('click', () => activatePowerUp('reveal-all'));
    powerUpRevealPairBtn.addEventListener('click', () => activatePowerUp('reveal-pair'));
    powerUpAddTimeBtn.addEventListener('click', () => activatePowerUp('add-time'));

    // Aloita peli ensimmäisellä tasolla, kun sivu latautuu
    initializeGame(1);
    // Ajastin käynnistyy nyt vasta ensimmäisen kortin klikkauksella flipCard-funktiossa
});
