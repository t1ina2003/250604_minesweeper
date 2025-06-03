document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('game-board');
    const minesCountElement = document.getElementById('mines-count');
    const resetButton = document.getElementById('reset-button');

    const rows = 10;
    const cols = 10;
    const minesCount = 10;
    let board = [];
    let revealedCells = 0;
    let flagsPlaced = 0;
    let gameOver = false;

    function initializeBoard() {
        board = [];
        revealedCells = 0;
        flagsPlaced = 0;
        gameOver = false;
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        gameBoard.style.gridTemplateRows = `repeat(${rows}, 30px)`;
        minesCountElement.textContent = `地雷數量: ${minesCount - flagsPlaced}`;

        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('contextmenu', handleCellRightClick);
                gameBoard.appendChild(cell);
                row.push({
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0,
                    element: cell
                });
            }
            board.push(row);
        }
        placeMines();
        calculateAdjacentMines();
    }

    function placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < minesCount) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            if (!board[r][c].isMine) {
                board[r][c].isMine = true;
                minesPlaced++;
            }
        }
    }

    function calculateAdjacentMines() {
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (board[r][c].isMine) continue;
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i === 0 && j === 0) continue;
                        const nr = r + i;
                        const nc = c + j;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                board[r][c].adjacentMines = count;
            }
        }
    }

    function handleCellClick(event) {
        if (gameOver) return;
        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);
        const cellData = board[r][c];

        if (cellData.isRevealed || cellData.isFlagged) return;

        revealCell(r, c);
    }

    function handleCellRightClick(event) {
        event.preventDefault(); // 防止瀏覽器右鍵選單
        if (gameOver) return;
        const cellElement = event.target;
        const r = parseInt(cellElement.dataset.row);
        const c = parseInt(cellElement.dataset.col);
        const cellData = board[r][c];

        if (cellData.isRevealed) return;

        cellData.isFlagged = !cellData.isFlagged;
        cellData.element.classList.toggle('flagged', cellData.isFlagged);
        flagsPlaced += cellData.isFlagged ? 1 : -1;
        minesCountElement.textContent = `地雷數量: ${minesCount - flagsPlaced}`;
    }

    function revealCell(r, c) {
        const cellData = board[r][c];
        if (cellData.isRevealed || cellData.isFlagged) return;

        cellData.isRevealed = true;
        cellData.element.classList.add('revealed');
        revealedCells++;

        if (cellData.isMine) {
            cellData.element.classList.add('mine');
            cellData.element.textContent = '💣';
            endGame(false);
            return;
        }

        if (cellData.adjacentMines > 0) {
            cellData.element.textContent = cellData.adjacentMines;
        } else {
            // 如果格子沒有相鄰的地雷，則遞迴揭開周圍的格子
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const nr = r + i;
                    const nc = c + j;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        revealCell(nr, nc);
                    }
                }
            }
        }

        if (revealedCells === rows * cols - minesCount) {
            endGame(true);
        }
    }

    function endGame(win) {
        gameOver = true;
        if (win) {
            alert('恭喜！你贏了！');
        } else {
            alert('遊戲結束！你踩到地雷了！');
            // 揭開所有地雷
            board.forEach(row => {
                row.forEach(cell => {
                    if (cell.isMine) {
                        cell.element.classList.add('mine', 'revealed');
                        cell.element.textContent = '💣';
                    }
                });
            });
        }
    }

    resetButton.addEventListener('click', initializeBoard);

    // 初始化遊戲
    initializeBoard();
});
