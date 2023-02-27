"use strict";

var base = module.superModule;
var collections = require('*/cartridge/scripts/util/collections');

function getTotalQuantity(items, giftCertificatesLineItems) {
    var totalQuantity = 0;
    if (items) {
        collections.forEach(items, function (lineItem) {
            totalQuantity += lineItem.quantity.value;
        });
    }
    if (giftCertificatesLineItems) {
        // adding giftCertificateLineItems quantity
        totalQuantity += giftCertificatesLineItems.length;
    }

    return totalQuantity;
}

function ProductLineItems(productLineItems, giftCertificatesLineItems, view) {
    module.superModule.call(this, productLineItems, view)
    var giftcertificate = giftCertificatesLineItems;
    if (productLineItems || giftCertificatesLineItems) {
        this.totalQuantity = getTotalQuantity(productLineItems, giftCertificatesLineItems);
    }
}

ProductLineItems.getTotalQuantity = getTotalQuantity;

module.exports = ProductLineItems;
