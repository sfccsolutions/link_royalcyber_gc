/* eslint-disable no-param-reassign */

"use strict";

/* API Includes */
var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
var Transaction = require("dw/system/Transaction");

/**
 * Authorizes a payment using a gift certificate. The payment is authorized by redeeming the gift certificate and
 * simply setting the order no as transaction ID.
 * @param {string} orderNumber - order number
 * @param {Object} paymentInstrument - payment instrument
 * @param {Object} paymentProcessor - payment processor
 * @returns {Object} authorized true or error true
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor) {
    Transaction.begin();

    paymentInstrument.paymentTransaction.transactionID = orderNumber;
    paymentInstrument.paymentTransaction.paymentProcessor = paymentProcessor;

    var status = GiftCertificateMgr.redeemGiftCertificate(paymentInstrument);

    Transaction.commit();

    if (status.isError()) {
        return { error: true };
    }
    var gcSubstractValue = paymentInstrument.paymentTransaction.amount.value;
    var giftCertificate = GiftCertificateMgr.getGiftCertificateByCode(paymentInstrument.giftCertificateCode);
    return { authorized: true };
}

/**
 * Stub hook no handling needed at this point
 * @returns {Object} object with errors
 */
function Handle() {
    return { fieldErrors: [], serverErrors: [], error: false };
}
/*
 * Module exports
 */

exports.Authorize = Authorize;
exports.Handle = Handle;
