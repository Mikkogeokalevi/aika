// Haetaan tarvittavat DOM-elementit
const gameBoard = document.getElementById('game-board');
const levelDisplay = document.getElementById('level-display');
const matchedPairsDisplay = document.getElementById('matched-pairs-display');
const movesDisplay = document.getElementById('moves-display');
const revealedSentencePart = document.getElementById('revealed-sentence-part');
const gameMessage = document.getElementById('game-message');
const hiddenSentenceFull = document.getElementById('hidden-sentence-full');
const fullSentenceDisplay = document = document.getElementById('full-sentence-display');
const restartButton = document.getElementById('restart-button');

// Pelin asetukset ja tilamuuttujat
let cards = []; // Tähän tallennetaan kaikki pelissä olevat kortit
let flippedCards = []; // Tähän tallennetaan kaksi käännettyä korttia
let matchedPairs = 0; // Löydettyjen parien määrä nykyisellä tasolla
let totalMoves = 0; // Pelaajan tekemät liikkeet
let lockBoard = false; // Estää klikkaukset korttien kääntöanimaation aikana
let currentLevel = 1; // Nykyinen taso

// Tässä vaiheessa käytetään yksinkertaisia symboleita korteissa.
// Myöhemmin voidaan vaihtaa kuviksi tai monimutkaisemmiksi merkeiksi.
const cardSymbols = [
    '🌲', '🧭', '📍', '🗺️', '🔍', '🏕️', '💡', '🌳',
    '💧', '⛰️', '⚡', '🗝️', '🌲', '🧭', '📍', '🗺️', // Lisätty symboleita suurempia tasoja varten
    '🔍', '🏕️', '💡', '🌳', '💧', '⛰️', '⚡', '🗝️' // Varmista, että symboleita on tarpeeksi kaikkia tasoja varten
];

// Piilotettu lause ja sen osat per taso
const hiddenSentence = [
    "Ensimmäinen vihje: Aamu-uinnille Ahveroiselle",
    "Toinen vinkki tähän: Kätkö löytyy lähellä rantaa",
    "Kolmas johtolanka on: Tarkista myös sillan alta",
    "Ja viimeinen osa on: Koordinaatit löytyvät kiven alta",
    "Koko salaisuus paljastuu nyt: Geokätkö on paikassa, jossa aurinko nousee järven ylle!"
];

// Tasokohtaiset asetukset (korttien määrä voi vaihdella)
const levelConfigs = [
    { level: 1, pairs: 4, symbols: cardSymbols.slice(0, 4) }, // 4 paria = 8 korttia
    { level: 2, pairs: 6, symbols: cardSymbols.slice(0, 6) }, // 6 paria = 12 korttia
    { level: 3, pairs: 8, symbols: cardSymbols.slice(0, 8) }, // 8 paria = 16 korttia
    { level: 4, pairs: 10, symbols: cardSymbols.slice(0, 10) } // 10 paria = 20 korttia
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
    matchedPairsDisplay.textContent = matchedPairs;
    movesDisplay.textContent = totalMoves;
    revealedSentencePart.textContent = ''; // Tyhjennä edellisen tason vihje
    gameMessage.textContent = ''; // Tyhjennä viesti
    hiddenSentenceFull.classList.add('hidden'); // Piilota koko lauseen näyttö
    restartButton.classList.add('hidden'); // Piilota restart-nappi

    // Luo korttiparit valitun tason symboleista
    let levelSymbols = levelConfig.symbols;
    let cardValues = [...levelSymbols, ...levelSymbols]; // Tuplaa symbolit pareiksi
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
    // Perustuu parien määrään:
    let columns;
    const numCards = levelConfig.pairs * 2;
    if (numCards <= 8) { // esim. 4x2
        columns = 4;
    } else if (numCards <= 12) { // esim. 4x3
        columns = 4;
    } else if (numCards <= 16) { // esim. 4x4
        columns = 4;
    } else if (numCards <= 20) { // esim. 5x4
        columns = 5;
    } else {
        columns = 6; // Yli 20 korttia
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

    if (isMatch) {
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

// Funktio seuraavalle tasolle siirtymiseen
function nextLevel() {
    // Paljasta lauseen osa.
    revealedSentencePart.textContent = hiddenSentence[currentLevel - 1];
    gameMessage.textContent = `Taso ${currentLevel} suoritettu!`;

    // Tarkista, onko vielä tasoja jäljellä
    if (currentLevel < levelConfigs.length) {
        currentLevel++;
        setTimeout(() => {
            gameMessage.textContent = 'Siirrytään seuraavalle tasolle...';
            createBoard(levelConfigs[currentLevel - 1]); // Luo uusi pelilauta seuraavalle tasolle
        }, 3500); // Odota 3.5 sekuntia ennen seuraavan tason lataamista, jotta ehtii lukea vihjeen
    } else {
        // Kaikki tasot suoritettu, peli päättyy
        gameMessage.textContent = 'Onneksi olkoon! Suoritit kaikki tasot!';
        displayFullSentence(); // Näytä koko piilotettu lause
    }
}

// Funktio koko piilotetun lauseen näyttämiseen
function displayFullSentence() {
    hiddenSentenceFull.classList.remove('hidden');
    fullSentenceDisplay.innerHTML = hiddenSentence.join('<br>'); // Liitä lauseen osat rivinvaihdoilla
    restartButton.classList.remove('hidden'); // Näytä uudelleenaloitusnappi
}

// Funktio pelin uudelleen aloittamiseen
function restartGame() {
    currentLevel = 1; // Palauta taso ykköseen
    createBoard(levelConfigs[currentLevel - 1]); // Aloita peli alusta
}

// Kuuntelija restart-napille
restartButton.addEventListener('click', restartGame);

// Käynnistä peli ensimmäisellä tasolla, kun sivu latautuu
document.addEventListener('DOMContentLoaded', () => {
    createBoard(levelConfigs[currentLevel - 1]);
});