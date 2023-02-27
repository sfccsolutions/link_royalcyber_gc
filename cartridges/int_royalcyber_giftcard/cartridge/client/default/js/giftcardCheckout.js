'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./giftcard/giftcardCheckout'));
});

require('base/components/spinner');