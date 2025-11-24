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
      cell.id = 'cell-'+(10*i+j);

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

  for (var k = 0; k < 3; k++) {
    // generate a random omino
    let p = new Piece();
    pieces.push(p);

    // make piece from omino
    let omino = document.createElement('div');
    omino.classList.add('piece');
    omino.id = 'piece-'+k;

    // set the size from the width
    let scale = 0.6;
    omino.style.width = p.width * scale*cellSize+'%';
    omino.style.minWidth = p.width * scale*cellSize+'%';
    omino.style.maxWidth = p.width * scale*cellSize+'%';
    omino.style.aspectRatio = p.width / p.height;

    // create the cells inside the omino
    for (var i = 0; i < p.width; i++) {
      for (var j = 0; j < p.height; j++) {
        let cell = document.createElement('div');
        cell.classList.add('cell');
        if (p.grid[j][i]) {
          cell.classList.add('filled');
        } else {
          cell.classList.add('clear');
        }

        // size
        cell.style.width = 100/p.width+'%';
        cell.style.minWidth = 100/p.width+'%';
        cell.style.maxWidth = 100/p.width+'%';

        // position
        cell.style.left = i * 100/p.width+'%';
        cell.style.top = j * 100/p.height+'%';

        omino.appendChild(cell);
      }
    }

    // work out the position
    let x = 100*(k+0.5)/3.0 - scale*p.width*cellSize/2; // what about the margins?
    let y = 100 * 5/6.0 - scale*p.height*cellSize/2;
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
// the screen of a touch event
function screenxy_for_event(event) {
  // position of cursor relative to top left corner of board
  let x = event.changedTouches[0].clientX;
  let y = event.changedTouches[0].clientY;

  return [x, y]
}

// get the pixel-valued position relative to the top left corner of
// the board of a touch event
function boardxy_for_event(event) {
  let [x, y] = screenxy_for_event(event);

  // position of cursor relative to top left corner of board
  x = x - board.offsetLeft;
  y = y - board.offsetTop;

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
  var [sx, sy] = screenxy_for_event(event);
  var [x, y] = tilexy_for_event(event);

  draggedPiece = "";
  draggedI = -1;
  for (var i = 0; i < 3; i++) {
    const p = document.getElementById('piece-'+i);

    if (p == null) {
      continue;
    }

    // find position in tile units
    var px = 10.0*p.offsetLeft/board.offsetWidth;
    var py = 10.0*p.offsetTop/board.offsetWidth;

    for (var j = 0; j < p.children.length; j++) {
      var rect = p.children[j].getBoundingClientRect();

      // can't select empty cells
      if (p.children[j].classList.contains("clear")) {
        continue;
      }

      if (rect.left < sx && sx < rect.right && rect.top < sy && sy < rect.bottom) {
        rect = p.getBoundingClientRect()
        draggedPiece = p;
        draggedI = i;
        draggedDx = (sx - rect.left)/0.6;
        draggedDy = (sy - rect.top)/0.6;
        break;
      }
    }
  }

  // no piece under cursor
  if (draggedPiece == "") {
    return;
  }

  let p = pieces[draggedI];

  // grow the piece to match the board
  let scale = 1.0;
  draggedPiece.style.width = p.width * scale*cellSize+'%';
  draggedPiece.style.minWidth = p.width * scale*cellSize+'%';
  draggedPiece.style.maxWidth = p.width * scale*cellSize+'%';
  draggedPiece.style.aspectRatio = p.width / p.height;

  // use dragMove to update the location
  dragMove(event);
}

// drag the pieces around the board
function dragMove(event) {
  // no piece under cursor
  if (draggedPiece == "") {
    return;
  }

  var [x, y] = boardxy_for_event(event);

  // shift to account for where it was picked up
  x = x - draggedDx;
  y = y - draggedDy;

  // move the piece to where it has been dragged
  draggedPiece.style.left = x+'px';
  draggedPiece.style.top = y+'px';
}

// handle a piece being dropped
function dragEnd (event) {
  if (draggedPiece == "") {
    return;
  }

  let p = pieces[draggedI];

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

    // add the piece to the grid
    let score = gridClear.insertPiece(i, j, pieces[draggedI]);
    if (score >= 0) {
      recolorCells();
      updateScore();

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

      return;
    }
  }

  // return to original size
  const scale = 0.6;
  draggedPiece.style.width = p.width * scale*cellSize+'%';
  draggedPiece.style.minWidth = p.width * scale*cellSize+'%';
  draggedPiece.style.maxWidth = p.width * scale*cellSize+'%';
  draggedPiece.style.aspectRatio = p.width / p.height;

  // return to original place
  let x = 100*(draggedI+0.5)/3.0 - scale*p.width*cellSize/2; // what about the margins?
  let y = 100 * 5/6.0 - scale*p.height*cellSize/2;
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
