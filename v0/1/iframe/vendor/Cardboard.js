/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

/*global dcodeIO*/

var CARDBOARD = (function() {
  // to and from URL-safe variant of base64 encoding
  function base64ToUrl(s) {
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  }

  function base64FromUrl(s) {
    s = s + '==='.slice(0, [0, 3, 2, 1][s.length % 4]);
    return s.replace(/-/g, '+').replace(/_/g, '/');
  }

  var PARAMS_URI_PREFIX = 'http://google.com/cardboard/cfg?p=';

  var DeviceParams = dcodeIO.ProtoBuf
      .loadProtoFile('CardboardDevice.proto').build().DeviceParams;

  function paramsToUri(params) {
    var msg = new DeviceParams(params);
    return PARAMS_URI_PREFIX + base64ToUrl(msg.toBase64());
  }

  // TODO: support Cardboard v1 URI (i.e. default params)
  function uriToParamsProto(uri) {
    if (uri.substring(0, PARAMS_URI_PREFIX.length) !== PARAMS_URI_PREFIX) {
      return;
    }
    var base64_msg = base64FromUrl(uri.substring(PARAMS_URI_PREFIX.length));
    // TODO: round numeric values
    return DeviceParams.decode64(base64_msg);
  }

  // Returns plain object having only properties of interest.
  function uriToParams(uri) {
    var source = uriToParamsProto(uri), dest = {}, k;
    for (k in source) {
      if (source.hasOwnProperty(k)) {
        dest[k] = source[k];
      }
    }
    return dest;
  }

  return {
    DeviceParams: DeviceParams,
    paramsToUri: paramsToUri,
    uriToParams: uriToParams,
    uriToParamsProto: uriToParamsProto,
  };
}());
