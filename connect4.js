/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

var WIDTH = 7;
var HEIGHT = 6;

var board = []; // array of rows, each row is array of cells  (board[y][x])
var currPlayer;

/** Start New Game
 * 
 */
function initGame() {
  makeBoard();
  makeHtmlBoard();
  const startBtn = document.querySelector(`#start-game-btn`);
  startBtn.addEventListener('click', () => {
    startNewGame();
  })
  const resetBtn = document.querySelector('#reset-game-btn');
  resetBtn.addEventListener('click', () => {
    resetGame();
  })
}

function startNewGame() {
  const startBtn = document.querySelector(`#start-game-btn`);
  startBtn.style.display = 'none';

  currPlayer = Math.round(Math.random(1,2) + 1);
  setCurrentPlayer(currPlayer);

  initGameBoard();
}

function resetGame() {
  // remove the winner message;
  const winnerContainer = document.querySelector('#winner-message');
  document.querySelector('#winner-message-text h2').innerHTML = '';
  winnerContainer.classList.remove('active');

  // reset the board
  board = [];
  makeBoard();

  // clear the game pieces from the board
  const tds = document.querySelectorAll('#board td');
  for(let td of tds) {
    td.classList.remove('disabled');
    td.innerHTML = '';
  }

  currPlayer = Math.round(Math.random(1,2) + 1);
  setCurrentPlayer(currPlayer);

  initGameBoard();

}

function initGameBoard() {

  const htmlBoard = document.getElementById('board');
  htmlBoard.classList.add('active');

  // Populate the first row of 
  const top = document.querySelector('#column-top');
  top.addEventListener("click", handleClick);

  const tds = document.querySelectorAll('#column-top td');

  for(let td of tds) {
    var headPiece = gamePiece(currPlayer);
    td.append(headPiece);
  }

}

function disableGameBoard() {
  const htmlBoard = document.getElementById('board');
  htmlBoard.classList.remove('active');

  const tds = document.querySelectorAll('#column-top td');
  top.removeEventListener("click", handleClick);

  for(let td of tds) {
    td.innerHTML = '';
  }

  let turnIndicators = document.querySelectorAll('.turn-indicator');
  for(let turnIndicator of turnIndicators) {
    turnIndicator.classList.remove('active');
  }

  currPlayer = '';

}

function setCurrentPlayer(player) {
  const topCol = document.querySelector('#column-top');
  if(player === 1) {
    document.querySelector('#player2').classList.remove('active');
    document.querySelector('#player1').classList.add('active');
    topCol.classList.remove(`player-2`);
  } else {
    document.querySelector('#player1').classList.remove('active');
    document.querySelector('#player2').classList.add('active');
    topCol.classList.remove(`player-1`);
  }
  topCol.classList.add(`player-${player}`)
}


/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
  // Generate the game board
  for(let y = 0; y < WIDTH; y++) {
    const tr = [];
    for(let x = 0; x < HEIGHT; x++) {
      let td = 0;
      tr.push(td);
    }
    board.push(tr)
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // Select the game board
  const htmlBoard = document.getElementById('board');

  // Create the row for the top row and bind the click event
  var thead = document.createElement("thead");
  var top = document.createElement("tr");
  top.setAttribute("id", "column-top");

  // Create the cells in for the top row
  for (var x = 0; x < WIDTH; x++) {
    var headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    top.append(headCell);
  }
  thead.append(top);
  htmlBoard.append(thead);

  // Create the gameboard
  let tbody = document.createElement('tbody');

  for (var y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (var x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    tbody.append(row);
  }
  htmlBoard.append(tbody);
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  // iterate through all of the rows
  let piecesInColumn = board.reduce((acc, nextRow) => {
    // count the rows with a piece at column x
    return nextRow[x] ? ++acc : acc;
  }, 0);

  // If the number of pieces in the column is less than the height  
  if(piecesInColumn < HEIGHT) {
    if(piecesInColumn === HEIGHT - 1) {
      disableColumn(x);
    }
    // row to add piece = height - 1 to account for 0 index;
    let rowToAddPiece = HEIGHT - piecesInColumn - 1;
    return rowToAddPiece;
  } else {
    return false;
  }
}


function disableColumn(x) {
  let column = document.getElementById(x);
  column.classList.add('disabled');
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  if(y !== false) {
    const piece = gamePiece(currPlayer);
    const placement = document.getElementById(`${y}-${x}`);
    placement.appendChild(piece);
    piece.classList.add('translate');
    let animate = setTimeout(() => {
      piece.classList.add('origin');
    }, 1)
  }
}

function gamePiece(player) {
  const piece = document.createElement('div');
  piece.classList.add('piece', `player-${player}`);
  const innerBevel = document.createElement('div');
  innerBevel.classList.add('bevel');
  piece.append(innerBevel);
  return piece;
}

/** endGame: announce game end */

function endGame(msg) {
  // TODO: pop up alert message
  showWinner(currPlayer)
  disableGameBoard();
}

function showWinner(winner) {
  const winnerContainer = document.querySelector('#winner-message');
  const winnerMessage = document.querySelector('#winner-message #winner-message-text')
  const winnerMessageHTML = `<h2>Player ${winner} wins!</h2>`;
  winnerMessage.innerHTML = winnerMessageHTML;
  winnerContainer.classList.add('active');
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  // 
  var x = evt.target.parentElement.id ? evt.target.parentElement.id : evt.target.parentElement.parentElement.id;
  // get next spot in column (if none, ignore click)
  var y = findSpotForCol(x);
  if (y === false) {
    return;
  }

  board[y][x] = currPlayer;
  // place piece in board and add to HTML table
  placeInTable(y, x);

  // check for win
  if (checkForWin()) {
    endGame(currPlayer);
  }

  // check for tie
  // TODO: check if all cells in board are filled; if so call, call endGame

  // switch players
  if(currPlayer === 1) {
    currPlayer = 2;
    setCurrentPlayer(currPlayer);
  } else if(currPlayer === 2) {
    currPlayer = 1;
    setCurrentPlayer(currPlayer);
  }
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    return cells.every((cell) => {
      return board[cell[0]][cell[1]] === currPlayer;
    })
  }

  // TODO: read and understand this code. Add comments to help you.

  for (var y = 0; y <= HEIGHT; y++) {
    for (var x = 0; x <= WIDTH; x++) {
      // if there is a piece on the board
      if(!!board[y][x]) {
        // make an array of four horizontal coordinates
        var horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
        // make an array of four vertical coordinates
        var vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
        // make an array of four diagonal coordinates with upward trajectory
        var diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
        // make an array of four diagonal coordinates with downward trajectory
        var diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
        // if any of the sets of cordinates are a winner
        if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
          return true;
        }
      }
    }
  }
}

initGame();