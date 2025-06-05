$(document).ready(function() {
            // Tic Tac Toe Game Logic
            let gameBoard = ['', '', '', '', '', '', '', '', ''];
            let gameActive = true;
            let currentPlayer = 'O';

            const winningCombos = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6] // Diagonals
            ];

            setTimeout(computerMove, 500);

            $('.cell').click(function() {
                const index = $(this).data('index');
                if (gameBoard[index] === '' && gameActive) {
                    makeMove(index, 'X');
                    if (gameActive) {
                        setTimeout(computerMove, 500);
                    }
                }
            });

            $('#resetBtn').click(function() {
                resetGame();
                setTimeout(computerMove, 500);
            });

            function makeMove(index, player) {
                gameBoard[index] = player;
                const cell = $('.cell').eq(index);
                cell.text(player).attr('data-player', player);
                cell.addClass('animate__animated animate__zoomIn');
                
                if (checkWin(player)) {
                    gameActive = false;
                    highlightWinningCells(player);
                    $('#message').text(player === 'X' ? 'You win!' : 'Computer wins!')
                        .addClass('animate__animated animate__bounceIn');
                    return;
                }

                if (checkDraw()) {
                    gameActive = false;
                    $('#message').text("It's a draw!")
                        .addClass('animate__animated animate__bounceIn');
                }
            }

            function computerMove() {
                // First, check if computer can win
                let winningMove = findWinningMove('O');
                if (winningMove !== -1) {
                    makeMove(winningMove, 'O');
                    return;
                }

                // Then, block player's winning move
                let blockingMove = findWinningMove('X');
                if (blockingMove !== -1) {
                    makeMove(blockingMove, 'O');
                    return;
                }

                // If it's the first move, take center
                if (gameBoard.every(cell => cell === '')) {
                    makeMove(4, 'O');
                    return;
                }

                // Create a fork opportunity if possible
                let forkMove = findForkMove();
                if (forkMove !== -1) {
                    makeMove(forkMove, 'O');
                    return;
                }

                // Take corners
                const corners = [0, 2, 6, 8];
                const availableCorners = corners.filter(corner => gameBoard[corner] === '');
                if (availableCorners.length > 0) {
                    makeMove(availableCorners[0], 'O');
                    return;
                }

                // Take any available edge
                const edges = [1, 3, 5, 7];
                const availableEdges = edges.filter(edge => gameBoard[edge] === '');
                if (availableEdges.length > 0) {
                    makeMove(availableEdges[0], 'O');
                    return;
                }
            }

            function findForkMove() {
                // Check for potential fork opportunities
                for (let i = 0; i < gameBoard.length; i++) {
                    if (gameBoard[i] === '') {
                        gameBoard[i] = 'O';
                        let winningPaths = 0;
                        
                        // Count how many winning paths this move creates
                        winningCombos.forEach(combo => {
                            let count = 0;
                            combo.forEach(index => {
                                if (gameBoard[index] === 'O') count++;
                            });
                            if (count === 2) winningPaths++;
                        });

                        gameBoard[i] = '';
                        if (winningPaths >= 2) return i;
                    }
                }
                return -1;
            }

            function findWinningMove(player) {
                for (let i = 0; i < gameBoard.length; i++) {
                    if (gameBoard[i] === '') {
                        gameBoard[i] = player;
                        if (checkWin(player)) {
                            gameBoard[i] = '';
                            return i;
                        }
                        gameBoard[i] = '';
                    }
                }
                return -1;
            }

            function checkWin(player) {
                return winningCombos.some(combo => {
                    return combo.every(index => gameBoard[index] === player);
                });
            }

            function highlightWinningCells(player) {
                winningCombos.forEach(combo => {
                    if (combo.every(index => gameBoard[index] === player)) {
                        combo.forEach(index => {
                            $('.cell').eq(index)
                                .addClass('winning-cell animate__animated animate__pulse');
                        });
                    }
                });
            }

            function checkDraw() {
                return gameBoard.every(cell => cell !== '');
            }

            function resetGame() {
                gameBoard = ['', '', '', '', '', '', '', '', ''];
                gameActive = true;
                currentPlayer = 'O';
                $('.cell').text('').removeClass('winning-cell animate__animated animate__pulse')
                    .removeAttr('data-player');
                $('#message').text('').removeClass('animate__animated animate__bounceIn');
            }

            // Connect Four Game Logic
            let connect4Board = Array(4).fill().map(() => Array(4).fill(''));
            let connect4Active = true;
            let connect4CurrentPlayer = 'red';

            const connect4WinningCombos = [
                // Horizontal
                [[0,0], [0,1], [0,2], [0,3]], [[1,0], [1,1], [1,2], [1,3]],
                [[2,0], [2,1], [2,2], [2,3]], [[3,0], [3,1], [3,2], [3,3]],
                // Vertical
                [[0,0], [1,0], [2,0], [3,0]], [[0,1], [1,1], [2,1], [3,1]],
                [[0,2], [1,2], [2,2], [3,2]], [[0,3], [1,3], [2,3], [3,3]],
                // Diagonal
                [[0,0], [1,1], [2,2], [3,3]], [[0,3], [1,2], [2,1], [3,0]]
            ];

            // Make computer's first move
            setTimeout(computerConnect4Move, 500);

            $('.connect4-cell').click(function() {
                if (!connect4Active) return;
                
                const col = $(this).data('col');
                const row = findLowestEmptyRow(col);
                
                if (row !== -1) {
                    // Check if this move would create a winning opportunity for player
                    connect4Board[row][col] = 'red';
                    let wouldWin = checkConnect4Win('red');
                    connect4Board[row][col] = '';
                    
                    if (wouldWin) {
                        // If player would win, computer takes that spot instead
                        makeConnect4Move(col, row, 'yellow');
                        setTimeout(computerConnect4Move, 500);
                    } else {
                        // Otherwise, allow player's move
                        makeConnect4Move(col, row, 'red');
                        if (connect4Active) {
                            setTimeout(computerConnect4Move, 500);
                        }
                    }
                }
            });

            function findLowestEmptyRow(col) {
                for (let row = 3; row >= 0; row--) {
                    if (connect4Board[row][col] === '') {
                        return row;
                    }
                }
                return -1;
            }

            $('#resetConnect4Btn').click(function() {
                resetConnect4Game();
                setTimeout(computerConnect4Move, 500);
            });

            function makeConnect4Move(col, row, player) {
                connect4Board[row][col] = player;
                const cell = $(`.connect4-cell[data-col="${col}"][data-row="${row}"]`);
                cell.attr('data-player', player)
                    .addClass('animate__animated animate__zoomIn');

                if (checkConnect4Win(player)) {
                    connect4Active = false;
                    $('#connect4Message')
                        .text(player === 'red' ? 'You win!' : 'Computer wins!')
                        .addClass('animate__animated animate__bounceIn');
                    return;
                }

                if (checkConnect4Draw()) {
                    connect4Active = false;
                    $('#connect4Message')
                        .text("It's a draw!")
                        .addClass('animate__animated animate__bounceIn');
                    return;
                }
            }

            function computerConnect4Move() {
                // First, check if computer can win in the next move
                let winningMove = findConnect4WinningMove('yellow');
                if (winningMove) {
                    makeConnect4Move(winningMove.col, winningMove.row, 'yellow');
                    return;
                }

                // Then, block player's winning move
                let blockingMove = findConnect4WinningMove('red');
                if (blockingMove) {
                    makeConnect4Move(blockingMove.col, blockingMove.row, 'yellow');
                    return;
                }

                // Create a fork opportunity (multiple winning paths)
                let forkMove = findConnect4ForkMove();
                if (forkMove) {
                    makeConnect4Move(forkMove.col, forkMove.row, 'yellow');
                    return;
                }

                // Block player's fork opportunity
                let blockingForkMove = findConnect4ForkMove('red');
                if (blockingForkMove) {
                    makeConnect4Move(blockingForkMove.col, blockingForkMove.row, 'yellow');
                    return;
                }

                // Take center if available
                const centerCol = 1;
                const centerRow = findLowestEmptyRow(centerCol);
                if (centerRow !== -1) {
                    makeConnect4Move(centerCol, centerRow, 'yellow');
                    return;
                }

                // Take strategic positions
                const strategicMoves = findStrategicMoves();
                if (strategicMoves.length > 0) {
                    const move = strategicMoves[0];
                    makeConnect4Move(move.col, move.row, 'yellow');
                    return;
                }

                // Take any available move
                for (let col = 0; col < 4; col++) {
                    const row = findLowestEmptyRow(col);
                    if (row !== -1) {
                        makeConnect4Move(col, row, 'yellow');
                        return;
                    }
                }
            }

            function findConnect4WinningMove(player) {
                for (let col = 0; col < 4; col++) {
                    const row = findLowestEmptyRow(col);
                    if (row !== -1) {
                        connect4Board[row][col] = player;
                        if (checkConnect4Win(player)) {
                            connect4Board[row][col] = '';
                            return { col, row };
                        }
                        connect4Board[row][col] = '';
                    }
                }
                return null;
            }

            function findConnect4ForkMove(player = 'yellow') {
                for (let col = 0; col < 4; col++) {
                    const row = findLowestEmptyRow(col);
                    if (row !== -1) {
                        connect4Board[row][col] = player;
                        let winningPaths = 0;
                        
                        // Count how many winning paths this move creates
                        connect4WinningCombos.forEach(combo => {
                            let count = 0;
                            combo.forEach(([r, c]) => {
                                if (connect4Board[r][c] === player) count++;
                            });
                            if (count === 3) winningPaths++;
                        });

                        connect4Board[row][col] = '';
                        if (winningPaths >= 2) return { col, row };
                    }
                }
                return null;
            }

            function findStrategicMoves() {
                const moves = [];
                
                // Check for potential winning combinations
                for (let col = 0; col < 4; col++) {
                    const row = findLowestEmptyRow(col);
                    if (row !== -1) {
                        connect4Board[row][col] = 'yellow';
                        let score = evaluatePosition(col, row);
                        connect4Board[row][col] = '';
                        
                        if (score > 0) {
                            moves.push({ col, row, score });
                        }
                    }
                }

                // Sort moves by score
                moves.sort((a, b) => b.score - a.score);
                return moves;
            }

            function evaluatePosition(col, row) {
                let score = 0;
                
                // Check horizontal
                for (let c = Math.max(0, col - 3); c <= Math.min(3, col + 3); c++) {
                    let count = 0;
                    for (let i = 0; i < 4; i++) {
                        if (c + i < 4 && connect4Board[row][c + i] === 'yellow') count++;
                    }
                    if (count === 3) score += 10;
                    if (count === 2) score += 5;
                }

                // Check vertical
                for (let r = Math.max(0, row - 3); r <= Math.min(3, row + 3); r++) {
                    let count = 0;
                    for (let i = 0; i < 4; i++) {
                        if (r + i < 4 && connect4Board[r + i][col] === 'yellow') count++;
                    }
                    if (count === 3) score += 10;
                    if (count === 2) score += 5;
                }

                // Check diagonal
                for (let i = -3; i <= 3; i++) {
                    let count = 0;
                    for (let j = 0; j < 4; j++) {
                        const r = row + i + j;
                        const c = col + j;
                        if (r >= 0 && r < 4 && c >= 0 && c < 4 && connect4Board[r][c] === 'yellow') count++;
                    }
                    if (count === 3) score += 10;
                    if (count === 2) score += 5;
                }

                // Check anti-diagonal
                for (let i = -3; i <= 3; i++) {
                    let count = 0;
                    for (let j = 0; j < 4; j++) {
                        const r = row + i + j;
                        const c = col - j;
                        if (r >= 0 && r < 4 && c >= 0 && c < 4 && connect4Board[r][c] === 'yellow') count++;
                    }
                    if (count === 3) score += 10;
                    if (count === 2) score += 5;
                }

                // Penalize moves that allow player to win
                connect4Board[row][col] = 'red';
                if (findConnect4WinningMove('red')) {
                    score -= 20;
                }
                connect4Board[row][col] = '';

                // Bonus for center control
                if (col === 1) score += 3;

                // Bonus for creating multiple threats
                let threatCount = 0;
                connect4Board[row][col] = 'yellow';
                for (let c = 0; c < 4; c++) {
                    for (let r = 0; r < 4; r++) {
                        if (connect4Board[r][c] === '') {
                            connect4Board[r][c] = 'yellow';
                            if (checkConnect4Win('yellow')) threatCount++;
                            connect4Board[r][c] = '';
                        }
                    }
                }
                connect4Board[row][col] = '';
                score += threatCount * 5;

                return score;
            }

            function checkConnect4Win(player) {
                return connect4WinningCombos.some(combo => {
                    return combo.every(([row, col]) => connect4Board[row][col] === player);
                });
            }

            function checkConnect4Draw() {
                return connect4Board.every(row => row.every(cell => cell !== ''));
            }

            function resetConnect4Game() {
                connect4Board = Array(4).fill().map(() => Array(4).fill(''));
                connect4Active = true;
                $('.connect4-cell')
                    .removeAttr('data-player')
                    .removeClass('animate__animated animate__zoomIn');
                $('#connect4Message')
                    .text('')
                    .removeClass('animate__animated animate__bounceIn');
            }
        });