// Configurações do jogo
const BOARD_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / BOARD_SIZE;
const GAME_SPEED = 150;

// Estado do jogo
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 0, y: -1 };
let gameOver = false;
let score = 0;
let gameStarted = false;
let isPaused = false;
let gameLoop = null;

// Elementos DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');

// Cores do jogo
const COLORS = {
    background: 'hsla(0, 0%, 100%, 1.00)',
    snakeHead: 'hsl(120, 100%, 50%)',
    snakeBody: 'hsl(120, 100%, 45%)',
    food: 'hsl(0, 100%, 60%)',
    grid: 'hsl(220, 15%, 20%)'
};

// Inicialização
function init() {
    setupEventListeners();
    drawGame();
}

// Event Listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', resetGame);
    
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
    if (!gameStarted) {
        if (e.code === 'Space') {
            e.preventDefault();
            startGame();
        }
        return;
    }

    if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
        return;
    }

    if (isPaused || gameOver) return;

    const keyDirections = {
        'ArrowUp': { x: 0, y: -1 },
        'ArrowDown': { x: 0, y: 1 },
        'ArrowLeft': { x: -1, y: 0 },
        'ArrowRight': { x: 1, y: 0 }
    };

    const newDirection = keyDirections[e.code];
    if (newDirection) {
        e.preventDefault();
        // Prevenir direção reversa
        if (newDirection.x === -direction.x && newDirection.y === -direction.y) {
            return;
        }
        direction = newDirection;
    }
}

// Funções do jogo
function startGame() {
    gameStarted = true;
    isPaused = false;
    startScreen.style.display = 'none';
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    
    gameLoop = setInterval(moveSnake, GAME_SPEED);
    showMessage('Jogo iniciado! Use as setas para mover');
}

function togglePause() {
    if (!gameStarted || gameOver) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameLoop);
        pauseBtn.textContent = 'Continuar';
        showMessage('Jogo pausado');
    } else {
        gameLoop = setInterval(moveSnake, GAME_SPEED);
        pauseBtn.textContent = 'Pausar';
        showMessage('Jogo retomado');
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 0, y: -1 };
    gameOver = false;
    score = 0;
    gameStarted = false;
    isPaused = false;
    
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    updateScore();
    gameOverScreen.style.display = 'none';
    startScreen.style.display = 'flex';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    canvas.classList.remove('game-over-flash');
    
    drawGame();
}

function moveSnake() {
    if (gameOver || isPaused || !gameStarted) return;

    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Verificar colisão com paredes
    if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        endGame('Você bateu na parede!');
        return;
    }

    // Verificar colisão consigo mesmo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame('Você bateu em si mesmo!');
        return;
    }

    snake.unshift(head);

    // Verificar se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        food = generateFood();
        showMessage(`Pontuação: ${score}!`);
    } else {
        snake.pop();
    }

    drawGame();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * BOARD_SIZE),
            y: Math.floor(Math.random() * BOARD_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

function endGame(message) {
    gameOver = true;
    clearInterval(gameLoop);
    
    canvas.classList.add('game-over-flash');
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'flex';
    pauseBtn.style.display = 'none';
    
    showMessage(message);
}

function updateScore() {
    scoreElement.textContent = score;
}

// Funções de desenho
function drawGame() {
    clearCanvas();
    drawGrid();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function drawGrid() {
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i <= BOARD_SIZE; i++) {
        const pos = i * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, CANVAS_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(CANVAS_SIZE, pos);
        ctx.stroke();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const x = segment.x * CELL_SIZE;
        const y = segment.y * CELL_SIZE;
        
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        
        // Efeito de brilho para a cabeça
        if (index === 0) {
            ctx.shadowColor = COLORS.snakeHead;
            ctx.shadowBlur = 10;
            ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.shadowBlur = 0;
        }
    });
}

function drawFood() {
    const x = food.x * CELL_SIZE;
    const y = food.y * CELL_SIZE;
    
    ctx.fillStyle = COLORS.food;
    ctx.shadowColor = COLORS.food;
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, (CELL_SIZE - 4) / 2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// Sistema de mensagens simples
function showMessage(message) {
    console.log(message); // Por simplicidade, usando console.log
    // Em uma implementação mais completa, você poderia criar um toast/notification
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', init);
