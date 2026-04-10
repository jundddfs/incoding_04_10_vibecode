const ROWS = 10;
const COLS = 17;

const boardElement = document.getElementById('board');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const resetBtn = document.getElementById('reset-btn');
const modalResetBtn = document.getElementById('modal-reset-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElement = document.getElementById('final-score');

let grid = [];
let isDragging = false;
let startCell = null;
let currentCell = null;
let score = 0;
let timeLeft = 120;
let timerInterval = null;
let gameActive = false;

function initGame() {
    grid = [];
    boardElement.innerHTML = '<div id="selection-box" class="selection-box"></div>';
    score = 0;
    timeLeft = 120;
    gameActive = true;
    isDragging = false;
    startCell = null;
    currentCell = null;

    updateScore();
    updateTimer();

    gameOverModal.classList.remove('active');

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            const val = Math.floor(Math.random() * 9) + 1;
            const cellEl = document.createElement('div');
            cellEl.classList.add('apple-cell');
            cellEl.dataset.r = r;
            cellEl.dataset.c = c;
            cellEl.innerText = val;

            boardElement.appendChild(cellEl);

            grid[r][c] = {
                val: val,
                cleared: false,
                element: cellEl
            };
        }
    }
}

function updateScore() {
    scoreElement.innerText = score;
}

function updateTimer() {
    timerElement.innerText = timeLeft;
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    finalScoreElement.innerText = score;
    gameOverModal.classList.add('active');
    isDragging = false;
    document.getElementById('selection-box').style.display = 'none';
    clearHighlights();
}

function getSelectedRange(r1, c1, r2, c2) {
    return {
        rMin: Math.min(r1, r2),
        rMax: Math.max(r1, r2),
        cMin: Math.min(c1, c2),
        cMax: Math.max(c1, c2)
    };
}

function renderSelection() {
    if (!startCell || !currentCell) return;
    
    const { rMin, rMax, cMin, cMax } = getSelectedRange(startCell.r, startCell.c, currentCell.r, currentCell.c);
    
    const tlCell = grid[rMin][cMin].element;
    const brCell = grid[rMax][cMax].element;

    const top = tlCell.offsetTop;
    const left = tlCell.offsetLeft;
    const width = brCell.offsetLeft + brCell.offsetWidth - left;
    const height = brCell.offsetTop + brCell.offsetHeight - top;

    const selBox = document.getElementById('selection-box');
    selBox.style.display = 'block';
    selBox.style.top = top + 'px';
    selBox.style.left = left + 'px';
    selBox.style.width = width + 'px';
    selBox.style.height = height + 'px';

    clearHighlights();
    for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
            if (!grid[r][c].cleared) {
                grid[r][c].element.classList.add('highlight');
            }
        }
    }
}

function clearHighlights() {
    const highlights = document.querySelectorAll('.apple-cell.highlight');
    highlights.forEach(el => el.classList.remove('highlight'));
}

document.addEventListener('mousedown', (e) => {
    if (!gameActive) return;
    const cellEl = e.target.closest('.apple-cell');
    if (cellEl && !cellEl.classList.contains('cleared')) {
        isDragging = true;
        const r = parseInt(cellEl.dataset.r);
        const c = parseInt(cellEl.dataset.c);
        startCell = { r, c };
        currentCell = { r, c };
        renderSelection();
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging || !gameActive) return;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;
    const cellEl = element.closest('.apple-cell');
    if (cellEl) {
        const r = parseInt(cellEl.dataset.r);
        const c = parseInt(cellEl.dataset.c);
        if (currentCell.r !== r || currentCell.c !== c) {
            currentCell = { r, c };
            renderSelection();
        }
    }
});

document.addEventListener('mouseup', (e) => {
    if (!isDragging || !gameActive) return;
    isDragging = false;
    
    document.getElementById('selection-box').style.display = 'none';
    
    if (startCell && currentCell) {
        const { rMin, rMax, cMin, cMax } = getSelectedRange(startCell.r, startCell.c, currentCell.r, currentCell.c);
        
        let sum = 0;
        let selectedCells = [];
        
        for (let r = rMin; r <= rMax; r++) {
            for (let c = cMin; c <= cMax; c++) {
                if (!grid[r][c].cleared) {
                    sum += grid[r][c].val;
                    selectedCells.push(grid[r][c]);
                }
            }
        }
        
        if (sum === 10) {
            selectedCells.forEach(cell => {
                cell.cleared = true;
                cell.element.classList.add('cleared');
                setTimeout(() => {
                    const newVal = Math.floor(Math.random() * 9) + 1;
                    cell.val = newVal;
                    cell.element.innerText = newVal;
                    cell.element.classList.remove('cleared');
                    cell.cleared = false;
                    cell.element.classList.add('appear');
                    setTimeout(() => cell.element.classList.remove('appear'), 300);
                }, 300); // Wait for the popOut animation to finish
            });
            score += 10;
            updateScore();
            
            // Spawn floating text
            const floatingText = document.createElement('div');
            floatingText.classList.add('floating-score');
            floatingText.innerText = '+10';
            floatingText.style.left = `${e.clientX}px`;
            floatingText.style.top = `${e.clientY - 20}px`;
            document.body.appendChild(floatingText);

            setTimeout(() => {
                floatingText.remove();
            }, 800);
        }
    }
    
    clearHighlights();
    startCell = null;
    currentCell = null;
});

// Prevent default drag behaviors
boardElement.addEventListener('dragstart', (e) => e.preventDefault());

resetBtn.addEventListener('click', initGame);
modalResetBtn.addEventListener('click', initGame);

// Start game initially
initGame();
