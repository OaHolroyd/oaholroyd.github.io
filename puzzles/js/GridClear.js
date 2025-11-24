/* jshint esversion: 6 */

const INDICES = [0, 2, 2];

const OMINOS = [
  [
    [ true],
  ],
  [
    [ true,  true],
  ],
  [
    [ true,  true,  true],
    [ true, false, false],
    [ true, false, false],
  ]
];

class Piece {
  constructor() {
    this.id = -1;

    var k = INDICES[Math.floor(Math.random()*INDICES.length)];
    this.grid = OMINOS[k];

    this.width = this.grid[0].length;
    this.height = this.grid.length;
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
    this.#getGrid();

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

  insertPiece(i, j, p) {
    // first check if all of the cells in the piece are valid
    var valid = true;
    for (var ii = 0; ii < p.width; ii++) {
      for (var jj = 0; jj < p.height; jj++) {
        if (p.grid[jj][ii] && this.grid[i+ii][j+jj]) {
          valid = false;
        }
      }
    }

    if (!valid) {
      return -1;
    }

    for (var ii = 0; ii < p.width; ii++) {
      for (var jj = 0; jj < p.height; jj++) {
        if (p.grid[jj][ii]) {
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

    // TODO: work out how to multiply up the score when clearing multiple rows/cols
    const score = rows.length + cols.length;
    this._score = this._score + score;

    return score;
  }


  /* =================== */
  /*   PRIVATE METHODS   */
  /* =================== */
  // select the grid
  #getGrid() {
    // fill the grid
    for (var i = 0; i < 10; i++) {
      let row = [];
      for (var j = 0; j < 10; j++) {
        row.push(false)
      }
      this.grid.push(row);
    }
  }
}
