"use strict";

/* global empty */

var server = require("server");
server.extend(module.superModule);

var COHelpers = require("*/cartridge/scripts/checkout/checkoutHelpers");
var BasketMgr = require("dw/order/BasketMgr");

server.prepend("SubmitPayment", server.middleware.https, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var paymentForm = server.forms.getForm("billing");
    var creditCardErrors = {};
    var nonGiftCertificateAmount = COHelpers.getNonGiftCertificateAmount(currentBasket);

    var viewData = res.getViewData();

    if (nonGiftCertificateAmount == 0) {
        paymentForm.creditCardFields.cardNumber.error = "";
        paymentForm.creditCardFields.cardNumber.valid = true;

        paymentForm.creditCardFields.cardOwner.error = "";
        paymentForm.creditCardFields.cardOwner.valid = true;

        paymentForm.creditCardFields.cardType.error = "";
        paymentForm.creditCardFields.cardType.valid = true;

        paymentForm.creditCardFields.expirationMonth.error = "";
        paymentForm.creditCardFields.expirationMonth.valid = true;

        paymentForm.creditCardFields.expirationYear.error = "";
        paymentForm.creditCardFields.expirationYear.valid = true;

        paymentForm.creditCardFields.securityCode.error = "";
        paymentForm.creditCardFields.securityCode.valid = true;
        if (paymentForm.paymentMethod.value == "CREDIT_CARD") {
            paymentForm.paymentMethod.value = "GIFT_CERTIFICATE";
        }
    }

    if (!req.form.storedPaymentUUID) {
        // verify credit card form data
        creditCardErrors = COHelpers.validateCreditCard(paymentForm);
    }

    var formFieldErrors = [];
    if (Object.keys(creditCardErrors).length) {
        formFieldErrors.push(creditCardErrors);
    } else {
        viewData.paymentMethod = {
            value: paymentForm.paymentMethod.value,
            htmlName: paymentForm.paymentMethod.value
        };
    }

    if (nonGiftCertificateAmount > 0) {
        viewData.paymentInformation = {
            cardType: {
                value: paymentForm.creditCardFields.cardType.value,
                htmlName: paymentForm.creditCardFields.cardType.htmlName
            },
            cardNumber: {
                value: paymentForm.creditCardFields.cardNumber.value,
                htmlName: paymentForm.creditCardFields.cardNumber.htmlName
            },
            securityCode: {
                value: paymentForm.creditCardFields.securityCode.value,
                htmlName: paymentForm.creditCardFields.securityCode.htmlName
            },
            expirationMonth: {
                value: parseInt(
                    paymentForm.creditCardFields.expirationMonth.selectedOption,
                    10
                ),
                htmlName: paymentForm.creditCardFields.expirationMonth.htmlName
            },
            expirationYear: {
                value: parseInt(paymentForm.creditCardFields.expirationYear.value, 10),
                htmlName: paymentForm.creditCardFields.expirationYear.htmlName
            }
        };
        viewData.saveCard = paymentForm.creditCardFields.saveCard.checked;
    }
    if (formFieldErrors.length) {
        // respond with form data and errors
        res.json({
            form: paymentForm,
            fieldErrors: formFieldErrors,
            serverErrors: [],
            error: true
        });
        return next();
    }
    return next();
});


server.prepend("PlaceOrder", server.middleware.https, function (req, res, next) {
    var Transaction = require("dw/system/Transaction");
    var currentBasket = BasketMgr.getCurrentBasket();
    if (!empty(currentBasket) && currentBasket.getGiftCertificateLineItems().length > 0 && currentBasket.productLineItems.length === 0) {
        Transaction.wrap(function () {
            currentBasket.defaultShipment.createShippingAddress();
            currentBasket.defaultShipment.shippingAddress.setAddress1(currentBasket.billingAddress.getAddress1());
            currentBasket.defaultShipment.shippingAddress.setCity(currentBasket.billingAddress.getCity());
            currentBasket.defaultShipment.shippingAddress.setStateCode(currentBasket.billingAddress.getStateCode());
        });
    }
   
    next();
});

module.exports = server.exports();
