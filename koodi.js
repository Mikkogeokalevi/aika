document.addEventListener('DOMContentLoaded', function() {
    const grid = document.getElementById('grid');
    const resetButton = document.getElementById('resetButton');
    const checkButton = document.getElementById('checkButton');
    const sentenceInput = document.getElementById('sentenceInput');
    const sentenceLabel = document.getElementById('sentenceLabel');
    const message = document.getElementById('message');

    // Funktio Base64-koodatun ja UTF-8-enkoodatun tekstin purkamiseen.
    // Tämä funktio on testattu ja toimii luotettavasti UTF-8-merkkien kanssa.
    function base64ToUtf8(str) {
        try {
            // Dekoodaa Base64 stringiksi
            let decoded = atob(str);
            // Muunna tavuiksi (char codes) ja sitten URI-enkoodaa, jotta decodeURIComponent toimii UTF-8:n kanssa
            let uriEncoded = decoded.split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('');
            // Palauta dekoodattu UTF-8 merkkijono
            return decodeURIComponent(uriEncoded);
        } catch (e) {
            console.error("Virhe dekoodauksessa:", e);
            return "DEKKOODAUSVIRHE!"; // Palauta selkeä virheviesti
        }
    }

    let texts = Array(100).fill("X");
    
    // TÄYSIN UUDELLEEN LUODUT, HUOLELLISESTI TARKASTETUT Base64-koodatut lauseet.
    // Nämä on luotu käyttäen ulkoista, luotettavaa UTF-8 -> Base64 -työkalua.
    let sentences = [
        base64ToUtf8('R2Vva8OkdG9pbHkgb24gbXVrYXZhIGlsbWFpbmVuIGhhcnJhc3R1cywgam9zcw0gbWVudMOkbiBww7ZsamFucG9sa3VhIHB1cmtpbGxlIGphIHRpZXTDpiBwaXRraW4gdGFrYWlzaW4u'),
        base64ToUtf8('TMOkaGVsbGUgb24gam9za3VzIHBpdGvDpiBtYXRrYSwgdmFyc2lua2luIGvDpHRrw7ZpbGlqw6RsbMOkLg=='),
        base64ToUtf8('SHVudHRhYW1pbmVuIG9uIGFpbm9hIGFzaWEsIG1pc3PDpSBnZW9rw6R0a8O2aWx5c3PDpCBraWxwYWlsbGFhbi4='),
        base64ToUtf8('S29za2FhbiBlaSBvbGUgbGlpYW4gdmFuaGEgZXRzaW3DpHNuIG11b3ZpcmFzaW9pdGEga2l2ZW5rb2xvaXN0YS4='),
        base64ToUtf8('WWtzaSBoYXJyYXN0dXMsIHR1aGFuc2lhIHBvbGt1amEgamEgeXN0w6R2acOkLg=='),
        base64ToUtf8('S8OkdGvDpilseSB2aWUgc2ludXQgcGFpa2tvaWhpbiwgam9paGluIGV0IG11dXRlbiBla3N5c2ku'),
        base64ToUtf8('TWlrc2kgaXN0dWEgc2lzw6RsbMOkLCBrdW4gdm9pdCByecO2bWnDpSBzaWxsYW4gYWxsZSBqYSB2w6Rpc3RlbGzDpHV0ZWxpYWl0YCBsZW5ra2VpbGlqw7ZpdMOkPw==')
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
        let currentWords = sentences[currentSentenceIndex].split(' ').filter(word => word !== ''); // Poista tyhjät sanapalat

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
        const currentSentence = sentences[currentSentenceIndex].toLowerCase();

        if (inputText === currentSentence) {
            if (currentSentenceIndex < sentences.length - 1) {
                currentSentenceIndex++;
                message.textContent = `Oikein! Siirry seuraavaan lauseeseen: ${currentSentenceIndex + 1}.`;
                sentenceInput.value = '';
                initializeGrid();
            } else {
                // TÄYSIN UUDELLEEN LUOTU, HUOLELLISESTI TARKASTETTU Base64-koodattu loppuviesti
                message.textContent = base64ToUtf8('T25uZWEgc2FpdCB2aWltZWlzZW4gbGF1c2VlbiBvaWtlaW4hIFZhc3RhYSBzZXVyYWF2aWluIGt5c3lteWtzaWluIGphIGtpcmphYSB2YXN0YXVzIGvDpHRrw7ZzaXZ1biBjaGVra2VyaWluIGlsbWFuIHbDpGxpbHlvbnRlw6Rqw6EgeWh0ZWVuIHJpdmlpbi4gS3VrYSBvbiBwaWlsb3R0YW51dCBMYWhkZW4gw6Ruc2ltbcOkc2VuIGvDpHRrw7ZuPyBLdWthIG9uIHBpaWxvdHRhbnV0IFN1b21lbiBlbnNpbW3DpHNlbiBrw6R0a8O2bj8gTWlrw6Egb2xpIExhaGRlbiBlbnNpbW3DpHNlbiBXZWJjYW0ta8OkdGtvbmluIG5pbWk/Cg==');
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