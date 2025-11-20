/* update the name of the cache */
var cacheName = 'puzzles';

/* ensure that this contains everything */
// TODO: should probably glob to automatically update this list
var filesToCache = [
  '/',
  '/index.html',
  '/grid-clear.html',
  '/word-grid.html',
  '/word-wheel.html',
  '/js/DataBase.js',
  '/js/Random.js',
  '/js/Trie.js',
  '/js/GridClear.js',
  '/js/WordGrid.js',
  '/js/WordWheel.js',
  '/js/en-gb-9.js',
  '/js/en-gb.js',
  '/js/index.js',
  '/js/main.js',
  '/js/grid-clear-view.js',
  '/js/word-grid-view.js',
  '/js/word-wheel-view.js',
  '/css/index.css',
  '/css/grid-clear.css',
  '/css/word-grid.css',
  '/css/word-wheel.css',
  '/images/puzzle.svg',
  '/images/word-grid.svg',
  '/images/word-wheel.svg',
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      const stack = [];
      filesToCache.forEach(file => stack.push(
          cache.add(file).catch(_=>console.error(`can't load ${file} to cache`))
      ));
      return Promise.all(stack);
    })
  );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
