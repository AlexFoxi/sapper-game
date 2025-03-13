const createBoard = () => {
  const mines = Number(document.querySelector('.bomb').value);
  const size = Number(document.querySelector('.width').value);
  const gameBoard = document.querySelector('.board');
  const resultContainer = document.querySelector('.result');
  let flags = 0;

  if (mines > size * size) {
    isWinAction('Enter correct mine count');
    return;
  }

  // Reset game field
  gameBoard.style.pointerEvents = 'all';
  gameBoard.style.gridTemplateColumns = `repeat(${size}, auto)`;
  resultContainer.innerHTML = '';

  let board = [];

  const initializeBoard = () => {
    board = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => ({
        value: 0,
        revealed: false,
        flag: false,
      }))
    );

    const mineSet = new Set();

    // Place mines
    for (let i = 0; i < mines; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while (mineSet.has(`${x},${y}`));

      mineSet.add(`${x},${y}`);
      board[x][y].value = '💣';
    }

    // Calculate numbers
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (board[x][y].value !== '💣') {
          board[x][y].value = countAdjacentMines(x, y);
        }
      }
    }
  };

  const countAdjacentMines = (x, y) => {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (isInsideBoard(nx, ny) && board[nx][ny].value === '💣') {
          count++;
        }
      }
    }
    return count;
  };

  const isInsideBoard = (x, y) => {
    return x >= 0 && x < size && y >= 0 && y < size;
  };

  const revealCell = (x, y) => {
    if (board[x][y].revealed) return;

    board[x][y].revealed = true;
    gameBoard.querySelector(`#cell-${x}-${y}`).classList.add('open');

    if (board[x][y].value === '💣') {
      isWinAction('You Lose =(');
      revealAllMines();
    } else if (board[x][y].value === 0) {
      // Reveal adjacent cells
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = x + dx;
          const ny = y + dy;
          if (isInsideBoard(nx, ny)) {
            revealCell(nx, ny);
          }
        }
      }
    }

    renderCell(x, y);
  };

  const renderCell = (x, y) => {
    const cellElement = document.getElementById(`cell-${x}-${y}`);

    if (board[x][y].value === 0) {
      cellElement.textContent = '';
    } else {
      cellElement.textContent = board[x][y].value;
      cellElement.classList.add(`_${board[x][y].value}`);
    }
  };

  const renderBoard = () => {
    const boardElement = document.querySelector('.board');
    boardElement.innerHTML = '';

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const cell = document.createElement('div');

        cell.id = `cell-${x}-${y}`;
        cell.classList.add('cell');

        if (board[x][y].revealed) {
          cell.textContent = board[x][y].value === 0 ? '' : board[x][y].value;
          if (Number(board[x][y].value) || cell.textContent == '') {
            cell.classList.add('open');
          }
        } else {
          cell.addEventListener('click', () => revealCell(x, y));
          cell.oncontextmenu = (e) => {
            e.preventDefault();
            addFlag(x, y, cell);
          };
        }
        boardElement.appendChild(cell);
      }
    }
  };

  const addFlag = (x, y, cell) => {
    if (board[x][y].revealed) return;

    if (flags < mines && board[x][y].flag !== true) {
      board[x][y].flag = true;
      cell.innerHTML = '🚩';
      cell.classList.add('flag');
      flags++;
    } else if (board[x][y].flag === true) {
      board[x][y].flag = false;
      cell.innerHTML = '';
      cell.classList.remove('flag');
      flags--;
    }

    if (!!checkIsWin()) isWinAction('You Win!!!');
  };

  const revealAllMines = () => {
    const boardElement = document.querySelector('.board');

    board.map((row, x) => {
      row.map((cell, y) => {
        if (cell.value == '💣') {
          cell.revealed = true;
          const bombCell = boardElement.querySelector(`#cell-${x}-${y}`);
          bombCell.classList.contains('open') && bombCell.classList.add('boom');
          bombCell.textContent = '💣';
        }
      });
    });
  };

  const checkIsWin = () => {
    return board
      .map((row) => row.filter((cell) => cell.value == '💣'))
      .reduce((acc, cur) => acc.concat(cur), [])
      .every((bomb) => bomb.flag === true);
  };

  function isWinAction(text) {
    gameBoard.style.pointerEvents = 'none';
    const h2 = document.createElement('h2');
    resultContainer.appendChild(h2);
    h2.textContent = text;
  }

  // Initialize and render the board
  const startGame = () => {
    initializeBoard();
    renderBoard();
  };

  startGame();
};

const inputValidate = () => {
  const [bombs, width, cellSize] = document.querySelectorAll(
    '.game-settings input'
  );

  validateHelper(bombs, 99);
  validateHelper(width, 20);
  validateHelper(cellSize, 100);
};

function validateHelper(input, maxValue) {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '');

    input.value > maxValue ? (input.value = maxValue) : input.value;
  });
}

const resizeCell = () => {
  const cellSizeInput = document.querySelector('input.cellSize');

  cellSizeInput.addEventListener('input', () => {
    const gameBoard = document.querySelector('.board');
    const val = cellSizeInput.value;

    gameBoard.style.fontSize = val > 30 ? '14px' : `${val / 3}px`;
    gameBoard.querySelectorAll('div').forEach((div) => {
      div.style.width = `${val / 10}rem`;
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  inputValidate();
  resizeCell();
  document.querySelector('.start').addEventListener('click', createBoard);
});
