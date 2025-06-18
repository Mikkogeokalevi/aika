document.addEventListener('DOMContentLoaded', () => {
    // Perus-elementit
    const gameBoard = document.getElementById('game-board');
    const levelDisplay = document.getElementById('level-display');
    const totalLevelsDisplay = document.getElementById('total-levels');
    const timerDisplay = document.getElementById('timer-display');
    const matchedPairsDisplay = document.getElementById('matched-pairs-display');
    const movesDisplay = document.getElementById('moves-display');
    const gameMessage = document.getElementById('game-message');
    const restartButton = document.getElementById('restart-button');

    // Lopputehtävän elementit
    const finalPuzzleContainer = document.getElementById('final-puzzle-container');
    const finalPuzzleArea = document.getElementById('final-puzzle-area');
    const bonusSentenceInput = document.getElementById('bonus-sentence-input');
    const checkBonusSentenceButton = document.getElementById('check-bonus-sentence-button');
    const finalClueDisplay = document.getElementById('final-clue-display');

    // Power-up napit
    const powerUpRevealAllBtn = document.getElementById('power-up-reveal-all');
    const powerUpRevealPairBtn = document.getElementById('power-up-reveal-pair');
    const powerUpAddTimeBtn = document.getElementById('power-up-add-time');

    // Pelin tilamuuttujat
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let timer;
    let timeLeft = 600; // 10 minuuttia
    let currentLevel = 1;
    let gameActive = false;
    let timerStarted = false;
    let collectedBonusWords = [];
    let powerUpsUsed = {};

    // Määritä tasot, korttien symbolit ja bonussanat
    const levelConfigs = [
        { level: 1, pairs: 4, symbols: ['🌲', '🧭', '📍', '🔑'], bonusWord: 'koira' },
        { level: 2, pairs: 6, symbols: ['☀️', '🌧️', '⚡', '🌈', '🌙', '⭐'], bonusWord: 'kissa' },
        { level: 3, pairs: 8, symbols: ['🔥', '💧', '🌬️', '⛰️', '🌊', '🌾', '🌸', '🍂'], bonusWord: 'lintu' },
        { level: 4, pairs: 10, symbols: ['🦊', '🐻', '🦉', '🐺', '🦌', '🐇', '🐿️', '🦢', '🦅', '🐟'], bonusWord: 'puu' },
        { level: 5, pairs: 12, symbols: ['🏰', '🗼', '🗽', '🗿', '⛩️', '🏟️', '🏛️', '⛪', '🕌', '🕍', '🌉', '🛕'], bonusWord: 'talo' },
        { level: 6, pairs: 14, symbols: ['🚀', '🌌', '🌠', '🛰️', '👽', '🪐', '💫', '☄️', '🌑', '🌕', '🧑‍🚀', '✨', '🌍', '🧑‍🔬'], bonusWord: 'auto' }
    ];

    // Muodosta oikea vastauslause ja loppuvihje dynaamisesti
    const finalBonusSentence = levelConfigs.map(config => config.bonusWord).join(' ');
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
        gameActive = false;

        updateDisplay();
        gameMessage.textContent = 'Aloita peli klikkaamalla korttia!';
        
        finalPuzzleContainer.classList.add('hidden');
        finalPuzzleArea.classList.remove('hidden');
        finalClueDisplay.classList.add('hidden');
        restartButton.classList.add('hidden');
        bonusSentenceInput.value = '';
        checkBonusSentenceButton.disabled = false;

        if (level === 1) { 
            powerUpsUsed = { 'reveal-all': false, 'reveal-pair': false, 'add-time': false };
            powerUpRevealAllBtn.disabled = false;
            powerUpRevealPairBtn.disabled = false;
            powerUpAddTimeBtn.disabled = false;

            timeLeft = 600;
            timerStarted = false;
            stopTimer();
            updateTimerDisplay();
            collectedBonusWords = [];
        } else {
            powerUpRevealAllBtn.disabled = powerUpsUsed['reveal-all'];
            powerUpRevealPairBtn.disabled = powerUpsUsed['reveal-pair'];
            powerUpAddTimeBtn.disabled = powerUpsUsed['add-time'];
        }

        createBoard();
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        const levelConfig = levelConfigs[currentLevel - 1];
        levelDisplay.textContent = currentLevel;
        
        let cardValues = [];
        levelConfig.symbols.forEach(symbol => {
            cardValues.push(symbol, symbol);
        });

        cardValues = shuffle(cardValues);
        
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
        gameActive = true;
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
            gameActive = false;
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
        gameActive = true;

        if (matchedPairs * 2 === cards.length) {
            const levelConfig = levelConfigs[currentLevel - 1];
            const bonusWord = levelConfig.bonusWord;
            collectedBonusWords.push(bonusWord);

            if (currentLevel < levelConfigs.length) {
                gameMessage.textContent = `Taso ${currentLevel} läpäisty! Bonussana: ${bonusWord}`;
                setTimeout(nextLevel, 3000); // Näytä sana 3 sekuntia
            } else {
                gameMessage.textContent = 'Onneksi olkoon! Löysit kaikki kätköt!';
                showFinalClue();
            }
        }
        updateDisplay();
    }

    function activatePowerUp(type) {
        if (powerUpsUsed[type]) return;
        powerUpsUsed[type] = true;
        gameMessage.textContent = '';
        let buttonToDisable;

        if (type === 'reveal-all') {
            buttonToDisable = powerUpRevealAllBtn;
            gameMessage.textContent = 'Kaikki kortit näkyviin 5 sekunnin ajaksi!';
            cards.forEach(card => card.classList.add('flipped', 'no-click'));
            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('matched')) card.classList.remove('flipped');
                    card.classList.remove('no-click');
                });
                gameMessage.textContent = '';
            }, 5000);

        } else if (type === 'reveal-pair') {
            buttonToDisable = powerUpRevealPairBtn;
            gameMessage.textContent = 'Paljastetaan yksi pari!';
            let found = false;
            for (let i = 0; i < cards.length && !found; i++) {
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
            }
            if (matchedPairs * 2 === cards.length) checkForMatch(); // Tarkista, loppuiko taso
            updateDisplay();

        } else if (type === 'add-time') {
            buttonToDisable = powerUpAddTimeBtn;
            gameMessage.textContent = 'Lisäaikaa +30 sekuntia!';
            timeLeft += 30;
            updateTimerDisplay();
        }
        
        if (buttonToDisable) buttonToDisable.disabled = true;
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
                // Lopputehtävä-aluetta EI näytetä tässä, vain uudelleenkäynnistysnappi.
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
        initializeGame(currentLevel);
    }

    function showFinalClue() {
        finalPuzzleContainer.classList.remove('hidden');
        restartButton.classList.remove('hidden');
    }

    checkBonusSentenceButton.addEventListener('click', () => {
        const userInput = bonusSentenceInput.value.trim().toLowerCase();
        if (userInput === finalBonusSentence.toLowerCase()) {
            finalClueDisplay.textContent = finalClueText;
            finalClueDisplay.classList.remove('hidden');
            gameMessage.textContent = 'Oikein! Ratkaisit mysteerin!';
            checkBonusSentenceButton.disabled = true;
        } else {
            finalClueDisplay.textContent = 'Väärin, yritä uudelleen. Tarkista sanat ja niiden järjestys.';
            finalClueDisplay.classList.remove('hidden');
        }
    });

    restartButton.addEventListener('click', () => initializeGame(1));
    powerUpRevealAllBtn.addEventListener('click', () => activatePowerUp('reveal-all'));
    powerUpRevealPairBtn.addEventListener('click', () => activatePowerUp('reveal-pair'));
    powerUpAddTimeBtn.addEventListener('click', () => activatePowerUp('add-time'));

    // Aloita peli
    initializeGame(1);
});
