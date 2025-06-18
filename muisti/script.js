// Haetaan tarvittavat DOM-elementit
const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level-display');
const totalLevelsDisplay = document.getElementById('total-levels'); // UUSI
const timerDisplay = document.getElementById('timer-display'); // UUSI
const matchedPairsDisplay = document.getElementById('matched-pairs-display');
const movesDisplay = document.getElementById('moves-display');
const revealedSentencePart = document.getElementById('revealed-sentence-part');
const bonusWordReveal = document.getElementById('bonus-word-reveal'); // UUSI
const bonusWordDisplay = document.getElementById('bonus-word-display'); // UUSI
const gameMessage = document.getElementById('game-message');
const hiddenSentenceFull = document.getElementById('hidden-sentence-full');
const fullSentenceDisplay = document.getElementById('full-sentence-display');
const bonusSentenceDisplay = document.getElementById('bonus-sentence-display'); // UUSI
const bonusSentenceIntro = document.querySelector('.bonus-sentence-intro'); // UUSI
const finalPuzzleArea = document.getElementById('final-puzzle-area'); // UUSI
const bonusSentenceInput = document.getElementById('bonus-sentence-input'); // UUSI
const checkBonusSentenceButton = document.getElementById('check-bonus-sentence-button'); // UUSI
const finalClueDisplay = document.getElementById('final-clue-display'); // UUSI
const restartButton = document.getElementById('restart-button');

// Power-up -napit
const powerUpRevealAllBtn = document.getElementById('power-up-reveal-all'); // UUSI
const powerUpRevealPairBtn = document.getElementById('power-up-reveal-pair'); // UUSI
const powerUpAddTimeBtn = document.getElementById('power-up-add-time'); // UUSI

// Pelin asetukset ja tilamuuttujat
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalMoves = 0;
let lockBoard = false;
let currentLevel = 1;
let timerInterval; // Ajastimen ID
let timeLeft = 10 * 60; // 10 minuuttia sekunteina

// Power-upien tilat (käytetty / ei käytetty)
let powerUpsUsed = {
    'reveal-all': false,
    'reveal-pair': false,
    'add-time': false
};

// Varmista, että cardSymbolsissa on tarpeeksi symboleita kaikkia tasoja varten
// Lisätty uusia, jotta voidaan käyttää bonuskortteja ja useampia tasoja
const cardSymbols = [
    '🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳', // Symbolit tasoille
    '💧', '⛰️', '⚡', '🗝️', '🔥', '💎', '🗿', '🔮', // Lisää symboleita
    '📜', '🔗', '🔆', '🔑', '🔓', '🧩', '🌠', '✨', // Ja vielä lisää
    // Bonus-korttien symbolit
    '🔬', // Suurennuslasi - Kaikki näkyviin
    '🗺️', // Kartta - Paljasta pari (käytetään uudelleen, mutta eri parina)
    '⏱️'  // Tiimalasi - Lisää aikaa
];

// Piilotettu päävihje ja sen osat per taso
const hiddenSentence = [
    "Ensimmäinen vihje: Aamu-uinnille Ahveroiselle.",
    "Toinen vinkki tähän: Kätkö löytyy lähellä rantaa.",
    "Kolmas johtolanka on: Tarkista myös sillan alta.",
    "Neljäs opastus kertoo: Purkki piilossa kuusen alla.",
    "Viides vihje johdattaa: Miten tähdet sen kertoo?",
    "Kuudes osa paljastaa: Missä vanha puu kuiskaa."
];

// Bonuslauseen sanat (yksi per taso)
const bonusWords = [
    "Pieni",
    "musta",
    "laatikko",
    "odottaa",
    "ratkaisijaa",
    "kätkön"
];

// Lopullinen 5-sanainen yhdyssana (vain esimerkki)
const finalClueWord = "GEOKÄTKÖILYSEIKKAILU"; // Tähän tulee se 5-sanainen yhdyssana

// Tasokohtaiset asetukset (korttien määrä ja symbolit)
const levelConfigs = [
    { level: 1, pairs: 4, symbols: ['🌲', '🧭', '📍', '🗺️'] }, // 8 korttia
    { level: 2, pairs: 6, symbols: ['🌲', '🧭', '📍', '🗺️', '🔍', '🏕️'] }, // 12 korttia
    { level: 3, pairs: 8, symbols: ['🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳'] }, // 16 korttia
    { level: 4, pairs: 10, symbols: ['🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳', '💧', '⛰️'] }, // 20 korttia
    { level: 5, pairs: 12, symbols: ['🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳', '💧', '⛰️', '⚡', '🗝️'] }, // 24 korttia
    { level: 6, pairs: 14, symbols: ['🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳', '💧', '⛰️', '⚡', '🗝️', '🔥', '💎'] } // 28 korttia
];

// Funktio korttien sekoittamiseen (Fisher-Yates shuffle algorithm)
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Funktio ajastimen päivitykseen
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    seconds = seconds < 10 ? '0' + seconds : seconds; // Lisää etunolla, jos alle 10
    timerDisplay.textContent = `${minutes}:${seconds}`;

    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameEnd(false); // Peli päättyy, pelaaja hävisi
    } else {
        timeLeft--;
    }
}

// Funktio pelilaudan ja korttien luomiseen
function createBoard(levelConfig) {
    gameBoard.innerHTML = ''; // Tyhjennetään vanha pelilauta
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    totalMoves = 0;
    lockBoard = false;

    // Päivitä näytöt
    levelDisplay.textContent = currentLevel;
    totalLevelsDisplay.textContent = levelConfigs.length; // Näytä kokonaistasojen määrä
    matchedPairsDisplay.textContent = matchedPairs;
    movesDisplay.textContent = totalMoves;
    revealedSentencePart.textContent = ''; // Tyhjennä edellisen tason vihje
    bonusWordDisplay.textContent = ''; // Tyhjennä edellisen tason bonus-sana
    bonusWordReveal.classList.add('hidden'); // Piilota bonus-sana
    gameMessage.textContent = ''; // Tyhjennä viesti
    hiddenSentenceFull.classList.add('hidden'); // Piilota koko lauseen näyttö
    finalPuzzleArea.classList.add('hidden'); // Piilota finaalipeli
    restartButton.classList.add('hidden'); // Piilota restart-nappi

    // Piilota aluksi power-up painikkeet, aktivoidaan myöhemmin
    powerUpRevealAllBtn.disabled = powerUpsUsed['reveal-all'];
    powerUpRevealPairBtn.disabled = powerUpsUsed['reveal-pair'];
    powerUpAddTimeBtn.disabled = powerUpsUsed['add-time'];
    powerUpRevealAllBtn.classList.remove('hidden');
    powerUpRevealPairBtn.classList.remove('hidden');
    powerUpAddTimeBtn.classList.remove('hidden');


    // Luo korttiparit valitun tason symboleista
    let levelSymbols = [...levelConfig.symbols]; // Kopio, jotta ei muuteta alkuperäistä
    
    // Lisää bonuskorttiparit mukaan, jos taso ei ole viimeinen ja ne eivät ole käytetty
    if (currentLevel < levelConfigs.length) { // Älä lisää bonuskortteja viimeiselle tasolle
        if (!powerUpsUsed['reveal-all']) {
            levelSymbols.push('🔬'); levelSymbols.push('🔬');
        }
        if (!powerUpsUsed['reveal-pair']) {
            levelSymbols.push('🗺️'); levelSymbols.push('🗺️');
        }
        if (!powerUpsUsed['add-time']) {
            levelSymbols.push('⏱️'); levelSymbols.push('⏱️');
        }
    }


    let cardValues = [...levelSymbols]; // Alusta cardValues
    cardValues = shuffle(cardValues); // Sekoita kortit

    cardValues.forEach((symbol, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.symbol = symbol; // Tallennetaan symboli data-attribuuttiin
        cardElement.dataset.index = index; // Tallennetaan indeksikortin tunnistamista varten

        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front"></div>
                <div class="card-back">${symbol}</div>
            </div>
        `;
        // Lisää klikkaukseen kuuntelija
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
        cards.push(cardElement); // Lisää kortti cards-taulukkoon
    });

    // Aseta CSS-grid template columnas vastaamaan korttien määrää optimaalisesti
    let columns;
    const numCards = cardValues.length; // Käytä luotujen korttien määrää
    if (numCards <= 8) {
        columns = 4;
    } else if (numCards <= 12) {
        columns = 4;
    } else if (numCards <= 16) {
        columns = 4;
    } else if (numCards <= 20) {
        columns = 5;
    } else if (numCards <= 24) {
        columns = 6;
    } else { // esim. 28 korttia
        columns = 7;
    }
    gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

// Funktio kortin kääntämiseen
function flipCard() {
    // Jos pelilauta on lukittu tai kortti on jo käännetty tai jo löydetty, älä tee mitään
    if (lockBoard || this === flippedCards[0] || this.classList.contains('matched')) {
        return;
    }

    this.classList.add('flipped'); // Lisää flipped-luokka korttiin
    flippedCards.push(this); // Lisää käännetty kortti taulukkoon

    if (flippedCards.length === 2) {
        totalMoves++; // Kasvata liikkeiden määrää kun kaksi korttia on käännetty
        movesDisplay.textContent = totalMoves;
        lockBoard = true; // Estä muita klikkauksia korttien vertailun ajaksi
        checkForMatch(); // Tarkista, ovatko kortit pari
    }
}

// Funktio korttiparin tarkistamiseen
function checkForMatch() {
    let [card1, card2] = flippedCards;
    let isMatch = card1.dataset.symbol === card2.dataset.symbol;

    // Tarkista, onko kyseessä bonuskortti
    const isPowerUpCard = ['🔬', '🗺️', '⏱️'].includes(card1.dataset.symbol);

    if (isMatch) {
        // Jos on bonuskortti, aktivoi power-up
        if (isPowerUpCard) {
            activatePowerUp(card1.dataset.symbol);
        }
        disableCards(card1, card2); // Kortit ovat pari, poista ne käytöstä
    } else {
        unflipCards(card1, card2); // Kortit eivät ole pari, käännä ne takaisin
    }
}

// Funktio pariksi löydettyjen korttien poistamiseen käytöstä
function disableCards(card1, card2) {
    card1.removeEventListener('click', flipCard);
    card2.removeEventListener('click', flipCard);
    
    // Poistetaan flipped-luokka ja lisätään matched-luokka, jotta kortti jää näkyviin ja saa oikean värin.
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.classList.add('matched'); // Lisää 'matched' luokka kortteihin
        card2.classList.add('matched');
        
        matchedPairs++; // Kasvata löydettyjen parien määrää
        matchedPairsDisplay.textContent = matchedPairs;
        gameMessage.textContent = 'Hyvä! Pari löytyi!';
    
        resetBoard(); // Nollaa käännetyt kortit ja vapauta pelilauta
    
        // Tarkista, onko kaikki parit löydetty tasolla
        // Huomioi, että tason pari-määrä on levelConfigsistä, ei korttien kokonaismäärä
        // Jätetään matchedPairs verrattavaksi levelConfig.pairs -arvoon
        if (matchedPairs === levelConfigs[currentLevel - 1].pairs) {
            setTimeout(nextLevel, 1000); // Odota hetki ja siirry seuraavalle tasolle
        }
    }, 600); // Odotetaan kortin kääntymisanimaation verran
}

// Funktio väärien korttien kääntämiseen takaisin
function unflipCards(card1, card2) {
    gameMessage.textContent = 'Ei osunut, yritä uudelleen!';
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        resetBoard(); // Nollaa käännetyt kortit ja vapauta pelilauta
        gameMessage.textContent = ''; // Tyhjennä viesti
    }, 1000); // Käännä kortit takaisin 1 sekunnin kuluttua
}

// Funktio nollaamaan käännetyt kortit ja vapauttamaan pelilaudan
function resetBoard() {
    flippedCards = [];
    lockBoard = false;
}

// Funktio power-upien aktivointiin
function activatePowerUp(symbol) {
    switch (symbol) {
        case '🔬': // Kaikki näkyviin
            if (!powerUpsUsed['reveal-all']) {
                gameMessage.textContent = 'Vihje: Kaikki kortit näkyviin 5 sekunniksi!';
                cards.forEach(card => {
                    if (!card.classList.contains('matched') && !card.classList.contains('flipped')) {
                        card.classList.add('flipped');
                    }
                });
                lockBoard = true; // Lukitse lauta siksi aikaa
                setTimeout(() => {
                    cards.forEach(card => {
                        if (!card.classList.contains('matched')) { // Älä piilota löydettyjä pareja
                            card.classList.remove('flipped');
                        }
                    });
                    lockBoard = false; // Vapauta lauta
                    gameMessage.textContent = '';
                }, 5000);
                powerUpsUsed['reveal-all'] = true;
                powerUpRevealAllBtn.disabled = true;
            }
            break;
        case '🗺️': // Paljasta yksi pari
            if (!powerUpsUsed['reveal-pair']) {
                gameMessage.textContent = 'Vihje: Yksi pari paljastuu!';
                let unflippedCards = cards.filter(card => !card.classList.contains('matched') && !card.classList.contains('flipped'));
                if (unflippedCards.length > 0) {
                    // Etsi symboli, jolle löytyy vielä pari
                    let targetSymbol = unflippedCards[0].dataset.symbol;
                    let pairCandidates = unflippedCards.filter(card => card.dataset.symbol === targetSymbol);
                    
                    // Jos ei löydy paria ensimmäiselle, etsi toinen
                    if (pairCandidates.length < 2 && unflippedCards.length > 1) {
                        targetSymbol = unflippedCards[1].dataset.symbol;
                        pairCandidates = unflippedCards.filter(card => card.dataset.symbol === targetSymbol);
                    }

                    if (pairCandidates.length >= 2) {
                        const card1 = pairCandidates[0];
                        const card2 = pairCandidates.find(card => card !== card1 && card.dataset.symbol === card1.dataset.symbol);
                        
                        if (card1 && card2) {
                            card1.classList.add('flipped');
                            card2.classList.add('flipped');
                            setTimeout(() => {
                                disableCards(card1, card2); // Käytä disableCardsia käsittelemään paria
                            }, 1000); // Anna aikaa kääntyä
                        }
                    } else {
                        gameMessage.textContent = 'Ei vapaita pareja paljastettavaksi!';
                    }
                }
                powerUpsUsed['reveal-pair'] = true;
                powerUpRevealPairBtn.disabled = true;
            }
            break;
        case '⏱️': // Lisää aikaa
            if (!powerUpsUsed['add-time']) {
                gameMessage.textContent = 'Vihje: +30 sekuntia aikaa!';
                timeLeft += 30; // Lisää 30 sekuntia
                updateTimer(); // Päivitä näyttö heti
                powerUpsUsed['add-time'] = true;
                powerUpAddTimeBtn.disabled = true;
            }
            break;
    }
}

// Lisää kuuntelijat power-up -napeille
powerUpRevealAllBtn.addEventListener('click', () => activatePowerUp('🔬'));
powerUpRevealPairBtn.addEventListener('click', () => activatePowerUp('🗺️'));
powerUpAddTimeBtn.addEventListener('click', () => activatePowerUp('⏱️'));


// Funktio seuraavalle tasolle siirtymiseen
function nextLevel() {
    // Paljasta lauseen osa.
    revealedSentencePart.textContent = hiddenSentence[currentLevel - 1];
    // Paljasta bonus-sana
    bonusWordDisplay.textContent = bonusWords[currentLevel - 1];
    bonusWordReveal.classList.remove('hidden');

    gameMessage.textContent = `Taso ${currentLevel} suoritettu!`;

    // Tarkista, onko vielä tasoja jäljellä
    if (currentLevel < levelConfigs.length) {
        currentLevel++;
        setTimeout(() => {
            gameMessage.textContent = 'Siirrytään seuraavalle tasolle...';
            bonusWordReveal.classList.add('hidden'); // Piilota bonus-sana ennen seuraavaa tasoa
            createBoard(levelConfigs[currentLevel - 1]); // Luo uusi pelilauta seuraavalle tasolle
        }, 4000); // Odotetaan 4 sekuntia ennen seuraavan tason lataamista, jotta ehtii lukea vihjeen
    } else {
        // Kaikki tasot suoritettu, peli päättyy
        gameEnd(true); // Peli päättyi voittoon
    }
}

// Funktio pelin päättymiseen (voitto tai häviö)
function gameEnd(win) {
    clearInterval(timerInterval); // Pysäytä ajastin
    lockBoard = true; // Lukitse lauta

    if (win) {
        gameMessage.textContent = 'Onneksi olkoon! Suoritit kaikki tasot!';
        displayFullSentence(); // Näytä koko piilotettu lause ja bonuslauseen syöttökenttä
    } else {
        gameMessage.textContent = 'Aika loppui! Peli päättyi.';
        revealedSentencePart.textContent = 'Peli päättyi. Yritä uudelleen!';
        hiddenSentenceFull.classList.remove('hidden');
        fullSentenceDisplay.textContent = "Et ehtinyt ratkaista kaikkia tasoja ajoissa.";
        bonusSentenceIntro.classList.add('hidden');
        bonusSentenceDisplay.classList.add('hidden');
        finalPuzzleArea.classList.add('hidden'); // Piilota arvoitus
        restartButton.classList.remove('hidden');
    }
}

// Funktio koko piilotetun lauseen ja bonuslauseen näyttämiseen
function displayFullSentence() {
    hiddenSentenceFull.classList.remove('hidden');
    fullSentenceDisplay.innerHTML = hiddenSentence.join('<br>'); // Liitä päävihjeen osat rivinvaihdoilla

    // Näytä bonuslauseen intro ja bonuslause
    bonusSentenceIntro.classList.remove('hidden');
    bonusSentenceDisplay.classList.remove('hidden');
    bonusSentenceDisplay.textContent = bonusWords.join(' '); // Näytä kerätyt bonus-sanat

    // Näytä bonuslauseen syöttökenttä
    finalPuzzleArea.classList.remove('hidden');
    finalClueDisplay.classList.add('hidden'); // Piilota lopullinen vihje aluksi
    restartButton.classList.remove('hidden'); // Näytä uudelleenaloitusnappi

    // Lisää kuuntelija tarkistuspainikkeelle
    checkBonusSentenceButton.addEventListener('click', checkBonusSentence);
}

// Funktio bonuslauseen tarkistamiseen
function checkBonusSentence() {
    const enteredSentence = bonusSentenceInput.value.trim().toLowerCase();
    const correctSentence = bonusWords.join(' ').toLowerCase();

    if (enteredSentence === correctSentence) {
        finalClueDisplay.textContent = `Oikein! Finaalivihje: ${finalClueWord.toUpperCase()}`;
        finalClueDisplay.style.color = '#90EE90'; // Vihreä väri onnistuneelle
        finalClueDisplay.classList.remove('hidden');
        bonusSentenceInput.disabled = true; // Estä uudet syötöt
        checkBonusSentenceButton.disabled = true; // Estä uudet klikkaukset
        gameMessage.textContent = 'Bonuslause oikein! Olet valmis löytämään kätkön!';
    } else {
        finalClueDisplay.textContent = 'Väärin, yritä uudelleen.';
        finalClueDisplay.style.color = '#FFD700'; // Keltainen väri väärälle
        finalClueDisplay.classList.remove('hidden');
    }
}

// Funktio pelin uudelleen aloittamiseen
function restartGame() {
    currentLevel = 1; // Palauta taso ykköseen
    timeLeft = 10 * 60; // Nollaa ajastin
    powerUpsUsed = { // Nollaa power-upit
        'reveal-all': false,
        'reveal-pair': false,
        'add-time': false
    };
    // Piilota final clue ja tekstikenttä
    finalPuzzleArea.classList.add('hidden');
    finalClueDisplay.classList.add('hidden');
    bonusSentenceInput.value = ''; // Tyhjennä kenttä
    bonusSentenceInput.disabled = false;
    checkBonusSentenceButton.disabled = false;

    // Aloita ajastin uudelleen
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    createBoard(levelConfigs[currentLevel - 1]); // Aloita peli alusta
}

// Käynnistä peli ensimmäisellä tasolla ja ajastin, kun sivu latautuu
document.addEventListener('DOMContentLoaded', () => {
    createBoard(levelConfigs[currentLevel - 1]);
    totalLevelsDisplay.textContent = levelConfigs.length; // Näytä kokonaistasojen määrä heti
    timerInterval = setInterval(updateTimer, 1000); // Aloita ajastin
});
