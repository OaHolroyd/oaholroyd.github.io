/* jshint esversion: 6 */

const puzzles = [
  'Word Wheel',
  'Word Grid',
  'Grid Clear',
];

updateColorScheme();
setUpActions();
setUpLinks();

/* ========================================================================== */
/*   FUNCTIONS                                                                */
/* ========================================================================== */
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
    document.documentElement.style.setProperty('--inv', '1.0');
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
    document.documentElement.style.setProperty('--inv', '0.0');
  }
}

// set up interactions with the game internals
function setUpActions() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColorScheme);
}

// fill the list with all of the available puzzles
function setUpLinks() {
  let puzzleList = document.getElementById('puzzleList');

  let seed = Random.seed();

  for (puzzle of puzzles) {
    // get names
    let displayName = puzzle;
    let fileName = puzzle.replace(/ /g, "-").toLowerCase();

    // fetch the stats and asynchronously update
    let statsBox = document.createElement('div');
    statsBox.classList.add('stats');

    let completed = document.createElement('div');
    completed.classList.add('completed');

    let streakBox = document.createElement('div');
    streakBox.classList.add('streakBox');
    let streakText = document.createElement('div');
    streakText.classList.add('infoText');
    streakText.innerHTML = "streak";
    let streak = document.createElement('div');
    streak.classList.add('streak');
    streakBox.appendChild(streak);
    streakBox.appendChild(streakText);

    let totalBox = document.createElement('div');
    totalBox.classList.add('totalBox');
    let totalText = document.createElement('div');
    totalText.classList.add('infoText');
    totalText.innerHTML = "total";
    let total = document.createElement('div');
    total.classList.add('total');
    totalBox.appendChild(total);
    totalBox.appendChild(totalText);

    statsBox.appendChild(completed);
    statsBox.appendChild(streakBox);
    statsBox.appendChild(totalBox);

    DataBase.fetchStats(fileName, (stats) => {
      if (stats.lastCompletion == seed) {
        completed.classList.add('yes');
      } else {
        completed.classList.add('no');
      }

      streak.innerHTML = stats.streak;
      total.innerHTML = stats.total;
    });

    // create elements
    let box = document.createElement('div');
    box.classList.add('responsive');

    let link = document.createElement('a');
    link.href = fileName + '.html';

    let imgBox = document.createElement('div');
    imgBox.classList.add('gallery');

    let img = document.createElement('img');
    img.src = 'images/' + fileName + '.svg'; // TODO: what if this doesn't exist?
    img.alt = fileName;
    img.onerror = "this.onerror=null;this.src='images/puzzles-512.png';";
    // TODO: also set width and height?

    let desc = document.createElement('div');
    desc.classList.add('desc');
    desc.innerHTML = displayName;

    // assemble
    imgBox.appendChild(img);
    imgBox.appendChild(desc);
    imgBox.appendChild(statsBox);
    link.appendChild(imgBox);
    box.appendChild(link);
    puzzleList.appendChild(box);

  }

  // final "coming soon" box
  let displayName = 'coming soon';
  let fileName = 'puzzles-512';

  let statsBox = document.createElement('div');
  statsBox.classList.add('stats');
  let completed = document.createElement('div');
  completed.classList.add('completed');
  let streakBox = document.createElement('div');
  streakBox.classList.add('streakBox');
  let streakText = document.createElement('div');
  streakText.classList.add('infoText');
  streakText.innerHTML = "streak";
  let streak = document.createElement('div');
  streak.classList.add('streak');
  streakBox.appendChild(streak);
  streakBox.appendChild(streakText);
  let totalBox = document.createElement('div');
  totalBox.classList.add('totalBox');
  let totalText = document.createElement('div');
  totalText.classList.add('infoText');
  totalText.innerHTML = "total";
  let total = document.createElement('div');
  total.classList.add('total');
  totalBox.appendChild(total);
  totalBox.appendChild(totalText);
  statsBox.appendChild(completed);
  statsBox.appendChild(streakBox);
  statsBox.appendChild(totalBox);
  streak.innerHTML = 0;
  total.innerHTML = 0;

  let box = document.createElement('div');
  box.classList.add('responsive');
  let link = document.createElement('a');
  link.href = 'javascript:;';
  let imgBox = document.createElement('div');
  imgBox.classList.add('gallery');
  let img = document.createElement('img');
  img.src = 'images/' + fileName + '.png'; // TODO: what if this doesn't exist?
  img.alt = fileName;
  // TODO: also set width and height?
  let desc = document.createElement('div');
  desc.classList.add('desc');
  desc.innerHTML = displayName;

  imgBox.appendChild(img);
  imgBox.appendChild(desc);
  imgBox.appendChild(statsBox);
  link.appendChild(imgBox);
  box.appendChild(link);
  puzzleList.appendChild(box);

  // finish list
  let end = document.createElement('div');
  end.classList.add('clearfix');
  puzzleList.appendChild(box);
}
