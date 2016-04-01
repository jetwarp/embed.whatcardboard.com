/* global fetch */
var headsets;
var headsetUrlMap = new Map();
(function(){
var headsetPromise = fetch('../headsets.json').then(function(response) {
	return response.json();
}).then(function(headsetArray) {
	headsets = headsetArray;
	for (var i = 0; i < headsets.length; i++) {
	  var headset = headsets[i];
	  headsetUrlMap.set(headset.original_url, headset);
	}
	return headsets;
});

var stylesheets = [
  "https://cdnjs.cloudflare.com/ajax/libs/normalize/4.0.0/normalize.min.css",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "layout.css",
  "style.css",
];

for (var i = 0; i < stylesheets.length; i++){
  var el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = stylesheets[i];
  document.head.appendChild(el);
}

// since we have no hard JS dependencies that weren't loaded for core.js,
// we'll just directly add ui.js to the document (once the headsets are loaded)
headsetPromise.then(function(){
var uiscr = document.createElement('script');
uiscr.src = 'ui.js';
document.head.appendChild(uiscr);
});
})();
