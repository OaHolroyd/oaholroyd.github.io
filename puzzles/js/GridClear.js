/* jshint esversion: 6 */

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

  set score(s) {
    this._score = s;
  }

  // whether the game has been completed
  get isCompleted() {
    return this._score > 0;
  }


  /* ================== */
  /*   PUBLIC METHODS   */
  /* ================== */
  // checks a guess and adds it if it is good. Returns 'good', 'bad', or 'rep'
  // checkGuess(word) {
  //   let lWord = word.toLowerCase();

  //   // word is too short
  //   if (lWord.length < 3) {
  //     return 'bad';
  //   }

  //   // guessed already
  //   for(var i = 0, N = this.guessList.length; i < N; i++){
  //     if (lWord === this.guessList[i]) {
  //       return 'rep';
  //     }
  //   }

  //   // check it is a word in wordList
  //   if (this.wordList.includes(lWord)) {
  //     this.guessList.push(lWord);
  //     return 'good';
  //   }
  //   return 'bad';
  // }


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
