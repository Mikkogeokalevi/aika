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

const words = ["Kirjasto", "virkailijan", "perjantai"];
const colors = ["#FF5733", "#33FF57", "#3357FF"];
const correctAnswer = "kirjastovirkailijanperjantai";
const snakeGrowthWords = ["MIKKO", "KALEVIN", "MATO"];

let letters = words.map((word, index) => ({
    word: shuffleWord(word.toUpperCase()),
    color: colors[index]
}));

let food = generateFood();
let game = null;
let isPaused = false;
let snakeHeadImage = new Image();

snakeHeadImage.onload = function() {
    game = setInterval(drawGame, 200);
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

function generateFood() {
    const wordIndex = Math.floor(Math.random() * letters.length);
    const word = letters[wordIndex].word;
    const letterIndex = Math.floor(Math.random() * word.length);
    const letter = word[letterIndex];

    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 20) * box,
        letter: letter,
        color: letters[wordIndex].color,
        wordIndex: wordIndex
    };
}

function drawGame() {
    if (isPaused) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            ctx.drawImage(snakeHeadImage, snake[i].x, snake[i].y, box, box);
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

    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.roundRect(food.x, food.y, box, box, 10);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(food.letter, food.x + box / 2, food.y + box / 2);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        const eatenLetterDiv = document.createElement('div');
        eatenLetterDiv.className = 'eaten-letter';
        eatenLetterDiv.style.backgroundColor = food.color;
        eatenLetterDiv.textContent = food.letter;

        let colorRow = document.querySelector(`.color-row[data-color="${food.color}"]`);
        if (!colorRow) {
            colorRow = document.createElement('div');
            colorRow.className = 'color-row';
            colorRow.setAttribute('data-color', food.color);
            eatenLettersContainer.appendChild(colorRow);
        }

        colorRow.appendChild(eatenLetterDiv);

        letters[food.wordIndex].word = letters[food.wordIndex].word.replace(food.letter, '');
        if (letters[food.wordIndex].word.length === 0) {
            letters.splice(food.wordIndex, 1);
        }

        if (letters.length === 0) {
            clearInterval(game);
            infoContainer.style.display = 'block';
        } else {
            food = generateFood();
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
        livesElement.textContent = lives;
        if (lives <= 0) {
            clearInterval(game);
            alert('Peli päättyi! Kaikki elämät käytetty.');
            return;
        } else {
            alert(`Törmäys! Sinulla on vielä ${lives} elämää jäljellä.`);
            snake = [{x: snake[0].x, y: snake[0].y}];
            direction = null;
            return;
        }
    }

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
    letters = words.map((word, index) => ({
        word: shuffleWord(word.toUpperCase()),
        color: colors[index]
    }));
    eatenLettersContainer.innerHTML = '';
    infoContainer.style.display = 'none';
    congratulationsMessage.innerHTML = '';
    food = generateFood();
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
