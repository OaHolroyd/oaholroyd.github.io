/* jshint esversion: 6 */

var wordWheel = new WordWheel();

var hasClicked = []; // which letters have been clicked
var guess = []; // records the guess
var guessId = []; // records the guess ids

// elements
const board = document.getElementById('board');
const guessBox = document.getElementById('guess');
const submitButton = document.getElementById('submit');
const backButton = document.getElementById('back');
const scoreBox = document.getElementById('score');
const listBox = document.getElementById('list');
var letterBox = [];

setUpView();
DataBase.fetchGame(wordWheel, () => {
  // update the screen
  for (let i in wordWheel.guessList) {
    let item = document.createElement('li');
    item.innerHTML = wordWheel.guessList[i].toUpperCase();
    listBox.appendChild(item);
  }
  resetGuess();
  console.log(wordWheel.wordList);
});
updateColorScheme();
setUpActions();

/* ========================================================================== */
/*   FUNCTIONS                                                                */
/* ========================================================================== */
// sets up the html
function setUpView() {
  const tileSize = 25;

  // draw the main letter
  let letter = document.createElement('div');
  letter.classList.add('letter');
  letter.classList.add('keyLetter');
  letter.innerHTML = wordWheel.keyLetter;
  letter.id = 0;
  let x = 50 - tileSize/2;
  let y = 50 - tileSize/2;
  letter.style.width = tileSize+'%';
  letter.style.left = x+'%';
  letter.style.top = y+'%';
  board.appendChild(letter);
  letterBox.push(letter);
  hasClicked.push(false);

  // draw the remaining letters
  for (var i = 1; i < wordWheel.keyWord.length; i++) {
    // create a letter div for each one
    let letter = document.createElement('div');
    letter.classList.add('letter');
    letter.innerHTML = wordWheel.letters[i];
    letter.id = i;

    // work out the position
    let theta = (i-1) * 2.0 * Math.PI / (wordWheel.keyWord.length-1);
    let x = 50+35*Math.cos(theta) - tileSize/2;
    let y = 50+35*Math.sin(theta) - tileSize/2;
    letter.style.width = tileSize+'%';
    letter.style.left = x+'%';
    letter.style.top = y+'%';

    board.appendChild(letter);
    letterBox.push(letter);
    hasClicked.push(false);
  }

  resetGuess();
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

// updates the button colors
function updateSelection() {
  for (var i = 0; i < wordWheel.keyWord.length; i++) {
    if (hasClicked[i]) {
      letterBox[i].classList.remove('unselected');
      letterBox[i].classList.add('selected');
    } else {
      letterBox[i].classList.remove('selected');
      letterBox[i].classList.add('unselected');
    }
  }

  guessBox.innerHTML = guess.join('');
}

// resets the guess
function resetGuess() {
  guess = [];
  guessId = [];
  for(var i = 0; i < wordWheel.keyWord.length; i++){
    hasClicked[i] = false;
  }

  if (wordWheel.score < wordWheel.aim[0]) {
    scoreBox.innerHTML = wordWheel.score + " words, (average " + wordWheel.aim[0] + ")";
  } else if (wordWheel.score < wordWheel.aim[1]) {
    scoreBox.innerHTML = wordWheel.score + " words, (good " + wordWheel.aim[1] + ")";
  } else if (wordWheel.score < wordWheel.aim[2]) {
    scoreBox.innerHTML = wordWheel.score + " words, (excellent " + wordWheel.aim[2] + ")";
  } else {
    scoreBox.innerHTML = wordWheel.score + " words, (total " + wordWheel.aim[3] + ")";
  }

  updateSelection();
}

// flash good, rep, bad status for a guess
function flashStatus(status) {
  let anim = 'anim-' + status + ' 0.5s linear 1';
  for (var i in hasClicked) {
    if (hasClicked[i]) {
      document.getElementById(i).style.animation = anim;
    }
  }
  setTimeout(function () {
    for (var i in hasClicked) {
      document.getElementById(i).style.animation = null;
    }
  }, 500);
}

// removes the last letter
function backspace() {
  // do nothing if the guess is empty
  if (guess.length == 0) {
    return;
  }

  // remove the last letter
  let id = guessId.pop();
  guess.pop();
  hasClicked[id] = false;

  updateSelection();
}

// what do do if a key tap is detected
function keyTapped(event) {
  let keyCode = event.keyCode;
  let key = String.fromCharCode(keyCode); // note that this is uppercase

  if (event.keyCode >= 48 && event.keyCode <= 57) {
    // NUMBER
  } else if (event.keyCode >= 65 && event.keyCode <= 90) {
    // ALPHABET UPPER CASE
  } else if (event.keyCode >= 97 && event.keyCode <= 122) {
    // ALPHABET LOWER CASE
    // TODO: enable keyboard usage
  } else {
    // CONTROL KEYS
    // delete: 8
    // forward delete: 46
    // enter: 13
    // arrow keys [UDLR]: 97, 40, 37, 39

    if (keyCode == 8) {
      backspace();
    } else if (keyCode == 13) {
      tapSubmit();
    }
  }
}

// what to do if the game is clicked/tapped
function tapDown(event) {
  let target = event.target;

  if (target.classList.contains('letter')) {
    let id = target.id;
    let letter = target.innerHTML;

    if (!hasClicked[id]) {
      // add letter if it hasn't been used already
      hasClicked[id] = true;
      guess.push(letter);
      guessId.push(id);
    } else if (id == guessId[guessId.length-1]) {
      // remove selected if it was the previous one
      backspace();
    }

    updateSelection();
  } else if (target.id == 'board') {
    resetGuess();
  }
}

// submit a guess
function tapSubmit() {
  let len = guess.length;
  let word = guess.join('');

  let status = wordWheel.checkGuess(word);
  flashStatus(status);

  if (status == 'good') {
    let item = document.createElement('li');
    item.innerHTML = word;
    listBox.appendChild(item);
    DataBase.saveGame(wordWheel);
  }

  resetGuess();
}

// set up interactions with the game internals
function setUpActions() {
  // TODO: be different depending on computer vs touchscreen
  document.addEventListener('keydown', keyTapped);
  document.addEventListener('click', tapDown);
  submitButton.onclick = tapSubmit;
  backButton.onclick = backspace;
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColorScheme);
}
