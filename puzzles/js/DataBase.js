/* jshint esversion: 6 */

class DataBase {
  static NAME = 'PUZZLES_DB';
  static VERSION = 1;
  static STORES = ['puzzles', 'stats'];

  /* Fetches the game from the database and updates game accordingly. If a
     function oncompletion is provided, it is called whether or not the game
     data fetch was successful. */
  static fetchGame(game, oncompletion) {
    // ensure that IndexedDB is supported
    if (!window.indexedDB) {
      console.error('IndexedDB not supported.');
      return;
    }

    // get the database
    let openRequest = DataBase.#openDB();

    // this is called if the database cannot be opened
    openRequest.onerror = (openEvent) => {
      DataBase.#openError(openEvent);
      oncompletion(undefined);
      return;
    };

    // this is called if the database is being created or updated
    openRequest.onupgradeneeded = (openEvent) => {
      DataBase.#upgrade(openEvent, openRequest);
    };

    // this is called if the database has been opened
    openRequest.onsuccess = (openEvent) => {
      console.log('opening database');
      let db = openRequest.result;

      // create a transaction, get the puzzle ObjectStore and request the puzzle
      let transaction = db.transaction('puzzles', 'readonly');
      let puzzles = transaction.objectStore('puzzles');
      let puzzleRequest = puzzles.get(game.id);

      puzzleRequest.onsuccess = () => {
        let result = puzzleRequest.result;
        if (result !== undefined) {
          console.log('puzzle found');

          // only overwrite if the day matches
          if (result['seed'] == game.seed) {
            // overwrite all of the properties of the game
            for (let property of Object.keys(game)) {
              game[property] = result[property];
            }
          }
        }
        oncompletion(result);
      };

      puzzleRequest.onerror = () => {
        oncompletion(undefined);
      };
    };
  }

  /* saves the supplied game to the database */
  static saveGame(game) {
    // ensure that IndexedDB is supported
    if (!window.indexedDB) {
      console.error('IndexedDB not supported.');
      return;
    }

    // get the database
    let openRequest = DataBase.#openDB();

    // this is called if the database cannot be opened
    openRequest.onerror = (openEvent) => {
      DataBase.#openError(openEvent);
      return;
    };

    // this is called if the database is being created or updated
    openRequest.onupgradeneeded = (openEvent) => {
      DataBase.#upgrade(openEvent, openRequest);
    };

    // this is called if the database has been opened
    openRequest.onsuccess = (openEvent) => {
      console.log('opening database');
      let db = openRequest.result;

      // create a transaction, get the puzzle ObjectStore and put the puzzle
      let puzzleTransaction = db.transaction('puzzles', 'readwrite');
      let puzzles = puzzleTransaction.objectStore('puzzles');
      let puzzleRequest = puzzles.put(game);

      puzzleRequest.onsuccess = () => {
        // update the statistics
        if (game.isCompleted) {
          let statsTransaction = db.transaction('stats', 'readwrite');
          let stats = statsTransaction.objectStore('stats');
          let statsRequest = stats.get(game.id);

          statsRequest.onsuccess = () => {
            let result = statsRequest.result;
            // check that the stats exist
            if (result !== undefined) {
              if (result.lastCompletion == game.seed-1) {
                result.streak++;
                result.total++;
              } else if (result.lastCompletion < game.seed-1) {
                result.streak = 1;
                result.total++;
              }
              result.lastCompletion = game.seed;
            } else {
              // create the stats if they don't exist
              // TODO: should be function elsewhere
              result = {id: game.id,
                        streak: 1,
                        lastCompletion: game.seed,
                        total: 1};
            }

            // write back
            stats.put(result);
          };
        }
      };
    };
  }

  /* fetches the stats for the given game ID, calling callback(stats) on
     completion. */
  static fetchStats(gameID, callback) {
    // empty stats
    let gameStats = {id: gameID,
                     streak: 1,
                     lastCompletion: -1,
                     total: 1};

    // ensure that IndexedDB is supported
    if (!window.indexedDB) {
      console.error('IndexedDB not supported.');
      return;
    }

    // get the database
    let openRequest = DataBase.#openDB();

    // this is called if the database cannot be opened
    openRequest.onerror = (openEvent) => {
      callback(gameStats);
    };

    // this is called if the database is being created or updated
    openRequest.onupgradeneeded = (openEvent) => {
      DataBase.#upgrade(openEvent, openRequest);
    };

    // this is called if the database has been opened
    openRequest.onsuccess = (openEvent) => {
      console.log('opening database');
      let db = openRequest.result;

      // create a transaction, get the stats ObjectStore and request the stats
      let transaction = db.transaction('stats', 'readonly');
      let stats = transaction.objectStore('stats');
      let statsRequest = stats.get(gameID);

      statsRequest.onsuccess = () => {
        let result = statsRequest.result;
        if (result !== undefined) {
          callback(result);
        } else {
          callback(gameStats);
        }
      };

      statsRequest.onerror = () => {
        callback(gameStats);
      };
    };
  }


  /* =================== */
  /*   PRIVATE METHODS   */
  /* =================== */
  // open the database
  static #openDB() {
    return window.indexedDB.open(DataBase.NAME, DataBase.VERSION);
  }

  // database open error
  static #openError(event) {
    alert('An error occured trying to load your progress. Some functionality may be broken.');
    console.error(`DataBase open error: ${openEvent.target.errorCode}`);
  }

  // upgrade database to new version
  static #upgrade(openEvent, openRequest) {
    console.log('upgrading database');
      let db = openRequest.result;

      // if the database doesn't exist, create it
      if (openEvent.oldVersion == 0) {
        console.log(`creating database ${DataBase.VERSION}`);

        // create the object stores
        for (name of DataBase.STORES) {
          db.createObjectStore(name, {keyPath: 'id'});
        }
      }

      // if the database does exist, we should check it is set up correctly
      else {
        console.log(`upgrading database from ${openEvent.oldVersion} to ${DataBase.VERSION} [open]`);

        // create the object stores if required
        for (name of DataBase.STORES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name, {keyPath: 'id'});
          }
        }
      }

      // delete everything else
      for (name of db.objectStoreNames) {
        if (DataBase.STORES.indexOf(name) < 0) {
          console.log(`deleting ObjectStore ${name}`);
          db.deleteObjectStore(name);
        }
      }
  }
}
