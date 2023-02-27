'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./giftcard/giftcardCart'));
    
});

require('base/components/spinner');