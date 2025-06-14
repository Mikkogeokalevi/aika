document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const eatenLettersContainer = document.getElementById('eaten-letters-container');
    const livesHeartsElement = document.getElementById('lives-hearts');
    const infoContainer = document.getElementById('info-container');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const congratulationsMessage = document.getElementById('congratulations-message');
    
    // Uudet elementit info-modaalia varten
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const closeButton = document.querySelector('.close-button');

    const box = 20;
    let snake = [{x: 9 * box, y: 10 * box}];
    let direction = null;
    let lives = 3;
    let lettersEatenCount = 0; // UUSI: Laskuri syötyille kirjaimille
    let bomb = null; // UUSI: Pommi-olio

    // Sanat ja värit – pidä nämä samassa järjestyksessä kuin haluat niiden näkyvän!
    const wordsConfig = [
        { word: "Kirjasto", color: "#FF5733" }, // Oranssinpunainen
        { word: "virkailijan", color: "#33FF57" }, // Vihreä
        { word: "perjantai", color: "#3357FF" }, // Sininen
        { word: "on", color: "#FFFF00" },       // Uusi sana, keltainen
        { word: "työn", color: "#8A2BE2" },     // Uusi sana, sinivioletti
        { word: "täyteinen", color: "#FF1493" } // Uusi sana, syvän vaaleanpunainen
    ];
    // Päivitetty oikea vastaus sisältäen uudet sanat
    const correctAnswer = "kirjastovirkailijanperjantaiontyöntäyteinen"; 

    const snakeGrowthWords = ["MIKKO", "KALEVIN", "MATO"];

    // Muodosta alkuperäiset kirjaimet syötäviksi ja tallenna alkuperäinen indeksi
    let letters = wordsConfig.flatMap((item, wordOriginalIndex) =>
        shuffleWord(item.word.toUpperCase()).split('').map(letter => ({
            letter: letter,
            color: item.color,
            wordOriginalIndex: wordOriginalIndex // Lisää alkuperäisen sanan indeksi
        }))
    );

    let food = null; 
    let game = null;
    let isPaused = false;
    let snakeHeadImage = new Image();

    // Kuvanlatauspaikka: varmista, että mato_paa.jpg on samassa kansiossa!
    snakeHeadImage.src = 'mato_paa.jpg'; 

    snakeHeadImage.onload = startGame; // Käynnistä peli, kun kuva latautuu onnistuneesti
    snakeHeadImage.onerror = () => { // Käynnistä peli, vaikka kuvan lataus epäonnistuisi
        console.error("Failed to load snake head image. Starting game with fallback.");
        startGame();
    };

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

    // Funktio päivittää sydämet
    function updateLivesDisplay() {
        livesHeartsElement.innerHTML = ''; // Tyhjennä vanhat sydämet
        for (let i = 0; i < lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'heart-icon';
            heart.textContent = '❤️'; // Sydänmerkki
            livesHeartsElement.appendChild(heart);
        }
    }

    // Funktio generoi vapaan sijainnin kentältä
    function getRandomPosition() {
        let x, y;
        let collisionDetected;
        do {
            collisionDetected = false;
            x = Math.floor(Math.random() * (canvas.width / box)) * box;
            y = Math.floor(Math.random() * (canvas.height / box)) * box;

            // Tarkista, ettei sijainti mene käärmeen päälle
            for (let i = 0; i < snake.length; i++) {
                if (x === snake[i].x && y === snake[i].y) {
                    collisionDetected = true;
                    break;
                }
            }
            // Tarkista, ettei sijainti mene ruoan päälle (jos ruoka on jo olemassa)
            if (!collisionDetected && food && x === food.x && y === food.y) {
                collisionDetected = true;
            }
            // Tarkista, ettei sijainti mene pommin päälle (jos pommi on jo olemassa)
            if (!collisionDetected && bomb && x === bomb.x && y === bomb.y) {
                collisionDetected = true;
            }

        } while (collisionDetected);
        return { x, y };
    }

    // Generoi ruokaa jäljellä olevista kirjaimista
    function generateFood() {
        const availableLetters = letters.filter(l => l.letter !== '');
        if (availableLetters.length === 0) {
            return null; // Kaikki kirjaimet syöty
        }

        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const selectedLetter = availableLetters[randomIndex];

        const pos = getRandomPosition(); // Käytä uutta funktiota vapaan paikan löytämiseen
        return {
            x: pos.x,
            y: pos.y,
            letter: selectedLetter.letter,
            color: selectedLetter.color,
            wordOriginalIndex: selectedLetter.wordOriginalIndex
        };
    }

    // Generoi pommin
    function generateBomb() {
        const pos = getRandomPosition(); // Käytä uutta funktiota vapaan paikan löytämiseen
        return {
            x: pos.x,
            y: pos.y,
            type: 'bomb'
        };
    }

    // Funktio pelin käynnistämiseen
    function startGame() {
        if (!game) { 
            game = setInterval(drawGame, 200);
            food = generateFood(); 
            updateLivesDisplay(); 
        }
    }

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

    function drawGame() {
        if (isPaused) return;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < snake.length; i++) {
            if (i === 0) {
                if (snakeHeadImage.complete && snakeHeadImage.naturalHeight !== 0) {
                    ctx.drawImage(snakeHeadImage, snake[i].x, snake[i].y, box, box);
                } else {
                    ctx.fillStyle = '#8BC34A'; 
                    ctx.fillRect(snake[i].x, snake[i].y, box, box);
                }
            } else if (i <= snakeGrowthWords.join('').length) {
                const letterIndex = (i - 1) % snakeGrowthWords.join('').length;
                ctx.fillStyle = '#8BC34A'; 
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
                ctx.fillStyle = 'black';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(snakeGrowthWords.join('')[letterIndex], snake[i].x + box / 2, snake[i].y + box / 2);
            } else {
                ctx.fillStyle = '#8BC34A'; 
                ctx.fillRect(snake[i].x, snake[i].y, box, box);
            }
            ctx.strokeStyle = 'white';
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }

        // Piirrä ruoka
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

        // Piirrä pommi
        if (bomb) {
            ctx.fillStyle = 'black'; // Pommin väri
            ctx.beginPath();
            ctx.roundRect(bomb.x, bomb.y, box, box, 10);
            ctx.fill();

            ctx.fillStyle = 'red'; // Tekstin väri pommissa
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💣', bomb.x + box / 2, bomb.y + box / 2); // Pommi-emoji
        }

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        if (direction === 'LEFT') snakeX -= box;
        if (direction === 'UP') snakeY -= box;
        if (direction === 'RIGHT') snakeX += box;
        if (direction === 'DOWN') snakeY += box;

        // TÄRKEÄ MUUTOS: Tarkista törmäys ensin pommiin, sitten ruokaan
        // Tarkista pommiin osuma
        if (bomb && snakeX === bomb.x && snakeY === bomb.y) {
            lives--;
            updateLivesDisplay();
            bomb = null; // Pommi katoaa
            if (lives <= 0) {
                clearInterval(game);
                game = null;
                alert('Peli päättyi! Söit pommin ja kaikki elämät loppuivat.');
                return;
            } else {
                alert(`OUCH! Söit pommin! Sinulla on vielä ${lives} elämää jäljellä.`);
                snake = [{x: snake[0].x, y: snake[0].y}]; // Mato takaisin alkuun
                direction = null; // Nollaa suunta
                return;
            }
        }

        // Jos käärme syö ruoan
        if (food && snakeX === food.x && snakeY === food.y) {
            const eatenLetterDiv = document.createElement('div');
            eatenLetterDiv.className = 'eaten-letter';
            eatenLetterDiv.style.backgroundColor = food.color;
            eatenLetterDiv.textContent = food.letter;

            const targetColorRow = colorRows[food.wordOriginalIndex];
            if (targetColorRow) {
                targetColorRow.appendChild(eatenLetterDiv);
            }

            const indexToRemove = letters.findIndex(l =>
                l.letter === food.letter &&
                l.color === food.color &&
                l.wordOriginalIndex === food.wordOriginalIndex
            );

            if (indexToRemove > -1) {
                letters.splice(indexToRemove, 1);
            }

            lettersEatenCount++; // Kasvata syötyjen kirjainten määrää

            // Jos 10 kirjainta on syöty ja joka 5. kirjain sen jälkeen, generoi pommi
            if (lettersEatenCount >= 10 && (lettersEatenCount % 5 === 0)) {
                bomb = generateBomb();
            } else {
                bomb = null; // Varmista, ettei pommi ole paikalla, jos ei pitäisi
            }

            food = generateFood();
            if (!food) {
                clearInterval(game);
                game = null;
                infoContainer.style.display = 'block';
            }
        } else {
            snake.pop();
        }

        let newHead = {
            x: snakeX,
            y: snakeY
        };

        if (collision(newHead, snake)) {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                clearInterval(game);
                game = null;
                alert('Peli päättyi! Kaikki elämät käytetty.');
                return;
            } else {
                alert(`Törmäys! Sinulla on vielä ${lives} elämää jäljellä.`);
                snake = [{x: snake[0].x, y: snake[0].y}];
                direction = null; 
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
        game = null; 
        snake = [{x: 9 * box, y: 10 * box}];
        direction = null;
        lives = 3;
        lettersEatenCount = 0; // Nollaa laskuri
        bomb = null; // Nollaa pommi
        updateLivesDisplay(); 

        letters = wordsConfig.flatMap((item, wordOriginalIndex) =>
            shuffleWord(item.word.toUpperCase()).split('').map(letter => ({
                letter: letter,
                color: item.color,
                wordOriginalIndex: wordOriginalIndex
            }))
        );

        setupEatenLettersContainer(); 
        infoContainer.style.display = 'none';
        congratulationsMessage.innerHTML = '';
        food = generateFood(); 
        startGame(); 
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

    // Info-modaalin tapahtumankäsittelijät
    infoButton.addEventListener('click', () => {
        infoModal.style.display = 'flex'; 
        if (game) { 
            clearInterval(game);
            game = null; 
        }
    });

    closeButton.addEventListener('click', () => {
        infoModal.style.display = 'none'; 
        if (!isPaused) { 
            startGame(); 
        }
    });

    // Sulje modaali, jos käyttäjä klikkaa modaalin ulkopuolelle
    window.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            infoModal.style.display = 'none';
            if (!isPaused) {
                startGame();
            }
        }
    });

    setupEatenLettersContainer();
    updateLivesDisplay(); 
});
