const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 16;
const PLAYER_COLOR = "#4CAF50";
const AI_COLOR = "#F44336";
const BALL_COLOR = "#fff";
const NET_COLOR = "#fff";

// Game objects
let player = { x: PADDLE_MARGIN, y: canvas.height/2 - PADDLE_HEIGHT/2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
let ai = { x: canvas.width - PADDLE_MARGIN - PADDLE_WIDTH, y: canvas.height/2 - PADDLE_HEIGHT/2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
let ball = { x: canvas.width/2, y: canvas.height/2, size: BALL_SIZE, speed: 5, dx: 5, dy: 5 };

// Track mouse for player paddle movement
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    player.y = mouseY - player.height/2;
    // Prevent paddle from going out of bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Draw net
function drawNet() {
    for (let i = 0; i < canvas.height; i += 24) {
        ctx.fillStyle = NET_COLOR;
        ctx.fillRect(canvas.width/2 - 2, i, 4, 16);
    }
}

// Draw paddles and ball
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size/2, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawRect(player.x, player.y, player.width, player.height, PLAYER_COLOR);
    drawRect(ai.x, ai.y, ai.width, ai.height, AI_COLOR);
    drawBall(ball.x, ball.y, ball.size, BALL_COLOR);
}

// Ball movement and collision
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top & bottom wall collision
    if (ball.y - ball.size/2 < 0 || ball.y + ball.size/2 > canvas.height) {
        ball.dy = -ball.dy;
    }

    // Player paddle collision
    if (
        ball.x - ball.size/2 < player.x + player.width &&
        ball.x - ball.size/2 > player.x &&
        ball.y + ball.size/2 > player.y &&
        ball.y - ball.size/2 < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        // Optional: add some variation to ball angle
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angle = collidePoint * Math.PI/4; // Max bounce angle = 45 deg
        let direction = ball.dx > 0 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    }

    // AI paddle collision
    if (
        ball.x + ball.size/2 > ai.x &&
        ball.x + ball.size/2 < ai.x + ai.width &&
        ball.y + ball.size/2 > ai.y &&
        ball.y - ball.size/2 < ai.y + ai.height
    ) {
        ball.dx = -ball.dx;
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);
        let angle = collidePoint * Math.PI/4;
        let direction = ball.dx > 0 ? 1 : -1;
        ball.dx = direction * ball.speed * Math.cos(angle);
        ball.dy = ball.speed * Math.sin(angle);
    }

    // Left or right wall (score)
    if (ball.x - ball.size/2 < 0) {
        ai.score++;
        resetBall();
    }
    if (ball.x + ball.size/2 > canvas.width) {
        player.score++;
        resetBall();
    }
}

// AI movement (simple follow ball)
function updateAI() {
    let target = ball.y - ai.height/2;
    // Smooth movement for AI (add some difficulty)
    ai.y += (target - ai.y) * 0.09;
    // Prevent AI paddle from going out of bounds
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

function resetBall() {
    ball.x = canvas.width/2;
    ball.y = canvas.height/2;
    ball.speed = 5;
    // Start ball towards last scorer
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() * 2 - 1) * ball.speed;
}

// Draw scores
function drawScores() {
    ctx.fillStyle = "#fff";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.fillText(player.score, canvas.width / 4, 48);
    ctx.fillText(ai.score, 3 * canvas.width / 4, 48);
}

// Main game loop
function gameLoop() {
    updateBall();
    updateAI();
    draw();
    drawScores();
    requestAnimationFrame(gameLoop);
}

gameLoop();