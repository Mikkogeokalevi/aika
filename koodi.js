document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const message = document.getElementById('message');

    let texts = Array(100).fill("X");
    let currentSentence = "geokätköily on mukava ilmainen harrastus jossa mennään pöljänpolkua purkille ja polkua pitkin takaisin";
    let secondSentence = "lähelle joskus pitkä matka varsinkin kätköilijällä";
    let thirdSentence = "aarre jaetaan aina tasan puolitetaan vaikka viillolla";
    let words = currentSentence.split(' ');
    let secondWords = secondSentence.split(' ');
    let thirdWords = thirdSentence.split(' ');
    let isSecondSentence = false;
    let isThirdSentence = false;

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
        let currentWords = isThirdSentence ? thirdWords : (isSecondSentence ? secondWords : words);

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
                        if (isThirdSentence) {
                            cell.classList.add('third-word-cell');
                        } else if (isSecondSentence) {
                            cell.classList.add('second-word-cell');
                        } else {
                            cell.classList.add('word-cell');
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
    }

    resetButton.addEventListener('click', () => {
        isSecondSentence = false;
        isThirdSentence = false;
        sentenceInput.value = '';
        message.textContent = '';
        initializeGrid();
    });

    checkButton.addEventListener('click', () => {
        const inputText = sentenceInput.value.trim();
        if (!isSecondSentence && !isThirdSentence && inputText === currentSentence) {
            message.textContent = "Oikein! Siirry seuraavaan vaiheeseen.";
            isSecondSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isSecondSentence && !isThirdSentence && inputText === secondSentence) {
            message.textContent = "Oikein! Siirry viimeiseen vaiheeseen.";
            isThirdSentence = true;
            sentenceInput.value = '';
            initializeGrid();
        } else if (isThirdSentence && inputText === thirdSentence) {
            message.textContent = "Onnea sait oikein! KätköilijänTärkeinVälineOnKynä";
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
