document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const sentenceLabel = document.getElementById('sentenceLabel');
    const message = document.getElementById('message');

    // Salatut lauseet Base64-muodossa
    const encodedSentences = [
        "R2Vva8O8YcO8aw== on bXVrYXZhIGlscmFpbmVuIGhhcnJhc3R1cywgc8O8cMOpYSBtZW5uw6RuYcO8YW4gcMOpbGrDtnJhbnBvbHVrdWEgcHVya2lsbGUgYWphIHRpZcO8YSBwaXRraW4gdGFrYWlzaW4u",
        "TMOkZWhsZSBvbiBqb3NrdXMgcGl0sw==YSBtYXRrYSwgdmFyc2lua2luIMO8YcO8YWrDtnJhbGxDtnJhLg==",
        "SHVudHRhYW1pbmVuIG9uIGFpbm9hIGFzaWEgbWlzc8O8YSBnZWvDtnJyw6Ryw7xpbGnDtnJhbGx5c8O8YW4u",
        "S29zamFhbiBlaSBvaGVsIGxpaWFuIHZhbmhhIGV0c2nDtnJtYcO8YSBtdW92aXJhc2lvaXRhIGtpdmVuaw==b2xvaXN0YQ==",
        "WXrDtnJpIGhhcnJhc3R1cywgdHVoYW5zaWEgcG9sbHVqYSBqYSB5c8O8YcO8YWzDtnJhLg==",
        "SsO8YXRrw7xpbHkgdmllIHNpbnV0IHBhaWtrb2l0aW4sIHppb2luIGV0IG11dGV0IGVrc3lpc2ku",
        "TWlrc2kgacO8c3RvYSBzaXPDtnJsw6Rsw60gb2xsw60gc2lsbGFuIGFsbGUgYW5kIHbDtnJzdMOkbGzDtnJhIGxlbmtrZWlsw7xqYcO8YQ=="
    ];

    // Salattu lopullinen viesti Base64-muodossa
    const encodedFinalMessage = "T25uZWEgc2FpdCB2aWltZWlzZW4gbGF1c2VlbiBva2VpbiEgVmFzdGFhIHNlaXB1YXZpbiBzZWl0YXZpYSBrb8O8c3lteWlzaW4gYW5kIGtpcmphYSB2YXN0YXVzIGTDtnJrw6Rrw6RrbMOkY2tDtnJ0dSBpbG1hbiDDtnJseWzDtnJqYW4geWjDtnJhZW4gcml2aWzDtnJqOiBLdWthIG9uIHBpaWxvdHRhdCBMYWhkZW4gcGVuw7x0ZW5lIHNpw7xyYWlzZW4gaw==DtnJ0aw==b25rYSBvbiBzaWzDtnJ0YW5ldCBzZWlzZW7DtnJ0ZW4gcGVuw7x0ZW5lIHNpw7xyYWlzZW4gaw==DtnJ0aw==b25rYSBvbiBNYWjDtnJhIG9saSBMYWhkZW4gcGVuw7x0ZW5lIHNpw7xyYWlzZW4gV2ViY2FtLWTDtnJ0aw==b24gbmltaw==";

    // Purku Base64-muodosta
    function decodeBase64(encoded) {
        return atob(encoded);
    }

    let currentSentenceIndex = 0;
    let texts = Array(100).fill("X");

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
        let currentWords = decodeBase64(encodedSentences[currentSentenceIndex]).split(' ');

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
        const currentSentence = decodeBase64(encodedSentences[currentSentenceIndex]).toLowerCase();

        if (inputText === currentSentence) {
            if (currentSentenceIndex < encodedSentences.length - 1) {
                currentSentenceIndex++;
                message.textContent = `Oikein! Siirry seuraavaan lauseeseen: ${currentSentenceIndex + 1}.`;
                sentenceInput.value = '';
                initializeGrid();
            } else {
                message.textContent = decodeBase64(encodedFinalMessage);
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
