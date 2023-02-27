"use strict";

/**
 * @module models/eGiftCardModel
 */

var Transaction = require("dw/system/Transaction");
var Site = require("dw/system/Site");
var emailHelpers = require("*/cartridge/scripts/helpers/emailHelpers");


/**
 * Create a gift certificate for a gift certificate line item in the order
 * @param {dw.order.GiftCertificateLineItem} giftCertificateLineItem - giftcertificatelineitem
 * @param {string} orderNo the order number of the order to associate gift certificate to
 * @return {dw.order.GiftCertificate} gift certificate
 */
function createGiftCertificateFromLineItem(giftCertificateLineItem, orderNo) {
    var GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
    var giftCertificate = GiftCertificateMgr.createGiftCertificate(giftCertificateLineItem.netPrice.value);
    Transaction.wrap(function () {
        giftCertificate.setRecipientEmail(giftCertificateLineItem.recipientEmail);
        giftCertificate.setRecipientName(giftCertificateLineItem.recipientName);
        giftCertificate.setSenderName(giftCertificateLineItem.senderName);
        giftCertificate.setMessage(giftCertificateLineItem.message);
        giftCertificate.setOrderNo(orderNo);
        giftCertificate.setEnabled(false);
        //Expiration date
        var creationMonth = giftCertificate.getCreationDate().getMonth();
        var creationYear = giftCertificate.getCreationDate().getFullYear();
        var creationDay = giftCertificate.getCreationDate().getDate();
        var rc_availabilityDays = Site.getCurrent().getPreferences().custom.rc_availabilityDays;
        if (rc_availabilityDays > 0) {
            giftCertificate.custom.rc_expirationDate = new Date(creationYear, creationMonth, creationDay + rc_availabilityDays);
        } else { //set unlimited expiry
            giftCertificate.custom.rc_expirationDate = new Date(creationYear + 50, creationMonth, creationDay);
        }
        //Enable after date
        var enableafterDays = Site.getCurrent().getPreferences().custom.rc_enableGiftCertificateDays;
        if (enableafterDays > 0) {
            giftCertificate.custom.rc_enableDate = new Date(creationYear, creationMonth, creationDay + enableafterDays);
        } else { //enable it same day 
            giftCertificate.custom.rc_enableDate = new Date(creationYear, creationMonth, creationDay);
        }
    });
    createGiftCertificateCustomObj(giftCertificate);
    return giftCertificate;
}
//function to create Gift Certificate Custom Object for Job
function createGiftCertificateCustomObj(giftCertificate){
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var giftcertificatecode = giftCertificate.getGiftCertificateCode();
    var GCCustomObj = CustomObjectMgr.createCustomObject('rc_GiftCertificateObj', giftcertificatecode );
    Transaction.wrap(function () {
        GCCustomObj.custom.rc_RecipientEmail = giftCertificate.getRecipientEmail();
        GCCustomObj.custom.rc_ExpirationDate =  giftCertificate.custom.rc_expirationDate;
        GCCustomObj.custom.rc_enableDate = giftCertificate.custom.rc_enableDate;
        GCCustomObj.custom.rc_customerID = customer.ID;
    });
}
/**
 * Send an email to recipient of gift certificate
 * @param {dw.order.GiftCertificate} giftCertificate - giftcertificate
 */
function sendGiftCertificateEmail(giftCertificate) {
    var Resource = require("dw/web/Resource");
    var emailObj = {
        to: giftCertificate.getRecipientEmail(),
        from: Site.current.getCustomPreferenceValue("customerServiceEmail") || "no-reply@salesforce.com",
        subject: Resource.msg("giftcardOrderMsg", "giftcard", null),
        type: emailHelpers.emailTypes.orderConfirmation
    };
    var objectForEmail = {
        GiftCertificate: giftCertificate
    };
    emailHelpers.sendEmail(emailObj, "mail/GiftCardRecipientEmail", objectForEmail);
}

/**
 * Get the Gift Certificate model object
 * @param {dw.order.GiftCertificateLineItem} giftCertificate - giftcertificate
 * @returns {Object} giftCertificateModel
 */
function getGiftCertificateModel(giftCertificate) {
    var giftCertificateModel = {};

    giftCertificateModel.ID = giftCertificate.getGiftCertificateID();
    giftCertificateModel.UUID = giftCertificate.getUUID();
    giftCertificateModel.message = giftCertificate.getMessage();
    giftCertificateModel.recipientEmail = giftCertificate.getRecipientEmail();
    giftCertificateModel.recipientName = giftCertificate.getRecipientName();
    giftCertificateModel.senderName = giftCertificate.getSenderName();
    giftCertificateModel.grossPrice = giftCertificate.getGrossPrice().getValue();
    giftCertificateModel.netPrice = giftCertificate.getNetPrice().getValue();
    giftCertificateModel.basePrice = giftCertificate.getBasePrice().getValue();
    giftCertificateModel.price = giftCertificate.getPriceValue();
    giftCertificateModel.tax = giftCertificate.getTax().getValue();
    giftCertificateModel.taxClassID = giftCertificate.getTaxClassID();
    giftCertificateModel.taxRate = giftCertificate.getTaxRate();
    giftCertificateModel.lineItemText = giftCertificate.getLineItemText();

    giftCertificateModel.custom = {};
    giftCertificateModel.custom.img = giftCertificate.custom.rc_img;

    return giftCertificateModel;
}

/**
 * Get an array of Gift Certificates models
 * @param {dw.util.Collection} giftCertificateLineItems - giftCertificateLineItems
 * @returns {Array} array of GiftCertificateModels
 */
function getGiftCertificateModelArray(giftCertificateLineItems) {
    var arrayOfGiftCertificateModels = [];
    var giftCertificateLineItemsArray = giftCertificateLineItems.toArray();

    // eslint-disable-next-line no-plusplus
    for (var i = 0; i < giftCertificateLineItemsArray.length; i++) {
        var giftCertificateModel = getGiftCertificateModel(giftCertificateLineItemsArray[i]);
        arrayOfGiftCertificateModels.push(giftCertificateModel);
    }

    return arrayOfGiftCertificateModels;
}

module.exports = {
    createGiftCertificateFromLineItem: createGiftCertificateFromLineItem,
    sendGiftCertificateEmail: sendGiftCertificateEmail,
    getGiftCertificateModel: getGiftCertificateModel,
    getGiftCertificateModelArray: getGiftCertificateModelArray
};
