/* global fetch */

var headsets;
var headsetUrlMap = new Map();
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

// For handling device selections while the device list is loading,
// and for returning the queried headset when localStorage is unavailable
var selectedHeadsetQrUrl;

function sendParentMessage(message) {
  return window.parent.postMessage(message, '*');
}

function selectDevice(url) {
  var noHeadsetSelected = !selectedHeadsetQrUrl;
  selectedHeadsetQrUrl = url;

  // if we're not already in a pre-load-selected-headset state
  if (headsets || noHeadsetSelected) {

    // select this headset after headsets are loaded
    headsetPromise.then(function() {
      var message = {
        type: 'deviceprofile',
        source: 'selected',
        stored: true,
        profile: headsetUrlMap.get(selectedHeadsetQrUrl)
      };
      try {
        localStorage.setItem('selectedHeadsetQrUrl', selectedHeadsetQrUrl);
      } catch (e) {
        message.stored = false;
      }
      sendParentMessage(message);
    });
  }
}

headsetPromise.then(function() {
  // if the user hasn't selected another headset before the load finished
  if (!selectedHeadsetQrUrl) {
    var message = {
      type: 'deviceprofile',
      source: 'stored',
      stored: true,
      profile: null
    };
    try {
      selectedHeadsetQrUrl = localStorage.getItem('selectedHeadsetQrUrl');
    } catch (e) {
      message.stored = false;
    }
    if (message.stored) {
      message.profile = headsetUrlMap.get(selectedHeadsetQrUrl);
    }
    sendParentMessage(message);
  }
});

function deviceButtonClickListener(evt) {
  return selectDevice(evt.currentTarget.dataset.qrUrl);
}

var selectorView = document.getElementById("selector");
var selectorDeviceButtons = selectorView.querySelectorAll('button.headset');
for (var i = 0; i < selectorDeviceButtons.length; i++) {
  selectorDeviceButtons[i].addEventListener(
    'click', deviceButtonClickListener);
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

function createHeadsetButton(headset) {
  var headsetButton = document.createElement('button');
  var headsetHeading = document.createElement('h2');
  headsetHeading.textContent = nameForHeadset(headset);
  headsetButton.appendChild(headsetHeading);
  headsetButton.dataset.qrUrl = headset.original_url;
  headsetButton.addEventListener('click', deviceButtonClickListener);
  return headsetButton;
}

var listContainer = document.getElementById('more');
var listPopulationPromise;

function listAllHeadsets() {
  return listPopulationPromise || (listPopulationPromise =
    headsetPromise.then(function () {
      for (var i = 0; i < headsets.length; i++) {
        listContainer.appendChild(createHeadsetButton(headsets[i]));
      }
    }));
}

function showHeadsetList() {
  listAllHeadsets().then(function() {
    listContainer.hidden = false;
  });
}

var browseButton = document.getElementById('browse');
browseButton.addEventListener('click', showHeadsetList);

function querySelectedHeadset() {
  var message = {
    type: 'deviceprofile',
    source: 'stored',
    stored: true,
    profile: null
  };
  try {
    selectedHeadsetQrUrl = localStorage.getItem('selectedHeadsetQrUrl');
  } catch (e) {
    message.stored = false;
  }
  message.profile = headsetUrlMap.get(selectedHeadsetQrUrl);
  sendParentMessage(message);
}

function resetState() {
  listContainer.hidden = true;
}

function receiveMessage(evt) {
  var message = evt.data;
  switch (message.type) {
    case 'query':
      return querySelectedHeadset();
    case 'restart':
      return resetState();
  }
}

window.addEventListener("message", receiveMessage);
