document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const message = document.getElementById('message');

    let texts = Array(100).fill("X");
    let currentSentence = "Geokätköily on mukava ilmainen harrastus, jossa mennään pöljänpolkua purkille ja tietä pitkin takaisin.";
    let secondSentence = "Lähelle on joskus pitkä matka, varsinkin kätköilijällä.";
    let thirdSentence = "Hunttaaminen on ainoa asia, missä geokätköilyssä kilpaillaan.";
    let fourthSentence = "Koskaan ei ole liian vanha etsimään muovirasioita kivenkoloista.";
    let fifthSentence = "Yksi harrastus, tuhansia polkuja ja ystäviä.";
    let sixthSentence = "Kätköily vie sinut paikkoihin, joihin et muuten eksyisi.";
    let seventhSentence = "Miksi istua sisällä, kun voit ryömiä sillan alle, ja väistellä uteliaita lenkkeilijöitä?";

    let words = currentSentence.split(' ');
    let secondWords = secondSentence.split(' ');
    let thirdWords = thirdSentence.split(' ');
    let fourthWords = fourthSentence.split(' ');
    let fifthWords = fifthSentence.split(' ');
    let sixthWords = sixthSentence.split(' ');
    let seventhWords = seventhSentence.split(' ');

    let isSecondSentence = false;
    let isThirdSentence = false;
    let isFourthSentence = false;
    let isFifthSentence = false;
    let isSixthSentence = false;
    let isSeventhSentence = false;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function initializeGrid() {
        grid.innerHTML = '';
        texts = Array(100).fill("X");
        let indices = Array.from({ length: 100 }, (_, i) => i);
        let shuffledIndices = shuffleArray(indices);

        let currentWords = words;
        if (isSecondSentence) currentWords = secondWords;
        else if (isThirdSentence) currentWords = thirdWords;
        else if (isFourthSentence) currentWords = fourthWords;
        else if (isFifthSentence) currentWords = fifthWords;
        else if (isSixthSentence) currentWords = sixthWords;
        else if (isSeventhSentence) currentWords = seventhWords;

        shuffledIndices.slice(0, currentWords.length).forEach((index, i) => {
            texts[index] = currentWords[i];
        });

        texts = shuffleArray(texts);

        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = '';
            cell.addEventListener('click', () => {
                if (!cell.classList.contains('clicked')) {
                    cell.textContent = texts[i];
                    cell.classList.add('clicked');
                    if (texts[i] !== 'X') {
                        if (isSeventhSentence) cell.classList.add('seventh-word-cell');
                        else if (isSixthSentence) cell.classList.add('sixth-word-cell');
                        else if (isFifthSentence) cell.classList.add('fifth-word-cell');
                        else if (isFourthSentence) cell.classList.add('fourth-word-cell');
                        else if (isThirdSentence) cell.classList.add('third-word-cell');
                        else if (isSecondSentence) cell.classList.add('second-word-cell');
                        else cell.classList.add('word-cell');
                        setTimeout(() => {
                            cell.textContent = '';
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            cell.textContent = '';
                        }, 1000);
                    }
                }
            });
            grid.appendChild(cell);
        }
    }

    resetButton.addEventListener('click', () => {
        isSecondSentence = false;
        isThirdSentence = false;
        isFourthSentence = false;
        isFifthSentence = false;
        isSixthSentence = false;
        isSeventhSentence = false;
        sentenceInput.value = '';
        message.textContent = '';
        initializeGrid();
    });

    checkButton.addEventListener('click', () => {
        const inputText = sentenceInput.value.trim().toLowerCase();

        if (!isSecondSentence && !isThirdSentence && !isFourthSentence && !isFifthSentence && !isSixthSentence && !isSeventhSentence && inputText === currentSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isSecondSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isSecondSentence && !isThirdSentence && !isFourthSentence && !isFifthSentence && !isSixthSentence && !isSeventhSentence && inputText === secondSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isThirdSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isThirdSentence && !isFourthSentence && !isFifthSentence && !isSixthSentence && !isSeventhSentence && inputText === thirdSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isFourthSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isFourthSentence && !isFifthSentence && !isSixthSentence && !isSeventhSentence && inputText === fourthSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isFifthSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isFifthSentence && !isSixthSentence && !isSeventhSentence && inputText === fifthSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isSixthSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isSixthSentence && !isSeventhSentence && inputText === sixthSentence.toLowerCase()) {
            message.textContent = "Oikein! Siirry viimeiseen vaiheeseen.";
            isSeventhSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isSeventhSentence && inputText === seventhSentence.toLowerCase()) {
            message.textContent = "Onnea sait viimeisen lauseen oikein! Vastaa seuraaviin kysymyksiin ja kirjaa vastaus kätkösivun chekkeriin ilman välilyöntejä yhteen riviin: Kuka on piilottanut Lahden ensimmäisen kätkön? Kuka on piilottanut Suomen ensimmäisen kätkön? Mikä oli Lahden ensimmäisen Webcam-kätkön nimi?";
        } else {
            message.textContent = "Väärä vastaus, yritä uudelleen!";
            setTimeout(() => {
                sentenceInput.value = '';
                initializeGrid();
            }, 1000);
        }
    });

    initializeGrid();
});
