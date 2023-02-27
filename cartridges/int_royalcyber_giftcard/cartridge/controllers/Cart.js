"use strict";

/* global empty */
var server = require("server");
server.extend(module.superModule);

var BasketMgr = require("dw/order/BasketMgr");
var ProductLineItemsModel = require("*/cartridge/models/productLineItems");

server.append("AddProduct", function (req, res, next) {
    var Resource = require("dw/web/Resource");

    var viewData = res.getViewData();
    var currentBasket = BasketMgr.getCurrentOrNewBasket();

    if (!empty(currentBasket)) {
        var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems, currentBasket.getGiftCertificateLineItems());
        var minicartCountOfItems = Resource.msgf("minicart.count", "common", null, quantityTotal);
        viewData.quantityTotal = quantityTotal;
        viewData.minicartCountOfItems = minicartCountOfItems;
        res.setViewData(viewData);
    }

    next();
});
server.append("MiniCart", server.middleware.include, function (req, res, next) {
    var viewData = res.getViewData();
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!empty(currentBasket)) {
        var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems, currentBasket.getGiftCertificateLineItems());
        viewData.quantityTotal = quantityTotal;
        res.setViewData(viewData);
    }

    return next();
});

server.append("AddBonusProducts", function (req, res, next) {
    var viewData = res.getViewData();
    var currentBasket = BasketMgr.getCurrentOrNewBasket();

    if (!empty(currentBasket)) {
        var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems, currentBasket.getGiftCertificateLineItems());
        viewData.totalQty = quantityTotal;
        res.setViewData(viewData);
    }

    next();
});

module.exports = server.exports();
