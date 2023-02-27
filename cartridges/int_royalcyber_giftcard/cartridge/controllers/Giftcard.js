'use strict';
//API includes
var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
var BasketMgr = require("dw/order/BasketMgr");
var ContentMgr = require("dw/content/ContentMgr");
var Resource = require("dw/web/Resource");
var Transaction = require("dw/system/Transaction");
var URLUtils = require("dw/web/URLUtils");
var Money = require("dw/value/Money");
var server = require("server");
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Cart = require("*/cartridge/models/cart.js");
var Site = require("dw/system/Site");
var userLoggedIn = require("*/cartridge/scripts/middleware/userLoggedIn");
/* Script Modules */
var formErrorsReq = require("*/cartridge/scripts/formErrors");
var giftCardHelpers = require("*/cartridge/scripts/helpers/giftCard/giftCardHelpers");
var basketCalculationHelpers = require("*/cartridge/scripts/helpers/basketCalculationHelpers");
var shippingHelper = require("*/cartridge/scripts/checkout/shippingHelpers");

//Function for creating Gift Card Line Item
function createGiftCardLineItem(basket, giftcardForm, res) {
    var giftCertificateLineItem;
    var Resource = require('dw/web/Resource');
    // Object for form infomation
    var giftcardFormObj = {
        amount: giftcardForm.purchase.amount.value,
        from: giftcardForm.purchase.from.value,
        to: giftcardForm.purchase.to.value,
        recipientEmail: giftcardForm.purchase.recipientEmail.value,
        message: giftcardForm.purchase.message.value,
        validForm: giftcardForm.valid,
        form: giftcardForm
    };
    var error;
    // validate email = confirm email
    if (giftcardForm.purchase.recipientEmail.value != giftcardForm.purchase.confirmRecipientEmail.value) {
        giftcardForm.valid = false;
        giftcardForm.purchase.confirmRecipientEmail.valid = false;
        giftcardForm.purchase.confirmRecipientEmail.error = Resource.msg("giftcard.confirmrecipientemailvalueerror", "forms", null);
    }
    // validate if amount is within limit
    if (giftcardForm.purchase.amount.valid && (giftcardForm.purchase.amount.value > 5000)) {
        giftcardForm.valid = false;
        giftcardForm.purchase.amount.valid = false;
        giftcardForm.purchase.amount.error = Resource.msg("giftcard.amountvalueerror", "forms", null);
    }
    res.setViewData(giftcardFormObj);
    var giftCardForm = res.getViewData();
    if (giftcardForm.valid) {
        Transaction.wrap(function () {
            giftCertificateLineItem = basket.createGiftCertificateLineItem(giftCardForm.amount, giftCardForm.recipientEmail);
            giftCertificateLineItem.setRecipientName(giftCardForm.to);
            giftCertificateLineItem.setSenderName(giftCardForm.from);
            giftCertificateLineItem.setMessage(giftCardForm.message);
            giftCertificateLineItem.custom.rc_img = URLUtils.staticURL(URLUtils.CONTEXT_LIBRARY, '', 'giftcard.png');
            // Setting expiration date
            var creationMonth = giftCertificateLineItem.getCreationDate().getMonth();
            var creationYear = giftCertificateLineItem.getCreationDate().getFullYear();
            var creationDay = giftCertificateLineItem.getCreationDate().getDate();
            var rc_availabilityDays = Site.getCurrent().getPreferences().custom.rc_availabilityDays;
            if (rc_availabilityDays > 0) {
                giftCertificateLineItem.custom.rc_expirationDate = new Date(creationYear, creationMonth, creationDay + rc_availabilityDays);
            } else { //set unlimited expiry
                giftCertificateLineItem.custom.rc_expirationDate = new Date(creationYear + 50, creationMonth, creationDay);
            }
           
            basketCalculationHelpers.calculateTotals(basket);
            shippingHelper.updateGiftCertificateShipments(basket);
            shippingHelper.removeEmptyShipments(basket);
            res.json({
                success: true,
                redirectUrl: URLUtils.url('Giftcard-Show').toString(),
                alertmessage: Resource.msg("giftcard.addedtocart", "giftcard", null)
            });
        });
    }
    else {
        var formErrors = formErrorsReq.getFormErrors(giftcardForm);
        // Handle server-side validation errors here: this is just an example
        res.json({
            success: false,
            fields: formErrors
        });
    }

};

server.get(
    'Show',
    csrfProtection.generateToken,
    server.middleware.https,
    function (req, res, next) {
        var actionUrl = dw.web.URLUtils.url('Giftcard-Handler');
        var navTabValue = req.querystring.action;
        var giftcardForm = server.forms.getForm('giftcard');
        giftcardForm.clear();
        res.render('/giftcard/giftcard', {
            actionUrl: actionUrl,
            navTabValue: navTabValue || 'purchasegiftcard',
            giftcardForm: giftcardForm
        });
        next();
    }
);

server.post(
    'Handler',
    server.middleware.https,
    function (req, res, next) {
        var giftcardForm = server.forms.getForm('giftcard');
        var continueUrl = dw.web.URLUtils.url('Giftcard-Show');
        var navTabValue = req.querystring.action;
        // Call function to create the gift card
        var basket = BasketMgr.getCurrentOrNewBasket();
        createGiftCardLineItem(basket, giftcardForm, res);
        next();
    });

server.get("RemoveGiftCardLineItem", function (req, res, next) {
    var basket = BasketMgr.getCurrentOrNewBasket();
    if (!basket) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url("Cart-Show").toString()
        });
        return next();
    }
    if (basket.getGiftCertificateLineItems().length > 0 && req.querystring.uuid) {
        var giftCertificateLineItem = giftCardHelpers.getGiftCertificateLineItemByUUID(req.querystring.uuid);
        if (giftCertificateLineItem) {
            Transaction.wrap(function () {
                basket.removeGiftCertificateLineItem(giftCertificateLineItem);
                basketCalculationHelpers.calculateTotals(basket);
            });
            var cartModel = new Cart(basket);
            cartModel.basket = basket;
            res.json(cartModel);
            return next();
        }
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url("Cart-Show").toString()
        });
        return next();
    }
    res.setStatusCode(500);
    res.json({ errorMessage: Resource.msg("error.cannot.remove.giftcard", "giftcard", null) });

    return next();
});

// Check Balance : Displays the Giftcard balance using the giftcard number
server.post(
    'CheckBalance',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var giftCertificate = null;
        var balanceForm = server.forms.getForm("giftcard");
        var giftCardID = req.querystring.giftcardID;
        if (giftCardID) {
            giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(giftCardID);
        }
        
        if (!empty(giftCertificate) && giftCertificate.enabled) {
            res.json({
                statusCode: 200,
                success: true,
                value: giftCertificate.balance.value,
                currency: giftCertificate.amount.currencyCode,
                giftCardCode: giftCertificate.getGiftCertificateCode()

            });
        } else {
            balanceForm.balance.valid = false;
            balanceForm.balance.giftcardID.valid = false;
            balanceForm.balance.giftcardID.error = Resource.msg("giftcardpurchase.checkinvalid", "giftcard", null);
            var formErrors = formErrorsReq.getFormErrors(balanceForm);
            res.json({
                success: false,
                fields: formErrors,
                ErrorMsg: Resource.msg("giftcardpurchase.checkinvalid", "giftcard", null)
            });
        }

        next();
    });
    
// Redeem Gift card start
server.get("PaymentMethodFormInclude", function (req, res, next) {
    var OrderModel = require("*/cartridge/models/order");
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var giftcard = server.forms.getForm("redeemgiftcard");
    var orderModel = new OrderModel(currentBasket, { containerView: "basket" });
    res.render("checkout/giftcard/giftCardPaymentMethodForm", {
        order: orderModel,
        giftcard: giftcard
    });
    next();
});
module.exports = server.exports();