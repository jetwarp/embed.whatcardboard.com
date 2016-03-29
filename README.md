# embed.whatcardboard.com

A web API for determining Google Cardboard status.

## Usage

whatcardboard.com provides a page for use as an embedded iframe element that
the user can use to choose their Google Cardboard enclosure. This iframe should
be included in your page as an initially-hidden element:

```html
<iframe src="https://embed.whatcardboard.com/v0/1/iframe/" hidden></iframe>
```

The iframe will send your page `message` events reflecting the status of the
user's selected Cardboard headset.

If you wish to have the user manually (re-)select their headset, simply make
the iframe element visible in your page.

## Messages sent by the iframe

### type: 'deviceprofile'

source: either 'selected' (for when the user has just selected their headset),
or 'stored' (when the iframe inits and has an existing record, or is queried).

stored: false if localStorage gave an error, true otherwise.

profile: An object mostly conforming to the CardboardDevice Protocol Buffer
definition's DeviceProfile message schema (see "Device profile structure" below
for details). If no viewer has been selected by the user, this will be `null`.

### type: 'bounce'

This is the message type that the iframe will send in response to any
messages of an unrecognized type.

reason: this will be the string "unrecognized".

original: This will contain the message being bounced. You may choose to
include uniquely identifying fields on messages you send if you wish to
recognize a specific bounce response.

### type: 'close'

User has clicked the close / cancel button within the iframe. (Currently, no
such element exists, so this will never be sent.)

## Messages accepted by the iframe

### type: 'restart'

Use for when the iframe is getting displayed after having been previously
closed, to discard the user's previous state (displayed tab/mode, scroll
position, etc).

### type: 'query'

Ask the iframe to re-send its stored device profile. Can be useful for when a
page is getting focus after the selected viewer has been changed via another
tab.

## Device profile structure

Here's the object for the V2 Google Cardboard viewer, for example:

```json
{
  "vendor": "Google",
  "model": "Cardboard I/O 2015",
  "screen_to_lens_distance": 0.03680000081658363,
  "inter_lens_distance": 0.06199999898672104,
  "left_eye_field_of_view_angles": [
    50,
    50,
    50,
    50
  ],
  "vertical_alignment": "bottom",
  "tray_to_lens_distance": 0.03500000014901161,
  "distortion_coefficients": [
    0.26260000467300415,
    0.2678999900817871
  ],
  "has_magnet": false,
  "primary_button": "indirect_touch",
  "original_url": "goo.gl/R2gCV1"
}
```

See the comments for [CardboardDevice.proto][] for details about any of these
fields. (Note that `enum` values are converted to lowercase strings.)

[CardboardDevice.proto]: https://wwgc.firebaseapp.com/CardboardDevice.proto

### Added fields

The `original_url` property contains the string value of the QR code for that
viewer's profile: in the case of every viewer other than the original June 2014
Google Cardboard, this is a goo.gl link that redirects to a URL with the device
profile embedded as a Base64-encoded Protocol Buffer.

Some headset profiles, where both the `vendor` and the `model` field were left
empty at the time of the profile's creation, have an added `hint` property,
containing an externally-added string identifying that profile (for example,
the SnailVR headset has `vendor": "", "model": "",` and `"hint": "SnailVR"`).
