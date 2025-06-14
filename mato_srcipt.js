document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const eatenLettersContainer = document.getElementById('eaten-letters-container');
    const livesElement = document.getElementById('lives');
    const infoContainer = document.getElementById('info-container');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const congratulationsMessage = document.getElementById('congratulations-message');

    const box = 20;
    let snake = [{x: 9 * box, y: 10 * box}];
    let direction = null;
    let lives = 3;

    // Sanat ja värit – pidä nämä samassa järjestyksessä kuin haluat niiden näkyvän!
    const wordsConfig = [
        { word: "Kirjasto", color: "#FF5733" }, // Oranssinpunainen
        { word: "virkailijan", color: "#33FF57" }, // Vihreä
        { word: "perjantai", color: "#3357FF" }, // Sininen
        // Lisää lisää sanoja ja niiden värejä tähän haluamassasi järjestyksessä:
        // { word: "Esimerkkisana", color: "#FFD700" }, // Kulta
        // { word: "Toinen", color: "#DA70D6" } // Violetti
    ];
    const correctAnswer = "kirjastovirkailijanperjantai"; // Tämän tulee vastata kaikkia sanoja peräkkäin pienillä kirjaimilla

    const snakeGrowthWords = ["MIKKO", "KALEVIN", "MATO"];

    // Muodosta alkuperäiset kirjaimet syötäviksi ja tallenna alkuperäinen indeksi
    let letters = wordsConfig.flatMap((item, wordOriginalIndex) =>
        shuffleWord(item.word.toUpperCase()).split('').map(letter => ({
            letter: letter,
            color: item.color,
            wordOriginalIndex: wordOriginalIndex // Lisää alkuperäisen sanan indeksi
        }))
    );

    let food = null; // Alustetaan food myöhemmin
    let game = null;
    let isPaused = false;
    let snakeHeadImage = new Image();

    // Tallennetaan referenssit luotuihin color-row-elementteihin
    const colorRows = [];

    // Funktio luo ja järjestää sanarivit valmiiksi
    function setupEatenLettersContainer() {
        eatenLettersContainer.innerHTML = ''; // Tyhjennä vanha sisältö
        colorRows.length = 0; // Tyhjennä vanhat referenssit

        wordsConfig.forEach((item, index) => {
            const colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            colorRow.setAttribute('data-color', item.color); // Tarvitaan edelleen tyylitykseen
            colorRow.setAttribute('data-word-index', index); // Tunnistaa rivin alkuperäisen sanan perusteella
            eatenLettersContainer.appendChild(colorRow);
            colorRows.push(colorRow); // Tallenna referenssi
        });
    }

    // Funktio pelin käynnistämiseen
    function startGame() {
        if (!game) { // Käynnistä vain, jos peli ei ole jo käynnissä
            game = setInterval(drawGame, 200);
            food = generateFood(); // Generoi ensimmäinen ruoka, kun peli käynnistyy
        }
    }

    snakeHeadImage.onload = startGame; // Käynnistä peli, kun kuva latautuu onnistuneesti
    snakeHeadImage.onerror = () => { // Käynnistä peli, vaikka kuvan lataus epäonnistuisi
        console.error("Failed to load snake head image. Starting game with fallback.");
        startGame();
    };

    snakeHeadImage.src = 'https://img.geocaching.com:443/84454fa6-e23a-4aad-a8a4-612b77f23abe.png';

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);

    canvas.addEventListener('touchmove', function(e) {
        if (!e.touches[0]) return;
        e.preventDefault();
        let touchEndX = e.touches[0].clientX;
        let touchEndY = e.touches[0].clientY;

        let diffX = touchStartX - touchEndX;
        let diffY = touchStartY - touchEndY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                setDirection('LEFT');
            } else {
                setDirection('RIGHT');
            }
        } else {
            if (diffY > 0) {
                setDirection('UP');
            } else {
                setDirection('DOWN');
            }
        }

        touchStartX = touchEndX;
        touchStartY = touchEndY;
    }, false);

    function shuffleWord(word) {
        return word.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Generoi ruokaa jäljellä olevista kirjaimista
    function generateFood() {
        const availableLetters = letters.filter(l => l.letter !== '');
        if (availableLetters.length === 0) {
            return null; // Kaikki kirjaimet syöty
        }

        // Valitse satunnainen kirjain jäljellä olevista
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const selectedLetter = availableLetters[randomIndex];

        // Aseta kirjaimen paikka satunnaisesti canvasille
        return {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box,
            letter: selectedLetter.letter,
            color: selectedLetter.color,
            wordOriginalIndex: selectedLetter.wordOriginalIndex // Käytä alkuperäistä indeksiä
        };
    }

    function drawGame() {
        if (isPaused) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                // Piirrä kuva vain, jos se on latautunut kokonaan
                if (snakeHeadImage.complete && snakeHeadImage.naturalHeight !== 0) {
                    ctx.drawImage(snakeHeadImage, snake[i].x, snake[i].y, box, box);
                } else {
                    // Vararatkaisu, jos kuva ei latautunut, piirrä vihreä neliö
                    ctx.fillStyle = '#8BC34A'; // Käärmeen pään varaväri
                    ctx.fillRect(snake[i].x, snake[i].y, box, box);
                }
            } else if (i <= snakeGrowthWords.join('').length) {
                const letterIndex = (i - 1) % snakeGrowthWords.join('').length;
                ctx.fillStyle = '#8BC34A'; // Käärmeen vartalon väri
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(snakeGrowthWords.join('')[letterIndex], snake[i].x + box / 2, snake[i].y + box / 2);
            } else {
                ctx.fillStyle = '#8BC34A'; // Käärmeen vartalon väri
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
            }
            ctx.strokeStyle = 'white';
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        // Piirrä ruoka vain jos ruokaa on jäljellä
        if (food) {
            ctx.fillStyle = food.color;
            ctx.beginPath();
            ctx.roundRect(food.x, food.y, box, box, 10);
            ctx.fill();

            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(food.letter, food.x + box / 2, food.y + box / 2);
        }

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction === 'LEFT') snakeX -= box;
        if (direction === 'UP') snakeY -= box;
        if (direction === 'RIGHT') snakeX += box;
        if (direction === 'DOWN') snakeY += box;

        // Jos käärme syö ruoan
        if (food && snakeX === food.x && snakeY === food.y) {
            const eatenLetterDiv = document.createElement('div');
            eatenLetterDiv.className = 'eaten-letter';
            eatenLetterDiv.style.backgroundColor = food.color;
            eatenLetterDiv.textContent = food.letter;

            // Hae oikea rivi indeksiä käyttäen ja lisää kirjain siihen
            const targetColorRow = colorRows[food.wordOriginalIndex];
            if (targetColorRow) {
                targetColorRow.appendChild(eatenLetterDiv);
            }

            // Poista syöty kirjain letters-listasta (merkitse tyhjäksi tai poista)
            // Tärkeää: Poistetaan vain se tietty kirjain, ei koko sanan kirjainta
            const indexToRemove = letters.findIndex(l =>
                l.letter === food.letter &&
                l.color === food.color &&
                l.wordOriginalIndex === food.wordOriginalIndex
            );

            if (indexToRemove > -1) {
                letters.splice(indexToRemove, 1);
            }

            // Generoi uusi ruoka
            food = generateFood();
            if (!food) {
                // Kaikki kirjaimet syöty, näytä infokontaineri
                clearInterval(game);
                infoContainer.style.display = 'block';
            }
        } else {
            // Jos ruokaa ei syöty, poista hännän pää (mato liikkuu)
            snake.pop();
        }

        let newHead = {
            x: snakeX,
            y: snakeY
        };

        if (collision(newHead, snake)) {
            lives--;
            livesElement.textContent = lives;
            if (lives <= 0) {
                clearInterval(game);
                alert('Peli päättyi! Kaikki elämät käytetty.');
                return;
            } else {
                alert(`Törmäys! Sinulla on vielä ${lives} elämää jäljellä.`);
                snake = [{x: snake[0].x, y: snake[0].y}]; // Palauta mato alkuperäiseen kokoon, mutta säilytä paikka
                direction = null; // Nollaa suunta törmäyksen jälkeen
                return;
            }
        }

        // Käärmeen liikkuminen reunojen yli
        if (snakeX < 0) snakeX = canvas.width - box;
        if (snakeY < 0) snakeY = canvas.height - box;
        if (snakeX >= canvas.width) snakeX = 0;
        if (snakeY >= canvas.height) snakeY = 0;

        snake.unshift({x: snakeX, y: snakeY});
    }

    function collision(head, array) {
        for (let i = 1; i < array.length; i++) {
            if (head.x === array[i].x && head.y === array[i].y) {
                return true;
            }
        }
        return false;
    }

    function setDirection(dir) {
        if (dir === 'LEFT' && direction !== 'RIGHT') {
            direction = 'LEFT';
        } else if (dir === 'UP' && direction !== 'DOWN') {
            direction = 'UP';
        } else if (dir === 'RIGHT' && direction !== 'LEFT') {
            direction = 'RIGHT';
        } else if (dir === 'DOWN' && direction !== 'UP') {
            direction = 'DOWN';
        }
    }

    function resetGame() {
        clearInterval(game);
        snake = [{x: 9 * box, y: 10 * box}];
        direction = null;
        lives = 3;
        livesElement.textContent = lives;

        // Alusta letters-lista uudelleen alkuperäisistä sanoista
        letters = wordsConfig.flatMap((item, wordOriginalIndex) =>
            shuffleWord(item.word.toUpperCase()).split('').map(letter => ({
                letter: letter,
                color: item.color,
                wordOriginalIndex: wordOriginalIndex
            }))
        );

        setupEatenLettersContainer(); // Luodaan rivit uudelleen tyhjinä
        infoContainer.style.display = 'none';
        congratulationsMessage.innerHTML = '';
        food = generateFood(); // Generoi uusi ruoka
        game = setInterval(drawGame, 200);
    }

    document.getElementById('pause-button').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pause-button').textContent = isPaused ? 'JATKA' : 'PAUSE';
    });

    document.getElementById('restart-button').addEventListener('click', resetGame);

    submitButton.addEventListener('click', () => {
        if (answerInput.value.toLowerCase() === correctAnswer.toLowerCase()) {
            congratulationsMessage.innerHTML = `Onnea! "${correctAnswer}" oli oikein! Chekkeri hyväksyy seuraavan lauseen: SateenJälkeenOnPoutaSää`;
        } else {
            alert('Väärä vastaus. Yritä uudelleen.');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && direction !== 'RIGHT') {
            direction = 'LEFT';
        } else if (e.key === 'ArrowUp' && direction !== 'DOWN') {
            direction = 'UP';
        } else if (e.key === 'ArrowRight' && direction !== 'LEFT') {
            direction = 'RIGHT';
        } else if (e.key === 'ArrowDown' && direction !== 'UP') {
            direction = 'DOWN';
        }
    });

    // Kutsu setupEatenLettersContainer pelin alussa, kun DOM on latautunut
    setupEatenLettersContainer();
});
