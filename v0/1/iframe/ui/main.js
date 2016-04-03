/* global sendParentMessage uiHooks qrContainer */

function addScripts(scriptURLs) {
  return new Promise(function(resolve) {
    for (var i = 0; i < scriptURLs.length; i++) {
      var scriptEl = document.createElement('script');
      if (i == scriptURLs.length - 1) {
        scriptEl.addEventListener('load',resolve);
      }
      scriptEl.async = false;
      scriptEl.src = scriptURLs[i];
    }
  });
}

function onDemandLoader(scriptURLs) {
  var loadPromise;
  return function loader() {
    return loadPromise || (loadPromise = addScripts(scriptURLs));
  };
}

var templateMode = document.createElement('div');
templateMode.className = 'flexcol';
templateMode.hidden = true;

var modes = {
  main: templateMode.cloneNode(),
  list: templateMode.cloneNode(),
  qr: templateMode.cloneNode()
};

var loadSearcher = onDemandLoader([
  'vendor/lunr.min.js',
  'ui/list.js'
]);
function showSearchPane() {
  return loadSearcher().then(function () {
    modes.main.hidden = true;
    modes.list.hidden = false;
    modes.qr.hidden = true;
  });
}

var loadScanner = onDemandLoader([
  'vendor/qrcode.js',
  'ui/qr.js'
]);
function showScanPane() {
  return loadScanner().then(function () {
    modes.main.hidden = true;
    modes.list.hidden = true;
    modes.qr.hidden = false;
  });
}

// TODO: display current viewer info
var pageHeading = document.createElement('h1');
pageHeading.textContent = 'Select your viewer';
modes.main.appendChild(pageHeading);

var scanButton = document.createElement('button');
scanButton.textContent = 'Scan headset QR code';
scanButton.addEventListener('click', showScanPane);
modes.main.appendChild(scanButton);

var browseButton = document.createElement('button');
browseButton.textContent = 'Search known headsets';
browseButton.addEventListener('click', showSearchPane);
modes.main.appendChild(browseButton);

document.body.appendChild(modes.main);
document.body.appendChild(modes.list);
document.body.appendChild(modes.qr);

function startPresentation() {
  modes.main.hidden = false;
  modes.list.hidden = true;
  modes.qr.hidden = true;
  window.scrollTo(0, 0);
  sendParentMessage({
    type: 'ready',
    presentable: true
  });
}

uiHooks.present = startPresentation;
startPresentation();
