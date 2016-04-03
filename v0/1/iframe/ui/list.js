/* global selectDevice headsets headsetUrlMap modes lunr */

function deviceButtonClickListener(evt) {
  return selectDevice(headsetUrlMap.get(evt.currentTarget.dataset.qrUrl));
}

function nameForHeadset(headset) {
  // If the headset profile has a name hint
  if (headset.hint) {
    // use it
    return headset.hint;

  // If the headset has both a model and vendor name defined
  } else if (headset.vendor && headset.model) {

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
    // use the only-present model (or vendor) field
    return headset.model || headset.vendor;
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

var listContainer = modes.list;
listContainer.classList.add('mixed-case');

var searchIndex = new lunr.Index;
searchIndex.pipeline.add(lunr.trimmer);
searchIndex.field('model');
searchIndex.field('vendor');
searchIndex.field('hint');
searchIndex.ref('original_url');

var buttonsByHeadsetIndex = [];

var searchBar = document.createElement('input');
searchBar.type = 'search';
searchBar.placeholder = 'Search';
searchBar.addEventListener('input', function() {
  if (searchBar.value) {
  var resultSet = new Set(searchIndex.search(searchBar.value)
    .map(function(ob){
      return ob.ref.original_url;
    }));
    for (var i = 0; i < headsets.length; i++) {
      buttonsByHeadsetIndex[i].hidden =
        !resultSet.has(headsets[i].original_url);
    }
  } else {
    for (var i = 0; i < headsets.length; i++) {
      buttonsByHeadsetIndex[i].hidden = false;
    }
  }
});

for (var i = 0; i < headsets.length; i++) {
  searchIndex.add(headsets[i]);
  var headsetButton = createHeadsetButton(headsets[i]);
  buttonsByHeadsetIndex[i] = headsetButton;
  listContainer.appendChild(headsetButton);
}
