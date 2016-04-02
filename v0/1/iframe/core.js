/* global localStorage location */

// for returning the queried headset when localStorage is unavailable
var currentDeviceProfile = null;

function sendParentMessage(message) {
  return window.parent.postMessage(message, '*');
}

function selectDevice(profile) {
  var message = {
    type: 'deviceprofile',
    source: 'selected',
    stored: true,
    profile: profile
  };
  try {
    localStorage.setItem('currentDeviceProfileJson',
      JSON.stringify(profile));
  } catch (e) {
    message.stored = false;
  }
  sendParentMessage(message);
}

function querySelectedHeadset() {
  var message = {
    type: 'deviceprofile',
    source: 'stored',
    stored: true,
    profile: null
  };
  try {
    currentDeviceProfile = JSON.parse(
      localStorage.getItem('currentDeviceProfileJson'));
  } catch (e) {
    message.stored = false;
  }
  message.profile = currentDeviceProfile;
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
