/* global selectDevice headsets headsetUrlMap sendParentMessage uiHooks */

var showcaseHeadsets = [
  {name: "Google Cardboard V2", qrUrl: "goo.gl/R2gCV1"},
  {name: "Google Cardboard V1", qrUrl: "g.co/cardboard"},
  {name: "View-Master VR", qrUrl: "goo.gl/pdNRON"},
  {name: "Homido Mini", qrUrl: "goo.gl/KtBrnE"},
  {name: "Powis ViewR", qrUrl: "goo.gl/UWAaPF"},
  {name: "DSCVR", qrUrl: "goo.gl/rbM2ur"},
  {name: "Zeiss VR ONE", qrUrl: "goo.gl/vvTUK3"}
];

function deviceButtonClickListener(evt) {
  return selectDevice(evt.currentTarget.dataset.qrUrl);
}

function nameForHeadset(headset) {
  // If the headset has both a model and vendor name defined
  if (headset.vendor && headset.model) {

    // If the model name begins with the vendor name
    if (headset.model.slice(0, headset.vendor.length) == headset.vendor) {
      // just use the model name
      return headset.model;

    // If the model name doesn't begin with the vendor name
    } else {
      // use the vendor and model names
      return headset.vendor + ' ' + headset.model;
    }

  // If the headset has an empty vendor, model, or both
  } else {
    // use the only-present model, vendor, or hint field
    return headset.model || headset.vendor || headset.hint;
  }
}

var templateHeadsetButton = document.createElement('button');
templateHeadsetButton.className = 'headset';

function createHeadsetButton(headset, content) {
  var headsetButton = templateHeadsetButton.cloneNode();
  if (!content) {
    content = document.createTextNode(nameForHeadset(headset));
  }
  headsetButton.appendChild(content);
  headsetButton.dataset.qrUrl = headset.original_url;
  headsetButton.addEventListener('click', deviceButtonClickListener);
  return headsetButton;
}

var listContainer = document.createElement('div');
listContainer.className = 'mixed-case buttonlist';

function listAllHeadsets() {
  for (var i = 0; i < headsets.length; i++) {
    listContainer.appendChild(createHeadsetButton(headsets[i]));
  }
  document.body.appendChild(listContainer);
}

function showHeadsetList() {
  if (listContainer.children.length == 0) {
    listAllHeadsets();
  }
  listContainer.hidden = false;
}

var pageHeading = document.createElement('h1');
pageHeading.textContent = 'Select your viewer';
document.body.appendChild(pageHeading);

var showcaseContainer = document.createElement('div');
showcaseContainer.className = 'buttonlist';

for (var i = 0; i < showcaseHeadsets.length; i++) {
  var showcasedHeadset = showcaseHeadsets[i];
  var headsetHeading = document.createElement('h2');
  headsetHeading.textContent = showcasedHeadset.name;
  showcaseContainer.appendChild(createHeadsetButton(
    headsetUrlMap.get(showcasedHeadset.qrUrl), headsetHeading));
}

document.body.appendChild(showcaseContainer);

var browseButton = document.createElement('button');
browseButton.textContent = 'Browse all known headsets';
browseButton.addEventListener('click', showHeadsetList);

document.body.appendChild(browseButton);

function startPresentation() {
  listContainer.hidden = true;
  window.scrollTo(0, 0);
  sendParentMessage({
    type: 'ready',
    presentable: true
  });
}

uiHooks.present = startPresentation;
startPresentation();
