/* global URL fetch onDemandLoader qrcode CARDBOARD headsets headsetUrlMap
   selectDevice modes
*/

var googleAPIKey = 'AIzaSyCTBx73Ol0jSj28o6Tq-G4kutIE6XOf6Ps';

function shortUrlLookup(shortUrl) {
  return 'https://www.googleapis.com/urlshortener/v1/url?shortUrl=' +
    encodeURIComponent(shortUrl) + '&key=' + googleAPIKey;
}

function getLongUrl(shortUrl) {
  return fetch(shortUrlLookup(shortUrl)).then(function(response) {
    return response.json();
  }).then(function(response) {
    return response.longUrl;
  });
}

var loadCardboardLib = onDemandLoader([
  'vendor/ByteBufferAB.min.js',
  'vendor/ProtoBuf.min.js',
  'vendor/Cardboard.js'
]);

function getProfileFromShortUrl(url) {
  return Promise.all([loadCardboardLib(), getLongUrl(url)])
    .then(function(results) {
      // will return null if this doesn't look like a profile
      return CARDBOARD.uriToParams(results[1]);
    });
}

// TODO: have error / return types that go by an enum-like construction
// stating what level failed:
// - 1: Blob not valid image
// - 2: No QR code in image
// - 3: QR code was not goo.gl or other compatible data
// - 4: Short URL does not point to a compatible profile URL
// - 5: Profile decoding failed
function handleQRImage(blobUrl) {
  return qrcode.decode(blobUrl).then(function(result){
    // TODO: test that result looks like goo.gl/something
    if (headsetUrlMap.has(result)) {
      return headsetUrlMap.get(result);
    } else {
      return getProfileFromShortUrl(result);
    }
  });
}

var qrContainer = modes.qr;

var fileInput = document.createElement('input');
fileInput.id = 'qr-file-input';
fileInput.className = 'proxied';
fileInput.type = 'file';
fileInput.accept = 'image/*';

// tell browsers that support it to jump directly to the camera
fileInput.setAttribute('capture', 'camera');

var proxyLabel = document.createElement('label');
proxyLabel.htmlFor = fileInput.id;
proxyLabel.className = 'button';
proxyLabel.textContent = 'Take photo of QR code';

qrContainer.appendChild(fileInput);
qrContainer.appendChild(proxyLabel);

var thumbnailImage = document.createElement('img');

var statusParagraph = document.createElement('p');

fileInput.addEventListener('change', function(){
  var blobURL = URL.createObjectURL(fileInput.files[0]);

  // HACK: These should only be added once
  qrContainer.appendChild(thumbnailImage);
  qrContainer.appendChild(statusParagraph);
  qrContainer.appendChild(fileInput);
  qrContainer.appendChild(proxyLabel);

  thumbnailImage.src = blobURL;
  // TODO: use success or failure to display via thumbnailImage as validation
  handleQRImage(blobURL).then(function (profile) {
    if (profile) {
      selectDevice(profile);
    } else {
      statusParagraph.textContent = 'something went wrong';
    }
  });
});
