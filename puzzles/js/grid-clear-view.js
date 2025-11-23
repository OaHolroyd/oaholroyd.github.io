/* jshint esversion: 6 */

var gridClear = new GridClear();

var pieces = [];
var numPieces = 3;
var draggedPiece = "";
var draggedI = -1;
var draggedDx = 0.0;
var draggedDy = 0.0;








const cellSize = 9.75;

// elements
const board = document.getElementById('board');
const canvas = document.getElementById('canvas');
const scoreBox = document.getElementById('score');
const menuBox = document.getElementById('menu');
var grid = [];
var menu = [];

setUpView();
DataBase.fetchGame(gridClear, () => {
  // // update the screen
  // for (let i in gridClear.guessList) {
  //   let item = document.createElement('li');
  //   item.innerHTML = wordGrid.guessList[i].toUpperCase();
  //   listBox.appendChild(item);
  // }
  // resetGuess();
  // console.log(wordGrid.wordList);
});
updateColorScheme();
setUpActions();


/* ========================================================================== */
/*   FUNCTIONS                                                                */
/* ========================================================================== */
// sets up the html
function setUpView() {
  // add the cells to the grid
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      // create a cell div for each one
      let cell = document.createElement('div');
      cell.classList.add('cell');

      if (gridClear.grid[i][j]) {
        cell.innerHTML = 1;
      } else {
        cell.innerHTML = 0;
      }
      cell.id = 'cell-'+(10*i+j);
      cell.innerHTML = 10*i+j;

      // work out the position
      let x = 10*j + 5 - cellSize/2;
      let y = (10*i + 5 - cellSize/2)/1.5;
      cell.style.width = cellSize+'%';
      cell.style.left = x+'%';
      cell.style.top = y+'%';

      board.appendChild(cell);
      grid.push(cell);
    }
  }

  recolorCells();
  refreshMenu();
}

function recolorCells() {
  // add the cells to the grid
  for (var i = 0; i < 10; i++) {
    for (var j = 0; j < 10; j++) {
      var cell = document.getElementById('cell-'+(10*j+i));

      if (gridClear.grid[i][j]) {
        cell.classList.remove("unfilled")
        cell.classList.add("filled")
      } else {
        cell.classList.remove("filled")
        cell.classList.add("unfilled")
      }
    }
  }
}

// update color scheme to match user scheme
function updateColorScheme() {
  // TODO: use color codes for the colors
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // dark mode
    document.querySelector('meta[name="theme-color"]').setAttribute("content", 'black');
    document.documentElement.style.setProperty('--color-back', 'black');
    document.documentElement.style.setProperty('--color-fore', 'white');
    document.documentElement.style.setProperty('--color-min', 'darkgrey');
    document.documentElement.style.setProperty('--color-mid', 'grey');
    document.documentElement.style.setProperty('--color-max', 'lightgrey');
    document.documentElement.style.setProperty('--color-tintgood', 'lightgreen');
    document.documentElement.style.setProperty('--color-tintbad', 'lightred');
  } else {
    // light mode
    document.querySelector('meta[name="theme-color"]').setAttribute("content", 'white');
    document.documentElement.style.setProperty('--color-back', 'white');
    document.documentElement.style.setProperty('--color-fore', 'black');
    document.documentElement.style.setProperty('--color-min', 'lightgrey');
    document.documentElement.style.setProperty('--color-mid', 'grey');
    document.documentElement.style.setProperty('--color-max', 'darkgrey');
    document.documentElement.style.setProperty('--color-tintgood', 'darkgreen');
    document.documentElement.style.setProperty('--color-tintbad', 'darkred');
  }
}

// refresh the three polyomino menu
function refreshMenu() {
  pieces = [];

  for (var i = 0; i < 3; i++) {
    // generate a random omino
    let p = new Piece();
    pieces.push(p);

    // TODO: generate a random polyomino
    let omino = document.createElement('div');
    omino.classList.add('piece');
    omino.id = 'menuitem-'+i;
    omino.innerHTML = i;

    let scale = 0.6;
    omino.style.width = scale*cellSize+'%';
    omino.style.minWidth = scale*cellSize+'%';
    omino.style.maxWidth = scale*cellSize+'%';

    // work out the position
    let x = 100*(i+0.5)/3.0 - scale*cellSize/2; // what about the margins?
    let y = 100 * 5/6.0 - scale*cellSize/2;
    omino.style.left = x+'%';
    omino.style.top = y+'%';

    board.appendChild(omino);
  }

  numPieces = 3;
}

// write the score to the screen
function updateScore() {
  scoreBox.innerHTML = gridClear.score;
}

// get the pixel-valued position relative to the top left corner of
// the board of a touch event
function boardxy_for_event(event) {
  // position of cursor relative to top left corner of board
  let x = event.changedTouches[0].clientX - board.offsetLeft;
  let y = event.changedTouches[0].clientY - board.offsetTop;

  return [x, y]
}

// get the tile-valued position relative to the top left corner of
// the board of a touch event
function tilexy_for_event(event) {
  // position of cursor relative to top left corner of board
  let [x, y] = boardxy_for_event(event);

  // convert to tile units
  x = 10.0*x/board.offsetWidth;
  y = 10.0*y/board.offsetWidth;

  return [x, y]
}

// drag the pieces around the board
function dragStart (event) {
  var [x, y] = tilexy_for_event(event);

  draggedPiece = "";
  draggedI = -1;
  for (var i = 0; i < 3; i++) {
    const p = document.getElementById('menuitem-'+i);

    if (p == null) {
      continue;
    }

    // find position in tile units
    var px = 10.0*p.offsetLeft/board.offsetWidth;
    var py = 10.0*p.offsetTop/board.offsetWidth;

    // check if the piece contains the cursor
    // TODO: will need to update once pieces can have multiple cells
    var dx = x - px;
    var dy = y - py;
    if (0 < dx && dx < 0.6 && 0 < dy && dy < 0.6) {
      draggedPiece = p;
      draggedI = i;
      draggedDx = dx*board.offsetWidth/10.0;
      draggedDy = dy*board.offsetWidth/10.0;
    }
  }

  // no piece under cursor
  if (draggedPiece == "") {
    return;
  }

  // grow the piece to match the board
  draggedPiece.style.width = cellSize+'%';
  draggedPiece.style.minWidth = cellSize+'%';
  draggedPiece.style.maxWidth = cellSize+'%';

  // move the piece so it looks like it's grown around the centre
  // update the selection shift too
  // TODO: will need to update once pieces can have multiple cells
  draggedPiece.style.left = (draggedPiece.offsetLeft - draggedPiece.offsetWidth*0.25)+'px';
  draggedPiece.style.top = (draggedPiece.offsetTop - draggedPiece.offsetHeight*0.25)+'px';
  draggedDx = draggedDx + draggedPiece.offsetWidth*0.25
  draggedDy = draggedDy + draggedPiece.offsetHeight*0.25
}

// drag the pieces around the board
function dragMove (event) {
  // no piece under cursor
  if (draggedPiece == "") {
    return;
  }

  var [x, y] = boardxy_for_event(event);

  // shift to account for where it was picked up
  x = x - draggedDx;
  y = y - draggedDx;

  // move the piece to where it has been dragged
  draggedPiece.style.left = x+'px';
  draggedPiece.style.top = y+'px';
}

// handle a piece being dropped
function dragEnd (event) {
  if (draggedPiece == "") {
    return;
  }

  // find position of top left corner of the dragged piece
  let px = 10.0*draggedPiece.offsetLeft/board.offsetWidth;
  let py = 10.0*draggedPiece.offsetTop/board.offsetWidth;

  // find the distance to the nearest grid point
  let dx = Math.abs(Math.round(px) - px);
  let dy = Math.abs(Math.round(py) - py);

  // check if it's well-aligned
  const tol = 0.2;
  if (dx < tol && dy < tol) {
    let i = Math.round(px);
    let j = Math.round(py);

    // check if there are any overlaps
    if (!gridClear.grid[i][j]) {
      // no overlap

      // fill the grid
      let score = gridClear.insertCell(i, j);
      if (score > 0) {
        recolorCells();
        updateScore();
      }

      // delete the piece once it's been placed
      draggedPiece.remove();
      numPieces = numPieces - 1;

      // unset dragged piece
      draggedPiece = "";
      draggedI = -1;
      draggedDx = 0.0;
      draggedDy = 0.0;

      // recolor the grid
      recolorCells();

      // refresh the menu if required
      if (numPieces == 0) {
        refreshMenu();
      }

      // check if a row has been completed

      return;
    }
  }

  // return to original size
  const scale = 0.6;
  draggedPiece.style.width = scale*cellSize+'%';
  draggedPiece.style.minWidth = scale*cellSize+'%';
  draggedPiece.style.maxWidth = scale*cellSize+'%';

  // return to original place
  let x = 100*(draggedI+0.5)/3.0 - scale*cellSize/2; // what about the margins?
  let y = 100 * 5/6.0 - scale*cellSize/2;
  draggedPiece.style.left = x+'%';
  draggedPiece.style.top = y+'%';

  // unset dragged piece
  draggedPiece = "";
  draggedI = -1;
  draggedDx = 0.0;
  draggedDy = 0.0;
}

// set up interactions with the game internals
function setUpActions() {
  // TODO: be different depending on computer vs touchscreen
  board.addEventListener('touchstart', dragStart);
  board.addEventListener('touchmove', dragMove);
  board.addEventListener('touchend', dragEnd);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColorScheme);
}
