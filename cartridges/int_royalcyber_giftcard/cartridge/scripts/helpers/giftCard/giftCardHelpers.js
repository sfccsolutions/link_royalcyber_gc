/* eslint-disable no-plusplus */

"use strict";

/* global empty */
var basketCalculationHelpers = require("*/cartridge/scripts/helpers/basketCalculationHelpers");
var BasketMgr = require("dw/order/BasketMgr");
var Money = require("dw/value/Money");
var ArrayList = require("dw/util/ArrayList");
var Transaction = require("dw/system/Transaction");
var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
var GiftCertificate = require("dw/order/GiftCertificate");
var GiftCertificateStatusCodes = require("dw/order/GiftCertificateStatusCodes");
var Status = require("dw/system/Status");
var Site = require("dw/system/Site");
var LocalServiceRegistry = require("dw/svc/LocalServiceRegistry");
var ContentMgr = require("dw/content/ContentMgr");
var File = require("dw/io/File");


/**
 * get current or new basket
 * @returns {Object} object
 */
function getCurrentOrNewBasket() {
    var obj = null;

    var basket = BasketMgr.getCurrentOrNewBasket();

    if (!empty(basket)) {
        obj = basket;
    }

    return obj;
}

/**
 * Get gift certificate line item by uuid
 * @param {string} uuid - uuid
 * @returns {dw.order.LineItem} item or null
 */
function getGiftCertificateLineItemByUUID(uuid) {
    var basket = getCurrentOrNewBasket();
    for (var it = basket.getGiftCertificateLineItems().iterator(); it.hasNext();) {
        var item = it.next();
        if (item.getUUID() === uuid) {
            return item;
        }
    }
    return null;
}

/**
 * Removes a gift certificate payment instrument with the given gift certificate ID
 * from the basket.
 *
 * @transactional
 * @param {string} giftCertificateID - The ID of the gift certificate to remove the payment instrument for.
 */
function removeGiftCertificatePaymentInstrument(giftCertificateID) {
    var currentBasket = getCurrentOrNewBasket();

    // Iterates over the list of payment instruments.
    var gcPaymentInstrs = currentBasket.getGiftCertificatePaymentInstruments(giftCertificateID);
    var iter = gcPaymentInstrs.iterator();
    var existingPI = null;

    // Remove (one or more) gift certificate payment
    // instruments for this gift certificate ID.
    while (iter.hasNext()) {
        existingPI = iter.next();
        currentBasket.removePaymentInstrument(existingPI);
    }

    // eslint-disable-next-line no-useless-return
    return;
}

/**
 * Creates a gift certificate payment instrument from the given gift certificate ID for the basket. The
 * method attempts to redeem the current balance of the gift certificate. If the current balance exceeds the
 * order total, this amount is redeemed and the balance is lowered.
 * @param {dw.order.GiftCertificate} giftCertificate - The gift certificate.
 * @returns {dw.order.PaymentInstrument} The created PaymentInstrument.
 */
function createGiftCertificatePaymentInstrument(giftCertificate) {
    var currentBasket = getCurrentOrNewBasket();

    // Removes any duplicates.
    // Iterates over the list of payment instruments to check.
    var gcPaymentInstrs = currentBasket.getGiftCertificatePaymentInstruments(giftCertificate.getGiftCertificateCode()).iterator();
    var existingPI = null;

    // Removes found gift certificates, to prevent duplicates.
    while (gcPaymentInstrs.hasNext()) {
        existingPI = gcPaymentInstrs.next();
        currentBasket.removePaymentInstrument(existingPI);
    }

    // Fetches the balance and the order total.
    var balance = giftCertificate.getBalance();
    var orderTotal = currentBasket.getTotalGrossPrice();

    // Sets the amount to redeem equal to the remaining balance.
    var amountToRedeem = balance;

    // Since there may be multiple gift certificates, adjusts the amount applied to the current
    // gift certificate based on the order total minus the aggregate amount of the current gift certificates.

    var giftCertTotal = new Money(0.0, currentBasket.getCurrencyCode());

    // Iterates over the list of gift certificate payment instruments
    // and updates the total redemption amount.
    gcPaymentInstrs = currentBasket.getGiftCertificatePaymentInstruments().iterator();
    var orderPI = null;

    while (gcPaymentInstrs.hasNext()) {
        orderPI = gcPaymentInstrs.next();
        giftCertTotal = giftCertTotal.add(orderPI.getPaymentTransaction().getAmount());
    }

    // Calculates the remaining order balance.
    // This is the remaining open order total that must be paid.
    var orderBalance = orderTotal.subtract(giftCertTotal);

    // The redemption amount exceeds the order balance.
    // use the order balance as maximum redemption amount.
    if (orderBalance < amountToRedeem) {
        // Sets the amount to redeem equal to the order balance.
        amountToRedeem = orderBalance;
    }

    // Creates a payment instrument from this gift certificate.
    return currentBasket.createGiftCertificatePaymentInstrument(giftCertificate.getGiftCertificateCode(), amountToRedeem);
}

/**
 * Creates a list of gift certificate ids from gift certificate payment instruments.
 *
 * @alias module:models/CartModel~CartModel/getGiftCertIdList
 * @returns {dw.util.ArrayList} The list of gift certificate IDs.
 */
function getGiftCertIdList() {
    var currentBasket = getCurrentOrNewBasket();
    var gcIdList = new ArrayList();
    var gcPIIter = currentBasket.getGiftCertificatePaymentInstruments().iterator();

    while (gcPIIter.hasNext()) {
        gcIdList.add((gcPIIter.next()).getGiftCertificateCode());
    }

    return gcIdList;
}
/**
 * Adjust gift certificates
 */
function adjustGiftCertificates() {
    var i; var j; var gcIdList; var gcID; var
        gc;
    var currentBasket = getCurrentOrNewBasket();

    if (currentBasket) {
        gcIdList = getGiftCertIdList();

        Transaction.wrap(function () {
            for (i = 0; i < gcIdList.length; i += 1) {
                removeGiftCertificatePaymentInstrument(gcIdList[i]);
            }

            gcID = null;

            for (j = 0; j < gcIdList.length; j += 1) {
                gcID = gcIdList[j];

                gc = GiftCertificateMgr.getGiftCertificateByCode(gcID);

                if ((gc)// make sure exists
                && (currentBasket.getGiftCertificateLineItems().length === 0)// make sure there is no GC in cart
                && (gc.isEnabled()) // make sure it is enabled
                && (gc.getStatus() !== GiftCertificate.STATUS_PENDING)// make sure it is available for use
                && (gc.getStatus() !== GiftCertificate.STATUS_REDEEMED)// make sure it has not been fully redeemed
                && (gc.balance.currencyCode === currentBasket.getCurrencyCode())) { // make sure the GC is in the right currency
                    createGiftCertificatePaymentInstrument(gc);
                }
            }
        });
    }
}

/**
 * Redeems a gift certificate. If the gift certificate was not successfully
 * redeemed, the form field is invalidated with the appropriate error message.
 * If the gift certificate was redeemed, the form gets cleared. This function
 * is called by an Ajax request and generates a JSON response.
 * @param {string} giftCertCode - Gift certificate code entered into the giftCertCode field in the billing form.
 * @returns {Object} JSON object containing the status of the gift certificate.
 */
function redeemGiftCertificate(giftCardCode) {
    var CartModel = require("*/cartridge/models/cart");
    var cart; var gc; var newGCPaymentInstrument; var gcPaymentInstrument; var status; var result; var basket;
    var giftCertificateStatusCodeInCart = "giftcardredeem.giftincart";
    var basket = BasketMgr.getCurrentOrNewBasket();
    //basket = getCurrentOrNewBasket();
    cart = new CartModel(basket);
    if (basket.getGiftCertificateLineItems().length > 0) {
        result = new Status(Status.ERROR, giftCertificateStatusCodeInCart, giftCertificateStatusCodeInCart, null);
    } else if (!empty(cart)) {
        // fetch the gift certificate
        gc = GiftCertificateMgr.getGiftCertificateByCode(giftCardCode);

        if (!gc) { // make sure exists
            result = new Status(Status.ERROR, GiftCertificateStatusCodes.GIFTCERTIFICATE_NOT_FOUND, GiftCertificateStatusCodes.GIFTCERTIFICATE_NOT_FOUND, giftCardCode);
        }  else if (!gc.isEnabled()) { // make sure it is enabled
            result = new Status(Status.ERROR, GiftCertificateStatusCodes.GIFTCERTIFICATE_DISABLED, GiftCertificateStatusCodes.GIFTCERTIFICATE_DISABLED, null);
        } else if (gc.getStatus() === GiftCertificate.STATUS_PENDING) { // make sure it is available for use
            result = new Status(Status.ERROR, GiftCertificateStatusCodes.GIFTCERTIFICATE_PENDING, GiftCertificateStatusCodes.GIFTCERTIFICATE_PENDING, null);
        } else if (gc.getStatus() === GiftCertificate.STATUS_REDEEMED) { // make sure it has not been fully redeemed
            result = new Status(Status.ERROR, GiftCertificateStatusCodes.GIFTCERTIFICATE_INSUFFICIENT_BALANCE, GiftCertificateStatusCodes.GIFTCERTIFICATE_INSUFFICIENT_BALANCE, null);
        } else if (gc.balance.currencyCode !== basket.getCurrencyCode()) { // make sure the GC is in the right currency
            result = new Status(Status.ERROR, GiftCertificateStatusCodes.GIFTCERTIFICATE_CURRENCY_MISMATCH, GiftCertificateStatusCodes.GIFTCERTIFICATE_CURRENCY_MISMATCH, null);
        } else {
            newGCPaymentInstrument = Transaction.wrap(function () {
                gcPaymentInstrument = createGiftCertificatePaymentInstrument(gc);
                Transaction.wrap(function () {
                    basketCalculationHelpers.calculateTotals(basket);
                });
                return gcPaymentInstrument;
            });

            status = new Status(Status.OK);
            status.addDetail("NewGCPaymentInstrument", newGCPaymentInstrument);
            result = status;
        }
    } else {
        result = new Status(Status.ERROR, "BASKET_NOT_FOUND");
    }
    return result;
}

/**
 * Retrives the gift card images from library
 * @returns {Object} imagesFormats
 */
function getCardImages() {
    var libraryID = ContentMgr.getSiteLibrary().ID;
    var eGiftCardImageFolder;
    try {
        eGiftCardImageFolder = new File(File.LIBRARIES + "/" + libraryID + "/default/images/eGiftCard");
    } catch (error) {
        eGiftCardImageFolder = new File(File.LIBRARIES + "/" + Site.current.ID + "/default/images/eGiftCard");
    }

    var images = eGiftCardImageFolder.listFiles();

    var imagesFormats = {
        imgSmallSVG: []
    };

    for (var i = 0; i < images.length; i++) {
        // check if SVG image
        var cardPath = images[i].fullPath.split("/").slice(4).join("/");
        if (cardPath.split(".").pop() === "svg") {
            // check if image has 'small' in its name
            if (cardPath.split("-").pop().split(".")[0] === "small") {
                imagesFormats.imgSmallSVG.push(cardPath);
            }
        }
    }

    imagesFormats.imgSmallSVG.sort();
    return imagesFormats;
}

/**
 * Retrives all the gift card images from library
 * @returns {Object} imagesFormats
 */
function getAllCardImages() {
    var libraryID = ContentMgr.getSiteLibrary().ID;
    var eGiftCardImageFolder;
    try {
        eGiftCardImageFolder = new File(File.LIBRARIES + "/" + libraryID + "/default/images/eGiftCard");
    } catch (error) {
        eGiftCardImageFolder = new File(File.LIBRARIES + "/" + Site.current.ID + "/default/images/eGiftCard");
    }

    var images = eGiftCardImageFolder.listFiles();
    var imagesFormats = {
        imgSmallSVG: [],
        imgSmallPNG: [],
        imgBigSVG: [],
        imgBigPNG: []
    };

    for (var i = 0; i < images.length; i++) {
        var cardPath = images[i].fullPath.split("/").slice(4).join("/");
        // check if SVG image
        if (cardPath.split(".").pop() === "svg") {
            // check if image has 'small' in its name
            if (cardPath.split("-").pop().split(".")[0] === "small") {
                imagesFormats.imgSmallSVG.push(cardPath);
            } else {
                imagesFormats.imgBigSVG.push(cardPath);
            }
        // check if PNG image
        } else if (cardPath.split(".").pop() === "png") {
            // check if image has 'small' in its name
            if (cardPath.split("-").pop().split(".")[0] === "small") {
                imagesFormats.imgSmallPNG.push(cardPath);
            } else {
                imagesFormats.imgBigPNG.push(cardPath);
            }
        }
    }

    imagesFormats.imgSmallSVG.sort();
    imagesFormats.imgBigSVG.sort();
    imagesFormats.imgSmallPNG.sort();
    imagesFormats.imgBigPNG.sort();
    return imagesFormats;
}

/**
 * Apply gift card custom expiration rules
 * @param {Object} currentGiftCard -gift card
 */
function applyGiftCardCustomExpirationRules(currentGiftCard) {
    var Logger = require("dw/system/Logger");
    var egiftCardLogger = Logger.getLogger("egiftcard", "egiftcard");
    var currentSite = Site.current;
    var eGiftCardCustomExpirationRulesPref = currentSite.getCustomPreferenceValue("eGiftCardCustomExpirationRules");
    var rulesArray = JSON.parse(eGiftCardCustomExpirationRulesPref);
    var txnCallback;
    try {
        var creationDate = currentGiftCard.getCreationDate();
        var creationMonth = creationDate.getMonth();
        var creationYear = creationDate.getFullYear();
        var creationDay = creationDate.getDate();
        var sortedRulesArray = rulesArray.sort(function (a, b) {
            if (b.giftCardValue < a.giftCardValue) {
                return 1;
            }
            return -1;
        });
        /**
         * txn call back
         */
        txnCallback = function () {
            for (var i = 0; i < sortedRulesArray.length; i++) {
                if (sortedRulesArray[i].giftCardValue >= currentGiftCard.amount.value) {
                    // eslint-disable-next-line no-param-reassign
                    currentGiftCard.custom.rc_expirationDate = new Date(creationYear, creationMonth + sortedRulesArray[i].monthValue, creationDay);
                    break;
                }
            }
        };
        Transaction.wrap(txnCallback);
    } catch (error) {
        egiftCardLogger.error("GC custom exp date storefront error: " + error);
    }
}

module.exports = {
    getGiftCertificateLineItemByUUID: getGiftCertificateLineItemByUUID,
    getCurrentOrNewBasket: getCurrentOrNewBasket,
    createGiftCertificatePaymentInstrument: createGiftCertificatePaymentInstrument,
    adjustGiftCertificates: adjustGiftCertificates,
    redeemGiftCertificate: redeemGiftCertificate,
    removeGiftCertificatePaymentInstrument: removeGiftCertificatePaymentInstrument,
    getCardImages: getCardImages,
    getAllCardImages: getAllCardImages,
    applyGiftCardCustomExpirationRules: applyGiftCardCustomExpirationRules
};
