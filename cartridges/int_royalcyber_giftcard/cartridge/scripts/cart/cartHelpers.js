"use strict";

var ProductMgr = require("dw/catalog/ProductMgr");
var URLUtils = require("dw/web/URLUtils");

var collections = require("*/cartridge/scripts/util/collections");

var baseModule = module.superModule;

/**
 * return a link to enable reporting of add to cart events
 * @param {dw.order.Basket} currentBasket - the target Basket object
 * @param {boolean} resultError - the target Basket object
 * @return {string|boolean} returns a url or boolean value false
 */
function getReportingUrlAddToCart(currentBasket, resultError) {
    if (currentBasket && currentBasket.allLineItems.length && currentBasket.giftCertificateLineItems.length && !resultError) {
        return URLUtils.url("ReportingEvent-MiniCart").toString();
    }

    return false;
}

baseModule.getReportingUrlAddToCart = getReportingUrlAddToCart;

module.exports = baseModule;
