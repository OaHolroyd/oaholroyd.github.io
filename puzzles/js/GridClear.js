/* jshint esversion: 6 */

const INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
// const INDICES = [19];

const OMINOS = [
  // 1
  [
    [ true,],
  ],
  // 2
  [
    [ true,  true],
  ],
  [
    [ true,],
    [ true,],
  ],
  // 3
  [
    [ true,  true,  true],
  ],
  [
    [ true,],
    [ true,],
    [ true,],
  ],
  [
    [ true,  true,],
    [ true, false,],
  ],
  [
    [ true, false,],
    [ true,  true,],
  ],
  [
    [false,  true,],
    [ true,  true,],
  ],
  [
    [ true,  true,],
    [false,  true,],
  ],
  // 4
  [
    [ true,  true,  true,  true],
  ],
  [
    [ true,],
    [ true,],
    [ true,],
    [ true,],
  ],
  [
    [ true,  true,],
    [ true,  true,],
  ],
  // 5
  [
    [ true,  true,  true,  true,  true],
  ],
  [
    [ true,],
    [ true,],
    [ true,],
    [ true,],
    [ true,],
  ],
  [
    [ true,  true,  true],
    [ true, false, false],
    [ true, false, false],
  ],
  [
    [ true, false, false],
    [ true, false, false],
    [ true,  true,  true],
  ],
  [
    [false, false,  true],
    [false, false,  true],
    [ true,  true,  true],
  ],
  [
    [ true,  true,  true],
    [false, false,  true],
    [false, false,  true],
  ],
  // 9
  [
    [ true,  true,  true],
    [ true,  true,  true],
    [ true,  true,  true],
  ],

  [
    [false, false,  true, false, false,  true],
    [false, false,  true,  true,  true,  true],
    [ true,  true,  true, false, false,  true],
  ],
];

class Piece {
  constructor() {
    this.id = 'grid-clear';

    var k = INDICES[Math.floor(Math.random()*INDICES.length)];
    this.grid = OMINOS[k];

    this.width = this.grid[0].length;
    this.height = this.grid.length;

    this.highscore = 0;
  }
}

class GridClear {
  constructor() {
    // set id (for storage)
    this.id = 'grid-clear';

    // daily seed
    this.seed = Random.seed(); // (for storage)

    // game setup
    this.grid = [];
    for (var i = 0; i < 10; i++) {
      let row = [];
      for (var j = 0; j < 10; j++) {
        row.push(false)
      }
      this.grid.push(row);
    }

    this._score = 0;
  }

  // player score
  get score() {
    return this._score;
  }

  // whether the game has been completed
  get isCompleted() {
    return this._score > 0;
  }


  /* ================== */
  /*   PUBLIC METHODS   */
  /* ================== */
  insertCell(i, j) {
    // fill the cell
    this.grid[i][j] = true;

    // check if a row and/or column has been emptied
    var rowFinished = true;
    for (var ii = 0; ii < 10; ii++) {
      if (!this.grid[ii][j]) {
        rowFinished = false;
        break;
      }
    }
    var colFinished = true;
    for (var jj = 0; jj < 10; jj++) {
      if (!this.grid[i][jj]) {
        colFinished = false;
        break;
      }
    }

    // empty the row and/or column
    if (rowFinished) {
      for (var ii = 0; ii < 10; ii++) {
        this.grid[ii][j] = false;
      }
    }
    if (colFinished) {
      for (var jj = 0; jj < 10; jj++) {
        this.grid[i][jj] = false;
      }
    }

    let score = rowFinished + colFinished;
    this._score += score;
    return score;
  }

  insertPiece(i, j, p, early_exit = false) {
    // check if the piece lies within the grid
    if (i < 0 || i + p.width > 10 || j < 0 || j + p.height > 10) {
      return -1;
    }

    // check if all of the cells in the piece are valid
    for (var ii = 0; ii < p.width; ii++) {
      for (var jj = 0; jj < p.height; jj++) {
        if (p.grid[jj][ii] && this.grid[i+ii][j+jj]) {
          return -1;
        }
      }
    }

    if (early_exit) {
      // can be placed
      return 1;
    }

    // place the piece
    var score = 0;
    for (var ii = 0; ii < p.width; ii++) {
      for (var jj = 0; jj < p.height; jj++) {
        if (p.grid[jj][ii]) {
          score = score + 1;
          this.grid[i+ii][j+jj] = true;
        }
      }
    }

    // check rows and cols
    var rows = [];
    for (var ii = 0; ii < 10; ii++) {
      var filled = true;
      for (var jj = 0; jj < 10; jj++) {
        if (!this.grid[ii][jj]) {
          filled = false;
          break;
        }
      }
      if (filled) {
        rows.push(ii);
      }
    }
    var cols = [];
    for (var ii = 0; ii < 10; ii++) {
      var filled = true;
      for (var jj = 0; jj < 10; jj++) {
        if (!this.grid[jj][ii]) {
          filled = false;
          break;
        }
      }
      if (filled) {
        cols.push(ii);
      }
    }

    // remove any rows and cols that have been filled
    for (var k = 0; k < rows.length; k++) {
      for (var jj = 0; jj < 10; jj++) {
        this.grid[rows[k]][jj] = false;
      }
    }
    for (var k = 0; k < cols.length; k++) {
      for (var jj = 0; jj < 10; jj++) {
        this.grid[jj][cols[k]] = false;
      }
    }

    // check for score multipliers
    const num_cleared = rows.length + cols.length;
    score = score + num_cleared * 10; // one point per block cleared
    if (num_cleared >= 4) {
      // bonus for clearing multiple rows
      score = score + 200;
    }

    // TODO: work out how to multiply up the score when clearing multiple rows/cols
    this._score = this._score + score;

    return score;
  }

  // returns true if the piece can be placed anywhere on the board
  checkPiece(p) {
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        if (this.insertPiece(i, j, p, true) == 1) {
          return true;
        }
      }
    }

    return false;
  }

  reset() {
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < 10; j++) {
        this.grid[i][j] = false;
      }
    }
    this._score = 0;
  }
}
