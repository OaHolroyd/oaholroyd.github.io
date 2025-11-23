/* jshint esversion: 6 */

const INDICES = [0, 0, 1];

const OMINOS = [
  [
    [true]
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

    // 4x4 grid where the cells are defined
    var k = INDICES[Math.floor(Math.random()*INDICES.length)];
    this.grid = OMINOS[k];

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
