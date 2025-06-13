document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const sentenceLabel = document.getElementById('sentenceLabel');
    const message = document.getElementById('message');

    // Funktio tekstin muuntamiseen heksadesimaalimuotoiseksi taulukoksi
    function stringToHexArray(str) {
        let hexArray = [];
        for (let i = 0; i < str.length; i++) {
            // Käsittele Unicode-merkit (myös > U+FFFF) oikein
            let codePoint = str.codePointAt(i);
            hexArray.push(codePoint.toString(16).padStart(4, '0')); // Jokainen koodipiste 4-numeroiseksi heksaksi
            // Jos merkki oli osa surrogattiparia, hyppää toisen osan yli
            if (codePoint > 0xFFFF) {
                i++;
            }
        }
        return hexArray;
    }

    // Funktio heksadesimaalitaulukon muuntamiseen takaisin tekstiksi
    function hexArrayToString(hexArray) {
        let str = '';
        for (let i = 0; i < hexArray.length; i++) {
            let codePoint = parseInt(hexArray[i], 16);
            str += String.fromCodePoint(codePoint); // Käytä fromCodePoint Unicode-merkeille
        }
        return str;
    }

    let texts = Array(100).fill("X");
    
    // Lauseet muunnettuna heksadesimaalinumerotaulukoiksi.
    // Nämä eivät sisällä suoraa tekstiä eikä hankalia erikoismerkkejä.
    let sentencesHex = [
        ['0047', '0065', '006f', '006b', '00e4', '0074', '006b', '00f6', '0069', '006c', '0079', '0020', '006f', '006e', '0020', '006d', '0075', '006b', '0061', '0076', '0061', '0020', '0069', '006c', '006d', '0061', '0069', '006e', '0065', '006e', '0020', '0068', '0061', '0072', '0072', '0061', '0073', '0074', '0075', '0073', '002c', '0020', '006a', '006f', '0073', '0073', '0061', '0020', '006d', '0065', '006e', '006e', '00e4', '00e4', '006e', '0020', '0070', '00f6', '006c', '006a', '00e4', '006e', '0070', '006f', '006c', '006b', '0075', '0061', '0020', '0070', '0075', '0072', '006b', '0069', '006c', '006c', '0065', '0020', '006a', '0061', '0020', '0074', '0069', '0065', '0074', '00e4', '0020', '0070', '0069', '0074', '006b', '0069', '006e', '0020', '0074', '0061', '006b', '0061', '0069', '0073', '0069', '006e', '002e'],
        ['004c', '00e4', '0068', '0065', '006c', '006c', '0065', '0020', '006f', '006e', '0020', '006a', '006f', '0073', '006b', '0075', '0073', '0020', '0070', '0069', '0074', '006b', '00e4', '0020', '006d', '0061', '0074', '006b', '0061', '002c', '0020', '0076', '0061', '0072', '0073', '0069', '006e', '006b', '0069', '006e', '0020', '006b', '00e4', '0074', '006b', '00f6', '0069', '006c', '0069', '006a', '00e4', '006c', '006c', '00e4', '002e'],
        ['0048', '0075', '006e', '0074', '0074', '0061', '0061', '006d', '0069', '006e', '0065', '006e', '0020', '006f', '006e', '0020', '0061', '0069', '006e', '006f', '0061', '0020', '0061', '0073', '0069', '0061', '002c', '0020', '006d', '0069', '0073', '0073', '00e4', '0020', '0067', '0065', '006f', '006b', '00e4', '0074', '006b', '00f6', '0069', '006c', '0079', '0073', '0073', '00e4', '0020', '006b', '0069', '006c', '0070', '0061', '0069', '006c', '006c', '0061', '0061', '006e', '002e'],
        ['004b', '006f', '0073', '006b', '0061', '0061', '006e', '0020', '0065', '0069', '0020', '006f', '006c', '0065', '0020', '006c', '0069', '0069', '0061', '006e', '0020', '0076', '0061', '006e', '0068', '0061', '0020', '0065', '0074', '0073', '0069', '006d', '00e4', '00e4', '006e', '0020', '006d', '0075', '006f', '0076', '0069', '0072', '0061', '0073', '0069', '006f', '0069', '0074', '0061', '0020', '006b', '0069', '0076', '0065', '006e', '006b', '006f', '006c', '006f', '0069', '0073', '0074', '0061', '002e'],
        ['0059', '006b', '0073', '0069', '0020', '0068', '0061', '0072', '0072', '0061', '0073', '0074', '0075', '0073', '002c', '0020', '0074', '0075', '0068', '0061', '006e', '0073', '0069', '0061', '0020', '0070', '006f', '006c', '006b', '0075', '006a', '0061', '0020', '006a', '0061', '0020', '0079', '0073', '0074', '00e4', '0076', '0069', '00e4', '002e'],
        ['004b', '00e4', '0074', '006b', '00f6', '0069', '006c', '0079', '0020', '0076', '0069', '0065', '0020', '0073', '0069', '006e', '0075', '0074', '0020', '0070', '0061', '0069', '006b', '006b', '006f', '0069', '0068', '0069', '006e', '002c', '0020', '006a', '006f', '0069', '0068', '0069', '006e', '0020', '0065', '0074', '0020', '006d', '0075', '0075', '0074', '0065', '006e', '0020', '0065', '006b', '0073', '0079', '0069', '0073', '0069', '002e'],
        ['004d', '0069', '006b', '0073', '0069', '0020', '0069', '0073', '0074', '0075', '0061', '0020', '0073', '0069', '0073', '00e4', '006c', '006c', '00e4', '002c', '0020', '006b', '0075', '006e', '0020', '0076', '006f', '0069', '0074', '0020', '0072', '0079', '00f6', '006d', '0069', '00e4', '0020', '0073', '0069', '006c', '006c', '0061', '006e', '0020', '0061', '006c', '006c', '0065', '0020', '006a', '0061', '0020', '0076', '00e4', '0069', '0073', '0074', '0065', '006c', '006c', '00e4', '0020', '0075', '0074', '0065', '006c', '0069', '0061', '0069', '0074', '0061', '0020', '006c', '0065', '006e', '006b', '006b', '0065', '0069', '006c', '0069', '006a', '006f', '0069', '0074', '00e4', '003f']
    ];

    // Loppuviesti muunnettuna heksadesimaalinumerotaulukoksi.
    const finalMessageHex = ['004f', '006e', '006e', '0065', '0061', '0020', '0073', '0061', '0069', '0074', '0020', '0076', '0069', '0069', '006d', '0065', '0069', '0073', '0065', '006e', '0020', '006c', '0061', '0075', '0073', '0065', '0065', '006e', '0020', '006f', '0069', '006b', '0065', '0069', '006e', '0021', '0020', '0056', '0061', '0073', '0074', '0061', '0061', '0020', '0073', '0065', '0075', '0072', '0061', '0061', '0076', '0069', '0069', '006e', '0020', '006b', '0079', '0073', '0079', '006d', '0079', '006b', '0073', '0069', '0069', '006e', '0020', '006a', '0061', '0020', '006b', '0069', '0072', '006a', '0061', '0061', '0020', '0076', '0061', '0073', '0074', '0061', '0075', '0073', '0020', '006b', '00e4', '0074', '006b', '00f6', '0073', '0069', '0076', '0075', '006e', '0020', '0063', '0068', '0065', '006b', '006b', '0065', '0072', '0069', '0069', '006e', '0020', '0069', '006c', '006d', '0061', '006e', '0020', '0076', '00e4', '006c', '0069', '006c', '0079', '00f6', '006e', '0074', '0065', '006a', '00e4', '0020', '0079', '0068', '0074', '0065', '0065', '006e', '0020', '0072', '0069', '0076', '0069', '0069', '006e', '003a', '0020', '004b', '0075', '006b', '0061', '0020', '006f', '006e', '0020', '0070', '0069', '0069', '006c', '006f', '0074', '0074', '0061', '006e', '0075', '0074', '0020', '004c', '0061', '0068', '0064', '0065', '006e', '0020', '0065', '006e', '0073', '0069', '006d', '006d', '00e4', '0069', '0073', '0065', '006e', '0020', '006b', '00e4', '0074', '006b', '00f6', '006e', '003f', '0020', '004b', '0075', '006b', '0061', '0020', '006f', '006e', '0020', '0070', '0069', '0069', '006c', '006f', '0074', '0074', '0061', '006e', '0075', '0074', '0020', '0053', '0075', '006f', '006d', '0065', '006e', '0020', '0065', '006e', '0073', '0069', '006d', '006d', '00e4', '0069', '0073', '0065', '006e', '0020', '006b', '00e4', '0074', '006b', '00f6', '006e', '003f', '0020', '004d', '0069', '006b', '00e4', '0020', '006f', '006c', '0069', '0020', '004c', '0061', '0068', '0064', '0065', '006e', '0020', '0065', '006e', '0073', '0069', '006d', '006d', '00e4', '0069', '0073', '0065', '006e', '0020', '0057', '0065', '0062', '0063', '0061', '006d', '002d', '006b', '00e4', '0074', '006b', '00f6', '006e', '0020', '006e', '0069', '006d', '0069', '003f'];


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
        
        // Puretaan lause heksadesimaalitaulukosta ennen käyttöä
        let currentSentenceDecrypted = hexArrayToString(sentencesHex[currentSentenceIndex]);
        let currentWords = currentSentenceDecrypted.split(' ').filter(word => word !== '');

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
                        const classNames = ['word-cell', 'second-word-cell', 'third-word-cell', 'fourth-word-cell', 'fifth-word-cell', 'sixth-word-cell', 'seventh-word-cell'];
                        if (currentSentenceIndex < classNames.length) {
                            cell.classList.add(classNames[currentSentenceIndex]);
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
        // Puretaan lause heksadesimaalitaulukosta vertailua varten
        const currentSentence = hexArrayToString(sentencesHex[currentSentenceIndex]).toLowerCase();

        // TÄMÄ ON DEBUGGAUSKOODI, JOKA AUTTAA NÄKEMÄÄN EROT!
        console.log("---------------------------------------");
        console.log("Syöte (input):", inputText);
        console.log("Odotettu lause (expected):", currentSentence);
        console.log("Syötteet täsmäävät:", inputText === currentSentence); 

        // Lisää tämä silmukka, jos vertailu epäonnistuu viimeisellä lauseella
        if (currentSentenceIndex === sentencesHex.length - 1 && inputText !== currentSentence) {
            console.log("Debuggaus viimeisen lauseen vertailulle:");
            let diffFound = false;
            for (let i = 0; i < Math.max(inputText.length, currentSentence.length); i++) {
                const charInput = inputText.charAt(i);
                const charExpected = currentSentence.charAt(i);
                const codeInput = charInput ? charInput.charCodeAt(0) : 'N/A';
                const codeExpected = charExpected ? charExpected.charCodeAt(0) : 'N/A';

                if (codeInput !== codeExpected) {
                    console.log(`Ero kohdassa ${i}:`);
                    console.log(`  Syöte: "${charInput}" (koodi: ${codeInput})`);
                    console.log(`  Odotettu: "${charExpected}" (koodi: ${codeExpected})`);
                    diffFound = true;
                }
            }
            if (!diffFound && inputText.length !== currentSentence.length) {
                 console.log(`Pituusero: Syöte (${inputText.length}), Odotettu (${currentSentence.length})`);
            } else if (!diffFound) {
                console.log("Ei näkyvää eroa, mutta vertailu epäonnistui. Tarkista kopioinnissa piilossa olevat merkit.");
            }
        }
        console.log("---------------------------------------");
        // TÄMÄN YLÄPUOLELLE PÄÄTTYI DEBUGGAUSKOODI

        if (inputText === currentSentence) {
            if (currentSentenceIndex < sentencesHex.length - 1) { // Käytä sentencesHex.length
                currentSentenceIndex++;
                message.textContent = `Oikein! Siirry seuraavaan lauseeseen: ${currentSentenceIndex + 1}.`;
                sentenceInput.value = '';
                initializeGrid();
            } else {
                // Loppuviesti puretaan heksadesimaalitaulukosta
                message.textContent = hexArrayToString(finalMessageHex);
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
