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
    let timerStarted = false; // Seuraa, onko ajastin käynnistetty
    let sentencePartsFound = []; // Kerätyt vihjelauseen osat
    let bonusWords = []; // Kerätyt bonus-sanat (yksi per taso)
    let powerUpsUsed = { // Seuraa, onko power-up käytetty (kerran koko pelissä)
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
        "koira", "kissa", "lintu", "puu", "talo", "auto", "kirja", "valo", "vesi", "tuli", "aika", "peli", "koodi", "meri", "metsä"
    ]; 

    const finalBonusSentenceInput = "geokätköilyonraivostuttavanihanaharrastus";
    const finalClueText = "Lause meni oikein, hienoa! Tässä on sinulle chekkeriin kelpaava lause: geokätköilyonraivostuttavanihanaharrastus";

    totalLevelsDisplay.textContent = levelConfigs.length;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeGame(level = 1) {
        currentLevel = level;
        matchedPairs = 0;
        moves = 0;
        flippedCards = [];
        cards = [];
        gameActive = false; // Estä klikkaukset alussa
        timerStarted = false; // Resetoi ajastimen tila

        updateDisplay();
        stopTimer(); // Pysäytä vanha ajastin, jos se oli käynnissä
        gameMessage.textContent = 'Aloita peli klikkaamalla korttia!';
        
        hiddenSentenceFull.classList.add('hidden'); // Piilota koko bonuslauseen alue
        finalPuzzleArea.classList.add('hidden');
        finalClueDisplay.classList.add('hidden');
        restartButton.classList.add('hidden');
        bonusWordReveal.classList.add('hidden');

        // Resetoi power-upit ja ajastimen aika VAIN, jos peli aloitetaan kokonaan alusta (taso 1)
        if (level === 1) { 
            powerUpsUsed = {
                'reveal-all': false,
                'reveal-pair': false,
                'add-time': false
            };
            powerUpRevealAllBtn.disabled = false;
            powerUpRevealPairBtn.disabled = false;
            powerUpAddTimeBtn.disabled = false;

            timeLeft = 600; // Resetoi ajastin vain, jos aloitetaan peli alusta
            updateTimerDisplay(); // Päivitä ajastinnäyttö heti
            sentencePartsFound = [];
            bonusWords = [];
        } else {
            // Jos siirrytään seuraavalle tasolle, power-up -nappien tila säilyy
            powerUpRevealAllBtn.disabled = powerUpsUsed['reveal-all'];
            powerUpRevealPairBtn.disabled = powerUpsUsed['reveal-pair'];
            powerUpAddTimeBtn.disabled = powerUpsUsed['add-time'];
        }

        createBoard();
        // Ajastin käynnistetään nyt flipCard-funktiossa ensimmäisen kortin klikkauksen yhteydessä
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        const levelConfig = levelConfigs[currentLevel - 1];
        levelDisplay.textContent = currentLevel;

        let symbolsForCurrentLevel = [];
        for (let i = 0; i < levelConfig.pairs; i++) {
            symbolsForCurrentLevel.push(levelConfig.symbols[i % levelConfig.symbols.length]);
        }
        
        let cardValues = [];
        symbolsForCurrentLevel.forEach(symbol => {
            cardValues.push(symbol, symbol);
        });

        cardValues = shuffle(cardValues);
        
        // Emme enää tarvitse numColumns-laskentaa, koska CSS määrää 4 saraketta.
        // gameBoard.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`; 

        cards = [];

        cardValues.forEach((value, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.value = value;
            card.dataset.index = index;

            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = '❓';

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            cardBack.textContent = value;

            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            card.appendChild(cardInner);
            gameBoard.appendChild(card);
            cards.push(card);

            card.addEventListener('click', () => flipCard(card));
        });
        gameActive = true; // Peli aktivoituu, kun kortit on luotu
    }

    function flipCard(card) {
        if (!gameActive || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        if (!timerStarted) {
            startTimer();
            timerStarted = true;
        }

        card.classList.add('flipped');
        flippedCards.push(card);
        moves++;
        updateDisplay();

        if (flippedCards.length === 2) {
            gameActive = false; // Estä uudet klikkaukset tarkistuksen ajaksi
            setTimeout(checkForMatch, 1000);
        }
    }

    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const value1 = card1.dataset.value;
        const value2 = card2.dataset.value;

        if (value1 === value2) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            
            gameMessage.textContent = 'Pari löytyi!';

            card1.style.pointerEvents = 'none';
            card2.style.pointerEvents = 'none';

        } else {
            gameMessage.textContent = 'Ei osunut, yritä uudelleen.';
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 800);
        }

        flippedCards = [];
        gameActive = true; // Salli klikkaukset taas tarkistuksen jälkeen

        if (matchedPairs * 2 === cards.length) {
            stopTimer();
            
            const levelConfig = levelConfigs[currentLevel - 1];
            if (levelConfig.hintPart && !sentencePartsFound.includes(levelConfig.hintPart)) {
                sentencePartsFound.push(levelConfig.hintPart);
            }

            if (bonusWords.length < levelConfigs.length) {
                let randomBonusWord;
                do {
                    randomBonusWord = bonusWordList[Math.floor(Math.random() * bonusWordList.length)];
                } while (bonusWords.includes(randomBonusWord) && bonusWords.length < bonusWordList.length);
                
                if (!bonusWords.includes(randomBonusWord)) {
                    bonusWords.push(randomBonusWord);
                } else if (bonusWords.length < bonusWordList.length) {
                     for (let i = 0; i < bonusWordList.length; i++) {
                        const word = bonusWordList[i];
                        if (!bonusWords.includes(word)) {
                            bonusWords.push(word);
                            break;
                        }
                    }
                }
            }
            
            revealedSentencePart.textContent = sentencePartsFound.join('');
            bonusWordDisplay.textContent = bonusWords.join(' ');
            bonusWordReveal.classList.remove('hidden');

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

    function activatePowerUp(type) {
        if (powerUpsUsed[type]) {
            return;
        }

        powerUpsUsed[type] = true;
        gameMessage.textContent = '';

        let buttonToDisable;
        if (type === 'reveal-all') {
            buttonToDisable = powerUpRevealAllBtn;
            gameMessage.textContent = 'Kaikki kortit näkyviin 5 sekunnin ajaksi!';
            cards.forEach(card => card.classList.add('flipped', 'no-click'));
            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                    card.classList.remove('no-click');
                });
                gameMessage.textContent = '';
            }, 5000);
        } else if (type === 'reveal-pair') {
            buttonToDisable = powerUpRevealPairBtn;
            gameMessage.textContent = 'Paljastetaan yksi pari!';
            let found = false;
            for (let i = 0; i < cards.length; i++) {
                const card1 = cards[i];
                if (!card1.classList.contains('matched') && !card1.classList.contains('flipped')) {
                    for (let j = i + 1; j < cards.length; j++) {
                        const card2 = cards[j];
                        if (!card2.classList.contains('matched') && !card2.classList.contains('flipped') && card1.dataset.value === card2.dataset.value) {
                            card1.classList.add('flipped', 'matched');
                            card2.classList.add('flipped', 'matched');
                            matchedPairs++;
                            card1.style.pointerEvents = 'none';
                            card2.style.pointerEvents = 'none';
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
            if (matchedPairs * 2 === cards.length) {
                stopTimer();
                const levelConfig = levelConfigs[currentLevel - 1];
                if (levelConfig.hintPart && !sentencePartsFound.includes(levelConfig.hintPart)) {
                    sentencePartsFound.push(levelConfig.hintPart);
                }
                if (bonusWords.length < levelConfigs.length) {
                    let randomBonusWord;
                    do {
                        randomBonusWord = bonusWordList[Math.floor(Math.random() * bonusWordList.length)];
                    } while (bonusWords.includes(randomBonusWord) && bonusWords.length < bonusWordList.length);
                    if (!bonusWords.includes(randomBonusWord)) {
                        bonusWords.push(randomBonusWord);
                    } else if (bonusWords.length < bonusWordList.length) {
                         for (let i = 0; i < bonusWordList.length; i++) {
                            const word = bonusWordList[i];
                            if (!bonusWords.includes(word)) {
                                bonusWords.push(word);
                                break;
                            }
                        }
                    }
                }
                revealedSentencePart.textContent = sentencePartsFound.join('');
                bonusWordDisplay.textContent = bonusWords.join(' ');
                bonusWordReveal.classList.remove('hidden');

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
            buttonToDisable.disabled = true;
        }
    }

    function startTimer() {
        updateTimerDisplay();

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

    function updateDisplay() {
        matchedPairsDisplay.textContent = matchedPairs;
        movesDisplay.textContent = moves;
    }

    function nextLevel() {
        currentLevel++;
        if (currentLevel <= levelConfigs.length) {
            initializeGame(currentLevel); // Kutsu initializeGame, joka luo uuden laudan ja resetoi tason tilan
            gameActive = true; // Salli klikkaukset uudella tasolla
        } else {
            gameMessage.textContent = 'Onneksi olkoon! Olet läpäissyt kaikki tasot!';
            showFinalClue();
        }
    }

    function showFinalClue() {
        hiddenSentenceFull.classList.remove('hidden'); // Näytä kokonaisvihje-alue
        fullSentenceDisplay.textContent = sentencePartsFound.join('');

        if (bonusWords.length > 0) {
            bonusSentenceIntro.classList.remove('hidden');
            bonusWordDisplay.textContent = bonusWords.join(' ');
            bonusWordReveal.classList.remove('hidden');
        } else {
            bonusSentenceIntro.classList.add('hidden');
            bonusWordReveal.classList.add('hidden');
        }

        finalPuzzleArea.classList.remove('hidden');
        restartButton.classList.remove('hidden');
    }

    checkBonusSentenceButton.addEventListener('click', () => {
        const userInput = bonusSentenceInput.value.trim();
        if (userInput.toLowerCase() === finalBonusSentenceInput.toLowerCase()) {
            finalClueDisplay.textContent = finalClueText;
            finalClueDisplay.classList.remove('hidden');
            gameMessage.textContent = 'Oikein! Ratkaisit mysteerin!';
            checkBonusSentenceButton.disabled = true;
        } else {
            finalClueDisplay.textContent = 'Väärin, yritä uudelleen.';
            finalClueDisplay.classList.remove('hidden');
        }
    });

    restartButton.addEventListener('click', () => {
        initializeGame(1);
    });

    powerUpRevealAllBtn.addEventListener('click', () => activatePowerUp('reveal-all'));
    powerUpRevealPairBtn.addEventListener('click', () => activatePowerUp('reveal-pair'));
    powerUpAddTimeBtn.addEventListener('click', () => activatePowerUp('add-time'));

    initializeGame(1);
});
