document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const sentenceLabel = document.getElementById('sentenceLabel');
    const message = document.getElementById('message');

    let texts = Array(100).fill("X");
    let sentences = [
        "Geokätköily on mukava ilmainen harrastus, jossa mennään pöljänpolkua purkille ja tietä pitkin takaisin.",
        "Lähelle on joskus pitkä matka, varsinkin kätköilijällä.",
        "Hunttaaminen on ainoa asia, missä geokätköilyssä kilpaillaan.",
        "Koskaan ei ole liian vanha etsimään muovirasioita kivenkoloista.",
        "Yksi harrastus, tuhansia polkuja ja ystäviä.",
        "Kätköily vie sinut paikkoihin, joihin et muuten eksyisi.",
        "Miksi istua sisällä, kun voit ryömiä sillan alle ja väistellä uteliaita lenkkeilijöitä?"
    ];

    let currentSentenceIndex = 0;

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
        let currentWords = sentences[currentSentenceIndex].split(' ');

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
                        if (currentSentenceIndex === 0) {
                            cell.classList.add('word-cell');
                        } else if (currentSentenceIndex === 1) {
                            cell.classList.add('second-word-cell');
                        } else if (currentSentenceIndex === 2) {
                            cell.classList.add('third-word-cell');
                        } else if (currentSentenceIndex === 3) {
                            cell.classList.add('fourth-word-cell');
                        } else if (currentSentenceIndex === 4) {
                            cell.classList.add('fifth-word-cell');
                        } else if (currentSentenceIndex === 5) {
                            cell.classList.add('sixth-word-cell');
                        } else if (currentSentenceIndex === 6) {
                            cell.classList.add('seventh-word-cell');
                        }
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
        sentenceLabel.textContent = `Syötä lause tähän: ${currentSentenceIndex + 1}.`;
        sentenceInput.placeholder = "Syötä lause tähän";
    }

    resetButton.addEventListener('click', () => {
        currentSentenceIndex = 0;
        sentenceInput.value = '';
        message.textContent = '';
        initializeGrid();
    });

    checkButton.addEventListener('click', () => {
        const inputText = sentenceInput.value.trim().toLowerCase();
        const currentSentence = sentences[currentSentenceIndex].toLowerCase();

        if (inputText === currentSentence) {
            if (currentSentenceIndex < sentences.length - 1) {
                currentSentenceIndex++;
                message.textContent = `Oikein! Siirry seuraavaan lauseeseen: ${currentSentenceIndex + 1}.`;
                sentenceInput.value = '';
                initializeGrid();
            } else {
                message.textContent = "Onnea sait viimeisen lauseen oikein! Vastaa seuraaviin kysymyksiin ja kirjaa vastaus kätkösivun chekkeriin ilman välilyöntejä yhteen riviin: Kuka on piilottanut Lahden ensimmäisen kätkön? Kuka on piilottanut Suomen ensimmäisen kätkön? Mikä oli Lahden ensimmäisen Webcam-kätkön nimi?";
            }
        } else {
            message.textContent = "Väärä vastaus, yritä uudelleen!";
            setTimeout(() => {
                sentenceInput.value = '';
            }, 1000);
        }
    });

    initializeGrid();
});
