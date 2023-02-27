/* eslint-disable no-plusplus */

"use strict";

/* global empty */
var server = require("server");
server.extend(module.superModule);

var COHelpers = require("*/cartridge/scripts/checkout/checkoutHelpers");

var BasketMgr = require("dw/order/BasketMgr");
var Resource = require("dw/web/Resource");
var Transaction = require("dw/system/Transaction");

var GiftCardHelpers = require("*/cartridge/scripts/helpers/giftCard/giftCardHelpers");

server.prepend("Begin",
    server.middleware.https,
    function (req, res, next) {
        GiftCardHelpers.adjustGiftCertificates();

        next();
    });

server.append("Begin",
    server.middleware.https,
    function (req, res, next) {
        var currentBasket = BasketMgr.getCurrentBasket();
        var viewData = res.getViewData();
        if (!viewData.order.productQuantityTotal && viewData.order.giftcertificates.length > 0) {
            viewData.currentStage = "payment";
        }
        for (var i = 0; i < currentBasket.shipments.length; i++) {
            var shipment = currentBasket.shipments[i];
            if (shipment.giftCertificateLineItems.length > 0) {
                req.session.privacyCache.set(shipment.UUID, "valid");

            }
        }
        viewData.basket = currentBasket;
        var giftcardForm = server.forms.getForm("giftcard");
        viewData.giftcard = giftcardForm;
        var paymentOptionsTabValue = req.querystring.action || "credit-card-content";
        viewData.paymentTabVal = paymentOptionsTabValue;
        res.setViewData(viewData);

        next();
    });



server.get("RedeemGiftCard", function (req, res, next) {
    var Site = require("dw/system/Site");
    var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
    var gcAmount = Site.current.getCustomPreferenceValue("GiftCardAmountOfGCs") || 5;
    var giftCardCode = req.querystring.giftcardID;
    var giftCardStatus = GiftCardHelpers.redeemGiftCertificate(giftCardCode);
    var gc = GiftCertificateMgr.getGiftCertificateByCode(giftCardCode);
    var Basket = BasketMgr.getCurrentOrNewBasket();
    var viewData = res.getViewData();
    viewData.basket = Basket;

    if (req.httpHeaders["x-requested-with"] === "XMLHttpRequest") {
        if (giftCardStatus.error) {
            res.json({
                status: giftCardStatus.code,
                success: !giftCardStatus.error,
                message: Resource.msgf("billing." + giftCardStatus.code, "giftcard", null, giftCardStatus.parameters),
                code: giftCardCode,
                amountOfGC: gcAmount
            });
        } else {
            res.setViewData(viewData);
            res.render("checkout/giftcard/giftCardRedeem", {
                basket: Basket,
                amountOfGC: gcAmount,
            });
        }
    } else {
        res.json({});
    }
    return next();
});
server.get("RemoveGiftCertificate", function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var giftCertificateID = req.querystring.giftCertificateID;

    if (!empty(giftCertificateID)) {
        Transaction.wrap(function () {
            GiftCardHelpers.removeGiftCertificatePaymentInstrument(giftCertificateID);
            COHelpers.recalculateBasket(currentBasket);
        });
    }

    res.render("checkout/giftcard/giftCardRedeem", {
        basket: currentBasket
    });


    return next();
});
module.exports = server.exports();
