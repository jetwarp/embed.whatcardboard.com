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

var uiHooks;

function presentUserInterface() {
  if (!uiHooks) {
    uiHooks = {
      present: null
    };
    var uiBootstrapper = document.createElement('script');
    uiBootstrapper.src = 'loadui.js';
    return document.head.appendChild(uiBootstrapper);
  } else {
    return uiHooks.present && uiHooks.present();
  }
}

function bounceUnrecognizedMessage(original) {
  return sendParentMessage({
    type: 'bounce',
    reason: 'unrecognized',
    original: original
  });
}

function receiveMessage(evt) {
  var message = evt.data;
  switch (message.type) {
    case 'query': return querySelectedHeadset();
    case 'present': return presentUserInterface();
    case 'reload': return location.reload();
    default: return bounceUnrecognizedMessage(message);
  }
}

window.addEventListener('message', receiveMessage);

applicationCache.addEventListener('updateready', function() {
  return sendParentMessage({type: 'updateready'});
});

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
