'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./giftcard/giftcard'));
   
});

require('base/components/spinner');